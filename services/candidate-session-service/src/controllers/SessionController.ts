import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth-middleware';
import { TenantRequest } from '../middleware/tenant-middleware';
import { SessionService } from '../services/SessionService';
import {
  HeartbeatDto,
  JoinSessionDto,
  RecordPresenceEventDto,
  ReconnectCompleteDto,
  ReconnectInitiateDto,
  RegisterDeviceDto,
  ReportViolationDto,
  ResumeSessionDto,
  SessionLifecycleState,
  SessionSearchQueryDto,
  SubmitSessionDto,
  SuspendSessionDto,
  TerminateSessionDto,
  TimerType,
  TransitionStateDto
} from '../types/session';

type Req = TenantRequest & { body: any; params: any; query: any };

function ok(res: Response, data: unknown, status: number = 200): void {
  res.status(status).json({
    success: true,
    data,
    meta: { timestamp: new Date().toISOString() }
  });
}

export class SessionController {
  private readonly service: SessionService;

  constructor(service?: SessionService) {
    this.service = service || new SessionService();

    // Bind all handlers
    this.joinExam = this.joinExam.bind(this);
    this.getSession = this.getSession.bind(this);
    this.listSessionsByExam = this.listSessionsByExam.bind(this);
    this.getActiveSessionCount = this.getActiveSessionCount.bind(this);
    this.moveToReady = this.moveToReady.bind(this);
    this.startSession = this.startSession.bind(this);
    this.transitionState = this.transitionState.bind(this);
    this.recordHeartbeat = this.recordHeartbeat.bind(this);
    this.getHeartbeatStatus = this.getHeartbeatStatus.bind(this);
    this.registerDevice = this.registerDevice.bind(this);
    this.getDeviceInfo = this.getDeviceInfo.bind(this);
    this.initiateReconnect = this.initiateReconnect.bind(this);
    this.completeReconnect = this.completeReconnect.bind(this);
    this.getRecoveryState = this.getRecoveryState.bind(this);
    this.recordPresenceEvent = this.recordPresenceEvent.bind(this);
    this.getPresenceSummary = this.getPresenceSummary.bind(this);
    this.reportViolation = this.reportViolation.bind(this);
    this.getViolations = this.getViolations.bind(this);
    this.getTimerState = this.getTimerState.bind(this);
    this.pauseTimer = this.pauseTimer.bind(this);
    this.resumeTimer = this.resumeTimer.bind(this);
    this.suspendSession = this.suspendSession.bind(this);
    this.resumeSession = this.resumeSession.bind(this);
    this.submitSession = this.submitSession.bind(this);
    this.terminateSession = this.terminateSession.bind(this);
    this.getSessionAnalytics = this.getSessionAnalytics.bind(this);
    this.getExamAnalyticsSummary = this.getExamAnalyticsSummary.bind(this);
    this.getStateHistory = this.getStateHistory.bind(this);
  }

  // ─── Session Lifecycle ────────────────────────────────────────────────────

  public async joinExam(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorUserId = (req as AuthenticatedRequest).user?.userId || 'unknown';
      const dto: JoinSessionDto = req.body;
      const result = await this.service.joinExam(dto, actorUserId);
      ok(res, result, 201);
    } catch (err) { next(err); }
  }

  public async getSession(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      const result = await this.service.getSession(sessionId);
      ok(res, result);
    } catch (err) { next(err); }
  }

  public async listSessionsByExam(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const { examId } = req.params;
      const stateFilter = req.query.state as SessionLifecycleState | undefined;
      const sessions = await this.service.listSessionsByExam(examId, stateFilter);
      ok(res, { items: sessions, total: sessions.length });
    } catch (err) { next(err); }
  }

  public async getActiveSessionCount(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const { examId } = req.params;
      const count = await this.service.getActiveSessionCount(examId);
      ok(res, { examId, activeCount: count });
    } catch (err) { next(err); }
  }

  public async moveToReady(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorUserId = (req as AuthenticatedRequest).user?.userId || 'unknown';
      const result = await this.service.moveToReady(req.params.sessionId, actorUserId);
      ok(res, result);
    } catch (err) { next(err); }
  }

  public async startSession(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorUserId = (req as AuthenticatedRequest).user?.userId || 'unknown';
      const result = await this.service.startSession(req.params.sessionId, actorUserId);
      ok(res, result);
    } catch (err) { next(err); }
  }

  public async transitionState(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorUserId = (req as AuthenticatedRequest).user?.userId || 'unknown';
      const dto: TransitionStateDto = req.body;
      const result = await this.service.transitionState(
        req.params.sessionId, dto.targetState, actorUserId, dto.reason
      );
      ok(res, result);
    } catch (err) { next(err); }
  }

  // ─── Heartbeat ────────────────────────────────────────────────────────────

  public async recordHeartbeat(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: HeartbeatDto = req.body;
      const result = await this.service.recordHeartbeat(req.params.sessionId, dto);
      ok(res, result);
    } catch (err) { next(err); }
  }

  public async getHeartbeatStatus(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = await this.service.getHeartbeatStatus(req.params.sessionId);
      ok(res, status);
    } catch (err) { next(err); }
  }

  // ─── Device ───────────────────────────────────────────────────────────────

  public async registerDevice(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: RegisterDeviceDto = req.body;
      const device = await this.service.registerDevice(req.params.sessionId, dto);
      ok(res, device, 201);
    } catch (err) { next(err); }
  }

  public async getDeviceInfo(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const device = await this.service.getDeviceInfo(req.params.sessionId);
      ok(res, device);
    } catch (err) { next(err); }
  }

  // ─── Reconnect ───────────────────────────────────────────────────────────

  public async initiateReconnect(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorUserId = (req as AuthenticatedRequest).user?.userId || 'unknown';
      const dto: ReconnectInitiateDto = req.body;
      const result = await this.service.initiateReconnect(req.params.sessionId, dto, actorUserId);
      ok(res, result);
    } catch (err) { next(err); }
  }

  public async completeReconnect(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorUserId = (req as AuthenticatedRequest).user?.userId || 'unknown';
      const dto: ReconnectCompleteDto = req.body;
      const result = await this.service.completeReconnect(req.params.sessionId, dto, actorUserId);
      ok(res, result);
    } catch (err) { next(err); }
  }

  public async getRecoveryState(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const recovery = await this.service.getRecoveryState(req.params.sessionId);
      ok(res, recovery);
    } catch (err) { next(err); }
  }

  // ─── Presence ────────────────────────────────────────────────────────────

  public async recordPresenceEvent(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: RecordPresenceEventDto = req.body;
      const event = await this.service.recordPresenceEvent(req.params.sessionId, dto);
      ok(res, event, 201);
    } catch (err) { next(err); }
  }

  public async getPresenceSummary(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await this.service.getPresenceSummary(req.params.sessionId);
      ok(res, summary);
    } catch (err) { next(err); }
  }

  // ─── Violations ──────────────────────────────────────────────────────────

  public async reportViolation(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorUserId = (req as AuthenticatedRequest).user?.userId || 'unknown';
      const dto: ReportViolationDto = req.body;
      const result = await this.service.reportViolation(req.params.sessionId, dto, actorUserId);
      ok(res, result, 201);
    } catch (err) { next(err); }
  }

  public async getViolations(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const violations = await this.service.getViolations(req.params.sessionId);
      ok(res, { items: violations, total: violations.length });
    } catch (err) { next(err); }
  }

  // ─── Timer ───────────────────────────────────────────────────────────────

  public async getTimerState(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const timerType = req.params.type as TimerType;
      const state = this.service.getTimerState(req.params.sessionId, timerType);
      ok(res, state);
    } catch (err) { next(err); }
  }

  public async pauseTimer(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const timerType = req.params.type as TimerType;
      const state = await this.service.pauseTimer(req.params.sessionId, timerType);
      ok(res, state);
    } catch (err) { next(err); }
  }

  public async resumeTimer(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const timerType = req.params.type as TimerType;
      const state = await this.service.resumeTimer(req.params.sessionId, timerType);
      ok(res, state);
    } catch (err) { next(err); }
  }

  // ─── Suspension & Resume ─────────────────────────────────────────────────

  public async suspendSession(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorUserId = (req as AuthenticatedRequest).user?.userId || 'unknown';
      const dto: SuspendSessionDto = req.body;
      const result = await this.service.suspendSession(req.params.sessionId, dto, actorUserId);
      ok(res, result);
    } catch (err) { next(err); }
  }

  public async resumeSession(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorUserId = (req as AuthenticatedRequest).user?.userId || 'unknown';
      const dto: ResumeSessionDto = req.body;
      const result = await this.service.resumeSession(req.params.sessionId, dto, actorUserId);
      ok(res, result);
    } catch (err) { next(err); }
  }

  // ─── Submit & Terminate ──────────────────────────────────────────────────

  public async submitSession(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorUserId = (req as AuthenticatedRequest).user?.userId || 'unknown';
      const dto: SubmitSessionDto = req.body;
      const result = await this.service.submitSession(req.params.sessionId, dto, actorUserId);
      ok(res, result);
    } catch (err) { next(err); }
  }

  public async terminateSession(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorUserId = (req as AuthenticatedRequest).user?.userId || 'unknown';
      const dto: TerminateSessionDto = req.body;
      const result = await this.service.terminateSession(req.params.sessionId, dto, actorUserId);
      ok(res, result);
    } catch (err) { next(err); }
  }

  // ─── Analytics ───────────────────────────────────────────────────────────

  public async getSessionAnalytics(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const analytics = await this.service.getSessionAnalytics(req.params.sessionId);
      ok(res, analytics);
    } catch (err) { next(err); }
  }

  public async getExamAnalyticsSummary(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const { examId } = req.params;
      const institutionId = (req as TenantRequest).institutionId || req.query.institutionId as string;
      const summary = await this.service.getExamAnalyticsSummary(examId, institutionId);
      ok(res, summary);
    } catch (err) { next(err); }
  }

  public async getStateHistory(req: Req, res: Response, next: NextFunction): Promise<void> {
    try {
      const history = await this.service.getStateHistory(req.params.sessionId);
      ok(res, { items: history, total: history.length });
    } catch (err) { next(err); }
  }
}
