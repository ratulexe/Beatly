import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true,
    enum: ['ACHIEVEMENT_UNLOCKED', 'LEVEL_UP', 'RANK_UP', 'STREAK_MILESTONE', 'LISTENING_MILESTONE']
  },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  target: { type: mongoose.Schema.Types.ObjectId, refPath: 'targetModel' },
  targetModel: { type: String, enum: ['User', 'Group', 'Achievement'] },
  metadata: { type: mongoose.Schema.Types.Mixed }, // e.g. { achievementName: "Night Owl", level: 5 }
  scope: { type: String, enum: ['global', 'group', 'private'], default: 'global' },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', index: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true, transform: (doc, ret) => { delete ret.__v; return ret; } },
  toObject: { virtuals: true }
});

// Sort by newest activities
activitySchema.index({ createdAt: -1 });

export const Activity = mongoose.model('Activity', activitySchema);
