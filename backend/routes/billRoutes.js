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

// Upload bill - pharmacy and admin only
router.post(
  "/upload",
  authenticate,
  authorizeRoles("pharmacy", "admin"),
  upload.single("file"),
  uploadBill
);

// Get all bills - admin, doctor AND pharmacy
router.get(
  "/",
  authenticate,
  authorizeRoles("admin", "doctor", "pharmacy"),
  getBills
);

// Get single bill - admin, doctor AND pharmacy
router.get(
  "/:id",
  authenticate,
  authorizeRoles("admin", "doctor", "pharmacy"),
  getBill
);

// Get bills by patient - admin, doctor AND pharmacy
router.get(
  "/patient/:patientId",
  authenticate,
  authorizeRoles("admin", "doctor", "pharmacy"),
  getPatientBills
);

export default router;