import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import { toast } from "react-toastify";

const S = {
  wrap: { minHeight:"100vh", display:"flex", flexDirection:"column", fontFamily:"'IBM Plex Sans',sans-serif", background:"#f5f4f0" },
  nav: { background:"#fff", borderBottom:"1px solid #e0ddd6", padding:"0 32px", display:"flex", alignItems:"center", justifyContent:"space-between", height:"52px", position:"sticky", top:0, zIndex:100 },
  navLeft: { display:"flex", alignItems:"center", gap:"24px" },
  logo: { display:"flex", alignItems:"center", gap:"10px" },
  logoDot: { width:"8px", height:"8px", borderRadius:"50%", background:"#22c55e" },
  logoText: { fontFamily:"'IBM Plex Mono',monospace", fontSize:"13px", fontWeight:"600", letterSpacing:"2px", color:"#1a1a1a" },
  logoSub: { fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", color:"#888", letterSpacing:"1px" },
  navRight: { display:"flex", alignItems:"center", gap:"20px" },
  userInfo: { textAlign:"right" },
  userName: { fontSize:"13px", fontWeight:"600", color:"#1a1a1a" },
  userRole: { fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", letterSpacing:"1px", color:"#555" },
  logoutBtn: { fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", letterSpacing:"1px", padding:"6px 16px", border:"1px solid #e0ddd6", background:"#fff", color:"#666", cursor:"pointer" },
  tabs: { background:"#fff", borderBottom:"1px solid #e0ddd6", padding:"0 32px", display:"flex", gap:"0" },
  tab: { fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", letterSpacing:"1.5px", color:"#555", padding:"14px 20px", borderBottom:"2px solid transparent", cursor:"pointer", whiteSpace:"nowrap" },
  tabActive: { color:"#1a1a1a", borderBottom:"2px solid #1a1a1a" },
  body: { padding:"32px", flex:1 },
  footer: { borderTop:"1px solid #e0ddd6", background:"#fff", padding:"12px 32px", display:"flex", alignItems:"center", justifyContent:"space-between" },
  footerLeft: { display:"flex", alignItems:"center", gap:"8px" },
  footerDot: { width:"6px", height:"6px", borderRadius:"50%", background:"#22c55e" },
  footerText: { fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", color:"#bbb", letterSpacing:"0.5px" },
};

const getRoleTabs = (role) => {
  if (role === "admin") return [
    { id:"overview", label:"OVERVIEW" },
    { id:"users", label:"MANAGE USERS" },
    { id:"reports", label:"REPORTS" },
    { id:"bills", label:"BILLS" },
    { id:"audit", label:"AUDIT LOG" },
  ];
  if (role === "doctor") return [
  { id:"reports", label:"PATIENT REPORTS" },
  { id:"bills", label:"PHARMACY BILLS" },
  ];
  if (role === "pharmacy") return [
    { id:"upload", label:"UPLOAD BILL" },
    { id:"history", label:"BILL HISTORY" },
  ];
  if (role === "lab") return [
    { id:"upload", label:"UPLOAD REPORT" },
    { id:"history", label:"REPORT HISTORY" },
  ];
  return [];
};

const getDefaultTab = (role) => {
  if (role === "admin") return "overview";
  if (role === "doctor") return "reports";
  return "upload";
};

export const useDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState(getDefaultTab(user?.role));
  return { activeTab, setActiveTab };
};

const Dashboard = ({ children, activeTab, setActiveTab }) => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const tabs = getRoleTabs(user?.role);

  const handleLogout = () => {
    logoutUser();
    toast.success("Signed out successfully");
    navigate("/login");
  };

  return (
    <div style={S.wrap}>
      <nav style={S.nav}>
        <div style={S.navLeft}>
          <div style={S.logo}>
            <div style={S.logoDot} />
            <div>
              <div style={S.logoText}>MEDCHAIN</div>
            </div>
          </div>
          <div style={{ width:"1px", height:"20px", background:"#e0ddd6" }} />
          <div style={S.logoSub}>SECURE HEALTHCARE RECORDS</div>
        </div>
        <div style={S.navRight}>
          <div style={S.userInfo}>
            <div style={S.userName}>{user?.name}</div>
            <div style={S.userRole}>{user?.role?.toUpperCase()}</div>
          </div>
          <div style={{ width:"1px", height:"20px", background:"#e0ddd6" }} />
          <button onClick={handleLogout} style={S.logoutBtn}>SIGN OUT</button>
        </div>
      </nav>

      <div style={S.tabs}>
        {tabs.map(tab => (
          <div key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ ...S.tab, ...(activeTab === tab.id ? S.tabActive : {}) }}>
            {tab.label}
          </div>
        ))}
      </div>

      <div style={S.body}>
        {children}
      </div>

      <div style={S.footer}>
        <div style={S.footerLeft}>
          <div style={S.footerDot} />
          <div style={S.footerText}>BLOCKCHAIN NETWORK ACTIVE · ALL RECORDS SECURED</div>
        </div>
        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", color:"#bbb" }}>
          MEDCHAIN v1.0
        </div>
      </div>
    </div>
  );
};

export default Dashboard;