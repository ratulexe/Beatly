import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  spotifyId: { type: String, required: true, unique: true, index: true },
  displayName: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  country: { type: String },
  product: { type: String, enum: ['free', 'premium', 'open'] },
  followers: { type: Number, default: 0 },
  profileImage: { type: String },
  spotifyProfileUrl: { type: String },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date, default: Date.now },
  connectedAt: { type: Date, default: Date.now },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, {

  timestamps: true,
  toJSON: { virtuals: true, transform: (doc, ret) => { delete ret.__v; delete ret.id; return ret; } },
  toObject: { virtuals: true }

});

export const User = mongoose.model('User', userSchema);
