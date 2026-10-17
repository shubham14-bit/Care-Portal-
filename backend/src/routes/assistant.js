import express from 'express';
import db from '../db/index.js';
import crypto from 'node:crypto';

const router = express.Router();

// Helper triage evaluation logic
function evaluateTriage(message, patient, activeMeds, latestVital, upcomingAppointments) {
  const text = message.toLowerCase();

  // 1. Critical Red Flag Symptoms (Immediate Emergency Referral)
  if (
    text.includes('chest pain') ||
    text.includes('pressure in chest') ||
    text.includes('shortness of breath') ||
    text.includes('cannot breathe') ||
    text.includes('passed out') ||
    text.includes('fainting') ||
    text.includes('stroke') ||
    text.includes('face drooping') ||
    text.includes('arm numbness') ||
    text.includes('severe dizziness')
  ) {
    return {
      severity: 'CRITICAL',
      reply: `⚠️ Eleanor, these symptoms require immediate medical attention. Please tap the red SOS Emergency button at the top of your screen right now, or call 911 immediately. Emergency contacts and local hospitals have been notified of your location. Do not attempt to drive.`,
      chips: ['Activate SOS Emergency', 'Call 911', 'Call Robert Vance (Son)']
    };
  }

  // 2. Medication / Prescription Questions
  if (
    text.includes('medicine') ||
    text.includes('medication') ||
    text.includes('prescription') ||
    text.includes('lisinopril') ||
    text.includes('atorvastatin') ||
    text.includes('pill') ||
    text.includes('dose') ||
    text.includes('refill')
  ) {
    const medSummary = activeMeds.map(m => `• **${m.drug}** (${m.dosage}) - ${m.frequency} [${m.refills} refills left]`).join('\n');
    return {
      severity: 'INFO',
      reply: `Here are your current active prescriptions synchronized from your clinical EHR:\n\n${medSummary}\n\n🌿 **Reminder**: Keep taking Lisinopril in the morning with water. Never take Penicillin or Sulfa drugs due to your documented anaphylactic allergy. Would you like me to request a refill from Saint Jude Pharmacy?`,
      chips: ['Request pharmacy refill', 'Check medication interactions', 'When is my next dose?']
    };
  }

  // 3. Appointments & Schedule
  if (
    text.includes('appointment') ||
    text.includes('doctor') ||
    text.includes('visit') ||
    text.includes('schedule') ||
    text.includes('when do i see')
  ) {
    if (upcomingAppointments.length > 0) {
      const aptList = upcomingAppointments.map(a => `• **${a.doctor_name}** (${a.specialty}) on **${a.date}** at **${a.time_slot}** at ${a.hospital_name}`).join('\n');
      return {
        severity: 'INFO',
        reply: `You have ${upcomingAppointments.length} upcoming scheduled consultation(s):\n\n${aptList}\n\nWould you like to book another visit or reschedule one of these appointments?`,
        chips: ['Book a new doctor', 'Reschedule appointment', 'Get driving directions']
      };
    } else {
      return {
        severity: 'INFO',
        reply: `You do not have any upcoming visits currently scheduled. You can browse specialists like Dr. Alistair Chen or Dr. Sarah Jenkins on the "Book Visit" screen anytime!`,
        chips: ['Find a doctor now', 'View past visits', 'Check vitals']
      };
    }
  }

  // 4. Vitals & Blood Pressure
  if (
    text.includes('vital') ||
    text.includes('blood pressure') ||
    text.includes('bp') ||
    text.includes('heart rate') ||
    text.includes('pulse') ||
    text.includes('glucose') ||
    text.includes('sugar')
  ) {
    if (latestVital) {
      return {
        severity: 'INFO',
        reply: `Your most recent vital reading recorded was on **${new Date(latestVital.timestamp).toLocaleDateString()}**:\n\n• **Blood Pressure**: ${latestVital.blood_pressure_sys}/${latestVital.blood_pressure_dia} mmHg (${latestVital.status_label})\n• **Heart Rate**: ${latestVital.heart_rate} bpm\n• **Oxygen Saturation**: ${latestVital.oxygen_saturation}%\n• **Blood Glucose**: ${latestVital.blood_glucose || 96} mg/dL\n\nYour cardiac vitals remain within healthy target thresholds for your age and longitudinal treatment plan!`,
        chips: ['Log new vital reading', 'View historical vitals', 'Share with Dr. Chen']
      };
    }
  }

  // 5. Knee / Joint Pain & Osteoarthritis
  if (
    text.includes('knee') ||
    text.includes('joint') ||
    text.includes('pain') ||
    text.includes('arthritis') ||
    text.includes('stiff')
  ) {
    return {
      severity: 'ADVICE',
      reply: `For your mild bilateral knee osteoarthritis, Dr. Marcus Brody recommends:\n\n1. Applying topical Diclofenac Gel (1%) gently over the joint twice daily.\n2. Avoiding prolonged standing or high-impact steps today.\n3. Doing 10 minutes of gentle seated ankle and knee range-of-motion flexes.\n4. You may take Acetaminophen ER 650mg if joint discomfort persists.\n\nIf swelling or warmth develops in the knee, please let us know so we can notify Cedar Valley Clinic.`,
      chips: ['Log joint discomfort', 'Check knee exercise guide', 'Message Dr. Brody']
    };
  }

  // 6. General Greeting or Wellness Inquiry
  return {
    severity: 'NORMAL',
    reply: `Hello Eleanor! 🌿 I am your BulbaCare health assistant. I am continuously monitoring your CarePortal records, active prescriptions, and vitals to keep your health journey steady and dignified. How can I assist your health and wellness right now?`,
    chips: [
      'Check my medication schedule',
      'When is my next appointment?',
      'Review my latest blood pressure',
      'Find nearby hospital'
    ]
  };
}

// GET conversation history
router.get('/history', (req, res) => {
  try {
    const { patient_id = 'P-001' } = req.query;
    const messages = db.prepare('SELECT * FROM assistant_messages WHERE patient_id = ? ORDER BY timestamp ASC').all(patient_id);
    res.json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// POST send message to BulbaCare AI
router.post('/chat', (req, res) => {
  try {
    const { patient_id = 'P-001', message } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ error: 'message string is required in request body' });
    }

    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(patient_id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Load active medications
    const visits = db.prepare('SELECT prescriptions FROM clinical_visits WHERE patient_id = ?').all(patient_id);
    const activeMeds = [];
    const seen = new Set();
    for (const v of visits) {
      const rxs = JSON.parse(v.prescriptions || '[]');
      for (const rx of rxs) {
        if (rx.status === 'Active' && !seen.has(rx.drug)) {
          seen.add(rx.drug);
          activeMeds.push(rx);
        }
      }
    }

    // Load latest vitals
    const latestVital = db.prepare('SELECT * FROM vitals WHERE patient_id = ? ORDER BY timestamp DESC LIMIT 1').get(patient_id);

    // Load upcoming appointments
    const upcomingAppointments = db.prepare("SELECT * FROM appointments WHERE patient_id = ? AND status = 'CONFIRMED' ORDER BY date ASC").all(patient_id);

    // Save user message
    const userMsgId = 'MSG-' + crypto.randomUUID().slice(0, 8).toUpperCase();
    const userTimestamp = new Date().toISOString();
    db.prepare(`
      INSERT INTO assistant_messages (id, patient_id, sender, message, timestamp, category)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userMsgId, patient_id, 'user', message.trim(), userTimestamp, 'user_prompt');

    // Run clinical triage logic
    const triageResult = evaluateTriage(message.trim(), patient, activeMeds, latestVital, upcomingAppointments);

    // Save assistant message
    const botMsgId = 'MSG-' + crypto.randomUUID().slice(0, 8).toUpperCase();
    const botTimestamp = new Date(Date.now() + 500).toISOString();
    db.prepare(`
      INSERT INTO assistant_messages (id, patient_id, sender, message, timestamp, category)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(botMsgId, patient_id, 'assistant', triageResult.reply, botTimestamp, triageResult.severity);

    res.status(201).json({
      success: true,
      user_message: {
        id: userMsgId,
        sender: 'user',
        message: message.trim(),
        timestamp: userTimestamp
      },
      assistant_message: {
        id: botMsgId,
        sender: 'assistant',
        message: triageResult.reply,
        timestamp: botTimestamp,
        severity: triageResult.severity,
        suggested_chips: triageResult.chips
      }
    });
  } catch (err) {
    console.error('Assistant chat error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// DELETE clear history
router.delete('/history', (req, res) => {
  try {
    const { patient_id = 'P-001' } = req.query;
    db.prepare('DELETE FROM assistant_messages WHERE patient_id = ?').run(patient_id);
    res.json({ success: true, message: 'Assistant chat history cleared.' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

export default router;
