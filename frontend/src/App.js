import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider, useAuth } from "./context/AuthContext.js";
import Login from "./components/Login.js";
import AdminPage from "./pages/AdminPage.js";
import DoctorPage from "./pages/DoctorPage.js";
import PharmacyPage from "./pages/PharmacyPage.js";
import LabPage from "./pages/LabPage.js";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
};

const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center max-w-md shadow-lg">
        <span className="text-8xl block mb-6">🚫</span>
        <h2 className="text-4xl font-bold mb-4 text-gray-900">Access Denied</h2>
        <p className="text-gray-600 mb-8 text-lg">
          You do not have permission to access this page.
        </p>
        <Link
          to="/login"
          className="inline-block px-8 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 hover:shadow-lg text-white font-semibold transition-all duration-300"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const { user, isLoggedIn } = useAuth();

  const getDefaultRoute = () => {
    if (!isLoggedIn) return "/login";
    if (user?.role === "admin") return "/admin";
    if (user?.role === "doctor") return "/doctor";
    if (user?.role === "pharmacy") return "/pharmacy";
    if (user?.role === "lab") return "/lab";
    return "/login";
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route
        path="/login"
        element={isLoggedIn ? <Navigate to={getDefaultRoute()} /> : <Login />}
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor"
        element={
          <ProtectedRoute allowedRoles={["doctor"]}>
            <DoctorPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pharmacy"
        element={
          <ProtectedRoute allowedRoles={["pharmacy"]}>
            <PharmacyPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lab"
        element={
          <ProtectedRoute allowedRoles={["lab"]}>
            <LabPage />
          </ProtectedRoute>
        }
      />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
        />
      </Router>
    </AuthProvider>
  );
}

export default App;