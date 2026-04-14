import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { uploadReport } from "../services/blockchain.js";
import { getPatients } from "../services/patients.js";

const UploadReport = ({ onSuccess }) => {
  const [patients, setPatients] = useState([]);
  const [patientId, setPatientId] = useState("");
  const [reportType, setReportType] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    getPatients().then(r => { if (r.success) setPatients(r.data); });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { toast.error("Please select a file"); return; }
    setLoading(true); setResult(null);
    try {
      const res = await uploadReport(patientId, reportType, file);
      if (res.success) {
        setResult(res.data);
        toast.success("Report secured on blockchain");
        if (onSuccess) onSuccess();
        setPatientId(""); setReportType(""); setFile(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally { setLoading(false); }
  };

  const selectedPatient = patients.find(p => p.id === parseInt(patientId));

  return (
    <div style={{ maxWidth:"560px" }}>
      <div className="card" style={{ padding:"28px" }}>
        <div className="section-title">Upload Medical Report</div>

        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"18px" }}>
          <div>
            <label className="form-label">Patient</label>
            <select value={patientId} onChange={e => setPatientId(e.target.value)} required className="form-input">
              <option value="">Select patient</option>
              {patients.length === 0 ? (
                <option disabled>No patients registered — contact admin</option>
              ) : patients.map(p => (
                <option key={p.id} value={p.id}>{p.name}{p.age ? ` · ${p.age} yrs` : ""}{p.gender ? ` · ${p.gender}` : ""}</option>
              ))}
            </select>
            {selectedPatient && (
              <div style={{ fontSize:"11px", color:"var(--teal)", marginTop:"5px" }}>
                Patient #{selectedPatient.id} · {selectedPatient.contact || "No contact on file"}
              </div>
            )}
          </div>

          <div>
            <label className="form-label">Report Type</label>
            <select value={reportType} onChange={e => setReportType(e.target.value)} required className="form-input">
              <option value="">Select type</option>
              <option value="blood_test">Blood Test</option>
              <option value="xray">X-Ray</option>
              <option value="mri">MRI Scan</option>
              <option value="ct_scan">CT Scan</option>
              <option value="urine_test">Urine Test</option>
              <option value="ecg">ECG</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="form-label">Report File</label>
            <label htmlFor="reportFile" style={{ display:"block", border:"1.5px dashed var(--border-2)", borderRadius:"8px", padding:"20px", textAlign:"center", cursor:"pointer", background:"#fafafa", transition:"all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor="var(--teal)"; e.currentTarget.style.background="var(--teal-faint)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor="var(--border-2)"; e.currentTarget.style.background="#fafafa"; }}>
              {file ? (
                <div>
                  <div style={{ fontSize:"13px", fontWeight:"500", color:"var(--text)", marginBottom:"4px" }}>📄 {file.name}</div>
                  <div style={{ fontSize:"11px", color:"var(--text-3)" }}>{(file.size / 1024).toFixed(1)} KB · Click to change</div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize:"24px", marginBottom:"8px" }}>⬆</div>
                  <div style={{ fontSize:"13px", fontWeight:"500", color:"var(--text-2)", marginBottom:"4px" }}>Click to select file</div>
                  <div style={{ fontSize:"11px", color:"var(--text-4)" }}>PDF, JPG, PNG · Max 10MB</div>
                </div>
              )}
            </label>
            <input type="file" id="reportFile" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setFile(e.target.files[0])} style={{ display:"none" }} />
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width:"100%", justifyContent:"center", padding:"11px" }}>
            {loading ? <><span className="spinner" /> Securing on blockchain...</> : "Upload & Secure Record →"}
          </button>
        </form>

        {result && (
          <div className="animate-in" style={{ marginTop:"20px", padding:"16px", background:"var(--green-light)", border:"1px solid #a7f3d0", borderRadius:"10px" }}>
            <div style={{ fontSize:"12px", fontWeight:"600", color:"var(--green)", marginBottom:"12px", textTransform:"uppercase", letterSpacing:"0.5px" }}>✓ Record Secured Successfully</div>
            <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
              {[
                { label:"Record ID", value:`#${result.reportId}` },
                { label:"Patient", value:selectedPatient?.name || "—" },
                { label:"Integrity Status", value:"Verified & Secured" },
                { label:"Secured On", value:new Date().toLocaleString() },
              ].map((row, i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:"12px", paddingBottom:"7px", borderBottom: i < 3 ? "1px solid #d1fae5" : "none" }}>
                  <span style={{ color:"var(--green)", fontWeight:"500" }}>{row.label}</span>
                  <span style={{ color:"#065f46", fontWeight:"500" }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadReport;