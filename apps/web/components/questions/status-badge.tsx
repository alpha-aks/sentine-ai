'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { QuestionApprovalStatus } from '@/types/question';

interface StatusBadgeProps {
  status: QuestionApprovalStatus;
  className?: string;
}

const statusConfig: Record<QuestionApprovalStatus, { label: string; style: string }> = {
  DRAFT: { label: 'Draft', style: 'bg-muted text-muted-foreground border-border' },
  PENDING_REVIEW: { label: 'In Review', style: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  APPROVED: { label: 'Approved', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  REJECTED: { label: 'Rejected', style: 'bg-destructive/10 text-destructive border-destructive/20' },
  ARCHIVED: { label: 'Archived', style: 'bg-slate-500/10 text-slate-400 border-slate-500/20' }
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.APPROVED;

  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border', config.style, className)}>
      {config.label}
    </span>
  );
}
