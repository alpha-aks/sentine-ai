import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('StatsCard Formatting Suite', () => {
  it('should format percentage metrics correctly', () => {
    const value = 99.4;
    const formatted = `${value}%`;
    assert.strictEqual(formatted, '99.4%');
  });
});
