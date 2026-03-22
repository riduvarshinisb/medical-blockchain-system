import pool from "../config/db.js";
import bcrypt from "bcryptjs";

// Create a new user
const createUser = async (name, email, password, role) => {
  // Hash password before storing
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const [result] = await pool.execute(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    [name, email, hashedPassword, role]
  );

  return result.insertId;
};

// Find user by email
const findUserByEmail = async (email) => {
  const [rows] = await pool.execute(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );
  return rows[0] || null;
};

// Find user by ID
const findUserById = async (id) => {
  const [rows] = await pool.execute(
    "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
    [id]
  );
  return rows[0] || null;
};

// Get all users (admin only)
const getAllUsers = async () => {
  const [rows] = await pool.execute(
    "SELECT id, name, email, role, created_at FROM users"
  );
  return rows;
};

// Delete user
const deleteUser = async (id) => {
  const [result] = await pool.execute(
    "DELETE FROM users WHERE id = ?",
    [id]
  );
  return result.affectedRows > 0;
};

// Verify password
const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

export {
  createUser,
  findUserByEmail,
  findUserById,
  getAllUsers,
  deleteUser,
  verifyPassword,
};