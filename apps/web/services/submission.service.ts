import { apiClient } from '@/lib/api-client';
import { siteConfig } from '@/config/site-config';
import { ApiResponse } from '@/types/api';

export interface SubmissionAnswerEntity {
  answerId: string;
  submissionId: string;
  questionId: string;
  candidateId: string;
  answerType: string;
  answerData: any;
  version: number;
  isDraft: boolean;
  timeSpentSeconds?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DraftAnswerEntity {
  draftId: string;
  submissionId: string;
  questionId: string;
  candidateId: string;
  answerType: string;
  answerData: any;
  isDirty: boolean;
  sequenceNumber: number;
  timeSpentSeconds?: number;
  savedAt: string;
}

export interface SubmissionEntity {
  submissionId: string;
  candidateSessionId: string;
  examId: string;
  candidateId: string;
  institutionId: string;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'AUTO_SUBMITTED' | 'LOCKED' | 'EXPIRED';
  isLocked: boolean;
  answers: Record<string, SubmissionAnswerEntity>;
  drafts: Record<string, DraftAnswerEntity>;
  submittedAt?: string;
  autoSubmittedAt?: string;
  lockedAt?: string;
  recoveryCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SaveAnswerDto {
  questionId: string;
  answerType: string;
  answerData: any;
  timeSpentSeconds?: number;
  version?: number;
}

export interface SaveDraftDto {
  questionId: string;
  answerType: string;
  answerData: any;
  timeSpentSeconds?: number;
  sequenceNumber?: number;
}

export interface BatchAutosaveDto {
  drafts: SaveDraftDto[];
}

export interface SubmitFinalDto {
  confirmationToken?: string;
  submissionNotes?: string;
  autoSubmittedReason?: 'TIMER_EXPIRED' | 'PROCTOR_TERMINATED' | 'POLICY_VIOLATION';
}

export interface SubmissionValidationResult {
  isValid: boolean;
  unansweredQuestions: string[];
  errors: string[];
  warnings: string[];
}

export interface SubmissionReviewSummary {
  submissionId: string;
  totalQuestions: number;
  answeredCount: number;
  unansweredCount: number;
  draftCount: number;
  reviewCount: number;
  status: string;
  isLocked: boolean;
}

function getAuthHeaders(institutionId?: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem(siteConfig.storageKeys.accessToken) : null;
  const tenant = institutionId || (typeof window !== 'undefined' ? localStorage.getItem(siteConfig.storageKeys.tenantId) : null) || 'inst_mit_01';
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'x-institution-id': tenant,
      'Content-Type': 'application/json'
    }
  };
}

export const submissionService = {
  async startSubmission(dto: {
    candidateSessionId: string;
    examId: string;
    candidateId: string;
    institutionId: string;
  }): Promise<SubmissionEntity> {
    const response = await apiClient.post<ApiResponse<SubmissionEntity>>(
      `${siteConfig.apiEndpoints.submission}/v1/submissions`,
      dto,
      getAuthHeaders(dto.institutionId)
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to start submission session');
    }
    return response.data.data;
  },

  async getSubmission(submissionId: string): Promise<SubmissionEntity> {
    const response = await apiClient.get<ApiResponse<SubmissionEntity>>(
      `${siteConfig.apiEndpoints.submission}/v1/submissions/${submissionId}`,
      getAuthHeaders()
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch submission');
    }
    return response.data.data;
  },

  async saveAnswer(submissionId: string, dto: SaveAnswerDto): Promise<SubmissionAnswerEntity> {
    const response = await apiClient.put<ApiResponse<SubmissionAnswerEntity>>(
      `${siteConfig.apiEndpoints.submission}/v1/submissions/${submissionId}/answers/${dto.questionId}`,
      dto,
      getAuthHeaders()
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to save answer');
    }
    return response.data.data;
  },

  async saveDraft(submissionId: string, dto: SaveDraftDto): Promise<DraftAnswerEntity> {
    const response = await apiClient.post<ApiResponse<DraftAnswerEntity>>(
      `${siteConfig.apiEndpoints.submission}/v1/submissions/${submissionId}/drafts`,
      dto,
      getAuthHeaders()
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to save draft');
    }
    return response.data.data;
  },

  async batchAutosave(submissionId: string, dto: BatchAutosaveDto): Promise<{ savedCount: number }> {
    const response = await apiClient.post<ApiResponse<{ savedCount: number }>>(
      `${siteConfig.apiEndpoints.submission}/v1/submissions/${submissionId}/autosave`,
      dto,
      getAuthHeaders()
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to batch autosave drafts');
    }
    return response.data.data;
  },

  async restoreDraft(submissionId: string, questionId: string): Promise<SubmissionAnswerEntity> {
    const response = await apiClient.post<ApiResponse<SubmissionAnswerEntity>>(
      `${siteConfig.apiEndpoints.submission}/v1/submissions/${submissionId}/drafts/${questionId}/restore`,
      {},
      getAuthHeaders()
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to restore draft answer');
    }
    return response.data.data;
  },

  async submitFinal(submissionId: string, dto: SubmitFinalDto = {}): Promise<SubmissionEntity> {
    const response = await apiClient.post<ApiResponse<SubmissionEntity>>(
      `${siteConfig.apiEndpoints.submission}/v1/submissions/${submissionId}/submit`,
      dto,
      getAuthHeaders()
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to submit final exam');
    }
    return response.data.data;
  },

  async getRecoveryState(submissionId: string): Promise<{
    submission: SubmissionEntity;
    uncommittedDrafts: DraftAnswerEntity[];
  }> {
    const response = await apiClient.get<ApiResponse<{
      submission: SubmissionEntity;
      uncommittedDrafts: DraftAnswerEntity[];
    }>>(
      `${siteConfig.apiEndpoints.submission}/v1/submissions/${submissionId}/recovery`,
      getAuthHeaders()
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch recovery state');
    }
    return response.data.data;
  },

  async validateSubmission(submissionId: string): Promise<SubmissionValidationResult> {
    const response = await apiClient.get<ApiResponse<SubmissionValidationResult>>(
      `${siteConfig.apiEndpoints.submission}/v1/submissions/${submissionId}/validate`,
      getAuthHeaders()
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to validate submission');
    }
    return response.data.data;
  },

  async reviewSubmission(submissionId: string): Promise<SubmissionReviewSummary> {
    const response = await apiClient.get<ApiResponse<SubmissionReviewSummary>>(
      `${siteConfig.apiEndpoints.submission}/v1/submissions/${submissionId}/review`,
      getAuthHeaders()
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch submission review summary');
    }
    return response.data.data;
  },

  async getSubmissionStatus(submissionId: string): Promise<{ status: string; isLocked: boolean; submittedAt?: string }> {
    const response = await apiClient.get<ApiResponse<{ status: string; isLocked: boolean; submittedAt?: string }>>(
      `${siteConfig.apiEndpoints.submission}/v1/submissions/${submissionId}/status`,
      getAuthHeaders()
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch submission status');
    }
    return response.data.data;
  }
};
