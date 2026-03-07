## Session Handoff (March 7, 2026)

**What was done:** Complete strategic research session. No code written. All findings documented below in sections A through K.

1. Validated competitive landscape against 8+ competitors using live pricing page data (Senja, Testimonial.to, Shapo, Famewall, WiserReview, Endorsal, Trustmary, VideoAsk)
2. Confirmed Porter's "stuck in the middle" problem: $19/mo sits between budget cluster ($9 to 10) and premium cluster ($29). Decision: reprice to $29 Pro, $49 Studio
3. Complete pricing strategy rebuilt from scratch (section B4): 3 tiers, annual discount rationale, free tier gating model, founder rate tactic, pricing page psychology
4. 7 detailed persona role-plays simulating buyer journeys (section B4): first-time discoverer, competitor switcher, established business buyer, budget-conscious, agency owner, technical founder, non-technical creator
5. Feature gap analysis: Vouch Pro $29 vs all competitors at similar price points (section B4). Verdict: zero deal-breaker gaps IF we ship Editorial layout, Minimal layout, and CSV import before launch
6. Added sections I (Onboarding/Retention), J (Infrastructure/Operational Survival), K (Referral/Affiliate)
7. Identified existential infrastructure risks: Supabase free tier (503 errors already happening), embed.js (no versioning, one bad push breaks all customers), "Powered by Vouch" growth loop (currently broken)

**What's next (execution mode):** Phase 1 from section I5:
1. Editorial layout (premium widget layout, the #1 visual differentiator at $29)
2. Minimal layout (clean alternative to grid)
3. Existing layout quality upgrade (spacing, typography, animations)
4. Free tier cap at 10 testimonials (DB check in submission API)
5. CSV import for testimonials (must-have gap vs competitors)

**What to watch out for:**
1. todo.md is now very large (~85KB). Use offset/limit when reading specific sections. Section index: A (line ~17), B (line ~33), C (not present, merged), D (not present), E (not present), F (not present), G (not present), H (not present), I (search for "Section I"), J (search for "Section J"), K (search for "Section K")
2. Pricing change ($19 to $29) is NOT implemented yet. It happens AFTER premium widgets ship (Editorial + Minimal layouts). The current live product still shows $19.
3. The feature gap analysis assumes Editorial and Minimal layouts exist. Without them, $29 is harder to justify.
4. Supabase free tier upgrade ($25/mo) should happen before first paying customer, not before launch prep.

---

# Go-Live Checklist (ALL COMPLETE)

- [x] **Re-enable disposable email blocking**: Done in session 10.
- [x] **Enable "Confirm email" in Supabase**: Already enabled with custom branded template.
- [x] **Test camera startup speed on another device**: Optimized in session 7.
- [x] **Test video upload speed on another device/network**: Optimized in session 7.
- [x] **Video playback delay in review step**: Fixed in session 7.

---

# Active Work Queue

## Business Strategy (from competitive analysis, March 7 2026)

Based on live market research of 8+ competitors, visual audit of Senja/Testimonial.to/Shapo widgets, and analysis of 74 premium SaaS testimonial sections. This is the playbook.

### A. Competitive Landscape (verified March 7 2026)

| Tool | Free Tier | Cheapest Paid | Mid Tier | Strengths |
|---|---|---|---|---|
| Testimonial.to | 10 text, 2 video | $20/mo | $50/mo | YC-backed, brand recognition, video-first |
| Senja | 15 testimonials, unlimited widgets | $29/mo (2 seats) | $59/mo (5 seats) | Best UX reputation, 30+ import sources, Zapier |
| Shapo | 10 testimonials, unlimited forms/widgets | $29/mo | n/a | Clean pricing, 20+ import sources |
| Famewall | 10 testimonials, 1 video, unlimited widgets | $9.99/mo | $24.99/mo | Cheapest, AI Composer |
| WiserReview | Free plan | $9/mo | Higher tiers w/ AI | Budget-friendly, multi-channel collection |
| Endorsal | 100 contacts, 1K visitors | $29/mo | $59/mo | Visitor-based pricing, Wall of Love |
| Trustmary | 200 views, 20 responses | $16/mo | $49/mo | Complex split pricing (display vs collect) |
| VideoAsk | 10 interactions/mo | $25/mo | $45/mo | Typeform-backed, interaction-based |
| **Vouch** | **Unlimited testimonials**, 1 form, 1 widget, 1 project | **$19/mo** | **$49/mo** | Golden sentence highlights, video, Shadow DOM embed |

**Key insight:** Vouch's free tier is the most generous in the entire market. Every competitor caps at 10 to 15 testimonials on free. People pay 2 to 3x more for Senja/Testimonial.to over cheaper tools because of: (1) integrations/Zapier/auto-import, (2) brand trust and SEO discovery, (3) AI features, (4) UX polish, (5) team/agency features. Price alone does not win.

### B. Strategic Decisions (revisit before next feature work)

1. [ ] **Cap free tier at 10 testimonials.**

   **Why this matters:** A freelancer with one brand (our core target persona) can currently collect 500 testimonials, display them in one widget, and never pay us anything. Every competitor caps free at 10 to 15 because the upgrade trigger needs to come from SUCCESS ("I have too many testimonials, I need more capacity") not from WANTING ("I want a second form"). Success-based triggers convert better because the user has already proven the tool works for them. Want-based triggers feel punishing ("I like your tool but you won't let me use it").

   **What wrong looks like:** Capping at 3 (too aggressive, users can't see value before hitting the wall). Capping testimonials but leaving widgets/forms unlimited on free (the current model, which means users never hit a meaningful limit). Capping at 50 (too generous, same problem as unlimited for 95% of users).

   **The right move:** Cap at 10 testimonials (matches Shapo, Famewall, and Testimonial.to's text limit). After 10, show a friendly "You're getting traction! Upgrade to keep collecting." This means users have enough to see the widget working on their site, feel the value, and THEN hit the upgrade wall at a moment of motivation. Also cap widgets at 1 on free (already done) and forms at 1 (already done). The testimonial cap is the missing piece.

   **DB impact:** Need to add a count check in the testimonial submission API route. When a free user's approved + pending testimonials exceed 10, block new submissions with a branded upgrade message on the collection form.

2. [ ] **Pick and own a niche.**

   **Why this matters:** Senja ranks #1 for "testimonial software." Testimonial.to ranks #1 for "collect testimonials." These positions took years and significant content investment. We cannot outrank them on broad terms. But "testimonials for Webflow agencies" or "video testimonials for coaches" has almost zero competition because no one owns those niches specifically. The first tool that explicitly targets a segment and tailors its messaging, templates, and integrations to that segment wins it. General-purpose = invisible. Niche = discoverable.

   **What wrong looks like:** Picking a niche we don't understand (e.g., real estate agents, if we've never talked to one). Picking a niche that's too small (e.g., "testimonials for Astro developers"). Picking a niche and only changing the landing page copy without actually tailoring the product (this is fake niching, users see through it). Trying to serve 3 niches simultaneously (this is the same as serving none).

   **How to pick:** The niche should have (1) people who already pay for testimonial tools, (2) a community or watering hole where we can reach them (Webflow has a forum, coaches have Facebook groups, SaaS founders have Indie Hackers/X), (3) specific needs we can serve better than Senja (e.g., Webflow users need a native Webflow integration, coaches need video-first because their personality IS their product). Talk to 5 people in each candidate niche before committing.

   **Candidate niches to evaluate:** Webflow agencies/freelancers (Webflow has 3.5M+ users, strong community, they embed things constantly). Online coaches/course creators (video-first, personality-driven, they share testimonials on social). SaaS founders on Indie Hackers/X (they build in public, testimonials are social currency).

3. [ ] **Distribution strategy.**

   **Why this matters:** The best product nobody knows about makes $0/mo. We have zero inbound channels right now. No blog, no SEO content, no social following, no partnerships, no marketplace listing, no affiliate program. We need at least ONE reliable channel before expecting any revenue. Distribution is not "nice to have after launch." It IS the launch.

   **What wrong looks like:** Writing 5 generic blog posts ("What is social proof?") and expecting traffic. Posting the link on Reddit once and calling it distribution. Spending 3 months building a WordPress plugin before validating anyone wants it. Trying all channels at once and doing none well.

   **The right approach (pick 2, do them well):**
   * **Product Hunt launch:** One-time spike, but it seeds initial users and backlinks. Requires a polished landing page and demo video. Best done AFTER the premium widget work so we have a visual story to tell.
   * **SEO comparison pages:** "Vouch vs Senja," "Vouch vs Testimonial.to," "Best Testimonial.to alternatives 2026." These are bottom-of-funnel searches from people already shopping for tools. Low volume but high intent. Every competitor already does this (Senja has /compare pages for every competitor).
   * **Build in public on X:** Free, builds audience, creates social proof. Post widget design progress, customer wins, revenue milestones. This is how most indie SaaS founders get their first 50 customers.
   * **Platform-specific integration:** If we pick Webflow as our niche, a Webflow app/plugin puts us in front of users at the moment they need testimonials.

4. [ ] **Reprice to $29/mo Pro, $49/mo Studio (validated, implement with premium widget launch).**

   **The "stuck in the middle" problem (validated):** At $19/mo, Vouch sits in no-man's land between the budget cluster (Famewall $9.99, WiserReview $9) and the premium cluster (Senja $29, Shapo $29, Testimonial.to $21 to $34). A customer comparing options sees: "$10 less gets me Famewall, $10 more gets me Senja." This is textbook Porter's "stuck in the middle." The user's MBA insight was correct: when you don't fit clearly into a market segment, customers get confused and pick a competitor who does.

   **The data-backed answer: 3 tiers (Free + Pro $29/mo + Studio $49/mo).**

   Research basis:
   * 3 tiers convert 8% better than 2 tiers, 30% higher ARPU than 4+ tiers (Price Intelligently, 512 companies)
   * Moving from 4 to 3 tiers increased conversion by 27% (ConversionXL)
   * Customers spend 42% less time deciding with 3 options vs 5+ (HubSpot)
   * Middle tier drives 60 to 70% of revenue (Goldilocks effect)
   * Price jump of 50 to 100% from mid to top tier is optimal. $29 to $49 = 69% (sweet spot)
   * Annual discount of 16.7% ("2 months free") is the industry standard and most effective

   **The competitive positioning at $29:**

   | Feature | Senja Starter ($29) | Senja Pro ($59) | Vouch Pro ($29) |
   |---|---|---|---|
   | Testimonials | Unlimited | Unlimited | Unlimited |
   | Forms | 3 | Unlimited | Unlimited |
   | Projects | 1 | 5 ($10/extra) | Unlimited |
   | Premium layouts | No | No | YES (Editorial, Minimal, Cinematic) |
   | Golden sentence | No | No | YES |
   | Verification badges | No | No | YES |
   | JSON-LD rich snippets | No | Yes ($59!) | YES (already built) |

   At $29/mo, Vouch Pro offers what Senja charges $59/mo for (unlimited everything) PLUS features Senja doesn't have at any price. The comparison page writes itself.

   #### Complete Pricing Table

   **FREE ($0/mo):**
   * 10 testimonials (matches Famewall, Shapo, Testimonial.to)
   * 1 collection form, 1 widget, 1 project
   * 5 basic layouts (grid, carousel, wall, list, single)
   * Video testimonials included
   * Full inbox management, approve/reject, CSV export
   * Form analytics (views, submissions)
   * "Powered by Vouch" branding on widget
   * Golden sentence: can set it, but NOT highlighted in widget
   * No custom fonts, no verification badges, no import, no widget analytics

   **PRO ($29/mo, $24/mo billed annually at $290/year):**
   * Unlimited testimonials, forms, widgets, projects
   * ALL layouts including Editorial, Minimal, Cinematic Video
   * Golden sentence highlighting in widget
   * Custom fonts
   * Verification badges (email verified, domain verified, source verified)
   * Remove "Powered by Vouch" branding
   * CSV/JSON import
   * Widget analytics (view counts)
   * Email support
   * Highlighted as "Most Popular" on pricing page

   **STUDIO ($49/mo, $41/mo billed annually at $490/year):**
   * Everything in Pro
   * Client reports (unique to Vouch, already built)
   * White-label (remove ALL Vouch branding including verification badge links)
   * 5 team seats
   * Concierge migration (we import your data for you)
   * Priority email support

   #### Free Tier Design Rationale

   The free tier uses the "full workflow free, premium output paid" model:
   * 80% of functionality is free (collect, manage, display). The complete workflow works.
   * 20% of high-value features are gated (premium layouts, golden sentence highlight, verification, branding removal)
   * Upgrade trigger is SUCCESS-based ("I have too many testimonials, I want my widget to look better") not FRUSTRATION-based ("I can't even test this tool")
   * The golden sentence is settable on free but only visually highlighted on Pro. Free users see the feature exists but Pro users get the premium presentation. This is "show them what they're missing" gating.

   **Why no $9 or $15 tier:** Adding a cheap tier would (a) signal we're not confident in premium positioning, (b) cannibalize Pro signups (someone who'd pay $29 settles for $15), (c) compete with Famewall on price which is unwinnable for a solo founder. The free tier IS the cheap option. One clear upgrade path reduces decision friction.

   #### Annual Pricing Rationale

   "2 months free" on annual (16.7% discount):
   * Most common SaaS annual discount (used by Testimonial.to, Senja at 17%)
   * Optimal range is 15 to 20% per research (InnerTrends analysis of 100 SaaS companies)
   * Messaging is instantly understood, no math required
   * Default display: monthly (avoids sticker shock). Toggle shows annual savings.

   #### Pricing Page Psychology

   1. Free on left, Pro (highlighted, "Most Popular") in center, Studio on right
   2. Studio serves as price anchor (seeing $49 makes $29 feel like a deal)
   3. Solo founders think: "I don't need agency features, Pro is perfect"
   4. Agencies think: "Cheaper than Senja Pro ($59) and Famewall Business ($80)"

   #### Launch Pricing Tactic: Founder Rate

   First 50 Pro users get $19/mo for life. This makes $19 a DEAL (not the standard price). Creates urgency ("43 founder spots left"). Rewards early adopters. Locks in loyal evangelists who feel special. 50 users at $19/mo = $11,400/year guaranteed. After 50 spots fill, standard $29/mo applies. The early users become ambassadors because they know they got a deal.

   #### Pricing Pitfalls Checklist (all validated as avoided)

   * [ ] Not stuck in the middle: $29 sits in premium cluster with Senja/Shapo
   * [ ] Not too many tiers: 3 tiers (research-backed optimal)
   * [ ] Not per-seat for a solo tool: feature + usage gating
   * [ ] Free tier not too generous: 10 cap, basic layouts, branding shown
   * [ ] Free tier not too restrictive: full workflow works
   * [ ] Annual discount not too aggressive: 16.7% (industry median)
   * [ ] No pricing that signals low quality: $29 = premium signal
   * [ ] Price jump between tiers optimal: 69% ($29 to $49)

   #### When to Implement

   Reprice AFTER premium widgets ship (Phase 1 complete). The product must justify $29 before we charge it. Repricing before Editorial and Minimal layouts exist = charging premium for basic output = customers feel cheated. Sequence: ship premium widgets first, then update Lemon Squeezy products, then update pricing page.

   #### Persona Role-Play Validation (7 buyer journeys, fact-based)

   **Why this section exists:** Pricing cannot be validated in a spreadsheet. It must be validated through the actual decision process of real humans spending real money. These role-plays were built using live competitive data (scraped pricing pages March 7, 2026), SaaS buyer journey research (Gartner, Wynter), and churn/conversion benchmarks. Each persona has a specific identity, budget reality, discovery path, evaluation process, and purchase decision. The conclusions are used to validate or challenge the $29/mo Pro pricing.

   **Key research facts used across all role-plays:**
   * 54% of SaaS buyers begin with a category Google search (Gartner 2026)
   * 78% of B2B buyers shortlist only 3 vendors for demos (Gartner)
   * Many small business SaaS buyers won't engage in more than one trial (Gartner, small/midsize segment)
   * Buyers complete 60%+ of the buying process before engaging a vendor (Gartner)
   * Global buyers rank priorities: #1 security, #2 ease of use, #3 integrations (Gartner 2026)
   * Visible social proof increases pricing page conversion by 15 to 25% (2024 study)
   * Features get you shortlisted, brand gets you chosen (SaaS branding research 2026)
   * Higher ARPU customers churn less. Average B2B SaaS monthly churn: 3.5% (2.6% voluntary, 0.8% involuntary)

   **Testimonial.to Starter Plus ($21/mo) exact limitations (scraped March 7, 2026):**
   This tier is referenced as a potential competitor to our $29 Pro. Here is what $21/mo ACTUALLY gets you:
   * Unlimited text testimonials, but ONLY 2 video testimonials total (not per month, total ever)
   * No API, no webhook, no Zapier, no Make integrations
   * No custom cards on Wall of Love
   * No video metrics, no sentiment analysis, no star rating rich snippets
   * 2-minute video time limit
   * No automated email invitations (T.E.A.)
   * 1 space only (extra spaces cost $400/year EACH, only available on Premium $34/mo)
   * No account-level or space-level staff seats
   * Chat and email support (not priority)
   * Only "10+ social media and review sites" import (vs full set on Premium)
   This means Testimonial.to at $21/mo is a severely limited product. A customer comparing features side-by-side would see that Vouch Pro at $29/mo offers dramatically more (unlimited video, unlimited forms, unlimited projects, premium layouts, golden sentence, verification badges). The $8/mo difference buys a categorically different product.

   ##### PERSONA 1: "Priya" (first-time founder, never heard of testimonial tools)

   **Identity:** 28 years old, based in Bangalore. Quit job 3 months ago. Built a SaaS for yoga studios using Lovable. 12 paying customers at $15/mo = $180 MRR. No marketing background. Never heard of "social proof tools" or "testimonial widgets." Site built with plain English prompts.

   **Trigger:** Sees an indie hacker post on X: "Added customer testimonials to my landing page, conversion went from 2% to 4.8% overnight." Thinks: "I have happy customers who DMed me nice things. My site has no testimonials section."

   **Discovery path (step by step):**
   1. Googles "how to add testimonials to my website"
   2. Reads a blog post. It mentions hardcoding HTML or using a tool.
   3. Googles "best testimonial software" or "testimonial tool for website"
   4. Lands on a listicle (WiserReview's "I Tried 25 Testimonial Collection Tools" or similar)
   5. Top results: Senja, Testimonial.to, Famewall, Shapo. Vouch is NOT in any listicle because we have zero SEO content, zero blog, zero comparison pages.
   6. Clicks Senja (listed first in most articles, highest brand recognition)
   7. Sees "Free, forever" on Senja's pricing page. Signs up immediately.

   **Evaluation process:**
   * Creates a form in 60 seconds on Senja. Sends link to 3 customers. 2 submit testimonials. Creates widget. Embeds on site. Total time: 20 minutes.
   * Does NOT look at alternatives. Gartner data: many small business SaaS buyers won't engage in more than one trial. Priya tried Senja, it worked. She's done shopping.

   **Price sensitivity:** Making $180/mo. Not paying $29/mo or even $19/mo for testimonials. Uses Senja free tier (15 testimonials) indefinitely. Would only upgrade when she has 50+ customers and 15+ testimonials (months away).

   **Would Priya find Vouch?** Only if: (a) Vouch appears in the listicle she reads, (b) someone personally recommends Vouch, (c) she sees a "Powered by Vouch" badge on a site she visits. None of these happen today because Vouch has zero SEO content.

   **Decision outcome:** Priya uses Senja free. Never discovers Vouch.

   **What this means for pricing:** Price is irrelevant for Priya because she never sees our pricing page. Even if Vouch were $0 forever, she wouldn't find us. **Priya validates that DISCOVERY (not price) is our #1 blocker.** The fix is SEO content (Section H), blog posts (H2), and listicle presence, not lower pricing.

   ##### PERSONA 2: "Jake" (indie SaaS founder, currently on Senja free, hitting limits)

   **Identity:** 31, based in Austin. Runs a project management tool for freelancers. $2K MRR. Signed up for Senja 6 months ago. Collected 18 testimonials. On Senja free tier (15 testimonial limit). Just hit the cap. Senja is showing upgrade prompts: $29/mo Starter.

   **State of mind:** Annoyed. Likes Senja but doesn't want to pay $29/mo for "more of the same." His widget looks functional but generic. It looks like a Senja widget, not like part of his site. He looked at Senja Pro ($59/mo) and thought: "$59 for unlimited forms and 5 projects? I have one product. Not worth it."

   **Discovery path (step by step):**
   1. Googles "Senja alternatives" or "cheaper testimonial tool than Senja"
   2. Finds comparison articles and competitor comparison pages
   3. Opens 3 to 4 tabs: Famewall pricing, Testimonial.to pricing, Shapo pricing
   4. IF Vouch has a "Vouch vs Senja" comparison page, he finds us here

   **Evaluation process (without Vouch):**
   * Famewall $9.99/mo: Unlimited testimonials. Cheap. But looks at their widget output. Same generic cards as Senja. Doesn't solve his real problem (widget looks like a third-party tool).
   * Testimonial.to $21/mo Starter Plus: Looks cheaper than Senja. But reads the fine print: only 2 video testimonials TOTAL. 1 space. No API. No Zapier. Feels crippled compared to what Senja offered free.
   * Shapo $29/mo: Same price as Senja. No obvious reason to switch. Widget output looks similar.
   * Decision: reluctantly pays Senja $29/mo because switching effort isn't worth the marginal savings.

   **Evaluation process (with Vouch in the comparison):**
   * Lands on Vouch's "Vouch vs Senja" comparison page. Sees a side-by-side screenshot: LEFT: standard Senja widget (cards, stars, generic). RIGHT: Vouch Editorial layout (large pull-quote, golden sentence highlighted, no card borders, looks like a custom-built section).
   * Thinks: "THAT is what I want my testimonials to look like."
   * Checks Vouch pricing: $29/mo Pro. Same price as Senja Starter. But unlimited everything (Senja Starter limits: 3 forms, 1 project, 2 seats). Plus premium layouts, golden sentence, verification badges.
   * Compares feature-for-feature:

     | Feature | Senja Starter ($29) | Vouch Pro ($29) |
     |---|---|---|
     | Testimonials | Unlimited | Unlimited |
     | Forms | 3 | Unlimited |
     | Projects | 1 | Unlimited |
     | Seats | 2 | 1 |
     | Branding removal | Yes | Yes |
     | Zapier | Yes | No (future) |
     | Custom domain | Yes | No (future) |
     | Premium layouts (Editorial, Minimal) | No | Yes |
     | Golden sentence highlighting | No | Yes |
     | Verification badges | No | Yes |
     | JSON-LD rich snippets | No (Pro only, $59) | Yes (built-in) |

   * Jake sees: more features at the same price, PLUS unique differentiators. But Vouch is new and unproven.

   **Trust evaluation (the critical gate):**
   * Jake thinks: "This looks amazing but will this company exist in 6 months?"
   * What builds trust: (a) Vouch uses its own widget on its own landing page and it looks incredible (dog-fooding, Section J3), (b) real testimonials from real users on the Vouch site (not placeholder text), (c) a responsive support email visible in the dashboard, (d) active X/Twitter presence showing the founder building in public
   * What breaks trust: (a) empty landing page with no social proof, (b) support email is hello@example.com, (c) no blog, no docs, no visible activity, (d) widget on Vouch's own site looks generic (not using premium layouts)

   **The import moment (make or break):**
   * Jake signs up for Vouch free tier. Imports 10 of his 18 testimonials via CSV (within free tier limit).
   * Creates an Editorial layout widget. Sees his testimonials rendered with large pull-quotes, golden sentence highlighted, no card borders.
   * Thinks: "My testimonials have never looked this good."
   * Hits the 10-testimonial cap. Has 18 total. Needs Pro.
   * $29/mo. Same as what Senja was asking. But the output is VISIBLY better.
   * He pays.

   **Price sensitivity analysis:**
   * At $29: hesitates for 5 seconds. Same price as Senja, better output. Pays.
   * At $19: hesitates for 2 seconds. Cheaper than Senja, better output. Pays faster, but the decision driver was the VISUAL QUALITY, not the $10 savings.
   * At $39: hesitates significantly. "That's $10 MORE than Senja, and Vouch is a new, unproven company." The trust gap makes $39 feel risky. He might still pay if the visual quality is extraordinary, but the conversion probability drops.
   * At $9: thinks "Why is this so cheap? Is it a real product?" Cheap pricing undermines trust for SaaS tools (research confirms this: reviews show billing predictability and clear limits matter more than being cheap).

   **Decision outcome:** Jake pays $29/mo for Vouch Pro IF: (1) he discovers Vouch through a comparison page, (2) he can try free with import, (3) the Editorial layout is visibly superior, (4) basic trust signals exist (dog-fooding, real testimonials, support channel, active founder).

   **What this means for pricing:** $29 is the right price for Jake because it matches what he was already being asked to pay by Senja. The decision is driven by OUTPUT QUALITY, not by undercutting on price. Dropping to $19 would make Jake's decision 5% faster but would cost us $120/year per customer in lost revenue (that's $6,000/year at 50 customers). **Jake validates that $29 works for switchers IF the product is visibly better.**

   ##### PERSONA 3: "Marcus" (established business, evaluating tools for the first time)

   **Identity:** 42, runs a 15-person B2B consulting firm in Denver. $50K MRR. Website built by a Webflow agency. Has dozens of happy clients. Current testimonial section was hand-built in Webflow by their designer. Updating it requires designer time at $150/hour. Wants automation.

   **Budget reality:** $29/mo is 0.058% of monthly revenue. $49/mo is 0.098%. Even $99/mo is trivial. Spends more on a team lunch. **Price is functionally irrelevant for this persona. Decision is made on design quality and ease of use.**

   **Discovery path:**
   1. Marcus tells his designer: "Is there a tool that can handle our testimonials?"
   2. Designer Googles "testimonial widget for Webflow" or "best testimonial display tool"
   3. Finds Senja, Testimonial.to, Famewall in search results
   4. Evaluates based on DESIGN QUALITY (she is a designer, aesthetics are her profession)

   **Evaluation process (without Vouch):**
   * Senja widgets: "Generic cards. Doesn't match our site. Looks like a third-party embed."
   * Testimonial.to Wall of Love: "Same. Standard cards. Not our aesthetic."
   * Famewall: "Budget tool. Would never put this on a client site."
   * Designer tells Marcus: "None of these are good enough. I'll keep building them manually."
   * Result: No tool purchased. Marcus keeps paying $150/hour for manual updates.

   **Evaluation process (with Vouch):**
   * Designer finds Vouch (through a design showcase, a tweet, or a Webflow community post about testimonial tools)
   * Sees Editorial layout: large pull-quotes, no card borders, content sits directly on the page, golden sentence highlighted
   * Sees Minimal layout: quote and attribution only, inherits host site's font, no visual chrome
   * Thinks: "This actually looks like something I would have designed. It doesn't look like a widget."
   * Tries it. Creates an Editorial widget with a client's testimonials. The output blends with the site.
   * Tells Marcus: "Found one. Vouch. $29/mo."
   * Marcus: "That's it? Do it."

   **Trust evaluation for Marcus:**
   * Marcus is NOT evaluating brand trust the way Jake does. He's never heard of Senja OR Vouch. They're equally unknown to him. The designer's recommendation is the trust signal. Designers trust their own aesthetic judgment over brand reputation.
   * Global buyer priorities: #1 security, #2 ease of use, #3 integrations. For a testimonial widget (not a security tool), ease of use and visual quality dominate. Marcus doesn't care about SOC 2 for a widget embed.

   **Price sensitivity analysis:**
   * At $29: "Fine. Cheaper than one hour of my designer's time." Pays instantly.
   * At $19: Pays instantly. Might actually wonder "Is this a real tool?" (research confirms cheap pricing undermines trust for established businesses)
   * At $49: Pays instantly. Still cheaper than designer time.
   * At $99: Pauses. "That's starting to be a real line item. Let me look at alternatives." But still likely pays if quality justifies it.

   **Studio consideration:** Designer looks at Studio ($49/mo). White-label, client reports, 5 seats. They only need 1 to 2 seats and don't manage other clients' testimonials. Pro at $29 is sufficient. Studio is not relevant for this persona.

   **Decision outcome:** Marcus pays $29/mo for Vouch Pro, driven entirely by his designer's recommendation of visual quality.

   **What this means for pricing:** For established businesses, $19 can actually HURT (signals "not professional"). $29 hits the sweet spot: professional enough to trust, cheap enough to not require procurement approval. **Marcus validates that $29 is the correct signal for design-conscious buyers, and that $19 could undermine credibility.**

   ##### PERSONA 4: "Sofia" (online course creator, personality-driven business)

   **Identity:** 35, based in Lisbon. Sells an online course on personal branding for $497. 200+ students. Business built on her personality. 25K Instagram followers. Site on Kajabi. Students DM amazing results but testimonials aren't formalized.

   **Trigger:** A business coach she follows posts about using Senja to collect testimonials. Shows her Wall of Love page. Sofia thinks: "I should do that."

   **Discovery path:**
   1. Goes DIRECTLY to Senja (recommended by trusted coach)
   2. Signs up. Creates form. Sends to 10 students. 7 respond, some with video.
   3. Creates Wall of Love. Embeds on course sales page.
   4. Does NOT search for alternatives. Her coach said Senja. Done.

   **Why Sofia doesn't consider alternatives initially:**
   * 78% of B2B buyers shortlist only 3 vendors. Sofia shortlisted 1: the one her coach recommended.
   * Social proof about social proof tools. The coach's recommendation IS the evaluation.
   * Sofia is not technical. She doesn't comparison-shop SaaS tools. She follows trusted recommendations.

   **When Vouch could intercept Sofia (6 months later):**
   * Sofia has been using Senja for 6 months. Her Wall of Love works. But she notices: "My site has this warm, personal feel and the Senja widget looks corporate. Generic cards. Small text. It doesn't match my brand."
   * She Googles "better looking testimonial widget" or "premium testimonial display"
   * IF Vouch has content targeting this query, she finds us.
   * She sees: Editorial layout with large video thumbnails, golden sentence highlighting, face-forward framing.
   * For a personality-driven business, VIDEO IS THE DIFFERENTIATOR. Sofia's students' faces and voices ARE the social proof. Senja treats video as "a card with a play button." Vouch's Cinematic Video layout makes video the hero.

   **Revenue math that makes price irrelevant:**
   * Sofia charges $497/course. Her email list converts at 2%. 1,000 subscribers = 20 sales = $9,940
   * Research shows testimonials improve conversion by 15 to 34%.
   * Conservative: testimonials improve conversion from 2% to 2.3%. Extra 3 sales per 1,000 subscribers = $1,491 in additional revenue.
   * Vouch Pro at $29/mo = $348/year. Return: $1,491. ROI: 328%.
   * Sofia does NOT do this math consciously. But she intuitively understands: "Better testimonials on my sales page = more course sales." The $29/mo is a no-brainer.

   **Price sensitivity analysis:**
   * At $29: Pays without hesitation. Less than what she charges for one course.
   * At $19: Pays even faster. But the saving of $10/mo ($120/year) is meaningless against her revenue.
   * At $49: Still pays. $49/mo < 10% of one course sale.
   * Price is not a variable in Sofia's decision. Visual quality and VIDEO PRESENTATION drive the decision.

   **Decision outcome:** Sofia is a LATE CONVERT. She uses Senja first (coach recommendation), then switches to Vouch 6 months later when she outgrows Senja's visual quality.

   **What this means for pricing:** $29 is invisible in Sofia's economics. Dropping to $19 saves her $120/year but she already earns $500+ per course sale. The ROI of better testimonials dwarfs the tool cost. **Sofia validates that for high-ticket sellers, visual quality and VIDEO PRESENTATION drive the decision, not price. She also reveals a key channel: if we get ONE course creator coach to recommend Vouch, their entire audience follows.**

   ##### PERSONA 5: "Dev" (vibe coder, college student, zero revenue)

   **Identity:** 22, college student in India. Built a to-do app with Lovable last weekend. It's live. 0 users. $0 revenue. Dreaming of $1,000/mo. Saw a YouTube "launch checklist" video that said he needs testimonials.

   **Discovery path:**
   1. Googles "free testimonial tool"
   2. Sees Senja (free, 15 testimonials), Famewall (free, 10), Testimonial.to (free, 10 text + 2 video)
   3. Picks Senja (most generous free tier: 15 vs 10 everywhere else)
   4. Might also find Vouch (free, 10 testimonials) but Senja's 15 is more attractive

   **Budget reality:** $0. Has no income. Even $5/mo is significant. Will never pay $29/mo for a testimonial tool while making $0. Would only consider Famewall at $9.99/mo if his app somehow gets traction in 6 to 12 months.

   **Does Dev matter to Vouch?**
   * As a paying customer: No. Not now, possibly not ever (most first products fail).
   * As a free tier user: Marginally. Dev uses the free tier, embeds a widget with "Powered by Vouch" badge. If his product succeeds (unlikely for first attempt), the badge generates impressions.
   * As a future customer: Dev's SECOND or THIRD product might succeed. If he remembers Vouch from his first attempt and had a good experience, he comes back. This is the long game of free tiers.

   **Should Vouch price to attract Dev?**
   * Absolutely not. Pricing at $9/mo to capture Dev means: (a) competing with Famewall on price (unwinnable for a solo founder), (b) attracting price-sensitive customers who churn faster (higher ARPU = lower churn, research-confirmed), (c) signaling "budget tool" which contradicts our premium positioning.
   * The free tier (10 testimonials, 1 form, 1 widget) is sufficient to capture Dev without changing paid pricing.

   **Decision outcome:** Dev uses whichever tool has the best free tier. Currently that's Senja (15 vs our 10). Dev never pays.

   **What this means for pricing:** Dev validates that our free tier at 10 testimonials is competitive (matches Famewall, Shapo, Testimonial.to) but not the most generous (Senja offers 15). We should NOT increase free tier to 15 just to match Senja, because: (a) the 5-testimonial difference is marginal, (b) 10 is the industry standard, (c) more generous free tier = fewer upgrade triggers. **Dev also confirms we should NOT create a cheap $9 or $15 tier. Dev is not our paying customer. Tom (Persona 7) is not our paying customer. We lose nothing by not having a budget tier.**

   ##### PERSONA 6: "Rachel" (agency owner, 8 client websites)

   **Identity:** 38, runs a Webflow design agency in Brooklyn. 4 employees. Manages 8 client websites. Some clients request testimonial sections. Currently builds them by hand in Webflow ($500 to $1,000 per client project). Has looked at Senja and Testimonial.to but rejected them because "the output doesn't match our design standards."

   **Trigger:** Sees a tweet or design showcase showing a before/after of a testimonial section. The "after" is a Vouch Editorial layout. It looks custom-built, not like a widget.

   **Discovery path:**
   1. Sees visual content on X/Twitter, Dribbble, or a Webflow community forum
   2. Clicks through to Vouch. Examines widget output.
   3. If the output passes her design standards, she evaluates pricing.

   **Evaluation process:**
   * Looks at Free: 10 testimonials, 1 project. Not enough for 8 clients.
   * Looks at Pro ($29/mo): Unlimited everything, premium layouts, branding removal. Covers 1 of her clients but she manages 8.
   * Looks at Studio ($49/mo): Unlimited projects, white-label, client reports, 5 seats. This covers ALL 8 clients.

   **Revenue math (the agency flywheel):**
   * Currently charges $500 to $1,000 per client for hand-built testimonial sections. One-time revenue.
   * With Vouch Studio ($49/mo): she can offer ongoing testimonial MANAGEMENT as a service. Charges each client $50/mo.
   * 8 clients x $50/mo = $400/mo revenue. Cost = $49/mo. Profit = $351/mo = $4,212/year recurring.
   * She turns a one-time $4,000 to $8,000 project into $4,212/year RECURRING revenue. The tool pays for itself in the first month.

   **Competitive comparison for agency use:**
   | Feature | Senja Pro ($59/mo) | Famewall Business ($80/mo) | Vouch Studio ($49/mo) |
   |---|---|---|---|
   | Projects | 5 ($10/mo per extra) | Unlimited | Unlimited |
   | Cost for 8 projects | $59 + ($10 x 3) = $89/mo | $80/mo | $49/mo |
   | Team seats | 5 ($5/extra) | 10 | 5 |
   | White-label | No | Yes | Yes |
   | Client reports | No | No | Yes (unique to Vouch) |
   | Premium layouts | No | No | Yes |

   Vouch Studio at $49 is the cheapest AND most feature-rich option for agencies. $89/mo for Senja (8 projects), $80/mo for Famewall, $49/mo for Vouch. Rachel saves $31 to $40/mo AND gets features no competitor offers (client reports, premium layouts).

   **Trust evaluation:**
   * Rachel is putting Vouch widgets on CLIENT sites. If Vouch goes down, her clients' sites have broken testimonial sections. Her professional reputation is at stake.
   * Trust requirements: (a) evidence the tool is reliable (uptime, responsive support), (b) a real support channel (not hello@example.com), (c) embed.js versioning so a bad Vouch update doesn't break client sites
   * These are addressed in Section J (infrastructure). Without J1 (Supabase upgrade), J2 (embed.js versioning), and J4 (support channel), Rachel won't commit.

   **Price sensitivity analysis:**
   * At $49: "That's $6/client/month. I charge them $50. Pure profit." Pays immediately.
   * At $79: "Still profitable. $10/client/month. Fine." Still pays.
   * At $29 (if Studio didn't exist and she used Pro): "This covers my needs but I want white-label and client reports." Would want a higher tier.
   * At $99: Pauses. "That's a real monthly expense." Compares more carefully to Senja and Famewall. Might still pay if the value is clear, but conversion probability drops.

   **Decision outcome:** Rachel pays $49/mo for Vouch Studio. She becomes a high-value, low-churn customer because her business model depends on Vouch (agency lock-in). She's also the most likely persona to refer other agencies.

   **What this means for pricing:** Studio at $49 is strongly validated for agencies. It undercuts competitors ($89 Senja, $80 Famewall) while offering MORE (client reports, premium layouts, unlimited projects). **Rachel validates that the Pro/Studio split is correct: Pro serves solo founders, Studio serves agencies. The price gap ($29 to $49, 69%) is within the optimal range (50 to 100%). Rachel also reveals that Studio customers will have LOWER churn than Pro customers because agency workflow lock-in creates switching costs.**

   ##### PERSONA 7: "Tom" (budget-conscious founder, price is the only factor)

   **Identity:** 29, bootstrapping a scheduling tool from his apartment in Krakow. $800 MRR. Every dollar counts. Knows he needs testimonials. Comparison-shops aggressively.

   **Discovery path:**
   1. Makes a spreadsheet of all testimonial tools and prices
   2. Famewall $9.99 (unlimited testimonials). WiserReview $9. Senja $29 (too expensive). Testimonial.to $21 (limited). Vouch $29 (too expensive).
   3. Picks Famewall. $9.99/mo, unlimited, gets the job done.

   **Would Tom pick Vouch at $19?**
   * Looks at $19 Vouch vs $10 Famewall. That's $9/mo difference = $108/year.
   * For Tom, $108/year is significant (that's 13.5% of his monthly revenue).
   * He asks: "What does the extra $9 get me?" Looks at widget output. If Vouch's widgets look better, he MIGHT pay the premium. But Tom optimizes for cost, not aesthetics. His site was built quickly. He doesn't care if the widget looks "premium" vs "functional." He cares that testimonials EXIST on his page.
   * Probability of Tom choosing Vouch at $19: ~20%. Still low.

   **Would Tom pick Vouch at $29?**
   * $29 is in his "too expensive" mental bucket. He doesn't even click through to compare features. Filtered out instantly.
   * Probability: ~5%.

   **Should Vouch want Tom as a customer?**
   * No. Here's why with data:
   * Tom optimizes for lowest price. If a tool launches at $7/mo tomorrow, Tom switches. His loyalty is to his wallet, not to any product.
   * Research confirms: higher ARPU customers have lower churn. Customers paying $29/mo are more committed than customers paying $10/mo. They've made a deliberate value judgment, not a cost judgment.
   * If Vouch prices at $9.99 to capture Tom: (a) we compete head-to-head with Famewall on price (they have more features at that price), (b) we attract a customer segment that churns faster, (c) we signal "budget tool" which repels Marcus, Sofia, and Rachel (our high-value personas), (d) we'd need 3x the customers to reach the same revenue as $29 pricing.
   * Revenue math: 100 customers at $9.99 = $999/mo. 100 customers at $29 = $2,900/mo. Same customer count, 3x less revenue at the budget price.

   **Decision outcome:** Tom picks Famewall. Never considers Vouch at $29.

   **What this means for pricing:** Tom is Famewall's customer. Chasing Tom requires competing on price, which destroys premium positioning and attracts high-churn, low-value customers. **Tom validates that NOT having a $9 tier is correct. We should be comfortable losing Tom to Famewall. Every pricing strategy requires choosing who you DON'T serve.**

   ##### Summary: What All 7 Personas Reveal

   **Decision matrix:**

   | Persona | Revenue | Discovers Vouch? | Pays? | At $29? | At $19? | Decision driver |
   |---|---|---|---|---|---|---|
   | Priya (first-timer) | $180/mo | No (SEO gap) | Free only | N/A | N/A | Google search results |
   | Jake (Senja switcher) | $2K/mo | IF comparison page | $29 Pro | Yes | Yes (faster) | Widget visual quality |
   | Marcus (established) | $50K/mo | IF designer finds it | $29 Pro | Yes | Yes (but $19 may hurt trust) | Designer's recommendation |
   | Sofia (course creator) | $5K+/mo | Later, outgrows Senja | $29 Pro | Yes | Yes | Video presentation quality |
   | Dev (vibe coder) | $0 | Maybe | Never | No | No | Best free tier |
   | Rachel (agency) | $20K+/mo | IF visual content | $49 Studio | Yes | N/A (needs Studio) | ROI math + white-label |
   | Tom (budget buyer) | $800/mo | Yes, skips it | Never | No | Maybe (20%) | Lowest price wins |

   **Conclusions (fact-based):**

   1. **No persona who would pay $29 is blocked by the price.** Jake was already being asked $29 by Senja. Marcus doesn't care about price. Sofia's ROI makes $29 invisible. Rachel's agency math makes $49 profitable from day one. The only personas blocked by $29 are Tom and Dev, who we intentionally DON'T want as paying customers.

   2. **Testimonial.to at $21 is NOT a competitive threat at the feature level.** Their Starter Plus ($21) includes only 2 video testimonials total, no API, no Zapier, no automated invitations, 1 space with extra spaces at $400/year. A customer comparing features would see Vouch Pro ($29) offers dramatically more for $8/mo more. The $21 price looks attractive on a comparison table but the product at that price is crippled. Anyone doing serious evaluation would choose Vouch Pro at $29 or Senja Starter at $29 over Testimonial.to Starter Plus at $21.

   3. **$19 as the standard price HURTS more than it helps.** For Marcus (established business), $19 signals "not professional." For Jake, $19 saves $10/mo but the decision was driven by visual quality, not price. For Sofia, $19 vs $29 is irrelevant against her $497 course price. The ONLY persona $19 helps is Tom, who we don't want. Meanwhile, $19 costs us $120/year per customer, which at 100 customers = $12,000/year in lost revenue.

   4. **$19 as a FOUNDER RATE (limited to first 50 users) is brilliant.** It changes the psychology entirely. $19 as the standard price = "this is a cheap tool." $19 as a limited founder rate with $29 standard = "I'm getting a deal AND supporting an indie founder." Jake sees urgency. Marcus sees an exclusive offer. Sofia sees a smart move. Same price, completely different perception.

   5. **The #1 blocker across ALL personas is DISCOVERY, not price.** Priya never finds us (SEO gap). Jake only finds us IF we have comparison pages. Sofia only switches IF she sees visual quality in her community. Marcus depends on his designer finding us. Rachel depends on visual content. Five of seven personas are gated by DISCOVERABILITY. Only two (Dev, Tom) are gated by price, and we don't want them as paying customers.

   6. **Brand trust is a real concern but solvable without brand history.** Jake and Rachel both wonder "will this company exist in 6 months?" Research shows trust for new SaaS startups is built by: (a) transparency (clear pricing, visible team), (b) dog-fooding (using the product on your own site), (c) community presence (building in public, active on X), (d) responsive support (visible contact channel), (e) real user testimonials (even 3 to 5). These are all Phase 2 tasks we already documented. Brand trust does NOT require years of history. It requires visible commitment and quality.

   7. **The Testimonial.to $21 tier and Senja's brand trust are NOT reasons to lower our price.** Testimonial.to at $21 is a feature-poor product. Senja's brand trust is overcome by VISIBLE PRODUCT SUPERIORITY (the Editorial layout screenshot on a comparison page does more than 100 blog posts). When a customer can SEE their testimonials looking 10x better in Vouch than in Senja, brand trust becomes secondary to "my eyes tell me this is better."

   #### Feature Gap Analysis: Vouch Pro ($29) vs Competitors at Similar Price Points

   **Methodology:** Every feature listed below was verified against live pricing pages scraped on March 7, 2026 (Senja, Testimonial.to, Famewall, Shapo) and cross-referenced against Vouch's actual codebase (grep of src/, public/embed.js, and API routes). "Have" means the code exists today. "Don't have" means no code exists. "Planned" means documented in sections C through I but not built.

   **The competitors at the $29 price point:**
   * Senja Starter: $29/mo (3 forms, 1 project, 2 seats)
   * Shapo Pro: $29/mo (unlimited everything)
   * Famewall Professional: $24.99/mo (15 walls, 3 team members, unlimited video)
   * Testimonial.to Premium: $34/mo per space (unlimited everything, API, Zapier, 2 seats)

   ##### WHAT VOUCH PRO ($29) HAS THAT NO COMPETITOR HAS AT ANY PRICE

   | Feature | Vouch | Senja | Testimonial.to | Famewall | Shapo |
   |---|---|---|---|---|---|
   | Golden sentence highlighting | YES (built, embed.js lines 198-212) | No | No | No | No |
   | Editorial layout (planned) | Phase 1 | No | No | No | No |
   | Minimal layout (planned) | Phase 1 | No | No | No | No |
   | Verification badges with email domain | YES (built, embed.js lines 253-254, submit route line 140) | No | No | No | No |
   | Shadow DOM embed (no style leakage) | YES (built, embed.js) | No (iframe or direct inject) | No (iframe) | No | No |
   | JSON-LD schema auto-injection for SEO | YES (built, embed.js lines 444-459) | Only on $59 Pro | Only on $50 Ultimate | Only on $9.99 Standard | Unknown |

   These are genuine differentiators. No amount of money buys golden sentence highlighting or Editorial layouts from any competitor. This is the core of our value proposition.

   ##### FEATURE-BY-FEATURE COMPARISON AT ~$29 PRICE POINT

   **Core features (collection and management):**

   | Feature | Vouch Pro $29 | Senja Starter $29 | Shapo Pro $29 | Famewall Pro $24.99 | Testimonial.to Premium $34 |
   |---|---|---|---|---|---|
   | Testimonials | Unlimited | Unlimited | Unlimited | Unlimited | Unlimited |
   | Collection forms | Unlimited | 3 | Unlimited | 15 | Unlimited |
   | Widgets | Unlimited | Unlimited | Unlimited | 15 | Unlimited |
   | Projects/spaces | Unlimited | 1 | Unknown | 15 | 1 ($400/yr per extra) |
   | Video testimonials | Unlimited | Unlimited | Unlimited | Unlimited | Unlimited |
   | Video time limit | No limit (codebase has no cap) | Unknown | Unknown | 3 minutes | 3 minutes |
   | Text testimonials | Unlimited | Unlimited | Unlimited | Unlimited | Unlimited |
   | Approve/reject | YES | YES | YES | YES | YES |
   | Search and tagging | Basic | Advanced | YES | YES | YES |
   | CSV export | YES (inbox page, Pro feature) | YES | YES | YES | YES |

   **Verdict on core features:** Vouch matches or exceeds every competitor. Unlimited forms and unlimited projects at $29 is what Senja charges $59/mo for. Testimonial.to charges $400/year per extra space. This is a clear Vouch advantage.

   **Display and embedding:**

   | Feature | Vouch Pro $29 | Senja Starter $29 | Shapo Pro $29 | Famewall Pro $24.99 | Testimonial.to Premium $34 |
   |---|---|---|---|---|---|
   | Layout options | 5 (grid, carousel, wall, list, single) + Editorial/Minimal planned | 20+ templates | Multiple | Multiple widget types | Wall of Love + single |
   | Remove branding | YES | YES | YES | YES | YES |
   | Custom fonts | YES (15 Google Fonts + custom URL) | Via Brand Kit | Unknown | YES | Unknown |
   | Custom colors/theme | YES | YES | YES | YES | YES |
   | Dark mode | Manual (user sets colors) | Manual | Unknown | Unknown | Manual |
   | Custom cards on wall | No | No | Unknown | No | YES ($34) |
   | Embed method | Shadow DOM script tag | Script tag | Script tag | Script tag/iframe | Script tag/iframe |

   **Verdict on display:** Vouch currently has 5 layouts vs Senja's 20+. This is a QUANTITY gap, not a QUALITY gap. Senja's 20 layouts are all variations of the same card-based design. None of them are "Editorial" or "Minimal" quality. Once we ship Editorial and Minimal (Phase 1), we have fewer layouts but BETTER layouts. Quality over quantity.

   **Is 5 layouts (currently) a deal-breaker?** For Jake switching from Senja: he's not switching for MORE layouts, he's switching for BETTER layouts. He only uses 1 to 2 layouts on his site. Having 20 vs 5 doesn't matter. Having 1 that looks incredible vs 20 that look generic is the decision. NOT A DEAL-BREAKER.

   **Integrations and automation:**

   | Feature | Vouch Pro $29 | Senja Starter $29 | Shapo Pro $29 | Famewall Pro $24.99 | Testimonial.to Premium $34 |
   |---|---|---|---|---|---|
   | Zapier | NO | YES | Unknown | YES | YES |
   | Make.com | NO | No | Unknown | YES | YES |
   | API (public, documented) | NO | YES | Unknown | YES | YES |
   | Webhooks | NO (only LS payment webhook) | YES | Unknown | YES | YES |
   | Auto-import from review sites | NO | YES (autosync, 18+ sources) | YES (20+ sources) | YES (30+ sources) | YES (10+ sources) |
   | Chrome extension for import | NO | YES | No | No | YES |
   | CSV/JSON import | PLANNED (Section F, not built) | YES | YES | YES | YES |
   | Automated email invitations | NO | YES (invites + tracking) | Unknown | No | YES (T.E.A., 500/mo on Premium) |

   **This is our biggest gap.** Every competitor at $29 has Zapier, API, and auto-import. We have NONE of these. Let me evaluate each:

   **Zapier/Make (NO):**
   * What it does: Connects Vouch to other tools. Common automations: "New testimonial → Slack notification," "New testimonial → add to CRM," "New testimonial → tweet."
   * Who needs it: Power users with multi-tool workflows. Agencies with complex stacks.
   * Who doesn't need it: Solo founders who check their dashboard directly. Freelancers with simple setups.
   * Persona impact: Priya (no), Jake (maybe, used Zapier for other tools), Marcus (no, his team handles things manually), Sofia (no, she checks her dashboard), Dev (no), Rachel (yes, wants automation), Tom (no, wants cheap not automated).
   * **Deal-breaker assessment: NO for 5 of 7 personas. MILD FRICTION for Jake and Rachel. Jake can live without it because his primary reason for switching is visual quality. Rachel might want it eventually but it's not her day-one requirement (white-label and client reports are). This should be built in Phase 3 or 4, not Phase 1.**

   **Public API and webhooks (NO):**
   * What it does: Lets developers build custom integrations. Webhooks push real-time events to external URLs.
   * Who needs it: Developers building custom workflows, agencies with custom client portals.
   * Who doesn't need it: Non-technical users (Priya, Sofia, Dev), solo founders with standard workflows (Jake), established businesses using the dashboard (Marcus).
   * Persona impact: Only Rachel (agency, might want custom integration) would use this.
   * **Deal-breaker assessment: NO for 6 of 7 personas. Rachel might want this in 6 months but not on day one. Build in Phase 4.**

   **Auto-import from review sites (NO):**
   * What it does: Pull in existing reviews from Google Reviews, G2, Capterra, Trustpilot, X, LinkedIn, etc. Senja does this from 18+ sources. Famewall from 30+.
   * Who needs it: Businesses with existing reviews on third-party platforms.
   * Who doesn't need it: Anyone starting fresh (Priya, Dev), anyone whose testimonials are collected directly (Sofia's students submit through her form).
   * Persona impact: Marcus (has Google Reviews for his consulting firm), Rachel (clients might have existing reviews). Jake has some Senja testimonials but we handle that with CSV import.
   * **Deal-breaker assessment: MODERATE for Marcus and Rachel. However, CSV import (planned, Section F) covers the migration use case. Marcus can export from Google Reviews as CSV and import. Not as elegant as one-click, but functional. Auto-import from specific platforms should be Phase 4 (Section F5). NOT a launch deal-breaker.**

   **CSV/JSON import (PLANNED but NOT BUILT):**
   * This IS a deal-breaker if not built before launch. Jake needs to import his 18 Senja testimonials. Rachel needs to import client testimonials. Without CSV import, they can't even evaluate Vouch with their real data.
   * **Deal-breaker assessment: YES, this must be built in Phase 1 or early Phase 2. Already documented as F1 (highest priority in migration section). No pricing change needed, just execution.**

   **Automated email invitations (NO):**
   * What it does: Senja lets you bulk-invite customers by email to leave testimonials, with follow-up reminders. Testimonial.to has T.E.A. (500 invitations/month on Premium).
   * Who needs it: Anyone collecting at scale (100+ customers).
   * Who doesn't need it: Anyone with a small customer base who shares the form link manually (Priya, Dev, Jake, Sofia).
   * Persona impact: Marcus (might want to email 50 clients) and Rachel (managing 8 client testimonial programs).
   * **Deal-breaker assessment: NO for 5 of 7 personas. For Marcus and Rachel, manual form sharing works for the first 20 to 30 testimonials. Automated invitations become valuable at scale. Build in Phase 4 or 5.**

   **Chrome extension for import (NO):**
   * Only Senja and Testimonial.to have this. It scrapes testimonials from any webpage in 2 clicks.
   * **Deal-breaker assessment: NO. This is a convenience feature, not a core capability. One-click competitor import (Section F2) serves the same purpose through our own UI. Not a priority.**

   **Team and collaboration:**

   | Feature | Vouch Pro $29 | Senja Starter $29 | Shapo Pro $29 | Famewall Pro $24.99 | Testimonial.to Premium $34 |
   |---|---|---|---|---|---|
   | Team seats | 1 | 2 | Unknown | 3 | 2 (account-level) |
   | Role-based access | No | No | Unknown | No | No (space-level seats on $50 only) |
   | Team collaboration | No code exists | Basic | Unknown | Basic | Basic |

   **Seat gap: 1 seat (Vouch) vs 2 (Senja, Testimonial.to) vs 3 (Famewall):**
   * Who needs 2+ seats: Marcus (wants his designer to access), Rachel (has 4 employees).
   * Who needs 1 seat: Jake (solo founder), Sofia (solo creator), Priya (solo), Dev (solo).
   * Persona impact: Marcus is mildly inconvenienced (he can share login credentials as a workaround, which is common for small teams with simple tools). Rachel needs Studio ($49, which includes 5 seats).
   * **Deal-breaker assessment: NO for solo personas (4 of 7). MILD FRICTION for Marcus. Rachel gets seats on Studio. Adding 1 extra seat to Pro (total 2) would eliminate this friction entirely. Low-effort fix, not a pricing issue.**

   **AI features:**

   | Feature | Vouch Pro $29 | Senja Starter $29 | Shapo Pro $29 | Famewall Pro $24.99 | Testimonial.to Premium $34 |
   |---|---|---|---|---|---|
   | AI review summary on widgets | No | No | Unknown | YES | No |
   | AI case study generator | No | No | Unknown | No | YES ($21+) |
   | AI composer (guided testimonial writing) | No | No | Unknown | YES ($24.99+) | No |
   | AI style generator | No | No | Unknown | No | No |
   | Testimonial analysis | No | YES (free tier) | Unknown | No | No |

   **AI feature gap:**
   * Famewall has "AI Review Summary on widgets" (shows an AI-generated summary of all testimonials on the widget) and "AI Composer" (guides the testimonial author through writing). Testimonial.to has an AI case study generator.
   * **Deal-breaker assessment: ABSOLUTELY NOT. Nobody switches testimonial tools because of AI summary. These are marketing checkboxes, not decision drivers. In the 7 persona role-plays, not a single persona's decision was influenced by AI features. They're nice-to-have features that can be added later. Zero urgency.**

   **Other features:**

   | Feature | Vouch Pro $29 | Senja Starter $29 | Shapo Pro $29 | Famewall Pro $24.99 | Testimonial.to Premium $34 |
   |---|---|---|---|---|---|
   | Custom domain for forms | No | YES | Unknown | YES (4 domains) | YES |
   | Video download/export | No dedicated download | HD video exports | Unknown | HD video downloads | YES (download MP4) |
   | Language translation | No | No ($59 Pro only) | Unknown | YES (auto-translate) | No ($21 only page localization) |
   | Testimonial analytics | No | YES (free tier) | Unknown | YES | No |
   | Widget analytics (views/clicks) | PLANNED (Section I4) | YES | Unknown | YES | YES ($50 only: video metrics) |
   | Form analytics (views/submissions) | YES (form_views table) | Unknown | Unknown | Unknown | Unknown |
   | Gamification (Spin the Wheel) | No | YES ($29) | No | No | No |
   | eGift cards incentive | No | No | No | No | YES ($34, 7% fee) |
   | Word of Mouth (share prompt) | No | YES ($29) | Unknown | No | No |
   | Social media video creation | No | YES (sizzle reels, free) | Unknown | YES (free) | No |
   | Wall of Love public page | YES (/p/[slug]) | YES | Unknown | YES | YES |
   | Embed collecting widget | No (form is a separate page) | YES | Unknown | No | YES |
   | Portfolio/brand page | No | No | Unknown | YES (Famewall $9.99+) | YES ($34: portfolio page) |

   **Notable gaps from this section:**

   **Custom domain (NO):**
   * Lets you use `testimonials.yourbrand.com` instead of `vouch.app/c/[formId]`.
   * Who cares: Marcus (brand consistency), Rachel (client-facing professionalism). Jake and Sofia don't care (they share a link, the domain doesn't matter for form submission UX).
   * **Deal-breaker assessment: NO for most personas. A "nice to have" that signals professionalism. Every competitor has it. Should be built eventually (Phase 3 or 4) but not launch-blocking. The collection form URL is only seen by the person submitting the testimonial, not by website visitors. The widget on the site is embedded via script tag, not a URL.**

   **Video download/export (NO dedicated feature):**
   * Videos are stored (Supabase storage via upload-video route) but there's no "download this video" button in the dashboard.
   * **Deal-breaker assessment: NO. This is a small UX gap. The video exists in storage and could be downloaded via URL. Adding a download button is a T2 task (a few hours). Not a pricing or positioning concern.**

   **Widget analytics (PLANNED but not built):**
   * Senja and Famewall both show widget view counts. We don't, yet. Planned in Section I4.
   * **Deal-breaker assessment: NO for purchase decision (nobody buys a testimonial tool for analytics). YES for retention (users who can't see their widget is working question the tool's value). This is a Phase 5 retention feature, not a Phase 1 launch feature.**

   **Gamification/Spin the Wheel (NO):**
   * Senja's unique feature. After submitting a testimonial, the submitter spins a wheel for a chance to win a reward. Increases submission rate.
   * **Deal-breaker assessment: NO. Cute feature but not a purchase driver. Nobody says "I chose Senja because of Spin the Wheel." It's a retention/engagement feature, not an acquisition feature.**

   ##### FINAL GAP VERDICT: WHAT MUST BE BUILT BEFORE LAUNCH AT $29

   **Must have (blocks launch at $29):**
   1. CSV/JSON import (Section F1). Without this, switchers can't evaluate Vouch with their real data. Already highest priority in migration section.
   2. Editorial layout (Section D1). This is THE differentiator that justifies $29 vs competitors. Without it, we have the same output quality as Senja at the same price, but with fewer features. That's a losing proposition.
   3. Minimal layout (Section D2). Paired with Editorial, covers both design-conscious personas.

   **Should have (strengthens the $29 proposition, build in Phase 2):**
   4. Second seat on Pro (currently 1 vs competitors' 2 to 3). Tiny code change, removes friction for Marcus.
   5. Video download button in dashboard. Small UX feature, easy to build.
   6. Upgrade existing layout quality (Section D4). Larger text, smoother transitions, less clutter.

   **Nice to have (build in Phase 3+, NOT needed for $29 launch):**
   7. Zapier/Make integration
   8. Public API and webhooks
   9. Custom domains for forms
   10. Auto-import from review platforms
   11. Automated email invitations
   12. Widget analytics (view counts)
   13. AI features (summary, composer)
   14. Language translation
   15. Gamification
   16. Chrome extension

   **Conclusion: There are ZERO deal-breaker gaps that would make $29 unjustifiable, provided we ship the Editorial layout, Minimal layout, and CSV import before launch.** The integration gaps (Zapier, API, auto-import) are real but they don't drive purchase decisions for our target personas. Our target personas (Jake, Marcus, Sofia, Rachel) choose based on VISUAL QUALITY, not integration count. The integration gaps matter for retention at scale (Phase 3+), not for initial conversion.

   **The comparison page math that sells $29:**
   "At $29/mo, Vouch Pro gives you unlimited testimonials, forms, widgets, and projects. Senja charges $59/mo for that. Plus, Vouch has premium layouts no competitor offers at any price, golden sentence highlighting, and testimonial verification badges. Try free, import your existing testimonials, and see the difference with your own data."

### C. Premium Widget Strategy (THE differentiator)

**The problem with every competitor's widget:** They all look like "a testimonial widget." White cards, orange stars, small text, grid layouts. Every Senja embed is recognizably Senja. Every Testimonial.to Wall of Love looks the same. The output screams "third-party tool." No premium SaaS (Linear, Stripe, Sanity, Synthesia) uses these tools. They build custom testimonial sections because the tools look generic.

**Vouch's positioning: "Social proof that looks like you built it."** The widget output must actually deliver on this promise. If a designer can't tell it's an embed, we win.

**What premium actually means (from auditing 74 SaaS testimonial sections):**

1. **Looks like the website built it, not like a tool.** No fixed card style. The widget adapts to look native on any site. No "widget smell."

   **Why:** This is literally our tagline. "Social proof that looks like you built it." But right now our widget output looks identical to Senja's or Shapo's: white cards, rounded corners, shadow, stars. A Webflow designer would take one look and say "that's an embed." The moment a widget looks like a third-party tool, it cheapens the host site. Premium SaaS companies (Linear, Stripe, Vercel) never use testimonial widgets precisely because they all look generic. If we solve this, we unlock the entire market of design-conscious users who currently build testimonials by hand.

   **What wrong looks like:** Adding more card "themes" (glassmorphism, gradient borders, neon glow). That's decoration, not integration. The widget should have NO visual identity of its own. It should inherit the host site's personality.

2. **Typography and spacing that breathe.** Premium SaaS sites use 18 to 24px for key quotes with generous whitespace. Current tools cram testimonials into tight cards with 13 to 14px font.

   **Why:** We audited the Saaspo gallery. Every premium SaaS (Sanity, Linear, Primer, Dash0) uses large pull-quotes as the visual anchor. The quote IS the design element. Our current 14px body text gets lost on the page. When text is small, users skim past it. When a quote is 22px and bold, it commands attention and feels intentional. The whitespace around it signals confidence ("we don't need to cram 10 testimonials on screen, one powerful quote is enough").

   **What wrong looks like:** Making ALL text bigger (that just looks zoomed in). The hierarchy matters: the pull-quote/golden sentence should be large (20 to 24px), the attribution should be small (12 to 13px), and there should be clear visual separation between them. Also: don't add whitespace controls to the dashboard ("padding: [slider]"). Instead, bake premium spacing into the layout itself. Users shouldn't have to configure their way to good design.

3. **Visual hierarchy through restraint.** Premium testimonials show ONE proof (quote), ONE authority signal (name/role/company logo), ONE trust signal (video/verification/logo). Not stars AND date AND badge AND avatar AND company AND role all at once. Pick the strongest signals. Let them breathe.

   **Why:** We counted the visual elements in our current card: avatar, name, role, company, verified domain badge, star rating, date, metric badge, golden sentence highlight, source icon. That's 10 distinct elements competing for attention in a single card. Compare to Linear's customer page: company icon, headline, "Read story" link. Three elements. The Bucket testimonial section: quote, name, company logo. Three elements. Clutter destroys trust because it looks desperate ("look at ALL the proof!"). Restraint builds trust because it looks confident ("one quote is enough").

   **What wrong looks like:** Removing elements from the existing layouts (that breaks backwards compatibility for current users). Instead, the NEW premium layouts (Editorial, Minimal) should be restrained by default, and users can opt-in to more elements if they want. The existing grid/carousel/wall layouts keep their current element set.

4. **Motion that feels intentional.** Smooth scroll-based reveals. Subtle parallax. Carousel transitions that feel native, not a jQuery slider from 2015.

   **Why:** We looked at Senja's carousel. It works, but the transitions are abrupt (instant slide, no easing). Shapo's carousel has basic dot navigation. Compare to how Framer sites or Linear's homepage animate content: elements fade in on scroll, carousels ease with spring physics, hover states have smooth transitions. Motion is the easiest way to signal "this is premium" without changing the layout at all. A carousel that slides with a 300ms cubic-bezier ease feels 10x more polished than one that snaps instantly.

   **What wrong looks like:** Adding gratuitous animations (parallax on every element, bouncing avatars, particle effects). Motion should be felt, not seen. If someone notices the animation, it's too much. The goal: "that felt smooth" not "that was animated." Keep it to: (1) scroll-triggered fade-in on first appearance, (2) smooth carousel transitions with easing, (3) hover states with 150ms transitions. That's it.

5. **Video as a first-class citizen.** Video testimonials are the highest-trust format but every tool treats them as "a card with a play button." Premium: large thumbnails, face-forward framing, auto-play on hover (muted), smooth poster-to-video transition. Think Netflix thumbnails.

   **Why:** Video testimonials are our strongest conversion tool. A real person speaking about their experience is 10x more persuasive than text. But currently, video in our widget is a small thumbnail with a generic play button circle overlaid. It looks like an afterthought. On Synthesia's site, video testimonials are hero-sized panels with the person's face filling the frame. The quote is overlaid directly on the video. This makes video the STAR, not a footnote. If we're going to compete, video presentation is where we can win because we already have good video collection and playback (session 7 optimizations). The last mile is the display quality.

   **What wrong looks like:** Auto-playing all videos at once (performance disaster, annoying). Making video thumbnails full-screen on every layout (not appropriate for a compact grid). Instead: auto-play on hover ONLY for the Cinematic Video layout. For existing layouts, improve the thumbnail size and play button design but don't fundamentally change the interaction.

6. **Dark mode and theme-awareness.** Not just "light cards on dark background." Actual detection/adaptation to the host site's color scheme.

   **Why:** We saw Testimonial.to's Wall of Love: dark themed, looks great on their own dark site. But if you embed it on a light site, you get dark cards on a white page, which looks jarring. Our widget lets users set a background color, but it doesn't detect the host site's theme. If someone's Webflow site uses `prefers-color-scheme: dark`, our widget should respect that automatically. This is a technical differentiator (we use Shadow DOM, so we can query the host page's computed styles) and a UX differentiator (zero-config dark mode).

   **What wrong looks like:** Only supporting light and dark (some sites use custom color schemes). The right approach: auto-detect the host page's background color and text color as defaults, let users override if they want. This way the widget "just works" on any site without configuration.

**Vouch's current widget gaps (from auditing embed.js):**
   * 14px body text, 13px compact. Too small for premium.
   * 14px border-radius cards with shadow or border. Generic, looks like every other tool.
   * Stars + date + metric badge all shown simultaneously. Cluttered.
   * Video is thumbnail + play button overlay. Functional but not premium.
   * Golden sentence highlighting is a REAL differentiator. No competitor has this. Lean into it.
   * Custom font support already exists. Push further: line-height, quote size presets, pull-quote styling.

**Vouch's existing advantages to amplify:**
   * Golden sentence highlighting (unique in the market)
   * Shadow DOM embed (SEO-indexable, no style leakage)
   * Custom fonts (already supported, competitors charge extra for this)
   * Video testimonials with optimized playback (session 7 work)

### D. New Widget Layouts to Build (priority order)

These are the layouts that would make Vouch categorically different from every competitor. Priority order matters: #1 is the differentiator we launch with, #4 is maintenance work.

1. [ ] **"Editorial" layout (NO competitor has this). PRIORITY: HIGHEST.**

   **What it is:** Full-width, magazine-style testimonial display. One testimonial at a time, taking up a full section of the page. Large pull-quote (20 to 24px) with golden sentence highlighted. Author photo large (not a tiny 32px circle, but a 80 to 120px image or even a cropped background). Company logo displayed prominently. Navigation between testimonials via subtle arrows or dots.

   **Why this is #1:** We audited every competitor. None of them offer anything close to this. Senja has 12+ widget types but they're all variations of "cards in a grid/carousel." This layout is what premium SaaS companies build by hand (see: Sanity's testimonial section with large customer photos and company logos, Linear's case study cards, Primer's testimonial section with industry tabs and large headshots). If we offer this as a one-click embed, we're the only tool in the market that can produce output a designer would actually want on their site. This is the layout we screenshot for Product Hunt, for comparison pages, for X posts. It IS the marketing.

   **What wrong looks like:** Making it a "big card" (just scaling up the existing card with more padding). That's not editorial, that's a zoomed-in widget. Editorial means: the quote is the hero. The author is the supporting character. There is NO card border or background. The content sits directly on the page. The golden sentence highlight is the visual accent. The overall feel should be "this is a section of the website" not "this is an embedded thing." Also wrong: making it require configuration to look good. It should look stunning with zero customization.

   **Inspiration (specific screenshots we saw):** Sanity (dark bg, large customer photo, company logo, pull-quote). Bucket (minimal, two quotes side by side, company logos as attribution). Dash0 (dark carousel, large headshot, quote, company name).

   **Technical notes:** This is a new layout option in the widget builder, stored as `layout: 'editorial'` in the widget config. Rendered in embed.js alongside existing layouts. Should support both auto-rotate (timed) and manual navigation. One testimonial visible at a time. Responsive: on mobile, stack the photo above the quote.

2. [ ] **"Minimal" layout. PRIORITY: HIGH.**

   **What it is:** The anti-widget. Quote and attribution only. No stars, no borders, no shadows, no card background. Just the quote text and the person's name/role below it. Uses the host site's typography by default (inherits font-family unless overridden). Looks like the site's developer wrote an `<h3>` and a `<p>`.

   **Why this is #2:** Designers and developers hate testimonial widgets because they inject a foreign visual language into their carefully crafted sites. The Minimal layout solves this by having NO visual language of its own. It's pure content. This appeals to the design-conscious segment (Webflow freelancers, agency sites, portfolio sites) who would never use Senja because it "looks like Senja." This layout passes the screenshot test by default because there's nothing to identify it as a widget.

   **What wrong looks like:** Adding "just a little" styling (a thin border, a subtle background tint, quote marks in a decorative font). That defeats the purpose. Minimal means: text, name, nothing else. Also wrong: making it look boring/unstyled. Minimal is not unstyled. The typography itself is the design. The font size, weight, line-height, and spacing must be carefully tuned so it looks intentional, not lazy.

   **Display options:** Single quote (centered), two quotes side by side (like Bucket), or three in a row. The golden sentence gets highlighted even here (it's the one visual flourish). Company logo as attribution is optional.

3. [ ] **"Cinematic Video" layout. PRIORITY: MEDIUM.**

   **What it is:** Hero-sized video panels (not small thumbnails). Each testimonial is a large video thumbnail (16:9, minimum 400px tall on desktop) with the person's face as the poster. Quote overlaid on the video in a semi-transparent strip at the bottom. On hover: video auto-plays muted for 3 to 5 seconds as a preview. On click: full playback with audio.

   **Why this is #3 (not #1):** Video testimonials are the highest-trust format and this layout would be stunning. But: (a) not every Vouch user has video testimonials (many have text only), so this layout serves a subset of users, (b) it's technically more complex (hover auto-play, poster transitions, performance), (c) the Editorial and Minimal layouts serve ALL users and are the bigger differentiation story. However, for users who DO have video, this layout would be unmatched. No competitor presents video this way.

   **What wrong looks like:** Auto-playing all videos simultaneously (performance and UX disaster). Tiny video thumbnails with a big play button (that's what we already have). Making the quote overlay cover too much of the face (the face is the trust signal, don't hide it). Making it work only for one video (it should support 2 to 4 videos in a row, like Synthesia's layout).

   **Technical notes:** Intersection Observer for auto-play on hover. Poster-to-video transition should be seamless (the poster IS the first frame of the video, or a matched thumbnail). Video elements are lazy-loaded. On mobile: stack vertically, auto-play disabled (mobile data concerns), tap to play.

4. [ ] **Upgrade existing layouts (grid, carousel, wall, list, single). PRIORITY: LOWER.**

   **What it is:** Quality improvements to the 5 existing layouts without breaking them for current users.

   **Why this is #4:** Existing layouts work. They're not premium, but they're functional. Spending time polishing them gives diminishing returns compared to shipping the Editorial layout which is a completely new value proposition. However, once the new layouts ship, the contrast will make the old layouts look worse, so they'll need a quality pass.

   **Specific improvements:**
   * Larger text option: add a `textSize` theme option ('compact' = current 13/14px, 'default' = 15/16px, 'large' = 17/18px). Default new widgets to 'default' instead of compact.
   * More whitespace: increase card padding from 20px to 24px for default size. Increase gap between cards from current to 16 to 20px.
   * Smoother transitions: carousel should use CSS `transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1)` instead of instant snap. Cards should fade in on first render with `opacity 0->1` over 200ms.
   * Reduce default clutter: new widgets should default to hiding the date and metric badge (users can enable them). Stars and avatar stay visible by default.
   * Better video: increase thumbnail size in grid/wall layouts. Replace the generic circle play button with a more polished design (rounded rectangle with blur backdrop, like YouTube's).

   **What wrong looks like:** Changing defaults for EXISTING widgets (breaks customer sites). New defaults only apply to newly created widgets. Existing widgets keep their current settings.

### E. Widget Quality Benchmarks (definition of done for "premium")

These are not aspirational. Every widget change MUST pass these before shipping. If it fails any test, it's not done.

1. **The screenshot test:** Take a screenshot of the widget embedded on a real site (not our demo page). Show it to someone who doesn't know Vouch. If they say "that's a testimonial widget" or "that's an embed," it FAILED. If they say "that looks like part of the site" or don't comment on it at all, it PASSED.

   **Why this test exists:** Every competitor fails this test. Senja widgets are recognizably Senja. Testimonial.to walls are recognizably Testimonial.to. Our entire positioning ("looks like you built it") lives or dies by this test. If we fail it, we're just another widget tool with a nice tagline.

   **How to run it:** Embed the widget on at least 2 different site styles (one light, one dark, different fonts). Screenshot each. Send to someone (friend, designer, anyone not involved) and ask "what do you notice about the testimonials section?" If they comment on the widget itself rather than the testimonial content, redesign.

2. **The Linear test:** Would this widget look at home on linear.app/customers? Linear's customers page uses: dark background, minimal typography, company icons, outcome-focused headlines, no decorative elements. It's the gold standard for premium testimonial presentation.

   **Why this test exists:** It prevents us from confusing "pretty" with "premium." A widget can have gradient borders, glassmorphism, and animated stars and still fail this test because Linear would never use those. Premium is about restraint, clarity, and confidence. This test forces us to ask "is this design confident?" not "is this design flashy?"

3. **The designer test:** Would a Webflow designer choose this over building the testimonial section themselves in Webflow? If not, the design isn't strong enough to justify the existence of a tool.

   **Why this test exists:** Our target users (freelancers, agencies, SaaS founders) CAN build testimonial sections themselves. They use tools to save time. But they'll only use a tool if the output is at least as good as what they'd build. If our widget output is worse than what a competent designer would make in 30 minutes, they'll build it themselves and we have no product-market fit.

   **The bar:** A designer should look at the Editorial layout and think "I couldn't easily build something this polished this fast." That's the value proposition: not just saving time, but producing a BETTER result than DIY.

4. **The clutter test:** Count the distinct visual elements in one testimonial unit. For the Editorial and Minimal layouts: maximum 4 elements (quote, golden sentence highlight, name/role, one trust signal like a company logo or verification). For existing layouts (grid/carousel/wall): maximum 6 elements.

   **Why this test exists:** Our current card has 10 elements. That's information overload. Users don't read testimonials element by element. They glance. If the glance is overwhelming, they scroll past. Every element we add dilutes every other element. The golden sentence highlight (our differentiator) gets lost when it's competing with stars, badges, dates, icons, and avatars for attention.

5. **The typography test:** Is the pull-quote/golden sentence large enough to read comfortably from a normal viewing distance? For Editorial: minimum 20px. For Minimal: minimum 18px. For existing layouts: minimum 15px (up from current 14px).

   **Why this test exists:** Small text signals "this is supplementary content, skip it." Large text signals "this is important, read it." We want testimonials to command attention, not get ignored. Every premium SaaS testimonial section we audited uses 18px+ for the primary quote. Our current 14px (13px compact) is the size of body text footnotes.

### F. Migration Strategy (reduce friction to zero for switchers)

**Current state:** Vouch has CSV EXPORT (Pro feature, in inbox page) but ZERO import capability. No CSV import, no URL import, no migration from competitors, no bulk import. A user switching from Senja or Testimonial.to would need to manually re-enter every testimonial. That's a complete dealbreaker. Nobody will switch tools if it means losing all their existing testimonials.

**What competitors offer today:**

**Senja (the gold standard for migration):**
   * One-click import from Testimonial.to (paste your Wall of Love URL, it scrapes everything)
   * CSV/XLS/XLSX bulk import with field mapping
   * Chrome Extension that imports testimonials from ANY website in 2 clicks (scrapes the page, extracts name/quote/avatar)
   * Auto-import from 30+ platforms (Google Reviews, G2, Capterra, Trustpilot, Product Hunt, X, LinkedIn, Reddit, Facebook, Instagram, Yelp, Zillow, Airbnb, Shopify, and more) with scheduled auto-sync on paid plans
   * Manual import (add one at a time via form)
   * Dedicated migration page at `/testimonial-software/migration` that says "If you're a paying customer of any other tool, we'll migrate you free of charge." They literally do it for you within 24 hours.

**Famewall:**
   * CSV bulk import with field mapping (including a `testimonial_type` column that maps to 26+ source types: Twitter, LinkedIn, Reddit, G2, Capterra, Trustpilot, etc.)
   * One-click import from LinkedIn, Clutch, G2, Twitter, and 30+ platforms
   * No Chrome extension, no concierge migration service

**Testimonial.to:**
   * CSV bulk import with template download
   * Import from 17 third-party sources (Trustpilot, Capterra, LinkedIn, etc.)
   * Export available (which is what Senja targets with their one-click migration)

**Vouch: Nothing.** This is our biggest gap after the premium widget work.

#### Why migration is THE growth lever for a late entrant

We're entering a market where thousands of users already have testimonials in Senja, Testimonial.to, or Famewall. These users will NOT re-collect testimonials from scratch. The ONLY way they switch is if migration is effortless. But it goes further: migration isn't just about retaining data. It's about targeting **disgruntled customers** of competitors.

From our research, here's why people leave each competitor:
   * **Leave Testimonial.to:** High pricing ($50/mo for features), limited widget customization, dated design
   * **Leave Famewall:** Limited customization, basic automation, layouts feel similar, "feel limited"
   * **Leave Senja:** No all-access free trial (can't evaluate before paying), $29/mo starting price

These are real pain points with real people searching for alternatives RIGHT NOW. If switching to Vouch means "paste your Wall of Love URL, your testimonials appear in 10 seconds, and they look 10x better in our premium widgets," that's an irresistible pitch.

#### Migration features to build (priority order)

1. [ ] **CSV/JSON import with smart field mapping. PRIORITY: HIGHEST.**

   **Why this is #1:** This is table stakes. Every competitor has this. Without it, we can't even claim to support migration. CSV is the universal exchange format. Every tool exports to CSV.

   **What it must do:**
   * Accept CSV, JSON, and XLS upload in the dashboard (inbox page or a dedicated import page)
   * Auto-detect common field names (name, email, content, rating, company, role, date, video_url, avatar_url, source). Competitors use different column names. We should map common variations: `testimonial` = `content` = `text` = `review`, `author` = `name` = `reviewer`, etc.
   * Show a field mapping UI where the user can match their CSV columns to Vouch fields (like Famewall does)
   * Preview the first 3 to 5 rows before confirming import
   * Handle video URLs (if a row has a `video_url`, treat it as a video testimonial)
   * Auto-approve imported testimonials (they were already approved in the source tool)
   * Show a summary after import: "Imported 47 testimonials. 3 skipped (missing content)."

   **What wrong looks like:** Requiring a specific CSV format (users won't reformat their export). Having a rigid column order instead of flexible mapping. Not handling edge cases (empty rows, special characters, long text with line breaks, missing fields). Importing everything as "pending" (makes the user re-approve 200 testimonials, which is infuriating).

   **DB impact:** The testimonial submission API can be reused. Each imported testimonial is an INSERT into the testimonials table with `status: 'approved'` and `source: 'import'`. Need to respect the user's plan limits (if we cap free at 10, and they try to import 50, show a clear message about upgrading).

2. [ ] **One-click import from competitor Wall of Love URLs. PRIORITY: HIGH.**

   **Why:** This is what makes migration feel magical. Senja does this for Testimonial.to. We should do it for ALL competitors. The user pastes their Testimonial.to Wall of Love URL, their Senja public page URL, or their Famewall wall URL, and we scrape the testimonials automatically.

   **What it must do:**
   * Accept a URL input
   * Fetch the page server-side (API route)
   * Parse the HTML/JSON to extract: author name, author avatar, content, rating, date, company, role, video URL
   * Show a preview: "Found 23 testimonials. Import all?"
   * Handle both text and video testimonials
   * Support at minimum: Testimonial.to walls, Senja public pages, Famewall walls

   **Why this is a competitive weapon:** Senja only does this for Testimonial.to (their biggest competitor). We can do it for EVERYONE including Senja. On our comparison pages, we can say: "Switching from Senja? Paste your public page URL and your testimonials are in Vouch in 10 seconds." That's a conversion killer.

   **What wrong looks like:** Scraping breaking when the competitor changes their HTML (this WILL happen). We need to build this defensively: if scraping fails, fall back to "download your CSV from [competitor] and upload it here" with step-by-step instructions for each competitor. Also: don't scrape behind auth walls. Only scrape publicly accessible pages.

   **Technical approach:** Server-side fetch + HTML parsing (cheerio or similar). Testimonial.to walls use structured data that's relatively easy to parse. Senja and Famewall walls also have predictable HTML structures. We can also look for JSON-LD structured data on these pages (which would be the most reliable source).

3. [ ] **Competitor-specific migration guides. PRIORITY: HIGH.**

   **Why:** Even with one-click import, some users will need help. And the migration guides double as SEO content targeting "how to switch from Senja" and "export Testimonial.to data."

   **Pages to create:**
   * `/migrate/from-senja` (step-by-step: export from Senja, import to Vouch, set up widgets)
   * `/migrate/from-testimonial-to` (step-by-step: export from Testimonial.to, or paste Wall of Love URL)
   * `/migrate/from-famewall` (step-by-step: export from Famewall, import CSV)
   * `/migrate/from-shapo`
   * `/migrate/from-csv` (generic: for users coming from any tool or a spreadsheet)

   **What each guide must include:** Screenshot of where to find the export button in the competitor's dashboard. What format the export comes in. How to upload it to Vouch. What happens to their data (all fields mapped, videos included, auto-approved). Time estimate ("takes about 2 minutes"). A "need help? email us" fallback.

   **What wrong looks like:** A generic "upload CSV" help doc. That doesn't reduce anxiety. Users switching tools are nervous about losing data. The guide must be specific to their current tool, show them exactly what the experience will be, and reassure them nothing will be lost.

4. [ ] **"We'll do it for you" concierge migration. PRIORITY: MEDIUM.**

   **Why:** Senja offers this: "If you're a paying customer of any other tool, we'll migrate you free of charge." This removes ALL friction. The user emails their export file, Senja does the import within 24 hours. For a solo founder, this is actually easy to do manually (it's just a CSV import you run yourself). But it FEELS like white-glove service. It signals "we care about you switching."

   **How to implement:** Not code. Just a section on the migration page and comparison pages: "Switching from a paid plan on another tool? Email us your export and we'll set everything up for you, free. You'll be live on Vouch within 24 hours." Then you literally do the CSV import for them. Time investment: 10 minutes per migration. But the conversion impact is huge because it removes the last objection ("what if I mess up the import?").

   **What wrong looks like:** Promising this and not delivering quickly. If someone emails and doesn't hear back for 3 days, the trust is broken. Set a 24-hour SLA and actually meet it.

5. [ ] **Import from social platforms (X, LinkedIn, Google Reviews). PRIORITY: LOWER (after core migration).**

   **Why:** Senja imports from 30+ platforms. We don't need 30 on day one, but we need the 3 that matter most: Google Reviews (every business has them), X/Twitter (creators post praise there), LinkedIn (B2B testimonials live there). This isn't about migration from competitors. It's about importing testimonials that already exist in the wild.

   **What wrong looks like:** Building all 30 import sources before shipping the core CSV import. Start with 3. Add more based on user requests. Also: don't build auto-sync (scheduled re-import) until we have paying customers who need it. That's a scaling feature, not a launch feature.

   **Technical approach:** For X and LinkedIn: user pastes the post URL, we fetch via API or scrape, extract the quote/author/avatar. For Google Reviews: user pastes their Google Business URL, we scrape the reviews. Each requires different parsing logic. Start simple: URL input, server-side fetch, extract structured data.

#### The migration pitch (how this becomes marketing)

Once migration is built, it becomes a centerpiece of our comparison pages and marketing:

   * **Comparison page CTA:** "Already using Senja? Switch to Vouch in 60 seconds. Paste your page URL and see your testimonials in our premium widgets."
   * **Landing page section:** "Switching is easy. Import from any tool in one click."
   * **"Powered by Vouch" badge:** When someone clicks the badge on a free embed, the landing page could detect they're already using a competitor (referrer header) and show a migration-specific CTA.

The migration experience IS the product demo for switchers. If they paste a URL and see their testimonials instantly rendered in the Editorial layout with golden sentence highlighting, they're sold. No free trial needed. No feature comparison needed. They just SAW the difference with THEIR OWN DATA.

### G. Verified Testimonials: The Trust Moat (authenticity as differentiator)

**The market shift we're building for:**

The vibe coding explosion has fundamentally changed who builds products. In 2024, building an MVP meant hiring a freelancer ($5K to $15K) or months learning to code. In 2026, non-technical founders go from idea to deployed prototype in an afternoon using Lovable, Bolt, Replit, or Cursor. Y Combinator reported 25% of their Winter 2025 batch had codebases that are 95% AI-generated. Thousands of products are launching weekly on Product Hunt. The barrier to building is gone.

**What this means for testimonials:**

1. **More products = more noise = testimonials matter MORE.** When everyone can build a product, the question shifts from "can you build it?" to "should I trust it?" Testimonials are the answer. They're the proof that real humans used this thing and it worked. For first-time founders who don't have brand recognition, testimonials are their ENTIRE credibility.

2. **But these new founders don't know this.** Many vibe-coding founders are non-technical, first-time builders. They might not know that testimonials increase conversion by 34% (Spiegel Research). They might not know where to put them, how to ask for them, or why they matter. They need to be EDUCATED, not sold to.

3. **AI makes fake testimonials trivially easy.** ChatGPT can generate 50 realistic testimonials in 30 seconds. This is already happening. The FTC's 2024 Consumer Review Rule (effective Oct 21, 2024) explicitly bans AI-generated fake reviews, with penalties up to $53,088 per violation. But enforcement is slow. The market is flooding with fake social proof.

**The opportunity: Vouch = verified. Period.**

No testimonial tool in the market currently solves the fake testimonial problem. Senja has NO verification mechanism. Testimonial.to has NO verification. Famewall has NO verification. They all let you manually add any testimonial with any name. Anyone can type in "John from Google: This product changed my life, 5 stars" and embed it on their website. There's zero proof it's real.

Vouch already has the foundation: we extract professional email domains and show a green shield icon in the widget. `email_domain: extractProfessionalDomain(authorEmail)` in the submit route, displayed as a shield + domain in embed.js. But this is just a start. We need to turn this into a SYSTEM that makes "Verified by Vouch" mean something.

#### G1. Verification system to build (the trust moat)

The goal: when someone sees a "Verified by Vouch" badge on a testimonial, it should carry the same weight as Amazon's "Verified Purchase" badge. It means: this is a real person, with a real email, who actually submitted this testimonial through our collection form.

1. [ ] **Verification tiers (display on widget). PRIORITY: HIGH.**

   **Tier 1: Email Verified.** The person submitted through our collection form AND confirmed their email address (clicked a verification link). This is the baseline. It proves a real email exists behind the testimonial. Currently, we collect email but don't verify it. Adding email verification to the collection form (send a confirmation link, testimonial only goes live after click) would make every Vouch testimonial provably from a real email address. No competitor does this.

   **Why this matters:** An AI-generated fake testimonial can use any name and role, but it can't confirm a verification email sent to `john@stripe.com`. Email verification is the simplest, strongest proof of authenticity.

   **What wrong looks like:** Making email verification mandatory for ALL testimonials (some collection forms don't ask for email, video testimonials are already high-trust). Make it optional but incentivized: if the submitter verifies their email, the testimonial gets a "Verified" badge in the widget. If not, it still displays but without the badge. This creates a natural incentive for both the submitter and the collector.

   **Tier 2: Domain Verified.** The person submitted with a professional email (not gmail/yahoo), and we display their company domain. We ALREADY have this (`email_domain` extraction + shield icon in embed.js). But it's subtle (10px text, easily missed). We should make it more prominent: a proper badge like "Verified: works at stripe.com" with a shield icon.

   **Tier 3: Source Verified.** The testimonial links to a public source (X post, LinkedIn recommendation, Google Review). The source URL is clickable in the widget. We ALREADY have this (the X and LinkedIn icons in embed.js that link to the source). This proves the testimonial exists on a third-party platform the business can't control.

   **What the widget should show:** A small "Verified by Vouch" mark at the bottom of verified testimonials. Clicking it could open a mini-explainer: "This testimonial was submitted by a real person who verified their email through Vouch's collection form." This is the trust signal that makes Vouch testimonials different from any manually-entered testimonial on any competitor.

   **What wrong looks like:** Making every testimonial show "Verified" (that devalues the badge). The badge should ONLY appear when there's actual verification (email confirmed, or source URL present). Unverified testimonials (imported, manually added) should NOT get the badge. This maintains the badge's integrity.

2. [ ] **"Verified by Vouch" public trust page. PRIORITY: MEDIUM.**

   **What it is:** A page at `/verified` (or similar) that explains what "Verified by Vouch" means. When someone sees the badge in a widget and clicks it, they land here. The page explains: every Vouch testimonial with a "Verified" badge was submitted by a real person through our secure collection form, with email verification, and we block disposable emails. It's not just text pasted by a business owner.

   **Why this matters:** This is the trust infrastructure. Amazon has "What does Verified Purchase mean?" Trustpilot has their trust system explained. We need the same. It turns "Verified by Vouch" from a visual badge into a verifiable claim.

   **What it must include:**
   * How Vouch collection works (the person fills out the form themselves, not the business owner)
   * Email verification process
   * Disposable email blocking (we already have this)
   * Professional domain extraction
   * Source URL linking for third-party verification
   * A clear statement: "Vouch does not allow businesses to write testimonials on behalf of their customers"

3. [ ] **FTC compliance as a feature. PRIORITY: MEDIUM.**

   **Why:** The FTC's 2024 rule bans fake reviews, AI-generated testimonials, and incentivized reviews conditioned on positive sentiment, with penalties up to $53,088 per violation. Most first-time founders don't know this rule exists. Most testimonial tools don't mention it. If we educate our users about compliance AND build tools that help them stay compliant, we become the responsible choice.

   **What to build:**
   * A blog post: "FTC Testimonial Rules: What Every Founder Needs to Know in 2026"
   * In the dashboard, when a user manually adds a testimonial (not collected through the form), show a small info note: "Manually added testimonials don't receive the Verified badge. For verified testimonials, use your collection form."
   * If/when we add incentive features (e.g., "get a discount for leaving a testimonial"), include a compliance note: "You can offer incentives for testimonials, but you cannot require positive feedback. This is an FTC requirement."

   **What wrong looks like:** Being preachy or legalistic (founders will ignore it). The tone should be: "Hey, here's something important you should know about. Vouch helps you stay compliant automatically."

#### G2. Content strategy for first-time founders (educate, don't sell)

**The audience:** Non-technical founders using Lovable, Bolt, Replit, Cursor. They just built their first product. They're thinking about launch, pricing, and getting users. They may not have considered social proof at all. They don't know what a "Wall of Love" is. They don't know that testimonials increase conversions. They need to be educated FIRST, then offered a tool SECOND.

**The tone:** NOT marketing pitches. These should read like advice from a friend who's been through it. "Here's what I wish I knew when I launched my first product." Practical, specific, with examples. If a post sounds like it's selling Vouch, it's wrong. The posts should be useful even if the reader never signs up.

**Content to create:**

1. [ ] **"Why Nobody Trusts Your New Product (and How to Fix It)." PRIORITY: HIGH.**

   **What it covers:** The trust gap every new product faces. Why visitors bounce. The psychology of social proof (specific stats: 92% of consumers read testimonials before purchasing, pages with testimonials convert 34% higher). Real examples of products that added testimonials and saw conversion lift. Practical steps: how to get your first 5 testimonials, where to display them, what makes a testimonial convincing vs. generic.

   **Why this exists:** This is the top-of-funnel content for first-time founders. They Google "why is no one signing up for my product" or "how to get first customers." This post answers their question and naturally leads to testimonials as a solution. Vouch is mentioned once at the end as a tool option, not as the focus.

   **What wrong looks like:** "Top 10 Reasons You Need Vouch" dressed up as educational content. The reader should get genuine value even if they collect testimonials manually in a Google Doc.

2. [ ] **"The First-Time Founder's Guide to Social Proof." PRIORITY: HIGH.**

   **What it covers:** What social proof is (for someone who's never heard the term). The different types: testimonials, reviews, user counts, logos, media mentions, case studies. Which types work for which stage (0 users, 10 users, 100 users, 1000 users). How to ask for testimonials without being awkward (email templates, timing). Where to display them (landing page, pricing page, checkout). The fake testimonial problem and why authenticity matters.

   **Why this exists:** This is the piece we wish existed when we started. It's comprehensive, practical, and written for someone who just vibe-coded their first app. It positions Vouch as the brand that educates the market, not just sells to it.

3. [ ] **"How to Make Your Product Stand Out When Everyone Can Build One." PRIORITY: HIGH.**

   **What it covers:** The vibe coding reality: thousands of products launching. How to differentiate when features are copyable. The role of trust, brand, and social proof. Why the product with 50 real testimonials beats the product with better features but no social proof. Specific examples from Product Hunt: products that launched with testimonials vs. without, and the difference in traction.

   **Why this exists:** This directly addresses the "AI builder wave" concern. First-time founders are worried about competition. This post tells them: the answer isn't building more features, it's building more trust. And testimonials are the fastest path to trust.

4. [ ] **"Fake Testimonials Are Illegal (and Your Customers Can Tell)." PRIORITY: MEDIUM.**

   **What it covers:** The FTC 2024 rule in plain English. How AI makes fake testimonials easy but detectable. What happens when you get caught (penalties, reputation destruction). How to build genuine social proof instead. Why verified testimonials are the future.

   **Why this exists:** This educates the market about the problem Vouch solves with verification. It positions us as the trustworthy choice without directly pitching. The founders who read this and think "oh, I should make sure my testimonials are real" are our exact target customers.

5. [ ] **"How [Niche] Founders Use Testimonials to Convert" (series, after niche is chosen). PRIORITY: LOWER.**

   **What it covers:** Niche-specific guides with real examples. "How Webflow Freelancers Use Client Testimonials to Win Projects." "How Course Creators Use Video Testimonials to Sell Out Launches." Specific placement strategies, testimonial formats, and widget styles that work for that niche.

   **Why this exists:** These are mid-funnel pieces for our chosen niche. Someone who already knows testimonials matter but wants specific tactical advice for their situation.

#### G3. Content quality principles

These apply to ALL content we create, blog posts, marketing pages, comparison pages, everything.

1. **Educate first, sell never.** If a piece reads like a pitch, rewrite it. The reader should learn something valuable regardless of whether they sign up. Vouch can be mentioned as ONE option among several. Trust is built by being helpful, not by being salesy.

2. **Show, don't describe.** Instead of "our widgets look premium," embed a live widget in the blog post. Instead of "testimonials increase conversions," show a before/after screenshot of a real landing page. Visual proof > written claims.

3. **Write for someone who just built their first app yesterday.** No jargon (what's a "Wall of Love"? what's "social proof"?). Define terms the first time you use them. Use simple language. If a 22-year-old who just vibe-coded their first SaaS with Lovable can't understand the post, it's too complicated.

4. **Be honest about competitors.** In comparison posts, acknowledge what competitors do well. "Senja has 30+ import sources, which is impressive." Then show where we're different. Honesty builds trust. Bashing competitors looks desperate.

5. **Every post needs ONE specific, actionable takeaway.** Not "testimonials are important." Instead: "Here's the exact email template to send your first 5 customers to ask for a testimonial, and here's where to put them on your landing page." The reader should be able to DO something after reading.

---

### H. SEO and Content Strategy (THE distribution engine)

**Current state of Vouch's web presence:** Landing page (`/`), pricing (`/pricing`), terms, privacy, referral. That's it. No blog. No comparison pages. No feature pages. No use-case pages. No content that Google can index and rank. We are invisible to search engines. If someone Googles "testimonial software," "Senja alternative," or "best video testimonial tool," Vouch does not exist.

**What competitors do (and it works):**

Senja has a `/compare` hub with individual pages for every competitor: `/compare/testimonial-to-alternative`, `/compare/boast-io-alternative`, `/compare/endorsal-io-alternative`, `/compare/famewall-alternative`, `/compare/socialjuice-alternative`, `/compare/elfsight-alternative`, `/compare/bonjoro-alternative`, `/compare/delighted-alternative`, `/compare/usetrust-alternative`. Each page follows the same template: hero ("Your search for an alternative to [X] ends here"), video testimonial of a customer who switched, feature comparison checklist, pricing comparison, CTA. They also have blog posts like "12 Best Testimonial.to Alternatives."

Famewall (a small indie tool like us) has 20+ blog posts including: "16 Testimonial Page Examples to Increase Revenue," "The Ultimate Testimonials Guide for 2026," "30 Testimonial Questions to Ask Clients," "How to get Coaching Clients faster," "Top 10 Kajabi Website Examples," customer case studies ("How Avery Smith Uses Famewall for Social Proof & Built a 6-Figure Business"), comparison posts ("Senja Alternative"), and even adjacent content like "5 Best AI Marketing Tools" and "5 Best Lead Generation Tools." They also have a PDF lead magnet ("50 Best Testimonial Questions") that captures emails.

**This is how a solo founder with a $9.99/mo tool competes with VC-backed players. Content is the equalizer.**

#### H1. Website Marketing Pages (build the case for Vouch)

These are not blog posts. These are permanent pages on the site that make the argument for why Vouch is the premium choice. They need to be built AFTER the premium widgets ship, because the visual proof IS the argument.

1. [ ] **Widget Showcase page (`/widgets` or `/showcase`). PRIORITY: HIGHEST.**

   **Why:** This is the single most important marketing page we can build. Every competitor has one (Senja: `/testimonial-widgets`, Shapo: `/testimonial-widgets`, Famewall: `/widgets-showcase`). This is where a potential customer decides "does this tool produce output I'd actually put on my site?" Currently, we have nothing. A visitor lands on our homepage, sees marketing copy, but never sees what the actual widget looks like on a real site.

   **What wrong looks like:** A static page with screenshots. That's a brochure. The page should have LIVE embedded widgets (using our own embed.js) showing each layout on different background styles (light, dark, colored). The visitor should see the Editorial layout on a mock site section, the Minimal layout on another, the Cinematic Video layout on another. They should be able to interact with carousels, hover on videos. This page IS the product demo.

   **What it must include:** Live demos of every layout (Editorial, Minimal, Cinematic Video, Grid, Carousel, Wall, List, Single). Each demo on a different visual context (simulating different host sites). The golden sentence feature highlighted prominently. A "this is what competitors' widgets look like vs. ours" visual comparison (side by side). CTA after each section.

   **Why this page wins:** No competitor shows live interactive widget demos on their showcase page. They all use static screenshots or simple previews. If we show LIVE embeds that look premium, the page sells itself. A visitor doesn't need to sign up to see the quality difference.

2. [ ] **"Why Vouch" page (`/why-vouch`). PRIORITY: HIGH.**

   **Why:** Senja has "Why Senja?" in their top nav with dropdown content. This is the page that converts someone who's comparing tools. It needs to articulate our specific advantages without being generic ("we're better, faster, cheaper" means nothing).

   **What it must include:**
   * **"Looks like you built it" section** with visual proof: a split-screen showing the same testimonials displayed in a generic widget (competitor-style) vs. our Editorial/Minimal layout. The difference should be viscerally obvious.
   * **Golden sentence highlighting demo**: show a long testimonial with and without the golden sentence highlighted. Show how it transforms a wall of text into a scannable quote.
   * **Shadow DOM explainer**: in simple terms, explain why our embed doesn't break their site's styles and why it's SEO-indexable (competitors' iframes are not).
   * **Video-first approach**: show how video testimonials look in our Cinematic layout vs. a tiny thumbnail with a play button.

   **What wrong looks like:** A feature comparison table with checkmarks. Every competitor does this. It's boring and users don't read them. Instead, SHOW the difference visually. One screenshot is worth 100 checkmarks.

3. [ ] **Comparison pages (`/compare/[competitor]`). PRIORITY: HIGH.**

   **Why:** When someone Googles "Senja alternative" or "Testimonial.to vs [something]," they're actively shopping. These are the highest-intent searches in our category. Senja has 9+ comparison pages. Famewall has them too. We have zero. Every comparison page we create is a door that doesn't exist right now.

   **Pages to create (priority order based on competitor size):**
   * `/compare/senja` (their biggest competitor, highest search volume)
   * `/compare/testimonial-to` (well-known, YC brand)
   * `/compare/famewall` (budget competitor, people searching for alternatives)
   * `/compare/shapo` (similar size, direct competitor)
   * `/compare/endorsal` (established player)

   **What each page must include:**
   * Honest feature comparison (not just "we're better at everything." Acknowledge where the competitor is strong. Then show where we're different.)
   * Visual proof: side-by-side widget screenshots. "Here's what a testimonial section looks like with [competitor]. Here's what it looks like with Vouch." This is where the premium widget work pays off.
   * Pricing comparison with specific plan details.
   * Our unique angle: "If you want the most integrations, use Senja. If you want testimonials that look like your designer built them, use Vouch."
   * CTA to sign up free.

   **What wrong looks like:** Bashing the competitor ("Senja is bad because..."). That looks desperate and petty. The tone should be: "Senja is great for X. Vouch is great for Y. Here's how to decide." Honesty builds trust. Let the widget screenshots do the selling.

   **SEO impact:** Each page targets "[competitor] alternative" and "Vouch vs [competitor]" keywords. These are long-tail, low competition, high intent. Even 10 to 20 visitors/month per page adds up across 5 pages.

4. [ ] **Use-case pages (`/for/[segment]`). PRIORITY: MEDIUM (after niche is chosen).**

   **Why:** These pages target segment-specific searches like "testimonials for freelancers," "video testimonials for coaches," "social proof for Webflow sites." They also signal to visitors "this tool is built for people like me," which is more persuasive than "this tool is built for everyone."

   **Pages to create (after niche decision):**
   * `/for/freelancers`
   * `/for/agencies`
   * `/for/saas`
   * `/for/coaches` (if that's our niche)
   * `/for/webflow` (if that's our niche)

   **What each page must include:** A persona-specific headline ("Social proof for freelancers who care about design"). Widget demos using testimonials relevant to that segment. Specific pain points for that segment and how Vouch solves them. Pricing context for that segment.

   **What wrong looks like:** Creating these pages before picking a niche. If we make 5 generic use-case pages, none of them will be specific enough to rank or convert. Pick the niche first, make ONE exceptional use-case page, then expand.

#### H2. SEO Content (blog posts that drive organic traffic)

The blog serves two purposes: (1) rank for informational queries that bring potential customers to the site, (2) establish authority so Google trusts our domain for competitive queries.

**Content tiers (priority order):**

1. [ ] **Bottom-of-funnel comparison content. PRIORITY: HIGHEST.**

   These are blog posts targeting people actively shopping for testimonial tools. They complement the `/compare` pages.

   **Posts to write:**
   * "Best Testimonial Software in 2026 (Honest Comparison)" (targets "best testimonial software 2026")
   * "7 Best Senja Alternatives with Better Design" (targets "Senja alternatives")
   * "Testimonial.to Alternatives: Which Tool Looks Best on Your Site?" (targets "Testimonial.to alternatives")
   * "Best Video Testimonial Software for [Niche] in 2026"

   **Why these first:** These keywords have proven search volume (we can see competitors ranking for them). The intent is commercial (the reader wants to buy something). The competition is beatable (Famewall, WiserReview, and Shoutjar rank for these, not just VC-backed players).

   **What wrong looks like:** Writing generic "Top 10 Testimonial Tools" listicles that read like every other one. Our posts must have a unique angle: VISUAL COMPARISONS. Show screenshots of each tool's widget output side by side. No one does this. Everyone writes feature tables. We show what the output actually looks like. This is our differentiator in content too.

2. [ ] **Mid-funnel educational content. PRIORITY: MEDIUM.**

   These target people who know they need testimonials but haven't started looking for tools yet.

   **Posts to write:**
   * "How to Create a Testimonial Page That Actually Converts (with Examples)" (Famewall ranks for this)
   * "The Best Testimonial Questions to Ask Your Clients"
   * "How to Display Testimonials on Your Website Without Looking Generic"
   * "Video Testimonials: The Complete Guide for [Niche]"

   **Why these matter:** They build domain authority (Google sees our site as an authority on testimonials). They capture email leads (offer a downloadable template or guide at the end). They create internal links to our comparison and feature pages, boosting those pages' rankings.

   **What wrong looks like:** Writing 500-word thin content just to have a blog post. Each post should be genuinely useful, 1,500 to 2,500 words, with original examples (preferably using our own widgets as demos). If we wouldn't share the post ourselves, it shouldn't be published.

3. [ ] **Top-of-funnel adjacent content. PRIORITY: LOW (only after tiers 1 and 2 are done).**

   These target broader searches that are related to our audience but not directly about testimonials.

   **Examples:** "How to Build Trust on Your Freelance Website," "Social Proof Psychology: Why Testimonials Work," "Website Conversion Tips for SaaS Landing Pages."

   **Why low priority:** These drive traffic but convert poorly. Someone reading "social proof psychology" is not ready to buy a tool. These only make sense once we have enough bottom-of-funnel content to capture the ready-to-buy audience.

#### H3. Website Conversion Elements (make the site sell)

These are not pages but elements on existing pages that make the difference between a visitor bouncing and a visitor signing up.

1. [ ] **Live widget demo on the landing page. PRIORITY: HIGHEST (tied with widget showcase).**

   **Why:** Our landing page currently describes what Vouch does. It should SHOW what Vouch does. A live embedded widget (our own embed.js, running on the landing page itself) showing the Editorial layout with golden sentence highlighting would be more convincing than any amount of marketing copy. We should be eating our own dog food.

   **What wrong looks like:** A static screenshot or mockup of the widget. If we use a static image, it's no different from any competitor's landing page. The widget should be LIVE and interactive. Visitors should be able to see carousels move, hover on video thumbnails, experience the quality firsthand without signing up.

2. [ ] **Social proof on the landing page (once we have customers).**

   **Why:** Senja shows "loved by 20,000+ customers" with avatar stack and star rating on every page. We can't fake this. But once we have even 5 to 10 real users, we should display them. Even "trusted by 10 early adopters" with real names is more persuasive than nothing.

   **What wrong looks like:** Fake testimonials with stock photos. Users can tell. Wait for real ones.

3. [ ] **"Powered by Vouch" badge strategy.**

   **Why:** Every free widget embed should have a small "Powered by Vouch" link. This is a free marketing channel: every user's website becomes a billboard. Senja does this. Testimonial.to does this. The badge should link to our landing page with a UTM parameter so we can track conversions.

   **What wrong looks like:** Making the badge too prominent (users will feel punished and leave). Making it too hidden (no one clicks). The sweet spot: a small, tasteful text link below the widget. "Collect testimonials with Vouch" or similar. Pro users can remove it. This is the upgrade incentive for design-conscious users.

#### H4. Competitor Workflow Audit (user to do)

User will create free accounts on competitor tools and share the experience. This will inform:
   * Where competitors' collection forms are better or worse than ours
   * Where competitors' dashboards are better or worse
   * Where competitors' widget builders are better or worse
   * Specific screenshots for comparison pages and blog content

**Tools to sign up for and audit:** Senja (free), Testimonial.to (free), Famewall (free), Shapo (free). For each: go through the full flow (create form, collect a test testimonial, create a widget, embed it). Note friction points, UX wins, and visual quality.

### I. Onboarding, Retention, and Operational Gaps (the stuff that kills you silently)

**Why this section exists:** Sections A through H cover what to BUILD. This section covers what to OPERATE. A product with great widgets and zero onboarding loses 60%+ of signups in the first 5 minutes. A product with no help docs generates support emails that eat your time as a solo founder. A product with no engagement emails gets forgotten and churned. These are not features. They are survival infrastructure.

#### I1. Onboarding and Activation Flow (time to value under 5 minutes)

**Current state:** Vouch has NO onboarding. After signup, the user lands on the dashboard and has to figure everything out themselves. No guided setup, no welcome wizard, no progress indicators, no "here's what to do first" prompt.

**Why this is critical:** Average SaaS activation rate is only 37.5% (Userpilot 2025 data). That means 62.5% of people who sign up never reach the "aha moment." For Vouch, the aha moment is: "I embedded the widget on my site and it looks amazing." Every step between signup and that moment is friction that kills activation. Strong onboarding reduces churn by 20 to 50%.

**What wrong looks like:** A 15-step onboarding wizard that asks for company name, industry, team size, goals, integrations, and preferences before letting the user do anything. That's interrogation, not onboarding. Also wrong: a single tooltip tour that points at UI elements ("this is the inbox, this is forms"). That's a tour, not activation. Users don't care about features. They care about outcomes.

**What right looks like:**

1. [ ] **Post-signup activation checklist (visible in dashboard). PRIORITY: HIGH.**

   A simple 4-step checklist that stays visible until completed:
   * Step 1: Create your first collection form (link to forms page with pre-filled defaults)
   * Step 2: Collect your first testimonial (share your form link, or submit a test one yourself)
   * Step 3: Create a widget (link to widget builder, auto-selects the testimonial you just collected)
   * Step 4: Embed on your site (copy the script tag, with platform-specific instructions)

   Each step has a "Mark as done" or auto-completes when the action is taken. Progress bar shows completion. When all 4 are done, celebrate: "You're live! Your testimonials are now showing on your site."

   **Why a checklist and not a wizard:** Checklists let users go at their own pace and skip around. Wizards force a linear path. Checklists also persist across sessions (if a user signs up and comes back 2 days later, they see where they left off). Wizards are lost if you close the tab.

   **DB impact:** Could store checklist state in the user's profile metadata in Supabase, or derive it from existing data (has_form, has_testimonial, has_widget, has_embed_view).

2. [ ] **Welcome email sequence (3 emails over 7 days). PRIORITY: HIGH.**

   Currently, Vouch sends a single email when a new testimonial is submitted. There is NO welcome email, no onboarding email sequence, no re-engagement emails.

   * **Email 1 (immediate):** "Welcome to Vouch. Here's your first step." Links to create a collection form. Includes the activation checklist as a visual element.
   * **Email 2 (Day 2):** "Need testimonials? Here's a template you can send your clients." Provides a copy-paste email/message template asking for testimonials. This is the #1 thing first-time users struggle with: they don't know HOW to ask.
   * **Email 3 (Day 5):** "Your widget is waiting." If the user hasn't created a widget yet, nudge them. If they have, show them the premium layouts and what Pro unlocks.

   **Why email matters for activation:** Many users sign up with intent but get distracted. Email is the only channel that can re-engage them outside the product. Without it, a user who doesn't complete setup in their first session is likely lost forever.

   **What wrong looks like:** Generic "welcome to our platform!" emails with no actionable next step. Sales-y emails that push Pro before the user has experienced value. Too many emails (more than 3 in the first week feels spammy for a testimonial tool).

   **Technical approach:** Use Resend (already integrated). Trigger emails based on signup event and user state (has_form, has_testimonial, has_widget). Store email send state to avoid duplicates.

#### I2. Platform-Specific Embed Guides (for the vibe-coding generation)

**Current state:** Vouch shows a `<script>` tag to copy. That's it. No instructions on WHERE to paste it or HOW it works on different platforms.

**Why this matters:** The vibe-coding wave means many Vouch users are building on Lovable, Bolt, Replit, Framer, Webflow, WordPress, Squarespace, or Wix. Each platform has a different way to add custom code. A non-technical founder who built their site with plain English prompts may not know what a "script tag" is, let alone where to put one. If they can't embed the widget, they can't see the value, and they churn.

**What to build:**

1. [ ] **Platform-specific embed instructions in the widget builder. PRIORITY: HIGH.**

   After the user copies the embed code, show a dropdown: "Where is your site hosted?" Options: Webflow, Framer, WordPress, Squarespace, Wix, Lovable, Bolt, Next.js, HTML, Other.

   For each option, show 2 to 3 step instructions with screenshots:
   * **Webflow:** "Go to your page settings > Custom Code > Paste in the 'Before </body> tag' section > Publish"
   * **Framer:** "Add a Code component > Paste the script > Resize to fit"
   * **WordPress:** "Use a Custom HTML block in the page editor > Paste the code"
   * **Lovable/Bolt:** "Tell your AI: 'Add this script tag to the page where I want testimonials' and paste the code"

   **What wrong looks like:** A separate help docs site that the user has to navigate to. The instructions should be RIGHT THERE in the widget builder, inline, at the moment the user needs them. Also wrong: assuming everyone knows HTML. The Lovable/Bolt instruction literally tells them to paste it into their AI prompt, because that's how they work.

2. [ ] **Dedicated `/docs/embed` page with full guides. PRIORITY: MEDIUM.**

   Longer-form versions of the above for SEO and reference. Each platform gets its own section with screenshots and troubleshooting tips. Also doubles as SEO content targeting "how to add testimonials to Webflow" and similar queries.

#### I3. Help Documentation (zero exists today)

**Current state:** Vouch has ZERO documentation. No help center, no FAQ, no knowledge base, no tooltips explaining features.

**Why this matters:** As a solo founder, every support question that requires a personal email reply costs you 10 to 15 minutes. If 5 users a day have the same question ("how do I embed?" or "how do I approve a testimonial?"), that's over an hour daily answering the same thing. Help docs are not a nice-to-have. They are a scaling mechanism that lets you support 1,000 users with the same effort as 10.

**What to build:**

1. [ ] **Inline help (tooltips and contextual hints in dashboard). PRIORITY: HIGH.**

   Small `(?)` icons next to non-obvious features that expand to explain what they do. Examples:
   * Next to "Golden Sentence": "Highlight one key sentence in each testimonial. This sentence will be visually emphasized in your widget."
   * Next to "Verified" badge in inbox: "This testimonial was submitted through your collection form with a verified professional email domain."
   * Next to widget layout options: brief description of what each layout looks like.

   **Why inline beats a separate help site:** Users don't leave the page to find help. The answer is right where the question arises. For simple "what does this do?" questions, inline tooltips eliminate 80% of support load.

2. [ ] **FAQ page at `/help` or `/docs`. PRIORITY: MEDIUM.**

   Cover the top 10 questions every testimonial tool gets asked:
   * How do I share my collection form?
   * How do I embed the widget on my site?
   * Can I customize the widget's appearance?
   * How do I approve/reject testimonials?
   * What's the difference between Free and Pro?
   * How do I import existing testimonials?
   * What does "Verified" mean?
   * Can I use video testimonials?
   * How do I remove the "Powered by Vouch" badge?
   * How do I cancel or change my plan?

   **What wrong looks like:** A 50-page knowledge base before you have 50 users. Start with the top 10 questions. Add more based on actual support inquiries.

#### I4. Widget Analytics (prove value, reduce churn)

**Current state:** Vouch has `form_views` tracking (form views and submissions) but NO widget analytics. Users cannot see how many times their widget was viewed, how many people clicked on a testimonial, or any engagement data.

**Why this matters:** The #1 reason SaaS users churn is low usage / not seeing value (37% of churn, per Recurly data). If a Vouch user embeds a widget and never sees proof that it's working, they question whether it's worth paying for. "Is anyone even seeing my testimonials?" If we can show them "Your widget was viewed 847 times this month and 23 people clicked to read more," that's concrete proof of value. It makes the Pro subscription feel justified.

**What to build:**

1. [ ] **Basic widget view tracking. PRIORITY: MEDIUM.**

   When embed.js renders, fire a lightweight beacon to an API endpoint: `POST /api/widgets/[id]/view` with minimal data (timestamp, referrer). Count views per widget per day. Display in the dashboard: "Your widgets were viewed X times in the last 30 days" with a simple sparkline chart.

   **What wrong looks like:** Tracking every scroll, hover, and click (that's analytics overkill for a testimonial tool). Also wrong: making the tracking slow (it must not delay widget rendering). Fire-and-forget, non-blocking, no impact on widget performance.

   **Privacy note:** No cookies, no personal data, no fingerprinting. Just aggregate view counts. This is GDPR-safe because we're not tracking individual users.

2. [ ] **Weekly digest email (for active users). PRIORITY: MEDIUM.**

   "This week on Vouch: Your widgets were viewed 234 times. You received 3 new testimonials. Your top-performing testimonial is from [Name]." This email serves two purposes: (1) it proves the tool is working, (2) it brings inactive users back to the dashboard. Both reduce churn.

   **What wrong looks like:** Sending a digest email to users who have zero activity ("Your widgets were viewed 0 times" is depressing, not engaging). Only send to users with at least some data to report.

#### I5. Execution Sequencing (the roadmap across sections A through I)

**The problem:** We now have sections A through I with dozens of items across premium widgets, migration, verification, SEO, onboarding, and docs. Without a clear execution order, there's a risk of spreading too thin, building things in the wrong order, or spending weeks on SEO content when the product itself isn't differentiated yet.

**The principle: product before distribution.** No amount of SEO, content, or comparison pages will convert users if the widget output looks generic. The premium widget work (sections C and D) is the foundation everything else builds on. Migration pages need to show testimonials rendered in the Editorial layout to be compelling. Comparison pages need to screenshot our widgets next to competitors' to prove we're better. The product IS the marketing.

**Recommended execution order (not rigid, but a guide):**

**Phase 1: Product Differentiation (build the thing worth talking about)**
1. Editorial layout (D1). This is the screenshot. This is the Product Hunt hero image. This is what makes someone say "that looks different."
2. Minimal layout (D2). Paired with Editorial, this covers both ends: premium and invisible.
3. Upgrade existing layout quality (D4). Larger text, smoother transitions, less clutter.
4. Free tier cap at 10 testimonials (B1). Flip the switch before launching publicly.

**Phase 2: Activation Infrastructure (make sure signups stick)**
5. Onboarding checklist in dashboard (I1.1). Users who sign up must reach the aha moment.
6. Platform-specific embed guides (I2.1). Remove the last barrier between signup and value.
7. Inline help tooltips (I3.1). Reduce friction without building a full docs site.
8. Welcome email sequence (I1.2). Re-engage users who don't complete setup in session 1.

**Phase 3: Migration and Growth (bring in competitors' users)**
9. CSV/JSON import (F1). Table stakes for switching.
10. One-click competitor import (F2). The magic trick.
11. Competitor migration guides (F3). SEO content that also reduces friction.
12. Comparison pages (H1). "Vouch vs Senja," "Vouch vs Testimonial.to," etc.

**Phase 4: Trust and Content (build the moat)**
13. Verification tiers (G1.1). Email verified, domain verified, source verified.
14. "Verified by Vouch" page (G1.2). The trust infrastructure.
15. FTC compliance content (G1.3). Education as differentiation.
16. Blog content (H2). SEO long-tail articles.
17. Cinematic Video layout (D3). For video-heavy users.

**Phase 5: Engagement and Retention (keep users paying)**
18. Widget analytics (I4.1). Prove value.
19. Weekly digest emails (I4.2). Keep users engaged.
20. Social platform imports (F5). Google Reviews, X, LinkedIn.
21. FAQ/docs page (I3.2). Scale support.

**Why this order:** Phase 1 creates the product worth switching to. Phase 2 ensures signups convert to active users. Phase 3 brings in competitors' disgruntled customers with zero friction. Phase 4 builds long-term defensibility. Phase 5 optimizes retention once there are users to retain. Each phase builds on the previous one. Skipping ahead (e.g., writing comparison pages before the widgets are premium) produces content that works against us.

**What wrong looks like:** Jumping to Phase 3 or 4 because content is "easier" than building premium widgets. The content will fail without the product to back it up. Also wrong: trying to do all 5 phases simultaneously. Pick ONE phase, complete it, move to the next.

### J. Infrastructure and Operational Survival (things that kill you before competitors do)

**Why this section exists:** Sections A through I are about building the RIGHT product and getting it to the RIGHT people. This section is about making sure the product stays alive, doesn't break customers' sites, and doesn't bankrupt you before you get traction. These are not features. They are existential risks.

#### J1. Supabase Free Tier is a Ticking Time Bomb

**Current state:** Production runs on Supabase free tier (Nano instance, ap-south-1). We've already seen 503 errors on HEAD/count requests.

**The hard truth:** Supabase free tier pauses projects after 7 days of inactivity. Nano instances can burst above baseline but fall back to baseline when burst is exhausted. The free tier has NO backups, NO SLA, a 500 MB database limit, a 200 concurrent connection ceiling, and 2 GB egress per month. If a widget goes viral on someone's site and generates 10,000 API calls in an hour, we're down.

**What wrong looks like:** Staying on free tier "until we have paying customers." The first paying customer who embeds our widget on a high-traffic site will trigger an outage, and that customer will churn immediately and tell everyone. Also wrong: upgrading to Pro ($25/mo) when we have zero revenue (that's $300/year burning with no income).

**The right move:**

1. [ ] **Upgrade to Supabase Pro ($25/mo) BEFORE any public launch or Product Hunt. PRIORITY: CRITICAL.**

   This is the cost of doing business. $25/mo gets: no pausing, daily backups, 8 GB database, 250 GB egress, and an SLA. If we can't afford $25/mo, we can't afford to run a SaaS. This should happen in Phase 1 (before the product is publicly promoted). A testimonial tool that goes down when testimonials are being displayed is unforgivable.

   **Timing:** Upgrade when we're ready to share the product with anyone outside of personal testing. Not before (no point paying while we build), not after (too risky).

2. [ ] **Set up Supabase database backups and test a restore. PRIORITY: HIGH.**

   Even on Pro, verify that point-in-time recovery works. Run a test: export the database, drop a table in a test environment, restore from backup. Know the recovery procedure BEFORE you need it.

#### J2. embed.js Has No Versioning or CDN Strategy (one bad push breaks every customer)

**Current state:** `embed.js` is served directly from the Vercel deployment at `/embed.js`. There is no version number, no CDN pinning, no rollback mechanism. If we push a buggy update to embed.js, EVERY customer's widget on EVERY website breaks instantly. There's no way to roll back without reverting the entire deployment.

**Why this is existential:** The widget is our product. It runs on our customers' websites, in front of THEIR customers. If we break it, we don't just lose our customer. We break their site's social proof section. Their visitors see a broken widget or nothing at all. That customer will never trust us again.

**What competitors do:** Senja serves widgets from `widget.senja.io` with a separate deployment. Testimonial.to uses `embed-v2.testimonial.to`. They can deploy widget updates independently of their main app.

**What to build:**

1. [ ] **Add a version hash to embed.js URL. PRIORITY: HIGH.**

   When the widget builder generates the embed code, include a version parameter: `<script src="https://[domain]/embed.js?v=2.1.0"></script>`. The version is a static string we bump manually when we make breaking changes. Existing customers keep their version. New customers get the latest. We can update the version in the widget builder without forcing old embeds to change.

   **What wrong looks like:** Auto-updating all embeds to the latest version (defeats the purpose of versioning). Also wrong: using a hash of the file content (changes on every build, cache-busts too aggressively). Use semantic versions we control.

2. [ ] **Serve embed.js through a CDN with proper cache headers. PRIORITY: MEDIUM.**

   Currently, Vercel serves the file. Vercel is fast but it's a single point of failure tied to our deployment. If we deploy and something breaks, the CDN can serve the cached version while we fix it. Set `Cache-Control: public, max-age=86400, s-maxage=604800` (1 day browser, 1 week CDN). Bust the cache by bumping the version parameter.

3. [ ] **Pre-deployment embed.js testing. PRIORITY: HIGH.**

   Before any deployment that touches embed.js: test it on a real site (our own landing page with a real widget). This is manual for now. Eventually, we could add a visual regression test.

#### J3. Dog-Fooding: Use Vouch on Vouch (credibility and demo)

**Current state:** Our landing page does NOT use Vouch to display testimonials. We have platform logos (Framer, Webflow, WordPress, etc.) and feature descriptions, but no actual testimonials from real users displayed via our own widget.

**Why this is a critical gap:** We're selling a testimonial tool. If our own site doesn't use our product, why should anyone trust it? Every competitor eats their own cooking: Senja's homepage shows testimonials via Senja widgets. Testimonial.to's homepage uses Testimonial.to embeds. Famewall's site displays testimonials via Famewall. If a potential customer visits our landing page and sees zero social proof (or social proof that's just HTML, not our own widget), it raises the question: "If your tool is so good, why aren't you using it?"

**What to build:**

1. [ ] **Collect real testimonials using our own collection form. PRIORITY: HIGH (Phase 2, after first users).**

   As soon as we have beta users (even 3 to 5 people), send them the collection form. Even if the testimonials are from friends who tested the product, real submitted testimonials through our real form are more credible than fabricated HTML.

2. [ ] **Embed Vouch widget on our own landing page. PRIORITY: HIGH.**

   Use the Editorial layout (once built) to display testimonials on the landing page. This serves triple duty: (a) social proof for visitors, (b) a live demo of what the widget looks like, (c) proof that we trust our own product. Position it between the features section and the pricing section (the decision point). Label it: "What our users say" and let the widget speak for itself.

   **The meta-move:** When someone asks "what does the widget look like on a real site?", the answer is "look at our homepage." That's the most powerful demo possible.

3. [ ] **"Powered by Vouch" link on our own widget should lead to a conversion page. PRIORITY: MEDIUM.**

   Currently, the "Powered by Vouch" link goes to `/?ref=powered-by` (the homepage with a ref parameter). But we don't do anything with that ref parameter. We should: (a) track it (count how many people click "Powered by Vouch" across all widgets), (b) show a targeted landing page or at least a hero section that acknowledges they came from a widget: "Like what you see? This testimonial display was created with Vouch in under 5 minutes."

#### J4. Support Channel (before users, not after)

**Current state:** The terms and privacy pages reference `NEXT_PUBLIC_SUPPORT_EMAIL` which is set to `hello@example.com` in `.env.local`. There is no visible support link in the dashboard, no chat widget, no help button, no contact page.

**Why this matters:** When a paying customer has a problem and can't find how to contact you, they don't keep looking. They cancel. For a $19/mo SaaS, the effort threshold is extremely low. One frustrating experience with no visible support path = churn. Also: having a visible "Contact us" link paradoxically REDUCES support volume, because it makes people feel safe ("if I get stuck, someone will help") so they try harder to figure things out themselves.

**What to build:**

1. [ ] **Set up a real support email (e.g., hello@[yourdomain].com) and update env var. PRIORITY: CRITICAL.**

   This is a 10-minute task with Resend or your domain provider. The current `hello@example.com` is embarrassing if anyone finds it. Update `NEXT_PUBLIC_SUPPORT_EMAIL` in Vercel env vars.

2. [ ] **Add a visible support link in the dashboard. PRIORITY: HIGH.**

   A simple "Need help?" or "Contact support" link in the dashboard sidebar footer. Links to `mailto:` for now. Can be upgraded to a chat widget or help center later. The key: it must be VISIBLE without searching for it.

3. [ ] **Add a support/contact link in the marketing footer. PRIORITY: HIGH.**

   Every SaaS website has a footer with: Pricing, Terms, Privacy, Contact. We have the first three. Add Contact (or just "Support"). Links to the support email.

#### J5. The "Powered by Vouch" Growth Loop (currently broken)

**Current state:** Free-tier widgets show "Powered by Vouch" linking to `/?ref=powered-by`. The `/via` page just redirects to `/?ref=powered-by`. The landing page does NOTHING with the `ref` parameter. No tracking, no special messaging, no conversion optimization.

**Why this is a wasted opportunity:** The "Powered by Vouch" badge is potentially our strongest organic growth channel. Every free widget on every customer's site is a billboard. If 1% of people who see a Vouch widget click "Powered by Vouch," and 10% of those sign up, that's pure organic growth at zero cost. But only if the landing experience converts them.

**What to build:**

1. [ ] **Track "Powered by Vouch" click-throughs. PRIORITY: MEDIUM.**

   When someone lands on the site with `?ref=powered-by`, log it (a simple counter in Supabase or even just a server log). This tells us whether the badge generates any traffic at all. If it does, optimize. If it doesn't, the badge placement or design needs work.

2. [ ] **Optimize the landing page for badge visitors. PRIORITY: MEDIUM (Phase 3).**

   When `?ref=powered-by` is present, optionally show a targeted hero: "You just saw a testimonial powered by Vouch. Create yours in 5 minutes, free." This is a warm lead. They already SAW the product working. They don't need the full sales pitch. They need a fast path to signup.

#### J6. Existential Threats and Contingencies (what could kill us even if we execute perfectly)

**These are not action items. They are risks to monitor and respond to if they materialize.**

1. **Platform-native testimonial features.** Webflow, Framer, and Squarespace could add native testimonial sections. Webflow already has a component marketplace. If Webflow ships a native testimonial component, our Webflow niche collapses.

   **Mitigation:** Our value is not "display testimonials" (any HTML can do that). Our value is: COLLECT testimonials from real customers, VERIFY them, MANAGE them, and display them beautifully. A native Webflow testimonial section doesn't collect or verify. We integrate with them, not compete with them. Our embed guides should explicitly say: "Use Vouch to collect and verify. Display with our widget OR use Vouch data in your native Webflow section."

2. **AI-generated testimonial sections.** Cursor, Lovable, or Bolt could let founders generate beautiful testimonial sections from a prompt: "Add a testimonial section with 6 cards." The output is static HTML but looks polished.

   **Mitigation:** Static HTML has no collection, no verification, no management, no updates. When the founder gets a new testimonial, they'd need to re-prompt the AI to rebuild the section. Our product is the SYSTEM (collect, verify, manage, display), not just the display. But we need to make this clear in our messaging.

3. **A well-funded competitor copies our premium widgets.** Senja has funding and a team. If they see our Editorial layout getting traction, they'll build one.

   **Mitigation:** Speed of execution and compounding differentiation. If we ship Editorial + Minimal + Verification before they react, we're 3 features ahead. Each feature compounds (verification is harder to copy than a layout). Also: being the premium choice for a specific niche (say, Webflow agencies) means they'd need to out-niche us, which doesn't match their broad positioning.

4. **Supabase pricing changes or reliability issues.** We're fully dependent on Supabase for auth, database, and storage.

   **Mitigation:** Standard Postgres under the hood. If Supabase becomes unviable, we can migrate to any Postgres host (Railway, Neon, AWS RDS). The Supabase client is just a thin wrapper. But migration would take 1 to 2 weeks of work, so monitor Supabase's stability and pricing changes.

#### J7. Launch Timing and First 100 Customers (the actual plan)

**Current state:** No launch plan exists. We have a live Lemon Squeezy checkout, a Vercel deployment, but no domain, no public launch, and no users.

**Why this matters:** Building in stealth forever kills more startups than bad products. At some point, the product needs to be in front of real humans who are not friends or family. The longer we wait, the more we build features nobody asked for.

**The launch sequence (aligned with Phase order from I5):**

1. [ ] **Pre-launch (during Phase 1):**
   * Buy domain, connect to Vercel
   * Upgrade Supabase to Pro
   * Set up support email
   * Dog-food: embed Vouch on our own site (even with placeholder testimonials initially)
   * Ship Editorial + Minimal layouts
   * Cap free tier

2. [ ] **Soft launch (end of Phase 1 / start of Phase 2):**
   * Share on X, Indie Hackers, relevant Slack/Discord communities
   * NOT Product Hunt yet (save that for a bigger splash)
   * Goal: 10 to 20 signups, 3 to 5 active users who embed widgets
   * Ask every user for feedback. Fix what's broken. This is validation, not growth.

3. [ ] **Product Hunt launch (after Phase 2 is complete):**
   * Onboarding flow is solid, embed guides exist, landing page has real testimonials from soft-launch users
   * The hero asset: a side-by-side of a competitor widget vs Vouch Editorial layout with the same testimonials. Visual proof.
   * Product Hunt can drive 500 to 2,000 visits in a day. If conversion is 5%, that's 25 to 100 signups. If activation is 40% (because onboarding works), that's 10 to 40 active users.
   * Follow up with every single user personally. At this scale, 1:1 support IS the competitive advantage.

4. [ ] **Post-launch growth (Phase 3+):**
   * Comparison pages start ranking (takes 2 to 3 months for SEO)
   * Migration tools bring in competitor refugees
   * "Powered by Vouch" starts generating organic clicks
   * Build in public on X to attract indie founder audience

**What wrong looks like:** Launching on Product Hunt before the product is differentiated (we'd get "just another testimonial tool" reactions). Also wrong: waiting for everything to be perfect (perfect is the enemy of shipped). The Editorial layout + onboarding checklist + real landing page testimonials = enough to launch. Everything else can ship after.

**Revenue reality check:** At $19/mo, we need 53 paying customers for $1K MRR. At a 5% free-to-paid conversion rate, that's 1,060 signups needed. At a 5% landing page conversion rate, that's 21,200 site visits. This takes months of content, SEO, and community work. Do not expect meaningful revenue for 3 to 6 months after launch. The goal for month 1 is: "10 strangers are using Vouch and at least 2 are paying." That's validation.

### K. Referral and Affiliate Growth (build when there are users to activate)

**Why this section exists:** Referral is the highest-ROI growth channel for SaaS once there's a base of happy users. But it's also the most commonly over-built by early-stage founders. A referral program with 0 users is infrastructure sitting idle. The "Powered by Vouch" badge (J5) is already a passive referral mechanism. This section covers the ACTIVE referral layer that goes on top.

**First-principles reality check (why NOT to build this early):**

Word-of-mouth happens when founders talk to each other: "I use this tool, it's great, you should try it." These conversations are driven by genuine enthusiasm, not referral incentives. At $19/mo, a free month ($19 value) is not enough to make anyone steer a conversation toward testimonial tools. The people who recommend Vouch will do it because the product solved their problem, not because they earn $19.

Adding a referral link to these organic conversations can actually make them worse. "Use my link, we both get a discount" introduces a seed of "are you recommending this for the reward?" that pure word-of-mouth doesn't have.

**What actually drives word-of-mouth in the 0 to 50 user phase (do these instead):**
1. **Make the product remarkable.** The Editorial layout screenshot shared in a Slack group is worth more than 100 referral links. The product IS the referral program.
2. **Fix the "Powered by Vouch" badge (J5).** Every widget on every site is a passive billboard. Already built, currently broken. Zero cost, works at any scale.
3. **Make sharing effortless.** Clean domain URL, one-line description, optional "Share Vouch" button in dashboard that generates a pre-written tweet.
4. **Personal outreach.** At 10 to 20 users, email each one: "Know any other founders who collect testimonials?" A personal ask from a solo founder converts 10x better than an automated referral link.

**The referral program becomes useful at 100+ active users** when: you can't talk to every user personally, you need attribution tracking, and the incentive nudges people who'd recommend but don't bother. Before that, it's a highway to a town that doesn't exist.

**What competitors do:**
* **Senja:** 30% recurring commission for life. Average customer LTV $800. Uses FirstPromoter. Affiliates earn $200+ per referral. Self-referral and paid ads banned.
* **Famewall:** 30% recurring commission for life. Average LTV $700 to $800. Payouts via PayPal, Wise, bank transfer. Same restrictions as Senja.
* Both programs target bloggers, YouTubers, comparison site authors, and SaaS influencers. These are strangers promoting for money, not happy users sharing with friends.

**Two distinct programs (don't conflate them):**

#### K1. User Referral Program (happy customers sharing with peers)

**What it is:** "Refer a friend, you both get a free month of Pro." A simple share-a-link mechanic inside the dashboard.

**Why free months, not percentage discounts:** At $19/mo, "20% off" = $3.80. That's not motivating. A free month of Pro ($19 value) feels generous and tangible. Research shows non-cash rewards work 24% better than cash equivalents. The cost to us is $0 (it's a digital product with marginal cost of zero). The value perception is $19.

**How it works:**
1. Every user gets a unique referral link in their dashboard settings.
2. When a referred user signs up AND upgrades to paid, BOTH the referrer and the new user get one month free (applied as account credit).
3. Cap at 12 free months per referrer per year (prevents gaming, still generous enough to reward power advocates).
4. Dashboard shows: "You've referred X people. Y have upgraded. Z free months earned."

**What wrong looks like:** Building a complex multi-tier reward system (Ambassador, Gold, Platinum tiers). That's enterprise referral program complexity for a $19/mo tool. Also wrong: giving the reward on signup instead of on paid conversion (you'll get spam signups harvesting free months). The reward triggers on PAID CONVERSION, not signup.

**When to build:** Phase 5 (after 50+ active users). Before that, there's nobody to refer and nobody to be referred to. The "Powered by Vouch" badge does passive referral work in the meantime.

1. [ ] **Referral link generation in dashboard settings. PRIORITY: LOWER (Phase 5).**
2. [ ] **Referral tracking (link click, signup, conversion). PRIORITY: LOWER (Phase 5).**
3. [ ] **Free month credit application on successful referral. PRIORITY: LOWER (Phase 5).**

**DB impact:** Add `referred_by` column to users table (stores referrer's user_id). Add `referral_credits` table (user_id, earned_at, applied_at, expires_at). Lemon Squeezy supports coupon codes that we can generate per-referral for the new user's first month.

#### K2. Affiliate Program (strangers promoting for commission)

**What it is:** A 30% recurring commission program for bloggers, YouTubers, SaaS reviewers, and comparison site authors. They sign up, get a link, promote Vouch, and earn 30% of every payment from referred customers for life.

**Why 30% recurring:** This is the industry standard for testimonial tools (both Senja and Famewall use exactly this). Going lower (10 to 15%) means affiliates promote competitors instead. Going higher (40 to 50%) eats too much margin on a $19/mo product. At 30%, an affiliate earning from a customer who stays 3 years earns $205 (30% of $684). That's compelling enough for a blog post or YouTube video.

**How to implement (cheaply):**
* Use FirstPromoter ($49/mo, integrates with Lemon Squeezy with a JS tag). This is what Senja uses. It handles tracking, payout, and fraud detection.
* Create an `/affiliates` page (like Senja's) that explains: the commission structure, how to sign up, marketing materials (logos, screenshots, copy), and restrictions (no self-referral, no paid ads bidding on our brand name).

**When to build:** Phase 4 at earliest, ideally after comparison pages and blog content exist (affiliates need something to link to). The affiliate program amplifies existing content and conversion, it doesn't create it.

1. [ ] **Set up FirstPromoter or equivalent. PRIORITY: LOWER (Phase 4+).**
2. [ ] **Create `/affiliates` page with program details. PRIORITY: LOWER (Phase 4+).**
3. [ ] **Prepare affiliate marketing kit (logos, screenshots, suggested copy). PRIORITY: LOWER (Phase 4+).**

**What wrong looks like:** Building the affiliate program before the landing page converts. Affiliates send traffic. If the landing page doesn't convert, affiliates earn nothing, get frustrated, and stop promoting. Also wrong: launching the affiliate program before we have comparison pages and content (affiliates need context to write about us, not just a link).

#### K3. Discount Strategy (when and how to discount)

**General principle:** Discounts are a tool, not a strategy. Overusing them trains users to wait for sales.

**When discounts make sense for Vouch:**

1. **Annual plan discount (already exists):** Standard. Incentivizes commitment, reduces churn, improves cash flow.

2. **Referral reward (K1):** Free month for both parties. Not a "discount" in the traditional sense. It's a reward for a specific action.

3. **Migration discount:** "Switching from Senja/Testimonial.to? Get your first 3 months at 50% off." This targets disgruntled competitor customers at the moment of highest switching intent. The discount offsets the effort of migrating. Only offer on comparison/migration pages, not site-wide. Time-limited (first 3 months, then full price).

4. **Founder discount for early adopters:** "First 50 Pro users get $12/mo for life." This is a launch-day tactic. Creates urgency, rewards early trust, and gives us 50 paying customers to learn from. The lifetime lock-in creates loyalty ("I got the founder rate, I'm never leaving"). Cap it strictly at 50.

**When discounts DON'T make sense:**
* Site-wide sales ("Black Friday 50% off"). At $19/mo, the margin is already thin. A 50% discount = $9.50/mo, which is Famewall's full price. We're positioning as premium, not budget.
* Discount codes for anyone who asks. Trains users to negotiate before paying.
* Discounts to prevent churn. If someone is cancelling, a discount doesn't fix the reason they're leaving. Fix the product instead.

---

## Session Handoff (March 7, 2026, session 22: Lemon Squeezy Live Setup)

**What was done this session:**
1. Lemon Squeezy store approved and live. 4 products created (Pro Monthly/Yearly, Studio Monthly/Yearly).
2. Fixed upgrade modal default from yearly to monthly billing.
3. Fixed "Starting checkout" button stuck after browser back navigation (added `pageshow` event listener).
4. Debugged Studio checkout 500 error. Root cause: Vercel project-level `LEMONSQUEEZY_API_KEY` was still the test mode key. Team-level had the live key but project-level overrides team-level. Fixed by adding live API key at project level.
5. Cleaned up debug code from checkout route and lemonsqueezy.ts.
6. Reverted `.env.local` back to test mode keys for safe local development.

**Vercel env var lessons:**
1. Vercel has two levels: team-level (`/~/settings/environment-variables`) and project-level (`/vouch-xa3m/settings/environment-variables`). Project-level takes precedence.
2. All Lemon Squeezy env vars must be at project level (vouch-xa3m). Team-level vars should be cleaned up.
3. Two Vercel projects exist: `vouch` (unused) and `vouch-xa3m` (active). `vouch` should be deleted.

**What's next:**
1. Buy domain (considering `vouching.app` on Cloudflare at $14.34/year). Connect to Vercel.
2. Clean up team-level env vars in Vercel (delete duplicates).
3. Delete unused `vouch` project from Vercel.
4. Clear test subscription data from prod Supabase (SQL provided in session).
5. Set up Lemon Squeezy webhook for live mode (URL: `https://[domain]/api/stripe/webhook`).
6. P1 Security (rate limiting on 8 endpoints), P1 Conversion (email onboarding, notifications).
7. Deferred: client-side caching (React Query), legal review, Google brand verification, custom domains, rename Agency to Studio.

**What to watch out for:**
1. Prod Supabase is free tier (Nano, ap-south-1). HEAD/count requests sometimes return 503.
2. `.env.local` has test mode keys. Vercel project-level has live keys. Do not mix.
3. Webhook on Vercel needs to be created for live mode in Lemon Squeezy dashboard.
4. Old test subscription data may still be in prod DB. Run the reset SQL before real users sign up.

---

## Previous: Session Handoff (March 6, 2026, session 21: Pricing Toggle Fix)

**What was done this session:**
1. Changed pricing page default from yearly to monthly to avoid sticker shock ($190/$490 vs $19/$49).
2. Fixed billing toggle pill alignment. Replaced absolute-positioned pill (broken left/width calc) with Framer Motion `layoutId` approach that auto-sizes to the active button.

**What's next:**
1. User is recording a demo video for Lemon Squeezy store approval.
2. After approval: P1 Security (rate limiting on 8 endpoints), P1 Conversion (email onboarding, notifications, post-signup warmth).
3. Deferred: client-side caching (React Query), legal review, Google brand verification.

**What to watch out for:**
1. Prod Supabase is free tier (Nano, ap-south-1). HEAD/count requests sometimes return 503.
2. Prod Supabase URL is `sxfjdkgopithetvmscdx.supabase.co`.
3. Dummy testimonials use fake names/emails. Replace with real ones once customers submit.

---

## Previous: Session Handoff (March 6, 2026, session 20: Prod Setup + Lemon Squeezy Prep)

**What was done this session:**
1. Google OAuth consent screen: investigated "to continue to supabase.co" issue. Requires custom domain (paid) or brand verification. App name already set to "Vouch". Parked for now.
2. Legal review (T&C + Privacy Policy): reviewed both documents, identified 11 gaps. Deferred until factual answers available (payment processor, analytics, video storage, Supabase region).
3. Production database seeded: created Vouch project, 1 collection form, 2 widgets (wall + carousel), 8 testimonials (7 approved, 1 pending) for Lemon Squeezy demo video.
4. Production schema sync: added missing columns to projects, testimonials, widgets, collection_forms tables. Dashboard now loads correctly.
5. Confirmed Clearbit is actively used in public page and embed page (logo.clearbit.com).
6. Added "Client-side caching" and "Legal review" as deferred tasks.

**What's next:**
1. User is recording a demo video for Lemon Squeezy store approval.
2. After approval: P1 Security (rate limiting on 8 endpoints), P1 Conversion (email onboarding, notifications, post-signup warmth).
3. Deferred: client-side caching (React Query), legal review, Google brand verification.

**What to watch out for:**
1. Prod Supabase is free tier (Nano, ap-south-1). HEAD/count requests sometimes return 503. Not a data issue, just throttling.
2. Prod Supabase URL is `sxfjdkgopithetvmscdx.supabase.co` (different from local `itbgozgomunoiolkdajo`).
3. Dummy testimonials use fake names/emails. Replace with real ones once customers submit.
4. User's email: `sritrvler@gmail.com`, user_id: `981e00cb-ed3b-4b8a-a1c8-76656d059337` on prod.
5. Seed file saved at `vouch/supabase/seed-demo.sql` (don't run again, data already inserted).

---

## Deferred: Client-Side Caching (React Query / SWR)

**Context:** Every page navigation hits Supabase directly. On free tier (Nano), this causes slow loads and occasional 503s on count queries. Adding a client-side cache layer will make repeated navigations instant.

**Scope:**
1. Add React Query (or SWR) for all Supabase queries in the dashboard
2. Cache projects, testimonials, forms, widgets, subscription data
3. Stale-while-revalidate pattern so UI loads instantly from cache, then refreshes in background
4. Invalidate cache on mutations (approve testimonial, create widget, etc.)

**Files likely affected:** `ProjectContext.tsx`, all dashboard pages (`page.tsx`, `inbox/page.tsx`, `forms/page.tsx`, `widgets/page.tsx`, `settings/page.tsx`)

**Priority:** After paying customers or Supabase Pro upgrade. Not blocking launch.

---

## Deferred: Legal Review (T&C + Privacy Policy)

**Context:** Current T&C and Privacy Policy are live but have known gaps. Need factual answers before updating.

**Known issues:**
1. Privacy Policy says "Stripe" but actual payment processor is Lemon Squeezy (or needs confirmation)
2. Privacy Policy lists Clearbit (needs confirmation if actually integrated)
3. No governing law/jurisdiction clause in T&C
4. No GDPR section (needed if EU users expected)
5. No CCPA section (needed if California users expected)
6. No children's privacy / age restriction clause
7. No indemnification, severability, or entire agreement clauses in T&C
8. No data breach notification policy in Privacy Policy
9. No data processing info for testimonial submitters (non-account holders)
10. Contact email is placeholder (`hello@example.com` fallback)
11. Entity is sole proprietor (Srinath, Coimbatore, Tamil Nadu, India) until incorporation

**Before starting, answer these:**
1. Payment processor: Stripe or Lemon Squeezy?
2. Is Clearbit actually integrated?
3. Any analytics tools? (Google Analytics, PostHog, etc.)
4. Where are videos stored? (Supabase storage, S3, etc.)
5. Supabase region? (US, EU, Asia?)

**Files:** `src/app/(marketing)/terms/page.tsx`, `src/app/(marketing)/privacy/page.tsx`

---

## Session Handoff (March 6, 2026, session 19: P1 Security Hardening Batch)

**What was done this session:**

1. **Password strength mismatch (T2):** Login schema aligned from min(6) to min(8) to match signup.
2. **Font URL injection (T2):** Widget API now sanitizes font_url via shared sanitizeFontUrl() before returning in JSON response. Public page and collection form were already safe.
3. **Admin impersonate leak (T2):** Magic link no longer returned in response body. Sent via Resend email to ADMIN_EMAIL. AdminClient UI updated to show "sent" confirmation instead of displaying the link.
4. **Video MIME validation (T2):** Server now verifies file magic bytes (ftyp box for MP4, EBML header for WebM) in addition to client-provided MIME type. Rejects files that don't match.

**Files changed:**
1. `src/app/(auth)/login/page.tsx` (password min 6 -> 8)
2. `src/app/api/testimonials/widget/[id]/route.ts` (import sanitizeFontUrl, use in response)
3. `src/app/api/admin/impersonate/route.ts` (send link via email, HTML escape)
4. `src/app/admin/AdminClient.tsx` (removed link display, show sent confirmation)
5. `src/app/api/testimonials/upload-video/route.ts` (magic byte verification)

**What's next:**
1. P1 Security: Rate limiting on 8 endpoints (checkout, portal, upload-logo, 4 admin routes). 2 hours.
2. P1 Conversion: Email onboarding, email notifications, post-signup warmth, test testimonial flow, checklist copy, /via page.
3. P2+ items from prioritized backlog.

**What to watch out for:**
1. Admin impersonate now requires RESEND_API_KEY and ADMIN_EMAIL env vars to deliver the link. In dev without Resend key, the link is generated but silently not sent. The response still says "sent" to avoid leaking whether email was actually delivered.
2. Video magic byte check: MP4 ftyp is at bytes 4-7 (not 0-3). WebM EBML header is at bytes 0-3. Files under 12 bytes are rejected (Uint8Array pads with 0s).
3. Existing users with 6-7 char passwords can still log in (Supabase handles auth). The min(8) is client-side Zod validation only.

---

## Previous: Session Handoff (March 6, 2026, session 18: Embed Modal Redesign + Widget UI Polish + Dashboard Subtexts)

**What was done this session:**

1. **Widget builder UI polish (T3, 10 fixes):** Accordion animations (Framer Motion height:'auto'), widget name pencil affordance, sticky preview, Escape key handler, mobile delete visibility, section rename, icon normalization, preview background fix, modal close touch target.
2. **Embed modal complete redesign (T3):** Replaced 4-tab layout with intent-based 3-path guided flow:
   a. "Share a link" path: public page URL with copy, share suggestions
   b. "On my website" path: platform picker (Wix, Squarespace, Webflow, Framer, WordPress, Other) with Simple Icons brand logos, then platform-specific numbered step-by-step instructions with inline embed code
   c. "Developer or AI tools" path: embed code with HTML label, AI prompt for vibe coders (Cursor, Claude Code, Bolt, Lovable, v0, Codex, Anti Gravity, Replit), React/Next.js component (Pro users get code, free users get benefit description + upgrade link)
3. **Embed modal UX polish:** Fixed slide animation direction (useRef instead of useState for slideDirection, Framer Motion custom+variants pattern), fixed modal resizing (fixed height with flex layout), copy button visibility on dark code blocks (variant prop: dark/light), platform brand icons from Simple Icons, code block language labels (HTML/JSX), focus-visible styles, slug dead-end now links to settings, removed belittling copy, consistent SEO messaging, auto-update reassurance on chooser screen.
4. **Dashboard subtexts:** Added descriptive subtexts to all dashboard pages (Inbox: "Review, approve, or reject testimonials from your customers", Widget Builder: "Customize how testimonials look on your site. Changes update automatically."). Rephrased Forms subtext. Fixed Settings profile description to explain where display name appears.
5. **Button rename:** "Get Code" -> "Add to Website" with Globe icon (clearer intent).
6. **Widget header cleanup:** Removed redundant inline widget name input (already visible in tab selector).
7. **Created `src/lib/embed-platforms.ts`:** Extracted platform-specific embed instructions to a data file.

**Files changed:**
- `src/app/(dashboard)/dashboard/widgets/page.tsx` (major: embed modal redesign, UI polish, header cleanup)
- `src/app/(dashboard)/dashboard/inbox/page.tsx` (added subtext)
- `src/app/(dashboard)/dashboard/forms/page.tsx` (rephrased subtext)
- `src/app/(dashboard)/dashboard/settings/page.tsx` (profile description)
- `src/lib/embed-platforms.ts` (new: platform data)

**What's next:**
Pick from the prioritized backlog below. The embed modal and widget builder are now polished and ready for launch.

**What to watch out for:**
1. `slideDirection` is a `useRef` not `useState`. It's set synchronously before state updates to avoid Framer Motion reading stale values during AnimatePresence transitions.
2. `CopyCodeButton` now has a `variant` prop ('dark' | 'light'). Default is 'dark' (for code blocks on bg-gray-950). Use `variant="light"` on light backgrounds.
3. The embed modal uses fixed height `h-[70vh] sm:h-[65vh]` with flex layout. Header is `shrink-0`, content is `flex-1 overflow-y-auto`. This prevents modal resizing between steps.
4. Platform icons are inline SVGs from Simple Icons (MIT license). If adding a new platform, fetch the SVG path from `https://raw.githubusercontent.com/simple-icons/simple-icons/master/icons/[name].svg`.
5. Widget name input was removed from the header. Name shows in widget selector tab. If renaming is needed, consider adding it to a settings section or double-click on tab.

---

## Previous: Session Handoff (March 6, 2026, session 17: All Projects + Inbox Scoping + Dialog Consistency)

**What was done this session:**

1. **"All projects" option in project selector:** Added to both desktop sidebar and mobile header dropdowns. Uses `showAllProjects` boolean in ProjectContext with localStorage persistence. Only appears when user has 2+ projects.
2. **Hydration error fix:** Radix Popovers generate mismatched aria-controls IDs during SSR. Fixed by deferring Popover rendering with `mounted` state pattern (static placeholder buttons during SSR, Popovers after mount).
3. **Inbox scoping by project:** Inbox now filters testimonials by selected project. When "All projects" active, shows all. Always includes `user_id` filter for security.
4. **Consistent project selection in dialogs:** "Add past testimonial" (inbox) and "Create collection form" (forms) dialogs now: greyed out with project name when specific project selected, editable Radix Select dropdown when "All projects" active.
5. **Replaced native `<select>` with shadcn Select:** Used `position="popper"` for correct dropdown direction. Projects sorted alphabetically.
6. **Dialog input contrast fix:** All dialog inputs across the portal now use `bg-white border-border` instead of `bg-transparent`. Locked fields use `bg-muted cursor-not-allowed`.
7. **Widget project identification:** When "All projects" selected, widget selector shows "Project Name . Layout Type" as subtitle.
8. **"Powered by Vouch" clickable everywhere:** Changed from plain text/same-tab link to `<a href="/via" target="_blank">` on public page (`/p/[slug]`), report page (`/report/[token]`), and widget builder preview.
9. **Senior code review:** Fixed security issue (queries filtering by project_id without user_id), TypeScript errors, and other review findings.

**Files changed:**
- `src/context/ProjectContext.tsx` (showAllProjects state, localStorage persistence)
- `src/app/(dashboard)/layout.tsx` (All projects option, hydration fix with mounted state)
- `src/app/(dashboard)/dashboard/page.tsx` (removed filterMode toggle, uses showAllProjects from context, added scoped() helper with user_id)
- `src/app/(dashboard)/dashboard/inbox/page.tsx` (project scoping, ImportDialog with locked/unlocked project selector)
- `src/app/(dashboard)/dashboard/forms/page.tsx` (project scoping, create dialog with locked/unlocked selector)
- `src/app/(dashboard)/dashboard/widgets/page.tsx` (project scoping, project name in widget subtitle, Powered by Vouch link)
- `src/app/p/[slug]/page.tsx` (Powered by Vouch as /via link in new tab)
- `src/app/report/[token]/page.tsx` (Powered by Vouch as /via link in new tab)

**What's next:**
Pick from the prioritized backlog below. Recommended: P1 items (conversion/growth, then security hardening).

**What to watch out for:**
1. `showAllProjects` persists in localStorage key `vouch_show_all_projects`. Restored on mount only when 2+ projects exist.
2. Hydration fix uses `mounted` state for all 3 Popovers in layout.tsx. SSR renders static placeholder buttons. Do not remove this pattern or hydration errors return.
3. All Supabase queries now include `.eq('user_id', user.id)` alongside any `project_id` filter. This is a security requirement. Do not remove user_id filters.
4. Radix Select needs `position="popper"` to drop down below trigger. Default `position="item-aligned"` aligns selected item with trigger (looks like going up).
5. Dialog inputs use `bg-white border-border`. Locked project field uses `bg-muted cursor-not-allowed`. Maintain this contrast pattern for any new dialogs.
6. Deferred from code review: SSR placeholder text flash for "All projects" (minor), create dialog pre-selects stale project in All mode, fetchTestimonials vs loadMore filter inconsistency (pre-existing), createClient() at component body level (pre-existing).

---

## Previous: Session Handoff (March 6, 2026, session 16: Mobile Bug Fixes + Tiered Pipeline)

**What was done this session:**

1. **4 mobile bug fixes (pushed to remote):**
   a. Mobile project selector: Added `md:hidden` project selector bar in dashboard layout with separate popover state. Full project list, search, new project, upgrade prompt.
   b. Color picker: Removed all `<input type="color">` (1 in settings, 3 in widgets). Replaced with color swatch preview + hex text input with validation. No native dialog.
   c. Landing page desktop-view-on-mobile: Changed all 3 `md:grid-cols-3` marketing grids to `sm:grid-cols-2 lg:grid-cols-3`. Pain points, steps, pricing cards.
   d. Inbox toolbar: Button text hidden on mobile (`hidden sm:inline`), icon-only with title attributes.

2. **Tiered pipeline rewrite:**
   a. Added Task Complexity Tiers (T1 trivial, T2 small, T3 medium, T4 large) that route to different pipeline paths.
   b. T1: fix and build, no steps. T2: inline self-review only, zero agents. T3: 1-2 agents + self-review. T4: full agents + self-review.
   c. Added Adversarial Self-Review Protocol with 9-point checklist, anti-bias guardrails, and zero-issue justification requirement.
   d. Added agent token efficiency rule: always pass code snippets in agent prompts, never ask agents to read files.
   e. Updated CLAUDE.md, MEMORY.md, lessons.md with all changes.

**Files changed:**
- `src/app/(dashboard)/layout.tsx` (mobile project selector)
- `src/app/(dashboard)/dashboard/inbox/page.tsx` (icon-only toolbar)
- `src/app/(dashboard)/dashboard/settings/page.tsx` (removed native color picker)
- `src/app/(dashboard)/dashboard/widgets/page.tsx` (replaced 3 native color pickers, added flex-wrap, aria-labels)
- `src/app/(marketing)/page.tsx` (2 grid breakpoint fixes)
- `src/app/(marketing)/_components/PricingCards.tsx` (1 grid breakpoint fix)
- `CLAUDE.md` (tiered pipeline, self-review protocol, agent efficiency rules)
- `MEMORY.md` (synced tiered pipeline, agent routing)
- `tasks/lessons.md` (6 new lessons: #82-87)
- `tasks/todo.md` (this handoff)

**What's next:**
Pick from the prioritized backlog below. Recommended: P1 items (conversion/growth, then security hardening).

**What to watch out for:**
1. Pipeline is now TIERED. Must classify task as T1/T2/T3/T4 before Step 1. Say `TIER: T[n]` before starting.
2. T2 tasks use adversarial self-review only. No agents. The self-review checklist has 9 items and a zero-issue justification requirement.
3. T3/T4 agents must receive code snippets in prompts. NEVER ask agents to "read the file." This was the main token waste issue.
4. Self-review runs at ALL tiers T2+. It is mandatory alongside agents at T3/T4, not a replacement.
5. Separate popover state for mobile vs desktop project selector (mobileProjectPopoverOpen). Do not merge these.
6. `<input type="color">` is now fully removed from the codebase. If any new color pickers are needed, use the hex input + swatch pattern.

---

## Prioritized Backlog (from audit-report.md)

Items are grouped by priority. P1 = do before or soon after launch. P2 = first month. P3 = when relevant. P4 = nice to have.

### P1: Conversion and Growth (directly affects signups, activation, retention)

- [ ] **Email onboarding sequence.** 3-email Resend sequence: welcome, day 3 nudge, day 7 tip. Zero re-engagement after signup today. (1 day)
- [ ] **Email notification when testimonials arrive.** Users must check dashboard manually. Retention risk. New testimonial = Resend email to project owner. (half day)
- [ ] **Post-signup email confirmation screen is cold.** "Back to sign in" CTA is a dead end. Add warmth and next-step guidance. (1 hour)
- [ ] **No "send yourself a test testimonial" flow.** Let new users preview the experience from the submitter side. (2 hours)
- [ ] **Social proof on landing page.** Use own product to display testimonials about Vouch. Needs real customers first. (2 hours once content exists)
- [ ] **Getting-started checklist copy is procedural, not motivational.** Rewrite to emphasize outcomes. (1 hour)
- [ ] **Custom /via conversion page.** Currently redirects to landing page with `?ref=powered-by`. Build a purpose-built conversion page that leverages context ("you just saw this working on a real site") with live demo, showcase of widget layouts, and a tighter CTA. Should convert better than generic landing page for this specific audience. Track `/via` conversion rate first to establish baseline. (half day)

### P1: Security Hardening (attack surface gaps)

- [ ] **8 endpoints have no rate limiting.** checkout, portal, upload-logo, all 4 admin routes. (2 hours)
- [x] **Video upload MIME validation is client-trust only.** Done session 19: added magic byte verification (ftyp for MP4, EBML for WebM) in upload-video route.
- [x] **Admin impersonate returns magic link in response body.** Done session 19: link now sent via Resend email to ADMIN_EMAIL instead of returned in response.
- [x] **Font URL injection on public page.** Done session 19: widget API now uses sanitizeFontUrl(). Public page and collection form already used resolveFontUrl() which calls sanitizeFontUrl().
- [x] **Password strength mismatch.** Done session 19: login schema aligned to min(8) to match signup.

### P2: Stability and Monitoring (catch problems before users report them)

- [ ] **Error Boundaries for dashboard.** Add `error.tsx` to every dashboard route segment. Rendering error currently white-screens the entire page. (2 hours)
- [ ] **Sentry or equivalent monitoring.** First crash signal currently comes from user complaints. (2 hours)
- [ ] **Structured logging.** All errors go to console.error(). Not queryable, not alertable. (2 hours)
- [ ] **E2E tests with Playwright.** Automated critical path: signup, create form, submit testimonial, approve, embed. (1 day)
- [ ] **Webhook idempotency.** Store processed event IDs to prevent duplicate processing on retries. (1 hour)

### P2: Performance (noticeable at scale or for power users)

- [ ] **Centralize auth + subscription from context.** Remove 12 redundant getUser() calls, 4 redundant subscription fetches across dashboard pages. (3 hours)
- [ ] **select('*') over-fetching.** Inbox, widgets, settings, widget API all fetch all columns. Use explicit column lists. (2 hours)
- [ ] **Forms N+1.** Forms page fetches ALL testimonial rows just to count per form. Use count queries. (1 hour)
- [ ] **Collection form font FOUT.** Custom Google Fonts load via client-side useEffect, causing flash of unstyled text. Move to server component or preload. (1 hour)
- [ ] **Server-side video compression.** Cloudinary, FFmpeg, or Mux integration. Deferred until Supabase storage costs become material. (1 week)

### P2: Code Health (slows future development)

- [ ] **Extract shared types to src/types/.** Single Project, Widget, Testimonial interface instead of 4+ duplicates. (2 hours)
- [ ] **Settings page refactor.** 33 useState calls should be a single useReducer. (2 hours)
- [ ] **5 monolith files.** widgets/page.tsx (1,558 lines), CollectFormClient (1,454), inbox (1,360), settings (1,246), forms (1,031). Extract subcomponents. (1 day)
- [ ] **23 eslint-disable comments.** Audit each one; fix underlying issues or document why the disable is necessary. (2 hours)

### P3: Competitive Features (gap-closers, build when demand is proven)

- [ ] **Google Reviews import.** Biggest competitive gap. Cannot import existing reviews from Google. (1 week)
- [ ] **AI golden sentence auto-extraction.** LLM call on submit to auto-populate golden_sentence field. ~$0.001/testimonial. (2 days)
- [ ] **Twitter/X + LinkedIn import.** source_url field and social icons already exist. (3 days)
- [ ] **Custom domains for collection forms.** DNS verification + SSL provisioning. Wait for 20+ Studio subscribers asking for it. (1 week)
- [ ] **Team seats / client logins.** Report link covers 80% of "share with client" need. Full ACL is 2-4 weeks. Defer until demand.
- [ ] **Zapier/Slack/CRM integrations.** No integrations today. Build when customers ask. (varies)

### P3: Infrastructure (matters at 1,000+ users)

- [ ] **widget_views/form_views tables: no TTL or partitioning.** Unbounded growth. Add data retention policy. (half day)
- [ ] **In-memory rate limiter.** Per-instance, bypassed by distributed attacks. Move to Redis or Upstash. (half day)
- [ ] **No graceful degradation for external service failures.** Supabase down = infinite spinner. (1 day)
- [ ] **Dashboard pages all client-rendered.** No server-side rendering, no streaming. Acceptable for now but slower perceived load. (1 day)
- [ ] **Radix UI monorepo package may bypass tree-shaking.** Verify optimizePackageImports covers it. (1 hour)

### P4: Polish (nice to have, not urgent)

- [ ] **Skeleton loaders on other dashboard pages** (inbox, forms, widgets use their own loaders; standardize shimmer pattern). (1 hour)
- [ ] **FAQ accordion animation** on `/pricing` page too (currently only landing page). (15 min)

---

## Previous: Session Handoff (March 5, 2026, session 12: Studio Rename + Test Coverage)

**What was done:**
1. Renamed Agency to Studio across all 19 files. DB CHECK constraint, env vars, plan types, feature lists, admin panel, webhook, all updated.
2. Added 39 new tests across 4 test files. Total: 66 tests, 5 suites, all passing.

**DB migration required (DONE by user):**
```sql
ALTER TABLE public.subscriptions DROP CONSTRAINT subscriptions_plan_check;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_plan_check CHECK (plan IN ('free', 'pro', 'studio'));
```

**Vercel env var rename required (DONE by user):**
LEMONSQUEEZY_AGENCY_VARIANT_ID -> LEMONSQUEEZY_STUDIO_VARIANT_ID
LEMONSQUEEZY_AGENCY_YEARLY_VARIANT_ID -> LEMONSQUEEZY_STUDIO_YEARLY_VARIANT_ID

---

## Previous: Session Handoff (March 5, 2026, session 11: Post-Launch Items + Security Hardening)

**What was done this session:**
1. All 11 post-launch items (13-23) from audit-report.md completed.
2. Senior dev review ran on session 11 changes: fixed 2 SVG viewBox bugs, removed unused @vitejs/plugin-react, added backslash bypass tests.
3. Senior dev review ran on session 10 changes: fixed HIGH widget API fetchLimit regression, moved error check before data processing, added nosniff to widget API responses.
4. Fixed all 6 security backlog items from the reviews.
5. Updated MEMORY.md with agent strategy (mandatory review agent in post-implementation gate).

**POST-LAUNCH ITEMS (ALL 11 COMPLETE):**
13. [x] Embed widget quote color uses theme textColor instead of hardcoded #374151.
14. [x] Email footer hostile copy removed.
15. [x] Collection form prompt: "What stood out?" replaces "What could be better?"
16. [x] Widget builder defaults to 'builder' tab.
17. [x] Billing defaults to yearly in upgrade modal + pricing page.
18. [x] Removed 5 unused npm deps (42 packages). Archived unused command.tsx.
19. [x] Removed "30-day export" FAQ. Rewrote to match reality.
20. [x] Trust signals (lock icon + Lemon Squeezy) near pricing CTA.
21. [x] Platform trust bar with SVG icons for 7 platforms.
22. [x] embed.js error handling (res.ok check, console.warn).
23. [x] Vitest + 27 security tests across 5 suites (all passing).

**SECURITY BACKLOG (ALL 6 COMPLETE):**
1. [x] SVG upload XSS: removed SVG from logo upload allowlist (raster only now).
2. [x] RLS INSERT: tightened policy to constrain user_id/project_id to match form. DB migration applied.
3. [x] Open redirect: now blocks /\ backslash bypass.
4. [x] verifyAdmin: extracted to src/lib/admin-auth.ts (was duplicated in 4 files).
5. [x] CSP: removed unsafe-eval from script-src.
6. [x] Disposable email: server-side check in auth callback (defense-in-depth).

**REVIEW FIXES (from code reviews):**
1. [x] Widget API fetchLimit: was hardcoded 12, now Math.max(max_items, 50). (HIGH regression)
2. [x] Widget API error check: moved before sorting/slicing (was dead code).
3. [x] Widget API: added nosniff + HSTS headers.
4. [x] Next.js SVG path: fixed viewBox mismatch (was 28x28 coords in 24x24 box).
5. [x] Shopify SVG path: replaced with correct 24x24 path.
6. [x] Removed unused @vitejs/plugin-react devDependency.

**What's next:**
All audit items and security backlog complete. Remaining work:
1. ~~Rename Agency to Studio~~ DONE (session 12). Deferred: custom domains, team seats
2. Social proof on landing page (needs real customers first)
3. Server-side video compression (deferred until storage costs are material)
4. ~~More test coverage beyond the 5 security suites~~ DONE (session 12, 39 new tests)

**What to watch out for:**
1. Platform SVG paths in page.tsx use 24x24 viewBox. Next.js and Shopify were fixed this session.
2. `_archive/2026-03-05/command.tsx` excluded from tsconfig. Restore if cmdk is re-added.
3. Vitest config uses `@` path alias. Keep in sync with tsconfig paths.
4. Auth callback now has server-side disposable email check. If it blocks a legitimate user, check the domain list in src/lib/disposable-emails.ts.
5. CSP no longer has unsafe-eval. If Next.js production breaks with eval errors, this is the first thing to check.
6. **PROCESS: Always run senior dev review agent before committing.** Baked into MEMORY.md post-implementation gate.

---

## Previous: Session Handoff (March 5, 2026, session 10: Before-Launch Audit Fixes)

**What was done this session:**
All 12 before-launch audit items fixed, built, pushed to origin/main, and DB migrations applied.

**BEFORE LAUNCH (ALL 12 COMPLETE):**
1. [x] Webhook: set plan='agency' when variant matches Agency env vars.
2. [x] Open redirect: validates `next` param starts with `/` and not `//`.
3. [x] Logo upload: allowlists extensions AND MIME types.
4. [x] RLS INSERT: added policy scoped to active forms only.
5. [x] Disposable email: uncommented isDisposableEmail check.
6. [x] Supabase email confirmation: already enabled.
7. [x] Security headers: CSP, X-Frame-Options, HSTS, nosniff, Referrer-Policy.
8. [x] Widget API: returns 403 if user is_banned.
9. [x] Admin secret: all 4 routes deny access when env var is unset.
10. [x] Widget API: parallel queries via Promise.all.
11. [x] Agency custom slug: `!== 'free'` in settings.
12. [x] projects.user_id index: added to schema.sql.

---

## Previous: Session Handoff (March 5, 2026, session 8)

**What was done this session:**
1. Agency Plan Task 1: Self-serve checkout. Replaced "Get in touch" mailto with real Lemon Squeezy checkout for Agency ($49/mo, $490/yr). Updated `createCheckoutUrl` to accept plan param. Updated checkout API route, UpgradeModal, and PricingCards.
2. Agency Plan Tasks 2+3+4: White-label client reports, embed codes in reports, custom report intro. Added `report_footer_text` and `report_message` columns to projects. Settings page has "Report Customization" section (Agency-gated). Report page shows custom intro, conditional footer, and widget embed code snippets with copy buttons.
3. Agency Plan Task 5: Updated AGENCY_FEATURES to match reality. Removed "Priority email support" and "Custom onboarding call" (fake). Added "White-label client reports", "Embed codes in client reports", "Custom report intro message", "Email support (1 business day)". Eliminated duplicate AGENCY_FEATURES in PricingCards (now imports from lemonsqueezy.ts). Updated comparison table on pricing page.
4. Fixed Radix DialogTitle accessibility warning in upgrade modal (added sr-only DialogTitle).
5. Added Agency variant IDs to .env.local (monthly: 1368721, yearly: 1368722).

**What's next:**
Agency Plan Overhaul is DONE (Tasks 1 through 5). Deferred items remain: Task 6 (rename to "Studio"), Task 7 (custom domains), Task 8 (team seats). Next priority: review the full product for any remaining gaps, or pick from deferred items. Consider a final pre-launch review using the Go-Live Checklist at the top of this file.

**What to watch out for:**
1. DB migration required: `ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS report_footer_text text; ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS report_message text;` (already run by user on current Supabase instance).
2. Agency variant IDs in .env.local (LEMONSQUEEZY_AGENCY_VARIANT_ID=1368721, LEMONSQUEEZY_AGENCY_YEARLY_VARIANT_ID=1368722). Must also be set in Vercel env vars for production.
3. PricingCards no longer defines its own AGENCY_FEATURES. It re-exports from lemonsqueezy.ts. If anything imports AGENCY_FEATURES from PricingCards, it still works (re-export).
4. Report page now queries `user_id` from projects to check subscription plan. This is a server component query using service role, so RLS is bypassed. The token-based access is unchanged.
5. The `report_message` field is capped at 200 characters (enforced in settings save + input maxLength). `report_footer_text` has no length cap (free text).
6. Downgrade scenario: if Agency user downgrades, report_footer_text and report_message stay in DB but report page falls back to "Powered by Vouch" because `isAgency` will be false.

---

## Previous: Session Handoff (March 5, 2026, session 7)

**What was done this session:**
1. Fixed video playback delay in review step: added `preload="auto"` to the blob URL video in CollectFormClient.tsx (line 1001). Browser now buffers the local blob immediately instead of waiting for play.
2. Optimized camera startup: lowered getUserMedia constraints from `ideal: 1280x720` to `ideal: 640x480` (line 548). Lower resolution negotiates faster with camera hardware.
3. Reduced recording bitrate: 1,000,000 bps to 600,000 bps (line 490). For talking-head testimonials at 480p, this is plenty. Files are ~40% smaller.
4. Thumbnail-first widgets in embed.js: replaced inline `<video>` tags with poster image + play button overlay. Video loads only when user clicks. Saves 70-90% bandwidth for widget page loads. Click handler in `postRenderFixups` creates the video element dynamically.
5. Added Fair Use clause to Terms of Service (new section 7). Covers "unlimited" features with reasonable business use language. Follows Basecamp/Notion pattern.
6. Updated ToS section 5 to mention Pro, Agency, and annual billing (was Pro-only, monthly-only).
7. Renumbered ToS sections 7-11 to 8-12. Updated "Last updated" date to March 5, 2026.

**What's next:**
Agency Plan Overhaul. Start with Task 1 (self-serve checkout). See "NEXT: Agency Plan Overhaul" section below.

**What to watch out for:**
1. Camera resolution is now `ideal: 640x480` not `ideal: 1280x720`. If users report blurry video, this can be bumped to `ideal: 960x720` as a middle ground.
2. Recording bitrate is now 600kbps (was 1Mbps). If quality complaints arise for longer recordings (60s+), consider 750kbps.
3. embed.js video click-to-play replaces the poster div with a `<video>` element using `replaceWith()`. The old div is gone after click. If user pauses and the widget re-renders (e.g., carousel navigation), the video state is lost. This is acceptable since carousel auto-advance is not implemented.
4. The iframe embed (`src/app/embed/[id]/page.tsx`) still uses inline `<video>` tags (not thumbnail-first). It's v1 compat only and not shown in dashboard, so this is intentional.
5. Server-side video compression (Cloudinary/FFmpeg/Mux) was NOT done. This requires external service integration and is deferred. The client-side bitrate reduction handles 80% of the cost savings.
6. The "Test on another device" go-live items are checked off as optimized, but still need manual verification on a physical device before launch.

---

## Previous: Session Handoff (March 5, 2026, session 6)

**What was done this session:**
1. Fixed font loading bug: changed `display: 'optional'` to `display: 'swap'` in layout.tsx. Inter font was falling back to Arial on first load.
2. Dashboard metrics now scoped by project: uses ProjectContext's selectedProjectId. Added "All projects" toggle when user has > 1 project.
3. Project dropdown improvements: sorted alphabetically (was created_at), search input appears when > 5 projects.
4. Redesigned UpgradeModal to show Pro ($19) and Agency ($49) side by side. Was Pro-only.
5. Replaced all 4 inline upgrade dialogs (widgets, forms, inbox, settings) with the shared UpgradeModal. Eliminated duplicate feature lists, hardcoded prices, and Pro-only copy.
6. Centralized feature lists: PRO_FEATURES and AGENCY_FEATURES exported from `src/lib/lemonsqueezy.ts`. All surfaces import from there.
7. Added Agency to PLANS object in lemonsqueezy.ts (was missing). Fixed Pro projectLimit from 5 to Infinity (contradicted "Unlimited" on pricing page).
8. Fixed Agency users seeing only Pro features in billing tab. Now shows Agency-specific features too.
9. Cleaned up dead imports in widgets/page.tsx and forms/page.tsx.
10. Fixed "Upgrade to Pro" copy in settings help text to plan-neutral "Upgrade to..."
11. Condensed modal Pro features from 10 items to 6 highlights to prevent viewport overflow.
12. Agency plan strategy created and added to todo.md as "NEXT" task.

**What's next:**
Agency Plan Overhaul. Start with Task 1 (self-serve checkout). See "NEXT: Agency Plan Overhaul" section below.

**What to watch out for:**
1. The upgrade modal uses a condensed `MODAL_PRO_HIGHLIGHTS` list (6 items) while the pricing page uses the full `PRO_FEATURES` (10 items). These are intentionally different. Don't try to sync them.
2. Agency checkout requires Lemon Squeezy variant IDs in .env.local (LEMONSQUEEZY_AGENCY_VARIANT_ID, LEMONSQUEEZY_AGENCY_YEARLY_VARIANT_ID). These don't exist yet.
3. The `createCheckoutUrl` function in lemonsqueezy.ts currently only handles Pro variants. Task 1 of the Agency overhaul extends it.
4. Settings page billing tab for free users now opens the UpgradeModal instead of having its own inline Pro card. The old `handleUpgrade` function in settings may be dead code now (verify before removing).
5. ProjectContext sorts projects by name now (was created_at). This affects the order everywhere projects are listed.

---

## Previous: Session Handoff (March 4, 2026, session 5)

**What was done this session:**
1. Custom fonts shipped. All 11 files changed (see plan). Build passes.
2. New shared utility: `src/lib/fonts.ts` with GOOGLE_FONTS array (15 fonts), sanitizeFontUrl, sanitizeFontFamily, resolveFontUrl.
3. Database: Added `font_family` and `font_url` columns to projects table. Added `fontFamily`/`fontUrl` to widget theme JSONB default.
4. ProjectContext: Added font_family and font_url to Project interface and select query.
5. Settings page: Font picker with Google Fonts dropdown + custom CSS URL input + live preview.
6. Widget builder: Per-widget font override (inherit from page default, or pick specific font). Live preview renders chosen font.
7. Widget API: Exposes project fontFamily and fontUrl in response.
8. Collection form: Loads font via useEffect (injects link tags into head), applies fontFamily inline style.
9. Public page: Loads font via link tags in JSX, applies fontFamily inline style.
10. embed.js: Font sanitizers, GFONT_MAP lookup, resolveFontConfig() resolves widget theme font > project font > inherit. Injects link tags into shadow root.
11. Iframe embed: Resolves font, injects link tags in head, applies fontStack to body CSS.
12. All 12 test scenarios traced and passed (personas, empty state, boundary, data transitions, stale data, concurrent, failure, permissions, reverse, security, performance).

**What's next:**
Video cost optimization (compress + thumbnail + fair use). See "AFTER: Video Cost Optimization" section below.

**What to watch out for:**
1. shadcn Select component was installed during this session. If `src/components/ui/select.tsx` doesn't exist after a fresh clone, run `npx shadcn@latest add select`.
2. The embed.js GFONT_MAP must be kept in sync with `src/lib/fonts.ts` GOOGLE_FONTS array. If you add or remove a font from one, update the other.
3. Font loading in embed.js uses preconnect hints inside the shadow root. This is intentional. Host page preconnect doesn't help shadow DOM in all browsers.
4. `updateTheme` in widgets page now accepts `string | boolean | null` (was `string | boolean`). This is because fontUrl can be null.
5. The iframe embed (`src/app/embed/[id]/page.tsx`) has its own GFONT_MAP constant (duplicated from embed.js). A future refactor could share these, but the iframe is lower priority (v1 compat only).
6. Font is free for all plans (not gated). Intentional. Same as accent_color.

---

## Previous: Session Handoff (March 4, 2026, session 4)

**What was done this session:**
1. Multi-widget management shipped (commit `7687fcf`). Widget page loads all widgets per project. Added widget selector bar, create/delete/switch handlers, empty state, upgrade dialog. Builder UI unchanged.
2. Fixed `isPro` checks to use `userPlan !== 'free'` (branding toggle, React tab) so agency plan works.
3. Added `project_id` index to schema.sql.
4. All 15 test scenarios traced and passed.
5. Process update (commit `33d7ccc`): baked Persona-Driven UI Selection into pre-implementation step 7. Every UI choice now requires per-persona intent statements before picking a pattern.
6. Process update (commit `7dec1c5`): added Business Impact Assessment (6 questions: retention, conversion, time to value, churn risk, expansion, referral) as mandatory companion to persona intents. Business is not an afterthought.
7. Widget selector refined: name width 120px to 180px, layout type label added below name.

**What's next:**
Custom fonts. Brand blending improvement. See "AFTER: Custom Fonts" section below. Key files: widget builder (font picker), embed.js (font loading into shadow root), schema (font_family field). Remember: pre-implementation now has 7 steps (step 7 = persona UI intents + business impact assessment).

**What to watch out for:**
1. PRE-IMPLEMENTATION now has 7 steps (was 6). Step 7 = Persona UI Intents + Business Impact Assessment. Both required for any UI decision.
2. Widget delete uses inline two-click confirmation (not Dialog). Intentional for compact selector bar.
3. `totalWidgetCount` is tracked across ALL projects for free plan gate.
4. `handleSave` only updates. Creation is `handleCreateWidget`. Deliberate split.
5. embed.js is vanilla JS (no React, no TypeScript). Changes require manual DOM string building and careful testing.

---

## Previous: Session Handoff (March 4, 2026, session 3)

**What was done:**
1. Multi-project support shipped (commit `490018d`).
2. Bug fix: widgets page infinite loading for 0-project users (commit `5b2c060`).
3. Process improvements: strengthened gates, added Test Scenario Checklist.
4. Added video cost optimization task.

---

## Context: Why We Are Doing This

Our core promise: **"Social proof that looks like you built it."**
Target audience: Freelancers, agencies, SaaS founders (Western, digital, pay for tools).
Competitors: Senja, Testimonial.to, EmbedSocial. They charge per domain/seat, hurt Lighthouse, lock content in hosted pages.

We ran a full usability audit (March 4, 2026) testing every screen as a target user ("Sarah Chen, freelance designer"). We cross-referenced 164 marketing promises against actual built features. Found and fixed 21 issues. Three broken promises remain.

The pricing page explicitly states features that don't work yet. **Every day these remain broken, a paying Pro/Agency customer could discover the gap and churn.** That's why this is urgent.

---

## DONE: Multi-Project Support (CRITICAL) — shipped session 3, commit 490018d

**The broken promise:**
Pricing table says Free: 1 project, Pro: Unlimited, Agency: Unlimited.
FAQ says: "One account gives you unlimited projects. Create a separate form and widget for each client site."
Reality: The entire codebase loads `.limit(1).single()` for projects. There is NO way to create a second project.

**Who this hurts:**
An agency managing 5 client websites pays $49/mo expecting to run separate branded forms and widgets per client. They discover they can only have one project. They churn.

**Implementation plan:**

### Step 1: Settings page project selector
File: `src/app/(dashboard)/dashboard/settings/page.tsx`
1. Change project query from `.limit(1).single()` to fetch ALL projects for the user
2. Add a project selector dropdown at the top of the Project tab
3. Add a "Create new project" button (gated: free = 1 max, Pro/Agency = unlimited)
4. When switching projects, reload all project fields (name, slug, logo, colors, URLs)
5. Keep the save logic as-is (it already handles insert vs update based on `project` state)

### Step 2: Dashboard overview
File: `src/app/(dashboard)/dashboard/page.tsx`
1. Change project count query to count all projects (already does `count: 'exact'`)
2. Stats should aggregate across all projects (testimonials already load by user_id, not project_id)
3. No major changes needed here since stats are user-scoped

### Step 3: Forms page
File: `src/app/(dashboard)/dashboard/forms/page.tsx`
1. Already supports multiple projects in the form creation dialog (project dropdown exists)
2. Forms list already loads all forms for the user across projects
3. Just verify the project selector in the create dialog works with multiple projects

### Step 4: Widgets page
File: `src/app/(dashboard)/dashboard/widgets/page.tsx`
1. Change project query from `.limit(1).single()` to fetch all projects
2. Add project selector (widget is scoped to a project_id)
3. Widget loading: load widget for selected project (not just first project)
4. When project changes, reload widget data for that project

### Step 5: Inbox
File: `src/app/(dashboard)/dashboard/inbox/page.tsx`
1. Already loads all testimonials by user_id (works across projects)
2. Consider adding a project filter tab/dropdown (optional, nice-to-have)

### Step 6: Free plan enforcement
1. When a free user tries to create a second project, show upgrade modal
2. Check: `if (plan === 'free' && existingProjectCount >= 1) { showUpgrade(); return; }`

### DB Schema check:
`supabase/schema.sql`: projects table has `user_id` foreign key. No UNIQUE constraint on user_id. Multiple projects per user are already supported at the DB level. No schema changes needed.

### Key files to grep:
```
grep -rn "\.limit(1)\.single()" src/ --include="*.tsx" --include="*.ts"
grep -rn "from('projects')" src/ --include="*.tsx" --include="*.ts"
```

---

## DONE: Multi-Widget Management — shipped session 4

**The broken promise:**
Pro features list says "Unlimited embed widgets." Free gets "1 embed widget."
Reality was: Widget page does `.limit(1).single()` and only loads one widget.

**What was built:**
1. Widget selector bar (horizontal pills) between header and builder
2. Create/delete/switch handlers with proper state management
3. Empty state when no widgets for current project
4. Free plan gate: max 1 widget total across all projects (upgrade dialog)
5. Embed codes update when switching widgets
6. `handleSave` split into save (update only) and `handleCreateWidget` (insert)
7. Added `project_id` index to schema.sql
8. Fixed `isPro` checks to include agency plan

---

## DONE: Custom Fonts — shipped session 5

**The gap:**
FAQ says "The component renders using your page's existing font stack." True for embed.js (uses system fonts). But users can't customize fonts to match their brand.

**This is a brand blending improvement, not a broken promise.** Lower priority than the two above.

**Implementation plan:**
1. Add `fontFamily` to WidgetTheme interface
2. Widget builder: font selector (Google Fonts top 15 + "System default")
3. embed.js: inject `<link>` tag for Google Font into shadow root
4. Collection form: use project-level font setting from accent_color's sibling field
5. Public page: use project-level font

**Design decision needed:** Which Google Fonts to offer? Suggested list:
Inter, Roboto, Open Sans, Lato, Poppins, Montserrat, Nunito, Raleway, Source Sans 3, Work Sans, DM Sans, Plus Jakarta Sans, Outfit, Manrope, Space Grotesk

### Key files:
`src/app/(dashboard)/dashboard/widgets/page.tsx` (font picker UI)
`public/embed.js` (font loading + application)
`src/components/collect/CollectFormClient.tsx` (form font)
`src/app/p/[slug]/page.tsx` (public page font)
`supabase/schema.sql` (add font_family to projects table, or use widget theme)

---

## DONE: Agency Plan Overhaul — shipped session 8

**The problem:**
Agency ($49/mo) is currently "Pro + support theater." The only product feature is client report links. "Priority support" and "onboarding call" require founder time and don't scale. The "Get in touch" mailto CTA blocks self-serve revenue. Nobody pays 2.5x more for email support.

**The fix: Agency = Client Delivery Workflow**
Pro is for managing your own social proof. Agency is for delivering social proof to clients professionally. The positioning shift: "Pro + support" becomes "Pro + client tools."

**Target personas:**
1. Marcus (agency owner, 8 client websites, needs to hand off reports and embed codes efficiently)
2. Diana (freelance web designer, 5 clients, wants her deliverables to look professional, not "powered by some tool")

### Task 1: Self-serve checkout (HIGHEST PRIORITY)
Files: `src/components/upgrade-modal.tsx`, `src/app/(marketing)/_components/PricingCards.tsx`, `src/app/api/stripe/checkout/route.ts`, `src/lib/lemonsqueezy.ts`
1. Add Agency variant IDs to `.env.local` (LEMONSQUEEZY_AGENCY_VARIANT_ID, LEMONSQUEEZY_AGENCY_YEARLY_VARIANT_ID)
2. Update `createCheckoutUrl` to accept a `plan` parameter ('pro' | 'agency')
3. Update checkout API route to accept `plan` in the request body
4. Update UpgradeModal "Get in touch" button to trigger Agency checkout instead of mailto
5. Update PricingCards "Get in touch" button to link to signup with agency plan param
6. Estimated effort: 1 to 2 hours

### Task 2: White-label client reports
Files: `src/app/report/[token]/page.tsx`, `src/app/(dashboard)/dashboard/settings/page.tsx`, `supabase/schema.sql`
1. Add `report_footer_text` column to projects table (nullable text, Agency only)
2. Add field in settings (Agency gated): "Report footer text" with placeholder "Report prepared by [Your Company]"
3. In report page: if project has `report_footer_text`, show that instead of "Powered by Vouch"
4. Pro/Free users still see "Powered by Vouch"
5. Estimated effort: half a day

### Task 3: Embed codes on client report page
Files: `src/app/report/[token]/page.tsx`, report page API query
1. Query widgets for this project alongside testimonials
2. Add "Embed Codes" section at the bottom of the report page
3. Show each widget's embed snippet (script tag) with a copy button
4. Agency only (check plan in the report query)
5. This transforms the report from "data dump" to "complete client handoff document"
6. Estimated effort: 1 day

### Task 4: Custom report intro message
Files: `src/app/(dashboard)/dashboard/settings/page.tsx`, `supabase/schema.sql`, `src/app/report/[token]/page.tsx`
1. Add `report_message` column to projects table (nullable text, 200 char limit, Agency only)
2. Add field in settings: "Client report intro" with placeholder "Prepared for [Client Name] by [Your Studio]"
3. Render as a styled note above testimonials on the report page
4. Estimated effort: 2 hours

### Task 5: Kill onboarding call, update feature list
Files: `src/lib/lemonsqueezy.ts`, `src/app/(marketing)/_components/PricingCards.tsx`, `src/app/(marketing)/pricing/page.tsx`
1. Remove "Custom onboarding call" from AGENCY_FEATURES
2. Remove "Priority email support" (replace with "Email support, 1 business day response")
3. Add new Agency features to feature lists: "White-label client reports", "Embed codes in client reports", "Custom report intro message"
4. Update pricing comparison table
5. Estimated effort: 1 hour

### Task 6 (DEFER): Consider renaming "Agency" to "Studio"
"Agency" excludes freelancers. "Studio" works for both Diana (freelancer) and Marcus (agency). Evaluate after shipping tasks 1 to 5. Not urgent.

### Task 7 (DEFER): Custom domains for collection forms
Real value but requires DNS verification and SSL provisioning. Wait for 20+ Agency subscribers asking for it.

### Task 8 (DEFER): Team seats / client logins
Report link solves 80% of the "share with client" need. Full ACL is a 2 to 4 week project. Defer.

**New Agency feature list (after tasks 1 to 5):**
1. Everything in Pro
2. White-label client reports (no Vouch branding, custom footer)
3. Embed codes delivered via client report link
4. Custom report intro message
5. Email support (1 business day response)

---

## DONE: Video Cost Optimization — partially shipped session 7

**Client-side optimizations (shipped):**
1. Recording bitrate reduced from 1Mbps to 600kbps (40% smaller files)
2. Camera resolution lowered from 1280x720 to 640x480 (faster init + smaller output)
3. Thumbnail-first in embed.js (poster + play button, video loads on click, 70-90% bandwidth savings)
4. Fair use clause added to ToS section 7

**Server-side compression (DEFERRED):**
Requires Cloudinary, FFmpeg, or Mux integration. Evaluate when video storage costs become material (track Supabase storage usage monthly). The client-side bitrate reduction handles the 80% case.

---

## COMPLETED (for reference, do not redo)

### Usability Audit Fixes (21 items, March 4, 2026)

Batch 1 (commit `66be2af`):
- [x] Custom form title/description rendered on collection form
- [x] Settings ?tab=project URL param works
- [x] Dashboard quick actions always visible
- [x] Branding link / to /via
- [x] Video limit error visitor-friendly
- [x] Inbox "no search results" distinct from empty state
- [x] Widget page warns about missing project on load
- [x] Inbox optimistic revert fixed (re-fetch on failure)

Batch 2 (commit `ed0d956`):
- [x] Form background uses accent color (not hardcoded indigo)
- [x] Widget builder: text color picker exposed
- [x] Widget builder: card style selector (shadow/border/flat)
- [x] Company name wraps on public page + embed.js
- [x] Website builder tab uses Shadow DOM v2 (SEO-friendly)
- [x] Dashboard subtitle dynamic for new users
- [x] Widget userPlan includes 'agency'
- [x] Inbox Load More respects active tab filter
- [x] Rejection requires confirmation (two-step)
- [x] Video upload failure shows retry/skip (not silent discard)

Batch 3 (commit `8186162`):
- [x] FAQ copy: "iframe" corrected to "native HTML"
- [x] Single layout added to widget builder
- [x] Widget API returns project logo for embed branding
- [x] embed.js renders project logo when available
- [x] Widget API isPro includes agency plan
