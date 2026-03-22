import pool from "../config/db.js";

// Create a blockchain log entry
const createBlockchainLog = async (
  recordId,
  recordType,
  action,
  fileHash,
  blockchainTx,
  performedBy,
  isValid
) => {
  const [result] = await pool.execute(
    `INSERT INTO blockchain_logs 
    (record_id, record_type, action, file_hash, blockchain_tx, performed_by, is_valid) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [recordId, recordType, action, fileHash, blockchainTx, performedBy, isValid]
  );
  return result.insertId;
};

// Get all blockchain logs
const getAllLogs = async () => {
  const [rows] = await pool.execute(
    `SELECT bl.*, 
      u.name as performed_by_name,
      u.role as performed_by_role
    FROM blockchain_logs bl
    LEFT JOIN users u ON bl.performed_by = u.id
    ORDER BY bl.created_at DESC`
  );
  return rows;
};

// Get logs by record ID
const getLogsByRecordId = async (recordId) => {
  const [rows] = await pool.execute(
    `SELECT bl.*, 
      u.name as performed_by_name,
      u.role as performed_by_role
    FROM blockchain_logs bl
    LEFT JOIN users u ON bl.performed_by = u.id
    WHERE bl.record_id = ?
    ORDER BY bl.created_at DESC`,
    [recordId]
  );
  return rows;
};

// Get logs by user ID
const getLogsByUserId = async (userId) => {
  const [rows] = await pool.execute(
    `SELECT * FROM blockchain_logs 
    WHERE performed_by = ?
    ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
};

export {
  createBlockchainLog,
  getAllLogs,
  getLogsByRecordId,
  getLogsByUserId,
};