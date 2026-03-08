---
paths: ["src/app/api/**/*.ts", "src/app/api/**/*.tsx"]
---
# API Route Rules

1. Always validate auth before processing. Pattern: `if (!adminSecret || header !== adminSecret)` (fail closed, not fail open).
2. Always include `user_id` in queries, not just `project_id`. Defense-in-depth alongside RLS.
3. Validate external URLs before serving from cache (check domain).
4. File uploads: validate extension AND MIME type. SVG = XSS vector without sanitization.
5. Error messages must not leak internal details. Ask: "Who sees this? Can they act on it?"
6. API JSON endpoints need `X-Content-Type-Options: nosniff`.
7. Auth callback redirect: validate `next` starts with `/` and not `//`.
