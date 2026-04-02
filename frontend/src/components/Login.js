import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { login } from "../services/auth.js";
import { useAuth } from "../context/AuthContext.js";

const S = {
  wrap: { minHeight:"100vh", display:"flex", fontFamily:"'IBM Plex Sans',sans-serif", background:"#f5f4f0" },
  left: { flex:1, background:"#fff", borderRight:"1px solid #e0ddd6", padding:"60px", display:"flex", flexDirection:"column", justifyContent:"space-between" },
  right: { width:"460px", padding:"60px", display:"flex", flexDirection:"column", justifyContent:"center" },
  logo: { display:"flex", alignItems:"center", gap:"10px", marginBottom:"64px" },
  logoDot: { width:"9px", height:"9px", borderRadius:"50%", background:"#22c55e" },
  logoText: { fontFamily:"'IBM Plex Mono',monospace", fontSize:"13px", fontWeight:"600", letterSpacing:"2px", color:"#1a1a1a" },
  logoSub: { fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", color:"#999", letterSpacing:"1px" },
  headline: { fontSize:"42px", fontWeight:"600", lineHeight:"1.15", color:"#1a1a1a", marginBottom:"16px" },
  headlineSub: { fontSize:"15px", color:"#666", lineHeight:"1.7", maxWidth:"380px", marginBottom:"48px" },
  featureRow: { display:"flex", alignItems:"flex-start", gap:"16px", paddingBottom:"20px", borderBottom:"1px solid #e0ddd6", marginBottom:"20px" },
  featureIcon: { width:"32px", height:"32px", background:"#f5f4f0", border:"1px solid #e0ddd6", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px", flexShrink:0 },
  featureTitle: { fontSize:"13px", fontWeight:"600", color:"#1a1a1a", marginBottom:"2px" },
  featureSub: { fontSize:"12px", color:"#888", lineHeight:"1.5" },
  networkBadge: { display:"flex", alignItems:"center", gap:"8px" },
  networkDot: { width:"7px", height:"7px", borderRadius:"50%", background:"#22c55e" },
  networkText: { fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", color:"#999", letterSpacing:"1px" },
  formLabel: { display:"block", fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", letterSpacing:"1.5px", color:"#999", marginBottom:"8px", textTransform:"uppercase" },
  input: { width:"100%", padding:"11px 14px", border:"1px solid #e0ddd6", background:"#fff", fontSize:"14px", fontFamily:"'IBM Plex Sans',sans-serif", color:"#1a1a1a", outline:"none", boxSizing:"border-box" },
  btn: { width:"100%", padding:"12px", background:"#1a1a1a", color:"#fff", border:"none", fontFamily:"'IBM Plex Mono',monospace", fontSize:"12px", letterSpacing:"1.5px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"10px" },
  divider: { height:"1px", background:"#e0ddd6", margin:"32px 0" },
  roleGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" },
  roleCard: { padding:"10px 12px", border:"1px solid #e0ddd6", background:"#fff" },
  roleTitle: { fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", letterSpacing:"1px", color:"#1a1a1a", fontWeight:"600" },
  roleSub: { fontSize:"11px", color:"#999", marginTop:"2px" },
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        loginUser(res.data.user, res.data.token);
        toast.success(`Welcome, ${res.data.user.name}`);
        const role = res.data.user.role;
        if (role === "admin") navigate("/admin");
        else if (role === "doctor") navigate("/doctor");
        else if (role === "pharmacy") navigate("/pharmacy");
        else if (role === "lab") navigate("/lab");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon:"🔒", title:"Tamper-proof records", desc:"Every document is fingerprinted. Any modification is instantly detected." },
    { icon:"👁️", title:"Complete audit trail", desc:"Every action logged — who uploaded, who accessed, when." },
    { icon:"🛡️", title:"Role-based access", desc:"Staff only see what they are authorised to see." },
    { icon:"⛓️", title:"Immutable storage", desc:"Records secured on blockchain. Cannot be deleted or altered." },
  ];

  const roles = [
    { title:"HOSPITAL ADMIN", desc:"Full system access" },
    { title:"DOCTOR", desc:"View patient records" },
    { title:"PHARMACY", desc:"Upload bills" },
    { title:"LAB STAFF", desc:"Upload reports" },
  ];

  return (
    <div style={S.wrap}>
      <div style={S.left}>
        <div>
          <div style={S.logo}>
            <div style={S.logoDot} />
            <div>
              <div style={S.logoText}>MEDCHAIN</div>
              <div style={S.logoSub}>SECURE HEALTHCARE RECORDS</div>
            </div>
          </div>
          <div style={S.headline}>Healthcare records<br />you can trust.</div>
          <div style={S.headlineSub}>A tamper-proof system for managing medical reports and pharmacy bills. Built for hospitals that take data integrity seriously.</div>
          {features.map((f, i) => (
            <div key={i} style={S.featureRow}>
              <div style={S.featureIcon}>{f.icon}</div>
              <div>
                <div style={S.featureTitle}>{f.title}</div>
                <div style={S.featureSub}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={S.networkBadge}>
          <div style={S.networkDot} />
          <div style={S.networkText}>BLOCKCHAIN NETWORK ACTIVE</div>
        </div>
      </div>

      <div style={S.right}>
        <div style={{ marginBottom:"40px" }}>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", letterSpacing:"2px", color:"#999", marginBottom:"12px" }}>AUTHORISED ACCESS ONLY</div>
          <div style={{ fontSize:"26px", fontWeight:"600", color:"#1a1a1a" }}>Sign in to your account</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
          <div>
            <label style={S.formLabel}>Email address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@hospital.com" style={S.input} onFocus={e => e.target.style.borderColor="#1a1a1a"} onBlur={e => e.target.style.borderColor="#e0ddd6"} />
          </div>
          <div>
            <label style={S.formLabel}>Password</label>
            <div style={{ position:"relative" }}>
              <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" style={{ ...S.input, paddingRight:"44px" }} onFocus={e => e.target.style.borderColor="#1a1a1a"} onBlur={e => e.target.style.borderColor="#e0ddd6"} />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:"14px", color:"#999" }}>
                {showPw ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} style={{ ...S.btn, opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? <><span className="spinner" /> AUTHENTICATING...</> : "SIGN IN →"}
          </button>
        </form>

        <div style={S.divider} />

        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", letterSpacing:"1.5px", color:"#999", marginBottom:"12px" }}>SYSTEM ROLES</div>
        <div style={S.roleGrid}>
          {roles.map((r, i) => (
            <div key={i} style={S.roleCard}>
              <div style={S.roleTitle}>{r.title}</div>
              <div style={S.roleSub}>{r.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop:"32px", fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", color:"#bbb", lineHeight:"1.8", letterSpacing:"0.5px" }}>
          All sessions are monitored and logged.<br />
          Unauthorised access attempts are recorded.
        </div>
      </div>
    </div>
  );
};

export default Login;