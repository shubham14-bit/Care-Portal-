import express from 'express';
import db from '../db/index.js';
import crypto from 'node:crypto';

const router = express.Router();

function formatPatient(row) {
  if (!row) return null;
  return {
    ...row,
    allergies: JSON.parse(row.allergies || '[]'),
    chronic_conditions: JSON.parse(row.chronic_conditions || '[]')
  };
}

// GET default active patient (Eleanor Vance)
router.get('/', (req, res) => {
  try {
    const patientRow = db.prepare('SELECT * FROM patients LIMIT 1').get();
    if (!patientRow) {
      return res.status(404).json({ error: 'No patient record found' });
    }
    const patient = formatPatient(patientRow);

    // Fetch emergency contacts
    const contacts = db.prepare('SELECT * FROM emergency_contacts WHERE patient_id = ?').all(patient.id);
    
    // Fetch latest vitals
    const latestVitals = db.prepare('SELECT * FROM vitals WHERE patient_id = ? ORDER BY timestamp DESC LIMIT 5').all(patient.id);

    // Fetch active medications from latest visits
    const visits = db.prepare('SELECT prescriptions FROM clinical_visits WHERE patient_id = ?').all(patient.id);
    const activeMedications = [];
    const seenMeds = new Set();
    for (const v of visits) {
      const rxList = JSON.parse(v.prescriptions || '[]');
      for (const rx of rxList) {
        if (rx.status === 'Active' && !seenMeds.has(rx.drug)) {
          seenMeds.add(rx.drug);
          activeMedications.push(rx);
        }
      }
    }

    res.json({
      success: true,
      patient: {
        ...patient,
        emergency_contacts: contacts,
        recent_vitals: latestVitals,
        active_medications: activeMedications
      }
    });
  } catch (err) {
    console.error('Error fetching patient:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// GET patient by MRN
router.get('/:mrn', (req, res) => {
  try {
    const { mrn } = req.params;
    const patientRow = db.prepare('SELECT * FROM patients WHERE mrn = ? OR id = ?').get(mrn, mrn);
    if (!patientRow) {
      return res.status(404).json({ error: `Patient with MRN/ID '${mrn}' not found` });
    }
    const patient = formatPatient(patientRow);
    const contacts = db.prepare('SELECT * FROM emergency_contacts WHERE patient_id = ?').all(patient.id);
    const vitals = db.prepare('SELECT * FROM vitals WHERE patient_id = ? ORDER BY timestamp DESC').all(patient.id);

    res.json({
      success: true,
      patient: {
        ...patient,
        emergency_contacts: contacts,
        vitals
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// PUT update patient profile
router.put('/:mrn', (req, res) => {
  try {
    const { mrn } = req.params;
    const patient = db.prepare('SELECT * FROM patients WHERE mrn = ? OR id = ?').get(mrn, mrn);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const {
      phone = patient.phone,
      email = patient.email,
      address = patient.address,
      allergies,
      chronic_conditions,
      insurance_provider = patient.insurance_provider,
      insurance_policy_number = patient.insurance_policy_number,
      insurance_group = patient.insurance_group
    } = req.body;

    const allergiesJson = allergies ? JSON.stringify(allergies) : patient.allergies;
    const conditionsJson = chronic_conditions ? JSON.stringify(chronic_conditions) : patient.chronic_conditions;
    const updatedAt = new Date().toISOString();

    const stmt = db.prepare(`
      UPDATE patients
      SET phone = ?, email = ?, address = ?, allergies = ?, chronic_conditions = ?,
          insurance_provider = ?, insurance_policy_number = ?, insurance_group = ?, updated_at = ?
      WHERE id = ?
    `);

    stmt.run(
      phone,
      email,
      address,
      allergiesJson,
      conditionsJson,
      insurance_provider,
      insurance_policy_number,
      insurance_group,
      updatedAt,
      patient.id
    );

    const updated = db.prepare('SELECT * FROM patients WHERE id = ?').get(patient.id);
    res.json({
      success: true,
      message: 'Patient profile updated successfully',
      patient: formatPatient(updated)
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// GET vitals history & trends
router.get('/:mrn/vitals', (req, res) => {
  try {
    const { mrn } = req.params;
    const patient = db.prepare('SELECT id FROM patients WHERE mrn = ? OR id = ?').get(mrn, mrn);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const vitals = db.prepare('SELECT * FROM vitals WHERE patient_id = ? ORDER BY timestamp DESC').all(patient.id);

    // Compute simple baseline statistics
    let avgSys = 0;
    let avgDia = 0;
    let avgHr = 0;
    if (vitals.length > 0) {
      avgSys = Math.round(vitals.reduce((acc, v) => acc + v.blood_pressure_sys, 0) / vitals.length);
      avgDia = Math.round(vitals.reduce((acc, v) => acc + v.blood_pressure_dia, 0) / vitals.length);
      avgHr = Math.round(vitals.reduce((acc, v) => acc + v.heart_rate, 0) / vitals.length);
    }

    res.json({
      success: true,
      patient_id: patient.id,
      summary: {
        total_readings: vitals.length,
        average_blood_pressure: `${avgSys}/${avgDia} mmHg`,
        average_heart_rate: `${avgHr} bpm`,
        latest_reading: vitals[0] || null
      },
      vitals
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// POST new vital reading
router.post('/:mrn/vitals', (req, res) => {
  try {
    const { mrn } = req.params;
    const patient = db.prepare('SELECT id FROM patients WHERE mrn = ? OR id = ?').get(mrn, mrn);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const {
      blood_pressure_sys,
      blood_pressure_dia,
      heart_rate,
      blood_glucose = null,
      oxygen_saturation = 98,
      weight_lbs = null,
      notes = ''
    } = req.body;

    if (!blood_pressure_sys || !blood_pressure_dia || !heart_rate) {
      return res.status(400).json({
        error: 'Missing required vitals: blood_pressure_sys, blood_pressure_dia, and heart_rate are required'
      });
    }

    // Determine status label based on standard geriatric AHA clinical thresholds
    let statusLabel = 'Optimal';
    if (blood_pressure_sys >= 140 || blood_pressure_dia >= 90) {
      statusLabel = 'Stage 2 Hypertension Alert';
    } else if (blood_pressure_sys >= 130 || blood_pressure_dia >= 80) {
      statusLabel = 'Mild Elevation';
    } else if (blood_pressure_sys < 90 || blood_pressure_dia < 60) {
      statusLabel = 'Low Blood Pressure Warning';
    }

    const id = 'VIT-' + crypto.randomUUID().slice(0, 8).toUpperCase();
    const timestamp = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO vitals (
        id, patient_id, timestamp, blood_pressure_sys, blood_pressure_dia,
        heart_rate, blood_glucose, oxygen_saturation, weight_lbs, status_label, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      patient.id,
      timestamp,
      Number(blood_pressure_sys),
      Number(blood_pressure_dia),
      Number(heart_rate),
      blood_glucose !== null ? Number(blood_glucose) : null,
      Number(oxygen_saturation),
      weight_lbs !== null ? Number(weight_lbs) : null,
      statusLabel,
      notes
    );

    const inserted = db.prepare('SELECT * FROM vitals WHERE id = ?').get(id);

    res.status(201).json({
      success: true,
      message: 'Vital reading logged successfully',
      vital: inserted
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// GET emergency contacts
router.get('/:mrn/emergency-contacts', (req, res) => {
  try {
    const { mrn } = req.params;
    const patient = db.prepare('SELECT id FROM patients WHERE mrn = ? OR id = ?').get(mrn, mrn);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    const contacts = db.prepare('SELECT * FROM emergency_contacts WHERE patient_id = ?').all(patient.id);
    res.json({ success: true, contacts });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// POST add emergency contact
router.post('/:mrn/emergency-contacts', (req, res) => {
  try {
    const { mrn } = req.params;
    const patient = db.prepare('SELECT id FROM patients WHERE mrn = ? OR id = ?').get(mrn, mrn);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    const { name, relationship, phone, is_primary = 0, notify_on_sos = 1 } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: 'name and phone are required' });
    }

    const id = 'ICE-' + crypto.randomUUID().slice(0, 8).toUpperCase();
    db.prepare(`
      INSERT INTO emergency_contacts (id, patient_id, name, relationship, phone, is_primary, notify_on_sos)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, patient.id, name, relationship || 'Caregiver', phone, is_primary ? 1 : 0, notify_on_sos ? 1 : 0);

    const inserted = db.prepare('SELECT * FROM emergency_contacts WHERE id = ?').get(id);
    res.status(201).json({ success: true, contact: inserted });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

export default router;
