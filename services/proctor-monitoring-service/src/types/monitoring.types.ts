export type CandidateStatus =
  | 'WAITING'
  | 'READY'
  | 'IN_PROGRESS'
  | 'DISCONNECTED'
  | 'PAUSED'
  | 'SUBMITTED'
  | 'COMPLETED'
  | 'TERMINATED'
  | 'SUSPICIOUS';

export type AlertPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertSeverity = 'INFO' | 'WARNING' | 'VIOLATION' | 'CRITICAL';
export type AlertCategory = 'VISION' | 'ACOUSTIC' | 'BEHAVIORAL' | 'COLLUSION' | 'SYSTEM' | 'MANUAL';
export type AlertStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED' | 'ESCALATED';

export type ManualActionType =
  | 'WARN_CANDIDATE'
  | 'PAUSE_SESSION'
  | 'RESUME_SESSION'
  | 'TERMINATE_SESSION'
  | 'REQUEST_IDENTITY_CHECK'
  | 'ADD_MANUAL_NOTE'
  | 'FLAG_SUBMISSION';

export type EvidenceType =
  | 'SCREENSHOT'
  | 'VIDEO_CLIP'
  | 'AUDIO_RECORDING'
  | 'SCREEN_RECORDING'
  | 'BROWSER_EVENT'
  | 'SYSTEM_EVENT'
  | 'MANUAL_EVIDENCE';

export interface RiskSnapshot {
  candidateSessionId: string;
  currentScore: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  latestEventName?: string;
  latestEventTimestamp?: string;
  historySummary: {
    timestamp: string;
    score: number;
    eventName?: string;
  }[];
  updatedAt: string;
}

export interface SessionActivity {
  activityId: string;
  candidateSessionId: string;
  eventType: string;
  description: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface EvidenceMetadata {
  evidenceId: string;
  candidateSessionId: string;
  examId: string;
  type: EvidenceType;
  title: string;
  storageUri: string;
  mimeType: string;
  sizeBytes: number;
  checksum?: string;
  recordedAt: string;
  metadata?: Record<string, any>;
}

export interface AlertEntity {
  alertId: string;
  candidateSessionId: string;
  examId: string;
  institutionId: string;
  title: string;
  description: string;
  priority: AlertPriority;
  severity: AlertSeverity;
  category: AlertCategory;
  status: AlertStatus;
  notes?: string;
  acknowledgedBy?: string;
  resolvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ManualActionRecord {
  actionId: string;
  candidateSessionId: string;
  examId: string;
  institutionId: string;
  proctorId: string;
  actionType: ManualActionType;
  notes?: string;
  timestamp: string;
}

export interface CandidateMonitor {
  candidateSessionId: string;
  examId: string;
  institutionId: string;
  candidateId: string;
  candidateName: string;
  status: CandidateStatus;
  currentQuestionId?: string;
  currentRiskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  lastHeartbeatAt: string;
  isFlagged: boolean;
  manualActionCount: number;
  activeAlertCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface LiveExamMonitor {
  examId: string;
  institutionId: string;
  examCode: string;
  title: string;
  totalCandidates: number;
  inProgressCandidates: number;
  pausedCandidates: number;
  suspiciousCandidates: number;
  terminatedCandidates: number;
  submittedCandidates: number;
  averageRiskScore: number;
  activeAlertsCount: number;
  updatedAt: string;
}
