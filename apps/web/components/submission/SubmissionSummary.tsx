import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Clock, FileCheck, Bookmark } from 'lucide-react';

interface SubmissionSummaryProps {
  examTitle: string;
  totalQuestions: number;
  answeredCount: number;
  unansweredCount: number;
  reviewCount: number;
  durationMinutes?: number;
}

export function SubmissionSummary({
  examTitle,
  totalQuestions,
  answeredCount,
  unansweredCount,
  reviewCount,
  durationMinutes = 90
}: SubmissionSummaryProps) {
  return (
    <Card className="border shadow-xs bg-card">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" /> Submission Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-muted/30 border space-y-1">
          <div className="text-muted-foreground flex items-center gap-1">
            <FileCheck className="h-3.5 w-3.5 text-primary" /> Total Questions
          </div>
          <div className="text-base font-extrabold text-foreground">{totalQuestions}</div>
        </div>

        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-1">
          <div className="text-emerald-400 font-semibold">Answered</div>
          <div className="text-base font-extrabold text-emerald-400">{answeredCount}</div>
        </div>

        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 space-y-1">
          <div className="text-rose-400 font-semibold">Unanswered</div>
          <div className="text-base font-extrabold text-rose-400">{unansweredCount}</div>
        </div>

        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-1">
          <div className="text-amber-400 font-semibold flex items-center gap-1">
            <Bookmark className="h-3.5 w-3.5" /> Marked Review
          </div>
          <div className="text-base font-extrabold text-amber-400">{reviewCount}</div>
        </div>
      </CardContent>
    </Card>
  );
}
