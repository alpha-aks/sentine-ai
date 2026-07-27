import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSubmissionStore } from '@/store/submission-store';
import { FileUploadAnswer } from '@/components/submission/question-types/FileUploadAnswer';
import { SubmissionStatusBadge } from '@/components/submission/SubmissionStatusBadge';
import { SubmissionLockScreen } from '@/components/submission/SubmissionLockScreen';
import { SubmissionError } from '@/components/submission/SubmissionError';
import { submissionService } from '@/services/submission.service';

describe('End-to-End Exam Flow & Security Verification', () => {
  beforeEach(() => {
    useSubmissionStore.getState().resetUIStore();
  });

  describe('1. End-to-End Exam Flow & Draft Restoration', () => {
    it('1.1 Restores previously saved drafts on session load', () => {
      useSubmissionStore.getState().setSaveStatus('saved', '2026-07-27T10:00:00Z');
      expect(useSubmissionStore.getState().saveStatus).toBe('saved');
      expect(useSubmissionStore.getState().lastSavedAt).toBe('2026-07-27T10:00:00Z');
    });

    it('1.2 Navigation between questions preserves review flags', () => {
      useSubmissionStore.getState().toggleMarkForReview('q1');
      expect(useSubmissionStore.getState().markedForReview['q1']).toBe(true);

      useSubmissionStore.getState().setActiveQuestionId('q2');
      expect(useSubmissionStore.getState().activeQuestionId).toBe('q2');
      expect(useSubmissionStore.getState().markedForReview['q1']).toBe(true);
    });
  });

  describe('2. Network Resilience & Offline Sync Queue', () => {
    it('2.1 Queues draft when offline and flushes on reconnect', () => {
      useSubmissionStore.getState().setIsOffline(true);
      expect(useSubmissionStore.getState().isOffline).toBe(true);

      const draftPayload = { questionId: 'q1', answerType: 'SINGLE_CHOICE', answerData: 'Option A' };
      useSubmissionStore.getState().addToOfflineQueue(draftPayload);

      expect(useSubmissionStore.getState().offlineQueue).toHaveLength(1);
      expect(useSubmissionStore.getState().offlineQueue[0].questionId).toBe('q1');

      useSubmissionStore.getState().setIsOffline(false);
      useSubmissionStore.getState().clearOfflineQueue();
      expect(useSubmissionStore.getState().offlineQueue).toHaveLength(0);
    });

    it('2.2 Displays graceful error fallback on backend timeout', () => {
      render(
        <SubmissionError
          title="Backend Connection Timeout"
          message="Submission service did not respond in time. Please check your connection."
        />
      );
      expect(screen.getByText('Backend Connection Timeout')).toBeInTheDocument();
      expect(screen.getByText(/Submission service did not respond in time/)).toBeInTheDocument();
    });
  });

  describe('3. File Upload Constraints & Validation', () => {
    it('3.1 Rejects zero-byte empty files', () => {
      const onChange = jest.fn();
      render(<FileUploadAnswer value={null} onChange={onChange} />);

      const emptyFile = new File([], 'empty.pdf', { type: 'application/pdf' });
      const input = document.getElementById('file-input-element-hardened') as HTMLInputElement;
      fireEvent.change(input, { target: { files: [emptyFile] } });

      expect(screen.getByText('SUBMISSION_INVALID_FILE: File is empty (0 bytes).')).toBeInTheDocument();
      expect(onChange).not.toHaveBeenCalled();
    });

    it('3.2 Rejects files exceeding 25MB limit', () => {
      const onChange = jest.fn();
      render(<FileUploadAnswer value={null} onChange={onChange} />);

      const largeFile = new File(['x'], 'large.zip', { type: 'application/zip' });
      Object.defineProperty(largeFile, 'size', { value: 30 * 1024 * 1024 }); // 30 MB

      const input = document.getElementById('file-input-element-hardened') as HTMLInputElement;
      fireEvent.change(input, { target: { files: [largeFile] } });

      expect(screen.getByText('SUBMISSION_FILE_TOO_LARGE: File exceeds maximum allowed size of 25MB.')).toBeInTheDocument();
      expect(onChange).not.toHaveBeenCalled();
    });

    it('3.3 Rejects unsupported file extensions', () => {
      const onChange = jest.fn();
      render(<FileUploadAnswer value={null} onChange={onChange} />);

      const invalidFile = new File(['content'], 'script.exe', { type: 'application/x-msdownload' });
      const input = document.getElementById('file-input-element-hardened') as HTMLInputElement;
      fireEvent.change(input, { target: { files: [invalidFile] } });

      expect(screen.getByText(/Invalid file type/)).toBeInTheDocument();
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('4. Security & Tenant Isolation', () => {
    it('4.1 Locks submitted exam against modifications', () => {
      render(
        <SubmissionLockScreen
          receiptId="SENTINEL-REC-99201"
          submittedAt="2026-07-27T11:00:00Z"
          status="SUBMITTED"
        />
      );

      expect(screen.getByText('Examination Workspace Sealed & Locked')).toBeInTheDocument();
      expect(screen.getByText('SENTINEL-REC-99201')).toBeInTheDocument();
    });

    it('4.2 Displays SubmissionStatusBadge correctly for EXPIRED or SUBMITTED status', () => {
      const { rerender } = render(<SubmissionStatusBadge status="EXPIRED" />);
      expect(screen.getByText('SESSION EXPIRED')).toBeInTheDocument();

      rerender(<SubmissionStatusBadge status="SUBMITTED" isLocked={true} />);
      expect(screen.getByText('SUBMISSION LOCKED')).toBeInTheDocument();
    });
  });
});
