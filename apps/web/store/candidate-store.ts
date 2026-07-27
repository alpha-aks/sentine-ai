import { create } from 'zustand';
import { CandidateQuestionAnswer } from '@/types/candidate';
import { SessionLifecycleState, ViolationType } from '@/types/session';

interface CandidateState {
  sessionId: string | null;
  examId: string | null;
  sessionState: SessionLifecycleState;
  currentQuestionIndex: number;
  currentSectionIndex: number;
  answers: Record<string, CandidateQuestionAnswer>;
  markedQuestionIds: string[];
  remainingSeconds: number;
  isFullscreen: boolean;
  isOnline: boolean;
  sidebarOpen: boolean;
  violations: Array<{ id: string; type: ViolationType; message: string; timestamp: string }>;

  // Actions
  setSessionContext: (sessionId: string, examId: string, durationSeconds: number) => void;
  setSessionState: (state: SessionLifecycleState) => void;
  setQuestionIndex: (idx: number) => void;
  setSectionIndex: (idx: number) => void;
  saveAnswer: (questionId: string, answer: Partial<CandidateQuestionAnswer>) => void;
  toggleMarkForReview: (questionId: string) => void;
  setRemainingSeconds: (sec: number | ((prev: number) => number)) => void;
  setIsFullscreen: (val: boolean) => void;
  setIsOnline: (val: boolean) => void;
  toggleSidebar: () => void;
  addViolation: (type: ViolationType, message: string) => void;
  resetStore: () => void;
}

export const useCandidateStore = create<CandidateState>((set) => ({
  sessionId: null,
  examId: null,
  sessionState: 'NOT_STARTED',
  currentQuestionIndex: 0,
  currentSectionIndex: 0,
  answers: {},
  markedQuestionIds: [],
  remainingSeconds: 3600,
  isFullscreen: false,
  isOnline: true,
  sidebarOpen: true,
  violations: [],

  setSessionContext: (sessionId, examId, durationSeconds) =>
    set({ sessionId, examId, remainingSeconds: durationSeconds, sessionState: 'WAITING_ROOM' }),

  setSessionState: (sessionState) => set({ sessionState }),
  setQuestionIndex: (currentQuestionIndex) => set({ currentQuestionIndex }),
  setSectionIndex: (currentSectionIndex) => set({ currentSectionIndex, currentQuestionIndex: 0 }),

  saveAnswer: (questionId, answerData) =>
    set((state) => {
      const existing = state.answers[questionId] || {
        questionId,
        isAnswered: false,
        isMarkedForReview: state.markedQuestionIds.includes(questionId),
        savedAt: new Date().toISOString()
      };

      const updated = { ...existing, ...answerData, isAnswered: true, savedAt: new Date().toISOString() };
      return { answers: { ...state.answers, [questionId]: updated } };
    }),

  toggleMarkForReview: (questionId) =>
    set((state) => {
      const exists = state.markedQuestionIds.includes(questionId);
      const updatedMarked = exists
        ? state.markedQuestionIds.filter((id) => id !== questionId)
        : [...state.markedQuestionIds, questionId];

      const existingAns = state.answers[questionId];
      let updatedAnswers = state.answers;
      if (existingAns) {
        updatedAnswers = {
          ...state.answers,
          [questionId]: { ...existingAns, isMarkedForReview: !exists }
        };
      }

      return { markedQuestionIds: updatedMarked, answers: updatedAnswers };
    }),

  setRemainingSeconds: (sec) =>
    set((state) => ({
      remainingSeconds: typeof sec === 'function' ? sec(state.remainingSeconds) : sec
    })),

  setIsFullscreen: (isFullscreen) => set({ isFullscreen }),
  setIsOnline: (isOnline) => set({ isOnline }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  addViolation: (type, message) =>
    set((state) => ({
      violations: [
        ...state.violations,
        { id: `v_${Date.now()}`, type, message, timestamp: new Date().toISOString() }
      ]
    })),

  resetStore: () =>
    set({
      sessionId: null,
      examId: null,
      sessionState: 'NOT_STARTED',
      currentQuestionIndex: 0,
      currentSectionIndex: 0,
      answers: {},
      markedQuestionIds: [],
      remainingSeconds: 3600,
      isFullscreen: false,
      isOnline: true,
      sidebarOpen: true,
      violations: []
    })
}));
