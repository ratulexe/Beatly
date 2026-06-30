import mongoose from 'mongoose';

const rankHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  rank: { type: Number, required: true },
  leaderboardType: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly', 'allTime'], required: true },
  scope: { type: String, enum: ['global', 'group', 'season'], required: true },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  seasonId: { type: String },
  date: { type: Date, required: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true, transform: (doc, ret) => { delete ret.__v; return ret; } },
  toObject: { virtuals: true }
});

// Query performance optimization
rankHistorySchema.index({ user: 1, leaderboardType: 1, scope: 1, date: -1 });

export const RankHistory = mongoose.model('RankHistory', rankHistorySchema);
