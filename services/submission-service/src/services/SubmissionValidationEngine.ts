import { Logger } from '@sentinel-ai/logger';
import { SubmissionRepository } from '../db/SubmissionRepository';
import { SubmissionEntity, SubmissionValidationResult } from '../types/submission';
import { SubmissionServiceConfig } from '../config/submission-config';

export class SubmissionValidationEngine {
  private readonly logger: Logger;

  constructor(
    private readonly repository: SubmissionRepository,
    private readonly config: SubmissionServiceConfig
  ) {
    this.logger = new Logger({ serviceName: 'submission-service' });
  }

  /**
   * Validates a submission before manual or automated final submit.
   */
  public async validateSubmission(
    submission: SubmissionEntity,
    requiredQuestionIds: string[] = []
  ): Promise<SubmissionValidationResult> {
    const answers = await this.repository.getAnswersBySubmission(submission.submissionId);
    const files = await this.repository.getFilesBySubmission(submission.submissionId);

    const answeredMap = new Map<string, boolean>();
    for (const a of answers) {
      if (a.answerData !== null && a.answerData !== undefined) {
        answeredMap.set(a.questionId, true);
      }
    }

    const answeredCount = answeredMap.size;
    const totalQuestions = submission.totalAnswers || Math.max(answeredCount, requiredQuestionIds.length);

    const unansweredQuestionIds: string[] = [];
    const missingRequiredQuestionIds: string[] = [];
    const fileErrors: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required questions
    for (const qId of requiredQuestionIds) {
      if (!answeredMap.has(qId)) {
        missingRequiredQuestionIds.push(qId);
        unansweredQuestionIds.push(qId);
      }
    }

    if (submission.isLocked) {
      errors.push(`Submission ${submission.submissionId} is locked and cannot be modified.`);
    }

    if (['SUBMITTED', 'AUTO_SUBMITTED', 'EXPORTED'].includes(submission.status)) {
      errors.push(`Submission ${submission.submissionId} is already finalized (${submission.status}).`);
    }

    if (this.config.requireAllQuestionsForManualSubmit && missingRequiredQuestionIds.length > 0) {
      errors.push(`Missing required questions: ${missingRequiredQuestionIds.join(', ')}`);
    }

    // Verify file attachment virus scans
    for (const file of files) {
      if (!file.virusScanPassed) {
        fileErrors.push(`File "${file.fileName}" (id: ${file.fileId}) failed security scan.`);
        errors.push(`File security check failed for ${file.fileName}`);
      }
    }

    if (answeredCount < totalQuestions) {
      warnings.push(`${totalQuestions - answeredCount} question(s) remain unanswered.`);
    }

    const isValid = errors.length === 0;

    this.logger.info(
      `Validation result for submission ${submission.submissionId}: valid=${isValid}, ` +
      `answered=${answeredCount}/${totalQuestions}, errors=${errors.length}, warnings=${warnings.length}`
    );

    return {
      isValid,
      totalQuestions,
      answeredQuestions: answeredCount,
      unansweredQuestionIds,
      missingRequiredQuestionIds,
      fileErrors,
      errors,
      warnings
    };
  }

  /**
   * Asserts that a submission is unlocked and modifiable.
   * Throws `SUBMISSION_LOCKED` or `SUBMITTED_ALREADY` if modifiable check fails.
   */
  public assertModifiable(submission: SubmissionEntity): void {
    if (submission.isLocked) {
      throw new Error(
        `SUBMISSION_LOCKED: Submission ${submission.submissionId} is locked and cannot accept modifications`
      );
    }
    if (['SUBMITTED', 'AUTO_SUBMITTED', 'EXPORTED'].includes(submission.status)) {
      throw new Error(
        `SUBMISSION_ALREADY_FINALIZED: Submission ${submission.submissionId} is in terminal status "${submission.status}"`
      );
    }
  }

  /**
   * Asserts that the exam deadline has not passed.
   */
  public assertExamNotExpired(submission: SubmissionEntity, examEndTimeISO?: string): void {
    if (!examEndTimeISO) return;
    const now = new Date().getTime();
    const end = new Date(examEndTimeISO).getTime();
    if (now > end) {
      throw new Error(
        `EXAM_DEADLINE_EXPIRED: Exam deadline (${examEndTimeISO}) has passed for submission ${submission.submissionId}`
      );
    }
  }

  /**
   * Validates individual answer data structure by answer type.
   */
  public validateAnswerData(answerType: string, answerData: any): void {
    if (answerData === null || answerData === undefined) {
      throw new Error(`SUBMISSION_INVALID_ANSWER_DATA: Answer data cannot be null or undefined for type ${answerType}`);
    }

    switch (answerType) {
      case 'MCQ_SINGLE':
        if (typeof answerData.selectedOptionId !== 'string') {
          throw new Error('SUBMISSION_INVALID_ANSWER_DATA: MCQ_SINGLE requires selectedOptionId string');
        }
        break;

      case 'MCQ_MULTIPLE':
        if (!Array.isArray(answerData.selectedOptionIds)) {
          throw new Error('SUBMISSION_INVALID_ANSWER_DATA: MCQ_MULTIPLE requires selectedOptionIds array');
        }
        break;

      case 'TRUE_FALSE':
        if (typeof answerData.value !== 'boolean') {
          throw new Error('SUBMISSION_INVALID_ANSWER_DATA: TRUE_FALSE requires boolean value');
        }
        break;

      case 'SHORT_ANSWER':
      case 'LONG_ANSWER':
      case 'FILL_BLANK':
        if (typeof answerData.text !== 'string') {
          throw new Error(`SUBMISSION_INVALID_ANSWER_DATA: ${answerType} requires text string`);
        }
        break;

      case 'NUMERICAL':
        if (typeof answerData.value !== 'number' || isNaN(answerData.value)) {
          throw new Error('SUBMISSION_INVALID_ANSWER_DATA: NUMERICAL requires valid numeric value');
        }
        break;

      case 'CODE':
      case 'PROGRAMMING':
      case 'CODE_SNIPPET':
        if (typeof answerData.code !== 'string' && !Array.isArray(answerData.files)) {
          throw new Error(`SUBMISSION_INVALID_ANSWER_DATA: ${answerType} requires code string or files array`);
        }
        break;

      case 'FILE_UPLOAD':
        if (!Array.isArray(answerData.fileIds) && !Array.isArray(answerData.files)) {
          throw new Error('SUBMISSION_INVALID_ANSWER_DATA: FILE_UPLOAD requires fileIds or files array');
        }
        break;

      case 'MATCHING':
        if (!Array.isArray(answerData.pairs)) {
          throw new Error('SUBMISSION_INVALID_ANSWER_DATA: MATCHING requires pairs array');
        }
        break;

      case 'ORDERING':
        if (!Array.isArray(answerData.orderedIds)) {
          throw new Error('SUBMISSION_INVALID_ANSWER_DATA: ORDERING requires orderedIds array');
        }
        break;

      default:
        break;
    }
  }
}
