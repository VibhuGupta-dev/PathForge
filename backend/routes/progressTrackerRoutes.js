import express from "express";
import jwt from "jsonwebtoken";
import {Roadmap} from "../models/ProgressTrackerModel.js";
import User from "../models/Usermodel.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(403).json({ success: false, message: "Invalid or expired token" });
  }
};

// GET /api/roadmap/:userId - Fetch user's roadmap
router.get("/api/roadmap/:userId", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: "Invalid user ID format" });
    }

    if (req.user.id !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    const roadmap = await Roadmap.findOne({ user_id: userId });
    if (!roadmap) {
      return res.status(404).json({ success: false, message: "Roadmap not found" });
    }

    res.status(200).json({ success: true, data: roadmap });
  } catch (error) {
    console.error("Error fetching roadmap:", error);
    res.status(500).json({ success: false, message: "Server error while fetching roadmap" });
  }
});

// POST /api/user - Create a new roadmap for a user
router.post(
  "/api/user",
  [
    body("user_id").isMongoId().withMessage("Invalid user ID"),
    body("username").trim().notEmpty().withMessage("Username is required"),
  ],
  authenticateToken,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { user_id, username } = req.body;

      if (req.user.id !== user_id) {
        return res.status(403).json({ success: false, message: "Unauthorized access" });
      }

      const user = await User.findById(user_id);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      const existingRoadmap = await Roadmap.findOne({ user_id });
      if (existingRoadmap) {
        return res.status(400).json({ success: false, message: "Roadmap already exists" });
      }

      const roadmap = await Roadmap.create({
        user_id,
        username,
        steps: [
          { step_id: "1", name: "Step 1: Learn Basics", nsqf_level: 1, description: "Start with foundational skills", completed: false },
          { step_id: "2", name: "Step 2: Intermediate Skills", nsqf_level: 2, description: "Build intermediate skills", completed: false },
        ],
      });

      res.status(201).json({ success: true, data: roadmap });
    } catch (error) {
      console.error("Error creating roadmap:", error);
      res.status(500).json({ success: false, message: "Server error while creating roadmap" });
    }
  }
);

// POST /api/progress - Mark a roadmap step as complete
router.post(
  "/api/progress",
  [
    body("user_id").isMongoId().withMessage("Invalid user ID"),
    body("roadmap_id").isMongoId().withMessage("Invalid roadmap ID"),
    body("step_id").notEmpty().withMessage("Step ID is required"),
  ],
  authenticateToken,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { user_id, roadmap_id, step_id } = req.body;

      if (req.user.id !== user_id) {
        return res.status(403).json({ success: false, message: "Unauthorized access" });
      }

      const roadmap = await Roadmap.findById(roadmap_id);
      if (!roadmap || roadmap.user_id !== user_id) {
        return res.status(404).json({ success: false, message: "Roadmap not found" });
      }

      const step = roadmap.steps.find((s) => s.step_id === step_id);
      if (!step) {
        return res.status(404).json({ success: false, message: "Step not found" });
      }

      step.completed = true;
      await roadmap.save();

      res.status(200).json({ success: true, data: roadmap });
    } catch (error) {
      console.error("Error updating progress:", error);
      res.status(500).json({ success: false, message: "Server error while updating progress" });
    }
  }
);

export default router;