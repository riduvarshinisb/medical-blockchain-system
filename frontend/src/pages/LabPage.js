import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Dashboard from "../components/Dashboard.js";
import UploadReport from "../components/UploadReport.js";
import { getReports } from "../services/blockchain.js";

const S = {
  sectionLabel: { fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", letterSpacing:"2px", color:"#999", marginBottom:"24px", paddingBottom:"12px", borderBottom:"1px solid #e0ddd6" },
  tableWrap: { background:"#fff", border:"1px solid #e0ddd6" },
  tableHeader: { padding:"14px 20px", borderBottom:"1px solid #e0ddd6", display:"flex", alignItems:"center", justifyContent:"space-between" },
  tableTitle: { fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", letterSpacing:"2px", color:"#999" },
  refreshBtn: { fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", letterSpacing:"1px", padding:"5px 12px", border:"1px solid #e0ddd6", background:"#fff", color:"#666", cursor:"pointer" },
  row: { padding:"14px 20px", borderBottom:"1px solid #f0ede8", display:"flex", alignItems:"center" },
  td: { fontSize:"13px", color:"#1a1a1a", fontWeight:"500" },
  empty: { padding:"48px", textAlign:"center", fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:"#bbb", letterSpacing:"1px" },
};

const LabPage = () => {
  const [activeTab, setActiveTab] = useState("upload");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "history") fetchReports();
  }, [activeTab]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await getReports();
      if (res.success) setReports(res.data);
    } catch (err) {
      toast.error("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  const renderHistory = () => (
    <div>
      <div style={S.sectionLabel}>REPORT HISTORY</div>
      <div style={S.tableWrap}>
        <div style={S.tableHeader}>
          <div style={S.tableTitle}>ALL UPLOADED REPORTS</div>
          <button onClick={fetchReports} style={S.refreshBtn}>REFRESH</button>
        </div>
        <div style={{ ...S.row, background:"#fafaf8", borderBottom:"1px solid #e0ddd6" }}>
          {["ID","PATIENT","REPORT TYPE","STATUS","DATE","FILE"].map((h, i) => (
            <div key={i} style={{ ...S.td, flex: i===1 ? 2 : 1, fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", letterSpacing:"1px", color:"#999" }}>{h}</div>
          ))}
        </div>
        {loading ? (
          <div style={S.empty}>LOADING...</div>
        ) : reports.length === 0 ? (
          <div style={S.empty}>NO REPORTS UPLOADED YET</div>
        ) : reports.map(r => (
          <div key={r.id} style={S.row}>
            <div style={{ ...S.td, flex:1, fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:"#bbb" }}>#{r.id}</div>
            <div style={{ ...S.td, flex:2, fontWeight:"500", color:"#1a1a1a" }}>{r.patient_name}</div>
            <div style={{ ...S.td, flex:1, color:"#666" }}>{r.report_type?.replace("_"," ")}</div>
            <div style={{ ...S.td, flex:1 }}>
              {r.is_tampered ? (
                <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:"#dc2626" }}>ALTERED</span>
              ) : (
                <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:"#16a34a" }}>AUTHENTIC</span>
              )}
            </div>
            <div style={{ ...S.td, flex:1, fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:"#bbb" }}>
  {new Date(r.created_at).toLocaleDateString()}
</div>
<div style={{ ...S.td, flex:1 }}>
  {r.file_url ? (
    <a href={r.file_url} target="_blank" rel="noreferrer"
      style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:"#1a1a1a", letterSpacing:"0.5px", textDecoration:"none", borderBottom:"1px solid #1a1a1a", paddingBottom:"1px" }}>
      VIEW →
    </a>
  ) : (
    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:"#bbb" }}>—</span>
  )}
</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Dashboard activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="animate-in">
        {activeTab === "upload" && (
          <div>
            <div style={S.sectionLabel}>UPLOAD MEDICAL REPORT</div>
            <UploadReport onSuccess={() => setActiveTab("history")} />
          </div>
        )}
        {activeTab === "history" && renderHistory()}
      </div>
    </Dashboard>
  );
};

export default LabPage;