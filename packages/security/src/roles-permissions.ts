import { UserRole } from '@sentinel-ai/types';

export type Permission =
  | 'exam:create'
  | 'exam:read'
  | 'exam:update'
  | 'exam:delete'
  | 'exam:publish'
  | 'session:start'
  | 'session:view'
  | 'session:pause'
  | 'session:resume'
  | 'session:terminate'
  | 'alert:review'
  | 'alert:dismiss'
  | 'alert:warn'
  | 'alert:escalate'
  | 'policy:manage'
  | 'policy:view'
  | 'audit:read'
  | 'audit:export'
  | 'user:read'
  | 'user:write'
  | 'user:delete';

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  CANDIDATE: 1,
  LIVE_PROCTOR: 2,
  PROCTOR_SUPERVISOR: 3,
  EXAM_ADMIN: 4,
  COMPLIANCE_OFFICER: 5
};

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  CANDIDATE: ['session:start', 'exam:read'],
  LIVE_PROCTOR: [
    'exam:read',
    'session:view',
    'session:pause',
    'session:resume',
    'alert:review',
    'alert:dismiss',
    'alert:warn',
    'policy:view'
  ],
  PROCTOR_SUPERVISOR: [
    'exam:read',
    'session:view',
    'session:pause',
    'session:resume',
    'session:terminate',
    'alert:review',
    'alert:dismiss',
    'alert:warn',
    'alert:escalate',
    'policy:view',
    'audit:read',
    'user:read'
  ],
  EXAM_ADMIN: [
    'exam:create',
    'exam:read',
    'exam:update',
    'exam:delete',
    'exam:publish',
    'session:view',
    'policy:manage',
    'policy:view',
    'audit:read',
    'user:read',
    'user:write'
  ],
  COMPLIANCE_OFFICER: [
    'exam:read',
    'session:view',
    'alert:review',
    'policy:manage',
    'policy:view',
    'audit:read',
    'audit:export',
    'user:read',
    'user:write',
    'user:delete'
  ]
};

export function getPermissionsForRole(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const allowed = getPermissionsForRole(role);
  return allowed.includes(permission);
}

export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  const allowed = getPermissionsForRole(role);
  return permissions.some(p => allowed.includes(p));
}

export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  const allowed = getPermissionsForRole(role);
  return permissions.every(p => allowed.includes(p));
}

export function isRoleAtLeast(role: UserRole, requiredRole: UserRole): boolean {
  const currentRank = ROLE_HIERARCHY[role] ?? 0;
  const requiredRank = ROLE_HIERARCHY[requiredRole] ?? 0;
  return currentRank >= requiredRank;
}

export function canManageRole(actorRole: UserRole, targetRole: UserRole): boolean {
  const actorRank = ROLE_HIERARCHY[actorRole] ?? 0;
  const targetRank = ROLE_HIERARCHY[targetRole] ?? 0;
  return actorRank > targetRank;
}

export function matchWildcardPermission(permission: string, pattern: string): boolean {
  if (pattern === '*' || pattern === '*:*') return true;
  if (pattern === permission) return true;

  const patternParts = pattern.split(':');
  const permParts = permission.split(':');

  if (patternParts.length !== permParts.length) return false;

  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i] !== '*' && patternParts[i] !== permParts[i]) {
      return false;
    }
  }

  return true;
}
