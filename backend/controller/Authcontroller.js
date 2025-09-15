import Joi from "joi";
import userModel from "../models/Usermodel.js";
import { sendOTPEmail } from "../utils/Emailservice.js";
import generateToken from "../utils/GenerateToken.js";

// Temporary in-memory OTP store (replace with Redis or DB in production)
const otpStore = new Map();

// Validation schema for registration
const registrationSchema = Joi.object({
  Fullname: Joi.string().required().messages({
    "string.empty": "Full name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email address",
    "string.empty": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "string.empty": "Password is required",
  }),
  contact: Joi.string().required().messages({
    "string.empty": "Contact is required",
  }),
});

// Validation schema for OTP verification
const otpVerificationSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email address",
    "string.empty": "Email is required",
  }),
  otp: Joi.string().length(6).required().messages({
    "string.length": "OTP must be 6 digits",
    "string.empty": "OTP is required",
  }),
});

// Send OTP for registration
export const sendRegistrationOTP = async (req, res) => {
  try {
    const { error } = registrationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { Fullname, email, password, contact } = req.body;

    // Check if email already exists
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in memory (replace with Redis/DB in production)
    otpStore.set(email, {
      otp,
      Fullname,
      password,
      contact,
      expires: Date.now() + 10 * 60 * 1000, // 10-minute expiry
    });

    // Send OTP email
    await sendOTPEmail({ email, Fullname, otp });

    return res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error in sendRegistrationOTP:", error);
    return res.status(500).json({ success: false, message: "Error sending OTP" });
  }
};

// Verify OTP and register user
export const verifyRegistrationOTP = async (req, res) => {
  try {
    const { error } = otpVerificationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { email, otp } = req.body;

    // Retrieve stored OTP
    const storedData = otpStore.get(email);
    if (!storedData) {
      return res.status(400).json({ success: false, message: "OTP not found or expired" });
    }

    // Check OTP and expiry
    if (storedData.otp !== otp || Date.now() > storedData.expires) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    // Create user
    const user = new userModel({
      Fullname: storedData.Fullname,
      email,
      password: storedData.password, // Will be hashed by pre-save hook
      contact: storedData.contact,
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
    });

    await user.save();

    // Clear OTP from store
    otpStore.delete(email);

    // Generate JWT token
    const token = generateToken(user);

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        Fullname: user.Fullname,
        email: user.email,
        contact: user.contact,
        isEmailVerified: user.isEmailVerified,
        emailVerifiedAt: user.emailVerifiedAt,
      },
      token,
    });
  } catch (error) {
    console.error("Error in verifyRegistrationOTP:", error);
    return res.status(500).json({ success: false, message: "Error verifying OTP" });
  }
};

// Resend OTP
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    const { error } = Joi.object({
      email: Joi.string().email().required().messages({
        "string.email": "Please enter a valid email address",
        "string.empty": "Email is required",
      }),
    }).validate({ email });
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    // Check if email exists in OTP store
    const storedData = otpStore.get(email);
    if (!storedData) {
      return res.status(400).json({ success: false, message: "No OTP request found for this email" });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Update OTP store
    otpStore.set(email, { ...storedData, otp, expires: Date.now() + 10 * 60 * 1000 });

    // Send new OTP email
    await sendOTPEmail({ email, Fullname: storedData.Fullname, otp });

    return res.status(200).json({ success: true, message: "New OTP sent successfully" });
  } catch (error) {
    console.error("Error in resendOTP:", error);
    return res.status(500).json({ success: false, message: "Error resending OTP" });
  }
};

// Login user
export const loginuser = async (req, res) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required().messages({
        "string.email": "Please enter a valid email address",
        "string.empty": "Email is required",
      }),
      password: Joi.string().required().messages({
        "string.empty": "Password is required",
      }),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { email, password } = req.body;

    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        Fullname: user.Fullname,
        email: user.email,
        contact: user.contact,
        isEmailVerified: user.isEmailVerified,
        emailVerifiedAt: user.emailVerifiedAt,
      },
      token,
    });
  } catch (err) {
    console.error("loginuser error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Logout user
export const logout = (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const user = req.user; // From authMiddleware

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        Fullname: user.Fullname,
        email: user.email,
        contact: user.contact,
        isEmailVerified: user.isEmailVerified,
        emailVerifiedAt: user.emailVerifiedAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    console.error("getProfile error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};