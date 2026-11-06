---
permalink: discussions/announcing-v1.1.0
layout: default
title: Announcing v1.1.0
description: v1.1.0 fixes a stamp that could re-insert the token it replaced, folds the docs lane into the family's one reusable workflow, and turns the link check back on.
version: 1.1.0
---

# Announcing v1.1.0

monoforge is the struct-family factory: stamp a fleet repo from proven template blocks, doctor it for truth, lock it verifiably. v1.1.0 is the stamp-integrity round since v1.0.0 - a real corruption bug in the `stamp` verb, the docs lane folded into the family's one reusable workflow, and the link check restored.

## What landed

**A factory value carrying `$`-form replacement syntax no longer corrupts the stamp.** `stamp` filled tokens with `String.prototype.replaceAll(tok, val)`, and a STRING `val` treats `$&`, `` $` ``, and `$'` as replacement patterns. A pitch or description carrying `$&` therefore re-inserted the matched token (`"Save $& now"` stamped `"Save __PITCH__ now"`), and a `` $` `` spliced the preceding text - silently shipping the token back into every stamped file. The doctor's truth-slot check could not see it, because the token WAS gone from the source and re-created at replace time. The free-text slots (`species`, `pitch`, `description`) are unvalidated, so this was reachable from any authored `factory.json`. Replacement now uses a FUNCTION replacer (`() => val`), so the value lands verbatim - the never-corrupt rule the hook layer already enforces, and the shape `coreforge`'s `bin/coreforge.mjs` already uses. `test/run.mjs` pins the law (`$&`, `` $` ``, `$'` land verbatim; the token is never re-inserted) and it bites both ways.

**The docs lane is one lane, and the template stamps it.** The family built docs from four topologies and the reusable lanes had drifted. The lane is now one canonical reusable workflow in `dhaupin/freestruct`, and this repo is a thin caller of it. The template now ships the thin caller too: `templates/monoforge-headless/.github/workflows/docs.yml` was still the pre-consolidation inline runbook - a stale pagefind `latest` scrape, a floating engine pin, and floating action refs - so every repo this factory stamps would have been born carrying the drift the consolidation just cured. It is now a thin caller of the same lane, with every action ref SHA-pinned, and a new test pins the template tree with a planted-float fixture proving it bites.

**The link check comes back on.** `docs/freestruct.config.yml` carried `linkCheck: false` - a workaround parked under freestruct 1.1.0, whose strict link checker had no `basePath` awareness and false-failed every baseurl'd site on its own nav. The comment named the lift condition ("when #32 ships in a pinned release"), and the family now pins freestruct 1.2.0, which carries the basePath-aware strip. The default strict link gate is back on: broken internal links fail the build again.

**The release ladder's `verify` job waits for `release`.** `verify` declares `needs: [publish, release]` (was a bare `needs: publish`), closing a race where it ran CONCURRENTLY with the release mint: on a fresh cut the registry read replicas had not settled and the tarball was not yet attached, so a publish that in fact succeeded failed red and needed a manual re-run (first seen on the packstruct 1.1.0 cut). The release-attach poll widened 120s -> 300s and the registry poll 120s -> 360s, and the release-lane test pins the dependency so a regression fails by name.

## Quality layer

`npm test` and `npm run check` are green at 1.1.0, with the stamp-law pin and the template-float fixture both proven to bite.

## Links

- Repo and docs: https://github.com/dhaupin/monoforge / https://docs.creadev.org/monoforge
- Changelog: https://github.com/dhaupin/monoforge/blob/main/CHANGELOG.md
- Issues: https://github.com/dhaupin/monoforge/issues
