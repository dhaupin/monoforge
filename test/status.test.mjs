// test/status.test.mjs - the family status dialect battery (family-status@1).
//
// The emitter's behavior is pinned with temp-dir fixtures, and the real tree's
// emitted leg is re-derived against the live doctor so the dialect sits under
// CI the same way every other count here does. Behavior-only, temp dirs, no
// network.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from '../web/scripts/build-status.mjs'

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

// A minimal tree the emitter needs: a doctor module and a template bank.
function fixtureRepo({ doctorSrc, blocks }) {
  const root = mkdtempSync(join(tmpdir(), 'monoforge-status-'))
  mkdirSync(join(root, 'src'), { recursive: true })
  mkdirSync(join(root, 'templates'), { recursive: true })
  writeFileSync(join(root, 'src', 'doctor.mjs'), doctorSrc)
  for (const b of blocks) {
    mkdirSync(join(root, 'templates', b.name), { recursive: true })
    writeFileSync(join(root, 'templates', b.name, 'README.md'), '# block\n')
  }
  return root
}

const PASS_DOCTOR = 'export default async () => ({ counts: { fail: 0, warn: 0 }, findings: [], ok: true })\n'
const FAIL_DOCTOR = 'export default async () => ({ counts: { fail: 2, warn: 0 }, findings: [{ level: "fail" }, { level: "fail" }], ok: false })\n'

test('status: the dialect fields and leg derive from the truth battery', async () => {
  const root = fixtureRepo({ doctorSrc: PASS_DOCTOR, blocks: [{ name: 'site' }, { name: 'labs' }] })
  try {
    const s = await build(root)
    assert.equal(s.schema, 1)
    assert.equal(s.contract, 'family-status@1')
    assert.equal(s.repo, 'dhaupin/monoforge')
    assert.equal(s.site, 'https://monoforge.creadev.org/status')
    assert.ok(s.docs.startsWith('https://docs.creadev.org/monoforge'))
    assert.deepEqual(s.legs[0], {
      leg: 'doctor', verdict: 'PASS', cases: 0, counts: { FAIL: 0, WARN: 0 }, ledger: 'monoforge doctor (src/doctor.mjs)',
    })
    // each template block is one pack row, counted from the tree
    assert.deepEqual(s.packs.map((p) => p.name), ['labs', 'site'])
    for (const p of s.packs) assert.equal(p.cases, 1)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('status: a failing battery degrades the leg to RED (never a fake PASS)', async () => {
  const root = fixtureRepo({ doctorSrc: FAIL_DOCTOR, blocks: [{ name: 'site' }] })
  try {
    const s = await build(root)
    assert.equal(s.legs[0].verdict, 'RED')
    assert.equal(s.legs[0].counts.FAIL, 2)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('status: the emitter refuses a factory with no template blocks loudly', async () => {
  const root = fixtureRepo({ doctorSrc: PASS_DOCTOR, blocks: [] })
  try {
    await assert.rejects(() => build(root), /zero blocks/)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('status: the real tree emits the live doctor verdict and counts its blocks', async () => {
  const s = await build(REPO_ROOT)
  assert.equal(s.legs[0].leg, 'doctor')
  assert.equal(s.legs[0].verdict, 'PASS')
  assert.ok(s.packs.length > 0, 'monoforge ships template blocks')
  for (const p of s.packs) assert.ok(p.cases > 0, `block ${p.name} must carry files`)
})
