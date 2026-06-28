import mongoose from 'mongoose';

const listeningHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  trackId: { type: mongoose.Schema.Types.ObjectId, ref: 'Track', required: true, index: true },
  playedAt: { type: Date, required: true, index: true },
  device: {
    id: String,
    name: String,
    type: String,
    volumePercent: Number
  },
  country: { type: String }
}, {

  timestamps: true,
  toJSON: { virtuals: true, transform: (doc, ret) => { delete ret.__v; delete ret.id; return ret; } },
  toObject: { virtuals: true }

});

listeningHistorySchema.index({ userId: 1, playedAt: -1 });

export const ListeningHistory = mongoose.model('ListeningHistory', listeningHistorySchema);
