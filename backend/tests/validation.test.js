import { test, describe } from 'node:test';
import assert from 'node:assert';
import { validateLoginPayload, sanitizeInput } from '../utils/validators.js';

describe('Backend Request Validators', () => {
  test('should reject missing sessionId', () => {
    const res = validateLoginPayload({
      sessionId: '',
      username: 'AP24110010000',
      password: 'password123',
      captcha: 'ABC12'
    });
    assert.strictEqual(res.isValid, false);
    assert.ok(res.errors.some(e => e.includes('Session ID')));
  });

  test('should reject empty or invalid username', () => {
    const resEmpty = validateLoginPayload({
      sessionId: 'test-session-123',
      username: '',
      password: 'password123',
      captcha: 'ABC12'
    });
    assert.strictEqual(resEmpty.isValid, false);

    const resInvalidChars = validateLoginPayload({
      sessionId: 'test-session-123',
      username: 'AP24@#$123',
      password: 'password123',
      captcha: 'ABC12'
    });
    assert.strictEqual(resInvalidChars.isValid, false);
  });

  test('should reject empty password', () => {
    const res = validateLoginPayload({
      sessionId: 'test-session-123',
      username: 'AP24110010000',
      password: '',
      captcha: 'ABC12'
    });
    assert.strictEqual(res.isValid, false);
    assert.ok(res.errors.some(e => e.includes('Password is required')));
  });

  test('should reject invalid CAPTCHA length and characters', () => {
    const resShort = validateLoginPayload({
      sessionId: 'test-session-123',
      username: 'AP24110010000',
      password: 'password123',
      captcha: 'AB'
    });
    assert.strictEqual(resShort.isValid, false);

    const resSpecial = validateLoginPayload({
      sessionId: 'test-session-123',
      username: 'AP24110010000',
      password: 'password123',
      captcha: 'AB$#%'
    });
    assert.strictEqual(resSpecial.isValid, false);
  });

  test('should accept valid login payload', () => {
    const res = validateLoginPayload({
      sessionId: 'b4a5392e-13ab-41bf-bbce-93d4fba73b31',
      username: 'AP24110010511',
      password: 'mypassword123',
      captcha: 'G7K9Q'
    });
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.errors.length, 0);
  });

  test('sanitizeInput should trim whitespace and handle null/undefined', () => {
    assert.strictEqual(sanitizeInput('  AP24110010511  '), 'AP24110010511');
    assert.strictEqual(sanitizeInput(null), '');
    assert.strictEqual(sanitizeInput(undefined), '');
  });
});
