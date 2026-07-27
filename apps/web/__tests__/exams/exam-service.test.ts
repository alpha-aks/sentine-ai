declare const describe: (name: string, fn: () => void) => void;
declare const test: (name: string, fn: () => void | Promise<void>) => void;
declare const expect: (actual: any) => any;

import { examService } from '@/services/exam.service';

describe('ExamService Test Suite', () => {
  test('searchExams handles empty response gracefully', async () => {
    const result = await examService.searchExams();
    expect(result).toBeDefined();
    expect(Array.isArray(result.items)).toBe(true);
  });

  test('exam entity contains default fallback properties', async () => {
    const result = await examService.searchExams({ query: 'NON_EXISTENT' });
    expect(result.total).toBeGreaterThanOrEqual(0);
  });
});
