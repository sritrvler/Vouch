import { describe, it, expect } from 'vitest';
import { getGoogleFontUrl, resolveFontUrl, GOOGLE_FONTS } from '@/lib/fonts';

describe('Google Font URL lookup', () => {
  it('returns URL for known fonts', () => {
    const url = getGoogleFontUrl('Inter');
    expect(url).toContain('fonts.googleapis.com');
    expect(url).toContain('Inter');
  });

  it('returns URL for multi-word font names', () => {
    const url = getGoogleFontUrl('Plus Jakarta Sans');
    expect(url).toContain('Plus+Jakarta+Sans');
  });

  it('returns null for unknown fonts', () => {
    expect(getGoogleFontUrl('Comic Sans MS')).toBeNull();
    expect(getGoogleFontUrl('Helvetica')).toBeNull();
  });

  it('returns null for null/undefined/empty', () => {
    expect(getGoogleFontUrl(null)).toBeNull();
    expect(getGoogleFontUrl(undefined)).toBeNull();
    expect(getGoogleFontUrl('')).toBeNull();
  });
});

describe('Font URL resolution', () => {
  it('prefers Google Font URL when font name matches', () => {
    const url = resolveFontUrl('Inter', 'https://example.com/custom.css');
    expect(url).toContain('fonts.googleapis.com');
    expect(url).toContain('Inter');
  });

  it('falls back to custom URL when font name is unknown', () => {
    const customUrl = 'https://example.com/my-font.css';
    const url = resolveFontUrl('MyCustomFont', customUrl);
    expect(url).toBe(customUrl);
  });

  it('returns null when no font and no custom URL', () => {
    expect(resolveFontUrl(null, null)).toBeNull();
    expect(resolveFontUrl(undefined, undefined)).toBeNull();
  });

  it('rejects non-HTTPS custom URLs', () => {
    expect(resolveFontUrl('Unknown', 'http://evil.com/font.css')).toBeNull();
    expect(resolveFontUrl('Unknown', 'javascript:alert(1)')).toBeNull();
  });
});

describe('Google Fonts catalog', () => {
  it('contains at least 10 fonts', () => {
    expect(GOOGLE_FONTS.length).toBeGreaterThanOrEqual(10);
  });

  it('all entries have label, value, and valid HTTPS URL', () => {
    for (const font of GOOGLE_FONTS) {
      expect(font.label).toBeTruthy();
      expect(font.value).toBeTruthy();
      expect(font.url).toMatch(/^https:\/\/fonts\.googleapis\.com/);
    }
  });

  it('has no duplicate font values', () => {
    const values = GOOGLE_FONTS.map(f => f.value);
    const unique = new Set(values);
    expect(unique.size).toBe(values.length);
  });
});
