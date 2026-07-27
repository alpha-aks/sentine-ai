import { generateUuid } from '@sentinel-ai/utils';
import { Logger } from '@sentinel-ai/logger';
import { SubmissionRepository } from '../db/SubmissionRepository';
import { SubmissionCache } from '../cache/SubmissionCache';
import { SubmissionEventPublisher } from '../events/SubmissionEventPublisher';
import { AutosaveEngine } from './AutosaveEngine';
import { AnswerVersioningEngine } from './AnswerVersioningEngine';
import { FileUploadEngine } from './FileUploadEngine';
import { CodeAnswerEngine } from './CodeAnswerEngine';
import { SubmissionValidationEngine } from './SubmissionValidationEngine';
import { getSubmissionServiceConfig, SubmissionServiceConfig } from '../config/submission-config';
import {
  AnswerVersionEntity,
  AutoSubmitDto,
  AutosaveDraftDto,
  BatchAutosaveDto,
  DraftAnswerEntity,
  LockSubmissionDto,
  RestoreDraftDto,
  RestoreDraftResponseDto,
  ReviewSubmissionDto,
  ReviewSubmissionResponseDto,
  SubmissionStatusResponseDto,
  SubmissionHistoryResponseDto,
  SaveAnswerDto,
  StartSubmissionDto,
  SubmissionAnalyticsDto,
  SubmissionAnswerEntity,
  SubmissionEntity,
  SubmissionFileEntity,
  SubmissionHistoryEntity,
  SubmissionMetadataEntity,
  SubmissionResponseDto,
  SubmissionStatus,
  SubmissionValidationResult,
  SubmitFinalDto,
  UploadFileDto
} from '../types/submission';

export class SubmissionService {
  private readonly logger: Logger;
  private readonly autosaveEngine: AutosaveEngine;
  private readonly versioningEngine: AnswerVersioningEngine;
  private readonly fileUploadEngine: FileUploadEngine;
  private readonly codeAnswerEngine: CodeAnswerEngine;
  private readonly validationEngine: SubmissionValidationEngine;
  private readonly config: SubmissionServiceConfig;

  constructor(
    private readonly repository: SubmissionRepository = new SubmissionRepository(),
    private readonly cache: SubmissionCache = new SubmissionCache(300),
    private readonly eventPublisher: SubmissionEventPublisher = new SubmissionEventPublisher(),
    config?: SubmissionServiceConfig
  ) {
    this.config = config || getSubmissionServiceConfig();
    this.logger = new Logger({ serviceName: 'submission-service' });

    this.autosaveEngine = new AutosaveEngine(this.repository, this.config);
    this.versioningEngine = new AnswerVersioningEngine(this.repository);
    this.fileUploadEngine = new FileUploadEngine(this.repository, this.config);
    this.codeAnswerEngine = new CodeAnswerEngine();
    this.validationEngine = new SubmissionValidationEngine(this.repository, this.config);

    this.setupEventConsumers();
  }

  public getRepository(): SubmissionRepository { return this.repository; }
  public getCache(): SubmissionCache { return this.cache; }

  private auditLog(action: string, message: string, opts: {
    userId: string; institutionId?: string; resourceId?: string; metadata?: Record<string, unknown>;
  }): void {
    this.logger.audit(action, message, {
      action,
      userId: opts.userId,
      institutionId: opts.institutionId || 'unknown',
      resourceId: opts.resourceId,
      payload: opts.metadata
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. START SUBMISSION
  // ─────────────────────────────────────────────────────────────────────────────

  public async startSubmission(dto: StartSubmissionDto, actorUserId: string): Promise<SubmissionResponseDto> {
    const existing = await this.repository.findSubmissionBySessionId(dto.sessionId);
    if (existing) {
      return { submission: existing };
    }

    if (!dto.sessionId) throw new Error('SUBMISSION_INVALID_INPUT: sessionId is required');
    if (!dto.examId) throw new Error('SUBMISSION_INVALID_INPUT: examId is required');
    if (!dto.institutionId) throw new Error('SUBMISSION_INVALID_INPUT: institutionId is required');
    if (!dto.candidateId) throw new Error('SUBMISSION_INVALID_INPUT: candidateId is required');

    const submissionId = generateUuid();
    const now = new Date().toISOString();

    const entity: SubmissionEntity = {
      submissionId,
      sessionId: dto.sessionId,
      examId: dto.examId,
      institutionId: dto.institutionId,
      candidateId: dto.candidateId,
      candidateName: dto.candidateName,
      candidateEmail: dto.candidateEmail,
      status: 'IN_PROGRESS',
      isLocked: false,
      lockedAt: null,
      lockedBy: null,
      lockReason: null,
      totalAnswers: dto.totalQuestions ?? 0,
      answeredCount: 0,
      flaggedCount: 0,
      startedAt: now,
      lastSavedAt: now,
      submittedAt: null,
      submittedBy: null,
      version: 1,
      metaData: {},
      createdAt: now,
      updatedAt: now
    };

    await this.repository.createSubmission(entity);

    // Initialize metadata & history
    const metadata: SubmissionMetadataEntity = {
      metadataId: generateUuid(),
      submissionId,
      deviceInfo: dto.deviceInfo ?? {},
      ipAddress: null,
      networkStats: {},
      totalAutosaves: 0,
      totalManualSaves: 0,
      updatedAt: now
    };
    await this.repository.upsertMetadata(metadata);
    await this.appendHistory(submissionId, 'SUBMISSION_STARTED', actorUserId, null, 'IN_PROGRESS', 'Submission initialized');

    this.cache.setSubmission(entity);
    await this.eventPublisher.publishSubmissionStarted(entity);

    this.auditLog('SUBMISSION_STARTED', `Submission started for session ${dto.sessionId}`, {
      userId: actorUserId, institutionId: dto.institutionId, resourceId: submissionId
    });

    return { submission: entity };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. READ & LIST
  // ─────────────────────────────────────────────────────────────────────────────

  public async getSubmission(submissionId: string): Promise<SubmissionResponseDto> {
    const cached = this.cache.getSubmission(submissionId);
    if (cached) {
      const answers = await this.repository.getAnswersBySubmission(submissionId);
      const files = await this.repository.getFilesBySubmission(submissionId);
      return { submission: cached, answers, files };
    }

    const submission = await this.repository.findSubmissionById(submissionId);
    if (!submission) throw new Error(`SUBMISSION_NOT_FOUND: Submission ${submissionId} does not exist`);

    const answers = await this.repository.getAnswersBySubmission(submissionId);
    const files = await this.repository.getFilesBySubmission(submissionId);

    this.cache.setSubmission(submission);
    return { submission, answers, files };
  }

  public async getSubmissionBySession(sessionId: string): Promise<SubmissionResponseDto> {
    const submissionId = this.cache.getSubmissionIdBySession(sessionId);
    if (submissionId) return this.getSubmission(submissionId);

    const submission = await this.repository.findSubmissionBySessionId(sessionId);
    if (!submission) throw new Error(`SUBMISSION_NOT_FOUND: No submission found for session ${sessionId}`);

    return this.getSubmission(submission.submissionId);
  }

  public async listSubmissionsByExam(
    examId: string,
    statusFilter?: SubmissionStatus
  ): Promise<SubmissionEntity[]> {
    const cached = this.cache.getSubmissionListByExam(examId);
    if (cached && !statusFilter) return cached;

    const list = await this.repository.findSubmissionsByExam(examId, statusFilter);
    if (!statusFilter) this.cache.setSubmissionListByExam(examId, list);
    return list;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. MANUAL SAVE ANSWER
  // ─────────────────────────────────────────────────────────────────────────────

  public async saveAnswer(
    submissionId: string,
    dto: SaveAnswerDto,
    actorUserId: string
  ): Promise<SubmissionAnswerEntity> {
    const submission = await this.requireSubmission(submissionId);
    this.validationEngine.assertModifiable(submission);
    this.validationEngine.validateAnswerData(dto.answerType, dto.answerData);

    // Process code answers if CODE/PROGRAMMING/CODE_SNIPPET type
    let answerData = dto.answerData;
    if (['CODE', 'PROGRAMMING', 'CODE_SNIPPET'].includes(dto.answerType)) {
      answerData = this.codeAnswerEngine.processCodeAnswer(dto.answerData as any);
    }

    const existingAnswer = await this.repository.findAnswer(submissionId, dto.questionId);
    const newVersion = (existingAnswer?.version ?? 0) + 1;
    const now = new Date().toISOString();

    const answer: SubmissionAnswerEntity = {
      answerId: existingAnswer?.answerId || generateUuid(),
      submissionId,
      questionId: dto.questionId,
      candidateId: submission.candidateId,
      answerType: dto.answerType,
      answerData,
      isDraft: false,
      isFlagged: dto.isFlagged ?? existingAnswer?.isFlagged ?? false,
      version: newVersion,
      timeSpentSeconds: dto.timeSpentSeconds ?? existingAnswer?.timeSpentSeconds,
      lastSavedAt: now,
      lastSaveSource: 'MANUAL'
    };

    await this.repository.saveAnswer(answer);
    await this.repository.clearDraft(submissionId, dto.questionId);

    // Create version snapshot
    await this.versioningEngine.createVersionSnapshot(answer, 'MANUAL', dto.ipAddress, 'Manual save');

    // Update metadata save count
    const meta = await this.repository.getMetadata(submissionId);
    if (meta) {
      await this.repository.upsertMetadata({ ...meta, totalManualSaves: meta.totalManualSaves + 1, updatedAt: now });
    }

    this.cache.invalidateAnswer(submissionId, dto.questionId);
    this.cache.invalidateSubmission(submissionId);
    if (existingAnswer) {
      await this.eventPublisher.publishAnswerUpdated(answer);
    } else {
      await this.eventPublisher.publishAnswerSaved(answer);
    }

    this.auditLog('ANSWER_SAVED', `Manual save for question ${dto.questionId} on submission ${submissionId}`, {
      userId: actorUserId, institutionId: submission.institutionId, resourceId: submissionId
    });

    return answer;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. AUTOSAVE DRAFT & RESTORE
  // ─────────────────────────────────────────────────────────────────────────────

  public async saveDraft(
    submissionId: string,
    dto: AutosaveDraftDto,
    actorUserId: string
  ): Promise<{ draft: DraftAnswerEntity; conflictDetected: boolean }> {
    const submission = await this.requireSubmission(submissionId);
    this.validationEngine.assertModifiable(submission);
    this.validationEngine.validateAnswerData(dto.answerType, dto.answerData);

    const result = await this.autosaveEngine.saveDraft(submissionId, submission.candidateId, dto);

    // Update metadata count
    const meta = await this.repository.getMetadata(submissionId);
    if (meta) {
      await this.repository.upsertMetadata({
        ...meta, totalAutosaves: meta.totalAutosaves + 1, updatedAt: new Date().toISOString()
      });
    }

    this.cache.setDraft(result.draft);
    await this.eventPublisher.publishDraftSaved(submissionId, dto.questionId, submission.candidateId, dto.answerType);

    return result;
  }

  public async batchAutosave(
    submissionId: string,
    dto: BatchAutosaveDto,
    actorUserId: string
  ): Promise<{ savedCount: number; conflicts: string[] }> {
    const conflicts: string[] = [];
    let savedCount = 0;

    for (const draftDto of dto.drafts) {
      try {
        const res = await this.saveDraft(submissionId, draftDto, actorUserId);
        savedCount++;
        if (res.conflictDetected) conflicts.push(draftDto.questionId);
      } catch (err: any) {
        this.logger.error(`Batch autosave failed for question ${draftDto.questionId}: ${err.message}`);
      }
    }

    await this.eventPublisher.publishAutosaveCompleted(submissionId, savedCount);

    return { savedCount, conflicts };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. FILE UPLOADS
  // ─────────────────────────────────────────────────────────────────────────────

  public async uploadFile(
    submissionId: string,
    dto: UploadFileDto,
    actorUserId: string
  ): Promise<SubmissionFileEntity> {
    const submission = await this.requireSubmission(submissionId);
    this.validationEngine.assertModifiable(submission);

    const file = await this.fileUploadEngine.processFileUpload(submissionId, submission.candidateId, dto);

    if (dto.questionId) {
      const existingAnswer = await this.repository.findAnswer(submissionId, dto.questionId);
      if (existingAnswer) {
        await this.repository.saveFile({ ...file, answerId: existingAnswer.answerId });
      }
    }

    this.cache.setFile(file);
    this.cache.invalidateSubmission(submissionId);

    this.auditLog('FILE_UPLOADED', `File ${dto.fileName} uploaded for submission ${submissionId}`, {
      userId: actorUserId, institutionId: submission.institutionId, resourceId: file.fileId
    });

    return file;
  }

  public async getFile(fileId: string): Promise<SubmissionFileEntity | null> {
    const cached = this.cache.getFile(fileId);
    if (cached) return cached;

    const file = await this.repository.findFileById(fileId);
    if (file) this.cache.setFile(file);
    return file;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. FINAL SUBMISSION
  // ─────────────────────────────────────────────────────────────────────────────

  public async submitFinal(
    submissionId: string,
    dto: SubmitFinalDto,
    actorUserId: string
  ): Promise<SubmissionResponseDto> {
    const submission = await this.requireSubmission(submissionId);
    this.validationEngine.assertModifiable(submission);

    // Promote all active drafts to answers
    const drafts = await this.repository.getDraftsBySubmission(submissionId);
    for (const draft of drafts) {
      const answer = await this.autosaveEngine.promoteDraftToAnswer(submissionId, draft.questionId, dto.ipAddress);
      if (answer) {
        await this.versioningEngine.createVersionSnapshot(answer, 'AUTOSAVE', dto.ipAddress, 'Promoted draft on submit');
      }
    }

    const validation = await this.validationEngine.validateSubmission(submission);
    if (!validation.isValid) {
      throw new Error(`SUBMISSION_VALIDATION_FAILED: ${validation.errors.join('; ')}`);
    }

    const now = new Date().toISOString();
    const updated = await this.repository.updateSubmission(submissionId, {
      status: 'SUBMITTED',
      isLocked: true,
      lockedAt: now,
      lockedBy: actorUserId,
      lockReason: 'Final submission',
      submittedAt: now,
      submittedBy: actorUserId
    });

    if (!updated) throw new Error(`SUBMISSION_NOT_FOUND: Submission ${submissionId} not found`);

    await this.appendHistory(submissionId, 'SUBMISSION_FINALIZED', actorUserId, submission.status, 'SUBMITTED', dto.notes);

    this.cache.invalidateSubmission(submissionId);
    this.cache.setSubmission(updated);

    await this.eventPublisher.publishSubmissionFinalized(updated);

    this.auditLog('SUBMISSION_FINALIZED', `Submission ${submissionId} finalized`, {
      userId: actorUserId, institutionId: submission.institutionId, resourceId: submissionId
    });

    return { submission: updated, validation };
  }

  public async autoSubmit(
    submissionId: string,
    dto: AutoSubmitDto
  ): Promise<SubmissionResponseDto> {
    const submission = await this.requireSubmission(submissionId);
    if (['SUBMITTED', 'AUTO_SUBMITTED', 'EXPORTED'].includes(submission.status)) {
      return { submission }; // Already submitted, idempotent
    }

    // Promote remaining drafts
    const drafts = await this.repository.getDraftsBySubmission(submissionId);
    for (const draft of drafts) {
      const answer = await this.autosaveEngine.promoteDraftToAnswer(submissionId, draft.questionId);
      if (answer) {
        await this.versioningEngine.createVersionSnapshot(answer, 'SYSTEM', undefined, `Auto-submitted (${dto.reason})`);
      }
    }

    const now = new Date().toISOString();
    const updated = await this.repository.updateSubmission(submissionId, {
      status: 'AUTO_SUBMITTED',
      isLocked: true,
      lockedAt: now,
      lockedBy: dto.actorId || 'system',
      lockReason: `Auto-submit: ${dto.reason}`,
      submittedAt: now,
      submittedBy: dto.actorId || 'system'
    });

    if (!updated) throw new Error(`SUBMISSION_NOT_FOUND: Submission ${submissionId} not found`);

    await this.appendHistory(
      submissionId, 'SUBMISSION_AUTO_SUBMITTED', dto.actorId || 'system',
      submission.status, 'AUTO_SUBMITTED', dto.notes || dto.reason
    );

    this.cache.invalidateSubmission(submissionId);
    this.cache.setSubmission(updated);

    await this.eventPublisher.publishSubmissionAutoSubmitted(updated, dto.reason);

    this.auditLog('SUBMISSION_AUTO_SUBMITTED', `Submission ${submissionId} auto-submitted (${dto.reason})`, {
      userId: dto.actorId || 'system', institutionId: submission.institutionId, resourceId: submissionId
    });

    return { submission: updated };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. LOCKING & RECOVERY
  // ─────────────────────────────────────────────────────────────────────────────

  public async lockSubmission(
    submissionId: string,
    dto: LockSubmissionDto,
    actorUserId: string
  ): Promise<SubmissionEntity> {
    const submission = await this.requireSubmission(submissionId);
    const now = new Date().toISOString();

    const updated = await this.repository.updateSubmission(submissionId, {
      isLocked: true,
      lockedAt: now,
      lockedBy: actorUserId,
      lockReason: dto.reason,
      status: submission.status === 'IN_PROGRESS' ? 'LOCKED' : submission.status
    });

    if (!updated) throw new Error(`SUBMISSION_NOT_FOUND: Submission ${submissionId} not found`);

    await this.appendHistory(submissionId, 'SUBMISSION_LOCKED', actorUserId, submission.status, updated.status, dto.reason);
    this.cache.invalidateSubmission(submissionId);

    await this.eventPublisher.publishSubmissionLocked(submissionId, actorUserId, dto.reason);

    this.auditLog('SUBMISSION_LOCKED', `Submission ${submissionId} locked`, {
      userId: actorUserId, institutionId: submission.institutionId, resourceId: submissionId
    });

    return updated;
  }

  public async getRecoveryState(submissionId: string): Promise<{
    submission: SubmissionEntity;
    answers: SubmissionAnswerEntity[];
    drafts: DraftAnswerEntity[];
    files: SubmissionFileEntity[];
  }> {
    const submission = await this.requireSubmission(submissionId);
    const answers = await this.repository.getAnswersBySubmission(submissionId);
    const drafts = await this.repository.getDraftsBySubmission(submissionId);
    const files = await this.repository.getFilesBySubmission(submissionId);

    await this.eventPublisher.publishSubmissionRecovered(submissionId, answers.length + drafts.length);

    return { submission, answers, drafts, files };
  }

  public async getAnswerVersions(
    submissionId: string,
    questionId: string
  ): Promise<AnswerVersionEntity[]> {
    await this.requireSubmission(submissionId);
    return this.versioningEngine.getHistory(submissionId, questionId);
  }

  public async restoreDraft(
    submissionId: string,
    dto: RestoreDraftDto,
    actorUserId: string
  ): Promise<RestoreDraftResponseDto> {
    const submission = await this.requireSubmission(submissionId);
    this.validationEngine.assertModifiable(submission);

    const { restoredAnswer, previousDraftCleared } = await this.autosaveEngine.restoreDraft(
      submissionId,
      dto.questionId,
      dto.targetVersion
    );

    this.cache.invalidateAnswer(submissionId, dto.questionId);
    this.cache.invalidateSubmission(submissionId);

    this.auditLog('DRAFT_RESTORED', `Restored draft/version for question ${dto.questionId} on submission ${submissionId}`, {
      userId: actorUserId, institutionId: submission.institutionId, resourceId: submissionId
    });

    return {
      submissionId,
      questionId: dto.questionId,
      restoredAnswer,
      previousDraftCleared
    };
  }

  public async reviewSubmission(
    submissionId: string,
    dto: ReviewSubmissionDto,
    actorUserId: string
  ): Promise<ReviewSubmissionResponseDto> {
    const submission = await this.requireSubmission(submissionId);
    const validation = await this.validationEngine.validateSubmission(submission);

    await this.eventPublisher.publishSubmissionReviewed(submissionId, submission.candidateId, validation.isValid);

    this.auditLog('SUBMISSION_REVIEWED', `Candidate reviewed submission ${submissionId}`, {
      userId: actorUserId, institutionId: submission.institutionId, resourceId: submissionId
    });

    return {
      submissionId,
      status: submission.status,
      validation,
      reviewedAt: new Date().toISOString()
    };
  }

  public async getSubmissionStatus(submissionId: string): Promise<SubmissionStatusResponseDto> {
    const submission = await this.requireSubmission(submissionId);
    return {
      submissionId: submission.submissionId,
      status: submission.status,
      isLocked: submission.isLocked,
      totalAnswers: submission.totalAnswers,
      answeredCount: submission.answeredCount,
      flaggedCount: submission.flaggedCount,
      startedAt: submission.startedAt,
      lastSavedAt: submission.lastSavedAt,
      submittedAt: submission.submittedAt
    };
  }

  public async getSubmissionHistory(submissionId: string): Promise<SubmissionHistoryResponseDto> {
    await this.requireSubmission(submissionId);
    const history = await this.repository.getHistory(submissionId);
    const audits = await this.repository.getAudits(submissionId);
    const versions = await this.repository.getAllAnswerVersions(submissionId);

    return {
      submissionId,
      history,
      audits,
      versions
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 8. ANALYTICS & VALIDATION
  // ─────────────────────────────────────────────────────────────────────────────

  public async validateSubmission(
    submissionId: string,
    requiredQuestionIds: string[] = []
  ): Promise<SubmissionValidationResult> {
    const submission = await this.requireSubmission(submissionId);
    return this.validationEngine.validateSubmission(submission, requiredQuestionIds);
  }

  public async getSubmissionAnalytics(submissionId: string): Promise<SubmissionAnalyticsDto> {
    const cached = this.cache.getAnalytics(submissionId);
    if (cached) return cached;

    const submission = await this.requireSubmission(submissionId);
    const answers = await this.repository.getAnswersBySubmission(submissionId);
    const drafts = await this.repository.getDraftsBySubmission(submissionId);
    const files = await this.repository.getFilesBySubmission(submissionId);
    const metadata = await this.repository.getMetadata(submissionId);

    let totalVersionsCount = 0;
    for (const a of answers) {
      const vList = await this.repository.getAnswerVersions(submissionId, a.questionId);
      totalVersionsCount += vList.length;
    }

    const totalAnswers = submission.totalAnswers || Math.max(answers.length, drafts.length);
    const answeredCount = answers.filter(a => a.answerData !== null).length;
    const completionPercentage = totalAnswers > 0 ? Math.round((answeredCount / totalAnswers) * 100) : 0;

    const dto: SubmissionAnalyticsDto = {
      submissionId,
      examId: submission.examId,
      candidateId: submission.candidateId,
      status: submission.status,
      totalAnswers,
      answeredCount,
      flaggedCount: submission.flaggedCount,
      completionPercentage,
      totalAutosaves: metadata?.totalAutosaves ?? 0,
      totalManualSaves: metadata?.totalManualSaves ?? 0,
      totalVersions: totalVersionsCount,
      totalFilesUploaded: files.length,
      startedAt: submission.startedAt,
      lastSavedAt: submission.lastSavedAt,
      submittedAt: submission.submittedAt
    };

    this.cache.setAnalytics(submissionId, dto);
    return dto;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PRIVATE HELPERS & EVENT CONSUMERS
  // ─────────────────────────────────────────────────────────────────────────────

  private async requireSubmission(submissionId: string): Promise<SubmissionEntity> {
    const cached = this.cache.getSubmission(submissionId);
    if (cached) return cached;

    const s = await this.repository.findSubmissionById(submissionId);
    if (!s) throw new Error(`SUBMISSION_NOT_FOUND: Submission ${submissionId} does not exist`);
    this.cache.setSubmission(s);
    return s;
  }

  private async appendHistory(
    submissionId: string,
    action: string,
    actorId: string,
    previousStatus: SubmissionStatus | null,
    newStatus: SubmissionStatus,
    reason?: string
  ): Promise<void> {
    const entity: SubmissionHistoryEntity = {
      historyId: generateUuid(),
      submissionId,
      action,
      actorId,
      previousStatus,
      newStatus,
      timestamp: new Date().toISOString(),
      reason: reason ?? null
    };
    await this.repository.appendHistory(entity);
  }

  private setupEventConsumers(): void {
    this.eventPublisher.subscribeToExternalEvents({
      onSessionEnded: async (sessionId: string) => {
        try {
          const sub = await this.repository.findSubmissionBySessionId(sessionId);
          if (sub && !['SUBMITTED', 'AUTO_SUBMITTED', 'EXPORTED'].includes(sub.status)) {
            await this.autoSubmit(sub.submissionId, { reason: 'DISCONNECT_POLICY', notes: 'Auto-submitted on SessionEnded' });
          }
        } catch (err: any) {
          this.logger.error(`Failed auto-submit on SessionEnded for session ${sessionId}: ${err.message}`);
        }
      },
      onExamEnded: async (examId: string) => {
        try {
          const active = await this.repository.findSubmissionsByExam(examId, 'IN_PROGRESS');
          for (const s of active) {
            await this.autoSubmit(s.submissionId, { reason: 'TIMER_EXPIRED', notes: 'Auto-submitted on ExamEnded' });
          }
        } catch (err: any) {
          this.logger.error(`Failed auto-submit on ExamEnded for exam ${examId}: ${err.message}`);
        }
      }
    });
  }
}
