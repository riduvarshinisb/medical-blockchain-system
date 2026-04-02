import React, { useState } from "react";
import { toast } from "react-toastify";
import { verifyReport, verifyBill } from "../services/blockchain.js";

const S = {
  wrap: { background:"#fff", border:"1px solid #e0ddd6", padding:"32px", maxWidth:"560px" },
  sectionLabel: { fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", letterSpacing:"2px", color:"#999", marginBottom:"24px", paddingBottom:"12px", borderBottom:"1px solid #e0ddd6" },
  label: { display:"block", fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", letterSpacing:"1.5px", color:"#666", marginBottom:"8px", textTransform:"uppercase" },
  input: { width:"100%", padding:"11px 14px", border:"1px solid #e0ddd6", background:"#fff", fontSize:"14px", fontFamily:"'IBM Plex Sans',sans-serif", color:"#111", outline:"none", boxSizing:"border-box" },
  select: { width:"100%", padding:"11px 14px", border:"1px solid #e0ddd6", background:"#fff", fontSize:"14px", fontFamily:"'IBM Plex Sans',sans-serif", color:"#111", outline:"none", boxSizing:"border-box", cursor:"pointer" },
  fileWrap: { border:"1px dashed #e0ddd6", padding:"24px", textAlign:"center", cursor:"pointer", background:"#fafaf8" },
  fileText: { fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:"#666", letterSpacing:"1px" },
  fileInput: { display:"none" },
  btn: { width:"100%", padding:"12px", background:"#1a1a1a", color:"#fff", border:"none", fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", letterSpacing:"1.5px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"10px", marginTop:"8px" },
  fieldWrap: { marginBottom:"20px" },
  resultWrap: { marginTop:"24px", borderTop:"1px solid #e0ddd6", paddingTop:"24px" },
  banner: { padding:"20px 24px", marginBottom:"20px", borderLeft:"3px solid" },
  bannerTitle: { fontFamily:"'IBM Plex Mono',monospace", fontSize:"13px", fontWeight:"600", letterSpacing:"1px", marginBottom:"6px" },
  bannerMsg: { fontSize:"13px", lineHeight:"1.6" },
  checksTitle: { fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", letterSpacing:"1.5px", color:"#666", marginBottom:"12px" },
  checkRow: { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid #f0ede8" },
  checkLabel: { fontSize:"13px", color:"#333" },
  checkResult: { fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", letterSpacing:"0.5px", fontWeight:"600" },
  metaRow: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid #f0ede8" },
  metaKey: { fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", color:"#666", letterSpacing:"1px" },
  metaVal: { fontSize:"13px", color:"#111", fontWeight:"500" },
};

const VerifyRecord = () => {
  const [recordType, setRecordType] = useState("report");
  const [recordId, setRecordId] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) setFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { toast.error("Please select a file to verify"); return; }
    setLoading(true);
    setResult(null);
    try {
      let res;
      if (recordType === "report") {
        res = await verifyReport(recordId, file);
      } else {
        res = await verifyBill(recordId, file);
      }
      if (res.success) {
        setResult(res.data);
        if (res.data.isValid) {
          toast.success("Record verified — authentic");
        } else {
          toast.error("Warning — record has been tampered");
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const isAuthentic = result?.isValid;

  return (
    <div style={S.wrap}>
      <div style={S.sectionLabel}>VERIFY RECORD INTEGRITY</div>

      <form onSubmit={handleSubmit}>
        <div style={S.fieldWrap}>
          <label style={S.label}>Record Type</label>
          <select value={recordType} onChange={e => setRecordType(e.target.value)} style={S.select} onFocus={e => e.target.style.borderColor="#1a1a1a"} onBlur={e => e.target.style.borderColor="#e0ddd6"}>
            <option value="report">Medical Report</option>
            <option value="bill">Pharmacy Bill</option>
          </select>
        </div>

        <div style={S.fieldWrap}>
          <label style={S.label}>Record ID</label>
          <input type="number" value={recordId} onChange={e => setRecordId(e.target.value)} required placeholder="Enter record ID" style={S.input} onFocus={e => e.target.style.borderColor="#1a1a1a"} onBlur={e => e.target.style.borderColor="#e0ddd6"} />
        </div>

        <div style={S.fieldWrap}>
          <label style={S.label}>Upload File to Verify</label>
          <label style={S.fileWrap} htmlFor="verifyFile">
            {file ? (
              <div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"12px", color:"#1a1a1a", marginBottom:"4px" }}>{file.name}</div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", color:"#666" }}>{(file.size / 1024).toFixed(1)} KB</div>
              </div>
            ) : (
              <div>
                <div style={S.fileText}>CLICK TO SELECT FILE</div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", color:"#999", marginTop:"6px" }}>Upload the same file to check authenticity</div>
              </div>
            )}
          </label>
          <input type="file" id="verifyFile" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} style={S.fileInput} />
        </div>

        <button type="submit" disabled={loading} style={{ ...S.btn, opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? <><span className="spinner" /> VERIFYING...</> : "VERIFY RECORD →"}
        </button>
      </form>

      {result && (
        <div style={S.resultWrap} className="animate-in">

          {/* Main Result Banner */}
          <div style={{ ...S.banner, borderLeftColor: isAuthentic ? "#22c55e" : "#dc2626", background: isAuthentic ? "#f0fdf4" : "#fef2f2" }}>
            <div style={{ ...S.bannerTitle, color: isAuthentic ? "#16a34a" : "#dc2626" }}>
              {isAuthentic ? "RECORD IS AUTHENTIC" : "RECORD HAS BEEN TAMPERED"}
            </div>
            <div style={{ ...S.bannerMsg, color: isAuthentic ? "#166534" : "#991b1b" }}>
              {result.message}
            </div>
          </div>

          {/* Verification Checks */}
          <div style={{ marginBottom:"20px" }}>
            <div style={S.checksTitle}>VERIFICATION CHECKS</div>

            <div style={S.checkRow}>
              <div style={S.checkLabel}>Uploaded file matches original</div>
              <div style={{ ...S.checkResult, color: result.checks?.uploadedFileMatchesOriginal ? "#16a34a" : "#dc2626" }}>
                {result.checks?.uploadedFileMatchesOriginal ? "PASS" : "FAIL"}
              </div>
            </div>

            <div style={{ ...S.checkRow, borderBottom:"none" }}>
              <div style={S.checkLabel}>Stored file matches original</div>
              <div style={{ ...S.checkResult, color: result.checks?.storedFileMatchesOriginal ? "#16a34a" : "#dc2626" }}>
                {result.checks?.storedFileMatchesOriginal ? "PASS" : "FAIL"}
              </div>
            </div>
          </div>

          {/* Meta Info */}
          <div style={{ borderTop:"1px solid #e0ddd6", paddingTop:"16px" }}>
            <div style={S.metaRow}>
              <div style={S.metaKey}>RECORD TYPE</div>
              <div style={S.metaVal}>{recordType === "report" ? "Medical Report" : "Pharmacy Bill"}</div>
            </div>
            <div style={S.metaRow}>
              <div style={S.metaKey}>RECORD ID</div>
              <div style={S.metaVal}>#{recordId}</div>
            </div>
            <div style={S.metaRow}>
              <div style={S.metaKey}>VERIFIED AT</div>
              <div style={S.metaVal}>{new Date(result.verifiedAt).toLocaleString()}</div>
            </div>
            <div style={{ ...S.metaRow, borderBottom:"none" }}>
              <div style={S.metaKey}>OVERALL STATUS</div>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"12px", fontWeight:"600", color: isAuthentic ? "#16a34a" : "#dc2626", letterSpacing:"1px" }}>
                {result.integrity_status}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyRecord;