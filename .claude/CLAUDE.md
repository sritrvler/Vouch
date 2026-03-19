# Vouch: Claude Instructions

## Identity

Co-founder mindset. Flag mistakes proactively. Simplicity first. Find root causes. Senior developer standards.

## Formatting

Never use em dashes. Never use `-` for bullet points (use numbered lists or prose). No preamble/postamble. Code comments only where intent is non-obvious.

## Tech Stack

Next.js 16.1.6 (App Router, Turbopack), TypeScript, TailwindCSS v4, shadcn/ui, Framer Motion, Supabase (auth + DB), Lemon Squeezy (payments), Resend (email), sonner for toasts.

## Product

Testimonial collection SaaS. Core pitch: "Social proof that matches your brand. Live in 15 minutes."
Target: Western freelancers, agencies, SaaS founders.
Free: 25 testimonials, 1 form, 1 widget, 1 project, "Powered by Vouch" badge. Pro ($29/mo planned, currently $19): unlimited. Studio ($49/mo): client reports.
**80/20 principle:** Build the 20% of features that cover 80% of usage. Lead with SIMPLICITY + DESIGN QUALITY, not feature count.

## Key Files

`src/components/collect/CollectFormClient.tsx` (1352 lines, collection form)
`src/app/(dashboard)/dashboard/inbox/page.tsx` (inbox)
`src/app/(dashboard)/dashboard/widgets/page.tsx` (widget builder)
`src/app/(dashboard)/dashboard/settings/page.tsx` (settings)
`src/app/(dashboard)/dashboard/forms/page.tsx` (forms management)
`src/app/(dashboard)/dashboard/page.tsx` (dashboard overview)
`public/embed.js` (Shadow DOM widget, vanilla JS, all layouts)
`src/app/api/testimonials/widget/[id]/route.ts` (widget API)
`supabase/schema.sql` (full DB schema)

## Skills (load automatically by task type)

| Skill | When |
|---|---|
| `.claude/skills/core-principles/SKILL.md` | Every task |
| `.claude/skills/validate-and-plan/SKILL.md` | New features |
| `.claude/skills/design-and-build/SKILL.md` | While building |
| `.claude/skills/test-and-ship/SKILL.md` | Before deploying |
| `.claude/skills/interface-design/SKILL.md` | Interface work |
| `.claude/commands/vouch-test.md` | Before pushing to prod |

## Rules (auto-loaded from `.claude/rules/`)

1. `safety.md` -- never delete, never push, checkpoint before tasks
2. `pipeline.md` -- T1-T4 code quality tiers, self-review checklist, agent routing
3. `product-decisions.md` -- 5-check gate for features/messaging/pricing
4. `persona-ui.md` -- persona-driven UI design, business impact assessment
5. `api-security.md` -- loads for API routes
6. `collect-form.md` -- loads for collection form
7. `embed-js.md` -- loads for embed/widget code
8. `widget-builder.md` -- loads for widget builder

## Session Gates

**START (do not write code until done):**
1. Read `tasks/todo.md` (work queue + handoff note)
2. Read `tasks/lessons.md` (30 active patterns, capped)
3. Read ALL matching skill files. List which ones.
4. Understand the WHY before coding
5. Git checkpoint: `git add -A && git commit -m "checkpoint: before [task]"`
Then say: `I FOLLOWED SESSION START RULES`

**END (do not suggest /clear until done):**
1. Update `tasks/todo.md`: replace the previous handoff with "## Session Handoff [date]" (only one handoff exists at any time)
2. Update `tasks/lessons.md` (new patterns or "No new lessons")
3. Commit all changes
4. Output Handoff Protocol block
5. Self-check: "Could a fresh session continue from just the files?"
Then say: `I FOLLOWED SESSION END RULES`

## Code Quality (details in `.claude/rules/pipeline.md`)

Classify every task: `TIER: T[n] - [justification]`
T1 (trivial): fix, build, done.
T2 (small): self-plan, code, adversarial self-review, test, build. Zero agents.
T3 (medium): 1-2 agents + self-review.
T4 (large): full agent pipeline + self-review.
After all steps: `PIPELINE COMPLETE`

**Self-review runs at ALL tiers T2+.** 9-point checklist. Assume at least 1 bug exists.
**Agent rules:** Let agents read files themselves. Only paste small diffs (<50 lines). Parallelize independent agents.

## Product Decision Gate (details in `.claude/rules/product-decisions.md`)

Triggers on: features, messaging, pricing, strategic decisions.
5 checks: 80/20 usage, honest comparison, validated pain point, live data, growth engine.
Say: `PRODUCT DECISION GATE PASSED`

## Efficiency

1. Grep/glob before reading files.
2. One task per session. Never chain into next task autonomously.
3. Suggest `/clear` between unrelated tasks.
4. Subagents for research/exploration. Keep main context clean.

## Task Management

Plan first in `tasks/todo.md`. Mark items done as you go. Capture lessons in `tasks/lessons.md`.

**Handoff Protocol:**
```
Done: [one line]
Changed: [files modified]
Next: [specific enough to paste as prompt]
Watch out for: [gotchas]
Start next session with: /clear
```

## Post-Implementation

1. `npx next build` exits 0
2. End-to-end flow tested for customer journey features
3. Lessons captured in `tasks/lessons.md`
Then say: `I FOLLOWED POST-IMPLEMENTATION RULES`
