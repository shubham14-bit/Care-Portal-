# CarePortal Backend API (Botanical Sanctuary)

A high-performance REST API backend for the **CarePortal Accessible Health Records App** (`projects/9583792503151836418`), engineered using Node.js, Express, and built-in SQLite (`node:sqlite`).

---

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Start the Server
```bash
npm start
# Server starts at http://localhost:4000
```

### 3. Run Automated Tests
```bash
npm test
# Runs 10 test suites covering all routes and clinical workflows
```

---

## API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | API service details, active patient summary, and route map |
| `GET` | `/api/health` | System health, database connection, and uptime |
| `GET` | `/api/patient` | Active patient profile (**Eleanor Vance**, `MRN-9482-EV77`) with vitals, ICE contacts, and active meds |
| `GET` | `/api/patient/:mrn` | Fetch patient details by MRN |
| `PUT` | `/api/patient/:mrn` | Update patient demographics, address, phone, or conditions |
| `GET` | `/api/patient/:mrn/vitals` | Historical vitals list and statistical averages |
| `POST` | `/api/patient/:mrn/vitals` | Log new vital reading (BP sys/dia, HR, O2, Glucose, Weight) |
| `GET` | `/api/hospitals` | Hospital directory with distance sorting and emergency filter (`?emergency=true`) |
| `GET` | `/api/hospitals/:id` | Hospital details with affiliated doctors |
| `GET` | `/api/doctors` | Specialist directory with search and specialty filter (`?specialty=Cardiology`) |
| `GET` | `/api/doctors/:id` | Doctor bio, credentials, fees, and ratings |
| `GET` | `/api/doctors/:id/availability?date=YYYY-MM-DD` | Dynamic real-time slot availability check |
| `GET` | `/api/appointments` | Patient appointment bookings list |
| `POST` | `/api/appointments` | Book appointment with conflict prevention |
| `PATCH` | `/api/appointments/:id` | Reschedule appointment date/time |
| `DELETE` | `/api/appointments/:id` | Cancel appointment |
| `GET` | `/api/visits` | Clinical EHR records filtered by category (`?category=hospital` or `clinic`) |
| `GET` | `/api/visits/prescriptions/active` | Active patient medications across clinical records |
| `GET` | `/api/visits/reports` | Uploaded diagnostic and lab reports list |
| `POST` | `/api/visits/upload-report` | Multipart file upload for patient lab/diagnostic reports |
| `POST` | `/api/emergency/sos` | Trigger emergency SOS dispatch, notifies nearest hospital & ICE contacts |
| `POST` | `/api/assistant/chat` | **BulbaCare AI Assistant** conversational health triage & medication companion |
| `GET` | `/api/assistant/history` | Assistant chat history |

---

## Preloaded Mock Clinical Data

- **Active Patient**: Eleanor Vance, Age 68, Blood Type O+, MRN: `MRN-9482-EV77`
- **Documented Allergies**: Penicillin (Anaphylactoid), Sulfa Drugs
- **Chronic Conditions**: Hypertension Stage 1 (Controlled), Bilateral Knee Osteoarthritis
- **Active Prescriptions**: Lisinopril 10 mg (daily morning), Atorvastatin 20 mg (bedtime)
- **Hospitals**: Evergreen Botanical Care Center, Saint Jude Memorial Hospital, Cedar Valley Clinic, Metro Central Medical Center
- **Doctors**: Dr. Alistair Chen (Cardiology), Dr. Sarah Jenkins (Geriatrics), Dr. Marcus Brody (Internal Med / Rheumatology), Dr. Emily Watson (Endocrinology), Dr. Arthur Pendelton (Neurology)
