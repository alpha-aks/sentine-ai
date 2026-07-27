import { Logger } from '@sentinel-ai/logger';
import { generateUuid } from '@sentinel-ai/utils';
import { SessionRepository } from '../db/SessionRepository';
import { SessionEventPublisher } from '../events/SessionEventPublisher';
import { SessionHeartbeatEntity, HeartbeatDto, HeartbeatStatusDto } from '../types/session';
import { SessionServiceConfig } from '../config/session-config';

export class HeartbeatMonitor {
  private readonly logger: Logger;

  constructor(
    private readonly repository: SessionRepository,
    private readonly eventPublisher: SessionEventPublisher,
    private readonly config: SessionServiceConfig
  ) {
    this.logger = new Logger({ serviceName: 'candidate-session-service' });
  }

  /**
   * Records a heartbeat for an active session.
   */
  public async recordHeartbeat(
    sessionId: string,
    candidateId: string,
    dto: HeartbeatDto
  ): Promise<SessionHeartbeatEntity> {
    const existing = await this.repository.getLatestHeartbeat(sessionId);
    const sequenceNumber = dto.sequenceNumber ?? ((existing?.sequenceNumber ?? 0) + 1);
    const now = new Date().toISOString();

    const entity: SessionHeartbeatEntity = {
      heartbeatId: generateUuid(),
      sessionId,
      candidateId,
      receivedAt: now,
      clientTimestamp: dto.clientTimestamp || now,
      latencyMs: dto.latencyMs ?? 0,
      networkType: dto.networkType ?? null,
      signalStrength: dto.signalStrength ?? null,
      isFullscreen: dto.isFullscreen ?? false,
      isFocused: dto.isFocused ?? true,
      isTabVisible: dto.isTabVisible ?? true,
      cpuUsagePercent: dto.cpuUsagePercent ?? null,
      memoryUsageMb: dto.memoryUsageMb ?? null,
      ipAddress: dto.ipAddress ?? null,
      sequenceNumber
    };

    await this.repository.appendHeartbeat(entity);
    await this.repository.updateSession(sessionId, { lastActivityAt: now });

    this.logger.debug(`Heartbeat received for session ${sessionId} seq=${sequenceNumber}`);
    await this.eventPublisher.publishHeartbeatReceived(sessionId, candidateId, sequenceNumber);

    return entity;
  }

  /**
   * Returns the heartbeat status for a session.
   */
  public getHeartbeatStatus(sessionId: string): HeartbeatStatusDto {
    const lastMs = this.repository.getLastHeartbeatMs(sessionId);
    const missCount = this.repository.getConsecutiveMissCount(sessionId);
    const timeoutMs = this.config.heartbeatTimeoutSeconds * 1000;
    const intervalMs = this.config.heartbeatIntervalSeconds * 1000;

    const now = Date.now();
    const isAlive = lastMs !== null && (now - lastMs) <= timeoutMs;
    const lastSeenAt = lastMs ? new Date(lastMs).toISOString() : null;
    const nextExpectedAt = lastMs ? new Date(lastMs + intervalMs).toISOString() : null;

    return {
      sessionId,
      isAlive,
      missCount,
      consecutiveMissCount: missCount,
      lastSeenAt,
      nextExpectedAt
    };
  }

  /**
   * Scans all active sessions and increments miss counts for those whose
   * heartbeat has timed out. Returns sessionIds that exceeded the threshold.
   */
  public async detectMissedHeartbeats(
    activeSessionIds: string[]
  ): Promise<{ timedOut: string[]; disconnected: string[] }> {
    const now = Date.now();
    const timeoutMs = this.config.heartbeatTimeoutSeconds * 1000;
    const maxMisses = this.config.maxConsecutiveMissesBeforeDisconnect;
    const timedOut: string[] = [];
    const disconnected: string[] = [];

    for (const sessionId of activeSessionIds) {
      const lastMs = this.repository.getLastHeartbeatMs(sessionId);
      if (lastMs === null) continue; // session never received a heartbeat yet

      const elapsed = now - lastMs;
      if (elapsed > timeoutMs) {
        const missCount = this.repository.incrementMissCount(sessionId);
        timedOut.push(sessionId);

        // Fetch candidate info from repository for events
        const session = await this.repository.findSessionById(sessionId);
        if (session) {
          this.logger.warn(`Heartbeat missed for session ${sessionId} (miss #${missCount})`);
          await this.eventPublisher.publishHeartbeatMissed(sessionId, session.candidateId, missCount);

          if (missCount >= maxMisses) {
            disconnected.push(sessionId);
            this.logger.error(
              `Session ${sessionId} exceeded max heartbeat misses (${missCount}/${maxMisses}) — marking disconnected`
            );
          }
        }
      }
    }

    return { timedOut, disconnected };
  }

  /**
   * Resets miss count on successful reconnect.
   */
  public resetMissCount(sessionId: string): void {
    this.repository.resetMissCount(sessionId);
  }
}
