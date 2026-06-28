import mongoose from 'mongoose';

const albumSchema = new mongoose.Schema({
  spotifyAlbumId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  releaseDate: { type: Date },
  totalTracks: { type: Number },
  albumType: { type: String, enum: ['album', 'single', 'compilation'] },
  image: { type: String },
  spotifyUrl: { type: String },
  artistIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artist' }]
}, {

  timestamps: true,
  toJSON: { virtuals: true, transform: (doc, ret) => { delete ret.__v; delete ret.id; return ret; } },
  toObject: { virtuals: true }

});

export const Album = mongoose.model('Album', albumSchema);
