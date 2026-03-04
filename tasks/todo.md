# Active Work Queue

## Session Handoff (March 4, 2026, session 2)

**What was done this session:**
No product code was written. This session was entirely about process improvement. We audited CLAUDE.md compliance, identified 6 process failures from the previous session (skills never read, no persona testing, no security pass, no validation, no e2e flow test, no interface design skill for UI changes), and built a 4-gate enforcement system with automated reminders and human-verifiable confirmation phrases.

**What's next:**
Pick one of the three remaining broken promises below and build it. Recommended order: Multi-Project first (it's CRITICAL and Multi-Widget depends on it).

**What to watch out for:**
1. This is the first session where the new process gates are active. Follow them strictly. The user expects to see `I FOLLOWED SESSION START RULES` before any code is written.
2. Multi-Project touches many files. Grep for ALL `.limit(1).single()` occurrences before starting. See implementation plan below.
3. The user's workflow: they ask what's in the todo, choose what to work on, you execute. Do not auto-pick.

---

## Context: Why We Are Doing This

Our core promise: **"Social proof that looks like you built it."**
Target audience: Freelancers, agencies, SaaS founders (Western, digital, pay for tools).
Competitors: Senja, Testimonial.to, EmbedSocial. They charge per domain/seat, hurt Lighthouse, lock content in hosted pages.

We ran a full usability audit (March 4, 2026) testing every screen as a target user ("Sarah Chen, freelance designer"). We cross-referenced 164 marketing promises against actual built features. Found and fixed 21 issues. Three broken promises remain.

The pricing page explicitly states features that don't work yet. **Every day these remain broken, a paying Pro/Agency customer could discover the gap and churn.** That's why this is urgent.

---

## NEXT: Multi-Project Support (CRITICAL)

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

## AFTER: Multi-Widget Management

**The broken promise:**
Pro features list says "Unlimited embed widgets." Free gets "1 embed widget."
Reality: Widget page does `.limit(1).single()` and only loads one widget.

**Depends on:** Multi-project (widgets are scoped to projects).

**Implementation plan:**
1. Widget page: Add sidebar with list of saved widgets + "Create new widget" button
2. Each widget card shows: name, layout icon, project name, testimonial count
3. Clicking a widget loads its settings into the builder
4. Delete widget button with confirmation
5. Free plan: max 1 widget total. Pro/Agency: unlimited.
6. Embed code tabs update per selected widget

### Key files:
`src/app/(dashboard)/dashboard/widgets/page.tsx` (main change)
Widget query: change `.limit(1).single()` to load all widgets for user, group by project

---

## AFTER: Custom Fonts

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
