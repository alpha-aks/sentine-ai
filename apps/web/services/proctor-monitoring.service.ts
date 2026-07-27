import { apiClient } from '@/lib/api-client';
import { siteConfig } from '@/config/site-config';
import { ApiResponse } from '@/types/api';

export type CandidateStatus =
  | 'WAITING'
  | 'READY'
  | 'IN_PROGRESS'
  | 'DISCONNECTED'
  | 'PAUSED'
  | 'SUBMITTED'
  | 'COMPLETED'
  | 'TERMINATED'
  | 'SUSPICIOUS';

export type AlertPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertSeverity = 'INFO' | 'WARNING' | 'VIOLATION' | 'CRITICAL';
export type AlertCategory = 'VISION' | 'ACOUSTIC' | 'BEHAVIORAL' | 'COLLUSION' | 'SYSTEM' | 'MANUAL';
export type AlertStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED' | 'ESCALATED';

export type ManualActionType =
  | 'WARN_CANDIDATE'
  | 'PAUSE_SESSION'
  | 'RESUME_SESSION'
  | 'TERMINATE_SESSION'
  | 'REQUEST_IDENTITY_CHECK'
  | 'ADD_MANUAL_NOTE'
  | 'FLAG_SUBMISSION';

export interface CandidateMonitorEntity {
  candidateSessionId: string;
  examId: string;
  institutionId: string;
  candidateId: string;
  candidateName: string;
  status: CandidateStatus;
  currentQuestionId?: string;
  currentRiskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  lastHeartbeatAt: string;
  isFlagged: boolean;
  manualActionCount: number;
  activeAlertCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface LiveExamMonitorEntity {
  examId: string;
  institutionId: string;
  examCode: string;
  title: string;
  totalCandidates: number;
  inProgressCandidates: number;
  pausedCandidates: number;
  suspiciousCandidates: number;
  terminatedCandidates: number;
  submittedCandidates: number;
  averageRiskScore: number;
  activeAlertsCount: number;
  updatedAt: string;
}

export interface RiskSnapshotEntity {
  candidateSessionId: string;
  currentScore: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  latestEventName?: string;
  latestEventTimestamp?: string;
  historySummary: {
    timestamp: string;
    score: number;
    eventName?: string;
  }[];
  updatedAt: string;
}

export interface SessionActivityEntity {
  activityId: string;
  candidateSessionId: string;
  eventType: string;
  description: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface EvidenceMetadataEntity {
  evidenceId: string;
  candidateSessionId: string;
  examId: string;
  type: string;
  title: string;
  storageUri: string;
  mimeType: string;
  sizeBytes: number;
  recordedAt: string;
}

export interface AlertEntity {
  alertId: string;
  candidateSessionId: string;
  examId: string;
  institutionId: string;
  title: string;
  description: string;
  priority: AlertPriority;
  severity: AlertSeverity;
  category: AlertCategory;
  status: AlertStatus;
  notes?: string;
  acknowledgedBy?: string;
  resolvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ManualActionRecordEntity {
  actionId: string;
  candidateSessionId: string;
  examId: string;
  institutionId: string;
  proctorId: string;
  actionType: ManualActionType;
  notes?: string;
  timestamp: string;
}

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem(siteConfig.storageKeys.accessToken) : null;
  const tenant = (typeof window !== 'undefined' ? localStorage.getItem(siteConfig.storageKeys.tenantId) : null) || 'inst_mit_01';
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'x-institution-id': tenant,
      'Content-Type': 'application/json'
    }
  };
}

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let attempts = 0;
  while (attempts <= maxRetries) {
    try {
      return await fn();
    } catch (err: any) {
      if (attempts >= maxRetries) throw err;
      attempts += 1;
      await new Promise((resolve) => setTimeout(resolve, 500 * attempts));
    }
  }
  throw new Error('API execution failed after retries');
}

export const proctorMonitoringService = {
  async getActiveExams(): Promise<LiveExamMonitorEntity[]> {
    return withRetry(async () => {
      const response = await apiClient.get<ApiResponse<LiveExamMonitorEntity[]>>(
        `${siteConfig.apiEndpoints.proctorMonitoring}/api/v1/monitoring/exams/active`,
        getAuthHeaders()
      );
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error?.message || 'Failed to fetch active exams');
      }
      return response.data.data;
    });
  },

  async getExamDetails(examId: string): Promise<LiveExamMonitorEntity> {
    return withRetry(async () => {
      const response = await apiClient.get<ApiResponse<LiveExamMonitorEntity>>(
        `${siteConfig.apiEndpoints.proctorMonitoring}/api/v1/monitoring/exams/${examId}`,
        getAuthHeaders()
      );
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error?.message || 'Failed to fetch exam details');
      }
      return response.data.data;
    });
  },

  async getCandidates(examId?: string, status?: string): Promise<CandidateMonitorEntity[]> {
    return withRetry(async () => {
      const params = new URLSearchParams();
      if (examId) params.append('examId', examId);
      if (status && status !== 'ALL') params.append('status', status);

      const response = await apiClient.get<ApiResponse<CandidateMonitorEntity[]>>(
        `${siteConfig.apiEndpoints.proctorMonitoring}/api/v1/monitoring/candidates?${params.toString()}`,
        getAuthHeaders()
      );
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error?.message || 'Failed to fetch monitored candidates');
      }
      return response.data.data;
    });
  },

  async getCandidateDetails(sessionId: string): Promise<CandidateMonitorEntity> {
    return withRetry(async () => {
      const response = await apiClient.get<ApiResponse<CandidateMonitorEntity>>(
        `${siteConfig.apiEndpoints.proctorMonitoring}/api/v1/monitoring/candidates/${sessionId}`,
        getAuthHeaders()
      );
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error?.message || 'Failed to fetch candidate details');
      }
      return response.data.data;
    });
  },

  async getRiskSnapshot(sessionId: string): Promise<RiskSnapshotEntity> {
    return withRetry(async () => {
      const response = await apiClient.get<ApiResponse<RiskSnapshotEntity>>(
        `${siteConfig.apiEndpoints.proctorMonitoring}/api/v1/monitoring/candidates/${sessionId}/risk`,
        getAuthHeaders()
      );
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error?.message || 'Failed to fetch risk snapshot');
      }
      return response.data.data;
    });
  },

  async getTimeline(sessionId: string): Promise<SessionActivityEntity[]> {
    return withRetry(async () => {
      const response = await apiClient.get<ApiResponse<SessionActivityEntity[]>>(
        `${siteConfig.apiEndpoints.proctorMonitoring}/api/v1/monitoring/candidates/${sessionId}/timeline`,
        getAuthHeaders()
      );
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error?.message || 'Failed to fetch candidate activity timeline');
      }
      return response.data.data;
    });
  },

  async getEvidenceList(sessionId: string): Promise<EvidenceMetadataEntity[]> {
    return withRetry(async () => {
      const response = await apiClient.get<ApiResponse<EvidenceMetadataEntity[]>>(
        `${siteConfig.apiEndpoints.proctorMonitoring}/api/v1/monitoring/candidates/${sessionId}/evidence`,
        getAuthHeaders()
      );
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error?.message || 'Failed to fetch evidence metadata');
      }
      return response.data.data;
    });
  },

  async getAlerts(examId?: string, status?: string): Promise<AlertEntity[]> {
    return withRetry(async () => {
      const params = new URLSearchParams();
      if (examId) params.append('examId', examId);
      if (status && status !== 'ALL') params.append('status', status);

      const response = await apiClient.get<ApiResponse<AlertEntity[]>>(
        `${siteConfig.apiEndpoints.proctorMonitoring}/api/v1/monitoring/alerts?${params.toString()}`,
        getAuthHeaders()
      );
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error?.message || 'Failed to fetch proctoring alerts');
      }
      return response.data.data;
    });
  },

  async updateAlertStatus(alertId: string, status: AlertStatus, notes?: string): Promise<AlertEntity> {
    const response = await apiClient.patch<ApiResponse<AlertEntity>>(
      `${siteConfig.apiEndpoints.proctorMonitoring}/api/v1/monitoring/alerts/${alertId}/status`,
      { status, notes },
      getAuthHeaders()
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update alert status');
    }
    return response.data.data;
  },

  async executeManualAction(
    sessionId: string,
    actionType: ManualActionType,
    notes?: string,
    examId: string = 'exam_cs101',
    institutionId: string = 'inst_mit_01'
  ): Promise<ManualActionRecordEntity> {
    const response = await apiClient.post<ApiResponse<ManualActionRecordEntity>>(
      `${siteConfig.apiEndpoints.proctorMonitoring}/api/v1/monitoring/candidates/${sessionId}/actions`,
      { examId, institutionId, actionType, notes },
      getAuthHeaders()
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to execute manual proctor action');
    }
    return response.data.data;
  },

  async getStats(): Promise<{
    activeExamsCount: number;
    totalMonitoredCandidates: number;
    suspiciousCandidatesCount: number;
    openAlertsCount: number;
  }> {
    return withRetry(async () => {
      const response = await apiClient.get<ApiResponse<{
        activeExamsCount: number;
        totalMonitoredCandidates: number;
        suspiciousCandidatesCount: number;
        openAlertsCount: number;
      }>>(
        `${siteConfig.apiEndpoints.proctorMonitoring}/api/v1/monitoring/stats`,
        getAuthHeaders()
      );
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error?.message || 'Failed to fetch proctoring statistics');
      }
      return response.data.data;
    });
  }
};
