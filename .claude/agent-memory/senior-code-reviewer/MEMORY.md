# Senior Code Reviewer Memory

## Project: Vouch (Testimonial SaaS)
Tech: Next.js 16.1.6 (App Router), Supabase, Lemon Squeezy, TypeScript

## Security Audit Findings (2026-03-05)

### Architecture Notes
1. Auth: Supabase session via cookies, middleware protects /dashboard only
2. API routes: 13 total (4 admin, 3 stripe, 4 testimonial, 1 upload-logo, 1 auth callback)
3. Rate limiting: in-memory per-instance (not distributed). Exists on submit, upload-video, widget, fetch-oembed. Missing on checkout, portal, upload-logo, admin routes.
4. RLS: enabled on all 7 tables. Public insert only on form_views and widget_views.
5. Admin auth: email match + optional ADMIN_SECRET header. Secret check is skipped if env var unset.
6. Widget API: public, CORS *, returns testimonial data without author_email (good). Does expose email_domain.
7. Webhook: uses timingSafeEqual for signature verification (good).
8. No security headers configured in next.config.ts (no CSP, HSTS, X-Frame-Options, etc.)

### Key Vulnerabilities Found
1. Open redirect in /api/auth/callback via `next` param
2. Admin secret check bypassed when ADMIN_SECRET env not set
3. Upload-logo allows arbitrary file extensions (HTML upload = stored XSS)
4. No security headers at all
5. Widget API does not check is_banned
6. Testimonial submit RLS may block unauthenticated inserts (schema vs live mismatch)
7. Missing rate limiting on several authenticated endpoints
8. Admin impersonate returns magic link in API response (log exposure risk)
9. Testimonials RLS: no public INSERT policy but submit route uses anon client

### Patterns
1. verifyAdmin duplicated 4x (already flagged in Phase 1)
2. Uses sonner for toasts, shadcn/ui components
3. Supabase joins can return arrays (known quirk)
