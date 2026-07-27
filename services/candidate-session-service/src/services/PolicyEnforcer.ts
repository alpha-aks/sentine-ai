import { generateUuid } from '@sentinel-ai/utils';
import { Logger } from '@sentinel-ai/logger';
import {
  CandidateSessionEntity,
  ReportViolationDto,
  SessionViolationEntity,
  ViolationAutoAction,
  ViolationSeverity,
  ViolationType
} from '../types/session';
import { SessionServiceConfig } from '../config/session-config';

// ─── Severity & auto-action mapping ──────────────────────────────────────────

const VIOLATION_SEVERITY: Record<ViolationType, ViolationSeverity> = {
  FULLSCREEN_EXIT:          'MEDIUM',
  TAB_SWITCH:               'MEDIUM',
  IDLE_TIMEOUT:             'LOW',
  MAX_DISCONNECTS_EXCEEDED: 'HIGH',
  COPY_PASTE:               'MEDIUM',
  DEV_TOOLS_OPEN:           'HIGH',
  MULTI_MONITOR:            'HIGH',
  SUSPICIOUS_ACTIVITY:      'CRITICAL',
  BROWSER_LOCK_BROKEN:      'CRITICAL',
  VIRTUAL_MACHINE_DETECTED: 'CRITICAL'
};

export interface PolicyViolationResult {
  violation: SessionViolationEntity;
  autoAction: ViolationAutoAction;
  shouldSuspend: boolean;
  shouldTerminate: boolean;
  shouldDisqualify: boolean;
}

export class PolicyEnforcer {
  private readonly logger: Logger;

  constructor(private readonly config: SessionServiceConfig) {
    this.logger = new Logger({ serviceName: 'candidate-session-service' });
  }

  /**
   * Evaluates a reported violation, determines severity and recommended auto-action.
   */
  public evaluateViolation(
    session: CandidateSessionEntity,
    dto: ReportViolationDto,
    existingViolations: SessionViolationEntity[]
  ): PolicyViolationResult {
    const severity = VIOLATION_SEVERITY[dto.violationType] || 'LOW';
    const autoAction = this.determineAutoAction(session, dto.violationType, existingViolations);

    const violation: SessionViolationEntity = {
      violationId: generateUuid(),
      sessionId: session.sessionId,
      candidateId: session.candidateId,
      violationType: dto.violationType,
      severity,
      autoAction,
      autoActionApplied: autoAction !== 'NONE',
      detail: dto.detail ?? null,
      occurredAt: new Date().toISOString(),
      acknowledgedAt: null,
      acknowledgedById: null
    };

    const shouldSuspend = autoAction === 'SUSPEND';
    const shouldTerminate = autoAction === 'TERMINATE';
    const shouldDisqualify = autoAction === 'DISQUALIFY';

    if (autoAction !== 'NONE') {
      this.logger.warn(
        `Policy violation for session ${session.sessionId}: ${dto.violationType} → auto-action: ${autoAction}`
      );
    }

    return { violation, autoAction, shouldSuspend, shouldTerminate, shouldDisqualify };
  }

  /**
   * Counts violations by type for a session.
   */
  public getViolationCounts(violations: SessionViolationEntity[]): Record<ViolationType, number> {
    const counts: Partial<Record<ViolationType, number>> = {};
    for (const v of violations) {
      counts[v.violationType] = (counts[v.violationType] ?? 0) + 1;
    }
    return counts as Record<ViolationType, number>;
  }

  /**
   * Checks whether idle timeout should trigger auto-submit.
   */
  public shouldAutoSubmit(session: CandidateSessionEntity, idleSeconds: number): boolean {
    return (
      this.config.autoSubmitOnExpiry &&
      idleSeconds >= this.config.idleTimeoutMinutes * 60
    );
  }

  /**
   * Checks the number of disconnects in history and decides if the session
   * should be terminated.
   */
  public shouldTerminateOnDisconnect(reconnectCount: number): boolean {
    return reconnectCount >= this.config.disconnectsBeforeTerminate;
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private determineAutoAction(
    session: CandidateSessionEntity,
    violationType: ViolationType,
    existing: SessionViolationEntity[]
  ): ViolationAutoAction {
    const counts = this.getViolationCounts(existing);
    const thisTypeCount = (counts[violationType] ?? 0) + 1; // include the current violation

    switch (violationType) {
      case 'VIRTUAL_MACHINE_DETECTED':
      case 'BROWSER_LOCK_BROKEN':
        return 'DISQUALIFY';

      case 'SUSPICIOUS_ACTIVITY':
        return thisTypeCount >= 2 ? 'TERMINATE' : 'WARN';

      case 'DEV_TOOLS_OPEN':
      case 'MULTI_MONITOR':
        return thisTypeCount >= 2 ? 'TERMINATE' : 'SUSPEND';

      case 'MAX_DISCONNECTS_EXCEEDED':
        return 'TERMINATE';

      case 'TAB_SWITCH':
        if (thisTypeCount >= this.config.maxTabSwitches) return 'TERMINATE';
        if (thisTypeCount >= this.config.tabSwitchesBeforeSuspend) return 'SUSPEND';
        return 'WARN';

      case 'FULLSCREEN_EXIT':
        if (thisTypeCount >= this.config.maxFullscreenExits) return 'SUSPEND';
        return 'WARN';

      case 'IDLE_TIMEOUT':
        if (thisTypeCount >= this.config.maxIdleTimeouts) return 'SUSPEND';
        return 'WARN';

      case 'COPY_PASTE':
        return thisTypeCount >= 3 ? 'SUSPEND' : 'WARN';

      default:
        return 'WARN';
    }
  }
}
