import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/server.js';

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    // Listen on dynamic ephemeral port 0 for testing
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => {
    server.close(resolve);
  });
});

test('GET / - API root info', async () => {
  const res = await fetch(`${baseUrl}/`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'ONLINE');
  assert.equal(data.design_system, 'Botanical Sanctuary (CarePortal)');
  assert.equal(data.active_patient, 'Eleanor Vance (MRN-9482-EV77)');
});

test('GET /api/health - Health check', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'healthy');
  assert.match(data.database, /SQLite/);
});

test('GET /api/patient - Eleanor Vance profile', async () => {
  const res = await fetch(`${baseUrl}/api/patient`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.patient.mrn, 'MRN-9482-EV77');
  assert.equal(data.patient.first_name, 'Eleanor');
  assert.equal(data.patient.last_name, 'Vance');
  assert.ok(Array.isArray(data.patient.allergies));
  assert.ok(data.patient.allergies.some(a => a.includes('Penicillin')));
  assert.ok(Array.isArray(data.patient.emergency_contacts));
  assert.ok(data.patient.emergency_contacts.length >= 2);
  assert.ok(Array.isArray(data.patient.active_medications));
  assert.ok(data.patient.active_medications.some(m => m.drug === 'Lisinopril'));
});

test('POST /api/patient/:mrn/vitals - Log new vital reading', async () => {
  const res = await fetch(`${baseUrl}/api/patient/MRN-9482-EV77/vitals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      blood_pressure_sys: 122,
      blood_pressure_dia: 76,
      heart_rate: 68,
      oxygen_saturation: 99,
      blood_glucose: 95,
      weight_lbs: 148.0,
      notes: 'Automated test vital'
    })
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.vital.blood_pressure_sys, 122);
  assert.equal(data.vital.status_label, 'Optimal');
});

test('GET /api/hospitals - Hospital directory & distance sort', async () => {
  const res = await fetch(`${baseUrl}/api/hospitals?sort=distance`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.count >= 3);
  assert.equal(data.hospitals[0].name, 'Evergreen Botanical Care Center');
  assert.equal(data.hospitals[0].emergency_ready, true);
});

test('GET /api/doctors - Specialist directory & availability', async () => {
  const res = await fetch(`${baseUrl}/api/doctors?specialty=Cardiology`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.count >= 1);
  const doctor = data.doctors[0];
  assert.equal(doctor.name, 'Dr. Alistair Chen, MD, FACC');

  // Test availability endpoint for a date
  const availRes = await fetch(`${baseUrl}/api/doctors/${doctor.id}/availability?date=2026-11-15`);
  assert.equal(availRes.status, 200);
  const availData = await availRes.json();
  assert.equal(availData.success, true);
  assert.ok(Array.isArray(availData.slots));
  assert.ok(availData.slots.length > 0);
});

test('POST /api/appointments - Book, conflict check, and cancel appointment', async () => {
  // 1. Book appointment
  const bookRes = await fetch(`${baseUrl}/api/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patient_id: 'P-001',
      doctor_id: 'DOC-002',
      date: '2026-11-20',
      time_slot: '10:00 AM',
      reason: 'Longitudinal Wellness Check'
    })
  });

  assert.equal(bookRes.status, 201);
  const bookData = await bookRes.json();
  assert.equal(bookData.success, true);
  const aptId = bookData.appointment.id;

  // 2. Conflict test: attempt to book the exact same slot
  const conflictRes = await fetch(`${baseUrl}/api/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patient_id: 'P-001',
      doctor_id: 'DOC-002',
      date: '2026-11-20',
      time_slot: '10:00 AM',
      reason: 'Second booking attempt'
    })
  });
  assert.equal(conflictRes.status, 409);

  // 3. Cancel the appointment
  const cancelRes = await fetch(`${baseUrl}/api/appointments/${aptId}`, {
    method: 'DELETE'
  });
  assert.equal(cancelRes.status, 200);
});

test('GET /api/visits - Category filter (All, Hospital, Clinic)', async () => {
  // All
  const allRes = await fetch(`${baseUrl}/api/visits`);
  const allData = await allRes.json();
  assert.ok(allData.count >= 4);

  // Hospital
  const hospRes = await fetch(`${baseUrl}/api/visits?category=hospital`);
  const hospData = await hospRes.json();
  assert.ok(hospData.visits.every(v => v.visit_type.includes('Hospital')));

  // Clinic
  const clinicRes = await fetch(`${baseUrl}/api/visits?category=clinic`);
  const clinicData = await clinicRes.json();
  assert.ok(clinicData.visits.every(v => v.visit_type.includes('Clinic')));
});

test('POST /api/emergency/sos - Trigger emergency alert', async () => {
  const res = await fetch(`${baseUrl}/api/emergency/sos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patient_id: 'P-001',
      trigger_source: 'Test SOS Suite',
      latitude: 44.0521,
      longitude: -123.016
    })
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.alert.status, 'DISPATCHED');
  assert.equal(data.alert.dispatched_facility.name, 'Evergreen Botanical Care Center');
  assert.ok(data.alert.notified_emergency_contacts.length >= 2);
});

test('POST /api/assistant/chat - BulbaCare AI Health Assistant', async () => {
  // 1. Medication query
  const res = await fetch(`${baseUrl}/api/assistant/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patient_id: 'P-001',
      message: 'What medication should I take in the morning?'
    })
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.match(data.assistant_message.message, /Lisinopril/i);
  assert.ok(Array.isArray(data.assistant_message.suggested_chips));

  // 2. Critical triage test
  const triageRes = await fetch(`${baseUrl}/api/assistant/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patient_id: 'P-001',
      message: 'I have severe chest pain and cannot breathe'
    })
  });

  assert.equal(triageRes.status, 201);
  const triageData = await triageRes.json();
  assert.equal(triageData.assistant_message.severity, 'CRITICAL');
  assert.match(triageData.assistant_message.message, /SOS/);
});
