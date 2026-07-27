'use client';

import React from 'react';
import { useProctorStore } from '@/store/proctor-store';
import {
  useCandidateDetailsQuery,
  useRiskSnapshotQuery,
  useTimelineQuery,
  useEvidenceQuery
} from '@/hooks/use-proctor-monitoring-query';
import { RiskBadge } from './RiskBadge';
import { ConnectionBadge } from './ConnectionBadge';
import { ViolationTimeline } from './ViolationTimeline';
import { EvidencePanel } from './EvidencePanel';
import { ManualActionPanel } from './ManualActionPanel';
import { Button } from '@/components/ui/button';
import { User, X, Activity, FileText, ShieldAlert, Video } from 'lucide-react';

export function CandidateDrawer() {
  const selectedCandidateId = useProctorStore((s) => s.selectedCandidateId);
  const setSelectedCandidateId = useProctorStore((s) => s.setSelectedCandidateId);
  const drawerTab = useProctorStore((s) => s.drawerTab);
  const setDrawerTab = useProctorStore((s) => s.setDrawerTab);

  const { data: candidate } = useCandidateDetailsQuery(selectedCandidateId);
  const { data: riskSnapshot } = useRiskSnapshotQuery(selectedCandidateId);
  const { data: timeline = [] } = useTimelineQuery(selectedCandidateId);
  const { data: evidenceList = [] } = useEvidenceQuery(selectedCandidateId);

  if (!selectedCandidateId || !candidate) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-card border-l border-border shadow-2xl flex flex-col">
      {/* Drawer Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold">
            <User className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-base text-foreground">{candidate.candidateName}</div>
            <div className="text-xs text-muted-foreground font-mono">
              Session: {candidate.candidateSessionId} • ID: {candidate.candidateId}
            </div>
          </div>
        </div>

        <Button variant="ghost" size="sm" onClick={() => setSelectedCandidateId(null)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Overview Pill Bar */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-card text-xs">
        <RiskBadge score={candidate.currentRiskScore} level={candidate.riskLevel} />
        <ConnectionBadge status={candidate.status} />
      </div>

      {/* Live Video Preview Mesh Placeholder */}
      <div className="p-4 border-b border-border bg-slate-950">
        <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Video className="h-3.5 w-3.5 text-primary" /> Live AI Vision Stream
        </div>
        <div className="height-36 h-36 bg-slate-900 rounded-lg border border-slate-800 relative flex items-center justify-center">
          <div className="w-20 h-24 border-2 border-dashed border-emerald-500/60 rounded-full flex items-center justify-center text-[10px] text-emerald-400 font-mono">
            Face Mesh OK
          </div>
          <div className="absolute bottom-2 left-2 text-[10px] text-emerald-400 font-mono bg-black/60 px-2 py-0.5 rounded-sm">
            FPS: 30 | Gaze: CENTER
          </div>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex border-b border-border text-xs bg-muted/10">
        <button
          onClick={() => setDrawerTab('PROFILE')}
          className={`flex-1 py-2.5 font-semibold text-center border-b-2 transition-colors ${
            drawerTab === 'PROFILE' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
          }`}
        >
          Profile & Status
        </button>

        <button
          onClick={() => setDrawerTab('TIMELINE')}
          className={`flex-1 py-2.5 font-semibold text-center border-b-2 transition-colors ${
            drawerTab === 'TIMELINE' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
          }`}
        >
          Timeline ({timeline.length})
        </button>

        <button
          onClick={() => setDrawerTab('EVIDENCE')}
          className={`flex-1 py-2.5 font-semibold text-center border-b-2 transition-colors ${
            drawerTab === 'EVIDENCE' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
          }`}
        >
          Evidence ({evidenceList.length})
        </button>

        <button
          onClick={() => setDrawerTab('ACTIONS')}
          className={`flex-1 py-2.5 font-semibold text-center border-b-2 transition-colors ${
            drawerTab === 'ACTIONS' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
          }`}
        >
          Actions
        </button>
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {drawerTab === 'PROFILE' && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-lg border bg-muted/20 space-y-2">
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-muted-foreground">Exam Code:</span>
                <span className="font-bold text-foreground">{candidate.examId}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-muted-foreground">Institution ID:</span>
                <span className="font-semibold text-foreground">{candidate.institutionId}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-muted-foreground">Current Question:</span>
                <span className="font-bold text-primary">{candidate.currentQuestionId || 'Q1'}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-muted-foreground">Active Risk Score:</span>
                <span className="font-bold text-emerald-400">{(candidate.currentRiskScore * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-muted-foreground">AI Vision Health:</span>
                <span className="font-bold text-emerald-400">CONNECTED (15 FPS)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Heartbeat:</span>
                <span className="font-mono text-foreground">{new Date(candidate.lastHeartbeatAt).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        )}

        {drawerTab === 'TIMELINE' && <ViolationTimeline activities={timeline} />}
        {drawerTab === 'EVIDENCE' && <EvidencePanel evidenceList={evidenceList} />}
        {drawerTab === 'ACTIONS' && (
          <ManualActionPanel
            sessionId={candidate.candidateSessionId}
            candidateStatus={candidate.status}
            isFlagged={candidate.isFlagged}
          />
        )}
      </div>
    </div>
  );
}
