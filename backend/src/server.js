import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Import route modules
import patientRoutes from './routes/patient.js';
import hospitalsRoutes from './routes/hospitals.js';
import doctorsRoutes from './routes/doctors.js';
import appointmentsRoutes from './routes/appointments.js';
import visitsRoutes from './routes/visits.js';
import emergencyRoutes from './routes/emergency.js';
import assistantRoutes from './routes/assistant.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS for all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Root Info & API Documentation Endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'CarePortal Backend API',
    status: 'ONLINE',
    version: '1.0.0',
    design_system: 'Botanical Sanctuary (CarePortal)',
    project_resource: 'projects/9583792503151836418',
    active_patient: 'Eleanor Vance (MRN-9482-EV77)',
    endpoints: {
      health: 'GET /api/health',
      patient: {
        profile: 'GET /api/patient',
        by_mrn: 'GET /api/patient/:mrn',
        update: 'PUT /api/patient/:mrn',
        vitals: 'GET /api/patient/:mrn/vitals',
        log_vital: 'POST /api/patient/:mrn/vitals',
        emergency_contacts: 'GET /api/patient/:mrn/emergency-contacts'
      },
      hospitals: {
        list: 'GET /api/hospitals',
        by_id: 'GET /api/hospitals/:id'
      },
      doctors: {
        list: 'GET /api/doctors',
        by_id: 'GET /api/doctors/:id',
        availability: 'GET /api/doctors/:id/availability?date=YYYY-MM-DD'
      },
      appointments: {
        list: 'GET /api/appointments?patient_id=P-001',
        book: 'POST /api/appointments',
        by_id: 'GET /api/appointments/:id',
        reschedule: 'PATCH /api/appointments/:id',
        cancel: 'DELETE /api/appointments/:id'
      },
      clinical_visits: {
        list: 'GET /api/visits?category=all|hospital|clinic',
        by_id: 'GET /api/visits/:id',
        active_medications: 'GET /api/visits/prescriptions/active',
        reports: 'GET /api/visits/reports',
        upload_report: 'POST /api/visits/upload-report'
      },
      emergency: {
        sos_trigger: 'POST /api/emergency/sos',
        sos_history: 'GET /api/emergency/history'
      },
      assistant: {
        chat: 'POST /api/assistant/chat',
        history: 'GET /api/assistant/history',
        clear_history: 'DELETE /api/assistant/history'
      }
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: 'SQLite (node:sqlite DatabaseSync connected)',
    uptime_seconds: process.uptime()
  });
});

// Mount modular API routers
app.use('/api/patient', patientRoutes);
app.use('/api/hospitals', hospitalsRoutes);
app.use('/api/doctors', doctorsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/visits', visitsRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/assistant', assistantRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    requested_url: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start listening only if executed directly (not when imported in tests)
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` CarePortal Botanical Sanctuary Backend Online`);
    console.log(` Server Port: http://localhost:${PORT}`);
    console.log(` Health Check: http://localhost:${PORT}/api/health`);
    console.log(` Active Patient: Eleanor Vance (MRN-9482-EV77)`);
    console.log(`====================================================`);
  });
}

export default app;
