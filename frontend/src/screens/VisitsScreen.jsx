import React, { useState, useEffect } from 'react';
import { fetchVisits, fetchHealthReports } from '../api';

export default function VisitsScreen({ patient, onOpenReportUpload }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [visits, setVisits] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedVisitId, setExpandedVisitId] = useState(null);
  const [activeTab, setActiveTab] = useState('records'); // 'records' | 'reports'

  useEffect(() => {
    loadVisits();
  }, [activeCategory, search]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadVisits = async () => {
    try {
      setLoading(true);
      const res = await fetchVisits(activeCategory, search);
      if (res.success) setVisits(res.visits || []);
    } catch (err) {
      console.error('Error loading visits:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      const res = await fetchHealthReports(patient?.id || 'P-001');
      if (res.success) setReports(res.reports || []);
    } catch (err) {
      console.error('Error loading reports:', err);
    }
  };

  const filterCategories = [
    { id: 'all', label: 'All Visits' },
    { id: 'hospital', label: 'Hospital Admissions' },
    { id: 'clinic', label: 'Clinic Consultations' },
  ];

  const toggleExpand = (id) => {
    setExpandedVisitId(expandedVisitId === id ? null : id);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* 1. Header with Tab Switcher */}
      <div className="bg-white rounded-3xl p-4 border border-[#DDF5E3] shadow-card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-bold text-[#1D3025]">Clinical History & EHR</h1>
            <p className="text-xs text-[#68796C]">Verified electronic medical consultations</p>
          </div>
          <button
            onClick={onOpenReportUpload}
            type="button"
            className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container shadow-xs flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">upload_file</span>
            <span>Upload</span>
          </button>
        </div>

        {/* Records vs Vault Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#F1F5ED]">
          <button
            onClick={() => setActiveTab('records')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all text-center ${
              activeTab === 'records'
                ? 'bg-white text-primary shadow-xs'
                : 'text-[#68796C] hover:text-[#1D3025]'
            }`}
          >
            Clinical Visits ({visits.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all text-center ${
              activeTab === 'reports'
                ? 'bg-white text-primary shadow-xs'
                : 'text-[#68796C] hover:text-[#1D3025]'
            }`}
          >
            Diagnostic Vault ({reports.length})
          </button>
        </div>
      </div>

      {activeTab === 'records' ? (
        <>
          {/* 2. Search & Scrollable Category Filter Pills */}
          <div className="space-y-2.5">
            {/* Search Input */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-3 text-[#707A6F] text-lg">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search diagnosis, doctor, facility, ICD-10..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#DDF5E3] text-xs sm:text-sm text-[#1D3025] placeholder:text-[#94A3B8] shadow-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Filter Pills matching Stitch design */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {filterCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full font-semibold text-xs transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-surface-container-low text-[#68796C] hover:bg-surface-container'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Visits List */}
          {loading ? (
            <div className="py-10 text-center text-xs text-[#68796C]">
              Synchronizing verified medical records...
            </div>
          ) : visits.length === 0 ? (
            <div className="py-10 text-center bg-white rounded-2xl border border-[#DDF5E3] p-4 text-xs text-[#68796C]">
              No clinical records match your search or filter.
            </div>
          ) : (
            <div className="space-y-3">
              {visits.map((v) => {
                const isExpanded = expandedVisitId === v.id;
                return (
                  <article
                    key={v.id}
                    className="bg-white rounded-2xl border border-[#DDF5E3] shadow-card overflow-hidden transition-all"
                  >
                    {/* Summary Header */}
                    <div
                      onClick={() => toggleExpand(v.id)}
                      className="p-4 cursor-pointer hover:bg-[#F7FBF3] transition-colors flex items-start justify-between gap-2"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-primary bg-[#DDF5E3] px-2 py-0.5 rounded-full">
                            {v.visit_date}
                          </span>
                          <span className="text-[11px] font-medium text-[#68796C]">
                            {v.visit_type}
                          </span>
                        </div>
                        <h2 className="font-bold text-sm sm:text-base text-[#1D3025]">
                          {v.diagnosis}
                        </h2>
                        <p className="text-xs text-[#404940]">
                          {v.doctor_name} • {v.facility_name}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 pt-1">
                        <span className="text-[11px] font-mono font-bold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded-md">
                          {v.icd10_code}
                        </span>
                        <span className="material-symbols-outlined text-primary text-xl transition-transform duration-200">
                          {isExpanded ? 'expand_less' : 'expand_more'}
                        </span>
                      </div>
                    </div>

                    {/* Expandable Clinical Details */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 border-t border-[#F1F5ED] space-y-3.5 text-xs bg-[#FAFDF8]">
                        {/* Summary Notes */}
                        <div>
                          <h3 className="font-bold text-[#214D38] uppercase tracking-wider text-[11px] mb-1">
                            Attending Physician Notes
                          </h3>
                          <p className="text-[#404940] leading-relaxed bg-white p-3 rounded-xl border border-[#DDF5E3]">
                            {v.summary_notes}
                          </p>
                        </div>

                        {/* Prescriptions */}
                        {v.prescriptions?.length > 0 && (
                          <div>
                            <h3 className="font-bold text-[#214D38] uppercase tracking-wider text-[11px] mb-1.5">
                              Prescribed Medications
                            </h3>
                            <div className="space-y-1.5">
                              {v.prescriptions.map((rx, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#DDF5E3]"
                                >
                                  <div>
                                    <p className="font-bold text-[#1D3025]">
                                      {rx.drug} <span className="font-normal text-[#68796C]">({rx.dosage})</span>
                                    </p>
                                    <p className="text-[11px] text-[#68796C]">{rx.frequency}</p>
                                  </div>
                                  <span className="px-2 py-0.5 rounded-full bg-[#DDF5E3] text-[#214D38] font-bold text-[10px]">
                                    {rx.status} ({rx.refills} refills)
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Lab Results */}
                        {v.lab_results?.length > 0 && (
                          <div>
                            <h3 className="font-bold text-[#214D38] uppercase tracking-wider text-[11px] mb-1.5">
                              Laboratory Test Results
                            </h3>
                            <div className="overflow-x-auto rounded-xl border border-[#DDF5E3] bg-white">
                              <table className="w-full text-left text-[11px]">
                                <thead className="bg-[#F7FBF3] border-b border-[#DDF5E3] text-[#68796C] uppercase font-bold">
                                  <tr>
                                    <th className="p-2">Test Name</th>
                                    <th className="p-2">Value</th>
                                    <th className="p-2">Ref Range</th>
                                    <th className="p-2 text-right">Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {v.lab_results.map((lab, i) => (
                                    <tr key={i} className="border-b last:border-b-0 border-[#F1F5ED]">
                                      <td className="p-2 font-semibold text-[#1D3025]">{lab.test}</td>
                                      <td className="p-2 font-mono font-bold text-primary">
                                        {lab.value} {lab.unit}
                                      </td>
                                      <td className="p-2 text-[#68796C]">{lab.reference_range}</td>
                                      <td className="p-2 text-right">
                                        <span className="px-1.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] font-bold text-[10px]">
                                          Normal
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Verified Signature Stamp */}
                        <div className="pt-2 flex items-center justify-between text-[11px] text-[#15803D] font-medium border-t border-[#F1F5ED]">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">verified_user</span>
                            {v.verified_signature}
                          </span>
                          <span className="text-[#68796C]">CarePortal HIPAA Vault</span>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* 4. Diagnostic Vault Documents Tab */
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-between">
            <div>
              <p className="font-bold text-xs text-[#166534]">CarePortal Document Vault</p>
              <p className="text-[11px] text-[#166534]">
                Official certified laboratory and radiology reports stored securely.
              </p>
            </div>
            <button
              onClick={onOpenReportUpload}
              className="px-3 py-1.5 rounded-xl bg-[#166534] text-white text-xs font-bold hover:bg-[#14532D]"
            >
              + Upload File
            </button>
          </div>

          {reports.length === 0 ? (
            <div className="py-8 text-center bg-white rounded-2xl border border-[#DDF5E3] p-4 text-xs text-[#68796C]">
              No documents in vault yet. Tap 'Upload' to add a diagnostic file.
            </div>
          ) : (
            reports.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl p-4 border border-[#DDF5E3] shadow-card flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FEF2F2] text-error flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-2xl">picture_as_pdf</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-[#1D3025]">{doc.title}</h3>
                    <p className="text-[11px] text-[#68796C] mt-0.5">
                      {doc.document_type} • {(doc.file_size / 1024).toFixed(1)} KB
                    </p>
                    <p className="text-[11px] text-[#214D38] mt-1 bg-[#F7FBF3] px-2 py-0.5 rounded-md inline-block">
                      Uploaded on {new Date(doc.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <a
                  href={`/api/visits/reports/${doc.id}/download`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-xl bg-surface-container text-primary text-xs font-bold hover:bg-surface-container-high transition-colors flex items-center gap-1 shrink-0"
                >
                  <span className="material-symbols-outlined text-sm">visibility</span>
                  <span>View</span>
                </a>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
