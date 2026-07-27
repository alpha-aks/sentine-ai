import { useSubmissionStore } from '@/store/submission-store';

describe('Submission UI Zustand Store', () => {
  beforeEach(() => {
    useSubmissionStore.getState().resetUIStore();
  });

  it('updates save status and timestamp', () => {
    useSubmissionStore.getState().setSaveStatus('saving');
    expect(useSubmissionStore.getState().saveStatus).toBe('saving');

    const ts = '2026-07-27T10:00:00Z';
    useSubmissionStore.getState().setSaveStatus('saved', ts);
    expect(useSubmissionStore.getState().saveStatus).toBe('saved');
    expect(useSubmissionStore.getState().lastSavedAt).toBe(ts);
  });

  it('toggles question review mark state', () => {
    useSubmissionStore.getState().toggleMarkForReview('q1');
    expect(useSubmissionStore.getState().markedForReview['q1']).toBe(true);

    useSubmissionStore.getState().toggleMarkForReview('q1');
    expect(useSubmissionStore.getState().markedForReview['q1']).toBe(false);
  });

  it('handles offline status update', () => {
    useSubmissionStore.getState().setIsOffline(true);
    expect(useSubmissionStore.getState().isOffline).toBe(true);
    expect(useSubmissionStore.getState().saveStatus).toBe('offline');
  });
});
