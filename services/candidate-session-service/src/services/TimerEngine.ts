import { TimerStateDto, TimerType } from '../types/session';

interface TimerRecord {
  sessionId: string;
  timerType: TimerType;
  totalSeconds: number;
  startedAt: number;    // epoch ms
  pausedAt: number | null;
  remainingAtPause: number | null;
  isRunning: boolean;
  isPaused: boolean;
}

export class TimerEngine {
  private readonly timers = new Map<string, TimerRecord>(); // key = sessionId:timerType

  private key(sessionId: string, timerType: TimerType): string {
    return `${sessionId}:${timerType}`;
  }

  /**
   * Starts a new timer for a session.
   */
  public startTimer(sessionId: string, timerType: TimerType, durationSeconds: number): TimerStateDto {
    const k = this.key(sessionId, timerType);
    const record: TimerRecord = {
      sessionId,
      timerType,
      totalSeconds: durationSeconds,
      startedAt: Date.now(),
      pausedAt: null,
      remainingAtPause: null,
      isRunning: true,
      isPaused: false
    };
    this.timers.set(k, record);
    return this.buildDto(record);
  }

  /**
   * Returns current timer state including remaining time.
   */
  public getTimerState(sessionId: string, timerType: TimerType): TimerStateDto | null {
    const record = this.timers.get(this.key(sessionId, timerType));
    if (!record) return null;
    return this.buildDto(record);
  }

  /**
   * Pauses a running timer, snapshots remaining time.
   */
  public pauseTimer(sessionId: string, timerType: TimerType): TimerStateDto | null {
    const k = this.key(sessionId, timerType);
    const record = this.timers.get(k);
    if (!record || record.isPaused || !record.isRunning) return record ? this.buildDto(record) : null;

    const remaining = this.calcRemaining(record);
    const updated: TimerRecord = {
      ...record,
      pausedAt: Date.now(),
      remainingAtPause: remaining,
      isRunning: false,
      isPaused: true
    };
    this.timers.set(k, updated);
    return this.buildDto(updated);
  }

  /**
   * Resumes a paused timer from where it was paused.
   */
  public resumeTimer(sessionId: string, timerType: TimerType): TimerStateDto | null {
    const k = this.key(sessionId, timerType);
    const record = this.timers.get(k);
    if (!record || !record.isPaused) return record ? this.buildDto(record) : null;

    const remaining = record.remainingAtPause ?? record.totalSeconds;
    const updated: TimerRecord = {
      ...record,
      startedAt: Date.now() - ((record.totalSeconds - remaining) * 1000),
      pausedAt: null,
      remainingAtPause: null,
      isRunning: true,
      isPaused: false
    };
    this.timers.set(k, updated);
    return this.buildDto(updated);
  }

  /**
   * Stops a timer permanently.
   */
  public stopTimer(sessionId: string, timerType: TimerType): void {
    const k = this.key(sessionId, timerType);
    const record = this.timers.get(k);
    if (record) {
      this.timers.set(k, { ...record, isRunning: false, isPaused: false });
    }
  }

  /**
   * Returns true if the timer has expired.
   */
  public isExpired(sessionId: string, timerType: TimerType): boolean {
    const record = this.timers.get(this.key(sessionId, timerType));
    if (!record) return false;
    return this.calcRemaining(record) <= 0;
  }

  /**
   * Scans all tracked timers and returns those that have expired.
   */
  public getExpiredTimers(): Array<{ sessionId: string; timerType: TimerType }> {
    const expired: Array<{ sessionId: string; timerType: TimerType }> = [];
    for (const record of this.timers.values()) {
      if (record.isRunning && this.calcRemaining(record) <= 0) {
        expired.push({ sessionId: record.sessionId, timerType: record.timerType });
      }
    }
    return expired;
  }

  /**
   * Removes all timers for a session.
   */
  public clearSession(sessionId: string): void {
    for (const key of Array.from(this.timers.keys())) {
      if (key.startsWith(`${sessionId}:`)) this.timers.delete(key);
    }
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private calcRemaining(record: TimerRecord): number {
    if (record.isPaused && record.remainingAtPause !== null) {
      return Math.max(0, record.remainingAtPause);
    }
    const elapsedMs = Date.now() - record.startedAt;
    const elapsedSec = elapsedMs / 1000;
    return Math.max(0, record.totalSeconds - elapsedSec);
  }

  private buildDto(record: TimerRecord): TimerStateDto {
    const remaining = this.calcRemaining(record);
    const elapsed = record.totalSeconds - remaining;
    const isExpired = remaining <= 0 && record.isRunning;
    const expiresAt = record.isRunning
      ? new Date(record.startedAt + record.totalSeconds * 1000).toISOString()
      : null;

    return {
      sessionId: record.sessionId,
      timerType: record.timerType,
      totalSeconds: record.totalSeconds,
      remainingSeconds: Math.round(remaining),
      elapsedSeconds: Math.round(elapsed),
      isRunning: record.isRunning,
      isPaused: record.isPaused,
      isExpired,
      startedAt: new Date(record.startedAt).toISOString(),
      pausedAt: record.pausedAt ? new Date(record.pausedAt).toISOString() : null,
      expiresAt
    };
  }
}
