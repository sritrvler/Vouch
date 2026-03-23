# Test Suite Architect Memory - Vouch

## Project State (as of 2026-03-23)

**Test coverage: PARTIAL.** 7 test files in `src/__tests__/`. Vitest v4.0.18 installed, `npm test` runs `vitest run`. 114 tests pass.

## Tech Stack
Next.js 16.1.6 App Router, TypeScript, React 19, Supabase, Lemon Squeezy, Resend. Vitest v4 as test runner (not Jest).

## Existing Test Files
- `src/__tests__/security.test.ts` - security utility tests
- `src/__tests__/disposable-emails.test.ts` - email validation
- `src/__tests__/fonts.test.ts` - font loading
- `src/__tests__/webhook-logic.test.ts` - Lemon Squeezy plan/status mapping (pure functions)
- `src/__tests__/plans.test.ts` - plan limit constants
- `src/__tests__/upload-video.test.ts` - video upload route (33 tests, full coverage)
- `src/__tests__/video-utils.test.ts` - video utility pure functions (15 tests + 19 .todo specs)

## Vitest Configuration
`vitest.config.ts` uses `environment: 'node'`. No DOM environment installed (jsdom not in deps). Any file containing the word "jsdom" (even in comments) triggers vitest to attempt loading that environment and FAIL. Remove all references to "jsdom" from test files.

## Key Mocking Patterns for This Codebase

### Mocking Supabase Server Client
```ts
vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(async () => mockServerClient),
}));
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ getAll: vi.fn(() => []), set: vi.fn() })),
}));
```

### Mocking Supabase Admin Client
```ts
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => mockAdminClient),
}));
```

### Mocking Rate Limiter
```ts
const mockCheck = vi.fn();
vi.mock('@/lib/ratelimit', () => ({
  createRateLimiter: vi.fn(() => ({ check: mockCheck })),
  getClientIp: vi.fn(() => '127.0.0.1'),
}));
```

### Dynamic imports required for mocks to take effect
The route file must be imported AFTER vi.mock() calls:
```ts
const { POST } = await import('@/app/api/testimonials/upload-video/route');
```

## Critical Testing Gotcha: File.size via NextRequest

`NextRequest.formData()` deserializes from raw bytes, reconstructing `File` objects from actual content. `Object.defineProperty(file, 'size', ...)` is lost because the re-parsed File's size comes from the byte count, not the original File.

**Workaround**: Mock `request.formData()` directly on a fake request object to return File-like objects with controlled `.size`:
```ts
const req = {
  headers: new Headers({ 'x-forwarded-for': '127.0.0.1' }),
  formData: async () => ({
    get: (key) => key === 'video' ? { type: 'video/mp4', size: 101*1024*1024 } : FORM_ID,
  }),
} as unknown as NextRequest;
```

## Admin Supabase Query Chain Pattern
Route calls `adminClient.from(table).select(...).eq(...).single()`. When mocking multiple tables in the same route (Promise.all pattern), use the table name to branch:
```ts
const adminFromImpl = vi.fn((table) => {
  if (table === 'subscriptions') return { select: () => ({ eq: () => ({ single: mockSubSelect }) }) };
  return { select: () => ({ eq: () => ({ not: () => mockCountSelect() }) }) };
});
```

## API Routes (13 total)
1. `POST /api/stripe/webhook` - Lemon Squeezy webhook handler
2. `GET /api/auth/callback` - OAuth callback, open redirect risk
3. `POST /api/upload-logo` - Logo upload, checks image/* MIME only (spoofable)
4. `GET /api/testimonials/widget/[id]` - Public widget API, 4 sequential queries
5. `GET /api/testimonials/card/[id]` - OG image card (edge runtime, .tsx file)
6. `POST /api/testimonials/submit` - Public testimonial submission
7. `POST /api/testimonials/upload-video` - Video upload, unauthenticated
8. `GET /api/testimonials/fetch-oembed` - Twitter oEmbed proxy
9. `POST /api/stripe/checkout` - Checkout URL creation
10. `POST /api/stripe/portal` - Customer portal URL
11. `GET /api/admin/lookup` - Admin user lookup
12. `POST /api/admin/set-plan` - Admin plan override
13. `POST /api/admin/toggle-ban` - Admin ban toggle
14. `POST /api/admin/impersonate` - Admin magic link generation

## Confirmed Critical Bugs (for test targets)

### CRITICAL-1: Webhook Never Sets Agency Plan
`/api/stripe/webhook/route.ts` line 54: `plan: isPro ? 'pro' : 'free'` - hardcoded.
Agency subscribers always get downgraded to 'pro'. No agency plan set via webhook path.

### CRITICAL-3: Open Redirect in Auth Callback
`/api/auth/callback/route.ts` line 12: `next` param taken directly from URL without validation.

### CRITICAL-4: Logo Upload - MIME Type Spoofable
`/api/upload-logo/route.ts` line 21: checks `file.type.startsWith('image/')` but `file.type` is browser-supplied, can be spoofed.

### CRITICAL-5: Disposable Email Blocking Disabled
`/src/app/(auth)/signup/page.tsx` line 59: check commented out.

### HIGH-1: Widget API Does Not Check is_banned
`/api/testimonials/widget/[id]/route.ts`: never checks `subscription.is_banned`.

### HIGH-2: Admin Secret Bypass When Env Var Not Set
`verifyAdmin()`: `if (adminSecret && ...)` - if `ADMIN_SECRET` is not set, secret check is skipped.

### HIGH-3: Agency Custom Slug Silently Broken
`/dashboard/settings/page.tsx` line 384: `subscription?.plan === 'pro'` - agency users excluded.

## RLS Policy Summary
- testimonials: owners manage (all) + public SELECT approved - NO public INSERT
- collection_forms: owners manage (all) + public SELECT active
- widgets: owners manage (all) + public SELECT (true)

## Key Constants
- `PLANS.free.videoLimit === 0` (any count >= 0 blocks free users)
- `PLANS.free.testimonialLimit === 25`
- Rate limiter: Upstash Redis-backed (not in-memory). Falls back to allowing all if Redis unavailable.
