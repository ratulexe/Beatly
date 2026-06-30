import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DeviceCard } from './DeviceCard';
import SessionCard from './SessionCard';
import OfflineBanner from '../../../components/sync/OfflineBanner';
import { ConnectionStatus } from '../../../components/sync/ConnectionStatus';
import { SyncIndicator } from '../../../components/sync/SyncIndicator';
import { api } from '../../../services/apiClient';
import { useSync } from '../../../context/SyncContext';

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { deviceId, triggerSync } = useSync();

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const res = await api.get('/api/devices');
      setDevices(Array.isArray(res) ? res : (res.devices || res.data || []));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDevice = async (id) => {
    try {
      await api.delete(`/api/devices/${id}`);
      setDevices(prev => prev.filter(d => d._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    try {
      await api.post('/api/session/logout-device', { sessionId });
      setDevices(prev => prev.filter(d => d.sessionId !== sessionId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8">Loading devices...</div>;

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto p-6">
      <OfflineBanner />
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <h1 className="text-3xl font-black">Connected Devices</h1>
          <div className="flex items-center gap-3">
            <ConnectionStatus />
            <SyncIndicator />
            <button
              onClick={triggerSync}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-bold transition-colors"
            >
              Sync Now
            </button>
          </div>
        </div>
        <p className="text-gray-400">Manage all devices where you're logged into Beatly. Log out of unrecognized devices to secure your account.</p>
      </div>

      <div className="flex flex-col gap-4 mt-4">
        {devices.map(device => (
          <DeviceCard 
            key={device._id} 
            device={device} 
            isCurrentDevice={device._id === deviceId}
            onRemove={handleRemoveDevice}
          />
        ))}
      </div>

      <div className="mt-4">
        <h2 className="text-xl font-bold mb-3">Active Sessions</h2>
        <div className="flex flex-col gap-3">
          {devices.map(device => (
            <SessionCard
              key={device.sessionId}
              session={device}
              isCurrent={device._id === deviceId}
              onRevoke={handleRevokeSession}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Devices;
