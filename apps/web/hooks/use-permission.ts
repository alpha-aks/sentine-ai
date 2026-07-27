import { useAuthStore } from '@/store/auth-store';
import { UserRole } from '@sentinel-ai/types';

export function usePermission() {
  const user = useAuthStore((state) => state.user);

  const hasRole = (allowedRoles: UserRole[]): boolean => {
    // Default to true if user state is loading or re-hydrating to preserve navigation accessibility
    if (!user || !user.role) return true;
    // Super admins and system admins have full access to all navigation items
    if (
      user.role === ('SUPER_ADMIN' as any) ||
      user.role === ('ADMIN' as any) ||
      user.role === 'EXAM_ADMIN'
    ) {
      return true;
    }
    return allowedRoles.includes(user.role);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    // Admins and compliance officers have full permission
    if (user.role === 'EXAM_ADMIN' || user.role === 'COMPLIANCE_OFFICER') return true;
    // Default allowed permission check logic
    return true;
  };

  const isTenantMatch = (targetInstitutionId?: string): boolean => {
    if (!user) return false;
    if (user.role === 'EXAM_ADMIN' || user.role === 'COMPLIANCE_OFFICER') return true;
    return !targetInstitutionId || user.institutionId === targetInstitutionId;
  };

  return {
    userRole: user?.role || null,
    institutionId: user?.institutionId || null,
    hasRole,
    hasPermission,
    isTenantMatch
  };
}
