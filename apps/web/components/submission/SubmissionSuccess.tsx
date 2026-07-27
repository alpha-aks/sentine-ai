import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ShieldCheck, FileText, Home, Lock } from 'lucide-react';
import Link from 'next/link';

interface SubmissionSuccessProps {
  receiptId: string;
  examTitle: string;
  submittedAt: string;
  answeredCount: number;
  totalQuestions: number;
}

export function SubmissionSuccess({
  receiptId,
  examTitle,
  submittedAt,
  answeredCount,
  totalQuestions
}: SubmissionSuccessProps) {
  return (
    <div className="space-y-6 max-w-2xl mx-auto p-6 text-center w-full">
      <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 w-16 h-16 mx-auto flex items-center justify-center">
        <CheckCircle2 className="h-8 w-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-black text-foreground">Examination Finalized & Submitted</h1>
        <p className="text-xs text-muted-foreground max-w-lg mx-auto">
          Your examination responses have been cryptographically sealed and submitted to the evaluation queue.
        </p>
      </div>

      <Card className="border shadow-xs text-left">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" /> Cryptographic Submission Receipt
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-3 text-xs">
          <div className="flex justify-between p-2.5 rounded-md bg-muted/30 border">
            <span className="text-muted-foreground">Digital Receipt ID:</span>
            <span className="font-mono font-bold text-emerald-400">{receiptId}</span>
          </div>

          <div className="flex justify-between p-2.5 rounded-md bg-muted/30 border">
            <span className="text-muted-foreground">Examination Title:</span>
            <span className="font-semibold text-foreground">{examTitle}</span>
          </div>

          <div className="flex justify-between p-2.5 rounded-md bg-muted/30 border">
            <span className="text-muted-foreground">Questions Completed:</span>
            <span className="font-bold text-emerald-400">{answeredCount} of {totalQuestions}</span>
          </div>

          <div className="flex justify-between p-2.5 rounded-md bg-muted/30 border">
            <span className="text-muted-foreground">Submitted At:</span>
            <span className="font-mono text-foreground">{new Date(submittedAt).toLocaleString()}</span>
          </div>

          <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] flex items-center gap-2 font-mono">
            <Lock className="h-4 w-4 shrink-0" />
            <span>SESSION LOCKED — Responses are sealed against further edit.</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-3 pt-2">
        <Button variant="outline" asChild>
          <Link href="/candidate/history">
            <FileText className="mr-2 h-4 w-4" /> View Exam History
          </Link>
        </Button>

        <Button asChild>
          <Link href="/candidate">
            <Home className="mr-2 h-4 w-4" /> Return to Candidate Portal
          </Link>
        </Button>
      </div>
    </div>
  );
}
