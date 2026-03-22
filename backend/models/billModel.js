import pool from "../config/db.js";

// Create a new bill
const createBill = async (
  patientId,
  uploadedBy,
  billAmount,
  fileUrl,
  fileHash,
  blockchainTx,
  blockchainRecordId
) => {
  const [result] = await pool.execute(
    `INSERT INTO bills 
    (patient_id, uploaded_by, bill_amount, file_url, file_hash, blockchain_tx, blockchain_record_id) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [patientId, uploadedBy, billAmount, fileUrl, fileHash, blockchainTx, blockchainRecordId]
  );
  return result.insertId;
};

// Get all bills
const getAllBills = async () => {
  const [rows] = await pool.execute(
    `SELECT b.*, 
      p.name as patient_name,
      u.name as uploaded_by_name,
      u.role as uploaded_by_role
    FROM bills b
    JOIN patients p ON b.patient_id = p.id
    JOIN users u ON b.uploaded_by = u.id
    ORDER BY b.created_at DESC`
  );
  return rows;
};

// Get bill by ID
const getBillById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT b.*, 
      p.name as patient_name,
      u.name as uploaded_by_name,
      u.role as uploaded_by_role
    FROM bills b
    JOIN patients p ON b.patient_id = p.id
    JOIN users u ON b.uploaded_by = u.id
    WHERE b.id = ?`,
    [id]
  );
  return rows[0] || null;
};

// Get bills by patient ID
const getBillsByPatientId = async (patientId) => {
  const [rows] = await pool.execute(
    `SELECT b.*, 
      p.name as patient_name,
      u.name as uploaded_by_name
    FROM bills b
    JOIN patients p ON b.patient_id = p.id
    JOIN users u ON b.uploaded_by = u.id
    WHERE b.patient_id = ?
    ORDER BY b.created_at DESC`,
    [patientId]
  );
  return rows;
};

// Mark bill as tampered
const markBillAsTampered = async (id) => {
  const [result] = await pool.execute(
    "UPDATE bills SET is_tampered = TRUE WHERE id = ?",
    [id]
  );
  return result.affectedRows > 0;
};

// Update blockchain transaction
const updateBillBlockchainTx = async (id, blockchainTx) => {
  const [result] = await pool.execute(
    "UPDATE bills SET blockchain_tx = ? WHERE id = ?",
    [blockchainTx, id]
  );
  return result.affectedRows > 0;
};

export {
  createBill,
  getAllBills,
  getBillById,
  getBillsByPatientId,
  markBillAsTampered,
  updateBillBlockchainTx,
};