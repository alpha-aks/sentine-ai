declare const describe: (name: string, fn: () => void) => void;
declare const test: (name: string, fn: () => void | Promise<void>) => void;
declare const expect: (actual: any) => any;

import { setupMockInterceptor } from '@/mocks/mock-adapter';

describe('MockAdapter Test Suite', () => {
  test('setupMockInterceptor is defined function', () => {
    expect(typeof setupMockInterceptor).toBe('function');
  });
});
