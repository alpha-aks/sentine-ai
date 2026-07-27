'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { ExamStatusBadge } from '@/components/exams/status-badge';
import { ExamEntity } from '@/types/exam';
import { examService } from '@/services/exam.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Edit3, Shield, Eye, Layers, Calendar, Users, Lock, Award } from 'lucide-react';

export default function ExamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [exam, setExam] = useState<ExamEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    examService
      .getExamById(id)
      .then((data) => setExam(data))
      .catch(() => setExam(null))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return <LoadingSkeleton rows={6} className="max-w-5xl mx-auto mt-6" />;
  }

  if (!exam) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold">Exam Specification Not Found</h2>
        <Button className="mt-4" onClick={() => router.push('/exams')}>
          Return to Exam Directory
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title={exam.title}
        description={`Code: ${exam.code} | Passing Score: ${exam.passingPercentage}% (${exam.totalPoints} pts)`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/exams/${exam.id}/preview`}>
                <Eye className="mr-2 h-4 w-4" /> Candidate Preview Mode
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={`/exams/${exam.id}/edit`}>
                <Edit3 className="mr-2 h-4 w-4" /> Edit Parameters
              </Link>
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-3 border-b pb-4">
        <ExamStatusBadge status={exam.status} />
        <Badge variant="outline" className="font-mono text-xs">
          {exam.type}
        </Badge>
        <Badge variant="outline" className="font-mono text-xs">
          {exam.difficultyLevel}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href={`/exams/${exam.id}/sections`}>
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Sections</CardTitle>
              <Layers className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{exam.sections?.length || 1}</div>
              <p className="text-xs text-muted-foreground mt-1">Section architecture & weighting</p>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/exams/${exam.id}/schedule`}>
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Schedule Window</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{exam.totalDurationMinutes}m</div>
              <p className="text-xs text-muted-foreground mt-1">Registration & time window</p>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/exams/${exam.id}/security`}>
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Browser Lockdown</CardTitle>
              <Lock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Enforced</div>
              <p className="text-xs text-muted-foreground mt-1">Fullscreen & tab switch rules</p>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/exams/${exam.id}/proctoring`}>
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">AI Proctoring</CardTitle>
              <Shield className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Active</div>
              <p className="text-xs text-muted-foreground mt-1">Computer vision & acoustic AI</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Exam Configuration Tabs</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
          <Link href={`/exams/${exam.id}/instructions`} className="p-3 rounded-md border bg-card hover:bg-muted/40 transition-colors flex items-center justify-between">
            <span>Candidate Instructions</span>
            <Edit3 className="h-4 w-4 text-muted-foreground" />
          </Link>
          <Link href={`/exams/${exam.id}/eligibility`} className="p-3 rounded-md border bg-card hover:bg-muted/40 transition-colors flex items-center justify-between">
            <span>Candidate Eligibility</span>
            <Users className="h-4 w-4 text-muted-foreground" />
          </Link>
          <Link href={`/exams/${exam.id}/analytics`} className="p-3 rounded-md border bg-card hover:bg-muted/40 transition-colors flex items-center justify-between">
            <span>Participation & Analytics</span>
            <Award className="h-4 w-4 text-muted-foreground" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
