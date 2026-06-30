import Device from '../../models/Device.model.js';

// In-memory mapping of socket IDs to Device IDs
const connectedDevices = new Map();

export const markDeviceOnline = async (socketId, deviceId) => {
  connectedDevices.set(socketId, deviceId);
  return await Device.findByIdAndUpdate(deviceId, {
    isOnline: true,
    lastSeen: new Date()
  });
};

export const markDeviceOffline = async (socketId) => {
  const deviceId = connectedDevices.get(socketId);
  if (deviceId) {
    connectedDevices.delete(socketId);
    await Device.findByIdAndUpdate(deviceId, {
      isOnline: false,
      lastSeen: new Date()
    });
  }
};

export const getOnlineDevicesForUser = async (userId) => {
  return await Device.find({ user: userId, isOnline: true });
};
