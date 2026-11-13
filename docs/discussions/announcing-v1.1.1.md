---
permalink: discussions/announcing-v1.1.1
layout: default
title: Announcing monoforge v1.1.1
description: monoforge v1.1.1 - the family floors move to prestruct ^1.3.0, the conformance count follows packstruct 1.1.0 to 9/9, and the site follows the family shell.
version: 1.1.1
---

# Announcing monoforge v1.1.1

monoforge is the fleet factory: one CLI that mints a whole struct-family tree from a pack - the site shell, the docs rig, the CI lanes, and the agent bindings, all cut from one spec. v1.1.1 is a patch on the 1.1.0 line - the CLI verbs, the pack schema, and the emitted tree shape are unchanged. This cut moves the family floors, tracks the packstruct conformance bump, and follows the family shell. This post ships with the v1.1.1 tag: npm has the tarball by the time you read it.

```bash
npm i -g monoforge
```

## What landed

**The family floors move to `prestruct ^1.3.0`.** The SSRF-guard security round landed in prestruct 1.3.0, and `scripts/check-prestruct-pins.cjs` now refuses any declaration below it - so every `prestruct` declaration and web lockfile moved with the floor, and the guard's own battery gains the inverse case (the old `^1.2.0` floor now fails).

**The conformance count follows packstruct 1.1.0.** packstruct 1.1.0 ships a ninth bundled conformance case (`env-claims`, packstruct#71), so the SPEC's own harness now honors the loader `9/9` where 1.0.0 honored `8/8`. `test/packs.test.mjs` and the living `docs/verbs.md` + `docs/packs.md` counts move with the pin, so the docs cannot drift from the loader. The family devDependency pins advance to the current cuts (`eyestruct` `1.0.0 -> 1.1.0`, `packstruct` `1.0.0 -> 1.1.0`, `crashtest` `1.1.0 -> 1.3.0`, all exact).

**The docs lane tracks freestruct v1.3.0.** The docs-lane caller SHA moves to freestruct v1.3.0 (`7dfb172`) with `freestruct-version` `1.2.0 -> 1.3.0`, and the headless template's docs caller plus `build-docs.sh` freestruct pin move with it.

## Also in this round

The `.gitignore` docs block carries the in-tree Jekyll and pagefind products, so a local build leaves no untracked noise. The site follows the family shell: the island lists every member, the mobile nav fits the viewport, and the light default lands.

## Links

- Repo and docs: https://github.com/dhaupin/monoforge / https://docs.creadev.org/monoforge
- Release posts: https://docs.creadev.org/monoforge/discussions/
- Changelog: https://github.com/dhaupin/monoforge/blob/main/CHANGELOG.md
- Issues: https://github.com/dhaupin/monoforge/issues
