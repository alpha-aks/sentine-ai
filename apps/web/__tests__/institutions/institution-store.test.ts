import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { useInstitutionStore } from '../../store/institution-store';

describe('useInstitutionStore UI State Management', () => {
  beforeEach(() => {
    useInstitutionStore.getState().resetFilters();
  });

  it('should update search query state', () => {
    useInstitutionStore.getState().setSearchQuery('Stanford');
    assert.strictEqual(useInstitutionStore.getState().searchQuery, 'Stanford');
  });

  it('should toggle selection IDs correctly', () => {
    useInstitutionStore.getState().toggleSelectId('inst_1');
    assert.deepStrictEqual(useInstitutionStore.getState().selectedIds, ['inst_1']);

    useInstitutionStore.getState().toggleSelectId('inst_1');
    assert.deepStrictEqual(useInstitutionStore.getState().selectedIds, []);
  });
});
