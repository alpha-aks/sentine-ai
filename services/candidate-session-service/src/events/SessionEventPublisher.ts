import { EventPublisher, InMemoryEventBus } from '@sentinel-ai/event-sdk';
import { Logger } from '@sentinel-ai/logger';
import { CandidateSessionEntity, SessionViolationEntity, ViolationType } from '../types/session';

export class SessionEventPublisher {
  private readonly publisher: EventPublisher;
  private readonly logger: Logger;

  constructor(eventBus?: InMemoryEventBus, logger?: Logger) {
    const bus = eventBus || new InMemoryEventBus();
    this.publisher = new EventPublisher(bus, { sourceName: 'candidate-session-service' });
    this.logger = logger || new Logger({ serviceName: 'candidate-session-service' });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PUBLISHED EVENTS
  // ─────────────────────────────────────────────────────────────────────────────

  public async publishCandidateJoined(session: CandidateSessionEntity): Promise<void> {
    this.logger.info(`Publishing CandidateJoined for session ${session.sessionId}`);
    await this.publisher.publish('CandidateJoined', {
      sessionId: session.sessionId,
      examId: session.examId,
      institutionId: session.institutionId,
      candidateId: session.candidateId,
      joinedAt: session.joinedAt
    });
  }

  public async publishCandidateReady(session: CandidateSessionEntity): Promise<void> {
    this.logger.info(`Publishing CandidateReady for session ${session.sessionId}`);
    await this.publisher.publish('CandidateReady', {
      sessionId: session.sessionId,
      examId: session.examId,
      candidateId: session.candidateId,
      readyAt: session.readyAt
    });
  }

  public async publishSessionStarted(session: CandidateSessionEntity): Promise<void> {
    this.logger.info(`Publishing SessionStarted for session ${session.sessionId}`);
    await this.publisher.publish('SessionStarted', {
      sessionId: session.sessionId,
      examId: session.examId,
      institutionId: session.institutionId,
      candidateId: session.candidateId,
      startedAt: session.startedAt,
      examDurationSeconds: session.examDurationSeconds
    });
  }

  public async publishSessionPaused(sessionId: string, examId: string, actorId: string): Promise<void> {
    this.logger.info(`Publishing SessionPaused for session ${sessionId}`);
    await this.publisher.publish('SessionPaused', { sessionId, examId, actorId, pausedAt: new Date().toISOString() });
  }

  public async publishSessionResumed(sessionId: string, examId: string, actorId: string): Promise<void> {
    this.logger.info(`Publishing SessionResumed for session ${sessionId}`);
    await this.publisher.publish('SessionResumed', { sessionId, examId, actorId, resumedAt: new Date().toISOString() });
  }

  public async publishHeartbeatReceived(sessionId: string, candidateId: string, sequenceNumber: number): Promise<void> {
    this.logger.debug(`Publishing HeartbeatReceived for session ${sessionId} seq=${sequenceNumber}`);
    await this.publisher.publish('HeartbeatReceived', {
      sessionId,
      candidateId,
      sequenceNumber,
      receivedAt: new Date().toISOString()
    });
  }

  public async publishHeartbeatMissed(sessionId: string, candidateId: string, missCount: number): Promise<void> {
    this.logger.warn(`Publishing HeartbeatMissed for session ${sessionId} (miss #${missCount})`);
    await this.publisher.publish('HeartbeatMissed', {
      sessionId,
      candidateId,
      missCount,
      detectedAt: new Date().toISOString()
    });
  }

  public async publishReconnectStarted(sessionId: string, candidateId: string, attemptNumber: number, reason: string): Promise<void> {
    this.logger.info(`Publishing ReconnectStarted for session ${sessionId} attempt #${attemptNumber}`);
    await this.publisher.publish('ReconnectStarted', {
      sessionId,
      candidateId,
      attemptNumber,
      reason,
      initiatedAt: new Date().toISOString()
    });
  }

  public async publishReconnectCompleted(sessionId: string, candidateId: string, success: boolean): Promise<void> {
    this.logger.info(`Publishing ReconnectCompleted for session ${sessionId} success=${success}`);
    await this.publisher.publish('ReconnectCompleted', {
      sessionId,
      candidateId,
      success,
      completedAt: new Date().toISOString()
    });
  }

  public async publishCandidateDisconnected(sessionId: string, candidateId: string, reason: string): Promise<void> {
    this.logger.info(`Publishing CandidateDisconnected for session ${sessionId}`);
    await this.publisher.publish('CandidateDisconnected', {
      sessionId,
      candidateId,
      reason,
      disconnectedAt: new Date().toISOString()
    });
  }

  public async publishSessionTerminated(sessionId: string, examId: string, candidateId: string, reason: string, actorId: string): Promise<void> {
    this.logger.info(`Publishing SessionTerminated for session ${sessionId}`);
    await this.publisher.publish('SessionTerminated', {
      sessionId,
      examId,
      candidateId,
      reason,
      actorId,
      terminatedAt: new Date().toISOString()
    });
  }

  public async publishSessionSubmitted(session: CandidateSessionEntity): Promise<void> {
    this.logger.info(`Publishing SessionSubmitted for session ${session.sessionId}`);
    await this.publisher.publish('SessionSubmitted', {
      sessionId: session.sessionId,
      examId: session.examId,
      institutionId: session.institutionId,
      candidateId: session.candidateId,
      submittedAt: session.submittedAt
    });
  }

  public async publishSessionEnded(sessionId: string, examId: string, candidateId: string): Promise<void> {
    this.logger.info(`Publishing SessionEnded for session ${sessionId}`);
    await this.publisher.publish('SessionEnded', {
      sessionId,
      examId,
      candidateId,
      endedAt: new Date().toISOString()
    });
  }

  public async publishPolicyViolationDetected(
    sessionId: string,
    candidateId: string,
    violation: SessionViolationEntity
  ): Promise<void> {
    this.logger.warn(`Publishing PolicyViolationDetected for session ${sessionId}: ${violation.violationType}`);
    await this.publisher.publish('PolicyViolationDetected', {
      sessionId,
      candidateId,
      violationId: violation.violationId,
      violationType: violation.violationType,
      severity: violation.severity,
      autoAction: violation.autoAction,
      occurredAt: violation.occurredAt
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // EVENT CONSUMPTION SETUP
  // ─────────────────────────────────────────────────────────────────────────────

  public subscribeToExamEvents(
    onExamStarted: (examId: string) => void,
    onExamCancelled: (examId: string) => void,
    onExamEnded: (examId: string) => void
  ): void {
    this.logger.info('Subscribing to ExamStarted, ExamCancelled, ExamEnded events');
    // In a real system these would be consumed from a message broker.
    // With the InMemoryEventBus, subscribe directly:
    (this.publisher as any).bus?.subscribe?.('ExamStarted', (env: any) => {
      onExamStarted(env.payload?.examId);
    });
    (this.publisher as any).bus?.subscribe?.('ExamCancelled', (env: any) => {
      onExamCancelled(env.payload?.examId);
    });
    (this.publisher as any).bus?.subscribe?.('ExamEnded', (env: any) => {
      onExamEnded(env.payload?.examId);
    });
  }
}
