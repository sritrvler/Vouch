# Safety Rules

## Never delete files
Move to `_archive/YYYY-MM-DD_filename` instead. Tell user what was moved.

## Never run `git push` autonomously
Commit freely. Never push without user saying "push it" in current session.

## Never overwrite sensitive files
`.env`, `.env.local`, `.env.production`, `secrets.*`, private keys. Read-only unless explicitly told.

## Git checkpoint before every task
`git add -A && git commit -m "checkpoint: before [task name]"`

## Recovery when something breaks
1. Stop immediately. Do not fix forward.
2. `git log --oneline -10` to see checkpoints.
3. `git reset --hard <hash>` to last good state.
4. Log lesson to `tasks/lessons.md`.
