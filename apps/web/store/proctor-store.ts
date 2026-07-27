import { create } from 'zustand';

export type CandidateStatusFilter = 'ALL' | 'IN_PROGRESS' | 'SUSPICIOUS' | 'PAUSED' | 'DISCONNECTED' | 'SUBMITTED';
export type RiskLevelFilter = 'ALL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type DrawerTab = 'PROFILE' | 'TIMELINE' | 'EVIDENCE' | 'ACTIONS';

interface ProctorState {
  selectedExamId: string | null;
  selectedCandidateId: string | null;
  searchQuery: string;
  statusFilter: CandidateStatusFilter;
  riskFilter: RiskLevelFilter;
  alertStatusFilter: string;
  drawerTab: DrawerTab;

  setSelectedExamId: (examId: string | null) => void;
  setSelectedCandidateId: (sessionId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (filter: CandidateStatusFilter) => void;
  setRiskFilter: (filter: RiskLevelFilter) => void;
  setAlertStatusFilter: (status: string) => void;
  setDrawerTab: (tab: DrawerTab) => void;
  resetFilters: () => void;
}

export const useProctorStore = create<ProctorState>((set) => ({
  selectedExamId: null,
  selectedCandidateId: null,
  searchQuery: '',
  statusFilter: 'ALL',
  riskFilter: 'ALL',
  alertStatusFilter: 'ALL',
  drawerTab: 'PROFILE',

  setSelectedExamId: (examId) => set({ selectedExamId: examId }),
  setSelectedCandidateId: (sessionId) => set({ selectedCandidateId: sessionId }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setStatusFilter: (filter) => set({ statusFilter: filter }),
  setRiskFilter: (filter) => set({ riskFilter: filter }),
  setAlertStatusFilter: (status) => set({ alertStatusFilter: status }),
  setDrawerTab: (tab) => set({ drawerTab: tab }),

  resetFilters: () =>
    set({
      selectedExamId: null,
      selectedCandidateId: null,
      searchQuery: '',
      statusFilter: 'ALL',
      riskFilter: 'ALL',
      alertStatusFilter: 'ALL',
      drawerTab: 'PROFILE'
    })
}));
