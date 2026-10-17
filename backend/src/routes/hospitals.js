import express from 'express';
import db from '../db/index.js';

const router = express.Router();

function formatHospital(row) {
  if (!row) return null;
  return {
    ...row,
    emergency_ready: Boolean(row.emergency_ready),
    verified_care_network: Boolean(row.verified_care_network),
    services: JSON.parse(row.services || '[]')
  };
}

// GET all hospitals with optional filters
router.get('/', (req, res) => {
  try {
    const { emergency, search, sort = 'distance' } = req.query;
    let query = 'SELECT * FROM hospitals WHERE 1=1';
    const params = [];

    if (emergency === 'true' || emergency === '1') {
      query += ' AND emergency_ready = 1';
    }

    if (search) {
      query += ' AND (name LIKE ? OR address LIKE ? OR services LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (sort === 'rating') {
      query += ' ORDER BY rating DESC, distance_miles ASC';
    } else {
      query += ' ORDER BY distance_miles ASC';
    }

    const rows = db.prepare(query).all(...params);
    res.json({
      success: true,
      count: rows.length,
      hospitals: rows.map(formatHospital)
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// GET single hospital by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const row = db.prepare('SELECT * FROM hospitals WHERE id = ?').get(id);
    if (!row) {
      return res.status(404).json({ error: `Hospital with ID '${id}' not found` });
    }

    const hospital = formatHospital(row);

    // Also get affiliated doctors
    const doctors = db.prepare('SELECT * FROM doctors WHERE hospital_id = ?').all(id).map(d => ({
      ...d,
      accepted_insurance: JSON.parse(d.accepted_insurance || '[]'),
      available_days: JSON.parse(d.available_days || '[]'),
      available_slots: JSON.parse(d.available_slots || '[]')
    }));

    res.json({
      success: true,
      hospital: {
        ...hospital,
        affiliated_doctors: doctors
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

export default router;
