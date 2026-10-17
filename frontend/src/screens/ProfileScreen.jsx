import React, { useState } from 'react';
import { updatePatient } from '../api';

export default function ProfileScreen({ patient, onOpenLogVitals, onPatientUpdated }) {
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState(patient?.phone || '');
  const [email, setEmail] = useState(patient?.email || '');
  const [address, setAddress] = useState(patient?.address || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const res = await updatePatient(patient.mrn, { phone, email, address });
      if (res.success) {
        setMsg('Profile updated successfully!');
        onPatientUpdated && onPatientUpdated(res.patient);
        setEditing(false);
      }
    } catch (err) {
      setMsg('Error saving profile changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* 1. Patient Identity Ribbon */}
      <section className="bg-white rounded-3xl p-5 border border-[#DDF5E3] shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3.5">
            {/* Avatar with Botanical Gradient Ring */}
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#136A34] via-[#214D38] to-[#45B7A0] flex items-center justify-center text-white font-bold text-xl shadow-md ring-4 ring-white">
                {patient?.avatar_initials || 'EV'}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#78C850] rounded-full border-2 border-white flex items-center justify-center">
                <span className="w-1 h-1 bg-white rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-[#1D3025]">
                  {patient?.first_name} {patient?.last_name}
                </h1>
                <span className="text-[10px] font-bold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded-full">
                  Verified EHR
                </span>
              </div>
              <p className="text-xs font-mono text-[#68796C] mt-0.5">
                {patient?.mrn} • DOB: {patient?.dob} (Age 68)
              </p>
              <p className="text-xs text-[#214D38] font-medium mt-1">
                Blood Type: <strong className="font-bold text-base text-primary">{patient?.blood_type}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => setEditing(!editing)}
            type="button"
            className="text-xs font-bold text-primary hover:bg-[#F1F5ED] px-3 py-1.5 rounded-xl border border-[#DDF5E3] transition-colors"
          >
            {editing ? 'Cancel' : 'Edit Contact'}
          </button>
        </div>

        {msg && (
          <div className="mt-3 p-2.5 rounded-xl bg-[#DCFCE7] text-[#15803D] text-xs font-bold">
            {msg}
          </div>
        )}

        {/* Edit Demographics Form */}
        {editing && (
          <form onSubmit={handleSave} className="mt-4 pt-4 border-t border-[#DDF5E3] space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-[#1D3025] uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#DDF5E3] text-xs text-[#1D3025] font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#1D3025] uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#DDF5E3] text-xs text-[#1D3025] font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#1D3025] uppercase tracking-wider mb-1">
                Residential Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#DDF5E3] text-xs text-[#1D3025] font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container transition-all"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}
      </section>

      {/* 2. Critical Safety: Allergies & Chronic Conditions */}
      <section className="bg-white rounded-3xl p-5 border border-[#DDF5E3] shadow-card space-y-4">
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="material-symbols-outlined text-error text-lg fill-1">warning</span>
            <h2 className="text-xs font-bold text-error uppercase tracking-wider">
              Documented Medical Allergies
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {patient?.allergies?.map((allergy, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-error font-bold text-xs"
              >
                ⚠️ {allergy}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-[#F1F5ED]">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="material-symbols-outlined text-primary text-lg">medical_information</span>
            <h2 className="text-xs font-bold text-[#214D38] uppercase tracking-wider">
              Chronic Clinical Diagnoses
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {patient?.chronic_conditions?.map((cond, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] font-semibold text-xs"
              >
                🌿 {cond}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Insurance & Medicare Policy Details */}
      <section className="bg-white rounded-3xl p-5 border border-[#DDF5E3] shadow-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">verified</span>
            <h2 className="text-xs font-bold text-[#214D38] uppercase tracking-wider">
              Insurance & Coverage
            </h2>
          </div>
          <span className="text-[11px] font-bold text-primary bg-[#DDF5E3] px-2.5 py-0.5 rounded-full">
            Medicare Active
          </span>
        </div>
        <p className="font-bold text-sm text-[#1D3025]">{patient?.insurance_provider}</p>
        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[#F1F5ED] text-xs">
          <div>
            <span className="text-[#68796C]">Policy ID:</span>
            <p className="font-mono font-semibold text-[#1D3025]">{patient?.insurance_policy_number}</p>
          </div>
          <div>
            <span className="text-[#68796C]">Group Code:</span>
            <p className="font-mono font-semibold text-[#1D3025]">{patient?.insurance_group}</p>
          </div>
        </div>
        <p className="text-[11px] text-[#15803D] bg-[#F0FDF4] px-2.5 py-1.5 rounded-xl mt-3 font-medium">
          ✓ Verified Medicare Part A (Hospital) & Part B (Medical) coverage active.
        </p>
      </section>

      {/* 4. Emergency Contacts (In Case of Emergency - ICE) */}
      <section className="bg-white rounded-3xl p-5 border border-[#DDF5E3] shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-error text-lg">contact_emergency</span>
            <h2 className="text-xs font-bold text-[#214D38] uppercase tracking-wider">
              Emergency Contacts (ICE)
            </h2>
          </div>
          <span className="text-[11px] text-[#68796C]">Notified on SOS</span>
        </div>

        <div className="space-y-2">
          {patient?.emergency_contacts?.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-[#F7FBF3] border border-[#DDF5E3]"
            >
              <div>
                <p className="font-bold text-xs text-[#1D3025] flex items-center gap-1.5">
                  {contact.name}
                  {contact.is_primary === 1 && (
                    <span className="text-[9px] font-bold text-[#15803D] bg-[#DCFCE7] px-1.5 py-0.5 rounded-md">
                      PRIMARY
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-[#68796C]">{contact.relationship}</p>
              </div>
              <a
                href={`tel:${contact.phone}`}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#DDF5E3] text-primary text-xs font-bold hover:bg-primary hover:text-white transition-colors flex items-center gap-1 shadow-2xs"
              >
                <span className="material-symbols-outlined text-sm">call</span>
                Call
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Vitals Log Button */}
      <section className="pt-1">
        <button
          onClick={onOpenLogVitals}
          type="button"
          className="w-full py-3.5 rounded-2xl bg-primary text-white font-bold text-sm hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          <span>Record New Vital Signs Reading</span>
        </button>
      </section>
    </div>
  );
}
