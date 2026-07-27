import { useSubmissionStore } from '@/store/submission-store';

describe('Submission UI Integration Hardening Tests', () => {
  beforeEach(() => {
    useSubmissionStore.getState().resetUIStore();
  });

  it('buffers drafts in offlineQueue when network is offline', () => {
    useSubmissionStore.getState().setIsOffline(true);
    expect(useSubmissionStore.getState().isOffline).toBe(true);

    const draft = { questionId: 'q1', answerType: 'SINGLE_CHOICE', answerData: 'Option A' };
    useSubmissionStore.getState().addToOfflineQueue(draft);

    expect(useSubmissionStore.getState().offlineQueue).toHaveLength(1);
    expect(useSubmissionStore.getState().offlineQueue[0].questionId).toBe('q1');

    useSubmissionStore.getState().clearOfflineQueue();
    expect(useSubmissionStore.getState().offlineQueue).toHaveLength(0);
  });

  it('increments sequence numbers monotonically per question', () => {
    const seq1 = useSubmissionStore.getState().getNextSequenceNumber('q1');
    const seq2 = useSubmissionStore.getState().getNextSequenceNumber('q1');
    const seq3 = useSubmissionStore.getState().getNextSequenceNumber('q1');

    expect(seq1).toBe(1);
    expect(seq2).toBe(2);
    expect(seq3).toBe(3);
  });

  it('tracks isSubmittingFinal state correctly during submitFinal', () => {
    useSubmissionStore.getState().setIsSubmittingFinal(true);
    expect(useSubmissionStore.getState().isSubmittingFinal).toBe(true);

    useSubmissionStore.getState().setIsSubmittingFinal(false);
    expect(useSubmissionStore.getState().isSubmittingFinal).toBe(false);
  });
});
