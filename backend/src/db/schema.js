export const createSchemaSql = `
CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  mrn TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  dob TEXT NOT NULL,
  gender TEXT NOT NULL,
  blood_type TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  allergies TEXT NOT NULL,
  chronic_conditions TEXT NOT NULL,
  insurance_provider TEXT NOT NULL,
  insurance_policy_number TEXT NOT NULL,
  insurance_group TEXT NOT NULL,
  medicare_status TEXT NOT NULL,
  avatar_initials TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS emergency_contacts (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone TEXT NOT NULL,
  is_primary INTEGER DEFAULT 0,
  notify_on_sos INTEGER DEFAULT 1,
  FOREIGN KEY(patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS vitals (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  blood_pressure_sys INTEGER NOT NULL,
  blood_pressure_dia INTEGER NOT NULL,
  heart_rate INTEGER NOT NULL,
  blood_glucose INTEGER,
  oxygen_saturation INTEGER NOT NULL,
  weight_lbs REAL,
  status_label TEXT DEFAULT 'Optimal',
  notes TEXT,
  FOREIGN KEY(patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS hospitals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  distance_miles REAL NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  emergency_ready INTEGER DEFAULT 1,
  rating REAL NOT NULL,
  review_count INTEGER NOT NULL,
  services TEXT NOT NULL,
  open_hours TEXT NOT NULL,
  verified_care_network INTEGER DEFAULT 1,
  latitude REAL,
  longitude REAL
);

CREATE TABLE IF NOT EXISTS doctors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  hospital_id TEXT NOT NULL,
  hospital_name TEXT NOT NULL,
  rating REAL NOT NULL,
  review_count INTEGER NOT NULL,
  experience_years INTEGER NOT NULL,
  bio TEXT NOT NULL,
  consultation_fee INTEGER NOT NULL,
  accepted_insurance TEXT NOT NULL,
  available_days TEXT NOT NULL,
  available_slots TEXT NOT NULL,
  avatar_color TEXT NOT NULL,
  FOREIGN KEY(hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  doctor_id TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  hospital_name TEXT NOT NULL,
  date TEXT NOT NULL,
  time_slot TEXT NOT NULL,
  reason TEXT,
  visit_type TEXT DEFAULT 'In-Person',
  status TEXT DEFAULT 'CONFIRMED',
  created_at TEXT NOT NULL,
  FOREIGN KEY(patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY(doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS clinical_visits (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  visit_date TEXT NOT NULL,
  facility_name TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  visit_type TEXT NOT NULL,
  diagnosis TEXT NOT NULL,
  icd10_code TEXT NOT NULL,
  summary_notes TEXT NOT NULL,
  prescriptions TEXT NOT NULL,
  lab_results TEXT NOT NULL,
  verified_signature TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS health_reports (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  title TEXT NOT NULL,
  document_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_at TEXT NOT NULL,
  notes TEXT,
  FOREIGN KEY(patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS emergency_sos_logs (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT DEFAULT 'DISPATCHED',
  dispatched_facility_id TEXT,
  dispatched_facility_name TEXT,
  notified_contacts TEXT NOT NULL,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS assistant_messages (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  sender TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  category TEXT
);

CREATE INDEX IF NOT EXISTS idx_visits_patient ON clinical_visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_vitals_patient ON vitals(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON doctors(specialty);
`;
