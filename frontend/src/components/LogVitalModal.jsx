import React, { useState } from 'react';
import { logVital } from '../api';

export default function LogVitalModal({ isOpen, onClose, onLogged, mrn = 'MRN-9482-EV77' }) {
  const [sys, setSys] = useState('124');
  const [dia, setDia] = useState('78');
  const [hr, setHr] = useState('72');
  const [glucose, setGlucose] = useState('98');
  const [o2, setO2] = useState('98');
  const [weight, setWeight] = useState('148.5');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  if (!isOpen) return null;

  // Live status feedback
  const getStatus = () => {
    const s = Number(sys);
    const d = Number(dia);
    if (!s || !d) return 'Enter Readings';
    if (s >= 140 || d >= 90) return 'Stage 2 Hypertension Alert';
    if (s >= 130 || d >= 80) return 'Mild Elevation';
    if (s < 90 || d < 60) return 'Low BP Warning';
    return 'Optimal Range';
  };

  const status = getStatus();
  const isOptimal = status === 'Optimal Range';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await logVital(mrn, {
        blood_pressure_sys: Number(sys),
        blood_pressure_dia: Number(dia),
        heart_rate: Number(hr),
        blood_glucose: glucose ? Number(glucose) : null,
        oxygen_saturation: Number(o2),
        weight_lbs: weight ? Number(weight) : null,
        notes
      });

      if (res.success) {
        setSuccess('Vital readings recorded successfully!');
        setTimeout(() => {
          onLogged && onLogged(res.vital);
          onClose();
        }, 1200);
      } else {
        setError(res.error || 'Failed to log vitals');
      }
    } catch (err) {
      setError(err.message || 'Error communicating with vitals service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#DDF5E3] relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-[#DDF5E3] text-[#214D38] flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">vital_signs</span>
          </div>
          <div>
            <h3 className="font-bold text-base text-[#1D3025]">Record Daily Vitals</h3>
            <p className="text-xs text-[#68796C]">Log readings to monitor cardiac stability</p>
          </div>
        </div>

        {/* Live Status Pill */}
        <div
          className={`p-3 rounded-2xl mb-4 border flex items-center justify-between text-xs font-bold ${
            isOptimal
              ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]'
              : 'bg-[#FFFBEB] border-[#FDE68A] text-[#B45309]'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">
              {isOptimal ? 'check_circle' : 'info'}
            </span>
            Clinical Assessment:
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-white shadow-xs">
            {status}
          </span>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-error-container text-on-error-container text-xs font-semibold">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 mb-4 rounded-xl bg-[#DCFCE7] text-[#15803D] text-xs font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-base">check_circle</span>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Blood Pressure Row */}
          <div>
            <label className="block text-xs font-bold text-[#1D3025] mb-1 uppercase tracking-wider">
              Blood Pressure (Systolic / Diastolic mmHg)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <input
                  type="number"
                  value={sys}
                  onChange={(e) => setSys(e.target.value)}
                  placeholder="120"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDF5E3] bg-[#F7FBF3] text-sm text-[#1D3025] font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs text-[#68796C]">SYS</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={dia}
                  onChange={(e) => setDia(e.target.value)}
                  placeholder="80"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDF5E3] bg-[#F7FBF3] text-sm text-[#1D3025] font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs text-[#68796C]">DIA</span>
              </div>
            </div>
          </div>

          {/* Heart Rate & Oxygen Saturation */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-[#1D3025] mb-1 uppercase tracking-wider">
                Heart Rate (BPM)
              </label>
              <input
                type="number"
                value={hr}
                onChange={(e) => setHr(e.target.value)}
                placeholder="72"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDF5E3] bg-white text-sm text-[#1D3025] font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1D3025] mb-1 uppercase tracking-wider">
                Oxygen (SpO2 %)
              </label>
              <input
                type="number"
                value={o2}
                onChange={(e) => setO2(e.target.value)}
                placeholder="98"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDF5E3] bg-white text-sm text-[#1D3025] font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          {/* Blood Glucose & Weight */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-[#1D3025] mb-1 uppercase tracking-wider">
                Glucose (mg/dL)
              </label>
              <input
                type="number"
                value={glucose}
                onChange={(e) => setGlucose(e.target.value)}
                placeholder="96"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDF5E3] bg-white text-sm text-[#1D3025] font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1D3025] mb-1 uppercase tracking-wider">
                Weight (lbs)
              </label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="148.5"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDF5E3] bg-white text-sm text-[#1D3025] font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-[#1D3025] mb-1 uppercase tracking-wider">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Post-breakfast reading, after 20min walk..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDF5E3] bg-white text-sm text-[#1D3025] focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-container shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving Vitals...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">save</span>
                <span>Save Vital Reading</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
