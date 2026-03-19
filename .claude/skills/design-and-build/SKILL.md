---
name: design-and-build
description: Use WHILE building features - design, implementation, security, scalability. Triggers include "build", "implement", "create", "design", "add feature", active development. Applies to both UI/UX design and code implementation. Do NOT use for pre-validation (use validate-and-plan) or testing (use test-and-ship).
---

# Design & Build

Applied during active feature development. This skill covers implementation concerns: data model, security, scalability, and coding patterns. For UI/UX design principles (personas, intent, craft, layering, tokens), apply the `interface-design` skill (`.claude/skills/interface-design/SKILL.md`) for app/dashboard UI or the `frontend-design` skill for landing/marketing pages. Those skills own all design/aesthetics decisions. This skill owns everything else.

---

## PART 1: DATA MODEL (Before Any UI)

Map complete schema before building UI:

**Questions:**
- Foreign key relationships?
- Status fields: Valid values? (`pending`/`approved`/`rejected` - NOT booleans)
- Owned by user vs project vs team?
- What's displayed publicly vs stays private?

**Lesson:** When status defined as string enum but treated as boolean in queries, filtering bugs appear silently. Define shape once, never deviate.

---

## PART 2: SECURITY PLANNING (Mandatory Before Code)

### Authentication & Authorization
- How verify user identity?
- What permissions per role?
- API endpoints protected?
- Row-level security (RLS) configured?
- Users access only own data?

### Data Protection
- What's sensitive? (passwords, API keys, payment info, PII)
- Encryption at rest and in transit?
- Environment variables secured?
- Credentials rotated?
- Data exposure in logs/errors?

### Input Validation
- All inputs validated and sanitized?
- Protection against SQL injection?
- Protection against XSS?
- CSRF protection on state-changing operations?
- File uploads validated (type, size, content)?

### API Security
- Rate limits to prevent abuse?
- CORS configured correctly (not `*` unless truly public)?
- API keys/tokens secured?
- Protection against enumeration attacks?
- Error messages sanitized (no stack traces in production)?

### Session & Token Management
- How long do sessions last?
- Tokens invalidated on logout?
- Protection against session fixation?
- Refresh tokens secured?

**Red flags to address immediately:**
- User data rendered without sanitization
- Database queries concatenating user input
- Secrets in code or version control
- Public endpoints returning sensitive data
- Missing authentication on admin routes

---

## PART 3: SCALABILITY PLANNING (Mandatory Before Code)

### Database Design
- Proper indexes on frequently queried columns?
- Foreign keys scale with data growth?
- Any N+1 query patterns?
- Pagination for large datasets?
- Strategy for data archival if needed?

### API Design
- Responses paginated?
- Caching for expensive queries?
- Rate limits appropriate for expected load?
- Request/response size optimization?

### Resource Management
- Expected concurrent user load?
- Memory leaks in long-running processes?
- Proper connection pooling?
- Background jobs queued properly?
- Graceful degradation under load?

### Caching Strategy
- What can be cached? (pages, API responses, computed values)
- Cache invalidation strategy?
- Appropriate use of ISR/SSG vs SSR?
- CDN for static assets?

### Performance Considerations
- Images optimized and served via CDN?
- Code splitting implemented?
- Blocking operations in critical paths?
- Database query performance monitored?

**Red flags to address immediately:**
- No pagination on list endpoints
- Missing indexes on foreign keys
- Synchronous processing of heavy operations
- No rate limiting on public endpoints
- Force-dynamic on high-traffic pages

### Document Decisions
For each feature, state:
- Security measures implemented
- Scalability considerations
- Known limitations
- Future optimization opportunities

---

## PART 4: PUBLIC URLs (Map Before Building)

List every public URL:

| Route | Who sees it | Auth required? |
|---|---|---|
| `/c/[formId]` | Customer filling form | No |
| `/p/[slug]` | Visitor viewing | No |
| `/embed/[widgetId]` | Embedded iframe | No |
| `/dashboard/...` | Logged-in user | Yes |

**Lesson:** Embed page at `/widget/[id]` but code routed to `/embed/[id]` → Silent 404s. Map every route before building.

---

## PART 5: IMPLEMENTATION PATTERNS

### Never Hardcode Base URLs
```js
var base = (
  window.VOUCH_BASE_URL ||
  (document.currentScript && document.currentScript.src.replace('/widget.js', '')) ||
  'https://vouch.so'
);
```
Works in dev, staging, production without changes.

### Use ISR Not Force-Dynamic
For public/embed pages:
```ts
export const revalidate = 60; // revalidate every 60 seconds
```
Force-dynamic turns every request into fresh server render. For high-traffic pages, unnecessary load. Reserve for real-time, user-specific data only.

### Remove Features Completely
When removing feature, find EVERY reference:
- Database column/field
- TypeScript interface
- Supabase .select() string
- Display logic using field
- UI buttons triggering it
- Copy in upgrade dialog

No half-removal. When you remove something, remove it completely.

### Feature Gates Must Match Pricing Page
Before gating any feature as Pro, check pricing page. If pricing says custom questions are free, UI must not gate them. Discrepancies confuse users and generate support tickets.

---

## PART 6: EMPTY STATES & ONBOARDING

### Every Empty State Must Tell User What To Do

**Wrong:**
```
No testimonials yet.
```

**Right:**
```
No testimonials yet
Share your collection form link with customers to start receiving feedback.
[Copy form link]
```

Every empty state must:
1. Explain what user will see here once they have data
2. Tell exactly what action to take to get there
3. Provide direct link or button to that action

### Getting Started Checklist for New Users

Blank screen with no guidance = fastest way to lose users. Build checklist that:
- Shows all required steps
- Checks off automatically based on real data
- Shows progress bar
- Links directly to each incomplete step
- Disappears only when complete

This is core retention feature, not optional polish.

### Auto-Generate Slugs for Free Users

Free users shouldn't need manual slug setup for working public page. When user saves project first time with no slug:
```ts
slug = name.trim().toLowerCase()
  .replace(/[^a-z0-9-]/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '')
  + '-' + Math.random().toString(36).slice(2, 7);
```
Custom slug can be Pro feature (vanity URL), but basic functionality must work for free users.

---

## PART 7: SHARING & EMBED FLOWS

### Every Shareable Asset Needs All Three Methods

When users share (form, widget), they need:
1. Direct link to copy and send anywhere
2. Embed snippet for website builders (Webflow, Squarespace, Wix)
3. Developer snippet (script tag or iframe) for custom HTML

Present all three in single tabbed UI. Don't make user hunt.

### QR Codes for Local Businesses

If product targets in-person customers, QR code is PRIMARY distribution. Link useless for salon owner whose customer stands at counter.

QR flow needs:
- Large, scannable QR rendered client-side (qrcode.react)
- PNG download via canvas: canvas.toDataURL('image/png')
- WhatsApp share with pre-written message template
- Copy link as fallback

### Public Pages Need CTA to Drive Feedback Loop

Public testimonials page showing reviews but no way to leave review = missed opportunity. Add "Share your experience" CTA linking to active collection form. Turns readers into contributors, zero cost.

---

## PART 8: UI COPY RULES

### Never Use Em Dashes in UI
Em dashes (—) look out of place in product UI. Use period, comma, or rewrite.

Applies to:
- Button labels
- Empty state text
- Description text
- Tooltip content
- Dialog body copy

Permanent rule. Violation causes visible quality issues.

---

## PART 9: TECHNICAL IMPLEMENTATION

### iframe Height Auto-Sizing Requires postMessage

Embed page:
```html
<script>
  function sendHeight() {
    window.parent.postMessage({ height: document.body.scrollHeight }, '*');
  }
  sendHeight();
  window.addEventListener('resize', sendHeight);
  setTimeout(sendHeight, 500);
  setTimeout(sendHeight, 1500);
</script>
```

widget.js:
```js
window.addEventListener('message', function(e) {
  if (e.data && e.data.height && e.source === iframe.contentWindow) {
    iframe.style.height = e.data.height + 'px';
  }
});
```

Double setTimeout intentional - re-checks after images/fonts load.

### Single Client Component Boundary

In Next.js App Router:
- Keep pages as server components by default
- Push interactivity into one/two isolated 'use client' components at leaf
- Pass data from server to client as props

Don't fragment tree with many small 'use client' components.

### Optimistic Updates Require Rollback

```ts
// Optimistic
setTestimonials(prev => prev.map(t => t.id === id ? { ...t, featured: newVal } : t));

const { error } = await supabase.from('testimonials').update({ featured: newVal }).eq('id', id);

if (error) {
  // Rollback
  setTestimonials(prev => prev.map(t => t.id === id ? { ...t, featured: !newVal } : t));
  toast.error('Failed to update. Please try again.');
}
```

---

## PART 10: END-TO-END TEST BEFORE "DONE"

Every new feature must pass this sequence before complete:

1. Start from fresh, logged-out browser
2. Sign up with new account
3. Complete every step of getting started checklist
4. Create collection form
5. Submit testimonial via form URL (as customer - different browser/incognito)
6. Approve testimonial in inbox
7. Create embed widget
8. Copy script embed, paste in plain HTML file. Open. Does testimonial appear?
9. Copy iframe embed. Does it render?
10. Visit public page /p/[slug]. Shows testimonial?
11. Click "Share your experience" CTA. Reaches form?

If ANY step fails, product is broken for real users. Run full test, not just part you built.

---

## PART 11: COMMON SILENT FAILURES

These produce no console error, no crash - just silently do nothing:

| Failure | How to catch |
|---|---|
| Wrong attribute name in widget.js | Paste script in test HTML, open it |
| Wrong route in embed generator | Click preview - iframe loads? |
| RLS blocking public query | Test unauthenticated (incognito, sign out) |
| filter_mode ignored (column missing) | Check actual DB query result, not UI |
| ISR cache serving stale | Wait for revalidation, check again |
| Empty state instead of data | Check status values match exactly |

---

## PART 12: WHEN TO BUILD VS SKIP

Only build features in plan and validated against target user.

Can user accomplish same goal without it? If yes, skip.
Is it in scope for current phase? If no, write down for later, skip.
Would removing it later be hard? If yes, be more certain before building.

**Features that seemed necessary but were cut:**
- AI testimonial polish: Added complexity, required LLM API, users wouldn't use. Removed after build.
- "Advanced analytics" in upgrade dialog never built: Misleading, had to be removed.

Build simple version first. Add complexity only when real users ask.
