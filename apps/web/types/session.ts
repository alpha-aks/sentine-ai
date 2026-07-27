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

export interface CandidateSessionEntity {
  sessionId: string;
  examId: string;
  institutionId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  state: SessionLifecycleState;
  joinedAt: string | null;
  startedAt: string | null;
  submittedAt: string | null;
  endedAt: string | null;
  examDurationSeconds: number;
  remainingSeconds: number;
  reconnectCount: number;
  tabSwitchCount: number;
  fullscreenExitCount: number;
  violationCount: number;
  isSuspended: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HeartbeatStatusDto {
  sessionId: string;
  isAlive: boolean;
  missCount: number;
  lastSeenAt: string | null;
}

export interface RegisterDeviceDto {
  browser: string;
  browserVersion: string;
  userAgent: string;
  os: string;
  osVersion: string;
  fingerprint: string;
  ipAddress: string;
  timezone: string;
  language: string;
  screenWidth: number;
  screenHeight: number;
}

export interface DeviceRegistrationEntity extends RegisterDeviceDto {
  deviceId: string;
  sessionId: string;
  candidateId: string;
  registeredAt: string;
}

export interface SessionViolationEntity {
  violationId: string;
  sessionId: string;
  candidateId: string;
  violationType: ViolationType;
  detail?: string;
  occurredAt: string;
}
