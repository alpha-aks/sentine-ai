'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { UserAccountStatus } from '@/types/user';
import { CheckCircle2, AlertCircle, ShieldAlert, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: UserAccountStatus;
  className?: string;
}

const statusConfig: Record<UserAccountStatus, { label: string; icon: React.ComponentType<any>; style: string }> = {
  ACTIVE: {
    label: 'Active',
    icon: CheckCircle2,
    style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  },
  INACTIVE: {
    label: 'Inactive',
    icon: AlertCircle,
    style: 'bg-muted text-muted-foreground border-border'
  },
  SUSPENDED: {
    label: 'Suspended',
    icon: ShieldAlert,
    style: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  },
  DEACTIVATED: {
    label: 'Deactivated',
    icon: XCircle,
    style: 'bg-destructive/10 text-destructive border-destructive/20'
  }
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.ACTIVE;
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
