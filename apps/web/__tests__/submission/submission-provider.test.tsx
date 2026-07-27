import React from 'react';
import { render, screen } from '@testing-library/react';
import { SubmissionStatusBadge } from '@/components/submission/SubmissionStatusBadge';
import { QuestionStatusBadge } from '@/components/submission/QuestionStatusBadge';
import { AnswerProgress } from '@/components/submission/AnswerProgress';

describe('Submission UI Components', () => {
  it('renders SubmissionStatusBadge correctly for IN_PROGRESS and SUBMITTED', () => {
    const { rerender } = render(<SubmissionStatusBadge status="IN_PROGRESS" />);
    expect(screen.getByText('IN PROGRESS')).toBeInTheDocument();

    rerender(<SubmissionStatusBadge status="SUBMITTED" isLocked={true} />);
    expect(screen.getByText('SUBMISSION LOCKED')).toBeInTheDocument();
  });

  it('renders QuestionStatusBadge tags correctly', () => {
    const { rerender } = render(
      <QuestionStatusBadge isAnswered={true} hasDraft={false} isMarkedForReview={false} />
    );
    expect(screen.getByText('ANSWERED')).toBeInTheDocument();

    rerender(
      <QuestionStatusBadge isAnswered={false} hasDraft={false} isMarkedForReview={true} />
    );
    expect(screen.getByText('REVIEW')).toBeInTheDocument();
  });

  it('calculates completion percentage in AnswerProgress bar', () => {
    render(<AnswerProgress answeredCount={8} totalQuestions={10} reviewCount={2} />);
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('8 of 10 Answered (2 Marked for Review)')).toBeInTheDocument();
  });
});
