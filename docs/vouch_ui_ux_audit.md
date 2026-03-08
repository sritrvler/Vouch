# Vouch UI/UX Comprehensive Audit Report

**Auditor:** AI UI/UX Expert • **Date:** March 8, 2026
**Scope:** Full application audit — code + live visual inspection at `localhost:3000`
**Credential used:** `test3@yopmail.com`

---

## Executive Summary

Vouch is in **solid shape for an early-stage product**. The design system is intentional (oklch indigo palette, Inter font, shadcn/ui), and the overall consistency across pages is above average for a solo-founder SaaS. However, the product aspires to be a *premium design tool used by design-conscious users* — and at that bar, there are meaningful gaps between **current quality** and **premium expectations**.

The biggest opportunities sit in three areas:
1. **Forms & Modals** — functional but feel like generic shadcn defaults, not Vouch-quality
2. **Widget Builder** — the core money-maker needs significantly more visual polish in its configuration panel
3. **Micro-interactions & Polish** — the "last 20%" that separates "clean" from "premium"

> [!IMPORTANT]
> This audit contains **no code changes** — only findings and recommendations for your developer.

---

## Screenshots Captured

````carousel
![Landing Page](C:\Users\Srinath\.gemini\antigravity\brain\af1d03d9-a344-49a0-bcfc-f93d8b638275\landing_page_1772971676710.png)
<!-- slide -->
![Login Page](C:\Users\Srinath\.gemini\antigravity\brain\af1d03d9-a344-49a0-bcfc-f93d8b638275\login_page_audit_1772972327494.png)
<!-- slide -->
![Dashboard Overview](C:\Users\Srinath\.gemini\antigravity\brain\af1d03d9-a344-49a0-bcfc-f93d8b638275\dashboard_overview_1772971769006.png)
<!-- slide -->
![Forms Page](C:\Users\Srinath\.gemini\antigravity\brain\af1d03d9-a344-49a0-bcfc-f93d8b638275\dashboard_forms_page_1772971856856.png)
<!-- slide -->
![Create Form Dialog](C:\Users\Srinath\.gemini\antigravity\brain\af1d03d9-a344-49a0-bcfc-f93d8b638275\create_form_modal_1772972130479.png)
<!-- slide -->
![Widget Builder](C:\Users\Srinath\.gemini\antigravity\brain\af1d03d9-a344-49a0-bcfc-f93d8b638275\dashboard_widgets_page_1772971938964.png)
<!-- slide -->
![Inbox](C:\Users\Srinath\.gemini\antigravity\brain\af1d03d9-a344-49a0-bcfc-f93d8b638275\dashboard_inbox_page_1772971956164.png)
<!-- slide -->
![Settings](C:\Users\Srinath\.gemini\antigravity\brain\af1d03d9-a344-49a0-bcfc-f93d8b638275\dashboard_settings_page_1772971974689.png)
<!-- slide -->
![Pricing](C:\Users\Srinath\.gemini\antigravity\brain\af1d03d9-a344-49a0-bcfc-f93d8b638275\pricing_page_top_audit_1772972392181.png)
````

---

## 1. FORMS — Deep Audit (Highest Priority)

### 1.1 Create Collection Form Dialog

![Create Form Modal](C:\Users\Srinath\.gemini\antigravity\brain\af1d03d9-a344-49a0-bcfc-f93d8b638275\create_form_modal_1772972130479.png)

#### What's Good
- Clean field labeling and placeholder text
- Character counter on the testimonial prompt (34/200) — nice touch
- "Additional Questions" with 0/3 counter is helpful

#### Issues Found

| # | Finding | Severity | Recommendation |
|---|---------|----------|----------------|
| F1 | **The modal has no title differentiation** — "Create Collection Form" uses the same font weight/size as a generic dialog. For your core creation flow, it should feel more special. | Medium | Add a gradient accent bar or icon at the top. Consider a 2-step wizard with a visual progress indicator instead of a long single scroll. |
| F2 | **Read-only "Project" field looks editable** — identical styling to other inputs. Users will try to click it. | High | Use a clearly different visual treatment: muted background, no border focus state, or replace with a static text label + project badge. |
| F3 | **No form preview before creation** — the "Preview" section is cut off at the bottom of the dialog on standard viewports (1366×768). | High | Move the preview to a **side panel** (dialog → side-by-side layout at `max-w-4xl`) so users can see the form preview while editing fields. The collection form is visually beautiful — show it off during creation! |
| F4 | **Dialog is a single vertically scrolling form** — feels like a settings page, not a creation experience. | Medium | Break into 2–3 steps: (1) Title & Prompt, (2) Customize Questions, (3) Preview & Create. Use Framer Motion slide transitions (you already have them in `CollectFormClient`). |
| F5 | **No visual hint about what the form will look like** — new users have no idea what the submitter will see. | High | Add a small thumbnail/illustration showing the branded collection form experience next to the creation dialog. |
| F6 | **Input focus rings are system-default indigo** — they work but feel generic. | Low | Add a subtle `box-shadow` transition on focus: `0 0 0 3px rgba(99, 102, 241, 0.15)` for a softer, more premium feel. |

### 1.2 Public Collection Form (`CollectFormClient.tsx` — 1468 lines)

This is the **#1 most important UI in the product**. It's what clients see when giving testimonials.

#### What's Good
- Multi-step wizard with Framer Motion slide transitions ✓
- Star rating with hover animations ✓
- Brand color theming (buttonColor, formBgColor, textColor, inputColor) ✓
- Video recording with thumbnail picker ✓
- Progress dots, business header, share-elsewhere nudge ✓

#### Issues Found

| # | Finding | Severity | Recommendation |
|---|---------|----------|----------------|
| F7 | **The form card uses `rounded-3xl shadow-xl`** — good, but the outer background is a flat `linear-gradient(to bottom right, ...)` that ends in a barely-visible `${buttonColor}12`. | Medium | Make the background gradient more atmospheric. Add a subtle `radial-gradient` glow behind the card: `radial-gradient(ellipse at 50% 0%, ${buttonColor}15 0%, transparent 70%)`. Look at how Linear and Stripe do ambient backgrounds. |
| F8 | **Textarea on Step 2 uses default shadcn styling** — the `min-h-[120px]` textarea with basic border looks flat. | High | Add a subtle inner shadow on the textarea: `shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]`. Increase `min-h` to `140px`. Consider adding an animated typing prompt that fades out when the user starts typing. |
| F9 | **"Back" button is an underlined text link** — inconsistent with the primary button being a full-width solid button. | Medium | Replace with a `ghost` variant button with a left-chevron icon. Match the button-height alignment. |
| F10 | **Step 4 (Author Info) has too many fields visible at once** — name, email, role, company, avatar upload. This is the "friction" step. | High | Make email, role, company fields **progressively disclosed** — show name first, then reveal others with a smooth expand animation. Use Framer Motion `layout` prop for a slick accordion effect. |
| F11 | **The consent checkbox on Step 4 uses the text "I agree..."** — functional but cold. | Low | Warm it up: "By submitting, you agree that [Business Name] can share your feedback. You can request removal anytime." — personalize with the project name. |
| F12 | **The "Powered by Vouch" branding** — not seen in the code as a premium element. | Critical | This is your **#1 growth engine**. The badge should be: (a) visually refined with a small Vouch bolt icon, (b) clickable to vouch landing page with UTM params, (c) have a subtle hover animation, (d) positioned as a sleek footer element, not a liability. Study how "Made with Tally" and "Powered by Typeform" look. |
| F13 | **Video step uses `max-height: 260px` for the camera preview** — too small on desktop. | Low | Use `aspect-[4/3]` with `max-h-[320px]` for a more natural video preview size. |
| F14 | **The success step (Step 5) needs more celebration** — after a user gives their testimonial, this moment should feel rewarding. | High | Add confetti animation (npm `canvas-confetti` is ~3kb). Show a "Thank you, [firstName]!" with the user's star rating prominently. Add the ShareElsewhere component more prominently with animated entrance. This is the moment to amplify positive sentiment. |

### 1.3 Settings Forms (General / Project / Billing)

![Settings Page](C:\Users\Srinath\.gemini\antigravity\brain\af1d03d9-a344-49a0-bcfc-f93d8b638275\dashboard_settings_page_1772971974689.png)

| # | Finding | Severity | Recommendation |
|---|---------|----------|----------------|
| F15 | **Settings is a long vertically scrolling page** — Profile, Password, and the Project tab with 10+ fields. It's functional but feels like a generic admin panel. | Medium | Group related fields into collapsible sections with clear visual borders. Use the `CollapsibleSection` pattern already in the widget builder. |
| F16 | **"Save Profile" button is left-aligned** — inconsistent with web convention of right-aligned actions. | Low | Right-align or use full-width on mobile, right-aligned on desktop with `flex justify-end`. |
| F17 | **Color pickers in Project settings** — the accent color, background color, text color, input color use `input[type="color"]`. While functional, they feel like browser defaults. | High | Add color presets as clickable circles (you already have `ACCENT_PRESETS` and `FORM_BG_PRESETS` in the code!) alongside the native picker for quick selection. Show a live preview mini-card below the color options showing how the collection form will look. |
| F18 | **Logo upload area** — needs a drag-and-drop zone with visual feedback, not just a file input. | Medium | Add a dashed border drop zone with icon, "drag or click" text, and smooth preview transition after upload. |
| F19 | **"Pro" badges on locked fields** are small and easy to miss. | Medium | Make Pro badges slightly larger with a subtle glow/pulse animation on first render to draw attention. Add a tooltip on hover explaining what you get. |

---

## 2. WIDGET BUILDER — Deep Audit (Money-Making Feature)

![Widget Builder Empty State](C:\Users\Srinath\.gemini\antigravity\brain\af1d03d9-a344-49a0-bcfc-f93d8b638275\dashboard_widgets_page_1772971938964.png)

### What's Good
- Collapsible settings sections ✓
- Color presets with preset swatches ✓
- Layout selection with icon grid ✓
- Live preview updates ✓
- Multiple widgets support ✓
- Embed code with copy buttons ✓

### Issues Found

| # | Finding | Severity | Recommendation |
|---|---------|----------|----------------|
| W1 | **Widget Builder empty state is sparse** — just an icon, text, and a button. For the feature that sells $29/mo, this needs to wow. | Critical | Add an animated preview showing what widgets look like (grid, carousel, editorial). Use a looping auto-play demo with sample testimonials. The empty state should sell the feature, not just describe it. |
| W2 | **The `+ New Widget` button at the top uses a dashed border** — looks like a secondary element, not the primary creation action. | Medium | Make it a solid indigo button matching the design language of "+ Create Form" on the forms page. Consistency matters. |
| W3 | **The widget builder is 2108 lines in a single file** — from a UX perspective, this means the configuration panel is doing too much. | Medium | Visually, break the sidebar into tabbed sections: "Layout", "Styling", "Content", "Embed". Each tab should feel focused and manageable. |
| W4 | **Layout selector uses small icon buttons in a horizontal grid** — but there's no visual preview of what each layout looks like. | Critical | Add thumbnail previews for each layout. When hovering over "Grid", show a tiny wireframe of a grid layout. When hovering over "Editorial", show the editorial wireframe. This is how Senja, Testimonial.to, and every competitor does it. Your layouts are BETTER — show them! |
| W5 | **The preview panel uses `SAMPLE_TESTIMONIALS` when there's no real data** — good, but the sample data includes generic avatars (`/samples/avatar-1.jpg`) that may not exist. | Medium | Use gradient-based initials fallback avatars (you already have this). Ensure sample data is always visually perfect since it's the first thing users see. |
| W6 | **Color input fields** — `input[type="color"]` + hex text input is functional but not premium. | High | Replace with a popover color picker component (e.g., react-colorful at ~3kb). Show the selected color as a larger swatch with the hex value below. Competitors use custom color pickers — the browser native one feels cheap. |
| W7 | **Font selector** — the dropdown of 15 Google Fonts needs preview. | High | Show each font name rendered in its own font (like Google Fonts does). This makes font selection visual, not just textual. |
| W8 | **No "Dark mode preview" toggle** — users building for dark sites can't preview how the widget will look against a dark background. | Medium | Add a light/dark toggle button on the preview panel. Swap preview background between `#ffffff` and `#0f172a`. |
| W9 | **Embed code section** — the code blocks are displayed in `pre` tags with copy buttons. Functional, but the developer experience could be more polished. | Low | Add syntax highlighting (even just basic styling), and a "Copied!" confirmation toast with a checkmark animation. Show platform-specific instructions more prominently. |
| W10 | **The "Testimonial Order" section** — allows drag-to-reorder via Framer Motion `Reorder`. But there's no visual affordance (grip handle icon) indicating items are draggable. | Medium | Add a `GripVertical` icon on the left side of each testimonial card in the reorder list. Add a cursor change to `grab`/`grabbing`. |

---

## 3. DASHBOARD OVERVIEW

![Dashboard Overview](C:\Users\Srinath\.gemini\antigravity\brain\af1d03d9-a344-49a0-bcfc-f93d8b638275\dashboard_overview_1772971769006.png)

### What's Good
- Getting Started checklist with progress bar ✓
- Metric cards with icons and sublabels ✓
- Motion animations on mount ✓
- Quick actions section ✓

### Issues Found

| # | Finding | Severity | Recommendation |
|---|---------|----------|----------------|
| D1 | **Only 2 metric cards** — "Approved testimonials" and "Widget views" feel sparse. | Medium | Add at least one more: "Response rate" (approved/total) or "Form views" or a trend indicator (↑ this week). Premium dashboards show 3–4 metrics in a row. |
| D2 | **Metric cards show "0" with muted sublabels** — the empty state metrics look deflating. | Medium | For zero-state, replace the large "0" with an encouraging illustration or icon-based graphic. "No data yet" feels more friendly than "0". |
| D3 | **The "Getting Started" checklist dominates the page** — when all 4 steps are incomplete, the checklist takes up 60% of the visible area. | Low | Make the checklist slightly more compact. Consider showing it as a horizontal stepper on desktop, vertical list on mobile. |
| D4 | **Quick actions cards use `.hover:shadow-md`** — good, but could be more premium. | Low | Add `transition-all duration-200` and a subtle `translate-y(-1px)` on hover with `ease-out`. The elevation change should feel physical. |
| D5 | **No welcome personalization** — the heading says "Overview" generically. | Medium | Change to "Good [morning/afternoon], [Display Name]" with a 👋 emoji. Personal touches signal premium. |

---

## 4. INBOX

![Inbox](C:\Users\Srinath\.gemini\antigravity\brain\af1d03d9-a344-49a0-bcfc-f93d8b638275\dashboard_inbox_page_1772971956164.png)

### Issues Found

| # | Finding | Severity | Recommendation |
|---|---------|----------|----------------|
| I1 | **Tab filter badges** ("All 2", "Approved 2") use minimal styling — small text with number. | Medium | Use colored badge pills for each tab count: indigo for All, amber for Pending, green for Approved, red for Rejected. |
| I2 | **Skeleton loaders are visible indefinitely** while loading — the screenshot shows the page stuck in skeleton state. | High | Add a timeout: if loading exceeds 5 seconds, show a retry button. Also ensure the skeleton matches the actual testimonial card layout more precisely (the skeletons currently look too different from the final cards). |
| I3 | **The "Add past testimonial" button** — opens an import dialog. This is a great feature but it's buried in the header. | Medium | On first use (when inbox is empty), show it as a banner/card in the empty state: "Already have testimonials? Import them in one click." |
| I4 | **Testimonial cards** — from the code, the action buttons (Approve, Reject, Feature, Share Card, Edit) appear as icon buttons. | Medium | Consider adding text labels to at least the primary actions (Approve, Reject) for clarity. Icon-only actions require memorization. |
| I5 | **Golden sentence highlighting UX** — from the code, golden sentence editing is inline in the testimonial card. This is your unique differentiator. | High | Add a visual callout/tooltip explaining what the golden sentence is when a user first encounters it: "✨ Highlight the most impactful sentence. It'll stand out in your widget." |

---

## 5. SIDEBAR & NAVIGATION

### Issues Found

| # | Finding | Severity | Recommendation |
|---|---------|----------|----------------|
| N1 | **Sidebar lacks a visual hierarchy indicator** — the active page uses a left border accent + indigo text, but the overall sidebar feels flat. | Medium | Add a subtle background fill to the active item (not just left border). E.g., `bg-indigo-50/50` with rounded corners on the active item. |
| N2 | **"Upgrade" link at the bottom** — plain text with an icon. For your primary monetization lever, this should be more attention-grabbing. | High | Make it a mini-card with gradient background: "✨ Upgrade to Pro — Unlock all layouts". Add a subtle pulse on the sparkle icon. |
| N3 | **"Sign out" button** is at the very bottom, partially cut off by the viewport. | Low | Move it into the user avatar dropdown/popover to declutter the sidebar. |
| N4 | **Project selector dropdown** at the top of the sidebar — good for multi-project. | Low | Add the project logo (if uploaded) as a small avatar next to the project name for visual identification. |

---

## 6. LOGIN / SIGNUP / AUTH

![Login Page](C:\Users\Srinath\.gemini\antigravity\brain\af1d03d9-a344-49a0-bcfc-f93d8b638275\login_page_audit_1772972327494.png)

### What's Good
- Split-screen layout with brand panel on left ✓
- Google OAuth + email/password ✓
- Password visibility toggle ✓
- Value props on the left panel ✓

### Issues Found

| # | Finding | Severity | Recommendation |
|---|---------|----------|----------------|
| A1 | **Left panel text contrast is low** — "Free to start. No credit card required." in light text on the blue gradient panel has poor contrast. | High | Increase text opacity to `text-white/90` and give it a slight text-shadow: `0 1px 2px rgba(0,0,0,0.2)`. |
| A2 | **Left panel is static** — no animation, no visual dynamism. | Medium | Add a subtle animated testimonial widget preview (like the landing page hero). Show a mini carousel of actual testimonial cards cycling. This reinforces the product value during the sign-in moment. |
| A3 | **No social proof on the login page** — "Your clients love your work" is a claim, not proof. | Medium | Add a small stat or testimonial: "Join 200+ businesses collecting better social proof" or show a real customer quote. |
| A4 | **The "Continue with Google" button** uses outline styling — it should feel like the primary/easiest path. | Low | Make it slightly more prominent with a light gray background (`bg-gray-50`) and GoogleG icon. Many users prefer OAuth and it should feel inviting. |

---

## 7. LANDING PAGE

![Landing Page](C:\Users\Srinath\.gemini\antigravity\brain\af1d03d9-a344-49a0-bcfc-f93d8b638275\landing_page_1772971676710.png)

### What's Good
- Clear value proposition ✓
- "Getting Started" card on the right side ✓
- Trust checkmarks below hero ✓

### Issues Found

| # | Finding | Severity | Recommendation |
|---|---------|----------|----------------|
| L1 | **No live widget demo on the landing page** — you say "social proof that matches your brand" but don't show it. | Critical | Add an interactive, live widget demo below the hero. Let visitors toggle between Grid, Carousel, Editorial layouts. This is your **#1 conversion tool**. Show, don't tell. |
| L2 | **The "Getting Started" card** on the right side of the hero is a static card with checkmarks — it's informational but doesn't create urgency. | Medium | Add a subtle animation: steps appearing one by one with check animations, simulating the setup flow. Make it feel fast and effortless. |
| L3 | **CTA buttons** — "Collect my first testimonial" (solid purple) and "See how it works" (outline). Good hierarchy. | Low | Add a subtle arrow/sparkle animation to the primary CTA on hover. Premium CTAs feel alive. |
| L4 | **"Compiling..." badge** visible in the bottom-left corner during dev. | Low | Ensure this is hidden in production builds. |
| L5 | **Above the fold is text-heavy** — no screenshot, no product visual, no widget example. | Critical | Show a product screenshot or animated demo above the fold. Users need to *see* the widget output in the first 3 seconds of visiting the page. This is the single most impactful conversion optimization you can make. |

---

## 8. PRICING PAGE

![Pricing Page](C:\Users\Srinath\.gemini\antigravity\brain\af1d03d9-a344-49a0-bcfc-f93d8b638275\pricing_page_top_audit_1772972392181.png)

### What's Good
- Clean 3-tier layout ✓
- Monthly/Yearly toggle with "2 months free" badge ✓
- "Most Popular" highlight on Pro ✓
- Studio tier with dark background differentiation ✓

### Issues Found

| # | Finding | Severity | Recommendation |
|---|---------|----------|----------------|
| P1 | **Free tier shows "Unlimited testimonials"** — this contradicts the product doc saying free tier caps at 25. Ensure consistency. | Critical | Fix copy to match actual limits: "25 testimonials" (or whatever the cap is). Misleading pricing is a trust-killer. |
| P2 | **No annual price shown** — user has to mentally calculate 17% savings. | Medium | Show the annual per-month price explicitly: "$19/mo" → "$16/mo billed annually". Cross out the monthly price. |
| P3 | **"Most Popular" badge is floating above the Pro card** — this feels disconnected. | Low | Integrate into the card header as a pill badge inside the card's top padding: `Pro` + `Most Popular` side by side. |
| P4 | **No FAQ section below pricing** — common questions like "Can I switch plans?", "What happens when I cancel?" go unanswered. | Medium | Add a clean FAQ accordion below the pricing table. At minimum 5–6 questions. |
| P5 | **No feature comparison table** — users can't easily compare Free vs Pro vs Studio features side by side. | Medium | Add a detailed comparison table below the pricing cards with checkmarks and cross marks per feature per plan. |

---

## 9. DESIGN SYSTEM & GLOBAL POLISH

### Design Tokens Analysis

From `globals.css`, the design system uses:
- **oklch color space** — excellent, modern, perceptually uniform
- **Indigo primary** (`oklch(0.585 0.233 277.117)`) — good brand color
- **Radius system** — base `0.75rem`, scaling up. Cards use `rounded-2xl` (1rem+)
- **Dark mode** — defined but not viseable/toggleable in the dashboard

### Issues Found

| # | Finding | Severity | Recommendation |
|---|---------|----------|----------------|
| G1 | **No dark mode toggle in the dashboard** — the CSS variables are defined for `.dark` class but there's no UI to switch. | Medium | Add a light/dark toggle in settings or the sidebar. Design-conscious users (your target audience) expect this. |
| G2 | **Font weight usage is inconsistent** — some headings use `font-bold` (700), others `font-semibold` (600). Section titles should have a consistent weight. | Low | Standardize: Page titles = `font-bold`, Section headings = `font-semibold`, Labels = `font-medium`. Document in a style guide. |
| G3 | **Background color** (`oklch(0.960 0.006 247.858)`) — the very light blue-gray tint is subtle and nice, but the sidebar is pure white while the content area has the tint, creating a slight dissonance. | Low | Make the sidebar share the content area background color, or use a crisp `1px` divider between them for clarity. |
| G4 | **The `bg-dot-grid` pattern** defined in CSS is only used on the landing page — it could enhance the dashboard background for a more premium feel. | Low | Consider adding a very subtle dot-grid to the main dashboard pane background. |
| G5 | **Animations are too uniform** — nearly every motion element uses `duration: 0.3, ease: 'easeOut'` with `y: 12` initial offset. This creates a "everything slides up" monotony. | Medium | Vary entry animations: metric cards could scale in from 0.95→1, checklist items could stagger with increasing delay, quick actions could fade in from the sides. This makes the page feel more dynamic and intentional. |

---

## 10. PERFORMANCE CONSIDERATIONS

| # | Finding | Severity | Recommendation |
|---|---------|----------|----------------|
| PF1 | **Widget builder is 2108 lines / 99KB in a single file** — this is a client-side bundle concern. | High | Split into sub-components: `WidgetLayoutPicker`, `WidgetThemePanel`, `WidgetPreview`, `WidgetEmbedCode`. Each chunk becomes independently lazy-loadable. |
| PF2 | **CollectFormClient is 1468 lines / 59KB** — for a public-facing form that submitters load on mobile. | High | Code-split the video recording bundle (MediaRecorder, frame extraction, blob conversion) into a dynamic import that only loads when the user clicks "Yes, record a video". |
| PF3 | **Dashboard page makes 7 parallel Supabase queries** (`Promise.all` with 7 queries). | Medium | Consider server-side data fetching via Next.js server components to reduce client-side waterfalls. At minimum, add a timeout and error boundary per query. |
| PF4 | **Framer Motion is imported on every page** — it's a 32KB library. | Low | Use `next/dynamic` with `ssr: false` for heavy animation components. For simple entry animations, consider CSS-only `@starting-style` (supported in modern browsers). |
| PF5 | **No `loading.tsx` in route groups** — Next.js App Router supports instant loading UIs. Currently, each page implements its own skeleton, leading to a brief white flash before hydration. | Medium | Add `loading.tsx` files in the `(dashboard)/dashboard/` route group with shared skeletons for instant perceived performance. |

---

## 11. ACCESSIBILITY

| # | Finding | Severity | Recommendation |
|---|---------|----------|----------------|
| AC1 | **Star rating in the collection form** — no keyboard interaction. `StarButton` uses `onClick` + `onMouseEnter` but doesn't support keyboard navigation (arrow keys). | High | Add `role="radiogroup"` to the star container, `role="radio"` to each star, and arrow key navigation. |
| AC2 | **Color contrast on muted text** — `text-muted-foreground` at `oklch(0.554 0.046 257.417)` against `oklch(0.960 0.006 247.858)` background may not pass WCAG AA for small text. | Medium | Test with a contrast checker. If below 4.5:1, darken the muted-foreground value slightly. |
| AC3 | **Sidebar navigation lacks landmark roles** — should have `<nav aria-label="Dashboard navigation">`. | Low | Add semantic HTML landmarks. |
| AC4 | **Toast notifications (sonner)** may not announce to screen readers. | Low | Ensure the toast container has `role="alert"` and `aria-live="polite"`. |

---

## 12. UPGRADE MODAL

From code review (`upgrade-modal.tsx`):

| # | Finding | Severity | Recommendation |
|---|---------|----------|----------------|
| U1 | **The upgrade modal shows Pro at $19 and Studio at $49** — but the plans in the pricing page doc say Pro should be $29. | Critical | Ensure pricing consistency across all surfaces: pricing page, upgrade modal, Lemon Squeezy config. |
| U2 | **The modal is purely text-based** — a list of checkmarks. | Medium | Add a before/after visual: "Your current widget" (basic grid) vs "With Pro" (editorial layout). Visual upgrade prompts convert 3× better than text lists. |
| U3 | **No "What you're missing" framing** — the modal lists what Pro includes. | Medium | Reframe as loss-aversion: "You're using 1 of 9 layouts. Unlock all layouts, golden sentence highlighting, and brand fonts." Show what they're specifically missing based on their current usage. |

---

## Priority Ranking — Top 15 Actions

| Priority | Item | Category | Impact |
|----------|------|----------|--------|
| 🔴 1 | Add live widget demo to landing page (L1, L5) | Landing | Conversion |
| 🔴 2 | Fix pricing inconsistencies (P1, U1) | Trust | Critical |
| 🔴 3 | Widget builder layout previews (W4) | Widget Builder | Activation |
| 🔴 4 | Widget builder empty state with demo (W1) | Widget Builder | Activation |
| 🟠 5 | Form creation → side-by-side with preview (F3, F4) | Forms | UX |
| 🟠 6 | Collection form Step 5 celebration (F14) | Collection Form | Virality |
| 🟠 7 | "Powered by Vouch" badge polish (F12) | Growth | Organic |
| 🟠 8 | Color picker upgrade (W6, F17) | Polish | Premium feel |
| 🟠 9 | Code-split large components (PF1, PF2) | Performance | Page load |
| 🟠 10 | Sidebar upgrade CTA redesign (N2) | Monetization | Revenue |
| 🟡 11 | Golden sentence onboarding tooltip (I5) | Feature discovery | Retention |
| 🟡 12 | Dashboard personalization (D5) | Dashboard | Engagement |
| 🟡 13 | Login page left-panel contrast (A1) | Auth | Accessibility |
| 🟡 14 | Read-only project field styling (F2) | Forms | UX clarity |
| 🟡 15 | Pricing page FAQ + comparison table (P4, P5) | Pricing | Conversion |

---

## Conclusion

Vouch's foundation is strong — the design system is intentional, the component architecture is clean, and the product experience has clear thought behind it. The gap to "premium" is primarily in **showcase moments** (empty states, previews, widget demos), **form creation UX** (wizard flow, previews), and **micro-polish** (animations, color pickers, celebration moments). Closing these gaps will make the product feel worth the $29/mo price point your target personas expect.

The single highest-ROI change: **put a live, interactive widget demo on the landing page**. Your widgets are your product. Let them sell themselves.
