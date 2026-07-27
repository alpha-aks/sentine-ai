'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { DifficultyLevel } from '@/types/question';

interface DifficultyBadgeProps {
  difficulty: DifficultyLevel;
  className?: string;
}

const difficultyConfig: Record<DifficultyLevel, { label: string; style: string }> = {
  EASY: { label: 'Easy', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  MEDIUM: { label: 'Medium', style: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  HARD: { label: 'Hard', style: 'bg-destructive/10 text-destructive border-destructive/20' }
};

export function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  const config = difficultyConfig[difficulty] || difficultyConfig.MEDIUM;

  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border', config.style, className)}>
      {config.label}
    </span>
  );
}
