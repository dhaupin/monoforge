// packs/public/forge-shapes/test/run.mjs - the pack's self-audit (packstruct
// SPEC section 4: every pack ships test/fixtures/ proving its own claims).
//
// Runs the pack against each fixture tree and asserts the verdict each one
// claims. A fixture that stops producing its verdict fails here, in the pack's
// own CI, before any host loads it. Zero dependencies.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { run } from '../index.mjs'

const HERE = resolve(new URL('.', import.meta.url).pathname)
const FIXTURES = join(HERE, 'fixtures')

function treeAt(root) {
  const inside = (rel) => {
    if (typeof rel !== 'string' || !rel) return null
    const abs = resolve(root, rel)
    return abs === root || abs.startsWith(root + '/') ? abs : null
  }
  return {
    root,
    exists(rel) { const abs = inside(rel); return abs ? statSync(abs, { throwIfNoEntry: false }) != null : false }, // file OR dir
    text(rel) {
      const abs = inside(rel)
      if (!abs) return null
      try { return statSync(abs).isFile() ? readFileSync(abs, 'utf8') : null } catch { return null }
    },
    readdir(rel) { const abs = inside(rel ?? ''); try { return readdirSync(abs) } catch { return [] } },
  }
}

const verdicts = (root) => new Map(run({ forgeTree: treeAt(root) }).rows.map((r) => [r.id, r.verdict]))

let failures = 0
const check = (label, cond) => { if (!cond) { console.error(`  FAIL ${label}`); failures++ } else { console.log(`  ok   ${label}`) } }

// Each fixture claims a verdict for one check id.
const CASES = [
  ['clean', 'forge/receipt-present', 'PASSED'],
  ['clean', 'forge/receipt-files-exist', 'PASSED'],
  ['clean', 'forge/truth-slot-clean', 'PASSED'],
  ['clean', 'forge/stamp-token-clean', 'PASSED'],
  ['clean', 'forge/package-paths', 'PASSED'],
  ['clean', 'forge/publish-gate', 'PASSED'],
  ['unfilled', 'forge/truth-slot-clean', 'EXPLOITED'],
  ['unfilled', 'forge/receipt-present', 'PASSED'],
  ['token', 'forge/stamp-token-clean', 'EXPLOITED'],
  ['missing-file', 'forge/receipt-files-exist', 'EXPLOITED'],
  ['missing-file', 'forge/receipt-present', 'PASSED'],
  ['bad-publish', 'forge/publish-gate', 'EXPLOITED'],
  ['bad-publish', 'forge/truth-slot-clean', 'PASSED'],
]

console.log('forge-shapes self-audit:')
const cache = new Map()
for (const [fixture, id, want] of CASES) {
  if (!cache.has(fixture)) cache.set(fixture, verdicts(join(FIXTURES, fixture)))
  const got = cache.get(fixture).get(id)
  check(`${fixture}: ${id} -> ${want} (got ${got})`, got === want)
}

// An absent target dockets BOUNDED and never a pass.
const absent = new Map(run({ forgeTree: { root: null } }).rows.map((r) => [r.id, r.verdict]))
check('absent target: forge/receipt-present -> BOUNDED', absent.get('forge/receipt-present') === 'BOUNDED')

console.log(failures ? `forge-shapes self-audit: ${failures} FAILURE(S)` : 'forge-shapes self-audit: PASS')
process.exit(failures ? 1 : 0)
