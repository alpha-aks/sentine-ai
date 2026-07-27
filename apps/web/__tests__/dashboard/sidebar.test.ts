import { describe, it } from 'node:test';
import assert from 'node:assert';
import { mainNavigation } from '../../config/routes-config';

describe('Sidebar Navigation Config', () => {
  it('should include all required navigation routes', () => {
    const titles = mainNavigation.map((item) => item.title);
    assert.ok(titles.includes('Dashboard'));
    assert.ok(titles.includes('Exams'));
    assert.ok(titles.includes('Questions'));
    assert.ok(titles.includes('Question Bank'));
    assert.ok(titles.includes('Candidate Sessions'));
    assert.ok(titles.includes('Institutions'));
    assert.ok(titles.includes('Settings'));
  });
});
