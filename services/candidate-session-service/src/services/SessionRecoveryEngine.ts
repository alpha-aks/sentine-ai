import { createHmac, createHash, randomBytes } from 'crypto';
import { generateUuid } from '@sentinel-ai/utils';
import { Logger } from '@sentinel-ai/logger';
import { SessionRepository } from '../db/SessionRepository';
import {
  CandidateSessionEntity,
  DisconnectReason,
  SessionRecoveryEntity,
  SessionRecoveryPayload
} from '../types/session';
import { SessionServiceConfig } from '../config/session-config';

export class SessionRecoveryEngine {
  private readonly logger: Logger;
  private readonly usedNonces = new Set<string>(); // replay-attack protection

  constructor(
    private readonly repository: SessionRepository,
    private readonly config: SessionServiceConfig
  ) {
    this.logger = new Logger({ serviceName: 'candidate-session-service' });
  }

  /**
   * Generates a signed, time-limited recovery token for a session.
   * Token format: base64(nonce:sessionId:candidateId:expiresEpoch):HMAC-SHA256
   */
  public async generateRecoveryToken(
    session: CandidateSessionEntity,
    reason: DisconnectReason
  ): Promise<SessionRecoveryEntity> {
    // Invalidate any previously active token for this session
    await this.invalidateExistingToken(session.sessionId);

    const nonce = randomBytes(16).toString('hex');
    const expiresEpoch = Date.now() + this.config.reconnectTokenTtlSeconds * 1000;
    const expiresAt = new Date(expiresEpoch).toISOString();

    const payload = `${nonce}:${session.sessionId}:${session.candidateId}:${expiresEpoch}`;
    const hmac = createHmac('sha256', this.config.jwtSecret).update(payload).digest('hex');
    const tokenRaw = `${Buffer.from(payload).toString('base64')}.${hmac}`;

    const tokenHash = createHash('sha256').update(tokenRaw).digest('hex');

    const recoveryPayload: SessionRecoveryPayload = {
      state: session.state,
      remainingSeconds: session.remainingSeconds,
      questionCursor: 0,
      sectionCursor: 0,
      tabSwitchCount: session.tabSwitchCount,
      violationCount: session.violationCount,
      reconnectCount: session.reconnectCount,
      snapshotAt: new Date().toISOString()
    };

    const entity: SessionRecoveryEntity = {
      recoveryId: generateUuid(),
      sessionId: session.sessionId,
      candidateId: session.candidateId,
      token: tokenRaw,
      tokenHash,
      isUsed: false,
      usedAt: null,
      expiresAt,
      reason,
      recoveryPayload,
      createdAt: new Date().toISOString()
    };

    await this.repository.createRecoveryToken(entity);
    this.logger.info(`Recovery token generated for session ${session.sessionId} (expires ${expiresAt})`);

    return entity;
  }

  /**
   * Validates a recovery token.
   * Checks: signature, expiry, single-use (replay attack protection).
   * Returns the recovery entity on success.
   */
  public async validateRecoveryToken(token: string): Promise<SessionRecoveryEntity> {
    // 1. Parse token
    const dotIdx = token.lastIndexOf('.');
    if (dotIdx < 0) {
      throw new Error('SESSION_INVALID_TOKEN: Malformed recovery token');
    }
    const encodedPayload = token.substring(0, dotIdx);
    const providedHmac = token.substring(dotIdx + 1);

    let rawPayload: string;
    try {
      rawPayload = Buffer.from(encodedPayload, 'base64').toString('utf-8');
    } catch {
      throw new Error('SESSION_INVALID_TOKEN: Cannot decode token payload');
    }

    // 2. Verify HMAC signature
    const expectedHmac = createHmac('sha256', this.config.jwtSecret).update(rawPayload).digest('hex');
    if (!this.timingSafeEqual(expectedHmac, providedHmac)) {
      throw new Error('SESSION_INVALID_TOKEN: Token signature verification failed');
    }

    // 3. Parse payload fields
    const parts = rawPayload.split(':');
    if (parts.length < 4) {
      throw new Error('SESSION_INVALID_TOKEN: Token payload structure invalid');
    }
    const [nonce, sessionId, candidateId, expiresEpochStr] = parts;
    const expiresEpoch = parseInt(expiresEpochStr, 10);

    // 4. Check expiry
    if (Date.now() > expiresEpoch) {
      throw new Error('SESSION_TOKEN_EXPIRED: Recovery token has expired');
    }

    // 5. Replay attack check via nonce
    if (this.usedNonces.has(nonce)) {
      throw new Error('SESSION_TOKEN_REPLAYED: Recovery token has already been used');
    }

    // 6. Look up in repository
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const entity = await this.repository.findRecoveryTokenByHash(tokenHash);
    if (!entity) {
      throw new Error('SESSION_TOKEN_NOT_FOUND: Recovery token not recognised');
    }

    if (entity.isUsed) {
      throw new Error('SESSION_TOKEN_REPLAYED: Recovery token has already been consumed');
    }

    if (entity.sessionId !== sessionId || entity.candidateId !== candidateId) {
      throw new Error('SESSION_INVALID_TOKEN: Token session/candidate mismatch');
    }

    // 7. Mark token as used & record nonce
    await this.repository.markTokenUsed(entity.recoveryId);
    this.usedNonces.add(nonce);

    this.logger.info(`Recovery token validated for session ${sessionId}`);
    return { ...entity, isUsed: true };
  }

  /**
   * Builds the session recovery payload for restoring a session.
   */
  public buildRecoveryPayload(session: CandidateSessionEntity): SessionRecoveryPayload {
    return {
      state: session.state,
      remainingSeconds: session.remainingSeconds,
      questionCursor: 0,
      sectionCursor: 0,
      tabSwitchCount: session.tabSwitchCount,
      violationCount: session.violationCount,
      reconnectCount: session.reconnectCount,
      snapshotAt: new Date().toISOString()
    };
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private async invalidateExistingToken(sessionId: string): Promise<void> {
    const active = await this.repository.getActiveRecoveryToken(sessionId);
    if (active) {
      await this.repository.markTokenUsed(active.recoveryId);
    }
  }

  /** Constant-time string comparison to prevent timing attacks. */
  private timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    let diff = 0;
    for (let i = 0; i < bufA.length; i++) {
      diff |= bufA[i] ^ bufB[i];
    }
    return diff === 0;
  }
}
