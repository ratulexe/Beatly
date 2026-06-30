import React from 'react';
import { Laptop, Smartphone, Globe, Monitor } from 'lucide-react';

export const DeviceStatus = ({ type, platform, isOnline, lastSeen }) => {
  const getIcon = () => {
    switch(type) {
      case 'desktop': return <Monitor size={20} />;
      case 'mobile': return <Smartphone size={20} />;
      default: return <Globe size={20} />;
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-full ${isOnline ? 'bg-green-500/10 text-green-500' : 'bg-white/10 text-gray-400'}`}>
        {getIcon()}
      </div>
      <div className="flex flex-col">
        <span className="font-semibold">{platform}</span>
        <span className="text-xs opacity-60">
          {isOnline ? 'Active Now' : `Last seen ${new Date(lastSeen).toLocaleDateString()}`}
        </span>
      </div>
    </div>
  );
};

export default DeviceStatus;