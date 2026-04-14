import React, { useState, useEffect } from "react";
import { getBills } from "../services/blockchain.js";
import UploadBill from "../components/UploadBill.js";
import Dashboard from "../components/Dashboard.js";

const PharmacyPage = () => {
  const [activeTab, setActiveTab] = useState("upload");
  const [bills, setBills] = useState([]);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const res = await getBills();
      if (res.success) setBills(res.data);
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
      <UploadBill onSuccess={fetchBills} />
    </div>
  );

  const renderHistory = () => (
    <div className="animate-in">
      <div style={S.tableWrap}>
        <div style={S.sectionHeader}>
          <span style={{ fontSize:"13px", fontWeight:"600", color:"var(--text)" }}>Bill History</span>
          <span style={{ fontSize:"11px", color:"var(--text-4)" }}>{bills.length} record{bills.length !== 1 ? "s" : ""}</span>
        </div>
        {bills.length === 0 ? (
          <div style={S.empty}>
            <div style={{ fontSize:"24px", marginBottom:"8px" }}>💊</div>
            No bills uploaded yet
          </div>
        ) : (
          <>
            <div style={S.tableHead}>
              {["ID","Patient","Amount","Status","Date","File"].map((h,i) => (
                <div key={i} style={{ ...S.th, flex:[0.5,2,1.2,1,1,1][i] }}>{h}</div>
              ))}
            </div>
            {bills.map(b => (
              <div key={b.id} style={S.tableRow}
                onMouseEnter={e => e.currentTarget.style.background="var(--teal-faint)"}
                onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                <div style={{ ...S.td, flex:0.5, color:"var(--text-4)", fontSize:"12px" }}>#{b.id}</div>
                <div style={{ ...S.td, flex:2, fontWeight:"500" }}>{b.patient_name}</div>
                <div style={{ ...S.td, flex:1.2, color:"var(--text-3)" }}>₹{parseFloat(b.bill_amount).toLocaleString()}</div>
                <div style={{ flex:1 }}><StatusBadge tampered={b.is_tampered} /></div>
                <div style={{ ...S.td, flex:1, fontSize:"12px", color:"var(--text-4)" }}>{new Date(b.created_at).toLocaleDateString()}</div>
                <div style={{ flex:1 }}><FileLink item={b} /></div>
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

export default PharmacyPage;