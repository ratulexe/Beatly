import mongoose from 'mongoose';

const coachSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  coachingEnabled: {
    type: Boolean,
    default: true
  },
  coachingStyle: {
    type: String,
    enum: ['Friendly', 'Competitive', 'Motivational', 'Balanced', 'Minimal'],
    default: 'Balanced'
  },
  notificationsEnabled: {
    type: Boolean,
    default: true
  },
  challengeDifficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard', 'Extreme'],
    default: 'Medium'
  },
  dailyGoalEnabled: {
    type: Boolean,
    default: true
  },
  weeklyGoalEnabled: {
    type: Boolean,
    default: true
  },
  monthlyGoalEnabled: {
    type: Boolean,
    default: true
  },
  // Rewards integration
  titles: [{ type: String }],
  frames: [{ type: String }],
  themes: [{ type: String }],
  activeTitle: { type: String, default: 'Novice Listener' },
  activeFrame: { type: String, default: 'default' },
  activeTheme: { type: String, default: 'dark' }
}, {
  timestamps: true
});

export const CoachSettings = mongoose.model('CoachSettings', coachSettingsSchema);
