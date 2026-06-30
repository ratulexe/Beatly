import mongoose from 'mongoose';

const wrappedSlideSchema = new mongoose.Schema({
  report: { type: mongoose.Schema.Types.ObjectId, ref: 'WrappedReport', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: Number, required: true },
  template: { type: String, required: true }, 
  data: { type: mongoose.Schema.Types.Mixed }, 
  bgColor: { type: String }, 
  animation: { type: String }
}, {
  timestamps: true
});

wrappedSlideSchema.index({ report: 1, order: 1 }, { unique: true });

export const WrappedSlide = mongoose.model('WrappedSlide', wrappedSlideSchema);
