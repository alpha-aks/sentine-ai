import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  submissionService,
  SubmissionEntity,
  SaveAnswerDto,
  SaveDraftDto,
  BatchAutosaveDto,
  SubmitFinalDto
} from '@/services/submission.service';

export const submissionKeys = {
  all: ['submissions'] as const,
  detail: (id: string) => [...submissionKeys.all, id] as const,
  status: (id: string) => [...submissionKeys.all, id, 'status'] as const,
  recovery: (id: string) => [...submissionKeys.all, id, 'recovery'] as const,
  validation: (id: string) => [...submissionKeys.all, id, 'validation'] as const,
  review: (id: string) => [...submissionKeys.all, id, 'review'] as const,
};

export function useSubmissionQuery(submissionId: string | null) {
  return useQuery({
    queryKey: submissionId ? submissionKeys.detail(submissionId) : ['submissions', 'none'],
    queryFn: () => submissionService.getSubmission(submissionId!),
    enabled: Boolean(submissionId),
    staleTime: 5000,
    retry: 2
  });
}

export function useSubmissionStatusQuery(submissionId: string | null) {
  return useQuery({
    queryKey: submissionId ? submissionKeys.status(submissionId) : ['submissions', 'none', 'status'],
    queryFn: () => submissionService.getSubmissionStatus(submissionId!),
    enabled: Boolean(submissionId),
    refetchInterval: 10000
  });
}

export function useRecoveryStateQuery(submissionId: string | null) {
  return useQuery({
    queryKey: submissionId ? submissionKeys.recovery(submissionId) : ['submissions', 'none', 'recovery'],
    queryFn: () => submissionService.getRecoveryState(submissionId!),
    enabled: Boolean(submissionId),
    staleTime: 0
  });
}

export function useSubmissionValidationQuery(submissionId: string | null) {
  return useQuery({
    queryKey: submissionId ? submissionKeys.validation(submissionId) : ['submissions', 'none', 'validation'],
    queryFn: () => submissionService.validateSubmission(submissionId!),
    enabled: Boolean(submissionId)
  });
}

export function useSubmissionReviewQuery(submissionId: string | null) {
  return useQuery({
    queryKey: submissionId ? submissionKeys.review(submissionId) : ['submissions', 'none', 'review'],
    queryFn: () => submissionService.reviewSubmission(submissionId!),
    enabled: Boolean(submissionId)
  });
}

export function useStartSubmissionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submissionService.startSubmission,
    onSuccess: (data) => {
      queryClient.setQueryData(submissionKeys.detail(data.submissionId), data);
    }
  });
}

export function useSaveAnswerMutation(submissionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: SaveAnswerDto) => submissionService.saveAnswer(submissionId, dto),
    onSuccess: (savedAnswer) => {
      queryClient.setQueryData<SubmissionEntity>(submissionKeys.detail(submissionId), (old) => {
        if (!old) return old;
        return {
          ...old,
          answers: {
            ...old.answers,
            [savedAnswer.questionId]: savedAnswer
          }
        };
      });
      queryClient.invalidateQueries({ queryKey: submissionKeys.review(submissionId) });
    }
  });
}

export function useSaveDraftMutation(submissionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: SaveDraftDto) => submissionService.saveDraft(submissionId, dto),
    onSuccess: (savedDraft) => {
      queryClient.setQueryData<SubmissionEntity>(submissionKeys.detail(submissionId), (old) => {
        if (!old) return old;
        return {
          ...old,
          drafts: {
            ...old.drafts,
            [savedDraft.questionId]: savedDraft
          }
        };
      });
    }
  });
}

export function useBatchAutosaveMutation(submissionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: BatchAutosaveDto) => submissionService.batchAutosave(submissionId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: submissionKeys.detail(submissionId) });
    }
  });
}

export function useRestoreDraftMutation(submissionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questionId: string) => submissionService.restoreDraft(submissionId, questionId),
    onSuccess: (restoredAnswer) => {
      queryClient.setQueryData<SubmissionEntity>(submissionKeys.detail(submissionId), (old) => {
        if (!old) return old;
        const newDrafts = { ...old.drafts };
        delete newDrafts[restoredAnswer.questionId];
        return {
          ...old,
          answers: {
            ...old.answers,
            [restoredAnswer.questionId]: restoredAnswer
          },
          drafts: newDrafts
        };
      });
    }
  });
}

export function useSubmitFinalMutation(submissionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto?: SubmitFinalDto) => submissionService.submitFinal(submissionId, dto),
    onSuccess: (finalSubmission) => {
      queryClient.setQueryData(submissionKeys.detail(submissionId), finalSubmission);
      queryClient.invalidateQueries({ queryKey: submissionKeys.all });
    }
  });
}
