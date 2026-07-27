import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, CheckCircle2, Home, FileText } from 'lucide-react';
import Link from 'next/link';

interface SubmissionLockScreenProps {
  receiptId?: string;
  submittedAt?: string;
  status?: string;
}

export function SubmissionLockScreen({ receiptId, submittedAt, status = 'SUBMITTED' }: SubmissionLockScreenProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 w-full">
      <Card className="max-w-xl w-full border border-emerald-500/30 shadow-2xl bg-card text-center p-6 space-y-6">
        <div className="h-16 w-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
          <Lock className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-extrabold text-foreground">Examination Workspace Sealed & Locked</h1>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            This candidate examination session status is <strong className="text-emerald-400">{status}</strong>. Answers are read-only and sealed against modification.
          </p>
        </div>

        <CardContent className="bg-muted/30 p-4 rounded-xl border space-y-2.5 text-xs text-left font-mono">
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Status:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> {status}
            </span>
          </div>

          {receiptId && (
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Digital Receipt ID:</span>
              <span className="text-foreground font-bold">{receiptId}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-muted-foreground">Locked Timestamp:</span>
            <span className="text-foreground">
              {submittedAt ? new Date(submittedAt).toLocaleString() : new Date().toLocaleString()}
            </span>
          </div>
        </CardContent>

        <div className="flex justify-center gap-3 pt-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/candidate/history">
              <FileText className="mr-2 h-4 w-4" /> View History
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/candidate">
              <Home className="mr-2 h-4 w-4" /> Return to Candidate Portal
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
