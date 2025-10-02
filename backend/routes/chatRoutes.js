import express from "express";
import { saveChatMessage, getChatHistory } from "../controller/AiChatController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

// POST /api/ai-chat/message - Save a chat message
router.post(
  "/ai-chat/message",
  authMiddleware,
  [
    body("role").isIn(["user", "ai"]).withMessage("Invalid role (must be 'user' or 'ai')"),
    body("content").trim().notEmpty().withMessage("Content is required"),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
  saveChatMessage
);

// GET /api/ai-chat/history - Get chat history
router.get(
  "/ai-chat/history",
  authMiddleware,
  getChatHistory
);

export default router;