import mongoose from 'mongoose';

const trackSchema = new mongoose.Schema({
  spotifyTrackId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  durationMs: { type: Number, required: true, index: true },
  explicit: { type: Boolean, default: false },
  popularity: { type: Number, min: 0, max: 100 },
  previewUrl: { type: String },
  spotifyUrl: { type: String },
  albumId: { type: mongoose.Schema.Types.ObjectId, ref: 'Album' },
  artistIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artist' }]
}, {

  timestamps: true,
  toJSON: { virtuals: true, transform: (doc, ret) => { delete ret.__v; delete ret.id; return ret; } },
  toObject: { virtuals: true }

});

export const Track = mongoose.model('Track', trackSchema);
