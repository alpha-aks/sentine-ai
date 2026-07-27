'use client';

import React from 'react';
import { Video, Mic, Maximize2, Eye } from 'lucide-react';

interface ConnectionBadgeProps {
  status: string;
  isCameraActive?: boolean;
  isMicActive?: boolean;
  isFullscreen?: boolean;
  gazeOk?: boolean;
}

export function ConnectionBadge({
  status,
  isCameraActive = true,
  isMicActive = true,
  isFullscreen = true,
  gazeOk = true
}: ConnectionBadgeProps) {
  const isDisconnected = status === 'DISCONNECTED';

  return (
    <div className="flex items-center gap-1.5 text-[11px] font-mono">
      <div
        className={`p-1 rounded-sm border ${
          isCameraActive && !isDisconnected
            ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
            : 'text-rose-400 border-rose-500/30 bg-rose-500/10'
        }`}
        title={isCameraActive ? 'Webcam active' : 'Webcam inactive'}
      >
        <Video className="h-3 w-3" />
      </div>

      <div
        className={`p-1 rounded-sm border ${
          isMicActive && !isDisconnected
            ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
            : 'text-rose-400 border-rose-500/30 bg-rose-500/10'
        }`}
        title={isMicActive ? 'Microphone active' : 'Microphone inactive'}
      >
        <Mic className="h-3 w-3" />
      </div>

      <div
        className={`p-1 rounded-sm border ${
          isFullscreen && !isDisconnected
            ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
            : 'text-amber-400 border-amber-500/30 bg-amber-500/10'
        }`}
        title={isFullscreen ? 'Fullscreen active' : 'Window un-maximized'}
      >
        <Maximize2 className="h-3 w-3" />
      </div>

      <div
        className={`p-1 rounded-sm border ${
          gazeOk && !isDisconnected
            ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
            : 'text-rose-400 border-rose-500/30 bg-rose-500/10'
        }`}
        title={gazeOk ? 'Gaze centered' : 'Off-screen gaze'}
      >
        <Eye className="h-3 w-3" />
      </div>
    </div>
  );
}
