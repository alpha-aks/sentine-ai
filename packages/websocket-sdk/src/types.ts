import { EventType, WebSocketEvent } from '@sentinel-ai/types';

export interface WebSocketMessage<T = any> {
  type: EventType | string;
  payload: T;
  eventId?: string;
  timestamp?: string;
}

export type ClientState = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'RECONNECTING' | 'CLOSING';

export interface WebSocketClientOptions {
  url: string | (() => string | Promise<string>);
  authTokenProvider?: () => string | null | Promise<string | null>;
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectDelayMs?: number;
  reconnectBackoffFactor?: number;
  maxReconnectDelayMs?: number;
  heartbeatIntervalMs?: number;
  heartbeatTimeoutMs?: number;
  protocols?: string | string[];
}

export interface WebSocketServerOptions {
  port?: number;
  host?: string;
  path?: string;
  jwtSecret?: string;
  heartbeatIntervalMs?: number;
  heartbeatTimeoutMs?: number;
  verifyAuth?: (token: string) => Promise<any> | any;
}

export interface ClientConnection {
  id: string;
  userId?: string;
  role?: string;
  institutionId?: string;
  sessionId?: string;
  isAlive: boolean;
  connectedAt: string;
  socket: any;
  send<T = any>(type: EventType | string, payload: T): void;
  close(code?: number, reason?: string): void;
}

export type ClientEventHandler<T = any> = (
  payload: T,
  message: WebSocketMessage<T>
) => void | Promise<void>;
export type ServerEventHandler<T = any> = (
  payload: T,
  connection: ClientConnection,
  message: WebSocketMessage<T>
) => void | Promise<void>;
