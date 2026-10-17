import express from 'express';
import db from '../db/index.js';

const router = express.Router();

function formatDoctor(row) {
  if (!row) return null;
  return {
    ...row,
    accepted_insurance: JSON.parse(row.accepted_insurance || '[]'),
    available_days: JSON.parse(row.available_days || '[]'),
    available_slots: JSON.parse(row.available_slots || '[]')
  };
}

// GET all doctors with filtering
router.get('/', (req, res) => {
  try {
    const { specialty, search, hospital_id } = req.query;
    let query = 'SELECT * FROM doctors WHERE 1=1';
    const params = [];

    if (specialty && specialty !== 'All') {
      query += ' AND specialty LIKE ?';
      params.push(`%${specialty}%`);
    }

    if (hospital_id) {
      query += ' AND hospital_id = ?';
      params.push(hospital_id);
    }

    if (search) {
      query += ' AND (name LIKE ? OR specialty LIKE ? OR bio LIKE ? OR hospital_name LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    query += ' ORDER BY rating DESC, review_count DESC';

    const rows = db.prepare(query).all(...params);
    const doctors = rows.map(formatDoctor);

    // Get list of all distinct specialties for easy UI filter pills
    const specialties = [...new Set(doctors.map(d => d.specialty))];

    res.json({
      success: true,
      count: doctors.length,
      specialties,
      doctors
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// GET single doctor by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const row = db.prepare('SELECT * FROM doctors WHERE id = ?').get(id);
    if (!row) {
      return res.status(404).json({ error: `Doctor with ID '${id}' not found` });
    }

    const doctor = formatDoctor(row);

    // Get upcoming appointments count or reviews
    const appointmentsCount = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ? AND status = 'CONFIRMED'").get(id);

    res.json({
      success: true,
      doctor: {
        ...doctor,
        active_bookings_count: appointmentsCount.count
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// GET doctor availability for a specific date
router.get('/:id/availability', (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'date query parameter (YYYY-MM-DD) is required' });
    }

    const doctorRow = db.prepare('SELECT * FROM doctors WHERE id = ?').get(id);
    if (!doctorRow) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const doctor = formatDoctor(doctorRow);

    // Find all already booked time slots on that date
    const bookedAppointments = db.prepare(`
      SELECT time_slot FROM appointments
      WHERE doctor_id = ? AND date = ? AND status = 'CONFIRMED'
    `).all(id, date);

    const bookedSlotsSet = new Set(bookedAppointments.map(a => a.time_slot));

    const slotStatus = doctor.available_slots.map(slot => ({
      slot,
      is_available: !bookedSlotsSet.has(slot)
    }));

    res.json({
      success: true,
      doctor_id: id,
      doctor_name: doctor.name,
      date,
      slots: slotStatus
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

export default router;
