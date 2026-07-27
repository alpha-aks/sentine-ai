import { create } from 'zustand';
import { UserRole } from '@sentinel-ai/types';
import { UserAccountStatus } from '@/types/user';

interface UserStoreState {
  // Search & Filter State
  searchQuery: string;
  roleFilter: UserRole | 'ALL';
  statusFilter: UserAccountStatus | 'ALL';
  institutionFilter: string | 'ALL';
  page: number;
  limit: number;

  // Selection State
  selectedUserIds: string[];

  // Modal / Drawer States
  isInviteDialogOpen: boolean;
  isRoleEditorOpen: boolean;
  activeUserIdForRole: string | null;

  // Actions
  setSearchQuery: (query: string) => void;
  setRoleFilter: (role: UserRole | 'ALL') => void;
  setStatusFilter: (status: UserAccountStatus | 'ALL') => void;
  setInstitutionFilter: (institutionId: string | 'ALL') => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  resetFilters: () => void;

  toggleSelectUser: (userId: string) => void;
  selectAllUsers: (userIds: string[]) => void;
  clearSelection: () => void;

  setInviteDialogOpen: (open: boolean) => void;
  setRoleEditorOpen: (open: boolean, userId?: string) => void;
}

export const useUserStore = create<UserStoreState>((set) => ({
  searchQuery: '',
  roleFilter: 'ALL',
  statusFilter: 'ALL',
  institutionFilter: 'ALL',
  page: 1,
  limit: 20,

  selectedUserIds: [],

  isInviteDialogOpen: false,
  isRoleEditorOpen: false,
  activeUserIdForRole: null,

  setSearchQuery: (query) => set({ searchQuery: query, page: 1 }),
  setRoleFilter: (role) => set({ roleFilter: role, page: 1 }),
  setStatusFilter: (status) => set({ statusFilter: status, page: 1 }),
  setInstitutionFilter: (instId) => set({ institutionFilter: instId, page: 1 }),
  setPage: (page) => set({ page }),
  setLimit: (limit) => set({ limit, page: 1 }),
  resetFilters: () =>
    set({
      searchQuery: '',
      roleFilter: 'ALL',
      statusFilter: 'ALL',
      institutionFilter: 'ALL',
      page: 1
    }),

  toggleSelectUser: (userId) =>
    set((state) => ({
      selectedUserIds: state.selectedUserIds.includes(userId)
        ? state.selectedUserIds.filter((id) => id !== userId)
        : [...state.selectedUserIds, userId]
    })),

  selectAllUsers: (userIds) => set({ selectedUserIds: userIds }),
  clearSelection: () => set({ selectedUserIds: [] }),

  setInviteDialogOpen: (open) => set({ isInviteDialogOpen: open }),
  setRoleEditorOpen: (open, userId = undefined) =>
    set({ isRoleEditorOpen: open, activeUserIdForRole: userId || null })
}));
