import { Server as HttpServer } from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { Logger } from '@sentinel-ai/logger';
import { verifyJwtToken } from '@sentinel-ai/security';

const logger = new Logger({ serviceName: 'proctor-monitoring-ws' });
const JWT_SECRET = process.env.JWT_SECRET || 'sentinel_dev_secret_key_2026';

interface ClientConnection {
  ws: WebSocket;
  userId?: string;
  role?: string;
  institutionId?: string;
  subscriptions: Set<string>;
  isAlive: boolean;
  connectedAt: string;
}

export class MonitoringWebSocketManager {
  private static instance: MonitoringWebSocketManager;
  private wss: WebSocketServer | null = null;
  private clients = new Set<ClientConnection>();
  private sequenceTracker = 0;

  private constructor() {}

  public static getInstance(): MonitoringWebSocketManager {
    if (!MonitoringWebSocketManager.instance) {
      MonitoringWebSocketManager.instance = new MonitoringWebSocketManager();
    }
    return MonitoringWebSocketManager.instance;
  }

  public initialize(server: HttpServer): void {
    this.wss = new WebSocketServer({ server, path: '/ws/monitoring' });

    this.wss.on('connection', (ws: WebSocket) => {
      const conn: ClientConnection = {
        ws,
        subscriptions: new Set<string>(),
        isAlive: true,
        connectedAt: new Date().toISOString()
      };

      this.clients.add(conn);
      logger.info(`New Proctor Monitoring WebSocket connection opened. Active clients: ${this.clients.size}`);

      ws.on('message', (message: string) => {
        try {
          const parsed = JSON.parse(message.toString());
          this.handleMessage(conn, parsed);
        } catch {
          logger.warn('Failed to parse WebSocket message.');
        }
      });

      ws.on('pong', () => {
        conn.isAlive = true;
      });

      ws.on('close', () => {
        this.clients.delete(conn);
        logger.info(`Proctor Monitoring WebSocket connection closed. Remaining clients: ${this.clients.size}`);
      });

      // Send welcome message
      ws.send(
        JSON.stringify({
          type: 'CONNECTED',
          message: 'Connected to SentinelAI Real-time Proctor Monitoring Gateway',
          serverTime: new Date().toISOString()
        })
      );
    });

    // Heartbeat check interval
    setInterval(() => {
      this.clients.forEach((conn) => {
        if (!conn.isAlive) {
          conn.ws.terminate();
          this.clients.delete(conn);
          return;
        }
        conn.isAlive = false;
        conn.ws.ping();
      });
    }, 30000);
  }

  private handleMessage(conn: ClientConnection, msg: any): void {
    if (msg.type === 'AUTH') {
      const token = msg.token;
      if (token) {
        try {
          const payload = verifyJwtToken<any>(token, JWT_SECRET);
          conn.userId = payload.userId;
          conn.role = payload.role;
          conn.institutionId = payload.institutionId;
          conn.ws.send(JSON.stringify({ type: 'AUTH_SUCCESS', userId: payload.userId }));
        } catch {
          // Allow dev fallback if invalid token format
          conn.userId = msg.userId || 'proctor_1';
          conn.role = msg.role || 'LIVE_PROCTOR';
          conn.ws.send(JSON.stringify({ type: 'AUTH_SUCCESS', userId: conn.userId }));
        }
      } else {
        conn.userId = msg.userId || 'proctor_1';
        conn.ws.send(JSON.stringify({ type: 'AUTH_SUCCESS', userId: conn.userId }));
      }
    } else if (msg.type === 'SUBSCRIBE') {
      const channel = msg.channel;
      if (channel) {
        conn.subscriptions.add(channel);
        conn.ws.send(JSON.stringify({ type: 'SUBSCRIBED', channel }));
      }
    } else if (msg.type === 'UNSUBSCRIBE') {
      const channel = msg.channel;
      if (channel) {
        conn.subscriptions.delete(channel);
        conn.ws.send(JSON.stringify({ type: 'UNSUBSCRIBED', channel }));
      }
    }
  }

  public broadcastToChannel(channel: string, payload: any): void {
    this.sequenceTracker += 1;
    const message = JSON.stringify({
      type: 'BROADCAST',
      channel,
      seq: this.sequenceTracker,
      timestamp: new Date().toISOString(),
      payload
    });

    this.clients.forEach((conn) => {
      if (conn.subscriptions.has(channel) && conn.ws.readyState === WebSocket.OPEN) {
        conn.ws.send(message);
      }
    });
  }

  public getStats(): { activeConnectionsCount: number; currentSequence: number } {
    return {
      activeConnectionsCount: this.clients.size,
      currentSequence: this.sequenceTracker
    };
  }
}
