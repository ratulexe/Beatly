import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  deviceName: {
    type: String,
    required: true,
    trim: true
  },
  deviceType: {
    type: String, // 'desktop', 'mobile', 'tablet', 'web'
    required: true
  },
  platform: {
    type: String, // 'Electron', 'Web', 'iOS', 'Android'
    required: true
  },
  browser: {
    type: String,
    default: 'Unknown'
  },
  operatingSystem: {
    type: String,
    default: 'Unknown'
  },
  appVersion: {
    type: String,
    default: '1.0.0'
  },
  lastSyncTime: {
    type: Date,
    default: Date.now
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  }
}, { timestamps: true });

export default mongoose.model('Device', deviceSchema);
