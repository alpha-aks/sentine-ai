'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { RiskBadge } from '@/components/proctor/RiskBadge';
import { ConnectionBadge } from '@/components/proctor/ConnectionBadge';
import { ViolationTimeline } from '@/components/proctor/ViolationTimeline';
import { EvidencePanel } from '@/components/proctor/EvidencePanel';
import { ManualActionPanel } from '@/components/proctor/ManualActionPanel';
import {
  useCandidateDetailsQuery,
  useTimelineQuery,
  useEvidenceQuery
} from '@/hooks/use-proctor-monitoring-query';
import { useProctorWS } from '@/hooks/use-proctor-ws';
import { User, Video } from 'lucide-react';

export default function CandidateDedicatedWorkspacePage() {
  const params = useParams();
  const candidateId = params?.candidateId as string;

  const { data: candidate } = useCandidateDetailsQuery(candidateId);
  const { data: timeline = [] } = useTimelineQuery(candidateId);
  const { data: evidenceList = [] } = useEvidenceQuery(candidateId);
  const { isConnected } = useProctorWS(undefined, candidateId);

  if (!candidate) {
    return (
      <div className="p-12 text-center border border-dashed rounded-xl m-6 text-muted-foreground">
        Loading Candidate Monitoring Workspace...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 w-full">
      <PageHeader
        title={`Candidate Stream: ${candidate.candidateName}`}
        description={`Dedicated real-time telemetry stream for session ID ${candidate.candidateSessionId}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile & Live Stream */}
        <div className="space-y-6">
          <Card className="border shadow-xs bg-card">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-foreground">{candidate.candidateName}</h2>
                  <div className="text-xs text-muted-foreground font-mono">{candidate.candidateId}</div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t pt-3">
                <RiskBadge score={candidate.currentRiskScore} level={candidate.riskLevel} />
                <ConnectionBadge status={candidate.status} />
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-xs bg-slate-950">
            <CardContent className="p-4 space-y-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                <Video className="h-4 w-4 text-primary" /> Live AI Web-Cam View
              </div>

              <div className="h-48 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-center relative">
                <div className="w-24 h-28 border-2 border-dashed border-emerald-500/60 rounded-full flex items-center justify-center text-xs text-emerald-400 font-mono">
                  Gaze Mesh OK
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-xs bg-card">
            <CardContent className="p-4">
              <h3 className="font-bold text-sm text-foreground mb-3">Manual Proctor Actions</h3>
              <ManualActionPanel
                sessionId={candidate.candidateSessionId}
                candidateStatus={candidate.status}
                isFlagged={candidate.isFlagged}
              />
            </CardContent>
          </Card>
        </div>

        {/* Middle & Right Column: Timeline & Evidence */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border shadow-xs bg-card">
            <CardContent className="p-4 space-y-3">
              <h3 className="font-bold text-sm text-foreground">Session Activity Timeline ({timeline.length})</h3>
              <ViolationTimeline activities={timeline} />
            </CardContent>
          </Card>

          <Card className="border shadow-xs bg-card">
            <CardContent className="p-4 space-y-3">
              <h3 className="font-bold text-sm text-foreground">Evidence Metadata ({evidenceList.length})</h3>
              <EvidencePanel evidenceList={evidenceList} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
