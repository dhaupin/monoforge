---
name: monoforge-headless
description: >
  CI only - the .github/ battery (test, docs, publish), no scaffold.
chain: []
---

# monoforge-headless

CI only - the .github/ battery (test, docs, publish), no scaffold.

GENERATED metadata for the template layer - `stamp` resolves this profile by reading this file's `chain:`.

This profile is a leaf: it carries its files and chains nothing. A repo that
brings its own docs tree still inherits the gates, the docs lane, and the
release ladder by stamping this profile alone (`factory.json.profile =
"monoforge-headless"`).
