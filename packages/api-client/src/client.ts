import { ApiResponse } from '@sentinel-ai/types';
import { retry, sleep } from '@sentinel-ai/utils';
import {
  ApiClientError,
  NetworkError,
  TimeoutError,
  createApiClientErrorFromResponse
} from './errors';
import {
  HttpMethod,
  MiddlewarePipeline,
  RequestConfig,
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor,
  createBearerAuthMiddleware
} from './middleware';

export interface HttpClientOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
  authTokenProvider?: () => string | null | Promise<string | null>;
  fetch?: typeof globalThis.fetch;
}

export class HttpClient {
  private readonly baseUrl: string;
  private readonly defaultHeaders: Record<string, string>;
  private readonly defaultTimeoutMs: number;
  private readonly defaultRetries: number;
  private readonly defaultRetryDelayMs: number;
  private readonly pipeline: MiddlewarePipeline;
  private readonly fetchImpl: typeof globalThis.fetch;

  constructor(options: HttpClientOptions = {}) {
    this.baseUrl = (options.baseUrl || '').replace(/\/+$/, '');
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers || {})
    };
    this.defaultTimeoutMs = options.timeoutMs ?? 30000;
    this.defaultRetries = options.retries ?? 0;
    this.defaultRetryDelayMs = options.retryDelayMs ?? 1000;
    this.pipeline = new MiddlewarePipeline();
    this.fetchImpl = options.fetch || globalThis.fetch.bind(globalThis);

    if (options.authTokenProvider) {
      this.useRequest(createBearerAuthMiddleware(options.authTokenProvider));
    }
  }

  public useRequest(interceptor: RequestInterceptor): () => void {
    return this.pipeline.useRequest(interceptor);
  }

  public useResponse(interceptor: ResponseInterceptor): () => void {
    return this.pipeline.useResponse(interceptor);
  }

  public useError(interceptor: ErrorInterceptor): () => void {
    return this.pipeline.useError(interceptor);
  }

  private buildUrl(url: string, params?: Record<string, any>, baseUrlOverride?: string): string {
    let fullUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      const base = (baseUrlOverride || this.baseUrl).replace(/\/+$/, '');
      const path = url.replace(/^\/+/, '');
      fullUrl = base ? `${base}/${path}` : path;
    }

    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(val => searchParams.append(key, String(val)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      }
      const queryString = searchParams.toString();
      if (queryString) {
        fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString;
      }
    }

    return fullUrl;
  }

  public async request<T = any>(config: RequestConfig): Promise<ApiResponse<T>> {
    const maxRetries = config.retries ?? this.defaultRetries;
    const initialDelay = config.retryDelayMs ?? this.defaultRetryDelayMs;

    return retry(
      async () => {
        return this.executeSingleRequest<T>(config);
      },
      {
        maxRetries,
        delayMs: initialDelay,
        backoffFactor: 2,
        shouldRetry: (error: any) => {
          if (error instanceof TimeoutError || error instanceof NetworkError) {
            return true;
          }
          if (error instanceof ApiClientError) {
            // Retry on rate limit (429) or transient server errors (502, 503, 504)
            return error.status === 429 || [502, 503, 504].includes(error.status);
          }
          return false;
        }
      }
    );
  }

  public async requestData<T = any>(config: RequestConfig): Promise<T> {
    const response = await this.request<T>(config);
    return response.data;
  }

  private async executeSingleRequest<T>(config: RequestConfig): Promise<ApiResponse<T>> {
    let processedConfig: RequestConfig;
    try {
      processedConfig = await this.pipeline.executeRequestInterceptors({
        ...config,
        headers: {
          ...this.defaultHeaders,
          ...(config.headers || {})
        }
      });
    } catch (err) {
      throw await this.pipeline.executeErrorInterceptors(err, config);
    }

    const finalUrl = this.buildUrl(
      processedConfig.url,
      processedConfig.params,
      processedConfig.baseUrl
    );
    const timeoutMs = processedConfig.timeoutMs ?? this.defaultTimeoutMs;

    const controller = new AbortController();
    let isTimeout = false;

    const timeoutTimer = setTimeout(() => {
      isTimeout = true;
      controller.abort();
    }, timeoutMs);

    if (processedConfig.signal) {
      processedConfig.signal.addEventListener('abort', () => controller.abort());
    }

    let requestBody: any = undefined;
    if (processedConfig.body !== undefined && processedConfig.body !== null) {
      if (
        typeof processedConfig.body === 'string' ||
        processedConfig.body instanceof FormData ||
        processedConfig.body instanceof URLSearchParams ||
        processedConfig.body instanceof ArrayBuffer
      ) {
        requestBody = processedConfig.body;
      } else {
        requestBody = JSON.stringify(processedConfig.body);
      }
    }

    try {
      let response: Response;
      try {
        response = await this.fetchImpl(finalUrl, {
          method: processedConfig.method,
          headers: processedConfig.headers,
          body: requestBody,
          signal: controller.signal
        });
      } catch (fetchErr: any) {
        if (isTimeout || fetchErr.name === 'AbortError') {
          throw new TimeoutError(finalUrl, processedConfig.method, timeoutMs);
        }
        throw new NetworkError(finalUrl, processedConfig.method, fetchErr);
      } finally {
        clearTimeout(timeoutTimer);
      }

      const interceptedResponse = await this.pipeline.executeResponseInterceptors(
        response,
        processedConfig
      );

      let responseData: any = null;
      const contentType = interceptedResponse.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          responseData = await interceptedResponse.json();
        } catch {
          responseData = null;
        }
      } else {
        try {
          responseData = await interceptedResponse.text();
        } catch {
          responseData = null;
        }
      }

      if (!interceptedResponse.ok) {
        throw createApiClientErrorFromResponse(
          interceptedResponse.status,
          finalUrl,
          processedConfig.method,
          responseData
        );
      }

      if (
        responseData &&
        typeof responseData === 'object' &&
        responseData.success === true &&
        'data' in responseData
      ) {
        return responseData as ApiResponse<T>;
      }

      // If backend returned direct payload T without standard ApiResponse wrapper, construct envelope
      return {
        success: true,
        data: responseData as T,
        meta: {
          requestId: interceptedResponse.headers.get('x-request-id') || `req_${Date.now()}`,
          timestamp: new Date().toISOString(),
          path: new URL(finalUrl, 'http://localhost').pathname
        }
      };
    } catch (error) {
      clearTimeout(timeoutTimer);
      throw await this.pipeline.executeErrorInterceptors(error, processedConfig);
    }
  }

  public get<T = any>(
    url: string,
    params?: Record<string, any>,
    config?: Omit<RequestConfig, 'url' | 'method' | 'params'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'GET', params });
  }

  public post<T = any>(
    url: string,
    body?: any,
    config?: Omit<RequestConfig, 'url' | 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'POST', body });
  }

  public put<T = any>(
    url: string,
    body?: any,
    config?: Omit<RequestConfig, 'url' | 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'PUT', body });
  }

  public patch<T = any>(
    url: string,
    body?: any,
    config?: Omit<RequestConfig, 'url' | 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'PATCH', body });
  }

  public delete<T = any>(
    url: string,
    params?: Record<string, any>,
    config?: Omit<RequestConfig, 'url' | 'method' | 'params'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'DELETE', params });
  }
}

export function createApiClient(options?: HttpClientOptions): HttpClient {
  return new HttpClient(options);
}
