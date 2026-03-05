import { describe, it, expect } from 'vitest';
import { isDisposableEmail } from '@/lib/disposable-emails';

describe('Disposable email detection', () => {
  it('blocks known disposable domains', () => {
    expect(isDisposableEmail('test@mailinator.com')).toBe(true);
    expect(isDisposableEmail('test@yopmail.com')).toBe(true);
    expect(isDisposableEmail('test@guerrillamail.com')).toBe(true);
    expect(isDisposableEmail('test@tempmail.com')).toBe(true);
    expect(isDisposableEmail('test@10minutemail.com')).toBe(true);
    expect(isDisposableEmail('test@maildrop.cc')).toBe(true);
  });

  it('allows legitimate email providers', () => {
    expect(isDisposableEmail('user@gmail.com')).toBe(false);
    expect(isDisposableEmail('user@outlook.com')).toBe(false);
    expect(isDisposableEmail('user@yahoo.com')).toBe(false);
    expect(isDisposableEmail('user@icloud.com')).toBe(false);
    expect(isDisposableEmail('user@protonmail.com')).toBe(false);
    expect(isDisposableEmail('user@hey.com')).toBe(false);
  });

  it('allows custom business domains', () => {
    expect(isDisposableEmail('sarah@myagency.com')).toBe(false);
    expect(isDisposableEmail('marcus@webstudio.io')).toBe(false);
    expect(isDisposableEmail('diana@freelance.co')).toBe(false);
  });

  it('is case insensitive for domain matching', () => {
    expect(isDisposableEmail('test@MAILINATOR.COM')).toBe(true);
    expect(isDisposableEmail('test@Yopmail.Com')).toBe(true);
  });

  it('handles malformed input gracefully', () => {
    expect(isDisposableEmail('')).toBe(false);
    expect(isDisposableEmail('no-at-sign')).toBe(false);
    expect(isDisposableEmail('@')).toBe(false);
    expect(isDisposableEmail('user@')).toBe(false);
  });
});
