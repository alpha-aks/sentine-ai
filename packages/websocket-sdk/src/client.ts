import { generateUuid, sleep } from '@sentinel-ai/utils';
import { EventRegistry } from './event-registry';
import { ClientEventHandler, ClientState, WebSocketClientOptions, WebSocketMessage } from './types';

export class WebSocketClient<TEventMap extends Record<string, any> = Record<string, any>> {
  private socket: any = null;
  private state: ClientState = 'DISCONNECTED';
  private readonly options: WebSocketClientOptions;
  private readonly registry: EventRegistry<TEventMap> = new EventRegistry();
  private reconnectAttempt: number = 0;
  private isExplicitlyClosed: boolean = false;
  private heartbeatIntervalTimer: any = null;
  private heartbeatTimeoutTimer: any = null;
  private pendingQueue: string[] = [];
  private stateChangeListeners: Set<(state: ClientState) => void> = new Set();
  private errorListeners: Set<(error: any) => void> = new Set();

  constructor(options: WebSocketClientOptions) {
    this.options = {
      autoReconnect: true,
      maxReconnectAttempts: 10,
      reconnectDelayMs: 1000,
      reconnectBackoffFactor: 1.5,
      maxReconnectDelayMs: 30000,
      heartbeatIntervalMs: 15000,
      heartbeatTimeoutMs: 10000,
      ...options
    };
  }

  public getState(): ClientState {
    return this.state;
  }

  private setState(newState: ClientState): void {
    if (this.state !== newState) {
      this.state = newState;
      for (const listener of this.stateChangeListeners) {
        try {
          listener(newState);
        } catch (err) {
          console.error('[WebSocketClient] Error in state change listener:', err);
        }
      }
    }
  }

  public onStateChange(listener: (state: ClientState) => void): () => void {
    this.stateChangeListeners.add(listener);
    return () => this.stateChangeListeners.delete(listener);
  }

  public onError(listener: (error: any) => void): () => void {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }

  private getWebSocketConstructor(): any {
    if (typeof window !== 'undefined' && window.WebSocket) {
      return window.WebSocket;
    }
    if (typeof globalThis !== 'undefined' && (globalThis as any).WebSocket) {
      return (globalThis as any).WebSocket;
    }
    try {
      // Fallback Node.js ws require
      return require('ws');
    } catch {
      throw new Error('WebSocket implementation not found in execution environment');
    }
  }

  public async connect(): Promise<void> {
    if (this.state === 'CONNECTED' || this.state === 'CONNECTING') {
      return;
    }

    this.isExplicitlyClosed = false;
    this.setState(this.reconnectAttempt > 0 ? 'RECONNECTING' : 'CONNECTING');

    try {
      let rawUrl =
        typeof this.options.url === 'function' ? await this.options.url() : this.options.url;

      if (this.options.authTokenProvider) {
        const token = await this.options.authTokenProvider();
        if (token) {
          const urlObj = new URL(rawUrl, 'ws://localhost');
          urlObj.searchParams.set('token', token);
          rawUrl = urlObj.toString();
        }
      }

      const WebSocketCtor = this.getWebSocketConstructor();
      this.socket = new WebSocketCtor(rawUrl, this.options.protocols);

      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onerror = this.handleError.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
    } catch (err) {
      this.handleError(err);
      this.scheduleReconnect();
    }
  }

  private handleOpen(): void {
    this.setState('CONNECTED');
    this.reconnectAttempt = 0;
    this.startHeartbeat();
    this.flushQueue();
  }

  private handleMessage(event: any): void {
    this.resetHeartbeatTimeout();
    let rawData: string = '';

    if (typeof event.data === 'string') {
      rawData = event.data;
    } else if (event.data instanceof ArrayBuffer) {
      rawData = new TextDecoder().decode(event.data);
    } else if (Buffer.isBuffer(event.data)) {
      rawData = event.data.toString('utf8');
    }

    if (!rawData) return;

    try {
      const msg: WebSocketMessage = JSON.parse(rawData);

      if (msg.type === 'HEARTBEAT' || msg.type === 'PONG') {
        // Heartbeat response acknowledged
        return;
      }

      this.registry.emit(msg.type as any, msg.payload, msg);
    } catch (err) {
      console.warn('[WebSocketClient] Received non-JSON or invalid WebSocket payload:', rawData);
    }
  }

  private handleError(error: any): void {
    for (const listener of this.errorListeners) {
      try {
        listener(error);
      } catch (err) {
        console.error('[WebSocketClient] Error in error listener:', err);
      }
    }
  }

  private handleClose(): void {
    this.stopHeartbeat();
    this.socket = null;

    if (this.isExplicitlyClosed) {
      this.setState('DISCONNECTED');
    } else {
      this.setState('DISCONNECTED');
      if (this.options.autoReconnect) {
        this.scheduleReconnect();
      }
    }
  }

  private async scheduleReconnect(): Promise<void> {
    if (this.isExplicitlyClosed) return;
    if (this.reconnectAttempt >= (this.options.maxReconnectAttempts || 10)) {
      console.error(
        `[WebSocketClient] Max reconnect attempts (${this.options.maxReconnectAttempts}) reached.`
      );
      return;
    }

    this.reconnectAttempt++;
    const baseDelay = this.options.reconnectDelayMs || 1000;
    const factor = this.options.reconnectBackoffFactor || 1.5;
    const maxDelay = this.options.maxReconnectDelayMs || 30000;

    const delay = Math.min(baseDelay * Math.pow(factor, this.reconnectAttempt - 1), maxDelay);

    this.setState('RECONNECTING');
    await sleep(delay);
    if (!this.isExplicitlyClosed) {
      await this.connect();
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    const interval = this.options.heartbeatIntervalMs || 15000;

    this.heartbeatIntervalTimer = setInterval(() => {
      if (this.state === 'CONNECTED') {
        this.sendRaw(
          JSON.stringify({ type: 'HEARTBEAT', payload: { timestamp: new Date().toISOString() } })
        );
        this.setHeartbeatTimeout();
      }
    }, interval);
  }

  private setHeartbeatTimeout(): void {
    if (this.heartbeatTimeoutTimer) clearTimeout(this.heartbeatTimeoutTimer);
    const timeout = this.options.heartbeatTimeoutMs || 10000;

    this.heartbeatTimeoutTimer = setTimeout(() => {
      console.warn(
        '[WebSocketClient] Heartbeat timeout: server missed ping response. Terminating socket.'
      );
      if (this.socket) {
        try {
          this.socket.close();
        } catch {
          // Ignore close error
        }
      }
    }, timeout);
  }

  private resetHeartbeatTimeout(): void {
    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer);
      this.heartbeatTimeoutTimer = null;
    }
  }

  private stopHeartbeat(): void {
    if (this.heartbeatIntervalTimer) {
      clearInterval(this.heartbeatIntervalTimer);
      this.heartbeatIntervalTimer = null;
    }
    this.resetHeartbeatTimeout();
  }

  private sendRaw(data: string): void {
    if (this.state === 'CONNECTED' && this.socket && this.socket.readyState === 1) {
      this.socket.send(data);
    } else {
      this.pendingQueue.push(data);
    }
  }

  private flushQueue(): void {
    if (this.pendingQueue.length > 0 && this.state === 'CONNECTED' && this.socket) {
      const queueToFlush = [...this.pendingQueue];
      this.pendingQueue = [];
      for (const item of queueToFlush) {
        this.socket.send(item);
      }
    }
  }

  public send<K extends keyof TEventMap>(type: K, payload: TEventMap[K]): void {
    const msg: WebSocketMessage = {
      type: String(type),
      payload,
      eventId: generateUuid(),
      timestamp: new Date().toISOString()
    };
    this.sendRaw(JSON.stringify(msg));
  }

  public on<K extends keyof TEventMap>(
    type: K,
    handler: ClientEventHandler<TEventMap[K]>
  ): () => void {
    return this.registry.on(type, (payload, msg) => handler(payload, msg));
  }

  public off<K extends keyof TEventMap>(type: K, handler: ClientEventHandler<TEventMap[K]>): void {
    this.registry.off(type, (payload, msg) => handler(payload, msg));
  }

  public close(): void {
    this.isExplicitlyClosed = true;
    this.setState('CLOSING');
    this.stopHeartbeat();
    this.pendingQueue = [];
    if (this.socket) {
      this.socket.close();
    }
  }
}
