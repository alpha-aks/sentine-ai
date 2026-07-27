export interface MockProctoringEvidence {
  eventId: string;
  sessionId: string;
  candidateName: string;
  eventType: 'FACE_LOST' | 'MULTIPLE_PERSONS' | 'PHONE_DETECTED' | 'GAZE_DEVIATION' | 'TAB_SWITCH';
  confidenceScore: number;
  suspicionLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  snapshotUrl: string;
  occurredAt: string;
}

export const MOCK_AI_ANALYTICS_EVIDENCE: MockProctoringEvidence[] = [
  {
    eventId: 'ev_101',
    sessionId: 'session_demo_101',
    candidateName: 'Tanishq Sharma',
    eventType: 'GAZE_DEVIATION',
    confidenceScore: 0.94,
    suspicionLevel: 'MEDIUM',
    snapshotUrl: 'https://assets.sentinelai.io/evidence/ev_101.jpg',
    occurredAt: '2026-07-26T18:22:10Z'
  },
  {
    eventId: 'ev_102',
    sessionId: 'session_demo_101',
    candidateName: 'Tanishq Sharma',
    eventType: 'MULTIPLE_PERSONS',
    confidenceScore: 0.88,
    suspicionLevel: 'HIGH',
    snapshotUrl: 'https://assets.sentinelai.io/evidence/ev_102.jpg',
    occurredAt: '2026-07-26T18:35:40Z'
  }
];

export const MOCK_DASHBOARD_STATS = {
  totalInstitutions: 12,
  activeExams: 8,
  totalUsers: 1450,
  activeProctoredSessions: 42,
  avgIntegrityScore: 98.4,
  criticalViolations24h: 3
};
