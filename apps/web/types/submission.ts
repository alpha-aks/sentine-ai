export type SubmissionStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'AUTOSAVED'
  | 'LOCKED'
  | 'SUBMITTED'
  | 'AUTO_SUBMITTED'
  | 'EXPORTED';

export interface SubmissionEntity {
  submissionId: string;
  sessionId: string;
  examId: string;
  institutionId: string;
  candidateId: string;
  candidateName: string;
  status: SubmissionStatus;
  isLocked: boolean;
  totalAnswers: number;
  answeredCount: number;
  flaggedCount: number;
  startedAt: string;
  lastSavedAt: string;
  submittedAt: string | null;
}

export interface SubmissionAnswerEntity {
  answerId: string;
  submissionId: string;
  questionId: string;
  candidateId: string;
  answerType: string;
  answerData: unknown;
  isDraft: boolean;
  isFlagged: boolean;
  version: number;
  lastSavedAt: string;
}
