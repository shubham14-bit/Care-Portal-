import React, { useState, useEffect } from 'react';
import { fetchDoctorAvailability, bookAppointment } from '../api';

export default function BookingModal({ doctor, isOpen, onClose, onBooked }) {
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('Routine Health Consultation');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    if (doctor && isOpen) {
      loadSlots(doctor.id, selectedDate);
    }
  }, [doctor, selectedDate, isOpen]);

  const loadSlots = async (docId, date) => {
    setLoadingSlots(true);
    setError(null);
    setSelectedSlot('');
    try {
      const res = await fetchDoctorAvailability(docId, date);
      if (res.success) {
        setSlots(res.slots || []);
        // Pre-select first available slot
        const firstAvail = res.slots.find(s => s.is_available);
        if (firstAvail) setSelectedSlot(firstAvail.slot);
      }
    } catch (err) {
      setError('Could not load availability for selected date.');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setError('Please select an available appointment time slot.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await bookAppointment({
        patient_id: 'P-001',
        doctor_id: doctor.id,
        date: selectedDate,
        time_slot: selectedSlot,
        reason
      });

      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          onBooked && onBooked(res.appointment);
          onClose();
        }, 1500);
      } else {
        setError(res.error || 'Failed to book appointment.');
      }
    } catch (err) {
      setError(err.message || 'Error communicating with booking service.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !doctor) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#DDF5E3] relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

        {/* Doctor Header */}
        <div className="flex items-center gap-3.5 mb-5 pr-8">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0"
            style={{ backgroundColor: doctor.avatar_color || '#3F8F55' }}
          >
            {doctor.name.replace('Dr. ', '').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-base text-[#1D3025]">{doctor.name}</h3>
            <p className="text-xs text-primary font-semibold">{doctor.specialty}</p>
            <p className="text-xs text-[#68796C]">{doctor.hospital_name}</p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-error-container text-on-error-container text-xs font-semibold">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 mb-4 rounded-xl bg-[#DCFCE7] text-[#15803D] text-xs font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-base">check_circle</span>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleBooking} className="space-y-4">
          {/* Date Selector */}
          <div>
            <label className="block text-xs font-bold text-[#1D3025] mb-1.5 uppercase tracking-wider">
              Consultation Date
            </label>
            <input
              type="date"
              value={selectedDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDF5E3] bg-[#F7FBF3] text-sm text-[#1D3025] font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {/* Time Slot Selection */}
          <div>
            <label className="block text-xs font-bold text-[#1D3025] mb-1.5 uppercase tracking-wider">
              Available Time Slots
            </label>
            {loadingSlots ? (
              <div className="py-4 text-center text-xs text-on-surface-variant font-medium">
                Checking schedule availability...
              </div>
            ) : slots.length === 0 ? (
              <p className="text-xs text-[#68796C] italic p-2 rounded-lg bg-surface-container-low">
                No standard slots for this day. Try another date.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {slots.map((s) => (
                  <button
                    key={s.slot}
                    type="button"
                    disabled={!s.is_available}
                    onClick={() => setSelectedSlot(s.slot)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between border ${
                      !s.is_available
                        ? 'opacity-40 bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                        : selectedSlot === s.slot
                        ? 'bg-primary text-white border-primary shadow-sm ring-2 ring-primary/30'
                        : 'bg-white text-[#214D38] border-[#DDF5E3] hover:bg-[#F1F5ED]'
                    }`}
                  >
                    <span>{s.slot}</span>
                    {s.is_available && selectedSlot === s.slot && (
                      <span className="material-symbols-outlined text-sm">check</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-xs font-bold text-[#1D3025] mb-1.5 uppercase tracking-wider">
              Reason for Visit
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Blood pressure review, knee checkup..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDF5E3] bg-white text-sm text-[#1D3025] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Fee & Insurance Note */}
          <div className="p-3 rounded-xl bg-[#F7FBF3] border border-[#DDF5E3] flex items-center justify-between text-xs">
            <span className="text-[#68796C]">Consultation Fee:</span>
            <span className="font-bold text-[#214D38]">
              ${doctor.consultation_fee} (Medicare Accepted)
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !selectedSlot}
            className="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-container shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Confirming Appointment...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">calendar_add_on</span>
                <span>Confirm Appointment</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
