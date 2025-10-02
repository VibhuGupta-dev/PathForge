import mongoose from "mongoose";

const careerAssessmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  starterAnswers: [
    {
      questionText: String,
      selectedOption: String,
      _id: mongoose.Schema.Types.ObjectId,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("CareerAssessment", careerAssessmentSchema);