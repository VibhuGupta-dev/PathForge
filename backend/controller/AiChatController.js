import AIChat from "../models/AichatSchema.js";

// Save a new chat message
export const saveChatMessage = async (req, res) => {
  try {
    const { role, content } = req.body;
    const userId = req.user._id; // From authMiddleware

    let chat = await AIChat.findOne({ userId });

    if (!chat) {
      chat = new AIChat({ userId, messages: [] });
    }

    chat.messages.push({ role, content });
    await chat.save();

    res.status(201).json({ success: true, message: "Chat message saved", data: chat });
  } catch (error) {
    console.error("Error saving chat message:", error);
    res.status(500).json({ success: false, message: "Server error while saving chat message" });
  }
};

// Get chat history
export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const chat = await AIChat.findOne({ userId });
    if (!chat) {
      return res.status(404).json({ success: false, message: "No chat history found" });
    }

    res.status(200).json({ success: true, data: chat });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ success: false, message: "Server error while fetching chat history" });
  }
};