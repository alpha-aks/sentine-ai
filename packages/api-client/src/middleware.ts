export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export interface RequestConfig {
  url: string;
  baseUrl?: string;
  method: HttpMethod;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  body?: any;
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
  skipAuth?: boolean;
  signal?: AbortSignal;
  [key: string]: any;
}

export type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
export type ResponseInterceptor = (
  response: Response,
  request: RequestConfig
) => Response | Promise<Response>;
export type ErrorInterceptor = (error: any, request: RequestConfig) => any | Promise<any>;

export class MiddlewarePipeline {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  public useRequest(interceptor: RequestInterceptor): () => void {
    this.requestInterceptors.push(interceptor);
    return () => {
      this.requestInterceptors = this.requestInterceptors.filter(i => i !== interceptor);
    };
  }

  public useResponse(interceptor: ResponseInterceptor): () => void {
    this.responseInterceptors.push(interceptor);
    return () => {
      this.responseInterceptors = this.responseInterceptors.filter(i => i !== interceptor);
    };
  }

  public useError(interceptor: ErrorInterceptor): () => void {
    this.errorInterceptors.push(interceptor);
    return () => {
      this.errorInterceptors = this.errorInterceptors.filter(i => i !== interceptor);
    };
  }

  public async executeRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
    let currentConfig = { ...config };
    for (const interceptor of this.requestInterceptors) {
      currentConfig = await interceptor(currentConfig);
    }
    return currentConfig;
  }

  public async executeResponseInterceptors(
    response: Response,
    request: RequestConfig
  ): Promise<Response> {
    let currentResponse = response;
    for (const interceptor of this.responseInterceptors) {
      currentResponse = await interceptor(currentResponse, request);
    }
    return currentResponse;
  }

  public async executeErrorInterceptors(error: any, request: RequestConfig): Promise<any> {
    let currentError = error;
    for (const interceptor of this.errorInterceptors) {
      try {
        currentError = await interceptor(currentError, request);
      } catch (err) {
        currentError = err;
      }
    }
    throw currentError;
  }
}

export function createBearerAuthMiddleware(
  getToken: () => string | null | Promise<string | null>
): RequestInterceptor {
  return async (config: RequestConfig) => {
    if (config.skipAuth) return config;

    const token = await getToken();
    if (!token) return config;

    const headers = { ...config.headers };
    if (!headers['Authorization'] && !headers['authorization']) {
      headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }

    return { ...config, headers };
  };
}

export function createApiKeyAuthMiddleware(
  apiKey: string | (() => string | Promise<string>),
  headerName: string = 'X-API-Key'
): RequestInterceptor {
  return async (config: RequestConfig) => {
    if (config.skipAuth) return config;

    const key = typeof apiKey === 'function' ? await apiKey() : apiKey;
    if (!key) return config;

    const headers = { ...config.headers };
    headers[headerName] = key;

    return { ...config, headers };
  };
}

export function createCustomHeadersMiddleware(
  getHeaders:
    Record<string, string> | (() => Record<string, string> | Promise<Record<string, string>>)
): RequestInterceptor {
  return async (config: RequestConfig) => {
    const extraHeaders = typeof getHeaders === 'function' ? await getHeaders() : getHeaders;
    return {
      ...config,
      headers: {
        ...extraHeaders,
        ...config.headers
      }
    };
  };
}
