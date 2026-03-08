#!/bin/bash
# Block dangerous bash commands that bypass the deny list
# Exit 2 = block the operation

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | grep -o '"command":"[^"]*"' | head -1 | sed 's/"command":"//;s/"$//')

# Block destructive file operations
if echo "$COMMAND" | grep -qiE '(rm -rf|rm -f|rmdir|unlink|shred|del /|rd /s)'; then
  echo "BLOCKED: Destructive file operation. Move to _archive/ instead."
  exit 2
fi

# Block force push
if echo "$COMMAND" | grep -qiE 'git push.*(--force|-f|--mirror|--delete)'; then
  echo "BLOCKED: Force push. Ask user for explicit permission."
  exit 2
fi

# Block git reset --hard without checkpoint
if echo "$COMMAND" | grep -qiE 'git reset --hard'; then
  echo "BLOCKED: git reset --hard. Use git log first, then ask user."
  exit 2
fi

# Block env file overwrites
if echo "$COMMAND" | grep -qiE '(>|>>)\s*\.env'; then
  echo "BLOCKED: Writing to .env file. Ask user for permission."
  exit 2
fi

exit 0
