'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Bookmark, RotateCcw } from 'lucide-react';

interface ExamFooterProps {
  currentIndex: number;
  totalQuestions: number;
  isMarked: boolean;
  onPrev: () => void;
  onNext: () => void;
  onMarkToggle: () => void;
  onClearAnswer: () => void;
}

export function ExamFooter({
  currentIndex,
  totalQuestions,
  isMarked,
  onPrev,
  onNext,
  onMarkToggle,
  onClearAnswer
}: ExamFooterProps) {
  return (
    <footer className="h-14 border-t bg-card px-4 flex items-center justify-between gap-4 fixed bottom-0 left-0 right-0 z-30 shadow-xs">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onPrev} disabled={currentIndex === 0}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Previous
        </Button>
        <Button
          variant={isMarked ? 'secondary' : 'outline'}
          size="sm"
          onClick={onMarkToggle}
          className={isMarked ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : ''}
        >
          <Bookmark className="mr-1 h-4 w-4" /> {isMarked ? 'Marked for Review' : 'Mark for Review'}
        </Button>
        <Button variant="ghost" size="sm" onClick={onClearAnswer} className="text-muted-foreground hover:text-foreground">
          <RotateCcw className="mr-1 h-3.5 w-3.5" /> Clear Answer
        </Button>
      </div>

      <div className="text-xs text-muted-foreground font-mono">
        Question <strong className="text-foreground">{currentIndex + 1}</strong> of <strong className="text-foreground">{totalQuestions}</strong>
      </div>

      <Button size="sm" onClick={onNext} disabled={currentIndex === totalQuestions - 1}>
        Next Question <ArrowRight className="ml-1 h-4 w-4" />
      </Button>
    </footer>
  );
}
