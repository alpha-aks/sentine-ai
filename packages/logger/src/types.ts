export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogContext {
  requestId?: string;
  correlationId?: string;
  sessionId?: string;
  userId?: string;
  institutionId?: string;
  service?: string;
  [key: string]: any;
}

export interface AILogPayload {
  agentId: string;
  confidence: number;
  riskScore?: number;
  decisionId?: string;
  latencyMs?: number;
  evidenceCount?: number;
  [key: string]: any;
}

export interface AuditLogPayload {
  action: string;
  userId: string;
  institutionId: string;
  prevEntryHash?: string;
  entryHash?: string;
  payload?: Record<string, any>;
  [key: string]: any;
}

export interface LoggerOptions {
  serviceName: string;
  isProduction?: boolean;
  minLevel?: LogLevel;
}
