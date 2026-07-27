import React from 'react';
import { Activity } from 'lucide-react';

interface FrameRateIndicatorProps {
  fps: number;
  latencyMs?: number;
}

export function FrameRateIndicator({ fps, latencyMs = 12 }: FrameRateIndicatorProps) {
  return (
    <div className="flex items-center gap-3 text-xs font-mono bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-emerald-400">
      <div className="flex items-center gap-1">
        <Activity className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
        <span>FPS: {fps}</span>
      </div>
      <span className="text-white/20">|</span>
      <span className="text-muted-foreground">Latency: <strong className="text-foreground">{latencyMs}ms</strong></span>
    </div>
  );
}
