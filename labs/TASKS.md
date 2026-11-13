# labs - monoforge (staging mount)

Rolling work log for the monoforge staging tree, in the family TASKS convention. The two PRDs here are carried byte-exact from dhaupin/monoforge (labs/, upstream commit f8e45fb):

- prd-factory.md - the factory itself (new / doctor / lock / cut verbs)
- prd-creadev-mono.md - the component-family profile's first customer

## 2026-10-26 - the mount stands up in gistory

- The staged tool is 0.9.0 UNCHANGED: the tree unpacks from `horcrux/monoforge-0.9.0-lock.tar.gz` (tarball-first landing, sha-gated ferry), because a mount and its lock archive must not be allowed to drift apart in transit.
- What the mount ADDS over the standalone repo, beyond the tool: `labs/TASKS.md` (this file) and the horcrux receipts (`horcrux/README.md`, lock archive in place). The minted provisioner stone stays owned by dhaupin/monoforge - it does not ride this mount (size class already burned the payload lane once tonight).
- Family battery lane (own CI under gistory `staging-hosts`): the self-test `node test/run.mjs` - stamp + doctor + lock refusals per PRD §5 - runs straight off the zero-dep tree; no install step needed.
- tar-move-plan.md carries the monoforge row: → dhaupin/monoforge (repo already exists with labs/ + horcrux/; move day merges the tool tree onto it and keeps those dirs intact).

## Honest limits tonight

- Doctor was NOT run against this mount itself: the doctor battery is written for STAMPED repos (factory law, FORGE-TODO slots) and the mount is a write-repo host, not a stamped output. Its own self-test exercises doctor on a freshly stamped temp tree instead.
- The templates/ blocks are the 2026-10-24 extraction and predate tonight: drift against the two struct instances is the known, watched risk (PRD §6), not something tonight changes.
- **Completion sprint (2026-10-26, pre-move).** 1) Template-layer drift repaired at the SOURCE: the docs layout shipped packstruct's nav (SPEC v1 / linter pages) and footer identity, the configs shipped packstruct's description, and a backreference artifact rode both - every stamped repo would have inherited another tool's identity. Templates now emit __SPECIES__/__DESCRIPTION__ tokens and a home+search nav (the monoforge instance adds verbs/packs); the doctor-scoped stamp-manifest law is untouched (self-test still green endpoints: bad-config refused, stray dir refused, stamp ok, unfilled doctor FAIL, refilled doctor PASS). 2) docs playbook grew from 2 pages to 4: verbs.md (usage lines match bin/forge.mjs help exactly) and packs.md (the contract + SPEC v1 link + the honest "no packs shipped yet by design"). 3) site/ landing built per the PRD inventory: slogan, verb grid, receipts-only numbers, limits, terms/privacy static pages (footer links no longer point at 404s). Frontmatter/links/style/ language gates all PASS on the new pages.
- **Ferry law, receipts (2026-10-26, evening).** The six template/doc repairs that ride INSIDE the lock archive cannot sit in the mount tree durably: the ferry ("the mount tool tree matches its lock") reassembles them from the archive on every interleaved lane run. The fixed bytes + the convergence recipe now ride `horcrux/lock-archive-overlay.patch` - a git unified diff against the archive bytes, landed through the commit lane in base64 mode (blob 44a0c4a9), in the ferry-safe horcrux slot until the upstream re-lock retires it. Move-day steps live in the patch header: apply it inside dhaupin/monoforge (needs the repo's first write grant), rerun the self-test battery, cut a fresh lock, and re-pin gistory's ferry to that lock; this patch then retires in the same commit the pin moves. Three transport teachings landed tonight, recorded for the family: (1) a single-line pure base64 carry (9.8KB prose+diff) verified blob-exact on the first try - safest text-lane shape found; (2) wrapped-row carries still scramble occasionally (one two-row hit near row 117 of a 224-row gz+b64 payload), so every carry needs its blob id checked BEFORE anything dispatches against it; (3) receipts above ~10KB belong to a runner-side emit (payload + one-shot, sha-gated from the burn file) rather than a text lane.
- **The flowforge rig pass (2026-10-27) - the structure converges with eyestruct.** The mount gets the rig shape its siblings already have: 1) The landing is the rig `web/` now (prestruct + react + inject-brand, brand as data in ssr.config.js); the 0.9.0 static `site/index.html` is retired (move day deletes upstream's `site/` and points Pages at `web/dist`). 2) The docs layer rides the rig engine: the pagefind layout, `_data/nav.yml` single nav source, the monoforge mark, the five rig gate scripts (frontmatter/links/style/fiction/jekyll), frontmatter normalized to the rig contract, and the packstruct-copy identity scrubbed from layout + configs (this mount's docs had been describing the shared /packs SPEC, not monoforge). 3) `MANIFEST.md` records the provenance rows. 4) The mount's own `.github/workflows/ test.yml` mints the standalone battery: zero-dep self-test + docs gates + language gate, no install step. All green locally before landing: `npm run check` (self-test PASS; 5 docs gates PASS; language gate PASS) and a throwaway `prestruct build` whose dist proved zero flowforge/eyestruct strings and a fully monoforge-branded prerender (3/3 pages + 404 + sitemap).
- **Transport receipts, the 2026-10-27 corollary:** hand-echoed base64 is NOT a shape in this family at any size class. Two carries of a 16.9KB gz+b64 part failed the blob gate at different scattered byte offsets (f3ff0467, then fe9cc06e vs disk 145ed142); a 1.5KB svg carried a single trailing-newline drift; a 9KB workflow yml carried ~160 bytes of composed-not-carried comment drift. The shape that finally worked: carry NO payload bytes at all - the emit ferry (`.github/workflows/ mono-web-emit.yml` one-shot) derives the 58KB package-lock.json runner-side from eyestruct's committed lock (two name swaps, sha gate 34931ee6 proven byte-identical harness-side) and re-renders the five PNG marks with the same @resvg/resvg-js 2.6.2 from the committed SVGs (five sha gates), staging copies of the unchanged engine files and docs-gate scripts from eyestruct's committed tree. Everything lands blob-gated; the ferry retires through the commit lane after receipts.

## 2026-10-28 - the third-instance blocks land in templates (monoforge#12 rider + #14)

- The doctor grows the canon checks: `dangling-canon` (a labs/.eyes/ledger.json row pointing at an artifact that never landed fails, UNSAFE_PATH refuses escape-shaped paths, LEDGER_CORRUPT refuses a ledger the gate itself would refuse) and `canon-pin` (UNSET canon pins refuse: a canon token pointing at nothing is the unfilled truth slot in the canon's uniform). Canon-free trees stay silent - the canon is opt-in, and auditing nothing is never dressed up as a pass.
- The canon skeleton extracts into templates/: `labs/.eyes/manifest.yml` (the family pin + route-matrix shape, pins seeded UNSET-edit-me per eyestruct init's convention) + `labs/.eyes/ledger.json` (an honest empty rows array). A fresh stamp carries the canon from birth: the owner fills the pins, the first look cuts the first row.
- Battery: `test/run.mjs` gains the three canon legs (dangling refused, UNSET pins refused, canon-free silent) and the refill fills the canon pins so the factory's own law stays self-consistent. `npm run check` green end to end.
- monoforge#14: `scripts/ship-from-download.cjs` copied byte-identical from eyestruct@9744c76 (zero repo imports, the Termux phone publish lane), behavior test at `test/ship-from-download.test.cjs` (21 cases green) wired into `npm test`.
- Deliberately NOT carried yet (rule-of-three pruning, the ask's own doctrine): the ratify dispatch workflow port and the reusable eye-ci-gate pack template - the monoforge template test.yml is a different stamped shape (stamped repos lint their own packs). Those two extract when the monoforge template tree carries the canon CI lane shape (tracked here; the doctor rides the canon NOW, so a stamped repo already self-audits it in `npm test`).

## 2026-10-28 - the logo adopts + the og card lane (identity fills in)

- web/public/monoforge-logo.jpg (the owner-uploaded art) adopts through `npm run icons:adopt`: potrace-traced ink + accent layers, the scripts/brand-mark.json authored seal, the full 5-face raster set (icon.svg, favicon-32, icon-192, icon-512, apple-touch-icon) into web/public, and the byte-identical docs copy at docs/icon.svg (documentation baseurl lays it out at /monoforge/icon.svg).
- web/scripts/build-og.mjs: the family og card lane (the poststruct shape, retuned to the mint library palette) - the placeholder square-art card retires for the word-mark cards: "stamp repos | doctor truth | lock bytes" eyebrow, four-line identity block, chip urls. web/public/og-image.png + docs/og-image.png are committed bytes; docs/freestruct.config.yml gains the og block so the docs page head carries the card like poststruct does.
- web/index.html: the leftover "Generate from favicon.io" template prose retires; the head carries the real-identity comment form.

## 2026-10-29 - monoforge sendoff: final prep

- The test.yml tri-pin comment sheds a stale issue pointer that pre-dated the pins it claimed to explain (the family-tool resolvers need no outside reference; the pins are their own comment above). The standalone battery shape is unchanged: npm ci rides the EXACT pins (eyestruct 1.0.0, packstruct 1.0.0, crashtest 1.1.0), then npm run check.
- This row is the tree's last change before move day: the staging-tars ferry re-cuts mounts/public/monoforge/boot/tars/monoforge-staging-git-2026-10-29.tar.gz from exactly this tree, and the receiving agent untars THAT tar into dhaupin/monoforge's staging branch (labs/ and horcrux/ stay intact per tar-move-plan.md; the boot weights have never fit).

## 2026-10-29 - move day: the tar lands on dhaupin/monoforge `staging`

The receiving side of the handoff. The tar moved from gistory to the standalone repo and the staging branch now carries the whole mount tree.

- **The tar, sha-gated before anything moved:** `mounts/public/monoforge/boot/tars/monoforge-staging-git-2026-10-29.tar.gz` from `dhaupin/gistory @ main` (the tar is unchanged by `c8d6afc`). sha256 `8b836a1095d695a1397c864a5951e0f8b5e2f14e4b0fe40308cddf177bd7dec2`, 853,705 bytes - both match Rook's handoff exactly, so the receiving bytes are the sending bytes.
- **staging branch filled from the tar.** `dhaupin/monoforge` `staging` starts at `main` (`f8e45fb`) and overlays the tar tree on top (119 tracked files: the tool, `templates/`, `web/` + `docs/` rig, the workflows, the receipts). `horcrux/` (`monoforge-0.9.0-lock.tar.gz` + the provisioner stone) is `main`-owned and the mount never carried it, so it stays intact; `labs/` merges (the tar's unwrapped PRDs + `TASKS.md` win, since they are the flowing-prose generation of the same content). The tar's synthetic `.git` (a 4-commit pre-tar snapshot) is deliberately NOT used - the repo keeps its own history.
- **The staging CI flow lands with the tree (flowforge#30 / monoforge#20).** The repo had no workflows; per the pattern the first ones carry the flow from birth: `test.yml` pushes on `main` AND `staging`; `docs.yml` watches both and its `deploy` job is gated `if: github.ref == 'refs/heads/main'` (the trap - once the integration branch is in the trigger, the trigger no longer keeps staging out of production, the guard does). The same flow is baked into `templates/.github/workflows/` so a stamped repo inherits it (issue #20's ordering warning: a template cut before this lands ships the old shape).
- **Battery green on the filled tree:** `npm ci` at the EXACT pins (eyestruct 1.0.0, packstruct 1.0.0, crashtest 1.1.0), then `npm run check` - self-test PASS (bad-config refused, stray dir refused, stamp ok, unfilled doctor FAIL, refilled doctor PASS, canon dangling/UNSET refused, canon-free silent), version-truth PASS, 21/21 ship-lane tests, 5 docs gates PASS, language gate PASS. All 7 workflow YAMLs parse (the birth-gate class: an unquoted step name dies at GitHub's parser with zero check runs).
- **`horcrux/rig-overlay.patch` is already converged.** The patch (the lock→rig convergence recipe Rook named in the handoff) does not apply against this tar - the tar already carries every byte it produced (the SHA-pinned actions, the shell-residue gate, the rig docs engine). Nothing to apply; the overlay is historical.
- **No version bump** (0.9.0 = 0.9.0). The repo's own `horcrux/` holds the real 0.9.0 lock; the mount tar is the receipts carry, not the history source.

---

### 2026-10-29 - session: the release ladder (OIDC) adopted from eyestruct

Scope: eyestruct is the fleet template (its CI works and was updated most recently). Adopt its proven release shape here; the family law is OIDC trusted publishing only. Receipts `dhaupin/eyestruct@4e2b552` (`.github/workflows/publish.yml`, `scripts/release-notes.cjs`, `scripts/verify-release.cjs`, `tests/release-verify.test.js`).

- **`.github/workflows/publish.yml` is now the 3-job ladder** (publish / release / verify) with a `verify-only` dispatch mode. It replaces the single job that authenticated with `secrets.NPM_TOKEN` - the exact violation the family law forbids. The `release.yml` duplicate is gone. The publish job keeps the OIDC publish + the 0.x gate; the release job cuts the GH release from the tag with notes extracted from the changelog; the verify job re-proves the cut against npm and the GH release. The gap the shape closes: a publish step can go green while the registry result is wrong, because nothing asserted the tarball in between.
- **`templates/.github/workflows/publish.yml` carries the same OIDC ladder** (tokenized `__NAME__`), so every stamped repo inherits the fix from birth instead of the old `secrets.NPM_TOKEN` shape. This is the propagation that matters: the template was teaching the violation.
- **`scripts/release-notes.cjs` + `scripts/verify-release.cjs`** - the two generic family scripts. Two local additions to the ladder: a named `--allow` prefix list (the factory ships template dotfiles on purpose) and a named SKIP when a package declares no `main`/`exports`/`bin`.
- **`test/release-verify.test.cjs`** runs the pack ladder OFFLINE every push (the standing receipt eyestruct carries): a real `npm pack` case and a doctored-tarball refusal by name.
- **`bin/forge.mjs --version`** answers from `package.json`, so the ladder's installed-bin probe resolves.
- **`src/doctor.mjs`** - the `publish-gate` check accepts the OIDC ladder's `case "$V" in 0.*)` version gate; and a NEW `publish-token` check (rule #3: the NPM_TOKEN bug was caught twice - in the live workflow and in the template - so it becomes a gate) fails a tree whose publish.yml references `secrets.NPM_TOKEN` or `NODE_AUTH_TOKEN`. `test/run.mjs` gains the negative case for it.
- **Verification:** `npm test` 23 pass / 0 fail (self-test now asserts the publish-token refusal). `npm run lint:docs` green. `npm run lint:language` green. `verify-release` pack ladder PASS.
- **No version bump** (0.9.0 = 0.9.0); CI/plumbing, not a released surface.

---

### 2026-10-29 - session: the frontmatter gate gets YAML teeth (rule #3)

This repo's `docs/index.md` shipped with `description: slots: generated by the factory` - an unquoted scalar carrying a colon-space. YAML reads that as a nested mapping, the frontmatter block fails to parse, and Jekyll drops the WHOLE block: no layout, no head injection, a page rendered without its own chrome. Every `check-docs-frontmatter` gate in the family (vant -> crashtest -> eyestruct -> monoforge -> flowforge) regex-scanned for `key: value` and never noticed, because a regex scan says nothing about whether YAML parses. Caught here, so it becomes a gate (house rule #3).

- **`scripts/check-docs-frontmatter.cjs`** and its **`templates/scripts/`** twin - added a dependency-free scalar check. Every frontmatter field value must be a valid plain YAML scalar: an unquoted colon-space (`: `), an unquoted ` #` comment start, a leading YAML indicator, or an unterminated quote is refused by name (file:line). The check scans EVERY top-level field, not only the REQUIRED four - the bug landed in `description`, which a variant gate that did not require that field would have scanned past. Both copies gained a `--root <dir>` override (the family gate convention, flowforge `lib/root.cjs`) so the leg can point at fixtures.
- **`test/docs-frontmatter.test.cjs`** - the gate's scalar leg, four behavior tests: a clean page passes, an unquoted colon-space in a required field is refused by name, the same in a NON-required field is refused too (the shape that shipped), and a quoted colon-space stays lawful. Wired into `npm test`.
- **Propagation:** the template copy is the stamp source, so every stamped repo inherits the fix from birth. The flowforge copy (the tool's `lib/gates/`) reaches adopters through `npm update`.
- **Verification:** `npm test` 23 -> 27 pass / 0 fail. `npm run lint:docs` green. The gate bites on a planted colon-space in the repo tree and in a freshly stamped fixture.
- **No version bump** (0.9.0 = 0.9.0); a gate fix, not a released surface.

---

### 2026-10-29 - promotion: staging -> main

Promoted `staging` to `main` (fast-forward - `main` was a strict ancestor, no direct commits to reconcile). Brings the OIDC release ladder (the `secrets.NPM_TOKEN` shape is gone from the live workflow AND the template), the `publish-token` doctor check, the frontmatter gate's YAML-scalar teeth in both copies, the two new test legs, and the owner's brand art at `web/public/monoforge-logo.jpg` with its traced 5-face icon set. Per DEPLOY.md section 3, `staging` stays even with `main` after a fast-forward promotion.

## 2026-11-03 - v1.0.0 release prep (version bump + pack distribution)

- `packs/` now rides the published tarball (`package.json` `files`, poststruct#79), so the factory's `forge-shapes` campaign is delivered to a consumer instead of being committed-but-invisible.
- 0.9.0 -> 1.0.0 across the version-truth surfaces (`package.json`, `factory.json`, the README H1) plus the `## [1.0.0] - 2026-11-03` changelog section the release job extracts.
- The release-verify ladder permits `packs/` by name alongside the template-dotfile escapes; a new `test/distribution-run.mjs` refuses a `files` list that would silently un-deliver the packs.
- Gates: `npm run check` green (docs/fiction/jekyll/language/packs + conform 8/8).

## 2026-11-03 - v1.0.0 release notes + announcements

- The release-post tree lands for both lines: `docs/discussions/announcing-v0.9.0.md` (backfilled) and `docs/discussions/announcing-v1.0.0.md` (staged), with the index table updated to name both.
- Version truth reconciled after the bump: `package-lock.json` re-derived (root version 0.9.0 -> 1.0.0, a version-only diff), and the AGENTS release prose made era-free (it still called 0.9.0 "current").
- Tarball re-verified at 1.0.0: 82 files, `/packs` present (29 entries, 28 under `/packs/public`).
- Gates: `npm run check` green (docs 12 pages, style/language/fiction/jekyll, packs conform 8/8).

## 2026-11-03 - the first OIDC cut: 1.0.0 published, and the verify allow-list bug it caught

- **The first `v1.0.0` tag fired the ladder and the OIDC publish went green** - `monoforge@1.0.0` on npm with SLSA provenance (the 0.9.0 bootstrap had no attestations; this is the first cut through Trusted Publishing).
- **The tag-push run failed in `verify`, and it was a real bug, not a flake.** The `templates: profile subdirs` refactor (a9afb1a) nested the profiles under `templates/<profile>/`, moving the shipped dotfiles to `templates/monoforge-headless/.github/` and `templates/monoforge/labs/.eyes/`. The offline `test/release-verify.test.cjs` allow-list was updated with that refactor, but the publish lane's verify job kept the flattened `templates/.github/,templates/labs/.eyes/` prefixes - which now name nothing shipped. The served-tarball forbidden scan therefore refused every template dotfile by name: `templates/monoforge/labs/.eyes/ledger.json`, `templates/monoforge-headless/.github/workflows/*.yml` (6 hits).
- **Why the standing receipt did not catch it:** the test asserts the allow-list it is GIVEN; the workflow is the other caller and its flag string is not shared with the test. The two drifted silently. The verify job now states the same three prefixes the test pins (`templates/monoforge-headless/.github/`, `templates/monoforge/labs/.eyes/`, `packs/`), and the comment names the profile layout so the next refactor has a reason to touch both.
- **Verified against the served artifact** (not a re-pack): forbidden scan 82 entries / 0 forbidden, served set == `npm pack` of the tree (82 files), exports map held, and the gh ladder's attached asset sha512 == registry integrity. `verify-only` dispatch on `main` (run 41739433518) is green end-to-end.
- **Fix commit** `18b51fe`, promoted to `staging` and `main` by fast-forward. The `v1.0.0` tag itself still points at the pre-fix commit; the tag-driven run stays red, and the corrected ladder judges the cut via the `verify-only` dispatch (the same shape crashtest's 1.2.0 cut used).
- **Post-release audit (npm vs GH bytes):** `monoforge-1.0.0.tgz` from npm and from the GH release asset are sha512-identical, and the registry integrity matches. Tarball: 82 files, `/packs` 29 entries (28 public, `forge-shapes`), README + LICENSE + bin + spec + templates present.

## 2026-11-03 - the pin guard goes family-wide (packstruct#69 back-port)

- `scripts/check-action-pins.cjs` (the "pins, never floats" guard) was a packstruct-only artifact (it landed on packstruct's `fix/sha-pin-actions`). It is now copied byte-identical into every sibling: `crashtest`, `eyestruct`, `freestruct`, `gistory`, `govstruct`, `monoforge`, `poststruct`, `prestruct` (packstruct already had it).
- Wired as `npm run lint:pins` inside each repo's publish gate (`check` / `gate` / `prepublishOnly`) and CI, and the guard's own battery (`check-action-pins.test.*`) rides `npm test`.
- Each repo's workflows were already SHA-pinned, so the guard is now mechanical here too. Receipt: `ACTION PINS: PASS (13 ref(s), all SHA-pinned)`, pin battery 8/8, full battery green.


## 2026-11-03 - living refs follow the rename (flowforge -> coreforge)

The member `flowforge` is renamed **coreforge** (govstruct PRD 16.5). The rig is renamed, not forked, so this repo's living references follow.

- **Living references updated:** comments and docs that name the rig now say `coreforge` (the shell-edition gate headers, the Jekyll layout/config headers, `Home.jsx` shell-convention notes, and the `--root` gate-convention comments).
- **Frozen receipts kept as written:** `flowforge#N` issue citations, the `dhaupin/flowforge @ <sha>` extraction receipts in `MANIFEST.md`, and `labs/` history. A citation is a receipt of what happened, not a live reference.
- **Receipts:** `npm test` green; `npm run lint:docs` all gates clean; `npm run lint:pins` PASS (13 refs, all SHA-pinned).
- **No version bump**; a reference sweep, not a released surface.

---

### 2026-11-04 - session: the docs-lane consolidation (this repo now calls THE one lane)

The family carried four docs topologies - freestruct's `docs-lane.yml`, coreforge's forked `docs-build.yml`, govstruct's copy of that fork, and five inline hand-copies - and the two reusable lanes had already drifted (ruby 3.2 vs 3.4, pagefind `latest` scrape vs npm pin). Owner call: consolidate to ONE lane, `dhaupin/freestruct`'s `docs-lane.yml`, no drift.

- `.github/workflows/docs.yml` - now a THIN caller of `dhaupin/freestruct/.github/workflows/docs-lane.yml@22bb7e9b2634d6cdd966963d9e25c7f892577276`. The runbook (Jekyll, the hardened pagefind scrape, the pinned freestruct post-build layer, the optional crashtest dogfood campaign, the Pages upload, the main-gated deploy) lives once in the lane; this file keeps only the trigger, permissions, concurrency, and this repo's input pins.
- ruby 3.3 (the Gemfile lock). No `crashtest.config.js`, so the lane's opt-in dogfood leg stays off. The factory's own battery (`npm run check`) is unchanged.
- **Receipts:** the caller parses; `uses:` resolves to the lane at the pinned SHA; no local `docs-build.yml` remains.
- **No version bump**; a workflow consolidation, not a released surface.

- **The template ships the thin caller (same pass).** `templates/monoforge-headless/.github/workflows/docs.yml` was still the pre-consolidation inline runbook (stale pagefind `latest` scrape, `npx freestruct@1.1.0`, floating `@v4`/`@v3` pins) - the drift every stamped repo would have inherited. It is now a thin caller of the same lane. Every action ref in the headless battery (`docs.yml`, `publish.yml`, `test.yml`) is SHA-pinned. `test/templates.test.cjs` gains a template-tree pin check with a planted-float fixture (the family pin guard scans root `.github/workflows` only, so the template needed its own teeth).
- **Receipts:** `npm test` 74/74 + the pin battery 8/8; `npm run check` green (pins 8 refs / 4 workflows, docs, language, forge-shapes).


- **The pin guard now scans `action.yml` (2026-11-04 sweep).** The family pin guard (`scripts/check-action-pins.cjs`) scanned only `.github/workflows/`, so a floating `uses:` in a repo-root composite Action manifest went unseen. crashtest's `action.yml` (the gate other repos add) carried `actions/setup-node@v6` and `actions/upload-artifact@v6` plus a duplicated `default:` key; both are now pinned and the key is gone. The guard scans the manifest alongside the workflows, and its battery proves the new leg bites. Sweep finding; no version bump.


- **The link check comes back on (2026-11-04 sweep).** `docs/freestruct.config.yml` carried `linkCheck: false` - a workaround parked under freestruct 1.1.0, whose strict link checker had no `basePath` awareness and false-failed every baseurl'd site on its own nav (freestruct#32). The parked comment named the lift condition: "when #32 ships in a pinned release." The family now pins freestruct 1.2.0 (the basePath-aware strip), so the toggle returns to `linkCheck: true` and the default strict link gate is back on. Receipts: `npm test` 10/10, `npm run check` green.


- **The .gitignore docs block carries the in-tree Jekyll + pagefind products (2026-11-10 sweep, coreforge#48).** Propagated from the coreforge adopter sweep (dhaupin/coreforge#52): a local `npm run docs` / `bundle exec jekyll build` + pagefind run drops its products beside the source, and the belt-and-suspenders block named only some of them. It now carries `docs/.jekyll-cache/`, `docs/.jekyll-metadata`, `docs/pagefind/`, and `docs/pagefind*`, so a local build leaves no untracked noise. No version bump.

---

### 2026-11-03 - session: breadcrumbs on (engine + this site)

Google Search Console showed the family's properties under a breadcrumbs enhancement with 0 results. Recon split the fleet: the docs sites run freestruct (auto BreadcrumbList since 1.1.0); the product sites run prestruct, whose `buildJsonLd()` is site-wide by contract and could never emit a per-route trail. prestruct gained engine-level `breadcrumb: true` (injectMeta already owns the route path); this repo turned the discovery surface on.

- `docs/freestruct.config.yml` + `templates/monoforge/docs/freestruct.config.yml` + `web/ssr.config.js` - `breadcrumb: true` (stamped repos inherit it).
- Receipts: docs config validates against the pinned engine; docs sync:check PASS where generated; prestruct's own `example/` build proves emission (BreadcrumbList on a sub-route, none on `/`).
- No version bump; a discovery-surface opt-in.

---

### 2026-11-10 - light mode by default (web + docs)

Owner directive: the family defaults to light. The product sites and docs sites shipped dark-first (a persisted `light` was the opt-in); now light is the first paint and a persisted `dark` theme is the opt-in. Shape: `<html>` pins `data-theme="light"`, the pre-paint bootstrap applies only a persisted `dark`, and the `theme-color` meta flips to the light paper. The CSS token blocks are untouched (the light block is already the second half of one set), so no palette, toggle handler, or gate changed.

- `web/index.html` - `<html data-theme="light">`; bootstrap applies a persisted `dark`; `theme-color` light (`#f5f6fa`).
- `docs/_layouts/default.html` - `<html data-theme="light">`; bootstrap inverted; `color-scheme` `light dark`.
- `templates/monoforge/docs/assets/css/style.css` - the dark-only stamp sheet becomes light (`--bg #f4f5ee`), so a stamped site is light from birth.
- `web/public/site.webmanifest` - PWA `theme_color`/`background_color` -> light (`#f5f6fa`).
- Receipts: `npm test` 11/11; `npm run check` green; docs-lint clean.

---

### 2026-11-11 - the mobile nav fits the viewport

Owner report (mobile-first): the header overflowed the phone screen and the burger - the only menu control below 640px - sat off-screen. Measured at 390px (headless probe): `document.scrollWidth` 431 vs `clientWidth` 375; the burger at x=397..431. The right cluster (GitHub icon + paint-scheme select + theme switch + burger) needs ~200px against ~144px free after the wordmark.

- **Fix (`web/src/styles.css`, the 640px block).** The decorative badge hides, the gaps tighten (`.nav-inner` 22->8px, `.nav-right` 8->4px), and the wordmark may shrink (`.brand { min-width: 0; overflow: hidden; white-space: nowrap }`). Every control is kept; the row can always fit, so the burger is always reachable.
- **Receipts.** Rebuilt dist probed at 320/360/375/390/414px - no overflow at any width, burger on-screen, all controls present. `npm run check` green.
- **Fleet.** The same defect + fix landed in all 9 sites carrying the family shell (coreforge, crashtest, govstruct, monoforge, poststruct, eyestruct, packstruct, memstruct, gamestruct); coreforge's `templates/site/` carries the same block, so a stamped repo inherits it.

### 2026-11-12 - session: the island sees the whole family (interop)

The family release-readiness pass (owner-driven) swept all eight island sites. One interop defect: the `/status` island hand-types its sibling set, and this site's set had drifted - this site listed five members, missing `gamestruct` and `memstruct`. Both members already serve the family-status@1 dialect, so this page simply could not render them.

- **The fix.** `web/src/components/FamilyStatusIsland.jsx` now lists every other family member, and `web/public/_headers` `connect-src` gains `https://gamestruct.creadev.org` and `https://memstruct.creadev.org` (the reader half - CSP governs `fetch()` before any CORS header). The reader-clause guard stays green.
- **The sibling census (receipts).** Eight sites carry the island: eyestruct, crashtest, poststruct, packstruct, govstruct, monoforge, gamestruct, memstruct. Only `memstruct` listed all eight; the rest were missing the two newest members. All eight are now aligned (self handled per each site's own convention - crashtest/govstruct/monoforge exclude self, the rest include it).
- **Battery.** `npm test` green after the change.
- **The parent receipt.** The full pass (CSP sweep = no live bug remains; `npm audit --omit=dev` = 0 vulnerabilities across all eleven packages; `npm pack --dry-run` clean; two railyard ledger drifts fixed) lives in `dhaupin/railyard` (`CHANGELOG.md` + `labs/TASKS.md`).
- **No version bump.**


### 2026-11-12 - session: the Dependabot flow lands (railyard#31)

- **Change.** Added `.github/dependabot.yml` (weekly Monday, grouped minor/patch, majors alone, plus the `github-actions` ecosystem). npm directories `/`, `/web`.
- **Shape (receipt).** `dhaupin/creadev` PR #38 (`fca49c6`); the family-wide rollout is tracked on `dhaupin/railyard#31`.
- **Guard.** railyard's `scripts/check-dependabot.cjs` (the shape) + `scripts/check-dependabot.test.cjs` (it bites), wired into railyard CI.
- **No version bump.**

### 2026-11-12 - session: the v1.1.1 cut

The family release-readiness pass (owner-driven). This repo's cut:

- **Version.** `1.1.0 -> 1.1.1` (package.json + the README H1 status copy). A patch: the family floors move to prestruct `^1.3.0`, the conformance count follows packstruct 1.1.0 to 9/9, and the docs lane tracks freestruct v1.3.0.
- **Changelog.** `## [Unreleased]` cut to `## [1.1.1] - 2026-11-12`; entries stay verbatim.
- **Announcement.** `docs/discussions/announcing-v1.1.1.md` + the index row.
- **Release.** Branch -> PR -> `staging` -> PR -> `main`, then the `v1.1.1` tag drives the OIDC ladder.

---

### 2026-11-13 - session: the /web family matrix (React 19 + Vite 8, prestruct ^1.5.0)

Unblocked by prestruct 1.5.0 (it widened its peer ceilings `react`/`react-dom` `>=18 <20`, `vite` `>=5 <9` after the example-lane bake proved React 19 + vite 8). This repo's own landing site moves onto the matrix.

- **web/package.json.** `react`/`react-dom` `-> ^19.3.1`, `vite` `-> ^8.3.7`, `@vitejs/plugin-react` `-> ^6.3.0`, `prestruct` `-> ^1.5.0`; `engines.node >=20.19` (vite 8's floor).
- **esbuild declared.** `web/scripts/build-canary.mjs` imports `esbuild` directly (bundling the engine for the workerd canary); it rode vite 5's transitive tree, which vite 8 no longer provides, so `esbuild ^0.28.2` is now a `web` devDependency.
- **web/vite.config.js.** `manualChunks` is a FUNCTION (the object form vite <=7 accepted is rejected by rolldown); `minify: 'esbuild'` dropped (esbuild unbundled, oxc default).
- **Proof.** The site bakes 8/8 pages, audit 0 failures, on the new matrix; the repo's own battery + `check` stay green.
- **No version bump** (the repo's own landing site, not the shipped surface; the crashtest `deps: web toolchain` precedent).

---

### 2026-11-13 - session: the v1.2.0 doctor pack-delivery check (poststruct#79)

- **The gap (measured).** monoforge already ships its packs (`files` carries `packs/`, pinned in `test/distribution-run.mjs`), so the factory itself was never the bug. But the doctor - the battery every STAMPED repo runs at mint time - carried only the INVERSE of the delivery law: `files-path` refuses a `files` entry that does not exist in the tree, and nothing refused a committed `packs/public/<name>/` that `files` would drop from the tarball. A repo minted by the factory could therefore commit a pack and publish a pack-less tarball, green the whole way - the exact poststruct#79 class, in the factory's own output.
- **The fix.** A new doctor check `packs-undelivered` (`E_PACKS_UNDELIVERED`): when a tree carries `packs/public/<name>/`, the doctor refuses any pack dir not delivered by `files` (neither a bare `packs/` nor an exact `packs/public/<name>`). Canon-free by construction - a tree with no `packs/public/` stays silent - so it bites only a repo that already carries packs. The code is registered in `spec/refusals.json` (the harness refuses an unregistered code). `test/harness.test.mjs` gains the bite both ways: an omitted pack refuses by name, whitelisting `packs/` clears it.
- **The cut (1.1.1 -> 1.2.0, minor).** A new doctor capability is a minor. The version-truth surfaces moved together: `package.json`, `package-lock.json`, the README H1 status copy. `## [Unreleased]` is cut to `## [1.2.0] - 2026-11-13` (the /web family-matrix entry from the previous session rides the cut; its "no version bump" closer is reworded to name the ride). Adds the v1.2.0 release post and its index row; the stale v1.1.0 index row ("staged") is corrected to "on npm".
- **No tag yet** - the tag is the owner gate (the OIDC ladder publishes on `v*`).
