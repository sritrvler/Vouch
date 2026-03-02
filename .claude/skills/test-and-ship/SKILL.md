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

### Exploratory Testing (PERSONA-BASED - Not Generic "User")

**Critical:** Test as EACH specific persona from validation, not as generic "user" or yourself.

Reference personas defined in validate-and-plan. For EACH persona, run their complete journey in their actual context.

**Scenario 1: Test as [Primary Persona] - e.g., Priya (Salon Owner)**

**Setup their context:**
- Device: Use their actual device type (old Android, not your MacBook)
- Location: Simulate their environment (noisy salon, interruptions)
- Mental state: Rushed, distracted, battery low
- Time pressure: Customer arriving in 3 minutes

**Test their journey:**
1. Can she complete primary task (send form) in <30 seconds?
2. Does it work if she's interrupted mid-flow? (Lock phone, come back)
3. Can she do it without reading instructions?
4. Does it work on slow connection?
5. What happens if she makes mistakes? (Clicks wrong button, etc.)

**Expected results:**
- All actions completable with one thumb
- No precision required (fat-finger friendly)
- Works with interruptions
- Clear what to do next without guidance

**Actual results:**
- [Document what happened]
- [Note where she struggled]
- [Note what would make her quit]

---

**Scenario 2: Test as [End User Persona] - e.g., Anjali (Customer)**

**Setup their context:**
- Device: iPhone, in taxi, weak signal
- Mental state: Busy, next meeting in 10 minutes
- Willingness: Will do it IF <2 minutes total

**Test their journey:**
1. Can she fill form in <90 seconds?
2. Does it work on 3G?
3. Can she do it while walking? (Simulate motion)
4. Does it work without account creation?
5. Is progress saved if she gets interrupted?

**Expected results:**
- Form completable in <2 minutes
- Works on slow connection
- No account required
- Clear progress indicator

**Actual results:**
- [Document experience]
- [Time taken]
- [Friction points]

---

**Scenario 3: Test as [Viewer Persona] - e.g., Ravi (Website Visitor)**

**Setup their context:**
- Device: Phone, browsing on commute
- Goal: Compare 3 salons, make decision
- Patience: Will spend max 30 seconds per salon

**Test their journey:**
1. Can he see reviews without clicking?
2. Does page load in <3 seconds on 3G?
3. Are reviews clearly real (photos, recent dates, variety)?
4. Can he tell which salon is better quickly?

**Expected results:**
- Reviews visible immediately
- Page loads <3 seconds
- Social proof clear
- Decision-making easy

**Actual results:**
- [Load time]
- [What he saw first]
- [Whether he could make decision]

---

### Additional Persona-Specific Scenarios

**Scenario 4: The [Persona] Under Pressure**
- Priya: Customer walks in mid-flow, phone call interrupts
- Anjali: Taxi driver asking for directions while she's filling form
- Ravi: Buffering on slow connection, about to give up

Expected: Everything works under real-world pressure

**Scenario 5: The [Persona] Making Mistakes**
- Priya: Clicks wrong button, needs to go back
- Anjali: Starts typing, deletes, starts again
- Ravi: Accidentally closes tab, returns later

Expected: Forgiving UX, no data loss, easy recovery

**Scenario 6: The [Persona] At Their Limits**
- Priya: End of long day, tired, multiple customers waiting
- Anjali: Phone battery at 5%, rushing between meetings
- Ravi: Browsing at night, eyes tired, low patience

Expected: Still usable when they're at their worst

---

### Persona Testing Checklist

For EACH persona, verify:

**[Primary Persona - Priya]:**
- [ ] Can complete primary task in <30 seconds
- [ ] Works with interruptions (lock/unlock phone)
- [ ] No typing required (or minimal)
- [ ] Works without reading instructions
- [ ] Survives real-world chaos (customer walks in)

**[End User Persona - Anjali]:**
- [ ] Can complete in <2 minutes total
- [ ] Works on 3G/slow connection
- [ ] No account creation required
- [ ] Completable while walking/moving
- [ ] Progress saved if interrupted

**[Viewer Persona - Ravi]:**
- [ ] Sees what he needs without clicking
- [ ] Page loads <3 seconds on 3G
- [ ] Can make decision in <30 seconds
- [ ] Trust signals clear (real reviews, photos)

If ANY persona's checklist fails, the feature fails. Fix before shipping.

---

### The Persona Reality Check

**After testing, ask honestly:**

1. **Would Priya actually use this between customers?**
   - If she needs to remember password → NO
   - If it takes >30 seconds → NO
   - If it requires typing → MAYBE (friction point)

2. **Would Anjali actually complete this while busy?**
   - If it requires account → NO
   - If it takes >2 minutes → NO
   - If she can't see progress → NO

3. **Would Ravi actually wait for this to load?**
   - If load time >3 seconds → NO
   - If reviews require action from him → NO
   - If social proof unclear → NO

**Critical:** Test in their actual context, not yours. Your MacBook with fiber internet is not Priya's 3-year-old Android on salon WiFi.

---

## STEP 5: SCALABILITY & PERFORMANCE TESTING

### Database Performance

**Test with 10x Data:**
```sql
-- Create 10x normal data volume
-- Measure query times
EXPLAIN ANALYZE SELECT * FROM testimonials WHERE user_id = 'test' ORDER BY created_at DESC LIMIT 20;
```
Expected: Query <100ms even with 10x data

**Test: Index Effectiveness**
- Check EXPLAIN output
- Verify indexes used
Expected: All foreign keys and frequently queried columns indexed

**Test: N+1 Detection**
Load list page with related data
Check query count
Expected: Constant queries (not N+1)

### API Performance

**Test: Concurrent Requests**
```bash
ab -n 1000 -c 50 /api/endpoint
```
Expected:
- No failed requests
- Average response <500ms
- P95 latency <1s

**Test: Response Size**
Expected:
- Responses <1MB
- Pagination prevents massive payloads

### Frontend Performance

**Lighthouse Audit:**
- First Contentful Paint: <1.8s
- Largest Contentful Paint: <2.5s
- Time to Interactive: <3.8s
- Cumulative Layout Shift: <0.1
- First Input Delay: <100ms

**Bundle Size:**
- Main bundle <500KB
- Each page <200KB
- Lazy loading for heavy components

**Memory Leaks:**
- Record heap snapshot
- Perform actions
- Take another snapshot
Expected: Memory returns to baseline

---

## STEP 6: BREAKING POINT TESTS

**Empty State Test:**
- Delete all data
- Visit every page
Expected: Helpful empty states, no blank screens

**Overload Test:**
- Create 1,000 records
- Visit list pages
Expected: Pagination works, performance <2s load

**Network Failure Test:**
- Start action
- Kill network mid-request
Expected: Loading state, timeout handled, retry option

**Malformed Data Test:**
```
<script>alert('xss')</script>
SQL injection strings
10,000 character strings
```
Expected: Input rejected/sanitized

**Mobile Experience Test:**
- One-thumb navigation
- Small screen
- Slow connection
Expected: All actions completable, no precision required

---

## STEP 7: FINAL REPORT

### Build & Smoke Tests
| Test | Status | Notes |
|---|---|---|
| TypeScript build | ✅/❌ | |
| Routes accessible | ✅/❌ | |
| API endpoints | ✅/❌ | |
| Static assets | ✅/❌ | |

### Security Tests
| Category | Status | Critical Issues |
|---|---|---|
| Authentication | ✅/❌ | |
| Input Validation (SQL, XSS) | ✅/❌ | |
| Authorization | ✅/❌ | |
| API Security | ✅/❌ | |
| Data Exposure | ✅/❌ | |
| Security Headers | ✅/❌ | |
| Dependencies | ✅/❌ | |

### Performance Tests
| Metric | Target | Actual | Status |
|---|---|---|---|
| Page load | <3s | | ✅/❌ |
| API response | <500ms | | ✅/❌ |
| DB query | <100ms | | ✅/❌ |
| Bundle size | <500KB | | ✅/❌ |
| Lighthouse | >90 | | ✅/❌ |

### QA Tests
| Type | Status |
|---|---|
| Accessibility (WCAG AA) | ✅/❌ |
| Cross-browser | ✅/❌ |
| Mobile responsive | ✅/❌ |
| End-to-end flows | ✅/❌ |
| Exploratory testing | ✅/❌ |

### Known Issues & Limitations
```
Issue #1: [Description]
- Impact: High/Medium/Low
- Workaround: [If any]
- Fix planned: Yes/No

[Document all known issues]
```

### Scalability Limits
```
✅ Current capacity: [X users, Y requests/min]
⚠️ Degradation point: [When performance degrades]
❌ Breaking point: [Hard limits]
📋 Optimization plan: [Next steps]
```

---

## STEP 8: DEPLOYMENT CHECKLIST

- [ ] All critical security tests passed
- [ ] Performance budgets met
- [ ] No high-severity bugs
- [ ] Known issues documented
- [ ] Rollback plan prepared
- [ ] Monitoring/alerts configured

**Confidence Level:** High / Medium / Low

**Recommendation:** DEPLOY / FIX ISSUES FIRST / NOT READY

---

## TESTING PHILOSOPHY

**Quality is not an accident. It's a deliberate practice.**

Before deployment, ask:
- Have I tried to break this?
- Have I tested as malicious user?
- Have I tested at scale?
- Have I tested all user roles?
- Have I tested all edge cases?
- Have I documented the limits?

If any answer is "no" - test more before shipping.

**Goal:** Ship with confidence, knowing exactly what works, what breaks, and where the limits are.

---

## COMMON SILENT FAILURES

Check these explicitly:

| Failure | How to Catch |
|---|---|
| Wrong attribute in widget.js | Paste script in test HTML, open it |
| Wrong route in embed generator | Click preview - iframe loads? |
| RLS blocking public query | Test unauthenticated |
| Empty state instead of data | Check status values match exactly |
| ISR cache stale | Wait for revalidation, check again |

---

## PERFORMANCE BUDGET

Enforce these budgets:

**Page Load:**
- Initial bundle: <500KB
- API response: <100ms
- Images: <2MB total

**API Response:**
- Simple GET: <100ms
- Complex query: <500ms
- File upload: <2s

**Database Query:**
- Single record: <10ms
- Paginated list: <50ms
- Complex join: <100ms

If any budget exceeded, optimization mandatory before deployment.

---

## ACT AS SEASONED TESTER

Think adversarially:
- Don't just test happy paths - try to break things
- Test edge cases systematically
- Document breaking points
- Test in production-like environments

**Every bug caught in testing is 10x cheaper than fixing in production.**
