import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DeviceCard } from './DeviceCard';
import SessionCard from './SessionCard';
import OfflineBanner from '../../../components/sync/OfflineBanner';
import { ConnectionStatus } from '../../../components/sync/ConnectionStatus';
import { SyncIndicator } from '../../../components/sync/SyncIndicator';
import { api } from '../../../services/apiClient';
import { useSync } from '../../../context/SyncContext';
import { ErrorState } from '../../../components/ui/ErrorState';

const Devices = () => {
  const queryClient = useQueryClient();
  const { deviceId, triggerSync } = useSync();

  const devicesQuery = useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const res = await api.get('/api/devices');
      return Array.isArray(res) ? res : (res.devices || res.data || []);
    },
    staleTime: 60 * 1000,
    retry: 1
  });

  const removeDeviceMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/devices/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['devices'] })
  });

  const revokeSessionMutation = useMutation({
    mutationFn: (sessionId) => api.post('/api/session/logout-device', { sessionId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['devices'] })
  });

  if (devicesQuery.isLoading) return <div className="p-8">Loading devices...</div>;

  if (devicesQuery.isError) {
    return (
      <ErrorState
        title="Failed to load devices"
        message="Beatly could not load your connected devices."
        onRetry={devicesQuery.refetch}
      />
    );
  }

  const devices = devicesQuery.data || [];

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
            onRemove={(id) => removeDeviceMutation.mutate(id)}
          />
        ))}
        {devices.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-beatly-surface p-8 text-center text-gray-400">
            No connected devices found.
          </div>
        )}
      </div>

      <div className="mt-4">
        <h2 className="text-xl font-bold mb-3">Active Sessions</h2>
        <div className="flex flex-col gap-3">
          {devices.map(device => (
            <SessionCard
              key={device.sessionId}
              session={device}
              isCurrent={device._id === deviceId}
              onRevoke={(sessionId) => revokeSessionMutation.mutate(sessionId)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Devices;
