---
version: '1.0'
permalink: ci/
layout: default
title: CI
description: The battery a stamped monoforge repo should compose, the docs build lane, and the mount-side ferry receipts (retired 2026-11-02).
nav_order: 5
---

# CI

## The battery (gistory#14 mount spec)

One job, four independent legs, any of which can land first:

```yaml
- run: npm ci                    # hermetic, exact-pinned devDeps
- run: npm test                  # the node:test spine
- run: npm run check             # lint + packs + packstruct --deep
- run: npx crashtest run         # baseline-gated adversarial lane (labs/crashledger.json)
```

Both lanes are deterministic end to end: fixed seeds, fixed batches, committed baselines. A fork cannot walk the seed.

## The docs lane (`.github/workflows/docs.yml`)

The six docs-truth gates run first (`scripts/check-docs-*.cjs` plus the fiction-signature and Liquid-filter checkers), then the build itself:

```bash
bundle exec jekyll build               # ruby/jekyll half (docs/)
npx --yes freestruct@1.1.0 --strict    # post-render SEO layer, fails closed
./pagefind --site _site                # index LAST, over the final injected html
```

The engine refuses an SSG source tree (point it at the built output, not the checkout), unknown flags fail loudly (v1.1.0 contract), and pagefind indexes over the freestruct-injected html, never the bare build. Pagefind rides the standalone musl tarball (the `pagefind` npm package's platform binary and its npx fallback both died in CI); `bundle exec` is the only Jekyll invocation that resolves the Gemfile in `docs/`.

## Ferry receipts (retired 2026-11-02)

The mount-side ferry retired with gistory's forge role (dhaupin/gistory#37): monoforge owns its tree and battery now, and the factory role moved to **railyard**. The four receipts the ferry used to run are still the right smoke test before pushing a UI or template change - fetch the sha-gated lock archive, converge the delta, self-test the unpacked tool (`node test/run.mjs`
- the stamp/doctor/lock-refusal battery), and gate the re-derived overlay with a second fresh unpack. Run them locally; no gistory lane carries them.
