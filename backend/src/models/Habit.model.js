import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  habit: {
    type: String,
    required: true
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    required: true
  },
  evidence: [{
    type: String
  }],
  lastDetected: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// A user should ideally only have one record per habit type
habitSchema.index({ userId: 1, habit: 1 }, { unique: true });

export const Habit = mongoose.model('Habit', habitSchema);
