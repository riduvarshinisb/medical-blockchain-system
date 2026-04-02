import api from "./api.js";

// Login user
const login = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  if (response.data.success) {
    // Store token and user in localStorage
    localStorage.setItem("token", response.data.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.data.user));
  }
  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};

// Get current user from localStorage
const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem("token");
};

// Check if user is logged in
const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return !!token;
};

// Check if user has a specific role
const hasRole = (role) => {
  const user = getCurrentUser();
  return user?.role === role;
};

// Register new user (admin only)
const register = async (name, email, password, role) => {
  const response = await api.post("/auth/register", {
    name,
    email,
    password,
    role,
  });
  return response.data;
};

// Get all users (admin only)
const getUsers = async () => {
  const response = await api.get("/auth/users");
  return response.data;
};

// Delete user (admin only)
const deleteUser = async (id) => {
  const response = await api.delete(`/auth/users/${id}`);
  return response.data;
};

export {
  login,
  logout,
  getCurrentUser,
  getToken,
  isAuthenticated,
  hasRole,
  register,
  getUsers,
  deleteUser,
};