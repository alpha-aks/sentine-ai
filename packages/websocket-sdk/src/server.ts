import { verifyJwtToken } from '@sentinel-ai/security';
import { generateUuid } from '@sentinel-ai/utils';
import { EventRegistry } from './event-registry';
import {
  ClientConnection,
  ServerEventHandler,
  WebSocketMessage,
  WebSocketServerOptions
} from './types';

export class WebSocketServer<TEventMap extends Record<string, any> = Record<string, any>> {
  private wss: any = null;
  private readonly options: WebSocketServerOptions;
  private readonly registry: EventRegistry<TEventMap> = new EventRegistry();
  private readonly connections: Map<string, ClientConnection> = new Map();
  private readonly sessionConnections: Map<string, Set<ClientConnection>> = new Map();
  private readonly userConnections: Map<string, Set<ClientConnection>> = new Map();
  private heartbeatIntervalTimer: any = null;

  constructor(options: WebSocketServerOptions = {}) {
    this.options = {
      port: 8080,
      path: '/ws',
      heartbeatIntervalMs: 30000,
      heartbeatTimeoutMs: 15000,
      ...options
    };
  }

  public async start(): Promise<void> {
    const WebSocketServerCtor = require('ws').WebSocketServer || require('ws').Server;

    this.wss = new WebSocketServerCtor({
      port: this.options.port,
      host: this.options.host,
      path: this.options.path
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    this.startHeartbeatCheck();
  }

  private async handleConnection(socket: any, request: any): Promise<void> {
    const connectionId = `conn_${generateUuid()}`;

    // Extract auth token from query params or headers
    let token: string | null = null;
    try {
      const reqUrl = new URL(request.url || '', 'http://localhost');
      token = reqUrl.searchParams.get('token');
      if (!token && request.headers) {
        const authHeader = request.headers['authorization'] || request.headers['Authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7);
        }
      }
    } catch {
      token = null;
    }

    let authPayload: any = null;
    if (this.options.verifyAuth) {
      try {
        authPayload = await this.options.verifyAuth(token || '');
      } catch (err) {
        socket.close(4001, 'Unauthorized: Invalid authentication token');
        return;
      }
    } else if (this.options.jwtSecret && token) {
      try {
        authPayload = verifyJwtToken(token, this.options.jwtSecret);
      } catch (err) {
        socket.close(4001, 'Unauthorized: Invalid JWT token');
        return;
      }
    }

    const connection: ClientConnection = {
      id: connectionId,
      userId: authPayload?.sub || authPayload?.userId,
      role: authPayload?.role,
      institutionId: authPayload?.institutionId,
      sessionId: authPayload?.sessionId,
      isAlive: true,
      connectedAt: new Date().toISOString(),
      socket,
      send: (type: string, payload: any) => {
        if (socket.readyState === 1) {
          const msg: WebSocketMessage = {
            type,
            payload,
            eventId: generateUuid(),
            timestamp: new Date().toISOString()
          };
          socket.send(JSON.stringify(msg));
        }
      },
      close: (code?: number, reason?: string) => {
        socket.close(code || 1000, reason || 'Normal Closure');
      }
    };

    this.connections.set(connectionId, connection);

    if (connection.userId) {
      if (!this.userConnections.has(connection.userId)) {
        this.userConnections.set(connection.userId, new Set());
      }
      this.userConnections.get(connection.userId)!.add(connection);
    }

    if (connection.sessionId) {
      this.joinSession(connectionId, connection.sessionId);
    }

    socket.on('message', (data: any) => this.handleMessage(connection, data));
    socket.on('pong', () => {
      connection.isAlive = true;
    });
    socket.on('close', () => this.handleDisconnect(connection));
    socket.on('error', (err: any) => {
      console.error(`[WebSocketServer] Socket error on connection ${connectionId}:`, err);
    });

    // Send connected welcome event
    connection.send('CONNECTED', {
      connectionId,
      message: 'WebSocket connection established successfully'
    });
  }

  private handleMessage(connection: ClientConnection, data: any): void {
    connection.isAlive = true;
    let rawData: string = '';

    if (typeof data === 'string') {
      rawData = data;
    } else if (Buffer.isBuffer(data)) {
      rawData = data.toString('utf8');
    }

    if (!rawData) return;

    try {
      const msg: WebSocketMessage = JSON.parse(rawData);

      if (msg.type === 'HEARTBEAT' || msg.type === 'PING') {
        connection.send('PONG', { timestamp: new Date().toISOString() });
        return;
      }

      this.registry.emit(msg.type as any, msg.payload, connection);
    } catch {
      console.warn(`[WebSocketServer] Invalid message received from ${connection.id}:`, rawData);
    }
  }

  private handleDisconnect(connection: ClientConnection): void {
    this.connections.delete(connection.id);

    if (connection.userId) {
      const userSet = this.userConnections.get(connection.userId);
      if (userSet) {
        userSet.delete(connection);
        if (userSet.size === 0) this.userConnections.delete(connection.userId);
      }
    }

    if (connection.sessionId) {
      const sessionSet = this.sessionConnections.get(connection.sessionId);
      if (sessionSet) {
        sessionSet.delete(connection);
        if (sessionSet.size === 0) this.sessionConnections.delete(connection.sessionId);
      }
    }
  }

  public joinSession(connectionId: string, sessionId: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    connection.sessionId = sessionId;
    if (!this.sessionConnections.has(sessionId)) {
      this.sessionConnections.set(sessionId, new Set());
    }
    this.sessionConnections.get(sessionId)!.add(connection);
  }

  public leaveSession(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection || !connection.sessionId) return;

    const sessionSet = this.sessionConnections.get(connection.sessionId);
    if (sessionSet) {
      sessionSet.delete(connection);
      if (sessionSet.size === 0) this.sessionConnections.delete(connection.sessionId);
    }
    connection.sessionId = undefined;
  }

  public on<K extends keyof TEventMap>(
    type: K,
    handler: ServerEventHandler<TEventMap[K]>
  ): () => void {
    return this.registry.on(type, (payload, connection) =>
      handler(payload, connection, { type: String(type), payload })
    );
  }

  public broadcast<K extends keyof TEventMap>(type: K, payload: TEventMap[K]): void {
    for (const conn of this.connections.values()) {
      conn.send(type as any, payload);
    }
  }

  public broadcastToSession<K extends keyof TEventMap>(
    sessionId: string,
    type: K,
    payload: TEventMap[K]
  ): void {
    const sessionSet = this.sessionConnections.get(sessionId);
    if (sessionSet) {
      for (const conn of sessionSet) {
        conn.send(type as any, payload);
      }
    }
  }

  public sendToUser<K extends keyof TEventMap>(
    userId: string,
    type: K,
    payload: TEventMap[K]
  ): void {
    const userSet = this.userConnections.get(userId);
    if (userSet) {
      for (const conn of userSet) {
        conn.send(type as any, payload);
      }
    }
  }

  private startHeartbeatCheck(): void {
    const interval = this.options.heartbeatIntervalMs || 30000;
    this.heartbeatIntervalTimer = setInterval(() => {
      for (const conn of this.connections.values()) {
        if (!conn.isAlive) {
          console.warn(`[WebSocketServer] Terminating unresponsive connection: ${conn.id}`);
          conn.close(1006, 'Heartbeat failure');
          this.handleDisconnect(conn);
        } else {
          conn.isAlive = false;
          if (conn.socket && typeof conn.socket.ping === 'function') {
            conn.socket.ping();
          }
        }
      }
    }, interval);
  }

  public stop(): Promise<void> {
    if (this.heartbeatIntervalTimer) {
      clearInterval(this.heartbeatIntervalTimer);
      this.heartbeatIntervalTimer = null;
    }

    return new Promise(resolve => {
      if (this.wss) {
        this.wss.close(() => {
          this.connections.clear();
          this.sessionConnections.clear();
          this.userConnections.clear();
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}
