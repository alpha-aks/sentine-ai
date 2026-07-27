'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';

interface RiskBadgeProps {
  score: number;
  level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export function RiskBadge({ score, level }: RiskBadgeProps) {
  const percentage = Math.round(score * 100);
  const effectiveLevel =
    level || (percentage >= 85 ? 'CRITICAL' : percentage >= 70 ? 'HIGH' : percentage >= 40 ? 'MEDIUM' : 'LOW');

  if (effectiveLevel === 'CRITICAL' || effectiveLevel === 'HIGH') {
    return (
      <Badge variant="outline" className="text-xs font-mono font-bold text-rose-400 border-rose-500/30 bg-rose-500/10">
        RISK: {percentage}% ({effectiveLevel})
      </Badge>
    );
  }

  if (effectiveLevel === 'MEDIUM') {
    return (
      <Badge variant="outline" className="text-xs font-mono font-bold text-amber-400 border-amber-500/30 bg-amber-500/10">
        RISK: {percentage}% ({effectiveLevel})
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-xs font-mono font-bold text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
      RISK: {percentage}% (LOW)
    </Badge>
  );
}
