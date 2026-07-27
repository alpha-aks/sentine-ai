import {
  CandidateSessionEntity,
  DeviceRegistrationEntity,
  HeartbeatStatusDto,
  SessionAnalyticsEntity,
  SessionRecoveryEntity,
  TimerStateDto,
  TimerType
} from '../types/session';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class SessionCache {
  private readonly ttlMs: number;

  // Active sessions
  private readonly sessionById = new Map<string, CacheEntry<CandidateSessionEntity>>();
  private readonly sessionByCandidateExam = new Map<string, CacheEntry<string>>(); // key → sessionId
  private readonly sessionListByExam = new Map<string, CacheEntry<CandidateSessionEntity[]>>();

  // Heartbeat state
  private readonly heartbeatStatus = new Map<string, CacheEntry<HeartbeatStatusDto>>();

  // Timer snapshots
  private readonly timerState = new Map<string, CacheEntry<TimerStateDto>>(); // sessionId:timerType → state

  // Device
  private readonly deviceBySession = new Map<string, CacheEntry<DeviceRegistrationEntity>>();

  // Recovery tokens
  private readonly recoveryBySession = new Map<string, CacheEntry<SessionRecoveryEntity>>();

  // Analytics
  private readonly analyticsBySession = new Map<string, CacheEntry<SessionAnalyticsEntity>>();

  constructor(ttlSeconds: number = 300) {
    this.ttlMs = ttlSeconds * 1000;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Generic helpers
  // ─────────────────────────────────────────────────────────────────────────────

  private set<T>(map: Map<string, CacheEntry<T>>, key: string, value: T, ttlMs?: number): void {
    map.set(key, { value, expiresAt: Date.now() + (ttlMs ?? this.ttlMs) });
  }

  private get<T>(map: Map<string, CacheEntry<T>>, key: string): T | null {
    const entry = map.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      map.delete(key);
      return null;
    }
    return entry.value;
  }

  private delete<T>(map: Map<string, CacheEntry<T>>, key: string): void {
    map.delete(key);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Session cache
  // ─────────────────────────────────────────────────────────────────────────────

  public setSession(session: CandidateSessionEntity): void {
    this.set(this.sessionById, session.sessionId, session);
    const ck = `${session.candidateId}:${session.examId}`;
    this.set(this.sessionByCandidateExam, ck, session.sessionId);
  }

  public getSession(sessionId: string): CandidateSessionEntity | null {
    return this.get(this.sessionById, sessionId);
  }

  public getSessionIdByCandidateExam(candidateId: string, examId: string): string | null {
    return this.get(this.sessionByCandidateExam, `${candidateId}:${examId}`);
  }

  public invalidateSession(sessionId: string, candidateId?: string, examId?: string): void {
    this.delete(this.sessionById, sessionId);
    if (candidateId && examId) {
      this.delete(this.sessionByCandidateExam, `${candidateId}:${examId}`);
    }
    this.invalidateSessionListByExam(examId || '');
  }

  public setSessionListByExam(examId: string, list: CandidateSessionEntity[]): void {
    this.set(this.sessionListByExam, examId, list);
  }

  public getSessionListByExam(examId: string): CandidateSessionEntity[] | null {
    return this.get(this.sessionListByExam, examId);
  }

  public invalidateSessionListByExam(examId: string): void {
    this.delete(this.sessionListByExam, examId);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Heartbeat state cache (short TTL = 2x heartbeat interval)
  // ─────────────────────────────────────────────────────────────────────────────

  public setHeartbeatStatus(sessionId: string, status: HeartbeatStatusDto, ttlSeconds: number = 30): void {
    this.set(this.heartbeatStatus, sessionId, status, ttlSeconds * 1000);
  }

  public getHeartbeatStatus(sessionId: string): HeartbeatStatusDto | null {
    return this.get(this.heartbeatStatus, sessionId);
  }

  public invalidateHeartbeatStatus(sessionId: string): void {
    this.delete(this.heartbeatStatus, sessionId);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Timer cache
  // ─────────────────────────────────────────────────────────────────────────────

  public setTimerState(sessionId: string, timerType: TimerType, state: TimerStateDto): void {
    this.set(this.timerState, `${sessionId}:${timerType}`, state);
  }

  public getTimerState(sessionId: string, timerType: TimerType): TimerStateDto | null {
    return this.get(this.timerState, `${sessionId}:${timerType}`);
  }

  public invalidateTimerState(sessionId: string, timerType?: TimerType): void {
    if (timerType) {
      this.delete(this.timerState, `${sessionId}:${timerType}`);
    } else {
      // Clear all timers for session
      for (const key of Array.from(this.timerState.keys())) {
        if (key.startsWith(`${sessionId}:`)) this.timerState.delete(key);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Device cache
  // ─────────────────────────────────────────────────────────────────────────────

  public setDevice(sessionId: string, device: DeviceRegistrationEntity): void {
    this.set(this.deviceBySession, sessionId, device);
  }

  public getDevice(sessionId: string): DeviceRegistrationEntity | null {
    return this.get(this.deviceBySession, sessionId);
  }

  public invalidateDevice(sessionId: string): void {
    this.delete(this.deviceBySession, sessionId);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Recovery token cache
  // ─────────────────────────────────────────────────────────────────────────────

  public setRecoveryToken(sessionId: string, recovery: SessionRecoveryEntity): void {
    this.set(this.recoveryBySession, sessionId, recovery, 900_000); // 15 min
  }

  public getRecoveryToken(sessionId: string): SessionRecoveryEntity | null {
    return this.get(this.recoveryBySession, sessionId);
  }

  public invalidateRecoveryToken(sessionId: string): void {
    this.delete(this.recoveryBySession, sessionId);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Analytics cache
  // ─────────────────────────────────────────────────────────────────────────────

  public setAnalytics(sessionId: string, analytics: SessionAnalyticsEntity): void {
    this.set(this.analyticsBySession, sessionId, analytics);
  }

  public getAnalytics(sessionId: string): SessionAnalyticsEntity | null {
    return this.get(this.analyticsBySession, sessionId);
  }

  public invalidateAnalytics(sessionId: string): void {
    this.delete(this.analyticsBySession, sessionId);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Global invalidation
  // ─────────────────────────────────────────────────────────────────────────────

  public invalidateAll(sessionId: string, candidateId?: string, examId?: string): void {
    this.invalidateSession(sessionId, candidateId, examId);
    this.invalidateHeartbeatStatus(sessionId);
    this.invalidateTimerState(sessionId);
    this.invalidateDevice(sessionId);
    this.invalidateRecoveryToken(sessionId);
    this.invalidateAnalytics(sessionId);
  }
}
