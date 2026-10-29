# DEPLOY.md - monoforge release runbook

monoforge is an npm tool. Deploy = publish. Ladder follows the fleet
convention: 0.9.x manual (`npm publish`), 1.0.0 tagged (publish.yml,
OIDC provenance, refuses 0.x refs). Release atomicity per crashtest#20:
CHANGELOG `[Unreleased]` flips in the tag commit; never a docs-only patch.

## npm prep
- Registry name **monoforge** is free (checked 2026-10-24, npm 404).
- `npm pack --dry-run` before publish: files whitelist is `bin/`, `src/`,
  `templates/` so `npx monoforge new` works from a fresh install.

## Landing & docs
- monoforge is a tool; the landing/docs pattern applies when it earns one
  (template blocks are its own inventory: `forge new` + fill slots).

## The staging branch (flowforge#30 / monoforge#20)

`staging` is a **permanent integration branch**: work branches off it, PRs
target it, and promotion to `main` is the only path out. The full pattern
(with the proof behind each rule) is dhaupin/poststruct#32; the short
version:

1. **CI covers staging as well as main** - `test.yml` pushes on both `main`
   and `staging`, so a red battery red-lights the integration branch before
   a promotion, not after.
2. **Any deploy job is gated to `main`.** `docs.yml` builds on `staging`
   too (a docs change that breaks the build should fail there), but its
   `deploy` job carries `if: github.ref == 'refs/heads/main'`. This is the
   trap point: once `staging` is in a trigger list, the trigger no longer
   keeps its content out of production - the job guard does.
3. **After every promotion, fast-forward staging to main:**
   ```bash
   git push origin origin/main:staging     # ff, non-destructive
   ```
   A merge-commit promotion puts a commit on `main` that `staging` lacks, so
   the two drift by one on **every** promotion even when the flow is
   followed exactly. The sync is a required step, not a repair. (Promoting
   by fast-forward instead removes the drift entirely - only viable if
   nothing ever lands on `main` directly.)

The same flow rides `templates/.github/workflows/`, so a repo stamped by
`monoforge new` inherits it from birth (issue #20's ordering warning: a
template cut before the flow lands ships the old shape).
