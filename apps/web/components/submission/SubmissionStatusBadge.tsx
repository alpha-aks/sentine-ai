import React from 'react';
import { Badge } from '@/components/ui/badge';

interface SubmissionStatusBadgeProps {
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'AUTO_SUBMITTED' | 'LOCKED' | 'EXPIRED' | string;
  isLocked?: boolean;
}

export function SubmissionStatusBadge({ status, isLocked }: SubmissionStatusBadgeProps) {
  if (isLocked || status === 'LOCKED') {
    return (
      <Badge variant="outline" className="text-xs font-mono text-rose-400 border-rose-500/30 bg-rose-500/10">
        SUBMISSION LOCKED
      </Badge>
    );
  }

  if (status === 'SUBMITTED' || status === 'AUTO_SUBMITTED') {
    return (
      <Badge variant="outline" className="text-xs font-mono text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
        {status}
      </Badge>
    );
  }

  if (status === 'EXPIRED') {
    return (
      <Badge variant="outline" className="text-xs font-mono text-amber-400 border-amber-500/30 bg-amber-500/10">
        SESSION EXPIRED
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-xs font-mono text-sky-400 border-sky-500/30 bg-sky-500/10">
      IN PROGRESS
    </Badge>
  );
}
