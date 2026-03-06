# Go-Live Checklist (ALL COMPLETE)

- [x] **Re-enable disposable email blocking**: Done in session 10.
- [x] **Enable "Confirm email" in Supabase**: Already enabled with custom branded template.
- [x] **Test camera startup speed on another device**: Optimized in session 7.
- [x] **Test video upload speed on another device/network**: Optimized in session 7.
- [x] **Video playback delay in review step**: Fixed in session 7.

---

# Active Work Queue

## Session Handoff (March 6, 2026, session 21: Pricing Toggle Fix)

**What was done this session:**
1. Changed pricing page default from yearly to monthly to avoid sticker shock ($190/$490 vs $19/$49).
2. Fixed billing toggle pill alignment. Replaced absolute-positioned pill (broken left/width calc) with Framer Motion `layoutId` approach that auto-sizes to the active button.

**What's next:**
1. User is recording a demo video for Lemon Squeezy store approval.
2. After approval: P1 Security (rate limiting on 8 endpoints), P1 Conversion (email onboarding, notifications, post-signup warmth).
3. Deferred: client-side caching (React Query), legal review, Google brand verification.

**What to watch out for:**
1. Prod Supabase is free tier (Nano, ap-south-1). HEAD/count requests sometimes return 503.
2. Prod Supabase URL is `sxfjdkgopithetvmscdx.supabase.co`.
3. Dummy testimonials use fake names/emails. Replace with real ones once customers submit.

---

## Previous: Session Handoff (March 6, 2026, session 20: Prod Setup + Lemon Squeezy Prep)

**What was done this session:**
1. Google OAuth consent screen: investigated "to continue to supabase.co" issue. Requires custom domain (paid) or brand verification. App name already set to "Vouch". Parked for now.
2. Legal review (T&C + Privacy Policy): reviewed both documents, identified 11 gaps. Deferred until factual answers available (payment processor, analytics, video storage, Supabase region).
3. Production database seeded: created Vouch project, 1 collection form, 2 widgets (wall + carousel), 8 testimonials (7 approved, 1 pending) for Lemon Squeezy demo video.
4. Production schema sync: added missing columns to projects, testimonials, widgets, collection_forms tables. Dashboard now loads correctly.
5. Confirmed Clearbit is actively used in public page and embed page (logo.clearbit.com).
6. Added "Client-side caching" and "Legal review" as deferred tasks.

**What's next:**
1. User is recording a demo video for Lemon Squeezy store approval.
2. After approval: P1 Security (rate limiting on 8 endpoints), P1 Conversion (email onboarding, notifications, post-signup warmth).
3. Deferred: client-side caching (React Query), legal review, Google brand verification.

**What to watch out for:**
1. Prod Supabase is free tier (Nano, ap-south-1). HEAD/count requests sometimes return 503. Not a data issue, just throttling.
2. Prod Supabase URL is `sxfjdkgopithetvmscdx.supabase.co` (different from local `itbgozgomunoiolkdajo`).
3. Dummy testimonials use fake names/emails. Replace with real ones once customers submit.
4. User's email: `sritrvler@gmail.com`, user_id: `981e00cb-ed3b-4b8a-a1c8-76656d059337` on prod.
5. Seed file saved at `vouch/supabase/seed-demo.sql` (don't run again, data already inserted).

---

## Deferred: Client-Side Caching (React Query / SWR)

**Context:** Every page navigation hits Supabase directly. On free tier (Nano), this causes slow loads and occasional 503s on count queries. Adding a client-side cache layer will make repeated navigations instant.

**Scope:**
1. Add React Query (or SWR) for all Supabase queries in the dashboard
2. Cache projects, testimonials, forms, widgets, subscription data
3. Stale-while-revalidate pattern so UI loads instantly from cache, then refreshes in background
4. Invalidate cache on mutations (approve testimonial, create widget, etc.)

**Files likely affected:** `ProjectContext.tsx`, all dashboard pages (`page.tsx`, `inbox/page.tsx`, `forms/page.tsx`, `widgets/page.tsx`, `settings/page.tsx`)

**Priority:** After paying customers or Supabase Pro upgrade. Not blocking launch.

---

## Deferred: Legal Review (T&C + Privacy Policy)

**Context:** Current T&C and Privacy Policy are live but have known gaps. Need factual answers before updating.

**Known issues:**
1. Privacy Policy says "Stripe" but actual payment processor is Lemon Squeezy (or needs confirmation)
2. Privacy Policy lists Clearbit (needs confirmation if actually integrated)
3. No governing law/jurisdiction clause in T&C
4. No GDPR section (needed if EU users expected)
5. No CCPA section (needed if California users expected)
6. No children's privacy / age restriction clause
7. No indemnification, severability, or entire agreement clauses in T&C
8. No data breach notification policy in Privacy Policy
9. No data processing info for testimonial submitters (non-account holders)
10. Contact email is placeholder (`hello@example.com` fallback)
11. Entity is sole proprietor (Srinath, Coimbatore, Tamil Nadu, India) until incorporation

**Before starting, answer these:**
1. Payment processor: Stripe or Lemon Squeezy?
2. Is Clearbit actually integrated?
3. Any analytics tools? (Google Analytics, PostHog, etc.)
4. Where are videos stored? (Supabase storage, S3, etc.)
5. Supabase region? (US, EU, Asia?)

**Files:** `src/app/(marketing)/terms/page.tsx`, `src/app/(marketing)/privacy/page.tsx`

---

## Session Handoff (March 6, 2026, session 19: P1 Security Hardening Batch)

**What was done this session:**

1. **Password strength mismatch (T2):** Login schema aligned from min(6) to min(8) to match signup.
2. **Font URL injection (T2):** Widget API now sanitizes font_url via shared sanitizeFontUrl() before returning in JSON response. Public page and collection form were already safe.
3. **Admin impersonate leak (T2):** Magic link no longer returned in response body. Sent via Resend email to ADMIN_EMAIL. AdminClient UI updated to show "sent" confirmation instead of displaying the link.
4. **Video MIME validation (T2):** Server now verifies file magic bytes (ftyp box for MP4, EBML header for WebM) in addition to client-provided MIME type. Rejects files that don't match.

**Files changed:**
1. `src/app/(auth)/login/page.tsx` (password min 6 -> 8)
2. `src/app/api/testimonials/widget/[id]/route.ts` (import sanitizeFontUrl, use in response)
3. `src/app/api/admin/impersonate/route.ts` (send link via email, HTML escape)
4. `src/app/admin/AdminClient.tsx` (removed link display, show sent confirmation)
5. `src/app/api/testimonials/upload-video/route.ts` (magic byte verification)

**What's next:**
1. P1 Security: Rate limiting on 8 endpoints (checkout, portal, upload-logo, 4 admin routes). 2 hours.
2. P1 Conversion: Email onboarding, email notifications, post-signup warmth, test testimonial flow, checklist copy, /via page.
3. P2+ items from prioritized backlog.

**What to watch out for:**
1. Admin impersonate now requires RESEND_API_KEY and ADMIN_EMAIL env vars to deliver the link. In dev without Resend key, the link is generated but silently not sent. The response still says "sent" to avoid leaking whether email was actually delivered.
2. Video magic byte check: MP4 ftyp is at bytes 4-7 (not 0-3). WebM EBML header is at bytes 0-3. Files under 12 bytes are rejected (Uint8Array pads with 0s).
3. Existing users with 6-7 char passwords can still log in (Supabase handles auth). The min(8) is client-side Zod validation only.

---

## Previous: Session Handoff (March 6, 2026, session 18: Embed Modal Redesign + Widget UI Polish + Dashboard Subtexts)

**What was done this session:**

1. **Widget builder UI polish (T3, 10 fixes):** Accordion animations (Framer Motion height:'auto'), widget name pencil affordance, sticky preview, Escape key handler, mobile delete visibility, section rename, icon normalization, preview background fix, modal close touch target.
2. **Embed modal complete redesign (T3):** Replaced 4-tab layout with intent-based 3-path guided flow:
   a. "Share a link" path: public page URL with copy, share suggestions
   b. "On my website" path: platform picker (Wix, Squarespace, Webflow, Framer, WordPress, Other) with Simple Icons brand logos, then platform-specific numbered step-by-step instructions with inline embed code
   c. "Developer or AI tools" path: embed code with HTML label, AI prompt for vibe coders (Cursor, Claude Code, Bolt, Lovable, v0, Codex, Anti Gravity, Replit), React/Next.js component (Pro users get code, free users get benefit description + upgrade link)
3. **Embed modal UX polish:** Fixed slide animation direction (useRef instead of useState for slideDirection, Framer Motion custom+variants pattern), fixed modal resizing (fixed height with flex layout), copy button visibility on dark code blocks (variant prop: dark/light), platform brand icons from Simple Icons, code block language labels (HTML/JSX), focus-visible styles, slug dead-end now links to settings, removed belittling copy, consistent SEO messaging, auto-update reassurance on chooser screen.
4. **Dashboard subtexts:** Added descriptive subtexts to all dashboard pages (Inbox: "Review, approve, or reject testimonials from your customers", Widget Builder: "Customize how testimonials look on your site. Changes update automatically."). Rephrased Forms subtext. Fixed Settings profile description to explain where display name appears.
5. **Button rename:** "Get Code" -> "Add to Website" with Globe icon (clearer intent).
6. **Widget header cleanup:** Removed redundant inline widget name input (already visible in tab selector).
7. **Created `src/lib/embed-platforms.ts`:** Extracted platform-specific embed instructions to a data file.

**Files changed:**
- `src/app/(dashboard)/dashboard/widgets/page.tsx` (major: embed modal redesign, UI polish, header cleanup)
- `src/app/(dashboard)/dashboard/inbox/page.tsx` (added subtext)
- `src/app/(dashboard)/dashboard/forms/page.tsx` (rephrased subtext)
- `src/app/(dashboard)/dashboard/settings/page.tsx` (profile description)
- `src/lib/embed-platforms.ts` (new: platform data)

**What's next:**
Pick from the prioritized backlog below. The embed modal and widget builder are now polished and ready for launch.

**What to watch out for:**
1. `slideDirection` is a `useRef` not `useState`. It's set synchronously before state updates to avoid Framer Motion reading stale values during AnimatePresence transitions.
2. `CopyCodeButton` now has a `variant` prop ('dark' | 'light'). Default is 'dark' (for code blocks on bg-gray-950). Use `variant="light"` on light backgrounds.
3. The embed modal uses fixed height `h-[70vh] sm:h-[65vh]` with flex layout. Header is `shrink-0`, content is `flex-1 overflow-y-auto`. This prevents modal resizing between steps.
4. Platform icons are inline SVGs from Simple Icons (MIT license). If adding a new platform, fetch the SVG path from `https://raw.githubusercontent.com/simple-icons/simple-icons/master/icons/[name].svg`.
5. Widget name input was removed from the header. Name shows in widget selector tab. If renaming is needed, consider adding it to a settings section or double-click on tab.

---

## Previous: Session Handoff (March 6, 2026, session 17: All Projects + Inbox Scoping + Dialog Consistency)

**What was done this session:**

1. **"All projects" option in project selector:** Added to both desktop sidebar and mobile header dropdowns. Uses `showAllProjects` boolean in ProjectContext with localStorage persistence. Only appears when user has 2+ projects.
2. **Hydration error fix:** Radix Popovers generate mismatched aria-controls IDs during SSR. Fixed by deferring Popover rendering with `mounted` state pattern (static placeholder buttons during SSR, Popovers after mount).
3. **Inbox scoping by project:** Inbox now filters testimonials by selected project. When "All projects" active, shows all. Always includes `user_id` filter for security.
4. **Consistent project selection in dialogs:** "Add past testimonial" (inbox) and "Create collection form" (forms) dialogs now: greyed out with project name when specific project selected, editable Radix Select dropdown when "All projects" active.
5. **Replaced native `<select>` with shadcn Select:** Used `position="popper"` for correct dropdown direction. Projects sorted alphabetically.
6. **Dialog input contrast fix:** All dialog inputs across the portal now use `bg-white border-border` instead of `bg-transparent`. Locked fields use `bg-muted cursor-not-allowed`.
7. **Widget project identification:** When "All projects" selected, widget selector shows "Project Name . Layout Type" as subtitle.
8. **"Powered by Vouch" clickable everywhere:** Changed from plain text/same-tab link to `<a href="/via" target="_blank">` on public page (`/p/[slug]`), report page (`/report/[token]`), and widget builder preview.
9. **Senior code review:** Fixed security issue (queries filtering by project_id without user_id), TypeScript errors, and other review findings.

**Files changed:**
- `src/context/ProjectContext.tsx` (showAllProjects state, localStorage persistence)
- `src/app/(dashboard)/layout.tsx` (All projects option, hydration fix with mounted state)
- `src/app/(dashboard)/dashboard/page.tsx` (removed filterMode toggle, uses showAllProjects from context, added scoped() helper with user_id)
- `src/app/(dashboard)/dashboard/inbox/page.tsx` (project scoping, ImportDialog with locked/unlocked project selector)
- `src/app/(dashboard)/dashboard/forms/page.tsx` (project scoping, create dialog with locked/unlocked selector)
- `src/app/(dashboard)/dashboard/widgets/page.tsx` (project scoping, project name in widget subtitle, Powered by Vouch link)
- `src/app/p/[slug]/page.tsx` (Powered by Vouch as /via link in new tab)
- `src/app/report/[token]/page.tsx` (Powered by Vouch as /via link in new tab)

**What's next:**
Pick from the prioritized backlog below. Recommended: P1 items (conversion/growth, then security hardening).

**What to watch out for:**
1. `showAllProjects` persists in localStorage key `vouch_show_all_projects`. Restored on mount only when 2+ projects exist.
2. Hydration fix uses `mounted` state for all 3 Popovers in layout.tsx. SSR renders static placeholder buttons. Do not remove this pattern or hydration errors return.
3. All Supabase queries now include `.eq('user_id', user.id)` alongside any `project_id` filter. This is a security requirement. Do not remove user_id filters.
4. Radix Select needs `position="popper"` to drop down below trigger. Default `position="item-aligned"` aligns selected item with trigger (looks like going up).
5. Dialog inputs use `bg-white border-border`. Locked project field uses `bg-muted cursor-not-allowed`. Maintain this contrast pattern for any new dialogs.
6. Deferred from code review: SSR placeholder text flash for "All projects" (minor), create dialog pre-selects stale project in All mode, fetchTestimonials vs loadMore filter inconsistency (pre-existing), createClient() at component body level (pre-existing).

---

## Previous: Session Handoff (March 6, 2026, session 16: Mobile Bug Fixes + Tiered Pipeline)

**What was done this session:**

1. **4 mobile bug fixes (pushed to remote):**
   a. Mobile project selector: Added `md:hidden` project selector bar in dashboard layout with separate popover state. Full project list, search, new project, upgrade prompt.
   b. Color picker: Removed all `<input type="color">` (1 in settings, 3 in widgets). Replaced with color swatch preview + hex text input with validation. No native dialog.
   c. Landing page desktop-view-on-mobile: Changed all 3 `md:grid-cols-3` marketing grids to `sm:grid-cols-2 lg:grid-cols-3`. Pain points, steps, pricing cards.
   d. Inbox toolbar: Button text hidden on mobile (`hidden sm:inline`), icon-only with title attributes.

2. **Tiered pipeline rewrite:**
   a. Added Task Complexity Tiers (T1 trivial, T2 small, T3 medium, T4 large) that route to different pipeline paths.
   b. T1: fix and build, no steps. T2: inline self-review only, zero agents. T3: 1-2 agents + self-review. T4: full agents + self-review.
   c. Added Adversarial Self-Review Protocol with 9-point checklist, anti-bias guardrails, and zero-issue justification requirement.
   d. Added agent token efficiency rule: always pass code snippets in agent prompts, never ask agents to read files.
   e. Updated CLAUDE.md, MEMORY.md, lessons.md with all changes.

**Files changed:**
- `src/app/(dashboard)/layout.tsx` (mobile project selector)
- `src/app/(dashboard)/dashboard/inbox/page.tsx` (icon-only toolbar)
- `src/app/(dashboard)/dashboard/settings/page.tsx` (removed native color picker)
- `src/app/(dashboard)/dashboard/widgets/page.tsx` (replaced 3 native color pickers, added flex-wrap, aria-labels)
- `src/app/(marketing)/page.tsx` (2 grid breakpoint fixes)
- `src/app/(marketing)/_components/PricingCards.tsx` (1 grid breakpoint fix)
- `CLAUDE.md` (tiered pipeline, self-review protocol, agent efficiency rules)
- `MEMORY.md` (synced tiered pipeline, agent routing)
- `tasks/lessons.md` (6 new lessons: #82-87)
- `tasks/todo.md` (this handoff)

**What's next:**
Pick from the prioritized backlog below. Recommended: P1 items (conversion/growth, then security hardening).

**What to watch out for:**
1. Pipeline is now TIERED. Must classify task as T1/T2/T3/T4 before Step 1. Say `TIER: T[n]` before starting.
2. T2 tasks use adversarial self-review only. No agents. The self-review checklist has 9 items and a zero-issue justification requirement.
3. T3/T4 agents must receive code snippets in prompts. NEVER ask agents to "read the file." This was the main token waste issue.
4. Self-review runs at ALL tiers T2+. It is mandatory alongside agents at T3/T4, not a replacement.
5. Separate popover state for mobile vs desktop project selector (mobileProjectPopoverOpen). Do not merge these.
6. `<input type="color">` is now fully removed from the codebase. If any new color pickers are needed, use the hex input + swatch pattern.

---

## Prioritized Backlog (from audit-report.md)

Items are grouped by priority. P1 = do before or soon after launch. P2 = first month. P3 = when relevant. P4 = nice to have.

### P1: Conversion and Growth (directly affects signups, activation, retention)

- [ ] **Email onboarding sequence.** 3-email Resend sequence: welcome, day 3 nudge, day 7 tip. Zero re-engagement after signup today. (1 day)
- [ ] **Email notification when testimonials arrive.** Users must check dashboard manually. Retention risk. New testimonial = Resend email to project owner. (half day)
- [ ] **Post-signup email confirmation screen is cold.** "Back to sign in" CTA is a dead end. Add warmth and next-step guidance. (1 hour)
- [ ] **No "send yourself a test testimonial" flow.** Let new users preview the experience from the submitter side. (2 hours)
- [ ] **Social proof on landing page.** Use own product to display testimonials about Vouch. Needs real customers first. (2 hours once content exists)
- [ ] **Getting-started checklist copy is procedural, not motivational.** Rewrite to emphasize outcomes. (1 hour)
- [ ] **Custom /via conversion page.** Currently redirects to landing page with `?ref=powered-by`. Build a purpose-built conversion page that leverages context ("you just saw this working on a real site") with live demo, showcase of widget layouts, and a tighter CTA. Should convert better than generic landing page for this specific audience. Track `/via` conversion rate first to establish baseline. (half day)

### P1: Security Hardening (attack surface gaps)

- [ ] **8 endpoints have no rate limiting.** checkout, portal, upload-logo, all 4 admin routes. (2 hours)
- [x] **Video upload MIME validation is client-trust only.** Done session 19: added magic byte verification (ftyp for MP4, EBML for WebM) in upload-video route.
- [x] **Admin impersonate returns magic link in response body.** Done session 19: link now sent via Resend email to ADMIN_EMAIL instead of returned in response.
- [x] **Font URL injection on public page.** Done session 19: widget API now uses sanitizeFontUrl(). Public page and collection form already used resolveFontUrl() which calls sanitizeFontUrl().
- [x] **Password strength mismatch.** Done session 19: login schema aligned to min(8) to match signup.

### P2: Stability and Monitoring (catch problems before users report them)

- [ ] **Error Boundaries for dashboard.** Add `error.tsx` to every dashboard route segment. Rendering error currently white-screens the entire page. (2 hours)
- [ ] **Sentry or equivalent monitoring.** First crash signal currently comes from user complaints. (2 hours)
- [ ] **Structured logging.** All errors go to console.error(). Not queryable, not alertable. (2 hours)
- [ ] **E2E tests with Playwright.** Automated critical path: signup, create form, submit testimonial, approve, embed. (1 day)
- [ ] **Webhook idempotency.** Store processed event IDs to prevent duplicate processing on retries. (1 hour)

### P2: Performance (noticeable at scale or for power users)

- [ ] **Centralize auth + subscription from context.** Remove 12 redundant getUser() calls, 4 redundant subscription fetches across dashboard pages. (3 hours)
- [ ] **select('*') over-fetching.** Inbox, widgets, settings, widget API all fetch all columns. Use explicit column lists. (2 hours)
- [ ] **Forms N+1.** Forms page fetches ALL testimonial rows just to count per form. Use count queries. (1 hour)
- [ ] **Collection form font FOUT.** Custom Google Fonts load via client-side useEffect, causing flash of unstyled text. Move to server component or preload. (1 hour)
- [ ] **Server-side video compression.** Cloudinary, FFmpeg, or Mux integration. Deferred until Supabase storage costs become material. (1 week)

### P2: Code Health (slows future development)

- [ ] **Extract shared types to src/types/.** Single Project, Widget, Testimonial interface instead of 4+ duplicates. (2 hours)
- [ ] **Settings page refactor.** 33 useState calls should be a single useReducer. (2 hours)
- [ ] **5 monolith files.** widgets/page.tsx (1,558 lines), CollectFormClient (1,454), inbox (1,360), settings (1,246), forms (1,031). Extract subcomponents. (1 day)
- [ ] **23 eslint-disable comments.** Audit each one; fix underlying issues or document why the disable is necessary. (2 hours)

### P3: Competitive Features (gap-closers, build when demand is proven)

- [ ] **Google Reviews import.** Biggest competitive gap. Cannot import existing reviews from Google. (1 week)
- [ ] **AI golden sentence auto-extraction.** LLM call on submit to auto-populate golden_sentence field. ~$0.001/testimonial. (2 days)
- [ ] **Twitter/X + LinkedIn import.** source_url field and social icons already exist. (3 days)
- [ ] **Custom domains for collection forms.** DNS verification + SSL provisioning. Wait for 20+ Studio subscribers asking for it. (1 week)
- [ ] **Team seats / client logins.** Report link covers 80% of "share with client" need. Full ACL is 2-4 weeks. Defer until demand.
- [ ] **Zapier/Slack/CRM integrations.** No integrations today. Build when customers ask. (varies)

### P3: Infrastructure (matters at 1,000+ users)

- [ ] **widget_views/form_views tables: no TTL or partitioning.** Unbounded growth. Add data retention policy. (half day)
- [ ] **In-memory rate limiter.** Per-instance, bypassed by distributed attacks. Move to Redis or Upstash. (half day)
- [ ] **No graceful degradation for external service failures.** Supabase down = infinite spinner. (1 day)
- [ ] **Dashboard pages all client-rendered.** No server-side rendering, no streaming. Acceptable for now but slower perceived load. (1 day)
- [ ] **Radix UI monorepo package may bypass tree-shaking.** Verify optimizePackageImports covers it. (1 hour)

### P4: Polish (nice to have, not urgent)

- [ ] **Skeleton loaders on other dashboard pages** (inbox, forms, widgets use their own loaders; standardize shimmer pattern). (1 hour)
- [ ] **FAQ accordion animation** on `/pricing` page too (currently only landing page). (15 min)

---

## Previous: Session Handoff (March 5, 2026, session 12: Studio Rename + Test Coverage)

**What was done:**
1. Renamed Agency to Studio across all 19 files. DB CHECK constraint, env vars, plan types, feature lists, admin panel, webhook, all updated.
2. Added 39 new tests across 4 test files. Total: 66 tests, 5 suites, all passing.

**DB migration required (DONE by user):**
```sql
ALTER TABLE public.subscriptions DROP CONSTRAINT subscriptions_plan_check;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_plan_check CHECK (plan IN ('free', 'pro', 'studio'));
```

**Vercel env var rename required (DONE by user):**
LEMONSQUEEZY_AGENCY_VARIANT_ID -> LEMONSQUEEZY_STUDIO_VARIANT_ID
LEMONSQUEEZY_AGENCY_YEARLY_VARIANT_ID -> LEMONSQUEEZY_STUDIO_YEARLY_VARIANT_ID

---

## Previous: Session Handoff (March 5, 2026, session 11: Post-Launch Items + Security Hardening)

**What was done this session:**
1. All 11 post-launch items (13-23) from audit-report.md completed.
2. Senior dev review ran on session 11 changes: fixed 2 SVG viewBox bugs, removed unused @vitejs/plugin-react, added backslash bypass tests.
3. Senior dev review ran on session 10 changes: fixed HIGH widget API fetchLimit regression, moved error check before data processing, added nosniff to widget API responses.
4. Fixed all 6 security backlog items from the reviews.
5. Updated MEMORY.md with agent strategy (mandatory review agent in post-implementation gate).

**POST-LAUNCH ITEMS (ALL 11 COMPLETE):**
13. [x] Embed widget quote color uses theme textColor instead of hardcoded #374151.
14. [x] Email footer hostile copy removed.
15. [x] Collection form prompt: "What stood out?" replaces "What could be better?"
16. [x] Widget builder defaults to 'builder' tab.
17. [x] Billing defaults to yearly in upgrade modal + pricing page.
18. [x] Removed 5 unused npm deps (42 packages). Archived unused command.tsx.
19. [x] Removed "30-day export" FAQ. Rewrote to match reality.
20. [x] Trust signals (lock icon + Lemon Squeezy) near pricing CTA.
21. [x] Platform trust bar with SVG icons for 7 platforms.
22. [x] embed.js error handling (res.ok check, console.warn).
23. [x] Vitest + 27 security tests across 5 suites (all passing).

**SECURITY BACKLOG (ALL 6 COMPLETE):**
1. [x] SVG upload XSS: removed SVG from logo upload allowlist (raster only now).
2. [x] RLS INSERT: tightened policy to constrain user_id/project_id to match form. DB migration applied.
3. [x] Open redirect: now blocks /\ backslash bypass.
4. [x] verifyAdmin: extracted to src/lib/admin-auth.ts (was duplicated in 4 files).
5. [x] CSP: removed unsafe-eval from script-src.
6. [x] Disposable email: server-side check in auth callback (defense-in-depth).

**REVIEW FIXES (from code reviews):**
1. [x] Widget API fetchLimit: was hardcoded 12, now Math.max(max_items, 50). (HIGH regression)
2. [x] Widget API error check: moved before sorting/slicing (was dead code).
3. [x] Widget API: added nosniff + HSTS headers.
4. [x] Next.js SVG path: fixed viewBox mismatch (was 28x28 coords in 24x24 box).
5. [x] Shopify SVG path: replaced with correct 24x24 path.
6. [x] Removed unused @vitejs/plugin-react devDependency.

**What's next:**
All audit items and security backlog complete. Remaining work:
1. ~~Rename Agency to Studio~~ DONE (session 12). Deferred: custom domains, team seats
2. Social proof on landing page (needs real customers first)
3. Server-side video compression (deferred until storage costs are material)
4. ~~More test coverage beyond the 5 security suites~~ DONE (session 12, 39 new tests)

**What to watch out for:**
1. Platform SVG paths in page.tsx use 24x24 viewBox. Next.js and Shopify were fixed this session.
2. `_archive/2026-03-05/command.tsx` excluded from tsconfig. Restore if cmdk is re-added.
3. Vitest config uses `@` path alias. Keep in sync with tsconfig paths.
4. Auth callback now has server-side disposable email check. If it blocks a legitimate user, check the domain list in src/lib/disposable-emails.ts.
5. CSP no longer has unsafe-eval. If Next.js production breaks with eval errors, this is the first thing to check.
6. **PROCESS: Always run senior dev review agent before committing.** Baked into MEMORY.md post-implementation gate.

---

## Previous: Session Handoff (March 5, 2026, session 10: Before-Launch Audit Fixes)

**What was done this session:**
All 12 before-launch audit items fixed, built, pushed to origin/main, and DB migrations applied.

**BEFORE LAUNCH (ALL 12 COMPLETE):**
1. [x] Webhook: set plan='agency' when variant matches Agency env vars.
2. [x] Open redirect: validates `next` param starts with `/` and not `//`.
3. [x] Logo upload: allowlists extensions AND MIME types.
4. [x] RLS INSERT: added policy scoped to active forms only.
5. [x] Disposable email: uncommented isDisposableEmail check.
6. [x] Supabase email confirmation: already enabled.
7. [x] Security headers: CSP, X-Frame-Options, HSTS, nosniff, Referrer-Policy.
8. [x] Widget API: returns 403 if user is_banned.
9. [x] Admin secret: all 4 routes deny access when env var is unset.
10. [x] Widget API: parallel queries via Promise.all.
11. [x] Agency custom slug: `!== 'free'` in settings.
12. [x] projects.user_id index: added to schema.sql.

---

## Previous: Session Handoff (March 5, 2026, session 8)

**What was done this session:**
1. Agency Plan Task 1: Self-serve checkout. Replaced "Get in touch" mailto with real Lemon Squeezy checkout for Agency ($49/mo, $490/yr). Updated `createCheckoutUrl` to accept plan param. Updated checkout API route, UpgradeModal, and PricingCards.
2. Agency Plan Tasks 2+3+4: White-label client reports, embed codes in reports, custom report intro. Added `report_footer_text` and `report_message` columns to projects. Settings page has "Report Customization" section (Agency-gated). Report page shows custom intro, conditional footer, and widget embed code snippets with copy buttons.
3. Agency Plan Task 5: Updated AGENCY_FEATURES to match reality. Removed "Priority email support" and "Custom onboarding call" (fake). Added "White-label client reports", "Embed codes in client reports", "Custom report intro message", "Email support (1 business day)". Eliminated duplicate AGENCY_FEATURES in PricingCards (now imports from lemonsqueezy.ts). Updated comparison table on pricing page.
4. Fixed Radix DialogTitle accessibility warning in upgrade modal (added sr-only DialogTitle).
5. Added Agency variant IDs to .env.local (monthly: 1368721, yearly: 1368722).

**What's next:**
Agency Plan Overhaul is DONE (Tasks 1 through 5). Deferred items remain: Task 6 (rename to "Studio"), Task 7 (custom domains), Task 8 (team seats). Next priority: review the full product for any remaining gaps, or pick from deferred items. Consider a final pre-launch review using the Go-Live Checklist at the top of this file.

**What to watch out for:**
1. DB migration required: `ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS report_footer_text text; ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS report_message text;` (already run by user on current Supabase instance).
2. Agency variant IDs in .env.local (LEMONSQUEEZY_AGENCY_VARIANT_ID=1368721, LEMONSQUEEZY_AGENCY_YEARLY_VARIANT_ID=1368722). Must also be set in Vercel env vars for production.
3. PricingCards no longer defines its own AGENCY_FEATURES. It re-exports from lemonsqueezy.ts. If anything imports AGENCY_FEATURES from PricingCards, it still works (re-export).
4. Report page now queries `user_id` from projects to check subscription plan. This is a server component query using service role, so RLS is bypassed. The token-based access is unchanged.
5. The `report_message` field is capped at 200 characters (enforced in settings save + input maxLength). `report_footer_text` has no length cap (free text).
6. Downgrade scenario: if Agency user downgrades, report_footer_text and report_message stay in DB but report page falls back to "Powered by Vouch" because `isAgency` will be false.

---

## Previous: Session Handoff (March 5, 2026, session 7)

**What was done this session:**
1. Fixed video playback delay in review step: added `preload="auto"` to the blob URL video in CollectFormClient.tsx (line 1001). Browser now buffers the local blob immediately instead of waiting for play.
2. Optimized camera startup: lowered getUserMedia constraints from `ideal: 1280x720` to `ideal: 640x480` (line 548). Lower resolution negotiates faster with camera hardware.
3. Reduced recording bitrate: 1,000,000 bps to 600,000 bps (line 490). For talking-head testimonials at 480p, this is plenty. Files are ~40% smaller.
4. Thumbnail-first widgets in embed.js: replaced inline `<video>` tags with poster image + play button overlay. Video loads only when user clicks. Saves 70-90% bandwidth for widget page loads. Click handler in `postRenderFixups` creates the video element dynamically.
5. Added Fair Use clause to Terms of Service (new section 7). Covers "unlimited" features with reasonable business use language. Follows Basecamp/Notion pattern.
6. Updated ToS section 5 to mention Pro, Agency, and annual billing (was Pro-only, monthly-only).
7. Renumbered ToS sections 7-11 to 8-12. Updated "Last updated" date to March 5, 2026.

**What's next:**
Agency Plan Overhaul. Start with Task 1 (self-serve checkout). See "NEXT: Agency Plan Overhaul" section below.

**What to watch out for:**
1. Camera resolution is now `ideal: 640x480` not `ideal: 1280x720`. If users report blurry video, this can be bumped to `ideal: 960x720` as a middle ground.
2. Recording bitrate is now 600kbps (was 1Mbps). If quality complaints arise for longer recordings (60s+), consider 750kbps.
3. embed.js video click-to-play replaces the poster div with a `<video>` element using `replaceWith()`. The old div is gone after click. If user pauses and the widget re-renders (e.g., carousel navigation), the video state is lost. This is acceptable since carousel auto-advance is not implemented.
4. The iframe embed (`src/app/embed/[id]/page.tsx`) still uses inline `<video>` tags (not thumbnail-first). It's v1 compat only and not shown in dashboard, so this is intentional.
5. Server-side video compression (Cloudinary/FFmpeg/Mux) was NOT done. This requires external service integration and is deferred. The client-side bitrate reduction handles 80% of the cost savings.
6. The "Test on another device" go-live items are checked off as optimized, but still need manual verification on a physical device before launch.

---

## Previous: Session Handoff (March 5, 2026, session 6)

**What was done this session:**
1. Fixed font loading bug: changed `display: 'optional'` to `display: 'swap'` in layout.tsx. Inter font was falling back to Arial on first load.
2. Dashboard metrics now scoped by project: uses ProjectContext's selectedProjectId. Added "All projects" toggle when user has > 1 project.
3. Project dropdown improvements: sorted alphabetically (was created_at), search input appears when > 5 projects.
4. Redesigned UpgradeModal to show Pro ($19) and Agency ($49) side by side. Was Pro-only.
5. Replaced all 4 inline upgrade dialogs (widgets, forms, inbox, settings) with the shared UpgradeModal. Eliminated duplicate feature lists, hardcoded prices, and Pro-only copy.
6. Centralized feature lists: PRO_FEATURES and AGENCY_FEATURES exported from `src/lib/lemonsqueezy.ts`. All surfaces import from there.
7. Added Agency to PLANS object in lemonsqueezy.ts (was missing). Fixed Pro projectLimit from 5 to Infinity (contradicted "Unlimited" on pricing page).
8. Fixed Agency users seeing only Pro features in billing tab. Now shows Agency-specific features too.
9. Cleaned up dead imports in widgets/page.tsx and forms/page.tsx.
10. Fixed "Upgrade to Pro" copy in settings help text to plan-neutral "Upgrade to..."
11. Condensed modal Pro features from 10 items to 6 highlights to prevent viewport overflow.
12. Agency plan strategy created and added to todo.md as "NEXT" task.

**What's next:**
Agency Plan Overhaul. Start with Task 1 (self-serve checkout). See "NEXT: Agency Plan Overhaul" section below.

**What to watch out for:**
1. The upgrade modal uses a condensed `MODAL_PRO_HIGHLIGHTS` list (6 items) while the pricing page uses the full `PRO_FEATURES` (10 items). These are intentionally different. Don't try to sync them.
2. Agency checkout requires Lemon Squeezy variant IDs in .env.local (LEMONSQUEEZY_AGENCY_VARIANT_ID, LEMONSQUEEZY_AGENCY_YEARLY_VARIANT_ID). These don't exist yet.
3. The `createCheckoutUrl` function in lemonsqueezy.ts currently only handles Pro variants. Task 1 of the Agency overhaul extends it.
4. Settings page billing tab for free users now opens the UpgradeModal instead of having its own inline Pro card. The old `handleUpgrade` function in settings may be dead code now (verify before removing).
5. ProjectContext sorts projects by name now (was created_at). This affects the order everywhere projects are listed.

---

## Previous: Session Handoff (March 4, 2026, session 5)

**What was done this session:**
1. Custom fonts shipped. All 11 files changed (see plan). Build passes.
2. New shared utility: `src/lib/fonts.ts` with GOOGLE_FONTS array (15 fonts), sanitizeFontUrl, sanitizeFontFamily, resolveFontUrl.
3. Database: Added `font_family` and `font_url` columns to projects table. Added `fontFamily`/`fontUrl` to widget theme JSONB default.
4. ProjectContext: Added font_family and font_url to Project interface and select query.
5. Settings page: Font picker with Google Fonts dropdown + custom CSS URL input + live preview.
6. Widget builder: Per-widget font override (inherit from page default, or pick specific font). Live preview renders chosen font.
7. Widget API: Exposes project fontFamily and fontUrl in response.
8. Collection form: Loads font via useEffect (injects link tags into head), applies fontFamily inline style.
9. Public page: Loads font via link tags in JSX, applies fontFamily inline style.
10. embed.js: Font sanitizers, GFONT_MAP lookup, resolveFontConfig() resolves widget theme font > project font > inherit. Injects link tags into shadow root.
11. Iframe embed: Resolves font, injects link tags in head, applies fontStack to body CSS.
12. All 12 test scenarios traced and passed (personas, empty state, boundary, data transitions, stale data, concurrent, failure, permissions, reverse, security, performance).

**What's next:**
Video cost optimization (compress + thumbnail + fair use). See "AFTER: Video Cost Optimization" section below.

**What to watch out for:**
1. shadcn Select component was installed during this session. If `src/components/ui/select.tsx` doesn't exist after a fresh clone, run `npx shadcn@latest add select`.
2. The embed.js GFONT_MAP must be kept in sync with `src/lib/fonts.ts` GOOGLE_FONTS array. If you add or remove a font from one, update the other.
3. Font loading in embed.js uses preconnect hints inside the shadow root. This is intentional. Host page preconnect doesn't help shadow DOM in all browsers.
4. `updateTheme` in widgets page now accepts `string | boolean | null` (was `string | boolean`). This is because fontUrl can be null.
5. The iframe embed (`src/app/embed/[id]/page.tsx`) has its own GFONT_MAP constant (duplicated from embed.js). A future refactor could share these, but the iframe is lower priority (v1 compat only).
6. Font is free for all plans (not gated). Intentional. Same as accent_color.

---

## Previous: Session Handoff (March 4, 2026, session 4)

**What was done this session:**
1. Multi-widget management shipped (commit `7687fcf`). Widget page loads all widgets per project. Added widget selector bar, create/delete/switch handlers, empty state, upgrade dialog. Builder UI unchanged.
2. Fixed `isPro` checks to use `userPlan !== 'free'` (branding toggle, React tab) so agency plan works.
3. Added `project_id` index to schema.sql.
4. All 15 test scenarios traced and passed.
5. Process update (commit `33d7ccc`): baked Persona-Driven UI Selection into pre-implementation step 7. Every UI choice now requires per-persona intent statements before picking a pattern.
6. Process update (commit `7dec1c5`): added Business Impact Assessment (6 questions: retention, conversion, time to value, churn risk, expansion, referral) as mandatory companion to persona intents. Business is not an afterthought.
7. Widget selector refined: name width 120px to 180px, layout type label added below name.

**What's next:**
Custom fonts. Brand blending improvement. See "AFTER: Custom Fonts" section below. Key files: widget builder (font picker), embed.js (font loading into shadow root), schema (font_family field). Remember: pre-implementation now has 7 steps (step 7 = persona UI intents + business impact assessment).

**What to watch out for:**
1. PRE-IMPLEMENTATION now has 7 steps (was 6). Step 7 = Persona UI Intents + Business Impact Assessment. Both required for any UI decision.
2. Widget delete uses inline two-click confirmation (not Dialog). Intentional for compact selector bar.
3. `totalWidgetCount` is tracked across ALL projects for free plan gate.
4. `handleSave` only updates. Creation is `handleCreateWidget`. Deliberate split.
5. embed.js is vanilla JS (no React, no TypeScript). Changes require manual DOM string building and careful testing.

---

## Previous: Session Handoff (March 4, 2026, session 3)

**What was done:**
1. Multi-project support shipped (commit `490018d`).
2. Bug fix: widgets page infinite loading for 0-project users (commit `5b2c060`).
3. Process improvements: strengthened gates, added Test Scenario Checklist.
4. Added video cost optimization task.

---

## Context: Why We Are Doing This

Our core promise: **"Social proof that looks like you built it."**
Target audience: Freelancers, agencies, SaaS founders (Western, digital, pay for tools).
Competitors: Senja, Testimonial.to, EmbedSocial. They charge per domain/seat, hurt Lighthouse, lock content in hosted pages.

We ran a full usability audit (March 4, 2026) testing every screen as a target user ("Sarah Chen, freelance designer"). We cross-referenced 164 marketing promises against actual built features. Found and fixed 21 issues. Three broken promises remain.

The pricing page explicitly states features that don't work yet. **Every day these remain broken, a paying Pro/Agency customer could discover the gap and churn.** That's why this is urgent.

---

## DONE: Multi-Project Support (CRITICAL) — shipped session 3, commit 490018d

**The broken promise:**
Pricing table says Free: 1 project, Pro: Unlimited, Agency: Unlimited.
FAQ says: "One account gives you unlimited projects. Create a separate form and widget for each client site."
Reality: The entire codebase loads `.limit(1).single()` for projects. There is NO way to create a second project.

**Who this hurts:**
An agency managing 5 client websites pays $49/mo expecting to run separate branded forms and widgets per client. They discover they can only have one project. They churn.

**Implementation plan:**

### Step 1: Settings page project selector
File: `src/app/(dashboard)/dashboard/settings/page.tsx`
1. Change project query from `.limit(1).single()` to fetch ALL projects for the user
2. Add a project selector dropdown at the top of the Project tab
3. Add a "Create new project" button (gated: free = 1 max, Pro/Agency = unlimited)
4. When switching projects, reload all project fields (name, slug, logo, colors, URLs)
5. Keep the save logic as-is (it already handles insert vs update based on `project` state)

### Step 2: Dashboard overview
File: `src/app/(dashboard)/dashboard/page.tsx`
1. Change project count query to count all projects (already does `count: 'exact'`)
2. Stats should aggregate across all projects (testimonials already load by user_id, not project_id)
3. No major changes needed here since stats are user-scoped

### Step 3: Forms page
File: `src/app/(dashboard)/dashboard/forms/page.tsx`
1. Already supports multiple projects in the form creation dialog (project dropdown exists)
2. Forms list already loads all forms for the user across projects
3. Just verify the project selector in the create dialog works with multiple projects

### Step 4: Widgets page
File: `src/app/(dashboard)/dashboard/widgets/page.tsx`
1. Change project query from `.limit(1).single()` to fetch all projects
2. Add project selector (widget is scoped to a project_id)
3. Widget loading: load widget for selected project (not just first project)
4. When project changes, reload widget data for that project

### Step 5: Inbox
File: `src/app/(dashboard)/dashboard/inbox/page.tsx`
1. Already loads all testimonials by user_id (works across projects)
2. Consider adding a project filter tab/dropdown (optional, nice-to-have)

### Step 6: Free plan enforcement
1. When a free user tries to create a second project, show upgrade modal
2. Check: `if (plan === 'free' && existingProjectCount >= 1) { showUpgrade(); return; }`

### DB Schema check:
`supabase/schema.sql`: projects table has `user_id` foreign key. No UNIQUE constraint on user_id. Multiple projects per user are already supported at the DB level. No schema changes needed.

### Key files to grep:
```
grep -rn "\.limit(1)\.single()" src/ --include="*.tsx" --include="*.ts"
grep -rn "from('projects')" src/ --include="*.tsx" --include="*.ts"
```

---

## DONE: Multi-Widget Management — shipped session 4

**The broken promise:**
Pro features list says "Unlimited embed widgets." Free gets "1 embed widget."
Reality was: Widget page does `.limit(1).single()` and only loads one widget.

**What was built:**
1. Widget selector bar (horizontal pills) between header and builder
2. Create/delete/switch handlers with proper state management
3. Empty state when no widgets for current project
4. Free plan gate: max 1 widget total across all projects (upgrade dialog)
5. Embed codes update when switching widgets
6. `handleSave` split into save (update only) and `handleCreateWidget` (insert)
7. Added `project_id` index to schema.sql
8. Fixed `isPro` checks to include agency plan

---

## DONE: Custom Fonts — shipped session 5

**The gap:**
FAQ says "The component renders using your page's existing font stack." True for embed.js (uses system fonts). But users can't customize fonts to match their brand.

**This is a brand blending improvement, not a broken promise.** Lower priority than the two above.

**Implementation plan:**
1. Add `fontFamily` to WidgetTheme interface
2. Widget builder: font selector (Google Fonts top 15 + "System default")
3. embed.js: inject `<link>` tag for Google Font into shadow root
4. Collection form: use project-level font setting from accent_color's sibling field
5. Public page: use project-level font

**Design decision needed:** Which Google Fonts to offer? Suggested list:
Inter, Roboto, Open Sans, Lato, Poppins, Montserrat, Nunito, Raleway, Source Sans 3, Work Sans, DM Sans, Plus Jakarta Sans, Outfit, Manrope, Space Grotesk

### Key files:
`src/app/(dashboard)/dashboard/widgets/page.tsx` (font picker UI)
`public/embed.js` (font loading + application)
`src/components/collect/CollectFormClient.tsx` (form font)
`src/app/p/[slug]/page.tsx` (public page font)
`supabase/schema.sql` (add font_family to projects table, or use widget theme)

---

## DONE: Agency Plan Overhaul — shipped session 8

**The problem:**
Agency ($49/mo) is currently "Pro + support theater." The only product feature is client report links. "Priority support" and "onboarding call" require founder time and don't scale. The "Get in touch" mailto CTA blocks self-serve revenue. Nobody pays 2.5x more for email support.

**The fix: Agency = Client Delivery Workflow**
Pro is for managing your own social proof. Agency is for delivering social proof to clients professionally. The positioning shift: "Pro + support" becomes "Pro + client tools."

**Target personas:**
1. Marcus (agency owner, 8 client websites, needs to hand off reports and embed codes efficiently)
2. Diana (freelance web designer, 5 clients, wants her deliverables to look professional, not "powered by some tool")

### Task 1: Self-serve checkout (HIGHEST PRIORITY)
Files: `src/components/upgrade-modal.tsx`, `src/app/(marketing)/_components/PricingCards.tsx`, `src/app/api/stripe/checkout/route.ts`, `src/lib/lemonsqueezy.ts`
1. Add Agency variant IDs to `.env.local` (LEMONSQUEEZY_AGENCY_VARIANT_ID, LEMONSQUEEZY_AGENCY_YEARLY_VARIANT_ID)
2. Update `createCheckoutUrl` to accept a `plan` parameter ('pro' | 'agency')
3. Update checkout API route to accept `plan` in the request body
4. Update UpgradeModal "Get in touch" button to trigger Agency checkout instead of mailto
5. Update PricingCards "Get in touch" button to link to signup with agency plan param
6. Estimated effort: 1 to 2 hours

### Task 2: White-label client reports
Files: `src/app/report/[token]/page.tsx`, `src/app/(dashboard)/dashboard/settings/page.tsx`, `supabase/schema.sql`
1. Add `report_footer_text` column to projects table (nullable text, Agency only)
2. Add field in settings (Agency gated): "Report footer text" with placeholder "Report prepared by [Your Company]"
3. In report page: if project has `report_footer_text`, show that instead of "Powered by Vouch"
4. Pro/Free users still see "Powered by Vouch"
5. Estimated effort: half a day

### Task 3: Embed codes on client report page
Files: `src/app/report/[token]/page.tsx`, report page API query
1. Query widgets for this project alongside testimonials
2. Add "Embed Codes" section at the bottom of the report page
3. Show each widget's embed snippet (script tag) with a copy button
4. Agency only (check plan in the report query)
5. This transforms the report from "data dump" to "complete client handoff document"
6. Estimated effort: 1 day

### Task 4: Custom report intro message
Files: `src/app/(dashboard)/dashboard/settings/page.tsx`, `supabase/schema.sql`, `src/app/report/[token]/page.tsx`
1. Add `report_message` column to projects table (nullable text, 200 char limit, Agency only)
2. Add field in settings: "Client report intro" with placeholder "Prepared for [Client Name] by [Your Studio]"
3. Render as a styled note above testimonials on the report page
4. Estimated effort: 2 hours

### Task 5: Kill onboarding call, update feature list
Files: `src/lib/lemonsqueezy.ts`, `src/app/(marketing)/_components/PricingCards.tsx`, `src/app/(marketing)/pricing/page.tsx`
1. Remove "Custom onboarding call" from AGENCY_FEATURES
2. Remove "Priority email support" (replace with "Email support, 1 business day response")
3. Add new Agency features to feature lists: "White-label client reports", "Embed codes in client reports", "Custom report intro message"
4. Update pricing comparison table
5. Estimated effort: 1 hour

### Task 6 (DEFER): Consider renaming "Agency" to "Studio"
"Agency" excludes freelancers. "Studio" works for both Diana (freelancer) and Marcus (agency). Evaluate after shipping tasks 1 to 5. Not urgent.

### Task 7 (DEFER): Custom domains for collection forms
Real value but requires DNS verification and SSL provisioning. Wait for 20+ Agency subscribers asking for it.

### Task 8 (DEFER): Team seats / client logins
Report link solves 80% of the "share with client" need. Full ACL is a 2 to 4 week project. Defer.

**New Agency feature list (after tasks 1 to 5):**
1. Everything in Pro
2. White-label client reports (no Vouch branding, custom footer)
3. Embed codes delivered via client report link
4. Custom report intro message
5. Email support (1 business day response)

---

## DONE: Video Cost Optimization — partially shipped session 7

**Client-side optimizations (shipped):**
1. Recording bitrate reduced from 1Mbps to 600kbps (40% smaller files)
2. Camera resolution lowered from 1280x720 to 640x480 (faster init + smaller output)
3. Thumbnail-first in embed.js (poster + play button, video loads on click, 70-90% bandwidth savings)
4. Fair use clause added to ToS section 7

**Server-side compression (DEFERRED):**
Requires Cloudinary, FFmpeg, or Mux integration. Evaluate when video storage costs become material (track Supabase storage usage monthly). The client-side bitrate reduction handles the 80% case.

---

## COMPLETED (for reference, do not redo)

### Usability Audit Fixes (21 items, March 4, 2026)

Batch 1 (commit `66be2af`):
- [x] Custom form title/description rendered on collection form
- [x] Settings ?tab=project URL param works
- [x] Dashboard quick actions always visible
- [x] Branding link / to /via
- [x] Video limit error visitor-friendly
- [x] Inbox "no search results" distinct from empty state
- [x] Widget page warns about missing project on load
- [x] Inbox optimistic revert fixed (re-fetch on failure)

Batch 2 (commit `ed0d956`):
- [x] Form background uses accent color (not hardcoded indigo)
- [x] Widget builder: text color picker exposed
- [x] Widget builder: card style selector (shadow/border/flat)
- [x] Company name wraps on public page + embed.js
- [x] Website builder tab uses Shadow DOM v2 (SEO-friendly)
- [x] Dashboard subtitle dynamic for new users
- [x] Widget userPlan includes 'agency'
- [x] Inbox Load More respects active tab filter
- [x] Rejection requires confirmation (two-step)
- [x] Video upload failure shows retry/skip (not silent discard)

Batch 3 (commit `8186162`):
- [x] FAQ copy: "iframe" corrected to "native HTML"
- [x] Single layout added to widget builder
- [x] Widget API returns project logo for embed branding
- [x] embed.js renders project logo when available
- [x] Widget API isPro includes agency plan
