'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ShieldCheck, Home, FileText } from 'lucide-react';

export default function CandidateSubmissionPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto p-6 text-center w-full">
      <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 w-16 h-16 mx-auto flex items-center justify-center">
        <CheckCircle2 className="h-8 w-8" />
      </div>

      <PageHeader
        title="Examination Successfully Submitted"
        description="Your responses have been recorded and cryptographically timestamped in the SentinelAI database"
      />

      <Card className="border shadow-xs text-left">
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" /> Submission Receipt Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <div className="flex justify-between p-2 rounded-md bg-muted/30 border">
            <span className="text-muted-foreground">Exam Name:</span>
            <span className="font-bold text-foreground">CS401: Advanced Algorithms Final</span>
          </div>
          <div className="flex justify-between p-2 rounded-md bg-muted/30 border">
            <span className="text-muted-foreground">Submission Timestamp:</span>
            <span className="font-mono font-semibold">{new Date().toLocaleString()}</span>
          </div>
          <div className="flex justify-between p-2 rounded-md bg-muted/30 border">
            <span className="text-muted-foreground">Proctoring Verification Status:</span>
            <span className="text-emerald-400 font-semibold">PASS — 0 Critical Violations</span>
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
            <Home className="mr-2 h-4 w-4" /> Return to Portal Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
