import { UserEntity } from '@/types/user';

export const MOCK_USERS: UserEntity[] = [
  {
    id: 'usr_super_admin',
    userId: 'usr_super_admin',
    email: 'admin@sentinelai.io',
    fullName: 'Prof. Arjun Mehta',
    role: 'EXAM_ADMIN',
    status: 'ACTIVE',
    institutionId: 'inst_default',
    department: 'Computer Science & Engineering',
    avatarUrl: 'https://assets.sentinelai.io/avatars/super_admin.png',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-07-26T12:00:00Z'
  },
  {
    id: 'usr_proctor',
    userId: 'usr_proctor',
    email: 'proctor@sentinelai.io',
    fullName: 'Dr. Rajesh Sharma',
    role: 'LIVE_PROCTOR',
    status: 'ACTIVE',
    institutionId: 'inst_default',
    department: 'Computer Science & Engineering',
    avatarUrl: 'https://assets.sentinelai.io/avatars/proctor.png',
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-07-26T12:00:00Z'
  },
  {
    id: 'usr_student',
    userId: 'usr_student',
    email: 'student@sentinelai.io',
    fullName: 'Rohan Singh',
    role: 'CANDIDATE',
    status: 'ACTIVE',
    institutionId: 'inst_default',
    department: 'Computer Science & Engineering',
    avatarUrl: 'https://assets.sentinelai.io/avatars/student.png',
    createdAt: '2026-04-01T00:00:00Z',
    updatedAt: '2026-07-26T12:00:00Z'
  }
];

export const MOCK_ROLES = [
  {
    id: 'role_exam_admin',
    roleId: 'role_exam_admin',
    name: 'EXAM_ADMIN',
    code: 'EXAM_ADMIN',
    description: 'Full examination platform administrator',
    isSystem: true,
    permissions: ['system:manage', 'users:manage', 'roles:manage', 'exams:manage', 'questions:manage'],
    userCount: 3,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-07-26T12:00:00Z'
  },
  {
    id: 'role_live_proctor',
    roleId: 'role_live_proctor',
    name: 'LIVE_PROCTOR',
    code: 'LIVE_PROCTOR',
    description: 'Live test proctor and monitor',
    isSystem: true,
    permissions: ['proctoring:monitor'],
    userCount: 5,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-07-26T12:00:00Z'
  }
];

export const MOCK_PERMISSIONS = [
  { id: 'perm_1', code: 'system:manage', name: 'System Manage', category: 'SYSTEM' as const, description: 'System settings' },
  { id: 'perm_2', code: 'users:manage', name: 'Users Manage', category: 'USERS' as const, description: 'User accounts' },
  { id: 'perm_3', code: 'exams:manage', name: 'Exams Manage', category: 'EXAMS' as const, description: 'Exam creation' },
  { id: 'perm_4', code: 'questions:manage', name: 'Questions Manage', category: 'QUESTIONS' as const, description: 'Question bank' }
];

export const MOCK_INVITATIONS = [
  {
    id: 'inv_101',
    invitationId: 'inv_101',
    email: 'new.proctor@sentineltech.edu',
    role: 'LIVE_PROCTOR' as const,
    institutionId: 'inst_default',
    invitedBy: 'usr_super_admin',
    status: 'PENDING' as const,
    expiresAt: '2026-08-15T00:00:00Z',
    createdAt: '2026-07-20T00:00:00Z'
  }
];
