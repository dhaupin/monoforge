#!/usr/bin/env node
// web/scripts/build-canary.mjs - bundle the stamp engine for the workerd canary.
//
// The `/api/stamp-canary` Pages Function imports the engine as an ESM bundle
// (esbuild, platform 'neutral', format esm). The engine core imports no `node:*`
// builtin - the Node default adapter lives in src/fs-node.mjs, which only the
// Node entrypoints import - so the bundle carries nothing workerd cannot run.
// This script asserts the result: any `node:*` reference in the output fails
// the build loudly instead of shipping a Function that 500s at the edge.
import { build } from 'esbuild'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

// Paths are resolved from THIS file, not the cwd: the web build runs from
// `web/` (`npm run build`), while a direct `node web/scripts/build-canary.mjs`
// runs from the repo root. Both must find `src/`.
const repoRoot = fileURLToPath(new URL('../..', import.meta.url))
const outfile = join(repoRoot, 'web', 'functions', '_lib', 'monoforge-engine.mjs')

await build({
  entryPoints: [join(repoRoot, 'src/workers.mjs')],
  outfile,
  bundle: true,
  format: 'esm',
  target: 'es2022',
  platform: 'neutral',
  mainFields: ['module', 'main'],
  // No `external` list on purpose: the engine core imports no `node:*`, so
  // under `platform: 'neutral'` any such import is a build-time error - the
  // strictest guard against a Node reach-in leaking into the Function.
  logLevel: 'silent',
})

const bundled = readFileSync(outfile, 'utf8')
// The engine core must reach for NO `node:*` builtin: a static `node:fs` (or
// `node:crypto`, `node:path`) reference means the seam is broken and the
// Function would 500 at the edge.
const leaked = bundled.match(/(?:from|require\()\s*["'](node:[a-z/]+)["']/g)
if (leaked) {
  console.error(`  ${outfile}: FAIL - Node builtin(s) leaked into the workers bundle: ${leaked.join(', ')}`)
  process.exit(1)
}
console.log(`  ${outfile} bundled (stamp engine, zero node:* imports)`)
