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

### Subagent Strategy

Use subagents to keep the main context window clean and reduce token cost.
Offload research, codebase exploration, and parallel analysis to subagents.
Subagents return only their answer, not their full working context. This is the most effective way to avoid context bloat.
One focused task per subagent.
Never explore an unfamiliar part of the codebase inline in the main session. Use an Explore subagent for that.

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

**After completing all 5 steps, say exactly:** `I FOLLOWED THE RULES` — this signals to the user that the session start gate was completed. Do not say this phrase unless all 5 steps were genuinely done.

**Before suggesting /clear or session end (HARD GATE: do not suggest /clear until ALL 5 are done):**
1. Update `tasks/todo.md`: check off completed items, add new findings, write a handoff note at the TOP titled "## Session Handoff [date]" with: what was done, what's next, what to watch out for. The handoff must be specific enough that a fresh session can execute without asking questions.
2. Update `tasks/lessons.md`: add any new patterns, mistakes, or technical discoveries from this session. If nothing new was learned, explicitly write "No new lessons this session" so it's clear this step was not skipped.
3. Commit all changes including task files: `git add -A && git commit -m "checkpoint: session end [description]"`.
4. Output the Handoff Protocol block (see below). This is the ONLY way to signal session end.
5. Self-check: re-read the handoff note you just wrote. Ask yourself: "If I lost all memory right now and only had tasks/todo.md, tasks/lessons.md, and MEMORY.md, could I continue?" If no, the handoff is incomplete. Fix it before suggesting /clear.

**NEVER suggest /clear or /compact without completing all 5 steps above.** If you catch yourself about to suggest it without doing them, stop and do them first. This is the #1 process failure from past sessions.

**After completing all 5 steps, say exactly:** `I FOLLOWED THE RULES` — this signals to the user that the session end gate was completed. Do not say this phrase unless all 5 steps were genuinely done. The user will not approve /clear without seeing this phrase.

**Rule: never let knowledge die in a session.** If you learned it, write it down. If you fixed it, mark it done. If it is next, describe it in enough detail that a fresh session can execute without asking questions.

### Pre-Implementation Checklist (Mandatory for Every Task)

Before writing any code for a task, answer these questions explicitly. Do not skip any.

1. **Skills loaded?** Which skill files did you read? List them. If you did not read core-principles + the relevant task skills, stop and read them now.
2. **Validation pass (core-principles)?** Does this task pass the "matters" test (would users complain if removed)? Does it pass the "80/50" test (80% value with 50% complexity)?
3. **Persona defined?** Who is the specific human this change is for? Name them. What is their context, device, pain, motivation? (Not "users" or "customers.")
4. **Security considered?** For any new route, API, or form: auth gates, input validation, RLS, rate limiting. Reference the test-and-ship security checklist.
5. **Interface design applied?** For any UI change: persona intent stated, subtle layering principles followed, token architecture consistent.

If any answer is "no" or "skipped," pause and address it before writing code.

**After answering all 5 questions, say exactly:** `I FOLLOWED THE RULES` — this signals to the user that pre-implementation validation was completed. Do not say this phrase unless all 5 questions were explicitly answered.

### Post-Implementation Checklist (Mandatory Before Marking Done)

After completing code changes, before reporting completion:

1. **Build passes?** `npx next build` exits 0.
2. **Persona test?** Walk through the change as the named persona. Would Sarah Chen (freelance designer) find this intuitive? Would an agency owner managing 5 clients?
3. **End-to-end flow?** For features touching the customer journey: test the full flow (form > submit > approve > embed > verify).
4. **Security spot check?** For new routes/APIs: test auth bypass, verify RLS, check error messages don't leak internals.
5. **Lessons captured?** Any new patterns, mistakes, or discoveries written to `tasks/lessons.md`.

**After completing all 5 checks, say exactly:** `I FOLLOWED THE RULES` — this signals to the user that post-implementation validation was completed. Do not say this phrase unless all 5 checks were genuinely done.

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
