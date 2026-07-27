'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Volume2, Video, Download } from 'lucide-react';

export default function EvidenceVaultPage() {
  const defaultEvidence = [
    {
      evidenceId: 'ev_101',
      candidateSessionId: 'sess_101',
      candidateName: 'Sarah Jenkins',
      type: 'SCREENSHOT',
      title: 'Secondary Smartphone Device in Frame',
      storageUri: '#',
      mimeType: 'image/png',
      sizeBytes: 245000,
      recordedAt: new Date().toISOString()
    },
    {
      evidenceId: 'ev_102',
      candidateSessionId: 'sess_101',
      candidateName: 'Sarah Jenkins',
      type: 'AUDIO_RECORDING',
      title: 'Secondary Whisper Audio Clip',
      storageUri: '#',
      mimeType: 'audio/mp3',
      sizeBytes: 1040000,
      recordedAt: new Date().toISOString()
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 w-full">
      <PageHeader
        title="Evidence Metadata Vault"
        description="Audit ledger of registered screenshot clips, audio samples, screen recordings, and manual proctor evidence artifacts"
      />

      <div className="space-y-3">
        {defaultEvidence.map((ev) => {
          const isImage = ev.type === 'SCREENSHOT';
          const isAudio = ev.type === 'AUDIO_RECORDING';

          return (
            <Card key={ev.evidenceId} className="border shadow-xs bg-card">
              <CardContent className="p-4 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                    {isImage ? <Camera className="h-5 w-5" /> : isAudio ? <Volume2 className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-foreground">{ev.title}</h3>
                    <div className="text-muted-foreground font-mono">
                      Candidate: <strong>{ev.candidateName}</strong> ({ev.candidateSessionId}) • {ev.type} • {((ev.sizeBytes || 0) / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </div>

                <Button variant="outline" size="sm" asChild>
                  <a href={ev.storageUri} target="_blank" rel="noreferrer">
                    <Download className="mr-1.5 h-4 w-4" /> Download Evidence
                  </a>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
