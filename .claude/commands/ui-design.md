# /ui-design — Interface Design Thinking

Apply this before writing any UI code. The goal is not to produce consistent-looking screens. The goal is to make the right person feel the right thing at the right moment — so they take the action we need them to take. And to do that with craft, not defaults.

---

# Part 1 — Who is Actually Looking at This Screen?

Before anything else, name the specific person on this screen. Not "the user." Not "a small business owner." The actual human.

Answer:
- Where are they right now? (Between customers? At a desk at midnight? On their phone?)
- What do they want to accomplish in the next 60 seconds?
- What are they feeling arriving here? (Rushed? Confused? Hopeful? Suspicious?)
- What would make them stop and leave?

**This changes the design entirely.** A salon owner scanning a QR code while a customer stands waiting needs a completely different screen from a developer configuring a widget at midnight. Same feature, radically different design.

## Their Pain, Motivation, and Fear

**Pain:** What is frustrating them right now that this screen addresses? Design the relief directly — do not make them find it.

If the pain is "asking for reviews feels awkward," the share screen should not show a raw URL and a copy button. It should show a WhatsApp message already written for them. The design does the emotional labor.

**Motivation:** What outcome are they actually trying to reach? Design for the outcome, not the feature.

If the motivation is "I want my site to look credible to new clients," the widget builder should show the widget inside a realistic-looking website, not a blank white box. Let them see the outcome.

**Fear:** What might make them hesitate or distrust?

If they fear "this will slow down my website" — put the reassurance next to the embed code, not in the docs. If they fear "will this look cheap?" — show the quality first, before you explain anything.

**What will make them pay:** Find the exact moment the free tier creates enough friction to motivate an upgrade. Do not explain what they get on Pro. Show them what they cannot have. Let them feel the limit. Then offer the upgrade.

## The Emotional Arc

Map the sequence of feelings from arriving to completing the action:

1. What they feel landing here
2. What they need to feel to take the next step
3. What they need to feel at completion

The design job is to close that gap at each transition. Every element either helps close that gap or it is noise.

---

# Part 2 — Intent First

Before touching code, answer these out loud.

**Who is this human?** Where are they? What's on their mind? What did they do 5 minutes ago, and what will they do after?

**What must they accomplish?** Not "use the dashboard." The verb. Approve the testimonial. Share the QR code. Build the widget. The answer determines what leads, what follows, what hides.

**What should this feel like?** Say it in words that mean something. "Clean and modern" means nothing. Warm like a notebook? Cold like a terminal? Calm like a reading app? Dense like a control panel? The answer shapes color, type, spacing, density — everything.

If you cannot answer these with specifics, stop and think. Do not guess. Do not default.

## Every Choice Must Be A Choice

For every decision, you must be able to explain WHY.

- Why this layout and not another?
- Why this color temperature?
- Why this spacing density?
- Why this information hierarchy?

If the answer is "it's common" or "it's clean" or "it works" — you have not chosen. You have defaulted.

**The swap test:** If you swapped your choices for the most common alternatives and the design did not feel meaningfully different, you never made real choices.

**Sameness is failure.** If another AI given a similar prompt would produce substantially the same output, you have failed. Not because sameness is bad for its own sake — but because sameness means the design did not emerge from this specific person, problem, and context. When you design from intent, sameness becomes impossible.

## Intent Must Be Systemic

If the intent is warm: surfaces, text, borders, accents, typography — all warm. If the intent is dense: spacing, type size, information architecture — all dense. If the intent is calm: motion, contrast, saturation — all calm.

Saying "warm" and using cold colors is not following through. Check every token against your stated intent.

---

# Part 3 — Domain Exploration

Generic output follows this path: task type → visual template → theme.

Crafted output follows this path: task type → product domain → signature → structure + expression.

The difference is time spent in the product's world before any visual thinking.

## Required Outputs Before Proposing Any Direction

Do not propose a direction until you produce all four:

**Domain:** Concepts, metaphors, vocabulary from this product's world. Not features — territory. What language does this domain use? What physical spaces or objects does it evoke? Minimum 5.

**Color world:** What colors exist naturally in this product's domain? Not "warm" or "cool" — go to the actual world. If this product were a physical space, what would you see? What materials? What light? What objects? List 5 or more colors that belong to this world.

**Signature:** One element — visual, structural, or interaction — that could only exist for this product. If you cannot name one, keep exploring. "Cards with rounded corners" is not a signature.

**Defaults:** Three obvious choices for this interface type — visual and structural. You cannot avoid patterns you have not named.

Your proposal must explicitly reference domain concepts, colors from the world exploration, the signature element, and what replaces each default.

**The test:** Remove the product name from your proposal. Could someone identify what this is for? If not, it is generic. Explore deeper.

---

# Part 4 — Craft Foundations

## Where Defaults Hide

Defaults do not announce themselves. They disguise themselves as infrastructure.

**Typography feels like a container.** But typography is not holding your design — it IS your design. The weight of a headline, the personality of a label, the texture of a paragraph. A bakery management tool and a trading terminal might both need "clean, readable type" — but the type that is warm and handmade is not the type that is cold and precise.

**Navigation feels like scaffolding.** But navigation is not around your product — it IS your product. Where you are, where you can go, what matters most. A page floating in space is a component demo, not software.

**Data feels like presentation.** But a number on screen is not design. What does this number mean to the person looking at it? A progress ring and a stacked label both show "3 of 10" — one tells a story, one fills space.

**Token names feel like implementation detail.** But your CSS variables are design decisions. `--ink` and `--parchment` evoke a world. `--gray-700` and `--surface-2` evoke a template.

There are no structural decisions. Everything is design.

## Subtle Layering

This is the backbone of craft. You should barely notice the system working. When the craft is working, the hierarchy is invisible — you just understand the structure.

**Surface elevation:** Surfaces stack. Build a numbered system. Each jump should be only a few percentage points of lightness. Barely visible in isolation. When surfaces stack, the hierarchy emerges. Whisper-quiet shifts you feel rather than see.

- Sidebars: same background as canvas, not different. A subtle border is enough separation. Different colors fragment the visual space.
- Dropdowns: one level above their parent surface.
- Inputs: slightly darker than surroundings, not lighter. Inputs are inset — they receive content.

**Borders:** Low-opacity rgba blends with the background. Defines edges without demanding attention. Build a progression — not all borders are equal. Match intensity to the importance of the boundary.

**The squint test:** Blur your eyes. You should still perceive hierarchy. But nothing should jump out. No harsh lines. No jarring color shifts. Just quiet structure. This separates professional interfaces from amateur ones.

## Infinite Expression

Every pattern has infinite expressions. No interface should look the same.

A metric display could be a hero number, inline stat, sparkline, gauge, progress ring, comparison delta, trend badge, or something entirely new. A dashboard could emphasize density, whitespace, hierarchy, or flow in completely different ways.

Before building, ask:
- What is the ONE thing users do most here?
- What products solve similar problems brilliantly? Study them.
- Why would this interface feel designed for its purpose, not templated?

Linear's cards do not look like Notion's. Vercel's metrics do not look like Stripe's. Same concepts, infinite expressions.

## Color Lives Somewhere

Every product exists in a world. That world has colors.

Spend time in the product's world before reaching for a palette. What would you see if you walked into the physical version of this space? Your palette should feel like it came FROM somewhere, not like it was applied TO something.

Temperature is one axis. Is this quiet or loud? Dense or spacious? Serious or playful? Geometric or organic? A trading terminal and a meditation app are both "focused" — completely different kinds of focus.

One accent color used with intention beats five colors used without thought. Color carries meaning. Unmotivated color is noise.

---

# Part 5 — Design Principles

## Token Architecture

Every color traces back to a small set of primitives: foreground (text hierarchy), background (surface elevation), border (separation hierarchy), brand, and semantic (destructive, warning, success). No random hex values — everything maps to primitives.

**Text hierarchy:** Build four levels — primary, secondary, tertiary, muted. Each serves a different role: default text, supporting text, metadata, disabled/placeholder. If you are only using two, your hierarchy is too flat.

**Border progression:** Borders are not binary. Match intensity to importance — standard separation, softer separation, emphasis, maximum emphasis for focus rings.

**Control tokens:** Form controls have specific needs. Dedicated tokens for control backgrounds, control borders, and focus states — not reused surface tokens.

## Spacing

Pick a base unit and use multiples. Build a scale for different contexts: micro spacing for icon gaps, component spacing within buttons and cards, section spacing between groups, major separation between distinct areas. Random values signal no system.

## Depth

Choose one approach and commit:
- **Borders only** — Clean, technical. For dense tools.
- **Subtle shadows** — Soft lift. For approachable products.
- **Layered shadows** — Premium, dimensional. For cards needing presence.
- **Surface color shifts** — Background tints establish hierarchy without shadows.

Do not mix approaches.

## Border Radius

Sharper feels technical. Rounder feels friendly. Build a scale — small for inputs and buttons, medium for cards, large for modals. Do not mix sharp and soft randomly.

## Typography

Build distinct levels distinguishable at a glance. Headlines need weight and tight tracking for presence. Body needs comfortable weight for readability. Labels need medium weight that works at small sizes. Data needs monospace with tabular number spacing. Do not rely on size alone — combine size, weight, and letter-spacing.

## States

Every interactive element needs: default, hover, active, focus, disabled. Every data state needs: loading, empty, error. Missing states feel broken.

## Animation

Fast micro-interactions, smooth easing. Deceleration easing on entrance. Avoid spring/bounce in professional interfaces. If removing the animation makes something feel better, remove it.

---

# Part 6 — The User Simulation (Mandatory Before Shipping)

After designing and before writing a single line of code, become the user. Sit in their exact mental state: tired, in a hurry, slightly confused, maybe on a small phone screen.

Run every one of these honestly:

- When I look at this screen for the first time, do I immediately understand what to do?
- Is there anything that makes me hesitate?
- Am I reading, or just clicking?
- Does this feel fast? Does it feel trustworthy?
- Does the most important thing stand out, or is it competing with five other things?
- What would make me abandon right now?
- Would I personally complete this flow if I were actually this person?

**Cover test:** Cover the page and uncover just the top third. Does the user know where they are and what to do?

**3-second test:** Read the screen in 3 seconds. What did you absorb? Is that the right thing?

**Phone test:** Try to use it with one thumb on a small screen. Does anything require precision?

If any honest answer is bad, the design is wrong regardless of how clean the code is. Fix the design before writing code.

---

# Part 7 — Before Showing Anything

**Look at what you made.**

Ask yourself: "If they said this lacks craft, what would they mean?"

That thing you just thought of — fix it first. Your first output is probably generic. That is normal. The work is catching it before the user has to.

## The Checks

- **Swap test:** If you swapped the typeface for your usual one, would anyone notice? If you swapped the layout for a standard template, would it feel different? The places where swapping would not matter are the places you defaulted.

- **Squint test:** Blur your eyes. Can you still perceive hierarchy? Is anything jumping out harshly? Craft whispers.

- **Signature test:** Can you point to five specific elements where your signature appears? Not "the overall feel" — actual components. A signature you cannot locate does not exist.

- **Token test:** Read your CSS variables out loud. Do they sound like they belong to this product's world, or could they belong to any project?

If any check fails, iterate before showing.

---

# What NOT to Do

- Harsh borders — if borders are the first thing you see, they are too strong
- Dramatic surface jumps — elevation changes should be whisper-quiet
- Inconsistent spacing — the clearest sign of no system
- Mixed depth strategies — pick one and commit
- Missing interaction states — hover, focus, disabled, loading, error
- Dramatic drop shadows — shadows should be subtle
- Large radius on small elements
- Pure white cards on colored backgrounds
- Gradients and color for decoration — color should mean something
- Multiple accent colors — dilutes focus
- Different hues for different surfaces — keep the same hue, shift only lightness
- "Clean and modern" as an intent — it means nothing

---

# Before Writing Each Component

State these explicitly, every time:

```
Intent: [who is this human, what must they do, how should it feel]
Domain: [concepts from the product world that informed this]
Palette: [colors from domain exploration and WHY they fit]
Depth: [borders / shadows / layered — and WHY this fits the intent]
Typography: [typeface and scale — and WHY it fits the intent]
Spacing: [base unit]
Signature: [the element that could only belong to this product]
```

If you cannot explain WHY for each choice, you are defaulting. Stop and think.
