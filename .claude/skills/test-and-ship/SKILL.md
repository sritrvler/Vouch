---
name: test-and-ship
description: Use BEFORE showing work or deploying. Triggers include "test", "verify", "check if works", "ready to ship", pre-deployment validation. Comprehensive security, QA, and scalability testing. Do NOT use during active development.
---

# Test & Ship

Run before showing any work. Must pass 100% before deployment.

---

## STEP 1: BUILD VERIFICATION

TypeScript build must pass:
```bash
npx next build
```
**Pass:** Exit code 0, "Generating static pages" completes
**Fail:** Fix error, re-run. Don't proceed.

---

## STEP 2: ROUTE SMOKE TESTS

Test each route returns expected status:
- `/` → 200
- `/pricing` → 200
- `/login` → 200
- `/signup` → 200
- `/dashboard` → 307 (redirect when unauthenticated)
- `/c/nonexistent` → 200 (shows 404 UI)
- `/embed/nonexistent` → 200

---

## STEP 3: SECURITY TESTING (MANDATORY)

Act as seasoned security tester. Systematically test for vulnerabilities.

### Authentication & Session Security

**Test: Authentication Bypass**
- Try accessing protected routes without auth → Expect 307 or 401
- Try accessing other users' data with User A token → Expect 403 or 404

**Test: Session Management**
- Log in, copy token
- Log out
- Try using old token → Expect 401 (invalidated)

**Test: Password Security**
- Try weak passwords (123, password, test) → Expect rejection with clear requirements

### Input Validation & Injection

**Test: SQL Injection**
Test ALL input fields with:
```
' OR '1'='1
'; DROP TABLE users; --
1' UNION SELECT * FROM users--
```
Expected: Input rejected OR safely escaped

**Test: XSS (Cross-Site Scripting)**
Test ALL text inputs with:
```html
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
<iframe src="javascript:alert('XSS')">
```
Expected: Content sanitized, scripts not executed

**Test: Path Traversal**
Test file upload/download:
```
../../../etc/passwd
..%2F..%2F..%2Fetc%2Fpasswd
```
Expected: Path validation prevents traversal

### Authorization & Access Control

**Test: Horizontal Privilege Escalation**
- User A creates resource
- User B tries to access/modify via API → Expect 403/404

**Test: Vertical Privilege Escalation**
- Free user tries Pro features → Expect gating, upgrade prompts
- Regular user tries admin endpoints → Expect 403

**Test: IDOR (Insecure Direct Object Reference)**
```bash
# If user's project ID is 5, try:
curl /api/projects/1
curl /api/projects/999
```
Expected: Only authorized IDs return data

### API Security

**Test: Rate Limiting**
Send 100 rapid requests → Expect 429 (Too Many Requests)

**Test: CORS Configuration**
```bash
curl -H "Origin: https://evil.com" -X OPTIONS /api/endpoint
```
Expected: Only allowed origins permitted

**Test: Large Payload**
Send 1MB+ request → Expect 413 (Payload Too Large) or validation error

### Data Exposure

**Test: Error Message Disclosure**
Trigger errors intentionally. Check for:
- Stack traces (shouldn't appear in production)
- Database errors (should be sanitized)
- File paths (shouldn't be exposed)

Expected: Generic error messages only

**Test: API Response Data Leakage**
Check ALL API responses for:
- Passwords or hashes
- API keys or tokens
- Other users' private data
- Deleted/soft-deleted records

### Security Headers

```bash
curl -I /
```
Check for:
- Content-Security-Policy
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY or SAMEORIGIN
- Strict-Transport-Security (HSTS)

### Dependency Vulnerabilities

```bash
npm audit
```
Expected: No high/critical vulnerabilities

---

## STEP 4: QUALITY ASSURANCE TESTING

### Accessibility (A11y)

**Keyboard Navigation:**
- [ ] Tab through all interactive elements
- [ ] Enter activates buttons
- [ ] Escape closes modals
- [ ] Arrow keys work in dropdowns

**Screen Reader:**
- [ ] Form labels announced
- [ ] Error messages announced
- [ ] Dynamic content changes announced (aria-live)

**Color Contrast:**
- [ ] Text on background: ≥4.5:1 (WCAG AA)
- [ ] UI components: ≥3:1

### Cross-Browser Testing

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (Chrome Android, Safari iOS)

### Mobile Responsive

- [ ] Works on mobile (375px width minimum)
- [ ] Works on tablet (768px)
- [ ] Works on desktop (1920px+)
- [ ] Touch targets adequate (44x44px minimum)
- [ ] No horizontal scrolling
- [ ] Text readable without zoom

### End-to-End Flows

- [ ] New user signup works
- [ ] Core user journey completes (create → use → share)
- [ ] Payment flow works (if applicable)
- [ ] Email notifications send (if applicable)

### Exploratory Testing (PERSONA-BASED)

**Critical:** Test as EACH persona from validate-and-plan, not as generic "user" or yourself.

**Persona checklist (verify for each):**

**Sarah (Freelance Designer, Pro target):**
- [ ] Can set up form and send to client in <5 minutes
- [ ] Form looks professional enough to send to a paying client
- [ ] Widget on portfolio site looks custom, not generic
- [ ] Entire flow obvious without reading docs

**Marcus (Agency Owner, Studio target):**
- [ ] Can delegate setup to team member (intuitive for non-technical user)
- [ ] Per-client reports work and look impressive
- [ ] Managing 8+ client projects is not overwhelming

**James (SaaS Founder, Pro target):**
- [ ] Widget embed is a single script tag, loads fast
- [ ] No visible performance impact on landing page
- [ ] Testimonials auto-update without manual intervention
- [ ] Looks premium enough for a SaaS landing page

**Client (giving testimonial):**
- [ ] Can complete in <90 seconds from clicking link
- [ ] No account creation required
- [ ] Works on phone between meetings
- [ ] Progress not lost if interrupted

**Website Visitor (viewing testimonials):**
- [ ] Reviews visible immediately, no clicks needed
- [ ] Widget loads in <2 seconds
- [ ] Trust signals clear (real photos, dates, variety)

If ANY persona's checklist fails, the feature fails. Fix before shipping.

---

## STEP 5: CODE-LEVEL VERIFICATION

These checks are executable in the development environment:

**Empty State Test:** Trace code paths when user has 0 data. Every page must show helpful empty state, not blank screen or error.

**Edge Case Test:** Trace code for boundary values (free plan at limit, null fields, missing relations).

**Error Handling Test:** Trace what happens when Supabase returns error, when fetch fails, when auth expires. Every async operation needs error handling.

**Silent Failure Check:**

| Failure | How to Catch |
|---|---|
| Wrong attribute in widget.js | Paste script in test HTML, open it |
| Wrong route in embed generator | Click preview, does iframe load? |
| RLS blocking public query | Test unauthenticated (sign out) |
| Empty state instead of data | Check status values match exactly |
| ISR cache stale | Wait for revalidation, check again |

---

## STEP 6: DEPLOYMENT CHECKLIST

- [ ] `npx next build` passes
- [ ] All critical security tests passed (auth, RLS, input validation)
- [ ] No high-severity bugs
- [ ] Known issues documented
- [ ] Rollback plan: git checkpoint exists

**Performance budgets (verify with `perf-optimizer` agent when applicable):**
- API response: <500ms, DB query: <100ms, Bundle: <500KB per page

**Production testing (run manually after deploy, not in CLI):**
- Lighthouse audit, cross-browser testing, load testing, mobile device testing
- These require browser/production environment. Flag them for manual verification.

---

## TESTING PHILOSOPHY

Think adversarially. Don't just test happy paths. Test edge cases systematically. Every bug caught in testing is 10x cheaper than fixing in production.
