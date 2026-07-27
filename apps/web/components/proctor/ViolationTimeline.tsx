'use client';

import React from 'react';
import { SessionActivityEntity } from '@/services/proctor-monitoring.service';
import { Activity, Clock, ShieldAlert } from 'lucide-react';

interface ViolationTimelineProps {
  activities?: SessionActivityEntity[];
}

export function ViolationTimeline({ activities = [] }: ViolationTimelineProps) {
  const list = Array.isArray(activities) ? activities : (activities as any)?.items || [];

  if (list.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-lg bg-muted/20">
        No session timeline events logged yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {list.map((act: SessionActivityEntity) => {
        const typeStr = act.eventType || (act as any).type || 'EVENT';
        const isWarning =
          typeStr.includes('WARN') ||
          typeStr.includes('FLAG') ||
          typeStr.includes('GAZE') ||
          typeStr.includes('VIOLATION');

        return (
          <div key={act.activityId || Math.random().toString()} className="p-3 rounded-lg border border-border bg-card text-xs space-y-1">
            <div className="flex items-center justify-between">
              <div className="font-bold text-foreground flex items-center gap-1.5">
                {isWarning ? <ShieldAlert className="h-3.5 w-3.5 text-amber-400" /> : <Activity className="h-3.5 w-3.5 text-primary" />}
                <span>{typeStr}</span>
              </div>
              <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{act.timestamp ? new Date(act.timestamp).toLocaleTimeString() : 'Just now'}</span>
              </div>
            </div>

            <div className="text-muted-foreground leading-relaxed">{act.description}</div>
          </div>
        );
      })}
    </div>
  );
}
