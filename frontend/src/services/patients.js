import api from "./api.js";

// Get all patients
const getPatients = async () => {
  const response = await api.get("/patients");
  return response.data;
};

// Get single patient
const getPatient = async (id) => {
  const response = await api.get(`/patients/${id}`);
  return response.data;
};

// Create patient
const createPatient = async (data) => {
  const response = await api.post("/patients", data);
  return response.data;
};

// Update patient
const updatePatient = async (id, data) => {
  const response = await api.put(`/patients/${id}`, data);
  return response.data;
};

// Delete patient
const deletePatient = async (id) => {
  const response = await api.delete(`/patients/${id}`);
  return response.data;
};

export {
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
};