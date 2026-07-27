'use client';

import React from 'react';
import { useCandidateStore } from '@/store/candidate-store';
import { AlertTriangle } from 'lucide-react';

export function ViolationBanner() {
  const { violations } = useCandidateStore();
  const latestViolation = violations[violations.length - 1];

  if (!latestViolation) return null;

  return (
    <div className="bg-destructive text-destructive-foreground px-4 py-2.5 shadow-md flex items-center justify-between text-xs font-semibold animate-bounce">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span>PROCTORING WARNING: {latestViolation.message} ({violations.length} Warning Records)</span>
      </div>
      <div className="font-mono text-[10px] opacity-80">
        {new Date(latestViolation.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}
