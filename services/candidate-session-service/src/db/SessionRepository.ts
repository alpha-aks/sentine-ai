import { generateUuid } from '@sentinel-ai/utils';
import {
  CandidateSessionEntity,
  DeviceRegistrationEntity,
  ExamAnalyticsSummaryDto,
  PresenceEventEntity,
  PresenceEventType,
  ReconnectHistoryEntity,
  ReconnectOutcome,
  SessionAnalyticsEntity,
  SessionHeartbeatEntity,
  SessionLifecycleState,
  SessionRecoveryEntity,
  SessionStateHistoryEntity,
  SessionViolationEntity
} from '../types/session';

export class SessionRepository {
  // ── Primary stores ──────────────────────────────────────────────────────────
  private readonly sessions = new Map<string, CandidateSessionEntity>();
  private readonly heartbeats = new Map<string, SessionHeartbeatEntity[]>();
  private readonly devices = new Map<string, DeviceRegistrationEntity>();
  private readonly recoveryTokens = new Map<string, SessionRecoveryEntity>();
  private readonly presenceEvents = new Map<string, PresenceEventEntity[]>();
  private readonly reconnectHistory = new Map<string, ReconnectHistoryEntity[]>();
  private readonly stateHistory = new Map<string, SessionStateHistoryEntity[]>();
  private readonly violations = new Map<string, SessionViolationEntity[]>();
  private readonly analytics = new Map<string, SessionAnalyticsEntity>();

  // ── Secondary indexes ───────────────────────────────────────────────────────
  private readonly sessionsByExam = new Map<string, Set<string>>();          // examId → sessionIds
  private readonly sessionsByCandidate = new Map<string, string>();           // candidateId:examId → sessionId
  private readonly sessionsByInstitution = new Map<string, Set<string>>();   // institutionId → sessionIds
  private readonly devicesBySession = new Map<string, string>();              // sessionId → deviceId
  private readonly tokenHashIndex = new Map<string, string>();                // tokenHash → recoveryId

  // ── Heartbeat miss tracking ─────────────────────────────────────────────────
  private readonly heartbeatMissCounts = new Map<string, number>();           // sessionId → missCount
  private readonly lastHeartbeatAt = new Map<string, number>();               // sessionId → epoch ms

  // ─────────────────────────────────────────────────────────────────────────────
  // SESSIONS
  // ─────────────────────────────────────────────────────────────────────────────

  public async createSession(entity: CandidateSessionEntity): Promise<CandidateSessionEntity> {
    this.sessions.set(entity.sessionId, { ...entity });

    // Index by exam
    if (!this.sessionsByExam.has(entity.examId)) {
      this.sessionsByExam.set(entity.examId, new Set());
    }
    this.sessionsByExam.get(entity.examId)!.add(entity.sessionId);

    // Index by institution
    if (!this.sessionsByInstitution.has(entity.institutionId)) {
      this.sessionsByInstitution.set(entity.institutionId, new Set());
    }
    this.sessionsByInstitution.get(entity.institutionId)!.add(entity.sessionId);

    // Index by candidate+exam (ensures one active session per candidate per exam)
    const key = `${entity.candidateId}:${entity.examId}`;
    this.sessionsByCandidate.set(key, entity.sessionId);

    return { ...entity };
  }

  public async findSessionById(sessionId: string): Promise<CandidateSessionEntity | null> {
    return this.sessions.has(sessionId) ? { ...this.sessions.get(sessionId)! } : null;
  }

  public async updateSession(sessionId: string, updates: Partial<CandidateSessionEntity>): Promise<CandidateSessionEntity | null> {
    const existing = this.sessions.get(sessionId);
    if (!existing) return null;
    const updated: CandidateSessionEntity = {
      ...existing,
      ...updates,
      sessionId,
      updatedAt: new Date().toISOString()
    };
    this.sessions.set(sessionId, updated);
    return { ...updated };
  }

  public async findActiveSessionByCandidate(candidateId: string, examId: string): Promise<CandidateSessionEntity | null> {
    const key = `${candidateId}:${examId}`;
    const sessionId = this.sessionsByCandidate.get(key);
    if (!sessionId) return null;
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    const terminal: SessionLifecycleState[] = ['SUBMITTED', 'ENDED', 'TERMINATED', 'DISQUALIFIED'];
    return terminal.includes(session.state) ? null : { ...session };
  }

  public async findSessionsByExam(
    examId: string,
    stateFilter?: SessionLifecycleState
  ): Promise<CandidateSessionEntity[]> {
    const ids = this.sessionsByExam.get(examId) || new Set<string>();
    const results: CandidateSessionEntity[] = [];
    for (const id of ids) {
      const s = this.sessions.get(id);
      if (s && (!stateFilter || s.state === stateFilter)) {
        results.push({ ...s });
      }
    }
    return results;
  }

  public async findSessionsByInstitution(
    institutionId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{ items: CandidateSessionEntity[]; total: number }> {
    const ids = Array.from(this.sessionsByInstitution.get(institutionId) || new Set<string>());
    const total = ids.length;
    const items = ids
      .slice((page - 1) * limit, page * limit)
      .map(id => this.sessions.get(id))
      .filter((s): s is CandidateSessionEntity => s !== undefined)
      .map(s => ({ ...s }));
    return { items, total };
  }

  public async getActiveSessionCount(examId: string): Promise<number> {
    const terminal: SessionLifecycleState[] = ['SUBMITTED', 'ENDED', 'TERMINATED', 'DISQUALIFIED'];
    const ids = this.sessionsByExam.get(examId) || new Set<string>();
    let count = 0;
    for (const id of ids) {
      const s = this.sessions.get(id);
      if (s && !terminal.includes(s.state)) count++;
    }
    return count;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HEARTBEATS
  // ─────────────────────────────────────────────────────────────────────────────

  public async appendHeartbeat(entity: SessionHeartbeatEntity): Promise<void> {
    if (!this.heartbeats.has(entity.sessionId)) {
      this.heartbeats.set(entity.sessionId, []);
    }
    this.heartbeats.get(entity.sessionId)!.push({ ...entity });
    this.lastHeartbeatAt.set(entity.sessionId, Date.now());
    this.heartbeatMissCounts.set(entity.sessionId, 0); // reset on successful heartbeat
  }

  public async getLatestHeartbeat(sessionId: string): Promise<SessionHeartbeatEntity | null> {
    const list = this.heartbeats.get(sessionId);
    if (!list || list.length === 0) return null;
    return { ...list[list.length - 1] };
  }

  public async getHeartbeatHistory(sessionId: string, limit: number = 100): Promise<SessionHeartbeatEntity[]> {
    const list = this.heartbeats.get(sessionId) || [];
    return list.slice(-limit).map(h => ({ ...h }));
  }

  public getLastHeartbeatMs(sessionId: string): number | null {
    return this.lastHeartbeatAt.get(sessionId) ?? null;
  }

  public getConsecutiveMissCount(sessionId: string): number {
    return this.heartbeatMissCounts.get(sessionId) ?? 0;
  }

  public incrementMissCount(sessionId: string): number {
    const current = this.heartbeatMissCounts.get(sessionId) ?? 0;
    const next = current + 1;
    this.heartbeatMissCounts.set(sessionId, next);
    return next;
  }

  public resetMissCount(sessionId: string): void {
    this.heartbeatMissCounts.set(sessionId, 0);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DEVICES
  // ─────────────────────────────────────────────────────────────────────────────

  public async registerDevice(entity: DeviceRegistrationEntity): Promise<DeviceRegistrationEntity> {
    this.devices.set(entity.deviceId, { ...entity });
    this.devicesBySession.set(entity.sessionId, entity.deviceId);
    return { ...entity };
  }

  public async getDevice(deviceId: string): Promise<DeviceRegistrationEntity | null> {
    return this.devices.has(deviceId) ? { ...this.devices.get(deviceId)! } : null;
  }

  public async getDeviceBySession(sessionId: string): Promise<DeviceRegistrationEntity | null> {
    const deviceId = this.devicesBySession.get(sessionId);
    if (!deviceId) return null;
    return this.getDevice(deviceId);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RECOVERY TOKENS
  // ─────────────────────────────────────────────────────────────────────────────

  public async createRecoveryToken(entity: SessionRecoveryEntity): Promise<SessionRecoveryEntity> {
    this.recoveryTokens.set(entity.recoveryId, { ...entity });
    this.tokenHashIndex.set(entity.tokenHash, entity.recoveryId);
    return { ...entity };
  }

  public async findRecoveryTokenByHash(tokenHash: string): Promise<SessionRecoveryEntity | null> {
    const id = this.tokenHashIndex.get(tokenHash);
    if (!id) return null;
    return this.recoveryTokens.has(id) ? { ...this.recoveryTokens.get(id)! } : null;
  }

  public async markTokenUsed(recoveryId: string): Promise<void> {
    const entity = this.recoveryTokens.get(recoveryId);
    if (entity) {
      this.recoveryTokens.set(recoveryId, {
        ...entity,
        isUsed: true,
        usedAt: new Date().toISOString()
      });
    }
  }

  public async getActiveRecoveryToken(sessionId: string): Promise<SessionRecoveryEntity | null> {
    const now = new Date().toISOString();
    for (const entity of this.recoveryTokens.values()) {
      if (entity.sessionId === sessionId && !entity.isUsed && entity.expiresAt > now) {
        return { ...entity };
      }
    }
    return null;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PRESENCE EVENTS
  // ─────────────────────────────────────────────────────────────────────────────

  public async appendPresenceEvent(entity: PresenceEventEntity): Promise<void> {
    if (!this.presenceEvents.has(entity.sessionId)) {
      this.presenceEvents.set(entity.sessionId, []);
    }
    this.presenceEvents.get(entity.sessionId)!.push({ ...entity });
  }

  public async getPresenceEvents(sessionId: string, limit: number = 200): Promise<PresenceEventEntity[]> {
    const list = this.presenceEvents.get(sessionId) || [];
    return list.slice(-limit).map(e => ({ ...e }));
  }

  public async getPresenceEventsByType(sessionId: string, eventType: PresenceEventType): Promise<PresenceEventEntity[]> {
    const list = this.presenceEvents.get(sessionId) || [];
    return list.filter(e => e.eventType === eventType).map(e => ({ ...e }));
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RECONNECT HISTORY
  // ─────────────────────────────────────────────────────────────────────────────

  public async appendReconnectHistory(entity: ReconnectHistoryEntity): Promise<void> {
    if (!this.reconnectHistory.has(entity.sessionId)) {
      this.reconnectHistory.set(entity.sessionId, []);
    }
    this.reconnectHistory.get(entity.sessionId)!.push({ ...entity });
  }

  public async completeReconnect(sessionId: string, outcome: ReconnectOutcome, durationMs: number): Promise<void> {
    const history = this.reconnectHistory.get(sessionId);
    if (!history || history.length === 0) return;
    const last = history[history.length - 1];
    history[history.length - 1] = {
      ...last,
      outcome,
      completedAt: new Date().toISOString(),
      durationMs
    };
  }

  public async getReconnectHistory(sessionId: string): Promise<ReconnectHistoryEntity[]> {
    return (this.reconnectHistory.get(sessionId) || []).map(r => ({ ...r }));
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STATE HISTORY
  // ─────────────────────────────────────────────────────────────────────────────

  public async appendStateHistory(entity: SessionStateHistoryEntity): Promise<void> {
    if (!this.stateHistory.has(entity.sessionId)) {
      this.stateHistory.set(entity.sessionId, []);
    }
    this.stateHistory.get(entity.sessionId)!.push({ ...entity });
  }

  public async getStateHistory(sessionId: string): Promise<SessionStateHistoryEntity[]> {
    return (this.stateHistory.get(sessionId) || []).map(h => ({ ...h }));
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // VIOLATIONS
  // ─────────────────────────────────────────────────────────────────────────────

  public async appendViolation(entity: SessionViolationEntity): Promise<void> {
    if (!this.violations.has(entity.sessionId)) {
      this.violations.set(entity.sessionId, []);
    }
    this.violations.get(entity.sessionId)!.push({ ...entity });
  }

  public async getViolations(sessionId: string): Promise<SessionViolationEntity[]> {
    return (this.violations.get(sessionId) || []).map(v => ({ ...v }));
  }

  public async acknowledgeViolation(violationId: string, acknowledgedById: string): Promise<void> {
    for (const [, list] of this.violations) {
      const idx = list.findIndex(v => v.violationId === violationId);
      if (idx !== -1) {
        list[idx] = {
          ...list[idx],
          acknowledgedAt: new Date().toISOString(),
          acknowledgedById
        };
        return;
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ANALYTICS
  // ─────────────────────────────────────────────────────────────────────────────

  public async upsertAnalytics(entity: SessionAnalyticsEntity): Promise<void> {
    this.analytics.set(entity.sessionId, { ...entity });
  }

  public async getAnalytics(sessionId: string): Promise<SessionAnalyticsEntity | null> {
    return this.analytics.has(sessionId) ? { ...this.analytics.get(sessionId)! } : null;
  }

  public async getExamAnalyticsSummary(examId: string, institutionId: string): Promise<ExamAnalyticsSummaryDto> {
    const sessionIds = Array.from(this.sessionsByExam.get(examId) || new Set<string>());
    const sessions = sessionIds.map(id => this.sessions.get(id)).filter(Boolean) as CandidateSessionEntity[];

    const totalSessions = sessions.length;
    const activeSessions = sessions.filter(s => ['ACTIVE', 'PAUSED', 'RECONNECTING', 'SUSPENDED', 'WAITING_ROOM', 'READY'].includes(s.state)).length;
    const submittedSessions = sessions.filter(s => s.state === 'SUBMITTED' || s.state === 'ENDED').length;
    const terminatedSessions = sessions.filter(s => s.state === 'TERMINATED').length;
    const disqualifiedSessions = sessions.filter(s => s.state === 'DISQUALIFIED').length;

    let totalDuration = 0;
    let totalReconnects = 0;
    let totalViolations = 0;
    for (const id of sessionIds) {
      const a = this.analytics.get(id);
      if (a) {
        totalDuration += a.totalDurationSeconds;
        totalReconnects += a.reconnectCount;
        totalViolations += a.violationCount;
      }
    }

    const divider = totalSessions || 1;
    return {
      examId,
      institutionId,
      totalSessions,
      activeSessions,
      submittedSessions,
      terminatedSessions,
      disqualifiedSessions,
      avgDurationSeconds: Math.round(totalDuration / divider),
      avgReconnectCount: Math.round((totalReconnects / divider) * 100) / 100,
      avgViolationCount: Math.round((totalViolations / divider) * 100) / 100,
      totalViolations
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // BULK / SCAN
  // ─────────────────────────────────────────────────────────────────────────────

  public getAllActiveSessions(): CandidateSessionEntity[] {
    const active: SessionLifecycleState[] = ['ACTIVE', 'PAUSED', 'RECONNECTING', 'SUSPENDED', 'WAITING_ROOM', 'READY'];
    const result: CandidateSessionEntity[] = [];
    for (const session of this.sessions.values()) {
      if (active.includes(session.state)) result.push({ ...session });
    }
    return result;
  }

  public generateId(prefix: string = ''): string {
    return prefix ? `${prefix}_${generateUuid()}` : generateUuid();
  }
}
