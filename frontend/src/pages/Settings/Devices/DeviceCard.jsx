import { DeviceStatus } from "../../../components/sync/DeviceStatus";
import { Trash2 } from 'lucide-react';

export const DeviceCard = ({ device, onRemove, isCurrentDevice }) => {
  return (
    <div className={`p-4 rounded-xl border flex items-center justify-between ${isCurrentDevice ? 'bg-[var(--wrapped-primary)]/10 border-[var(--wrapped-primary)]/50' : 'bg-white/5 border-white/10'}`}>
      <div className="flex items-center gap-4">
        <DeviceStatus 
          type={device.deviceType} 
          platform={device.platform} 
          isOnline={device.isOnline} 
          lastSeen={device.lastSeen} 
        />
        <div className="flex flex-col">
          <span className="font-bold">{device.deviceName} {isCurrentDevice && <span className="ml-2 text-xs bg-[#1DB954] text-black px-2 py-0.5 rounded-full">This Device</span>}</span>
          <span className="text-sm opacity-60">{device.browser} • {device.operatingSystem}</span>
        </div>
      </div>
      {!isCurrentDevice && (
        <button 
          onClick={() => onRemove(device._id)}
          className="p-2 hover:bg-red-500/20 text-red-500 rounded-full transition-colors"
          title="Log out device"
        >
          <Trash2 size={20} />
        </button>
      )}
    </div>
  );
};
