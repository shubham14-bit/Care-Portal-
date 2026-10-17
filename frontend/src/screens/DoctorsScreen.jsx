import React, { useState, useEffect } from 'react';
import { fetchDoctors, fetchAppointments, cancelAppointment } from '../api';

export default function DoctorsScreen({ patient, onSelectDoctorForBooking }) {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [activeSpecialty, setActiveSpecialty] = useState('All');
  const [search, setSearch] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState(null);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    loadDoctors();
  }, [activeSpecialty, search]);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const res = await fetchDoctors({ specialty: activeSpecialty, search });
      if (res.success) {
        setDoctors(res.doctors || []);
        if (res.specialties) {
          setSpecialties(['All', ...res.specialties]);
        }
      }
    } catch (err) {
      console.error('Error loading doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async () => {
    try {
      const res = await fetchAppointments(patient?.id || 'P-001');
      if (res.success) setAppointments(res.appointments || []);
    } catch (err) {
      console.error('Error loading appointments:', err);
    }
  };

  const handleCancel = async (aptId) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled consultation?')) {
      return;
    }
    setCancelingId(aptId);
    setActionMsg('');
    try {
      const res = await cancelAppointment(aptId);
      if (res.success) {
        setActionMsg(res.message);
        loadAppointments();
      }
    } catch (err) {
      setActionMsg('Failed to cancel appointment.');
    } finally {
      setCancelingId(null);
    }
  };

  const upcoming = appointments.filter(a => a.status === 'CONFIRMED');

  return (
    <div className="space-y-4 animate-fade-in">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-3xl p-5 border border-[#DDF5E3] shadow-card">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">medical_services</span>
            <h1 className="text-lg font-bold text-[#1D3025]">Find & Book Doctors</h1>
          </div>
          <span className="text-xs font-bold text-[#15803D] bg-[#DCFCE7] px-2.5 py-0.5 rounded-full">
            Medicare In-Network
          </span>
        </div>
        <p className="text-xs text-[#68796C]">
          Schedule appointments with board-certified geriatric and cardiac specialists.
        </p>

        {/* Search Bar */}
        <div className="relative mt-3">
          <span className="material-symbols-outlined absolute left-3.5 top-3 text-[#707A6F] text-lg">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search doctor name, specialty, condition..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F7FBF3] border border-[#DDF5E3] text-xs sm:text-sm text-[#1D3025] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-primary font-medium"
          />
        </div>
      </div>

      {actionMsg && (
        <div className="p-3 rounded-2xl bg-[#DCFCE7] text-[#15803D] text-xs font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-base">check_circle</span>
          {actionMsg}
        </div>
      )}

      {/* 2. My Confirmed Appointments (If any) */}
      {upcoming.length > 0 && (
        <section className="bg-white rounded-3xl p-4 border border-[#DDF5E3] shadow-card space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold text-[#214D38] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-leaf-green" />
              My Upcoming Consultations ({upcoming.length})
            </h2>
          </div>

          <div className="space-y-2">
            {upcoming.map((apt) => (
              <div
                key={apt.id}
                className="p-3.5 rounded-2xl bg-[#F7FBF3] border border-[#DDF5E3] flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-primary bg-[#DDF5E3] px-2 py-0.5 rounded-full">
                      {apt.date} at {apt.time_slot}
                    </span>
                    <span className="text-[11px] font-bold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded-full">
                      Confirmed
                    </span>
                  </div>
                  <p className="font-bold text-sm text-[#1D3025] mt-1">{apt.doctor_name}</p>
                  <p className="text-xs text-[#68796C]">
                    {apt.specialty} • {apt.hospital_name}
                  </p>
                  <p className="text-[11px] text-[#404940] mt-0.5 italic">"{apt.reason}"</p>
                </div>

                <button
                  onClick={() => handleCancel(apt.id)}
                  disabled={cancelingId === apt.id}
                  type="button"
                  className="px-3 py-1.5 rounded-xl border border-error/30 text-error text-xs font-bold hover:bg-error hover:text-white transition-colors shrink-0 disabled:opacity-50"
                >
                  {cancelingId === apt.id ? 'Canceling...' : 'Cancel'}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Specialty Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {specialties.map((spec) => (
          <button
            key={spec}
            onClick={() => setActiveSpecialty(spec)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full font-semibold text-xs transition-colors ${
              activeSpecialty === spec
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white text-[#68796C] border border-[#DDF5E3] hover:text-[#1D3025]'
            }`}
          >
            {spec}
          </button>
        ))}
      </div>

      {/* 4. Doctors List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-[#68796C]">
          Locating specialized in-network physicians...
        </div>
      ) : doctors.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-2xl border border-[#DDF5E3] p-4 text-xs text-[#68796C]">
          No physicians found matching your search.
        </div>
      ) : (
        <div className="space-y-3.5">
          {doctors.map((doc) => (
            <article
              key={doc.id}
              className="bg-white rounded-3xl p-5 border border-[#DDF5E3] shadow-card hover:shadow-md transition-shadow"
            >
              {/* Header Profile Row */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start space-x-3.5">
                  <div
                    className="w-13 h-13 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0"
                    style={{ backgroundColor: doc.avatar_color || '#3F8F55', width: '52px', height: '52px' }}
                  >
                    {doc.name.replace('Dr. ', '').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-bold text-base text-[#1D3025]">{doc.name}</h2>
                    <p className="text-xs text-primary font-bold">{doc.specialty}</p>
                    <p className="text-xs text-[#68796C] mt-0.5">{doc.hospital_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-[#1D3025] bg-[#F7FBF3] px-2.5 py-1 rounded-xl border border-[#DDF5E3] shrink-0">
                  <span className="text-amber-500">★</span>
                  <span>{doc.rating}</span>
                  <span className="text-[10px] text-[#68796C]">({doc.review_count})</span>
                </div>
              </div>

              {/* Bio */}
              <p className="text-xs text-[#404940] leading-relaxed mb-3 bg-[#F7FBF3] p-3 rounded-2xl border border-[#DDF5E3]/80">
                {doc.bio}
              </p>

              {/* Metadata Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1 border-t border-[#F1F5ED] mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[#68796C]">Experience:</span>
                  <span className="font-bold text-[#1D3025]">{doc.experience_years} Years</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#68796C]">Standard Fee:</span>
                  <span className="font-bold text-primary">${doc.consultation_fee}</span>
                  <span className="text-[10px] text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded-full font-bold">
                    Medicare 100%
                  </span>
                </div>
              </div>

              {/* Booking Trigger */}
              <button
                onClick={() => onSelectDoctorForBooking(doc)}
                type="button"
                className="w-full py-3 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">calendar_month</span>
                <span>Select Date & Book Consultation</span>
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
