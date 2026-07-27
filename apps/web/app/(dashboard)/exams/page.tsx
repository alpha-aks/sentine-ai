'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { ExamTable } from '@/components/exams/exam-table';
import { ExamFilterToolbar } from '@/components/exams/filter-toolbar';
import { PublishDialog } from '@/components/exams/publish-dialog';
import { ArchiveDialog } from '@/components/exams/archive-dialog';
import { CloneDialog } from '@/components/exams/clone-dialog';
import { ExamEntity } from '@/types/exam';
import { examService } from '@/services/exam.service';
import { useExamStore } from '@/store/exam-store';
import { Plus, RefreshCw } from 'lucide-react';

export default function ExamsPage() {
  const [exams, setExams] = useState<ExamEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const {
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    resetFilters,
    selectedExamIds,
    toggleSelectExam,
    selectAllExams,
    isPublishDialogOpen,
    setPublishDialogOpen,
    isArchiveDialogOpen,
    setArchiveDialogOpen,
    isCloneDialogOpen,
    setCloneDialogOpen,
    activeExamId
  } = useExamStore();

  const fetchExams = async () => {
    setIsLoading(true);
    try {
      const res = await examService.searchExams({
        query: searchQuery,
        type: typeFilter,
        status: statusFilter
      });
      setExams(res.items);
    } catch {
      setExams([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [searchQuery, typeFilter, statusFilter]);

  const handleConfirmPublish = async () => {
    if (!activeExamId) return;
    await examService.publishExam(activeExamId);
    fetchExams();
  };

  const handleConfirmArchive = async () => {
    if (!activeExamId) return;
    await examService.archiveExam(activeExamId);
    fetchExams();
  };

  const handleConfirmDuplicate = async () => {
    if (!activeExamId) return;
    await examService.duplicateExam(activeExamId);
    fetchExams();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this exam draft?')) {
      await examService.deleteExam(id);
      fetchExams();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exam Management"
        description="Author exams, configure proctoring security rules, schedule windows, and publish assessments"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchExams}>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
            <Button size="sm" asChild>
              <Link href="/exams/new">
                <Plus className="mr-2 h-4 w-4" /> Create Exam Specification
              </Link>
            </Button>
          </div>
        }
      />

      <ExamFilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onReset={resetFilters}
      />

      <ExamTable
        exams={exams}
        selectedIds={selectedExamIds}
        onToggleSelect={toggleSelectExam}
        onSelectAll={selectAllExams}
        onPublish={(id) => setPublishDialogOpen(true, id)}
        onArchive={(id) => setArchiveDialogOpen(true, id)}
        onDuplicate={(id) => setCloneDialogOpen(true, id)}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <PublishDialog open={isPublishDialogOpen} onOpenChange={setPublishDialogOpen} onConfirm={handleConfirmPublish} />
      <ArchiveDialog open={isArchiveDialogOpen} onOpenChange={setArchiveDialogOpen} onConfirm={handleConfirmArchive} />
      <CloneDialog open={isCloneDialogOpen} onOpenChange={setCloneDialogOpen} onConfirm={handleConfirmDuplicate} />
    </div>
  );
}
