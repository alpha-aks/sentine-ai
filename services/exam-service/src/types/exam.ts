import { SensitivityProfile } from '@sentinel-ai/types';

export type ExamType = 'QUIZ' | 'MIDTERM' | 'FINAL_EXAM' | 'CERTIFICATION' | 'PRACTICE';
export type ExamStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ACTIVE' | 'ENDED' | 'CANCELLED' | 'ARCHIVED';
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD' | 'ADAPTIVE';
export type LateEntryPolicy = 'STRICT_NO_LATE' | 'GRACE_PERIOD' | 'ALLOWED_WITH_PENALTY';
export type RecordingPolicy = 'FULL_RECORDING' | 'EVENT_ONLY' | 'NONE';

export interface ExamEntity {
  examId: string;
  institutionId: string;
  code: string;
  title: string;
  description: string | null;
  type: ExamType;
  status: ExamStatus;
  difficultyLevel: DifficultyLevel;
  totalDurationMinutes: number;
  totalPoints: number;
  passingPercentage: number;
  maxAttemptsAllowed: number;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExamSectionEntity {
  sectionId: string;
  examId: string;
  title: string;
  instructions: string | null;
  durationMinutes: number | null;
  questionPoolId: string | null;
  weightPercentage: number;
  isMandatory: boolean;
  isRandomized: boolean;
  sequenceOrder: number;
}

export interface ExamRuleEntity {
  ruleId: string;
  examId: string;
  browserLockEnabled: boolean;
  fullscreenRequired: boolean;
  tabSwitchDetection: boolean;
  copyPasteRestricted: boolean;
  multiMonitorBlocked: boolean;
  virtualMachineBlocked: boolean;
  devToolsBlocked: boolean;
  calculatorAllowed: boolean;
  externalResourcesAllowed: boolean;
  microphoneRequired: boolean;
  cameraRequired: boolean;
  screenSharingRequired: boolean;
  idleTimeoutMinutes: number;
  lateEntryGraceMinutes: number;
  autoSubmitOnTimeUp: boolean;
  networkReconnectionTimeoutSeconds: number;
}

export interface ExamPolicyEntity {
  policyId: string;
  examId: string;
  visionMonitoring: boolean;
  behaviorMonitoring: boolean;
  collusionDetection: boolean;
  sensitivityProfile: SensitivityProfile;
  riskThresholdPercentage: number;
  videoRecordingPolicy: RecordingPolicy;
  audioRecordingPolicy: RecordingPolicy;
  evidenceRetentionDays: number;
  humanReviewRequired: boolean;
}

export interface ExamScheduleEntity {
  scheduleId: string;
  examId: string;
  startTime: string;
  endTime: string;
  registrationWindowStart: string;
  registrationWindowEnd: string;
  timezone: string;
  lateEntryPolicy: LateEntryPolicy;
  gracePeriodMinutes: number;
}

export interface ExamEligibilityEntity {
  eligibilityId: string;
  examId: string;
  allowedDepartmentIds: string[];
  allowedCourseIds: string[];
  allowedProgramIds: string[];
  allowedBatchIds: string[];
  candidateWhitelist: string[];
  candidateBlacklist: string[];
}

export interface ExamConfigurationEntity {
  configurationId: string;
  examId: string;
  instructions: string;
  language: string;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showResultsImmediately: boolean;
}

export interface ExamTemplateEntity {
  templateId: string;
  institutionId: string;
  name: string;
  description: string | null;
  createdById: string;
  createdAt: string;
}

export interface ExamPublicationEntity {
  publicationId: string;
  examId: string;
  publishedById: string;
  publishedAt: string;
  approvalNotes: string | null;
}

// Request & Response DTOs
export interface CreateExamDto {
  institutionId: string;
  code: string;
  title: string;
  description?: string;
  type?: ExamType;
  difficultyLevel?: DifficultyLevel;
  totalDurationMinutes: number;
  totalPoints?: number;
  passingPercentage?: number;
  maxAttemptsAllowed?: number;
  sections?: ExamSectionDto[];
  rules?: Partial<ExamRuleEntity>;
  policy?: Partial<ExamPolicyEntity>;
  eligibility?: Partial<ExamEligibilityEntity>;
}

export interface UpdateExamDto {
  title?: string;
  description?: string;
  type?: ExamType;
  difficultyLevel?: DifficultyLevel;
  totalDurationMinutes?: number;
  totalPoints?: number;
  passingPercentage?: number;
  maxAttemptsAllowed?: number;
}

export interface ExamSectionDto {
  title: string;
  instructions?: string;
  durationMinutes?: number;
  questionPoolId?: string;
  weightPercentage?: number;
  isMandatory?: boolean;
  isRandomized?: boolean;
  sequenceOrder?: number;
}

export interface ScheduleExamDto {
  startTime: string;
  endTime: string;
  registrationWindowStart?: string;
  registrationWindowEnd?: string;
  timezone?: string;
  lateEntryPolicy?: LateEntryPolicy;
  gracePeriodMinutes?: number;
}

export interface EligibilityCriteriaDto {
  allowedDepartmentIds?: string[];
  allowedCourseIds?: string[];
  allowedProgramIds?: string[];
  allowedBatchIds?: string[];
  candidateWhitelist?: string[];
  candidateBlacklist?: string[];
}

export interface ExamSearchQueryDto {
  institutionId?: string;
  query?: string;
  type?: ExamType;
  status?: ExamStatus;
  page?: number;
  limit?: number;
}

export interface ExamResponseDto {
  exam: ExamEntity;
  sections?: ExamSectionEntity[];
  rules?: ExamRuleEntity;
  policy?: ExamPolicyEntity;
  schedule?: ExamScheduleEntity;
  eligibility?: ExamEligibilityEntity;
  configuration?: ExamConfigurationEntity;
  publication?: ExamPublicationEntity;
}
