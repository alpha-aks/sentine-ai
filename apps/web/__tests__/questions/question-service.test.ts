declare const describe: (name: string, fn: () => void) => void;
declare const test: (name: string, fn: () => void | Promise<void>) => void;
declare const expect: (actual: any) => any;

import { questionService } from '@/services/question.service';

describe('QuestionService Test Suite', () => {
  test('searchQuestions returns array of question items', async () => {
    const result = await questionService.searchQuestions();
    expect(result).toBeDefined();
    expect(Array.isArray(result.items)).toBe(true);
  });

  test('listCategories returns category array', async () => {
    const categories = await questionService.listCategories();
    expect(Array.isArray(categories)).toBe(true);
  });
});
