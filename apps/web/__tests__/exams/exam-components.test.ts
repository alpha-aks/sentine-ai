declare const describe: (name: string, fn: () => void) => void;
declare const test: (name: string, fn: () => void | Promise<void>) => void;
declare const expect: (actual: any) => any;

import { useExamStore } from '@/store/exam-store';

describe('Exam Component & State Test Suite', () => {
  test('Zustand store initializes with default filters', () => {
    const state = useExamStore.getState();
    expect(state.searchQuery).toBe('');
    expect(state.typeFilter).toBe('ALL');
    expect(state.statusFilter).toBe('ALL');
    expect(state.selectedExamIds).toEqual([]);
  });

  test('toggleSelectExam adds and removes exam ID correctly', () => {
    useExamStore.getState().toggleSelectExam('exam-1');
    expect(useExamStore.getState().selectedExamIds).toContain('exam-1');

    useExamStore.getState().toggleSelectExam('exam-1');
    expect(useExamStore.getState().selectedExamIds).not.toContain('exam-1');
  });
});
