import { AgentWeights, SensitivityProfile, RiskThresholds } from './domain';

export interface ApiMeta {
  requestId: string;
  timestamp: string;
  path?: string;
}

export interface ApiResponse<T> {
  success: true;
  data: T;
  meta: ApiMeta;
}

export interface ValidationErrorItem {
  field: string;
  issue: string;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  details?: ValidationErrorItem[];
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorDetail;
  meta: ApiMeta;
}

export type ApiResult<T> = ApiResponse<T> | ApiErrorResponse;

// Pagination Models
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}

export type PaginatedApiResponse<T> = ApiResponse<PaginatedResult<T>>;

// Common DTOs
export interface CreateExamDto {
  institutionId: string;
  code: string;
  title: string;
  description: string;
  durationMinutes: number;
  sensitivityProfile?: SensitivityProfile;
}

export interface UpdatePolicyDto {
  sensitivityProfile: SensitivityProfile;
  customWeights?: AgentWeights;
  customThresholds?: RiskThresholds;
}

export interface ResolveAlertDto {
  action: 'DISMISS' | 'WARN' | 'PAUSE' | 'TERMINATE';
  proctorId: string;
  notes?: string;
}

export interface SubmitAnswerDto {
  questionId: string;
  answerText: string;
  selectedOptions?: string[];
}

export interface AuthTokenDto {
  accessToken: string;
  tokenType: 'Bearer';
  expiresInSeconds: number;
  userId: string;
  role: string;
}
