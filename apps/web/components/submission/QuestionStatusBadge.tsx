import React from 'react';
import { Badge } from '@/components/ui/badge';

interface QuestionStatusBadgeProps {
  isAnswered: boolean;
  hasDraft: boolean;
  isMarkedForReview: boolean;
}

export function QuestionStatusBadge({ isAnswered, hasDraft, isMarkedForReview }: QuestionStatusBadgeProps) {
  if (isMarkedForReview) {
    return (
      <Badge variant="outline" className="text-[10px] font-mono text-amber-400 border-amber-500/30 bg-amber-500/10">
        REVIEW
      </Badge>
    );
  }

  if (isAnswered) {
    return (
      <Badge variant="outline" className="text-[10px] font-mono text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
        ANSWERED
      </Badge>
    );
  }

  if (hasDraft) {
    return (
      <Badge variant="outline" className="text-[10px] font-mono text-sky-400 border-sky-500/30 bg-sky-500/10">
        DRAFT
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground border-border bg-muted/20">
      UNANSWERED
    </Badge>
  );
}
