import {
  Alert,
  AuditLogEntry,
  CandidateSubmission,
  Exam,
  ExamPolicy,
  ExamSession,
  OrchestratedDecision,
  TelemetryVector,
  User,
  UserRole
} from '@sentinel-ai/types';
import { generateUuid, sha256Hash } from '@sentinel-ai/utils';

export function createMockUser(overrides?: Partial<User>): User {
  return {
    userId: generateUuid(),
    institutionId: 'inst_mit_001',
    email: 'candidate.test@example.com',
    fullName: 'Jane Candidate Doe',
    role: 'CANDIDATE',
    accommodations: [],
    ...overrides
  };
}

export function createMockExamPolicy(overrides?: Partial<ExamPolicy>): ExamPolicy {
  const policyId = generateUuid();
  return {
    policyId,
    examId: generateUuid(),
    sensitivityProfile: 'STANDARD',
    agentWeights: {
      vision: 0.35,
      behavior: 0.25,
      collusion: 0.25,
      risk: 0.15
    },
    riskThresholds: {
      low: 0.25,
      medium: 0.5,
      high: 0.75,
      critical: 0.9
    },
    enabledAgents: {
      visionGuard: true,
      behavioralAnalyst: true,
      collusionDetection: true,
      riskPrediction: true
    },
    ...overrides
  };
}

export function createMockExam(overrides?: Partial<Exam>): Exam {
  const examId = generateUuid();
  return {
    examId,
    institutionId: 'inst_mit_001',
    code: 'CS-101-FINAL',
    title: 'CS101 Algorithms & Data Structures Final Exam',
    description: 'Comprehensive evaluation of core computational principles.',
    durationMinutes: 120,
    questions: [
      {
        questionId: 'q_001',
        text: 'What is the time complexity of quicksort in the average case?',
        options: ['O(N)', 'O(N log N)', 'O(N^2)', 'O(1)'],
        correctAnswer: 'O(N log N)',
        type: 'MULTIPLE_CHOICE'
      },
      {
        questionId: 'q_002',
        text: 'Explain the difference between optimistic and pessimistic concurrency control.',
        type: 'ESSAY'
      }
    ],
    policy: createMockExamPolicy({ examId }),
    ...overrides
  };
}

export function createMockCandidateSubmission(
  overrides?: Partial<CandidateSubmission>
): CandidateSubmission {
  return {
    questionId: 'q_001',
    answerText: 'O(N log N)',
    selectedOptions: ['O(N log N)'],
    updatedAt: new Date().toISOString(),
    ...overrides
  };
}

export function createMockExamSession(overrides?: Partial<ExamSession>): ExamSession {
  const sessionId = generateUuid();
  return {
    sessionId,
    examId: generateUuid(),
    candidateId: generateUuid(),
    candidateName: 'Jane Candidate Doe',
    status: 'IN_PROGRESS',
    currentRiskScore: 0.12,
    startedAt: new Date(Date.now() - 1800000).toISOString(),
    submissions: {
      q_001: createMockCandidateSubmission()
    },
    ...overrides
  };
}

export function createMockTelemetryVector(overrides?: Partial<TelemetryVector>): TelemetryVector {
  return {
    sessionId: generateUuid(),
    timestamp: new Date().toISOString(),
    gazeX: 0.05,
    gazeY: -0.02,
    headYaw: 2.1,
    headPitch: -1.0,
    personCount: 1,
    detectedObjects: ['laptop', 'pen', 'paper'],
    keystrokeDwellMs: 110,
    keystrokeFlightMs: 140,
    mouseLinearityR2: 0.94,
    pastedLength: 0,
    speechDetected: false,
    whisperDetected: false,
    windowBlur: false,
    ...overrides
  };
}

export function createMockAlert(overrides?: Partial<Alert>): Alert {
  return {
    alertId: generateUuid(),
    sessionId: generateUuid(),
    candidateName: 'Jane Candidate Doe',
    alertLevel: 'MEDIUM',
    riskScore: 0.65,
    explainabilityText:
      'Offscreen gaze detected for > 15s continuously with second person in frame.',
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    ...overrides
  };
}

export function createMockOrchestratedDecision(
  overrides?: Partial<OrchestratedDecision>
): OrchestratedDecision {
  return {
    decisionId: generateUuid(),
    sessionId: generateUuid(),
    timestamp: new Date().toISOString(),
    finalRiskScore: 0.82,
    alertLevel: 'HIGH',
    correlatedEvidence: ['EV_VISION_GAZE_ANOMALY', 'EV_BEHAVIOR_PASTE_EVENT'],
    naturalLanguageExplanation: 'High probability of unauthorized notes usage detected.',
    recommendedAction: 'WARN_CANDIDATE',
    visionSignal: {
      agentId: 'VISION_GUARD',
      timestamp: new Date().toISOString(),
      confidence: 0.91,
      offscreenGazeFlag: true,
      headPoseAnomaly: true,
      personCount: 1,
      detectedDevices: ['smartphone'],
      cameraTamperFlag: false
    },
    behaviorSignal: {
      agentId: 'BEHAVIORAL_ANALYST',
      timestamp: new Date().toISOString(),
      confidence: 0.88,
      keystrokeAnomalyScore: 0.75,
      mouseRoboticScore: 0.1,
      largePasteFlag: true,
      windowBlurFlag: false
    },
    ...overrides
  };
}

export function createMockAuditLogEntry(overrides?: Partial<AuditLogEntry>): AuditLogEntry {
  const logId = generateUuid();
  const timestamp = new Date().toISOString();
  const userId = generateUuid();
  const action = 'SESSION_TERMINATED';
  const payload = { reason: 'Severe malpractice detected' };
  const prevEntryHash = '0000000000000000000000000000000000000000000000000000000000000000';
  const entryHash = sha256Hash(`${logId}:${timestamp}:${userId}:${action}:${prevEntryHash}`);

  return {
    logId,
    institutionId: 'inst_mit_001',
    timestamp,
    userId,
    action,
    payload,
    prevEntryHash,
    entryHash,
    ...overrides
  };
}

// Preset Test Fixtures
export const STRICT_EXAM_FIXTURE = createMockExam({
  title: 'Strict High-Stakes Certification Exam',
  policy: createMockExamPolicy({
    sensitivityProfile: 'STRICT',
    riskThresholds: { low: 0.15, medium: 0.35, high: 0.6, critical: 0.8 }
  })
});

export const CRITICAL_ALERT_FIXTURE = createMockAlert({
  alertLevel: 'CRITICAL',
  riskScore: 0.95,
  explainabilityText: 'Secondary person detected taking exam on behalf of candidate.',
  status: 'PENDING'
});

export const SUSPICIOUS_TELEMETRY_FIXTURE = createMockTelemetryVector({
  gazeX: -0.92,
  gazeY: 0.85,
  personCount: 2,
  detectedObjects: ['cell phone'],
  speechDetected: true,
  whisperDetected: true,
  pastedLength: 520,
  windowBlur: true
});
