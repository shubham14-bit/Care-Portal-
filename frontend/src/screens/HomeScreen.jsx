import React, { useState, useEffect } from 'react';
import { fetchHospitals, fetchAppointments } from '../api';

export default function HomeScreen({
  patient,
  onOpenReportUpload,
  onOpenLogVitals,
  onNavigateTab,
  onSelectDoctorForBooking
}) {
  const [hospitals, setHospitals] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [emergencyOnly, setEmergencyOnly] = useState(false);

  useEffect(() => {
    loadData();
  }, [emergencyOnly, search]);

  const loadData = async () => {
    try {
      const [hospRes, aptRes] = await Promise.all([
        fetchHospitals({ emergency: emergencyOnly, search }),
        fetchAppointments(patient?.id || 'P-001')
      ]);
      if (hospRes.success) setHospitals(hospRes.hospitals || []);
      if (aptRes.success) setAppointments(aptRes.appointments || []);
    } catch (err) {
      console.error('Error loading home data:', err);
    } finally {
      setLoading(false);
    }
  };

  const nextAppointment = appointments.find(a => a.status === 'CONFIRMED');
  const latestVital = patient?.recent_vitals?.[0];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* 1. Welcoming Hero Banner */}
      <section className="bg-gradient-to-br from-[#EBF7EE] to-[#DDF5E3] rounded-3xl p-5 sm:p-6 border border-[#C2ECCC] shadow-card relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-xl">psychiatry</span>
            <span className="text-xs font-bold text-[#214D38] uppercase tracking-wider">
              Botanical Health Sanctuary
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1D3025]">
            Welcome back, {patient?.first_name || 'Eleanor'}
          </h1>
          <p className="text-xs sm:text-sm text-[#404940] mt-1 max-w-sm">
            Your longitudinal health profile and active records are synchronized with Medicare network.
          </p>

          {/* Quick Vitals Snapshot */}
          {latestVital && (
            <div className="mt-4 pt-3.5 border-t border-[#C2ECCC]/80 flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-semibold">
              <span className="text-[#214D38]">Latest Vitals:</span>
              <span className="px-2.5 py-1 rounded-full bg-white text-[#136A34] shadow-xs border border-[#C2ECCC]">
                BP {latestVital.blood_pressure_sys}/{latestVital.blood_pressure_dia} mmHg
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white text-[#136A34] shadow-xs border border-[#C2ECCC]">
                HR {latestVital.heart_rate} bpm
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white text-[#136A34] shadow-xs border border-[#C2ECCC]">
                O2 {latestVital.oxygen_saturation}%
              </span>
            </div>
          )}
        </div>

        {/* Ambient biophilic watermark */}
        <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-white/40 blur-xl pointer-events-none" />
      </section>

      {/* 2. Upcoming Appointment Alert (If active) */}
      {nextAppointment && (
        <section className="bg-white rounded-2xl p-4 border border-[#DDF5E3] shadow-subtle flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#DDF5E3] text-[#214D38] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-xl">calendar_clock</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-primary uppercase tracking-wide">
                  Upcoming Consultation
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-leaf-green" />
              </div>
              <p className="font-bold text-sm text-[#1D3025]">{nextAppointment.doctor_name}</p>
              <p className="text-xs text-[#68796C]">
                {nextAppointment.date} at {nextAppointment.time_slot} • {nextAppointment.hospital_name}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('calendar')}
            className="text-xs font-bold text-primary hover:underline shrink-0 pt-1"
          >
            Manage
          </button>
        </section>
      )}

      {/* 3. Primary Action Tiles */}
      <section className="space-y-2.5">
        <h2 className="text-xs font-bold text-[#68796C] uppercase tracking-wider px-1">
          Patient Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Action 1: Update Profile */}
          <button
            onClick={() => onNavigateTab('profile')}
            type="button"
            className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#DDF5E3] shadow-card hover:border-primary/50 transition-all text-left group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#DDF5E3] text-[#214D38] flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-2xl">person_outline</span>
              </div>
              <div>
                <p className="font-bold text-sm text-[#1D3025]">Update Profile</p>
                <p className="text-xs text-[#68796C]">Demographics & ICE</p>
              </div>
            </div>
            <span className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary group-hover:translate-x-0.5 transition-transform">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </span>
          </button>

          {/* Action 2: Upload Health Report */}
          <button
            onClick={onOpenReportUpload}
            type="button"
            className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#DDF5E3] shadow-card hover:border-primary/50 transition-all text-left group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#E8F5E9] text-[#1B5E20] flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-2xl">description</span>
              </div>
              <div>
                <p className="font-bold text-sm text-[#1D3025]">Upload Report</p>
                <p className="text-xs text-[#68796C]">Save labs & diagnostics</p>
              </div>
            </div>
            <span className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary group-hover:translate-x-0.5 transition-transform">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </span>
          </button>

          {/* Action 3: Log Daily Vitals */}
          <button
            onClick={onOpenLogVitals}
            type="button"
            className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#DDF5E3] shadow-card hover:border-primary/50 transition-all text-left group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#E0F2F1] text-[#00695C] flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-2xl">vital_signs</span>
              </div>
              <div>
                <p className="font-bold text-sm text-[#1D3025]">Log Vitals</p>
                <p className="text-xs text-[#68796C]">BP, pulse & glucose</p>
              </div>
            </div>
            <span className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary group-hover:translate-x-0.5 transition-transform">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </span>
          </button>
        </div>
      </section>

      {/* 4. Hospitals Directory Section */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <div>
            <h2 className="text-base font-bold text-[#1D3025]">Nearby Care Network</h2>
            <p className="text-xs text-[#68796C]">Verified clinical facilities and emergency rooms</p>
          </div>
          <button
            onClick={() => setEmergencyOnly(!emergencyOnly)}
            type="button"
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              emergencyOnly
                ? 'bg-error text-white shadow-sm'
                : 'bg-white text-[#68796C] border border-[#DDF5E3] hover:text-[#1D3025]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">emergency</span>
            <span>24/7 Emergency Only</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-3 text-[#707A6F] text-lg">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hospitals, trauma centers, services..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#DDF5E3] text-sm text-[#1D3025] placeholder:text-[#94A3B8] shadow-xs focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Hospitals List */}
        {loading ? (
          <div className="py-8 text-center text-xs text-[#68796C]">
            Loading nearby medical facilities...
          </div>
        ) : hospitals.length === 0 ? (
          <div className="py-8 text-center bg-white rounded-2xl border border-[#DDF5E3] p-4 text-xs text-[#68796C]">
            No medical centers match your search criteria.
          </div>
        ) : (
          <div className="space-y-3">
            {hospitals.map((hosp) => (
              <article
                key={hosp.id}
                className="bg-white rounded-2xl p-4 border border-[#DDF5E3] shadow-card hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="px-2 py-0.5 rounded-full bg-[#DDF5E3] text-[#214D38] text-[11px] font-bold">
                        {hosp.distance_miles} mi away
                      </span>
                      {hosp.emergency_ready && (
                        <span className="px-2 py-0.5 rounded-full bg-[#FEF2F2] text-error text-[11px] font-bold flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[12px] fill-1">emergency</span>
                          Emergency 24/7
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-base text-[#1D3025]">{hosp.name}</h3>
                    <p className="text-xs text-[#68796C] mt-0.5">{hosp.address}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-[#1D3025] bg-[#F7FBF3] px-2 py-1 rounded-lg border border-[#DDF5E3]">
                    <span className="text-amber-500">★</span>
                    <span>{hosp.rating}</span>
                    <span className="text-[10px] text-[#68796C]">({hosp.review_count})</span>
                  </div>
                </div>

                {/* Service Tags */}
                <div className="flex flex-wrap gap-1.5 my-3">
                  {hosp.services?.slice(0, 3).map((service, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#F1F5ED] text-[#214D38]"
                    >
                      {service}
                    </span>
                  ))}
                  {hosp.services?.length > 3 && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#F1F5ED] text-[#68796C]">
                      +{hosp.services.length - 3} more
                    </span>
                  )}
                </div>

                {/* Dual Action Buttons */}
                <div className="flex items-center gap-2 pt-1 border-t border-[#F1F5ED]">
                  <a
                    href={`tel:${hosp.phone}`}
                    className="flex-1 py-2.5 rounded-xl bg-surface-container text-[#214D38] text-xs font-bold hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1.5 text-center"
                  >
                    <span className="material-symbols-outlined text-base">call</span>
                    <span>Call Facility</span>
                  </a>
                  <button
                    onClick={() => onNavigateTab('calendar')}
                    type="button"
                    className="flex-1 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container shadow-sm transition-colors flex items-center justify-center gap-1.5 text-center"
                  >
                    <span className="material-symbols-outlined text-base">calendar_month</span>
                    <span>Book Specialist</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
