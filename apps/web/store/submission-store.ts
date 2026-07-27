import { create } from 'zustand';
import { SaveDraftDto } from '@/services/submission.service';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'offline';
export type QuestionFilterMode = 'ALL' | 'ANSWERED' | 'UNANSWERED' | 'REVIEW';

interface SubmissionState {
  // Navigation & Review State
  activeQuestionId: string | null;
  markedForReview: Record<string, boolean>;
  filterMode: QuestionFilterMode;

  // Autosave & Network Indicator State
  saveStatus: SaveStatus;
  lastSavedAt: string | null;
  isOffline: boolean;
  offlineQueue: SaveDraftDto[];
  sequenceTracker: Record<string, number>;

  // Dialog & Modal Controls
  draftRecoveryDialogOpen: boolean;
  unsavedChangesDialogOpen: boolean;
  submitConfirmDialogOpen: boolean;
  isSubmittingFinal: boolean;

  // Actions
  setActiveQuestionId: (questionId: string | null) => void;
  toggleMarkForReview: (questionId: string) => void;
  setFilterMode: (mode: QuestionFilterMode) => void;
  setSaveStatus: (status: SaveStatus, lastSavedAt?: string) => void;
  setIsOffline: (isOffline: boolean) => void;
  addToOfflineQueue: (draft: SaveDraftDto) => void;
  clearOfflineQueue: () => void;
  getNextSequenceNumber: (questionId: string) => number;
  setDraftRecoveryDialogOpen: (open: boolean) => void;
  setUnsavedChangesDialogOpen: (open: boolean) => void;
  setSubmitConfirmDialogOpen: (open: boolean) => void;
  setIsSubmittingFinal: (isSubmitting: boolean) => void;
  resetUIStore: () => void;
}

export const useSubmissionStore = create<SubmissionState>((set, get) => ({
  activeQuestionId: null,
  markedForReview: {},
  filterMode: 'ALL',

  saveStatus: 'idle',
  lastSavedAt: null,
  isOffline: false,
  offlineQueue: [],
  sequenceTracker: {},

  draftRecoveryDialogOpen: false,
  unsavedChangesDialogOpen: false,
  submitConfirmDialogOpen: false,
  isSubmittingFinal: false,

  setActiveQuestionId: (questionId) => set({ activeQuestionId: questionId }),

  toggleMarkForReview: (questionId) =>
    set((state) => {
      const current = Boolean(state.markedForReview[questionId]);
      return {
        markedForReview: {
          ...state.markedForReview,
          [questionId]: !current
        }
      };
    }),

  setFilterMode: (mode) => set({ filterMode: mode }),

  setSaveStatus: (status, lastSavedAt) =>
    set((state) => ({
      saveStatus: status,
      lastSavedAt: lastSavedAt !== undefined ? lastSavedAt : state.lastSavedAt
    })),

  setIsOffline: (isOffline) =>
    set((state) => ({
      isOffline,
      saveStatus: isOffline ? 'offline' : state.saveStatus
    })),

  addToOfflineQueue: (draft) =>
    set((state) => {
      const filtered = state.offlineQueue.filter((item) => item.questionId !== draft.questionId);
      return { offlineQueue: [...filtered, draft] };
    }),

  clearOfflineQueue: () => set({ offlineQueue: [] }),

  getNextSequenceNumber: (questionId) => {
    const current = get().sequenceTracker[questionId] || 0;
    const nextSeq = current + 1;
    set((state) => ({
      sequenceTracker: {
        ...state.sequenceTracker,
        [questionId]: nextSeq
      }
    }));
    return nextSeq;
  },

  setDraftRecoveryDialogOpen: (open) => set({ draftRecoveryDialogOpen: open }),
  setUnsavedChangesDialogOpen: (open) => set({ unsavedChangesDialogOpen: open }),
  setSubmitConfirmDialogOpen: (open) => set({ submitConfirmDialogOpen: open }),
  setIsSubmittingFinal: (isSubmitting) => set({ isSubmittingFinal: isSubmitting }),

  resetUIStore: () =>
    set({
      activeQuestionId: null,
      markedForReview: {},
      filterMode: 'ALL',
      saveStatus: 'idle',
      lastSavedAt: null,
      isOffline: false,
      offlineQueue: [],
      sequenceTracker: {},
      draftRecoveryDialogOpen: false,
      unsavedChangesDialogOpen: false,
      submitConfirmDialogOpen: false,
      isSubmittingFinal: false
    })
}));
