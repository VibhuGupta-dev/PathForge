import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  question: { type: String, required: true },
  options: [
    {
      value: { type: String, required: true },
      text: { type: String, required: true },
      clusterTag: { type: String, required: true },
    },
  ],
  type: { type: String, enum: ["starter", "adaptive"], default: "starter" },
});

export default mongoose.model("Question", questionSchema);