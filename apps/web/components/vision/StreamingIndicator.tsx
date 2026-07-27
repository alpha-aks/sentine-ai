import React from 'react';
import { Radio, Wifi } from 'lucide-react';

interface StreamingIndicatorProps {
  isStreaming: boolean;
  networkQuality?: 'EXCELLENT' | 'GOOD' | 'POOR';
}

export function StreamingIndicator({ isStreaming, networkQuality: _networkQuality = 'EXCELLENT' }: StreamingIndicatorProps) {
  if (!isStreaming) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-lg border border-border">
        <Radio className="h-4 w-4 text-muted-foreground" />
        <span>Stream Off</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      <span>STREAMING LIVE</span>
      <Wifi className="h-3.5 w-3.5 text-emerald-400 ml-1" />
    </div>
  );
}
