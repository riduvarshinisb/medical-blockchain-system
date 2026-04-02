import express from "express";
import { register, login, getProfile, getUsers, removeUser, updateUserDetails } from "../controllers/authController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes (no authentication needed)
router.post("/login", login);

// Protected routes (authentication needed)
router.get("/profile", authenticate, getProfile);

// Admin only routes
router.post("/register", authenticate, authorizeRoles("admin"), register);
router.get("/users", authenticate, authorizeRoles("admin"), getUsers);
router.delete("/users/:id", authenticate, authorizeRoles("admin"), removeUser);
router.put("/users/:id", authenticate, authorizeRoles("admin"), updateUserDetails);

export default router;