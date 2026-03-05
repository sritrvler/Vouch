# UX Simplifier Memory: Vouch

## Project Context
Vouch is a testimonial collection SaaS at C:\Users\Srinath\OneDrive\Desktop\Sample\vouch.
Tech stack: Next.js 16.1.6, TailwindCSS v4, shadcn/ui, Framer Motion, Supabase, Lemon Squeezy.
Target personas: Sarah (freelance designer), Marcus (agency owner), Diana (freelancer), The Submitter (mobile customer), The Visitor.

## Full UX Audit Completed (March 5, 2026)
See the full audit report for all 29 friction points.

## Critical Missing Feature
NO email notification when a testimonial is submitted. Users have no way to know a testimonial arrived except checking the dashboard. This is the most impactful retention gap in the product.

## Top Friction Points (by priority)

### CRITICAL
1. Google OAuth button is `variant="outline"` (secondary style) despite being the fastest signup path. File: src/app/(auth)/signup/page.tsx line 168.
2. No email notification on testimonial submission (no Resend call in submit API route).

### HIGH
3. No auto-created default project on first login. New users must go to Settings before creating a form.
4. Getting-started step 4 combines approve + embed into one step (confusing).
5. Widget embed tab defaults to 'link' not 'builder'. File: src/app/(dashboard)/dashboard/widgets/page.tsx line 261.
6. Widget builder shows all options at once (layout, 4 color pickers, font, filter, pinned order) with no progressive disclosure.
7. Project settings tab has 13+ fields with equal visual weight. Save button requires scrolling.
8. No "New Project" inline creation. It forces navigation to settings (context switch). File: src/app/(dashboard)/layout.tsx line 244.
9. Upgrade modal triggers at frustration point (blocked), not motivation point.
10. No "Resend confirmation email" on post-signup screen. File: src/app/(auth)/signup/page.tsx line 126.

### MEDIUM
11. Pending badge count in sidebar is global; inbox is scoped to selected project.
12. No bulk approve in inbox.
13. Step 4 of collection form shows 5 fields; only name is required.
14. No video upload progress indicator (spinner only).
15. Google/LinkedIn URL fields editable for free users but have no effect (silent).

## Flow Click Counts (audited)
- Signup to first embedded widget: 22+ interactions across 5+ pages (email path)
- Signup to first embedded widget: ~12 interactions (Google OAuth path)
- Create a form: 7 interactions
- Approve one testimonial: 2 clicks (dashboard banner to inbox + approve)
- Get embed code: 3 clicks minimum (create + save + copy)

## Existing Anti-Patterns Found
- Save button far from controls (Project settings, widget builder)
- Default tab is wrong (widget embed tab: 'link' when 'builder' is the destination)
- Disabled fields for free users with no upgrade path shown (branding toggle, slug field)
- Full-page redirect for simple action (New Project via sidebar)
- No undo/notification for async actions (testimonial submission)

## Components That Work Well
- Form creation dialog: good progressive structure, sensible defaults
- Getting-started checklist: clear progress, contextual links
- Pending banner on dashboard: clear CTA, direct link to inbox
- Collection form: 4-step flow with endowed progress bar, opt-in camera, is well structured
- Upgrade modal: side-by-side Pro/Agency, billing toggle, concise feature lists

## File Reference Map (key files for each flow)
- Signup: src/app/(auth)/signup/page.tsx
- Dashboard/checklist: src/app/(dashboard)/dashboard/page.tsx
- Forms: src/app/(dashboard)/dashboard/forms/page.tsx
- Inbox: src/app/(dashboard)/dashboard/inbox/page.tsx
- Widgets: src/app/(dashboard)/dashboard/widgets/page.tsx
- Settings: src/app/(dashboard)/dashboard/settings/page.tsx
- Layout/nav: src/app/(dashboard)/layout.tsx
- Upgrade modal: src/components/upgrade-modal.tsx
- Collection form: src/components/collect/CollectFormClient.tsx
