import { generateUuid } from '@sentinel-ai/utils';
import { Logger } from '@sentinel-ai/logger';
import { SubmissionRepository } from '../db/SubmissionRepository';
import { AnswerVersionEntity, SaveSource, SubmissionAnswerEntity } from '../types/submission';

export class AnswerVersioningEngine {
  private readonly logger: Logger;

  constructor(private readonly repository: SubmissionRepository) {
    this.logger = new Logger({ serviceName: 'submission-service' });
  }

  /**
   * Appends an immutable version record for an answer.
   */
  public async createVersionSnapshot(
    answer: SubmissionAnswerEntity,
    saveSource: SaveSource,
    ipAddress?: string,
    changeSummary?: string
  ): Promise<AnswerVersionEntity> {
    const versionId = generateUuid();
    const version: AnswerVersionEntity = {
      versionId,
      answerId: answer.answerId,
      submissionId: answer.submissionId,
      questionId: answer.questionId,
      candidateId: answer.candidateId,
      versionNumber: answer.version,
      answerType: answer.answerType,
      answerData: answer.answerData,
      saveSource,
      timestamp: new Date().toISOString(),
      ipAddress: ipAddress ?? null,
      changeSummary
    };

    await this.repository.appendAnswerVersion(version);

    this.logger.debug(
      `Created version v${answer.version} snapshot for question ${answer.questionId} (source=${saveSource})`
    );

    return version;
  }

  /**
   * Retrieves the full version history for a question in a submission.
   */
  public async getHistory(
    submissionId: string,
    questionId: string
  ): Promise<AnswerVersionEntity[]> {
    return this.repository.getAnswerVersions(submissionId, questionId);
  }
}
