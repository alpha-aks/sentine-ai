import { CandidateSessionEntity, SessionViolationEntity } from '@/types/session';

export const MOCK_CANDIDATE_SESSIONS: CandidateSessionEntity[] = [
  {
    sessionId: 'session_demo_101',
    examId: 'ex_101',
    institutionId: 'inst_default',
    candidateId: 'usr_student',
    candidateName: 'Tanishq Sharma',
    candidateEmail: 'student@sentinelai.io',
    state: 'WAITING_ROOM',
    joinedAt: '2026-07-26T17:45:00Z',
    startedAt: null,
    submittedAt: null,
    endedAt: null,
    examDurationSeconds: 5400,
    remainingSeconds: 5400,
    reconnectCount: 0,
    tabSwitchCount: 0,
    fullscreenExitCount: 0,
    violationCount: 0,
    isSuspended: false,
    createdAt: '2026-07-26T17:45:00Z',
    updatedAt: '2026-07-26T17:45:00Z'
  }
];

export const MOCK_VIOLATIONS: SessionViolationEntity[] = [
  {
    violationId: 'viol_101',
    sessionId: 'session_demo_101',
    candidateId: 'usr_student',
    violationType: 'FULLSCREEN_EXIT',
    detail: 'Exited mandatory full-screen lockdown window',
    occurredAt: '2026-07-26T18:15:22Z'
  }
];
