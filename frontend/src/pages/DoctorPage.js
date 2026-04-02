import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Dashboard from "../components/Dashboard.js";
import { getReports, getBills } from "../services/blockchain.js";

const S = {
  sectionLabel: { fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", letterSpacing:"2px", color:"#999", marginBottom:"24px", paddingBottom:"12px", borderBottom:"1px solid #e0ddd6" },
  tableWrap: { background:"#fff", border:"1px solid #e0ddd6" },
  tableHeader: { padding:"14px 20px", borderBottom:"1px solid #e0ddd6" },
  tableTitle: { fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", letterSpacing:"2px", color:"#999" },
  row: { padding:"14px 20px", borderBottom:"1px solid #f0ede8", display:"flex", alignItems:"center" },
  td: { fontSize:"13px", color:"#1a1a1a", fontWeight:"500" },
  badge: { fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", padding:"3px 8px", display:"inline-block" },
  empty: { padding:"48px", textAlign:"center", fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:"#bbb", letterSpacing:"1px" },
};

const DoctorPage = () => {
  const [activeTab, setActiveTab] = useState("reports");
  const [reports, setReports] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [rRes, bRes] = await Promise.all([getReports(), getBills()]);
      if (rRes.success) setReports(rRes.data);
      if (bRes.success) setBills(bRes.data);
    } catch (err) {
      toast.error("Failed to fetch records");
    } finally {
      setLoading(false);
    }
  };

  const renderReports = () => (
    <div>
      <div style={S.sectionLabel}>PATIENT MEDICAL REPORTS</div>
      <div style={S.tableWrap}>
        <div style={{ ...S.row, background:"#fafaf8", borderBottom:"1px solid #e0ddd6" }}>
          {["ID","PATIENT","REPORT TYPE","UPLOADED BY","STATUS","DATE","FILE"].map((h, i) => (
  <div key={i} style={{ ...S.td, flex: i===1||i===3 ? 2 : 1, fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", letterSpacing:"1px", color:"#999" }}>{h}</div>
))}
        </div>
        {loading ? (
          <div style={S.empty}>LOADING RECORDS...</div>
        ) : reports.length === 0 ? (
          <div style={S.empty}>NO REPORTS FOUND</div>
        ) : reports.map(r => (
          <div key={r.id} style={S.row}>
            <div style={{ ...S.td, flex:1, fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:"#bbb" }}>#{r.id}</div>
            <div style={{ ...S.td, flex:2, fontWeight:"500", color:"#1a1a1a" }}>{r.patient_name}</div>
            <div style={{ ...S.td, flex:1, color:"#666" }}>{r.report_type?.replace("_"," ")}</div>
            <div style={{ ...S.td, flex:2, color:"#666" }}>{r.uploaded_by_name}</div>
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

  const renderBills = () => (
    <div>
      <div style={S.sectionLabel}>PHARMACY BILLS</div>
      <div style={S.tableWrap}>
        <div style={{ ...S.row, background:"#fafaf8", borderBottom:"1px solid #e0ddd6" }}>
          {["ID","PATIENT","AMOUNT","UPLOADED BY","STATUS","DATE","FILE"].map((h, i) => (
            <div key={i} style={{ ...S.td, flex: i===1||i===3 ? 2 : 1, fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", letterSpacing:"1px", color:"#999" }}>{h}</div>
          ))}
        </div>
        {loading ? (
          <div style={S.empty}>LOADING RECORDS...</div>
        ) : bills.length === 0 ? (
          <div style={S.empty}>NO BILLS FOUND</div>
        ) : bills.map(b => (
          <div key={b.id} style={S.row}>
            <div style={{ ...S.td, flex:1, fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:"#bbb" }}>#{b.id}</div>
            <div style={{ ...S.td, flex:2, fontWeight:"500", color:"#1a1a1a" }}>{b.patient_name}</div>
            <div style={{ ...S.td, flex:1, fontWeight:"500", color:"#1a1a1a" }}>₹{b.bill_amount}</div>
            <div style={{ ...S.td, flex:2, color:"#666" }}>{b.uploaded_by_name}</div>
            <div style={{ ...S.td, flex:1 }}>
              {b.is_tampered ? (
                <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:"#dc2626" }}>ALTERED</span>
              ) : (
                <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:"#16a34a" }}>AUTHENTIC</span>
              )}
            </div>
            <div style={{ ...S.td, flex:1, fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:"#bbb" }}>
  {new Date(b.created_at).toLocaleDateString()}
</div>
<div style={{ ...S.td, flex:1 }}>
  {b.file_url ? (
    <a href={b.file_url} target="_blank" rel="noreferrer"
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
        {activeTab === "reports" && renderReports()}
        {activeTab === "bills" && renderBills()}
      </div>
    </Dashboard>
  );
};

export default DoctorPage;