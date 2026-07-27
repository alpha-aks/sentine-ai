'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { StatisticsCards } from '@/components/proctor/StatisticsCards';
import { ExamSelector } from '@/components/proctor/ExamSelector';
import { CandidateGrid } from '@/components/proctor/CandidateGrid';
import { CandidateDrawer } from '@/components/proctor/CandidateDrawer';
import { RealtimeBanner } from '@/components/proctor/RealtimeBanner';
import { useProctorStore } from '@/store/proctor-store';
import {
  useActiveExamsQuery,
  useCandidatesQuery,
  useProctorStatsQuery
} from '@/hooks/use-proctor-monitoring-query';
import { useProctorWS } from '@/hooks/use-proctor-ws';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import { CandidateStatusFilter } from '@/store/proctor-store';

import { VisionHealthPanel } from '@/components/vision/VisionHealthPanel';

export default function ProctorDashboardPage() {
  const selectedExamId = useProctorStore((s) => s.selectedExamId);
  const setSelectedExamId = useProctorStore((s) => s.setSelectedExamId);
  const searchQuery = useProctorStore((s) => s.searchQuery);
  const setSearchQuery = useProctorStore((s) => s.setSearchQuery);
  const statusFilter = useProctorStore((s) => s.statusFilter);
  const setStatusFilter = useProctorStore((s) => s.setStatusFilter);

  const { isConnected } = useProctorWS(selectedExamId || undefined);
  const { data: exams = [] } = useActiveExamsQuery();
  const { data: candidates = [], isLoading } = useCandidatesQuery(selectedExamId || undefined);
  const { data: stats } = useProctorStatsQuery();

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 w-full relative">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title="Live Proctor Command Center"
          description="Real-time multi-tenant candidate session monitoring, evidence stream aggregation, and proctoring interventions"
        />

        <RealtimeBanner isConnected={isConnected} />
      </div>

      {/* Vision Guard AI Health & Engine Telemetry Panel */}
      <VisionHealthPanel />

      <StatisticsCards
        activeExamsCount={stats?.activeExamsCount || exams.length}
        totalMonitoredCandidates={stats?.totalMonitoredCandidates || candidates.length}
        suspiciousCandidatesCount={stats?.suspiciousCandidatesCount}
        openAlertsCount={stats?.openAlertsCount}
      />

      {/* Active Exam Tab Selector */}
      <ExamSelector
        exams={exams}
        selectedExamId={selectedExamId}
        onSelectExam={setSelectedExamId}
      />

      {/* Search & Filter Header Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search candidate name, ID, or session..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex bg-muted/30 p-1 rounded-lg border text-xs">
            {(['ALL', 'IN_PROGRESS', 'SUSPICIOUS', 'PAUSED', 'DISCONNECTED', 'SUBMITTED'] as CandidateStatusFilter[]).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                  statusFilter === st ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Candidate Grid */}
      <CandidateGrid candidates={candidates} isLoading={isLoading} />

      {/* Side Drawer */}
      <CandidateDrawer />
    </div>
  );
}
