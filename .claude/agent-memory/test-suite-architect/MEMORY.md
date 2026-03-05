# Test Suite Architect Memory - Vouch

## Project State (as of 2026-03-05)

**Test coverage: ZERO.** No test files exist in `src/`. No Jest, Vitest, Playwright, or Cypress configured. No test scripts in package.json.

## Tech Stack
Next.js 16.1.6 App Router, TypeScript, React 19, Supabase, Lemon Squeezy, Resend. No test framework installed.

## Build Status
Build PASSES (0 errors). 13 API routes + 32 pages/routes. One deprecation warning: middleware file convention deprecated in Next.js 16.

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

### CRITICAL-2: Image Card API Route Exists (not missing)
Card route is at `/api/testimonials/card/[id]/route.tsx` (tsx not ts, edge runtime). Route exists and builds. The prior report that it was "missing" was incorrect.

### CRITICAL-3: Open Redirect in Auth Callback
`/api/auth/callback/route.ts` line 12: `next` param taken directly from URL without validation. `?next=https://evil.com` would redirect to external domain.

### CRITICAL-4: Logo Upload - MIME Type Spoofable
`/api/upload-logo/route.ts` line 21: checks `file.type.startsWith('image/')` but `file.type` is browser-supplied, can be spoofed. No server-side magic bytes check. Extension from filename used directly for storage path.

### CRITICAL-5: Disposable Email Blocking Disabled
`/src/app/(auth)/signup/page.tsx` line 59: check commented out. Must re-enable before launch.

### CRITICAL-6: Missing RLS INSERT Policy for Testimonials
`supabase/schema.sql`: testimonials table has "Owners manage testimonials" (requires auth) and "Public can view approved" (SELECT only). No INSERT policy for unauthenticated submission. The submit route uses server-side client (anon key) so it depends on the anon key having insert rights - this relies on service role in the route, check carefully.

Note: submit route uses `createServerSupabaseClient` (anon key + session) not admin client. If user is not authenticated (they aren't - submitters are public), the anon key INSERT will fail RLS unless there's a policy allowing it. This is a live bug.

### HIGH-1: Widget API Does Not Check is_banned
`/api/testimonials/widget/[id]/route.ts`: fetches widget, project, subscription but never checks `subscription.is_banned`. A banned user's widget still serves testimonials.

### HIGH-2: Admin Secret Bypass When Env Var Not Set
`verifyAdmin()` in all admin routes: `if (adminSecret && ...)` - if `ADMIN_SECRET` is not set, the secret check is skipped. Only email check remains.

### HIGH-3: Agency Custom Slug Silently Broken
`/dashboard/settings/page.tsx` line 384: `subscription?.plan === 'pro'` - agency users can't set custom slug because this check excludes them.

### HIGH-4: No Security Headers
`next.config.ts` has no `headers()` configuration. No X-Frame-Options, X-Content-Type-Options, CSP, HSTS, Referrer-Policy.

### HIGH-5: Rate Limiter is In-Memory Per Instance
`/lib/ratelimit.ts`: in-memory Map. On serverless/Vercel, each cold start gets a fresh Map. Rate limiting does not hold across instances.

## RLS Policy Summary
- subscriptions: users manage own (all ops)
- projects: users manage own (all ops)
- collection_forms: owners manage (all) + public SELECT active
- testimonials: owners manage (all) + public SELECT approved - NO public INSERT
- widgets: owners manage (all) + public SELECT (true)
- form_views: owners SELECT + anyone INSERT
- widget_views: owners SELECT + anyone INSERT

## No Error Boundaries
No `error.tsx` files found anywhere in `src/app/`. Only `not-found.tsx` at root level. Zero structured logging. No monitoring (Sentry, Datadog, etc.). Console.error only.

## Key Patterns for Tests
- Admin auth: requires session user.email === ADMIN_EMAIL env var
- If ADMIN_SECRET env not set, secret header check is skipped
- Widget API uses anon Supabase client (session-aware) for public endpoint
- Rate limiter: in-memory, per instance, resets on cold start
- Webhook: no agency plan path - always sets 'pro' for active subscriptions

## Recommended Test Framework
Vitest (not Jest) - compatible with Next.js App Router, ESM, faster. Add msw for API mocking.
