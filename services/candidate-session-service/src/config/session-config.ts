export interface SessionServiceConfig {
  port: number;
  jwtSecret: string;
  serviceName: string;
  cacheTtlSeconds: number;

  // Heartbeat
  heartbeatIntervalSeconds: number;
  heartbeatTimeoutSeconds: number;
  maxConsecutiveMissesBeforeDisconnect: number;

  // Reconnect
  maxReconnectAttempts: number;
  reconnectWindowSeconds: number;
  reconnectTokenTtlSeconds: number;

  // Policy thresholds
  maxTabSwitches: number;
  maxFullscreenExits: number;
  maxIdleTimeouts: number;
  idleTimeoutMinutes: number;
  autoSubmitOnExpiry: boolean;

  // Suspension / termination
  tabSwitchesBeforeSuspend: number;
  disconnectsBeforeTerminate: number;
}

export function getSessionServiceConfig(): SessionServiceConfig {
  return {
    port: parseInt(process.env.SESSION_SERVICE_PORT || '4006', 10),
    jwtSecret: process.env.JWT_SECRET || 'sentinel_ai_jwt_secret_key_production_grade_32_bytes',
    serviceName: 'sentinel-ai-candidate-session-service',
    cacheTtlSeconds: parseInt(process.env.SESSION_CACHE_TTL_SECONDS || '300', 10),

    // Heartbeat
    heartbeatIntervalSeconds: parseInt(process.env.HEARTBEAT_INTERVAL_SECONDS || '15', 10),
    heartbeatTimeoutSeconds: parseInt(process.env.HEARTBEAT_TIMEOUT_SECONDS || '45', 10),
    maxConsecutiveMissesBeforeDisconnect: parseInt(
      process.env.MAX_CONSECUTIVE_MISSES || '3', 10
    ),

    // Reconnect
    maxReconnectAttempts: parseInt(process.env.MAX_RECONNECT_ATTEMPTS || '3', 10),
    reconnectWindowSeconds: parseInt(process.env.RECONNECT_WINDOW_SECONDS || '120', 10),
    reconnectTokenTtlSeconds: parseInt(process.env.RECONNECT_TOKEN_TTL_SECONDS || '900', 10),

    // Policy
    maxTabSwitches: parseInt(process.env.MAX_TAB_SWITCHES || '5', 10),
    maxFullscreenExits: parseInt(process.env.MAX_FULLSCREEN_EXITS || '5', 10),
    maxIdleTimeouts: parseInt(process.env.MAX_IDLE_TIMEOUTS || '3', 10),
    idleTimeoutMinutes: parseInt(process.env.IDLE_TIMEOUT_MINUTES || '10', 10),
    autoSubmitOnExpiry: (process.env.AUTO_SUBMIT_ON_EXPIRY || 'true') === 'true',

    // Thresholds
    tabSwitchesBeforeSuspend: parseInt(process.env.TAB_SWITCHES_BEFORE_SUSPEND || '3', 10),
    disconnectsBeforeTerminate: parseInt(process.env.DISCONNECTS_BEFORE_TERMINATE || '3', 10)
  };
}
