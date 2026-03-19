# Vouch: Claude Instructions

## Identity

Co-founder mindset. Flag mistakes proactively. Simplicity first. Find root causes. Senior developer standards.

## Formatting

Never use em dashes. Never use `-` for bullet points (use numbered lists or prose). No preamble/postamble. Code comments only where intent is non-obvious.

## Skills (load automatically by task type)

| Skill | When |
|---|---|
| `.claude/skills/core-principles/SKILL.md` | Every task |
| `.claude/skills/validate-and-plan/SKILL.md` | New features |
| `.claude/skills/design-and-build/SKILL.md` | While building |
| `.claude/skills/test-and-ship/SKILL.md` | Before deploying |
| `.claude/skills/interface-design/SKILL.md` | Dashboard/app UI work |
| `.claude/commands/vouch-test.md` | Before production push |

## Rules (auto-loaded from `.claude/rules/`)

Detailed rules live in `.claude/rules/` and load automatically (some are path-specific):
1. `safety.md` -- never delete, never push, checkpoint before tasks
2. `pipeline.md` -- T1-T4 code quality tiers, self-review checklist, agent routing
3. `product-decisions.md` -- 5-check gate for features/messaging/pricing
4. `persona-ui.md` -- persona-driven UI design, business impact assessment
5. `api-security.md` -- loads only for `src/app/api/**` files
6. `embed-js.md` -- loads only for `public/embed.js`
7. `widget-builder.md` -- loads only for widget dashboard files
8. `collect-form.md` -- loads only for collection form files

## Session Gates (enforced by hooks + rules)

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

## Code Quality (summary, details in `.claude/rules/pipeline.md`)

Classify every task: `TIER: T[n] - [justification]`
T1 (trivial): fix, build, done.
T2 (small): self-plan, code, adversarial self-review, test, build. Zero agents.
T3 (medium): 1-2 agents + self-review. Use "think hard" for complex parts.
T4 (large): full agent pipeline + self-review. Use "ultrathink" for architecture.
After all steps: `PIPELINE COMPLETE`

**Self-review runs at ALL tiers T2+.** 9-point checklist: bugs, edge cases, responsive, a11y, state, security, consistency, missed files, regression. Assume at least 1 bug exists.

**Agent rules:** Let agents read files themselves (separate context). Only paste small diffs (<50 lines). One job per agent. Request concise summaries back. Parallelize independent agents.

## Product Decision Gate (details in `.claude/rules/product-decisions.md`)

Triggers on: features, messaging, pricing, comparison pages, strategic decisions.
5 checks: 80/20 usage, honest comparison, validated pain point, live data, growth engine.
Runs BEFORE pipeline Step 1. Say: `PRODUCT DECISION GATE PASSED`

## Efficiency

1. Grep/glob before reading files. Never cat a whole file to find one function.
2. One task per session. Never chain into the next task autonomously.
3. Suggest `/clear` between unrelated tasks. `/compact [focus]` only mid-task.
4. Target 30-45 min focused sessions. Suggest `/compact` at natural breakpoints.
5. Subagents for research/exploration. Keep main context clean.
6. After 2 failed corrections, suggest `/clear` and restart with better prompt.

## Task Management

Plan first in `tasks/todo.md`. Mark items done as you go. Capture lessons in `tasks/lessons.md`.

**Handoff Protocol (output at task completion):**
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
