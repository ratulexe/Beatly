import mongoose from 'mongoose';

const discoveryHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  
  // What event occurred in the user's discovery timeline
  eventType: { 
    type: String, 
    enum: [
      'First Time Listened', 
      'New Artist Discovered', 
      'Genre Unlocked', 
      'Album Completed', 
      'Milestone Reached'
    ],
    required: true
  },

  // The entity associated with the event
  entityId: { type: String, required: true }, // Spotify ID
  entityName: { type: String, required: true },
  entityImage: { type: String },
  
  // Custom message to show in the timeline (e.g. "You discovered Khruangbin for the first time")
  message: { type: String, required: true },
  
  // Tags for filtering the timeline
  tags: [{ type: String }], // e.g. ['Artists', '2026', 'Indie']

}, {
  timestamps: true // createdAt is used as the chronological timestamp in the timeline
});

// Index for fetching a user's timeline chronologically
discoveryHistorySchema.index({ userId: 1, createdAt: -1 });

export const DiscoveryHistory = mongoose.model('DiscoveryHistory', discoveryHistorySchema);
