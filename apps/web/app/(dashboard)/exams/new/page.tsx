'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { ExamForm, ExamFormValues } from '@/components/exams/exam-form';
import { examService } from '@/services/exam.service';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function NewExamPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: ExamFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const created = await examService.createExam({
        code: values.code,
        title: values.title,
        description: values.description,
        type: values.type,
        difficultyLevel: values.difficultyLevel,
        totalDurationMinutes: values.totalDurationMinutes,
        passingPercentage: values.passingPercentage,
        totalPoints: values.totalPoints,
        maxAttemptsAllowed: values.maxAttemptsAllowed
      });
      router.push(`/exams/${created.id}`);
    } catch (err: any) {
      console.error('Failed to create exam draft', err);
      setError(err.message || 'Failed to create exam specification draft.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader title="Create Exam Specification" description="Author new assessment draft, duration parameters, and passing rubrics" />
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <ExamForm onSubmit={handleSubmit} isLoading={isSubmitting} />
    </div>
  );
}
