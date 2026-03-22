import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: "../.env" });

// Import routes
import authRoutes from "./routes/authRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import billRoutes from "./routes/billRoutes.js";
import verifyRoutes from "./routes/verifyRoutes.js";

// Import database and blockchain connections
import "./config/db.js";
import "./config/blockchain.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================

// CORS - Allow frontend to communicate with backend
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Parse JSON requests
app.use(express.json());

// Parse URL encoded requests
app.use(express.urlencoded({ extended: true }));

// ============================================
// ROUTES
// ============================================
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/verify", verifyRoutes);

// ============================================
// HEALTH CHECK ROUTE
// ============================================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Medical Blockchain System API is running!",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      reports: "/api/reports",
      bills: "/api/bills",
      verify: "/api/verify",
    },
  });
});

// ============================================
// 404 HANDLER
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ============================================
// ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Environment: development`);
});

export default app;