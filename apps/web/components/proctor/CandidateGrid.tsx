'use client';

import React from 'react';
import { CandidateCard } from './CandidateCard';
import { CandidateMonitorEntity } from '@/services/proctor-monitoring.service';
import { useProctorStore } from '@/store/proctor-store';

interface CandidateGridProps {
  candidates: CandidateMonitorEntity[];
  isLoading?: boolean;
}

export function CandidateGrid({ candidates, isLoading }: CandidateGridProps) {
  const selectedCandidateId = useProctorStore((s) => s.selectedCandidateId);
  const setSelectedCandidateId = useProctorStore((s) => s.setSelectedCandidateId);
  const searchQuery = useProctorStore((s) => s.searchQuery);
  const statusFilter = useProctorStore((s) => s.statusFilter);
  const riskFilter = useProctorStore((s) => s.riskFilter);

  const candidateList = Array.isArray(candidates) ? candidates : (candidates as any)?.items || [];

  const filteredCandidates = candidateList.filter((c: CandidateMonitorEntity) => {
    const matchesSearch =
      c.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.candidateId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.candidateSessionId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesRisk = riskFilter === 'ALL' || c.riskLevel === riskFilter;

    return matchesSearch && matchesStatus && matchesRisk;
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-44 rounded-xl bg-card border border-border animate-pulse p-4 space-y-3">
            <div className="h-10 bg-muted rounded-md w-3/4" />
            <div className="h-6 bg-muted rounded-md w-full" />
            <div className="h-6 bg-muted rounded-md w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (filteredCandidates.length === 0) {
    return (
      <div className="p-12 text-center border border-dashed border-border rounded-xl bg-card text-muted-foreground space-y-2">
        <div className="text-base font-bold text-foreground">No Monitored Candidates Found</div>
        <div className="text-xs">Adjust your search query or filter selection to view candidate streams.</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredCandidates.map((c: CandidateMonitorEntity) => (
        <CandidateCard
          key={c.candidateSessionId}
          candidate={c}
          isSelected={selectedCandidateId === c.candidateSessionId}
          onClick={() => setSelectedCandidateId(c.candidateSessionId)}
        />
      ))}
    </div>
  );
}
