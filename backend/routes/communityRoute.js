// file: backend/routes/communityRoute.js
import express from "express";
import multer from "multer";
import {
  addCommunityMember,
  getCommunityMembers,
  getCommunityMemberById,
  updateCommunityMember,
  deleteCommunityMember
} from "../controller/Communitycontroller.js";
import { authMiddleware } from "../middleware/authMiddleware.js"; // assume path sahi hai

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Routes
router.post("/",authMiddleware, upload.single("profileimg"), addCommunityMember);
router.get("/", getCommunityMembers);
router.get("/:id", getCommunityMemberById);
router.put("/:id",authMiddleware, upload.single("profileimg"), updateCommunityMember);
router.delete("/:id",authMiddleware, deleteCommunityMember);

export default router;