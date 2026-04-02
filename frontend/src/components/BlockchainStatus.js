import React, { useState, useEffect } from "react";
import { getAuditLogs } from "../services/blockchain.js";

const S = {
  sectionLabel: { fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", letterSpacing:"2px", color:"#999", marginBottom:"24px", paddingBottom:"12px", borderBottom:"1px solid #e0ddd6" },
  statsGrid: { display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:"1px", background:"#e0ddd6", border:"1px solid #e0ddd6", marginBottom:"24px" },
  stat: { background:"#fff", padding:"24px" },
  statVal: { fontFamily:"'IBM Plex Mono',monospace", fontSize:"32px", fontWeight:"600", color:"#1a1a1a", lineHeight:"1" },
  statLabel: { fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", letterSpacing:"1.5px", color:"#999", marginTop:"8px", textTransform:"uppercase" },
  tableWrap: { background:"#fff", border:"1px solid #e0ddd6" },
  tableHeader: { padding:"14px 20px", borderBottom:"1px solid #e0ddd6", display:"flex" },
  th: { fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", letterSpacing:"1.5px", color:"#999", textTransform:"uppercase" },
  row: { padding:"14px 20px", borderBottom:"1px solid #f0ede8", display:"flex", alignItems:"center" },
  td: { fontSize:"13px", color:"#444", fontFamily:"'IBM Plex Sans',sans-serif" },
  badge: { fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", letterSpacing:"0.5px", padding:"3px 8px", display:"inline-block" },
  empty: { padding:"48px", textAlign:"center", fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:"#bbb", letterSpacing:"1px" },
};

const BlockchainStatus = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total:0, authentic:0, altered:0, reports:0, bills:0 });

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    try {
      const res = await getAuditLogs();
      if (res.success) {
        const data = res.data;
        setLogs(data);
        setStats({
          total: data.length,
          authentic: data.filter(l => l.is_valid).length,
          altered: data.filter(l => !l.is_valid).length,
          reports: data.filter(l => l.record_type === "report").length,
          bills: data.filter(l => l.record_type === "bill").length,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cols = [
    { key:"type", label:"TYPE", flex:1 },
    { key:"action", label:"ACTION", flex:1 },
    { key:"result", label:"RESULT", flex:1.5 },
    { key:"by", label:"PERFORMED BY", flex:2 },
    { key:"time", label:"TIME", flex:2 },
  ];

  return (
    <div>
      <div style={S.sectionLabel}>AUDIT LOG</div>

      <div style={S.statsGrid}>
        {[
  { val: stats.total, label:"TOTAL ACTIONS", color:"#1a1a1a" },
  { val: stats.authentic, label:"AUTHENTIC", color:"#16a34a" },
  { val: stats.altered, label:"ALTERED", color:"#dc2626" },
  { val: stats.reports, label:"REPORTS", color:"#1a1a1a" },
  { val: stats.bills, label:"BILLS", color:"#1a1a1a" },
].map((s, i) => (
          <div key={i} style={S.stat}>
            <div style={{ ...S.statVal, color: s.color }}>{s.val}</div>
            <div style={S.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={S.tableWrap}>
        <div style={S.tableHeader}>
          {cols.map(c => (
            <div key={c.key} style={{ ...S.th, flex: c.flex }}>{c.label}</div>
          ))}
        </div>

        {loading ? (
          <div style={S.empty}>LOADING AUDIT LOG...</div>
        ) : logs.length === 0 ? (
          <div style={S.empty}>NO AUDIT ENTRIES YET</div>
        ) : (
          logs.map(log => (
            <div key={log.id} style={S.row}>
              <div style={{ ...S.td, flex:1 }}>
                <span style={{ ...S.badge, background: log.record_type === "report" ? "#fffbeb" : "#f5f3ff", color: log.record_type === "report" ? "#d97706" : "#7c3aed", border: `1px solid ${log.record_type === "report" ? "#fde68a" : "#ddd6fe"}` }}>
                  {log.record_type?.toUpperCase()}
                </span>
              </div>
              <div style={{ ...S.td, flex:1 }}>
                <span style={{ ...S.badge, background: log.action === "store" ? "#eff6ff" : "#f0fdf4", color: log.action === "store" ? "#1d4ed8" : "#16a34a", border: `1px solid ${log.action === "store" ? "#bfdbfe" : "#bbf7d0"}` }}>
                  {log.action?.toUpperCase()}
                </span>
              </div>
              <div style={{ ...S.td, flex:1.5 }}>
                {log.is_valid ? (
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:"#16a34a", letterSpacing:"0.5px" }}>AUTHENTIC</span>
                ) : (
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:"#dc2626", letterSpacing:"0.5px" }}>ALTERED</span>
                )}
              </div>
              <div style={{ ...S.td, flex:2 }}>{log.performed_by_name || "—"}</div>
              <div style={{ ...S.td, flex:2, fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:"#bbb" }}>
                {new Date(log.created_at).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BlockchainStatus;