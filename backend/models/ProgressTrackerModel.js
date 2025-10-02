
import mongoose from "mongoose";
const progressSchema = new mongoose.Schema({
  progressId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  roadmapId: { type: String, required: true },
  stepId: { type: String, required: true },
  completed: { type: Boolean, default: true },
  completedAt: { type: Date, default: Date.now },
});

const roadmapSchema = new mongoose.Schema({
  roadmapId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  steps: [
    {
      stepId: { type: String, required: true },
      name: { type: String, required: true },
      nsqfLevel: { type: Number, required: true },
      description: { type: String, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Progress = mongoose.model("Progress", progressSchema);
export const Roadmap = mongoose.model("Roadmap", roadmapSchema);
