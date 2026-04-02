import pool from "../config/db.js";

// Get all patients
const getAllPatients = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT p.*, u.name as created_by_name 
       FROM patients p 
       LEFT JOIN users u ON p.created_by = u.id 
       ORDER BY p.created_at DESC`
    );
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("Get patients error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get single patient
const getPatient = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute(
      `SELECT p.*, u.name as created_by_name 
       FROM patients p 
       LEFT JOIN users u ON p.created_by = u.id 
       WHERE p.id = ?`,
      [id]
    );
    if (!rows[0]) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Get patient error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Create patient
const createPatient = async (req, res) => {
  try {
    const { name, age, gender, contact, address } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Patient name is required" });
    }
    const [result] = await pool.execute(
      "INSERT INTO patients (name, age, gender, contact, address, created_by) VALUES (?, ?, ?, ?, ?, ?)",
      [name, age || null, gender || null, contact || null, address || null, req.user.userId]
    );
    res.status(201).json({
      success: true,
      message: "Patient created successfully",
      data: { id: result.insertId, name, age, gender, contact, address },
    });
  } catch (error) {
    console.error("Create patient error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Update patient
const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, age, gender, contact, address } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Patient name is required" });
    }
    const [result] = await pool.execute(
      "UPDATE patients SET name=?, age=?, gender=?, contact=?, address=? WHERE id=?",
      [name, age || null, gender || null, contact || null, address || null, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }
    res.status(200).json({ success: true, message: "Patient updated successfully" });
  } catch (error) {
    console.error("Update patient error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Delete patient
const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute("DELETE FROM patients WHERE id=?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }
    res.status(200).json({ success: true, message: "Patient deleted successfully" });
  } catch (error) {
    console.error("Delete patient error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export { getAllPatients, getPatient, createPatient, updatePatient, deletePatient };