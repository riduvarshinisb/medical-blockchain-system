import React, { useState, useEffect } from "react";
import { getReports } from "../services/blockchain.js";
import UploadReport from "../components/UploadReport.js";
import Dashboard from "../components/Dashboard.js";

const LabPage = () => {
  const [activeTab, setActiveTab] = useState("upload");
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await getReports();
      if (res.success) setReports(res.data);
    } catch (err) { console.error(err); }
  };

  const S = {
    tableWrap: { background:"var(--white)", border:"1px solid var(--border)", borderRadius:"12px", overflow:"hidden" },
    tableHead: { display:"flex", padding:"10px 16px", background:"var(--bg)", borderBottom:"1px solid var(--border)" },
    tableRow: { display:"flex", padding:"13px 16px", borderBottom:"1px solid #f3f4f6", alignItems:"center", transition:"background 0.12s" },
    th: { fontSize:"11px", fontWeight:"600", color:"var(--text-4)", textTransform:"uppercase", letterSpacing:"0.6px" },
    td: { fontSize:"13px", color:"var(--text-2)" },
    empty: { padding:"48px 24px", textAlign:"center", color:"var(--text-4)", fontSize:"13px" },
    sectionHeader: { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", borderBottom:"1px solid var(--border)" },
  };

  const StatusBadge = ({ tampered }) => (
    <span className={tampered ? "badge badge-altered" : "badge badge-authentic"}>
      {tampered ? "Altered" : "Authentic"}
    </span>
  );

  const FileLink = ({ item }) => {
    if (item.is_tampered) return <span className="badge badge-blocked">Blocked</span>;
    if (!item.file_url) return <span style={{ color:"var(--text-4)", fontSize:"12px" }}>—</span>;
    return <a href={item.file_url} target="_blank" rel="noreferrer" style={{ fontSize:"12px", color:"var(--teal)", fontWeight:"500", textDecoration:"none" }}>View →</a>;
  };

  const renderUpload = () => (
    <div className="animate-in">
      <UploadReport onSuccess={fetchReports} />
    </div>
  );

  const renderHistory = () => (
    <div className="animate-in">
      <div style={S.tableWrap}>
        <div style={S.sectionHeader}>
          <span style={{ fontSize:"13px", fontWeight:"600", color:"var(--text)" }}>Report History</span>
          <span style={{ fontSize:"11px", color:"var(--text-4)" }}>{reports.length} record{reports.length !== 1 ? "s" : ""}</span>
        </div>
        {reports.length === 0 ? (
          <div style={S.empty}>
            <div style={{ fontSize:"24px", marginBottom:"8px" }}>📋</div>
            No reports uploaded yet
          </div>
        ) : (
          <>
            <div style={S.tableHead}>
              {["ID","Patient","Report Type","Status","Date","File"].map((h,i) => (
                <div key={i} style={{ ...S.th, flex:[0.5,2,1.5,1,1,1][i] }}>{h}</div>
              ))}
            </div>
            {reports.map(r => (
              <div key={r.id} style={S.tableRow}
                onMouseEnter={e => e.currentTarget.style.background="var(--teal-faint)"}
                onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                <div style={{ ...S.td, flex:0.5, color:"var(--text-4)", fontSize:"12px" }}>#{r.id}</div>
                <div style={{ ...S.td, flex:2, fontWeight:"500" }}>{r.patient_name}</div>
                <div style={{ ...S.td, flex:1.5, color:"var(--text-3)", textTransform:"capitalize" }}>{r.report_type?.replace("_"," ")}</div>
                <div style={{ flex:1 }}><StatusBadge tampered={r.is_tampered} /></div>
                <div style={{ ...S.td, flex:1, fontSize:"12px", color:"var(--text-4)" }}>{new Date(r.created_at).toLocaleDateString()}</div>
                <div style={{ flex:1 }}><FileLink item={r} /></div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );

  return (
    <Dashboard activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === "upload" && renderUpload()}
      {activeTab === "history" && renderHistory()}
    </Dashboard>
  );
};

export default LabPage;