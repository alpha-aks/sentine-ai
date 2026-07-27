import { RoleEntity } from '@/types/user';
import { UserRole } from '@sentinel-ai/types';

const INITIAL_ROLES: RoleEntity[] = [
  {
    id: 'role_exam_admin',
    roleId: 'role_exam_admin',
    name: 'Platform Super Administrator',
    code: 'EXAM_ADMIN',
    description: 'Full administrative access across all institutions, security policies, and system settings.',
    isSystem: true,
    userCount: 4,
    permissions: [
      'user:create',
      'user:read',
      'user:update',
      'user:delete',
      'role:manage',
      'institution:manage',
      'exam:create',
      'exam:read',
      'exam:update',
      'exam:delete',
      'report:export',
      'system:config'
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'role_proctor_supervisor',
    roleId: 'role_proctor_supervisor',
    name: 'Proctoring Supervisor',
    code: 'PROCTOR_SUPERVISOR',
    description: 'Oversees active exam proctoring sessions, manages proctor assignments, and handles dispute escalations.',
    isSystem: true,
    userCount: 12,
    permissions: [
      'user:read',
      'exam:read',
      'session:monitor',
      'session:terminate',
      'report:read',
      'report:export'
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'role_live_proctor',
    roleId: 'role_live_proctor',
    name: 'Live Invigilator / Proctor',
    code: 'LIVE_PROCTOR',
    description: 'Monitors real-time candidate webcams, AI flag streams, and candidate chat interactions during live exams.',
    isSystem: true,
    userCount: 28,
    permissions: ['exam:read', 'session:monitor'],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'role_compliance_officer',
    roleId: 'role_compliance_officer',
    name: 'Audit & Compliance Officer',
    code: 'COMPLIANCE_OFFICER',
    description: 'Audits integrity reports, reviews integrity flags, and exports legal compliance documentation.',
    isSystem: true,
    userCount: 6,
    permissions: ['user:read', 'exam:read', 'report:read', 'report:export', 'system:audit'],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'role_candidate',
    roleId: 'role_candidate',
    name: 'Candidate (Student / Examinee)',
    code: 'CANDIDATE',
    description: 'Enrolled examinees taking proctored assessments and viewing past score submissions.',
    isSystem: true,
    userCount: 1420,
    permissions: ['exam:take', 'profile:read'],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  }
];

let roleStore: RoleEntity[] = [...INITIAL_ROLES];

class RoleService {
  async getRoles(): Promise<RoleEntity[]> {
    return [...roleStore];
  }

  async getRoleById(id: string): Promise<RoleEntity> {
    const role = roleStore.find((r) => r.id === id || r.roleId === id || r.code === id);
    if (!role) {
      throw new Error(`Role with ID ${id} not found`);
    }
    return role;
  }

  async createRole(input: { name: string; description: string; permissions: string[] }): Promise<RoleEntity> {
    const newId = `role_${Date.now()}`;
    const code = input.name.toUpperCase().replace(/[^A-Z0-9]/g, '_');
    const newRole: RoleEntity = {
      id: newId,
      roleId: newId,
      name: input.name,
      code,
      description: input.description,
      isSystem: false,
      permissions: input.permissions,
      userCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    roleStore.push(newRole);
    return newRole;
  }

  async updateRole(id: string, input: { name?: string; description?: string; permissions?: string[] }): Promise<RoleEntity> {
    const idx = roleStore.findIndex((r) => r.id === id || r.roleId === id);
    if (idx === -1) {
      throw new Error(`Role with ID ${id} not found`);
    }
    roleStore[idx] = {
      ...roleStore[idx],
      ...input,
      updatedAt: new Date().toISOString()
    };
    return roleStore[idx];
  }

  async deleteRole(id: string): Promise<void> {
    const role = roleStore.find((r) => r.id === id || r.roleId === id);
    if (role?.isSystem) {
      throw new Error('System roles cannot be deleted.');
    }
    roleStore = roleStore.filter((r) => r.id !== id && r.roleId !== id);
  }

  async cloneRole(id: string, newName: string): Promise<RoleEntity> {
    const source = await this.getRoleById(id);
    return this.createRole({
      name: newName,
      description: `Cloned from ${source.name}. ${source.description}`,
      permissions: [...source.permissions]
    });
  }
}

export const roleService = new RoleService();
