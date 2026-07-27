import { apiClient } from '@/lib/api-client';
import { API_CONFIG } from '@/config/api-config';
import {
  ExamEntity,
  CreateExamInput,
  UpdateExamInput,
  ExamSearchFilter,
  ExamSectionEntity,
  ExamRuleEntity,
  ExamPolicyEntity,
  ExamScheduleEntity,
  ExamEligibilityEntity
} from '@/types/exam';

class ExamService {
  private mapExam(raw: any): ExamEntity {
    if (!raw) return raw;
    const item = raw.exam || raw.data?.exam || raw.data || raw;
    return {
      ...item,
      id: item.examId || item.id || '',
      type: item.type || 'QUIZ',
      status: item.status || 'DRAFT',
      difficultyLevel: item.difficultyLevel || 'MEDIUM',
      totalDurationMinutes: item.totalDurationMinutes || 60,
      totalPoints: item.totalPoints || 100,
      passingPercentage: item.passingPercentage || 60,
      maxAttemptsAllowed: item.maxAttemptsAllowed || 1,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || new Date().toISOString()
    };
  }

  async searchExams(filters: ExamSearchFilter = {}): Promise<{ items: ExamEntity[]; total: number }> {
    const params: any = {
      page: filters.page || 1,
      limit: filters.limit || 20
    };
    if (filters.query) params.q = filters.query;
    if (filters.type && filters.type !== 'ALL') params.type = filters.type;
    if (filters.status && filters.status !== 'ALL') params.status = filters.status;

    const res = await apiClient.get<any>(`${API_CONFIG.SERVICES.EXAM}/v1/exams`, { params });
    const raw = res.data;
    let list: any[] = [];
    let total = 0;

    if (Array.isArray(raw)) {
      list = raw;
      total = raw.length;
    } else if (raw?.data?.items) {
      list = raw.data.items;
      total = raw.data.total || list.length;
    } else if (raw?.items) {
      list = raw.items;
      total = raw.total || list.length;
    } else if (Array.isArray(raw?.data)) {
      list = raw.data;
      total = list.length;
    }

    return {
      items: list.map((item) => this.mapExam(item)),
      total
    };
  }

  async getExamById(id: string): Promise<ExamEntity> {
    const res = await apiClient.get<any>(`${API_CONFIG.SERVICES.EXAM}/v1/exams/${id}`);
    const raw = res.data;
    const base = this.mapExam(raw);
    const sections = raw?.data?.sections || raw?.sections || [];
    const rules = raw?.data?.rules || raw?.rules;
    const policy = raw?.data?.policy || raw?.policy;
    const schedule = raw?.data?.schedule || raw?.schedule;
    const eligibility = raw?.data?.eligibility || raw?.eligibility;

    return {
      ...base,
      sections,
      rules,
      policy,
      schedule,
      eligibility
    };
  }

  async createExam(input: CreateExamInput): Promise<ExamEntity> {
    const payload = {
      institutionId: input.institutionId || 'inst_default',
      ...input
    };
    const res = await apiClient.post<any>(`${API_CONFIG.SERVICES.EXAM}/v1/exams`, payload);
    return this.mapExam(res.data);
  }

  async updateExam(id: string, input: UpdateExamInput): Promise<ExamEntity> {
    const res = await apiClient.patch<any>(`${API_CONFIG.SERVICES.EXAM}/v1/exams/${id}`, input);
    return this.mapExam(res.data);
  }

  async deleteExam(id: string): Promise<void> {
    await apiClient.delete(`${API_CONFIG.SERVICES.EXAM}/v1/exams/${id}`);
  }

  async scheduleExam(id: string, schedule: Partial<ExamScheduleEntity>): Promise<void> {
    await apiClient.post(`${API_CONFIG.SERVICES.EXAM}/v1/exams/${id}/schedule`, schedule);
  }

  async publishExam(id: string): Promise<void> {
    await apiClient.post(`${API_CONFIG.SERVICES.EXAM}/v1/exams/${id}/publish`, {});
  }

  async archiveExam(id: string): Promise<void> {
    await apiClient.post(`${API_CONFIG.SERVICES.EXAM}/v1/exams/${id}/archive`, {});
  }

  async duplicateExam(id: string): Promise<ExamEntity> {
    const res = await apiClient.post<any>(`${API_CONFIG.SERVICES.EXAM}/v1/exams/${id}/duplicate`, {});
    return this.mapExam(res.data);
  }

  async updateRules(id: string, rules: Partial<ExamRuleEntity>): Promise<void> {
    await apiClient.patch(`${API_CONFIG.SERVICES.EXAM}/v1/exams/${id}/rules`, rules);
  }

  async updatePolicy(id: string, policy: Partial<ExamPolicyEntity>): Promise<void> {
    await apiClient.patch(`${API_CONFIG.SERVICES.EXAM}/v1/exams/${id}/policy`, policy);
  }

  async updateSections(id: string, sections: ExamSectionEntity[]): Promise<void> {
    await apiClient.put(`${API_CONFIG.SERVICES.EXAM}/v1/exams/${id}/sections`, { sections });
  }

  async updateEligibility(id: string, eligibility: Partial<ExamEligibilityEntity>): Promise<void> {
    await apiClient.patch(`${API_CONFIG.SERVICES.EXAM}/v1/exams/${id}/eligibility`, eligibility);
  }
}

export const examService = new ExamService();
