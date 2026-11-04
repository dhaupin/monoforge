---
version: '1.0'
permalink: packs/
layout: default
title: Packs
description: How monoforge stamped templates and the /packs SPEC relate - template blocks are extracted, not packs; the SPEC governs what a stamped repo may adopt.
nav_order: 3
---

# Packs

monoforge now carries one pack of its own, `packs/public/forge-shapes`, and the loader the family's spec grades. The factory's *file-copying* stays in `templates/` (a pack can only read a tree, never write one); its *portable judgment* lives in a pack. This page is the contract the family agreed on, now backed by a working loader and a working pack.

## The two pack shapes

**Check-profile packs** (the audits). The doctor's truth battery stays in monoforge; organization- or client-voice checks load from `packs/public/<name>/` entries exporting `{ checks: [...] }` per the shared [packstruct SPEC v1](https://github.com/dhaupin/packstruct/blob/main/spec/SPEC.md)
- the same manifest grammar (kebab name, schemaVersion 1, relative entry) and the same `run(ctx)` / module contract the other family legs already run through `packstruct lint --deep` and `audit-conformance`.

**Scenario-profile packs** (the adversarial tests). A stamp's or a cut's acceptance surface gets its own crashtest lane - attacking generated output the way `packstruct-lint-shapes` attacks the linter: in-process, verdict records, refuse-never-fail. Stub manifests, fake entries, and falsely green truth slots are the threat class; the doctor's stamp-manifest scoping exists because of exactly this class.

## The fitting law

Packs are **opt-in by construction**. A pack applies when the host's own config enumerates it - monoforge never reads a pack because it exists on disk, and a pack that does not fit the stamped shape is *refused*, never silently bent. That is the whole distribution story for now: local paths, explicit opt-in, honest refusals. No registry, no remote pack sources, no signing - each waits for evidence, not enthusiasm.

## The loader and the lanes

`src/packs.mjs` is the loader the shared SPEC's own harness grades:

```bash
npx packstruct audit-conformance . --loader "node src/packs.mjs {packs}"
```

It honors all 8/8 conformance cases. Every SPEC section-5 violation refuses instantly, one line, naming the pack - a wrong `schemaVersion`, a non-kebab name, a name/dir mismatch, a missing entry, an empty description, a bad version, or a cross-pack collision. Exit 0 clean / 1 violations / 2 usage.

Three family lanes ride `npm run check`:

```bash
npm run lint:packs     # packstruct lint packs --deep
npm run conform:packs  # the loader harness above
npm run packs          # run the packs over a tree (fails on a new EXPLOITED)
```

## Where packs already run in the family

The two struct siblings carry working pack batteries today and the factory's mount inherits the same SPEC: poststruct (`packs/public/ eyes-reference`) and eyestruct (`eye-shapes`, `eye-text-leg`, `eye-ci-gate`) both lint and conformance-check through packstruct 1.0.0, exact-pinned in their own locks.

<div class="crosslinks">
<p><strong>More in these docs:</strong>
<a href="{{ '/' | relative_url }}">home</a> ·
<a href="{{ '/verbs/' | relative_url }}">verbs</a></p>
</div>
