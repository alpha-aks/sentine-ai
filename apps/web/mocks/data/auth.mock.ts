import { UserEntity } from '@/types/user';
import { UserRole } from '@sentinel-ai/types';

export interface MockAuthUser extends UserEntity {
  jwtToken: string;
  refreshToken: string;
  permissions: string[];
}

export const MOCK_DEV_USERS: Record<string, MockAuthUser> = {
  EXAM_ADMIN: {
    id: 'usr_super_admin',
    userId: 'usr_super_admin',
    email: 'admin@sentinelai.io',
    fullName: 'System Administrator',
    role: 'EXAM_ADMIN',
    status: 'ACTIVE',
    institutionId: 'inst_default',
    department: 'Computer Science',
    avatarUrl: 'https://assets.sentinelai.io/avatars/super_admin.png',
    permissions: [
      'system:manage',
      'users:manage',
      'roles:manage',
      'institutions:manage',
      'exams:manage',
      'questions:manage',
      'proctoring:monitor',
      'analytics:view'
    ],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-07-26T12:00:00Z',
    jwtToken: 'mock_jwt_super_admin_token_xyz123',
    refreshToken: 'mock_refresh_super_admin_token_abc456'
  },
  LIVE_PROCTOR: {
    id: 'usr_proctor',
    userId: 'usr_proctor',
    email: 'proctor@sentinelai.io',
    fullName: 'David Proctor',
    role: 'LIVE_PROCTOR',
    status: 'ACTIVE',
    institutionId: 'inst_default',
    department: 'Computer Science',
    avatarUrl: 'https://assets.sentinelai.io/avatars/proctor.png',
    permissions: ['proctoring:monitor', 'analytics:view'],
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-07-26T12:00:00Z',
    jwtToken: 'mock_jwt_proctor_token_xyz123',
    refreshToken: 'mock_refresh_proctor_token_abc456'
  },
  CANDIDATE: {
    id: 'usr_student',
    userId: 'usr_student',
    email: 'student@sentinelai.io',
    fullName: 'Tanishq Sharma',
    role: 'CANDIDATE',
    status: 'ACTIVE',
    institutionId: 'inst_default',
    department: 'Computer Science',
    avatarUrl: 'https://assets.sentinelai.io/avatars/student.png',
    permissions: ['candidate:exam:take'],
    createdAt: '2026-04-01T00:00:00Z',
    updatedAt: '2026-07-26T12:00:00Z',
    jwtToken: 'mock_jwt_student_token_xyz123',
    refreshToken: 'mock_refresh_student_token_abc456'
  }
};
