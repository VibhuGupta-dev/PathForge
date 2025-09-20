import mongoose from "mongoose";
import { starterAnswerSchema } from "../utils/StarterAnswerSchema.js";
import CareerAssessment from "../models/CarrierAssesmentModel.js";
import axios from "axios";

export const createCareerAssessment = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = starterAnswerSchema.validate(req.body.starterAnswers, { abortEarly: false });
    if (error) {
      return res.status(400).json({ success: false, message: error.details.map(d => d.message) });
    }

    // Prepare data for MongoDB
    const assessmentData = {
      userId: new mongoose.Types.ObjectId(req.body.userId),
      starterAnswers: value,
      createdAt: new Date(req.body.createdAt || Date.now()),
    };

    // Save to MongoDB
    const assessment = new CareerAssessment(assessmentData);
    await assessment.save();

    // Send to AI agent
    try {
      await axios.post("https://x.ai/api/assessments", assessmentData, {
        headers: { Authorization: `Bearer ${process.env.AI_AGENT_TOKEN}` },
      });
      console.log("Assessment sent to AI agent");
    } catch (aiError) {
      console.error("Failed to send to AI agent:", aiError.message);
      // Continue even if AI agent fails
    }

    res.status(201).json({
      success: true,
      message: "Career assessment created successfully",
      data: assessment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const checkAssessmentStatus = async (req, res) => {
  try {
    const userId = req.user._id; // From authMiddleware
    console.log("Checking assessment status for user:", userId);

    const assessment = await MentalHealthAssessment.findOne({ userId });
    const hasCompletedAssessment = !!assessment;

    res.status(200).json({
      success: true,
      hasCompletedAssessment,
    });
  } catch (error) {
    console.error("Error in checkAssessmentStatus:", error.message);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};