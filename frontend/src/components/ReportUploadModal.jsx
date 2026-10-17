import React, { useState } from 'react';
import { uploadHealthReport } from '../api';

export default function ReportUploadModal({ isOpen, onClose, onUploaded }) {
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState('Laboratory Diagnostic Report');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF or image report to upload.');
      return;
    }
    if (!title.trim()) {
      setError('Please provide a document title.');
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('patient_id', 'P-001');
      formData.append('title', title.trim());
      formData.append('document_type', docType);
      formData.append('notes', notes);
      formData.append('report_file', file);

      const res = await uploadHealthReport(formData);
      if (res.success) {
        setSuccess('Report successfully uploaded to CarePortal Vault!');
        setTimeout(() => {
          onUploaded && onUploaded(res.report);
          onClose();
        }, 1200);
      } else {
        setError(res.error || 'Upload failed.');
      }
    } catch (err) {
      setError(err.message || 'Error uploading file.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#DDF5E3] relative">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-[#DDF5E3] text-[#214D38] flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">upload_file</span>
          </div>
          <div>
            <h3 className="font-bold text-base text-[#1D3025]">Upload Health Document</h3>
            <p className="text-xs text-[#68796C]">Store verified records in CarePortal Vault</p>
          </div>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1D3025] mb-1.5 uppercase tracking-wider">
              Document Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. LabCorp Bloodwork Summary, Knee X-Ray..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDF5E3] bg-white text-sm text-[#1D3025] focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1D3025] mb-1.5 uppercase tracking-wider">
              Document Category
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDF5E3] bg-[#F7FBF3] text-sm text-[#1D3025] font-medium focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Laboratory Diagnostic Report">Laboratory Diagnostic Report</option>
              <option value="Imaging Radiology Report">Imaging Radiology Report</option>
              <option value="Cardiology EKG / Echo">Cardiology EKG / Echo</option>
              <option value="Discharge Summary">Hospital Discharge Summary</option>
              <option value="Medication List">Updated Medication List</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1D3025] mb-1.5 uppercase tracking-wider">
              Select File (PDF or Image)
            </label>
            <div className="border-2 border-dashed border-[#DDF5E3] rounded-2xl p-4 text-center bg-[#F7FBF3] hover:bg-[#F1F5ED] transition-colors cursor-pointer relative">
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => setFile(e.target.files[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <span className="material-symbols-outlined text-3xl text-primary mb-1">
                cloud_upload
              </span>
              <p className="text-xs font-bold text-[#214D38]">
                {file ? file.name : 'Tap to browse or drop file here'}
              </p>
              <p className="text-[11px] text-[#68796C] mt-0.5">
                {file ? `${(file.size / 1024).toFixed(1)} KB` : 'PDF, PNG, JPG up to 25MB'}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1D3025] mb-1.5 uppercase tracking-wider">
              Clinical Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Any physician instructions or notes..."
              className="w-full px-3.5 py-2 rounded-xl border border-[#DDF5E3] text-sm text-[#1D3025] focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            disabled={uploading || !file}
            className="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-container shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Uploading to Vault...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">lock</span>
                <span>Encrypt & Upload to Vault</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
