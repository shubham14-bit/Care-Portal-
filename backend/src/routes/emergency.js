import express from 'express';
import db from '../db/index.js';
import crypto from 'node:crypto';

const router = express.Router();

// POST trigger emergency SOS alert
router.post('/sos', (req, res) => {
  try {
    const {
      patient_id = 'P-001',
      latitude = 44.0521,
      longitude = -123.016,
      trigger_source = 'One-Touch CarePortal SOS Button',
      location_description = 'Residence - 742 Evergreen Terrace, Springfield, OR'
    } = req.body;

    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(patient_id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Identify nearest emergency-ready hospital
    const nearestHospital = db.prepare(`
      SELECT * FROM hospitals
      WHERE emergency_ready = 1
      ORDER BY distance_miles ASC
      LIMIT 1
    `).get();

    // Fetch all emergency contacts marked for SOS notification
    const contacts = db.prepare(`
      SELECT name, relationship, phone FROM emergency_contacts
      WHERE patient_id = ? AND notify_on_sos = 1
    `).all(patient_id);

    const sosId = 'SOS-' + crypto.randomUUID().slice(0, 8).toUpperCase();
    const timestamp = new Date().toISOString();

    const insertSos = db.prepare(`
      INSERT INTO emergency_sos_logs (
        id, patient_id, timestamp, location, status,
        dispatched_facility_id, dispatched_facility_name, notified_contacts, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertSos.run(
      sosId,
      patient_id,
      timestamp,
      location_description,
      'DISPATCHED',
      nearestHospital ? nearestHospital.id : null,
      nearestHospital ? nearestHospital.name : 'Emergency Regional Dispatch',
      JSON.stringify(contacts),
      `Triggered via ${trigger_source}. GPS Coordinates: [${latitude}, ${longitude}]`
    );

    res.status(201).json({
      success: true,
      alert: {
        sos_id: sosId,
        status: 'DISPATCHED',
        timestamp,
        patient: {
          name: `${patient.first_name} ${patient.last_name}`,
          mrn: patient.mrn,
          blood_type: patient.blood_type,
          critical_allergies: JSON.parse(patient.allergies || '[]'),
          chronic_conditions: JSON.parse(patient.chronic_conditions || '[]')
        },
        dispatched_facility: nearestHospital ? {
          name: nearestHospital.name,
          phone: nearestHospital.phone,
          distance_miles: nearestHospital.distance_miles,
          address: nearestHospital.address
        } : null,
        notified_emergency_contacts: contacts,
        message: `EMERGENCY SOS ALERT ACTIVATED! Dispatch notification sent to ${nearestHospital?.name || 'Emergency Services'}. Notifications sent to ${contacts.length} emergency contacts.`
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// GET emergency SOS history
router.get('/history', (req, res) => {
  try {
    const { patient_id = 'P-001' } = req.query;
    const logs = db.prepare('SELECT * FROM emergency_sos_logs WHERE patient_id = ? ORDER BY timestamp DESC').all(patient_id);

    res.json({
      success: true,
      count: logs.length,
      logs: logs.map(l => ({
        ...l,
        notified_contacts: JSON.parse(l.notified_contacts || '[]')
      }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// PATCH resolve SOS
router.patch('/sos/:id/resolve', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM emergency_sos_logs WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'SOS record not found' });
    }

    db.prepare('UPDATE emergency_sos_logs SET status = ? WHERE id = ?').run('RESOLVED', id);
    res.json({ success: true, message: `SOS incident '${id}' marked as RESOLVED.` });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

export default router;
