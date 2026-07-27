import { apiClient } from '@/lib/api-client';
import { API_CONFIG } from '@/config/api-config';
import {
  QuestionEntity,
  CreateQuestionInput,
  UpdateQuestionInput,
  QuestionSearchFilter,
  QuestionBankEntity,
  QuestionPoolEntity,
  QuestionCategoryEntity,
  QuestionTagEntity,
  QuestionApprovalStatus
} from '@/types/question';

class QuestionService {
  private mapQuestion(raw: any): QuestionEntity {
    if (!raw) return raw;
    const item = raw.question || raw.data?.question || raw.data || raw;
    return {
      ...item,
      id: item.questionId || item.id || '',
      type: item.type || 'MCQ_SINGLE',
      title: item.title || 'Untitled Question',
      body: item.body || '',
      status: item.status || 'APPROVED',
      difficulty: item.difficulty || 'MEDIUM',
      marks: item.marks || 1,
      negativeMarks: item.negativeMarks || 0,
      estimatedTimeSeconds: item.estimatedTimeSeconds || 60,
      hints: Array.isArray(item.hints) ? item.hints : [],
      tags: Array.isArray(item.tags) ? item.tags : [],
      options: Array.isArray(item.options) ? item.options : [],
      version: item.version || 1,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || new Date().toISOString()
    };
  }

  async searchQuestions(filters: QuestionSearchFilter = {}): Promise<{ items: QuestionEntity[]; total: number }> {
    const params: any = {
      page: filters.page || 1,
      limit: filters.limit || 20
    };
    if (filters.query) params.query = filters.query;
    if (filters.type && filters.type !== 'ALL') params.type = filters.type;
    if (filters.difficulty && filters.difficulty !== 'ALL') params.difficulty = filters.difficulty;
    if (filters.status && filters.status !== 'ALL') params.status = filters.status;
    if (filters.categoryId && filters.categoryId !== 'ALL') params.categoryId = filters.categoryId;
    if (filters.tag && filters.tag !== 'ALL') params.tag = filters.tag;

    const res = await apiClient.get<any>(`${API_CONFIG.SERVICES.QUESTION}/v1/questions/search`, { params });
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
      items: list.map((item) => this.mapQuestion(item)),
      total
    };
  }

  async getQuestionById(id: string): Promise<QuestionEntity> {
    const res = await apiClient.get<any>(`${API_CONFIG.SERVICES.QUESTION}/v1/questions/${id}`);
    return this.mapQuestion(res.data);
  }

  async createQuestion(input: CreateQuestionInput): Promise<QuestionEntity> {
    const payload = {
      bankId: input.bankId || 'bank_default',
      institutionId: input.institutionId || 'inst_default',
      ...input
    };
    const res = await apiClient.post<any>(`${API_CONFIG.SERVICES.QUESTION}/v1/questions`, payload);
    return this.mapQuestion(res.data);
  }

  async updateQuestion(id: string, input: UpdateQuestionInput): Promise<QuestionEntity> {
    const res = await apiClient.patch<any>(`${API_CONFIG.SERVICES.QUESTION}/v1/questions/${id}`, input);
    return this.mapQuestion(res.data);
  }

  async deleteQuestion(id: string): Promise<void> {
    await apiClient.delete(`${API_CONFIG.SERVICES.QUESTION}/v1/questions/${id}`);
  }

  async updateApprovalStatus(id: string, status: QuestionApprovalStatus): Promise<void> {
    await apiClient.patch(`${API_CONFIG.SERVICES.QUESTION}/v1/questions/${id}/approval`, { status });
  }

  async listCategories(): Promise<QuestionCategoryEntity[]> {
    const res = await apiClient.get<any>(`${API_CONFIG.SERVICES.QUESTION}/v1/questions/categories`);
    const raw = res.data;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.items)) return raw.items;
    return [];
  }

  async createCategory(name: string, description?: string): Promise<QuestionCategoryEntity> {
    const res = await apiClient.post<any>(`${API_CONFIG.SERVICES.QUESTION}/v1/questions/categories`, {
      institutionId: 'inst_default',
      name,
      description
    });
    return res.data?.data || res.data;
  }

  async deleteCategory(categoryId: string): Promise<void> {
    await apiClient.delete(`${API_CONFIG.SERVICES.QUESTION}/v1/questions/categories/${categoryId}`);
  }

  async listTags(): Promise<QuestionTagEntity[]> {
    const res = await apiClient.get<any>(`${API_CONFIG.SERVICES.QUESTION}/v1/questions/tags`);
    const raw = res.data;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.items)) return raw.items;
    return [];
  }

  async createTag(name: string): Promise<QuestionTagEntity> {
    const res = await apiClient.post<any>(`${API_CONFIG.SERVICES.QUESTION}/v1/questions/tags`, {
      institutionId: 'inst_default',
      name
    });
    return res.data?.data || res.data;
  }

  async deleteTag(tagId: string): Promise<void> {
    await apiClient.delete(`${API_CONFIG.SERVICES.QUESTION}/v1/questions/tags/${tagId}`);
  }

  async listQuestionBanks(): Promise<QuestionBankEntity[]> {
    const res = await apiClient.get<any>(`${API_CONFIG.SERVICES.QUESTION}/v1/questions/banks`);
    const raw = res.data;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.items)) return raw.items;
    return [];
  }

  async listPools(bankId = 'bank_default'): Promise<QuestionPoolEntity[]> {
    const res = await apiClient.get<any>(`${API_CONFIG.SERVICES.QUESTION}/v1/questions/banks/${bankId}/pools`);
    const raw = res.data;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.items)) return raw.items;
    return [];
  }

  async createPool(name: string, targetQuestionCount: number): Promise<QuestionPoolEntity> {
    const res = await apiClient.post<any>(`${API_CONFIG.SERVICES.QUESTION}/v1/questions/pools`, {
      bankId: 'bank_default',
      institutionId: 'inst_default',
      name,
      targetQuestionCount
    });
    return res.data?.data || res.data;
  }

  async deletePool(poolId: string): Promise<void> {
    await apiClient.delete(`${API_CONFIG.SERVICES.QUESTION}/v1/questions/pools/${poolId}`);
  }
}

export const questionService = new QuestionService();
