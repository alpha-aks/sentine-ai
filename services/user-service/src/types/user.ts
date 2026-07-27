import { Permission } from '@sentinel-ai/security';
import { UserRole } from '@sentinel-ai/types';

export type UserAccountStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DEACTIVATED';

export interface UserEntity {
  userId: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  phoneNumber: string | null;
  role: UserRole;
  status: UserAccountStatus;
  institutionId: string;
  accommodations: string[];
  metadata: Record<string, any>;
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

export interface UserRoleEntity {
  roleAssignmentId: string;
  userId: string;
  role: UserRole;
  assignedBy: string;
  assignedAt: string;
  reason: string | null;
}

export interface UserPermissionEntity {
  permissionId: string;
  userId: string;
  permission: Permission;
  isGranted: boolean;
  grantedBy: string;
  grantedAt: string;
}

export interface UserInstitutionEntity {
  membershipId: string;
  userId: string;
  institutionId: string;
  institutionSlug: string;
  department: string | null;
  title: string | null;
  joinedAt: string;
  isPrimary: boolean;
}

// DTOs
export interface CreateUserDto {
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

export interface UpdateUserDto {
  fullName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  accommodations?: string[];
  metadata?: Record<string, any>;
}

export interface UpdatePreferencesDto {
  theme?: 'LIGHT' | 'DARK' | 'SYSTEM';
  language?: string;
  timezone?: string;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  inAppAlerts?: boolean;
  highContrastMode?: boolean;
  fontSize?: 'SMALL' | 'MEDIUM' | 'LARGE';
}

export interface AssignRoleDto {
  role: UserRole;
  reason?: string;
}

export interface AssignPermissionDto {
  permission: Permission;
  isGranted: boolean;
}

export interface UserSearchQueryDto {
  query?: string;
  role?: UserRole;
  institutionId?: string;
  status?: UserAccountStatus;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserResponseDto {
  userId: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  phoneNumber: string | null;
  role: UserRole;
  status: UserAccountStatus;
  institutionId: string;
  accommodations: string[];
  metadata: Record<string, any>;
  preferences?: UserPreferenceEntity;
  institutions?: UserInstitutionEntity[];
  effectivePermissions?: Permission[];
  createdAt: string;
  updatedAt: string;
}
