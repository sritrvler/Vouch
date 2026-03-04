# Active Work Queue

## Session Handoff (March 4, 2026, session 3)

**What was done this session:**
1. Multi-project support shipped (commit `490018d`). Created ProjectContext, refactored layout with sidebar project switcher (Popover), refactored settings to sync from context, refactored widgets to scope by project_id.
2. Bug fix: widgets page infinite loading for 0-project users (commit `5b2c060`). Found during multi-persona testing.
3. Process improvements: strengthened post-implementation gate to require all-persona testing. Added 9-category Test Scenario Checklist to pre/post implementation gates (commits `ad0aa20`, `7560559`).
4. Added video cost optimization task (compress + thumbnail + fair use) to todo.

**What's next:**
Multi-widget management. This is the next broken promise (pricing says "Unlimited embed widgets" for Pro, but widget page only loads one).

**What to watch out for:**
1. PRE-IMPLEMENTATION now has 6 steps (step 6 = enumerate test scenarios from 9 categories). POST-IMPLEMENTATION step 2 requires verifying every listed scenario.
2. Widget query in widgets page already scopes by `project_id` (done in multi-project). Multi-widget needs to remove the `.limit(1).single()` on the widget query and add a widget list/selector.
3. Downgrade behavior is intentional: all existing widgets keep working, free users just can't create new ones beyond limit.
4. `useProject()` context is available in all dashboard pages. Use `selectedProjectId` and `plan` from it.

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

## AFTER: Video Cost Optimization (Compress + Thumbnail + Fair Use)

**The concern:**
Pro ($19/mo) offers unlimited projects and videos. A power user with 20 projects full of videos could cost more in storage and bandwidth than the $19 revenue. Need to make "unlimited" sustainable.

**Strategy:** Industry standard approach (Senja, Testimonial.to all do this).

**Three parts:**

### Part 1: Compress videos on upload
File: `src/app/api/testimonials/upload-video/route.ts`
1. After upload, transcode video to 720p using Cloudinary (free tier: 25 credits/mo) or FFmpeg
2. Replace original with compressed version in Supabase storage
3. Target: 80% size reduction (50MB upload becomes 5 to 10MB stored)
4. Evaluate: Cloudinary free tier vs serverless FFmpeg vs Mux

### Part 2: Thumbnail-first in widgets (play on click)
Files: `public/embed.js`, `src/app/api/testimonials/widget/[id]/route.ts`
1. Generate poster image (first frame) during upload or on first request
2. Widget shows thumbnail by default, streams video only on click
3. Cuts bandwidth 70 to 90% since most visitors never click play on every video
4. Also improves widget load performance (lighter initial payload)

### Part 3: Fair use policy in ToS
File: `src/app/terms/page.tsx`
1. Add fair use clause: "Unlimited means reasonable business use"
2. Standard SaaS practice (Basecamp, Notion, etc.)
3. Gives us a lever for the 1% edge case without changing marketing

**Priority:** After multi-widget and custom fonts. This is an optimization, not a broken promise.

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
