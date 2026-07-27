import { ApiResponse } from '@sentinel-ai/types';
import {
  EventEnvelope,
  EventHandler,
  IEventBus,
  SubscriptionHandle,
  SubscriptionOptions
} from '@sentinel-ai/event-sdk';
import { generateUuid } from '@sentinel-ai/utils';

export interface RecordedHttpCall {
  url: string;
  method: string;
  params?: Record<string, any>;
  body?: any;
  headers?: Record<string, string>;
  timestamp: string;
}

export type MockHandler = (
  config: RecordedHttpCall
) => ApiResponse<any> | Promise<ApiResponse<any>>;

export class MockHttpClient {
  public readonly calls: RecordedHttpCall[] = [];
  private routes: Map<string, MockHandler> = new Map();
  private defaultResponseStatus: number = 200;

  public mockRoute(
    method: string,
    urlPattern: string | RegExp,
    responseData: any | MockHandler
  ): void {
    const key = `${method.toUpperCase()}:${urlPattern.toString()}`;
    if (typeof responseData === 'function') {
      this.routes.set(key, responseData);
    } else {
      this.routes.set(key, () => ({
        success: true,
        data: responseData,
        meta: {
          requestId: `mock_req_${generateUuid()}`,
          timestamp: new Date().toISOString()
        }
      }));
    }
  }

  public async request<T = any>(config: {
    url: string;
    method: string;
    params?: any;
    body?: any;
    headers?: any;
  }): Promise<ApiResponse<T>> {
    const call: RecordedHttpCall = {
      url: config.url,
      method: config.method.toUpperCase(),
      params: config.params,
      body: config.body,
      headers: config.headers,
      timestamp: new Date().toISOString()
    };

    this.calls.push(call);

    const exactKey = `${call.method}:${call.url}`;
    if (this.routes.has(exactKey)) {
      return this.routes.get(exactKey)!(call);
    }

    for (const [key, handler] of this.routes.entries()) {
      const [m, patternStr] = key.split(':');
      if (m === call.method) {
        if (patternStr.startsWith('/') && patternStr.endsWith('/')) {
          const regex = new RegExp(patternStr.slice(1, -1));
          if (regex.test(call.url)) {
            return handler(call);
          }
        }
      }
    }

    // Default mock response
    return {
      success: true,
      data: {} as T,
      meta: {
        requestId: `mock_req_${generateUuid()}`,
        timestamp: new Date().toISOString()
      }
    };
  }

  public get<T = any>(url: string, params?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: 'GET', params });
  }

  public post<T = any>(url: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: 'POST', body });
  }

  public put<T = any>(url: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: 'PUT', body });
  }

  public delete<T = any>(url: string, params?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: 'DELETE', params });
  }

  public clearCalls(): void {
    this.calls.length = 0;
  }

  public getCallsTo(urlSubstring: string): RecordedHttpCall[] {
    return this.calls.filter(c => c.url.includes(urlSubstring));
  }
}

export class MockLogger {
  public logs: Array<{ level: 'info' | 'warn' | 'error' | 'debug'; message: string; meta?: any }> =
    [];

  public info(message: string, meta?: any): void {
    this.logs.push({ level: 'info', message, meta });
  }

  public warn(message: string, meta?: any): void {
    this.logs.push({ level: 'warn', message, meta });
  }

  public error(message: string, meta?: any): void {
    this.logs.push({ level: 'error', message, meta });
  }

  public debug(message: string, meta?: any): void {
    this.logs.push({ level: 'debug', message, meta });
  }

  public hasLogged(level: 'info' | 'warn' | 'error' | 'debug', substring: string): boolean {
    return this.logs.some(l => l.level === level && l.message.includes(substring));
  }

  public clear(): void {
    this.logs = [];
  }
}

export class MockEventBus implements IEventBus {
  public publishedEvents: EventEnvelope[] = [];
  private subscriptions: Map<string, EventHandler> = new Map();

  public async publish<T = any>(event: EventEnvelope<T>): Promise<void> {
    this.publishedEvents.push(event);
    for (const handler of this.subscriptions.values()) {
      await handler(event);
    }
  }

  public subscribe<T = any>(
    pattern: string,
    handler: EventHandler<T>,
    _options?: SubscriptionOptions
  ): SubscriptionHandle {
    const id = `sub_${generateUuid()}`;
    this.subscriptions.set(id, handler as EventHandler);
    return {
      subscriptionId: id,
      eventTypePattern: pattern,
      unsubscribe: () => {
        this.subscriptions.delete(id);
      }
    };
  }

  public unsubscribe(subscriptionId: string): void {
    this.subscriptions.delete(subscriptionId);
  }

  public clear(): void {
    this.publishedEvents = [];
    this.subscriptions.clear();
  }

  public listenerCount(): number {
    return this.subscriptions.size;
  }

  public getEventsByType(eventType: string): EventEnvelope[] {
    return this.publishedEvents.filter(e => e.eventType === eventType);
  }
}
