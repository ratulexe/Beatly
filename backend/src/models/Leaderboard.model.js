import mongoose from 'mongoose';

const rankingSchema = new mongoose.Schema({
  rank: { type: Number, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listeningTime: { type: Number, default: 0 },
  songs: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  xp: { type: Number, default: 0 },
  score: { type: Number, default: 0 }
}, { _id: false });

const leaderboardSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['daily', 'weekly', 'monthly', 'yearly', 'allTime'], 
    required: true,
    index: true 
  },
  scope: { 
    type: String, 
    enum: ['global', 'group', 'season'], 
    required: true,
    index: true 
  },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', index: true },
  seasonId: { type: String, index: true }, // e.g., 'summer-2027'
  periodStart: { type: Date, required: true },
  generatedAt: { type: Date, default: Date.now },
  rankings: [rankingSchema]
}, {
  timestamps: true,
  toJSON: { virtuals: true, transform: (doc, ret) => { delete ret.__v; return ret; } },
  toObject: { virtuals: true }
});

// A leaderboard is uniquely identified by its type, scope, start date, and group/season if applicable.
leaderboardSchema.index({ type: 1, scope: 1, periodStart: 1, groupId: 1, seasonId: 1 }, { unique: true });

export const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);
