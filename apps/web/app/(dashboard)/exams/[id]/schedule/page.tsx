'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { SchedulePicker } from '@/components/exams/schedule-picker';
import { ExamEntity, ExamScheduleEntity } from '@/types/exam';
import { examService } from '@/services/exam.service';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SchedulePage() {
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

  const handleSave = async (schedule: Partial<ExamScheduleEntity>) => {
    if (!id) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await examService.scheduleExam(id, schedule);
      router.push(`/exams/${id}`);
    } catch (err: any) {
      console.error('Failed to update schedule', err);
      setError(err.message || 'Failed to update exam schedule window.');
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
      <PageHeader title={`Schedule Window — ${exam.title}`} description="Configure exam start and end times, timezones, and late entry grace periods" />
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <SchedulePicker schedule={exam.schedule} onSave={handleSave} isLoading={isSubmitting} />
    </div>
  );
}
