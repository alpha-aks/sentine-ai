import { ApiErrorResponse, ValidationErrorItem } from '@sentinel-ai/types';

export class ApiClientError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly url: string;
  public readonly method: string;
  public readonly details?: ValidationErrorItem[];
  public readonly apiError?: ApiErrorResponse;
  public readonly rawBody?: any;

  constructor(params: {
    message: string;
    status: number;
    code?: string;
    url: string;
    method: string;
    details?: ValidationErrorItem[];
    apiError?: ApiErrorResponse;
    rawBody?: any;
  }) {
    super(params.message);
    this.name = 'ApiClientError';
    this.status = params.status;
    this.code = params.code || 'UNKNOWN_API_ERROR';
    this.url = params.url;
    this.method = params.method;
    this.details = params.details;
    this.apiError = params.apiError;
    this.rawBody = params.rawBody;

    // Restore prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public isAuthError(): boolean {
    return this.status === 401;
  }

  public isForbiddenError(): boolean {
    return this.status === 403;
  }

  public isNotFoundError(): boolean {
    return this.status === 404;
  }

  public isValidationError(): boolean {
    return this.status === 400 || this.status === 422;
  }

  public isServerError(): boolean {
    return this.status >= 500 && this.status < 600;
  }
}

export class NetworkError extends ApiClientError {
  constructor(url: string, method: string, originalError?: Error) {
    super({
      message: originalError
        ? `Network error: ${originalError.message}`
        : 'Network error: Failed to fetch',
      status: 0,
      code: 'NETWORK_ERROR',
      url,
      method
    });
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends ApiClientError {
  public readonly timeoutMs: number;

  constructor(url: string, method: string, timeoutMs: number) {
    super({
      message: `Request timed out after ${timeoutMs}ms`,
      status: 408,
      code: 'TIMEOUT_ERROR',
      url,
      method
    });
    this.name = 'TimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

export function isApiClientError(err: any): err is ApiClientError {
  return err instanceof ApiClientError;
}

export function createApiClientErrorFromResponse(
  status: number,
  url: string,
  method: string,
  responseData: any
): ApiClientError {
  let message = `API request failed with status ${status}`;
  let code = `HTTP_${status}`;
  let details: ValidationErrorItem[] | undefined = undefined;
  let apiError: ApiErrorResponse | undefined = undefined;

  if (responseData && typeof responseData === 'object') {
    if (responseData.success === false && responseData.error) {
      apiError = responseData as ApiErrorResponse;
      message = responseData.error.message || message;
      code = responseData.error.code || code;
      details = responseData.error.details;
    } else if (responseData.message) {
      message = responseData.message;
      if (responseData.code) code = responseData.code;
    }
  }

  return new ApiClientError({
    message,
    status,
    code,
    url,
    method,
    details,
    apiError,
    rawBody: responseData
  });
}
