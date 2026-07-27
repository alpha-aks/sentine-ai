'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { ExamPreview } from '@/components/exams/exam-preview';
import { ExamEntity } from '@/types/exam';
import { examService } from '@/services/exam.service';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PreviewPage() {
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
    return <LoadingSkeleton rows={6} className="max-w-4xl mx-auto mt-6" />;
  }

  if (!exam) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold">Exam Specification Not Found</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Simulation Preview — ${exam.title}`}
        description="Interactive read-only preview of the examinee testing interface and enforced policies"
        actions={
          <Button variant="outline" size="sm" onClick={() => router.push(`/exams/${exam.id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Return to Specification
          </Button>
        }
      />
      <ExamPreview exam={exam} />
    </div>
  );
}
