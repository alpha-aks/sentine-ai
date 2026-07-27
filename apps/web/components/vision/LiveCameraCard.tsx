import React from 'react';
import { CameraHealthBadge } from './CameraHealthBadge';
import { VisionEventBadge } from './VisionEventBadge';
import { CameraHealthStatus, VisionEventType } from '@/types/vision-frontend.types';
import { User } from 'lucide-react';

interface LiveCameraCardProps {
  candidateName: string;
  candidateId: string;
  sessionStatus?: string;
  cameraHealth: CameraHealthStatus;
  latestEvent?: VisionEventType;
  riskScore: number;
  onSelectCandidate?: () => void;
}

export function LiveCameraCard({
  candidateName,
  candidateId,
  sessionStatus = 'IN_PROGRESS',
  cameraHealth,
  latestEvent,
  riskScore,
  onSelectCandidate
}: LiveCameraCardProps) {
  const isHighRisk = riskScore >= 0.7;

  return (
    <div
      onClick={onSelectCandidate}
      className={`p-4 rounded-2xl bg-card border transition-all cursor-pointer space-y-3 hover:border-primary/50 ${
        isHighRisk ? 'border-rose-500/50 shadow-rose-500/5' : 'border-border'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-semibold text-xs">
            <User className="h-4 w-4" />
          </div>
          <div>
            <div className="font-bold text-xs text-foreground truncate max-w-[140px]">{candidateName}</div>
            <div className="text-[10px] text-muted-foreground font-mono">{candidateId}</div>
          </div>
        </div>

        <CameraHealthBadge status={cameraHealth} />
      </div>

      {/* Video Stream Preview Frame */}
      <div className="relative aspect-video rounded-xl bg-black overflow-hidden border border-border/50 flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-dashed border-emerald-500/50 flex items-center justify-center text-emerald-400 text-[10px] font-mono">
          AI LIVE
        </div>

        {latestEvent && (
          <div className="absolute top-2 left-2 z-10">
            <VisionEventBadge eventType={latestEvent} />
          </div>
        )}

        <div className="absolute bottom-2 right-2 text-[10px] font-mono text-emerald-400 bg-black/70 px-2 py-0.5 rounded-md border border-white/10">
          {(riskScore * 100).toFixed(0)}% Risk
        </div>
      </div>
    </div>
  );
}
