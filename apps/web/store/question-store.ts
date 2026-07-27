import { create } from 'zustand';
import { QuestionType, DifficultyLevel, QuestionApprovalStatus } from '@/types/question';

interface QuestionStoreState {
  searchQuery: string;
  typeFilter: QuestionType | 'ALL';
  difficultyFilter: DifficultyLevel | 'ALL';
  statusFilter: QuestionApprovalStatus | 'ALL';
  categoryFilter: string | 'ALL';
  tagFilter: string | 'ALL';
  page: number;
  limit: number;

  selectedQuestionIds: string[];

  setSearchQuery: (q: string) => void;
  setTypeFilter: (t: QuestionType | 'ALL') => void;
  setDifficultyFilter: (d: DifficultyLevel | 'ALL') => void;
  setStatusFilter: (s: QuestionApprovalStatus | 'ALL') => void;
  setCategoryFilter: (c: string | 'ALL') => void;
  setTagFilter: (tg: string | 'ALL') => void;
  setPage: (p: number) => void;
  resetFilters: () => void;

  toggleSelectQuestion: (id: string) => void;
  selectAllQuestions: (ids: string[]) => void;
  clearSelection: () => void;
}

export const useQuestionStore = create<QuestionStoreState>((set) => ({
  searchQuery: '',
  typeFilter: 'ALL',
  difficultyFilter: 'ALL',
  statusFilter: 'ALL',
  categoryFilter: 'ALL',
  tagFilter: 'ALL',
  page: 1,
  limit: 20,

  selectedQuestionIds: [],

  setSearchQuery: (q) => set({ searchQuery: q, page: 1 }),
  setTypeFilter: (t) => set({ typeFilter: t, page: 1 }),
  setDifficultyFilter: (d) => set({ difficultyFilter: d, page: 1 }),
  setStatusFilter: (s) => set({ statusFilter: s, page: 1 }),
  setCategoryFilter: (c) => set({ categoryFilter: c, page: 1 }),
  setTagFilter: (tg) => set({ tagFilter: tg, page: 1 }),
  setPage: (p) => set({ page: p }),
  resetFilters: () =>
    set({
      searchQuery: '',
      typeFilter: 'ALL',
      difficultyFilter: 'ALL',
      statusFilter: 'ALL',
      categoryFilter: 'ALL',
      tagFilter: 'ALL',
      page: 1
    }),

  toggleSelectQuestion: (id) =>
    set((state) => ({
      selectedQuestionIds: state.selectedQuestionIds.includes(id)
        ? state.selectedQuestionIds.filter((i) => i !== id)
        : [...state.selectedQuestionIds, id]
    })),
  selectAllQuestions: (ids) => set({ selectedQuestionIds: ids }),
  clearSelection: () => set({ selectedQuestionIds: [] })
}));
