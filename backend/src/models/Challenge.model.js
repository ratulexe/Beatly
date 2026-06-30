import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
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
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard', 'Extreme'],
    default: 'Medium'
  },
  xpReward: {
    type: Number,
    default: 100
  },
  coinReward: {
    type: Number,
    default: 25
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isGlobal: {
    type: Boolean,
    default: true
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  participants: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    progress: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    joinedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

challengeSchema.index({ endDate: 1, isGlobal: 1 });

export const Challenge = mongoose.model('Challenge', challengeSchema);
