import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true }, // e.g., 'friend_request', 'group_invite', 'system'
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  relatedId: { type: mongoose.Schema.Types.ObjectId }, // e.g., FriendRequest ID or Group ID
  onModel: { type: String, enum: ['FriendRequest', 'Group', 'Invitation', 'User'] },
  link: { type: String }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

export const Notification = mongoose.model('Notification', notificationSchema);
