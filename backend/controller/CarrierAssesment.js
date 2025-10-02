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
    const { userId } = req.query;
    console.log(`Checking assessment status for userId: ${userId}`);

    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      console.error('Invalid user ID format:', userId);
      return res.status(400).json({ success: false, message: "Invalid user ID format" });
    }

    const assessment = await CareerAssessment.findOne({ userId });
    console.log(`Assessment found for userId: ${userId}`, assessment);

    if (!assessment) {
      console.log(`No assessment found for userId: ${userId}`);
      return res.status(200).json({
        success: true,
        hasCompletedAssessment: false,
        data: { starterAnswers: [] },
        mentalHealthAnswers: [],
        message: "No assessment found",
      });
    }

    const starterAnswers = assessment.starterAnswers || [];
    return res.status(200).json({
      success: true,
      hasCompletedAssessment: starterAnswers.length > 0,
      data: { starterAnswers },
      mentalHealthAnswers: starterAnswers, // For backward compatibility
      message: starterAnswers.length > 0 ? "Assessment found" : "No assessment answers found",
    });
  } catch (error) {
    console.error("Error checking assessment status:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};