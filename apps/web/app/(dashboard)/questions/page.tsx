'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { QuestionTable } from '@/components/questions/question-table';
import { QuestionFilterToolbar } from '@/components/questions/filter-toolbar';
import { QuestionEntity } from '@/types/question';
import { questionService } from '@/services/question.service';
import { useQuestionStore } from '@/store/question-store';
import { Plus, RefreshCw, Upload, Download, Folder, Tag, Layers } from 'lucide-react';

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<QuestionEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const {
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    difficultyFilter,
    setDifficultyFilter,
    statusFilter,
    setStatusFilter,
    resetFilters,
    selectedQuestionIds,
    toggleSelectQuestion,
    selectAllQuestions
  } = useQuestionStore();

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const res = await questionService.searchQuestions({
        query: searchQuery,
        type: typeFilter,
        difficulty: difficultyFilter,
        status: statusFilter
      });
      setQuestions(res.items);
    } catch {
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [searchQuery, typeFilter, difficultyFilter, statusFilter]);

  const handleApprove = async (id: string) => {
    await questionService.updateApprovalStatus(id, 'APPROVED');
    fetchQuestions();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      await questionService.deleteQuestion(id);
      fetchQuestions();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Question Bank Repository"
        description="Author, organize, approve, and pool multi-format examination questions"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchQuestions}>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/questions/import">
                <Upload className="mr-2 h-4 w-4" /> Batch Import
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/questions/export">
                <Download className="mr-2 h-4 w-4" /> Export
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/questions/new">
                <Plus className="mr-2 h-4 w-4" /> Author Question
              </Link>
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2 border-b pb-4 text-xs font-semibold">
        <Link href="/questions/pools" className="px-3 py-1.5 rounded-md border bg-card hover:bg-muted/40 transition-colors flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-primary" /> Question Pools
        </Link>
        <Link href="/questions/categories" className="px-3 py-1.5 rounded-md border bg-card hover:bg-muted/40 transition-colors flex items-center gap-1.5">
          <Folder className="h-3.5 w-3.5 text-primary" /> Categories Taxonomy
        </Link>
        <Link href="/questions/tags" className="px-3 py-1.5 rounded-md border bg-card hover:bg-muted/40 transition-colors flex items-center gap-1.5">
          <Tag className="h-3.5 w-3.5 text-primary" /> Question Tags
        </Link>
        <Link href="/questions/preview" className="px-3 py-1.5 rounded-md border bg-card hover:bg-muted/40 transition-colors flex items-center gap-1.5 ml-auto">
          Candidate Simulation Preview
        </Link>
      </div>

      <QuestionFilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        difficultyFilter={difficultyFilter}
        onDifficultyChange={setDifficultyFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onReset={resetFilters}
      />

      <QuestionTable
        questions={questions}
        selectedIds={selectedQuestionIds}
        onToggleSelect={toggleSelectQuestion}
        onSelectAll={selectAllQuestions}
        onApprove={handleApprove}
        onDelete={handleDelete}
        isLoading={isLoading}
      />
    </div>
  );
}
