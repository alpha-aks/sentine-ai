import assert from 'assert';
import { test, describe, beforeEach } from 'node:test';
import { SessionRepository } from '../db/SessionRepository';
import { SessionCache } from '../cache/SessionCache';
import { SessionEventPublisher } from '../events/SessionEventPublisher';
import { SessionStateMachine } from '../services/SessionStateMachine';
import { HeartbeatMonitor } from '../services/HeartbeatMonitor';
import { SessionRecoveryEngine } from '../services/SessionRecoveryEngine';
import { TimerEngine } from '../services/TimerEngine';
import { PolicyEnforcer } from '../services/PolicyEnforcer';
import { SessionService } from '../services/SessionService';
import { getSessionServiceConfig } from '../config/session-config';
import type {
  CandidateSessionEntity,
  JoinSessionDto,
  SessionLifecycleState
} from '../types/session';

// ─────────────────────────────────────────────────────────────────────────────
// Shared fixture helpers
// ─────────────────────────────────────────────────────────────────────────────

function makeService(): { service: SessionService; repo: SessionRepository; cache: SessionCache } {
  const repo = new SessionRepository();
  const cache = new SessionCache(300);
  const service = new SessionService(repo, cache, new SessionEventPublisher());
  return { service, repo, cache };
}

const DEFAULT_JOIN: JoinSessionDto = {
  examId: 'exam_001',
  institutionId: 'inst_001',
  candidateId: 'cand_001',
  candidateName: 'Alice Smith',
  candidateEmail: 'alice@test.com',
  examDurationSeconds: 3600
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. SESSION LIFECYCLE & STATE MACHINE
// ─────────────────────────────────────────────────────────────────────────────

describe('1. Session Lifecycle & State Machine', () => {
  let service: SessionService;
  let sm: SessionStateMachine;

  beforeEach(() => {
    ({ service } = makeService());
    sm = new SessionStateMachine();
  });

  test('1.1 Join exam creates session in WAITING_ROOM state', async () => {
    const res = await service.joinExam(DEFAULT_JOIN, 'u1');
    assert.strictEqual(res.session.state, 'WAITING_ROOM');
    assert.ok(res.session.sessionId);
    assert.ok(res.session.joinedAt);
  });

  test('1.2 Valid transition: WAITING_ROOM → READY', async () => {
    const { session } = await service.joinExam(DEFAULT_JOIN, 'u1');
    const res = await service.moveToReady(session.sessionId, 'u1');
    assert.strictEqual(res.session.state, 'READY');
    assert.ok(res.session.readyAt);
  });

  test('1.3 Valid transition: READY → ACTIVE', async () => {
    const { session } = await service.joinExam(DEFAULT_JOIN, 'u1');
    await service.moveToReady(session.sessionId, 'u1');
    const res = await service.startSession(session.sessionId, 'u1');
    assert.strictEqual(res.session.state, 'ACTIVE');
    assert.ok(res.session.startedAt);
  });

  test('1.4 Valid transition: ACTIVE → SUBMITTED → ENDED', async () => {
    const { session } = await service.joinExam(DEFAULT_JOIN, 'u1');
    await service.moveToReady(session.sessionId, 'u1');
    await service.startSession(session.sessionId, 'u1');
    const res = await service.submitSession(session.sessionId, {}, 'u1');
    assert.strictEqual(res.session.state, 'ENDED');
    assert.ok(res.session.submittedAt);
    assert.ok(res.session.endedAt);
  });

  test('1.5 Valid transition: ACTIVE → TERMINATED', async () => {
    const { session } = await service.joinExam(DEFAULT_JOIN, 'u1');
    await service.moveToReady(session.sessionId, 'u1');
    await service.startSession(session.sessionId, 'u1');
    const res = await service.terminateSession(session.sessionId, { reason: 'Proctor decision' }, 'proctor1');
    assert.strictEqual(res.session.state, 'TERMINATED');
    assert.ok(res.session.terminatedAt);
  });

  test('1.6 Invalid transition: WAITING_ROOM → ACTIVE throws', async () => {
    const { session } = await service.joinExam(DEFAULT_JOIN, 'u1');
    await assert.rejects(
      () => service.startSession(session.sessionId, 'u1'),
      /SESSION_INVALID_TRANSITION/
    );
  });

  test('1.7 Cannot transition from ENDED (terminal state)', async () => {
    const { session } = await service.joinExam(DEFAULT_JOIN, 'u1');
    await service.moveToReady(session.sessionId, 'u1');
    await service.startSession(session.sessionId, 'u1');
    await service.submitSession(session.sessionId, {}, 'u1');

    await assert.rejects(
      () => service.terminateSession(session.sessionId, { reason: 'test' }, 'admin'),
      /SESSION_ALREADY_TERMINAL/
    );
  });

  test('1.8 isTerminal returns true for terminal states', () => {
    const terminals: SessionLifecycleState[] = ['SUBMITTED', 'ENDED', 'TERMINATED', 'DISQUALIFIED'];
    for (const s of terminals) {
      assert.ok(sm.isTerminal(s), `Expected ${s} to be terminal`);
    }
    const nonTerminals: SessionLifecycleState[] = ['NOT_STARTED', 'WAITING_ROOM', 'READY', 'ACTIVE', 'PAUSED', 'RECONNECTING', 'SUSPENDED'];
    for (const s of nonTerminals) {
      assert.ok(!sm.isTerminal(s), `Expected ${s} to be non-terminal`);
    }
  });

  test('1.9 getValidTransitions returns correct states for ACTIVE', () => {
    const valid = sm.getValidTransitions('ACTIVE');
    assert.ok(valid.includes('PAUSED'));
    assert.ok(valid.includes('RECONNECTING'));
    assert.ok(valid.includes('SUSPENDED'));
    assert.ok(valid.includes('SUBMITTED'));
    assert.ok(valid.includes('TERMINATED'));
    assert.ok(valid.includes('DISQUALIFIED'));
    assert.ok(!valid.includes('WAITING_ROOM'));
  });

  test('1.10 Duplicate session join throws SESSION_ALREADY_EXISTS', async () => {
    await service.joinExam(DEFAULT_JOIN, 'u1');
    await assert.rejects(
      () => service.joinExam(DEFAULT_JOIN, 'u1'),
      /SESSION_ALREADY_EXISTS/
    );
  });

  test('1.11 State history is recorded on every transition', async () => {
    const { session } = await service.joinExam(DEFAULT_JOIN, 'u1');
    await service.moveToReady(session.sessionId, 'u1');
    await service.startSession(session.sessionId, 'u1');

    const history = await service.getStateHistory(session.sessionId);
    assert.ok(history.length >= 3);
    assert.strictEqual(history[0].toState, 'WAITING_ROOM');
    assert.strictEqual(history[1].toState, 'READY');
    assert.strictEqual(history[2].toState, 'ACTIVE');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. EXAM JOIN VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

describe('2. Exam Join Validation', () => {
  let service: SessionService;

  beforeEach(() => { ({ service } = makeService()); });

  test('2.1 Missing examId throws SESSION_INVALID_INPUT', async () => {
    await assert.rejects(
      () => service.joinExam({ ...DEFAULT_JOIN, examId: '' }, 'u1'),
      /SESSION_INVALID_INPUT/
    );
  });

  test('2.2 Missing institutionId throws SESSION_INVALID_INPUT', async () => {
    await assert.rejects(
      () => service.joinExam({ ...DEFAULT_JOIN, institutionId: '' }, 'u1'),
      /SESSION_INVALID_INPUT/
    );
  });

  test('2.3 Missing candidateId throws SESSION_INVALID_INPUT', async () => {
    await assert.rejects(
      () => service.joinExam({ ...DEFAULT_JOIN, candidateId: '' }, 'u1'),
      /SESSION_INVALID_INPUT/
    );
  });

  test('2.4 Zero examDurationSeconds throws SESSION_INVALID_INPUT', async () => {
    await assert.rejects(
      () => service.joinExam({ ...DEFAULT_JOIN, examDurationSeconds: 0 }, 'u1'),
      /SESSION_INVALID_INPUT/
    );
  });

  test('2.5 Negative examDurationSeconds throws SESSION_INVALID_INPUT', async () => {
    await assert.rejects(
      () => service.joinExam({ ...DEFAULT_JOIN, examDurationSeconds: -100 }, 'u1'),
      /SESSION_INVALID_INPUT/
    );
  });

  test('2.6 Different candidates can join the same exam', async () => {
    const s1 = await service.joinExam({ ...DEFAULT_JOIN, candidateId: 'cand_A' }, 'u1');
    const s2 = await service.joinExam({ ...DEFAULT_JOIN, candidateId: 'cand_B' }, 'u1');
    assert.notStrictEqual(s1.session.sessionId, s2.session.sessionId);
    assert.strictEqual(s1.session.examId, s2.session.examId);
  });

  test('2.7 Same candidate can join different exams', async () => {
    const s1 = await service.joinExam({ ...DEFAULT_JOIN, examId: 'exam_X' }, 'u1');
    const s2 = await service.joinExam({ ...DEFAULT_JOIN, examId: 'exam_Y' }, 'u1');
    assert.notStrictEqual(s1.session.sessionId, s2.session.sessionId);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. HEARTBEAT MONITORING
// ─────────────────────────────────────────────────────────────────────────────

describe('3. Heartbeat Monitoring', () => {
  let service: SessionService;

  beforeEach(() => { ({ service } = makeService()); });

  test('3.1 Recording heartbeat returns heartbeat entity', async () => {
    const { session } = await service.joinExam(DEFAULT_JOIN, 'u1');
    await service.moveToReady(session.sessionId, 'u1');
    await service.startSession(session.sessionId, 'u1');

    const { heartbeat, status } = await service.recordHeartbeat(session.sessionId, {
      clientTimestamp: new Date().toISOString(),
      latencyMs: 25,
      isFullscreen: true,
      isFocused: true,
      isTabVisible: true,
      sequenceNumber: 1
    });

    assert.ok(heartbeat.heartbeatId);
    assert.strictEqual(heartbeat.latencyMs, 25);
    assert.strictEqual(heartbeat.isFullscreen, true);
    assert.strictEqual(status.isAlive, true);
    assert.strictEqual(status.consecutiveMissCount, 0);
  });

  test('3.2 Sequential heartbeats increment sequence number', async () => {
    const { session } = await service.joinExam(DEFAULT_JOIN, 'u1');
    await service.moveToReady(session.sessionId, 'u1');
    await service.startSession(session.sessionId, 'u1');

    const h1 = await service.recordHeartbeat(session.sessionId, { clientTimestamp: new Date().toISOString(), sequenceNumber: 1 });
    const h2 = await service.recordHeartbeat(session.sessionId, { clientTimestamp: new Date().toISOString(), sequenceNumber: 2 });

    assert.strictEqual(h1.heartbeat.sequenceNumber, 1);
    assert.strictEqual(h2.heartbeat.sequenceNumber, 2);
  });

  test('3.3 Cannot record heartbeat for ENDED session', async () => {
    const { session } = await service.joinExam(DEFAULT_JOIN, 'u1');
    await service.moveToReady(session.sessionId, 'u1');
    await service.startSession(session.sessionId, 'u1');
    await service.submitSession(session.sessionId, {}, 'u1');

    await assert.rejects(
      () => service.recordHeartbeat(session.sessionId, { clientTimestamp: new Date().toISOString() }),
      /SESSION_TERMINATED/
    );
  });

  test('3.4 getHeartbeatStatus shows alive status', async () => {
    const { session } = await service.joinExam(DEFAULT_JOIN, 'u1');
    await service.moveToReady(session.sessionId, 'u1');
    await service.startSession(session.sessionId, 'u1');
    await service.recordHeartbeat(session.sessionId, { clientTimestamp: new Date().toISOString() });

    const status = await service.getHeartbeatStatus(session.sessionId);
    assert.ok(status.lastSeenAt);
    assert.ok(status.nextExpectedAt);
    assert.strictEqual(status.isAlive, true);
  });

  test('3.5 HeartbeatMonitor detects no misses when heartbeats are fresh', async () => {
    const { session } = await service.joinExam(DEFAULT_JOIN, 'u1');
    await service.moveToReady(session.sessionId, 'u1');
    await service.startSession(session.sessionId, 'u1');
    await service.recordHeartbeat(session.sessionId, { clientTimestamp: new Date().toISOString() });

    const result = await service.runHeartbeatScan();
    assert.strictEqual(result.timedOut.length, 0);
    assert.strictEqual(result.disconnected.length, 0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. SESSION RECOVERY & RECONNECT
// ─────────────────────────────────────────────────────────────────────────────

describe('4. Session Recovery & Reconnect', () => {
  let service: SessionService;
  let repo: SessionRepository;

  beforeEach(() => { ({ service, repo } = makeService()); });

  test('4.1 Initiate reconnect transitions to RECONNECTING and returns token', async () => {
    const { session } = await service.joinExam(DEFAULT_JOIN, 'u1');
    await service.moveToReady(session.sessionId, 'u1');
    await service.startSession(session.sessionId, 'u1');

    const { recovery, session: updated } = await service.initiateReconnect(
      session.sessionId, { reason: 'NETWORK_LOSS' }, 'u1'
    );

    assert.strictEqual(updated.state, 'RECONNECTING');
    assert.ok(recovery.token);
    assert.ok(recovery.expiresAt > new Date().toISOString());
    assert.strictEqual(recovery.isUsed, false);
    assert.strictEqual(updated.reconnectCount, 1);
  });

  test('4.2 Complete reconnect restores ACTIVE state', async () => {
    const { session } = await service.joinExam(DEFAULT_JOIN, 'u1');
    await service.moveToReady(session.sessionId, 'u1');
    await service.startSession(session.sessionId, 'u1');

    const { recovery } = await service.initiateReconnect(
      session.sessionId, { reason: 'BROWSER_CLOSE' }, 'u1'
    );

    const res = await service.completeReconnect(session.sessionId, { token: recovery.token }, 'u1');
    assert.strictEqual(res.session.state, 'ACTIVE');
  });

  test('4.3 Token cannot be reused (replay protection)', async () => {
    const { session } = await service.joinExam(DEFAULT_JOIN, 'u1');
    await service.moveToReady(session.sessionId, 'u1');
    await service.startSession(session.sessionId, 'u1');

    const { recovery } = await service.initiateReconnect(
      session.sessionId, { reason: 'NETWORK_LOSS' }, 'u1'
    );

    await service.completeReconnect(session.sessionId, { token: recovery.token }, 'u1');

    // Try to reconnect again with the same token
    await service.initiateReconnect(session.sessionId, { reason: 'NETWORK_LOSS' }, 'u1');

    await assert.rejects(
      () => service.completeReconnect(session.sessionId, { token: recovery.token }, 'u1'),
      /SESSION_TOKEN_REPLAYED|SESSION_TOKEN_NOT_FOUND/
    );
  });

  test('4.4 Invalid token throws SESSION_INVALID_TOKEN', async () => {
    const { session } = await service.joinExam(DEFAULT_JOIN, 'u1');
    await service.moveToReady(session.sessionId, 'u1');
    await service.startSession(session.sessionId, 'u1');
    await service.initiateReconnect(session.sessionId, { reason: 'NETWORK_LOSS' }, 'u1');

    await assert.rejects(
      () => service.completeReconnect(session.sessionId, { token: 'bad_token' }, 'u1'),
      /SESSION_INVALID_TOKEN/
    );
  });

  test('4.5 Reconnect limit exceeded terminates session', async () => {
    const config = getSessionServiceConfig();
    const { session } = await service.joinExam(DEFAULT_JOIN, 'u1');
    await service.moveToReady(session.sessionId, 'u1');
    await service.startSession(session.sessionId, 'u1');

    // Use up all reconnect attempts
    for (let i = 0; i < config.maxReconnectAttempts; i++) {
      const { recovery } = await service.initiateReconnect(session.sessionId, { reason: 'NETWORK_LOSS' }, 'u1');
      await service.completeReconnect(session.sessionId, { token: recovery.token }, 'u1');
    }

    // One more should fail
    await assert.rejects(
      () => service.initiateReconnect(session.sessionId, { reason: 'NETWORK_LOSS' }, 'u1'),
      /SESSION_RECONNECT_LIMIT_EXCEEDED|SESSION_ALREADY_TERMINAL/
    );
  });

  test('4.6 Recovery payload contains correct session snapshot', async () => {
    const { session } = await service.joinExam(DEFAULT_JOIN, 'u1');
    await service.moveToReady(session.sessionId, 'u1');
    await service.startSession(session.sessionId, 'u1');

    const { recovery } = await service.initiateReconnect(
      session.sessionId, { reason: 'POWER_FAILURE' }, 'u1'
    );

    assert.ok(recovery.recoveryPayload);
    assert.ok(recovery.recoveryPayload.remainingSeconds > 0);
    assert.strictEqual(recovery.recoveryPayload.reconnectCount, 1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. DEVICE REGISTRATION
// ─────────────────────────────────────────────────────────────────────────────

describe('5. Device Registration', () => {
  let service: SessionService;

  beforeEach(() => { ({ service } = makeService()); });

  test('5.1 Register device stores full fingerprint', async () => {
    const { session } = await service.joinExam(DEFAULT_JOIN, 'u1');
    const device = await service.registerDevice(session.sessionId, {
      browser: 'Chrome', browserVersion: '120', userAgent: 'Mozilla/5.0 ...',
      os: 'Windows', osVersion: '11', fingerprint: 'fp_abc123',
      ipAddress: '192.168.1.1', timezone: 'Asia/Kolkata', language: 'en-IN',
      screenWidth: 1920, screenHeight: 1080, monitorCount: 1,
      cameraAvailable: true, microphoneAvailable: true, screenSharingAvailable: true,
      isVirtualMachine: false, isEmulator: false
    });

    assert.ok(device.deviceId);
    assert.strictEqual(device.browser, 'Chrome');
    assert.strictEqual(device.ipAddress, '192.168.1.1');
    assert.strictEqual(device.cameraAvailable, true);
    assert.strictEqual(device.isVirtualMachine, false);
  });

  test('5.2 getDeviceInfo returns cached device', async () => {
    const { session } = await service.joinExam(DEFAULT_JOIN, 'u1');
    await service.registerDevice(session.sessionId, {
      browser: 'Firefox', browserVersion: '121', userAgent: 'Mozilla ...',
      os: 'macOS', osVersion: '14', fingerprint: 'fp_xyz', ipAddress: '10.0.0.1',
      timezone: 'UTC', language: 'en-US', screenWidth: 2560, screenHeight: 1440
    });

    const device = await service.getDeviceInfo(session.sessionId);
    assert.ok(device);
    assert.strictEqual(device!.browser, 'Firefox');
  });

  test('5.3 Virtual machine detection is stored', async () => {
    const { session } = await service.joinExam(DEFAULT_JOIN, 'u1');
    const device = await service.registerDevice(session.sessionId, {
      browser: 'Chrome', browserVersion: '120', userAgent: 'test',
      os: 'Linux', osVersion: '22.04', fingerprint: 'fp_vm', ipAddress: '127.0.0.1',
      timezone: 'UTC', language: 'en', screenWidth: 1280, screenHeight: 720,
      isVirtualMachine: true, isEmulator: false
    });

    assert.strictEqual(device.isVirtualMachine, true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. PRESENCE TRACKING
// ─────────────────────────────────────────────────────────────────────────────

describe('6. Presence Tracking', () => {
  let service: SessionService;

  beforeEach(() => { ({ service } = makeService()); });

  test('6.1 Record presence event and retrieve summary', async () => {
    const { session } = await service.joinExam(DEFAULT_JOIN, 'u1');
    await service.moveToReady(session.sessionId, 'u1');
    await service.startSession(session.sessionId, 'u1');

    await service.recordPresenceEvent(session.sessionId, { eventType: 'FULLSCREEN_ENTERED' });
    await service.recordPresenceEvent(session.sessionId, { eventType: 'FOCUS_LOST', durationMs: 2000 });
    await service.recordPresenceEvent(session.sessionId, { eventType: 'FOCUS_GAINED' });
    await service.recordPresenceEvent(session.sessionId, { eventType: 'TAB_HIDDEN' });

    const summary = await service.getPresenceSummary(session.sessionId);
    assert.strictEqual(summary.focusLostCount, 1);
    assert.strictEqual(summary.tabSwitchCount, 1);
    assert.ok(summary.events.length >= 4);
  });

  test('6.2 Presence events include metadata', async () => {
    const { session } = await service.joinExam(DEFAULT_JOIN, 'u1');
    await service.recordPresenceEvent(session.sessionId, {
      eventType: 'FULLSCREEN_EXITED',
      metadata: { screenWidth: 1920, reason: 'ESC key pressed' }
    });

    const summary = await service.getPresenceSummary(session.sessionId);
    const exitEvent = summary.events.find(e => e.eventType === 'FULLSCREEN_EXITED');
    assert.ok(exitEvent);
    assert.strictEqual((exitEvent!.metadata as any).reason, 'ESC key pressed');
  });

  test('6.3 Multiple presence events tracked correctly', async () => {
    const { session } = await service.joinExam(DEFAULT_JOIN, 'u1');
    const types = ['FOCUS_LOST', 'TAB_HIDDEN', 'TAB_VISIBLE', 'FOCUS_GAINED', 'IDLE_START', 'IDLE_END'];
    for (const t of types) {
      await service.recordPresenceEvent(session.sessionId, { eventType: t as any });
    }

    const summary = await service.getPresenceSummary(session.sessionId);
    assert.strictEqual(summary.events.length, 6);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. POLICY ENFORCEMENT
// ─────────────────────────────────────────────────────────────────────────────

describe('7. Policy Enforcement', () => {
  let service: SessionService;
  let enforcer: PolicyEnforcer;

  beforeEach(() => {
    ({ service } = makeService());
    enforcer = new PolicyEnforcer(getSessionServiceConfig());
  });

  test('7.1 TAB_SWITCH violation returns WARN on first occurrence', async () => {
    const { session } = await service.joinExam(DEFAULT_JOIN, 'u1');
    await service.moveToReady(session.sessionId, 'u1');
    await service.startSession(session.sessionId, 'u1');

    const { violation, actionTaken } = await service.reportViolation(
      session.sessionId, { violationType: 'TAB_SWITCH' }, 'u1'
    );

    assert.ok(violation.violationId);
    assert.strictEqual(violation.violationType, 'TAB_SWITCH');
    assert.strictEqual(actionTaken, 'WARN');
    assert.strictEqual(violation.severity, 'MEDIUM');
  });

  test('7.2 Virtual machine detected triggers DISQUALIFY', async () => {
    const { session } = await service.joinExam(DEFAULT_JOIN, 'u1');
    await service.moveToReady(session.sessionId, 'u1');
    await service.startSession(session.sessionId, 'u1');

    const { actionTaken } = await service.reportViolation(
      session.sessionId, { violationType: 'VIRTUAL_MACHINE_DETECTED' }, 'admin'
    );

    assert.strictEqual(actionTaken, 'DISQUALIFY');
    const updated = await service.getSession(session.sessionId);
    assert.strictEqual(updated.session.state, 'DISQUALIFIED');
  });

  test('7.3 BROWSER_LOCK_BROKEN triggers DISQUALIFY', async () => {
    const { session } = await service.joinExam(DEFAULT_JOIN, 'u1');
    await service.moveToReady(session.sessionId, 'u1');
    await service.startSession(session.sessionId, 'u1');

    const { actionTaken } = await service.reportViolation(
      session.sessionId, { violationType: 'BROWSER_LOCK_BROKEN' }, 'u1'
    );

    assert.strictEqual(actionTaken, 'DISQUALIFY');
  });

  test('7.4 Repeated TAB_SWITCH escalates to SUSPEND', async () => {
    const config = getSessionServiceConfig();
    const { session } = await service.joinExam(DEFAULT_JOIN, 'u1');
    await service.moveToReady(session.sessionId, 'u1');
    await service.startSession(session.sessionId, 'u1');

    // Report violations up to suspension threshold
    let lastResult: any;
    for (let i = 0; i < config.tabSwitchesBeforeSuspend; i++) {
      lastResult = await service.reportViolation(session.sessionId, { violationType: 'TAB_SWITCH' }, 'u1');
    }

    assert.ok(['SUSPEND', 'TERMINATE'].includes(lastResult.actionTaken),
      `Expected SUSPEND or TERMINATE, got ${lastResult.actionTaken}`);
  });

  test('7.5 PolicyEnforcer.getViolationCounts tracks types correctly', () => {
    const violations = [
      { violationType: 'TAB_SWITCH' },
      { violationType: 'TAB_SWITCH' },
      { violationType: 'FULLSCREEN_EXIT' }
    ] as any[];

    const counts = enforcer.getViolationCounts(violations);
    assert.strictEqual(counts['TAB_SWITCH'], 2);
    assert.strictEqual(counts['FULLSCREEN_EXIT'], 1);
  });

  test('7.6 getViolations returns all recorded violations', async () => {
    const { session } = await service.joinExam(DEFAULT_JOIN, 'u1');
    await service.moveToReady(session.sessionId, 'u1');
    await service.startSession(session.sessionId, 'u1');

    await service.reportViolation(session.sessionId, { violationType: 'TAB_SWITCH' }, 'u1');
    await service.reportViolation(session.sessionId, { violationType: 'FULLSCREEN_EXIT' }, 'u1');

    const violations = await service.getViolations(session.sessionId);
    assert.strictEqual(violations.length, 2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. TIMER ENGINE
// ─────────────────────────────────────────────────────────────────────────────

describe('8. Timer Engine', () => {
  let engine: TimerEngine;

  beforeEach(() => { engine = new TimerEngine(); });

  test('8.1 Start timer returns correct total seconds', () => {
    const state = engine.startTimer('s1', 'EXAM', 3600);
    assert.strictEqual(state.totalSeconds, 3600);
    assert.ok(state.remainingSeconds <= 3600);
    assert.ok(state.remainingSeconds > 3595); // account for negligible execution time
    assert.strictEqual(state.isRunning, true);
    assert.strictEqual(state.isPaused, false);
  });

  test('8.2 Pause timer snapshots remaining time', () => {
    engine.startTimer('s1', 'EXAM', 3600);
    const paused = engine.pauseTimer('s1', 'EXAM');
    assert.ok(paused);
    assert.strictEqual(paused!.isRunning, false);
    assert.strictEqual(paused!.isPaused, true);
    assert.ok(paused!.remainingSeconds > 0);
    assert.ok(paused!.pausedAt);
  });

  test('8.3 Resume timer restores from snapshot', () => {
    engine.startTimer('s1', 'EXAM', 3600);
    const paused = engine.pauseTimer('s1', 'EXAM');
    const pausedRemaining = paused!.remainingSeconds;

    const resumed = engine.resumeTimer('s1', 'EXAM');
    assert.ok(resumed);
    assert.strictEqual(resumed!.isRunning, true);
    assert.strictEqual(resumed!.isPaused, false);
    assert.ok(Math.abs(resumed!.remainingSeconds - pausedRemaining) <= 1);
  });

  test('8.4 isExpired returns true for expired timer', () => {
    engine.startTimer('s1', 'EXAM', 0.001); // 1ms — effectively instant expiry
    // Simulate expiry: wait a tick
    const start = Date.now();
    while (Date.now() - start < 10) { /* busy wait 10ms */ }
    assert.ok(engine.isExpired('s1', 'EXAM'));
  });

  test('8.5 isExpired returns false for active timer', () => {
    engine.startTimer('s1', 'EXAM', 3600);
    assert.strictEqual(engine.isExpired('s1', 'EXAM'), false);
  });

  test('8.6 Multiple timers per session are independent', () => {
    engine.startTimer('s1', 'EXAM', 3600);
    engine.startTimer('s1', 'IDLE', 600);

    engine.pauseTimer('s1', 'IDLE');

    const examState = engine.getTimerState('s1', 'EXAM');
    const idleState = engine.getTimerState('s1', 'IDLE');

    assert.strictEqual(examState!.isRunning, true);
    assert.strictEqual(idleState!.isPaused, true);
  });

  test('8.7 clearSession removes all session timers', () => {
    engine.startTimer('s1', 'EXAM', 3600);
    engine.startTimer('s1', 'IDLE', 600);
    engine.clearSession('s1');

    assert.strictEqual(engine.getTimerState('s1', 'EXAM'), null);
    assert.strictEqual(engine.getTimerState('s1', 'IDLE'), null);
  });

  test('8.8 startSession starts exam timer', async () => {
    const { service } = makeService();
    const { session } = await service.joinExam(DEFAULT_JOIN, 'u1');
    await service.moveToReady(session.sessionId, 'u1');
    await service.startSession(session.sessionId, 'u1');

    const timer = service.getTimerState(session.sessionId, 'EXAM');
    assert.ok(timer);
    assert.strictEqual(timer!.totalSeconds, 3600);
    assert.strictEqual(timer!.isRunning, true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. SESSION SUSPENSION & RESUME
// ─────────────────────────────────────────────────────────────────────────────

describe('9. Session Suspension & Resume', () => {
  let service: SessionService;

  beforeEach(() => { ({ service } = makeService()); });

  test('9.1 Proctor can suspend ACTIVE session', async () => {
    const { session } = await service.joinExam(DEFAULT_JOIN, 'u1');
    await service.moveToReady(session.sessionId, 'u1');
    await service.startSession(session.sessionId, 'u1');

    const res = await service.suspendSession(session.sessionId, { reason: 'Suspicious behavior' }, 'proctor1');
    assert.strictEqual(res.session.state, 'SUSPENDED');
    assert.strictEqual(res.session.isSuspended, true);
    assert.strictEqual(res.session.suspendedById, 'proctor1');
    assert.strictEqual(res.session.suspensionReason, 'Suspicious behavior');
  });

  test('9.2 Proctor can resume SUSPENDED session', async () => {
    const { session } = await service.joinExam(DEFAULT_JOIN, 'u1');
    await service.moveToReady(session.sessionId, 'u1');
    await service.startSession(session.sessionId, 'u1');
    await service.suspendSession(session.sessionId, { reason: 'Test suspension' }, 'proctor1');

    const res = await service.resumeSession(session.sessionId, { notes: 'Issue resolved' }, 'proctor1');
    assert.strictEqual(res.session.state, 'ACTIVE');
    assert.strictEqual(res.session.isSuspended, false);
  });

  test('9.3 Cannot suspend a SUBMITTED session', async () => {
    const { session } = await service.joinExam(DEFAULT_JOIN, 'u1');
    await service.moveToReady(session.sessionId, 'u1');
    await service.startSession(session.sessionId, 'u1');
    await service.submitSession(session.sessionId, {}, 'u1');

    await assert.rejects(
      () => service.suspendSession(session.sessionId, { reason: 'too late' }, 'proctor1'),
      /SESSION_INVALID_STATE|SESSION_ALREADY_TERMINAL/
    );
  });

  test('9.4 Cannot resume a non-SUSPENDED session', async () => {
    const { session } = await service.joinExam(DEFAULT_JOIN, 'u1');
    await service.moveToReady(session.sessionId, 'u1');
    await service.startSession(session.sessionId, 'u1');

    await assert.rejects(
      () => service.resumeSession(session.sessionId, {}, 'proctor1'),
      /SESSION_INVALID_STATE/
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. SESSION ANALYTICS
// ─────────────────────────────────────────────────────────────────────────────

describe('10. Session Analytics', () => {
  let service: SessionService;

  beforeEach(() => { ({ service } = makeService()); });

  test('10.1 Analytics entity created on join', async () => {
    const { session } = await service.joinExam(DEFAULT_JOIN, 'u1');
    const analytics = await service.getSessionAnalytics(session.sessionId);
    assert.ok(analytics);
    assert.strictEqual(analytics!.sessionId, session.sessionId);
    assert.strictEqual(analytics!.examId, DEFAULT_JOIN.examId);
  });

  test('10.2 Analytics update after heartbeats', async () => {
    const { session } = await service.joinExam(DEFAULT_JOIN, 'u1');
    await service.moveToReady(session.sessionId, 'u1');
    await service.startSession(session.sessionId, 'u1');

    for (let i = 0; i < 3; i++) {
      await service.recordHeartbeat(session.sessionId, {
        clientTimestamp: new Date().toISOString(), latencyMs: 20 * (i + 1), sequenceNumber: i + 1
      });
    }

    // Trigger analytics update
    await service.submitSession(session.sessionId, {}, 'u1');
    const analytics = await service.getSessionAnalytics(session.sessionId);
    assert.ok(analytics);
    assert.ok(analytics!.heartbeatCount >= 3);
  });

  test('10.3 Exam analytics summary aggregates multiple sessions', async () => {
    const ids: string[] = [];
    for (let i = 1; i <= 3; i++) {
      const { session } = await service.joinExam({
        ...DEFAULT_JOIN, candidateId: `cand_${i}`
      }, 'u1');
      await service.moveToReady(session.sessionId, 'u1');
      await service.startSession(session.sessionId, 'u1');
      await service.submitSession(session.sessionId, {}, 'u1');
      ids.push(session.sessionId);
    }

    const summary = await service.getExamAnalyticsSummary(DEFAULT_JOIN.examId, DEFAULT_JOIN.institutionId);
    assert.strictEqual(summary.totalSessions, 3);
    assert.strictEqual(summary.submittedSessions, 3);
    assert.strictEqual(summary.activeSessions, 0);
  });

  test('10.4 Terminated session appears in analytics summary', async () => {
    const { session } = await service.joinExam({ ...DEFAULT_JOIN, candidateId: 'cand_T' }, 'u1');
    await service.moveToReady(session.sessionId, 'u1');
    await service.startSession(session.sessionId, 'u1');
    await service.terminateSession(session.sessionId, { reason: 'Cheating detected' }, 'proctor1');

    const summary = await service.getExamAnalyticsSummary(DEFAULT_JOIN.examId, DEFAULT_JOIN.institutionId);
    assert.strictEqual(summary.terminatedSessions, 1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 11. TENANT ISOLATION
// ─────────────────────────────────────────────────────────────────────────────

describe('11. Tenant Isolation', () => {
  let service: SessionService;

  beforeEach(() => { ({ service } = makeService()); });

  test('11.1 Sessions from different institutions are isolated', async () => {
    const s1 = await service.joinExam({ ...DEFAULT_JOIN, institutionId: 'inst_A', examId: 'exam_A', candidateId: 'cA' }, 'u1');
    const s2 = await service.joinExam({ ...DEFAULT_JOIN, institutionId: 'inst_B', examId: 'exam_B', candidateId: 'cB' }, 'u1');

    const list_A = await service.listSessionsByExam('exam_A');
    const list_B = await service.listSessionsByExam('exam_B');

    assert.strictEqual(list_A.length, 1);
    assert.strictEqual(list_A[0].institutionId, 'inst_A');
    assert.strictEqual(list_B.length, 1);
    assert.strictEqual(list_B[0].institutionId, 'inst_B');
  });

  test('11.2 One active session per candidate per exam', async () => {
    await service.joinExam(DEFAULT_JOIN, 'u1');
    await assert.rejects(
      () => service.joinExam(DEFAULT_JOIN, 'u1'),
      /SESSION_ALREADY_EXISTS/
    );
  });

  test('11.3 After session ends, same candidate can join same exam again', async () => {
    const { session } = await service.joinExam(DEFAULT_JOIN, 'u1');
    await service.moveToReady(session.sessionId, 'u1');
    await service.startSession(session.sessionId, 'u1');
    await service.submitSession(session.sessionId, {}, 'u1');

    // Now they should be able to rejoin (previous session is terminal)
    const newSession = await service.joinExam(DEFAULT_JOIN, 'u1');
    assert.ok(newSession.session.sessionId);
    assert.notStrictEqual(newSession.session.sessionId, session.sessionId);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 12. CACHING
// ─────────────────────────────────────────────────────────────────────────────

describe('12. Caching', () => {
  let service: SessionService;
  let cache: SessionCache;

  beforeEach(() => { ({ service, cache } = makeService()); });

  test('12.1 Session is cached after creation', async () => {
    const { session } = await service.joinExam(DEFAULT_JOIN, 'u1');
    const cached = cache.getSession(session.sessionId);
    assert.ok(cached);
    assert.strictEqual(cached!.sessionId, session.sessionId);
  });

  test('12.2 Session cache reflects updated state', async () => {
    const { session } = await service.joinExam(DEFAULT_JOIN, 'u1');
    await service.moveToReady(session.sessionId, 'u1');

    const cached = cache.getSession(session.sessionId);
    assert.ok(cached);
    assert.strictEqual(cached!.state, 'READY');
  });

  test('12.3 Heartbeat status is cached', async () => {
    const { session } = await service.joinExam(DEFAULT_JOIN, 'u1');
    await service.moveToReady(session.sessionId, 'u1');
    await service.startSession(session.sessionId, 'u1');
    await service.recordHeartbeat(session.sessionId, { clientTimestamp: new Date().toISOString() });

    await service.getHeartbeatStatus(session.sessionId);
    const cached = cache.getHeartbeatStatus(session.sessionId);
    assert.ok(cached);
    assert.strictEqual(cached!.sessionId, session.sessionId);
  });

  test('12.4 Device is cached after registration', async () => {
    const { session } = await service.joinExam(DEFAULT_JOIN, 'u1');
    await service.registerDevice(session.sessionId, {
      browser: 'Chrome', browserVersion: '120', userAgent: 'test',
      os: 'Windows', osVersion: '11', fingerprint: 'fp_cache', ipAddress: '10.0.0.1',
      timezone: 'UTC', language: 'en', screenWidth: 1920, screenHeight: 1080
    });

    const cached = cache.getDevice(session.sessionId);
    assert.ok(cached);
    assert.strictEqual(cached!.browser, 'Chrome');
  });

  test('12.5 Timer state is cached after retrieval', async () => {
    const { session } = await service.joinExam(DEFAULT_JOIN, 'u1');
    await service.moveToReady(session.sessionId, 'u1');
    await service.startSession(session.sessionId, 'u1');

    // getTimerState populates cache
    service.getTimerState(session.sessionId, 'EXAM');
    const cached = cache.getTimerState(session.sessionId, 'EXAM');
    assert.ok(cached);
    assert.strictEqual(cached!.timerType, 'EXAM');
  });
});
