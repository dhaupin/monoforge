// Pages Function: GET /api/stamp-canary - the workers storage adapter proof.
//
// The coreforge rig vendored a fork of the stamp engine only because workerd
// has no `node:fs`. With the storage seam upstream (src/fs-adapter.mjs), the
// same engine runs here with `memoryFs()` and no disk: this Function seeds an
// in-memory template tree, stamps it, and reports what the engine produced.
// A 200 with the expected file list is the compat claim, proven at the fam
// mount rather than asserted in a README (monoforge#27).
//
// The engine is imported through the bundled `_lib/monoforge-engine.mjs`, built
// by `web/scripts/build-canary.mjs` before `vite build` (esbuild bundles the
// src/ engine for workerd; `node:fs` is never reached because memoryFs is
// passed and the Node default install lives only in the Node entrypoints).
import { stamp, memoryFs } from '../_lib/monoforge-engine.mjs'
import { CANARY_TEMPLATES, CANARY_FACTORY } from '../_lib/canary-templates.mjs'

// The template SOURCE root and the stamp OUTPUT dir must be separate: the
// engine refuses a target that already holds anything but factory.json, so the
// templates live under /src and the repo is stamped into the empty /out.
const CANARY_ROOT = '/src'
const CANARY_DIR = '/out'

export async function onRequestGet() {
  // Seed the whole template tree + the factory config into memory under a fake
  // repo root, so the engine's template walk and config read both run no-disk.
  const seed = {
    [`${CANARY_DIR}/factory.json`]: JSON.stringify(CANARY_FACTORY),
  }
  for (const [rel, body] of Object.entries(CANARY_TEMPLATES)) {
    seed[`${CANARY_ROOT}/${rel}`] = body
  }
  const fs = memoryFs(seed)

  const result = await stamp(CANARY_DIR, { fs, root: CANARY_ROOT })
  if (!result.ok) {
    return Response.json({ ok: false, lane: 'workers-storage-adapter', error: result.error }, { status: 500 })
  }

  // Read the stamped tree back through the SAME adapter to prove the write
  // side landed (not just that stamp() returned ok).
  const readme = fs.readFileSync(`${CANARY_DIR}/README.md`, 'utf8')
  const emitted = fs.readdirSync(CANARY_DIR, { withFileTypes: true }).map((e) => e.name).sort()

  return Response.json({
    ok: true,
    lane: 'workers-storage-adapter',
    spec: 'monoforge@1',
    stamped: {
      files: result.manifest,
      filled: result.filled,
      emitted,
      readmeFilled: /canary-stamp/.test(readme) && !/__NAME__/.test(readme),
      gitignoreMaterialized: fs.existsSync(`${CANARY_DIR}/.gitignore`),
      manifestWritten: fs.existsSync(`${CANARY_DIR}/.monoforge-stamp.json`),
      chainResolved: fs.existsSync(`${CANARY_DIR}/ci/verify.txt`),
    },
    ts: new Date().toISOString(),
  })
}
