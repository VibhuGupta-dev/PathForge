// file: backend/models/CommunityModel.js
import mongoose from "mongoose";

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  profileimg: {
    type: String,
    default: null,
  },
  about: {
    type: String,
    default: null, 
  },
  linkedin: {
    type: String,
    required: true,
  },
  github: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Community", communitySchema);