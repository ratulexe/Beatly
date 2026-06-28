import mongoose from 'mongoose';

const timeSlotSchema = {
  playCount: { type: Number, default: 0 },
  totalMs: { type: Number, default: 0 }
};

const analyticsSnapshotSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  periodType: { 
    type: String, 
    required: true, 
    enum: ['daily', 'weekly', 'monthly', 'overall'],
    index: true 
  },
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, required: true },

  // --- Listening Overview ---
  listening: {
    totalMs: { type: Number, default: 0 },
    totalSongs: { type: Number, default: 0 },
    uniqueTracks: { type: Number, default: 0 },
    uniqueArtists: { type: Number, default: 0 },
    uniqueAlbums: { type: Number, default: 0 }
  },

  // --- Top Artists (top 20) ---
  topArtists: [{
    artistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist' },
    name: String,
    image: String,
    playCount: Number,
    totalMs: Number
  }],

  // --- Top Tracks (top 20) ---
  topTracks: [{
    trackId: { type: mongoose.Schema.Types.ObjectId, ref: 'Track' },
    name: String,
    albumImage: String,
    artists: [String],
    playCount: Number,
    totalMs: Number
  }],

  // --- Top Albums (top 10) ---
  topAlbums: [{
    albumId: { type: mongoose.Schema.Types.ObjectId, ref: 'Album' },
    name: String,
    image: String,
    artists: [String],
    playCount: Number,
    totalMs: Number
  }],

  // --- Genre Distribution ---
  genres: [{
    genre: String,
    playCount: Number,
    totalMs: Number,
    percentage: Number
  }],

  // --- Time Insights ---
  timeInsights: {
    hourly: [timeSlotSchema],      // 24 buckets (0-23)
    dayOfWeek: [timeSlotSchema],   // 7 buckets (Sun=1 to Sat=7)
    periods: {
      morning: timeSlotSchema,     // 6am-12pm
      afternoon: timeSlotSchema,   // 12pm-5pm
      evening: timeSlotSchema,     // 5pm-9pm
      night: timeSlotSchema        // 9pm-6am
    }
  },

  generatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true, transform: (doc, ret) => { delete ret.__v; delete ret.id; return ret; } },
  toObject: { virtuals: true }
});

// Compound unique index: one snapshot per user per period type per start date
analyticsSnapshotSchema.index({ userId: 1, periodType: 1, periodStart: 1 }, { unique: true });

export const AnalyticsSnapshot = mongoose.model('AnalyticsSnapshot', analyticsSnapshotSchema);
