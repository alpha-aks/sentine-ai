'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { QuestionType } from '@/types/question';
import { CheckSquare, ListChecks, CheckCircle2, FormInput, FileText, Code2, Upload, GitCompare, ArrowUpDown, Hash } from 'lucide-react';

interface TypeBadgeProps {
  type: QuestionType;
  className?: string;
}

const typeConfig: Record<QuestionType, { label: string; icon: React.ComponentType<any> }> = {
  MCQ_SINGLE: { label: 'MCQ (Single)', icon: CheckSquare },
  MCQ_MULTIPLE: { label: 'MCQ (Multiple)', icon: ListChecks },
  TRUE_FALSE: { label: 'True / False', icon: CheckCircle2 },
  FILL_BLANK: { label: 'Fill in Blank', icon: FormInput },
  SHORT_ANSWER: { label: 'Short Answer', icon: FileText },
  LONG_ANSWER: { label: 'Long Essay', icon: FileText },
  NUMERICAL: { label: 'Numerical', icon: Hash },
  CODE_SNIPPET: { label: 'Code Problem', icon: Code2 },
  FILE_UPLOAD: { label: 'File Upload', icon: Upload },
  MATCHING: { label: 'Matching Pairs', icon: GitCompare },
  ORDERING: { label: 'Ordering Sequence', icon: ArrowUpDown }
};

export function TypeBadge({ type, className }: TypeBadgeProps) {
  const config = typeConfig[type] || typeConfig.MCQ_SINGLE;
  const Icon = config.icon;

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border bg-muted/50 text-foreground', className)}>
      <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
      {config.label}
    </span>
  );
}
