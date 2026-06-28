import { Notification } from '../../models/Notification.model.js';

export const createNotification = async (notificationData) => {
  const notification = new Notification(notificationData);
  return await notification.save();
};

export const getUserNotifications = async (userId, limit = 20) => {
  return await Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('relatedId');
};

export const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { isRead: true },
    { new: true }
  );
  if (!notification) throw new Error('Notification not found');
  return notification;
};

export const markAllAsRead = async (userId) => {
  return await Notification.updateMany(
    { user: userId, isRead: false },
    { isRead: true }
  );
};
