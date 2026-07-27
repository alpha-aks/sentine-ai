'use client';

import * as React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface FilterOption {
  key: string;
  label: string;
  options: { label: string; value: string }[];
  value?: string;
}

interface FiltersProps {
  filters: FilterOption[];
  onFilterChange: (key: string, value: string) => void;
  onReset: () => void;
  className?: string;
}

export function Filters({ filters, onFilterChange, onReset, className }: FiltersProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
        <Filter className="h-3.5 w-3.5" /> Filters:
      </div>

      {filters.map((f) => (
        <select
          key={f.key}
          value={f.value || ''}
          onChange={(e) => onFilterChange(f.key, e.target.value)}
          className="h-8 rounded-md border border-input bg-background px-2.5 text-xs text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">All {f.label}</option>
          {f.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}

      <Button variant="ghost" size="sm" onClick={onReset} className="h-8 px-2 text-xs text-muted-foreground">
        <RotateCcw className="mr-1 h-3 w-3" /> Reset
      </Button>
    </div>
  );
}
