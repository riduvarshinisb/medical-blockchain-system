import express from "express";
import multer from "multer";
import {
  uploadReport,
  getReports,
  getReport,
  getPatientReports,
} from "../controllers/reportController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure multer for memory storage
// Files are kept in memory as buffer (not saved to disk)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Only allow PDF and image files
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
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});

// All routes require authentication
// Upload report - lab staff and admin only
router.post(
  "/upload",
  authenticate,
  authorizeRoles("lab", "admin"),
  upload.single("file"),
  uploadReport
);

// Get all reports - admin and doctor
router.get(
  "/",
  authenticate,
  authorizeRoles("admin", "doctor"),
  getReports
);

// Get single report - admin and doctor
router.get(
  "/:id",
  authenticate,
  authorizeRoles("admin", "doctor"),
  getReport
);

// Get reports by patient - admin and doctor
router.get(
  "/patient/:patientId",
  authenticate,
  authorizeRoles("admin", "doctor"),
  getPatientReports
);

export default router;