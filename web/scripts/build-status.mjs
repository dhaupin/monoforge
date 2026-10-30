/**
 * scripts/build-status.mjs - the family status contract emitter
 * (family-status@1), monoforge's member side.
 *
 * Adapted from crashtest's emitter (the dialect origin worked example). The
 * CONTRACT is identical; the MEMBERSHIP is monoforge's own shape:
 *
 *   - monoforge ships NO crashtest ledger. Its truth battery is its own
 *     doctor (`src/doctor.mjs`, the same one `monoforge doctor` runs), so the
 *     legs array carries ONE `doctor` leg derived from that report - a clean
 *     battery is PASS, any fail is RED. Nothing is invented: no crashtest leg
 *     is claimed for a ledger the repo does not carry.
 *   - the `packs` rows carry the template BLOCKS the factory stamps from
 *     (templates/*), each with its committed file count - the factory's
 *     shipped assets, counted from the tree itself.
 *
 * Generated, never hand-edited: the file is REGENERATED on every web build
 * (the build script runs this first; locally `node web/scripts/build-status.mjs`),
 * and web/public/status.json is gitignored - committing it would recreate the
 * exact stale-copy drift class the family kills everywhere else.
 *
 * The dialect (family-status@1), thirty seconds:
 *
 *   { schema: 1, contract: "family-status@1", repo, site, docs, asOf,
 *     legs: [{ leg, verdict, cases, counts, ledger }],
 *     packs: [{ name, spec, manifest, cases }] }
 *
 * Verdict rule: the leg carries the battery's own verdict - PASS when the
 * doctor reports 0 fails, RED otherwise, never a fake pass.
 *
 * Reader rule (the OTHER half of the contract): refuse on missing/renamed
 * schema or contract; render a not-yet row, never a guessed number.
 */

import { readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
export const REPO_ROOT = resolve(HERE, '..', '..')
const OUT_PATH = join(REPO_ROOT, 'web', 'public', 'status.json')

const REPO = 'dhaupin/monoforge'
const SITE = 'https://monoforge.creadev.org/status'
const DOCS = 'https://docs.creadev.org/monoforge'

function countFiles(abs) {
  const st = statSync(abs)
  if (!st.isDirectory()) return 1
  let n = 0
  for (const e of readdirSync(abs, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git') continue
    n += countFiles(join(abs, e.name))
  }
  return n
}

/**
 * The template blocks the factory stamps from: templates/* top-level entries,
 * each counted from the tree itself. Refuses loudly (never guesses) when the
 * template bank is empty - a factory that ships no blocks has nothing to
 * stamp, and a silent zero would read as "fine".
 */
function blocksOf(root) {
  const templatesDir = join(root, 'templates')
  let entries
  try {
    entries = readdirSync(templatesDir).sort()
  } catch (err) {
    throw new Error(`templates/ unreadable (${err.message}) - the status contract refuses a repo whose template bank is not countable`)
  }
  const packs = entries
    .filter((e) => e !== 'node_modules' && e !== '.git')
    .map((e) => ({
      name: e,
      spec: 'monoforge-template@1',
      manifest: `templates/${e}`,
      cases: countFiles(join(templatesDir, e)),
    }))
  if (!packs.length) {
    throw new Error('templates/ declares zero blocks - a factory with no template blocks has nothing to stamp (refuse, never serve a silent zero)')
  }
  return packs
}

/**
 * build({ root }) -> the status object. Exported for the battery test.
 * Throws (refusing, never guessing) when a mandated input is unreadable.
 */
export async function build(root = REPO_ROOT) {
  let report
  try {
    const mod = await import(pathToFileURL(join(root, 'src', 'doctor.mjs')).href)
    report = await (mod.default || mod.doctor)(root)
  } catch (err) {
    throw new Error(`src/doctor.mjs could not run (${String(err.message).split('\n')[0]}) - the status contract refuses to serve without the truth battery`)
  }
  const { counts, findings = [], ok } = report

  let asOf = 'worktree'
  try {
    asOf = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch {
    // no git context (zip download): say worktree, never a fake sha
  }

  return {
    schema: 1,
    contract: 'family-status@1',
    repo: REPO,
    site: SITE,
    docs: DOCS,
    asOf,
    legs: [
      {
        leg: 'doctor',
        verdict: ok ? 'PASS' : 'RED',
        cases: findings.length,
        counts: { FAIL: counts.fail, WARN: counts.warn },
        ledger: 'monoforge doctor (src/doctor.mjs)',
      },
    ],
    packs: blocksOf(root),
  }
}

export function write(root = REPO_ROOT, outPath = OUT_PATH) {
  return build(root).then((status) => {
    mkdirSync(dirname(outPath), { recursive: true })
    writeFileSync(outPath, JSON.stringify(status, null, 2) + '\n')
    return { status, outPath }
  })
}

// CLI: node scripts/build-status.mjs -> writes web/public/status.json.
// Silent success (npm scripts), refusal prints and exits nonzero.
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const { outPath } = await write()
    console.log(`family status written: ${outPath}`)
  } catch (err) {
    console.error(`family status REFUSED: ${err.message}`)
    process.exit(1)
  }
}
