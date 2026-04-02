import React, { useState } from "react";
import { toast } from "react-toastify";
import { uploadReport } from "../services/blockchain.js";

const S = {
  wrap: { background:"#fff", border:"1px solid #e0ddd6", padding:"32px", maxWidth:"560px" },
  sectionLabel: { fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", letterSpacing:"2px", color:"#999", marginBottom:"24px", paddingBottom:"12px", borderBottom:"1px solid #e0ddd6" },
  label: { display:"block", fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", letterSpacing:"1.5px", color:"#999", marginBottom:"8px", textTransform:"uppercase" },
  input: { width:"100%", padding:"11px 14px", border:"1px solid #e0ddd6", background:"#fff", fontSize:"14px", fontFamily:"'IBM Plex Sans',sans-serif", color:"#1a1a1a", outline:"none", boxSizing:"border-box" },
  select: { width:"100%", padding:"11px 14px", border:"1px solid #e0ddd6", background:"#fff", fontSize:"14px", fontFamily:"'IBM Plex Sans',sans-serif", color:"#1a1a1a", outline:"none", boxSizing:"border-box", cursor:"pointer" },
  fileWrap: { border:"1px dashed #e0ddd6", padding:"24px", textAlign:"center", cursor:"pointer", background:"#fafaf8" },
  fileText: { fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:"#999", letterSpacing:"1px" },
  fileInput: { display:"none" },
  btn: { width:"100%", padding:"12px", background:"#1a1a1a", color:"#fff", border:"none", fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", letterSpacing:"1.5px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"10px", marginTop:"8px" },
  successWrap: { marginTop:"24px", borderTop:"1px solid #e0ddd6", paddingTop:"24px" },
  successLabel: { fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", letterSpacing:"1.5px", color:"#16a34a", marginBottom:"16px" },
  successRow: { display:"flex", justifyContent:"space-between", alignItems:"center", paddingBottom:"10px", borderBottom:"1px solid #f0ede8", marginBottom:"10px" },
  successKey: { fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", color:"#999", letterSpacing:"1px" },
  successVal: { fontSize:"13px", color:"#1a1a1a", fontWeight:"500" },
  successStatus: { display:"flex", alignItems:"center", gap:"8px" },
  statusDot: { width:"8px", height:"8px", borderRadius:"50%", background:"#22c55e" },
  statusText: { fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:"#16a34a", letterSpacing:"1px" },
  fieldWrap: { marginBottom:"20px" },
};

const UploadReport = ({ onSuccess }) => {
  const [patientId, setPatientId] = useState("");
  const [reportType, setReportType] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) setFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { toast.error("Please select a file"); return; }
    setLoading(true);
    setResult(null);
    try {
      const res = await uploadReport(patientId, reportType, file);
      if (res.success) {
        setResult(res.data);
        toast.success("Report secured successfully");
        if (onSuccess) onSuccess();
        setPatientId("");
        setReportType("");
        setFile(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.wrap}>
      <div style={S.sectionLabel}>UPLOAD MEDICAL REPORT</div>

      <form onSubmit={handleSubmit}>
        <div style={S.fieldWrap}>
          <label style={S.label}>Patient ID</label>
          <input type="number" value={patientId} onChange={e => setPatientId(e.target.value)} required placeholder="Enter patient ID" style={S.input} onFocus={e => e.target.style.borderColor="#1a1a1a"} onBlur={e => e.target.style.borderColor="#e0ddd6"} />
        </div>

        <div style={S.fieldWrap}>
          <label style={S.label}>Report Type</label>
          <select value={reportType} onChange={e => setReportType(e.target.value)} required style={S.select} onFocus={e => e.target.style.borderColor="#1a1a1a"} onBlur={e => e.target.style.borderColor="#e0ddd6"}>
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

        <div style={S.fieldWrap}>
          <label style={S.label}>Report File</label>
          <label style={S.fileWrap} htmlFor="reportFile">
            {file ? (
              <div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"12px", color:"#1a1a1a", marginBottom:"4px" }}>{file.name}</div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", color:"#999" }}>{(file.size / 1024).toFixed(1)} KB</div>
              </div>
            ) : (
              <div>
                <div style={S.fileText}>CLICK TO SELECT FILE</div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", color:"#bbb", marginTop:"6px" }}>PDF, JPG, PNG · MAX 10MB</div>
              </div>
            )}
          </label>
          <input type="file" id="reportFile" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} style={S.fileInput} />
        </div>

        <button type="submit" disabled={loading} style={{ ...S.btn, opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? <><span className="spinner" /> SECURING RECORD...</> : "UPLOAD & SECURE →"}
        </button>
      </form>

      {result && (
        <div style={S.successWrap} className="animate-in">
          <div style={S.successLabel}>RECORD SECURED SUCCESSFULLY</div>

          <div style={S.successRow}>
            <div style={S.successKey}>RECORD ID</div>
            <div style={S.successVal}>#{result.reportId}</div>
          </div>

          <div style={S.successRow}>
            <div style={S.successKey}>INTEGRITY STATUS</div>
            <div style={S.successStatus}>
              <div style={S.statusDot} />
              <div style={S.statusText}>SECURED</div>
            </div>
          </div>

          <div style={S.successRow}>
            <div style={S.successKey}>SECURED ON</div>
            <div style={S.successVal}>{new Date().toLocaleString()}</div>
          </div>

          <div style={{ ...S.successRow, border:"none", margin:0, padding:0 }}>
            <div style={S.successKey}>VERIFICATION</div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:"#16a34a" }}>FINGERPRINT STORED</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadReport;