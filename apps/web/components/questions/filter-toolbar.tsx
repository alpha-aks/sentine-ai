'use client';

import React from 'react';
import { QuestionSearchBar } from './search-bar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { QuestionType, DifficultyLevel, QuestionApprovalStatus } from '@/types/question';
import { RotateCcw } from 'lucide-react';

interface QuestionFilterToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  typeFilter: QuestionType | 'ALL';
  onTypeChange: (t: QuestionType | 'ALL') => void;
  difficultyFilter: DifficultyLevel | 'ALL';
  onDifficultyChange: (d: DifficultyLevel | 'ALL') => void;
  statusFilter: QuestionApprovalStatus | 'ALL';
  onStatusChange: (s: QuestionApprovalStatus | 'ALL') => void;
  onReset: () => void;
}

export function QuestionFilterToolbar({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeChange,
  difficultyFilter,
  onDifficultyChange,
  statusFilter,
  onStatusChange,
  onReset
}: QuestionFilterToolbarProps) {
  const hasActiveFilters = searchQuery !== '' || typeFilter !== 'ALL' || difficultyFilter !== 'ALL' || statusFilter !== 'ALL';

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
      <div className="flex flex-1 flex-wrap items-center gap-3 min-w-[280px]">
        <QuestionSearchBar value={searchQuery} onChange={onSearchChange} />

        <div className="flex flex-wrap items-center gap-2">
          <Select value={typeFilter} onValueChange={(val) => onTypeChange(val as QuestionType | 'ALL')}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Question Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="MCQ_SINGLE">MCQ (Single)</SelectItem>
              <SelectItem value="MCQ_MULTIPLE">MCQ (Multiple)</SelectItem>
              <SelectItem value="TRUE_FALSE">True / False</SelectItem>
              <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
              <SelectItem value="LONG_ANSWER">Long Essay</SelectItem>
              <SelectItem value="NUMERICAL">Numerical</SelectItem>
              <SelectItem value="CODE_SNIPPET">Code Problem</SelectItem>
              <SelectItem value="FILE_UPLOAD">File Upload</SelectItem>
              <SelectItem value="MATCHING">Matching Pairs</SelectItem>
              <SelectItem value="ORDERING">Ordering Sequence</SelectItem>
            </SelectContent>
          </Select>

          <Select value={difficultyFilter} onValueChange={(val) => onDifficultyChange(val as DifficultyLevel | 'ALL')}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Difficulty</SelectItem>
              <SelectItem value="EASY">Easy</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HARD">Hard</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(val) => onStatusChange(val as QuestionApprovalStatus | 'ALL')}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PENDING_REVIEW">In Review</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
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
