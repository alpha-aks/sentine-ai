import { create } from 'zustand';

interface InstitutionState {
  searchQuery: string;
  statusFilter: 'ALL' | 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
  selectedIds: string[];
  isCreateDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  activeInstitutionId: string | null;

  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: 'ALL' | 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED') => void;
  setSelectedIds: (ids: string[]) => void;
  toggleSelectId: (id: string) => void;
  selectAllIds: (ids: string[]) => void;
  clearSelection: () => void;
  setCreateDialogOpen: (open: boolean) => void;
  setDeleteDialogOpen: (open: boolean, id?: string | null) => void;
  resetFilters: () => void;
}

export const useInstitutionStore = create<InstitutionState>((set) => ({
  searchQuery: '',
  statusFilter: 'ALL',
  selectedIds: [],
  isCreateDialogOpen: false,
  isDeleteDialogOpen: false,
  activeInstitutionId: null,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setStatusFilter: (status) => set({ statusFilter: status }),
  setSelectedIds: (ids) => set({ selectedIds: ids }),
  toggleSelectId: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((item) => item !== id)
        : [...state.selectedIds, id]
    })),
  selectAllIds: (ids) => set({ selectedIds: ids }),
  clearSelection: () => set({ selectedIds: [] }),
  setCreateDialogOpen: (open) => set({ isCreateDialogOpen: open }),
  setDeleteDialogOpen: (open, id = null) => set({ isDeleteDialogOpen: open, activeInstitutionId: id }),
  resetFilters: () => set({ searchQuery: '', statusFilter: 'ALL', selectedIds: [] })
}));
