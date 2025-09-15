import { Router } from "express";
import {
  loginuser,
  logout,
  sendRegistrationOTP,
  verifyRegistrationOTP,
  resendOTP,
  getProfile,
} from "../controller/Authcontroller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// OTP-based registration routes
router.post("/send-registration-otp", sendRegistrationOTP);
router.post("/verify-registration-otp", verifyRegistrationOTP);
router.post("/resend-otp", resendOTP);

// Authentication routes
router.post("/login", loginuser);
router.post("/logout", logout);

// Protected routes
router.get("/me", authMiddleware, getProfile);
router.get("/profile", authMiddleware, getProfile);

export default router;