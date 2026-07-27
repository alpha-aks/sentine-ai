import React from 'react';
import { CameraHealthStatus } from '@/types/vision-frontend.types';
import { Video, VideoOff, AlertTriangle } from 'lucide-react';

interface CameraStatusIndicatorProps {
  status: CameraHealthStatus;
}

export function CameraStatusIndicator({ status }: CameraStatusIndicatorProps) {
  const isOk = ['CONNECTED', 'STREAMING'].includes(status);
  const isErr = ['DISCONNECTED', 'BLOCKED', 'LOST'].includes(status);

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${
      isOk ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
      isErr ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
      'bg-amber-500/10 border-amber-500/30 text-amber-400'
    }`}>
      {isOk ? <Video className="h-4 w-4" /> : isErr ? <VideoOff className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
      <span>{status === 'STREAMING' ? 'Camera Live' : status.replace('_', ' ')}</span>
    </div>
  );
}
