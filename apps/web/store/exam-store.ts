import { create } from 'zustand';
import { ExamType, ExamStatus } from '@/types/exam';

interface ExamStoreState {
  searchQuery: string;
  typeFilter: ExamType | 'ALL';
  statusFilter: ExamStatus | 'ALL';
  page: number;
  limit: number;

  selectedExamIds: string[];

  isPublishDialogOpen: boolean;
  isArchiveDialogOpen: boolean;
  isCloneDialogOpen: boolean;
  activeExamId: string | null;

  setSearchQuery: (q: string) => void;
  setTypeFilter: (t: ExamType | 'ALL') => void;
  setStatusFilter: (s: ExamStatus | 'ALL') => void;
  setPage: (p: number) => void;
  resetFilters: () => void;

  toggleSelectExam: (id: string) => void;
  selectAllExams: (ids: string[]) => void;
  clearSelection: () => void;

  setPublishDialogOpen: (open: boolean, examId?: string) => void;
  setArchiveDialogOpen: (open: boolean, examId?: string) => void;
  setCloneDialogOpen: (open: boolean, examId?: string) => void;
}

export const useExamStore = create<ExamStoreState>((set) => ({
  searchQuery: '',
  typeFilter: 'ALL',
  statusFilter: 'ALL',
  page: 1,
  limit: 20,

  selectedExamIds: [],

  isPublishDialogOpen: false,
  isArchiveDialogOpen: false,
  isCloneDialogOpen: false,
  activeExamId: null,

  setSearchQuery: (q) => set({ searchQuery: q, page: 1 }),
  setTypeFilter: (t) => set({ typeFilter: t, page: 1 }),
  setStatusFilter: (s) => set({ statusFilter: s, page: 1 }),
  setPage: (p) => set({ page: p }),
  resetFilters: () =>
    set({
      searchQuery: '',
      typeFilter: 'ALL',
      statusFilter: 'ALL',
      page: 1
    }),

  toggleSelectExam: (id) =>
    set((state) => ({
      selectedExamIds: state.selectedExamIds.includes(id)
        ? state.selectedExamIds.filter((i) => i !== id)
        : [...state.selectedExamIds, id]
    })),
  selectAllExams: (ids) => set({ selectedExamIds: ids }),
  clearSelection: () => set({ selectedExamIds: [] }),

  setPublishDialogOpen: (open, examId = undefined) =>
    set({ isPublishDialogOpen: open, activeExamId: examId || null }),
  setArchiveDialogOpen: (open, examId = undefined) =>
    set({ isArchiveDialogOpen: open, activeExamId: examId || null }),
  setCloneDialogOpen: (open, examId = undefined) =>
    set({ isCloneDialogOpen: open, activeExamId: examId || null })
}));
