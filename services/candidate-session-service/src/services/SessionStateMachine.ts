import { CandidateSessionEntity, SessionLifecycleState } from '../types/session';

// ─────────────────────────────────────────────────────────────────────────────
// VALID STATE TRANSITIONS TABLE
// ─────────────────────────────────────────────────────────────────────────────
//
// Key  = current state
// Value = set of allowed next states
//
const TRANSITIONS: Record<SessionLifecycleState, SessionLifecycleState[]> = {
  NOT_STARTED:   ['WAITING_ROOM', 'TERMINATED'],
  WAITING_ROOM:  ['READY', 'TERMINATED', 'DISQUALIFIED'],
  READY:         ['ACTIVE', 'WAITING_ROOM', 'TERMINATED', 'DISQUALIFIED'],
  ACTIVE:        ['PAUSED', 'RECONNECTING', 'SUSPENDED', 'SUBMITTED', 'TERMINATED', 'DISQUALIFIED'],
  PAUSED:        ['ACTIVE', 'TERMINATED', 'DISQUALIFIED'],
  RECONNECTING:  ['ACTIVE', 'TERMINATED', 'DISQUALIFIED'],
  SUSPENDED:     ['ACTIVE', 'TERMINATED', 'DISQUALIFIED'],
  SUBMITTED:     ['ENDED'],
  ENDED:         [],
  TERMINATED:    [],
  DISQUALIFIED:  []
};

const TERMINAL_STATES: SessionLifecycleState[] = ['SUBMITTED', 'ENDED', 'TERMINATED', 'DISQUALIFIED'];

export class SessionStateMachine {
  /**
   * Returns true if the transition from → to is valid.
   */
  public canTransition(from: SessionLifecycleState, to: SessionLifecycleState): boolean {
    return (TRANSITIONS[from] || []).includes(to);
  }

  /**
   * Returns the set of valid next states from the current state.
   */
  public getValidTransitions(state: SessionLifecycleState): SessionLifecycleState[] {
    return [...(TRANSITIONS[state] || [])];
  }

  /**
   * Returns true if the state is terminal (no further transitions allowed).
   */
  public isTerminal(state: SessionLifecycleState): boolean {
    return TERMINAL_STATES.includes(state);
  }

  /**
   * Validates the requested transition and returns the new state.
   * Throws SESSION_INVALID_TRANSITION if the transition is not allowed.
   */
  public transition(
    session: CandidateSessionEntity,
    targetState: SessionLifecycleState,
    actorId: string,
    reason?: string
  ): SessionLifecycleState {
    if (session.state === targetState) {
      // Idempotent — already in target state
      return targetState;
    }

    if (!this.canTransition(session.state, targetState)) {
      throw new Error(
        `SESSION_INVALID_TRANSITION: Cannot transition session ${session.sessionId} ` +
        `from ${session.state} to ${targetState}. ` +
        `Valid transitions: [${this.getValidTransitions(session.state).join(', ')}]`
      );
    }

    return targetState;
  }

  /**
   * Builds the timestamp fields that change on a state transition.
   */
  public buildTimestampUpdates(
    targetState: SessionLifecycleState
  ): Partial<CandidateSessionEntity> {
    const now = new Date().toISOString();
    const updates: Partial<CandidateSessionEntity> = { state: targetState, updatedAt: now };

    switch (targetState) {
      case 'WAITING_ROOM': updates.joinedAt = now; break;
      case 'READY':        updates.readyAt = now; break;
      case 'ACTIVE':       updates.startedAt = updates.startedAt ?? now; break;
      case 'SUBMITTED':    updates.submittedAt = now; break;
      case 'ENDED':        updates.endedAt = now; break;
      case 'TERMINATED':   updates.terminatedAt = now; break;
      case 'SUSPENDED':    updates.suspendedAt = now; break;
      default: break;
    }

    return updates;
  }
}
