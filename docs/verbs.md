---
version: '1.0'
permalink: verbs/
layout: default
title: Verbs
description: Every monoforge command is one short process - stamp, doctor, cut, lock, the packs campaign, and the pack-lint lane. Four factory verbs plus the pack lanes, zero dependencies; the doctor refuses to ship generated green.
nav_order: 2
---

# Verbs

Four factory verbs, zero dependencies, plus the opt-in lint-packs
passthrough. `monoforge help` prints all of it; this page is the playbook
for each verb and the config that feeds it.

## new - stamp a fleet repo

```bash
monoforge new <dir>
```

Stamps a repo from the proven template blocks into `<dir>`, driven by a
`factory.json` in `<dir>`. Inputs are validated hard before anything is
written: a half-specified factory is refused, never half-created, and a
directory holding anything besides `factory.json` is refused - never
half-merged.

Re-running `new` over a directory this factory already stamped (it carries the
`.monoforge-stamp.json` receipt) is a **re-stamp**, not a refusal: it overlays
only the template paths still matching the factory's last emission. A path the
host has edited since - a `crashtest.config.js`, an `AGENTS.md` house-rules
edit, a CI lane - is skipped by name and left byte-for-byte intact, so
convergence never eats host state. A receipt whose recorded `name` differs from
the config is refused (identity drift is not a re-stamp).

```json
{
  "name": "kebab-name",
  "species": "the one-liner kind",
  "pitch": "the one-line pitch",
  "description": "the long form",
  "siteDomain": "https://x.creadev.org",
  "docsPath": "docs.creadev.org/x   (optional, defaults to this)",
  "version": "0.9.0                 (optional)"
}
```

Every `__TOKEN__` in the template layer maps to a factory config key
(`__NAME__`, `__SPECIES__`, `__PITCH__`, `__DESCRIPTION__`,
`__VERSION__`, `__SITE_URL__`, `__DOCS_URL__`, plus the stamp
attribution tokens). The stamp writes `.monoforge-stamp.json` - the
record of what actually emitted - and the doctor's truth-slot scan is
scoped to exactly those files, so prose that documents the FORGE-TODO
convention never self-flags.

## doctor - the truth battery

```bash
monoforge doctor [dir]
```

Runs the truth battery against a stamped tree. Findings print as
`FAIL/WARN <id>: <message>` and end with the count line; exit 0 is
PASS only when nothing failed. The battery refuses: unfilled
`FORGE-TODO` slots (scoped to the stamp manifest), bad package.json
paths, a publish workflow without its 0.x refusal, and broken docs
gates. **Generated green is never shipped** - a doctor that warns into
green would be the politeness theater the fleet refuses.

## cut - the component-family workspace

```bash
monoforge cut [dir]
```

Cuts a component workspace from a declared source tree
(`cutlist.json` + `factory.json` required, both in `[dir]`). The cut
records its source revision in the receipts, declares its shortfalls
instead of stubbing them, and stamps per-component packages with their
own files whitelists. See the
[component-family PRD](https://github.com/dhaupin/monoforge/blob/main/labs/prd-creadev-mono.md)
for the cut law and generation ordering.

## lock - archive with a checksum

```bash
monoforge lock [dir]
```

Doctor first, then doctor-gated archive: a `sha256` record plus the
archive file land together. A failing doctor refuses the lock - the
archive is only ever a receipt for a green tree.

## lint-packs - the pack lint lane

```bash
monoforge lint-packs [--deep] [--json] [--against <lib>] [dir]
```

The packstruct passthrough (crashtest's issue #32 shape, eyestruct's
proven port): runs `packstruct lint` over the factory's own install -
`node_modules/.bin` first, then PATH - never downloading or bundling one.
The exit code IS the verdict: 0 clean, 1 findings, 2 setup refusal. With
the factory's own packs landed (monoforge#3), packstruct rides `npm ci` at
its EXACT pin and this verb lints them; if packstruct is absent it is the
loud setup refusal naming the exact fix (`npm i -D packstruct@<exact>`) - a
never-working requested lane is a broken config, never a silent skip.
Default dir: the packs ROOT; an explicit dir passes through untouched.

## packs - the check-profile pack campaign

```bash
monoforge packs [dir]
monoforge loader <dir>
```

`packs` loads every pack under `packs/public` through `src/packs.mjs`, arms
each with a read-only view of `dir` (default: the pack's own clean fixture,
a representative stamped tree), runs it, and prints the verdict rows. A new
`EXPLOITED` verdict fails the lane; `BOUNDED` never reads as green but does
not fail it. `loader` is the bare SPEC loader: exit 0 clean, 1 violations,
2 usage, with every refusal naming the pack. `src/packs.mjs` is graded by
the SPEC's own harness - `packstruct audit-conformance . --loader "node
src/packs.mjs {packs}"` honors it 8/8.

## The storage seam - stamp from a worker, or from memory

## The storage seam - stamp from a worker, or from memory

`monoforge new` is not a CLI-only path: the stamp engine runs against a
**storage adapter**, so the same truth machinery runs where `node:fs`
does not exist. Two adapters ship:

- `nodeFsAdapter` - real `node:fs`. This is the default under Node, so the
  CLI is unchanged.
- `memoryFs(seed)` - an in-memory tree. Seed it with
  `{ '/path/file': 'contents' }` and the engine walks, copies, fills, and
  writes entirely in memory.

```js
import { stamp, memoryFs } from 'monoforge/workers' // or 'monoforge' under Node

const fs = memoryFs({
  '/tpl/templates/monoforge/README.md': '# __NAME__\n',
  '/out/factory.json': JSON.stringify(factory),
})
await stamp('/out', { fs, root: '/tpl' })
```

The engine core imports no `node:*` at all (path helpers live in
`src/paths.mjs`), so a bundle built for workerd carries no `node:fs` - the
`/api/stamp-canary` Pages Function is the living proof, stamping a template
tree in memory at the edge and reporting what it produced. A consumer that
only needs the engine + adapters imports `monoforge/workers`, which omits
`doctor` and `lock` (they shell out to git and read disk).

## The headless harness - the same verbs, structured

The CLI is one face of the factory; the harness is the other. `monoforge
harness <verb> <dir>` drives `new`, `doctor`, or `lock` in-process and prints
one structured result, so another tool (railyard's `railyard_stamp`) can run
the stamp loop without a shell and read verdicts instead of prose:

```json
{
  "verb": "lock",
  "ok": true,
  "verdicts": [
    { "gate": "monoforge doctor", "ok": true, "counts": { "fail": 0, "warn": 0 } },
    { "gate": "monoforge lock", "ok": true, "counts": { "fail": 0, "warn": 0 } }
  ],
  "refusals": [],
  "grant": { "kind": "github-app", "scope": "dhaupin/probe", "spent": true },
  "receipt": { "gate": "monoforge lock", "archive": "probe-0.9.0-lock.tar.gz", "sha": "..." }
}
```

Every refusal is **typed**: `{ code, slot, detail }`. The codes are
registered in `spec/refusals.json` (the shared govstruct vocabulary, G10),
and the harness refuses to emit a code it has not registered - a typo cannot
become a logged refusal. A failing doctor returns its fails as refusals
(`E_TRUTH_SLOT` naming the slot, `E_BIN_PATH` naming the entry, and so on);
a refused lock is `E_LOCK_REFUSED`.

The optional `--grant kind:scope` context is echoed back (kind, scope, and
`spent: true`) so a caller's audit ledger can record the spend (G5/G14).
The forge never reads the credential itself - the grant is opaque.

```bash
monoforge harness lock ./my-repo --grant github-app:dhaupin/my-repo
```

In-process only, no sockets: the family law. The module surface is the same
(`import { runHarness } from 'monoforge'`).

## The release ladder

0.9.x is manual npm publish; 1.0.0 flips to OIDC trusted publishing
(the stamped `publish.yml` refuses 0.x versions so the flip is
deliberate, never accidental). The runbook lives in DEPLOY.md.

<div class="crosslinks">
<p><strong>More in these docs:</strong>
<a href="{{ '/' | relative_url }}">home</a> ·
<a href="{{ '/packs/' | relative_url }}">packs</a></p>
</div>
