declare const describe: (name: string, fn: () => void) => void;
declare const test: (name: string, fn: () => void | Promise<void>) => void;
declare const expect: (actual: any) => any;

import { mockDb } from '@/mocks/mock-database';

describe('MockDatabase Test Suite', () => {
  test('mockDb initializes rich dev datasets', () => {
    expect(mockDb.users.length).toBeGreaterThan(0);
    expect(mockDb.institutions.length).toBeGreaterThan(0);
    expect(mockDb.exams.length).toBeGreaterThan(0);
    expect(mockDb.questions.length).toBeGreaterThan(0);
  });

  test('switchRole changes active dev identity', () => {
    mockDb.switchRole('CANDIDATE');
    expect(mockDb.getCurrentUser().role).toBe('STUDENT');

    mockDb.switchRole('SUPER_ADMIN');
    expect(mockDb.getCurrentUser().role).toBe('SUPER_ADMIN');
  });
});
