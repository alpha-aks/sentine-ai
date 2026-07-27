import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QuestionStatusBadge } from './QuestionStatusBadge';
import { SubmissionSummary } from './SubmissionSummary';
import { useSubmissionStore } from '@/store/submission-store';
import { Send, ArrowLeft, Bookmark, CheckCircle2, HelpCircle } from 'lucide-react';

export interface QuestionSummaryItem {
  questionId: string;
  questionNumber: number;
  type: string;
  title: string;
  isAnswered: boolean;
  hasDraft: boolean;
}

interface SubmissionReviewProps {
  examTitle: string;
  questions: QuestionSummaryItem[];
  onSelectQuestion: (questionId: string) => void;
  onConfirmSubmit: () => void;
  onBackToExam: () => void;
  isSubmitting?: boolean;
}

export function SubmissionReview({
  examTitle,
  questions,
  onSelectQuestion,
  onConfirmSubmit,
  onBackToExam,
  isSubmitting
}: SubmissionReviewProps) {
  const markedForReview = useSubmissionStore((s) => s.markedForReview);

  const answeredCount = questions.filter((q) => q.isAnswered).length;
  const unansweredCount = questions.length - answeredCount;
  const reviewCount = questions.filter((q) => markedForReview[q.questionId]).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-6 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Examination Review & Final Submission</h1>
          <p className="text-xs text-muted-foreground">
            Review all answered and unanswered questions before locking your final submission.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onBackToExam}>
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Exam
          </Button>

          <Button
            size="sm"
            onClick={onConfirmSubmit}
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
          >
            <Send className="mr-1.5 h-4 w-4" />
            {isSubmitting ? 'Submitting...' : 'Final Submit Exam'}
          </Button>
        </div>
      </div>

      <SubmissionSummary
        examTitle={examTitle}
        totalQuestions={questions.length}
        answeredCount={answeredCount}
        unansweredCount={unansweredCount}
        reviewCount={reviewCount}
      />

      <Card className="border shadow-xs">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" /> Question Summary Matrix
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {questions.map((q) => {
              const isMarked = Boolean(markedForReview[q.questionId]);
              return (
                <div
                  key={q.questionId}
                  onClick={() => onSelectQuestion(q.questionId)}
                  className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all hover:border-primary flex items-start justify-between gap-2 ${
                    isMarked
                      ? 'border-amber-500/40 bg-amber-500/10'
                      : q.isAnswered
                      ? 'border-emerald-500/30 bg-card'
                      : 'border-border bg-card'
                  }`}
                >
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                      <span className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[11px]">
                        {q.questionNumber}
                      </span>
                      <span className="truncate">{q.title}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground uppercase">{q.type}</div>
                  </div>

                  <QuestionStatusBadge
                    isAnswered={q.isAnswered}
                    hasDraft={q.hasDraft}
                    isMarkedForReview={isMarked}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
