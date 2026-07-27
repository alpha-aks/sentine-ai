import { describe, it } from 'node:test';
import assert from 'node:assert';
import { mainNavigation } from '../../config/routes-config';

describe('Quick Search Logic Suite', () => {
  it('should filter items by query', () => {
    const query = 'Exams';
    const filtered = mainNavigation.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()));
    assert.strictEqual(filtered.length, 1);
    assert.strictEqual(filtered[0].title, 'Exams');
  });
});
