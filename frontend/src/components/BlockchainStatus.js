import React, { useState, useEffect } from "react";
import api from "../services/api.js";

const BlockchainStatus = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/verify/logs").then(res => {
      if (res.data.success) setLogs(res.data.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const exportCSV = () => {
  const headers = ["ID","Record Type","Action","Result","Performed By","Timestamp"];
  const rows = logs.map((log, i) => [
    i + 1,
    log.record_type,
    log.action,
    log.is_authentic ? "Authentic" : "Altered",
    log.performed_by_name || "System",
    new Date(log.created_at).toLocaleString(),
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(val => `"${val}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type:"text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `MedChain_AuditLog_${new Date().toISOString().slice(0,10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

  const stats = {
    total: logs.length,
    authentic: logs.filter(l => l.is_authentic).length,
    altered: logs.filter(l => !l.is_authentic).length,
    reports: logs.filter(l => l.record_type === "report").length,
    bills: logs.filter(l => l.record_type === "bill").length,
  };

  const S = {
    tableWrap: { background:"var(--white)", border:"1px solid var(--border)", borderRadius:"12px", overflow:"hidden" },
    tableHead: { display:"flex", padding:"10px 16px", background:"var(--bg)", borderBottom:"1px solid var(--border)" },
    tableRow: { display:"flex", padding:"13px 16px", borderBottom:"1px solid #f3f4f6", alignItems:"center", transition:"background 0.12s" },
    th: { fontSize:"11px", fontWeight:"600", color:"var(--text-4)", textTransform:"uppercase", letterSpacing:"0.6px" },
    td: { fontSize:"13px", color:"var(--text-2)" },
    empty: { padding:"48px 24px", textAlign:"center", color:"var(--text-4)", fontSize:"13px" },
  };

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"64px", color:"var(--text-4)", fontSize:"13px", gap:"10px" }}>
      <span className="spinner" style={{ borderColor:"rgba(0,0,0,0.1)", borderTopColor:"var(--teal)" }} />
      Loading audit log...
    </div>
  );

  return (
    <div className="animate-in">
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:"16px", marginBottom:"24px" }}>
        {[
          { label:"Total Actions", value:stats.total, color:"var(--text)" },
          { label:"Authentic", value:stats.authentic, color:"var(--green)" },
          { label:"Altered", value:stats.altered, color: stats.altered > 0 ? "var(--red)" : "var(--text-4)" },
          { label:"Reports", value:stats.reports, color:"#3b82f6" },
          { label:"Bills", value:stats.bills, color:"#8b5cf6" },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div style={{ fontSize:"11px", fontWeight:"600", color:"var(--text-4)", textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:"8px" }}>{s.label}</div>
            <div style={{ fontSize:"28px", fontWeight:"300", color:s.color, fontFamily:"'DM Serif Display',serif" }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={S.tableWrap}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", borderBottom:"1px solid var(--border)" }}>
  <span style={{ fontSize:"13px", fontWeight:"600", color:"var(--text)" }}>Audit Log</span>
  <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
    <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
      <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:"var(--green)" }} />
      <span style={{ fontSize:"11px", color:"var(--text-4)" }}>All entries immutable on blockchain</span>
    </div>
    <button onClick={exportCSV} className="btn-ghost" style={{ padding:"5px 12px", fontSize:"12px" }}>
      Export CSV ↓
    </button>
  </div>
</div>

        {logs.length === 0 ? (
          <div style={S.empty}>
            <div style={{ fontSize:"24px", marginBottom:"8px" }}>🔍</div>
            No audit entries yet
          </div>
        ) : (
          <>
            <div style={S.tableHead}>
              {["Type","Action","Result","Performed By","Time"].map((h,i) => (
                <div key={i} style={{ ...S.th, flex:[0.8,0.8,1,2,2][i] }}>{h}</div>
              ))}
            </div>
            {logs.map((log, i) => (
              <div key={i} style={S.tableRow}
                onMouseEnter={e => e.currentTarget.style.background="var(--teal-faint)"}
                onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                <div style={{ flex:0.8 }}>
                  <span style={{ fontSize:"11px", padding:"2px 8px", borderRadius:"99px", background: log.record_type === "report" ? "#eff6ff" : "#f5f3ff", color: log.record_type === "report" ? "#3b82f6" : "#8b5cf6", fontWeight:"500" }}>
                    {log.record_type}
                  </span>
                </div>
                <div style={{ flex:0.8 }}>
                  <span style={{ fontSize:"11px", padding:"2px 8px", borderRadius:"99px", background:"var(--bg)", border:"1px solid var(--border)", color:"var(--text-3)" }}>
                    {log.action}
                  </span>
                </div>
                <div style={{ flex:1 }}>
                  <span className={log.is_authentic ? "badge badge-authentic" : "badge badge-altered"}>
                    {log.is_authentic ? "Authentic" : "Altered"}
                  </span>
                </div>
                <div style={{ ...S.td, flex:2, color:"var(--text-3)" }}>{log.performed_by_name || "System"}</div>
                <div style={{ ...S.td, flex:2, fontSize:"12px", color:"var(--text-4)" }}>{new Date(log.created_at).toLocaleString()}</div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default BlockchainStatus;