export interface ApiMeta {
  requestId?: string;
  timestamp: string;
  path?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
