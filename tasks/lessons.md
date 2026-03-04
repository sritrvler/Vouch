# Lessons Learned

Rules for myself. Read this at session start. Do not repeat these mistakes.

## Session Persistence (CRITICAL)

1. **Always update `tasks/todo.md` and `tasks/lessons.md` before suggesting /clear.** The user lost context between sessions because I did not write handoff notes. This is the #1 process failure.
2. **MEMORY.md is limited to 200 lines.** Put detailed specs in `tasks/` files and link from MEMORY.md.
3. **Git commit messages are searchable context.** Write detailed commit messages that explain WHY, not just what. Future sessions can run `git log` to reconstruct history.

## Code Patterns

4. **Supabase joined tables return arrays.** Always check `Array.isArray()` before casting. This has bitten us multiple times.
5. **Radix UI tabs cannot be clicked via browser automation.** The Chrome extension cannot trigger Radix tab switches via coordinate clicks, ref clicks, or JS dispatched events. Only React fiber props workaround works (unreliable).
6. **React controlled inputs need `form_input` tool**, not the `type` action. Typing doesn't update React state.
7. **`.limit(1).single()` is a common pattern** in our codebase for loading "the one project" or "the one widget." When adding multi-support, grep for ALL occurrences of this pattern.
8. **Widget API `isPro` check must include 'agency'.** Was broken (only checked `=== 'pro'`). Fixed. Pattern: always check `plan === 'free'` (negation) rather than checking for specific paid plans.
9. **Tailwind classes are static at build time.** Cannot use dynamic accent colors in Tailwind gradient classes. Use inline `style` with CSS `linear-gradient()` instead.
10. **embed.js is vanilla JS, not React.** Changes to embed.js are manual DOM string building. Test changes carefully since there's no type checking.

## Product Decisions

11. **"Copy must match reality."** If the pricing page lists a feature, the code must support it. We discovered 6 broken promises during the usability audit. Never add features to marketing copy without implementing them first.
12. **Customer-facing error messages must not leak internal details.** Video limit error was showing "Free plan includes 3 video testimonials. Upgrade to Pro" to the VISITOR who cannot upgrade. Always ask: "Who sees this message? Can they act on it?"
13. **The "KFC test" for brand blending:** On every customer-facing surface, ask "Would this look like KFC built it?" If the answer is no, the brand blending promise is broken.
14. **Optimistic UI reverts need the original state.** Don't blindly revert to 'pending'. Either capture the previous state before the optimistic update, or re-fetch from the DB.
15. **URL params must be supported for all tabs, not just billing.** When adding tab-based navigation, ensure all tabs are URL-addressable (Settings ?tab=project was broken).

## Process

16. **Create git checkpoint before every task.** `git add -A && git commit -m "checkpoint: before [task]"`. This is in CLAUDE.md but I wasn't doing it consistently.
17. **Read tasks/lessons.md at session start.** This file exists specifically to prevent repeated mistakes.
18. **Test with real user flows, not just code review.** The usability testing in browser caught issues that code reading missed (e.g., form title not rendering despite code looking correct at a glance).
19. **Parallel subagents for audits save massive time.** Launching 4 code review agents simultaneously was efficient. Use this pattern for any multi-file audit.
20. **Don't trust subagent claims blindly.** One agent said the image card API route was missing when it actually existed. Always verify critical claims with a direct file check.

## Process Failures (March 4, 2026 session): Prevented by CLAUDE.md Checklists

21. **NEVER skip reading skill files.** I built 21 fixes without reading any of the 5 skill files. The code was fine but the process was wrong. Prevention: CLAUDE.md now has a mandatory pre-implementation checklist that requires listing which skills were read. If the answer is "none," stop.
22. **NEVER skip persona-based testing.** I verified code worked but never tested as "Sarah Chen, freelance designer" or any named persona. A feature can work technically but fail for the human it's built for. Prevention: post-implementation checklist requires naming the persona you tested as.
23. **NEVER skip the security spot check.** New routes and API changes went out without checking auth bypass, RLS, or error message leakage. Prevention: post-implementation checklist requires a security spot check for any new route or API.
24. **NEVER skip validation before building.** I jumped straight to code without confirming each fix passes the "matters" test or "80/50" test. Some fixes might not have been worth the complexity. Prevention: pre-implementation checklist requires explicit validation answers.
25. **NEVER skip end-to-end flow testing.** Changes to the collect form, widget builder, and embed.js were tested in isolation, not as a connected journey. Prevention: post-implementation checklist requires end-to-end flow testing for features touching the customer journey.
26. **NEVER skip interface design skill for UI changes.** Widget builder text color picker and card style selector were built with reasonable defaults but without formal persona intent, subtle layering principles, or token consistency checks. Prevention: pre-implementation checklist requires confirming interface design skill was applied for any UI change.
27. **NEVER suggest /clear without completing the session-end hard gate.** The 5-step shutdown sequence (update todo, update lessons, commit, output handoff, self-check) must ALL be done before suggesting /clear. Past failure: I suggested /clear without writing handoff notes, causing total context loss in the next session. The handoff note self-check question is: "If I lost all memory and only had tasks/todo.md, tasks/lessons.md, and MEMORY.md, could I continue?" If no, the handoff is incomplete.
28. **NEVER write code before completing the session-start hard gate.** The 5-step startup (read todo, read lessons, read skills, understand WHY, create checkpoint) must ALL be done before any code. Past failure: I jumped straight to building 21 fixes without reading any skill files. The startup cost is 2 minutes. The cost of skipping it is process failures that compound across the entire session.
29. **Process improvements are worthless without enforcement.** Session 2 was spent building process gates. The key insight: documented rules are self-policing (can be skipped). Automated hooks + human-visible confirmation phrases are the strongest enforcement available. Always pair a rule with a mechanism that makes skipping it visible.
30. **Test ALL personas, not just the primary one.** Multi-project was tested only as Marcus (agency owner). Testing as a new user with 0 projects revealed a bug: widgets page showed infinite loading spinner because `fetchData` returned early without setting `loadingTestimonials = false`. The "create a project first" banner never appeared. Single-persona testing is not testing. Walk through every persona's journey separately.
31. **Early return guards must clean up loading state.** When a `fetchData` function has `if (!id) return` at the top, any loading flag set to `true` at initialization (e.g., `useState(true)`) will never flip to `false`. Either set loading to `false` before the early return, or initialize loading as `false` and only set it `true` after the guard passes.
32. **Happy path testing is not testing.** Multi-project was built and "tested" by only tracing the happy path for one persona. Missed: new user (0 projects, infinite loading bug), free user at limit (gate behavior), downgraded user (5 projects on free plan). The fix: enumerate ALL test scenario categories BEFORE writing code (personas, empty state, boundaries, plan transitions, stale data, concurrent state, failures, permissions, reverse actions). This list becomes the verification checklist after implementation. If you didn't list it, you won't test it.
