declare const describe: (name: string, fn: () => void) => void;
declare const test: (name: string, fn: () => void | Promise<void>) => void;
declare const expect: (actual: any) => any;

import { useQuestionStore } from '@/store/question-store';

describe('Question Component & State Test Suite', () => {
  test('Zustand question store initializes default filters', () => {
    const state = useQuestionStore.getState();
    expect(state.searchQuery).toBe('');
    expect(state.typeFilter).toBe('ALL');
    expect(state.difficultyFilter).toBe('ALL');
    expect(state.statusFilter).toBe('ALL');
    expect(state.selectedQuestionIds).toEqual([]);
  });

  test('toggleSelectQuestion toggles item ID in state', () => {
    useQuestionStore.getState().toggleSelectQuestion('q-101');
    expect(useQuestionStore.getState().selectedQuestionIds).toContain('q-101');

    useQuestionStore.getState().toggleSelectQuestion('q-101');
    expect(useQuestionStore.getState().selectedQuestionIds).not.toContain('q-101');
  });
});
