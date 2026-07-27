'use client';

import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RiskBadge } from './RiskBadge';
import { ConnectionBadge } from './ConnectionBadge';
import { CandidateMonitorEntity } from '@/services/proctor-monitoring.service';
import { User, AlertTriangle, Flag, Clock } from 'lucide-react';

interface CandidateCardProps {
  candidate: CandidateMonitorEntity;
  onClick: () => void;
  isSelected?: boolean;
}

export const CandidateCard = memo(function CandidateCard({ candidate, onClick, isSelected }: CandidateCardProps) {
  const isSuspicious = candidate.status === 'SUSPICIOUS' || candidate.currentRiskScore >= 0.7;
  const isDisconnected = candidate.status === 'DISCONNECTED';
  const isPaused = candidate.status === 'PAUSED';

  return (
    <Card
      onClick={onClick}
      className={`border shadow-xs bg-card cursor-pointer transition-all hover:border-primary ${
        isSelected ? 'ring-2 ring-primary border-primary' : ''
      } ${isSuspicious ? 'border-rose-500/50 bg-rose-500/5' : ''}`}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground font-bold text-sm shrink-0">
              <User className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <span>{candidate.candidateName}</span>
                {candidate.isFlagged && <Flag className="h-3.5 w-3.5 text-rose-400 fill-rose-400" />}
              </div>
              <div className="text-[11px] text-muted-foreground font-mono">
                {candidate.candidateId} • Question: {candidate.currentQuestionId || 'Q1'}
              </div>
            </div>
          </div>

          <RiskBadge score={candidate.currentRiskScore} level={candidate.riskLevel} />
        </div>

        {/* Status Badges & Hardware Indicators */}
        <div className="flex items-center justify-between border-t border-b border-border/40 py-2 text-xs">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`text-[10px] font-mono ${
                isSuspicious
                  ? 'text-rose-400 border-rose-500/30 bg-rose-500/10'
                  : isPaused
                  ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                  : isDisconnected
                  ? 'text-muted-foreground border-border'
                  : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
              }`}
            >
              {candidate.status}
            </Badge>

            {candidate.activeAlertCount > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-sm border border-rose-500/20">
                <AlertTriangle className="h-3 w-3" /> {candidate.activeAlertCount}
              </span>
            )}
          </div>

          <ConnectionBadge status={candidate.status} />
        </div>

        {/* Bottom Metadata */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5 font-mono">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Heartbeat: {new Date(candidate.lastHeartbeatAt).toLocaleTimeString()}</span>
          </div>

          <div>
            Actions: <strong className="text-foreground">{candidate.manualActionCount}</strong>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
