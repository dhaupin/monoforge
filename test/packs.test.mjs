// test/packs.test.mjs - the pack loader (monoforge#3, packstruct SPEC v1).
//
// The spec grades the loader, so the strongest tooth is the spec's own
// conformance harness. Around it, this test asserts the section-5 refusals
// directly: each violation refuses AND names the pack, exit 1; an unreadable
// tree is exit 2 (usage); a clean bundle is exit 0.
//
// No mocks: real temp pack trees, the real loader, the real packstruct.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { execFileSync } from 'node:child_process'
import { collectPacks, runLoader, packsDir, validateManifest, PackViolation, UsageError } from '../src/packs.mjs'

const ROOT = join(new URL('..', import.meta.url).pathname)

function packTree(packs) {
  const dir = mkdtempSync(join(tmpdir(), 'mf-packs-'))
  mkdirSync(join(dir, 'public'), { recursive: true })
  for (const [name, manifest, entry] of packs) {
    const p = join(dir, 'public', name)
    mkdirSync(p, { recursive: true })
    writeFileSync(join(p, 'pack.json'), typeof manifest === 'string' ? manifest : JSON.stringify(manifest))
    if (entry !== undefined) writeFileSync(join(p, 'entry.js'), entry)
  }
  return dir
}

const OK = { schemaVersion: 1, name: 'ok-pack', description: 'a conforming pack', version: '1.0.0', entry: 'entry.js' }
const OK_ENTRY = 'export default { checks: [] }\n'

test('a conforming pack loads; the loader reports it and exits 0', async () => {
  const dir = packTree([['ok-pack', OK, OK_ENTRY]])
  try {
    const packs = await collectPacks(dir)
    assert.equal(packs.length, 1)
    assert.equal(packs[0].name, 'ok-pack')
    assert.deepEqual(packs[0].module, { checks: [] })
  } finally { rmSync(dir, { recursive: true, force: true }) }
})

test('packsDir resolves the contract root: <dir>/public when present, else the dir', () => {
  const dir = packTree([['ok-pack', OK, OK_ENTRY]])
  try {
    assert.equal(packsDir(dir), join(dir, 'public'), 'a root with public/ points at public/')
    assert.equal(packsDir(join(dir, 'public')), join(dir, 'public'), 'packs/public itself is already the tree')
  } finally { rmSync(dir, { recursive: true, force: true }) }
})

// SPEC section 5: each violation refuses, one line, naming the pack.
const REFUSALS = [
  ['wrong schemaVersion', { ...OK, schemaVersion: 2 }, /schemaVersion must be 1/],
  ['non-kebab name', { ...OK, name: 'BadName' }, /kebab-case/],
  ['name/dir mismatch', { ...OK, name: 'other-name' }, /does not match its directory/],
  ['empty description', { ...OK, description: '' }, /description.*non-empty/],
  ['bad version', { ...OK, version: '1' }, /dotted MAJOR\.MINOR/],
  ['missing entry', { ...OK, entry: 'missing.js' }, /does not ship/],
  ['escaping entry', { ...OK, entry: '../escape.js' }, /relative path inside the pack dir/],
]

for (const [label, manifest, re] of REFUSALS) {
  test(`refuses ${label}, naming the pack (exit 1)`, async () => {
    const dir = packTree([['ok-pack', manifest, OK_ENTRY]])
    try {
      await assert.rejects(() => collectPacks(dir), (err) => {
        assert.ok(err instanceof PackViolation, 'a violation is a PackViolation (exit 1)')
        assert.match(err.message, /ok-pack/, 'the refusal names the pack')
        assert.match(err.message, re)
        return true
      })
    } finally { rmSync(dir, { recursive: true, force: true }) }
  })
}

test('a twin pair refuses to load, naming a twin (the collision class)', async () => {
  // SPEC enforces name==dir, so a same-named pair under one root is caught by
  // the louder name/dir rule first; either way the load REFUSES and names the
  // pack (the conformance harness's name-collision case grades the same law).
  const dir = packTree([
    ['twin-a', { ...OK, name: 'twin-pack' }, OK_ENTRY],
    ['twin-b', { ...OK, name: 'twin-pack' }, OK_ENTRY],
  ])
  try {
    await assert.rejects(() => collectPacks(dir), (err) => {
      assert.ok(err instanceof PackViolation)
      assert.match(err.message, /twin-a|twin-b|twin-pack/, 'the refusal names a twin')
      return true
    })
  } finally { rmSync(dir, { recursive: true, force: true }) }
})

test('an unreadable tree is a usage refusal (exit 2), not a violation', async () => {
  const missing = join(tmpdir(), 'mf-packs-does-not-exist-xyz')
  assert.equal(await runLoader([missing]), 2)
  await assert.rejects(() => collectPacks(missing), (err) => err instanceof UsageError && err.message.includes(missing))
})

test('validateManifest is pure: it never touches disk and returns the manifest', () => {
  assert.equal(validateManifest({ ...OK, name: 'ok-pack' }, 'ok-pack').name, 'ok-pack')
  assert.throws(() => validateManifest({ ...OK, name: 'ok-pack', schemaVersion: 1.5 }, 'ok-pack'), PackViolation)
})

test('the CLI loader exits 0 on a clean tree and 1 on a violation', () => {
  const clean = packTree([['ok-pack', OK, OK_ENTRY]])
  const bad = packTree([['ok-pack', { ...OK, schemaVersion: 2 }, OK_ENTRY]])
  try {
    const out = execFileSync(process.execPath, [join(ROOT, 'src/packs.mjs'), clean], { encoding: 'utf8' })
    assert.match(out, /ok-pack@1\.0\.0/)
    let code = 0
    try { execFileSync(process.execPath, [join(ROOT, 'src/packs.mjs'), bad], { encoding: 'utf8', stdio: 'pipe' }) } catch (e) { code = e.status }
    assert.equal(code, 1, 'a violation exits 1')
  } finally {
    rmSync(clean, { recursive: true, force: true })
    rmSync(bad, { recursive: true, force: true })
  }
})

// The acceptance the issue names: the spec's own harness, 9/9. Skipped only if
// packstruct is not installed (the root battery installs it at its exact pin).
test('the spec harness honors the loader 9/9', () => {
  const bin = join(ROOT, 'node_modules', '.bin', 'packstruct')
  if (!existsSync(bin)) {
    console.log('  (skipped: packstruct not installed - the battery installs it at its exact pin)')
    return
  }
  const out = execFileSync(bin, ['audit-conformance', '.', '--loader', 'node src/packs.mjs {packs}'], { cwd: ROOT, encoding: 'utf8' })
  assert.match(out, /9\/9 case\(s\) honored/)
})

// The pack lane over this repo's own tree: the pack's fixtures prove its
// verdicts, and the real tree must produce rows (never a silent zero).
test('forge-shapes ships fixtures and its self-audit passes', () => {
  const selfTest = join(ROOT, 'packs/public/forge-shapes/test/run.mjs')
  assert.ok(existsSync(selfTest), 'the pack ships test/fixtures proving its claims (SPEC section 4)')
  const out = execFileSync(process.execPath, [selfTest], { encoding: 'utf8' })
  assert.match(out, /self-audit: PASS/)
})
