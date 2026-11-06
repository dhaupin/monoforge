# Changelog

All notable changes to monoforge will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-11-06

The stamp-integrity round since v1.0.0. The factory's `stamp` verb no longer corrupts a stamped file when a factory value carries `$`-form replacement syntax, the docs lane folded into the family's one reusable workflow (and the headless template now stamps the thin caller), and the link check came back on. Every fix is battery-pinned.

### Fixed

- **A factory value carrying `$`-form replacement syntax no longer corrupts the stamp.** `stamp` filled tokens with `String.prototype.replaceAll(tok, val)`, and a STRING `val` treats `$&`, `` $` ``, and `$'` as replacement patterns. A pitch or description carrying `$&` therefore re-inserted the matched token (`"Save $& now"` stamped `"Save __PITCH__ now"`) and a `` $` `` spliced the preceding text - silently shipping the token back into every stamped file, and the doctor's truth-slot check could not see it (the token WAS gone from the source, re-created at replace time). The free-text slots (`species`, `pitch`, `description`) are unvalidated, so this is reachable from any authored `factory.json`. Replacement now uses a FUNCTION replacer (`() => val`), so the value lands verbatim - the never-corrupt rule the hook layer (`prestruct` `example/scripts/hooks.js`) already enforces, and the shape `coreforge` `bin/coreforge.mjs` already uses (`out.split(tok).join(val)`, which does not read `$`). `test/run.mjs` pins the law (`$&`, `` $` ``, `$'` land verbatim; the token is never re-inserted) and it bites both ways.

### The link check comes back on (2026-11-04)

`docs/freestruct.config.yml` carried `linkCheck: false` - a workaround parked under freestruct 1.1.0, whose strict link checker had no `basePath` awareness and so false-failed every baseurl'd site on its own nav (dhaupin/freestruct#32). The comment said exactly when to lift it: "when #32 ships in a pinned release." The family now pins freestruct **1.2.0**, which carries the basePath-aware strip, so the workaround is retired and the default strict link gate is back on - broken internal links fail the build again.

- **`docs/freestruct.config.yml`** - `linkCheck: false` -> `linkCheck: true`, with the suspension note replaced by the re-enable rationale.
- **Receipts:** `npm test` 10 pass / 0 fail; `npm run check` green.
- **No version bump**; a config toggle, not a released surface.

### The docs-lane consolidation (2026-11-04)

The family built docs from four topologies; the two reusable lanes had drifted (ruby 3.2 vs 3.4, pagefind `latest` scrape vs npm pin). The docs lane is now ONE canonical reusable workflow in `dhaupin/freestruct`, and this repo is a thin caller of it.

- `.github/workflows/docs.yml` calls `dhaupin/freestruct/.github/workflows/docs-lane.yml@22bb7e9b2634d6cdd966963d9e25c7f892577276`, keeping only the trigger, permissions, concurrency, and this repo pins.
- ruby 3.3 (the Gemfile lock); no `crashtest.config.js`, so the lane's opt-in dogfood leg stays off.
- **The template now ships the thin caller too.** `templates/monoforge-headless/.github/workflows/docs.yml` was still the pre-consolidation inline runbook - a stale pagefind `latest` scrape, `npx freestruct@1.1.0`, and floating `@v4`/`@v3` action pins - so every repo this factory stamps would have been born carrying the drift the consolidation just cured. It is now a thin caller of the same lane, and every action ref in the headless battery (`docs.yml`, `publish.yml`, `test.yml`) is SHA-pinned. A new test in `test/templates.test.cjs` pins the template tree (the family pin guard scans root `.github/workflows` only), with a planted-float fixture proving it bites.
- No version bump; a workflow consolidation, not a released surface.

### Changed

- **The rename (govstruct PRD 16.5): `flowforge` -> `coreforge`.** Living references to the rig this repo carries now name `coreforge` (comments and docs); the rig itself is renamed, not forked, so nothing behavioral moves. Frozen receipts keep saying `flowforge` (citations like `flowforge#N`, `labs/`, and the rig extraction SHAs in `MANIFEST.md`), because that is what happened.

### Security

- **Pins, never floats (packstruct#69).** Every GitHub Action `uses:` in `.github/workflows/` names a 40-hex commit SHA (tag kept in the trailing comment), never a floating `@v4`/`@v1`. A new guard, `scripts/check-action-pins.cjs`, refuses any floating ref, a branch, or a `docker://` image; it runs as `npm run lint:pins` inside `npm run check` (the `prepublishOnly` gate) and CI, and its own battery (`test/check-action-pins.test.cjs`) proves it bites both ways.

## [1.0.0] - 2026-11-03

### Fixed

- **The expected-set probe no longer parses `npm pack --dry-run --json`.** The phone's npm answers that probe with empty stdout even under `--loglevel=error`, so the ladder's `JSON.parse` failed and read as a capability failure on a clean tree (the `always-auth` warning was a red herring on stderr). The ladder now derives the expected set from a REAL `npm pack` of the checkout, listed by the same `tarList` the served tarball already goes through - the code path the forbidden scan proved works on the phone.

- **The staged publish `.npmrc` no longer writes the deprecated `always-auth` line.** npm >=9 warns `Unknown project config "always-auth"` on it, and that warning reaches the child processes the `prepublishOnly` gate spawns. The staged file is now exactly one line (the `${NPM_TOKEN}` expansion).

### Added

- **The packs loader and the two pack lanes (monoforge#3).** `src/packs.mjs` is the packstruct SPEC v1 loader, graded by the spec's own harness (`packstruct audit-conformance . --loader "node src/packs.mjs {packs}"` honors it 8/8). Every section-5 violation refuses instantly, in one line, naming the pack: wrong `schemaVersion`, non-kebab name, name/dir mismatch, missing entry, empty description, bad version, and a cross-pack collision. A new `monoforge packs [dir]` verb runs the check-profile packs over a tree (fails on a new `EXPLOITED`), and `monoforge loader <dir>` is the bare loader. The factory's first pack, `packs/public/forge-shapes`, carries six pure-reading checks over a stamped tree (receipt present, receipted files exist, no `FORGE-TODO`, no raw `__TOKEN__`, package paths resolve, publish gate refuses 0.x) with `test/fixtures/` proving every verdict both ways. `package.json` gains the family lanes `lint:packs` (`packstruct lint packs --deep`), `conform:packs`, and `packs`, all three chained into `check`.

- **A headless stamp harness with typed refusals (monoforge#23).** `monoforge harness <verb> <dir>` (module: `runHarness` / `run` from `monoforge`) drives `new`, `doctor`, and `lock` in-process and returns one structured result, `{ verb, ok, verdicts, refusals, grant, receipt }`, so railyard's door can run the stamp loop without a shell and read verdicts instead of prose. Every refusal is `{ code, slot, detail }` and every code is registered in the new `spec/refusals.json` (the shared govstruct vocabulary, G10); the harness refuses to emit a code it has not registered, so a typo cannot become a logged refusal. The doctor's fails now carry their code and slot (`E_TRUTH_SLOT` naming the slot, `E_BIN_PATH` naming the entry, and so on), the stamp and lock refusals are coded too, and an optional `--grant kind:scope` is echoed back (kind, scope, `spent: true`) for the caller's audit ledger (G5/G14) without the forge ever seeing the credential. In-process only, no sockets.

- **A re-stamp no longer clobbers a stamped repo's host-authored artifacts (monoforge#4).** `stamp` records the sha256 of every file it emits in the receipt's new `hashes` map. Re-running `monoforge new` over a tree carrying our receipt now overlays only the paths still matching the factory's last emission; a template path the host has edited since - a `crashtest.config.js`, an `AGENTS.md` house-rules edit, a CI lane - is **skipped by name** (reported in the result's `skipped` list) and left byte-for-byte intact. The receipt's `files` array keeps the doctor's truth-slot scope, and a skipped path keeps the factory's last emission hash so it stays host-owned across every future re-stamp. The old "non-empty dir refused" law is unchanged for a directory that is not ours; a name mismatch on our own receipt is refused too.

### Changed

- **Changelog + release-notes standardized to the family shape.** `CHANGELOG.md` is now Keep-a-Changelog end to end (a `## [Unreleased]` block over `## [version] - date` sections) and `scripts/release-notes.cjs` is the family's single superset extractor: it reads the KAC heading, still reads the older bare (`## 1.2.0`) and v-prefixed (`## v1.2.0`) forms, closes the version token so `## [1.2.0]` never matches a `## [1.2.0-rc.1]`, and refuses a version with no section by name. One extractor across the family means one release-body shape everywhere.

### Fixed

- **The release ladder no longer races registry propagation, nor false-flags a branch-name `target_commitish`** - both surfaced by the crashtest 1.2.0 live cut. `scripts/verify-release.cjs` polls `dist-tags.latest` **and** the version entry through npm's post-publish propagation window instead of reading once (the first read saw the old `latest`), and the `release` job retries `npm pack <pkg>@<ver>` the same way (it read `ETARGET: no matching version` seconds after publish). The release check now accepts GitHub's `target_commitish` default-branch name and treats only a 40-hex SHA as a commit claim (a branch name is not drift; the tag is the identity). Two pins in the release-verify leg hold both fixes.

### Changed
- The `release` job now attaches the **served** tarball (`npm pack monoforge@<version>`) to the GH release, and the `verify` job asserts its sha512 equals the registry integrity metadata (`scripts/verify-release.cjs --gh --asset`). The GH release and the npm artifact are the same bytes, so a consumer downloads one artifact either way. `scripts/verify-release.cjs` moves to the family copy that carries the `--asset` leg.
- **Docs no longer describe a gistory mount/ferry (monoforge#36).** gistory retired its forge role 2026-11-02 (dhaupin/gistory#37): the staging mounts, the registry, and the ferry workflows are gone, and the factory role moved to **railyard**. `docs/ci.md` and `docs/playbooks.md` now mark the mount-side ferry retired and keep the four receipts as the local smoke test; the battery section (gistory#14 spec) is unchanged - it is monoforge's own `test.yml` now.

### Fixed
- **The walk-exit rule now rides the template AGENTS.md, so a stamped repo inherits it (gistory#24).** The rule (a manual walk is not done until nothing it found is uncommissioned) was in the repo AGENTS.md and the template DEPLOY.md, but the template AGENTS.md - the file a stamped repo actually gets - did not carry it, so DEPLOY.md's "the walk-exit rule in AGENTS.md" pointed at nothing in a fresh tree. The template AGENTS.md now carries the rule with the eyestruct@70dfbea worked example, matching the repo copy.

### Added
- **The storage seam: the stamp engine runs from a worker, or from memory (monoforge#27).** `stamp` now takes a storage adapter (`{ fs }`), so the same truth machinery runs where `node:fs` does not exist. `nodeFsAdapter` (real `node:fs`) stays the default under Node, so the CLI is unchanged; `memoryFs(seed)` runs a whole stamp - config read, template walk, token fill, `gitignore.tmpl` rename, manifest write - with no disk. The engine core imports no `node:*` at all (path helpers moved to `src/paths.mjs`), and the new `monoforge/workers` export is the workerd-safe surface (`stamp` + adapters; no `doctor`/`lock`, which shell out to git). The `/api/stamp-canary` Pages Function is the living proof: it stamps an in-memory template tree at the edge and reports what the engine produced, and `test/workers-compat.test.mjs` runs it under Node with `WebSocketPair` defined, exactly as workerd would. This is the upstream seam that retires the coreforge rig's vendored engine fork. The bundle/Function test lanes need the esbuild toolchain, so they are a NAMED skip in the root battery and covered by the Cloudflare Pages build; an always-on source-graph walk proves the no-`node:*` claim without it.
- **The trifecta audit, folded into the release runbook (monoforge#10).** `DEPLOY.md` (and its `templates/monoforge/` twin, so a stamped repo inherits it) now carries the four-artifact walk the family runs before a tag: README usage vs the real dispatch, AGENTS.md's lane/receipt inventory, the deploy-lane env against README/DEPLOY claims, and CHANGELOG keep-a-changelog discipline. The walk-exit rule applies: every catch commissions in the same session.
- The two template doc gates the repo ran but the headless profile did not: `templates/monoforge/scripts/check-fiction-signatures.cjs` and `check-jekyll-filters.cjs`, wired into `templates/monoforge-headless/.github/workflows/docs.yml`, so a stamped repo's docs lane runs all six gates, not four.

- the Terms + Privacy pages carry a footer crosslink naming the sibling sites that ship the same plain-language legal form (crashtest, eyestruct, poststruct, packstruct), so the family parity is visible to a reader who arrives from any member (crashtest#45, the family tracking issue).

- `src/templates.mjs` - the template registry + chain resolver (the coreforge shape). Profiles live in subdirs (`templates/<profile>/`) and COMPOSE via a `chain:` list in each profile's `TEMPLATE.md`: `monoforge` chains `monoforge-headless`, so the `.github/` battery lives once in the headless profile and both shapes inherit it - one copy, no drift. Resolution is depth-first, children first, parent wins on a path collision; a cycle or an unknown profile refuses by name. `--list` / `--resolve NAME` for eyeballing and tests.
- `test/templates.test.cjs` - the resolver both ways: the declared chain, the composed set carries the headless battery once, the manifest never leaks into the payload, a parent wins a path collision, a cycle refuses, an unknown profile refuses. Wired into `npm test`.

- **The why / what / about pages, both surfaces.** The landing gains three routes (`/why`, `/what`, `/about`) in the nav vocabulary and `web/ssr.config.js`, each a real page in the family voice: the copy-and-hope problem and the "generated green is never shipped" thesis; the four factory verbs and the truth battery; who builds it and the MIT provenance. The docs tree grows the matching `docs/why.md`, `docs/what.md`, `docs/about.md`, reachable from the docs nav, and the docs layout gains the shared `.crosslinks` block style. This closes the family-wide gap where no member carried a supporting trio.

- **The docs legal crosslinks.** The docs footer now links this project's own terms + privacy surfaces (`https://monoforge.creadev.org/terms`, `/privacy`), matching the packstruct docs rig - the landing's terms/privacy were reachable from the header/footer, the docs side had no pointer to them.
- **The `/packs` surface.** The landing gains a `/packs` route (nav + `web/ssr.config.js` route + sitemap) that reads the extension surface the way eyestruct's does: a hero, the two pack shapes, the "where packs run today" table (packstruct, poststruct, eyestruct, govstruct, crashtest carried; monoforge queued per the rule of three), and the fitting law, crosslinking the family SPEC ([packstruct](https://github.com/dhaupin/packstruct)). The docs `packs.md` page already carried the contract; this is the product-site face.
- **The family status page (family-status@1).** monoforge now serves the family's shared status contract: `web/scripts/build-status.mjs` generates `web/public/status.json` on every web build from its own truth battery (`src/doctor.mjs`, the same one `monoforge doctor` runs: one `doctor` leg, PASS on a clean battery / RED on any fail) and the template blocks under `templates/*` (14 blocks, 28 files) as the `packs` rows, and a new `/status` route renders the family table live - each sibling's served `/status.json` fetched in the browser, absence shown as absent, never guessed. Same fixed path (`/status.json`), same schema, same dialect as packstruct / poststruct / eyestruct / crashtest / govstruct. The `_headers` CSP `connect-src` now allows the family origins, and `test/status.test.mjs` pins the emitter.

- `test/docs-frontmatter.test.cjs` - the frontmatter gate's scalar leg: a clean page passes, an unquoted colon-space in a required field is refused by name, the same in a NON-required field is refused too (the shape that shipped), and a quoted colon-space stays lawful.
- `test/release-verify.test.cjs` - the pack ladder run OFFLINE every push (the standing receipt eyestruct carries): a real `npm pack` case and a doctored-tarball refusal by name. Wired into `npm test`.
- `test/web-imports.test.cjs` - the web rig's import-closure gate: every relative specifier under `web/src` must resolve to a file on disk, and a fixture proves the gate refuses a dangling specifier by name (the shape that shipped). Rule #3: the CF build break shipped green because no Node lane built the rig, so the closure is now asserted in `npm test` without needing prestruct installed.
- `bin/forge.mjs` answers `--version` (from `package.json`), so the ladder's installed-bin probe resolves.
- The permanent `staging` integration branch, filled from the sha-gated mount tar (`monoforge-staging-git-2026-10-29.tar.gz`, sha256 `8b836a10…`): the tool tree, `templates/`, the `web/` + `docs/` rig, and the receipts. `horcrux/` stays `main`-owned and intact.
- The staging CI flow on the repo's first workflows (flowforge#30 / #20): `test.yml` pushes on `main` and `staging`; `docs.yml` watches both and its `deploy` job is gated to `main`. The same flow rides `templates/monoforge-headless/.github/workflows/`, so a stamped repo inherits it from birth.
- The `staging-ff-sync.yml` workflow (monoforge#20, point 4): a merge-commit promotion puts a commit on `main` that `staging` lacks, so the two drift by one on every promotion even when the flow is followed exactly. This job fast-forwards `staging` to `main` after every push to `main` (non-destructive refspec - a divergence fails the job instead of rewriting history). The same file rides `templates/monoforge-headless/.github/workflows/`, so a stamped repo inherits the whole four-point flow from birth.
- The `cut` verb: stamps a component-family workspace from a living lib per cutlist.json (components/<name>/ with intra-graph requires rewritten to scoped deps, per-package smokes + provenance CHANGELOGs + shortfall READMEs, root workspaces + test-all lane + stamp manifest for the doctor). Shortfall policy: lazies outside the cut must be DECLARED (documented degrade) or the cut refuses.
- Realized the first cut (creadev-lib, 7 packages from the vant lib).

### Changed

- **The web tree rides prestruct `^1.2.0`** (was `^1.0.0`), taking the react-router 7 prerender seam fix (prestruct#68) and the `generate404()` head-tag fix (prestruct#33/#34/#42). `web/package-lock.json` re-derived from the registry; the web build re-ran end to end (`Done. 8/8 pages rendered`, audit 0 failures), and the 404 canonical is now the bare origin (`https://monoforge.creadev.org`) instead of the old trailing-slash form.
- The template layer moved from a flat `templates/` tree (a single `cpSync`) to PROFILE subdirs: the scaffold lives in `templates/monoforge/`, the CI battery in `templates/monoforge-headless/`. `stamp` now resolves the profile's chain and copies the composed set; `factory.json.profile` selects the profile (default `monoforge`). An unknown profile refuses by name, the same law as a bad config.
- `test/release-verify.test.cjs` allow list follows the profile subdirs (`templates/monoforge-headless/.github/`, `templates/monoforge/labs/.eyes/`).
- `functions/api/health.js` -> `web/functions/api/health.js`. The Cloudflare Pages project is rooted at `web/` (the family contract: root dir `web`, build `npm run build`, output `dist`), so a root-level `functions/` directory falls OUTSIDE the project and `GET /api/health` 404s. Moving the canary under the Pages root is what makes the Functions wire resolve, exactly as packstruct's `web/functions/api/health.js` does. `DEPLOY.md` now names the Pages contract (it previously said "the landing pattern applies when it earns one").
- `scripts/check-docs-frontmatter.cjs` (and its `templates/scripts/` twin) now validates every frontmatter field as a valid plain YAML scalar, not just presence. This repo's `docs/index.md` shipped with `description: slots: generated by the factory` - an unquoted scalar carrying a colon-space - which YAML reads as a nested mapping, so Jekyll dropped the WHOLE frontmatter block and the page rendered with no layout and no head injection. Rule #3: caught twice (the doc and the gate that missed it), so the gate now bites. It scans EVERY top-level field, not only the REQUIRED ones (the bug landed in `description`), is dependency-free on purpose (the gate rides a zero-dep tree and a stamped repo with no install step), and takes a `--root <dir>` override for tests.
- `.github/workflows/publish.yml` is now the eyestruct 3-job release ladder (publish / release / verify) with a `verify-only` dispatch mode, receipt `dhaupin/eyestruct@4e2b552`. It replaces the single job that authenticated with `secrets.NPM_TOKEN` - the family law forbids publish tokens (OIDC trusted publishing only). `release.yml` (the old duplicate) is removed. The release job extracts its body from the CHANGELOG's own `[version]` section; verify re-proves the cut against npm and the GH release.
- `templates/monoforge-headless/.github/workflows/publish.yml` carries the same OIDC ladder, so every stamped repo inherits the fix from birth instead of the old `secrets.NPM_TOKEN` shape.
- `scripts/verify-release.cjs` + `scripts/release-notes.cjs` - the two generic family scripts (identical across the family). Two local additions to the ladder: a named `--allow` prefix list (the factory ships template dotfiles on purpose) and a named SKIP when a package declares no `main`/`exports`/`bin`.
- `src/doctor.mjs` - the `publish-gate` check now accepts the OIDC ladder's `case "$V" in 0.*)` version gate alongside the `startsWith('v0.')` shape, and a NEW `publish-token` check fails a tree whose publish.yml references `secrets.NPM_TOKEN` or `NODE_AUTH_TOKEN` (rule #3: the NPM_TOKEN bug was caught twice, live and in the template).

- `templates/.github/workflows/test.yml` + `docs.yml` - the staging triggers and the deploy guard, so the template cannot ship the pre-staging shape (issue #20's ordering warning).
- `web/src/AppLayout.jsx` + `web/src/AppIslands.jsx` - drop the two dangling page imports (`pages/Packs.jsx`, `pages/Status.jsx`) and the two dangling island imports (`GateStatusIsland`, `FamilyStatusIsland`) that arrived with the rig copy. The mount declared a Home/Terms/Privacy surface (`web/ssr.config.js` routes, `web/src/components/navItems.js`), and none of those four files were ever copied into `web/src`, so Vite/Rollup could not resolve them and `prestruct build` died at the first specifier. That is why the Cloudflare Pages check was red on `main` and on the PR while every Node lane stayed green (the battery never builds `web/`). Reconciled to the flowforge rig baseline (Home/Terms/Privacy, empty island registry); the landing now builds 3/3 pages with REPAIR-404 PASS.

### Removed

- **`web/scripts/repair-404.cjs` is retired** (monoforge#17). The script existed only to work around prestruct's `generate404()` leaking `$1`/`$2` into the 404 head tags (the function-replacer bug fixed upstream in prestruct 1.2.0, prestruct#33/#34/#42). With the web tree's pin moved to `^1.2.0` the engine emits the four tags correctly, so the workaround is dead weight - and its own assertions (a trailing-slash canonical, off-spec titles) had become wrong, failing the build it was wired into. The `build` script is now `node scripts/build-status.mjs && prestruct build`.

### Fixed
- **The 2026-11-02 trifecta walk's catches.** README's workflow row named "test, publish 0.x refusal, docs" while `staging-ff-sync.yml` also ships (now "test, docs, publish 0.x refusal, staging ff-sync") and called the docs system "4 gates" while six run (now 6); the creadev-lib receipt was misspelled "creedev-lib". `docs/ci.md`'s docs-lane block described a `npx jekyll build` / `npx pagefind --site dist` invocation the workflow never used (it is `bundle exec jekyll build`, `freestruct --strict`, then the standalone-musl `./pagefind --site _site`) and omitted the six gates. The Unreleased section carried duplicate `### Added`/`### Changed` headings; now one heading per type.

- Declared workspace deps now key on scoped names (the bare-name form made npm install notarget).
- Root scripts dir is created before test-all lands; test-all imports node:path (join).
- The CLI used the verb token as the target dir for new/cut (argv 3 vs 2).

## [0.9.0] - 2026-10-24

### Added
- `monoforge new <dir>`: stamps a fleet repo from the template blocks (docs system with the four ported gates, workflows incl. the 0.x refusal publish ladder, functions canary, wrangler contract), filling factory.json tokens and refusing non-empty directories and bad configs.
- `monoforge doctor [dir]`: the truth battery: git state, FORGE-TODO slot scan, package.json sanity (bin/exports/files paths), publish.yml 0.x refusal, npm test, docs gates, em dash law.
- `monoforge lock [dir]`: doctor-then-archive with sha256; refuses to lock a failing tree.
- `templates/`: blocks extracted from the two proven instances (poststruct + packstruct, 2026-10-24).
- Self-test: refusal paths + the doctor fail (unfilled) / pass (filled) pair.
