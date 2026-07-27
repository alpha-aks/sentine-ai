'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ExamStatus } from '@/types/exam';
import { FileEdit, Calendar, Globe, Radio, CheckCircle2, Archive, XCircle } from 'lucide-react';

interface ExamStatusBadgeProps {
  status: ExamStatus;
  className?: string;
}

const statusConfig: Record<ExamStatus, { label: string; icon: React.ComponentType<any>; style: string }> = {
  DRAFT: {
    label: 'Draft',
    icon: FileEdit,
    style: 'bg-muted text-muted-foreground border-border'
  },
  SCHEDULED: {
    label: 'Scheduled',
    icon: Calendar,
    style: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  },
  PUBLISHED: {
    label: 'Published',
    icon: Globe,
    style: 'bg-primary/10 text-primary border-primary/20'
  },
  ACTIVE: {
    label: 'Live Now',
    icon: Radio,
    style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse'
  },
  ENDED: {
    label: 'Concluded',
    icon: CheckCircle2,
    style: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  },
  CANCELLED: {
    label: 'Cancelled',
    icon: XCircle,
    style: 'bg-destructive/10 text-destructive border-destructive/20'
  },
  ARCHIVED: {
    label: 'Archived',
    icon: Archive,
    style: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  }
};

export function ExamStatusBadge({ status, className }: ExamStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.DRAFT;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors',
        config.style,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}
