---
paths: ["public/embed.js"]
---
# embed.js Rules

1. Vanilla JS only. No React, no build tools, no type checking. Test changes carefully.
2. Stateful layouts (editorial, carousel) use `{html, mount}` pattern, not just HTML strings.
3. `parseColorBrightness()` handles both hex AND rgb(). Reuse for new layouts.
4. Shadow DOM: external CSS (Google Fonts) must be injected as `<link>` inside the shadow root, not host `<head>`.
5. Video: thumbnail-first (poster + play button). Create `<video>` on click. Never autoload.
6. `replaceWith()` is one-way. Poster div gone after video starts.
7. Touch targets: 44px minimum for all interactive elements.
8. New layouts must pass: screenshot test, Linear test, designer test, clutter test (max 4 elements for premium, 6 for standard), typography test (min 20px editorial, 18px minimal, 15px standard).
