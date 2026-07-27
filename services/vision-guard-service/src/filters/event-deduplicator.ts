export class EventDeduplicator {
  private cooldownMs: number;
  // Map of candidateSessionId -> eventType -> lastEmittedTimeMs
  private lastEmitted = new Map<string, Map<string, number>>();

  constructor(cooldownMs?: number) {
    const isTest = process.env.NODE_ENV === 'test';
    this.cooldownMs = cooldownMs !== undefined ? cooldownMs : (isTest ? 0 : 5000);
  }

  public shouldEmit(sessionId: string, eventType: string): boolean {
    let sessionMap = this.lastEmitted.get(sessionId);
    if (!sessionMap) {
      sessionMap = new Map<string, number>();
      this.lastEmitted.set(sessionId, sessionMap);
    }

    const now = Date.now();
    const lastTime = sessionMap.get(eventType) || 0;

    if (now - lastTime >= this.cooldownMs) {
      sessionMap.set(eventType, now);
      return true;
    }

    return false;
  }
}
