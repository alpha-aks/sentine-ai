'use client';

import React from 'react';
import { useCandidateStore } from '@/store/candidate-store';
import { CandidateTimer } from './timer';
import { ConnectionStatus } from './connection-status';
import { ShieldCheck, PanelLeftClose, PanelLeftOpen, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExamHeaderProps {
  examTitle: string;
  candidateName: string;
  onSubmitClick: () => void;
}

export function ExamHeader({ examTitle, candidateName, onSubmitClick }: ExamHeaderProps) {
  const { sidebarOpen, toggleSidebar } = useCandidateStore();

  return (
    <header className="h-14 border-b bg-card px-4 flex items-center justify-between gap-4 sticky top-0 z-40 shadow-xs">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} title="Toggle Question Navigator Sidebar">
          {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
        </Button>

        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
          <div>
            <h1 className="text-sm font-bold leading-none line-clamp-1">{examTitle}</h1>
            <span className="text-xs text-muted-foreground">Candidate: {candidateName}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ConnectionStatus />
        <CandidateTimer />
        <Button size="sm" variant="destructive" onClick={onSubmitClick} className="font-semibold">
          <LogOut className="mr-1.5 h-4 w-4" /> Submit Exam
        </Button>
      </div>
    </header>
  );
}
