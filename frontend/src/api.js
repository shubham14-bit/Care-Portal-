// CarePortal Botanical Sanctuary API Client
const API_BASE = '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchPatient(mrn = 'MRN-9482-EV77') {
  const res = await fetch(`${API_BASE}/patient`);
  return res.json();
}

export async function updatePatient(mrn, data) {
  const res = await fetch(`${API_BASE}/patient/${mrn}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function fetchVitals(mrn = 'MRN-9482-EV77') {
  const res = await fetch(`${API_BASE}/patient/${mrn}/vitals`);
  return res.json();
}

export async function logVital(mrn, vitalData) {
  const res = await fetch(`${API_BASE}/patient/${mrn}/vitals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vitalData)
  });
  return res.json();
}

export async function fetchHospitals(filters = {}) {
  const params = new URLSearchParams();
  if (filters.emergency) params.append('emergency', 'true');
  if (filters.search) params.append('search', filters.search);
  if (filters.sort) params.append('sort', filters.sort);
  const res = await fetch(`${API_BASE}/hospitals?${params.toString()}`);
  return res.json();
}

export async function fetchDoctors(filters = {}) {
  const params = new URLSearchParams();
  if (filters.specialty && filters.specialty !== 'All') params.append('specialty', filters.specialty);
  if (filters.search) params.append('search', filters.search);
  const res = await fetch(`${API_BASE}/doctors?${params.toString()}`);
  return res.json();
}

export async function fetchDoctorAvailability(doctorId, date) {
  const res = await fetch(`${API_BASE}/doctors/${doctorId}/availability?date=${date}`);
  return res.json();
}

export async function fetchAppointments(patientId = 'P-001') {
  const res = await fetch(`${API_BASE}/appointments?patient_id=${patientId}`);
  return res.json();
}

export async function bookAppointment(bookingData) {
  const res = await fetch(`${API_BASE}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData)
  });
  return res.json();
}

export async function cancelAppointment(appointmentId) {
  const res = await fetch(`${API_BASE}/appointments/${appointmentId}`, {
    method: 'DELETE'
  });
  return res.json();
}

export async function fetchVisits(category = 'all', search = '') {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.append('category', category);
  if (search) params.append('search', search);
  const res = await fetch(`${API_BASE}/visits?${params.toString()}`);
  return res.json();
}

export async function fetchActiveMedications(patientId = 'P-001') {
  const res = await fetch(`${API_BASE}/visits/prescriptions/active?patient_id=${patientId}`);
  return res.json();
}

export async function fetchHealthReports(patientId = 'P-001') {
  const res = await fetch(`${API_BASE}/visits/reports?patient_id=${patientId}`);
  return res.json();
}

export async function uploadHealthReport(formData) {
  const res = await fetch(`${API_BASE}/visits/upload-report`, {
    method: 'POST',
    body: formData
  });
  return res.json();
}

export async function triggerSos(sosData = {}) {
  const res = await fetch(`${API_BASE}/emergency/sos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sosData)
  });
  return res.json();
}

export async function fetchAssistantHistory(patientId = 'P-001') {
  const res = await fetch(`${API_BASE}/assistant/history?patient_id=${patientId}`);
  return res.json();
}

export async function sendAssistantMessage(patientId, message) {
  const res = await fetch(`${API_BASE}/assistant/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patient_id: patientId, message })
  });
  return res.json();
}
