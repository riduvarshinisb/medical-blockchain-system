import express from "express";
import multer from "multer";
import {
  uploadBill,
  getBills,
  getBill,
  getPatientBills,
} from "../controllers/billController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure multer for memory storage
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
// Upload bill - pharmacy and admin only
router.post(
  "/upload",
  authenticate,
  authorizeRoles("pharmacy", "admin"),
  upload.single("file"),
  uploadBill
);

// Get all bills - admin and doctor
router.get(
  "/",
  authenticate,
  authorizeRoles("admin", "doctor"),
  getBills
);

// Get single bill - admin and doctor
router.get(
  "/:id",
  authenticate,
  authorizeRoles("admin", "doctor"),
  getBill
);

// Get bills by patient - admin and doctor
router.get(
  "/patient/:patientId",
  authenticate,
  authorizeRoles("admin", "doctor"),
  getPatientBills
);

export default router;