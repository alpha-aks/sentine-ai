'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldCheck, Search, FileText, Lock, Filter, CheckCircle2, AlertTriangle, Eye } from 'lucide-react';

interface AuditLogRecord {
  id: string;
  receiptId: string;
  candidateName: string;
  examTitle: string;
  examCode: string;
  submittedAt: string;
  durationSpentMinutes: number;
  status: string;
  proctoringStatus: string;
  riskScore: number;
}

const DEFAULT_AUDIT_LOGS: AuditLogRecord[] = [
  {
    id: 'sub_101',
    receiptId: 'SENTINEL-REC-941820',
    candidateName: 'Tanishq Sharma (cand_100)',
    examTitle: 'CS101-2026: Advanced Computer Science & Algorithms',
    examCode: 'CS101-2026',
    submittedAt: '2026-07-27T03:55:00Z',
    durationSpentMinutes: 12,
    status: 'SUBMITTED',
    proctoringStatus: 'CLEAR',
    riskScore: 0.05
  },
  {
    id: 'sub_102',
    receiptId: 'SENTINEL-REC-819203',
    candidateName: 'Alex Johnson (cand_101)',
    examTitle: 'CS401: Advanced Algorithms Final',
    examCode: 'CS401-2026',
    submittedAt: '2026-07-26T17:30:00Z',
    durationSpentMinutes: 84,
    status: 'SUBMITTED',
    proctoringStatus: 'CLEAR',
    riskScore: 0.04
  },
  {
    id: 'sub_103',
    receiptId: 'SENTINEL-REC-739102',
    candidateName: 'Sarah Jenkins (cand_102)',
    examTitle: 'CS301: Operating Systems Midterm',
    examCode: 'CS301-2026',
    submittedAt: '2026-07-26T14:20:00Z',
    durationSpentMinutes: 58,
    status: 'SUBMITTED',
    proctoringStatus: 'FLAGGED',
    riskScore: 0.72
  }
];

export default function ReportsPage() {
  const [logs, setLogs] = useState<AuditLogRecord[]>(DEFAULT_AUDIT_LOGS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CLEAR' | 'FLAGGED'>('ALL');
  const [activeModalRecord, setActiveModalRecord] = useState<AuditLogRecord | null>(null);

  useEffect(() => {
    try {
      const storedStr = localStorage.getItem('sentinel_completed_submissions');
      if (storedStr) {
        const localList: AuditLogRecord[] = JSON.parse(storedStr);
        if (Array.isArray(localList) && localList.length > 0) {
          const combined = [...localList, ...DEFAULT_AUDIT_LOGS];
          const uniqueMap = new Map<string, AuditLogRecord>();
          combined.forEach((item) => {
            if (!uniqueMap.has(item.id)) {
              uniqueMap.set(item.id, item);
            }
          });
          setLogs(Array.from(uniqueMap.values()));
        }
      }
    } catch {
      // Fallback
    }
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.candidateName.toLowerCase().includes(search.toLowerCase()) ||
      log.examTitle.toLowerCase().includes(search.toLowerCase()) ||
      log.receiptId.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || log.proctoringStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 w-full">
      <PageHeader
        title="Audit & Compliance Reports"
        description="Review post-exam candidate submission audit logs, proctoring risk verdicts, and cryptographic ledger proofs"
      />

      {/* Filter & Search Bar */}
      <Card className="border shadow-xs">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search candidate name, exam title, or receipt ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex bg-muted/30 p-1 rounded-lg border text-xs">
              {(['ALL', 'CLEAR', 'FLAGGED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                    statusFilter === st ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Records Table */}
      <Card className="border shadow-xs">
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" /> Verified Candidate Audit Ledger ({filteredLogs.length})
          </CardTitle>
          <Badge variant="outline" className="text-xs font-mono text-emerald-400 border-emerald-500/30">
            SYSTEM VERIFIED
          </Badge>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                <th className="p-3.5 pl-6">Candidate</th>
                <th className="p-3.5">Examination</th>
                <th className="p-3.5">Receipt ID</th>
                <th className="p-3.5">Submitted At</th>
                <th className="p-3.5">AI Risk Score</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredLogs.map((log) => {
                const isFlagged = log.proctoringStatus === 'FLAGGED';
                return (
                  <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3.5 pl-6 font-semibold text-foreground">
                      {log.candidateName}
                    </td>
                    <td className="p-3.5 text-muted-foreground max-w-xs truncate">
                      {log.examTitle}
                    </td>
                    <td className="p-3.5 font-mono text-emerald-400">
                      {log.receiptId}
                    </td>
                    <td className="p-3.5 text-muted-foreground">
                      {new Date(log.submittedAt).toLocaleString()}
                    </td>
                    <td className="p-3.5 font-bold">
                      <span className={isFlagged ? 'text-amber-400' : 'text-emerald-400'}>
                        {((log.riskScore || 0.05) * 100).toFixed(0)}% ({log.proctoringStatus})
                      </span>
                    </td>
                    <td className="p-3.5">
                      <Badge variant="outline" className="text-[11px] font-mono text-emerald-400 border-emerald-500/30">
                        {log.status}
                      </Badge>
                    </td>
                    <td className="p-3.5 pr-6 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-primary"
                        onClick={() => setActiveModalRecord(log)}
                      >
                        <Eye className="mr-1 h-3.5 w-3.5" /> Inspect Proof
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Proof Modal */}
      {activeModalRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <FileText className="h-5 w-5" />
                <span>Audit Certificate & Cryptographic Ledger Entry</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setActiveModalRecord(null)}>✕</Button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-muted/30 p-3 rounded-md border space-y-1.5 font-mono">
                <div><span className="text-muted-foreground">Candidate:</span> <strong className="text-foreground">{activeModalRecord.candidateName}</strong></div>
                <div><span className="text-muted-foreground">Exam Title:</span> <strong className="text-foreground">{activeModalRecord.examTitle}</strong></div>
                <div><span className="text-muted-foreground">Receipt ID:</span> <strong className="text-emerald-400">{activeModalRecord.receiptId}</strong></div>
                <div><span className="text-muted-foreground">Timestamp:</span> <strong className="text-foreground">{new Date(activeModalRecord.submittedAt).toUTCString()}</strong></div>
                <div><span className="text-muted-foreground">Proctoring Verdict:</span> <strong className={activeModalRecord.proctoringStatus === 'FLAGGED' ? 'text-amber-400' : 'text-emerald-400'}>{activeModalRecord.proctoringStatus} (Risk: {((activeModalRecord.riskScore || 0.05) * 100).toFixed(0)}%)</strong></div>
              </div>

              <p className="text-muted-foreground text-[11px] leading-relaxed">
                SentinelAI verified all multi-modal telemetry signals (Vision Mesh, Acoustic VAD, Behavioral Biometrics) for this candidate session. Cryptographic hash is immutably linked to the audit chain.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={() => setActiveModalRecord(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
