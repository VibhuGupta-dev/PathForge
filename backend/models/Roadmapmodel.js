import mongoose from "mongoose";

const roadmapSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  career: { type: String, required: true },  // e.g. "Data Scientist"
  roadmap: [
    {
      step: Number,
      title: String,
      description: String,
      resources: [String],
      status: { type: String, enum: ["pending", "in-progress", "done"], default: "pending" }
    }
  ],
  exported: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Roadmap", roadmapSchema);
