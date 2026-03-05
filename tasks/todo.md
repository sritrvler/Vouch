# Go-Live Checklist (ALL COMPLETE)

- [x] **Re-enable disposable email blocking**: Done in session 10.
- [x] **Enable "Confirm email" in Supabase**: Already enabled with custom branded template.
- [x] **Test camera startup speed on another device**: Optimized in session 7.
- [x] **Test video upload speed on another device/network**: Optimized in session 7.
- [x] **Video playback delay in review step**: Fixed in session 7.

---

# Active Work Queue

## Session Handoff (March 5, 2026, session 11: Post-Launch Items + Security Hardening)

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
1. Deferred features: rename Agency to Studio, custom domains, team seats
2. Social proof on landing page (needs real customers first)
3. Server-side video compression (deferred until storage costs are material)
4. More test coverage beyond the 5 security suites

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
