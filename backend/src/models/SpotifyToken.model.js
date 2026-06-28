import mongoose from 'mongoose';

const spotifyTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: true },
  scope: { type: String },
  tokenType: { type: String, default: 'Bearer' }
}, {

  timestamps: true,
  toJSON: { virtuals: true, transform: (doc, ret) => { delete ret.__v; delete ret.id; return ret; } },
  toObject: { virtuals: true }

});

spotifyTokenSchema.virtual('isExpired').get(function() {
  return Date.now() >= this.expiresAt;
});

export const SpotifyToken = mongoose.model('SpotifyToken', spotifyTokenSchema);
