import { PermissionDefinition } from '@/types/user';

export const SYSTEM_PERMISSIONS: PermissionDefinition[] = [
  // User Management
  { id: 'user:create', code: 'user:create', name: 'Create Users', category: 'USERS', description: 'Provision new user accounts and credentials.' },
  { id: 'user:read', code: 'user:read', name: 'View Users', category: 'USERS', description: 'View user profiles, search, and activity logs.' },
  { id: 'user:update', code: 'user:update', name: 'Edit Users', category: 'USERS', description: 'Modify user profile data and accommodations.' },
  { id: 'user:delete', code: 'user:delete', name: 'Delete Users', category: 'USERS', description: 'Deactivate or delete user accounts.' },
  { id: 'role:manage', code: 'role:manage', name: 'Manage Roles', category: 'USERS', description: 'Assign roles and configure custom permissions.' },

  // Exams & Proctoring
  { id: 'exam:create', code: 'exam:create', name: 'Create Exams', category: 'EXAMS', description: 'Author new exams, schedules, and proctoring rules.' },
  { id: 'exam:read', code: 'exam:read', name: 'View Exams', category: 'EXAMS', description: 'Access exam catalog and candidate session status.' },
  { id: 'exam:update', code: 'exam:update', name: 'Edit Exams', category: 'EXAMS', description: 'Modify exam parameters, timers, and question sets.' },
  { id: 'exam:delete', code: 'exam:delete', name: 'Delete Exams', category: 'EXAMS', description: 'Archive or purge exam specifications.' },
  { id: 'exam:take', code: 'exam:take', name: 'Take Exams', category: 'EXAMS', description: 'Launch and complete proctored candidate sessions.' },
  { id: 'session:monitor', code: 'session:monitor', name: 'Live Proctoring', category: 'EXAMS', description: 'Monitor live webcam feeds and AI violation alerts.' },
  { id: 'session:terminate', code: 'session:terminate', name: 'Terminate Sessions', category: 'EXAMS', description: 'Force terminate candidate session due to violation.' },

  // Question Bank
  { id: 'question:create', code: 'question:create', name: 'Create Questions', category: 'QUESTIONS', description: 'Author MCQs, coding, and essay questions.' },
  { id: 'question:read', code: 'question:read', name: 'View Questions', category: 'QUESTIONS', description: 'Browse and search item bank content.' },
  { id: 'question:update', code: 'question:update', name: 'Edit Questions', category: 'QUESTIONS', description: 'Modify test items and scoring rubrics.' },

  // Institutions
  { id: 'institution:manage', code: 'institution:manage', name: 'Manage Institutions', category: 'INSTITUTIONS', description: 'Configure academic tenant branding, SSO, and departments.' },

  // Reports & Analytics
  { id: 'report:read', code: 'report:read', name: 'View Integrity Reports', category: 'REPORTS', description: 'Access candidate score reports and AI incident logs.' },
  { id: 'report:export', code: 'report:export', name: 'Export Reports', category: 'REPORTS', description: 'Export PDF/CSV reports for accreditation compliance.' },

  // System Administration
  { id: 'system:config', code: 'system:config', name: 'System Settings', category: 'SYSTEM', description: 'Configure global security policies and integration keys.' },
  { id: 'system:audit', code: 'system:audit', name: 'View Audit Trail', category: 'SYSTEM', description: 'Inspect immutable system event audit logs.' }
];

class PermissionService {
  async getPermissions(): Promise<PermissionDefinition[]> {
    return [...SYSTEM_PERMISSIONS];
  }

  async getPermissionsByCategory(): Promise<Record<string, PermissionDefinition[]>> {
    const grouped: Record<string, PermissionDefinition[]> = {};
    SYSTEM_PERMISSIONS.forEach((p) => {
      if (!grouped[p.category]) {
        grouped[p.category] = [];
      }
      grouped[p.category].push(p);
    });
    return grouped;
  }
}

export const permissionService = new PermissionService();
