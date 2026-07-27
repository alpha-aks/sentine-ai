// ─────────────────────────────────────────────────────────────────────────────
// Question Service – Core Type Definitions
// ─────────────────────────────────────────────────────────────────────────────

// ── Enumerations ──────────────────────────────────────────────────────────────

export type QuestionType =
  | 'MCQ_SINGLE'
  | 'MCQ_MULTIPLE'
  | 'TRUE_FALSE'
  | 'FILL_BLANK'
  | 'SHORT_ANSWER'
  | 'LONG_ANSWER'
  | 'NUMERICAL'
  | 'CODE_SNIPPET'
  | 'FILE_UPLOAD'
  | 'MATCHING'
  | 'ORDERING';

export type QuestionApprovalStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'ARCHIVED';

export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';

export type PoolStrategy = 'RANDOM' | 'FIXED' | 'WEIGHTED';

export type QuestionFormat = 'JSON' | 'CSV' | 'MARKDOWN' | 'EXCEL';

export type ReusePolicy = 'ALLOW_ALWAYS' | 'RESTRICT_SAME_SESSION' | 'RESTRICT_SAME_CANDIDATE' | 'RESTRICT_GLOBAL';

export type ImportJobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export type ExportJobStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

// ── Entities ──────────────────────────────────────────────────────────────────

export interface QuestionOptionEntity {
  optionId: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
  explanation: string | null;
  sequenceOrder: number;
}

export interface QuestionAttachmentEntity {
  attachmentId: string;
  questionId: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface QuestionEntity {
  questionId: string;
  bankId: string;
  institutionId: string;
  departmentId: string | null;
  courseId: string | null;
  type: QuestionType;
  title: string;
  body: string;
  instructions: string | null;
  status: QuestionApprovalStatus;
  difficulty: DifficultyLevel;
  marks: number;
  negativeMarks: number;
  estimatedTimeSeconds: number;
  hints: string[];
  explanation: string | null;
  codeTemplate: string | null;
  codeLanguage: string | null;
  acceptedVariations: string[];
  numericalTolerance: number | null;
  matchingPairs: Record<string, string> | null;
  orderingSequence: string[] | null;
  tags: string[];
  categoryId: string | null;
  referenceMaterial: string | null;
  metaData: Record<string, unknown>;
  version: number;
  approvedById: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  contentHash: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionVersionEntity {
  versionId: string;
  questionId: string;
  version: number;
  title: string;
  body: string;
  options: QuestionOptionEntity[];
  changeSummary: string;
  authorId: string;
  snapshotData: Partial<QuestionEntity>;
  createdAt: string;
}

export interface QuestionBankEntity {
  bankId: string;
  institutionId: string;
  departmentId: string | null;
  courseId: string | null;
  subject: string;
  name: string;
  description: string | null;
  version: number;
  isArchived: boolean;
  questionCount: number;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionPoolEntity {
  poolId: string;
  bankId: string;
  institutionId: string;
  name: string;
  strategy: PoolStrategy;
  targetQuestionCount: number;
  difficultyDistribution: Record<DifficultyLevel, number>;
  topicDistribution: Record<string, number>;
  excludedQuestionIds: string[];
  reusePolicy: ReusePolicy;
  isValidated: boolean;
  lastValidatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionCategoryEntity {
  categoryId: string;
  institutionId: string;
  name: string;
  description: string | null;
  parentId: string | null;
  createdAt: string;
}

export interface QuestionTagEntity {
  tagId: string;
  institutionId: string;
  name: string;
  createdAt: string;
}

export interface QuestionImportJobEntity {
  jobId: string;
  institutionId: string;
  bankId: string;
  format: QuestionFormat;
  status: ImportJobStatus;
  totalParsed: number;
  importedCount: number;
  duplicateCount: number;
  failedCount: number;
  errors: string[];
  importReport: ImportReportEntry[];
  createdBy: string;
  createdAt: string;
  completedAt: string | null;
}

export interface ImportReportEntry {
  rowIndex: number;
  title: string;
  status: 'IMPORTED' | 'SKIPPED_DUPLICATE' | 'FAILED';
  reason?: string;
}

export interface QuestionExportJobEntity {
  jobId: string;
  institutionId: string;
  bankId: string;
  format: QuestionFormat;
  downloadUrl: string | null;
  status: ExportJobStatus;
  exportedCount: number;
  createdBy: string;
  createdAt: string;
  completedAt: string | null;
}

export interface QuestionAnalyticsEntity {
  analyticsId: string;
  questionId: string;
  institutionId: string;
  totalAttempts: number;
  correctAttempts: number;
  partialCorrectAttempts: number;
  incorrectAttempts: number;
  avgResponseTimeSeconds: number;
  difficultyIndex: number;       // p-value: proportion correct [0..1]
  discriminationIndex: number;   // point-biserial correlation [-1..1]
  lastAttemptAt: string | null;
  updatedAt: string;
}

export interface AuditLogEntry {
  logId: string;
  institutionId: string;
  actorUserId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: Record<string, unknown>;
  timestamp: string;
}

// ── Pool Validation Result ────────────────────────────────────────────────────

export interface PoolValidationResult {
  poolId: string;
  isValid: boolean;
  availableCount: number;
  targetCount: number;
  difficultyBreakdown: Record<DifficultyLevel, { target: number; available: number }>;
  errors: string[];
  warnings: string[];
  validatedAt: string;
}

// ── Request / Response DTOs ───────────────────────────────────────────────────

export interface CreateQuestionDto {
  bankId: string;
  institutionId: string;
  departmentId?: string;
  courseId?: string;
  type: QuestionType;
  title: string;
  body: string;
  instructions?: string;
  difficulty?: DifficultyLevel;
  marks?: number;
  negativeMarks?: number;
  estimatedTimeSeconds?: number;
  hints?: string[];
  explanation?: string;
  codeTemplate?: string;
  codeLanguage?: string;
  acceptedVariations?: string[];
  numericalTolerance?: number;
  matchingPairs?: Record<string, string>;
  orderingSequence?: string[];
  options?: Array<{ text: string; isCorrect: boolean; explanation?: string }>;
  tags?: string[];
  categoryId?: string;
  referenceMaterial?: string;
  metaData?: Record<string, unknown>;
}

export interface UpdateQuestionDto {
  title?: string;
  body?: string;
  instructions?: string;
  difficulty?: DifficultyLevel;
  marks?: number;
  negativeMarks?: number;
  estimatedTimeSeconds?: number;
  hints?: string[];
  explanation?: string;
  codeTemplate?: string;
  codeLanguage?: string;
  acceptedVariations?: string[];
  numericalTolerance?: number;
  matchingPairs?: Record<string, string>;
  orderingSequence?: string[];
  options?: Array<{ text: string; isCorrect: boolean; explanation?: string }>;
  tags?: string[];
  categoryId?: string;
  referenceMaterial?: string;
  metaData?: Record<string, unknown>;
  changeSummary?: string;
}

export interface CreateQuestionBankDto {
  institutionId: string;
  departmentId?: string;
  courseId?: string;
  subject: string;
  name: string;
  description?: string;
}

export interface UpdateQuestionBankDto {
  name?: string;
  description?: string;
  subject?: string;
  departmentId?: string;
  courseId?: string;
}

export interface CreateQuestionPoolDto {
  bankId: string;
  institutionId: string;
  name: string;
  strategy?: PoolStrategy;
  targetQuestionCount: number;
  difficultyDistribution?: Record<DifficultyLevel, number>;
  topicDistribution?: Record<string, number>;
  excludedQuestionIds?: string[];
  reusePolicy?: ReusePolicy;
}

export interface UpdateQuestionPoolDto {
  name?: string;
  strategy?: PoolStrategy;
  targetQuestionCount?: number;
  difficultyDistribution?: Record<DifficultyLevel, number>;
  topicDistribution?: Record<string, number>;
  excludedQuestionIds?: string[];
  reusePolicy?: ReusePolicy;
}

export interface CreateCategoryDto {
  institutionId: string;
  name: string;
  description?: string;
  parentId?: string;
}

export interface CreateTagDto {
  institutionId: string;
  name: string;
}

export interface QuestionSearchQueryDto {
  institutionId?: string;
  bankId?: string;
  type?: QuestionType;
  difficulty?: DifficultyLevel;
  status?: QuestionApprovalStatus;
  categoryId?: string;
  tag?: string;
  query?: string;
  page?: number;
  limit?: number;
}

export interface RandomSelectionQueryDto {
  poolId?: string;
  bankId?: string;
  count: number;
  seed?: number | string;
  randomizeOptions?: boolean;
  difficultyFilter?: DifficultyLevel;
  difficultyDistribution?: Record<DifficultyLevel, number>;
  topicDistribution?: Record<string, number>;
  excludedQuestionIds?: string[];
}

export interface RecordAttemptDto {
  questionId: string;
  institutionId: string;
  isCorrect: boolean;
  isPartiallyCorrect?: boolean;
  responseTimeSeconds: number;
}

export interface RestoreVersionDto {
  questionId: string;
  targetVersion: number;
  actorUserId: string;
}

// ── Response DTOs ─────────────────────────────────────────────────────────────

export interface QuestionResponseDto {
  question: QuestionEntity;
  options?: QuestionOptionEntity[];
  attachments?: QuestionAttachmentEntity[];
  versions?: QuestionVersionEntity[];
}

export interface QuestionBankSummaryDto {
  bank: QuestionBankEntity;
  questionCount: number;
  categories: string[];
}

export interface ExportTemplateDto {
  format: QuestionFormat;
  templateContent: string;
  description: string;
}
