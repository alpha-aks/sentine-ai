import { generateUuid } from '@sentinel-ai/utils';
import { Logger } from '@sentinel-ai/logger';
import { SessionRepository } from '../db/SessionRepository';
import { SessionCache } from '../cache/SessionCache';
import { SessionEventPublisher } from '../events/SessionEventPublisher';
import { SessionStateMachine } from './SessionStateMachine';
import { HeartbeatMonitor } from './HeartbeatMonitor';
import { SessionRecoveryEngine } from './SessionRecoveryEngine';
import { TimerEngine } from './TimerEngine';
import { PolicyEnforcer } from './PolicyEnforcer';
import { SessionServiceConfig, getSessionServiceConfig } from '../config/session-config';
import {
  CandidateSessionEntity,
  DeviceRegistrationEntity,
  DeviceType,
  DisconnectReason,
  ExamAnalyticsSummaryDto,
  HeartbeatDto,
  HeartbeatStatusDto,
  JoinSessionDto,
  PresenceEventEntity,
  PresenceEventType,
  RecordPresenceEventDto,
  ReconnectCompleteDto,
  ReconnectHistoryEntity,
  ReconnectInitiateDto,
  RegisterDeviceDto,
  ReportViolationDto,
  ResumeSessionDto,
  SessionAnalyticsEntity,
  SessionLifecycleState,
  SessionRecoveryEntity,
  SessionResponseDto,
  SessionStateHistoryEntity,
  SessionViolationEntity,
  SubmitSessionDto,
  SuspendSessionDto,
  TerminateSessionDto,
  TimerStateDto,
  TimerType
} from '../types/session';

export class SessionService {
  private readonly logger: Logger;
  private readonly stateMachine: SessionStateMachine;
  private readonly heartbeatMonitor: HeartbeatMonitor;
  private readonly recoveryEngine: SessionRecoveryEngine;
  private readonly timerEngine: TimerEngine;
  private readonly policyEnforcer: PolicyEnforcer;
  private readonly config: SessionServiceConfig;

  constructor(
    private readonly repository: SessionRepository = new SessionRepository(),
    private readonly cache: SessionCache = new SessionCache(300),
    private readonly eventPublisher: SessionEventPublisher = new SessionEventPublisher(),
    config?: SessionServiceConfig
  ) {
    this.config = config || getSessionServiceConfig();
    this.logger = new Logger({ serviceName: 'candidate-session-service' });
    this.stateMachine = new SessionStateMachine();
    this.heartbeatMonitor = new HeartbeatMonitor(this.repository, this.eventPublisher, this.config);
    this.recoveryEngine = new SessionRecoveryEngine(this.repository, this.config);
    this.timerEngine = new TimerEngine();
    this.policyEnforcer = new PolicyEnforcer(this.config);
  }

  // ─── Accessors ─────────────────────────────────────────────────────────────

  public getRepository(): SessionRepository { return this.repository; }
  public getCache(): SessionCache { return this.cache; }

  // ─── Audit helper ──────────────────────────────────────────────────────────

  private auditLog(action: string, message: string, opts: {
    userId: string; institutionId?: string; resourceId?: string; metadata?: Record<string, unknown>;
  }): void {
    this.logger.audit(action, message, {
      action, userId: opts.userId,
      institutionId: opts.institutionId || 'unknown',
      resourceId: opts.resourceId,
      payload: opts.metadata
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. SESSION LIFECYCLE — JOIN & CREATION
  // ─────────────────────────────────────────────────────────────────────────────

  public async joinExam(dto: JoinSessionDto, actorUserId: string): Promise<SessionResponseDto> {
    // Validate: prevent duplicate active session
    const existing = await this.repository.findActiveSessionByCandidate(dto.candidateId, dto.examId);
    if (existing) {
      throw new Error(
        `SESSION_ALREADY_EXISTS: Candidate ${dto.candidateId} already has an active session for exam ${dto.examId}`
      );
    }

    // Validate: required fields
    if (!dto.examId) throw new Error('SESSION_INVALID_INPUT: examId is required');
    if (!dto.institutionId) throw new Error('SESSION_INVALID_INPUT: institutionId is required');
    if (!dto.candidateId) throw new Error('SESSION_INVALID_INPUT: candidateId is required');
    if (!dto.candidateName) throw new Error('SESSION_INVALID_INPUT: candidateName is required');
    if (!dto.candidateEmail) throw new Error('SESSION_INVALID_INPUT: candidateEmail is required');
    if (!dto.examDurationSeconds || dto.examDurationSeconds <= 0) {
      throw new Error('SESSION_INVALID_INPUT: examDurationSeconds must be a positive integer');
    }

    const sessionId = generateUuid();
    const now = new Date().toISOString();

    const entity: CandidateSessionEntity = {
      sessionId,
      examId: dto.examId,
      institutionId: dto.institutionId,
      candidateId: dto.candidateId,
      candidateName: dto.candidateName,
      candidateEmail: dto.candidateEmail,
      state: 'WAITING_ROOM',
      scheduledStartAt: dto.scheduledStartAt ?? null,
      scheduledEndAt: dto.scheduledEndAt ?? null,
      joinedAt: now,
      readyAt: null,
      startedAt: null,
      submittedAt: null,
      endedAt: null,
      terminatedAt: null,
      lastActivityAt: now,
      examDurationSeconds: dto.examDurationSeconds,
      remainingSeconds: dto.examDurationSeconds,
      timerPausedAt: null,
      reconnectCount: 0,
      lastReconnectAt: null,
      currentReconnectToken: null,
      reconnectTokenExpiresAt: null,
      tabSwitchCount: 0,
      fullscreenExitCount: 0,
      idleTimeoutCount: 0,
      violationCount: 0,
      isSuspended: false,
      suspendedAt: null,
      suspendedById: null,
      suspensionReason: null,
      primaryDeviceId: null,
      ipAddress: null,
      metaData: {},
      createdAt: now,
      updatedAt: now
    };

    await this.repository.createSession(entity);
    await this.appendStateHistory(sessionId, null, 'WAITING_ROOM', actorUserId, 'Candidate joined exam');
    await this.updateAnalytics(entity);

    this.cache.setSession(entity);
    await this.eventPublisher.publishCandidateJoined(entity);

    this.auditLog('SESSION_JOINED', `Candidate ${dto.candidateId} joined exam ${dto.examId}`, {
      userId: actorUserId, institutionId: dto.institutionId, resourceId: sessionId,
      metadata: { examId: dto.examId }
    });

    return { session: entity };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. SESSION READ & LIST
  // ─────────────────────────────────────────────────────────────────────────────

  public async getSession(sessionId: string): Promise<SessionResponseDto> {
    const cached = this.cache.getSession(sessionId);
    if (cached) return { session: cached };

    const session = await this.repository.findSessionById(sessionId);
    if (!session) throw new Error(`SESSION_NOT_FOUND: Session ${sessionId} does not exist`);

    this.cache.setSession(session);
    return { session };
  }

  public async listSessionsByExam(
    examId: string,
    stateFilter?: SessionLifecycleState
  ): Promise<CandidateSessionEntity[]> {
    const cached = this.cache.getSessionListByExam(examId);
    if (cached && !stateFilter) return cached;

    const sessions = await this.repository.findSessionsByExam(examId, stateFilter);
    if (!stateFilter) this.cache.setSessionListByExam(examId, sessions);
    return sessions;
  }

  public async getActiveSessionCount(examId: string): Promise<number> {
    return this.repository.getActiveSessionCount(examId);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. STATE TRANSITIONS
  // ─────────────────────────────────────────────────────────────────────────────

  public async transitionState(
    sessionId: string,
    targetState: SessionLifecycleState,
    actorUserId: string,
    reason?: string
  ): Promise<SessionResponseDto> {
    const session = await this.requireSession(sessionId);
    const validatedState = this.stateMachine.transition(session, targetState, actorUserId, reason);
    const timestampUpdates = this.stateMachine.buildTimestampUpdates(validatedState);

    const updated = await this.repository.updateSession(sessionId, {
      ...timestampUpdates,
      state: validatedState
    });

    if (!updated) throw new Error(`SESSION_NOT_FOUND: Session ${sessionId} not found after update`);

    await this.appendStateHistory(sessionId, session.state, validatedState, actorUserId, reason);
    this.cache.invalidateSession(sessionId, session.candidateId, session.examId);
    this.cache.setSession(updated);

    await this.updateAnalytics(updated);

    this.logger.info(`Session ${sessionId} transitioned ${session.state} → ${validatedState}`);
    return { session: updated };
  }

  public async moveToReady(sessionId: string, actorUserId: string): Promise<SessionResponseDto> {
    return this.transitionState(sessionId, 'READY', actorUserId, 'Candidate device check passed');
  }

  public async startSession(sessionId: string, actorUserId: string): Promise<SessionResponseDto> {
    const res = await this.transitionState(sessionId, 'ACTIVE', actorUserId, 'Session started');
    // Start exam timer
    this.timerEngine.startTimer(sessionId, 'EXAM', res.session.examDurationSeconds);
    await this.eventPublisher.publishSessionStarted(res.session);
    return res;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. HEARTBEAT
  // ─────────────────────────────────────────────────────────────────────────────

  public async recordHeartbeat(
    sessionId: string,
    dto: HeartbeatDto
  ): Promise<{ heartbeat: any; status: HeartbeatStatusDto }> {
    const session = await this.requireSession(sessionId);
    if (this.stateMachine.isTerminal(session.state)) {
      throw new Error(`SESSION_TERMINATED: Cannot record heartbeat for session in ${session.state} state`);
    }

    const heartbeat = await this.heartbeatMonitor.recordHeartbeat(
      sessionId, session.candidateId, dto
    );

    const status = this.heartbeatMonitor.getHeartbeatStatus(sessionId);
    this.cache.setHeartbeatStatus(sessionId, status, this.config.heartbeatIntervalSeconds * 2);
    this.cache.invalidateSession(sessionId);

    return { heartbeat, status };
  }

  public async getHeartbeatStatus(sessionId: string): Promise<HeartbeatStatusDto> {
    const cached = this.cache.getHeartbeatStatus(sessionId);
    if (cached) return cached;

    const status = this.heartbeatMonitor.getHeartbeatStatus(sessionId);
    this.cache.setHeartbeatStatus(sessionId, status, this.config.heartbeatIntervalSeconds * 2);
    return status;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. DEVICE REGISTRATION
  // ─────────────────────────────────────────────────────────────────────────────

  public async registerDevice(sessionId: string, dto: RegisterDeviceDto): Promise<DeviceRegistrationEntity> {
    const session = await this.requireSession(sessionId);

    const deviceId = generateUuid();
    const entity: DeviceRegistrationEntity = {
      deviceId,
      sessionId,
      candidateId: session.candidateId,
      browser: dto.browser,
      browserVersion: dto.browserVersion,
      userAgent: dto.userAgent,
      os: dto.os,
      osVersion: dto.osVersion,
      deviceType: dto.deviceType ?? 'UNKNOWN' as DeviceType,
      fingerprint: dto.fingerprint,
      ipAddress: dto.ipAddress,
      macAddress: dto.macAddress ?? null,
      timezone: dto.timezone,
      language: dto.language,
      screenWidth: dto.screenWidth,
      screenHeight: dto.screenHeight,
      colorDepth: dto.colorDepth ?? 24,
      pixelRatio: dto.pixelRatio ?? 1,
      monitorCount: dto.monitorCount ?? 1,
      cpuCores: dto.cpuCores ?? null,
      memoryGb: dto.memoryGb ?? null,
      gpuInfo: dto.gpuInfo ?? null,
      storageGb: dto.storageGb ?? null,
      cameraAvailable: dto.cameraAvailable ?? false,
      microphoneAvailable: dto.microphoneAvailable ?? false,
      screenSharingAvailable: dto.screenSharingAvailable ?? false,
      networkType: dto.networkType ?? null,
      connectionSpeed: dto.connectionSpeed ?? null,
      isVirtualMachine: dto.isVirtualMachine ?? false,
      isEmulator: dto.isEmulator ?? false,
      registeredAt: new Date().toISOString()
    };

    await this.repository.registerDevice(entity);
    await this.repository.updateSession(sessionId, { primaryDeviceId: deviceId, ipAddress: dto.ipAddress });
    this.cache.setDevice(sessionId, entity);
    this.cache.invalidateSession(sessionId);

    this.logger.info(`Device registered for session ${sessionId}: ${dto.browser} on ${dto.os}`);
    return entity;
  }

  public async getDeviceInfo(sessionId: string): Promise<DeviceRegistrationEntity | null> {
    const cached = this.cache.getDevice(sessionId);
    if (cached) return cached;

    const device = await this.repository.getDeviceBySession(sessionId);
    if (device) this.cache.setDevice(sessionId, device);
    return device;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. RECONNECT & RECOVERY
  // ─────────────────────────────────────────────────────────────────────────────

  public async initiateReconnect(
    sessionId: string,
    dto: ReconnectInitiateDto,
    actorUserId: string
  ): Promise<{ recovery: SessionRecoveryEntity; session: CandidateSessionEntity }> {
    const session = await this.requireSession(sessionId);

    // Guard: cannot reconnect from terminal states
    if (this.stateMachine.isTerminal(session.state)) {
      throw new Error(`SESSION_TERMINATED: Session ${sessionId} is in a terminal state (${session.state})`);
    }

    // Guard: reconnect limit
    if (session.reconnectCount >= this.config.maxReconnectAttempts) {
      // Too many reconnects → terminate
      await this.transitionState(sessionId, 'TERMINATED', 'system',
        `Max reconnect attempts exceeded (${session.reconnectCount}/${this.config.maxReconnectAttempts})`);
      throw new Error(
        `SESSION_RECONNECT_LIMIT_EXCEEDED: Session has exceeded maximum reconnect attempts`
      );
    }

    // Transition to RECONNECTING
    const newCount = session.reconnectCount + 1;
    await this.transitionState(sessionId, 'RECONNECTING', actorUserId, `Reconnect initiated: ${dto.reason}`);

    // Generate recovery token (pauses timer)
    const timerState = this.timerEngine.pauseTimer(sessionId, 'EXAM');
    const remainingSeconds = timerState?.remainingSeconds ?? session.remainingSeconds;

    await this.repository.updateSession(sessionId, {
      reconnectCount: newCount,
      lastReconnectAt: new Date().toISOString(),
      remainingSeconds
    });

    this.cache.invalidateSession(sessionId);
    const updatedSession = await this.requireSession(sessionId);
    const recovery = await this.recoveryEngine.generateRecoveryToken(updatedSession, dto.reason);

    // Update session with token reference
    await this.repository.updateSession(sessionId, {
      currentReconnectToken: recovery.token,
      reconnectTokenExpiresAt: recovery.expiresAt
    });

    // Record reconnect history
    const reconnectRecord: ReconnectHistoryEntity = {
      reconnectId: generateUuid(),
      sessionId,
      candidateId: session.candidateId,
      attemptNumber: newCount,
      initiatedAt: new Date().toISOString(),
      completedAt: null,
      outcome: 'FAILED',
      reason: dto.reason,
      durationMs: null,
      tokenUsed: recovery.token,
      ipAddress: dto.ipAddress ?? null
    };
    await this.repository.appendReconnectHistory(reconnectRecord);

    await this.eventPublisher.publishReconnectStarted(sessionId, session.candidateId, newCount, dto.reason);
    await this.eventPublisher.publishCandidateDisconnected(sessionId, session.candidateId, dto.reason);
    this.cache.setRecoveryToken(sessionId, recovery);
    this.cache.invalidateSession(sessionId);

    const finalSession = await this.requireSession(sessionId);
    return { recovery, session: finalSession };
  }

  public async completeReconnect(
    sessionId: string,
    dto: ReconnectCompleteDto,
    actorUserId: string
  ): Promise<SessionResponseDto> {
    const startMs = Date.now();

    // Validate recovery token
    const recovery = await this.recoveryEngine.validateRecoveryToken(dto.token);
    if (recovery.sessionId !== sessionId) {
      throw new Error('SESSION_INVALID_TOKEN: Token does not match session');
    }

    const session = await this.requireSession(sessionId);
    if (session.state !== 'RECONNECTING') {
      throw new Error(`SESSION_INVALID_STATE: Session must be in RECONNECTING state to complete reconnect (current: ${session.state})`);
    }

    // Restore timer
    this.timerEngine.resumeTimer(sessionId, 'EXAM');

    // Transition back to ACTIVE
    const res = await this.transitionState(sessionId, 'ACTIVE', actorUserId, 'Reconnect successful');

    // Complete reconnect history
    const durationMs = Date.now() - startMs;
    await this.repository.completeReconnect(sessionId, 'SUCCESS', durationMs);

    // Reset miss count
    this.heartbeatMonitor.resetMissCount(sessionId);

    await this.eventPublisher.publishReconnectCompleted(sessionId, session.candidateId, true);
    this.cache.invalidateRecoveryToken(sessionId);

    this.logger.info(`Reconnect completed for session ${sessionId} in ${durationMs}ms`);
    return res;
  }

  public async getRecoveryState(sessionId: string): Promise<SessionRecoveryEntity | null> {
    const cached = this.cache.getRecoveryToken(sessionId);
    if (cached) return cached;

    const recovery = await this.repository.getActiveRecoveryToken(sessionId);
    if (recovery) this.cache.setRecoveryToken(sessionId, recovery);
    return recovery;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. PRESENCE TRACKING
  // ─────────────────────────────────────────────────────────────────────────────

  public async recordPresenceEvent(
    sessionId: string,
    dto: RecordPresenceEventDto
  ): Promise<PresenceEventEntity> {
    const session = await this.requireSession(sessionId);

    const entity: PresenceEventEntity = {
      eventId: generateUuid(),
      sessionId,
      candidateId: session.candidateId,
      eventType: dto.eventType,
      occurredAt: new Date().toISOString(),
      durationMs: dto.durationMs ?? null,
      metadata: dto.metadata ?? {}
    };

    await this.repository.appendPresenceEvent(entity);
    await this.repository.updateSession(sessionId, { lastActivityAt: new Date().toISOString() });
    this.cache.invalidateSession(sessionId);

    return entity;
  }

  public async getPresenceSummary(sessionId: string): Promise<{
    events: PresenceEventEntity[];
    focusLostCount: number;
    tabSwitchCount: number;
    fullscreenExitCount: number;
    reconnectCount: number;
  }> {
    const session = await this.requireSession(sessionId);
    const events = await this.repository.getPresenceEvents(sessionId);
    const focusLostCount = events.filter(e => e.eventType === 'FOCUS_LOST').length;
    const tabSwitchCount = events.filter(e => e.eventType === 'TAB_HIDDEN').length;
    const fullscreenExitCount = events.filter(e => e.eventType === 'FULLSCREEN_EXITED').length;

    return {
      events,
      focusLostCount,
      tabSwitchCount,
      fullscreenExitCount,
      reconnectCount: session.reconnectCount
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 8. POLICY VIOLATIONS
  // ─────────────────────────────────────────────────────────────────────────────

  public async reportViolation(
    sessionId: string,
    dto: ReportViolationDto,
    actorUserId: string
  ): Promise<{ violation: SessionViolationEntity; actionTaken: string }> {
    const session = await this.requireSession(sessionId);
    const existingViolations = await this.repository.getViolations(sessionId);

    const result = this.policyEnforcer.evaluateViolation(session, dto, existingViolations);
    await this.repository.appendViolation(result.violation);

    // Update session counters
    const updates: Partial<CandidateSessionEntity> = {
      violationCount: session.violationCount + 1
    };
    if (dto.violationType === 'TAB_SWITCH') {
      updates.tabSwitchCount = session.tabSwitchCount + 1;
    }
    if (dto.violationType === 'FULLSCREEN_EXIT') {
      updates.fullscreenExitCount = session.fullscreenExitCount + 1;
    }
    if (dto.violationType === 'IDLE_TIMEOUT') {
      updates.idleTimeoutCount = session.idleTimeoutCount + 1;
    }
    await this.repository.updateSession(sessionId, updates);
    this.cache.invalidateSession(sessionId);

    await this.eventPublisher.publishPolicyViolationDetected(sessionId, session.candidateId, result.violation);

    // Apply auto-action
    let actionTaken = result.autoAction;
    const updatedSession = await this.requireSession(sessionId);

    if (result.shouldDisqualify) {
      await this.transitionState(sessionId, 'DISQUALIFIED', 'system',
        `Auto-disqualified: ${dto.violationType}`);
    } else if (result.shouldTerminate) {
      await this.transitionState(sessionId, 'TERMINATED', 'system',
        `Auto-terminated: ${dto.violationType}`);
      await this.eventPublisher.publishSessionTerminated(
        sessionId, session.examId, session.candidateId,
        `Auto-terminated due to ${dto.violationType}`, 'system'
      );
    } else if (result.shouldSuspend) {
      const suspendedSession = {
        ...updatedSession,
        isSuspended: true,
        suspendedAt: new Date().toISOString(),
        suspendedById: 'system',
        suspensionReason: `Auto-suspended: ${dto.violationType}`
      };
      await this.repository.updateSession(sessionId, {
        isSuspended: true,
        suspendedAt: suspendedSession.suspendedAt,
        suspendedById: 'system',
        suspensionReason: suspendedSession.suspensionReason
      });
      await this.transitionState(sessionId, 'SUSPENDED', 'system',
        `Auto-suspended: ${dto.violationType}`);
    }

    this.auditLog('POLICY_VIOLATION', `Violation: ${dto.violationType} for session ${sessionId}`, {
      userId: actorUserId, institutionId: session.institutionId, resourceId: sessionId,
      metadata: { violationType: dto.violationType, action: actionTaken }
    });

    return { violation: result.violation, actionTaken };
  }

  public async getViolations(sessionId: string): Promise<SessionViolationEntity[]> {
    await this.requireSession(sessionId);
    return this.repository.getViolations(sessionId);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 9. TIMER MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  public getTimerState(sessionId: string, timerType: TimerType): TimerStateDto | null {
    const cached = this.cache.getTimerState(sessionId, timerType);
    if (cached) return cached;

    const state = this.timerEngine.getTimerState(sessionId, timerType);
    if (state) this.cache.setTimerState(sessionId, timerType, state);
    return state;
  }

  public async pauseTimer(sessionId: string, timerType: TimerType): Promise<TimerStateDto | null> {
    const state = this.timerEngine.pauseTimer(sessionId, timerType);
    if (state) {
      this.cache.setTimerState(sessionId, timerType, state);
      await this.repository.updateSession(sessionId, {
        remainingSeconds: state.remainingSeconds,
        timerPausedAt: new Date().toISOString()
      });
      this.cache.invalidateSession(sessionId);
    }
    return state;
  }

  public async resumeTimer(sessionId: string, timerType: TimerType): Promise<TimerStateDto | null> {
    const state = this.timerEngine.resumeTimer(sessionId, timerType);
    if (state) {
      this.cache.setTimerState(sessionId, timerType, state);
      await this.repository.updateSession(sessionId, { timerPausedAt: null });
      this.cache.invalidateSession(sessionId);
    }
    return state;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 10. SUSPENSION & RESUME
  // ─────────────────────────────────────────────────────────────────────────────

  public async suspendSession(
    sessionId: string,
    dto: SuspendSessionDto,
    actorUserId: string
  ): Promise<SessionResponseDto> {
    const session = await this.requireSession(sessionId);
    if (session.state !== 'ACTIVE' && session.state !== 'PAUSED') {
      throw new Error(`SESSION_INVALID_STATE: Can only suspend ACTIVE or PAUSED sessions (current: ${session.state})`);
    }

    await this.repository.updateSession(sessionId, {
      isSuspended: true,
      suspendedAt: new Date().toISOString(),
      suspendedById: actorUserId,
      suspensionReason: dto.reason
    });

    // Pause the exam timer during suspension
    this.timerEngine.pauseTimer(sessionId, 'EXAM');

    const res = await this.transitionState(sessionId, 'SUSPENDED', actorUserId, dto.reason);
    await this.eventPublisher.publishSessionPaused(sessionId, session.examId, actorUserId);

    this.auditLog('SESSION_SUSPENDED', `Session ${sessionId} suspended`, {
      userId: actorUserId, institutionId: session.institutionId, resourceId: sessionId,
      metadata: { reason: dto.reason }
    });

    return res;
  }

  public async resumeSession(
    sessionId: string,
    dto: ResumeSessionDto,
    actorUserId: string
  ): Promise<SessionResponseDto> {
    const session = await this.requireSession(sessionId);
    if (session.state !== 'SUSPENDED') {
      throw new Error(`SESSION_INVALID_STATE: Can only resume SUSPENDED sessions (current: ${session.state})`);
    }

    await this.repository.updateSession(sessionId, {
      isSuspended: false,
      suspensionReason: null
    });

    // Resume the exam timer
    this.timerEngine.resumeTimer(sessionId, 'EXAM');

    const res = await this.transitionState(sessionId, 'ACTIVE', actorUserId, dto.notes ?? 'Proctor resumed session');
    await this.eventPublisher.publishSessionResumed(sessionId, session.examId, actorUserId);

    this.auditLog('SESSION_RESUMED', `Session ${sessionId} resumed`, {
      userId: actorUserId, institutionId: session.institutionId, resourceId: sessionId
    });

    return res;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 11. SUBMIT & TERMINATE
  // ─────────────────────────────────────────────────────────────────────────────

  public async submitSession(
    sessionId: string,
    dto: SubmitSessionDto,
    actorUserId: string
  ): Promise<SessionResponseDto> {
    const session = await this.requireSession(sessionId);
    if (session.state !== 'ACTIVE' && session.state !== 'PAUSED') {
      throw new Error(`SESSION_INVALID_STATE: Can only submit ACTIVE or PAUSED sessions (current: ${session.state})`);
    }

    // Stop exam timer
    this.timerEngine.stopTimer(sessionId, 'EXAM');

    // Transition to SUBMITTED then ENDED
    await this.transitionState(sessionId, 'SUBMITTED', actorUserId, dto.notes ?? 'Candidate submitted');
    const res = await this.transitionState(sessionId, 'ENDED', 'system', 'Auto-ended after submission');

    await this.eventPublisher.publishSessionSubmitted(res.session);
    await this.eventPublisher.publishSessionEnded(sessionId, session.examId, session.candidateId);

    await this.updateAnalytics(res.session);

    this.auditLog('SESSION_SUBMITTED', `Session ${sessionId} submitted`, {
      userId: actorUserId, institutionId: session.institutionId, resourceId: sessionId
    });

    return res;
  }

  public async terminateSession(
    sessionId: string,
    dto: TerminateSessionDto,
    actorUserId: string
  ): Promise<SessionResponseDto> {
    const session = await this.requireSession(sessionId);

    if (this.stateMachine.isTerminal(session.state)) {
      throw new Error(`SESSION_ALREADY_TERMINAL: Session ${sessionId} is already in state ${session.state}`);
    }

    this.timerEngine.stopTimer(sessionId, 'EXAM');

    const res = await this.transitionState(sessionId, 'TERMINATED', actorUserId, dto.reason);

    await this.eventPublisher.publishSessionTerminated(
      sessionId, session.examId, session.candidateId, dto.reason, actorUserId
    );

    await this.updateAnalytics(res.session);

    this.auditLog('SESSION_TERMINATED', `Session ${sessionId} terminated`, {
      userId: actorUserId, institutionId: session.institutionId, resourceId: sessionId,
      metadata: { reason: dto.reason }
    });

    return res;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 12. ANALYTICS
  // ─────────────────────────────────────────────────────────────────────────────

  public async getSessionAnalytics(sessionId: string): Promise<SessionAnalyticsEntity | null> {
    const cached = this.cache.getAnalytics(sessionId);
    if (cached) return cached;

    const analytics = await this.repository.getAnalytics(sessionId);
    if (analytics) this.cache.setAnalytics(sessionId, analytics);
    return analytics;
  }

  public async getExamAnalyticsSummary(examId: string, institutionId: string): Promise<ExamAnalyticsSummaryDto> {
    return this.repository.getExamAnalyticsSummary(examId, institutionId);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 13. STATE HISTORY
  // ─────────────────────────────────────────────────────────────────────────────

  public async getStateHistory(sessionId: string): Promise<SessionStateHistoryEntity[]> {
    await this.requireSession(sessionId);
    return this.repository.getStateHistory(sessionId);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 14. HEARTBEAT SCAN (called by background task)
  // ─────────────────────────────────────────────────────────────────────────────

  public async runHeartbeatScan(): Promise<{ timedOut: string[]; disconnected: string[] }> {
    const activeSessions = this.repository.getAllActiveSessions();
    const activeIds = activeSessions.map(s => s.sessionId);
    const result = await this.heartbeatMonitor.detectMissedHeartbeats(activeIds);

    for (const sessionId of result.disconnected) {
      try {
        const session = await this.repository.findSessionById(sessionId);
        if (session && !this.stateMachine.isTerminal(session.state)) {
          await this.initiateReconnect(
            sessionId,
            { reason: 'HEARTBEAT_TIMEOUT' },
            'system'
          );
        }
      } catch (err: any) {
        this.logger.error(`Failed to handle heartbeat timeout for session ${sessionId}: ${err.message}`);
      }
    }

    return result;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PRIVATE HELPERS
  // ─────────────────────────────────────────────────────────────────────────────

  private async requireSession(sessionId: string): Promise<CandidateSessionEntity> {
    const cached = this.cache.getSession(sessionId);
    if (cached) return cached;

    const session = await this.repository.findSessionById(sessionId);
    if (!session) throw new Error(`SESSION_NOT_FOUND: Session ${sessionId} does not exist`);
    this.cache.setSession(session);
    return session;
  }

  private async appendStateHistory(
    sessionId: string,
    fromState: SessionLifecycleState | null,
    toState: SessionLifecycleState,
    actorId: string,
    reason?: string
  ): Promise<void> {
    const entity: SessionStateHistoryEntity = {
      historyId: generateUuid(),
      sessionId,
      fromState,
      toState,
      transitionedAt: new Date().toISOString(),
      actorId,
      reason: reason ?? null
    };
    await this.repository.appendStateHistory(entity);
  }

  private async updateAnalytics(session: CandidateSessionEntity): Promise<void> {
    const now = new Date().toISOString();
    const existing = await this.repository.getAnalytics(session.sessionId);

    const heartbeatHistory = await this.repository.getHeartbeatHistory(session.sessionId, 1000);
    const heartbeatCount = heartbeatHistory.length;
    const missedHeartbeatCount = this.repository.getConsecutiveMissCount(session.sessionId);
    const avgLatency = heartbeatCount > 0
      ? heartbeatHistory.reduce((s, h) => s + h.latencyMs, 0) / heartbeatCount
      : 0;

    const violations = await this.repository.getViolations(session.sessionId);
    const stateHistory = await this.repository.getStateHistory(session.sessionId);

    // Calculate time spent in each state using history
    const stateSeconds: Record<string, number> = {};
    for (let i = 0; i < stateHistory.length - 1; i++) {
      const from = stateHistory[i].toState;
      const t1 = new Date(stateHistory[i].transitionedAt).getTime();
      const t2 = new Date(stateHistory[i + 1].transitionedAt).getTime();
      stateSeconds[from] = (stateSeconds[from] ?? 0) + (t2 - t1) / 1000;
    }

    const joinTime = session.joinedAt ? new Date(session.joinedAt).getTime() : Date.now();
    const endTime = session.endedAt || session.terminatedAt || session.submittedAt
      ? new Date(session.endedAt || session.terminatedAt || session.submittedAt!).getTime()
      : Date.now();

    const totalDurationSeconds = Math.round((endTime - joinTime) / 1000);
    const reconnectDuration = Math.round((stateSeconds['RECONNECTING'] ?? 0));
    const activeDuration = Math.round((stateSeconds['ACTIVE'] ?? 0));

    const analytics: SessionAnalyticsEntity = {
      analyticsId: existing?.analyticsId ?? generateUuid(),
      sessionId: session.sessionId,
      examId: session.examId,
      institutionId: session.institutionId,
      candidateId: session.candidateId,
      totalDurationSeconds,
      activeDurationSeconds: activeDuration,
      idleDurationSeconds: Math.round(stateSeconds['PAUSED'] ?? 0),
      reconnectDurationSeconds: reconnectDuration,
      heartbeatCount,
      missedHeartbeatCount,
      reconnectCount: session.reconnectCount,
      tabSwitchCount: session.tabSwitchCount,
      fullscreenExitCount: session.fullscreenExitCount,
      violationCount: violations.length,
      avgHeartbeatLatencyMs: Math.round(avgLatency),
      avgResponseTimeSeconds: 0,
      timeInWaitingRoom: Math.round(stateSeconds['WAITING_ROOM'] ?? 0),
      timeInActive: activeDuration,
      timeInPaused: Math.round(stateSeconds['PAUSED'] ?? 0),
      timeInReconnecting: reconnectDuration,
      timeInSuspended: Math.round(stateSeconds['SUSPENDED'] ?? 0),
      finalState: session.state,
      updatedAt: now
    };

    await this.repository.upsertAnalytics(analytics);
    this.cache.setAnalytics(session.sessionId, analytics);
  }
}
