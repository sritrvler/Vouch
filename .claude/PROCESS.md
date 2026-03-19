# Complete Process Flow: How Claude Code Works in This Project

## Context

This document traces every file, hook, rule, and gate that fires from the moment you open a new Claude Code session to the moment a fix is committed. It explains not just WHAT happens, but WHY each layer exists and how they connect.

---

## Phase 0: Before You Type Anything

### 0a. Settings Load (invisible, instant)

**File: `.claude/settings.json`**

This is the first thing Claude Code reads. It does two things:

1. **Permission deny list.** Hardcodes commands that are ALWAYS blocked, no matter what:
   1. All `rm` variants (`rm -rf`, `rm -f`, `rmdir`, `unlink`, `shred`)
   2. All force push variants (`git push --force`, `-f`, `--mirror`, `--delete`)
   3. `git reset --hard`, `git clean -f`, `git branch -D`, `git stash drop/clear`
   4. `git filter-branch`

   WHY: You can never lose work. Even if Claude wants to, even if you ask it to, these commands are blocked at the infrastructure level. This is the "nuclear option" safety net.

2. **Hook registrations.** Tells Claude Code which shell scripts to run at which lifecycle events (session start, before bash commands, after file edits, session stop). More on these in Phase 0b.

3. **`defaultMode: bypassPermissions`** means Claude auto-approves everything NOT on the deny list. So normal file reads, edits, npm commands all run without asking you.

**File: `.claude/settings.local.json`** (gitignored, machine-specific)

Adds Windows-specific allow-list entries: `npx`, `npm`, `node`, `powershell`, common Unix utils (`ls`, `cat`, `grep`, `wc`). Also allows `WebSearch`/`WebFetch` for specific competitor domains (Senja, Testimonial.to, Endorsal, etc.).

WHY this is separate: settings.json is committed to git (shared rules). settings.local.json is gitignored (your machine's quirks). If you cloned this on a Mac, you'd have a different local file.

### 0b. Hooks Register (invisible, instant)

Four hooks get wired up from settings.json. They don't RUN yet, they just get registered to fire on their trigger events:

| Hook | Event | What it will do |
|---|---|---|
| `session-start.sh` | `SessionStart` | Print context when session opens |
| `block-dangerous.sh` | `PreToolUse` (Bash only) | Block dangerous commands before execution |
| `echo 'File modified...'` | `PostToolUse` (Edit/Write only) | Remind to build-check after edits |
| Auto-checkpoint + notify | `Stop` | Commit changes + Windows notification |

### 0c. CLAUDE.md Files Load (automatic, always)

Two CLAUDE.md files are injected into the conversation context. Claude reads both before responding to anything.

**File: `CLAUDE.md` (root)**

The concise version. Sets:
1. Identity: "Co-founder mindset. Flag mistakes proactively."
2. Formatting: No em dashes. No `-` bullets. No preamble.
3. Session Start gate (5 steps + confirmation phrase)
4. Session End gate (5 steps + confirmation phrase)
5. Code quality tiers (T1-T4)
6. Product Decision Gate (5 checks)
7. Efficiency rules ("one task per session", "grep before cat")
8. Handoff protocol template

**File: `.claude/CLAUDE.md`**

The expanded version. Adds everything above plus:
1. Full tech stack (Next.js 16.1.6, TailwindCSS v4, Supabase, etc.)
2. Product description (pricing tiers, target audience, positioning)
3. Key files table with locations
4. Full skill routing table
5. Full rules list

WHY two files: The root CLAUDE.md is what you'd share publicly or with a new contributor. The `.claude/CLAUDE.md` has internal details. Both load because Claude Code reads all CLAUDE.md files in the project hierarchy.

### 0d. MEMORY.md Loads (automatic, always)

**File: `C:\Users\Srinath\.claude\projects\...\memory\MEMORY.md`**

This is Claude's persistent memory across sessions. It contains:
1. **Hard gates** with exact confirmation phrases (the enforcement layer on top of CLAUDE.md)
2. **Self-learning system** description (lesson lifecycle, cap rules)
3. **Active work queue** (what's being built, in what order)
4. **Product context** (pricing, positioning, 80/20 strategy)
5. **Key routes and files** (quick reference)
6. **Known quirks** (Supabase array joins, Tailwind dynamic colors)
7. **User preferences** (no `-` bullets, no em dashes, use agents proactively)
8. **Agent strategy table** (which agent for which task tier)
9. **Skill routing** (which skill files to load when)

WHY this exists: CLAUDE.md is checked into git and describes the project. MEMORY.md is user-specific and describes how YOU want to work. It captures corrections from past sessions ("stop summarizing", "use agents proactively") so Claude doesn't repeat the same mistakes.

### 0e. Rules Auto-Load (automatic, always for 4; conditional for 4)

**Always loaded (no `paths:` frontmatter):**

1. **`safety.md`**: Never delete (archive instead), never push without permission, never overwrite `.env`, git checkpoint before every task, recovery procedure.

2. **`pipeline.md`**: The code quality system. T1-T4 tier definitions, the 10-point self-review checklist, agent routing for T3/T4, extended thinking keywords (`think hard`, `ultrathink`), build check requirement, Pipeline Complete Requirements.

3. **`product-decisions.md`**: The 5-check gate for features/messaging/pricing. Includes 10 graduated decision patterns. Triggers on new features, NOT on bug fixes.

4. **`persona-ui.md`**: Mandatory persona template for every UI decision (who, device, context, task, feel). Six business impact checks. Red flags for defaulting.

**Conditionally loaded (have `paths:` YAML frontmatter):**

5. **`api-security.md`**: Loads when touching `src/app/api/**/*.ts`. 9 security rules (auth-first, user_id defense-in-depth, fail-closed patterns, etc.)

6. **`embed-js.md`**: Loads when touching `public/embed.js`. 11 rules for the vanilla JS Shadow DOM widget.

7. **`collect-form.md`**: Loads when touching `src/components/collect/**` or `src/app/c/**`. 6 rules for the collection form.

8. **`widget-builder.md`**: Loads when touching `src/app/(dashboard)/dashboard/widgets/**`. 8 rules for the widget builder.

WHY path-conditional: embed.js rules are irrelevant when fixing a dashboard bug. Loading them wastes context and dilutes attention. By gating on file paths, rules only appear when they're actionable.

---

## Phase 1: Session Start Hook Fires

The moment you open the session, before you type anything, the `SessionStart` hook runs.

**File: `.claude/hooks/session-start.sh`**

Output you see:
```
=== SESSION START ===

Rules: grep before cat | finish tasks before stopping | never delete (archive instead) | never push without instruction

--- Recent checkpoints ---
f17b797 auto-checkpoint: 2026-03-19 18:04
ff162d2 auto-checkpoint: 2026-03-19 17:06
...

--- Current handoff (read full file) ---
## Session Handoff (March 19, 2026, session 18)
[first 30 lines of tasks/todo.md]

--- 30 lessons in lessons.md (read at start) ---
```

WHY: This gives Claude (and you) immediate context. The handoff note says what was done last, what's next, and what to watch out for. The lesson count confirms the 30-lesson cap isn't violated. If it shows "WARNING: 42 items", Claude knows to graduate lessons before adding new ones.

---

## Phase 2: You Type Your Task

Example: "Fix the widget not showing star ratings on mobile."

---

## Phase 3: Session Start Gate (Claude's mandatory steps)

Claude now has your task, but CLAUDE.md and MEMORY.md both say: **do not write code until these 5 steps are done.**

### Step 1: Read `tasks/todo.md`

**File: `tasks/todo.md`**

The work queue and handoff notes from all previous sessions. Claude reads the latest handoff to understand:
1. What was done last session (context for the current work)
2. What's next in the queue (is this task expected?)
3. What to watch out for (gotchas from prior sessions)

WHY: Without this, every session starts from zero. The handoff note is how past-Claude communicates with future-Claude. It's the equivalent of a team standup.

### Step 2: Read `tasks/lessons.md`

**File: `tasks/lessons.md`**

The 30 active cross-cutting technical patterns. Organized by domain:
1. Supabase (5): Array.isArray on joins, .limit(1).single() grep, etc.
2. React/Radix (6): Popover dual renders, hydration mismatch, etc.
3. Framer Motion (4): 1D Reorder, popLayout, useRef for direction, etc.
4. CSS/Tailwind (4): Dynamic colors, auto-fill grids, fixed modal height, etc.
5. Performance (3): backdrop-blur jitter, transition-all waste, font-display swap
6. Architecture (5): Extract helpers, centralize features, tsconfig exclude, etc.
7. Deployment (3): Vercel env precedence, redeployment requirement, Lemon Squeezy test/live

WHY: These are patterns that apply ACROSS files and don't have a specific trigger point. "Array.isArray on Supabase joins" could bite you anywhere. Unlike path-specific rules (which auto-load), these must be held in working memory during the self-review checklist.

### Step 3: Read matching skill files

Claude checks the skill routing table and loads:

**Always:** `.claude/skills/core-principles/SKILL.md`

**If building a new feature:** `.claude/skills/validate-and-plan/SKILL.md`
Contains 10-step validation (personas, journey walk, "would they do this?" test, free alternative audit, pricing validation, etc.)

**If actively building:** `.claude/skills/design-and-build/SKILL.md`
Contains 12 parts (data model, security, scalability, URL mapping, implementation patterns, empty states, embed flows, UI copy rules, test sequence, silent failures, build-vs-skip)

**If deploying:** `.claude/skills/test-and-ship/SKILL.md`
Contains 6-step pre-deploy checklist (build verification, route smoke tests, security testing with attack payloads, QA across browsers)

**If doing UI work:** `.claude/skills/interface-design/SKILL.md`
Contains the full design system (intent-first, domain exploration, mandate checks, craft foundations)

Claude lists which skills it read so you can verify it's not skipping.

WHY skills are separate from rules: Rules are constraints (don't do X). Skills are processes (here's how to do Y well). Rules auto-load by path. Skills are loaded by task type because they're often 100+ lines and loading all of them for every task would be wasteful.

### Step 4: Understand the WHY

Claude pauses to understand why the task matters. For "fix star ratings on mobile", that means: submitters or visitors don't see social proof on mobile, which hurts trust and conversion.

WHY this step exists: Without understanding the WHY, Claude might fix the symptom (CSS) without noticing the root cause (maybe the API isn't returning ratings at all on certain conditions).

### Step 5: Git checkpoint

```bash
git add -A && git commit -m "checkpoint: before fix widget star ratings mobile"
```

WHY: If anything goes wrong, you can `git reset --hard` to this exact point. The `safety.md` rule requires this. The hook could do this automatically, but making Claude do it explicitly means the commit message describes what's about to happen.

**Confirmation:** Claude says `I FOLLOWED SESSION START RULES`

---

## Phase 4: Tier Classification

Before touching any code, Claude classifies the task:

```
TIER: T2 - Bug fix in embed.js, CSS/responsive issue, 1-3 files, no new logic.
```

**The tier determines the entire pipeline:**

| Tier | When | What happens |
|---|---|---|
| T1 | Typo, string, color | Fix it, build, done. No review. |
| T2 | Bug fix, CSS, 1-5 files | Self-plan, code, adversarial self-review, build. Zero agents. |
| T3 | New component, refactor, API changes | 1-2 agents + self-review |
| T4 | New feature, architecture, DB/auth/payments | Full agent pipeline + self-review |

WHY tiers exist: A typo fix doesn't need a software architect agent. A new payment flow does. Without tiers, every task either gets over-processed (waste) or under-processed (bugs). The tier system matches effort to risk.

---

## Phase 5: Product Decision Gate (T3/T4 features only)

If the task involves new features, messaging, or pricing (NOT bug fixes), the Product Decision Gate fires BEFORE any code.

**File: `.claude/rules/product-decisions.md`**

5 checks:
1. **80/20**: Does 20%+ of target audience use this daily?
2. **Honest comparison**: Leading with genuine strengths?
3. **Validated pain point**: Real users reported this?
4. **Live data**: Claims verified from live exploration?
5. **Growth engine**: Helps free users succeed (badge impressions)?

If any check fails, Claude stops and flags it to you. Does not proceed.

**Confirmation:** `PRODUCT DECISION GATE PASSED`

WHY: Session 11 taught us that building features nobody asked for wastes weeks. This gate catches "it would be cool if..." before any code is written.

---

## Phase 6: Investigation

Claude follows the efficiency rules: **grep/glob before reading files.**

1. Search for relevant code: `Grep "star" in public/embed.js`
2. Read only the relevant section (lines 400-450, not all 2000+ lines)
3. If unfamiliar territory, spawn an Explore agent to map the area first

**During this phase, path-specific rules activate.** Since Claude is reading `public/embed.js`, the `embed-js.md` rule (11 rules for the vanilla JS widget) automatically loads into context. Claude now knows: vanilla JS only, no React, Shadow DOM font injection rules, touch targets 44px, createTextNode vs textContent, etc.

WHY path-specific loading matters: These 11 embed.js rules would be noise during a dashboard bug fix. By loading them only when the file is touched, they're fresh in context exactly when needed.

---

## Phase 7: The Fix

Claude writes the minimal code change. For T2, planning is inline (no separate plan document).

**Hook fires: `block-dangerous.sh`** (PreToolUse, on every Bash command)

Every time Claude runs a bash command during the fix, this hook intercepts it, checks for dangerous patterns (rm, force push, reset --hard, .env writes), and blocks if matched. This is the belt-and-suspenders with the settings.json deny list.

**Hook fires: `echo 'File modified...'`** (PostToolUse, on every Edit/Write)

After every file edit, Claude sees a reminder: "File modified. Remember: build check before marking done." This nudges toward the build step.

---

## Phase 8: Adversarial Self-Review (mandatory at T2+)

**File: `.claude/rules/pipeline.md`** (the 10-point checklist)

Claude reviews its own diff as if reviewing someone else's PR. The instruction says "assume at least 1 bug exists."

```
SELF-REVIEW CHECKLIST:
[ ] BUGS: Logic errors, wrong conditions, off-by-one, null access?
[ ] EDGE CASES: Empty data, null, zero items, max items?
[ ] RESPONSIVE: 375px, 768px, 1024px, 1440px?
[ ] ACCESSIBILITY: Labels, 44px touch targets, keyboard nav?
[ ] STATE: Shared state conflicts, loading states, cleanup?
[ ] SECURITY: Input validation, XSS, injection, auth?
[ ] CONSISTENCY: Matches existing codebase patterns?
[ ] DATA LAYER: Array.isArray() on Supabase joins? user_id alongside project_id?
[ ] MISSED FILES: Grep for related patterns (limit/single, isPro, canSubmit, skip buttons)
[ ] REGRESSION: Could this break existing functionality?
```

If Claude finds issues, it fixes them before proceeding. At T3/T4, agents also review (software-architect, senior-code-reviewer), but self-review ALWAYS runs alongside.

WHY self-review is a hard gate: Without this, Claude's first draft ships. First drafts have bugs. The checklist forces a mechanical pass through categories that are easy to forget (accessibility, regression, data layer patterns). The "assume 1 bug exists" instruction fights the bias of "I just wrote it, it's fine."

---

## Phase 9: Agent Pipeline (T3/T4 only)

For T2 bugs, this phase is skipped entirely. For T3/T4:

**T3 example** (new component): `software-architect` designs the structure, Claude builds it, `senior-code-reviewer` reviews the code.

**T4 example** (new feature with UI):
1. `competitive-analyst` checks how competitors handle this (optional)
2. `product-strategist` validates the feature deserves to exist
3. `ux-reviewer` (FLOW DESIGN mode) designs the UI flow before code
4. `premium-ui-designer` checks visual feasibility
5. `software-architect` plans the implementation
6. Claude builds it
7. `senior-code-reviewer` reviews the code
8. `ux-reviewer` (IMPLEMENTATION REVIEW mode) checks for friction
9. Self-review STILL runs on top of all this

**Each agent has its own context window and memory.** For example, `senior-code-reviewer` has a MEMORY.md that remembers: "8 security vulnerabilities found in prior audit, rate limiter architecture notes, 13 API routes, auth pattern uses Supabase, RLS enabled on all tables." This means the reviewer doesn't start from scratch each time.

WHY agents have separate context: Claude's main context window is limited. If Claude read every file itself, context fills up fast. Agents read files in their own windows and return concise summaries. This keeps the main conversation clean.

---

## Phase 10: Build Check

```bash
npx next build
```

Must exit 0. If it fails, Claude fixes the issue before proceeding.

**Confirmation:** `PIPELINE COMPLETE`

At T3/T4, Claude also lists: "Agents used: [names and purpose]". If no agents were used at T3/T4, Claude must justify why.

---

## Phase 11: Post-Implementation

1. For customer journey features, end-to-end flow is tested
2. Claude checks: is there a new lesson worth capturing?

**Lesson triage (from `tasks/lessons.md` governance section):**
1. Touches specific files? Goes in `.claude/rules/[file].md`
2. Code review pattern? Goes in pipeline.md self-review checklist
3. Product decision? Goes in product-decisions.md
4. Cross-cutting, no trigger? Earns an active slot (if under 30)
5. Over 30? Graduate the oldest enforced lesson to `tasks/lessons-archive.md`

**Confirmation:** `I FOLLOWED POST-IMPLEMENTATION RULES`

---

## Phase 12: Session End Gate

### Step 1: Update `tasks/todo.md`

New handoff section at the top:
```
## Session Handoff (March 19, 2026, session 19)

What was done: Fixed star ratings hidden on mobile in embed.js
What's next: Minimal layout (item #2 from active work queue)
What to watch out for: flex-wrap gap may need testing on carousel layout
```

### Step 2: Update `tasks/lessons.md`

New pattern or "No new lessons."

### Step 3: Commit everything

```bash
git add -A && git commit -m "fix: widget star ratings hidden on mobile in embed.js"
```

### Step 4: Output Handoff Protocol

```
Done: Fixed star ratings overflow on mobile in embed.js
Changed: public/embed.js, tasks/todo.md
Next: Minimal layout (item #2 from active work queue)
Watch out for: flex-wrap gap may need testing on carousel layout at 375px
Start next session with: /clear
```

### Step 5: Self-check

"If I lost all memory and only had todo.md, lessons.md, and MEMORY.md, could I continue?"

**Confirmation:** `I FOLLOWED SESSION END RULES`

---

## Phase 13: Stop Hook Fires (automatic)

When Claude stops responding, two things happen automatically:

**Auto-checkpoint commit:** If there are ANY uncommitted changes (maybe Claude forgot or the session crashed), the hook runs:
```bash
git add -A && git commit -m "auto-checkpoint: 2026-03-19 18:04"
```

This is the safety net. Even if Claude doesn't commit properly, changes are never lost.

**Windows notification:** A system tray balloon appears: "Task complete. Ready for input."

---

## Summary: The Full Stack

```
Layer 0:  settings.json         -> What's BLOCKED (permissions deny list)
Layer 1:  settings.local.json   -> What's ALLOWED (machine-specific)
Layer 2:  Hooks                 -> What RUNS automatically at lifecycle events
Layer 3:  CLAUDE.md (x2)       -> What Claude KNOWS about the project
Layer 4:  MEMORY.md            -> What Claude REMEMBERS about working with you
Layer 5:  Rules (always)        -> What Claude must ALWAYS do (safety, pipeline, product, persona)
Layer 6:  Rules (path)          -> What Claude must do WHEN TOUCHING specific files
Layer 7:  Skills                -> HOW to do specific types of work well
Layer 8:  lessons.md            -> 30 cross-cutting patterns to WATCH FOR during review
Layer 9:  lessons-archive.md   -> Graduated lessons (NOT loaded, reference only)
Layer 10: Agents (T3/T4)       -> Specialist reviewers with their OWN memory
Layer 11: todo.md              -> Session continuity (handoff between sessions)
```

Each layer exists because a previous layer was insufficient:
1. Settings block dangerous commands, but can't enforce process -> Hooks
2. Hooks enforce process, but can't teach domain knowledge -> CLAUDE.md
3. CLAUDE.md teaches domain knowledge, but forgets user preferences -> MEMORY.md
4. MEMORY.md remembers preferences, but can't enforce code quality -> Rules
5. Rules enforce quality, but can't teach complex workflows -> Skills
6. Skills teach workflows, but can't catch one-off technical gotchas -> Lessons
7. Lessons catch gotchas, but can't provide expert review -> Agents
8. Agents provide expert review, but need continuity -> Agent memory
9. All of this needs session continuity -> todo.md handoff system

---

## File Inventory

| File | Purpose | Auto-loaded? |
|---|---|---|
| `.claude/settings.json` | Deny list + hook registrations | Yes (always) |
| `.claude/settings.local.json` | Machine-specific allows (gitignored) | Yes (always) |
| `.claude/hooks/session-start.sh` | Print context at session open | Yes (SessionStart event) |
| `.claude/hooks/block-dangerous.sh` | Block dangerous bash commands | Yes (PreToolUse event) |
| `.claude/hooks/notify.ps1` | Windows notification on stop | Yes (Stop event) |
| `CLAUDE.md` | Project identity + gates (concise) | Yes (always) |
| `.claude/CLAUDE.md` | Project details + tech stack (expanded) | Yes (always) |
| `MEMORY.md` (user-level) | Persistent cross-session memory | Yes (always) |
| `.claude/rules/safety.md` | Never delete, never push, checkpoint | Yes (always) |
| `.claude/rules/pipeline.md` | T1-T4 tiers, self-review checklist | Yes (always) |
| `.claude/rules/product-decisions.md` | 5-check gate for features/pricing | Yes (always) |
| `.claude/rules/persona-ui.md` | Persona template for UI decisions | Yes (always) |
| `.claude/rules/api-security.md` | 9 API security rules | When touching `src/app/api/**` |
| `.claude/rules/embed-js.md` | 11 embed.js rules | When touching `public/embed.js` |
| `.claude/rules/collect-form.md` | 6 collection form rules | When touching `src/components/collect/**` |
| `.claude/rules/widget-builder.md` | 8 widget builder rules | When touching widget dashboard files |
| `.claude/skills/core-principles/SKILL.md` | Identity, mission, red flags | Every task |
| `.claude/skills/validate-and-plan/SKILL.md` | 10-step feature validation | New features |
| `.claude/skills/design-and-build/SKILL.md` | 12-part implementation guide | While building |
| `.claude/skills/test-and-ship/SKILL.md` | 6-step pre-deploy checklist | Before deploying |
| `.claude/skills/interface-design/SKILL.md` | Interface design system | Dashboard/app UI work |
| `.claude/commands/vouch-test.md` | Pre-release verification script | Before production push |
| `tasks/todo.md` | Work queue + session handoffs | Read at session start |
| `tasks/lessons.md` | 30 active technical patterns | Read at session start |
| `tasks/lessons-archive.md` | Graduated lessons (reference only) | Never auto-loaded |
