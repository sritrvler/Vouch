# Lessons Learned

CAP: 30 lessons maximum. Cross-cutting technical patterns only.

## Governance (read this when adding a lesson)

ADDING: Before adding, ask "where is the enforcement point?"
  1. Touching specific files? Add to `.claude/rules/[file].md`
  2. Code review pattern? Add to self-review checklist in `pipeline.md`
  3. Product decision? Add to `.claude/rules/product-decisions.md`
  4. Cross-cutting, no specific trigger? Add here

IF OVER 30: Graduate the oldest lesson that has enforcement elsewhere.

REPEATS: Same mistake category documented twice = enforcement failed.
Do NOT add a third lesson. Fix the enforcement mechanism.

## Active Lessons

### Supabase (5)
1. Joined tables return arrays. Always `Array.isArray()` before casting.
2. `.limit(1).single()` pattern: grep ALL occurrences when adding multi-support.
3. Query builder types fail with generic helpers. Use scopeKey/scopeVal inline.
4. Plan limits use user-wide counts (user_id across all projects), not project-scoped.
5. Error checks must come BEFORE data processing (sort/slice), not after.

### React / Radix (6)
6. Shared Radix Popover state between CSS-hidden elements causes dual portal renders. Separate state.
7. Radix Popover hydration mismatch: defer with `useState(false)` + `useEffect(() => setMounted(true))`.
8. Radix Select: `position="popper"` + `sideOffset={4}` for dropdown-below behavior.
9. Radix DialogContent requires DialogTitle. Use `<DialogTitle className="sr-only">`.
10. `"inherit"` is truthy in JS. Map special CSS values to null before sanitization chains.
11. Optimistic UI reverts need the captured original state, not a hardcoded fallback.

### Framer Motion (4)
12. Reorder.Group is 1D only. Use @dnd-kit/sortable with rectSortingStrategy for grids.
13. AnimatePresence `mode="popLayout"` prevents height collapse between steps.
14. Directional animations: `useRef` for slideDirection, not `useState` (React batching reads new value for both exit and enter).
15. Infinite animations (`repeat: Infinity`) keep compositor layers active during scroll. Use `repeat: 3`.

### CSS / Tailwind (4)
16. Tailwind classes are static. Dynamic accent colors use inline `style` with CSS gradients.
17. `grid-cols-N` creates empty columns when items < N. Use `auto-fill` + `minmax`.
18. Fixed modal height (`h-[70vh]`) prevents jarring resize between wizard steps.
19. "Request desktop site" on mobile reports ~980px. Use `lg:` (1024px) not `md:` for marketing grids.

### Performance (3)
20. `backdrop-filter: blur()` on `position: fixed` elements causes mobile scroll jitter. Use solid backgrounds.
21. `transition-all` is wasteful. Only transition properties that actually change.
22. `font-display: optional` = first-load fallback that never swaps. Use `display: 'swap'`.

### Architecture (5)
23. Extract helpers before adding complexity to large files. Named functions > inline complexity.
24. Centralize feature/plan definitions. Single source of truth, import everywhere.
25. Archived .tsx files still get type-checked. Add `_archive` to tsconfig `exclude`.
26. Multiple Upstash rate limiters need unique prefixes per endpoint.
27. `dangerouslySetInnerHTML` for inline SVGs from developer-controlled data arrays is safe.

### Deployment (3)
28. Vercel: project-level env vars take precedence over team-level.
29. Env var changes need full redeployment (new deploy, not "Redeploy" on old).
30. Supabase Storage buckets must exist before upload. Use self-healing `createBucket().catch(updateBucket())` pattern in upload routes, same as `upload-logo/route.ts`. Enforcement: upload routes themselves.

## Recently Graduated (last 5)

1. Lemon Squeezy: test vs live mode have completely separate API keys AND variant IDs. (Graduated: enforcement is operational knowledge, not code-level.)
