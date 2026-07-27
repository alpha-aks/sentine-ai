'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Clock, CheckCircle2, ArrowRight, Play, FileText } from 'lucide-react';

export default function CandidateDashboardPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6 w-full">
      <PageHeader
        title="Candidate Examination Portal"
        description="Access scheduled examinations, complete system compatibility checks, and view certified test results"
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" /> Upcoming Scheduled Examination
            </CardTitle>
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              LIVE READY
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div>
              <h3 className="text-lg font-bold">CS401: Advanced Algorithms & Data Structures Final Exam</h3>
              <p className="text-xs text-muted-foreground mt-1">Department of Computer Science & Engineering • Sentinel University</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 text-xs bg-muted/30 p-3 rounded-md border">
              <div>
                <span className="text-muted-foreground block">Duration:</span>
                <strong className="text-foreground">90 Minutes</strong>
              </div>
              <div>
                <span className="text-muted-foreground block">Questions:</span>
                <strong className="text-foreground">25 Questions</strong>
              </div>
              <div>
                <span className="text-muted-foreground block">Proctoring Policy:</span>
                <strong className="text-foreground">Strict AI + WebRTC</strong>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button asChild className="px-6 font-semibold">
                <Link href="/candidate/waiting-room/session_demo_101">
                  <Play className="mr-2 h-4 w-4" /> Join Waiting Room & Check System
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-xs flex flex-col justify-between">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" /> Candidate Security Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-3 text-xs">
            <div className="flex items-center justify-between p-2 rounded-md border bg-muted/20">
              <span>Webcam Diagnostics</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Ready
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-md border bg-muted/20">
              <span>Microphone Diagnostics</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Ready
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-md border bg-muted/20">
              <span>Identity Verification</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Verified
              </span>
            </div>
          </CardContent>
          <div className="p-4 border-t">
            <Button variant="outline" size="sm" asChild className="w-full text-xs">
              <Link href="/candidate/history">
                <FileText className="mr-1.5 h-3.5 w-3.5" /> View Past Exam Records
              </Link>
            </Button>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Quick Navigation Shortcuts</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link href="/candidate/exams" className="p-4 rounded-md border bg-card hover:border-primary/50 transition-colors flex items-center justify-between shadow-xs">
            <div>
              <div className="font-semibold text-sm">Registered Exams</div>
              <div className="text-xs text-muted-foreground">Browse all upcoming schedules</div>
            </div>
            <ArrowRight className="h-4 w-4 text-primary" />
          </Link>
          <Link href="/candidate/history" className="p-4 rounded-md border bg-card hover:border-primary/50 transition-colors flex items-center justify-between shadow-xs">
            <div>
              <div className="font-semibold text-sm">Completed History</div>
              <div className="text-xs text-muted-foreground">View submission receipts</div>
            </div>
            <ArrowRight className="h-4 w-4 text-primary" />
          </Link>
          <Link href="/candidate/waiting-room/session_demo_101" className="p-4 rounded-md border bg-card hover:border-primary/50 transition-colors flex items-center justify-between shadow-xs">
            <div>
              <div className="font-semibold text-sm">Quick Join Portal</div>
              <div className="text-xs text-muted-foreground">Enter live waiting room</div>
            </div>
            <ArrowRight className="h-4 w-4 text-primary" />
          </Link>
        </div>
      </div>
    </div>
  );
}
