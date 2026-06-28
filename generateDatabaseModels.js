import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.join(__dirname, 'backend');
const modelsDir = path.join(backendRoot, 'src', 'models');
const databaseDir = path.join(backendRoot, 'src', 'database');

fs.mkdirSync(modelsDir, { recursive: true });
fs.mkdirSync(databaseDir, { recursive: true });

const commonOptions = `
  timestamps: true,
  toJSON: { virtuals: true, transform: (doc, ret) => { delete ret.__v; delete ret.id; return ret; } },
  toObject: { virtuals: true }
`;

const userModel = `import mongoose from 'mongoose';

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
${commonOptions}
});

export const User = mongoose.model('User', userSchema);
`;

const spotifyTokenModel = `import mongoose from 'mongoose';

const spotifyTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: true },
  scope: { type: String },
  tokenType: { type: String, default: 'Bearer' }
}, {
${commonOptions}
});

spotifyTokenSchema.virtual('isExpired').get(function() {
  return Date.now() >= this.expiresAt;
});

export const SpotifyToken = mongoose.model('SpotifyToken', spotifyTokenSchema);
`;

const artistModel = `import mongoose from 'mongoose';

const artistSchema = new mongoose.Schema({
  spotifyArtistId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, index: true },
  genres: [{ type: String }],
  followers: { type: Number, default: 0 },
  popularity: { type: Number, min: 0, max: 100 },
  image: { type: String },
  spotifyUrl: { type: String }
}, {
${commonOptions}
});

export const Artist = mongoose.model('Artist', artistSchema);
`;

const albumModel = `import mongoose from 'mongoose';

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
${commonOptions}
});

export const Album = mongoose.model('Album', albumSchema);
`;

const trackModel = `import mongoose from 'mongoose';

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
${commonOptions}
});

export const Track = mongoose.model('Track', trackSchema);
`;

const listeningHistoryModel = `import mongoose from 'mongoose';

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
${commonOptions}
});

listeningHistorySchema.index({ userId: 1, playedAt: -1 });

export const ListeningHistory = mongoose.model('ListeningHistory', listeningHistorySchema);
`;

const databaseIndex = `export { User } from '../models/User.model.js';
export { SpotifyToken } from '../models/SpotifyToken.model.js';
export { Artist } from '../models/Artist.model.js';
export { Album } from '../models/Album.model.js';
export { Track } from '../models/Track.model.js';
export { ListeningHistory } from '../models/ListeningHistory.model.js';
`;

fs.writeFileSync(path.join(modelsDir, 'User.model.js'), userModel);
fs.writeFileSync(path.join(modelsDir, 'SpotifyToken.model.js'), spotifyTokenModel);
fs.writeFileSync(path.join(modelsDir, 'Artist.model.js'), artistModel);
fs.writeFileSync(path.join(modelsDir, 'Album.model.js'), albumModel);
fs.writeFileSync(path.join(modelsDir, 'Track.model.js'), trackModel);
fs.writeFileSync(path.join(modelsDir, 'ListeningHistory.model.js'), listeningHistoryModel);
fs.writeFileSync(path.join(databaseDir, 'index.js'), databaseIndex);

console.log('Database models scaffolded successfully.');
