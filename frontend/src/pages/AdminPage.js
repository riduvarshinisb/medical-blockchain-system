import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { register, getUsers, deleteUser } from "../services/auth.js";
import { getReports, getBills } from "../services/blockchain.js";
import { getPatients, createPatient, updatePatient, deletePatient } from "../services/patients.js";
import BlockchainStatus from "../components/BlockchainStatus.js";
import Dashboard from "../components/Dashboard.js";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [editPatient, setEditPatient] = useState(null);
  const [newUser, setNewUser] = useState({ name:"", email:"", password:"", role:"doctor" });
  const [newPatient, setNewPatient] = useState({ name:"", age:"", gender:"", contact:"", address:"" });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [uR, rR, bR, pR] = await Promise.all([getUsers(), getReports(), getBills(), getPatients()]);
      if (uR.success) setUsers(uR.data);
      if (rR.success) setReports(rR.data);
      if (bR.success) setBills(bR.data);
      if (pR.success) setPatients(pR.data);
    } catch (err) { console.error(err); }
  };

  const handleAddUser = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await register(newUser);
      if (res.success) {
        toast.success("Staff account created");
        setShowUserForm(false);
        setNewUser({ name:"", email:"", password:"", role:"doctor" });
        fetchAll();
      }
    } catch (err) { toast.error(err.response?.data?.message || "Failed to create account"); }
    finally { setLoading(false); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Remove this staff account?")) return;
    try {
      const res = await deleteUser(id);
      if (res.success) { toast.success("Account removed"); fetchAll(); }
    } catch (err) { toast.error("Failed to remove account"); }
  };

  const handleAddPatient = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await createPatient(newPatient);
      if (res.success) {
        toast.success("Patient registered");
        setShowPatientForm(false);
        setNewPatient({ name:"", age:"", gender:"", contact:"", address:"" });
        fetchAll();
      }
    } catch (err) { toast.error(err.response?.data?.message || "Failed to register patient"); }
    finally { setLoading(false); }
  };

  const handleEditPatient = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await updatePatient(editPatient.id, newPatient);
      if (res.success) {
        toast.success("Patient updated");
        setShowPatientForm(false); setEditPatient(null);
        setNewPatient({ name:"", age:"", gender:"", contact:"", address:"" });
        fetchAll();
      }
    } catch (err) { toast.error("Failed to update patient"); }
    finally { setLoading(false); }
  };

  const handleDeletePatient = async (id) => {
    if (!window.confirm("Delete this patient and all their records?")) return;
    try {
      const res = await deletePatient(id);
      if (res.success) { toast.success("Patient removed"); fetchAll(); }
    } catch (err) { toast.error("Failed to delete patient"); }
  };

  const handleStartEditPatient = (patient) => {
    setEditPatient(patient);
    setNewPatient({ name:patient.name, age:patient.age||"", gender:patient.gender||"", contact:patient.contact||"", address:patient.address||"" });
    setShowPatientForm(true);
  };

  const tamperAlerts = [...reports, ...bills].filter(r => r.is_tampered);

  // ── Shared styles ─────────────────────────────────────────────────────────
  const S = {
    statGrid: { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"16px", marginBottom:"28px" },
    tableWrap: { background:"var(--white)", border:"1px solid var(--border)", borderRadius:"12px", overflow:"hidden" },
    tableHead: { display:"flex", padding:"10px 16px", background:"var(--bg)", borderBottom:"1px solid var(--border)" },
    tableRow: { display:"flex", padding:"13px 16px", borderBottom:"1px solid #f3f4f6", alignItems:"center", transition:"background 0.12s" },
    th: { fontSize:"11px", fontWeight:"600", color:"var(--text-4)", textTransform:"uppercase", letterSpacing:"0.6px" },
    td: { fontSize:"13px", color:"var(--text-2)" },
    formCard: { background:"var(--teal-faint)", border:"1px solid var(--teal-light)", borderRadius:"10px", padding:"20px", marginBottom:"16px" },
    formGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" },
    empty: { padding:"48px 24px", textAlign:"center", color:"var(--text-4)", fontSize:"13px" },
    sectionHeader: { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", borderBottom:"1px solid var(--border)" },
  };

  // ── Status badge ──────────────────────────────────────────────────────────
  const StatusBadge = ({ tampered }) => (
    <span className={tampered ? "badge badge-altered" : "badge badge-authentic"}>
      {tampered ? "Altered" : "Authentic"}
    </span>
  );

  // ── File link ─────────────────────────────────────────────────────────────
  const FileLink = ({ item }) => {
    if (item.is_tampered) return <span className="badge badge-blocked">Blocked</span>;
    if (!item.file_url) return <span style={{ color:"var(--text-4)", fontSize:"12px" }}>—</span>;
    return <a href={item.file_url} target="_blank" rel="noreferrer" style={{ fontSize:"12px", color:"var(--teal)", fontWeight:"500", textDecoration:"none" }}>View →</a>;
  };

  // ── Overview ──────────────────────────────────────────────────────────────
  const renderOverview = () => (
    <div className="animate-in">
      <div style={S.statGrid}>
        {[
          { label:"Staff Accounts", value:users.length, icon:null, color:"var(--teal)" },
{ label:"Medical Reports", value:reports.length, icon:null, color:"#3b82f6" },
{ label:"Pharmacy Bills", value:bills.length, icon:null, color:"#8b5cf6" },
{ label:"Tamper Alerts", value:tamperAlerts.length, icon:"⚠️", color: tamperAlerts.length > 0 ? "var(--red)" : "var(--green)" },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ fontSize:"11px", fontWeight:"600", color:"var(--text-4)", textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:"8px" }}>{s.label}</div>
                <div style={{ fontSize:"32px", fontWeight:"300", color:s.color, fontFamily:"'DM Serif Display',serif" }}>{s.value}</div>
              </div>
              {s.icon && <div style={{ fontSize:"22px", opacity:0.7 }}>{s.icon}</div>}
            </div>
          </div>
        ))}
      </div>

      {tamperAlerts.length > 0 && (
        <div style={{ background:"var(--red-light)", border:"1px solid #fecaca", borderRadius:"12px", marginBottom:"24px", overflow:"hidden" }}>
          <div style={{ padding:"14px 20px", borderBottom:"1px solid #fecaca", display:"flex", alignItems:"center", gap:"8px" }}>
            <span style={{ fontSize:"14px" }}>⚠️</span>
            <span style={{ fontSize:"13px", fontWeight:"600", color:"var(--red)" }}>Tamper Alerts — {tamperAlerts.length} record{tamperAlerts.length > 1 ? "s" : ""} flagged</span>
          </div>
          {tamperAlerts.map((item, i) => (
            <div key={i} className="tamper-alert-row">
              <div>
                <div style={{ fontSize:"13px", fontWeight:"500", color:"var(--text)" }}>{item.patient_name}</div>
                <div style={{ fontSize:"11px", color:"var(--text-3)", marginTop:"2px" }}>{item.report_type || `₹${item.bill_amount}`} · Uploaded by {item.uploaded_by_name} · {new Date(item.created_at).toLocaleDateString()}</div>
              </div>
              <span className="badge badge-altered">Record Altered</span>
            </div>
          ))}
        </div>
      )}

      <div style={S.tableWrap}>
        <div style={S.sectionHeader}>
          <span style={{ fontSize:"13px", fontWeight:"600", color:"var(--text)" }}>Recent Records</span>
          <span style={{ fontSize:"11px", color:"var(--text-4)" }}>{reports.length + bills.length} total</span>
        </div>
        {[...reports.map(r => ({...r, kind:"Report"})), ...bills.map(b => ({...b, kind:"Bill"}))].slice(0,8).length === 0 ? (
          <div style={S.empty}>No records yet</div>
        ) : (
          <>
            <div style={S.tableHead}>
              {["Patient","Type","Uploaded By","Status","Date","File"].map((h,i) => (
                <div key={i} style={{ ...S.th, flex:[2,1,2,1,1,1][i] }}>{h}</div>
              ))}
            </div>
            {[...reports.map(r => ({...r, kind:"Report"})), ...bills.map(b => ({...b, kind:"Bill"}))].slice(0,8).map(item => (
              <div key={item.id+item.kind} style={S.tableRow}
                onMouseEnter={e => e.currentTarget.style.background="var(--teal-faint)"}
                onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                <div style={{ ...S.td, flex:2, fontWeight:"500" }}>{item.patient_name}</div>
                <div style={{ flex:1 }}><span style={{ fontSize:"11px", padding:"2px 8px", borderRadius:"99px", background:"var(--bg)", border:"1px solid var(--border)", color:"var(--text-3)" }}>{item.kind}</span></div>
                <div style={{ ...S.td, flex:2 }}>{item.uploaded_by_name}</div>
                <div style={{ flex:1 }}><StatusBadge tampered={item.is_tampered} /></div>
                <div style={{ ...S.td, flex:1, fontSize:"12px", color:"var(--text-4)" }}>{new Date(item.created_at).toLocaleDateString()}</div>
                <div style={{ flex:1 }}><FileLink item={item} /></div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );

  // ── Manage Users ──────────────────────────────────────────────────────────
  const renderUsers = () => (
    <div className="animate-in">
      <div style={S.tableWrap}>
        <div style={S.sectionHeader}>
          <span style={{ fontSize:"13px", fontWeight:"600", color:"var(--text)" }}>Staff Accounts</span>
          <button className="btn-primary" onClick={() => setShowUserForm(!showUserForm)}>
            {showUserForm ? "Cancel" : "+ Add Staff"}
          </button>
        </div>

        {showUserForm && (
          <div style={{ padding:"20px", borderBottom:"1px solid var(--border)", background:"var(--teal-faint)" }}>
            <div style={{ fontSize:"12px", fontWeight:"600", color:"var(--teal)", marginBottom:"14px", textTransform:"uppercase", letterSpacing:"0.5px" }}>New Staff Account</div>
            <form onSubmit={handleAddUser}>
              <div style={S.formGrid}>
                <div><label className="form-label">Full Name</label><input value={newUser.name} onChange={e => setNewUser({...newUser, name:e.target.value})} required placeholder="Dr. Firstname Lastname" className="form-input" /></div>
                <div><label className="form-label">Email</label><input type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email:e.target.value})} required placeholder="staff@hospital.com" className="form-input" /></div>
                <div><label className="form-label">Password</label><input type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password:e.target.value})} required placeholder="Min 8 characters" className="form-input" /></div>
                <div><label className="form-label">Role</label>
                  <select value={newUser.role} onChange={e => setNewUser({...newUser, role:e.target.value})} className="form-input">
                    <option value="doctor">Doctor</option>
                    <option value="lab">Lab Staff</option>
                    <option value="pharmacy">Pharmacy Admin</option>
                    <option value="admin">Hospital Admin</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop:"14px", display:"flex", gap:"10px" }}>
                <button type="submit" disabled={loading} className="btn-primary">{loading ? "Creating..." : "Create Account →"}</button>
                <button type="button" className="btn-ghost" onClick={() => setShowUserForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {users.length === 0 ? <div style={S.empty}>No staff accounts found</div> : (
          <>
            <div style={S.tableHead}>
              {["Name","Email","Role","Actions"].map((h,i) => (
                <div key={i} style={{ ...S.th, flex:[2,3,1,1][i] }}>{h}</div>
              ))}
            </div>
            {users.map(u => (
              <div key={u.id} style={S.tableRow}
                onMouseEnter={e => e.currentTarget.style.background="var(--teal-faint)"}
                onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                <div style={{ ...S.td, flex:2, fontWeight:"500" }}>{u.name}</div>
                <div style={{ ...S.td, flex:3, color:"var(--text-3)" }}>{u.email}</div>
                <div style={{ flex:1 }}>
                  <span style={{ fontSize:"11px", padding:"2px 10px", borderRadius:"99px", background:"var(--teal-light)", color:"var(--teal-dark)", fontWeight:"500" }}>{u.role}</span>
                </div>
                <div style={{ flex:1 }}>
                  <button onClick={() => handleDeleteUser(u.id)} style={{ fontSize:"12px", color:"var(--red)", background:"none", border:"none", cursor:"pointer", padding:"4px 8px", borderRadius:"6px" }}
                    onMouseEnter={e => e.currentTarget.style.background="var(--red-light)"}
                    onMouseLeave={e => e.currentTarget.style.background="none"}>Remove</button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );

  // ── Patients ──────────────────────────────────────────────────────────────
  const renderPatients = () => (
    <div className="animate-in">
      <div style={S.tableWrap}>
        <div style={S.sectionHeader}>
          <span style={{ fontSize:"13px", fontWeight:"600", color:"var(--text)" }}>Patient Registry</span>
          <button className="btn-primary" onClick={() => { setShowPatientForm(!showPatientForm); setEditPatient(null); setNewPatient({ name:"", age:"", gender:"", contact:"", address:"" }); }}>
            {showPatientForm && !editPatient ? "Cancel" : "+ Register Patient"}
          </button>
        </div>

        {showPatientForm && (
          <div style={{ padding:"20px", borderBottom:"1px solid var(--border)", background:"var(--teal-faint)" }}>
            <div style={{ fontSize:"12px", fontWeight:"600", color:"var(--teal)", marginBottom:"14px", textTransform:"uppercase", letterSpacing:"0.5px" }}>
              {editPatient ? `Editing Patient #${editPatient.id}` : "Register New Patient"}
            </div>
            <form onSubmit={editPatient ? handleEditPatient : handleAddPatient}>
              <div style={S.formGrid}>
                <div><label className="form-label">Full Name</label><input value={newPatient.name} onChange={e => setNewPatient({...newPatient, name:e.target.value})} required placeholder="Patient full name" className="form-input" /></div>
                <div><label className="form-label">Age</label><input type="number" value={newPatient.age} onChange={e => setNewPatient({...newPatient, age:e.target.value})} placeholder="Age" min="0" max="150" className="form-input" /></div>
                <div><label className="form-label">Gender</label>
                  <select value={newPatient.gender} onChange={e => setNewPatient({...newPatient, gender:e.target.value})} className="form-input">
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div><label className="form-label">Contact</label><input value={newPatient.contact} onChange={e => setNewPatient({...newPatient, contact:e.target.value})} placeholder="Phone number" className="form-input" /></div>
                <div style={{ gridColumn:"span 2" }}><label className="form-label">Address</label><input value={newPatient.address} onChange={e => setNewPatient({...newPatient, address:e.target.value})} placeholder="Full address" className="form-input" /></div>
              </div>
              <div style={{ marginTop:"14px", display:"flex", gap:"10px" }}>
                <button type="submit" disabled={loading} className="btn-primary">{loading ? "Saving..." : editPatient ? "Save Changes →" : "Register Patient →"}</button>
                <button type="button" className="btn-ghost" onClick={() => { setShowPatientForm(false); setEditPatient(null); setNewPatient({ name:"", age:"", gender:"", contact:"", address:"" }); }}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {patients.length === 0 ? <div style={S.empty}>No patients registered yet</div> : (
          <>
            <div style={S.tableHead}>
              {["ID","Name","Age","Gender","Contact","Registered","Actions"].map((h,i) => (
                <div key={i} style={{ ...S.th, flex:[0.5,2,0.8,0.8,1.5,1,1][i] }}>{h}</div>
              ))}
            </div>
            {patients.map(p => (
              <div key={p.id} style={S.tableRow}
                onMouseEnter={e => e.currentTarget.style.background="var(--teal-faint)"}
                onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                <div style={{ ...S.td, flex:0.5, color:"var(--text-4)", fontSize:"12px" }}>#{p.id}</div>
                <div style={{ ...S.td, flex:2, fontWeight:"500" }}>{p.name}</div>
                <div style={{ ...S.td, flex:0.8 }}>{p.age || "—"}</div>
                <div style={{ ...S.td, flex:0.8, textTransform:"capitalize" }}>{p.gender || "—"}</div>
                <div style={{ ...S.td, flex:1.5, color:"var(--text-3)" }}>{p.contact || "—"}</div>
                <div style={{ ...S.td, flex:1, fontSize:"12px", color:"var(--text-4)" }}>{new Date(p.created_at).toLocaleDateString()}</div>
                <div style={{ flex:1, display:"flex", gap:"8px" }}>
                  <button onClick={() => handleStartEditPatient(p)} style={{ fontSize:"12px", color:"var(--teal)", background:"none", border:"none", cursor:"pointer", padding:"4px 8px", borderRadius:"6px" }}
                    onMouseEnter={e => e.currentTarget.style.background="var(--teal-faint)"}
                    onMouseLeave={e => e.currentTarget.style.background="none"}>Edit</button>
                  <button onClick={() => handleDeletePatient(p.id)} style={{ fontSize:"12px", color:"var(--red)", background:"none", border:"none", cursor:"pointer", padding:"4px 8px", borderRadius:"6px" }}
                    onMouseEnter={e => e.currentTarget.style.background="var(--red-light)"}
                    onMouseLeave={e => e.currentTarget.style.background="none"}>Remove</button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );

  // ── Records (Reports/Bills) ───────────────────────────────────────────────
  const renderRecords = (items, kind) => (
    <div className="animate-in">
      <div style={S.tableWrap}>
        <div style={S.sectionHeader}>
          <span style={{ fontSize:"13px", fontWeight:"600", color:"var(--text)" }}>{kind === "report" ? "Medical Reports" : "Pharmacy Bills"}</span>
          <span style={{ fontSize:"11px", color:"var(--text-4)" }}>{items.length} record{items.length !== 1 ? "s" : ""}</span>
        </div>
        {items.length === 0 ? <div style={S.empty}>No {kind === "report" ? "reports" : "bills"} yet</div> : (
          <>
            <div style={S.tableHead}>
              {["ID","Patient", kind === "report" ? "Type" : "Amount","Uploaded By","Status","Date","File"].map((h,i) => (
                <div key={i} style={{ ...S.th, flex:[0.5,2,1.2,2,1,1,1][i] }}>{h}</div>
              ))}
            </div>
            {items.map(item => (
              <div key={item.id} style={S.tableRow}
                onMouseEnter={e => e.currentTarget.style.background="var(--teal-faint)"}
                onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                <div style={{ ...S.td, flex:0.5, color:"var(--text-4)", fontSize:"12px" }}>#{item.id}</div>
                <div style={{ ...S.td, flex:2, fontWeight:"500" }}>{item.patient_name}</div>
                <div style={{ ...S.td, flex:1.2, color:"var(--text-3)" }}>{kind === "report" ? item.report_type?.replace("_"," ") : `₹${parseFloat(item.bill_amount).toLocaleString()}`}</div>
                <div style={{ ...S.td, flex:2, color:"var(--text-3)" }}>{item.uploaded_by_name}</div>
                <div style={{ flex:1 }}><StatusBadge tampered={item.is_tampered} /></div>
                <div style={{ ...S.td, flex:1, fontSize:"12px", color:"var(--text-4)" }}>{new Date(item.created_at).toLocaleDateString()}</div>
                <div style={{ flex:1 }}><FileLink item={item} /></div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );

  return (
    <Dashboard activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === "overview" && renderOverview()}
      {activeTab === "users" && renderUsers()}
      {activeTab === "patients" && renderPatients()}
      {activeTab === "reports" && renderRecords(reports, "report")}
      {activeTab === "bills" && renderRecords(bills, "bill")}
      {activeTab === "audit" && <BlockchainStatus />}
    </Dashboard>
  );
};

export default AdminPage;