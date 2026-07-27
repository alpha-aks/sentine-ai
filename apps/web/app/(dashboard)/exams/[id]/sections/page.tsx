'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { SectionEditor } from '@/components/exams/section-editor';
import { ExamEntity, ExamSectionEntity } from '@/types/exam';
import { examService } from '@/services/exam.service';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SectionsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [exam, setExam] = useState<ExamEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    examService
      .getExamById(id)
      .then((data) => setExam(data))
      .catch(() => setExam(null))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSave = async (sections: ExamSectionEntity[]) => {
    if (!id) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await examService.updateSections(id, sections);
      router.push(`/exams/${id}`);
    } catch (err: any) {
      console.error('Failed to update sections', err);
      setError(err.message || 'Failed to update section architecture.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader title={`Section Architecture — ${exam.title}`} description="Configure section order, individual timers, mandatory status, and question randomization" />
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <SectionEditor sections={exam.sections || []} onSave={handleSave} isLoading={isSubmitting} />
    </div>
  );
}
