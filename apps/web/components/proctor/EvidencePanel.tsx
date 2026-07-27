'use client';

import React from 'react';
import { EvidenceMetadataEntity } from '@/services/proctor-monitoring.service';
import { Camera, Volume2, Video, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EvidencePanelProps {
  evidenceList?: EvidenceMetadataEntity[];
}

export function EvidencePanel({ evidenceList = [] }: EvidencePanelProps) {
  const list = Array.isArray(evidenceList) ? evidenceList : (evidenceList as any)?.items || [];

  if (list.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-lg bg-muted/20">
        No evidence artifacts registered for this session.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {list.map((ev: EvidenceMetadataEntity) => {
        const isImage = ev.type === 'SCREENSHOT';
        const isAudio = ev.type === 'AUDIO_RECORDING';

        return (
          <div key={ev.evidenceId} className="p-3.5 rounded-lg border border-border bg-card text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                {isImage ? <Camera className="h-4 w-4" /> : isAudio ? <Volume2 className="h-4 w-4" /> : <Video className="h-4 w-4" />}
              </div>

              <div>
                <div className="font-bold text-foreground">{ev.title}</div>
                <div className="text-[11px] text-muted-foreground font-mono">
                  {ev.type} • {((ev.sizeBytes || 0) / 1024).toFixed(1)} KB • {ev.recordedAt ? new Date(ev.recordedAt).toLocaleTimeString() : 'Just now'}
                </div>
              </div>
            </div>

            <Button variant="outline" size="sm" asChild className="h-8 text-xs">
              <a href={ev.storageUri || '#'} target="_blank" rel="noreferrer">
                <Download className="mr-1 h-3.5 w-3.5" /> Download
              </a>
            </Button>
          </div>
        );
      })}
    </div>
  );
}
