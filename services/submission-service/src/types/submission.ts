// ─────────────────────────────────────────────────────────────────────────────
// SUBMISSION ENUMS & TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type AnswerType =
  | 'MCQ_SINGLE'
  | 'MCQ_MULTIPLE'
  | 'TRUE_FALSE'
  | 'SHORT_ANSWER'
  | 'LONG_ANSWER'
  | 'NUMERICAL'
  | 'CODE'
  | 'PROGRAMMING'
  | 'CODE_SNIPPET'
  | 'FILL_BLANK'
  | 'FILE_UPLOAD'
  | 'MATCHING'
  | 'ORDERING';

export type SubmissionStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'AUTOSAVED'
  | 'LOCKED'
  | 'SUBMITTED'
  | 'AUTO_SUBMITTED'
  | 'EXPORTED';

export type SaveSource =
  | 'MANUAL'
  | 'AUTOSAVE'
  | 'RECOVERY'
  | 'SYSTEM'
  | 'PROCTOR_FORCE';

export type FileType =
  | 'IMAGE'
  | 'PDF'
  | 'DOCUMENT'
  | 'ZIP'
  | 'SOURCE_CODE'
  | 'OTHER';

// ─────────────────────────────────────────────────────────────────────────────
// ANSWER DATA STRUCTURES
// ─────────────────────────────────────────────────────────────────────────────

export interface McqSingleAnswerData {
  selectedOptionId: string;
}

export interface McqMultipleAnswerData {
  selectedOptionIds: string[];
}

export interface TrueFalseAnswerData {
  value: boolean;
}

export interface TextAnswerData {
  text: string;
  wordCount?: number;
  characterCount?: number;
  format?: 'PLAIN' | 'RICH_TEXT' | 'MARKDOWN';
}

export interface NumericalAnswerData {
  value: number;
  unit?: string;
}

export interface CodeAnswerFile {
  filename: string;
  content: string;
  language: string;
}

export interface CodeAnswerData {
  code: string;
  language: string;
  files?: CodeAnswerFile[];
  starterTemplateId?: string;
  lineCount?: number;
}

export interface FileUploadAnswerData {
  fileIds: string[];
  files?: Array<{
    fileId: string;
    fileName: string;
    fileSizeBytes: number;
    mimeType: string;
  }>;
}

export interface MatchingAnswerData {
  pairs: Array<{ leftId: string; rightId: string }>;
}

export interface OrderingAnswerData {
  orderedIds: string[];
}

export type AnyAnswerData =
  | McqSingleAnswerData
  | McqMultipleAnswerData
  | TrueFalseAnswerData
  | TextAnswerData
  | NumericalAnswerData
  | CodeAnswerData
  | FileUploadAnswerData
  | MatchingAnswerData
  | OrderingAnswerData;

// ─────────────────────────────────────────────────────────────────────────────
// ENTITIES
// ─────────────────────────────────────────────────────────────────────────────

export interface SubmissionEntity {
  submissionId: string;
  sessionId: string;
  examId: string;
  institutionId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  status: SubmissionStatus;
  isLocked: boolean;
  lockedAt: string | null;
  lockedBy: string | null;
  lockReason: string | null;
  totalAnswers: number;
  answeredCount: number;
  flaggedCount: number;
  startedAt: string;
  lastSavedAt: string;
  submittedAt: string | null;
  submittedBy: string | null;
  version: number;
  metaData: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionAnswerEntity {
  answerId: string;
  submissionId: string;
  questionId: string;
  candidateId: string;
  answerType: AnswerType;
  answerData: AnyAnswerData;
  isDraft: boolean;
  isFlagged: boolean;
  version: number;
  timeSpentSeconds?: number;
  lastSavedAt: string;
  lastSaveSource: SaveSource;
}

export interface AnswerVersionEntity {
  versionId: string;
  answerId: string;
  submissionId: string;
  questionId: string;
  candidateId: string;
  versionNumber: number;
  answerType: AnswerType;
  answerData: AnyAnswerData;
  saveSource: SaveSource;
  timestamp: string;
  ipAddress: string | null;
  changeSummary?: string;
}

export interface DraftAnswerEntity {
  draftId: string;
  submissionId: string;
  questionId: string;
  candidateId: string;
  answerType: AnswerType;
  answerData: AnyAnswerData;
  isDirty: boolean;
  clientTimestamp: string;
  sequenceNumber: number;
  timeSpentSeconds?: number;
  updatedAt: string;
}

export interface SubmissionFileEntity {
  fileId: string;
  answerId: string | null;
  submissionId: string;
  candidateId: string;
  fileName: string;
  fileType: FileType;
  fileSizeBytes: number;
  mimeType: string;
  contentHash: string; // SHA-256
  storagePath: string;
  virusScanPassed: boolean;
  uploadedAt: string;
}

export interface SubmissionHistoryEntity {
  historyId: string;
  submissionId: string;
  action: string;
  actorId: string;
  previousStatus: SubmissionStatus | null;
  newStatus: SubmissionStatus;
  timestamp: string;
  reason: string | null;
}

export interface SubmissionAuditEntity {
  auditId: string;
  submissionId: string;
  institutionId: string;
  candidateId: string;
  action: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

export interface SubmissionEventEntity {
  eventId: string;
  submissionId: string;
  eventType: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

export interface SubmissionMetadataEntity {
  metadataId: string;
  submissionId: string;
  deviceInfo: Record<string, unknown>;
  ipAddress: string | null;
  networkStats: Record<string, unknown>;
  totalAutosaves: number;
  totalManualSaves: number;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// REQUEST & RESPONSE DTOs
// ─────────────────────────────────────────────────────────────────────────────

export interface StartSubmissionDto {
  sessionId: string;
  examId: string;
  institutionId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  totalQuestions?: number;
  deviceInfo?: Record<string, unknown>;
}

export interface SaveAnswerDto {
  questionId: string;
  answerType: AnswerType;
  answerData: AnyAnswerData;
  isFlagged?: boolean;
  timeSpentSeconds?: number;
  clientVersion?: number;
  ipAddress?: string;
}

export interface AutosaveDraftDto {
  questionId: string;
  answerType: AnswerType;
  answerData: AnyAnswerData;
  clientTimestamp: string;
  sequenceNumber?: number;
  timeSpentSeconds?: number;
  isFlagged?: boolean;
}

export interface RestoreDraftDto {
  questionId: string;
  targetVersion?: number;
}

export interface RestoreDraftResponseDto {
  submissionId: string;
  questionId: string;
  restoredAnswer: SubmissionAnswerEntity;
  previousDraftCleared: boolean;
}

export interface ReviewSubmissionDto {
  notes?: string;
}

export interface ReviewSubmissionResponseDto {
  submissionId: string;
  status: SubmissionStatus;
  validation: SubmissionValidationResult;
  reviewedAt: string;
}

export interface SubmissionStatusResponseDto {
  submissionId: string;
  status: SubmissionStatus;
  isLocked: boolean;
  totalAnswers: number;
  answeredCount: number;
  flaggedCount: number;
  startedAt: string;
  lastSavedAt: string;
  submittedAt: string | null;
}

export interface SubmissionHistoryResponseDto {
  submissionId: string;
  history: SubmissionHistoryEntity[];
  audits: SubmissionAuditEntity[];
  versions: AnswerVersionEntity[];
}

export interface BatchAutosaveDto {
  drafts: AutosaveDraftDto[];
}

export interface SubmitFinalDto {
  notes?: string;
  ipAddress?: string;
}

export interface AutoSubmitDto {
  reason: 'TIMER_EXPIRED' | 'DISCONNECT_POLICY' | 'TERMINATION' | 'ADMIN_FORCE';
  actorId?: string;
  notes?: string;
}

export interface LockSubmissionDto {
  reason: string;
}

export interface UploadFileDto {
  fileName: string;
  fileType: FileType;
  fileSizeBytes: number;
  mimeType: string;
  contentBase64?: string;
  questionId?: string;
}

export interface SubmissionValidationResult {
  isValid: boolean;
  totalQuestions: number;
  answeredQuestions: number;
  unansweredQuestionIds: string[];
  missingRequiredQuestionIds: string[];
  fileErrors: string[];
  errors: string[];
  warnings: string[];
}

export interface SubmissionAnalyticsDto {
  submissionId: string;
  examId: string;
  candidateId: string;
  status: SubmissionStatus;
  totalAnswers: number;
  answeredCount: number;
  flaggedCount: number;
  completionPercentage: number;
  totalAutosaves: number;
  totalManualSaves: number;
  totalVersions: number;
  totalFilesUploaded: number;
  startedAt: string;
  lastSavedAt: string;
  submittedAt: string | null;
}

export interface SubmissionResponseDto {
  submission: SubmissionEntity;
  answers?: SubmissionAnswerEntity[];
  files?: SubmissionFileEntity[];
  validation?: SubmissionValidationResult;
}
