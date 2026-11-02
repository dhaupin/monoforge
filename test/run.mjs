// test/run.mjs - monoforge self-test. The negative test is the product:
// (1) a bad factory.json config is refused, (2) a stamped repo with its
// truth slots unfilled FAILS the doctor (this is the factory refusing to
// ship generated green), (3) the doctor passes a tree whose slots are
// filled. The factory's own law, asserted in its own CI.
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import stamp from '../src/stamp.mjs'
import doctor from '../src/doctor.mjs'

const base = mkdtempSync(join(tmpdir(), 'forge-'))
const fails = []
const assert = (cond, label) => { if (!cond) fails.push(label) }

// 1. bad config refused hard
const d1 = join(base, 'badcfg'); mkdirSync(d1, { recursive: true })
writeFileSync(join(d1, 'factory.json'), JSON.stringify({ name: 'X', species: 's', pitch: 'p', description: 'd', siteDomain: 'http://x' }))
const r1 = await stamp(d1)
assert(r1.ok === false, 'bad config: stamp should refuse (kebab + https laws)')
assert(/kebab-case|https/.test(r1.error || ''), 'bad config: refusal should name the law')

// 2. non-empty dir refused
const d2 = join(base, 'stray'); mkdirSync(d2, { recursive: true })
writeFileSync(join(d2, 'stray.txt'), 'x')
writeFileSync(join(d2, 'factory.json'), JSON.stringify({ name: 'good-name', species: 's', pitch: 'p', description: 'long enough description', siteDomain: 'https://good-name.creadev.org' }))
const r2 = await stamp(d2)
assert(r2.ok === false && /stray\.txt/.test(r2.error || ''), 'non-empty dir: stamp should refuse, never half-merge')

// 3. clean stamp: refuses nothing, fills tokens, leaves truth slots
const d3 = join(base, 'clean'); mkdirSync(d3, { recursive: true })
writeFileSync(join(d3, 'factory.json'), JSON.stringify({ name: 'test-forge', species: 'test animal', pitch: 'A test stamp.', description: 'A synthetic repo stamped by the factory CI to prove the stamp layer works end to end.', siteDomain: 'https://test-forge.creadev.org', version: '0.9.0' }))
const r3 = await stamp(d3)
assert(r3.ok === true, 'clean stamp should succeed')
assert(existsSync(join(d3, '.gitignore')), 'stamp should materialize .gitignore from the template')
assert(existsSync(join(d3, '.github/workflows/publish.yml')), 'stamp should carry the release ladder')
const readme = require3(join(d3, 'README.md').replace('file://', ''))
assert(/test-forge/.test(readme) && /FORGE-TODO/.test(readme), 'stamped README carries the name and its unfilled truth slots')

// 4. doctor FAILS on unfilled truth slots (the law that matters most)
const d4 = await doctor(d3)
assert(d4.ok === false, 'doctor must fail a stamped repo whose truth slots are unfilled (generated green is never shipped)')
assert(d4.findings.some(f => f.id === 'truth-slot'), 'doctor should flag the FORGE-TODO slots by id')

// 5. doctor passes when slots are filled (fill in place)
import { readFileSync as rf, writeFileSync as wf, readdirSync as rd } from 'node:fs'
const refill = (d) => {
  for (const f of rd(d, { withFileTypes: true })) {
    const p = join(d, f.name)
    if (f.isDirectory() && f.name !== '.git') refill(p)
    else if (/\.(md|json|mjs|cjs|yml|toml|sh|html|txt)$/.test(f.name)) {
      try {
        // refill mirrors the factory contract: truth slots AND stamp tokens
        // must both be gone before the doctor can call a tree shippable
        wf(p, rf(p, 'utf8')
          .replaceAll('FORGE-TODO', 'DONE')
          .replaceAll('DONE:truth', 'filled by the factory test')
          .replaceAll('UNSET-edit-me', 'test-pinned@1.0.0')
          .replaceAll(/__[A-Z][A-Z0-9_]*__/g, 'test-token-filled'))
      } catch {}
    }
  }
}
refill(d3)
const d5 = await doctor(d3)
// note: the stamped docs/ in the test tree carries fix tokens; npm test is
// not stamped (package.json test comes from the template tail), tolerate
// its warn, but the tree must be fail-free.
assert(d5.counts.fail === 0, `doctor should pass a refilled tree (got: ${JSON.stringify(d5.findings.filter(f => f.level === 'fail').slice(0, 3))})`)

// 6. the canon checks (monoforge#12 rider, the eyestruct DANGLING_ROW
// refusal scored as a doctor check).
// 6a. a dangling canon pointer fails: a ledger row whose artifact never
//     landed is the same lie as a files entry pointing at nothing.
const d6a = mkdtempSync(join(tmpdir(), 'forge-canon-'))
mkdirSync(join(d6a, 'labs/.eyes'), { recursive: true })
writeFileSync(join(d6a, 'labs/.eyes/manifest.yml'), 'pin:\n  browser-image: local-chrome@154.0.0.0\n  renderer: resvg@2.6.2\nroutes:\n  - path: /  view: desktop-1280  theme: dark  viewport: 1280x800\n')
writeFileSync(join(d6a, 'labs/.eyes/ledger.json'), JSON.stringify([
  { id: 'row-0001', ts: 1, agent: 't', commit: 'c', artifact: 'home/desktop-1280/current.png', type: 'adopt', note: 'ghost pointer' },
]))
const r6a = await doctor(d6a)
assert(r6a.findings.some((f) => f.id === 'dangling-canon' && f.level === 'fail'), 'dangling canon pointer: the doctor refuses (DANGLING_ROW as a doctor finding)')
// 6b. an UNSET pin fails: a canon token pointing at nothing is an unfilled
//     truth slot in the canon's uniform.
const d6b = mkdtempSync(join(tmpdir(), 'forge-canon-'))
mkdirSync(join(d6b, 'labs/.eyes'), { recursive: true })
writeFileSync(join(d6b, 'labs/.eyes/manifest.yml'), 'pin:\n  browser-image: UNSET-edit-me\n  renderer: UNSET-edit-me\nroutes:\n  - path: /  view: desktop-1280  theme: dark  viewport: 1280x800\n')
writeFileSync(join(d6b, 'labs/.eyes/ledger.json'), '[]')
const r6b = await doctor(d6b)
assert(r6b.findings.some((f) => f.id === 'canon-pin' && f.level === 'fail'), 'UNSET canon pins: the doctor refuses until something fills them')
// 6c. canon-free tree stays silent: no canon, no findings, no fake pass.
const d6c = mkdtempSync(join(tmpdir(), 'forge-canon-'))
writeFileSync(join(d6c, 'placeholder.txt'), 'no canon here')
const r6c = await doctor(d6c)
assert(!r6c.findings.some((f) => f.id === 'dangling-canon' || f.id === 'canon-pin'), 'canon-free tree: the canon checks stay silent, never a dressed-up pass')
rmSync(d6a, { recursive: true, force: true })
rmSync(d6b, { recursive: true, force: true })
rmSync(d6c, { recursive: true, force: true })

// 7. the publish-token law (rule #3: the NPM_TOKEN bug was caught twice - in
//    the live publish.yml and in the template - so the doctor gates it). A
//    real `secrets.NPM_TOKEN` reference fails; a comment naming the removed
//    line does not.
const d7 = mkdtempSync(join(tmpdir(), 'forge-token-'))
mkdirSync(join(d7, '.github/workflows'), { recursive: true })
writeFileSync(join(d7, 'package.json'), JSON.stringify({ name: 'tok-probe', version: '0.9.0', description: 'a probe with a token-bearing publish lane' }))
writeFileSync(join(d7, '.github/workflows/publish.yml'), "name: publish\non: { push: { tags: ['v*'] } }\njobs:\n  publish:\n    runs-on: ubuntu-latest\n    if: ${{ !startsWith(github.ref_name, 'v0.') }}\n    steps:\n      - run: npm publish --provenance\n        env:\n          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}\n")
const r7 = await doctor(d7)
assert(r7.findings.some((f) => f.id === 'publish-token' && f.level === 'fail'), 'a publish token (secrets.NPM_TOKEN / NODE_AUTH_TOKEN) must fail the doctor by id (the family law: OIDC only, no publish tokens)')
rmSync(d7, { recursive: true, force: true })

// 8. stamp coexistence (monoforge#4): a re-stamp must never clobber a stamped
//    repo's host-authored artifacts. Stamp once, hand-edit a template file the
//    way a host grows a crashtest.config.js after day one, re-stamp, and assert
//    the host's bytes survive untouched while a pristine file is refreshed.
const d8 = mkdtempSync(join(tmpdir(), 'forge-restamp-'))
writeFileSync(join(d8, 'factory.json'), JSON.stringify({ name: 'coexist-forge', species: 'test animal', pitch: 'A re-stamp probe.', description: 'A synthetic repo proving a re-stamp never eats host state.', siteDomain: 'https://coexist-forge.creadev.org', version: '0.9.0' }))
const r8a = await stamp(d8)
assert(r8a.ok === true && r8a.restamp === false, 'first stamp: a fresh tree stamps clean')
const receiptPath = join(d8, '.monoforge-stamp.json')
const receipt = JSON.parse(rf(receiptPath, 'utf8'))
assert(Array.isArray(receipt.files) && receipt.hashes && typeof receipt.hashes === 'object',
  'receipt keeps `files` an array (the doctor scope) and adds a `hashes` map (the coexistence ledger)')
assert(receipt.hashes['README.md'] && typeof receipt.hashes['README.md'] === 'string',
  'receipt hashes cover copied template files (the coexistence ledger is populated, not empty)')
// host authors a template path after day one: a crashtest.config.js and an
// edited AGENTS.md (the repo's own house rules).
const hostFile = join(d8, 'crashtest.config.js')
wf(hostFile, "module.exports = { handler: 'run --allow-vacuous' }\n")
const hostBytes = rf(hostFile, 'utf8')
wf(join(d8, 'AGENTS.md'), '# host-authored house rules\n')
const agentsBytes = rf(join(d8, 'AGENTS.md'), 'utf8')
const r8b = await stamp(d8)
assert(r8b.ok === true && r8b.restamp === true, 're-stamp: a receipt-bearing tree is a re-stamp, not a stray dir')
assert(r8b.skipped.includes('AGENTS.md'), 're-stamp: the edited template file is reported as a named skip, never a silent bleed')
assert(rf(join(d8, 'AGENTS.md'), 'utf8') === agentsBytes, 're-stamp: the host-authored AGENTS.md bytes are unchanged')
assert(rf(hostFile, 'utf8') === hostBytes, 're-stamp: a host-authored file outside the template set is untouched')
// the receipt still records the factory's last emission for the skipped path,
// so a THIRD stamp still treats it as host-owned (never a one-shot skip).
const r8c = await stamp(d8)
assert(rf(join(d8, 'AGENTS.md'), 'utf8') === agentsBytes, 'third stamp: a host-authored file stays host-owned across re-stamps')
assert(r8c.skipped.includes('AGENTS.md'), 'third stamp: the host-owned path is still skipped')
// a pristine template file IS refreshed, but a host-authored one is not:
// README.md starts pristine, so a first re-stamp with it untouched refreshes
// it from the template; once the host has scribbled on it, later re-stamps
// leave it alone (the same law, applied to a file the factory once owned).
const readmeTemplate = rf(join(d8, 'README.md'), 'utf8')
assert(/coexist-forge/.test(readmeTemplate), 're-stamp: a pristine template file keeps its factory emission (tokens filled)')
wf(join(d8, 'README.md'), 'host scribble\n')
const r8d = await stamp(d8)
assert(rf(join(d8, 'README.md'), 'utf8') === 'host scribble\n', 're-stamp: once the host edits a template file, its bytes are never clobbered')
assert(r8d.skipped.includes('README.md'), 're-stamp: the host-edited template file is a named skip')
rmSync(d8, { recursive: true, force: true })

rmSync(base, { recursive: true, force: true })
if (fails.length) { console.error('SELF-TEST FAIL:\n  ' + fails.join('\n  ')); process.exit(1) }
console.log('monoforge self-test: bad-config refused, stray dir refused, stamp ok, unfilled doctor FAIL, refilled doctor PASS, canon dangling/UNSET refused, canon-free silent, publish token refused, re-stamp never clobbers host state - PASS')
process.exit(0)

function require3(p) { return rf(p, 'utf8') }
