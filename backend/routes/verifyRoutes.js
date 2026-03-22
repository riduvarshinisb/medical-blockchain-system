import express from "express";
import multer from "multer";
import {
  verifyReport,
  verifyBill,
  getAuditLogs,
  getRecordLogs,
} from "../controllers/verifyController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and image files are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
});

// Verify report - all authenticated users
router.post(
  "/report/:id",
  authenticate,
  upload.single("file"),
  verifyReport
);

// Verify bill - all authenticated users
router.post(
  "/bill/:id",
  authenticate,
  upload.single("file"),
  verifyBill
);

// Get all audit logs - admin only
router.get(
  "/logs",
  authenticate,
  authorizeRoles("admin"),
  getAuditLogs
);

// Get logs by record ID - admin only
router.get(
  "/logs/:recordId",
  authenticate,
  authorizeRoles("admin"),
  getRecordLogs
);

export default router;