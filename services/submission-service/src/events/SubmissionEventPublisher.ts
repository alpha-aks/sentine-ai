import { EventPublisher, InMemoryEventBus } from '@sentinel-ai/event-sdk';
import { Logger } from '@sentinel-ai/logger';
import { SubmissionAnswerEntity, SubmissionEntity } from '../types/submission';

export class SubmissionEventPublisher {
  private readonly publisher: EventPublisher;
  private readonly logger: Logger;

  constructor(eventBus?: InMemoryEventBus, logger?: Logger) {
    const bus = eventBus || new InMemoryEventBus();
    this.publisher = new EventPublisher(bus, { sourceName: 'submission-service' });
    this.logger = logger || new Logger({ serviceName: 'submission-service' });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PUBLISHED EVENTS
  // ─────────────────────────────────────────────────────────────────────────────

  public async publishSubmissionStarted(submission: SubmissionEntity): Promise<void> {
    this.logger.info(`Publishing SubmissionStarted for submission ${submission.submissionId}`);
    await this.publisher.publish('SubmissionStarted', {
      submissionId: submission.submissionId,
      sessionId: submission.sessionId,
      examId: submission.examId,
      institutionId: submission.institutionId,
      candidateId: submission.candidateId,
      startedAt: submission.startedAt
    });
  }

  public async publishAnswerSaved(answer: SubmissionAnswerEntity): Promise<void> {
    this.logger.info(`Publishing AnswerSaved for question ${answer.questionId} (submission: ${answer.submissionId})`);
    await this.publisher.publish('AnswerSaved', {
      answerId: answer.answerId,
      submissionId: answer.submissionId,
      questionId: answer.questionId,
      candidateId: answer.candidateId,
      answerType: answer.answerType,
      isFlagged: answer.isFlagged,
      version: answer.version,
      savedAt: answer.lastSavedAt,
      saveSource: answer.lastSaveSource
    });
  }

  public async publishDraftSaved(
    submissionId: string,
    questionId: string,
    candidateId: string,
    answerType: string
  ): Promise<void> {
    this.logger.debug(`Publishing DraftSaved for question ${questionId}`);
    await this.publisher.publish('DraftSaved', {
      submissionId,
      questionId,
      candidateId,
      answerType,
      timestamp: new Date().toISOString()
    });
  }

  public async publishAnswerUpdated(answer: SubmissionAnswerEntity): Promise<void> {
    this.logger.info(`Publishing AnswerUpdated for question ${answer.questionId} (submission: ${answer.submissionId})`);
    await this.publisher.publish('AnswerUpdated', {
      answerId: answer.answerId,
      submissionId: answer.submissionId,
      questionId: answer.questionId,
      candidateId: answer.candidateId,
      answerType: answer.answerType,
      version: answer.version,
      updatedAt: answer.lastSavedAt
    });
  }

  public async publishAutosaveCompleted(submissionId: string, savedCount: number): Promise<void> {
    this.logger.debug(`Publishing AutosaveCompleted for submission ${submissionId} (count: ${savedCount})`);
    await this.publisher.publish('AutosaveCompleted', {
      submissionId,
      savedCount,
      timestamp: new Date().toISOString()
    });
  }

  public async publishSubmissionReviewed(submissionId: string, candidateId: string, isValid: boolean): Promise<void> {
    this.logger.info(`Publishing SubmissionReviewed for submission ${submissionId}`);
    await this.publisher.publish('SubmissionReviewed', {
      submissionId,
      candidateId,
      isValid,
      reviewedAt: new Date().toISOString()
    });
  }

  public async publishSubmissionLocked(
    submissionId: string,
    lockedBy: string,
    reason: string
  ): Promise<void> {
    this.logger.info(`Publishing SubmissionLocked for submission ${submissionId}`);
    await this.publisher.publish('SubmissionLocked', {
      submissionId,
      lockedBy,
      reason,
      lockedAt: new Date().toISOString()
    });
  }

  public async publishSubmissionFinalized(submission: SubmissionEntity): Promise<void> {
    this.logger.info(`Publishing SubmissionFinalized for submission ${submission.submissionId}`);
    await this.publisher.publish('SubmissionFinalized', {
      submissionId: submission.submissionId,
      sessionId: submission.sessionId,
      examId: submission.examId,
      institutionId: submission.institutionId,
      candidateId: submission.candidateId,
      answeredCount: submission.answeredCount,
      submittedAt: submission.submittedAt,
      submittedBy: submission.submittedBy
    });
  }

  public async publishSubmissionAutoSubmitted(
    submission: SubmissionEntity,
    reason: string
  ): Promise<void> {
    this.logger.info(`Publishing SubmissionAutoSubmitted for submission ${submission.submissionId} (reason: ${reason})`);
    await this.publisher.publish('SubmissionAutoSubmitted', {
      submissionId: submission.submissionId,
      sessionId: submission.sessionId,
      examId: submission.examId,
      institutionId: submission.institutionId,
      candidateId: submission.candidateId,
      reason,
      autoSubmittedAt: new Date().toISOString()
    });
  }

  public async publishSubmissionRecovered(
    submissionId: string,
    recoveredCount: number
  ): Promise<void> {
    this.logger.info(`Publishing SubmissionRecovered for submission ${submissionId}`);
    await this.publisher.publish('SubmissionRecovered', {
      submissionId,
      recoveredCount,
      recoveredAt: new Date().toISOString()
    });
  }

  public async publishSubmissionExported(
    submissionId: string,
    exportFormat: string
  ): Promise<void> {
    this.logger.info(`Publishing SubmissionExported for submission ${submissionId}`);
    await this.publisher.publish('SubmissionExported', {
      submissionId,
      exportFormat,
      exportedAt: new Date().toISOString()
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // EVENT SUBSCRIPTIONS
  // ─────────────────────────────────────────────────────────────────────────────

  public subscribeToExternalEvents(handlers: {
    onSessionStarted?: (sessionId: string, candidateId: string) => void;
    onSessionEnded?: (sessionId: string) => void;
    onSessionRecovered?: (sessionId: string) => void;
    onExamEnded?: (examId: string) => void;
    onExamCancelled?: (examId: string) => void;
  }): void {
    this.logger.info('Subscribing to session and exam lifecycle events');
    const bus = (this.publisher as any).bus;
    if (!bus?.subscribe) return;

    if (handlers.onSessionStarted) {
      bus.subscribe('SessionStarted', (env: any) => {
        handlers.onSessionStarted?.(env.payload?.sessionId, env.payload?.candidateId);
      });
    }

    if (handlers.onSessionEnded) {
      bus.subscribe('SessionEnded', (env: any) => {
        handlers.onSessionEnded?.(env.payload?.sessionId);
      });
    }

    if (handlers.onSessionRecovered) {
      bus.subscribe('SessionRecovered', (env: any) => {
        handlers.onSessionRecovered?.(env.payload?.sessionId);
      });
    }

    if (handlers.onExamEnded) {
      bus.subscribe('ExamEnded', (env: any) => {
        handlers.onExamEnded?.(env.payload?.examId);
      });
    }

    if (handlers.onExamCancelled) {
      bus.subscribe('ExamCancelled', (env: any) => {
        handlers.onExamCancelled?.(env.payload?.examId);
      });
    }
  }
}
