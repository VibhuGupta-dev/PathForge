import express from 'express';
import MotivationalProgress from '../models/30days.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get progress
router.get('/progress', authMiddleware, async (req, res) => {
  try {
    const progress = await MotivationalProgress.findOne({ userId: req.user._id });
    res.json({
      success: true,
      progress: progress ? progress.completedDays : [],
    });
  } catch (err) {
    console.error('Progress fetch error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Complete day
router.post('/complete-day', authMiddleware, async (req, res) => {
  try {
    const { day } = req.body;
    if (!day || day < 1 || day > 31) {
      return res.status(400).json({ success: false, message: 'Invalid day' });
    }

    let progress = await MotivationalProgress.findOne({ userId: req.user._id });
    if (!progress) {
      progress = new MotivationalProgress({ userId: req.user._id });
    }

    if (!progress.completedDays.includes(day)) {
      progress.completedDays.push(day);
      progress.lastCompletedDate = new Date();
      await progress.save();
    }

    res.json({ success: true, message: 'Day completed' });
  } catch (err) {
    console.error('Complete day error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;