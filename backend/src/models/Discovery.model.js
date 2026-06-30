import mongoose from 'mongoose';

const discoverySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  
  // The user's personalized Discovery Score
  score: { type: Number, default: 0, min: 0, max: 100 },
  
  // Historical stats for calculating the score
  stats: {
    artistsDiscovered: { type: Number, default: 0 },
    albumsDiscovered: { type: Number, default: 0 },
    genresExplored: { type: Number, default: 0 },
    diversityIndex: { type: Number, default: 50 }, // 0-100 (0 = highly repetitive, 100 = highly adventurous)
    acceptedRecommendations: { type: Number, default: 0 },
    ignoredRecommendations: { type: Number, default: 0 }
  },

  // The user's top recommended paths or paths they are currently exploring
  activeExplorationPaths: [{
    genre: String,
    startingArtistId: String,
    progress: { type: Number, default: 0 }
  }],
  
  lastUpdated: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Calculate the score organically before save
discoverySchema.pre('save', function(next) {
  if (this.isModified('stats')) {
    // Basic formula: Base score of 20 + log(artists + albums) * multiplier + diversity bonus
    const base = 20;
    const exploration = Math.log10((this.stats.artistsDiscovered + this.stats.albumsDiscovered + 1) * 10) * 10;
    const diversity = (this.stats.diversityIndex * 0.4);
    const acceptance = (this.stats.acceptedRecommendations / (this.stats.acceptedRecommendations + this.stats.ignoredRecommendations || 1)) * 10;
    
    const calculatedScore = Math.min(100, Math.round(base + exploration + diversity + acceptance));
    this.score = calculatedScore;
  }
  next();
});

export const Discovery = mongoose.model('Discovery', discoverySchema);
