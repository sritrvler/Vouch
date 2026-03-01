# /build-lessons — Implementation Quality Checklist for SaaS Products

Run this WHILE building any new feature or product. These are hard-won lessons from building Vouch. Each item here represents a real mistake that was caught late — sometimes after the feature was shipped.

---

## Part 1 — Before Writing Any Code

### Lock down the data model first

Before building any UI, map out the complete schema. Ask:

- What are the foreign key relationships?
- What status fields exist and what values are valid? (`pending`, `approved`, `rejected` — not booleans)
- What is owned by a user vs. owned by a project vs. owned by a team?
- What gets displayed publicly vs. what stays private?

**Lesson:** When `testimonials.status` was defined as a string enum (`pending`/`approved`/`rejected`) but treated as a boolean in some queries, filtering bugs appeared silently. Define the shape once and never deviate.

---

### Know the public-facing URLs before building the first page

List every public URL the product will have:

| Route | Who sees it | Auth required? |
|---|---|---|
| `/c/[formId]` | Customer filling out form | No |
| `/p/[slug]` | Visitor viewing testimonials | No |
| `/embed/[widgetId]` | Embedded in iframe | No |
| `/dashboard/...` | Logged-in user | Yes |

**Lesson:** The embed page was originally at `/widget/[id]` but all the code routed to `/embed/[id]`. The mismatch caused embeds to silently 404. Map every route before building.

---

### Check that every public script attribute name is consistent

If a script tag uses `data-widget-id`, then `widget.js` must query `[data-widget-id]`. They must match exactly. This sounds obvious — it was still wrong at launch.

**Lesson:** `widget.js` queried `[data-vouch-widget]` but the embed code generator produced `data-widget-id`. Every user who pasted the script embed would see nothing. Verify attribute names end-to-end, not just in isolation.

---

## Part 2 — Writing the Code

### Never hardcode a base URL in a public script

`widget.js` initially hardcoded `https://app.vouch.so`. The correct pattern is:

```js
var base = (
  window.VOUCH_BASE_URL ||
  (document.currentScript && document.currentScript.src.replace('/widget.js', '')) ||
  'https://vouch.so'
);
```

This makes the script work in development, staging, and production without changes. If you hardcode a domain in a script file that gets deployed to production, it will break in every other environment.

---

### Use `revalidate` not `force-dynamic` for embed/public pages

Public pages that serve widget content should use ISR, not force-dynamic:

```ts
export const revalidate = 60; // revalidate every 60 seconds
```

`force-dynamic` turns every request into a fresh server render. For embed pages hit thousands of times per day by iframes, this is unnecessary load. 60-second stale content is perfectly acceptable for testimonial widgets. Reserve `force-dynamic` only for pages that must show real-time, user-specific data.

---

### Remove features completely — no half-removal

When a feature is removed (e.g. AI testimonial enhancement), find every reference:

- The database column or field
- The TypeScript interface
- The Supabase `.select()` string
- Any display logic using the field (`enhanced_content || content`)
- Any UI buttons that triggered it
- Any copy in the upgrade dialog that mentioned it

**Lesson:** After the AI feature was removed, `enhanced_content` remained in the `Testimonial` interface, the select query, and the display logic. It caused no visible error — just dead code that could confuse future development. When you remove something, remove it completely.

---

### Upgrade dialogs must reflect current features

Every time features are added, removed, or changed, update the upgrade dialog copy. An upgrade prompt that lists `AI enhancement` as a Pro feature when that feature does not exist destroys trust.

Keep a single source of truth for what each plan includes and reference it in all UI copy.

---

### Feature gates must match the pricing page

Before adding a Pro gate to any feature, check the pricing page. If the pricing page says custom questions are free, the UI must not gate custom questions. Discrepancies will confuse users and generate support tickets.

**Lesson:** Custom form questions were gated as Pro in the UI but listed as free on the pricing page. The gate was wrong and had to be removed.

---

## Part 3 — Empty States and Onboarding

### Every empty state must tell the user what to do next

An empty state that just says "No testimonials yet" is a dead end. Every empty state must:

1. Explain what the user will see here once they have data
2. Tell them exactly what action to take to get there
3. Provide a direct link or button to that action

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

---

### New users need a getting started checklist, not an empty dashboard

When a new user logs in for the first time, their dashboard is entirely empty. A blank screen with no guidance is the fastest way to lose them. Build a getting started checklist that:

- Shows all required steps (Set up project, Create form, Receive first testimonial, Approve and embed)
- Checks off steps automatically based on real data
- Shows a progress bar
- Links directly to each incomplete step
- Disappears only when all steps are complete

This is not optional polish — it is a core retention feature.

---

### Auto-generate slugs for free users

Free users should not need to manually set a project slug to get a working public page. When the user saves their project for the first time and no slug is set, auto-generate one:

```ts
slug = name.trim().toLowerCase()
  .replace(/[^a-z0-9-]/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '')
  + '-' + Math.random().toString(36).slice(2, 7);
```

The custom slug can remain a Pro feature (vanity URL), but basic functionality must work for free users without extra steps.

---

## Part 4 — Sharing and Embed Flows

### Every shareable asset needs all three methods in one place

When users want to share something (a collection form, a widget), they need:

1. A direct link they can copy and send anywhere
2. An embed snippet for website builders (Webflow, Squarespace, Wix)
3. A developer snippet (script tag or iframe) for custom HTML

Present all three in a single tabbed UI. Do not make the user hunt across multiple pages for each method.

---

### Physical-first sharing: QR codes are not optional for local businesses

If the product targets businesses that serve in-person customers, a QR code is the primary distribution method. A link is useless for a salon owner whose customer is standing at the counter. Build the QR code flow into the core product — not as an afterthought.

The QR flow needs:
- A large, scannable QR rendered client-side (`qrcode.react`)
- PNG download via canvas: `canvas.toDataURL('image/png')`
- WhatsApp share button with a pre-written message template
- Copy link as a fallback

---

### Public pages need a CTA to drive the feedback loop

A public testimonials page (`/p/[slug]`) that shows reviews but has no way to leave a review is a missed opportunity. Always add a "Share your experience" CTA that links to the active collection form. This turns readers into contributors and is zero extra cost.

---

## Part 5 — UI Copy Rules

### Never use em dashes in UI copy

Em dashes (`—`) are a typographic convention that looks out of place in product UI. Use a period, a comma, or rewrite the sentence. This applies to:

- Button labels
- Empty state text
- Description text
- Tooltip content
- Dialog body copy

This is a permanent rule. Violation causes visible UI quality issues.

---

### Never use platform-specific formatting in responses

In all written responses, documentation, and comments:

- Do not use `-` as a bullet point character (use numbered lists or write in prose)
- Do not use `—` em dashes
- Do not use smart quotes in code contexts

---

## Part 6 — Architecture Decisions

### iframe height auto-sizing requires postMessage

Embedded iframes do not know their own height from the parent context. The embed page must send its height to the parent via postMessage, and the parent script must listen and set the iframe height:

In the embed page:
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

In `widget.js`:
```js
window.addEventListener('message', function(e) {
  if (e.data && e.data.height && e.source === iframe.contentWindow) {
    iframe.style.height = e.data.height + 'px';
  }
});
```

The double setTimeout (500ms, 1500ms) is intentional — it re-checks height after images and fonts load.

---

### Use a single client component boundary, not many small ones

In Next.js App Router, adding `'use client'` to many small components fragments the component tree and causes unnecessary client-side hydration. Instead:

- Keep pages as server components by default
- Push interactivity into one or two isolated `'use client'` components at the leaf level
- Pass data from server to client components as props

---

### Optimistic updates require a rollback handler

Any UI action that calls Supabase (toggle featured, approve testimonial, etc.) should update local state immediately for fast UX, then roll back if the server call fails:

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

## Part 7 — The End-to-End Test Before Calling Anything Done

Every new feature must pass this exact test sequence before it is considered complete:

1. **Start from a fresh, logged-out browser**
2. Sign up with a new account
3. Complete every step of the getting started checklist
4. Create a collection form
5. Submit a testimonial via the form URL (as the customer — different browser or incognito)
6. Approve the testimonial in the inbox
7. Create an embed widget
8. Copy the script embed code and paste it into a plain HTML file. Open the HTML file. Does the testimonial appear?
9. Copy the iframe embed code. Does it render correctly?
10. Visit the public page `/p/[slug]`. Does it show the testimonial?
11. Click the "Share your experience" CTA. Does it reach the form?

**If any step in this chain fails, the product is broken for real users.** Run this full test, not just the part you just built.

---

## Part 8 — Common Silent Failures to Always Check

These failures produce no console error and no visible crash — the product just silently does nothing:

| Failure | How to catch it |
|---|---|
| Wrong attribute name in `widget.js` | Manually paste the script into a test HTML file and open it |
| Wrong route in embed code generator | Click the preview — does the iframe actually load? |
| Supabase RLS blocking a public query | Test as unauthenticated (incognito, sign out first) |
| `filter_mode` ignored because column missing | Check the actual DB query result, not just the UI |
| ISR cache serving stale data | Wait for revalidation period and check again |
| Empty state showing instead of data (wrong query filter) | Check status values match exactly — `'approved'` not `'Approved'` |

---

## Part 9 — When to Build vs. When to Skip

Only build features that are in the plan and validated against the target user. When asked to build something extra:

- Can the user accomplish the same goal without it? If yes, skip it.
- Is it in scope for the current phase? If no, write it down for later and skip it.
- Would removing it later be hard? If yes, be more certain before building it.

**Specific features that seemed necessary but were cut or should have been cut earlier:**

- AI testimonial polish: added complexity, required an LLM API call, and users would not use it. Removed after build.
- Google Review URL as a default free feature: the review funnel assumption was wrong. Gated as Pro (but even then, the core assumption needs validation before building the feature at all).
- "Advanced analytics" in the upgrade dialog that was never built: misleading and had to be removed.

Build the simple version first. Add complexity only when real users ask for it.
