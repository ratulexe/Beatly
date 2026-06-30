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
  explicitContent: { type: Boolean, default: false },
  
  spotify: {
    accessToken: { type: String },
    refreshToken: { type: String },
    expiresAt: { type: Date },
    scope: { type: String },
    tokenType: { type: String, default: 'Bearer' }
  },

  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date, default: Date.now },
  connectedAt: { type: Date, default: Date.now },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Phase 11 Fields
  xp: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  listeningPersonality: { type: String }, // e.g., 'Night Owl'
  privacySettings: {
    leaderboardVisibility: { type: String, enum: ['public', 'friends', 'group', 'private'], default: 'public' }
  }
}, {

  timestamps: true,
  toJSON: { 
    virtuals: true, 
    transform: (doc, ret) => { 
      delete ret.__v; 
      delete ret._id; 
      delete ret.spotify; // NEVER expose tokens
      return ret; 
    } 
  },
  toObject: { virtuals: true }

});

userSchema.index({ xp: -1 });
userSchema.index({ currentStreak: -1 });

export const User = mongoose.model('User', userSchema);
