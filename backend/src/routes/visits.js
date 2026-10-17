import express from 'express';
import db from '../db/index.js';
import multer from 'multer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import crypto from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = Date.now() + '-' + crypto.randomUUID().slice(0, 6);
    cb(null, `${unique}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB max
});

const router = express.Router();

function formatVisit(row) {
  if (!row) return null;
  return {
    ...row,
    prescriptions: JSON.parse(row.prescriptions || '[]'),
    lab_results: JSON.parse(row.lab_results || '[]')
  };
}

// GET all clinical EHR visits with category filter (All, Hospital, Clinic)
router.get('/', (req, res) => {
  try {
    const { patient_id = 'P-001', category, search } = req.query;
    let query = 'SELECT * FROM clinical_visits WHERE patient_id = ?';
    const params = [patient_id];

    if (category) {
      const catLower = category.toLowerCase();
      if (catLower === 'hospital' || catLower === 'hospital admissions') {
        query += " AND visit_type LIKE '%Hospital%'";
      } else if (catLower === 'clinic' || catLower === 'clinic consultations') {
        query += " AND visit_type LIKE '%Clinic%'";
      } else if (catLower === 'emergency' || catLower === 'emergency room') {
        query += " AND visit_type LIKE '%Emergency%'";
      }
    }

    if (search) {
      query += ` AND (
        facility_name LIKE ? OR
        doctor_name LIKE ? OR
        diagnosis LIKE ? OR
        summary_notes LIKE ? OR
        icd10_code LIKE ?
      )`;
      const term = `%${search}%`;
      params.push(term, term, term, term, term);
    }

    query += ' ORDER BY visit_date DESC';

    const rows = db.prepare(query).all(...params);
    res.json({
      success: true,
      count: rows.length,
      category_applied: category || 'all',
      visits: rows.map(formatVisit)
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// GET active medications across all patient visits
router.get('/prescriptions/active', (req, res) => {
  try {
    const { patient_id = 'P-001' } = req.query;
    const visits = db.prepare('SELECT prescriptions, doctor_name, visit_date FROM clinical_visits WHERE patient_id = ? ORDER BY visit_date DESC').all(patient_id);

    const activeList = [];
    const seen = new Set();

    for (const v of visits) {
      const rxs = JSON.parse(v.prescriptions || '[]');
      for (const rx of rxs) {
        if (rx.status === 'Active' && !seen.has(rx.drug)) {
          seen.add(rx.drug);
          activeList.push({
            ...rx,
            prescribed_by: v.doctor_name,
            prescribed_date: v.visit_date
          });
        }
      }
    }

    res.json({
      success: true,
      count: activeList.length,
      medications: activeList
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// GET uploaded health reports list
router.get('/reports', (req, res) => {
  try {
    const { patient_id = 'P-001' } = req.query;
    const reports = db.prepare('SELECT * FROM health_reports WHERE patient_id = ? ORDER BY uploaded_at DESC').all(patient_id);
    res.json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// GET download uploaded health report file
router.get('/reports/:id/download', (req, res) => {
  try {
    const { id } = req.params;
    const report = db.prepare('SELECT * FROM health_reports WHERE id = ?').get(id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const fullPath = path.resolve(uploadDir, path.basename(report.file_path));
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'Physical report file missing on server' });
    }

    res.setHeader('Content-Type', report.mime_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${report.file_name}"`);
    fs.createReadStream(fullPath).pipe(res);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// POST upload new health report document
router.post('/upload-report', upload.single('report_file'), (req, res) => {
  try {
    const {
      patient_id = 'P-001',
      title = 'Patient Uploaded Health Document',
      document_type = 'Patient Health Record',
      notes = ''
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No file was uploaded in form-data field "report_file"' });
    }

    const id = 'REP-' + crypto.randomUUID().slice(0, 8).toUpperCase();
    const uploadedAt = new Date().toISOString();
    const relativePath = 'uploads/' + req.file.filename;

    const stmt = db.prepare(`
      INSERT INTO health_reports (
        id, patient_id, title, document_type, file_path, file_name, file_size, mime_type, uploaded_at, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      patient_id,
      title,
      document_type,
      relativePath,
      req.file.originalname,
      req.file.size,
      req.file.mimetype,
      uploadedAt,
      notes
    );

    const inserted = db.prepare('SELECT * FROM health_reports WHERE id = ?').get(id);

    res.status(201).json({
      success: true,
      message: `Health report "${title}" uploaded successfully to CarePortal Vault.`,
      report: inserted
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// GET single visit by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const row = db.prepare('SELECT * FROM clinical_visits WHERE id = ?').get(id);
    if (!row) {
      return res.status(404).json({ error: `Clinical visit record '${id}' not found` });
    }

    res.json({
      success: true,
      visit: formatVisit(row)
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

export default router;
