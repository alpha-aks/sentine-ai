'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SubmissionProvider, useSubmission } from '@/components/submission/SubmissionProvider';
import { SubmissionReview, QuestionSummaryItem } from '@/components/submission/SubmissionReview';
import { SubmissionLoading } from '@/components/submission/SubmissionLoading';
import { SubmissionError } from '@/components/submission/SubmissionError';
import { SubmissionLockScreen } from '@/components/submission/SubmissionLockScreen';

const MOCK_QUESTIONS_MATRIX: QuestionSummaryItem[] = [
  { questionId: 'q1', questionNumber: 1, type: 'SINGLE_CHOICE', title: 'Data Structure Time Complexity', isAnswered: true, hasDraft: false },
  { questionId: 'q2', questionNumber: 2, type: 'MULTIPLE_CHOICE', title: 'JVM Garbage Collectors', isAnswered: true, hasDraft: false },
  { questionId: 'q3', questionNumber: 3, type: 'TRUE_FALSE', title: 'RDBMS ACID Isolation', isAnswered: true, hasDraft: false },
  { questionId: 'q4', questionNumber: 4, type: 'SHORT_ANSWER', title: 'REST API Idempotency', isAnswered: true, hasDraft: false },
  { questionId: 'q5', questionNumber: 5, type: 'LONG_ANSWER', title: 'Dijkstra vs A* Search Algorithm', isAnswered: true, hasDraft: false },
  { questionId: 'q6', questionNumber: 6, type: 'NUMERICAL', title: 'Binary Tree Node Calculation', isAnswered: false, hasDraft: true },
  { questionId: 'q7', questionNumber: 7, type: 'PROGRAMMING', title: 'Reverse Linked List Code', isAnswered: true, hasDraft: false },
  { questionId: 'q8', questionNumber: 8, type: 'FILE_UPLOAD', title: 'System Architecture Diagram', isAnswered: false, hasDraft: false },
  { questionId: 'q9', questionNumber: 9, type: 'MATCHING', title: 'Network Protocol Matching', isAnswered: true, hasDraft: false },
  { questionId: 'q10', questionNumber: 10, type: 'ORDERING', title: 'Next.js HTTP Lifecycle Ordering', isAnswered: true, hasDraft: false }
];

function CandidateReviewContent({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const { submission, isLoading, isError, error, submitFinal } = useSubmission();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) return <SubmissionLoading />;
  if (isError || !submission) {
    return <SubmissionError message={error?.message} />;
  }

  if (submission.isLocked || submission.status === 'SUBMITTED' || submission.status === 'LOCKED') {
    return (
      <SubmissionLockScreen
        receiptId={submission.submissionId}
        submittedAt={submission.submittedAt}
        status={submission.status}
      />
    );
  }

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitFinal('Final submission completed via candidate review interface.');
      router.push(`/candidate/submission?receiptId=${submission.submissionId}`);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <SubmissionReview
      examTitle="CS401: Advanced Computer Science & Algorithms Final Exam"
      questions={MOCK_QUESTIONS_MATRIX}
      onSelectQuestion={() => router.push(`/candidate/exam/${sessionId}`)}
      onConfirmSubmit={handleFinalSubmit}
      onBackToExam={() => router.push(`/candidate/exam/${sessionId}`)}
      isSubmitting={isSubmitting}
    />
  );
}

export default function CandidateExamReviewPage() {
  const params = useParams();
  const sessionId = (params?.sessionId as string) || 'sess_100';

  return (
    <SubmissionProvider submissionId={`sub_${sessionId}`}>
      <CandidateReviewContent sessionId={sessionId} />
    </SubmissionProvider>
  );
}
