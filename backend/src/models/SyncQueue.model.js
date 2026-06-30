import mongoose from 'mongoose';

const syncQueueSchema = new mongoose.Schema({
  mutationId: {
    type: String,
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  device: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true
  },
  type: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true
  },
  payload: {
    type: mongoose.Schema.Types.Mixed
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'dlq'],
    default: 'pending'
  },
  retryCount: {
    type: Number,
    default: 0
  },
  lastRetry: {
    type: Date
  },
  error: {
    type: String
  },
  clientTimestamp: {
    type: Date,
    required: true
  }
}, { timestamps: true });

// Prevent duplicate processing
syncQueueSchema.index({ mutationId: 1, user: 1 }, { unique: true });

export default mongoose.model('SyncQueue', syncQueueSchema);
