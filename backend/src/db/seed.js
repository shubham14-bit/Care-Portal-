export function seedData(db) {
  // Check if patient already exists
  const existingPatient = db.prepare('SELECT id FROM patients WHERE id = ?').get('P-001');
  if (existingPatient) {
    return;
  }

  // 1. Seed Patient (Eleanor Vance)
  const insertPatient = db.prepare(`
    INSERT INTO patients (
      id, mrn, first_name, last_name, dob, gender, blood_type, phone, email, address,
      allergies, chronic_conditions, insurance_provider, insurance_policy_number,
      insurance_group, medicare_status, avatar_initials, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertPatient.run(
    'P-001',
    'MRN-9482-EV77',
    'Eleanor',
    'Vance',
    '1958-04-12',
    'Female',
    'O+',
    '(555) 382-9104',
    'eleanor.vance@careportal.health',
    '742 Evergreen Terrace, Springfield, OR 97477',
    JSON.stringify(['Penicillin (Severe Rash / Anaphylactoid)', 'Sulfa Drugs (Urticaria)']),
    JSON.stringify(['Hypertension Stage 1 (Controlled)', 'Mild Osteoarthritis (Bilateral Knees)', 'Osteopenia']),
    'Blue Cross Blue Shield Medicare Advantage PPO',
    'BCBS-MED-84920194',
    'GRP-77410',
    'Active - Medicare Part A & B Verified',
    'EV',
    new Date('2026-01-10T08:00:00Z').toISOString(),
    new Date().toISOString()
  );

  // 2. Seed Emergency Contacts (ICE)
  const insertContact = db.prepare(`
    INSERT INTO emergency_contacts (id, patient_id, name, relationship, phone, is_primary, notify_on_sos)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertContact.run('ICE-001', 'P-001', 'Robert Vance', 'Son (Primary Caregiver)', '(555) 749-1022', 1, 1);
  insertContact.run('ICE-002', 'P-001', 'Clara Vance', 'Daughter-in-Law', '(555) 749-1025', 0, 1);
  insertContact.run('ICE-003', 'P-001', 'Dr. Alistair Chen', 'Primary Cardiologist', '(555) 234-8890', 0, 1);

  // 3. Seed Vitals
  const insertVital = db.prepare(`
    INSERT INTO vitals (
      id, patient_id, timestamp, blood_pressure_sys, blood_pressure_dia,
      heart_rate, blood_glucose, oxygen_saturation, weight_lbs, status_label, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertVital.run('VIT-001', 'P-001', new Date(Date.now() - 2 * 3600 * 1000).toISOString(), 124, 78, 72, 96, 98, 148.5, 'Optimal', 'Morning resting measurement post-botanical walk');
  insertVital.run('VIT-002', 'P-001', new Date(Date.now() - 26 * 3600 * 1000).toISOString(), 128, 82, 74, 102, 98, 149.0, 'Optimal', 'Post-lunch baseline check');
  insertVital.run('VIT-003', 'P-001', new Date(Date.now() - 72 * 3600 * 1000).toISOString(), 130, 84, 76, 108, 97, 148.8, 'Mild Elevation', 'Evening reading, slightly tired');
  insertVital.run('VIT-004', 'P-001', new Date(Date.now() - 168 * 3600 * 1000).toISOString(), 122, 76, 70, 94, 99, 149.2, 'Optimal', 'Weekly comprehensive assessment');

  // 4. Seed Hospitals
  const insertHospital = db.prepare(`
    INSERT INTO hospitals (
      id, name, distance_miles, address, phone, emergency_ready, rating,
      review_count, services, open_hours, verified_care_network, latitude, longitude
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertHospital.run(
    'HOSP-001',
    'Evergreen Botanical Care Center',
    0.8,
    '108 Sanctuary Grove Blvd, Springfield, OR',
    '(555) 890-4100',
    1,
    4.9,
    312,
    JSON.stringify(['Emergency Trauma', 'Comprehensive Geriatrics', 'Cardiology', 'Holistic Wellness Sanctuary']),
    'Open 24/7',
    1,
    44.0521,
    -123.016
  );

  insertHospital.run(
    'HOSP-002',
    'Saint Jude Memorial Hospital',
    1.4,
    '450 Medical Heights Way, Springfield, OR',
    '(555) 234-8800',
    1,
    4.8,
    528,
    JSON.stringify(['24/7 Emergency', 'Cardiovascular Institute', 'Joint & Spine Center', 'Telehealth Urgent Pods']),
    'Open 24/7',
    1,
    44.0612,
    -123.034
  );

  insertHospital.run(
    'HOSP-003',
    'Cedar Valley Community Clinic',
    2.3,
    '720 Riverbend Road, Eugene, OR',
    '(555) 341-9200',
    0,
    4.7,
    184,
    JSON.stringify(['Primary Care', 'Diagnostic Imaging', 'Senior Rehabilitation', 'Pharmacy Dispensing']),
    '07:00 AM - 09:00 PM',
    1,
    44.0725,
    -123.051
  );

  insertHospital.run(
    'HOSP-004',
    'Metro Central Medical Center',
    3.9,
    '1200 University Parkway, Eugene, OR',
    '(555) 765-2000',
    1,
    4.6,
    890,
    JSON.stringify(['Level 1 Trauma', 'Neurology Care', 'Diabetes Management Center', 'Dialysis Center']),
    'Open 24/7',
    1,
    44.045,
    -123.078
  );

  // 5. Seed Doctors
  const insertDoctor = db.prepare(`
    INSERT INTO doctors (
      id, name, specialty, hospital_id, hospital_name, rating, review_count,
      experience_years, bio, consultation_fee, accepted_insurance, available_days,
      available_slots, avatar_color
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertDoctor.run(
    'DOC-001',
    'Dr. Alistair Chen, MD, FACC',
    'Cardiology & Vascular Medicine',
    'HOSP-002',
    'Saint Jude Memorial Hospital',
    4.9,
    284,
    18,
    'Board-certified cardiologist specializing in preventative cardiology, hypertension management, and senior cardiovascular vitality.',
    120,
    JSON.stringify(['Medicare', 'Blue Cross Blue Shield', 'Aetna Senior', 'UnitedHealthcare']),
    JSON.stringify(['Monday', 'Tuesday', 'Thursday']),
    JSON.stringify(['09:30 AM', '11:00 AM', '02:15 PM', '04:00 PM']),
    '#3F8F55'
  );

  insertDoctor.run(
    'DOC-002',
    'Dr. Sarah Jenkins, MD',
    'Geriatric Medicine & Longitudinal Care',
    'HOSP-001',
    'Evergreen Botanical Care Center',
    4.9,
    196,
    14,
    'Passionate geriatrician committed to holistic patient wellness, dignified aging, cognitive vitality, and medication synchronization.',
    95,
    JSON.stringify(['Medicare', 'Blue Cross Blue Shield', 'Humana', 'Cigna']),
    JSON.stringify(['Monday', 'Wednesday', 'Friday']),
    JSON.stringify(['10:00 AM', '01:30 PM', '03:00 PM', '04:15 PM']),
    '#214D38'
  );

  insertDoctor.run(
    'DOC-003',
    'Dr. Marcus Brody, DO',
    'Internal Medicine & Rheumatology',
    'HOSP-003',
    'Cedar Valley Community Clinic',
    4.8,
    142,
    12,
    'Focuses on osteoarthritis management, joint mobility preservation, and anti-inflammatory restorative regimens for active seniors.',
    85,
    JSON.stringify(['Medicare', 'Blue Cross Blue Shield', 'Kaiser Senior Choice']),
    JSON.stringify(['Tuesday', 'Thursday', 'Friday']),
    JSON.stringify(['09:00 AM', '11:30 AM', '02:00 PM', '03:30 PM']),
    '#45B7A0'
  );

  insertDoctor.run(
    'DOC-004',
    'Dr. Emily Watson, MD',
    'Endocrinology & Metabolic Health',
    'HOSP-004',
    'Metro Central Medical Center',
    4.9,
    215,
    16,
    'Specialist in endocrine balance, glucose stabilization, bone density protection, and thyroid optimization in mature adults.',
    110,
    JSON.stringify(['Medicare', 'Blue Cross Blue Shield', 'Aetna', 'WellCare']),
    JSON.stringify(['Wednesday', 'Thursday']),
    JSON.stringify(['10:30 AM', '01:00 PM', '02:45 PM', '04:30 PM']),
    '#136A34'
  );

  insertDoctor.run(
    'DOC-005',
    'Dr. Arthur Pendelton, MD, PhD',
    'Neurology & Cognitive Health',
    'HOSP-002',
    'Saint Jude Memorial Hospital',
    4.8,
    167,
    21,
    'Senior attending neurologist focusing on neurological health, memory preservation, sleep architecture, and restorative cognitive therapy.',
    140,
    JSON.stringify(['Medicare', 'Blue Cross Blue Shield', 'UnitedHealthcare']),
    JSON.stringify(['Tuesday', 'Friday']),
    JSON.stringify(['11:00 AM', '01:15 PM', '03:15 PM']),
    '#78C850'
  );

  // 6. Seed Appointments
  const insertAppointment = db.prepare(`
    INSERT INTO appointments (
      id, patient_id, doctor_id, doctor_name, specialty, hospital_name, date,
      time_slot, reason, visit_type, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertAppointment.run(
    'APT-001',
    'P-001',
    'DOC-001',
    'Dr. Alistair Chen, MD, FACC',
    'Cardiology & Vascular Medicine',
    'Saint Jude Memorial Hospital',
    '2026-10-24',
    '11:00 AM',
    'Routine 6-Month Blood Pressure & Cardiac Rhythm Checkup',
    'In-Person Consultation',
    'CONFIRMED',
    new Date('2026-10-10T14:30:00Z').toISOString()
  );

  insertAppointment.run(
    'APT-002',
    'P-001',
    'DOC-002',
    'Dr. Sarah Jenkins, MD',
    'Geriatric Medicine & Longitudinal Care',
    'Evergreen Botanical Care Center',
    '2026-11-04',
    '01:30 PM',
    'Annual Longitudinal Wellness & Medication Reconciliation',
    'In-Person Consultation',
    'CONFIRMED',
    new Date('2026-10-12T09:15:00Z').toISOString()
  );

  // 7. Seed Clinical Visits (EHR Records matching categories in Stitch)
  const insertVisit = db.prepare(`
    INSERT INTO clinical_visits (
      id, patient_id, visit_date, facility_name, doctor_name, specialty, visit_type,
      diagnosis, icd10_code, summary_notes, prescriptions, lab_results, verified_signature, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertVisit.run(
    'VISIT-001',
    'P-001',
    '2026-09-18',
    'Saint Jude Memorial Hospital',
    'Dr. Alistair Chen, MD, FACC',
    'Cardiology',
    'Clinic Consultations',
    'Essential Hypertension (Well Controlled)',
    'ICD-10 I10',
    'Patient presents for scheduled hypertension review. Ambulatory BP log shows consistent resting control at 122-126/76-80 mmHg. Cardiac auscultation normal, S1/S2 present, no murmurs. Advised continuation of Lisinopril 10mg daily and daily 30-minute botanical garden walking.',
    JSON.stringify([
      { drug: 'Lisinopril', dosage: '10 mg', frequency: 'Once daily in morning', status: 'Active', refills: 3 },
      { drug: 'Atorvastatin', dosage: '20 mg', frequency: 'Once daily at bedtime', status: 'Active', refills: 5 }
    ]),
    JSON.stringify([
      { test: 'Serum Potassium', value: 4.2, unit: 'mEq/L', reference_range: '3.5 - 5.0', is_normal: true },
      { test: 'Creatinine', value: 0.88, unit: 'mg/dL', reference_range: '0.59 - 1.04', is_normal: true },
      { test: 'eGFR', value: 82, unit: 'mL/min/1.73m²', reference_range: '> 60', is_normal: true }
    ]),
    'Dr. Alistair Chen (Digitally Verified via CarePortal Vault)',
    new Date('2026-09-18T16:00:00Z').toISOString()
  );

  insertVisit.run(
    'VISIT-002',
    'P-001',
    '2026-07-04',
    'Evergreen Botanical Care Center',
    'Dr. Sarah Jenkins, MD',
    'Geriatric Medicine',
    'Hospital Admissions',
    'Acute Gastroenteritis with Mild Volume Depletion',
    'ICD-10 A09',
    'Admitted overnight for observation following 24-hour foodborne gastroenteritis. IV hydration administered with balanced electrolytes. Vitals normalized within 12 hours. Patient tolerated oral intake well before discharge home in stable condition with family.',
    JSON.stringify([
      { drug: 'Oral Rehydration Salts', dosage: '1 packet', frequency: 'Every 4 hours PRN hydration', status: 'Completed', refills: 0 },
      { drug: 'Ondansetron ODT', dosage: '4 mg', frequency: 'Every 8 hours PRN nausea (max 3 days)', status: 'Completed', refills: 0 }
    ]),
    JSON.stringify([
      { test: 'Serum Sodium', value: 139, unit: 'mmol/L', reference_range: '135 - 145', is_normal: true },
      { test: 'Serum Chloride', value: 101, unit: 'mmol/L', reference_range: '96 - 106', is_normal: true },
      { test: 'BUN', value: 18, unit: 'mg/dL', reference_range: '7 - 20', is_normal: true }
    ]),
    'Dr. Sarah Jenkins (Verified Hospital EHR Discharge Registry)',
    new Date('2026-07-05T11:30:00Z').toISOString()
  );

  insertVisit.run(
    'VISIT-003',
    'P-001',
    '2026-05-12',
    'Cedar Valley Community Clinic',
    'Dr. Marcus Brody, DO',
    'Rheumatology',
    'Clinic Consultations',
    'Primary Osteoarthritis of Right Knee',
    'ICD-10 M17.11',
    'Evaluation of right knee discomfort following extended standing. Joint space narrowing consistent with mild grade 2 OA. No effusion, range of motion intact. Recommended low-impact water exercise, supportive footwear, and ergonomic seating.',
    JSON.stringify([
      { drug: 'Acetaminophen ER', dosage: '650 mg', frequency: 'Every 8 hours PRN joint ache', status: 'Active', refills: 2 },
      { drug: 'Topical Diclofenac Gel 1%', dosage: '2 grams', frequency: 'Apply to right knee twice daily PRN', status: 'Active', refills: 2 }
    ]),
    JSON.stringify([
      { test: 'Rheumatoid Factor (RF)', value: '< 14', unit: 'IU/mL', reference_range: '< 14', is_normal: true },
      { test: 'C-Reactive Protein (CRP)', value: 1.8, unit: 'mg/L', reference_range: '< 3.0', is_normal: true }
    ]),
    'Dr. Marcus Brody (Verified Clinical Record ID #77281)',
    new Date('2026-05-12T15:45:00Z').toISOString()
  );

  insertVisit.run(
    'VISIT-004',
    'P-001',
    '2026-02-28',
    'Saint Jude Memorial Hospital',
    'Dr. Alistair Chen, MD, FACC',
    'Cardiology',
    'Clinic Consultations',
    'Annual Lipid Panel Surveillance & Cardiovascular Risk Screening',
    'ICD-10 Z00.00',
    'Comprehensive annual cardiovascular panel. 10-year ASCVD risk calculated at 6.4% (well managed with moderate-intensity statin therapy). Fasting lipids show significant improvement with LDL target achieved at 94 mg/dL. Re-check scheduled in 6 months.',
    JSON.stringify([
      { drug: 'Atorvastatin', dosage: '20 mg', frequency: 'Once daily at bedtime', status: 'Active', refills: 5 }
    ]),
    JSON.stringify([
      { test: 'Total Cholesterol', value: 172, unit: 'mg/dL', reference_range: '< 200', is_normal: true },
      { test: 'HDL Cholesterol', value: 58, unit: 'mg/dL', reference_range: '> 50', is_normal: true },
      { test: 'LDL Cholesterol (Direct)', value: 94, unit: 'mg/dL', reference_range: '< 100', is_normal: true },
      { test: 'Triglycerides', value: 110, unit: 'mg/dL', reference_range: '< 150', is_normal: true }
    ]),
    'Dr. Alistair Chen (Digitally Signed Lipid Review)',
    new Date('2026-02-28T14:15:00Z').toISOString()
  );

  // 8. Seed Initial Health Report Documents
  const insertReport = db.prepare(`
    INSERT INTO health_reports (
      id, patient_id, title, document_type, file_path, file_name, file_size, mime_type, uploaded_at, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertReport.run(
    'DOC-REP-001',
    'P-001',
    'Comprehensive Comprehensive Metabolic Panel (CMP-14)',
    'Laboratory Diagnostic Report',
    'uploads/sample_cmp_report.pdf',
    'sample_cmp_report.pdf',
    248102,
    'application/pdf',
    new Date('2026-09-18T17:00:00Z').toISOString(),
    'Official laboratory report from Saint Jude Diagnostic Core Labs. All electrolyte and renal parameters within reference intervals.'
  );

  insertReport.run(
    'DOC-REP-002',
    'P-001',
    'Right Knee Bilateral Standing Radiograph Summary',
    'Imaging Radiology Report',
    'uploads/sample_xray_knee.pdf',
    'sample_xray_knee.pdf',
    412950,
    'application/pdf',
    new Date('2026-05-12T16:30:00Z').toISOString(),
    'Radiology review confirming mild medial compartment joint narrowing, consistent with age-related osteoarthritis.'
  );

  // 9. Seed BulbaCare AI Health Assistant Seed Messages
  const insertMessage = db.prepare(`
    INSERT INTO assistant_messages (id, patient_id, sender, message, timestamp, category)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertMessage.run(
    'MSG-001',
    'P-001',
    'assistant',
    'Hello Eleanor! 🌿 I am BulbaCare, your botanical health companion. I see your morning vitals were optimal (BP 124/78, Heart Rate 72 bpm). Have you taken your morning Lisinopril (10 mg) with breakfast today?',
    new Date(Date.now() - 3600 * 1000).toISOString(),
    'botanical_wellness'
  );

  insertMessage.run(
    'MSG-002',
    'P-001',
    'user',
    'Yes, I took it around 8:30 AM with a glass of water and oatmeal.',
    new Date(Date.now() - 3300 * 1000).toISOString(),
    'medication_query'
  );

  insertMessage.run(
    'MSG-003',
    'P-001',
    'assistant',
    'Wonderful! That keeps your cardiac rhythm well supported. Remember you have an upcoming cardiology consultation with Dr. Alistair Chen on October 24 at 11:00 AM. Let me know if you would like me to prepare a summary of your vitals or check any symptoms!',
    new Date(Date.now() - 3000 * 1000).toISOString(),
    'botanical_wellness'
  );

  console.log('CarePortal Botanical Sanctuary database seeded successfully.');
}
