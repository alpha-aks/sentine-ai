import React from 'react';
import { CameraHealthStatus } from '@/types/vision-frontend.types';

interface CameraHealthBadgeProps {
  status: CameraHealthStatus;
}

export function CameraHealthBadge({ status }: CameraHealthBadgeProps) {
  const getBadgeStyle = () => {
    switch (status) {
      case 'CONNECTED':
      case 'STREAMING':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'WAITING':
      case 'INITIALIZING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'LOW_FPS':
      case 'POOR_QUALITY':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'DISCONNECTED':
      case 'BLOCKED':
      case 'LOST':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle()}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${
        ['CONNECTED', 'STREAMING'].includes(status) ? 'bg-emerald-400 animate-pulse' :
        ['DISCONNECTED', 'BLOCKED', 'LOST'].includes(status) ? 'bg-rose-400' : 'bg-amber-400'
      }`} />
      {status.replace('_', ' ')}
    </span>
  );
}
