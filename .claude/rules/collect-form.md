---
paths: ["src/components/collect/**", "src/app/c/**"]
---
# Collection Form Rules

1. No login required to submit testimonials. This is a key differentiator.
2. Camera/video: `ideal: 640x480` for faster init. `preload="auto"` for blob URLs.
3. Customer-facing error messages: the submitter cannot upgrade. Don't tell them to.
4. Free tier cap: 25 testimonials. Check count in submission API. Show branded upgrade message to form OWNER, not to submitter.
5. canSubmit gates must check concrete artifacts (videoUrl !== null), never user intent (testimonialType === 'video').
6. When removing a "skip" path, grep for ALL skip buttons in the flow. Every skip is a blank-submission vector.
