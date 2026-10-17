import React, { useState, useEffect } from 'react';
import { fetchPatient } from './api';

// Components
import Header from './components/Header';
import BottomDock from './components/BottomDock';
import SosModal from './components/SosModal';
import BookingModal from './components/BookingModal';
import ReportUploadModal from './components/ReportUploadModal';
import LogVitalModal from './components/LogVitalModal';

// Screens
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import VisitsScreen from './screens/VisitsScreen';
import DoctorsScreen from './screens/DoctorsScreen';
import AssistantScreen from './screens/AssistantScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [isReportUploadOpen, setIsReportUploadOpen] = useState(false);
  const [isLogVitalOpen, setIsLogVitalOpen] = useState(false);

  useEffect(() => {
    loadPatientData();
  }, []);

  const loadPatientData = async () => {
    try {
      const res = await fetchPatient();
      if (res.success) {
        setPatient(res.patient);
      }
    } catch (err) {
      console.error('Failed to load patient profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDoctorForBooking = (doctor) => {
    setBookingDoctor(doctor);
  };

  return (
    <div className="min-h-screen bg-[#F4F8F0] text-[#1D3025] flex flex-col relative selection:bg-secondary-container selection:text-secondary overflow-x-hidden">
      {/* Decorative Biophilic Ambient Glows from Stitch design */}
      <div className="fixed top-0 right-0 w-80 h-80 bg-gradient-to-br from-emerald-200/30 via-teal-100/15 to-transparent rounded-full blur-3xl pointer-events-none -z-10 translate-x-1/3 -translate-y-1/3" />
      <div className="fixed top-1/2 left-0 w-96 h-96 bg-gradient-to-tr from-green-200/20 via-emerald-100/15 to-transparent rounded-full blur-3xl pointer-events-none -z-10 -translate-x-1/2" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-emerald-300/15 via-teal-200/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10 translate-x-1/4" />

      {/* Main Container: Centered iOS Viewport Frame with Responsive Tablet/Desktop Scaling */}
      <div className="w-full max-w-[440px] md:max-w-xl lg:max-w-2xl mx-auto min-h-screen flex flex-col bg-[#F4F8F0] md:shadow-2xl md:border-x md:border-[#DDF5E3] relative">
        {/* Sticky Top Header */}
        <Header
          onTriggerSos={() => setIsSosOpen(true)}
          mrn={patient?.mrn || 'MRN-9482-EV77'}
        />

        {/* Main Content Area */}
        <main className="flex-1 px-4 sm:px-6 py-4 pb-safe-dock">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-semibold text-[#68796C]">
                Loading CarePortal Botanical Sanctuary...
              </p>
            </div>
          ) : (
            <>
              {activeTab === 'home' && (
                <HomeScreen
                  patient={patient}
                  onOpenReportUpload={() => setIsReportUploadOpen(true)}
                  onOpenLogVitals={() => setIsLogVitalOpen(true)}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onSelectDoctorForBooking={handleSelectDoctorForBooking}
                />
              )}

              {activeTab === 'history' && (
                <VisitsScreen
                  patient={patient}
                  onOpenReportUpload={() => setIsReportUploadOpen(true)}
                />
              )}

              {activeTab === 'calendar' && (
                <DoctorsScreen
                  patient={patient}
                  onSelectDoctorForBooking={handleSelectDoctorForBooking}
                />
              )}

              {activeTab === 'profile' && (
                <ProfileScreen
                  patient={patient}
                  onOpenLogVitals={() => setIsLogVitalOpen(true)}
                  onPatientUpdated={(updated) => setPatient(prev => ({ ...prev, ...updated }))}
                />
              )}

              {activeTab === 'assistant' && (
                <AssistantScreen
                  patient={patient}
                  onTriggerSos={() => setIsSosOpen(true)}
                />
              )}
            </>
          )}
        </main>

        {/* Persistent Floating Bottom Dock */}
        <BottomDock
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
        />
      </div>

      {/* Global Modals */}
      <SosModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
        patient={patient}
      />

      <BookingModal
        doctor={bookingDoctor}
        isOpen={Boolean(bookingDoctor)}
        onClose={() => setBookingDoctor(null)}
        onBooked={() => {
          loadPatientData();
        }}
      />

      <ReportUploadModal
        isOpen={isReportUploadOpen}
        onClose={() => setIsReportUploadOpen(false)}
        onUploaded={() => {
          loadPatientData();
        }}
      />

      <LogVitalModal
        isOpen={isLogVitalOpen}
        onClose={() => setIsLogVitalOpen(false)}
        onLogged={() => {
          loadPatientData();
        }}
        mrn={patient?.mrn || 'MRN-9482-EV77'}
      />
    </div>
  );
}
