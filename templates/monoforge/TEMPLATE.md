---
name: monoforge
description: >
  The full fleet scaffold - docs, gates, root docs, labs/horcrux, canary -
  chaining the CI battery.
chain:
  - monoforge-headless
---

# monoforge

The full fleet scaffold - docs, gates, root docs, labs/horcrux, canary - chaining the CI battery.

GENERATED metadata for the template layer - `stamp` resolves this profile by reading this file's `chain:`.

This profile CHAINS monoforge-headless: `monoforge new` composes the child
profile(s) first, then overlays this profile's own files (parent wins on a path
collision). The `.github/` battery therefore lives once, in the headless
profile, and both shapes inherit it - one copy, no drift.
