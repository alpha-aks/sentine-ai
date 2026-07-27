'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { UserRole } from '@sentinel-ai/types';

interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  role?: UserRole;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg'
};

const roleColors: Record<string, string> = {
  EXAM_ADMIN: 'bg-destructive/20 text-destructive border-destructive/30',
  PROCTOR_SUPERVISOR: 'bg-primary/20 text-primary border-primary/30',
  LIVE_PROCTOR: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  COMPLIANCE_OFFICER: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  CANDIDATE: 'bg-muted text-muted-foreground border-border'
};

export function UserAvatar({ name, avatarUrl, role = 'CANDIDATE', size = 'md', className }: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const colorStyle = roleColors[role] || roleColors.CANDIDATE;
  const isInvalidHost = avatarUrl ? avatarUrl.includes('assets.sentinelai.io') || avatarUrl.includes('example.com') : true;

  if (avatarUrl && !isInvalidHost && !imgError) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        onError={() => setImgError(true)}
        className={cn('rounded-full object-cover border border-border shadow-xs', sizeClasses[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold border shadow-xs select-none',
        colorStyle,
        sizeClasses[size],
        className
      )}
    >
      {initials || 'U'}
    </div>
  );
}
