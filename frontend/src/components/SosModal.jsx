import React, { useState, useEffect } from 'react';
import { triggerSos } from '../api';

export default function SosModal({ isOpen, onClose, patient }) {
  const [loading, setLoading] = useState(false);
  const [sosResult, setSosResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && !sosResult) {
      handleTrigger();
    }
    if (!isOpen) {
      setSosResult(null);
      setError(null);
    }
  }, [isOpen]);

  const handleTrigger = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await triggerSos({
        patient_id: patient?.id || 'P-001',
        trigger_source: 'Web App SOS Button'
      });
      if (res.success) {
        setSosResult(res.alert);
      } else {
        setError(res.error || 'Failed to dispatch SOS alert');
      }
    } catch (err) {
      setError(err.message || 'Network error triggering SOS');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-error relative overflow-hidden">
        {/* Urgent Pulsing Top Banner */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-error text-white flex items-center justify-center shadow-md animate-pulse">
            <span className="material-symbols-outlined text-3xl fill-1">emergency</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-error">EMERGENCY SOS DISPATCH</h2>
            <p className="text-xs text-on-surface-variant font-medium">
              Medical assistance protocol activated
            </p>
          </div>
        </div>

        {loading && (
          <div className="py-8 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-error border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-on-surface">
              Contacting nearest emergency center...
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-error-container text-on-error-container text-xs font-semibold">
            {error}
          </div>
        )}

        {sosResult && (
          <div className="space-y-4 text-sm">
            {/* Dispatched Hospital Banner */}
            <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-[#166534] uppercase tracking-wider">
                  Dispatched Emergency Facility
                </span>
                <span className="text-xs font-bold text-[#166534] bg-white px-2 py-0.5 rounded-full border border-[#BBF7D0]">
                  {sosResult.dispatched_facility?.distance_miles} miles away
                </span>
              </div>
              <p className="font-bold text-[#14532D] text-base">
                {sosResult.dispatched_facility?.name}
              </p>
              <p className="text-xs text-[#166534] mt-0.5">
                {sosResult.dispatched_facility?.address}
              </p>
              <a
                href={`tel:${sosResult.dispatched_facility?.phone}`}
                className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#166534] text-white text-xs font-bold hover:bg-[#14532D] transition-colors"
              >
                <span className="material-symbols-outlined text-sm">call</span>
                Direct Call: {sosResult.dispatched_facility?.phone}
              </a>
            </div>

            {/* Critical Patient Medical Summary for EMTs */}
            <div className="p-3.5 rounded-2xl bg-[#FEF2F2] border border-[#FECACA]">
              <p className="text-xs font-bold text-error uppercase tracking-wider mb-1">
                Critical Safety Warning for Responders
              </p>
              <p className="text-xs text-[#991B1B]">
                <strong>Patient:</strong> {sosResult.patient?.name} ({sosResult.patient?.mrn}) | <strong>Blood Type:</strong> {sosResult.patient?.blood_type}
              </p>
              <p className="text-xs text-[#991B1B] mt-1 font-semibold">
                ⚠️ Severe Allergies: {sosResult.patient?.critical_allergies?.join(', ')}
              </p>
            </div>

            {/* Emergency Contacts Alerted */}
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                Alerted Emergency Contacts (ICE)
              </p>
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {sosResult.notified_emergency_contacts?.map((contact, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-xl bg-surface-container-low border border-surface-container"
                  >
                    <div>
                      <p className="font-semibold text-xs text-on-surface">{contact.name}</p>
                      <p className="text-[11px] text-on-surface-variant">{contact.relationship}</p>
                    </div>
                    <a
                      href={`tel:${contact.phone}`}
                      className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                    >
                      <span className="material-symbols-outlined text-base">call</span>
                      {contact.phone}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="mt-5 flex items-center gap-2">
          <button
            onClick={onClose}
            type="button"
            className="flex-1 py-3 rounded-xl bg-surface-container text-on-surface font-bold text-sm hover:bg-surface-container-high transition-colors text-center"
          >
            Close Emergency Panel
          </button>
          <a
            href="tel:911"
            className="flex-1 py-3 rounded-xl bg-error text-white font-bold text-sm hover:bg-[#93000A] transition-colors text-center flex items-center justify-center gap-1 shadow-md"
          >
            <span className="material-symbols-outlined text-base">call</span>
            Call 911
          </a>
        </div>
      </div>
    </div>
  );
}
