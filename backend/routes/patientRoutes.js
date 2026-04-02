import express from "express";
import {
  getAllPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
} from "../controllers/patientController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all patients - all roles can view
router.get(
  "/",
  authenticate,
  authorizeRoles("admin", "doctor", "lab", "pharmacy"),
  getAllPatients
);

// Get single patient - all roles can view
router.get(
  "/:id",
  authenticate,
  authorizeRoles("admin", "doctor", "lab", "pharmacy"),
  getPatient
);

// Create patient - admin only
router.post(
  "/",
  authenticate,
  authorizeRoles("admin"),
  createPatient
);

// Update patient - admin only
router.put(
  "/:id",
  authenticate,
  authorizeRoles("admin"),
  updatePatient
);

// Delete patient - admin only
router.delete(
  "/:id",
  authenticate,
  authorizeRoles("admin"),
  deletePatient
);

export default router;