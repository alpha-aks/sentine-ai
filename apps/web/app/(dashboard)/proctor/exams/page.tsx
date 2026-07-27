'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useActiveExamsQuery } from '@/hooks/use-proctor-monitoring-query';
import { FileSpreadsheet, Users, Shield, ArrowRight } from 'lucide-react';

export default function ActiveExamsDirectoryPage() {
  const { data: exams = [] } = useActiveExamsQuery();

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 w-full">
      <PageHeader
        title="Active Monitored Examinations"
        description="Overview of currently running examinations, candidate seat counts, average risk rollups, and proctoring status"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {exams.map((exam) => (
          <Card key={exam.examId} className="border shadow-xs bg-card hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-primary" /> {exam.examCode}
              </CardTitle>
              <Badge variant="outline" className="text-xs font-mono text-emerald-400 border-emerald-500/30">
                LIVE
              </Badge>
            </CardHeader>

            <CardContent className="space-y-4 pt-4 text-xs">
              <div>
                <h3 className="font-bold text-sm text-foreground">{exam.title}</h3>
                <div className="text-muted-foreground mt-0.5">Tenant Institution: {exam.institutionId}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-muted/30 p-3 rounded-lg border font-mono">
                <div>
                  <span className="text-muted-foreground block">Total Candidates:</span>
                  <strong className="text-foreground text-sm">{exam.totalCandidates}</strong>
                </div>

                <div>
                  <span className="text-muted-foreground block">Suspicious:</span>
                  <strong className="text-amber-400 text-sm">{exam.suspiciousCandidates}</strong>
                </div>

                <div>
                  <span className="text-muted-foreground block">In Progress:</span>
                  <strong className="text-emerald-400 text-sm">{exam.inProgressCandidates}</strong>
                </div>

                <div>
                  <span className="text-muted-foreground block">Avg Risk:</span>
                  <strong className="text-primary text-sm">{(exam.averageRiskScore * 100).toFixed(0)}%</strong>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button size="sm" asChild>
                  <Link href={`/dashboard/proctor/exams/${exam.examId}`}>
                    Monitor Exam <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
