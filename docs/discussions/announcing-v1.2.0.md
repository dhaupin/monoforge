---
permalink: discussions/announcing-v1.2.0/
layout: default
title: Announcing monoforge v1.2.0
description: monoforge v1.2.0 - the doctor refuses a committed pack the package.json files whitelist would not deliver, so a minted repo cannot silently ship a pack-less tarball.
version: 1.2.0
---

# Announcing monoforge v1.2.0

monoforge is the fleet factory: it stamps new repos from proven blocks and doctors them for truth at mint time. v1.2.0 is a minor on the 1.1.x line and grows one check on the doctor battery - the gate every stamped repo runs.

## The gap

The factory mints repos that carry crashtest packs, and the family law is that a committed pack RIDES the published tarball: a consumer arms the pack campaign by an exact npm pin, so a pack that does not ship cannot be armed. npm honours `package.json` `files`, so a pack tree excluded there is invisible to `npm i <pkg>` even though it is committed and green. The doctor already had the INVERSE check (`files-path`: a `files` entry must exist in the tree), and monoforge itself already ships `packs/` - pinned in `test/distribution-run.mjs`. What was missing is the check that catches a *minted* repo, one that commits `packs/public/<name>/` but never adds `packs/` to `files`.

## The check

**`packs-undelivered` (`E_PACKS_UNDELIVERED`).** When a tree carries `packs/public/<name>/`, the doctor refuses any pack dir that `package.json` `files` would not deliver - neither a bare `packs/` nor an exact `packs/public/<name>`. The finding names the pack dir, so the fix is one line. Canon-free by construction: a tree with no `packs/public/` stays silent, so the check only bites a repo that already chose to carry packs, never a plain library.

`test/harness.test.mjs` pins the bite both ways: an omitted pack refuses by name, and whitelisting `packs/` clears it. The code is registered in `spec/refusals.json`, so the harness refuses to emit an unregistered refusal.

## Links

- Repo: https://github.com/dhaupin/monoforge
- npm: https://www.npmjs.com/package/monoforge
- Changelog: https://github.com/dhaupin/monoforge/blob/main/CHANGELOG.md
