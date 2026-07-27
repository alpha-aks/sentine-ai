import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculatePasswordStrength } from '../../utils/validators';

describe('Password Strength Calculator', () => {
  it('should evaluate weak password correctly', () => {
    const result = calculatePasswordStrength('123456');
    assert.ok(result.score <= 1);
    assert.strictEqual(result.label, 'Weak');
  });

  it('should evaluate excellent password correctly', () => {
    const result = calculatePasswordStrength('P@ssw0rd2026!');
    assert.ok(result.score >= 4);
    assert.strictEqual(result.label, 'Excellent');
    assert.strictEqual(result.hasMinLength, true);
    assert.strictEqual(result.hasUppercase, true);
    assert.strictEqual(result.hasLowercase, true);
    assert.strictEqual(result.hasNumber, true);
    assert.strictEqual(result.hasSpecial, true);
  });
});
