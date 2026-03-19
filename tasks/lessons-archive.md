# Lessons Archive

Reference only. NOT loaded at session start. Consult when investigating a recurring pattern.

## Enforced by Hook (safety.md + hooks)

1. Create git checkpoint before every task. (hook: session-start.sh, rule: safety.md)
2. Never suggest /clear without completing session-end gate. (hook: stop gate)
3. Never write code before completing session-start gate. (hook: session-start.sh)
4. Never overwrite .env files. (rule: safety.md)

## Enforced by Path-Specific Rule: embed-js.md

5. embed.js is vanilla JS, not React. Test changes carefully. (rule 1)
6. Stateful layouts use `{html, mount}` pattern. (rule 2)
7. `parseColorBrightness()` handles both hex AND rgb(). (rule 3)
8. Shadow DOM: external CSS must be `<link>` inside shadow root. (rule 4)
9. Video: thumbnail-first, create `<video>` on click. (rule 5)
10. `replaceWith()` is one-way. Poster gone after video. (rule 6)
11. Touch targets: 44px minimum. (rule 7)
12. Use `createTextNode` for mixed-content DOM nodes. `textContent` replaces ALL children. (rule 9)
13. Derive separator/muted colors from theme text color via `hexAlpha(tc, alpha)`. Never hardcode. (rule 10)
14. CSS animation classes must be wired up in JS. Defining classes without triggers = dead. (rule 11)
15. `data-vouch="WIDGET_ID"` attribute, not `data-vouch-id`. (embed convention)
16. Light/dark text detection must handle both hex AND rgb(). (rule 3)

## Enforced by Path-Specific Rule: api-security.md

17. Always validate auth before processing. Fail closed. (rule 1)
18. Always include user_id in queries. (rule 2)
19. Validate external URLs before serving from cache. (rule 3)
20. File uploads: validate extension AND MIME type. SVG = XSS vector. (rule 4)
21. Error messages: "Who sees this? Can they act on it?" (rule 5)
22. API JSON endpoints need nosniff header. (rule 6)
23. Auth callback: validate redirect starts with `/` not `//`. (rule 7)
24. Service role client ONLY when RLS must be bypassed. (rule 8)
25. Admin secret guard: `!secret` not `secret &&`. Fail closed. (rule 9)
26. Security headers: CSP, X-Frame-Options, HSTS, nosniff. Not optional. (general API practice)
27. CSP must exempt embed routes. (embed-specific)
28. SVG uploads are stored XSS vector without sanitization. (rule 4 extended)

## Enforced by Path-Specific Rule: collect-form.md

29. No login required to submit. (rule 1)
30. Camera: 640x480 ideal, preload auto for blobs. (rule 2)
31. Customer-facing errors: submitter cannot upgrade. (rule 3)
32. Free tier cap: 25 testimonials. (rule 4)
33. `canSubmit` gates must check artifacts, not intent. (rule 5)
34. When removing a skip path, grep ALL skip buttons. (rule 6)
35. Blob URL video needs `preload="auto"`. (rule 2)

## Enforced by Path-Specific Rule: widget-builder.md

36. Free users preview all layouts. Gate at Save. (rule 1)
37. PRO badges: amber sparkle for Editorial. (rule 2)
38. Dashboard preview must match embed.js colors exactly. (rule 3)
39. updateTheme must accept widest field type. (rule 4)
40. isPro check must include pro AND studio. (rule 5)
41. Slug page must mirror embed.js toggle support. (rule 7)
42. Plan limit gates query user_id across ALL projects. (rule 8)

## Enforced by Path-Specific Rule: product-decisions.md

43. Copy must match reality. If pricing page lists it, code must implement it. (decision pattern 1)
44. Customer-facing errors: who sees this, can they act? (decision pattern 2)
45. Never list features that don't exist. (decision pattern 3)
46. Copy that implies exclusion creates doubt. (decision pattern 4)
47. Gate at deployment, not discovery. Let users preview first. (decision pattern 5)
48. Validate pain points against real user complaints. (decision pattern 6)
49. "Native-looking" is a spectrum. Sweet spot = visual harmony + credibility signals. (decision pattern 7)
50. Free tier generosity = growth engine (badge impressions). (decision pattern 8)
51. Counter-position: "200 features. You need 5. We built those 5 best." (decision pattern 9)
52. Use competitor products live, not just pricing pages. (decision pattern 10)

## Enforced by Pipeline Checklist (pipeline.md)

53. Array.isArray() on Supabase joins. (DATA LAYER checklist item)
54. user_id alongside project_id. (DATA LAYER checklist item)
55. Error check before sort/slice. (DATA LAYER checklist item)
56. Plan check via negation (=== 'free'). (DATA LAYER checklist item)
57. .limit(1).single() if multi-support. (MISSED FILES checklist item)
58. isPro if plan logic. (MISSED FILES checklist item)
59. canSubmit if submission flow. (MISSED FILES checklist item)
60. Skip buttons if removing paths. (MISSED FILES checklist item)

## Process Rules (already in CLAUDE.md, pipeline.md, safety.md)

61. Always update todo.md and lessons.md before /clear. (CLAUDE.md session end gate)
62. MEMORY.md is limited to 200 lines. (MEMORY.md convention)
63. Git commit messages explain WHY not just what. (CLAUDE.md git protocol)
64. Read tasks/lessons.md at session start. (CLAUDE.md session start gate)
65. Test with real user flows, not just code review. (pipeline.md post-implementation)
66. Parallel subagents for audits save time. (pipeline.md agent rules)
67. Don't trust subagent claims blindly. Verify critical findings. (pipeline.md agent rules)
68. Never skip reading skill files. (CLAUDE.md session start gate step 3)
69. Never skip persona-based testing. (persona-ui.md rule)
70. Never skip security spot check. (pipeline.md self-review SECURITY item)
71. Never skip validation before building. (validate-and-plan skill)
72. Never skip end-to-end flow testing. (CLAUDE.md post-implementation step 2)
73. Never skip interface design skill for UI changes. (CLAUDE.md skills table)
74. Process improvements are worthless without enforcement. (hooks philosophy)
75. Test ALL personas. (persona-ui.md)
76. Early return guards must clean up loading state. (general React pattern)
77. Happy path testing is not testing. Enumerate scenarios BEFORE coding. (pipeline.md self-review)
78. Every UI decision must pass "everyone happy" test. (persona-ui.md)
79. Business impact is not an afterthought. (persona-ui.md Business Impact section)
80. "Continuing previous work" is NOT an excuse to skip pipeline. (MEMORY.md hard gate)
81. UI-heavy T3+ tasks MUST run BOTH ui agents. (pipeline.md agent routing)
82. Reading a skill is NOT the same as applying it. (MEMORY.md hard gate)
83. Agent delegation requires written plan with non-overlapping scopes. (pipeline.md agent rules)
84. Every agent needs a north star. (agent definition files)
85. Agents that overlap WILL produce duplicate work. (agent definition files)
86. competitive-analyst must use live data. (competitive-analyst agent definition)
87. Confirmation phrases without checklists are weak guardrails. (pipeline.md checklist design)
88. UI flow must be designed BEFORE code. (pipeline.md T4 chains)
89. Subagents re-read entire files. Paste diffs instead. (pipeline.md agent rules)
90. One-size-fits-all pipelines waste tokens. (pipeline.md tier system)
91. Self-review bias is real. Use mechanical checklist. (pipeline.md self-review)
92. CLAUDE.md should be under 100 lines. (CLAUDE.md maintenance)
93. Hooks are deterministic, CLAUDE.md is advisory. (hooks philosophy)
94. PowerShell through bash loses $ signs. Use .ps1 files. (Windows-specific)
95. Set CLAUDE_CODE_SUBAGENT_MODEL for cost savings. (env var config)

## One-Time Incidents / Fixed in Code

96. Production schema sync: always verify schema is up to date before prod ops.
97. SQL copying from chat: hidden carriage returns. Write SQL to file instead.
98. Radix tabs cannot be clicked via browser automation.
99. React controlled inputs need `form_input` tool, not type action.
100. Widget ID is not a UUID visible in DOM. Query Supabase to find it.
101. Native `<input type="color">` useless on mobile. Use preset buttons + hex input.
102. Fake macOS window chrome misleads users. Use descriptive labels.
103. Hand-drawn SVG paths look terrible. Use Simple Icons.
104. Shadow DOM font loading requires link tags inside shadow root.
105. `updateTheme` helper types must match widest field type.
106. Font sanitization: URLs HTTPS-only, family names strip to `[a-zA-Z0-9 -]`.
107. Dialog input contrast: never use `bg-transparent` on white dialogs.
108. Project selectors in dialogs should respect global context.
109. Webhook plan mapping must cover ALL paid plans.
110. Verify deps are actually unused before npm uninstall.
111. Pre-query limits must be generous with Promise.all pattern.
112. `grid-cols-N` with fewer items: use auto-fill + minmax.
113. Contradictory pricing copy erodes trust.
114. Modal content must fit viewport without scrolling.
115. Animate `scaleX` instead of `width` for progress bars.
116. "No ARIA is better than bad ARIA." Use role=radiogroup for binary toggles.
117. aria-label on generic elements ignored. Use sr-only text.
118. Mobile safe area: `calc(5rem + env(safe-area-inset-bottom))`.
119. Touch target math: SVG size + padding * 2 >= 44px.
120. Use agents proactively (user preference, enforced in MEMORY.md).
121. When renaming across codebase, use Explore agent first.
122. Test business logic functions, not just security validators.
123. Agent usage must be enforced by gates, not memory.
124. Run full product audit before launch.
125. Debug undefined env vars: JSON.stringify strips undefined values.
126. Referral programs don't cause conversations at 0 to 50 users.
127. Role-play buyer journeys with real data.
128. todo.md can grow large. Use offset/limit.
129. "We have more X" is losing strategy when competitor has 10x features.
130. 80/20 rule: Senja's 22 widget templates = 7 paradigms.
131. Notifications create dopamine loops for retention.
132. In AI era, "non-technical" means "needs AI to help."
133. Live competitor data beats knowledge cutoff.
134. Porter's "stuck in the middle" is real for SaaS pricing.
135. Let subagents read files themselves.
136. Dashboard usage indicators must use user-wide counts.
