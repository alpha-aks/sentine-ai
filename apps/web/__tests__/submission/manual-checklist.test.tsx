import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSubmissionStore } from '@/store/submission-store';
import { SingleChoiceAnswer } from '@/components/submission/question-types/SingleChoiceAnswer';
import { MultipleChoiceAnswer } from '@/components/submission/question-types/MultipleChoiceAnswer';
import { TrueFalseAnswer } from '@/components/submission/question-types/TrueFalseAnswer';
import { ShortAnswer } from '@/components/submission/question-types/ShortAnswer';
import { LongAnswer } from '@/components/submission/question-types/LongAnswer';
import { NumericalAnswer } from '@/components/submission/question-types/NumericalAnswer';
import { ProgrammingAnswer } from '@/components/submission/question-types/ProgrammingAnswer';
import { FileUploadAnswer } from '@/components/submission/question-types/FileUploadAnswer';
import { MatchingAnswer } from '@/components/submission/question-types/MatchingAnswer';
import { OrderingAnswer } from '@/components/submission/question-types/OrderingAnswer';
import { SubmissionStatusBadge } from '@/components/submission/SubmissionStatusBadge';
import { AnswerProgress } from '@/components/submission/AnswerProgress';
import { SubmissionReview } from '@/components/submission/SubmissionReview';
import { SubmissionLockScreen } from '@/components/submission/SubmissionLockScreen';

describe('Manual Testing Checklist & Edge Cases Verification', () => {
  beforeEach(() => {
    useSubmissionStore.getState().resetUIStore();
  });

  describe('1. Answering Questions (All 10 Types)', () => {
    it('1.1 Single Choice: updates choice on click', () => {
      const onChange = jest.fn();
      render(<SingleChoiceAnswer options={['A', 'B']} value="A" onChange={onChange} />);
      fireEvent.click(screen.getByDisplayValue('B'));
      expect(onChange).toHaveBeenCalledWith('B');
    });

    it('1.2 Multiple Choice: toggles option selections', () => {
      const onChange = jest.fn();
      render(<MultipleChoiceAnswer options={['A', 'B', 'C']} value={['A']} onChange={onChange} />);
      const optionB = screen.getByText('B');
      fireEvent.click(optionB);
      expect(onChange).toHaveBeenCalledWith(['A', 'B']);
    });

    it('1.3 True/False: selects boolean value', () => {
      const onChange = jest.fn();
      render(<TrueFalseAnswer value={true} onChange={onChange} />);
      fireEvent.click(screen.getByText('FALSE'));
      expect(onChange).toHaveBeenCalledWith(false);
    });

    it('1.4 Short Answer: accepts text input', () => {
      const onChange = jest.fn();
      render(<ShortAnswer value="Initial" onChange={onChange} />);
      fireEvent.change(screen.getByPlaceholderText('Type your short response...'), { target: { value: 'Updated' } });
      expect(onChange).toHaveBeenCalledWith('Updated');
    });

    it('1.5 Long Answer: tracks text and word count', () => {
      const onChange = jest.fn();
      render(<LongAnswer value="Hello world test" onChange={onChange} />);
      expect(screen.getByText('3 words | 16 characters')).toBeInTheDocument();
    });

    it('1.6 Numerical: parses float inputs', () => {
      const onChange = jest.fn();
      render(<NumericalAnswer value={42} onChange={onChange} />);
      fireEvent.change(screen.getByPlaceholderText('Enter numerical answer...'), { target: { value: '99.5' } });
      expect(onChange).toHaveBeenCalledWith(99.5);
    });

    it('1.7 Programming: supports language selection and code updates', () => {
      const onChange = jest.fn();
      render(<ProgrammingAnswer value={{ code: 'const x = 1;', language: 'typescript' }} onChange={onChange} />);
      const textarea = screen.getByPlaceholderText('// Write your code solution here...');
      fireEvent.change(textarea, { target: { value: 'const x = 2;\nconsole.log(x);' } });
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'const x = 2;\nconsole.log(x);', lineCount: 2 })
      );
    });

    it('1.8 File Upload: stages uploaded files', () => {
      const onChange = jest.fn();
      render(<FileUploadAnswer value={null} onChange={onChange} />);
      const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
      const input = document.getElementById('file-input-element') as HTMLInputElement;
      fireEvent.change(input, { target: { files: [file] } });
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ fileName: 'test.pdf' })
      );
    });

    it('1.9 Matching: selects pair mappings', () => {
      const onChange = jest.fn();
      render(
        <MatchingAnswer
          pairs={[{ left: 'HTTPS', rightOptions: ['443', '80'] }]}
          value={{}}
          onChange={onChange}
        />
      );
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: '443' } });
      expect(onChange).toHaveBeenCalledWith({ HTTPS: '443' });
    });

    it('1.10 Ordering: reorders item sequence', () => {
      const onChange = jest.fn();
      render(<OrderingAnswer items={['Step 1', 'Step 2']} value={['Step 1', 'Step 2']} onChange={onChange} />);
      const buttons = screen.getAllByRole('button');
      // Click down arrow on first item
      fireEvent.click(buttons[1]);
      expect(onChange).toHaveBeenCalledWith(['Step 2', 'Step 1']);
    });
  });

  describe('2. Autosave Engine & Status Feedback', () => {
    it('2.1 Updates Zustand saveStatus correctly', () => {
      useSubmissionStore.getState().setSaveStatus('saving');
      expect(useSubmissionStore.getState().saveStatus).toBe('saving');

      const ts = '2026-07-27T10:15:00Z';
      useSubmissionStore.getState().setSaveStatus('saved', ts);
      expect(useSubmissionStore.getState().saveStatus).toBe('saved');
      expect(useSubmissionStore.getState().lastSavedAt).toBe(ts);
    });

    it('2.2 Handles offline network status transitions', () => {
      useSubmissionStore.getState().setIsOffline(true);
      expect(useSubmissionStore.getState().isOffline).toBe(true);
      expect(useSubmissionStore.getState().saveStatus).toBe('offline');

      useSubmissionStore.getState().setIsOffline(false);
      expect(useSubmissionStore.getState().isOffline).toBe(false);
    });
  });

  describe('3. Review & Summary Matrix', () => {
    it('3.1 Accurately calculates progress in AnswerProgress bar', () => {
      render(<AnswerProgress answeredCount={7} totalQuestions={10} reviewCount={3} />);
      expect(screen.getByText('70%')).toBeInTheDocument();
      expect(screen.getByText('7 of 10 Answered (3 Marked for Review)')).toBeInTheDocument();
    });

    it('3.2 Renders SubmissionReview matrix with answered and review badges', () => {
      render(
        <SubmissionReview
          examTitle="CS101 Final Exam"
          questions={[
            { questionId: 'q1', questionNumber: 1, type: 'SINGLE_CHOICE', title: 'Q1', isAnswered: true, hasDraft: false },
            { questionId: 'q2', questionNumber: 2, type: 'SHORT_ANSWER', title: 'Q2', isAnswered: false, hasDraft: true }
          ]}
          onSelectQuestion={jest.fn()}
          onConfirmSubmit={jest.fn()}
          onBackToExam={jest.fn()}
        />
      );

      expect(screen.getByText('CS101 Final Exam')).toBeInTheDocument();
      expect(screen.getByText('ANSWERED')).toBeInTheDocument();
      expect(screen.getByText('DRAFT')).toBeInTheDocument();
    });
  });

  describe('4. Final Submission & Lock Screen Edge Cases', () => {
    it('4.1 Displays SubmissionStatusBadge correctly for locked state', () => {
      render(<SubmissionStatusBadge status="LOCKED" isLocked={true} />);
      expect(screen.getByText('SUBMISSION LOCKED')).toBeInTheDocument();
    });

    it('4.2 Renders read-only SubmissionLockScreen when submission is finalized', () => {
      render(
        <SubmissionLockScreen
          receiptId="SENTINEL-REC-892401"
          submittedAt="2026-07-27T10:00:00Z"
          status="SUBMITTED"
        />
      );

      expect(screen.getByText('Examination Workspace Sealed & Locked')).toBeInTheDocument();
      expect(screen.getByText('SENTINEL-REC-892401')).toBeInTheDocument();
    });
  });
});
