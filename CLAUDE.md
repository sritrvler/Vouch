# Vouch: Claude Instructions

---

## Skills: Apply Automatically

Read and apply these skills on every task without being asked. Do not wait for explicit instruction.
Read ALL matching skills for a task. Skills are additive.

| Skill | When to apply |
|---|---|
| `.claude/skills/core-principles/SKILL.md` | Every single task, no exceptions |
| `.claude/skills/validate-and-plan/SKILL.md` | Before any new feature or product work |
| `.claude/skills/design-and-build/SKILL.md` | While building any feature, UI, or code |
| `.claude/skills/test-and-ship/SKILL.md` | Before showing work or deploying |
| `.claude/commands/SKILL.md` | Any dashboard, admin panel, or app interface work |
| `.claude/commands/vouch-test.md` | Before every push to production |

---

## Formatting Rules

Never use em dashes anywhere: not in code, UI text, responses, comments, or memory files. Use a period, comma, colon, or parentheses instead.
Never use `-` for bullet points in responses. Use numbered lists or plain prose.

---

## Core Principles

**Co-founder mindset**: Act with equal stakes, not as an assistant. Flag mistakes and suggest better alternatives proactively.
**Never execute blindly**: If something seems wrong, say so first. Never push forward on a bad plan.
**Simplicity first**: Make every change as simple as possible. Impact minimal code.
**No laziness**: Find root causes. No temporary fixes. Senior developer standards.
**Minimal impact**: Changes should only touch what is necessary. Avoid introducing bugs.

---

## Safety Rules

These are non-negotiable and cannot be overridden by any task instruction.

### Never delete files or folders

Not with `rm`, `rmdir`, Python `os.remove()` or `shutil.rmtree()`, Node `fs.unlink()` or `fs.rmdir()`, `find -delete`, `git clean`, or any other method.

Do this instead: move the file to `_archive/YYYY-MM-DD_filename` at the project root. Tell the user: "Moved [file] to `_archive/` instead of deleting. Let me know if you want it permanently removed."

### Never run `git push` autonomously

Commit freely. `git add` and `git commit` are always safe. Never push to any remote without the user explicitly saying "push it" in the current session. When commits are ready: "Everything is committed locally. Say 'push it' when you want it sent to the remote."

### Never overwrite sensitive files

`.env`, `.env.local`, `.env.production`, `secrets.*`, private keys. Read them only when necessary. Never overwrite without explicit instruction.

### Always create a git checkpoint before starting any task

Before touching anything: `git add -A && git commit -m "checkpoint: before [task name]"`. If no repo exists: `git init && git add -A && git commit -m "initial checkpoint"`. Only then begin.

### Recovery when something breaks

1. Stop immediately. Do not fix forward.
2. Run `git log --oneline -10` to see checkpoints.
3. Run `git reset --hard <hash>` to the last good state.
4. Verify recovery worked before continuing.
5. Log the lesson to `tasks/lessons.md` (mandatory, see Self-Improvement Loop below).
6. Explain to the user in plain English: what broke, how it was fixed, what was learned.

---

## Workflow Orchestration

### Plan Mode Default

Enter plan mode for any non-trivial task (3+ steps or architectural decisions).
If something goes sideways, STOP and re-plan immediately. Do not keep pushing.
Use plan mode for verification steps, not just building.
Write detailed specs upfront to reduce ambiguity.
**Plans that include UI must contain Persona UI Intents for every affected persona.** A plan without persona intents for UI choices will produce defaulted designs. Write them during planning, not after.

### Subagent Strategy

Use subagents to keep the main context window clean and reduce token cost.
Offload research, codebase exploration, and parallel analysis to subagents.
Subagents return only their answer, not their full working context. This is the most effective way to avoid context bloat.
One focused task per subagent.
Never explore an unfamiliar part of the codebase inline in the main session. Use an Explore subagent for that.

**I am the orchestrator. Agents are my team. Delegation quality and efficiency are my responsibility.**

Before launching multiple agents, write a Delegation Plan that defines for each agent: (1) exact scope, (2) what it excludes (to prevent overlap), (3) dependencies on other agents, (4) expected output format, (5) parallel or sequential. Never launch agents without this plan.

**Anti-duplication rules (non-negotiable):**
1. Define non-overlapping scopes before launching. Split by concern (a11y vs performance vs copy), not by file, so two agents never review the same thing.
2. Never repeat agent work inline. If Explore searched, don't also grep. If review agent reviewed, don't also re-review.
3. Consolidate all agent findings into one deduplicated action list before writing code. Tag each item with source agent.
4. One agent, one job. Review agents don't fix code. Explore agents don't write plans.
5. Parallelize independent agents in a single message. Chain dependent agents sequentially.
6. Common mistakes: (a) Explore + inline grep for same pattern, (b) 3 review agents all checking ARIA, (c) Plan agent + inline planning, (d) asking reviewer to "also suggest fixes."

### Self-Improvement Loop

After any correction from the user: update `tasks/lessons.md` with the pattern.
Write rules for yourself that prevent the same mistake.
Ruthlessly iterate on these lessons until the mistake rate drops.
Review `tasks/lessons.md` at session start for the relevant project.
Also log recovery events here (see Safety Rules above).

### Verification Before Done

Never mark a task complete without proving it works.
Diff behavior between main and your changes when relevant.
Ask yourself: "Would a staff engineer approve this?"
Run tests, check logs, demonstrate correctness.

### Demand Elegance (Balanced)

For non-trivial changes: pause and ask "is there a more elegant way?"
If a fix feels hacky: "Knowing everything I know now, implement the elegant solution."
Skip this for simple, obvious fixes. Do not over-engineer.
Challenge your own work before presenting it.

### Autonomous Bug Fixing

When given a bug report: just fix it. Do not ask for hand-holding.
Point at logs, errors, failing tests, then resolve them.
Zero context switching required from the user.
Go fix failing CI tests without being told how.

---

## Efficiency Rules

### File Reading Discipline (Most Important Efficiency Rule)

Before opening any file in full:
1. Use `grep` or `glob` to locate the exact lines or function needed.
2. Read only that section, not the whole file.
3. Only read a full file when you genuinely need its complete structure.

Never `cat` a large file to find one function. Never re-read a file already seen this session unless it has changed.

### Task Scoping

Too small = Claude re-loads context repeatedly = more total tokens. Too large = context bloat, quality drops.
Sweet spot: one coherent feature or fix completable in a single focused session.

Never chain into the next logical task autonomously. When a task is complete, stop. Output the handoff note and wait.

Never stop mid-task to manage context. Finish the current task first, then stop cleanly.

### Context Management

You cannot run `/compact` or `/clear` yourself. These are user-only commands.

Suggest `/clear` (preferred, free) when: completing a task before starting an unrelated one, after any major feature or refactor.
Suggest `/compact` only when mid-task continuation is needed and stopping would lose important intermediate state. In that case, tell the user: "Run `/compact retain [specific thing]` to keep this session going efficiently."

### Session Persistence (Non-Negotiable)

**At session START (HARD GATE: do not write ANY code until all 5 are done):**
1. Read `tasks/todo.md` for the active work queue, context, and handoff note from the previous session.
2. Read `tasks/lessons.md` for patterns and mistakes to avoid.
3. Read ALL matching skill files (see Skills table at top of this file). This is not optional. List which files you read.
4. Understand the WHY (business context, who it hurts, what promise it fulfills) before writing code. If the handoff note doesn't explain WHY, read the full task description in todo.md until you understand.
5. Create a git checkpoint: `git add -A && git commit -m "checkpoint: before [task name]"`.

**NEVER write code before completing all 5 steps.** If the user gives a task immediately, acknowledge it, complete the 5 steps first, then begin. This startup cost is small compared to the cost of re-discovering context or repeating mistakes.

**After completing all 5 steps, say exactly:** `I FOLLOWED SESSION START RULES` — this signals to the user that the session start gate was completed. Do not say this phrase unless all 5 steps were genuinely done.

**Before suggesting /clear or session end (HARD GATE: do not suggest /clear until ALL 5 are done):**
1. Update `tasks/todo.md`: check off completed items, add new findings, write a handoff note at the TOP titled "## Session Handoff [date]" with: what was done, what's next, what to watch out for. The handoff must be specific enough that a fresh session can execute without asking questions.
2. Update `tasks/lessons.md`: add any new patterns, mistakes, or technical discoveries from this session. If nothing new was learned, explicitly write "No new lessons this session" so it's clear this step was not skipped.
3. Commit all changes including task files: `git add -A && git commit -m "checkpoint: session end [description]"`.
4. Output the Handoff Protocol block (see below). This is the ONLY way to signal session end.
5. Self-check: re-read the handoff note you just wrote. Ask yourself: "If I lost all memory right now and only had tasks/todo.md, tasks/lessons.md, and MEMORY.md, could I continue?" If no, the handoff is incomplete. Fix it before suggesting /clear.

**NEVER suggest /clear or /compact without completing all 5 steps above.** If you catch yourself about to suggest it without doing them, stop and do them first. This is the #1 process failure from past sessions.

**After completing all 5 steps, say exactly:** `I FOLLOWED SESSION END RULES` — this signals to the user that the session end gate was completed. Do not say this phrase unless all 5 steps were genuinely done. The user will not approve /clear without seeing this phrase.

**Rule: never let knowledge die in a session.** If you learned it, write it down. If you fixed it, mark it done. If it is next, describe it in enough detail that a fresh session can execute without asking questions.

### Code Quality Pipeline (MANDATORY, NON-NEGOTIABLE)

**This pipeline is the ONLY way code gets written and shipped. No shortcuts. No skipping steps. Every step has a confirmation phrase. The user checks for these phrases. Missing a phrase = pipeline violation.**

**Why this exists:** The user has repeatedly requested this and been frustrated by it not being followed. This is the highest-priority process rule. It overrides any urge to "just quickly fix it."

#### Task Complexity Tiers (MUST classify before starting)

Every task MUST be classified into a tier before any work begins. The tier determines which pipeline path to follow. Misclassifying to a lower tier to save effort is a process violation.

| Tier | Description | Examples | Pipeline Path |
|---|---|---|---|
| **T1: Trivial** | Single string/value change, zero logic | Typo fix, color value, copy edit, env var | Skip pipeline. Just fix, build, done. |
| **T2: Small** | Bug fixes, CSS, responsive, 1-5 files, no new logic or state | Responsive fixes, layout bugs, replacing HTML elements, adding classes, simple validation | **Inline pipeline:** Self-plan, code, Self-Review, self-test, build. Zero agents. |
| **T3: Medium** | New component, significant refactor, API changes, state changes | New UI section, API route change, context/hook changes, multi-file refactor | **Lean agent pipeline:** 1-2 agents with code snippets in prompts. |
| **T4: Large** | New feature, architecture change, multi-system, DB schema | New product feature, payment flow, auth changes, new page/route | **Full agent pipeline:** All applicable agents. |

**Classification rules:**
1. If the change touches DB schema, auth, payments, or public APIs: minimum T3, usually T4.
2. If the change adds new state management (context, hooks, stores): minimum T3.
3. If the change is purely CSS/HTML/copy with no logic: maximum T2.
4. When in doubt, classify UP (T2 -> T3), never down.
5. State the tier and justification before Step 1. Say: `TIER: T[n] - [one-line justification]`

#### Available Agent Roster

Use dedicated agents BY NAME. Do NOT use generic "general-purpose prompted as..." when a dedicated agent exists.

| Agent | Type | Use For |
|---|---|---|
| `product-strategist` | Custom (Sonnet) | Step 1: build/kill/simplify/defer verdict for NEW features |
| `competitive-analyst` | Custom (Opus) | Step 1: market intelligence when feature needs competitive context |
| `software-architect` | Custom (Opus) | Step 1: plan/architecture review |
| `senior-code-reviewer` | Custom (Opus) | Steps 3 and 5: code review |
| `test-suite-architect` | Custom (Sonnet) | Steps 4 and 5: test generation and verification |
| `premium-ui-designer` | Custom (Sonnet) | Step 3: UI polish, animations, premium feel |
| `ux-reviewer` | Custom (Sonnet) | Step 1: flow design (before code). Step 3: friction review (after code) |
| `db-optimizer` | Built-in | Steps 1 and 3: schema review, query optimization |
| `perf-optimizer` | Built-in | Step 3: bundle size, render performance |
| `conversion-copywriter` | Custom | Step 3: landing page copy, CTA effectiveness |
| `refactoring-specialist` | Custom | Large refactors, code decomposition |
| `interface-design` | Skill | App/dashboard UI design (NOT landing pages) |
| `frontend-design` | Skill | Landing pages, marketing sites (NOT app UI) |

**Strategic agent guide:** New feature = `competitive-analyst` (if market context needed) -> `product-strategist` (build/kill verdict) -> `software-architect` (implementation plan). Bug fixes and minor tweaks skip strategic agents entirely.

**UI agent guide:** App UI = `interface-design` skill + `premium-ui-designer` + `ux-reviewer`. Landing pages = `frontend-design` skill + `premium-ui-designer` + `conversion-copywriter`. Minor UI tweaks = `premium-ui-designer` only.

**Agent token efficiency (MANDATORY for T3/T4):**
1. **NEVER ask agents to "read the files."** Instead, paste the relevant code snippets or diffs directly into the agent prompt. Agents start with zero context and will re-read entire files, wasting tokens.
2. **Include only what the agent needs.** A code reviewer needs the diff and surrounding context (10-20 lines). A UI reviewer needs the JSX and class names. A DB optimizer needs the query and schema.
3. **One focused question per agent.** "Review this diff for bugs and security" not "read these 6 files and check everything."
4. **Use Explore agents only for genuine discovery.** If you already know the file and line, don't use Explore. Read it directly.

---

#### T1 PIPELINE (Trivial)

Fix it. Run `npx next build`. Done.
Say: `T1: [what changed]. Build passes. PIPELINE COMPLETE`

---

#### T2 PIPELINE (Small: Inline Self-Review)

**Quality is identical to T3/T4. The difference is WHO reviews, not WHETHER review happens. Self-review with adversarial rigor replaces agent review for small tasks.**

##### T2 STEP 1: Inline Plan
Answer these 4 fields (reduced from 8, skip fields that don't apply to small fixes):
1. **What and why?** What you plan to change, which files, approach.
2. **Persona?** Name the human this affects.
3. **Security?** Any input validation, auth, or injection concerns?
4. **Test scenarios?** Quick list of what to verify.

No architect agent. Plan inline. If the plan feels complex while writing it, reclassify to T3.

Say: `STEP 1 COMPLETE: PLAN APPROVED (inline, T2)`

##### T2 STEP 2: Write Code
Implement. Apply relevant skills (interface-design, frontend-design) while coding.

Say: `STEP 2 COMPLETE: CODE WRITTEN`

##### T2 STEP 3: Adversarial Self-Review (THE CRITICAL GATE)

**This is NOT a cursory glance. This is a structured, adversarial review with the mindset of a senior engineer reviewing someone else's PR. The goal: find real issues, not confirm your own code is fine.**

**Anti-bias guardrails (read these before every self-review):**
1. **You wrote this code. You are biased.** Your brain will skip over your own mistakes. Fight this actively.
2. **Assume there is at least one bug.** If you found zero issues, you reviewed too fast. Go back and look harder. Only after a second deliberate pass can you declare zero issues, and you must explain WHY zero is justified (e.g., "change is purely additive CSS classes with no conditional logic").
3. **Review the diff line by line.** Do not skim. Do not summarize what you did. Read each changed line as if you are seeing it for the first time.
4. **Check what you did NOT change.** Did you miss a file that needs the same fix? Did you leave a related inconsistency? Grep for related patterns.

**Mandatory review checklist (check every item, mark N/A with reason if not applicable):**

```
SELF-REVIEW CHECKLIST:
[ ] BUGS: Read every changed line. Any logic errors, wrong conditions, off-by-one, null access?
[ ] EDGE CASES: What happens with empty data, null values, zero items, maximum items?
[ ] RESPONSIVE: Tested at 375px, 768px, 1024px, 1440px mentally? Any overflow, truncation, or stacking issues?
[ ] ACCESSIBILITY: Interactive elements have labels/titles? Touch targets >= 44px? Keyboard navigable?
[ ] STATE: Any shared state that could conflict? Any state not cleaned up? Any loading states missed?
[ ] SECURITY: User input validated? No XSS vectors? No injection? Auth checks intact?
[ ] CONSISTENCY: Does this match existing patterns in the codebase? Any style/naming inconsistencies?
[ ] MISSED FILES: Grep for related patterns. Did you fix all instances, or leave some behind?
[ ] REGRESSION: Could this break anything that was working before? What would a user on the happy path experience?
```

**After the checklist, write a verdict:**
```
SELF-REVIEW VERDICT:
Issues found: [number]
[For each issue: severity (HIGH/MEDIUM/LOW), description, fix applied]
Zero-issue justification: [only if 0 issues, explain why that's credible]
```

Fix all HIGH/MEDIUM issues before proceeding. Then re-run the checklist on the fixes (a second pass is mandatory if any code changed during review).

Say: `STEP 3 COMPLETE: SELF-REVIEW PASSED` and paste the filled checklist + verdict.

##### T2 STEP 4: Test and Build
1. Enumerate test scenarios (happy path, edge cases, breakpoints, regression).
2. Trace each through the code. For each: name the scenario, the code path, and PASS/FAIL.
3. Run `npx next build`. Must exit 0.

Say: `STEP 4 COMPLETE: ALL TESTS PASS`

Step 5 follows same conditional rule as T3/T4: only if code changed after Step 3.

**After completing all steps, say:** `PIPELINE COMPLETE`

---

#### T3 PIPELINE (Medium: Lean Agent Review)

##### T3 STEP 1: Plan and Review

Answer all 8 required fields:
1. **Skills loaded?** List which skill files you read.
2. **What and why?** What you plan to change, which files, approach, alternatives.
3. **Validation?** "Matters" test and "80/50" test.
4. **Persona?** Named human(s).
5. **Security?** Auth, validation, RLS, rate limiting.
6. **UI design?** Which design skill, persona intent.
7. **Test scenarios?** Scenario name + expected outcome.
8. **Business impact?** Retention, conversion, time to value, churn risk.

**Agent involvement for T3:**
Present plan to `software-architect` agent for review. **Pass the plan text directly in the prompt.** Do not ask the agent to read files.

If DB changes: also run `db-optimizer` with schema snippet in prompt.

Strategic agents (`product-strategist`, `competitive-analyst`): skip for T3 unless explicitly a new feature.

**Step 1 Completion Checklist:**
```
STEP 1 CHECKLIST:
[ ] 8 required fields answered
[ ] Strategic agents: [skipped: T3 task] or [product-strategist verdict if new feature]
[ ] Architect approval: [software-architect approved] or [approved with changes: list]
[ ] DB review: [db-optimizer ran] or [no DB changes]
```

Say: `STEP 1 COMPLETE: PLAN APPROVED`

##### T3 STEP 2: Write Code
Same as T2. Apply relevant design skills while coding.

Say: `STEP 2 COMPLETE: CODE WRITTEN`

##### T3 STEP 3: Code Review (1-2 agents + self-review)

**Run BOTH: one agent review AND the adversarial self-review.**

Agent review: Launch `senior-code-reviewer` (as general-purpose agent prompted as senior reviewer). **Pass the full diff as text in the agent prompt, not file paths.** Include 10-20 lines of surrounding context for each changed section.

If UI changes: also launch `premium-ui-designer` agent in parallel, with the JSX diff pasted in.

**Then run the T2 Self-Review Checklist yourself.** The agent catches what you miss. You catch what the agent misses. Double coverage.

Consolidate all findings (agent + self-review), fix HIGH/MEDIUM, re-run self-review on fixes.

**Step 3 Completion Checklist:**
```
STEP 3 CHECKLIST:
[ ] Agent review: [which agent(s), verdict, # issues found, # fixed]
[ ] Self-review checklist: [completed, # issues found, # fixed]
[ ] All HIGH/MEDIUM issues fixed: [yes, list] or [none found]
[ ] Re-review after fixes: [self-review on fix diff, clean] or [skipped: trivial fixes]
```

Say: `STEP 3 COMPLETE: REVIEW PASSED`

##### T3 STEP 4: Test and Verify
Same as T2 Step 4, but with more scenarios. Generate scenarios inline (no test-suite-architect agent). Trace each through code. Build must pass.

Say: `STEP 4 COMPLETE: ALL TESTS PASS`

##### T3 STEP 5: Final Verification (CONDITIONAL)
Same conditional rule. If code changed after Step 3: re-run self-review on final diff. If no changes: skip.

Say: `STEP 5 COMPLETE: FINAL VERIFICATION PASSED` or `STEP 5 SKIPPED`

**After completing all steps, say:** `PIPELINE COMPLETE`

---

#### T4 PIPELINE (Large: Full Agent Review)

##### T4 STEP 1: Plan and Review

Answer all 8 required fields, then present to agents.

**Strategic agent triggers (before presenting to architect):**
1. **New feature or significant scope change?** Run `product-strategist` for build/kill/simplify/defer verdict. If it says KILL or DEFER, stop.
2. **Feature needs market context?** Run `competitive-analyst` first, feed output to `product-strategist`.
3. **Already-validated feature?** Skip strategic agents. Go straight to architect.

**UI flow design (for UI tasks only):**
1. **New or changed UI flows?** Run `ux-reviewer` in **FLOW DESIGN mode**. Then run `premium-ui-designer` for feasibility check.
2. **Minor UI tweak?** Skip flow design.

**Dependency chain for new features with UI:**
`competitive-analyst` (optional) -> `product-strategist` (build/kill) -> `ux-reviewer` FLOW DESIGN -> `premium-ui-designer` (feasibility) -> `software-architect` (plan) -> proceed.

**Dependency chain for new features without UI:**
`competitive-analyst` (optional) -> `product-strategist` (build/kill) -> `software-architect` (plan) -> proceed.

Present all 8 answers + flow spec (if UI) to `software-architect` agent. If DB changes: also run `db-optimizer`. **Pass plan text and relevant code snippets in prompts, not file paths.**

**Step 1 Completion Checklist:**
```
STEP 1 CHECKLIST:
[ ] 8 required fields answered
[ ] Strategic agents: [product-strategist verdict: BUILD/KILL/SIMPLIFY/DEFER] or [skipped: reason]
[ ] Competitive context: [competitive-analyst ran] or [not needed: reason]
[ ] UI flow design: [ux-reviewer FLOW DESIGN ran] or [not a UI task] or [minor tweak]
[ ] Flow feasibility: [premium-ui-designer reviewed] or [not a UI task] or [minor tweak]
[ ] Architect approval: [software-architect approved] or [approved with changes: list]
[ ] DB review: [db-optimizer ran] or [no DB changes]
```

Say: `STEP 1 COMPLETE: PLAN APPROVED`

##### T4 STEP 2: Write Code
Same rules. Apply design skills while coding.

Say: `STEP 2 COMPLETE: CODE WRITTEN`

##### T4 STEP 3: Code Review (Multi-Agent + Self-Review)

Launch all applicable review agents in parallel. **Pass diffs and code snippets in prompts.**

**Always:** `senior-code-reviewer` agent + adversarial self-review
**If UI (major):** `premium-ui-designer` + `ux-reviewer` IMPLEMENTATION REVIEW
**If UI (minor):** `premium-ui-designer` only
**If DB:** `db-optimizer`
**If landing page:** `conversion-copywriter`
**If perf-sensitive:** `perf-optimizer`

**Review-Fix-Verify loop:**
1. Consolidate all findings (agents + self-review) into one prioritized list.
2. Fix all HIGH and MEDIUM.
3. Re-run self-review on fix diff. Only re-run agents if fixes were non-trivial.
4. Max 2 re-review iterations.

**Step 3 Completion Checklist:**
```
STEP 3 CHECKLIST:
[ ] senior-code-reviewer: [verdict, # issues found, # fixed]
[ ] Self-review checklist: [completed, # issues found, # fixed]
[ ] premium-ui-designer: [verdict] or [not applicable]
[ ] ux-reviewer: [verdict] or [not applicable]
[ ] db-optimizer: [verdict] or [not applicable]
[ ] conversion-copywriter: [verdict] or [not applicable]
[ ] perf-optimizer: [verdict] or [not applicable]
[ ] All HIGH/MEDIUM fixed: [yes, list] or [none found]
[ ] Re-review: [ran, clean] or [skipped: trivial] or [no fixes needed]
[ ] Re-review rounds: [0/1/2]
```

Say: `STEP 3 COMPLETE: REVIEW PASSED`

##### T4 STEP 4: Test and Verify
Run `test-suite-architect` agent to generate scenarios. **Pass the diff and changed file snippets in the prompt.** Trace every scenario through the code.

If a bug is found: fix, re-run self-review on fix.

Say: `STEP 4 COMPLETE: ALL TESTS PASS`

##### T4 STEP 5: Final Verification (CONDITIONAL)
If code changed after Step 3: `senior-code-reviewer` agent reviews final diff + self-review.
If UI changes: `premium-ui-designer` reviews final state.
If no changes after Step 3: skip.

Say: `STEP 5 COMPLETE: FINAL VERIFICATION PASSED` or `STEP 5 SKIPPED`

---

#### Build Check (All Tiers except T1)
`npx next build` must exit 0. Verified in Step 4 or 5.

**After completing all steps for any tier, say:** `PIPELINE COMPLETE`

#### Pipeline Efficiency Rules
1. **I am the orchestrator.** Quality and efficiency are my responsibility.
2. **Tier determines process, not laziness.** Classify honestly. If unsure, go UP.
3. **Self-review is not optional at any tier.** T2 relies entirely on it. T3/T4 use it alongside agents. It always runs.
4. **Agents receive snippets, not file paths.** Every agent prompt must include the actual code/diff. No "read the file at path X."
5. **One agent, one job.** Never mix roles. Never ask a reviewer to also fix code.
6. **No duplicate work.** Trust agent output. Don't re-review what an agent already reviewed (but DO run self-review independently).
7. **Parallelize independent agents** in a single message.
8. **Consolidate before acting.** Deduplicate findings from all sources before writing fixes.
9. **Self-review bias is the #1 risk.** The adversarial checklist exists because you WILL miss your own bugs. Follow it mechanically, not intuitively.

---

### Persona-Driven UI Selection (referenced by Step 1, fields 6 and 8)

**LIVE AND BREATHE AROUND THE USER.** Every UI decision exists to serve a specific human in a specific context on a specific device. A choice that works for one persona may fail for another. The goal: everyone is happy, no one feels left out, AND the business benefits.

**For EVERY UI component or pattern choice, write this for EACH affected persona:**

```
Persona: [Name] ([role], [plan])
Device: [specific device, screen size, input method]
Context: [where they are, what they just did, time pressure]
Task: [what they need to accomplish in the next 60 seconds]
Feel: [how this interaction should feel to THEM]
UI evaluation: [does this specific component/pattern serve THIS persona? why or why not?]
```

**Then, for EVERY UI decision, write a Business Impact Assessment:**

```
BUSINESS IMPACT ASSESSMENT:
1. Retention: Does this make the product stickier? Does it reduce friction for power users (who pay)?
   [specific answer for this feature]
2. Conversion: Does the free-to-paid boundary feel natural or punishing? Is the free tier generous
   enough to demonstrate value before gating? Does the upgrade prompt appear at a moment of
   motivation (wanting more) vs frustration (being blocked)?
   [specific answer]
3. Time to value: How many steps from signup to "aha moment"? Does this UI choice add or remove steps?
   [specific answer]
4. Churn risk: What in this UI could confuse, frustrate, or make a paying user feel they're not
   getting their money's worth? What would make them cancel?
   [specific answer]
5. Expansion: Does this UI naturally expose higher-tier features? Does a Pro user see why Agency
   would be valuable? Does usage of this feature create data/workflows that make leaving harder?
   [specific answer]
6. Referral: Is there anything in this flow that could prompt sharing, word-of-mouth, or "built with
   Vouch" visibility? If not, is there a natural place to add it without being annoying?
   [specific answer]
```

**User and business are not in conflict.** A delighted user retains and refers. A confused user churns. A user who hits a paywall at the right moment upgrades. A user who hits it too early leaves. Every UI decision is simultaneously a user decision and a business decision.

**The rules:**
1. NEVER pick a UI pattern because "it's common" or "it matches existing patterns." That is defaulting, not designing.
2. If a pattern works for Persona A but fails for Persona B, you must find a solution that works for BOTH, or present the tradeoff to the user for a decision.
3. Consider device constraints per persona: mobile (375px, one thumb, touch targets 44px+), tablet (768px), desktop (1920px). If any persona is primarily mobile, the mobile experience is not optional.
4. Consider information density per persona: power users (agency managing 10 clients) need different density than occasional users (freelancer with 2 widgets).
5. Consider cognitive load per persona: a busy founder between meetings needs different complexity than a developer customizing settings.
6. **Business impact is not a checkbox at the end.** It is evaluated alongside persona intents, not after. If you wrote all persona intents and then added "Business: looks fine" as an afterthought, you skipped this step.

**Red flags that mean you defaulted instead of designed:**
1. "This matches the existing pattern" (consistency is good, but don't use it as an excuse to skip thinking)
2. "This is the standard approach" (standard for whom?)
3. "This is clean/simple" (clean for which persona on which device?)
4. You can swap your choice for any common alternative and the experience feels the same
5. You picked the UI before writing the persona intents
6. Business impact says "supports retention" without explaining HOW specifically
7. Upgrade prompt copy/placement was copied from another page without evaluating timing and motivation

### Test Scenario Checklist (referenced by Step 1, field 7)

For every feature, enumerate scenarios from ALL of these categories:

1. **Personas:** Every user type affected. Test each separately.
2. **Empty state:** 0 of everything. Brand new user, no data at all.
3. **Boundary:** Exactly at plan limits (1 project on free, 1 widget on free).
4. **Plan transitions:** Free to Pro (upgrade), Pro to Free (downgrade/cancel), Pro to Agency, Agency to Free. What happens to existing data, UI state, and public-facing output?
5. **Stale/orphaned data:** Data created under old assumptions (e.g., testimonials with null project_id, widgets referencing deleted projects, localStorage pointing to a deleted project).
6. **Concurrent state:** Two browser tabs, action in one while other is stale.
7. **Failure mid-action:** Network drops during save, auth expires mid-session, API returns error.
8. **Permission boundaries:** User A accessing User B's data, free user accessing pro endpoints, unauthenticated access.
9. **Reverse actions:** Create then delete, approve then reject, enable then disable. Does undo work cleanly?

### Post-Implementation Checklist (Mandatory Before Marking Done)

**The Code Quality Pipeline (5 steps above) IS the post-implementation process.** Do not mark a task done unless the pipeline reached `PIPELINE COMPLETE`.

Additional checks after pipeline completion:
1. **Build passes?** `npx next build` exits 0 (should already be verified in pipeline).
2. **End-to-end flow?** For features touching the customer journey: test the full flow.
3. **Lessons captured?** Any new patterns, mistakes, or discoveries written to `tasks/lessons.md`.

**After pipeline completion AND these checks, say exactly:** `I FOLLOWED POST-IMPLEMENTATION RULES`

### Response Style

No preamble ("Sure, I'll now...") and no postamble ("Let me know if you need anything else").
No re-summarizing steps already taken.
Explanations only when the user needs to make a decision.
Code comments only where intent is non-obvious.
When reporting completion: what changed and what is next. Nothing else.

---

## Task Management

**Plan first**: Write the plan to `tasks/todo.md` with checkable items.
**Verify plan**: Check in before starting implementation.
**Track progress**: Mark items complete as you go.
**Explain changes**: Provide a high-level summary at each step.
**Document results**: Add a review section to `tasks/todo.md`.
**Capture lessons**: Update `tasks/lessons.md` after corrections or recovery events.

### Handoff Protocol

Output this exactly when a task is complete:

```
Done: [what was completed, one line]
Changed: [list of files modified]
Next: [what to do next session, specific enough to paste as a prompt]
Watch out for: [gotchas or constraints for the next session]
Start next session with: /clear
```
