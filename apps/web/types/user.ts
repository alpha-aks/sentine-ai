import { UserRole } from '@sentinel-ai/types';

export type UserAccountStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DEACTIVATED';

export interface UserEntity {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
  role: UserRole;
  status: UserAccountStatus;
  institutionId: string;
  institutionSlug?: string;
  department?: string | null;
  accommodations?: string[];
  metadata?: Record<string, any>;
  preferences?: UserPreferenceEntity;
  institutions?: UserInstitutionEntity[];
  effectivePermissions?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferenceEntity {
  preferenceId: string;
  userId: string;
  theme: 'LIGHT' | 'DARK' | 'SYSTEM';
  language: string;
  timezone: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  inAppAlerts: boolean;
  highContrastMode: boolean;
  fontSize: 'SMALL' | 'MEDIUM' | 'LARGE';
  updatedAt: string;
}

export interface UserInstitutionEntity {
  membershipId: string;
  userId: string;
  institutionId: string;
  institutionSlug: string;
  department?: string | null;
  title?: string | null;
  joinedAt: string;
  isPrimary: boolean;
}

export interface RoleEntity {
  id: string;
  roleId: string;
  name: string;
  code: UserRole | string;
  description: string;
  isSystem: boolean;
  permissions: string[];
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionDefinition {
  id: string;
  code: string;
  name: string;
  category: 'EXAMS' | 'QUESTIONS' | 'CANDIDATES' | 'INSTITUTIONS' | 'USERS' | 'REPORTS' | 'SYSTEM';
  description: string;
}

export interface InvitationEntity {
  id: string;
  invitationId: string;
  email: string;
  role: UserRole;
  institutionId: string;
  department?: string;
  invitedBy: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';
  expiresAt: string;
  createdAt: string;
}

export interface CreateUserInput {
  email: string;
  fullName: string;
  role?: UserRole;
  institutionId: string;
  institutionSlug?: string;
  department?: string;
  phoneNumber?: string;
  accommodations?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateUserInput {
  fullName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  accommodations?: string[];
  metadata?: Record<string, any>;
}

export interface UserSearchFilter {
  query?: string;
  role?: UserRole | 'ALL';
  institutionId?: string | 'ALL';
  status?: UserAccountStatus | 'ALL';
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DepartmentEntity {
  departmentId: string;
  institutionId: string;
  code: string;
  name: string;
  headName?: string;
}

export interface CourseEntity {
  courseId: string;
  institutionId: string;
  departmentId: string;
  code: string;
  title: string;
  credits: number;
}

export interface BatchEntity {
  batchId: string;
  institutionId: string;
  code: string;
  name: string;
  startYear: number;
  endYear: number;
}

export interface ProgramEntity {
  programId: string;
  institutionId: string;
  name: string;
  code: string;
  degreeType: string;
}
