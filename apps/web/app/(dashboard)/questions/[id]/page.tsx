'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { QuestionPreview } from '@/components/questions/question-preview';
import { StatusBadge } from '@/components/questions/status-badge';
import { QuestionEntity } from '@/types/question';
import { questionService } from '@/services/question.service';
import { Button } from '@/components/ui/button';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Edit3, CheckCircle2, Trash2, ArrowLeft } from 'lucide-react';

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [question, setQuestion] = useState<QuestionEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    questionService
      .getQuestionById(id)
      .then((data) => setQuestion(data))
      .catch(() => setQuestion(null))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleApprove = async () => {
    if (!id) return;
    await questionService.updateApprovalStatus(id, 'APPROVED');
    setQuestion((prev) => (prev ? { ...prev, status: 'APPROVED' } : null));
  };

  const handleDelete = async () => {
    if (!id) return;
    if (confirm('Are you sure you want to delete this question?')) {
      await questionService.deleteQuestion(id);
      router.push('/questions');
    }
  };

  if (isLoading) {
    return <LoadingSkeleton rows={6} className="max-w-4xl mx-auto mt-6" />;
  }

  if (!question) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold">Question Specification Not Found</h2>
        <Button className="mt-4" onClick={() => router.push('/questions')}>
          Return to Question Directory
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title={question.title}
        description={`Format: ${question.type} | Difficulty: ${question.difficulty} | Marks: ${question.marks} pts`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push('/questions')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            {question.status !== 'APPROVED' && (
              <Button variant="outline" size="sm" onClick={handleApprove}>
                <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-400" /> Approve
              </Button>
            )}
            <Button size="sm" asChild>
              <Link href={`/questions/${question.id}/edit`}>
                <Edit3 className="mr-2 h-4 w-4" /> Edit Content
              </Link>
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </div>
        }
      />

      <div className="flex items-center gap-3 border-b pb-4 text-xs font-semibold">
        <span>Approval Status:</span>
        <StatusBadge status={question.status} />
        <span className="ml-auto text-muted-foreground font-mono">Version #{question.version}</span>
      </div>

      <QuestionPreview question={question} />
    </div>
  );
}
