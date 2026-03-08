---
paths: ["src/app/(dashboard)/dashboard/widgets/**"]
---
# Widget Builder Rules

1. Free users can PREVIEW all layouts. Gate at Save/Add to Website, not at selection.
2. PRO badges: amber sparkle for Editorial (flagship), subtle indigo for other premium layouts.
3. Dashboard preview must match embed.js colors exactly. Use same rgba computation.
4. `updateTheme` callback must accept the widest field type (including `null` for nullable fields).
5. isPro check must include both 'pro' AND 'studio' plans.
6. New widget defaults: hide date and metric badge. Stars and avatar visible.
