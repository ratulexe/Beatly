import mongoose from 'mongoose';
import crypto from 'crypto';

const wrappedShareSchema = new mongoose.Schema({
  report: { type: mongoose.Schema.Types.ObjectId, ref: 'WrappedReport', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shareCode: { type: String, unique: true, default: () => crypto.randomBytes(6).toString('hex') },
  slidesToShare: [{ type: mongoose.Schema.Types.ObjectId, ref: 'WrappedSlide' }],
  theme: { type: String, default: 'default' },
  views: { type: Number, default: 0 },
  expiresAt: { type: Date }
}, {
  timestamps: true
});

export const WrappedShare = mongoose.model('WrappedShare', wrappedShareSchema);
