import { create } from 'zustand';
import { CandidateSessionEntity, SessionLifecycleState } from '@/types/session';

interface SessionState {
  activeSession: CandidateSessionEntity | null;
  state: SessionLifecycleState;
  remainingSeconds: number;
  isHeartbeatAlive: boolean;
  setActiveSession: (session: CandidateSessionEntity | null) => void;
  updateState: (state: SessionLifecycleState) => void;
  setRemainingSeconds: (seconds: number) => void;
  setHeartbeatAlive: (isAlive: boolean) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>()((set) => ({
  activeSession: null,
  state: 'NOT_STARTED',
  remainingSeconds: 0,
  isHeartbeatAlive: true,

  setActiveSession: (activeSession) => set({
    activeSession,
    state: activeSession?.state || 'NOT_STARTED',
    remainingSeconds: activeSession?.remainingSeconds || 0
  }),
  updateState: (state) => set({ state }),
  setRemainingSeconds: (remainingSeconds) => set({ remainingSeconds }),
  setHeartbeatAlive: (isHeartbeatAlive) => set({ isHeartbeatAlive }),
  clearSession: () => set({ activeSession: null, state: 'NOT_STARTED', remainingSeconds: 0, isHeartbeatAlive: true })
}));
