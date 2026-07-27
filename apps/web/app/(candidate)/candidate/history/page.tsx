'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowLeft, ShieldCheck, FileText, Lock, Clock } from 'lucide-react';

interface SubmissionRecord {
  id: string;
  receiptId?: string;
  examTitle: string;
  examCode?: string;
  submittedAt: string;
  durationSpentMinutes: number;
  status: string;
  proctoringStatus: string;
  answeredCount?: number;
  totalQuestions?: number;
  riskScore?: number;
}

const DEFAULT_HISTORY: SubmissionRecord[] = [
  {
    id: 'sub_101',
    receiptId: 'SENTINEL-REC-941820',
    examTitle: 'CS401: Advanced Algorithms Final Exam',
    examCode: 'CS401-2026',
    submittedAt: '2026-07-26T17:30:00Z',
    durationSpentMinutes: 84,
    status: 'SUBMITTED',
    proctoringStatus: 'CLEAR',
    answeredCount: 25,
    totalQuestions: 25,
    riskScore: 0.04
  },
  {
    id: 'sub_100',
    receiptId: 'SENTINEL-REC-819203',
    examTitle: 'CS301: Operating Systems Midterm',
    examCode: 'CS301-2026',
    submittedAt: '2026-06-15T11:00:00Z',
    durationSpentMinutes: 58,
    status: 'SUBMITTED',
    proctoringStatus: 'CLEAR',
    answeredCount: 20,
    totalQuestions: 20,
    riskScore: 0.08
  }
];

export default function CandidateHistoryPage() {
  const [records, setRecords] = useState<SubmissionRecord[]>(DEFAULT_HISTORY);
  const [selectedRecord, setSelectedRecord] = useState<SubmissionRecord | null>(null);

  useEffect(() => {
    try {
      const storedStr = localStorage.getItem('sentinel_completed_submissions');
      if (storedStr) {
        const localList: SubmissionRecord[] = JSON.parse(storedStr);
        if (Array.isArray(localList) && localList.length > 0) {
          // Combine local submissions with default mock records
          const combined = [...localList, ...DEFAULT_HISTORY];
          const uniqueMap = new Map<string, SubmissionRecord>();
          combined.forEach((item) => {
            if (!uniqueMap.has(item.id)) {
              uniqueMap.set(item.id, item);
            }
          });
          setRecords(Array.from(uniqueMap.values()));
        }
      }
    } catch {
      // Fallback
    }
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-6 w-full">
      <PageHeader
        title="Completed Examination Audit History"
        description="Historical log of completed candidate test sessions, submission timestamps, and proctoring integrity records"
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href="/candidate">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Link>
          </Button>
        }
      />

      <div className="space-y-4">
        {records.map((rec) => {
          const isFlagged = rec.proctoringStatus === 'FLAGGED';
          return (
            <Card key={rec.id} className="border shadow-xs hover:border-primary/40 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <span>{rec.examTitle}</span>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-mono text-emerald-400 border-emerald-500/30">
                    STATUS: {rec.status}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-xs font-mono ${
                      isFlagged ? 'text-amber-400 border-amber-500/30' : 'text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    PROCTORING: {rec.proctoringStatus}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-2 text-xs text-muted-foreground">
                <div className="flex flex-wrap items-center justify-between gap-4 pt-1 border-t border-border/40">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Submitted: <strong className="text-foreground">{new Date(rec.submittedAt).toLocaleString()}</strong></span>
                  </div>
                  <div>
                    Time Taken: <strong className="text-foreground">{rec.durationSpentMinutes} Mins</strong>
                  </div>
                  <div>
                    Completed: <strong className="text-foreground">{rec.answeredCount || 3} / {rec.totalQuestions || 3} Questions</strong>
                  </div>
                  {rec.receiptId && (
                    <div className="flex items-center gap-1 font-mono text-muted-foreground">
                      <Lock className="h-3 w-3 text-emerald-400" />
                      <span>Receipt: <strong className="text-foreground">{rec.receiptId}</strong></span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-primary hover:text-primary"
                    onClick={() => setSelectedRecord(rec)}
                  >
                    <FileText className="mr-1.5 h-3.5 w-3.5" /> View Cryptographic Audit Receipt
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal for Cryptographic Audit Receipt */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <ShieldCheck className="h-5 w-5" />
                <span>Cryptographic Submission Audit Receipt</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedRecord(null)}>✕</Button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-muted/30 p-3 rounded-md border space-y-1 font-mono">
                <div><span className="text-muted-foreground">Receipt ID:</span> <strong className="text-emerald-400">{selectedRecord.receiptId || selectedRecord.id}</strong></div>
                <div><span className="text-muted-foreground">Exam:</span> <strong className="text-foreground">{selectedRecord.examTitle}</strong></div>
                <div><span className="text-muted-foreground">Submitted At:</span> <strong className="text-foreground">{new Date(selectedRecord.submittedAt).toUTCString()}</strong></div>
                <div><span className="text-muted-foreground">Proctoring Verdict:</span> <strong className="text-emerald-400">{selectedRecord.proctoringStatus} (Risk: {((selectedRecord.riskScore || 0.05) * 100).toFixed(0)}%)</strong></div>
              </div>

              <p className="text-muted-foreground text-[11px]">
                This receipt certifies that all candidate responses were sealed, encrypted, and transmitted to the SentinelAI Multi-Agent Evaluation Ledger.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={() => setSelectedRecord(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
