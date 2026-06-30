import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true, index: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  rarity: { type: String, enum: ['Common', 'Rare', 'Epic', 'Legendary'], required: true },
  xpReward: { type: Number, required: true },
  unlockCondition: {
    type: { type: String, required: true }, // e.g., 'total_songs', 'streak', 'night_owl'
    threshold: { type: mongoose.Schema.Types.Mixed, required: true } // e.g., 500, 7, 'Night Owl'
  },
  category: { type: String, enum: ['Milestone', 'Streak', 'Time', 'Discovery', 'Social'], required: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true, transform: (doc, ret) => { delete ret.__v; return ret; } },
  toObject: { virtuals: true }
});

export const Achievement = mongoose.model('Achievement', achievementSchema);
