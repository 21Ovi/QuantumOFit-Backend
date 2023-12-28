// src/routes/authRoutes.ts
import express from "express";
import {
  loginUser,
  registerUser,
  logoutUser,
} from "../controllers/auth-controller";

const router = express.Router();

// Login route
router.post("/login", loginUser);

// Register route
router.post("/register", registerUser);

// Logout route
router.post("/logout", logoutUser);

export default router;
