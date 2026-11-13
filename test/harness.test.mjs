// test/harness.test.mjs - the headless stamp harness (monoforge#23).
//
// The three regression teeth the issue names, plus the registry law:
//
//   1. a doctor run over a tree with one unfilled slot returns a STRUCTURED
//      refusal naming the slot (code + slot, not prose);
//   2. a green lock returns a receipt with the grant row echoed;
//   3. every refusal code the harness emits exists in spec/refusals.json - and
//      the harness refuses to emit an unregistered one.
//
// No mocks: the harness drives the real stamp/doctor/lock over a real temp
// tree, and the registry is the real spec file.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import '../src/fs-node.mjs' // install the node:fs default adapter

const root = join(new URL('..', import.meta.url).pathname)
const { run } = await import(join(root, 'src/harness.mjs'))
const { loadRefusals, registeredCodes, refusal } = await import(join(root, 'src/refusals.mjs'))
const { CODE_BY_ID } = await import(join(root, 'src/doctor.mjs'))

const CONFIG = {
  name: 'harness-probe',
  species: 'a harness probe',
  pitch: 'Proves the headless harness drives the stamp loop.',
  description: 'A synthetic repo driven by the harness in-process to prove typed refusals and the grant echo.',
  siteDomain: 'https://harness-probe.creadev.org',
}

function scaffold() {
  const dir = mkdtempSync(join(tmpdir(), 'mf-harness-'))
  writeFileSync(join(dir, 'factory.json'), JSON.stringify(CONFIG))
  return dir
}

// A fresh stamp is DELIBERATELY not green: it carries FORGE-TODO slots and
// UNSET canon pins (generated green is never shipped). Filling them in place is
// the human act the doctor then passes; mirrors test/run.mjs's refill.
function refill(dir) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    if (f.name === '.git') continue
    const p = join(dir, f.name)
    if (f.isDirectory()) { refill(p); continue }
    if (!/\.(md|json|yml|toml|sh|html|txt)$/.test(f.name)) continue
    const s = readFileSync(p, 'utf8')
      .replaceAll('FORGE-TODO', 'DONE:truth filled by the harness test')
      .replaceAll('UNSET-edit-me', 'test-pinned@1.0.0')
      .replaceAll(/__[A-Z][A-Z0-9_]*__/g, 'test-token-filled')
    writeFileSync(p, s)
  }
}

test('every registered code is a non-empty string, namespaced monoforge', () => {
  const codes = loadRefusals()
  assert.ok(Object.keys(codes).length >= 20, 'the registry carries a real vocabulary')
  for (const [code, detail] of Object.entries(codes)) {
    assert.match(code, /^E_[A-Z0-9_]+$/, `code ${code} must be E_ upper-snake`)
    assert.ok(typeof detail === 'string' && detail.length > 8, `code ${code} must carry a real description`)
  }
})

test('refusal() refuses an unregistered code (a typo cannot become a logged refusal)', () => {
  assert.throws(() => refusal('E_NOT_A_REAL_CODE', 'x', 'nope'), /unregistered refusal code/)
  const ok = refusal('E_TRUTH_SLOT', 'README.md', 'still unfilled')
  assert.deepEqual(ok, { code: 'E_TRUTH_SLOT', slot: 'README.md', detail: 'still unfilled' })
})

test('a doctor over an unfilled slot returns a typed refusal naming the slot', async () => {
  const dir = scaffold()
  try {
    await run('new', dir)
    // Force one unfilled slot the doctor is scoped to see via the stamp manifest.
    const manifestPath = join(dir, '.monoforge-stamp.json')
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
    const target = join(dir, 'SLOT.md')
    writeFileSync(target, 'this file still carries FORGE-TODO\n')
    manifest.files = [...(manifest.files || []), 'SLOT.md']
    writeFileSync(manifestPath, JSON.stringify(manifest))

    const r = await run('doctor', dir)
    assert.equal(r.ok, false)
    const slotRefusal = r.refusals.find((x) => x.code === 'E_TRUTH_SLOT' && x.slot === 'SLOT.md')
    assert.ok(slotRefusal, `expected an E_TRUTH_SLOT naming SLOT.md, got ${JSON.stringify(r.refusals)}`)
    assert.match(slotRefusal.detail, /FORGE-TODO/)
  } finally { rmSync(dir, { recursive: true, force: true }) }
})

test('a committed pack the files whitelist omits is a typed E_PACKS_UNDELIVERED refusal (poststruct#79)', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'mf-packs-'))
  try {
    const pkg = (files) => JSON.stringify({ name: 'packs-probe', version: '1.0.0', description: 'a packs delivery probe', files })
    writeFileSync(join(dir, 'package.json'), pkg(['package.json']))
    mkdirSync(join(dir, 'packs', 'public', 'probe-pack'), { recursive: true })
    writeFileSync(join(dir, 'packs', 'public', 'probe-pack', 'pack.json'), JSON.stringify({ schemaVersion: 1, name: 'probe-pack', version: '0.1.0', entry: 'index.js' }))

    // The committed pack is not delivered -> a typed refusal naming the pack dir.
    const r = await run('doctor', dir)
    const hit = r.refusals.find((x) => x.code === 'E_PACKS_UNDELIVERED' && x.slot === 'packs/public/probe-pack')
    assert.ok(hit, `expected an E_PACKS_UNDELIVERED naming packs/public/probe-pack, got ${JSON.stringify(r.refusals)}`)

    // The delivery is fixed by whitelisting packs/ -> the refusal clears.
    writeFileSync(join(dir, 'package.json'), pkg(['package.json', 'packs/']))
    const r2 = await run('doctor', dir)
    assert.ok(!r2.refusals.some((x) => x.code === 'E_PACKS_UNDELIVERED'), 'whitelisting packs/ must clear the refusal')
  } finally { rmSync(dir, { recursive: true, force: true }) }
})

test('every doctor fail id maps to a REGISTERED code (a prose-only fail is a bug)', () => {
  const registered = registeredCodes()
  for (const [id, code] of Object.entries(CODE_BY_ID)) {
    assert.ok(registered.has(code), `doctor id "${id}" maps to unregistered code "${code}"`)
  }
  assert.ok(Object.keys(CODE_BY_ID).length >= 10, 'the doctor maps a real set of fail ids')
})

test('every code a real failing doctor emits is registered', async () => {
  const registered = registeredCodes()
  const dir = scaffold()
  try {
    await run('new', dir)
    // Corrupt a package.json bin path: a real E_BIN_PATH from the doctor.
    const pkg = { name: 'x', bin: { x: './bin/missing.mjs' } }
    writeFileSync(join(dir, 'package.json'), JSON.stringify(pkg))
    const r = await run('doctor', dir)
    assert.equal(r.ok, false)
    assert.ok(r.refusals.length > 0, 'a corrupt tree refuses')
    for (const ref of r.refusals) {
      assert.ok(registered.has(ref.code), `doctor emitted an unregistered code ${ref.code}`)
    }
  } finally { rmSync(dir, { recursive: true, force: true }) }
})

test('a green lock returns a receipt with the grant row echoed', async () => {
  const dir = scaffold()
  try {
    await run('new', dir)
    refill(dir) // a green lock requires a filled tree: generated green is never shipped
    const r = await run('lock', dir, { grant: { kind: 'github-app', scope: 'dhaupin/harness-probe' } })
    assert.equal(r.ok, true, `lock should pass a freshly stamped tree (${JSON.stringify(r.refusals)})`)
    assert.equal(r.grant.kind, 'github-app')
    assert.equal(r.grant.scope, 'dhaupin/harness-probe')
    assert.equal(r.grant.spent, true, 'the grant row is marked spent for the ledger')
    assert.ok(r.receipt.archive, 'the lock receipt carries the archive name')
    assert.ok(r.receipt.sha, 'the lock receipt carries the checksum')
    assert.equal(r.refusals.length, 0)
    const gates = r.verdicts.map((v) => v.gate)
    assert.deepEqual(gates, ['monoforge doctor', 'monoforge lock'])
  } finally { rmSync(dir, { recursive: true, force: true }) }
})

test('a malformed grant is refused before any write', async () => {
  const dir = scaffold()
  try {
    const r = await run('lock', dir, { grant: { kind: '', scope: '' } })
    assert.equal(r.ok, false)
    assert.equal(r.refusals[0].code, 'E_GRANT_INVALID')
    assert.equal(r.grant, null)
  } finally { rmSync(dir, { recursive: true, force: true }) }
})

test('an unknown verb is refused with a registered code', async () => {
  const r = await run('frobnicate', '.')
  assert.equal(r.ok, false)
  assert.equal(r.refusals[0].code, 'E_VERB_UNKNOWN')
  assert.ok(registeredCodes().has('E_VERB_UNKNOWN'))
})

test('the CLI harness verb prints the structured result', async () => {
  const dir = scaffold()
  try {
    const { execFileSync } = await import('node:child_process')
    const out = execFileSync(process.execPath, [join(root, 'bin/forge.mjs'), 'harness', 'new', dir], { encoding: 'utf8' })
    const r = JSON.parse(out)
    assert.equal(r.verb, 'new')
    assert.equal(r.ok, true)
    assert.equal(r.receipt.name, 'harness-probe')
    assert.ok(existsSync(join(dir, 'README.md')), 'the stamp landed the tree')
  } finally { rmSync(dir, { recursive: true, force: true }) }
})
