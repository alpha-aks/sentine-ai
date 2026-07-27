import React from 'react';
import { VisionEventRecord } from '@/types/vision-frontend.types';
import { VisionEventBadge } from './VisionEventBadge';
import { Clock } from 'lucide-react';

interface VisionEventTimelineProps {
  events: VisionEventRecord[];
  maxItems?: number;
}

export function VisionEventTimeline({ events, maxItems = 15 }: VisionEventTimelineProps) {
  const displayEvents = events.slice(0, maxItems);

  if (displayEvents.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-xl bg-card">
        No vision detection events recorded in current monitoring window.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayEvents.map((ev) => (
        <div
          key={ev.eventId}
          className="p-3 rounded-xl border border-border bg-card hover:bg-accent/40 transition-all flex items-center justify-between text-xs gap-3"
        >
          <div className="flex items-center gap-3">
            <VisionEventBadge eventType={ev.eventType} />
            <span className="text-muted-foreground text-[11px]">
              Confidence: <strong className="text-foreground font-mono">{(ev.confidence * 100).toFixed(0)}%</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground font-mono text-[11px]">
            <Clock className="h-3 w-3" />
            <span>{new Date(ev.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
