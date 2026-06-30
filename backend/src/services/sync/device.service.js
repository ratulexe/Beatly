import Device from '../../models/Device.model.js';
import crypto from 'crypto';

export const registerDevice = async (userId, deviceData) => {
  const sessionId = crypto.randomBytes(32).toString('hex');
  
  const query = {
    user: userId,
    deviceName: deviceData.deviceName || 'Unknown Device',
    platform: deviceData.platform || 'Web',
    browser: deviceData.browser || 'Unknown'
  };

  let device = await Device.findOne(query);

  if (device) {
    device.sessionId = sessionId;
    device.isOnline = true;
    device.lastSeen = new Date();
    await device.save();
    return device;
  }

  device = new Device({
    user: userId,
    sessionId,
    deviceName: query.deviceName,
    deviceType: deviceData.deviceType || 'web',
    platform: query.platform,
    browser: query.browser,
    operatingSystem: deviceData.operatingSystem || 'Unknown',
    appVersion: deviceData.appVersion || '1.0.0',
    isOnline: true,
    lastSeen: new Date()
  });

  await device.save();
  return device;
};

export const getDevices = async (userId) => {
  return await Device.find({ user: userId }).sort({ lastSeen: -1 });
};

export const getDeviceById = async (deviceId, userId) => {
  return await Device.findOne({ _id: deviceId, user: userId });
};

export const updateDevice = async (deviceId, userId, updates) => {
  const allowedUpdates = {};
  if (typeof updates.deviceName === 'string') {
    allowedUpdates.deviceName = updates.deviceName.trim();
  }
  if (typeof updates.appVersion === 'string') {
    allowedUpdates.appVersion = updates.appVersion.trim();
  }

  if (Object.keys(allowedUpdates).length === 0) {
    return await getDeviceById(deviceId, userId);
  }

  return await Device.findOneAndUpdate(
    { _id: deviceId, user: userId },
    { $set: allowedUpdates },
    { new: true }
  );
};

export const removeDevice = async (deviceId, userId) => {
  return await Device.findOneAndDelete({ _id: deviceId, user: userId });
};

export const logoutDevice = async (sessionId, userId) => {
  return await Device.findOneAndDelete({ sessionId, user: userId });
};

export const updateDeviceSyncTime = async (deviceId) => {
  return await Device.findByIdAndUpdate(deviceId, {
    lastSyncTime: new Date(),
    lastSeen: new Date()
  });
};
