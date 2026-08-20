export type UserRole =
  'CANDIDATE' | 'LIVE_PROCTOR' | 'PROCTOR_SUPERVISOR' | 'EXAM_ADMIN' | 'COMPLIANCE_OFFICER';

export interface User {
  userId: string;
  institutionId: string;
  email: string;
  fullName: string;
  role: UserRole;
  accommodations?: string[];
}

export type SensitivityProfile = 'STRICT' | 'STANDARD' | 'LOW' | 'CUSTOM';

export interface AgentWeights {
  vision: number;
  behavior: number;
  collusion: number;
  risk: number;
}

export interface RiskThresholds {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface ExamPolicy {
  policyId: string;
  examId: string;
  sensitivityProfile: SensitivityProfile;
  agentWeights: AgentWeights;
  riskThresholds: RiskThresholds;
  enabledAgents: {
    visionGuard: boolean;
    behavioralAnalyst: boolean;
    collusionDetection: boolean;
    riskPrediction: boolean;
  };
}

export interface Question {
  questionId: string;
  text: string;
  options?: string[];
  correctAnswer?: string;
  type: 'MULTIPLE_CHOICE' | 'ESSAY';
}

export interface Exam {
  examId: string;
  institutionId: string;
  code: string;
  title: string;
  description: string;
  durationMinutes: number;
  questions: Question[];
  policy: ExamPolicy;
}

export type SessionStatus =
  'SCHEDULED' | 'VERIFYING' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'TERMINATED';

export interface CandidateSubmission {
  questionId: string;
  answerText: string;
  selectedOptions?: string[];
  updatedAt: string;
}

export interface ExamSession {
  sessionId: string;
  examId: string;
  candidateId: string;
  candidateName: string;
  status: SessionStatus;
  currentRiskScore: number;
  startedAt?: string;
  endedAt?: string;
  submissions: Record<string, CandidateSubmission>;
}

export interface TelemetryVector {
  sessionId: string;
  timestamp: string;
  gazeX?: number; // [-1.0, 1.0]
  gazeY?: number; // [-1.0, 1.0]
  headYaw?: number; // degrees
  headPitch?: number; // degrees
  personCount?: number;
  detectedObjects?: string[];
  keystrokeDwellMs?: number;
  keystrokeFlightMs?: number;
  mouseLinearityR2?: number;
  pastedLength?: number;
  speechDetected?: boolean;
  whisperDetected?: boolean;
  windowBlur?: boolean;
  wifiCollusionFlag?: boolean;
  wifiCollusionDetail?: string;
  cameraBlocked?: boolean;
  cameraLost?: boolean;
  frameFreezeDetected?: boolean;
  fullscreenExit?: boolean;
  tabSwitchCount?: number;
  copyCount?: number;
  pasteCount?: number;
  idleTimeSeconds?: number;
  rapidAnswerChange?: boolean;
}

export interface VisionSignal {
  agentId: 'VISION_GUARD';
  timestamp: string;
  confidence: number;
  offscreenGazeFlag: boolean;
  headPoseAnomaly: boolean;
  personCount: number;
  detectedDevices: string[];
  cameraTamperFlag: boolean;
}

export interface BehaviorSignal {
  agentId: 'BEHAVIORAL_ANALYST';
  timestamp: string;
  confidence: number;
  keystrokeAnomalyScore: number;
  mouseRoboticScore: number;
  largePasteFlag: boolean;
  windowBlurFlag: boolean;
  fullscreenExitFlag?: boolean;
  tabSwitchCount?: number;
  idleTimeFlag?: boolean;
  rapidAnswerFlag?: boolean;
}

export interface CollusionSignal {
  agentId: 'COLLUSION_DETECTION';
  timestamp: string;
  confidence: number;
  speechDetected: boolean;
  whisperDetected: boolean;
  essaySimilarityScore: number;
  wifiCollusionFlag?: boolean;
  wifiCollusionDetail?: string;
}

export type AlertLevel = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface DynamicRiskState {
  currentRiskScore: number; // [0.00, 1.00]
  riskVelocity: number;
  primaryRiskDriver: string;
}

export interface OrchestratedDecision {
  decisionId: string;
  sessionId: string;
  timestamp: string;
  finalRiskScore: number;
  alertLevel: AlertLevel;
  correlatedEvidence: string[];
  naturalLanguageExplanation: string;
  recommendedAction: string;
  visionSignal?: VisionSignal;
  behaviorSignal?: BehaviorSignal;
  collusionSignal?: CollusionSignal;
}

export type AlertStatus = 'PENDING' | 'DISMISSED' | 'WARNED' | 'ESCALATED';

export interface Alert {
  alertId: string;
  sessionId: string;
  candidateName: string;
  alertLevel: AlertLevel;
  riskScore: number;
  explainabilityText: string;
  status: AlertStatus;
  createdAt: string;
  evidenceId?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
}

export interface EvidenceMedia {
  evidenceId: string;
  alertId: string;
  sessionId: string;
  s3ObjectKey: string;
  mediaType: 'VIDEO_WEBCAM_SNIPPET' | 'SCREEN_CAPTURE' | 'AUDIO_WAV';
  durationSeconds: number;
  videoUrl?: string;
  snapshotUrl?: string;
}

export interface AuditLogEntry {
  logId: string;
  institutionId: string;
  timestamp: string;
  userId: string;
  action: string;
  payload: Record<string, any>;
  prevEntryHash: string;
  entryHash: string;
}
