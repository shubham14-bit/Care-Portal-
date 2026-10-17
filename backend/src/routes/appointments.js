import express from 'express';
import db from '../db/index.js';
import crypto from 'node:crypto';

const router = express.Router();

// GET all appointments
router.get('/', (req, res) => {
  try {
    const { patient_id = 'P-001', status } = req.query;
    let query = 'SELECT * FROM appointments WHERE patient_id = ?';
    const params = [patient_id];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY date ASC, time_slot ASC';

    const rows = db.prepare(query).all(...params);
    res.json({
      success: true,
      count: rows.length,
      appointments: rows
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// GET single appointment by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const row = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);
    if (!row) {
      return res.status(404).json({ error: `Appointment '${id}' not found` });
    }
    res.json({ success: true, appointment: row });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// POST book a new appointment
router.post('/', (req, res) => {
  try {
    const {
      patient_id = 'P-001',
      doctor_id,
      date,
      time_slot,
      reason = 'Routine Clinical Consultation',
      visit_type = 'In-Person Consultation'
    } = req.body;

    if (!doctor_id || !date || !time_slot) {
      return res.status(400).json({
        error: 'Missing required booking fields: doctor_id, date, and time_slot are required'
      });
    }

    // Verify doctor exists
    const doctor = db.prepare('SELECT * FROM doctors WHERE id = ?').get(doctor_id);
    if (!doctor) {
      return res.status(404).json({ error: `Doctor '${doctor_id}' does not exist` });
    }

    // Verify patient exists
    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(patient_id);
    if (!patient) {
      return res.status(404).json({ error: `Patient '${patient_id}' does not exist` });
    }

    // Check conflict: is slot already taken?
    const conflict = db.prepare(`
      SELECT id FROM appointments
      WHERE doctor_id = ? AND date = ? AND time_slot = ? AND status = 'CONFIRMED'
    `).get(doctor_id, date, time_slot);

    if (conflict) {
      return res.status(409).json({
        error: `Doctor ${doctor.name} already has a confirmed booking for ${date} at ${time_slot}. Please select another time.`
      });
    }

    const id = 'APT-' + crypto.randomUUID().slice(0, 8).toUpperCase();
    const createdAt = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO appointments (
        id, patient_id, doctor_id, doctor_name, specialty, hospital_name,
        date, time_slot, reason, visit_type, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      patient_id,
      doctor_id,
      doctor.name,
      doctor.specialty,
      doctor.hospital_name,
      date,
      time_slot,
      reason,
      visit_type,
      'CONFIRMED',
      createdAt
    );

    const inserted = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);

    res.status(201).json({
      success: true,
      message: `Appointment with ${doctor.name} on ${date} at ${time_slot} has been confirmed!`,
      appointment: inserted
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// PATCH reschedule or change appointment status
router.patch('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const {
      date = existing.date,
      time_slot = existing.time_slot,
      reason = existing.reason,
      status = existing.status
    } = req.body;

    // Check conflict if rescheduling time
    if (status === 'CONFIRMED' && (date !== existing.date || time_slot !== existing.time_slot)) {
      const conflict = db.prepare(`
        SELECT id FROM appointments
        WHERE doctor_id = ? AND date = ? AND time_slot = ? AND status = 'CONFIRMED' AND id != ?
      `).get(existing.doctor_id, date, time_slot, id);

      if (conflict) {
        return res.status(409).json({
          error: `Time slot ${date} at ${time_slot} is already booked.`
        });
      }
    }

    db.prepare(`
      UPDATE appointments
      SET date = ?, time_slot = ?, reason = ?, status = ?
      WHERE id = ?
    `).run(date, time_slot, reason, status, id);

    const updated = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);
    res.json({
      success: true,
      message: 'Appointment updated successfully',
      appointment: updated
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// DELETE cancel appointment
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    db.prepare(`UPDATE appointments SET status = 'CANCELLED' WHERE id = ?`).run(id);

    res.json({
      success: true,
      message: `Appointment '${id}' with ${existing.doctor_name} has been cancelled.`
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

export default router;
