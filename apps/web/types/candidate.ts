import { SessionLifecycleState, ViolationType, DisconnectReason } from './session';

export interface SystemDiagnosticCheckResult {
  browserSupported: boolean;
  browserName: string;
  browserVersion: string;
  cameraAvailable: boolean;
  cameraPermission: 'granted' | 'denied' | 'prompt' | 'unknown';
  microphoneAvailable: boolean;
  microphonePermission: 'granted' | 'denied' | 'prompt' | 'unknown';
  internetConnected: boolean;
  downloadSpeedMbps: number;
  webRtcSupported: boolean;
  screenResolution: string;
  colorDepth: number;
  cookiesEnabled: boolean;
  localStorageEnabled: boolean;
  fullscreenCapable: boolean;
  overallPassed: boolean;
}

export interface CandidateExamSummary {
  examId: string;
  title: string;
  code: string;
  courseName: string;
  institutionName: string;
  scheduledStartAt: string;
  scheduledEndAt: string;
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'MISSED';
  sessionId?: string;
  proctoringEnabled: boolean;
}

export interface CandidateIdentityRecord {
  sessionId: string;
  candidateId: string;
  faceCaptureUrl?: string;
  idDocumentUrl?: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verifiedAt?: string;
}

export interface CandidateQuestionAnswer {
  questionId: string;
  selectedOptionId?: string;
  selectedOptionIds?: string[];
  textAnswer?: string;
  codeAnswer?: string;
  fileUrl?: string;
  matchingPairs?: Record<string, string>;
  orderedSequence?: string[];
  isAnswered: boolean;
  isMarkedForReview: boolean;
  savedAt: string;
}
