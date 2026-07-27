import { apiClient } from '@/lib/api-client';
import { API_CONFIG } from '@/config/api-config';
import {
  UserEntity,
  CreateUserInput,
  UpdateUserInput,
  UserSearchFilter,
  UserAccountStatus,
  DepartmentEntity,
  CourseEntity,
  ProgramEntity,
  BatchEntity
} from '@/types/user';
import { UserRole } from '@sentinel-ai/types';

class UserService {
  private mapUser(raw: any): UserEntity {
    if (!raw) return raw;
    const item = raw.data || raw;
    return {
      ...item,
      id: item.userId || item.id || '',
      status: item.status || 'ACTIVE'
    };
  }

  async searchUsers(filters: UserSearchFilter = {}): Promise<{ items: UserEntity[]; total: number }> {
    const params: any = {
      page: filters.page || 1,
      limit: filters.limit || 20
    };
    if (filters.query) params.q = filters.query;
    if (filters.role && filters.role !== 'ALL') params.role = filters.role;
    if (filters.status && filters.status !== 'ALL') params.status = filters.status;
    if (filters.institutionId && filters.institutionId !== 'ALL') params.institutionId = filters.institutionId;
    if (filters.sortBy) params.sortBy = filters.sortBy;
    if (filters.sortOrder) params.sortOrder = filters.sortOrder;

    const res = await apiClient.get<any>(`${API_CONFIG.SERVICES.USER}/v1/users`, { params });
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
      items: list.map((item) => this.mapUser(item)),
      total
    };
  }

  async getUserById(id: string): Promise<UserEntity> {
    const res = await apiClient.get<any>(`${API_CONFIG.SERVICES.USER}/v1/users/${id}`);
    return this.mapUser(res.data);
  }

  async createUser(input: CreateUserInput): Promise<UserEntity> {
    const res = await apiClient.post<any>(`${API_CONFIG.SERVICES.USER}/v1/users`, input);
    return this.mapUser(res.data);
  }

  async updateUser(id: string, input: UpdateUserInput): Promise<UserEntity> {
    const res = await apiClient.patch<any>(`${API_CONFIG.SERVICES.USER}/v1/users/${id}`, input);
    return this.mapUser(res.data);
  }

  async updateStatus(id: string, status: UserAccountStatus): Promise<UserEntity> {
    const res = await apiClient.patch<any>(`${API_CONFIG.SERVICES.USER}/v1/users/${id}/status`, { status });
    return this.mapUser(res.data);
  }

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`${API_CONFIG.SERVICES.USER}/v1/users/${id}`);
  }

  async assignRole(id: string, role: UserRole, reason?: string): Promise<void> {
    await apiClient.post(`${API_CONFIG.SERVICES.USER}/v1/users/${id}/roles`, { role, reason });
  }

  async assignPermissionOverride(id: string, permission: string, isGranted: boolean): Promise<void> {
    await apiClient.post(`${API_CONFIG.SERVICES.USER}/v1/users/${id}/permissions`, { permission, isGranted });
  }

  async listDepartments(institutionId: string): Promise<DepartmentEntity[]> {
    const res = await apiClient.get<any>(`${API_CONFIG.SERVICES.INSTITUTION}/v1/institutions/${institutionId}/departments`);
    const raw = res.data;
    const list = Array.isArray(raw) ? raw : raw?.data?.departments || raw?.departments || raw?.data || [];
    return (Array.isArray(list) ? list : []).map((d: any) => ({
      departmentId: d.departmentId || d.id || '',
      institutionId: d.institutionId || institutionId,
      code: d.code || '',
      name: d.name || '',
      headName: d.headName || d.headOfDepartment
    }));
  }

  async listCourses(institutionId: string): Promise<CourseEntity[]> {
    const res = await apiClient.get<any>(`${API_CONFIG.SERVICES.INSTITUTION}/v1/institutions/${institutionId}/courses`);
    const raw = res.data;
    const list = Array.isArray(raw) ? raw : raw?.data?.courses || raw?.courses || raw?.data || [];
    return (Array.isArray(list) ? list : []).map((c: any) => ({
      courseId: c.courseId || c.id || '',
      institutionId: c.institutionId || institutionId,
      departmentId: c.departmentId || '',
      code: c.code || '',
      title: c.title || '',
      credits: c.credits || 3
    }));
  }

  async listPrograms(institutionId: string): Promise<ProgramEntity[]> {
    const res = await apiClient.get<any>(`${API_CONFIG.SERVICES.INSTITUTION}/v1/institutions/${institutionId}/programs`);
    const raw = res.data;
    const list = Array.isArray(raw) ? raw : raw?.data?.programs || raw?.programs || raw?.data || [];
    return (Array.isArray(list) ? list : []).map((p: any) => ({
      programId: p.programId || p.id || '',
      institutionId: p.institutionId || institutionId,
      name: p.name || '',
      code: p.code || '',
      degreeType: p.degreeType || 'BACHELORS'
    }));
  }

  async listBatches(institutionId: string): Promise<BatchEntity[]> {
    const res = await apiClient.get<any>(`${API_CONFIG.SERVICES.INSTITUTION}/v1/institutions/${institutionId}/batches`);
    const raw = res.data;
    const list = Array.isArray(raw) ? raw : raw?.data?.batches || raw?.batches || raw?.data || [];
    return (Array.isArray(list) ? list : []).map((b: any) => ({
      batchId: b.batchId || b.id || '',
      institutionId: b.institutionId || institutionId,
      code: b.code || '',
      name: b.name || '',
      startYear: b.startYear || new Date().getFullYear(),
      endYear: b.endYear || new Date().getFullYear() + 4
    }));
  }
}

export const userService = new UserService();
