# Changelog

All notable changes to monoforge will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- `.github/workflows/publish.yml` is now the eyestruct 3-job release ladder (publish / release / verify) with a `verify-only` dispatch mode, receipt `dhaupin/eyestruct@4e2b552`. It replaces the single job that authenticated with `secrets.NPM_TOKEN` - the family law forbids publish tokens (OIDC trusted publishing only). `release.yml` (the old duplicate) is removed. The release job extracts its body from the CHANGELOG's own `[version]` section; verify re-proves the cut against npm and the GH release.
- `scripts/verify-release.cjs` + `scripts/release-notes.cjs` - the two generic family scripts (identical across the family). Two local additions to the ladder: a named `--allow` prefix list (the factory ships template dotfiles on purpose) and a named SKIP when a package declares no `main`/`exports`/`bin`.
- `src/doctor.mjs` - the `publish-gate` check now accepts the OIDC ladder's `case "$V" in 0.*)` version gate alongside the `startsWith('v0.')` shape.

### Added
- `test/release-verify.test.cjs` - the pack ladder run OFFLINE every push (the standing receipt eyestruct carries): a real `npm pack` case and a doctored-tarball refusal by name. Wired into `npm test`.
- `bin/forge.mjs` answers `--version` (from `package.json`), so the ladder's installed-bin probe resolves.
- The permanent `staging` integration branch, filled from the sha-gated mount tar (`monoforge-staging-git-2026-10-29.tar.gz`, sha256 `8b836a10…`): the tool tree, `templates/`, the `web/` + `docs/` rig, and the receipts. `horcrux/` stays `main`-owned and intact.
- The staging CI flow on the repo's first workflows (flowforge#30 / #20): `test.yml` pushes on `main` and `staging`; `docs.yml` watches both and its `deploy` job is gated to `main`. The same flow rides `templates/.github/workflows/`, so a stamped repo inherits it from birth.
- The `cut` verb: stamps a component-family workspace from a living lib per cutlist.json (components/<name>/ with intra-graph requires rewritten to scoped deps, per-package smokes + provenance CHANGELOGs + shortfall READMEs, root workspaces + test-all lane + stamp manifest for the doctor). Shortfall policy: lazies outside the cut must be DECLARED (documented degrade) or the cut refuses.
- Realized the first cut (creadev-lib, 7 packages from the vant lib).

### Changed
- `templates/.github/workflows/test.yml` + `docs.yml` - the staging triggers and the deploy guard, so the template cannot ship the pre-staging shape (issue #20's ordering warning).

### Fixed (found by dogfooding the cut)
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
