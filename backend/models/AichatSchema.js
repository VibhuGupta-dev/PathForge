import mongoose from "mongoose";

const aiChatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  messages: [
    {
      role: { type: String, enum: ["user", "ai"], required: true },
      text: String,
      createdAt: { type: Date, default: Date.now }
    }
  ]
});

export default mongoose.model("AIChat", aiChatSchema);
