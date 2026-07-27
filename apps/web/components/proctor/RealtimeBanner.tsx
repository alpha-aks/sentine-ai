'use client';

import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';

interface RealtimeBannerProps {
  isConnected: boolean;
}

export function RealtimeBanner({ isConnected }: RealtimeBannerProps) {
  if (isConnected) {
    return (
      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
        <Wifi className="h-3.5 w-3.5 animate-pulse" />
        <span>Realtime Telemetry Gateway Connected (ws://localhost:4008)</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-full border border-rose-500/20">
      <WifiOff className="h-3.5 w-3.5" />
      <span>Realtime Stream Reconnecting... (Polling Fallback Active)</span>
    </div>
  );
}
