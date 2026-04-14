import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import { toast } from "react-toastify";

const NAV = {
  admin: [
    { id:"overview", label:"Overview" },
    { id:"patients", label:"Patients" },
    { id:"reports", label:"Medical Reports" },
    { id:"bills", label:"Pharmacy Bills" },
    { id:"users", label:"Staff Accounts" },
    { id:"audit", label:"Audit Log" },
  ],
  doctor: [
    { id:"reports", label:"Patient Reports" },
    { id:"bills", label:"Pharmacy Bills" },
  ],
  lab: [
    { id:"upload", label:"Upload Report" },
    { id:"history", label:"Report History" },
  ],
  pharmacy: [
    { id:"upload", label:"Upload Bill" },
    { id:"history", label:"Bill History" },
  ],
};

const ROLE_COLOR = {
  admin: { bg:"#134e4a", text:"#ccfbf1" },
  doctor: { bg:"#1e3a5f", text:"#bfdbfe" },
  lab: { bg:"#3b2a1a", text:"#fde68a" },
  pharmacy: { bg:"#2e1a47", text:"#e9d5ff" },
};

const Dashboard = ({ children, activeTab, setActiveTab }) => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const tabs = NAV[user?.role] || [];
  const roleStyle = ROLE_COLOR[user?.role] || ROLE_COLOR.admin;

  const handleLogout = () => {
    if (window.confirm("Sign out of MedChain?")) {
      logoutUser();
      toast.success("Signed out successfully");
      navigate("/login");
    }
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"var(--bg)", fontFamily:"'DM Sans',sans-serif" }}>

      {/* Sidebar */}
      <div style={{ width:"var(--sidebar-w)", background:"var(--white)", borderRight:"1px solid var(--border)", display:"flex", flexDirection:"column", position:"fixed", top:0, left:0, height:"100vh", zIndex:50 }}>

        {/* Logo */}
        <div style={{ padding:"20px 20px 16px", borderBottom:"1px solid var(--border)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <div style={{ display:"flex", alignItems:"center" }}>
  <img src="/logo.png" alt="MedChain" style={{ height:"100px", objectFit:"contain" }} />
</div>
          </div>
        </div>

        {/* User badge */}
        <div style={{ padding:"14px 16px", borderBottom:"1px solid var(--border)" }}>
          <div style={{ background:roleStyle.bg, borderRadius:"8px", padding:"10px 12px" }}>
            <div style={{ fontSize:"12px", fontWeight:"600", color:roleStyle.text, marginBottom:"2px" }}>{user?.name}</div>
            <div style={{ fontSize:"10px", color:roleStyle.text, opacity:0.6, textTransform:"uppercase", letterSpacing:"0.8px" }}>{user?.role}</div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex:1, padding:"12px 10px", overflowY:"auto" }}>
          <div style={{ fontSize:"10px", fontWeight:"600", color:"var(--text-4)", letterSpacing:"0.8px", textTransform:"uppercase", padding:"0 6px", marginBottom:"8px" }}>Navigation</div>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
  style={{ width:"100%", display:"flex", alignItems:"center", gap:"10px", padding:"9px 12px", borderRadius:"8px", border:"none", cursor:"pointer", textAlign:"left", fontSize:"13px", fontWeight: activeTab === tab.id ? "500" : "400", background: activeTab === tab.id ? "var(--teal-faint)" : "transparent", color: activeTab === tab.id ? "var(--teal-dark)" : "var(--text-3)", transition:"all 0.15s", marginBottom:"2px", fontFamily:"'DM Sans',sans-serif" }}>
  <div style={{ width:"4px", height:"4px", borderRadius:"50%", background: activeTab === tab.id ? "var(--teal)" : "var(--border-2)", flexShrink:0 }} />
  {tab.label}
</button>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding:"12px 10px", borderTop:"1px solid var(--border)" }}>
          <div style={{ marginBottom:"4px" }} />
          <button onClick={handleLogout}
            style={{ width:"100%", display:"flex", alignItems:"center", gap:"10px", padding:"9px 10px", borderRadius:"8px", border:"none", cursor:"pointer", textAlign:"left", fontSize:"13px", background:"transparent", color:"var(--text-4)", transition:"all 0.15s", fontFamily:"'DM Sans',sans-serif" }}
            onMouseEnter={e => { e.currentTarget.style.background="#fef2f2"; e.currentTarget.style.color="#dc2626"; }}
            onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="var(--text-4)"; }}>
            ↩ Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ marginLeft:"var(--sidebar-w)", flex:1, display:"flex", flexDirection:"column", minHeight:"100vh" }}>

        {/* Top bar */}
        <div style={{ background:"var(--white)", borderBottom:"1px solid var(--border)", padding:"0 28px", height:"56px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:40 }}>
          <div>
            <span style={{ fontSize:"15px", fontWeight:"500", color:"var(--text)" }}>
              {tabs.find(t => t.id === activeTab)?.label || "Dashboard"}
            </span>
          </div>
          <div style={{ fontSize:"12px", color:"var(--text-4)", fontFamily:"'DM Sans',sans-serif" }}>
  {new Date().toLocaleDateString("en-IN", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}
</div>
        </div>

        {/* Page content */}
        <div style={{ padding:"28px", flex:1 }}>
          {children}
        </div>

        {/* Footer */}
        <div style={{ borderTop:"1px solid var(--border)", background:"var(--white)", padding:"12px 28px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontSize:"11px", color:"var(--text-4)" }}>MedChain · Healthcare Record Security Platform · v1.0</span>
          <span style={{ fontSize:"11px", color:"var(--text-4)" }}>All records secured on Ethereum Sepolia Blockchain</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;