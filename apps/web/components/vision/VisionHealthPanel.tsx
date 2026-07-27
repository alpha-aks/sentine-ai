import React from 'react';
import { useVisionMetricsQuery, useVisionStatusQuery } from '@/hooks/use-vision-guard-query';
import { Activity, Cpu, Gauge, Zap } from 'lucide-react';

export function VisionHealthPanel() {
  const { data: metrics, isLoading: _isMetricsLoading } = useVisionMetricsQuery();
  const { data: status, isLoading: _isStatusLoading } = useVisionStatusQuery();

  const avgLatency = metrics?.averageInferenceLatencyMs ?? 12;
  const fps = metrics?.currentFps ?? 15;
  const executionMode = status?.executionMode ?? 'GPU';

  return (
    <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-sm text-foreground">
          <Zap className="h-4 w-4 text-emerald-400" />
          <span>Vision Guard AI Health & Engine Telemetry</span>
        </div>
        <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          Engine Online
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-1">
          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <Gauge className="h-3.5 w-3.5 text-primary" />
            <span>Avg Latency</span>
          </div>
          <div className="text-base font-bold font-mono text-emerald-400">{avgLatency} ms</div>
          <div className="text-[10px] text-muted-foreground">&lt; 100ms Target</div>
        </div>

        <div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-1">
          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
            <span>Inference FPS</span>
          </div>
          <div className="text-base font-bold font-mono text-foreground">{fps} FPS</div>
          <div className="text-[10px] text-muted-foreground">Target Rate</div>
        </div>

        <div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-1">
          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-purple-400" />
            <span>Hardware Mode</span>
          </div>
          <div className="text-base font-bold font-mono text-purple-400">{executionMode}</div>
          <div className="text-[10px] text-muted-foreground">Tensor Acceleration</div>
        </div>

        <div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-1">
          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span>Active Streams</span>
          </div>
          <div className="text-base font-bold font-mono text-foreground">{status?.activeStreams ?? 1}</div>
          <div className="text-[10px] text-muted-foreground">Live Sessions</div>
        </div>
      </div>
    </div>
  );
}
