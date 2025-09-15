import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bio: String,
  interests: [String],
  domain: String,
  experience: { type: Number, default: 0 }, // years of experience
  skills: [String],
  education: String,
  availability: { type: String, enum: ["student", "mentor", "professional"], default: "student" },
  socialLinks: {
    linkedin: String,
    github: String,
    twitter: String
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Profile", profileSchema);
