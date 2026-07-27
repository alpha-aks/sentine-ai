'use client';

import * as React from 'react';
import { calculatePasswordStrength } from '@/utils/validators';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PasswordStrength({ password }: { password?: string }) {
  if (!password) return null;

  const result = calculatePasswordStrength(password);

  const getScoreColor = (score: number) => {
    if (score <= 1) return 'bg-rose-500';
    if (score === 2) return 'bg-amber-500';
    if (score === 3) return 'bg-sky-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="space-y-2 mt-2">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="text-muted-foreground">Password strength:</span>
        <span
          className={cn(
            result.score <= 1 && 'text-rose-500',
            result.score === 2 && 'text-amber-500',
            result.score === 3 && 'text-sky-500',
            result.score >= 4 && 'text-emerald-500'
          )}
        >
          {result.label}
        </span>
      </div>

      {/* Progress Bars */}
      <div className="grid grid-cols-4 gap-1.5">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={cn(
              'h-1.5 rounded-full transition-colors',
              step <= result.score ? getScoreColor(result.score) : 'bg-muted'
            )}
          />
        ))}
      </div>

      {/* Rule Checklist */}
      <div className="grid grid-cols-2 gap-1 pt-1 text-[11px] text-muted-foreground">
        <RuleItem label="8+ characters" satisfied={result.hasMinLength} />
        <RuleItem label="Uppercase & Lowercase" satisfied={result.hasUppercase && result.hasLowercase} />
        <RuleItem label="Includes Number" satisfied={result.hasNumber} />
        <RuleItem label="Special Character" satisfied={result.hasSpecial} />
      </div>
    </div>
  );
}

function RuleItem({ label, satisfied }: { label: string; satisfied: boolean }) {
  return (
    <div className="flex items-center gap-1">
      {satisfied ? (
        <Check className="h-3 w-3 text-emerald-500 shrink-0" />
      ) : (
        <X className="h-3 w-3 text-muted-foreground/50 shrink-0" />
      )}
      <span className={cn(satisfied ? 'text-foreground font-medium' : 'text-muted-foreground')}>
        {label}
      </span>
    </div>
  );
}
