'use client';

import React, { useEffect } from 'react';
import { useCandidateStore } from '@/store/candidate-store';
import { Clock, AlertTriangle } from 'lucide-react';

interface CandidateTimerProps {
  onTimeExpired?: () => void;
  className?: string;
}

export function CandidateTimer({ onTimeExpired, className }: CandidateTimerProps) {
  const { remainingSeconds, setRemainingSeconds, sessionState } = useCandidateStore();

  useEffect(() => {
    if (sessionState !== 'ACTIVE') return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onTimeExpired) onTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionState, onTimeExpired, setRemainingSeconds]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isUrgent = remainingSeconds > 0 && remainingSeconds <= 300; // <= 5 mins

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm font-mono font-semibold transition-colors ${
        isUrgent
          ? 'bg-destructive/10 border-destructive/30 text-destructive animate-pulse'
          : 'bg-card text-foreground border-border'
      } ${className || ''}`}
    >
      {isUrgent ? <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" /> : <Clock className="h-4 w-4 shrink-0 text-primary" />}
      <span>{formattedTime}</span>
    </div>
  );
}
