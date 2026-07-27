'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, ArrowRight } from 'lucide-react';

export default function CandidateExamsPage() {
  const mockExams = [
    {
      id: 'ex_101',
      title: 'CS401: Advanced Algorithms & Data Structures Final Exam',
      code: 'CS401-FINAL',
      durationMinutes: 90,
      scheduledStart: '2026-07-26T18:00:00Z',
      status: 'SCHEDULED',
      sessionId: 'session_demo_101'
    },
    {
      id: 'ex_102',
      title: 'PHYS202: Quantum Physics & Thermodynamics Midterm',
      code: 'PHYS202-MID',
      durationMinutes: 60,
      scheduledStart: '2026-07-28T14:00:00Z',
      status: 'SCHEDULED',
      sessionId: 'session_demo_102'
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-6 w-full">
      <PageHeader title="Registered Upcoming Examinations" description="View exam schedules, duration guidelines, and waiting room triggers" />

      <div className="space-y-4">
        {mockExams.map((exam) => (
          <Card key={exam.id} className="border shadow-xs hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" /> {exam.title}
              </CardTitle>
              <Badge variant="outline" className="text-xs font-mono">{exam.code}</Badge>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="text-xs space-y-1 text-muted-foreground">
                <div>Scheduled Start: <strong className="text-foreground">{new Date(exam.scheduledStart).toLocaleString()}</strong></div>
                <div>Duration Limit: <strong className="text-foreground">{exam.durationMinutes} Minutes</strong></div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/candidate/exams/${exam.id}`}>
                    Details <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href={`/candidate/waiting-room/${exam.sessionId}`}>
                    <Play className="mr-1.5 h-3.5 w-3.5" /> Enter Waiting Room
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
