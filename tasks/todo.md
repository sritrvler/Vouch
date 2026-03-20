## Session Handoff (March 20, 2026, session 21)

**What was done:**
1. **Fixed Lighthouse desktop regression** from 87 to 99 (mobile to 94). Dynamic-imported `@vercel/analytics/next` via a thin `'use client'` wrapper (`LazyAnalytics.tsx`) to remove ~7 KiB from the initial root layout JS chunk. Added `va.vercel-scripts.com` to CSP `script-src` for dev/preview analytics.

**What's next:** Phase 1 BUILD continues:
1. **MANUAL: Toggle `vouch-assets` bucket to public in Supabase Dashboard** (Storage > vouch-assets > Settings > Public bucket: ON).
2. Item #13e through 13h: Remaining audit Phase 1 items
3. Minimal layout (item #8 in roadmap)
4. Run editorial migration SQL on production Supabase before deploying
5. Update Lemon Squeezy dashboard: Pro variant price $19 to $29/mo
6. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to Vercel project env vars

**What to watch out for:**
1. See Persistent Watch-Outs section below for all active items.
2. Widget view counts now undercount ~5x due to 300s CDN cache (documented in code). Acceptable tradeoff.
3. After deploy, verify in DevTools: embed.js has `s-maxage=86400`, widget API has `s-maxage=300, stale-while-revalidate=60`.
4. If Lighthouse regresses again, next step is `next/script` with `lazyOnload` (requires custom SPA tracking). See plan mode transcript for details.

---

## Persistent Watch-Outs (max 10, remove when resolved or promoted to lessons.md)

1. **Lemon Squeezy price mismatch:** Code shows $29 Pro but LS checkout still charges $19. Must update LS dashboard variant prices before deploying.
2. **Upstash env vars:** Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to Vercel project settings before deploying. Without them, rate limiting silently falls back to "allow all."
3. **embed.js hardcoded 25:** Free tier display limit is hardcoded in embed.js. If PLANS.free.widgetDisplayLimit changes, must also update embed.js manually.
4. **Grandfathered users:** Existing users with >25 testimonials cannot add new ones until they upgrade or reject below 25.
5. **vouch-assets bucket:** MANUAL: Toggle vouch-assets bucket to public in Supabase Dashboard (Storage > vouch-assets > Settings > Public bucket: ON).
6. **public/test-embed.html:** Untracked in repo, delete it before deploying.
7. **hexAlpha HSL limitation:** hexAlpha does not handle HSL colors. If textColor is ever set to HSL via API, separators and badge text render at full opacity. Low risk since widget builder emits hex only.
8. **a:hover opacity scope:** `a:hover{opacity:0.8}` applies to ALL anchors in the shadow root, not just branding. Verify other anchor hover states still look correct.
9. **Editorial migration SQL:** Run editorial migration SQL on production Supabase before deploying.
10. **popLayout mode:** Exiting step overlaps entering step briefly during collection form transition. If visual glitch on slow devices, fallback is `mode="wait"` with `min-h-[280px]`.

---

# MASTER EXECUTION ROADMAP

**This is the sole execution reference. For competitive research, pricing rationale, and persona role-plays, see `tasks/strategy-research.md`.**

**How to read this:** Each phase has BUILD items (product work) and DISCOVERY items (SEO, content, pages). They run in parallel within each phase. Complete a phase before moving to the next. Infrastructure items are woven into the phase where they matter most.

**Audit report items 1 through 23:** ALL COMPLETE (sessions 10 through 11). Items 24 through 35 are integrated below. Item #30 (billing toggle) already done in session 21.
**External audit (March 8, 2026):** 127 findings triaged. 26 items integrated (13c-13h, 15a, 25e-25h, 31a-31f, 92-100). See `docs/vouch_ui_ux_audit.md` and `docs/vouch_codebase_audit.md` for full reports.

---

## PRE-LAUNCH CHECKLIST (user does these right before go-live, not now)

These are operational prerequisites. No code to write (except the Privacy Policy fix). Do them the day before sharing the product publicly.

1. [ ] Buy domain and connect to Vercel
2. [ ] Upgrade Supabase to Pro ($25/mo). Non-negotiable for reliability. (see strategy-research.md Section J1)
3. [ ] Set up real support email (hello@yourdomain.com) and update `NEXT_PUBLIC_SUPPORT_EMAIL` in Vercel.
4. [ ] Dog-food: embed Vouch widget on own landing page (even with placeholder testimonials initially).
5. [ ] Privacy Policy fix: change "Stripe" to "Lemon Squeezy," remove Clearbit reference, add correct data processor info. (see strategy-research.md Deferred: Legal Review)
6. [ ] Verify "Powered by Vouch" link works (currently goes to `/?ref=powered-by`, landing page does nothing with it). Minimum: confirm it doesn't 404.

---

## PHASE 1: PRODUCT DIFFERENTIATION (the thing worth talking about)

**Goal:** Ship the premium widget layouts that justify $29/mo pricing. Without these, we're just another testimonial tool. This is the screenshot, the Product Hunt hero image, the thing that makes someone say "that looks different."

**Exit criteria:** Editorial and Minimal layouts live, existing layouts upgraded, free tier capped at 25, price changed to $29, pricing surfaces consistent (13c), rate limiting functional (13d), avatar storage migrated (13e).

### Phase 1 BUILD

7. [x] **Editorial layout** (D1). DONE (session March 8). Full-width, magazine-style, one testimonial at a time, large pull-quote with golden sentence, large author photo, company logo. NO competitor has this.
8. [ ] **Minimal layout** (D2). The anti-widget. Quote and attribution only. No stars, borders, shadows, card background. Inherits host site typography. PRIORITY: HIGH. (see strategy-research.md Section D2 for design spec)
9. [x] **Upgrade existing layouts** (D4). DONE session 8. textSize theme (compact/default/large), whitespace increase (24px padding, 20px gaps), carousel fade-in (200ms), showMetric toggle, video play button redesign (rounded rect + blur), new widget defaults (showDate=false, showMetric=false).
10. [x] **Cap free tier at 25 testimonials** (B1, revised). DONE session 9.
11. [ ] **Reprice to $29/mo Pro, $49/mo Studio** (B4). Update Lemon Squeezy variants, pricing page, upgrade modals, all hardcoded price references. Do this AFTER Editorial + Minimal ship (they justify the price). PRIORITY: HIGH. (see strategy-research.md Section B4 for pricing rationale and persona validation)
12. [ ] **Embed.js version hash** (J2.1). Add version parameter to embed code: `embed.js?v=2.1.0`. Bump manually on breaking changes. PRIORITY: HIGH.
13. [ ] **Pre-deployment embed.js testing** (J2.3). Before any deploy touching embed.js, test on own landing page with a real widget. Manual for now. PRIORITY: HIGH.
13a. [ ] **"Powered by Vouch" badge optimization** (moved from Phase 5, item #69-70). The badge IS the growth engine for freemium. Ensure badge is visible, clickable, and styled well on all free-tier widgets. The landing page (`/?ref=powered-by`) must convert visitors, not just redirect. Show targeted hero: "You just saw social proof powered by Vouch. Create yours in 5 minutes." Track badge click-throughs in Supabase. PRIORITY: HIGH.
13b. [ ] **"Powered by Vouch" conversion page** (moved from Phase 5, item #71). The /via page should be a real conversion funnel, not a redirect. Show the widget they just saw, explain what Vouch does, CTA to sign up free. PRIORITY: HIGH.
13c. [ ] **Fix pricing inconsistencies across all surfaces** (audit UX P1, UX U1, codebase SC10/SC11). Three things must match: (1) Pricing page: free = 25 testimonials displayed (Typeform model: unlimited collection, 25 display), Pro = unlimited, (2) Upgrade modal: $29 Pro / $49 Studio (update from $19), (3) Code: PLANS object in lemonsqueezy.ts must reflect actual limits. Also update any hardcoded "$19" references. PRIORITY: CRITICAL. (see strategy-research.md Section B4 for complete pricing table)
13d. [ ] **Replace in-memory rate limiter with Upstash Redis** (audit codebase D1). Current rate limiter resets on every Vercel function invocation (useless in serverless). Use Upstash Redis free tier (10K requests/day) or Vercel KV. Apply to: submit, upload-video, upload-logo, OG card generation. PRIORITY: CRITICAL.
13e. [ ] **Move avatar storage from base64 DB columns to Supabase Storage** (audit codebase S23/P9). Currently 500KB avatars stored as ~700KB base64 in Postgres rows. At 50 testimonials, widget API returns 35MB+ of avatar data. Migration: upload existing base64 to Storage bucket, update column to URL, change submit route to upload to Storage. PRIORITY: HIGH.
13f. [ ] **Fix submit route admin API call** (audit codebase Q6). The submit route calls supabase.auth.admin.getUserById() using anon-key server client. This silently fails (no email notifications sent). Must use admin client (service role key). PRIORITY: HIGH.
13g. [ ] **Add rate limiting to logo upload and OG card routes** (audit codebase S3/S4). OG card route (/api/testimonials/card/[id]) runs ImageResponse on Edge, expensive and unprotected. Logo upload has no rate limit. Both are DDoS vectors. PRIORITY: HIGH.
13h. [ ] **Add runtime env var checks** (audit codebase Q9). Replace non-null assertions (!) on env vars with explicit runtime checks that fail fast with clear error messages. Critical paths: webhook secret, checkout URLs, Supabase keys. PRIORITY: MEDIUM.

### Phase 1 DISCOVERY (run in parallel with build)

14. [ ] **Widget Showcase page** at `/showcase` (H1.1). Live interactive demos of every layout (Editorial, Minimal, grid, carousel, wall, list, single). Visitors can toggle between layouts, switch light/dark, see the same testimonials rendered differently. This IS the sales pitch. PRIORITY: HIGHEST.
15. [ ] **Live widget demo on landing page** (H3.1). Embed our own widget (Editorial layout) on the landing page between features and pricing. Live, interactive, not a screenshot. PRIORITY: HIGHEST.
15a. [ ] **Widget layout preview thumbnails in builder** (audit UX W4). When hovering or selecting a layout in the widget builder, show a wireframe/thumbnail preview of what that layout looks like. Our layouts are better than competitors, show them. PRIORITY: HIGH.
16. [ ] **Widget builder education messaging** (L8.6). In the dashboard widget customization panel, add subtle copy: "Matching your site's fonts and colors increases engagement by 53% (NN/g research)." PRIORITY: MEDIUM.

---

## PHASE 2: ACTIVATION INFRASTRUCTURE (make sure signups stick)

**Goal:** Every signup reaches the "aha moment" (widget embedded on their site, looking great). Without this, Phase 1's beautiful widgets are wasted because users churn before seeing them.

**Exit criteria:** Onboarding checklist live, embed guides in widget builder, welcome emails sending, help tooltips on key features, support links visible.

### Phase 2 BUILD

17. [ ] **Post-signup activation checklist** (I1.1). 4-step checklist visible in dashboard: create form, collect testimonial, create widget, embed on site. Auto-completes when action taken. Progress bar. Celebration on completion. PRIORITY: HIGH.
18. [ ] **Platform-specific embed instructions** (I2.1). Dropdown in widget builder after copying embed code: "Where is your site hosted?" Options: Webflow, Framer, WordPress, Squarespace, Wix, Lovable, Bolt, Next.js, HTML, Other. 2-3 step instructions per platform. PRIORITY: HIGH.
19. [ ] **Inline help tooltips** (I3.1). Small (?) icons next to non-obvious features: Golden Sentence, Verified badge, layout options, theme settings. Expand to explain. PRIORITY: HIGH.
20. [ ] **Welcome email sequence** (I1.2, audit #24). 3 emails over 7 days via Resend: (1) welcome + first step, (2) client ask template, (3) widget nudge or Pro showcase. Trigger based on user state. PRIORITY: HIGH.
21. [ ] **Visible support link in dashboard** (J4.2). "Need help?" in sidebar footer, links to mailto. PRIORITY: HIGH.
22. [ ] **Support/contact link in marketing footer** (J4.3). Add "Contact" or "Support" to footer alongside Pricing, Terms, Privacy. PRIORITY: HIGH.
23. [ ] **Enhance credibility signals** (L8.2). Verification badges, golden sentence, star ratings, real photos. These are the sweet spot differentiator per research. Ongoing quality investment. PRIORITY: MEDIUM.
24. [ ] **Sidebar active state indicator** (audit #29). Left-border accent on active nav item. PRIORITY: MEDIUM.
25. [ ] **FAQ accordion animation** (audit #28). Replace native details with Framer Motion accordion on pricing page FAQ. PRIORITY: MEDIUM.
25a. [ ] **Slack/email notifications for new testimonials** (new, March 8). When a testimonial is submitted: (1) email notification via Resend to the project owner, (2) optional Slack webhook integration (user pastes their Slack webhook URL in settings). The dopamine hit of "New 5-star testimonial from Sarah Chen!" keeps users engaged and reinforces the tool is working. High-impact retention feature, low effort (Resend already integrated, Slack webhook is ~50 lines). PRIORITY: HIGH.
25b. [ ] **Negative feedback routing on collection form** (new, March 8, 80/20 principle). This is the ONE smart form feature that covers 80% of Senja's 10-page form builder value. When a submitter gives 1-3 stars: route to a "What could we improve?" private feedback page (not published as a testimonial). When 4-5 stars: proceed to the public testimonial submission. This prevents bad reviews from becoming public testimonials while still collecting valuable feedback. Senja's biggest form advantage distilled to its core. PRIORITY: HIGH.
25c. [ ] **Marquee/ticker layout** (new, March 8, 80/20 widget research). Auto-scrolling horizontal strip of testimonial cards. Popular on SaaS landing pages for continuous social proof. ~15-20 lines of CSS+JS in embed.js. Low effort, high perceived variety. PRIORITY: MEDIUM.
25d. [ ] **Rating badge widget** (new, March 8, 80/20 widget research). Compact "4.9 from X reviews" badge, designed to be placed near CTAs. Research shows testimonials near CTAs increase conversions by 62%. ~50 lines of code. PRIORITY: MEDIUM.
25e. [ ] **Collection form success celebration** (audit UX F14). Add confetti (canvas-confetti, ~3kb) + "Thank you, [firstName]!" with star rating shown. Prominently surface ShareElsewhere with animated entrance. This is the virality moment. PRIORITY: HIGH.
25f. [ ] **Sidebar upgrade CTA redesign** (audit UX N2). Replace plain text "Upgrade" link with mini-card: gradient background, sparkle icon, "Upgrade to Pro, Unlock all layouts". Subtle pulse animation. Primary monetization surface. PRIORITY: HIGH.
25g. [ ] **Golden sentence onboarding tooltip** (audit UX I5). First-time explainer when user encounters golden sentence: "Highlight the most impactful sentence. It'll stand out in your widget." Our differentiator needs discovery. PRIORITY: MEDIUM.
25h. [ ] **Widget builder polish batch** (audit UX W6/W7/W10/F2/F17). Group of small polish items: (1) Replace native color pickers with react-colorful popover (~3kb), (2) Font selector renders each name in its own typeface, (3) Add GripVertical drag handles on reorder list, (4) Read-only project field gets muted styling, (5) Color presets surfaced more prominently in settings. PRIORITY: MEDIUM.

### Phase 2 INFRASTRUCTURE (weave in during build)

26. [ ] **Sentry or equivalent monitoring** (audit #35). First crash signal before user complaints. PRIORITY: HIGH.
27. [ ] **Error Boundaries for dashboard** (audit #31). Add error.tsx to every dashboard route segment. PRIORITY: MEDIUM.
28. [ ] **Centralize auth + subscription from context** (audit #32). Remove 12 redundant getUser() calls, 4 redundant subscription fetches. PRIORITY: MEDIUM.
29. [ ] **Webhook idempotency** (audit #33). Store processed event IDs to prevent duplicate processing. PRIORITY: MEDIUM.
30. [ ] **CDN for embed.js** (J2.2). Serve through CDN with proper cache headers. Cache-Control: public, max-age=86400, s-maxage=604800. PRIORITY: MEDIUM.
31. [ ] **Supabase database backups** (J1.2). Set up and test a restore on Pro plan. PRIORITY: HIGH.
31a. [ ] **Export RLS policies to version control** (audit codebase S12). Run supabase db dump or manually export all RLS policies. Store in supabase/policies/. If project is deleted, policies are unrecoverable without this. PRIORITY: HIGH.
31b. [ ] **Create .env.example** (audit codebase SC9/D2). Document all 16+ required env vars with descriptions. New contributor setup guide. PRIORITY: MEDIUM.
31c. [ ] **Database migration files** (audit codebase SC1/D4). Set up supabase/migrations/ directory. Export current schema. All future changes via migration files. PRIORITY: MEDIUM.
31d. [ ] **Minify embed.js for production** (audit codebase P3). Currently 50KB unminified vanilla JS served from /public, bypasses Next.js bundling. Add build step or manual minification. PRIORITY: MEDIUM.
31e. [ ] **Fix admin lookup to use server-side filter** (audit codebase S6/SC2). Replace listUsers({perPage: 1000}) + client-side find() with Supabase admin API email filter. Will timeout at 10K+ users. PRIORITY: MEDIUM.
31f. [ ] **Deduplicate sanitization functions** (audit codebase S26/Q15/Q16). Font sanitization exists in both lib/fonts.ts and embed.js. htmlEscape in 3 files. Single source of truth where possible (embed.js needs its own copy but should be synced). PRIORITY: LOW.

### Phase 2 DISCOVERY (run in parallel)

32. [ ] **"Why Vouch" page** at `/why-vouch` (H1.2). Shadow DOM vs iframe advantage, golden sentence, verification, premium layouts. Target: "best testimonial tool" searches. Include spectrum research. PRIORITY: HIGH.
33. [ ] **Collect real testimonials** (J3.1). Send collection form to beta users (even 3-5 people). Real submitted testimonials through our real form. PRIORITY: HIGH.
34. [ ] **Embed Vouch widget on landing page** (J3.2). Use Editorial layout to display real testimonials. Triple duty: social proof, live demo, dog-fooding proof. PRIORITY: HIGH.

---

## PHASE 3: MIGRATION AND COMPARISON (bring in competitors' users)

**Goal:** Make switching to Vouch frictionless. Give comparison shoppers the content they need to choose us. SEO pages start ranking (takes 2-3 months).

**Exit criteria:** CSV import working, competitor import working, 5 comparison pages live, bottom-of-funnel blog content published, design spectrum guide published.

### Phase 3 BUILD

35. [ ] **CSV/JSON import with smart field mapping** (F1). Upload CSV, auto-detect columns (name, email, company, quote, rating, date), preview mapped data, import. Support Senja/Testimonial.to export formats natively. PRIORITY: HIGHEST. (see strategy-research.md Section F for full migration strategy)
36. [ ] **One-click import from competitor Wall of Love URLs** (F2). Paste a Senja or Testimonial.to public wall URL, scrape testimonials, import into Vouch. The magic trick that eliminates migration effort. PRIORITY: HIGH.
37. [ ] **Competitor-specific migration guides** (F3). Step-by-step "How to switch from Senja to Vouch" pages at `/migrate/senja`, `/migrate/testimonial-to`, etc. Include export instructions for each competitor + import into Vouch. PRIORITY: HIGH.
38. [ ] **Extract shared types** (audit #34). Single Project interface, Widget interface, etc. in src/types/. PRIORITY: MEDIUM.
38a. [ ] **Zapier integration** (new, March 8, 80/20 integration strategy). ONE integration that covers 80%+ of automation needs. Users build their own connections to Slack, HubSpot, Stripe, email, etc. Triggers: new testimonial submitted, testimonial approved, testimonial rejected. Actions: create testimonial (for import). This single integration replaces the need for 21 native import sources and 15 trigger integrations. Senja built all of those. We build Zapier and let users connect to everything themselves. PRIORITY: HIGH.

### Phase 3 DISCOVERY (run in parallel)

39. [ ] **Comparison page: Vouch vs Senja** at `/compare/senja` (H1.3). **MESSAGING:** Do NOT lead with feature count (we lose). Lead with: (1) visual widget comparison, (2) simplicity ("Set up in 5 minutes, not 50"), (3) output quality, (4) honest acknowledgment. Include pricing comparison and migration CTA. PRIORITY: HIGH. (see strategy-research.md Section B4 for competitive positioning data and feature gap analysis)
40. [ ] **Comparison page: Vouch vs Testimonial.to** at `/compare/testimonial-to` (H1.3). Same format. Highlight their $21 Starter Plus tier limitations (2 video total, no API, no Zapier). PRIORITY: HIGH. (see strategy-research.md Section B4 for Testimonial.to exact limitations)
41. [ ] **Comparison page: Vouch vs Famewall** at `/compare/famewall` (H1.3). Position against budget option. Our premium quality vs their low price. PRIORITY: HIGH.
42. [ ] **Comparison page: Vouch vs Shapo** at `/compare/shapo` (H1.3). Same format. PRIORITY: MEDIUM.
43. [ ] **Comparison page: Vouch vs Endorsal** at `/compare/endorsal` (H1.3). Same format. PRIORITY: MEDIUM.
44. [ ] **Blog: "Senja vs Testimonial.to vs Vouch: Which testimonial tool is right for you?"** (H2.1). Bottom-of-funnel comparison content. Feature matrix, pricing, visual quality comparison. PRIORITY: HIGH.
45. [ ] **Blog: "Best testimonial tools for [niche] in 2026"** (H2.1). Bottom-of-funnel. Insert Vouch naturally. PRIORITY: HIGH.
46. [ ] **Blog: "How to migrate your testimonials from [Competitor] (step-by-step)"** (H2.1). Bottom-of-funnel, targets "[competitor] alternative" searches. PRIORITY: HIGH.
47. [ ] **Blog: "Free vs paid testimonial tools: when to upgrade"** (H2.1). Bottom-of-funnel, targets price-sensitive searchers. PRIORITY: HIGH.
48. [ ] **"Testimonial Design Spectrum" guide page** at `/blog/testimonial-design-guide` (L7). Research-backed guide: banner blindness, native vs distinct, sweet spot model. Positions Vouch as thought leader. PRIORITY: HIGH. (see strategy-research.md Section L for full research)
49. [ ] **Use spectrum research in comparison pages** (L8.5). Cite iframe limitation and Shadow DOM advantage on each /compare page. Frame as education. PRIORITY: MEDIUM.

---

## PHASE 4: TRUST MOAT AND CONTENT (build long-term defensibility)

**Goal:** Verification system makes Vouch testimonials inherently more trustworthy than competitors'. Content engine starts generating inbound traffic. Video layout serves video-heavy users.

**Exit criteria:** Verification tiers live, Verified by Vouch page live, FTC compliance content published, mid-funnel blog content live, Cinematic Video layout shipped, social proof on landing page (now have real users).

### Phase 4 BUILD

50. [ ] **Verification tiers** (G1). Display on widget: email verified (confirmed professional email), domain verified (company domain matches), source verified (collected through Vouch form vs imported). Visual badges in widget. PRIORITY: HIGH. (see strategy-research.md Section G for full verification strategy)
51. [ ] **"Verified by Vouch" public trust page** at `/verified` (G2). Searchable directory of verified testimonials. Any visitor can check if a specific testimonial is real. Like a certificate lookup. PRIORITY: MEDIUM.
52. [ ] **FTC compliance as a feature** (G3). Educational content + built-in disclosure tools. Blog post: "Fake Testimonials Are Illegal (and Your Customers Can Tell)." Dashboard: easy FTC disclosure toggle for widgets. PRIORITY: MEDIUM.
53. [ ] **Cinematic Video layout** (D3). Hero-sized video panels (16:9, 400px+ tall), face-forward poster, quote overlay, hover auto-play muted 3-5 sec preview, click for full playback. Intersection Observer for hover. PRIORITY: MEDIUM. (see strategy-research.md Section D3 for design spec)
54. [ ] **AI golden sentence auto-extraction** (audit #27). LLM call on testimonial submit to auto-populate golden_sentence field. User can edit/override. PRIORITY: MEDIUM.
54a. [ ] **Business Insights dashboard** (new, March 8). Aggregate intelligence from collected testimonials. Pro/Studio exclusive. Features: (1) Common themes extraction, (2) Sentiment trends over time, (3) Weak spots identification, (4) Actionable nudges, (5) Benchmark comparison. Requires 15-20+ testimonials to be meaningful. Creates retention value. Requires LLM call per testimonial (cost consideration). PRIORITY: MEDIUM.

### Phase 4 DISCOVERY (run in parallel)

55. [ ] **Social proof on landing page** (H3.2, audit #25). Add real user testimonials (from Phase 2-3 beta users). Use own widget. Even "trusted by 10 early adopters" with real names beats nothing. PRIORITY: HIGH.
56. [ ] **Blog: "Why Nobody Trusts Your New Product (and How to Fix It)"** (G2.1). Mid-funnel. Targets founders struggling with credibility. PRIORITY: HIGH.
57. [ ] **Blog: "The First-Time Founder's Guide to Social Proof"** (G2.2). Mid-funnel. Step-by-step for founders who don't know where to start. PRIORITY: HIGH.
58. [ ] **Blog: "How to Make Your Product Stand Out When Everyone Can Build One"** (G2.3). Mid-funnel. AI era positioning. PRIORITY: HIGH.
59. [ ] **Blog: "Fake Testimonials Are Illegal (and Your Customers Can Tell)"** (G2.4). Mid-funnel. FTC compliance education. Links to verification feature. PRIORITY: MEDIUM.
60. [ ] **Use-case pages** at `/for/[segment]` (H1.4). After niche is chosen (B2): `/for/webflow-agencies`, `/for/coaches`, `/for/saas-founders`, etc. Tailored messaging per segment. PRIORITY: MEDIUM.

---

## PHASE 5: RETENTION AND GROWTH (keep users paying, scale distribution)

**Goal:** Prove value to paying users (analytics), re-engage inactive users (digests), expand import sources, scale with referral/affiliate programs.

**Exit criteria:** Widget analytics live, weekly digest sending, social imports working, FAQ/docs page live, referral program active, affiliate program set up.

### Phase 5 BUILD

61. [ ] **Basic widget view tracking** (I4.1). Lightweight beacon from embed.js on render: POST /api/widgets/[id]/view. Count per widget per day. Dashboard: "Your widgets were viewed X times in 30 days" with sparkline. No cookies, no PII, GDPR-safe. PRIORITY: MEDIUM.
62. [ ] **Weekly digest email** (I4.2). "This week: X widget views, Y new testimonials, top performer." Only for users with activity. Reduces churn by proving value. PRIORITY: MEDIUM.
63. [ ] **Social platform imports** (F5, audit #26). Google Reviews, X, LinkedIn. Start with Google Reviews (biggest competitive gap). PRIORITY: MEDIUM.
64. [ ] **FAQ/docs page** at `/help` or `/docs` (I3.2). Top 10 questions every testimonial tool gets asked. Start lean, add based on real support inquiries. PRIORITY: MEDIUM.
65. [ ] **Dedicated `/docs/embed` page** (I2.2). Full platform guides with screenshots and troubleshooting. SEO target: "how to add testimonials to Webflow" etc. PRIORITY: MEDIUM.
66. [ ] **Referral link generation in dashboard** (K1.1). Unique link per user. PRIORITY: LOWER.
67. [ ] **Referral tracking** (K1.2). Link click, signup, conversion tracking. PRIORITY: LOWER.
68. [ ] **Free month credit on referral** (K1.3). Both referrer and new user get one month free on paid conversion. Cap 12/year. PRIORITY: LOWER.
69. [MOVED] **"Powered by Vouch" click tracking** >> moved to Phase 1 item #13a (March 8, freemium growth strategy).
70. [MOVED] **Optimize landing page for badge visitors** >> moved to Phase 1 item #13a (March 8, freemium growth strategy).
71. [MOVED] **"Powered by Vouch" conversion page** >> moved to Phase 1 item #13b (March 8, freemium growth strategy).

### Phase 5 DISCOVERY (run in parallel)

72. [ ] **Blog: "How [Niche] Founders Use Testimonials to Convert"** (G2.5). Series, after niche chosen. PRIORITY: LOWER.
73. [ ] **Top-of-funnel blog content** (H2.3). Adjacent topics: "building trust online," "social proof psychology," etc. Only after bottom and mid-funnel content exists. PRIORITY: LOW.
74. [ ] **Set up FirstPromoter or equivalent** (K2.1). Affiliate program: 30% recurring commission. PRIORITY: LOWER.
75. [ ] **Create `/affiliates` page** (K2.2). Program details, commission structure, restrictions. PRIORITY: LOWER.
76. [ ] **Prepare affiliate marketing kit** (K2.3). Logos, screenshots, suggested copy for affiliates. PRIORITY: LOWER.

---

## STRATEGIC DECISIONS (ongoing, not phase-bound)

These are decisions that inform execution across phases. Revisit periodically. (see strategy-research.md Sections B2, B3 for detailed rationale)

77. [ ] **Pick and own a niche** (B2). Candidates: Webflow agencies/freelancers, online coaches/course creators, SaaS founders on Indie Hackers/X. Talk to 5 people in each before committing. Affects: use-case pages, embed guides, messaging, integrations.
78. [ ] **Distribution strategy** (B3). Pick 2 channels, do them well: Product Hunt launch (after Phase 2), SEO comparison pages (Phase 3), build in public on X (ongoing), platform-specific integration (after niche chosen).
79. [ ] **Competitor workflow audit** (H4). User task: create free accounts on Senja, Testimonial.to, Famewall, Shapo. Go through full flow. Note friction points, UX wins, visual quality. Informs comparison pages and product improvements.

---

## LAUNCH SEQUENCE (aligned with phases)

80. [ ] **Pre-launch (during Phase 1):** Domain, Supabase Pro, support email, dog-food, Editorial + Minimal, free tier cap. See Pre-Launch Checklist above.
81. [ ] **Soft launch (end of Phase 1 / start of Phase 2):** Share on X, Indie Hackers, relevant communities. NOT Product Hunt yet. Goal: 10-20 signups, 3-5 active users. Ask every user for feedback.
82. [ ] **Product Hunt launch (after Phase 2):** Onboarding solid, embed guides exist, landing page has real testimonials. Hero asset: side-by-side competitor widget vs Vouch Editorial. Can drive 500-2,000 visits.
83. [ ] **Post-launch growth (Phase 3+):** Comparison pages ranking, migration tools live, "Powered by Vouch" generating organic clicks, build in public on X.

---

## DEFERRED (Phase 5+ or post-validation)

84. [ ] **"We'll do it for you" concierge migration** (F4). Offer to manually import for high-value prospects. Low priority until there's demand.
85. [ ] **Client-side caching with React Query / SWR.** Every dashboard page hits Supabase directly. Add stale-while-revalidate. After paying customers or Supabase Pro. Not blocking launch. (see strategy-research.md Deferred: Client-Side Caching for scope)
86. [ ] **Full legal review** (T&C + Privacy Policy). GDPR section, CCPA section, children's privacy, governing law, indemnification. (see strategy-research.md Deferred: Legal Review for full list of 11 known issues)
87. [ ] **Rename Agency to Studio in all UI.** Deferred from session 8.
88. [ ] **Custom domains for public pages.** Deferred feature.
89. [ ] **Team seats.** Deferred feature.
90. [ ] **"Powered by Vouch" badge strategy refinement** (H3.3). Ongoing optimization of badge visibility, placement, and growth loop.
91. [ ] **Dark mode / theme-awareness auto-detection** (C6). Auto-detect host page background/text color. Shadow DOM advantage. Lower priority until core layouts ship.
92. [ ] **Login page left panel contrast fix** (audit UX A1). Increase text opacity, add text-shadow.
93. [ ] **Server components migration** (audit codebase P5/P6/A5/A9). Convert dashboard from full client-side to server components + Suspense streaming. Massive refactor (T4). Post-launch, when performance matters.
94. [ ] **Client-side caching** (audit codebase P15/A11). SWR or React Query. Already covered by item #85 but cross-referenced here for audit traceability.
95. [ ] **Component decomposition** (audit codebase 3.1). Break 6 monolith files (1000+ lines each) into focused components. When it causes real development friction, not before.
96. [ ] **Structured logging** (audit codebase SC17). Request IDs, user correlation, structured JSON. After Sentry is in place.
97. [ ] **API route integration tests** (audit codebase T1/T2). Test submit endpoint edge cases. After API surface stabilizes.
98. [ ] **Accessibility pass** (audit UX AC1-AC4). Star rating keyboard nav, color contrast audit, ARIA landmarks, toast announcements. Important, schedule dedicated session.
99. [ ] **Widget dark mode preview toggle** (audit UX W8). Light/dark background switch in preview panel.
100. [ ] **Image optimization on upload** (audit codebase P10). Resize/compress logos and avatars on upload.

---

For competitive research, pricing rationale, and persona role-plays, see `tasks/strategy-research.md`.
