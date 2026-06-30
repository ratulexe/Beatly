import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../services/apiClient';
import DeviceStatus from '../../../components/sync/DeviceStatus';
import LastSyncBadge from '../../../components/sync/LastSyncBadge';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const DeviceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');

  const deviceQuery = useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const response = await api.get('/api/devices');
      return Array.isArray(response) ? response : (response.devices || response.data || []);
    },
    staleTime: 60 * 1000,
    retry: 1
  });

  const device = deviceQuery.data?.find(d => d._id === id);

  const renameDeviceMutation = useMutation({
    mutationFn: () => api.patch(`/api/devices/${id}`, { deviceName: editName }),
    onSuccess: (updatedDevice) => {
      queryClient.setQueryData(['devices'], (devices = []) => devices.map((item) => (
        item._id === updatedDevice._id ? updatedDevice : item
      )));
      setIsEditing(false);
      toast.success('Device renamed successfully');
    },
    onError: () => toast.error('Failed to rename device')
  });

  const removeDeviceMutation = useMutation({
    mutationFn: () => api.delete(`/api/devices/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast.success('Device removed successfully');
      navigate('/settings/devices');
    },
    onError: () => toast.error('Failed to remove device')
  });

  const startEditing = () => {
    setEditName(device.deviceName);
    setIsEditing(true);
  };

  const handleRemove = async () => {
    if (window.confirm('Are you sure you want to remove this device? This will log it out immediately.')) {
      try {
        removeDeviceMutation.mutate();
      } catch (err) {
        toast.error('Failed to remove device');
      }
    }
  };

  const handleSaveRename = async () => {
    renameDeviceMutation.mutate();
  };

  if (deviceQuery.isLoading) return <div className="text-gray-400">Loading device details...</div>;
  if (deviceQuery.isError) return <div className="text-red-400">Failed to load device details</div>;
  if (!device) return <div className="text-red-400">Device not found</div>;

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/settings/devices')}
            className="p-2 bg-gray-800 text-gray-400 rounded-full hover:text-white hover:bg-gray-700 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-white">Device Details</h1>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700/50 relative overflow-hidden backdrop-blur-sm">
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-6">
            <div className="bg-gray-800 p-6 rounded-2xl text-primary border border-gray-700 shadow-xl">
              {device.deviceType === 'desktop' ? (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              ) : (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="flex items-center gap-3 mb-2">
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="text-2xl font-bold bg-gray-900 border border-gray-700 rounded-lg px-3 py-1 text-white focus:outline-none focus:border-beatly-primary w-full max-w-sm"
                    autoFocus
                  />
                  <button onClick={handleSaveRename} disabled={renameDeviceMutation.isPending} className="bg-beatly-primary text-black px-4 py-1.5 rounded-lg font-bold text-sm hover:opacity-90 disabled:opacity-60">Save</button>
                  <button onClick={() => { setIsEditing(false); setEditName(device.deviceName); }} className="text-gray-400 hover:text-white px-3 py-1.5 text-sm font-bold">Cancel</button>
                </div>
              ) : (
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-bold text-white">{device.deviceName}</h2>
                  <button onClick={startEditing} className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition" title="Rename Device">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                </div>
              )}
              <div className="flex items-center gap-3">
                <DeviceStatus isOnline={device.isOnline} />
                <span className="text-gray-500">•</span>
                <LastSyncBadge lastSyncTime={device.lastSyncTime} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800/80 rounded-xl p-6 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">System Information</h3>
            <ul className="space-y-4">
              <li className="flex justify-between">
                <span className="text-gray-400">Platform</span>
                <span className="text-white font-medium">{device.platform}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-400">Browser/App</span>
                <span className="text-white font-medium">{device.browser || 'Beatly Desktop'}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-400">OS</span>
                <span className="text-white font-medium">{device.operatingSystem}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-400">App Version</span>
                <span className="text-white font-medium">{device.appVersion || '1.0.0'}</span>
              </li>
            </ul>
          </div>
          <div className="bg-gray-800/80 rounded-xl p-6 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Activity Log</h3>
            <ul className="space-y-4">
              <li className="flex justify-between">
                <span className="text-gray-400">First Seen</span>
                <span className="text-white font-medium">{format(new Date(device.createdAt), 'PP p')}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-400">Last Seen</span>
                <span className="text-white font-medium">{format(new Date(device.lastSeen), 'PP p')}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-400">Status</span>
                <span className="text-white font-medium">{device.isOnline ? 'Active' : 'Offline'}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-700 flex justify-end">
          <button
            onClick={handleRemove}
            className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-400 font-semibold rounded-xl hover:bg-red-500/20 border border-red-500/20 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Remove Device
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeviceDetails;
