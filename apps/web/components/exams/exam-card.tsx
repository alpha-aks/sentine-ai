'use client';

import React from 'react';
import Link from 'next/link';
import { ExamEntity } from '@/types/exam';
import { ExamStatusBadge } from './status-badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Clock, Award, Eye, Edit3, ArrowRight } from 'lucide-react';

interface ExamCardProps {
  exam: ExamEntity;
}

export function ExamCard({ exam }: ExamCardProps) {
  return (
    <Card className="hover:border-primary/50 transition-colors flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <Badge variant="outline" className="font-mono text-xs">
            {exam.code}
          </Badge>
          <ExamStatusBadge status={exam.status} />
        </div>
        <CardTitle className="text-base font-bold line-clamp-1 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary shrink-0" /> {exam.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs text-muted-foreground">
        <p className="line-clamp-2">{exam.description || 'No description provided.'}</p>
        <div className="grid grid-cols-2 gap-2 pt-2 border-t font-medium">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary" /> {exam.totalDurationMinutes} mins
          </div>
          <div className="flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5 text-primary" /> {exam.passingPercentage}% Pass
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-3 border-t flex justify-between gap-2">
        <Button variant="ghost" size="sm" asChild className="text-xs">
          <Link href={`/exams/${exam.id}/preview`}>
            <Eye className="mr-1 h-3.5 w-3.5" /> Preview
          </Link>
        </Button>
        <Button size="sm" asChild className="text-xs">
          <Link href={`/exams/${exam.id}`}>
            Manage <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
