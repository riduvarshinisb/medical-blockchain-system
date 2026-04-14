import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { login } from "../services/auth.js";
import { useAuth } from "../context/AuthContext.js";

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
        toast.success(`Welcome back, ${res.data.user.name}`);
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

  return (
    <div style={{ minHeight:"100vh", display:"flex", background:"var(--white)", fontFamily:"'DM Sans',sans-serif" }}>

      {/* Left — Brand Panel */}
      <div style={{ width:"520px", background:"var(--navy)", display:"flex", flexDirection:"column", justifyContent:"space-between", padding:"48px", position:"relative", overflow:"hidden" }}>

        {/* Decorative circles */}
        <div style={{ position:"absolute", top:"-80px", right:"-80px", width:"320px", height:"320px", borderRadius:"50%", border:"1px solid rgba(255,255,255,0.06)" }} />
        <div style={{ position:"absolute", top:"-40px", right:"-40px", width:"200px", height:"200px", borderRadius:"50%", border:"1px solid rgba(255,255,255,0.06)" }} />
        <div style={{ position:"absolute", bottom:"-100px", left:"-60px", width:"280px", height:"280px", borderRadius:"50%", border:"1px solid rgba(255,255,255,0.06)" }} />

        {/* Top section — Logo + Heading */}
        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ marginBottom:"48px" }}>
            <img src="/logo.png" alt="MedChain" style={{ height:"100px", objectFit:"contain" }} />
          </div>

          <h1 style={{ fontSize:"36px", fontFamily:"'DM Serif Display',serif", color:"white", lineHeight:"1.2", marginBottom:"16px" }}>
            Tamper-proof records.<br />
            <span style={{ color:"var(--teal)" }}>Verified by blockchain.</span>
          </h1>
          <p style={{ fontSize:"14px", color:"rgba(255,255,255,0.55)", lineHeight:"1.8", maxWidth:"380px" }}>
            MedChain ensures every medical report and pharmacy bill is cryptographically secured. Any modification is detected instantly — automatically, on every access.
          </p>
        </div>

        {/* Bottom section — Feature list */}
        <div style={{ position:"relative", zIndex:1 }}>
          {[
            { text:"SHA-256 cryptographic hashing on every file" },
            { text:"Permanent hash storage on Ethereum Sepolia" },
            { text:"Real-time automatic tamper detection" },
            { text:"Role-based access for all stakeholders" },
          ].map((f, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"14px" }}>
              <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:"var(--teal)", flexShrink:0 }} />
              <span style={{ fontSize:"13px", color:"rgba(255,255,255,0.6)" }}>{f.text}</span>
            </div>
          ))}

          <div style={{ marginTop:"32px", paddingTop:"24px", borderTop:"1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ fontSize:"11px", color:"rgba(255,255,255,0.25)", letterSpacing:"0.5px" }}>MEDCHAIN · HEALTHCARE RECORD SECURITY</span>
          </div>
        </div>
      </div>

      {/* Right — Login Form */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"48px", background:"#fafafa" }}>
        <div style={{ width:"100%", maxWidth:"400px" }}>

          {/* Header */}
          <div style={{ marginBottom:"36px" }}>
            <div style={{ fontSize:"11px", fontWeight:"600", color:"var(--teal)", letterSpacing:"1px", textTransform:"uppercase", marginBottom:"8px" }}>Authorised Access Only</div>
            <h2 style={{ fontSize:"28px", fontFamily:"'DM Serif Display',serif", color:"var(--text)", marginBottom:"6px" }}>Sign in to MedChain</h2>
            <p style={{ fontSize:"13px", color:"var(--text-3)", lineHeight:"1.6" }}>All sessions are monitored and logged for security compliance.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
            <div>
              <label className="form-label">Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="staff@hospital.com" className="form-input" />
            </div>

            <div>
              <label className="form-label">Password</label>
              <div style={{ position:"relative" }}>
                <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" className="form-input" style={{ paddingRight:"42px" }} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:"14px", color:"var(--text-4)" }}>
                  {showPw ? "hide" : "show"}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary"
              style={{ width:"100%", justifyContent:"center", padding:"11px", fontSize:"14px", marginTop:"4px" }}>
              {loading ? <><span className="spinner" /> Verifying identity...</> : "Sign In →"}
            </button>
          </form>

          {/* Role cards */}
          <div style={{ marginTop:"36px", paddingTop:"28px", borderTop:"1px solid var(--border)" }}>
            <div style={{ fontSize:"11px", fontWeight:"600", color:"var(--text-4)", letterSpacing:"0.8px", textTransform:"uppercase", marginBottom:"14px" }}>System Roles</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
              {[
                { role:"Hospital Admin", desc:"Full system access", color:"#134e4a" },
                { role:"Doctor", desc:"View patient records", color:"#1e40af" },
                { role:"Pharmacy Admin", desc:"Upload pharmacy bills", color:"#6d28d9" },
                { role:"Lab Staff", desc:"Upload lab reports", color:"#92400e" },
              ].map((r, i) => (
                <div key={i} style={{ padding:"10px 12px", border:"1px solid var(--border)", borderRadius:"8px", background:"var(--white)" }}>
                  <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:r.color, display:"inline-block", marginRight:"7px", verticalAlign:"middle" }} />
                  <span style={{ fontWeight:"500", color:"var(--text-2)", fontSize:"12px" }}>{r.role}</span>
                  <div style={{ fontSize:"11px", color:"var(--text-4)", marginTop:"3px" }}>{r.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <p style={{ marginTop:"24px", fontSize:"11px", color:"var(--text-4)", lineHeight:"1.7", textAlign:"center" }}>
            Protected by JWT authentication and bcrypt encryption.<br />
            Unauthorized access is prohibited and will be reported.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;