import mongoose from 'mongoose';

const motivationalProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  completedDays: { type: [Number], default: [] },
  lastCompletedDate: { type: Date },
});

export default mongoose.model('MotivationalProgress', motivationalProgressSchema);