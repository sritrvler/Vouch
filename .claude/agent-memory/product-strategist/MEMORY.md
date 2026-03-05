# Product Strategist Memory: Vouch

## Last Audit: March 5, 2026 (Session 8 state)

### CRITICAL Broken Promise Found
`/api/testimonials/card/[id]` does not exist. The CardDialog in inbox/page.tsx calls this route to render and download a testimonial image card (PNG). The route is not in the API directory. This is a dead feature on the Pro plan that will 404 for every paying user who clicks "Share Card."

### Verified Broken Promises (at audit time)
1. "Image cards for social sharing" (Pro) -- API route /api/testimonials/card/[id] missing. CRITICAL.
2. Custom slug gating -- settings/page.tsx line 384 checks `subscription?.plan === 'pro'` only. Agency users cannot set a custom slug despite it being listed as an Agency feature. HIGH.
3. Disposable email blocking is commented out in signup/page.tsx. Go-live blocker documented in todo.md.
4. Supabase email confirmation is off per go-live checklist.

### Verified Working Features (at audit time)
- Multi-project: fully implemented
- Multi-widget: fully implemented
- Google Review + LinkedIn nudge: implemented in CollectFormClient.tsx (gated by project.google_review_url existence)
- CSV export: implemented client-side in inbox page
- Form cloning (duplicate): implemented in forms page, isPro gated
- Custom fonts: fully implemented (session 5)
- White-label reports: implemented (session 8)
- Embed codes in reports: implemented (session 8)
- Custom report intro: implemented (session 8)
- React component embed: implemented as copy-paste snippet (NOT an npm package)
- Video testimonials: implemented, 3 per project free, unlimited Pro
- Public page /p/[slug]: implemented

### Competitive Position (assessed March 2026)
- $19/mo Pro is underpriced vs Senja ($29/mo). Room to raise OR use as acquisition weapon.
- $49/mo Agency is thin on product differentiation vs Pro. Client reports are the only real delta.
- Free tier with unlimited testimonials is genuinely differentiated. Competitors cap at 10-50.

### Key Strategic Risks
- "Image cards" is the most visible Pro feature and it 404s. First Pro user to click it loses trust.
- Agency plan has only 4 real product features over Pro. At 2.5x price, this is thin.
- No onboarding email sequence. Time-to-value depends entirely on the in-app checklist.
- React component is a copy-paste snippet, not an npm package. Marketing says "React component embed" which is accurate but may disappoint developers expecting a package.

### Architecture Notes
- API routes live in src/app/api/ -- no /testimonials/card/ subdirectory exists
- embed.js is v2 Shadow DOM (SEO-friendly). widget.js is v1 iframe (legacy, not shown in dashboard)
- Plans defined in src/lib/lemonsqueezy.ts PLANS object -- single source of truth
- Agency features: AGENCY_FEATURES exported from lemonsqueezy.ts, imported everywhere
