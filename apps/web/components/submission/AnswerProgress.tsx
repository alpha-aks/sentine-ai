import React from 'react';

interface AnswerProgressProps {
  answeredCount: number;
  totalQuestions: number;
  reviewCount: number;
}

export function AnswerProgress({ answeredCount, totalQuestions, reviewCount }: AnswerProgressProps) {
  const percentage = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex justify-between items-center text-xs">
        <span className="font-semibold text-foreground">
          Completion Progress: <strong className="text-primary">{percentage}%</strong>
        </span>
        <span className="text-muted-foreground">
          {answeredCount} of {totalQuestions} Answered {reviewCount > 0 && `(${reviewCount} Marked for Review)`}
        </span>
      </div>

      <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden border border-border">
        <div
          className="h-full bg-primary transition-all duration-300 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
