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

export interface QuestionOptionEntity {
  optionId?: string;
  questionId?: string;
  text: string;
  isCorrect: boolean;
  explanation?: string | null;
  sequenceOrder?: number;
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
  id: string;
  questionId: string;
  bankId: string;
  institutionId: string;
  departmentId?: string | null;
  courseId?: string | null;
  type: QuestionType;
  title: string;
  body: string;
  instructions?: string | null;
  status: QuestionApprovalStatus;
  difficulty: DifficultyLevel;
  marks: number;
  negativeMarks: number;
  estimatedTimeSeconds: number;
  hints: string[];
  explanation?: string | null;
  codeTemplate?: string | null;
  codeLanguage?: string | null;
  acceptedVariations?: string[];
  numericalTolerance?: number | null;
  matchingPairs?: Record<string, string> | null;
  orderingSequence?: string[] | null;
  options?: QuestionOptionEntity[];
  attachments?: QuestionAttachmentEntity[];
  tags: string[];
  categoryId?: string | null;
  referenceMaterial?: string | null;
  version: number;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionVersionEntity {
  versionId: string;
  questionId: string;
  version: number;
  title: string;
  body: string;
  changeSummary: string;
  authorId: string;
  createdAt: string;
}

export interface QuestionBankEntity {
  bankId: string;
  institutionId: string;
  departmentId?: string | null;
  courseId?: string | null;
  subject: string;
  name: string;
  description?: string | null;
  version: number;
  isArchived: boolean;
  questionCount: number;
  createdById?: string;
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
  difficultyDistribution?: Record<DifficultyLevel, number>;
  topicDistribution?: Record<string, number>;
  excludedQuestionIds?: string[];
  reusePolicy?: ReusePolicy;
  isValidated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionCategoryEntity {
  categoryId: string;
  institutionId: string;
  name: string;
  description?: string | null;
  parentId?: string | null;
  createdAt: string;
}

export interface QuestionTagEntity {
  tagId: string;
  institutionId: string;
  name: string;
  createdAt: string;
}

export interface CreateQuestionInput {
  bankId?: string;
  institutionId?: string;
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
  options?: Array<{ text: string; isCorrect: boolean; explanation?: string }>;
  tags?: string[];
  categoryId?: string;
}

export interface UpdateQuestionInput {
  title?: string;
  body?: string;
  type?: QuestionType;
  difficulty?: DifficultyLevel;
  marks?: number;
  negativeMarks?: number;
  hints?: string[];
  explanation?: string;
  codeTemplate?: string;
  codeLanguage?: string;
  options?: Array<{ text: string; isCorrect: boolean; explanation?: string }>;
  tags?: string[];
  categoryId?: string;
  changeSummary?: string;
}

export interface QuestionSearchFilter {
  query?: string;
  type?: QuestionType | 'ALL';
  difficulty?: DifficultyLevel | 'ALL';
  status?: QuestionApprovalStatus | 'ALL';
  categoryId?: string | 'ALL';
  tag?: string | 'ALL';
  page?: number;
  limit?: number;
}
