import React, { createContext, useContext, useEffect } from 'react';
import {
  useSubmissionQuery,
  useSaveAnswerMutation,
  useSaveDraftMutation,
  useBatchAutosaveMutation,
  useSubmitFinalMutation,
  useRestoreDraftMutation
} from '@/hooks/use-submission-query';
import { useSubmissionStore } from '@/store/submission-store';
import { SubmissionEntity } from '@/services/submission.service';

interface SubmissionContextType {
  submissionId: string;
  submission: SubmissionEntity | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  saveAnswer: (questionId: string, answerType: string, answerData: any) => Promise<any>;
  saveDraft: (questionId: string, answerType: string, answerData: any) => Promise<any>;
  submitFinal: (notes?: string, autoReason?: 'TIMER_EXPIRED' | 'PROCTOR_TERMINATED' | 'POLICY_VIOLATION') => Promise<any>;
  restoreDraft: (questionId: string) => Promise<any>;
  flushOfflineQueue: () => Promise<void>;
}

const SubmissionContext = createContext<SubmissionContextType | undefined>(undefined);

interface SubmissionProviderProps {
  submissionId: string;
  children: React.ReactNode;
}

export function SubmissionProvider({ submissionId, children }: SubmissionProviderProps) {
  const { data: submission, isLoading, isError, error, refetch } = useSubmissionQuery(submissionId);
  const saveAnswerMutation = useSaveAnswerMutation(submissionId);
  const saveDraftMutation = useSaveDraftMutation(submissionId);
  const batchAutosaveMutation = useBatchAutosaveMutation(submissionId);
  const submitFinalMutation = useSubmitFinalMutation(submissionId);
  const restoreDraftMutation = useRestoreDraftMutation(submissionId);

  const setSaveStatus = useSubmissionStore((s) => s.setSaveStatus);
  const setIsOffline = useSubmissionStore((s) => s.setIsOffline);
  const isOffline = useSubmissionStore((s) => s.isOffline);
  const offlineQueue = useSubmissionStore((s) => s.offlineQueue);
  const addToOfflineQueue = useSubmissionStore((s) => s.addToOfflineQueue);
  const clearOfflineQueue = useSubmissionStore((s) => s.clearOfflineQueue);
  const getNextSequenceNumber = useSubmissionStore((s) => s.getNextSequenceNumber);
  const setDraftRecoveryDialogOpen = useSubmissionStore((s) => s.setDraftRecoveryDialogOpen);
  const setIsSubmittingFinal = useSubmissionStore((s) => s.setIsSubmittingFinal);

  // Reconnect synchronization & offline queue flush
  const handleFlushOfflineQueue = async () => {
    if (offlineQueue.length === 0) return;
    setSaveStatus('saving');
    try {
      await batchAutosaveMutation.mutateAsync({ drafts: offlineQueue });
      clearOfflineQueue();
      setSaveStatus('saved', new Date().toISOString());
    } catch {
      setSaveStatus('error');
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      handleFlushOfflineQueue();
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [offlineQueue, setIsOffline]);

  // Multi-tab lock synchronization via Storage API
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `sentinel_submission_locked_${submissionId}`) {
        refetch();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [submissionId, refetch]);

  // Prompt draft recovery if uncommitted drafts exist
  useEffect(() => {
    if (submission && submission.drafts && Object.keys(submission.drafts).length > 0) {
      setDraftRecoveryDialogOpen(true);
    }
  }, [submission, setDraftRecoveryDialogOpen]);

  const handleSaveAnswer = async (questionId: string, answerType: string, answerData: any) => {
    if (submission?.isLocked) {
      throw new Error('SUBMISSION_LOCKED: Cannot modify finalized submission.');
    }

    setSaveStatus('saving');
    try {
      const res = await saveAnswerMutation.mutateAsync({
        questionId,
        answerType,
        answerData
      });
      setSaveStatus('saved', new Date().toISOString());
      return res;
    } catch (err) {
      setSaveStatus('error');
      throw err;
    }
  };

  const handleSaveDraft = async (questionId: string, answerType: string, answerData: any) => {
    if (submission?.isLocked) return;

    const sequenceNumber = getNextSequenceNumber(questionId);
    const draftPayload = { questionId, answerType, answerData, sequenceNumber };

    if (isOffline) {
      addToOfflineQueue(draftPayload);
      setSaveStatus('offline');
      return;
    }

    setSaveStatus('saving');
    try {
      const res = await saveDraftMutation.mutateAsync(draftPayload);
      setSaveStatus('saved', new Date().toISOString());
      return res;
    } catch (err) {
      addToOfflineQueue(draftPayload);
      setSaveStatus('error');
      throw err;
    }
  };

  const handleSubmitFinal = async (
    notes?: string,
    autoReason?: 'TIMER_EXPIRED' | 'PROCTOR_TERMINATED' | 'POLICY_VIOLATION'
  ) => {
    setIsSubmittingFinal(true);
    try {
      const res = await submitFinalMutation.mutateAsync({
        submissionNotes: notes,
        autoSubmittedReason: autoReason
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem(`sentinel_submission_locked_${submissionId}`, 'true');
      }

      setIsSubmittingFinal(false);
      return res;
    } catch (err) {
      setIsSubmittingFinal(false);
      throw err;
    }
  };

  const handleRestoreDraft = async (questionId: string) => {
    return restoreDraftMutation.mutateAsync(questionId);
  };

  return (
    <SubmissionContext.Provider
      value={{
        submissionId,
        submission,
        isLoading,
        isError,
        error: error as Error | null,
        saveAnswer: handleSaveAnswer,
        saveDraft: handleSaveDraft,
        submitFinal: handleSubmitFinal,
        restoreDraft: handleRestoreDraft,
        flushOfflineQueue: handleFlushOfflineQueue
      }}
    >
      {children}
    </SubmissionContext.Provider>
  );
}

export function useSubmission() {
  const context = useContext(SubmissionContext);
  if (!context) {
    throw new Error('useSubmission must be used within a SubmissionProvider');
  }
  return context;
}
