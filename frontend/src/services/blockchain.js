import api from "./api.js";

// Upload a medical report
const uploadReport = async (patientId, reportType, file) => {
  const formData = new FormData();
  formData.append("patientId", patientId);
  formData.append("reportType", reportType);
  formData.append("file", file);

  const response = await api.post("/reports/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Get all reports
const getReports = async () => {
  const response = await api.get("/reports");
  return response.data;
};

// Get single report
const getReport = async (id) => {
  const response = await api.get(`/reports/${id}`);
  return response.data;
};

// Get reports by patient
const getPatientReports = async (patientId) => {
  const response = await api.get(`/reports/patient/${patientId}`);
  return response.data;
};

// Upload a pharmacy bill
const uploadBill = async (patientId, billAmount, file) => {
  const formData = new FormData();
  formData.append("patientId", patientId);
  formData.append("billAmount", billAmount);
  formData.append("file", file);

  const response = await api.post("/bills/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Get all bills
const getBills = async () => {
  const response = await api.get("/bills");
  return response.data;
};

// Get single bill
const getBill = async (id) => {
  const response = await api.get(`/bills/${id}`);
  return response.data;
};

// Get bills by patient
const getPatientBills = async (patientId) => {
  const response = await api.get(`/bills/patient/${patientId}`);
  return response.data;
};

// Verify a report
const verifyReport = async (id, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(`/verify/report/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Verify a bill
const verifyBill = async (id, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(`/verify/bill/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Get audit logs
const getAuditLogs = async () => {
  const response = await api.get("/verify/logs");
  return response.data;
};

// Get logs by record ID
const getRecordLogs = async (recordId) => {
  const response = await api.get(`/verify/logs/${recordId}`);
  return response.data;
};

export {
  uploadReport,
  getReports,
  getReport,
  getPatientReports,
  uploadBill,
  getBills,
  getBill,
  getPatientBills,
  verifyReport,
  verifyBill,
  getAuditLogs,
  getRecordLogs,
};