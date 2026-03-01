# /pre-build — Product & Feature Validation Framework

Run this BEFORE writing a single line of code for any new product or feature. The goal is to find the holes before building, not after. Be brutally honest. If the idea does not survive this analysis, say so clearly.

---

## Step 1 — Define the Customer (One Real Person)

Do not use a category ("small businesses", "freelancers"). Name a real, specific person.

Answer these exactly:
- What is their name, occupation, and city?
- What is their monthly revenue or income?
- What tools do they already use daily? (WhatsApp, Instagram, Excel, etc.)
- Do they have a website? A laptop? Time to learn new software?
- What is the ONE problem they wake up thinking about?
- How do they currently solve that problem? (Even if the solution is bad)
- What would make them open their wallet without hesitation?

**Red flag:** If you cannot describe a single real person, the target customer is not defined. Stop here and define it before continuing.

---

## Step 2 — Walk Every User Journey Step by Step

For EACH type of user (e.g. business owner AND their customer), write out every single step they take.

For each step ask:
- What does the user see?
- What do they have to do?
- How long does it take?
- Would a real, distracted person on a phone actually do this?
- What happens if they stop here?

**The "write twice" test:** If any user is asked to do essentially the same action twice (write feedback, then write a Google review), that journey will fail. Users complete one action and feel done.

**The "distracted person" test:** Assume the user is tired, in a hurry, and slightly confused. Does the journey still complete?

**Red flag:** If any step requires more effort than the problem it solves, users will drop off there.

---

## Step 3 — The "Would You Personally Do This?" Test

For every key action in the user journey, ask honestly:

- Would you personally do this if you were the customer?
- Would the person building this product do it?
- Ask one other real person (not a developer) and observe their reaction

If the answer is "probably not" or "maybe", treat it as "no".

**Example of what went wrong:** We assumed customers would fill out a Vouch form AND then also write a Google review. When asked directly, the answer was "I myself wouldn't do that." That single honest answer invalidated the core feature.

---

## Step 4 — The Free Alternative Audit

List every free or cheap way the customer can solve the same problem right now:

| Solution | Cost | Effort | How good is it? |
|---|---|---|---|
| [Free alternative 1] | $0 | Low/Med/High | Good/Ok/Bad |
| [Our product] | $X/mo | Low/Med/High | Good/Ok/Bad |

Then answer:
- Why would someone pay instead of using the free option?
- Is our product 10x better, or just slightly better?
- What happens to our value if the free option improves?

**Red flag:** If the free alternative works "well enough" for the target customer, there is no market. "Slightly better" is not a business.

---

## Step 5 — Feature-Customer Fit Check

List every feature being built. For EACH feature, verify:

| Feature | Does target customer have what this needs? | Will they actually use it? | Verdict |
|---|---|---|---|
| Embed widget | Needs a website | Most don't | Cut or deprioritise |
| Approval flow | Needs time to log in daily | Probably won't | Auto-approve by default |
| AI enhancement | Needs to care about polish | Maybe | Only for specific segment |

**Questions to ask per feature:**
- Does this customer have a website? (Don't build website features for customers without websites)
- Does this customer have staff who could manage this? (Don't build admin tools for solo operators)
- How often will they realistically use this feature per week?
- What does their day look like — would they have time for this?

**Red flag:** If more than half the features do not match the target customer's actual reality, the product is built for the wrong person.

---

## Step 6 — Pricing Validation

Answer all of these:

1. What is the target customer's monthly revenue or income?
2. What percentage of that is this subscription? (Should be under 0.5% for easy sell)
3. What does one new customer bring them in revenue?
4. How many new customers per month does our product need to generate to justify the price?
5. What do competitors charge in this specific market?
6. What does a comparable utility (e.g. Paytm Sound Box, Tally, JustDial listing) cost in this market?
7. Would the target customer described in Step 1 pay this price? Why or why not?

**India-specific check:** INR pricing must be validated separately from USD pricing. A price that is normal SaaS in the US ($19/mo) can be unaffordable for Indian SMBs (₹1,600/mo = significant for a ₹40,000/mo salon owner).

**Red flag:** If the customer would need more than 1-2 extra sales per month to justify the price, it will be a hard sell.

---

## Step 7 — Technical Claim Audit

List every feature or benefit claimed in the product description or landing page. For each:

| Claim | Is it technically possible? | Do we actually build it? | Evidence for the metric? |
|---|---|---|---|
| "Review firewall" | No — Google is public | No | N/A |
| "Customer approves AI version" | Yes | Not built | None |
| "3x more Google reviews" | Unverified | Unverified | No data |

**Questions:**
- Can third parties post to this platform on behalf of users? (Usually no — Google, Facebook, etc.)
- Are there metrics in the copy ("3x", "68% completion rate", "500+ businesses")? Where do they come from? If made up, remove them.
- Are there features mentioned in copy that are not yet built? Remove them or build them.

**Red flag:** Any claim that cannot be technically delivered is a liability, not a feature.

---

## Step 8 — The Assumption List

Write down every assumption the product is built on. Then for each, rate: Verified / Unverified / Probably Wrong.

Examples from this project:
- "Customers will write a review on Vouch AND on Google" → Probably Wrong
- "Local businesses want to curate testimonials for their website" → Wrong (most have no website)
- "Business owners will log in daily to approve submissions" → Probably Wrong
- "Indian SMBs will pay ₹1,600/month for this" → Probably Wrong

**For each unverified or wrong assumption:** Either validate it with real data, or redesign the product so it does not depend on that assumption.

---

## Step 9 — Devil's Advocate

Argue against building this. Make the strongest possible case that this is a bad idea.

Cover:
- Why the target customer does not actually need this
- Why they will not pay for it
- Why the free alternatives are good enough
- Why the timing is wrong
- Why a competitor could copy this in a week
- Why the market is smaller than it looks

Then, if the product still makes sense after this attack, explain exactly why it survives each objection.

**This is not optional.** Every product idea sounds good to the person who thought of it. This step exists to find what they cannot see.

---

## Step 10 — Verdict

Based on all of the above, output one of:

**BUILD** — Customer is clearly defined, journey works, pricing fits, claims are real, assumptions are verified. Proceed.

**MODIFY** — Core idea is sound but [specific things] need to change before building. List exactly what.

**DO NOT BUILD** — The product does not survive the analysis. The market is wrong, the pricing does not work, or the core assumption is false. Explain clearly why and suggest what to explore instead.

---

## Final Checklist Before Writing Code

- [ ] Can you name one specific real person who would pay for this today?
- [ ] Have you walked through the full journey of every user type, step by step?
- [ ] Would YOU personally complete every step in the customer journey?
- [ ] Is there a free alternative, and is our product genuinely 10x better?
- [ ] Does every feature map to something the target customer actually has and does?
- [ ] Is the price less than 0.5% of the customer's monthly revenue?
- [ ] Are all claims in the copy technically true and actually built?
- [ ] Have you listed your assumptions and challenged each one?
- [ ] Have you argued against building this and survived the argument?

If any box is unchecked, do not start building. Resolve it first.
