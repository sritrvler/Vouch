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

**Persona 1: Priya (Salon Owner)**
- 32, runs 2-person salon in Mumbai, makes ₹40k/month
- Tech comfort: 5/10, uses WhatsApp/Instagram daily
- Only has phone (Android, 3 years old), no laptop
- At salon 10am-8pm, checks phone between customers
- Problem: Needs testimonials but asking feels awkward
- Current solution: Nothing systematic, asks verbally sometimes
- Would pay: If it brought 2-3 extra customers per month

**Persona 2: Anjali (Priya's Customer)**
- 28, marketing professional, busy schedule
- Tech comfort: 8/10, uses apps daily
- Has iPhone, always connected
- Context: Just finished salon visit, heading to next meeting
- Willingness: Would share feedback if it takes <2 minutes on phone
- Won't do: Fill long forms, create accounts, switch apps

**Persona 3: Ravi (Website Visitor)**
- 35, looking for salon for wife's birthday
- Tech comfort: 6/10, browses on phone during commute
- Context: Comparing 3 salons, reading reviews on each
- Needs: Social proof, recent reviews, real photos
- Won't do: Sign up to see reviews, click multiple times

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
- Priya (salon owner): Between customers, phone keeps getting interrupted, customer walks in mid-flow
- Anjali (customer): On phone, in hurry, taxi arriving in 2 minutes
- Ravi (visitor): Browsing on slow 3G, comparing 3 options simultaneously

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

### Example: Priya's Journey (Salon Owner)

**Context:**
- Where: At salon, between customers
- Device: Android phone, 3 years old, sometimes slow
- Mental state: Rushed, next customer arriving soon
- Time: Maybe 2 minutes if lucky

**Journey:**
1. **Send form to customer**
   - Sees: QR code and WhatsApp share option
   - Action: Tap WhatsApp, select contact, send
   - Friction: Need to find customer's contact (might not have it saved)
   - Time: 15-30 seconds
   - Drop-off: If needs to manually type number → too slow, customer waiting

2. **Wait for testimonial**
   - Sees: Notification when testimonial arrives
   - Action: None required
   - Friction: None
   - Time: N/A
   - Drop-off: None

3. **Approve/reject testimonial**
   - Sees: Notification, opens link
   - Action: Read testimonial, tap approve
   - Friction: If login required → friction, if inline approve → smooth
   - Time: 20 seconds
   - Drop-off: If requires app download or account creation → high

**Verdict for Priya:** Journey works IF:
- ✅ No typing phone numbers (QR or pre-saved contacts only)
- ✅ No login required for approval (magic link or inline)
- ✅ Total time <90 seconds per testimonial
- ❌ If any step requires >30 seconds → Too much friction

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

**As Priya (Salon Owner):**
- Context: Between customers, 3 minutes available
- Test: "Would I actually pull out my phone, find this app, and share a form right now?"
- Answer: Maybe - IF it's one tap to WhatsApp with message pre-written
- Answer: NO - If I need to copy link, open WhatsApp, paste, type message

**As Anjali (Customer):**
- Context: Just left salon, heading to office, 10 minutes to next meeting
- Test: "Would I actually fill out a form about my salon visit right now?"
- Answer: Maybe - IF form is <5 questions, on phone, no account needed
- Answer: NO - If it requires email, account creation, or >2 minutes

**As Ravi (Website Visitor):**
- Context: Comparing salons, want to see reviews
- Test: "Would I actually sign up or do anything to see reviews?"
- Answer: NO - If reviews require any action from me
- Answer: YES - If reviews show immediately, no friction

### Failure Signals (Persona-Specific)

Mark as "NO" if:
- Persona says "I probably wouldn't" = NO
- Persona says "Maybe if I had time" = NO (they never have time)
- Persona starts action but stops halfway = NO
- You need to explain or guide them = NO (won't have guide in real life)
- Works for YOU but not for THEM = NO

### The Honest Truth Test

**Don't bullshit yourself:**
- Priya won't log into a dashboard daily (she's busy, forgets passwords)
- Anjali won't write long detailed reviews (she's rushing, has meetings)
- Ravi won't click through 3 pages to see reviews (he has 2 other tabs open)

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

**India-specific:** INR pricing validated separately from USD. $19/mo can be unaffordable for Indian SMBs (₹1,600/mo significant for ₹40k/mo salon).

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
