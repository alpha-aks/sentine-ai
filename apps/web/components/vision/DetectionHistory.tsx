import React from 'react';
import { VisionEventRecord } from '@/types/vision-frontend.types';
import { Eye, ShieldAlert } from 'lucide-react';

interface DetectionHistoryProps {
  events: VisionEventRecord[];
}

export function DetectionHistory({ events }: DetectionHistoryProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold text-foreground">
        <span className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-primary" />
          <span>Object & Pose Detection History</span>
        </span>
        <span className="text-muted-foreground font-mono text-[11px]">{events.length} total events</span>
      </div>

      <div className="border border-border rounded-xl overflow-hidden bg-card text-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/40 text-muted-foreground border-b border-border text-[11px]">
              <th className="p-3 font-semibold">Event Type</th>
              <th className="p-3 font-semibold">Confidence</th>
              <th className="p-3 font-semibold">Timestamp</th>
              <th className="p-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {events.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-muted-foreground text-xs">
                  Clean stream — zero unauthorized object flags.
                </td>
              </tr>
            ) : (
              events.map((ev) => (
                <tr key={ev.eventId} className="hover:bg-accent/30 transition-all">
                  <td className="p-3 font-medium text-foreground">{ev.eventType.replace('_', ' ')}</td>
                  <td className="p-3 font-mono text-emerald-400">{(ev.confidence * 100).toFixed(0)}%</td>
                  <td className="p-3 font-mono text-muted-foreground">{new Date(ev.timestamp).toLocaleTimeString()}</td>
                  <td className="p-3">
                    <button className="p-1 rounded-md bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground">
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
