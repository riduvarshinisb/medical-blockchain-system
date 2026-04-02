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
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Upload report - lab staff and admin only
router.post(
  "/upload",
  authenticate,
  authorizeRoles("lab", "admin"),
  upload.single("file"),
  uploadReport
);

// Get all reports - admin, doctor AND lab
router.get(
  "/",
  authenticate,
  authorizeRoles("admin", "doctor", "lab"),
  getReports
);

// Get single report - admin, doctor AND lab
router.get(
  "/:id",
  authenticate,
  authorizeRoles("admin", "doctor", "lab"),
  getReport
);

// Get reports by patient - admin, doctor AND lab
router.get(
  "/patient/:patientId",
  authenticate,
  authorizeRoles("admin", "doctor", "lab"),
  getPatientReports
);

export default router;