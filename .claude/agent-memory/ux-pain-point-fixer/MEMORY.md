# UX Pain Point Fixer Memory

## Audit completed: 2026-03-05

## Key Files Mapped

Dashboard overview: `src/app/(dashboard)/dashboard/page.tsx`
Widget builder: `src/app/(dashboard)/dashboard/widgets/page.tsx` (75KB, very large)
Collection form: `src/components/collect/CollectFormClient.tsx` (65KB, 1450+ lines)
Dashboard layout and nav: `src/app/(dashboard)/layout.tsx`
Email notifications: `src/lib/email.ts`
Submit API: `src/app/api/testimonials/submit/route.ts`
Public page: `src/app/p/[slug]/page.tsx`
Client report: `src/app/report/[token]/page.tsx`
Middleware: `src/middleware.ts` and `src/lib/supabase/middleware.ts`
Upgrade modal: `src/components/upgrade-modal.tsx`

## Confirmed Patterns in This Codebase

ERROR HANDLING: All submit errors use sonner toasts (ephemeral). The submitter flow needs
inline persistent error messages, not toasts, because toasts disappear before mobile users
can read them and do not reassure them that their work is preserved.

PLAN GATING: Widget builder has three simultaneous upgrade prompts for free users. The
always-visible "Unlock more" banner at the bottom of the left panel (lines 1527-1550) is
redundant and creates upgrade fatigue. The locked layout buttons already trigger the modal.
The banner should be removed.

EMPTY STATES: Handled inconsistently across pages:
- Dashboard: checklist is good but does not distinguish "waiting" from "not done"
- Widget builder: good sample data handling with amber badge
- Public page /p/[slug]: "No reviews yet." is bare and unbranded (line 247-249)
- Client report: "No approved testimonials yet." is cold (line 111)

POST-UPGRADE: No celebration moment after Lemon Squeezy redirect. User returns to plain
dashboard. Add ?upgraded=1 to success URL in checkout route and detect in dashboard.

EMAIL NOTIFICATION: Footer says "Notification emails cannot be turned off." -- hostile copy.
The email is sent via Resend in lib/email.ts. No unsubscribe mechanism exists.

SESSION EXPIRY: Middleware redirects with ?redirectTo but not ?reason. Login page does not
explain why the user was redirected.

COLLECTION FORM STEPS: 5 steps. Step 1=rating, 2=content, 3=video (optional), 4=about you,
5=success. 20-char minimum on content is validated client-side with counter below textarea.
Camera is opt-in (user clicks "Yes, record a video" before camera is requested).

SUCCESS MESSAGE: Step 5 says "It will appear publicly once approved" -- conditional language
that plants doubt. Should be replaced with celebratory close. The approval mention, if needed,
should be a footnote in xs/muted text.

WIDGET BUILDER: Live preview uses sample data when no approved testimonials exist. Amber badge
labels it clearly. No "last saved" indicator. No explicit "not live on your site" label.
Users may believe preview reflects their live site.

CHECKLIST RETURNING USER: GettingStarted component has no "waiting" state. Steps are binary
done/not-done. Step 3 (receive first testimonial) shows as unchecked even when user has
shared their form and is legitimately waiting. This is accusatory after 3+ days.

## Personas Confirmed for This Product

Sarah: freelance designer, desktop, 2-3 clients, non-technical, anxious about client perception
Marcus: agency owner, desktop, 8+ clients, wants speed and efficiency
The Submitter: client's client, mobile, busy, no account, first-timer
The Visitor: sees embedded widget on a website, no account

## Unresolved Issues (Not Fixed in This Audit)

1. No in-app notification when a testimonial arrives (only email). Dashboard requires manual refresh.
2. The widget builder has no unsaved-changes warning before navigating away. Changes silently lost.
3. No "approved testimonials" warning before sharing public page link.
