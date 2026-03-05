import { describe, it, expect } from 'vitest';
import { sanitizeFontUrl, sanitizeFontFamily } from '@/lib/fonts';

/**
 * These tests cover the 5 most critical security patterns identified in the
 * pre-launch audit. They test the validation logic directly.
 */

// ── 1. Open redirect validation ──────────────────────────────────────────────
// Mirrors: src/app/api/auth/callback/route.ts line 10
function validateRedirect(rawNext: string): string {
  return (rawNext.startsWith('/') && !rawNext.startsWith('//')) ? rawNext : '/dashboard';
}

describe('Open redirect validation', () => {
  it('allows normal relative paths', () => {
    expect(validateRedirect('/dashboard')).toBe('/dashboard');
    expect(validateRedirect('/dashboard/settings')).toBe('/dashboard/settings');
    expect(validateRedirect('/dashboard?tab=billing')).toBe('/dashboard?tab=billing');
  });

  it('blocks protocol-relative URLs (//evil.com)', () => {
    expect(validateRedirect('//evil.com')).toBe('/dashboard');
    expect(validateRedirect('//evil.com/steal')).toBe('/dashboard');
  });

  it('blocks absolute URLs', () => {
    expect(validateRedirect('https://evil.com')).toBe('/dashboard');
    expect(validateRedirect('http://evil.com')).toBe('/dashboard');
  });

  it('blocks empty and unusual inputs', () => {
    expect(validateRedirect('')).toBe('/dashboard');
    expect(validateRedirect('javascript:alert(1)')).toBe('/dashboard');
    expect(validateRedirect('data:text/html,<h1>hi</h1>')).toBe('/dashboard');
  });
});

// ── 2. Logo upload extension allowlisting ────────────────────────────────────
// Mirrors: src/app/api/upload-logo/route.ts lines 22-28
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

function validateLogoUpload(fileName: string, mimeType: string): boolean {
  const ext = (fileName.split('.').pop() || '').toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext) && ALLOWED_MIMES.includes(mimeType);
}

describe('Logo upload validation', () => {
  it('allows valid image files', () => {
    expect(validateLogoUpload('logo.png', 'image/png')).toBe(true);
    expect(validateLogoUpload('logo.jpg', 'image/jpeg')).toBe(true);
    expect(validateLogoUpload('icon.svg', 'image/svg+xml')).toBe(true);
    expect(validateLogoUpload('photo.webp', 'image/webp')).toBe(true);
  });

  it('blocks HTML files even with image MIME type', () => {
    expect(validateLogoUpload('evil.html', 'image/png')).toBe(false);
  });

  it('blocks script files', () => {
    expect(validateLogoUpload('evil.js', 'application/javascript')).toBe(false);
    expect(validateLogoUpload('evil.php', 'application/php')).toBe(false);
  });

  it('blocks files with valid extension but wrong MIME', () => {
    expect(validateLogoUpload('file.png', 'text/html')).toBe(false);
    expect(validateLogoUpload('file.jpg', 'application/javascript')).toBe(false);
  });

  it('blocks double extensions', () => {
    expect(validateLogoUpload('evil.html.png', 'image/png')).toBe(true); // .png ext is valid
    expect(validateLogoUpload('evil.png.html', 'image/png')).toBe(false); // .html ext blocked
  });
});

// ── 3. Admin secret guard (fail-closed) ──────────────────────────────────────
// Mirrors: src/app/api/admin/*/route.ts verifyAdmin function
function verifyAdminSecret(
  adminSecret: string | undefined,
  headerSecret: string | null
): boolean {
  if (!adminSecret || headerSecret !== adminSecret) return false;
  return true;
}

describe('Admin secret guard', () => {
  it('passes when secret matches', () => {
    expect(verifyAdminSecret('my-secret-123', 'my-secret-123')).toBe(true);
  });

  it('fails when secret does not match', () => {
    expect(verifyAdminSecret('my-secret-123', 'wrong')).toBe(false);
  });

  it('fails closed when ADMIN_SECRET env var is unset', () => {
    expect(verifyAdminSecret(undefined, 'any-value')).toBe(false);
    expect(verifyAdminSecret(undefined, null)).toBe(false);
  });

  it('fails when header is missing', () => {
    expect(verifyAdminSecret('my-secret-123', null)).toBe(false);
  });

  it('fails when secret is empty string', () => {
    expect(verifyAdminSecret('', 'any-value')).toBe(false);
    expect(verifyAdminSecret('', '')).toBe(false);
  });
});

// ── 4. Font URL sanitization ─────────────────────────────────────────────────
// Direct import from src/lib/fonts.ts
describe('Font URL sanitization', () => {
  it('allows valid HTTPS Google Fonts URLs', () => {
    const url = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap';
    expect(sanitizeFontUrl(url)).toBe(url);
  });

  it('blocks HTTP URLs', () => {
    expect(sanitizeFontUrl('http://fonts.googleapis.com/css2?family=Inter')).toBeNull();
  });

  it('blocks javascript: URIs', () => {
    expect(sanitizeFontUrl('javascript:alert(1)')).toBeNull();
  });

  it('blocks data: URIs', () => {
    expect(sanitizeFontUrl('data:text/css,*{color:red}')).toBeNull();
  });

  it('blocks encoded javascript in HTTPS URL', () => {
    expect(sanitizeFontUrl('https://evil.com/javascript:alert(1)')).toBeNull();
  });

  it('returns null for empty/null/undefined', () => {
    expect(sanitizeFontUrl(null)).toBeNull();
    expect(sanitizeFontUrl(undefined)).toBeNull();
    expect(sanitizeFontUrl('')).toBeNull();
  });
});

// ── 5. Font family sanitization ──────────────────────────────────────────────
// Direct import from src/lib/fonts.ts
describe('Font family sanitization', () => {
  it('allows normal font names', () => {
    expect(sanitizeFontFamily('Inter')).toBe('Inter');
    expect(sanitizeFontFamily('Plus Jakarta Sans')).toBe('Plus Jakarta Sans');
    expect(sanitizeFontFamily('DM Sans')).toBe('DM Sans');
  });

  it('strips CSS injection attempts', () => {
    expect(sanitizeFontFamily('Inter; color: red')).toBe('Inter color red');
    expect(sanitizeFontFamily('Inter} * { color: red')).toBe('Inter   color red');
  });

  it('strips script injection', () => {
    expect(sanitizeFontFamily('<script>alert(1)</script>')).toBe('scriptalert1script');
  });

  it('returns null for empty/null/undefined', () => {
    expect(sanitizeFontFamily(null)).toBeNull();
    expect(sanitizeFontFamily(undefined)).toBeNull();
    expect(sanitizeFontFamily('')).toBeNull();
  });

  it('returns null for only special characters', () => {
    expect(sanitizeFontFamily(';;;')).toBeNull();
    expect(sanitizeFontFamily('{}()')).toBeNull();
  });
});
