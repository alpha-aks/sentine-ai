import { create } from 'zustand';
import { UserRole } from '@sentinel-ai/types';

interface PermissionState {
  userRole: UserRole | null;
  institutionId: string | null;
  setRoleAndTenant: (role: UserRole | null, institutionId: string | null) => void;
  hasRole: (allowedRoles: UserRole[]) => boolean;
}

export const usePermissionStore = create<PermissionState>()((set, get) => ({
  userRole: null,
  institutionId: null,

  setRoleAndTenant: (userRole, institutionId) => set({ userRole, institutionId }),

  hasRole: (allowedRoles) => {
    const role = get().userRole;
    if (!role) return false;
    return allowedRoles.includes(role);
  }
}));
