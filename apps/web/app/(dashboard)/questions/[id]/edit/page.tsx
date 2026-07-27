'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { QuestionEditor, QuestionFormValues } from '@/components/questions/question-editor';
import { QuestionEntity } from '@/types/question';
import { questionService } from '@/services/question.service';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function EditQuestionPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [question, setQuestion] = useState<QuestionEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    questionService
      .getQuestionById(id)
      .then((data) => setQuestion(data))
      .catch(() => setQuestion(null))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSubmit = async (values: QuestionFormValues, extraData: any) => {
    if (!id) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await questionService.updateQuestion(id, {
        type: values.type,
        title: values.title,
        body: values.body,
        difficulty: values.difficulty,
        marks: values.marks,
        negativeMarks: values.negativeMarks,
        explanation: values.explanation,
        options: extraData.options,
        codeLanguage: extraData.codeLanguage,
        codeTemplate: extraData.codeTemplate,
        changeSummary: 'Updated question content via editor'
      });
      router.push(`/questions/${id}`);
    } catch (err: any) {
      console.error('Failed to update question', err);
      setError(err.message || 'Failed to update question specification.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton rows={6} className="max-w-4xl mx-auto mt-6" />;
  }

  if (!question) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold">Question Specification Not Found</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader title={`Edit Question — ${question.title}`} description="Modify prompt text, choice options, scoring rubrics, or solution explanations" />
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <QuestionEditor initialValues={question} onSubmit={handleSubmit} isLoading={isSubmitting} isEdit />
    </div>
  );
}
