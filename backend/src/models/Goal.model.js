import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Listening Time', 'New Artists', 'New Genres', 'Albums', 'Streak', 'Discovery', 'Social'],
    required: true
  },
  frequency: {
    type: String,
    enum: ['Daily', 'Weekly', 'Monthly'],
    required: true
  },
  target: {
    type: Number,
    required: true
  },
  unit: {
    type: String, // e.g. "minutes", "songs", "artists", "days"
    required: true
  },
  progress: {
    type: Number,
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard', 'Extreme'],
    default: 'Medium'
  },
  xpReward: {
    type: Number,
    default: 50
  },
  coinReward: {
    type: Number,
    default: 10
  },
  aiReason: {
    type: String
  },
  deadline: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient querying of active goals
goalSchema.index({ userId: 1, completed: 1, deadline: 1 });

export const Goal = mongoose.model('Goal', goalSchema);
