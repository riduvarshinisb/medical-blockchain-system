import pool from "../config/db.js";

// Create a new report
const createReport = async (
  patientId,
  uploadedBy,
  reportType,
  fileUrl,
  fileHash,
  blockchainTx,
  blockchainRecordId
) => {
  const [result] = await pool.execute(
    `INSERT INTO reports 
    (patient_id, uploaded_by, report_type, file_url, file_hash, blockchain_tx, blockchain_record_id) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [patientId, uploadedBy, reportType, fileUrl, fileHash, blockchainTx, blockchainRecordId]
  );
  return result.insertId;
};

// Get all reports
const getAllReports = async () => {
  const [rows] = await pool.execute(
    `SELECT r.*, 
      p.name as patient_name, 
      u.name as uploaded_by_name,
      u.role as uploaded_by_role
    FROM reports r
    JOIN patients p ON r.patient_id = p.id
    JOIN users u ON r.uploaded_by = u.id
    ORDER BY r.created_at DESC`
  );
  return rows;
};

// Get report by ID
const getReportById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT r.*, 
      p.name as patient_name,
      u.name as uploaded_by_name,
      u.role as uploaded_by_role
    FROM reports r
    JOIN patients p ON r.patient_id = p.id
    JOIN users u ON r.uploaded_by = u.id
    WHERE r.id = ?`,
    [id]
  );
  return rows[0] || null;
};

// Get reports by patient ID
const getReportsByPatientId = async (patientId) => {
  const [rows] = await pool.execute(
    `SELECT r.*, 
      p.name as patient_name,
      u.name as uploaded_by_name
    FROM reports r
    JOIN patients p ON r.patient_id = p.id
    JOIN users u ON r.uploaded_by = u.id
    WHERE r.patient_id = ?
    ORDER BY r.created_at DESC`,
    [patientId]
  );
  return rows;
};

// Mark report as tampered
const markReportAsTampered = async (id) => {
  const [result] = await pool.execute(
    "UPDATE reports SET is_tampered = TRUE WHERE id = ?",
    [id]
  );
  return result.affectedRows > 0;
};

// Update blockchain transaction
const updateReportBlockchainTx = async (id, blockchainTx) => {
  const [result] = await pool.execute(
    "UPDATE reports SET blockchain_tx = ? WHERE id = ?",
    [blockchainTx, id]
  );
  return result.affectedRows > 0;
};

export {
  createReport,
  getAllReports,
  getReportById,
  getReportsByPatientId,
  markReportAsTampered,
  updateReportBlockchainTx,
};