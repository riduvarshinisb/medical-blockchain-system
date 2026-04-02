import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Dashboard from "../components/Dashboard.js";
import UploadReport from "../components/UploadReport.js";
import UploadBill from "../components/UploadBill.js";
import BlockchainStatus from "../components/BlockchainStatus.js";
import { register, getUsers, deleteUser } from "../services/auth.js";
import { getReports, getBills } from "../services/blockchain.js";
import { getPatients, createPatient, updatePatient, deletePatient } from "../services/patients.js";

const S = {
  sectionLabel: { fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", letterSpacing:"2px", color:"#999", marginBottom:"24px", paddingBottom:"12px", borderBottom:"1px solid #e0ddd6" },
  statsGrid: { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1px", background:"#e0ddd6", border:"1px solid #e0ddd6", marginBottom:"24px" },
  stat: { background:"#fff", padding:"24px" },
  statVal: { fontFamily:"'IBM Plex Mono',monospace", fontSize:"32px", fontWeight:"600", lineHeight:"1" },
  statLabel: { fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", letterSpacing:"1.5px", color:"#999", marginTop:"8px" },
  tableWrap: { background:"#fff", border:"1px solid #e0ddd6" },
  tableHeader: { padding:"14px 20px", borderBottom:"1px solid #e0ddd6", display:"flex", alignItems:"center", justifyContent:"space-between" },
  tableTitle: { fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", letterSpacing:"2px", color:"#999" },
  addBtn: { fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", letterSpacing:"1px", padding:"6px 14px", border:"1px solid #1a1a1a", background:"#1a1a1a", color:"#fff", cursor:"pointer" },
  row: { padding:"14px 20px", borderBottom:"1px solid #f0ede8", display:"flex", alignItems:"center" },
  td: { fontSize:"13px", color:"#1a1a1a", fontWeight:"500" },
  badge: { fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", padding:"3px 8px", display:"inline-block" },
  formWrap: { background:"#fafaf8", border:"1px solid #e0ddd6", borderTop:"none", padding:"24px" },
  formGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" },
  label: { display:"block", fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", letterSpacing:"1.5px", color:"#999", marginBottom:"8px" },
  input: { width:"100%", padding:"10px 14px", border:"1px solid #e0ddd6", background:"#fff", fontSize:"14px", fontFamily:"'IBM Plex Sans',sans-serif", color:"#1a1a1a", outline:"none", boxSizing:"border-box" },
  select: { width:"100%", padding:"10px 14px", border:"1px solid #e0ddd6", background:"#fff", fontSize:"14px", fontFamily:"'IBM Plex Sans',sans-serif", color:"#1a1a1a", outline:"none", boxSizing:"border-box" },
  submitBtn: { padding:"10px 24px", background:"#1a1a1a", color:"#fff", border:"none", fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", letterSpacing:"1px", cursor:"pointer" },
  deleteBtn: { fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", letterSpacing:"0.5px", color:"#dc2626", border:"none", background:"none", cursor:"pointer", padding:"0" },
  empty: { padding:"48px", textAlign:"center", fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:"#bbb", letterSpacing:"1px" },
  alertRow: { padding:"16px 20px", borderBottom:"1px solid #f0ede8", display:"flex", alignItems:"center", justifyContent:"space-between", borderLeft:"3px solid #dc2626", background:"#fef2f2" },
  alertName: { fontSize:"14px", fontWeight:"500", color:"#1a1a1a" },
  alertMeta: { fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", color:"#999", marginTop:"3px" },
  alertBadge: { fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", color:"#dc2626", letterSpacing:"1px" },
};

const getRoleBadgeStyle = (role) => {
  const map = {
    admin: { background:"#fef2f2", color:"#dc2626", border:"1px solid #fecaca" },
    doctor: { background:"#f0fdf4", color:"#16a34a", border:"1px solid #bbf7d0" },
    pharmacy: { background:"#f5f3ff", color:"#7c3aed", border:"1px solid #ddd6fe" },
    lab: { background:"#fffbeb", color:"#d97706", border:"1px solid #fde68a" },
  };
  return map[role] || { background:"#f5f4f0", color:"#666", border:"1px solid #e0ddd6" };
};

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState([]);
const [reports, setReports] = useState([]);
const [bills, setBills] = useState([]);
const [patients, setPatients] = useState([]);
const [showPatientForm, setShowPatientForm] = useState(false);
const [editPatient, setEditPatient] = useState(null);
const [newPatient, setNewPatient] = useState({ name:"", age:"", gender:"", contact:"", address:"" });
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [newUser, setNewUser] = useState({ name:"", email:"", password:"", role:"doctor" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
  try {
    const [usersRes, reportsRes, billsRes, patientsRes] = await Promise.all([
      getUsers(), getReports(), getBills(), getPatients()
    ]);
    if (usersRes.success) setUsers(usersRes.data);
    if (reportsRes.success) setReports(reportsRes.data);
    if (billsRes.success) setBills(billsRes.data);
    if (patientsRes.success) setPatients(patientsRes.data);
  } catch (err) {
    console.error(err);
  }
};

  const handleAddUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await register(newUser.name, newUser.email, newUser.password, newUser.role);
      if (res.success) {
        toast.success("User created successfully");
        setShowForm(false);
        setNewUser({ name:"", email:"", password:"", role:"doctor" });
        fetchAll();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (user) => {
  setEditUser(user);
  setNewUser({ name: user.name, email: user.email, password: "", role: user.role });
  setShowForm(true);
};

const handleEditUser = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const updateData = {
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };
    if (newUser.password) {
      updateData.password = newUser.password;
    }
    const response = await fetch(`http://localhost:5000/api/auth/users/${editUser.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(updateData),
    });
    const res = await response.json();
    if (res.success) {
      toast.success("User updated successfully");
      setShowForm(false);
      setEditUser(null);
      setNewUser({ name:"", email:"", password:"", role:"doctor" });
      fetchAll();
    } else {
      toast.error(res.message || "Failed to update user");
    }
  } catch (err) {
    toast.error("Failed to update user");
  } finally {
    setLoading(false);
  }
};

const handleAddPatient = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const res = await createPatient(newPatient);
    if (res.success) {
      toast.success("Patient added successfully");
      setShowPatientForm(false);
      setNewPatient({ name:"", age:"", gender:"", contact:"", address:"" });
      fetchAll();
    }
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to add patient");
  } finally {
    setLoading(false);
  }
};

const handleEditPatient = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const res = await updatePatient(editPatient.id, newPatient);
    if (res.success) {
      toast.success("Patient updated successfully");
      setShowPatientForm(false);
      setEditPatient(null);
      setNewPatient({ name:"", age:"", gender:"", contact:"", address:"" });
      fetchAll();
    }
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to update patient");
  } finally {
    setLoading(false);
  }
};

const handleDeletePatient = async (id) => {
  if (!window.confirm("Delete this patient? This will also delete their records.")) return;
  try {
    const res = await deletePatient(id);
    if (res.success) {
      toast.success("Patient removed");
      fetchAll();
    }
  } catch (err) {
    toast.error("Failed to delete patient");
  }
};

const handleStartEditPatient = (patient) => {
  setEditPatient(patient);
  setNewPatient({
    name: patient.name,
    age: patient.age || "",
    gender: patient.gender || "",
    contact: patient.contact || "",
    address: patient.address || "",
  });
  setShowPatientForm(true);
};

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      const res = await deleteUser(id);
      if (res.success) {
        toast.success("User removed");
        fetchAll();
      }
    } catch (err) {
      toast.error("Failed to delete user");
    }
  };

  const tamperedReports = reports.filter(r => r.is_tampered);
  const tamperedBills = bills.filter(b => b.is_tampered);
  const allTampered = [...tamperedReports.map(r => ({ ...r, kind:"Report" })), ...tamperedBills.map(b => ({ ...b, kind:"Bill" }))];

  const renderOverview = () => (
    <div>
      <div style={S.sectionLabel}>SYSTEM OVERVIEW</div>
      <div style={S.statsGrid}>
        {[
          { val: users.length, label:"STAFF ACCOUNTS", color:"#1a1a1a" },
          { val: reports.length, label:"MEDICAL REPORTS", color:"#1a1a1a" },
          { val: bills.length, label:"PHARMACY BILLS", color:"#1a1a1a" },
          { val: allTampered.length, label:"TAMPER ALERTS", color: allTampered.length > 0 ? "#dc2626" : "#16a34a" },
        ].map((s, i) => (
          <div key={i} style={S.stat}>
            <div style={{ ...S.statVal, color: s.color }}>{s.val}</div>
            <div style={S.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {allTampered.length > 0 && (
        <div style={{ ...S.tableWrap, marginBottom:"24px" }}>
          <div style={S.tableHeader}>
            <div style={{ ...S.tableTitle, color:"#dc2626" }}>TAMPER ALERTS</div>
          </div>
          {allTampered.map((item, i) => (
            <div key={i} style={S.alertRow}>
              <div>
                <div style={S.alertName}>{item.patient_name}</div>
                <div style={S.alertMeta}>{item.kind} · Uploaded by {item.uploaded_by_name} · {new Date(item.created_at).toLocaleDateString()}</div>
              </div>
              <div style={S.alertBadge}>RECORD ALTERED</div>
            </div>
          ))}
        </div>
      )}

      <div style={S.tableWrap}>
        <div style={S.tableHeader}>
          <div style={S.tableTitle}>RECENT RECORDS</div>
        </div>
        {[...reports, ...bills].slice(0, 8).length === 0 ? (
          <div style={S.empty}>NO RECORDS YET</div>
        ) : (
          [...reports.map(r => ({ ...r, kind:"Report" })), ...bills.map(b => ({ ...b, kind:"Bill" }))].slice(0, 8).map((item, i) => (
            <div key={i} style={S.row}>
              <div style={{ ...S.td, flex:2, fontWeight:"500", color:"#1a1a1a" }}>{item.patient_name}</div>
              <div style={{ ...S.td, flex:1 }}>
                <span style={{ ...S.badge, background:"#f5f4f0", color:"#666", border:"1px solid #e0ddd6" }}>{item.kind}</span>
              </div>
              <div style={{ ...S.td, flex:1.5 }}>{item.uploaded_by_name}</div>
              <div style={{ ...S.td, flex:1 }}>
                {item.is_tampered ? (
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:"#dc2626" }}>ALTERED</span>
                ) : (
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:"#16a34a" }}>AUTHENTIC</span>
                )}
              </div>
              <div style={{ ...S.td, flex:1, fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:"#bbb" }}>
  {new Date(item.created_at).toLocaleDateString()}
</div>
<div style={{ ...S.td, flex:1 }}>
  {item.file_url ? (
    <a href={item.file_url} target="_blank" rel="noreferrer"
      style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:"#1a1a1a", letterSpacing:"0.5px", textDecoration:"none", borderBottom:"1px solid #1a1a1a", paddingBottom:"1px" }}>
      VIEW →
    </a>
  ) : (
    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:"#bbb" }}>—</span>
  )}
</div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderUsers = () => (
    <div>
      <div style={S.tableWrap}>
        <div style={S.tableHeader}>
          <div style={S.tableTitle}>STAFF ACCOUNTS</div>
          <button onClick={() => { setShowForm(!showForm); setEditUser(null); }} style={S.addBtn}>
            {showForm && !editUser ? "CANCEL" : "+ ADD USER"}
          </button>
        </div>

        {/* Add / Edit Form */}
        {showForm && (
          <div style={S.formWrap}>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", letterSpacing:"1.5px", color:"#999", marginBottom:"16px" }}>
              {editUser ? `EDITING USER #${editUser.id}` : "CREATE NEW USER"}
            </div>
            <form onSubmit={editUser ? handleEditUser : handleAddUser}>
              <div style={S.formGrid}>
                <div>
                  <label style={S.label}>FULL NAME</label>
                  <input
                    value={newUser.name}
                    onChange={e => setNewUser({...newUser, name:e.target.value})}
                    required
                    placeholder="Full Name"
                    style={S.input}
                    onFocus={e => e.target.style.borderColor="#1a1a1a"}
                    onBlur={e => e.target.style.borderColor="#e0ddd6"}
                  />
                </div>
                <div>
                  <label style={S.label}>EMAIL</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={e => setNewUser({...newUser, email:e.target.value})}
                    required
                    placeholder="staff@hospital.com"
                    style={S.input}
                    onFocus={e => e.target.style.borderColor="#1a1a1a"}
                    onBlur={e => e.target.style.borderColor="#e0ddd6"}
                  />
                </div>
                <div>
                  <label style={S.label}>PASSWORD {editUser && "(LEAVE BLANK TO KEEP)"}</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={e => setNewUser({...newUser, password:e.target.value})}
                    required={!editUser}
                    placeholder={editUser ? "Leave blank to keep current" : "Min 8 characters"}
                    style={S.input}
                    onFocus={e => e.target.style.borderColor="#1a1a1a"}
                    onBlur={e => e.target.style.borderColor="#e0ddd6"}
                  />
                </div>
                <div>
                  <label style={S.label}>ROLE</label>
                  <select
                    value={newUser.role}
                    onChange={e => setNewUser({...newUser, role:e.target.value})}
                    style={S.select}
                  >
                    <option value="doctor">Doctor</option>
                    <option value="pharmacy">Pharmacy Admin</option>
                    <option value="lab">Lab Staff</option>
                    <option value="admin">Hospital Admin</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop:"16px", display:"flex", gap:"12px" }}>
                <button type="submit" disabled={loading} style={{ ...S.submitBtn, opacity: loading ? 0.6 : 1 }}>
                  {loading ? "SAVING..." : editUser ? "SAVE CHANGES →" : "CREATE USER →"}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditUser(null); setNewUser({ name:"", email:"", password:"", role:"doctor" }); }}
                  style={{ ...S.submitBtn, background:"#fff", color:"#666", border:"1px solid #e0ddd6" }}>
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        )}

        {users.length === 0 ? (
          <div style={S.empty}>NO USERS FOUND</div>
        ) : (
          <>
            <div style={{ ...S.row, background:"#fafaf8", borderBottom:"1px solid #e0ddd6" }}>
              {["ID","NAME","EMAIL","ROLE","JOINED","ACTIONS"].map((h, i) => (
                <div key={i} style={{ ...S.td, flex: i===1||i===2 ? 2 : 1, fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", letterSpacing:"1px", color:"#999" }}>{h}</div>
              ))}
            </div>
            {users.map(user => (
              <div key={user.id} style={S.row}>
                <div style={{ ...S.td, flex:1, fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:"#bbb" }}>#{user.id}</div>
                <div style={{ ...S.td, flex:2, fontWeight:"500", color:"#1a1a1a" }}>{user.name}</div>
                <div style={{ ...S.td, flex:2, color:"#666" }}>{user.email}</div>
                <div style={{ ...S.td, flex:1 }}>
                  <span style={{ ...S.badge, ...getRoleBadgeStyle(user.role) }}>{user.role?.toUpperCase()}</span>
                </div>
                <div style={{ ...S.td, flex:1, fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:"#bbb" }}>
                  {new Date(user.created_at).toLocaleDateString()}
                </div>
                <div style={{ ...S.td, flex:1, display:"flex", gap:"12px" }}>
                  <button onClick={() => handleStartEdit(user)} style={{ ...S.deleteBtn, color:"#1a1a1a" }}>EDIT</button>
                  {user.role !== "admin" ? (
                    <button onClick={() => handleDelete(user.id)} style={S.deleteBtn}>REMOVE</button>
                  ) : (
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", color:"#bbb" }}>—</span>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );

  const renderPatients = () => (
  <div>
    <div style={S.tableWrap}>
      <div style={S.tableHeader}>
        <div style={S.tableTitle}>PATIENT REGISTRY</div>
        <button onClick={() => { setShowPatientForm(!showPatientForm); setEditPatient(null); setNewPatient({ name:"", age:"", gender:"", contact:"", address:"" }); }} style={S.addBtn}>
          {showPatientForm && !editPatient ? "CANCEL" : "+ ADD PATIENT"}
        </button>
      </div>

      {showPatientForm && (
        <div style={S.formWrap}>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", letterSpacing:"1.5px", color:"#999", marginBottom:"16px" }}>
            {editPatient ? `EDITING PATIENT #${editPatient.id}` : "REGISTER NEW PATIENT"}
          </div>
          <form onSubmit={editPatient ? handleEditPatient : handleAddPatient}>
            <div style={S.formGrid}>
              <div>
                <label style={S.label}>FULL NAME</label>
                <input value={newPatient.name} onChange={e => setNewPatient({...newPatient, name:e.target.value})} required placeholder="Patient Full Name" style={S.input} onFocus={e => e.target.style.borderColor="#1a1a1a"} onBlur={e => e.target.style.borderColor="#e0ddd6"} />
              </div>
              <div>
                <label style={S.label}>AGE</label>
                <input type="number" value={newPatient.age} onChange={e => setNewPatient({...newPatient, age:e.target.value})} placeholder="Age" min="0" max="150" style={S.input} onFocus={e => e.target.style.borderColor="#1a1a1a"} onBlur={e => e.target.style.borderColor="#e0ddd6"} />
              </div>
              <div>
                <label style={S.label}>GENDER</label>
                <select value={newPatient.gender} onChange={e => setNewPatient({...newPatient, gender:e.target.value})} style={S.select}>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label style={S.label}>CONTACT</label>
                <input value={newPatient.contact} onChange={e => setNewPatient({...newPatient, contact:e.target.value})} placeholder="Phone number" style={S.input} onFocus={e => e.target.style.borderColor="#1a1a1a"} onBlur={e => e.target.style.borderColor="#e0ddd6"} />
              </div>
              <div style={{ gridColumn:"span 2" }}>
                <label style={S.label}>ADDRESS</label>
                <input value={newPatient.address} onChange={e => setNewPatient({...newPatient, address:e.target.value})} placeholder="Full address" style={S.input} onFocus={e => e.target.style.borderColor="#1a1a1a"} onBlur={e => e.target.style.borderColor="#e0ddd6"} />
              </div>
            </div>
            <div style={{ marginTop:"16px", display:"flex", gap:"12px" }}>
              <button type="submit" disabled={loading} style={{ ...S.submitBtn, opacity: loading ? 0.6 : 1 }}>
                {loading ? "SAVING..." : editPatient ? "SAVE CHANGES →" : "ADD PATIENT →"}
              </button>
              <button type="button" onClick={() => { setShowPatientForm(false); setEditPatient(null); setNewPatient({ name:"", age:"", gender:"", contact:"", address:"" }); }}
                style={{ ...S.submitBtn, background:"#fff", color:"#666", border:"1px solid #e0ddd6" }}>
                CANCEL
              </button>
            </div>
          </form>
        </div>
      )}

      {patients.length === 0 ? (
        <div style={S.empty}>NO PATIENTS REGISTERED</div>
      ) : (
        <>
          <div style={{ ...S.row, background:"#fafaf8", borderBottom:"1px solid #e0ddd6" }}>
            {["ID","NAME","AGE","GENDER","CONTACT","REGISTERED","ACTIONS"].map((h, i) => (
              <div key={i} style={{ ...S.td, flex: i===1||i===4 ? 2 : 1, fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", letterSpacing:"1px", color:"#999" }}>{h}</div>
            ))}
          </div>
          {patients.map(patient => (
            <div key={patient.id} style={S.row}>
              <div style={{ ...S.td, flex:1, fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:"#bbb" }}>#{patient.id}</div>
              <div style={{ ...S.td, flex:2, fontWeight:"500", color:"#1a1a1a" }}>{patient.name}</div>
              <div style={{ ...S.td, flex:1, color:"#1a1a1a" }}>{patient.age || "—"}</div>
              <div style={{ ...S.td, flex:1, color:"#1a1a1a", textTransform:"capitalize" }}>{patient.gender || "—"}</div>
              <div style={{ ...S.td, flex:2, color:"#1a1a1a" }}>{patient.contact || "—"}</div>
              <div style={{ ...S.td, flex:1, fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:"#bbb" }}>
                {new Date(patient.created_at).toLocaleDateString()}
              </div>
              <div style={{ ...S.td, flex:1, display:"flex", gap:"12px" }}>
                <button onClick={() => handleStartEditPatient(patient)} style={{ ...S.deleteBtn, color:"#1a1a1a" }}>EDIT</button>
                <button onClick={() => handleDeletePatient(patient.id)} style={S.deleteBtn}>REMOVE</button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  </div>
);

  const renderRecords = (data, kind) => (
    <div>
      <div style={S.tableWrap}>
        <div style={S.tableHeader}>
          <div style={S.tableTitle}>{kind === "report" ? "MEDICAL REPORTS" : "PHARMACY BILLS"}</div>
        </div>
        {data.length === 0 ? (
          <div style={S.empty}>NO {kind === "report" ? "REPORTS" : "BILLS"} YET</div>
        ) : (
          <>
            <div style={{ ...S.row, background:"#fafaf8", borderBottom:"1px solid #e0ddd6" }}>
              {["ID","PATIENT",kind === "report" ? "TYPE" : "AMOUNT","UPLOADED BY","STATUS","DATE","FILE"].map((h, i) => (
                <div key={i} style={{ ...S.td, flex: i===1||i===3 ? 2 : 1, fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", letterSpacing:"1px", color:"#999" }}>{h}</div>
              ))}
            </div>
            {data.map(item => (
              <div key={item.id} style={S.row}>
  <div style={{ ...S.td, flex:1, fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:"#bbb" }}>#{item.id}</div>
  <div style={{ ...S.td, flex:2, fontWeight:"500", color:"#1a1a1a" }}>{item.patient_name}</div>
  <div style={{ ...S.td, flex:1, color:"#1a1a1a" }}>
    {kind === "report" ? item.report_type?.replace("_"," ") : `₹${item.bill_amount}`}
  </div>
  <div style={{ ...S.td, flex:2, color:"#1a1a1a" }}>{item.uploaded_by_name}</div>
  <div style={{ ...S.td, flex:1 }}>
    {item.is_tampered ? (
      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:"#dc2626" }}>ALTERED</span>
    ) : (
      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:"#16a34a" }}>AUTHENTIC</span>
    )}
  </div>
  <div style={{ ...S.td, flex:1, fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:"#bbb" }}>
    {new Date(item.created_at).toLocaleDateString()}
  </div>
  <div style={{ ...S.td, flex:1 }}>
    {item.file_url ? (
      <a href={item.file_url} target="_blank" rel="noreferrer"
        style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:"#1a1a1a", letterSpacing:"0.5px", textDecoration:"none", borderBottom:"1px solid #1a1a1a", paddingBottom:"1px" }}>
        VIEW →
      </a>
    ) : (
      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:"#bbb" }}>—</span>
    )}
  </div>
</div>
            ))}
          </>
        )}
      </div>
    </div>
  );

  return (
    <Dashboard activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="animate-in">
        {activeTab === "overview" && renderOverview()}
        {activeTab === "users" && renderUsers()}
        {activeTab === "patients" && renderPatients()}
        {activeTab === "reports" && renderRecords(reports, "report")}
        {activeTab === "bills" && renderRecords(bills, "bill")}
        {activeTab === "audit" && <BlockchainStatus />}
      </div>
    </Dashboard>
  );
};

export default AdminPage;