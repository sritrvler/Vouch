---
name: validate-and-plan
description: Use BEFORE building any new product or feature. Triggers include "should I build", "validate this idea", "new product", "new feature", planning phase. Validates ideas before wasting time building. Do NOT use during active development.
---

# Validate & Plan

Run this BEFORE writing any code. Find holes before building, not after.

---

## Step 1: Define ALL Personas (Specific Real People, Not Generic Roles)

Identify EVERY role involved in your product. For EACH role, create a specific persona.

**NOT THIS:** "Business owner" and "customer"
**THIS:** "Priya (salon owner)" and "Anjali (her customer)"

### For Each Persona, Answer:

**Basic Profile:**
- Name, age, occupation, city?
- Monthly revenue/income?
- Tech comfort level (1-10)?
- Tools used daily? (WhatsApp, Instagram, Excel, etc.)
- Device primarily used? (Phone? Desktop? Old phone?)
- Website? Staff? Time to learn new software?

**Context & Pain:**
- Where are they when using this product? (At shop? On commute? At home?)
- What's their mental state? (Rushed? Tired? Between customers? Relaxed?)
- ONE problem they wake up thinking about?
- How do they currently solve it? (Even if bad)
- What would make them open their wallet without hesitation?

**Constraints & Reality:**
- What can't they do? (No laptop? Slow internet? No credit card?)
- What won't they do? (Won't install app? Won't type long text?)
- What frustrates them most about current solutions?

### Example: Vouch Testimonial Collection

**Persona 1: Sarah (Freelance Designer, Pro plan target)**
- 29, freelance web designer in Austin, earns $6K/month
- Tech comfort: 9/10, uses Figma, Notion, Slack daily
- MacBook at desk, iPhone on the go
- Works from home office and coffee shops, 3-5 active clients
- Problem: Needs social proof for portfolio site but hates asking clients directly
- Current solution: Screenshots LinkedIn recommendations, looks outdated
- Would pay $19/mo: If it saves her the awkwardness and looks professional on her site

**Persona 2: Marcus (Agency Owner, Studio plan target)**
- 41, runs a 6-person branding agency in London, revenue $30K/month
- Tech comfort: 7/10, delegates technical work to team
- Desktop at office, iPad in meetings
- Manages 8-12 client projects simultaneously
- Problem: Needs client testimonials for proposals and case studies, per-client
- Current solution: Asks via email, gets 1 in 5 responses, manually formats them
- Would pay $49/mo: If he can show client-specific reports in pitches

**Persona 3: James (SaaS Founder, Pro plan target)**
- 34, solo founder of a project management tool, 200 users, $4K MRR
- Tech comfort: 10/10, builds his own product, understands APIs and embeds
- MacBook Pro, codes 10 hours a day
- Problem: Needs social proof on landing page to improve conversion from 2% to 4%
- Current solution: Manually coded testimonial section, static, stale
- Would pay $19/mo: If the widget looks premium and auto-updates with fresh testimonials

**Persona 4: Client of Sarah/Marcus (End user who gives testimonial)**
- Busy professional, received a link via email or Slack
- Context: Between meetings, on phone, 2 minutes max
- Willingness: Happy to help if it's quick and doesn't require account creation
- Won't do: Download app, create account, write more than 3 sentences, record video over 60s

**Persona 5: Website Visitor (Views testimonials)**
- Browsing Sarah's portfolio or James's SaaS landing page
- Comparing 3 alternatives, wants to see real reviews fast
- On phone or desktop, impatient, will leave if page is slow
- Needs: Social proof visible immediately, no clicks required

**Minimum personas needed:**
- Primary user (who pays/manages): 1 persona REQUIRED
- End users (who interact with product): 1+ personas
- Visitors/consumers (who view output): 1 persona if applicable

**Red flag:** Can't describe specific people for each role → Stop here. Generic roles = generic product.

---

## Step 2: Walk Journey as EACH Persona (Not Generic "User")

For EACH persona from Step 1, walk through their COMPLETE journey. Do this separately for each persona.

### Template: [Persona Name]'s Journey

**Context:**
- Where: [At shop? On commute? At home?]
- Device: [Phone? Desktop? Tablet?]
- Mental state: [Rushed? Tired? Focused?]
- Time available: [30 seconds? 5 minutes?]

**Journey Steps:**
Write every single step this specific persona takes:

**Step 1:** [What do they see?]
- Action required: [What must they do?]
- Friction: [What makes this hard for THIS persona?]
- Time: [How long with their skill level and device?]
- Drop-off risk: [What would make them quit here?]

**Step 2:** [Next screen/action]
- Action required: [...]
- Friction: [...]
- Time: [...]
- Drop-off risk: [...]

[Continue for every step]

### Persona-Specific Tests

**The "distracted [persona name]" test:**
Simulate THIS persona's actual context:
- Sarah (freelancer): Between client calls, Slack pinging, needs to send form link in 30 seconds
- Marcus (agency owner): In back-to-back meetings, iPad in hand, delegate asks "where's the testimonial report?"
- James (SaaS founder): Deploying a fix while checking conversion metrics, wants to embed widget in 2 minutes
- Client: Just got email link, between meetings, will close tab if it takes more than 90 seconds

Does journey still complete?

**The "write twice" test:**
Does THIS persona need to do essentially the same action twice?
- Example: Fill Vouch form AND write Google review = Anjali won't do both
- Result: Journey fails for this persona

**The "effort vs pain" test:**
For THIS persona specifically:
- Effort required: [Low/Medium/High for their skill level and context]
- Pain being solved: [How urgent/important for them?]
- If effort > pain → Drop-off guaranteed

### Example: Sarah's Journey (Freelance Designer)

**Context:**
- Where: Home office, between Figma sessions
- Device: MacBook, Chrome, fast WiFi
- Mental state: Productive but task-switching, wants to knock this out quickly
- Time: 5 minutes max before context-switching back to client work

**Journey:**
1. **Create collection form**
   - Sees: Dashboard with "Create Form" button
   - Action: Name form, customize questions, copy link
   - Friction: If customization is complex → she'll use defaults. If defaults look cheap → she won't send it.
   - Time: 2-3 minutes
   - Drop-off: If form preview doesn't match her brand aesthetic → she'll hesitate to send

2. **Send form to client**
   - Sees: Share options (copy link, email)
   - Action: Copy link, paste into Slack DM with client
   - Friction: None if copy-paste works cleanly
   - Time: 15 seconds
   - Drop-off: If she has to explain what this is → too much friction

3. **Approve testimonial and embed**
   - Sees: Email notification, opens inbox, approves
   - Action: Approve, go to widget builder, copy embed code
   - Friction: If widget looks generic → she won't embed it on her portfolio
   - Time: 2 minutes
   - Drop-off: If embed doesn't match her site's design system

**Verdict for Sarah:** Journey works IF:
- Form looks professional enough to send to a paying client
- Total time from signup to embedded widget < 15 minutes
- Widget on her portfolio looks custom, not "powered by Vouch"
- If any step requires reading docs or watching tutorials → she'll abandon

### Red Flags (Persona-Specific)

Stop if you find:
- Any step requires skills/tools this persona doesn't have
- Any step requires more time than this persona has available
- Any step requires mental bandwidth this persona doesn't have in their context
- Flow works for generic "user" but fails for specific persona
- You're designing for yourself (developer context) not actual persona

**Critical:** If journey fails for ANY key persona, entire product fails. Don't build until all persona journeys work.

---

## Step 3: "Would [Persona Name] Actually Do This?" Test

For EVERY key action in the journey, test as EACH persona. Don't test as generic "user" or as yourself.

### For Each Persona, Ask:

**1. Simulate their actual context**
Put yourself in their exact situation:
- **Priya:** At salon, customer just left, next one arrives in 5 minutes, phone battery at 20%
- **Anjali:** In taxi, heading to meeting, driver asking for directions, phone signal weak
- **Ravi:** Browsing on commute, standing in crowded train, one hand holding rail

**2. Run through action as them**
- Would THEY actually do this in THEIR context?
- Do THEY have the skills/tools needed?
- Is this worth THEIR time given THEIR pain level?
- What would make THEM stop?

**3. Ask one other person to simulate the persona**
- Brief them on persona's context
- Watch them attempt the journey
- Don't guide them - observe raw reaction
- If they struggle or quit = persona would too

### Example: Testing Testimonial Submission

**As Sarah (Freelance Designer):**
- Context: Just finished a project, wants to collect testimonial while client is happy
- Test: "Would I actually send this link to my client right now?"
- Answer: YES - IF the form looks professional and branded, takes 30 seconds to set up
- Answer: NO - If the form looks generic or cheap, she won't risk her professional image

**As James (SaaS Founder):**
- Context: Wants social proof on landing page to improve conversion
- Test: "Would I actually switch from my hand-coded testimonials to this?"
- Answer: YES - IF the widget looks premium, loads fast, and the embed is a single script tag
- Answer: NO - If it adds page weight, looks like a third-party widget, or requires React dependency

**As Client (giving testimonial):**
- Context: Got a Slack message from Sarah with a link, between meetings
- Test: "Would I actually click this link and leave feedback?"
- Answer: YES - IF it loads instantly, has 2-3 questions, and I can type or record in under 90 seconds
- Answer: NO - If it asks me to create an account, sign in, or answer more than 5 questions

### Failure Signals (Persona-Specific)

Mark as "NO" if:
- Persona says "I probably wouldn't" = NO
- Persona says "Maybe if I had time" = NO (they never have time)
- Persona starts action but stops halfway = NO
- You need to explain or guide them = NO (won't have guide in real life)
- Works for YOU but not for THEM = NO

### The Honest Truth Test

**Don't bullshit yourself:**
- Sarah won't read docs or watch onboarding videos (she'll try the UI and give up if it's not obvious)
- Marcus won't set up the tool himself (he'll assign it to a team member, who will abandon it if setup takes >10 minutes)
- James won't use a widget that hurts his Lighthouse score (he'll rip it out the same day)
- Clients won't leave a testimonial if it takes more than 90 seconds (they're doing someone a favor, not getting paid)

If your honest answer is "probably not" for ANY key persona, treat as "NO". Fix the journey or don't build.

**Red flag:** Journey works for generic "user" but fails when you actually simulate as specific persona → Re-design or don't build.

---

## Step 4: Free Alternative Audit

List every free/cheap way customer can solve this now:

| Solution | Cost | Effort | How good? |
|---|---|---|---|
| [Free alternative 1] | $0 | Low/Med/High | Good/Ok/Bad |
| [Our product] | $X/mo | Low/Med/High | Good/Ok/Bad |

Then answer:
- Why pay instead of using free option?
- Is our product 10x better, or just slightly better?
- What happens to our value if free option improves?

**Red flag:** Free alternative works "well enough" → No market. "Slightly better" is not a business.

---

## Step 5: Feature-Customer Fit

List every feature. For EACH, verify:

| Feature | Does customer have what this needs? | Will they actually use it? | Verdict |
|---|---|---|---|
| Embed widget | Needs website | Most don't | Cut/deprioritize |
| Approval flow | Needs time to log in daily | Probably won't | Auto-approve default |

Questions per feature:
- Does this customer have a website?
- Do they have staff to manage this?
- How often will they realistically use this per week?
- What does their day look like - time for this?

**Red flag:** >50% of features don't match customer reality → Building for wrong person.

---

## Step 6: Pricing Validation

Answer all:
1. Target customer's monthly revenue/income?
2. What % is this subscription? (Should be <0.5% for easy sell)
3. What does one new customer bring them in revenue?
4. How many new customers/month needed to justify price?
5. What do competitors charge in this market?
6. What does comparable utility cost in this market?
7. Would target customer (Step 1) pay this? Why/why not?

**Market-specific:** Vouch targets Western professionals ($19/mo Pro, $49/mo Studio). For Sarah ($6K/mo), $19 is 0.3% of income. For Marcus ($30K/mo), $49 is 0.16%. Both pass the <0.5% test. Validate that value proposition matches the specific persona's willingness to pay.

**Red flag:** Customer needs >1-2 extra sales per month to justify price → Hard sell.

---

## Step 7: Technical Claim Audit

List every claimed feature/benefit. For each:

| Claim | Technically possible? | Do we build it? | Evidence for metric? |
|---|---|---|---|
| "Review firewall" | No - Google is public | No | N/A |
| "3x more reviews" | Unverified | Unverified | No data |

Questions:
- Can third parties post to platform on behalf of users? (Usually no)
- Are there metrics in copy ("3x", "68%")? Where from? If made up, remove.
- Features mentioned in copy but not built? Remove or build.

**Red flag:** Any claim that can't be technically delivered is liability, not feature.

---

## Step 8: Assumption List

Write every assumption product is built on. Rate each: Verified / Unverified / Probably Wrong.

Examples:
- "Customers will write review on Vouch AND Google" → Probably Wrong
- "Local businesses want to curate testimonials for website" → Wrong (most no website)
- "Business owners log in daily to approve submissions" → Probably Wrong

For each unverified/wrong: Either validate with real data, or redesign so doesn't depend on it.

---

## Step 9: Devil's Advocate

Argue AGAINST building this. Strongest case it's a bad idea.

Cover:
- Why target customer doesn't actually need this
- Why they won't pay for it
- Why free alternatives are good enough
- Why timing is wrong
- Why competitor could copy in a week
- Why market is smaller than it looks

Then, if product still makes sense after this attack, explain why it survives each objection.

**This is not optional.** Every idea sounds good to person who thought of it. This finds what they can't see.

---

## Step 10: Verdict

Based on all above, output ONE:

**BUILD** — Customer clearly defined, journey works, pricing fits, claims real, assumptions verified. Proceed.

**MODIFY** — Core idea sound but [specific things] need to change before building. List exactly what.

**DO NOT BUILD** — Product doesn't survive analysis. Market wrong, pricing doesn't work, or core assumption false. Explain why and suggest what to explore instead.

---

## Final Checklist

- [ ] Defined specific personas for ALL roles (not generic "user" or "business owner")?
- [ ] Each persona has name, context, constraints, pain, motivation?
- [ ] Walked through COMPLETE journey for EACH persona separately?
- [ ] Would EACH persona personally complete their journey in their actual context?
- [ ] Tested "would [persona name] do this?" for every key action?
- [ ] Free alternative exists, and we're genuinely 10x better FOR EACH PERSONA?
- [ ] Every feature maps to what EACH persona actually has and does?
- [ ] Price <0.5% of PRIMARY PERSONA's monthly revenue?
- [ ] All claims technically true and actually built?
- [ ] Listed assumptions and challenged each one?
- [ ] Argued against building and survived the argument?
- [ ] Simulated as each persona with one other person - they completed journey?

If any unchecked, do not start building. Resolve first.

**Remember:** Generic "users" don't exist. Priya, Anjali, and Ravi do. Build for them, not for abstractions.
