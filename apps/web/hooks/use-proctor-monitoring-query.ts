import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  proctorMonitoringService,
  CandidateStatus,
  AlertStatus,
  ManualActionType,
  CandidateMonitorEntity
} from '@/services/proctor-monitoring.service';

export const proctorMonitoringKeys = {
  all: ['proctor-monitoring'] as const,
  exams: () => [...proctorMonitoringKeys.all, 'exams'] as const,
  examDetail: (id: string) => [...proctorMonitoringKeys.all, 'exams', id] as const,
  candidates: (examId?: string, status?: string) => [...proctorMonitoringKeys.all, 'candidates', examId || 'all', status || 'all'] as const,
  candidateDetail: (id: string) => [...proctorMonitoringKeys.all, 'candidates', id] as const,
  risk: (id: string) => [...proctorMonitoringKeys.all, 'candidates', id, 'risk'] as const,
  timeline: (id: string) => [...proctorMonitoringKeys.all, 'candidates', id, 'timeline'] as const,
  evidence: (id: string) => [...proctorMonitoringKeys.all, 'candidates', id, 'evidence'] as const,
  alerts: (examId?: string, status?: string) => [...proctorMonitoringKeys.all, 'alerts', examId || 'all', status || 'all'] as const,
  stats: () => [...proctorMonitoringKeys.all, 'stats'] as const,
};

export function useActiveExamsQuery() {
  return useQuery({
    queryKey: proctorMonitoringKeys.exams(),
    queryFn: proctorMonitoringService.getActiveExams,
    staleTime: 5000,
    refetchInterval: 10000
  });
}

export function useExamDetailsQuery(examId: string | null) {
  return useQuery({
    queryKey: examId ? proctorMonitoringKeys.examDetail(examId) : ['proctor-monitoring', 'none'],
    queryFn: () => proctorMonitoringService.getExamDetails(examId!),
    enabled: Boolean(examId)
  });
}

export function useCandidatesQuery(examId?: string, statusFilter?: string) {
  return useQuery({
    queryKey: proctorMonitoringKeys.candidates(examId, statusFilter),
    queryFn: () => proctorMonitoringService.getCandidates(examId, statusFilter),
    staleTime: 3000,
    refetchInterval: 5000
  });
}

export function useCandidateDetailsQuery(sessionId: string | null) {
  return useQuery({
    queryKey: sessionId ? proctorMonitoringKeys.candidateDetail(sessionId) : ['proctor-monitoring', 'none'],
    queryFn: () => proctorMonitoringService.getCandidateDetails(sessionId!),
    enabled: Boolean(sessionId)
  });
}

export function useRiskSnapshotQuery(sessionId: string | null) {
  return useQuery({
    queryKey: sessionId ? proctorMonitoringKeys.risk(sessionId) : ['proctor-monitoring', 'none', 'risk'],
    queryFn: () => proctorMonitoringService.getRiskSnapshot(sessionId!),
    enabled: Boolean(sessionId),
    refetchInterval: 5000
  });
}

export function useTimelineQuery(sessionId: string | null) {
  return useQuery({
    queryKey: sessionId ? proctorMonitoringKeys.timeline(sessionId) : ['proctor-monitoring', 'none', 'timeline'],
    queryFn: () => proctorMonitoringService.getTimeline(sessionId!),
    enabled: Boolean(sessionId)
  });
}

export function useEvidenceQuery(sessionId: string | null) {
  return useQuery({
    queryKey: sessionId ? proctorMonitoringKeys.evidence(sessionId) : ['proctor-monitoring', 'none', 'evidence'],
    queryFn: () => proctorMonitoringService.getEvidenceList(sessionId!),
    enabled: Boolean(sessionId)
  });
}

export function useAlertsQuery(examId?: string, statusFilter?: string) {
  return useQuery({
    queryKey: proctorMonitoringKeys.alerts(examId, statusFilter),
    queryFn: () => proctorMonitoringService.getAlerts(examId, statusFilter),
    staleTime: 3000,
    refetchInterval: 5000
  });
}

export function useProctorStatsQuery() {
  return useQuery({
    queryKey: proctorMonitoringKeys.stats(),
    queryFn: proctorMonitoringService.getStats,
    staleTime: 5000,
    refetchInterval: 10000
  });
}

export function useUpdateAlertStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { alertId: string; status: AlertStatus; notes?: string }) =>
      proctorMonitoringService.updateAlertStatus(args.alertId, args.status, args.notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: proctorMonitoringKeys.all });
    }
  });
}

export function useManualActionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { sessionId: string; actionType: ManualActionType; notes?: string; examId?: string; institutionId?: string }) =>
      proctorMonitoringService.executeManualAction(args.sessionId, args.actionType, args.notes, args.examId, args.institutionId),

    onMutate: async (newAction) => {
      // Cancel outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: proctorMonitoringKeys.candidateDetail(newAction.sessionId) });

      // Snapshot current state for rollback
      const previousCandidate = queryClient.getQueryData<CandidateMonitorEntity>(proctorMonitoringKeys.candidateDetail(newAction.sessionId));

      // Optimistically update candidate details
      if (previousCandidate) {
        let nextStatus: CandidateStatus = previousCandidate.status;
        let nextFlagged = previousCandidate.isFlagged;

        if (newAction.actionType === 'PAUSE_SESSION') nextStatus = 'PAUSED';
        if (newAction.actionType === 'RESUME_SESSION') nextStatus = 'IN_PROGRESS';
        if (newAction.actionType === 'TERMINATE_SESSION') nextStatus = 'TERMINATED';
        if (newAction.actionType === 'FLAG_SUBMISSION') nextFlagged = true;

        queryClient.setQueryData(proctorMonitoringKeys.candidateDetail(newAction.sessionId), {
          ...previousCandidate,
          status: nextStatus,
          isFlagged: nextFlagged,
          manualActionCount: previousCandidate.manualActionCount + 1
        });
      }

      return { previousCandidate };
    },

    onError: (err, newAction, context) => {
      // Rollback optimistic state if backend rejected request
      if (context?.previousCandidate) {
        queryClient.setQueryData(proctorMonitoringKeys.candidateDetail(newAction.sessionId), context.previousCandidate);
      }
    },

    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: proctorMonitoringKeys.candidateDetail(variables.sessionId) });
      queryClient.invalidateQueries({ queryKey: proctorMonitoringKeys.timeline(variables.sessionId) });
      queryClient.invalidateQueries({ queryKey: proctorMonitoringKeys.candidates() });
    }
  });
}
