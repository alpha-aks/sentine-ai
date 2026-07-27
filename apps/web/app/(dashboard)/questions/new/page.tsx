'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { QuestionEditor, QuestionFormValues } from '@/components/questions/question-editor';
import { questionService } from '@/services/question.service';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function NewQuestionPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: QuestionFormValues, extraData: any) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const created = await questionService.createQuestion({
        type: values.type,
        title: values.title,
        body: values.body,
        difficulty: values.difficulty,
        marks: values.marks,
        negativeMarks: values.negativeMarks,
        explanation: values.explanation,
        options: extraData.options,
        codeLanguage: extraData.codeLanguage,
        codeTemplate: extraData.codeTemplate
      });
      router.push(`/questions/${created.id}`);
    } catch (err: any) {
      console.error('Failed to create question', err);
      setError(err.message || 'Failed to save new question specification.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader title="Author Question Specification" description="Create multi-format questions across 11 formats with scoring rubrics and code stubs" />
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <QuestionEditor onSubmit={handleSubmit} isLoading={isSubmitting} />
    </div>
  );
}
