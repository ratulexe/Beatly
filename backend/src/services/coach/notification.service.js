import { Notification } from '../../models/Notification.model.js';
// Notification was created in Phase 11 probably, but let's just make sure we handle it

export const notificationService = {
  async notify(userId, title, message, priority = 'Normal') {
    // priority: Critical, High, Normal, Low
    try {
      const notif = new Notification({
        userId,
        title,
        message,
        type: 'Coach', // Custom type
        priority, // Will be mapped correctly
        read: false,
        createdAt: new Date()
      });
      await notif.save();
    } catch (e) {
      console.warn('Failed to dispatch notification. Notification model may not support priority yet.', e);
    }
  },
  
  async getNotifications(userId) {
    return Notification.find({ userId }).sort({ createdAt: -1 }).limit(20);
  }
};
