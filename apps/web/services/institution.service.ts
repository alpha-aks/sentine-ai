import { apiClient } from '@/lib/api-client';
import { API_CONFIG } from '@/config/api-config';

export interface Institution {
  id: string;
  institutionId?: string;
  name: string;
  code: string;
  slug: string;
  type: 'UNIVERSITY' | 'COLLEGE' | 'HIGH_SCHOOL' | 'CERTIFICATION_BODY';
  status: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
  domain?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  website?: string;
  timezone: string;
  language: string;
  academicYearStart: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  departmentId?: string;
  institutionId: string;
  name: string;
  code: string;
  headName?: string;
  contactEmail?: string;
  createdAt: string;
}

export interface Course {
  id: string;
  courseId?: string;
  institutionId: string;
  departmentId: string;
  code: string;
  title: string;
  credits: number;
  description?: string;
  createdAt: string;
}

export interface FacultyMember {
  id: string;
  facultyId?: string;
  institutionId: string;
  departmentId: string;
  fullName: string;
  email: string;
  role: string;
  specialization?: string;
  joinedAt: string;
}

export interface InstitutionBranding {
  institutionId: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  customCss?: string;
  portalSubdomain: string;
}

export interface InstitutionConfiguration {
  institutionId: string;
  sensitivityProfile: 'STRICT' | 'STANDARD' | 'LOW' | 'CUSTOM';
  allowMobileExams: boolean;
  ipWhitelist: string[];
  ssoEnabled: boolean;
  ssoProvider?: string;
}

export interface CreateInstitutionInput {
  name: string;
  code: string;
  slug?: string;
  type: 'UNIVERSITY' | 'COLLEGE' | 'HIGH_SCHOOL' | 'CERTIFICATION_BODY';
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  website?: string;
  timezone?: string;
  language?: string;
  academicYearStart?: string;
}

class InstitutionService {
  private mapInstitution(raw: any): Institution {
    if (!raw) return raw;
    const item = raw.institution || raw.data?.institution || raw.data || raw;
    return {
      ...item,
      id: item.institutionId || item.id || ''
    };
  }

  private mapDepartment(raw: any): Department {
    if (!raw) return raw;
    const item = raw.data || raw;
    return {
      ...item,
      id: item.departmentId || item.id || ''
    };
  }

  private mapCourse(raw: any): Course {
    if (!raw) return raw;
    const item = raw.data || raw;
    return {
      ...item,
      id: item.courseId || item.id || ''
    };
  }

  private mapFaculty(raw: any): FacultyMember {
    if (!raw) return raw;
    const item = raw.data || raw;
    return {
      ...item,
      id: item.facultyId || item.id || ''
    };
  }

  async getAll(): Promise<Institution[]> {
    const res = await apiClient.get<any>(`${API_CONFIG.SERVICES.INSTITUTION}/v1/institutions`);
    const raw = res.data;
    let list: any[] = [];
    if (Array.isArray(raw)) list = raw;
    else if (raw?.data && Array.isArray(raw.data)) list = raw.data;
    else if (raw?.data?.items && Array.isArray(raw.data.items)) list = raw.data.items;
    else if (raw?.items && Array.isArray(raw.items)) list = raw.items;
    return list.map((item: any) => this.mapInstitution(item));
  }

  async getById(id: string): Promise<Institution> {
    const res = await apiClient.get<any>(`${API_CONFIG.SERVICES.INSTITUTION}/v1/institutions/${id}`);
    return this.mapInstitution(res.data);
  }

  async create(input: CreateInstitutionInput): Promise<Institution> {
    const slug = input.slug || input.code?.toLowerCase().trim() || input.name?.toLowerCase().replace(/[^a-z0-9]/g, '-').trim();
    const payload = { ...input, slug };
    const res = await apiClient.post<any>(`${API_CONFIG.SERVICES.INSTITUTION}/v1/institutions`, payload);
    return this.mapInstitution(res.data);
  }

  async update(id: string, input: Partial<CreateInstitutionInput>): Promise<Institution> {
    const res = await apiClient.patch<any>(`${API_CONFIG.SERVICES.INSTITUTION}/v1/institutions/${id}`, input);
    return this.mapInstitution(res.data);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${API_CONFIG.SERVICES.INSTITUTION}/v1/institutions/${id}`);
  }

  // Departments
  async getDepartments(institutionId: string): Promise<Department[]> {
    const res = await apiClient.get<any>(`${API_CONFIG.SERVICES.INSTITUTION}/v1/institutions/${institutionId}/departments`);
    const raw = res.data;
    const list = Array.isArray(raw)
      ? raw
      : raw?.data?.departments || raw?.departments || raw?.data || [];
    return (Array.isArray(list) ? list : []).map((d: any) => this.mapDepartment(d));
  }

  async createDepartment(institutionId: string, input: { name: string; code: string; headName?: string; contactEmail?: string }): Promise<Department> {
    const res = await apiClient.post<any>(`${API_CONFIG.SERVICES.INSTITUTION}/v1/institutions/${institutionId}/departments`, input);
    return this.mapDepartment(res.data);
  }

  // Courses
  async getCourses(institutionId: string): Promise<Course[]> {
    const res = await apiClient.get<any>(`${API_CONFIG.SERVICES.INSTITUTION}/v1/institutions/${institutionId}/courses`);
    const raw = res.data;
    const list = Array.isArray(raw)
      ? raw
      : raw?.data?.courses || raw?.courses || raw?.data || [];
    return (Array.isArray(list) ? list : []).map((c: any) => this.mapCourse(c));
  }

  async createCourse(institutionId: string, input: { departmentId: string; code: string; title: string; credits: number; description?: string }): Promise<Course> {
    const res = await apiClient.post<any>(`${API_CONFIG.SERVICES.INSTITUTION}/v1/institutions/${institutionId}/courses`, input);
    return this.mapCourse(res.data);
  }

  // Faculty
  async getFaculty(institutionId: string): Promise<FacultyMember[]> {
    const res = await apiClient.get<any>(`${API_CONFIG.SERVICES.INSTITUTION}/v1/institutions/${institutionId}/faculty`);
    const raw = res.data;
    const list = Array.isArray(raw)
      ? raw
      : raw?.data?.faculty || raw?.faculty || raw?.data || [];
    return (Array.isArray(list) ? list : []).map((f: any) => this.mapFaculty(f));
  }

  async assignFaculty(institutionId: string, input: { departmentId: string; fullName: string; email: string; role: string; specialization?: string }): Promise<FacultyMember> {
    const res = await apiClient.post<any>(`${API_CONFIG.SERVICES.INSTITUTION}/v1/institutions/${institutionId}/faculty`, input);
    return this.mapFaculty(res.data);
  }

  // Branding & Configuration
  async getBranding(institutionId: string): Promise<InstitutionBranding> {
    const res = await apiClient.get<any>(`${API_CONFIG.SERVICES.INSTITUTION}/v1/institutions/${institutionId}/branding`);
    const raw = res.data;
    return raw?.data?.branding || raw?.branding || raw?.data || raw;
  }

  async updateBranding(institutionId: string, input: Partial<InstitutionBranding>): Promise<InstitutionBranding> {
    const res = await apiClient.patch<any>(`${API_CONFIG.SERVICES.INSTITUTION}/v1/institutions/${institutionId}/branding`, input);
    const raw = res.data;
    return raw?.data?.branding || raw?.branding || raw?.data || raw;
  }

  async getConfiguration(institutionId: string): Promise<InstitutionConfiguration> {
    const res = await apiClient.get<any>(`${API_CONFIG.SERVICES.INSTITUTION}/v1/institutions/${institutionId}/configuration`);
    const raw = res.data;
    return raw?.data?.configuration || raw?.configuration || raw?.data || raw;
  }

  async updateConfiguration(institutionId: string, input: Partial<InstitutionConfiguration>): Promise<InstitutionConfiguration> {
    const res = await apiClient.patch<any>(`${API_CONFIG.SERVICES.INSTITUTION}/v1/institutions/${institutionId}/configuration`, input);
    const raw = res.data;
    return raw?.data?.configuration || raw?.configuration || raw?.data || raw;
  }
}

export const institutionService = new InstitutionService();
