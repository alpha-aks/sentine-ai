// ─────────────────────────────────────────────────────────────────────────────
// SESSION LIFECYCLE ENUMS
// ─────────────────────────────────────────────────────────────────────────────

export type SessionLifecycleState =
  | 'NOT_STARTED'
  | 'WAITING_ROOM'
  | 'READY'
  | 'ACTIVE'
  | 'PAUSED'
  | 'RECONNECTING'
  | 'SUSPENDED'
  | 'SUBMITTED'
  | 'ENDED'
  | 'TERMINATED'
  | 'DISQUALIFIED';

export type ViolationType =
  | 'FULLSCREEN_EXIT'
  | 'TAB_SWITCH'
  | 'IDLE_TIMEOUT'
  | 'MAX_DISCONNECTS_EXCEEDED'
  | 'COPY_PASTE'
  | 'DEV_TOOLS_OPEN'
  | 'MULTI_MONITOR'
  | 'SUSPICIOUS_ACTIVITY'
  | 'BROWSER_LOCK_BROKEN'
  | 'VIRTUAL_MACHINE_DETECTED';

export type ViolationSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ViolationAutoAction = 'WARN' | 'SUSPEND' | 'TERMINATE' | 'DISQUALIFY' | 'NONE';

export type PresenceEventType =
  | 'JOINED'
  | 'LEFT'
  | 'RECONNECTED'
  | 'FOCUS_GAINED'
  | 'FOCUS_LOST'
  | 'FULLSCREEN_ENTERED'
  | 'FULLSCREEN_EXITED'
  | 'TAB_HIDDEN'
  | 'TAB_VISIBLE'
  | 'IDLE_START'
  | 'IDLE_END'
  | 'WINDOW_MINIMIZED'
  | 'WINDOW_RESTORED';

export type DisconnectReason =
  | 'HEARTBEAT_TIMEOUT'
  | 'BROWSER_CLOSE'
  | 'NETWORK_LOSS'
  | 'USER_LOGOUT'
  | 'EXAM_CANCELLED'
  | 'ADMIN_ACTION'
  | 'SYSTEM_ERROR'
  | 'POWER_FAILURE'
  | 'SYSTEM_RESTART';

export type DeviceType = 'DESKTOP' | 'LAPTOP' | 'TABLET' | 'MOBILE' | 'UNKNOWN';

export type TimerType =
  | 'EXAM'
  | 'SECTION'
  | 'GRACE_PERIOD'
  | 'RECONNECT'
  | 'IDLE'
  | 'AUTO_SUBMIT'
  | 'LATE_ENTRY';

export type ReconnectOutcome = 'SUCCESS' | 'FAILED' | 'TIMED_OUT' | 'LIMIT_EXCEEDED';

// ─────────────────────────────────────────────────────────────────────────────
// ENTITIES
// ─────────────────────────────────────────────────────────────────────────────

export interface CandidateSessionEntity {
  sessionId: string;
  examId: string;
  institutionId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  state: SessionLifecycleState;

  // Timing
  scheduledStartAt: string | null;
  scheduledEndAt: string | null;
  joinedAt: string | null;
  readyAt: string | null;
  startedAt: string | null;
  submittedAt: string | null;
  endedAt: string | null;
  terminatedAt: string | null;
  lastActivityAt: string | null;

  // Timer snapshots
  examDurationSeconds: number;
  remainingSeconds: number;
  timerPausedAt: string | null;

  // Reconnect
  reconnectCount: number;
  lastReconnectAt: string | null;
  currentReconnectToken: string | null;
  reconnectTokenExpiresAt: string | null;

  // Policy state
  tabSwitchCount: number;
  fullscreenExitCount: number;
  idleTimeoutCount: number;
  violationCount: number;
  isSuspended: boolean;
  suspendedAt: string | null;
  suspendedById: string | null;
  suspensionReason: string | null;

  // Device
  primaryDeviceId: string | null;
  ipAddress: string | null;

  // Meta
  metaData: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface SessionHeartbeatEntity {
  heartbeatId: string;
  sessionId: string;
  candidateId: string;
  receivedAt: string;
  clientTimestamp: string;
  latencyMs: number;
  networkType: string | null;
  signalStrength: number | null;  // 0–100
  isFullscreen: boolean;
  isFocused: boolean;
  isTabVisible: boolean;
  cpuUsagePercent: number | null;
  memoryUsageMb: number | null;
  ipAddress: string | null;
  sequenceNumber: number;
}

export interface DeviceRegistrationEntity {
  deviceId: string;
  sessionId: string;
  candidateId: string;

  // Browser
  browser: string;
  browserVersion: string;
  userAgent: string;

  // OS
  os: string;
  osVersion: string;
  deviceType: DeviceType;

  // Identity
  fingerprint: string;
  ipAddress: string;
  macAddress: string | null;
  timezone: string;
  language: string;

  // Display
  screenWidth: number;
  screenHeight: number;
  colorDepth: number;
  pixelRatio: number;
  monitorCount: number;

  // Hardware
  cpuCores: number | null;
  memoryGb: number | null;
  gpuInfo: string | null;
  storageGb: number | null;

  // Capabilities
  cameraAvailable: boolean;
  microphoneAvailable: boolean;
  screenSharingAvailable: boolean;

  // Network
  networkType: string | null;
  connectionSpeed: string | null;

  // Validation
  isVirtualMachine: boolean;
  isEmulator: boolean;
  registeredAt: string;
}

export interface SessionRecoveryEntity {
  recoveryId: string;
  sessionId: string;
  candidateId: string;
  token: string;
  tokenHash: string;
  isUsed: boolean;
  usedAt: string | null;
  expiresAt: string;
  reason: DisconnectReason;
  recoveryPayload: SessionRecoveryPayload;
  createdAt: string;
}

export interface SessionRecoveryPayload {
  state: SessionLifecycleState;
  remainingSeconds: number;
  questionCursor: number;
  sectionCursor: number;
  tabSwitchCount: number;
  violationCount: number;
  reconnectCount: number;
  snapshotAt: string;
}

export interface PresenceEventEntity {
  eventId: string;
  sessionId: string;
  candidateId: string;
  eventType: PresenceEventType;
  occurredAt: string;
  durationMs: number | null;
  metadata: Record<string, unknown>;
}

export interface ReconnectHistoryEntity {
  reconnectId: string;
  sessionId: string;
  candidateId: string;
  attemptNumber: number;
  initiatedAt: string;
  completedAt: string | null;
  outcome: ReconnectOutcome;
  reason: DisconnectReason;
  durationMs: number | null;
  tokenUsed: string | null;
  ipAddress: string | null;
}

export interface SessionStateHistoryEntity {
  historyId: string;
  sessionId: string;
  fromState: SessionLifecycleState | null;
  toState: SessionLifecycleState;
  transitionedAt: string;
  actorId: string;
  reason: string | null;
}

export interface SessionViolationEntity {
  violationId: string;
  sessionId: string;
  candidateId: string;
  violationType: ViolationType;
  severity: ViolationSeverity;
  autoAction: ViolationAutoAction;
  autoActionApplied: boolean;
  detail: string | null;
  occurredAt: string;
  acknowledgedAt: string | null;
  acknowledgedById: string | null;
}

export interface SessionAnalyticsEntity {
  analyticsId: string;
  sessionId: string;
  examId: string;
  institutionId: string;
  candidateId: string;

  // Duration
  totalDurationSeconds: number;
  activeDurationSeconds: number;
  idleDurationSeconds: number;
  reconnectDurationSeconds: number;

  // Engagement
  heartbeatCount: number;
  missedHeartbeatCount: number;
  reconnectCount: number;
  tabSwitchCount: number;
  fullscreenExitCount: number;
  violationCount: number;

  // Timing
  avgHeartbeatLatencyMs: number;
  avgResponseTimeSeconds: number;

  // State times (seconds in each state)
  timeInWaitingRoom: number;
  timeInActive: number;
  timeInPaused: number;
  timeInReconnecting: number;
  timeInSuspended: number;

  finalState: SessionLifecycleState;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// REQUEST / RESPONSE DTOs
// ─────────────────────────────────────────────────────────────────────────────

export interface JoinSessionDto {
  examId: string;
  institutionId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  scheduledStartAt?: string;
  scheduledEndAt?: string;
  examDurationSeconds: number;
}

export interface HeartbeatDto {
  clientTimestamp: string;
  latencyMs?: number;
  networkType?: string;
  signalStrength?: number;
  isFullscreen?: boolean;
  isFocused?: boolean;
  isTabVisible?: boolean;
  cpuUsagePercent?: number;
  memoryUsageMb?: number;
  ipAddress?: string;
  sequenceNumber?: number;
}

export interface RegisterDeviceDto {
  browser: string;
  browserVersion: string;
  userAgent: string;
  os: string;
  osVersion: string;
  deviceType?: DeviceType;
  fingerprint: string;
  ipAddress: string;
  macAddress?: string;
  timezone: string;
  language: string;
  screenWidth: number;
  screenHeight: number;
  colorDepth?: number;
  pixelRatio?: number;
  monitorCount?: number;
  cpuCores?: number;
  memoryGb?: number;
  gpuInfo?: string;
  storageGb?: number;
  cameraAvailable?: boolean;
  microphoneAvailable?: boolean;
  screenSharingAvailable?: boolean;
  networkType?: string;
  connectionSpeed?: string;
  isVirtualMachine?: boolean;
  isEmulator?: boolean;
}

export interface ReconnectInitiateDto {
  reason: DisconnectReason;
  ipAddress?: string;
}

export interface ReconnectCompleteDto {
  token: string;
  ipAddress?: string;
}

export interface SuspendSessionDto {
  reason: string;
}

export interface ResumeSessionDto {
  notes?: string;
}

export interface SubmitSessionDto {
  finalAnswerCount?: number;
  notes?: string;
}

export interface TerminateSessionDto {
  reason: string;
  violationId?: string;
}

export interface ReportViolationDto {
  violationType: ViolationType;
  detail?: string;
}

export interface RecordPresenceEventDto {
  eventType: PresenceEventType;
  durationMs?: number;
  metadata?: Record<string, unknown>;
}

export interface TransitionStateDto {
  targetState: SessionLifecycleState;
  reason?: string;
}

export interface ExamJoinValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface HeartbeatStatusDto {
  sessionId: string;
  isAlive: boolean;
  missCount: number;
  consecutiveMissCount: number;
  lastSeenAt: string | null;
  nextExpectedAt: string | null;
}

export interface TimerStateDto {
  sessionId: string;
  timerType: TimerType;
  totalSeconds: number;
  remainingSeconds: number;
  elapsedSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
  isExpired: boolean;
  startedAt: string | null;
  pausedAt: string | null;
  expiresAt: string | null;
}

export interface SessionResponseDto {
  session: CandidateSessionEntity;
  device?: DeviceRegistrationEntity;
  recovery?: Pick<SessionRecoveryEntity, 'recoveryId' | 'token' | 'expiresAt'>;
  timer?: TimerStateDto;
  violations?: SessionViolationEntity[];
}

export interface ExamAnalyticsSummaryDto {
  examId: string;
  institutionId: string;
  totalSessions: number;
  activeSessions: number;
  submittedSessions: number;
  terminatedSessions: number;
  disqualifiedSessions: number;
  avgDurationSeconds: number;
  avgReconnectCount: number;
  avgViolationCount: number;
  totalViolations: number;
}

export interface SessionSearchQueryDto {
  examId?: string;
  institutionId?: string;
  candidateId?: string;
  state?: SessionLifecycleState;
  page?: number;
  limit?: number;
}
