import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  
  // The entity being recommended
  entityType: { type: String, enum: ['Artist', 'Album', 'Track', 'Genre'], required: true },
  entityId: { type: String, required: true }, // Spotify ID
  entityName: { type: String, required: true },
  entityImage: { type: String }, // URL to image/artwork
  entityUri: { type: String }, // Spotify URI for playback
  previewUrl: { type: String }, // 30 second audio preview URL
  
  // Categorization for the UI dashboard sections
  category: { 
    type: String, 
    enum: [
      'New Artists', 
      'Similar Artists', 
      'Hidden Gems', 
      'Trending Artists', 
      'New Releases', 
      'Albums You\'ll Love', 
      'Songs You May Like', 
      'Genre Exploration', 
      'Underrated Artists'
    ],
    required: true
  },

  // The AI Generated Explanation
  aiExplanation: { type: String, required: true }, // e.g. "You frequently listen to Tame Impala..."
  confidenceScore: { type: Number, required: true }, // 0 to 100
  
  // Metadata for filtering in UI
  genres: [{ type: String }],
  tags: [{ type: String }], // e.g., ["Because you love Tame Impala", "Glass Animals"]
  
  // Feedback Tracking
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'ignored', 'liked', 'disliked', 'saved'],
    default: 'pending'
  },
  
  // When this recommendation expires/refreshes
  expiresAt: { type: Date, required: true }

}, {
  timestamps: true
});

// Compound index for efficient querying of active recommendations for a user
recommendationSchema.index({ userId: 1, status: 1, category: 1 });

export const Recommendation = mongoose.model('Recommendation', recommendationSchema);
