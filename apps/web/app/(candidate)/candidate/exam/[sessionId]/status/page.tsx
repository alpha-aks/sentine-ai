'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { SubmissionProvider, useSubmission } from '@/components/submission/SubmissionProvider';
import { SubmissionLockScreen } from '@/components/submission/SubmissionLockScreen';
import { SubmissionLoading } from '@/components/submission/SubmissionLoading';
import { SubmissionError } from '@/components/submission/SubmissionError';

function CandidateStatusContent() {
  const { submission, isLoading, isError, error } = useSubmission();

  if (isLoading) return <SubmissionLoading />;
  if (isError || !submission) {
    return <SubmissionError message={error?.message} />;
  }

  return (
    <SubmissionLockScreen
      receiptId={submission.submissionId}
      submittedAt={submission.submittedAt}
      status={submission.status}
    />
  );
}

export default function CandidateExamStatusPage() {
  const params = useParams();
  const sessionId = (params?.sessionId as string) || 'sess_100';

  return (
    <SubmissionProvider submissionId={`sub_${sessionId}`}>
      <CandidateStatusContent />
    </SubmissionProvider>
  );
}
