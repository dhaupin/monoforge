---
permalink: discussions/announcing-v1.0.0/
layout: default
title: Announcing v1.0.0
description: v1.0.0 ships the packstruct SPEC v1 packs loader, a headless stamp harness with typed refusals, and a re-stamp that never clobbers host-authored files.
version: 1.0.0
---

# Announcing v1.0.0

monoforge is the struct-family factory: stamp a fleet repo from proven template blocks, doctor it for truth, lock it verifiably. v1.0.0 is the line where the factory's own packs land, the stamp loop runs headless with coded refusals, and a re-stamp leaves a host's edits alone.

## Install

```shell
npm install --save-dev monoforge
```

## What ships

- **The packs loader and the two pack lanes (monoforge#3).** `src/packs.mjs` is the packstruct SPEC v1 loader, graded by the spec's own harness (8/8). Every section-5 violation refuses in one line naming the pack: a wrong `schemaVersion`, a non-kebab name, a name that does not match its directory, a missing entry, an empty description, a bad version, and a cross-pack collision. `monoforge packs [dir]` runs the check-profile packs over a tree and fails on a new `EXPLOITED`; `monoforge loader <dir>` is the bare loader. The factory's first pack, `packs/public/forge-shapes`, carries six pure-reading checks over a stamped tree, and `package.json` gains the family lanes `lint:packs`, `conform:packs`, and `packs`, all chained into `check`.
- **A headless stamp harness with typed refusals (monoforge#23).** `monoforge harness <verb> <dir>` drives `new`, `doctor`, and `lock` in-process and returns one structured result, so a caller can run the stamp loop without a shell and read verdicts instead of prose. Every refusal is `{ code, slot, detail }` and every code is registered in `spec/refusals.json`; the harness refuses to emit a code it has not registered.
- **A re-stamp never clobbers a host-authored artifact (monoforge#4).** `stamp` records the sha256 of every file it emits in the receipt's `hashes` map. Re-running `monoforge new` over a tree carrying our receipt overlays only the paths still matching the factory's last emission; a template path the host has edited since is skipped by name and left byte for byte intact.
- **The storage seam (monoforge#27).** `stamp` takes a storage adapter, so the truth machinery runs where `node:fs` does not exist. The engine core imports no `node:*`, and the `monoforge/workers` export is the workerd-safe surface.

## The release ladder

0.x is the manual npm ladder; `publish.yml` refuses 0.x versions at the gate, and 1.0.0 rides npm Trusted Publishing (`id-token: write`). The full runbook lives in DEPLOY.md in the repository.

## Where to go next

- [Verbs](/monoforge/verbs) - every command and its playbook
- [Packs](/monoforge/packs) - the pack lint lane
- The repo with the full truth battery is [dhaupin/monoforge](https://github.com/dhaupin/monoforge)
