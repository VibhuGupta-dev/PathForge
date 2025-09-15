import mongoose from "mongoose";

const userCareerAssessmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Store answers for each section
  assessmentAnswers: {
    // Section 1: Interest & Passion Areas
    q1_content: { type: String, enum: ["a", "b", "c", "d", "e", "f", "g"], required: true },
    q2_weekendActivity: { type: String, enum: ["a", "b", "c", "d", "e", "f", "g"], required: true },
    q3_problemSolving: { type: String, enum: ["a", "b", "c", "d", "e", "f", "g"], required: true },

    // Section 2: Work Style & Environment
    q4_environment: { type: String, enum: ["a", "b", "c", "d", "e", "f", "g"], required: true },
    q5_workPreference: { type: String, enum: ["a", "b", "c", "d", "e", "f", "g"], required: true },
    q6_schedule: { type: String, enum: ["a", "b", "c", "d", "e", "f", "g"], required: true },

    // Section 3: Skills & Strengths
    q7_helpWith: { type: String, enum: ["a", "b", "c", "d", "e", "f", "g"], required: true },
    q8_strengths: { type: String, enum: ["a", "b", "c", "d", "e", "f", "g"], required: true },

    // Section 4: Values & Impact
    q9_success: { type: String, enum: ["a", "b", "c", "d", "e", "f", "g"], required: true },
    q10_legacy: { type: String, enum: ["a", "b", "c", "d", "e", "f", "g"], required: true },

    // Section 5: Learning & Growth
    q11_learning: { type: String, enum: ["a", "b", "c", "d", "e", "f", "g"], required: true },
    q12_riskTolerance: { type: String, enum: ["a", "b", "c", "d", "e", "f", "g"], required: true },
  },

  // Derived insights
  dominantCluster: { 
    type: String, 
    enum: [
      "Technology/IT",
      "Business/Finance",
      "Sports/Fitness",
      "Creative/Arts",
      "Science/Research",
      "Healthcare/SocialServices",
      "Media/Entertainment"
    ],
    default: null
  },

  clusterScores: {
    Technology_IT: { type: Number, default: 0 },
    Business_Finance: { type: Number, default: 0 },
    Sports_Fitness: { type: Number, default: 0 },
    Creative_Arts: { type: Number, default: 0 },
    Science_Research: { type: Number, default: 0 },
    Healthcare_SocialServices: { type: Number, default: 0 },
    Media_Entertainment: { type: Number, default: 0 },
  },

  suggestedCareers: { type: [String], default: [] },
  topMatches: { type: [String], default: [] }, // AI recommended top 3-5 careers
  chosenCareer: { type: String, default: null },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("UserCareerAssessment", userCareerAssessmentSchema);
