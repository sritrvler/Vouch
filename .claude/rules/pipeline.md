# Code Quality Pipeline

## Task Tiers (classify BEFORE starting)

| Tier | When | Pipeline |
|---|---|---|
| T1 Trivial | Typo, string, color value | Fix, build, done. |
| T2 Small | Bug fixes, CSS, 1-5 files, no new logic | Self-plan, code, adversarial self-review, test, build. Zero agents. |
| T3 Medium | New component, refactor, API/state changes | 1-2 agents (with code snippets, NOT file paths) + self-review. |
| T4 Large | New feature, architecture, DB schema, auth/payments | Full agent pipeline + self-review. |

Say `TIER: T[n] - [justification]` before starting. Classify UP when in doubt. DB/auth/payments = minimum T3.

## Extended Thinking (use these keywords)

T2: normal (no keyword needed)
T3: prefix complex parts with "think hard" (~10k thinking tokens)
T4: prefix with "ultrathink" (~32k thinking tokens) for architecture decisions

## Pipeline Steps

### All Tiers T2+: Adversarial Self-Review (THE critical gate)

Senior engineer reviewing someone else's PR. Assume at least 1 bug exists.

```
SELF-REVIEW CHECKLIST:
[ ] BUGS: Logic errors, wrong conditions, off-by-one, null access?
[ ] EDGE CASES: Empty data, null, zero items, max items?
[ ] RESPONSIVE: 375px, 768px, 1024px, 1440px?
[ ] ACCESSIBILITY: Labels, 44px touch targets, keyboard nav?
[ ] STATE: Shared state conflicts, loading states, cleanup?
[ ] SECURITY: Input validation, XSS, injection, auth?
[ ] CONSISTENCY: Matches existing codebase patterns?
[ ] DATA LAYER: Array.isArray() on Supabase joins? user_id alongside project_id? Error check before sort/slice? Plan check via negation (=== 'free')?
[ ] MISSED FILES: Grep for related patterns. Check: .limit(1).single() if multi-support, isPro if plan logic, canSubmit if submission flow, skip buttons if removing paths.
[ ] REGRESSION: Could this break existing functionality?
```

### T3/T4: Agent Review

Let agents read files themselves (they have their own context windows). Only paste small diffs (<50 lines) directly. Always tell agents to return concise summaries, not raw dumps.

T3: `software-architect` (plan) + `senior-code-reviewer` (review) + self-review
T4: Full roster. See agent routing below.

### T4 Agent Chains

Without UI: `competitive-analyst` (optional) -> `product-strategist` -> `software-architect`
With UI: above + `ux-reviewer` FLOW DESIGN -> `premium-ui-designer` -> `software-architect`

### Build Check

`npx next build` must exit 0. After all steps: say `PIPELINE COMPLETE`.

### Pipeline Complete Requirements (T3/T4)
Before saying `PIPELINE COMPLETE`, list: "Agents used: [names and purpose]"
If no agents were used at T3/T4, justify why the tier classification is correct.
