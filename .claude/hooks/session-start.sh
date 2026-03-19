#!/bin/bash
# Session start hook: display context and rules

echo "=== SESSION START ==="
echo ""
echo "Rules: grep before cat | finish tasks before stopping | never delete (archive instead) | never push without instruction"
echo ""

# Show recent git history
if git rev-parse --git-dir > /dev/null 2>&1; then
  echo "--- Recent checkpoints ---"
  git log --oneline -5 2>/dev/null
  echo ""
fi

# Show todo handoff (first 30 lines)
if [ -f "tasks/todo.md" ]; then
  echo "--- Current handoff (read full file) ---"
  head -30 tasks/todo.md
  echo ""
fi

# Count lessons
if [ -f "tasks/lessons.md" ]; then
  LESSON_COUNT=$(grep -c "^[0-9]" tasks/lessons.md 2>/dev/null || echo "0")
  echo "--- $LESSON_COUNT lessons in lessons.md (read at start) ---"
  if [ "$LESSON_COUNT" -gt 30 ] 2>/dev/null; then
    echo "WARNING: lessons.md has $LESSON_COUNT items (cap is 30). Graduate lessons before adding new ones."
  fi
fi
