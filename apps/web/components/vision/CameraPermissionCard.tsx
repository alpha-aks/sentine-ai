import React from 'react';
import { CameraDeviceInfo } from '@/types/vision-frontend.types';
import { Video, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface CameraPermissionCardProps {
  devices: CameraDeviceInfo[];
  selectedDeviceId: string;
  onSelectDevice: (deviceId: string) => void;
  onRequestPermission: () => void;
  permissionGranted: boolean;
  permissionDenied: boolean;
}

export function CameraPermissionCard({
  devices,
  selectedDeviceId,
  onSelectDevice,
  onRequestPermission,
  permissionGranted,
  permissionDenied
}: CameraPermissionCardProps) {
  return (
    <div className="p-6 rounded-2xl bg-card border border-border space-y-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
            permissionGranted ? 'bg-emerald-500/15 text-emerald-400' : 'bg-primary/15 text-primary'
          }`}>
            <Video className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-foreground">Webcam Hardware Access</h3>
            <p className="text-xs text-muted-foreground">Vision Guard AI requires camera stream permissions</p>
          </div>
        </div>

        {permissionGranted ? (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Granted
          </span>
        ) : (
          <button
            onClick={onRequestPermission}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs transition-all shadow-xs"
          >
            Allow Camera Access
          </button>
        )}
      </div>

      {permissionDenied && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-1">
          <div className="font-semibold flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-rose-400" />
            <span>Camera Permission Blocked</span>
          </div>
          <p className="text-muted-foreground">
            Your browser has blocked webcam access. Please click the camera icon in your address bar to enable permissions.
          </p>
        </div>
      )}

      {devices.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-border">
          <label className="text-xs font-semibold text-muted-foreground">Select Primary Camera Hardware</label>
          <select
            value={selectedDeviceId}
            onChange={(e) => onSelectDevice(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-muted/40 border border-border text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50"
          >
            {devices.map((device) => (
              <option key={device.deviceId} value={device.deviceId} className="bg-card text-foreground">
                {device.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
