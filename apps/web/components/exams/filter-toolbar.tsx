'use client';

import React from 'react';
import { ExamSearchBar } from './search-bar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ExamType, ExamStatus } from '@/types/exam';
import { RotateCcw } from 'lucide-react';

interface ExamFilterToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  typeFilter: ExamType | 'ALL';
  onTypeChange: (t: ExamType | 'ALL') => void;
  statusFilter: ExamStatus | 'ALL';
  onStatusChange: (s: ExamStatus | 'ALL') => void;
  onReset: () => void;
}

export function ExamFilterToolbar({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeChange,
  statusFilter,
  onStatusChange,
  onReset
}: ExamFilterToolbarProps) {
  const hasActiveFilters = searchQuery !== '' || typeFilter !== 'ALL' || statusFilter !== 'ALL';

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
      <div className="flex flex-1 flex-wrap items-center gap-3 min-w-[280px]">
        <ExamSearchBar value={searchQuery} onChange={onSearchChange} />

        <div className="flex items-center gap-2">
          <Select value={typeFilter} onValueChange={(val) => onTypeChange(val as ExamType | 'ALL')}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Exam Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="QUIZ">Quiz</SelectItem>
              <SelectItem value="MIDTERM">Midterm</SelectItem>
              <SelectItem value="FINAL_EXAM">Final Exam</SelectItem>
              <SelectItem value="CERTIFICATION">Certification</SelectItem>
              <SelectItem value="PRACTICE">Practice</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(val) => onStatusChange(val as ExamStatus | 'ALL')}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="SCHEDULED">Scheduled</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="ACTIVE">Live Now</SelectItem>
              <SelectItem value="ENDED">Concluded</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onReset} className="h-9 px-2 text-muted-foreground hover:text-foreground">
              <RotateCcw className="mr-1 h-3.5 w-3.5" /> Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
