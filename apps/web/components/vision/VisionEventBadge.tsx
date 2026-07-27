import React from 'react';
import { VisionEventType } from '@/types/vision-frontend.types';
import { Smartphone, UserX, EyeOff, Users, AlertTriangle } from 'lucide-react';

interface VisionEventBadgeProps {
  eventType: VisionEventType;
}

export function VisionEventBadge({ eventType }: VisionEventBadgeProps) {
  const getBadgeConfig = () => {
    switch (eventType) {
      case 'PHONE_DETECTED':
        return { label: 'Phone Detected', color: 'bg-rose-500/20 text-rose-400 border-rose-500/40', icon: Smartphone };
      case 'MULTIPLE_FACES':
      case 'SECOND_PERSON':
        return { label: eventType === 'SECOND_PERSON' ? 'Second Person' : 'Multiple Faces', color: 'bg-orange-500/20 text-orange-400 border-orange-500/40', icon: Users };
      case 'NO_FACE':
      case 'CAMERA_BLOCKED':
        return { label: eventType === 'NO_FACE' ? 'No Face' : 'Camera Blocked', color: 'bg-rose-500/20 text-rose-400 border-rose-500/40', icon: UserX };
      case 'LOOKING_AWAY':
      case 'HEAD_MOVEMENT':
        return { label: eventType === 'LOOKING_AWAY' ? 'Looking Away' : 'Head Movement', color: 'bg-amber-500/20 text-amber-400 border-amber-500/40', icon: EyeOff };
      default:
        return { label: eventType.replace('_', ' '), color: 'bg-muted text-muted-foreground border-border', icon: AlertTriangle };
    }
  };

  const { label, color, icon: Icon } = getBadgeConfig();

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${color}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
