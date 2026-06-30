import mongoose from 'mongoose';

const wrappedReportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['monthly', 'yearly', 'custom'], required: true },
  period: {
    year: { type: Number },
    month: { type: Number }, // 1-12
    startDate: { type: Date },
    endDate: { type: Date }
  },
  snapshot: { type: mongoose.Schema.Types.ObjectId, ref: 'AnalyticsSnapshot' },
  stats: {
    totalListeningMinutes: { type: Number, default: 0 },
    topArtists: [{
      artist: { type: String },
      name: { type: String },
      image: { type: String },
      playCount: { type: Number }
    }],
    topTracks: [{
      track: { type: String },
      name: { type: String },
      image: { type: String },
      playCount: { type: Number }
    }],
    topGenres: [{
      genre: { type: String },
      count: { type: Number }
    }],
    discoveryScore: { type: Number },
    longestStreak: { type: Number },
    deltas: {
      listeningTimePercentChange: { type: Number },
      newArtistsDiscovered: { type: Number }
    }
  },
  aiInsights: {
    personality: { type: String },
    summary: { type: String },
    roast: { type: String }
  }
}, {
  timestamps: true
});

export const WrappedReport = mongoose.model('WrappedReport', wrappedReportSchema);
