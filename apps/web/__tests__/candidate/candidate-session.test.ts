declare const describe: (name: string, fn: () => void) => void;
declare const test: (name: string, fn: () => void | Promise<void>) => void;
declare const expect: (actual: any) => any;

import { sessionService } from '@/services/session.service';

describe('Candidate Session Service Test Suite', () => {
  test('sessionService defines core candidate methods', () => {
    expect(typeof sessionService.joinExam).toBe('function');
    expect(typeof sessionService.getSession).toBe('function');
    expect(typeof sessionService.recordHeartbeat).toBe('function');
    expect(typeof sessionService.reportViolation).toBe('function');
    expect(typeof sessionService.submitSession).toBe('function');
  });
});
