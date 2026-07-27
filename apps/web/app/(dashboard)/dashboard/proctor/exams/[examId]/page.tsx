'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { CandidateGrid } from '@/components/proctor/CandidateGrid';
import { CandidateDrawer } from '@/components/proctor/CandidateDrawer';
import { useExamDetailsQuery, useCandidatesQuery } from '@/hooks/use-proctor-monitoring-query';
import { useProctorWS } from '@/hooks/use-proctor-ws';
import { Card, CardContent } from '@/components/ui/card';
import { RealtimeBanner } from '@/components/proctor/RealtimeBanner';

export default function SingleExamMonitoringPage() {
  const params = useParams();
  const examId = params?.examId as string;

  const { isConnected } = useProctorWS(examId);
  const { data: exam } = useExamDetailsQuery(examId);
  const { data: candidates = [], isLoading } = useCandidatesQuery(examId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title={`Exam Monitor: ${exam?.examCode || examId}`}
          description={exam?.title || 'Single exam real-time proctoring stream'}
        />

        <RealtimeBanner isConnected={isConnected} />
      </div>

      {exam && (
        <Card className="border shadow-xs bg-card">
          <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <span className="text-muted-foreground block">Exam Code:</span>
              <strong className="text-sm font-bold text-foreground">{exam.examCode}</strong>
            </div>

            <div>
              <span className="text-muted-foreground block">Active Candidates:</span>
              <strong className="text-sm font-bold text-emerald-400">{exam.totalCandidates}</strong>
            </div>

            <div>
              <span className="text-muted-foreground block">Suspicious Flagged:</span>
              <strong className="text-sm font-bold text-amber-400">{exam.suspiciousCandidates}</strong>
            </div>

            <div>
              <span className="text-muted-foreground block">Average Risk:</span>
              <strong className="text-sm font-bold text-primary">{(exam.averageRiskScore * 100).toFixed(0)}%</strong>
            </div>
          </CardContent>
        </Card>
      )}

      <CandidateGrid candidates={candidates} isLoading={isLoading} />
      <CandidateDrawer />
    </div>
  );
}
