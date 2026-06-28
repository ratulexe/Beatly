import mongoose from 'mongoose';

const artistSchema = new mongoose.Schema({
  spotifyArtistId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, index: true },
  genres: [{ type: String }],
  followers: { type: Number, default: 0 },
  popularity: { type: Number, min: 0, max: 100 },
  image: { type: String },
  spotifyUrl: { type: String }
}, {

  timestamps: true,
  toJSON: { virtuals: true, transform: (doc, ret) => { delete ret.__v; delete ret.id; return ret; } },
  toObject: { virtuals: true }

});

export const Artist = mongoose.model('Artist', artistSchema);
