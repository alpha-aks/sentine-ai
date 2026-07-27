'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

interface ReviewPanelProps {
  totalQuestions: number;
  answeredCount: number;
  markedCount: number;
}

export function ReviewPanel({ totalQuestions, answeredCount, markedCount }: ReviewPanelProps) {
  const unansweredCount = Math.max(0, totalQuestions - answeredCount);

  return (
    <Card className="bg-card border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-primary" /> Response Progress Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-3 text-center text-xs">
        <div className="p-2 rounded-md bg-emerald-500/10 border border-emerald-500/20">
          <div className="font-mono font-bold text-lg text-emerald-400">{answeredCount}</div>
          <div className="text-[10px] text-muted-foreground">Answered</div>
        </div>
        <div className="p-2 rounded-md bg-amber-500/10 border border-amber-500/20">
          <div className="font-mono font-bold text-lg text-amber-400">{markedCount}</div>
          <div className="text-[10px] text-muted-foreground">Marked</div>
        </div>
        <div className="p-2 rounded-md bg-destructive/10 border border-destructive/20">
          <div className="font-mono font-bold text-lg text-destructive">{unansweredCount}</div>
          <div className="text-[10px] text-muted-foreground">Unanswered</div>
        </div>
      </CardContent>
    </Card>
  );
}
