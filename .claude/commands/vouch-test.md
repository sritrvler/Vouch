# /vouch-test — Full Pre-Release Verification

Run this before asking the user to test anything. It must pass 100% before showing work.

## Step 1 — TypeScript Build
Run: `export PATH="/c/Program Files/nodejs:$PATH" && cd "/c/Users/Srinath/OneDrive/Desktop/Sample/vouch" && npx next build 2>&1`

**Pass criteria:** Exit code 0, "Generating static pages" completes, all routes listed.
**Fail action:** Read the error, fix the file, re-run. Do not proceed until build passes.

## Step 2 — Route Smoke Tests
Start dev server in background, then test each route returns expected HTTP status:

Start server: `export PATH="/c/Program Files/nodejs:$PATH" && cd "/c/Users/Srinath/OneDrive/Desktop/Sample/vouch" && npx next dev --port 3001`

Wait 5 seconds, then check:
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/` → expect 200
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/pricing` → expect 200
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/login` → expect 200
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/signup` → expect 200
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/dashboard` → expect 307 (redirect to login when unauthenticated)
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/c/nonexistent-form` → expect 200 (shows 404 UI)
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/embed/nonexistent` → expect 200

## Step 3 — API Route Tests
- `curl -X POST http://localhost:3001/api/testimonials/submit -H "Content-Type: application/json" -d '{}' -w "\nStatus: %{http_code}"` → expect 400 (validation error)
- `curl -X POST http://localhost:3001/api/testimonials/enhance -H "Content-Type: application/json" -d '{}' -w "\nStatus: %{http_code}"` → expect 401 (unauthenticated)
- `curl -X POST http://localhost:3001/api/stripe/checkout -w "\nStatus: %{http_code}"` → expect 401
- `curl http://localhost:3001/api/testimonials/widget/nonexistent -w "\nStatus: %{http_code}"` → expect 404

## Step 4 — Collect Form Test
- `curl -X POST http://localhost:3001/api/testimonials/submit -H "Content-Type: application/json" -d '{"formId":"test","authorName":"Test User","rating":5,"content":"This is a test testimonial that is long enough"}' -w "\nStatus: %{http_code}"` → expect 404 (form not found, but validation passes)

## Step 5 — Widget CORS Test
- `curl -I http://localhost:3001/api/testimonials/widget/test` → response must include `Access-Control-Allow-Origin: *`

## Step 6 — Static Asset Test
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/widget.js` → expect 200

## Step 7 — Stop dev server
Kill the background server process.

## Step 8 — Report
Output a table:
| Check | Status | Notes |
|---|---|---|
| TypeScript build | ✅/❌ | |
| All routes return correct status | ✅/❌ | List any failures |
| API validation works | ✅/❌ | |
| API auth gates work | ✅/❌ | |
| CORS headers present | ✅/❌ | |
| widget.js accessible | ✅/❌ | |

If any check fails, fix it before reporting to user.
