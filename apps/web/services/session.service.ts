import { apiClient } from '@/lib/api-client';
import { siteConfig } from '@/config/site-config';
import { ApiResponse } from '@/types/api';
import {
  CandidateSessionEntity,
  HeartbeatStatusDto,
  RegisterDeviceDto,
  DeviceRegistrationEntity,
  SessionViolationEntity,
  ViolationType,
  PresenceEventType
} from '@/types/session';

export const sessionService = {
  async joinExam(data: {
    examId: string;
    institutionId: string;
    candidateId: string;
    candidateName: string;
    candidateEmail: string;
    examDurationSeconds: number;
  }): Promise<CandidateSessionEntity> {
    const res = await apiClient.post<ApiResponse<{ session: CandidateSessionEntity }>>(
      `${siteConfig.apiEndpoints.session}/v1/sessions`,
      data
    );
    return res.data.data!.session;
  },

  async getSession(sessionId: string): Promise<CandidateSessionEntity> {
    const res = await apiClient.get<ApiResponse<{ session: CandidateSessionEntity }>>(
      `${siteConfig.apiEndpoints.session}/v1/sessions/${sessionId}`
    );
    return res.data.data!.session;
  },

  async registerDevice(sessionId: string, data: Partial<RegisterDeviceDto>): Promise<DeviceRegistrationEntity> {
    const res = await apiClient.post<ApiResponse<{ device: DeviceRegistrationEntity }>>(
      `${siteConfig.apiEndpoints.session}/v1/sessions/${sessionId}/device`,
      data
    );
    return res.data.data!.device;
  },

  async recordHeartbeat(sessionId: string, data: {
    clientTimestamp: string;
    latencyMs?: number;
    isFullscreen?: boolean;
    isFocused?: boolean;
    isTabVisible?: boolean;
  }): Promise<{ status: HeartbeatStatusDto }> {
    const res = await apiClient.post<ApiResponse<{ status: HeartbeatStatusDto }>>(
      `${siteConfig.apiEndpoints.session}/v1/sessions/${sessionId}/heartbeat`,
      data
    );
    return res.data.data!;
  },

  async recordPresenceEvent(sessionId: string, eventType: PresenceEventType, metadata?: Record<string, unknown>): Promise<void> {
    await apiClient.post(
      `${siteConfig.apiEndpoints.session}/v1/sessions/${sessionId}/presence`,
      { eventType, metadata }
    );
  },

  async reportViolation(sessionId: string, violationType: ViolationType, detail?: string): Promise<SessionViolationEntity> {
    const res = await apiClient.post<ApiResponse<{ violation: SessionViolationEntity }>>(
      `${siteConfig.apiEndpoints.session}/v1/sessions/${sessionId}/violations`,
      { violationType, detail }
    );
    return res.data.data!.violation;
  },

  async moveToReady(sessionId: string): Promise<CandidateSessionEntity> {
    const res = await apiClient.post<ApiResponse<{ session: CandidateSessionEntity }>>(
      `${siteConfig.apiEndpoints.session}/v1/sessions/${sessionId}/ready`
    );
    return res.data.data!.session;
  },

  async startSession(sessionId: string): Promise<CandidateSessionEntity> {
    const res = await apiClient.post<ApiResponse<{ session: CandidateSessionEntity }>>(
      `${siteConfig.apiEndpoints.session}/v1/sessions/${sessionId}/start`
    );
    return res.data.data!.session;
  },

  async initiateReconnect(sessionId: string, reason: string): Promise<{ token: string }> {
    const res = await apiClient.post<ApiResponse<{ token: string }>>(
      `${siteConfig.apiEndpoints.session}/v1/sessions/${sessionId}/reconnect/initiate`,
      { reason }
    );
    return res.data.data!;
  },

  async completeReconnect(sessionId: string, token: string): Promise<CandidateSessionEntity> {
    const res = await apiClient.post<ApiResponse<{ session: CandidateSessionEntity }>>(
      `${siteConfig.apiEndpoints.session}/v1/sessions/${sessionId}/reconnect/complete`,
      { token }
    );
    return res.data.data!.session;
  },

  async submitSession(sessionId: string, finalAnswerCount?: number): Promise<CandidateSessionEntity> {
    const res = await apiClient.post<ApiResponse<{ session: CandidateSessionEntity }>>(
      `${siteConfig.apiEndpoints.session}/v1/sessions/${sessionId}/submit`,
      { finalAnswerCount }
    );
    return res.data.data!.session;
  }
};
