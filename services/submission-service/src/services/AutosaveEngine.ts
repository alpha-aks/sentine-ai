import { generateUuid } from '@sentinel-ai/utils';
import { Logger } from '@sentinel-ai/logger';
import { SubmissionRepository } from '../db/SubmissionRepository';
import { AutosaveDraftDto, DraftAnswerEntity, SubmissionAnswerEntity } from '../types/submission';
import { SubmissionServiceConfig } from '../config/submission-config';

export class AutosaveEngine {
  private readonly logger: Logger;

  constructor(
    private readonly repository: SubmissionRepository,
    private readonly config: SubmissionServiceConfig
  ) {
    this.logger = new Logger({ serviceName: 'submission-service' });
  }

  /**
   * Processes an incoming draft autosave.
   * Performs conflict detection against current version if enabled.
   */
  public async saveDraft(
    submissionId: string,
    candidateId: string,
    dto: AutosaveDraftDto
  ): Promise<{ draft: DraftAnswerEntity; conflictDetected: boolean }> {
    const existingAnswer = await this.repository.findAnswer(submissionId, dto.questionId);
    let conflictDetected = false;

    if (this.config.enableConflictDetection && existingAnswer) {
      // If client sequence or version is behind stored version
      if (dto.sequenceNumber !== undefined && dto.sequenceNumber < existingAnswer.version) {
        this.logger.warn(
          `Conflict detected for question ${dto.questionId} on submission ${submissionId}: ` +
          `client seq=${dto.sequenceNumber}, stored version=${existingAnswer.version}`
        );
        conflictDetected = true;
      }
    }

    const existingDraft = await this.repository.findDraft(submissionId, dto.questionId);
    const sequenceNumber = dto.sequenceNumber ?? ((existingDraft?.sequenceNumber ?? 0) + 1);

    const draft: DraftAnswerEntity = {
      draftId: existingDraft?.draftId || generateUuid(),
      submissionId,
      questionId: dto.questionId,
      candidateId,
      answerType: dto.answerType,
      answerData: dto.answerData,
      isDirty: true,
      clientTimestamp: dto.clientTimestamp || new Date().toISOString(),
      sequenceNumber,
      timeSpentSeconds: dto.timeSpentSeconds ?? existingDraft?.timeSpentSeconds,
      updatedAt: new Date().toISOString()
    };

    await this.repository.saveDraft(draft);

    this.logger.debug(
      `Autosaved draft for question ${dto.questionId} (seq=${sequenceNumber}, dirty=true)`
    );

    return { draft, conflictDetected };
  }

  /**
   * Promotes a dirty draft into a committed SubmissionAnswer.
   */
  public async promoteDraftToAnswer(
    submissionId: string,
    questionId: string,
    ipAddress?: string
  ): Promise<SubmissionAnswerEntity | null> {
    const draft = await this.repository.findDraft(submissionId, questionId);
    if (!draft) return null;

    const existingAnswer = await this.repository.findAnswer(submissionId, questionId);
    const newVersion = (existingAnswer?.version ?? 0) + 1;
    const now = new Date().toISOString();

    const answer: SubmissionAnswerEntity = {
      answerId: existingAnswer?.answerId || generateUuid(),
      submissionId,
      questionId,
      candidateId: draft.candidateId,
      answerType: draft.answerType,
      answerData: draft.answerData,
      isDraft: false,
      isFlagged: false,
      version: newVersion,
      timeSpentSeconds: draft.timeSpentSeconds ?? existingAnswer?.timeSpentSeconds,
      lastSavedAt: now,
      lastSaveSource: 'AUTOSAVE'
    };

    await this.repository.saveAnswer(answer);
    await this.repository.clearDraft(submissionId, questionId);

    return answer;
  }

  /**
   * Restores an answer from a specific past version or from draft.
   */
  public async restoreDraft(
    submissionId: string,
    questionId: string,
    targetVersion?: number
  ): Promise<{ restoredAnswer: SubmissionAnswerEntity; previousDraftCleared: boolean }> {
    const versions = await this.repository.getAnswerVersions(submissionId, questionId);
    if (versions.length === 0) {
      throw new Error(`SUBMISSION_DRAFT_NOT_FOUND: No version history found for question ${questionId}`);
    }

    const versionToRestore = targetVersion
      ? versions.find(v => v.versionNumber === targetVersion)
      : versions[versions.length - 1];

    if (!versionToRestore) {
      throw new Error(`SUBMISSION_VERSION_NOT_FOUND: Version ${targetVersion} not found for question ${questionId}`);
    }

    const existingAnswer = await this.repository.findAnswer(submissionId, questionId);
    const newVersion = (existingAnswer?.version ?? 0) + 1;
    const now = new Date().toISOString();

    const restored: SubmissionAnswerEntity = {
      answerId: existingAnswer?.answerId || generateUuid(),
      submissionId,
      questionId,
      candidateId: versionToRestore.candidateId,
      answerType: versionToRestore.answerType,
      answerData: versionToRestore.answerData,
      isDraft: false,
      isFlagged: existingAnswer?.isFlagged ?? false,
      version: newVersion,
      timeSpentSeconds: existingAnswer?.timeSpentSeconds,
      lastSavedAt: now,
      lastSaveSource: 'RECOVERY'
    };

    await this.repository.saveAnswer(restored);
    const existingDraft = await this.repository.findDraft(submissionId, questionId);
    await this.repository.clearDraft(submissionId, questionId);

    this.logger.info(`Restored answer for question ${questionId} to version v${versionToRestore.versionNumber} on submission ${submissionId}`);

    return { restoredAnswer: restored, previousDraftCleared: !!existingDraft };
  }
}
