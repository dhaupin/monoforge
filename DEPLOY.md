# DEPLOY.md - monoforge release runbook

monoforge is an npm tool. Deploy = publish. Ladder follows the fleet convention: 0.9.x manual (`npm publish`), 1.0.0 tagged (publish.yml, OIDC provenance, refuses 0.x refs). Release atomicity per crashtest#20: CHANGELOG `[Unreleased]` flips in the tag commit; never a docs-only patch.

## The trifecta audit (run before every tag)

One walk over four artifacts, receipts over vibes (monoforge#10, the eyestruct walk's lane). Each member is checked against what the tree ACTUALLY does, not what a prior cut said:

1. **README** - usage lines match the real `bin/forge.mjs` dispatch (no phantom flags), the status line describes what is live, and the surfaces link the docs/npm/workshop (Creadev.org named).
2. **AGENTS.md** - the agent's first read: where the verbs live, the battery and lane workflow file names, and the receipt inventory an agent may cite.
3. **Deploy lanes** - the `.github/workflows/*.yml` set: does the deploy env (domain, baseurl, secrets) still match what README/DEPLOY claim, and is each lane discoverable from AGENTS.md? (The 2026-11-02 walk caught `staging-ff-sync` missing from the README workflow list, the docs lane called "4 gates" while six ran, and `docs/ci.md` describing a Jekyll/Pagefind invocation the workflow never used.)
4. **CHANGELOG** - keep-a-changelog discipline: one `### Added` / `### Changed` / `### Removed` / `### Fixed` per section (no duplicate type headings), and `[Unreleased]` carries only REAL futures.

The walk is not done until every catch is commissioned in the same session (a battery leg, a doc fix, or a named docket row) - the walk-exit rule in AGENTS.md.

## npm prep
- Registry name **monoforge** is free (checked 2026-10-24, npm 404).
- `npm pack --dry-run` before publish: files whitelist is `bin/`, `src/`, `templates/` so `npx monoforge new` works from a fresh install.

## Landing & docs
- The landing (`web/`) deploys as a **Cloudflare Pages project** named `monoforge`, production custom domain `monoforge.creadev.org`.
- Pages Git integration settings (the family contract, same as packstruct / govstruct / eyestruct): **root directory `web`**, build command `npm run build` (which runs `prestruct build`: vite build + brand/SEO injection from `web/ssr.config.js` + per-route prerender + the 404 head repair), output directory `dist`. There is no root `wrangler.toml` - the contract lives here and in the dashboard settings.
- **Functions:** `web/functions/api/health.js`: `GET /api/health` returns honest JSON. Functions live under the Pages root (`web/`), so they resolve when the project root is `web`; a root-level `functions/` directory would fall outside the project and the canary would 404. Optionally set `SITE_NAME` in the Pages project vars; the function's fallback covers its absence.
- **The workers storage-adapter canary:** `web/functions/api/stamp-canary.js`: `GET /api/stamp-canary` runs the stamp engine against `memoryFs()` - no disk - and returns what it produced (files, token fill, gitignore rename, manifest). The engine is bundled for workerd by `web/scripts/build-canary.mjs` (run first in `npm run build`); the script fails the build if `node:fs` leaks into the bundle. This is the proof that the factory runs where `node:fs` does not exist (monoforge#27).
- **Do not add a `/* /index.html 200` SPA fallback** (`web/public/_redirects` explains why: every route prerenders its own HTML, and the fallback redirect-loops against CF's pretty URLs).
- Docs deploy via `.github/workflows/docs.yml` (GitHub Pages), deploy job gated to `main`.

## The staging branch (flowforge#30 / monoforge#20)

`staging` is a **permanent integration branch**: work branches off it, PRs target it, and promotion to `main` is the only path out. The full pattern (with the proof behind each rule) is dhaupin/poststruct#32; the short version:

1. **CI covers staging as well as main** - `test.yml` pushes on both `main` and `staging`, so a red battery red-lights the integration branch before a promotion, not after.
2. **Any deploy job is gated to `main`.** `docs.yml` builds on `staging` too (a docs change that breaks the build should fail there), but its `deploy` job carries `if: github.ref == 'refs/heads/main'`. This is the trap point: once `staging` is in a trigger list, the trigger no longer keeps its content out of production - the job guard does.
3. **After every promotion, fast-forward staging to main:**
   ```bash
   git push origin origin/main:staging     # ff, non-destructive
   ```
   A merge-commit promotion puts a commit on `main` that `staging` lacks, so the two drift by one on **every** promotion even when the flow is followed exactly. The sync is a required step, not a repair. (Promoting by fast-forward instead removes the drift entirely - only viable if nothing ever lands on `main` directly.)

The same flow rides `templates/monoforge-headless/.github/workflows/` (the headless template profile), so a repo stamped by `monoforge new` inherits it from birth (issue #20's ordering warning: a template cut before the flow lands ships the old shape).
