// test/workers-compat.test.mjs - the workers storage adapter lane (monoforge#27).
//
// The coreforge rig vendored a fork of the stamp engine only because workerd has
// no `node:fs`. This test proves the upstream seam retires that fork:
//
//   1. PARITY - the real `templates/` tree, read from disk into `memoryFs()`,
//      resolves to the SAME file set as the on-disk walk. Same chain, same
//      override rule, same payload - the adapter changes the storage, never the
//      truth machinery.
//   2. IN-MEMORY STAMP - a whole stamp runs with NO disk: factory config read,
//      template walk, copy, token fill, gitignore rename, manifest write - all
//      through `memoryFs()`, asserted by reading the result back through the
//      same adapter.
//   3. WORKERD BUNDLE - the engine bundled for workerd (platform neutral) carries
//      NO static `node:fs` import and stamps through `memoryFs()` with an
//      explicit root, i.e. exactly the code the /api/stamp-canary Function runs.
//
// No mocks: `memoryFs()` is a real adapter and the bundle is the real artifact.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import '../src/fs-node.mjs' // install the node:fs default adapter (the engine core is runtime-agnostic)

const root = join(fileURLToPath(new URL('..', import.meta.url)))

// Read a real template tree off disk into a plain map, so it can be seeded into
// memoryFs under an arbitrary in-memory root.
function readTreeInto(dir, prefix = '') {
  const out = {}
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${e.name}` : e.name
    const abs = join(dir, e.name)
    if (e.isDirectory()) Object.assign(out, readTreeInto(abs, rel))
    else out[rel] = readFileSync(abs, 'utf8')
  }
  return out
}

function seedTemplates(memoryFs) {
  const seed = {}
  for (const profile of ['monoforge', 'monoforge-headless']) {
    const tree = readTreeInto(join(root, 'templates', profile))
    for (const [rel, body] of Object.entries(tree)) seed[`/tpl/templates/${profile}/${rel}`] = body
  }
  return memoryFs(seed)
}

const CANARY_FACTORY = {
  name: 'workers-canary',
  species: 'stamp canary',
  pitch: 'Proves the storage adapter runs the engine with no disk.',
  description: 'A synthetic repo stamped entirely in memory to prove the workers storage adapter lane.',
  siteDomain: 'https://workers-canary.creadev.org',
}

test('the pure-JS sha256 matches node:crypto byte-for-byte (the receipt hash)', async () => {
  const { sha256 } = await import(join(root, 'src/sha256.mjs'))
  const { createHash } = await import('node:crypto')
  const cases = ['', 'abc', 'hello world', 'x'.repeat(1000), JSON.stringify({ a: 1, b: [2, 3] }), 'é ü ñ 😀 emoji', 'x'.repeat(55), 'x'.repeat(56), 'x'.repeat(64), 'x'.repeat(119)]
  for (const c of cases) {
    assert.equal(sha256(c), createHash('sha256').update(c).digest('hex'), `sha256 mismatch for ${JSON.stringify(c.slice(0, 12))}`)
  }
})

test('memoryFs resolves the REAL template chain to the same file set as disk', async () => {
  const { memoryFs } = await import(join(root, 'src/fs-adapter.mjs'))
  const { resolveTemplate } = await import(join(root, 'src/templates.mjs'))
  const fs = seedTemplates(memoryFs)
  const fromDisk = resolveTemplate('monoforge')
  const fromMemory = resolveTemplate('monoforge', { fs, root: '/tpl' })
  assert.deepEqual([...fromMemory.keys()].sort(), [...fromDisk.keys()].sort(), 'in-memory resolution must match the disk walk exactly')
})

test('a whole stamp runs in memory: config, walk, tokens, gitignore, manifest', async () => {
  const { memoryFs } = await import(join(root, 'src/fs-adapter.mjs'))
  const stamp = (await import(join(root, 'src/stamp.mjs'))).default
  const fs = seedTemplates(memoryFs)
  fs.writeFileSync('/out/factory.json', JSON.stringify(CANARY_FACTORY))

  const res = await stamp('/out', { fs, root: '/tpl' })
  assert.equal(res.ok, true, `in-memory stamp should succeed (got ${res.error || ''})`)

  const readme = fs.readFileSync('/out/README.md', 'utf8')
  assert.match(readme, /workers-canary/, 'tokens filled from the factory config')
  assert.doesNotMatch(readme, /__NAME__|__PITCH__/, 'no raw tokens survive the fill')
  assert.ok(fs.existsSync('/out/.gitignore'), 'gitignore.tmpl renamed to .gitignore in memory')
  assert.ok(!fs.existsSync('/out/gitignore.tmpl'), 'the template file is gone after the rename')
  assert.ok(fs.existsSync('/out/.monoforge-stamp.json'), 'the stamp manifest landed')
  assert.ok(fs.existsSync('/out/.github/workflows/publish.yml'), 'the chained headless battery landed')
})

test('the workerd bundle carries no static node:fs and stamps through memoryFs', async () => {
  // Build the same artifact the Pages build produces.
  execFileSync(process.execPath, [join(root, 'web/scripts/build-canary.mjs')], { cwd: root, stdio: 'pipe' })
  const bundlePath = join(root, 'web/functions/_lib/monoforge-engine.mjs')
  assert.ok(existsSync(bundlePath), 'the canary bundle was built')
  const bundled = readFileSync(bundlePath, 'utf8')
  assert.doesNotMatch(bundled, /from\s*["']node:fs["']/, 'no static node:fs import in the workers bundle')
  assert.doesNotMatch(bundled, /require\(["']node:fs["']\)/, 'no require(node:fs) in the workers bundle')

  // Import the bundle as workerd would: `WebSocketPair` is defined there, which
  // is precisely the guard that keeps the Node default adapter (and its
  // `node:fs`) out of the module graph. Simulating it proves the same path a
  // worker takes - the bundle stamps purely through the adapter we pass.
  const hadPair = 'WebSocketPair' in globalThis
  const prevPair = globalThis.WebSocketPair
  globalThis.WebSocketPair = class WebSocketPair {}
  let mod
  try {
    mod = await import(bundlePath)
  } finally {
    if (hadPair) globalThis.WebSocketPair = prevPair
    else delete globalThis.WebSocketPair
  }
  const fs = seedTemplates(mod.memoryFs)
  fs.writeFileSync('/out/factory.json', JSON.stringify(CANARY_FACTORY))
  const res = await mod.stamp('/out', { fs, root: '/tpl' })
  assert.equal(res.ok, true, `the bundled engine must stamp in memory (got ${res.error || ''})`)
  assert.match(fs.readFileSync('/out/README.md', 'utf8'), /workers-canary/)
})

test('the deployed /api/stamp-canary Function stamps in memory and reports it', async () => {
  execFileSync(process.execPath, [join(root, 'web/scripts/build-canary.mjs')], { cwd: root, stdio: 'pipe' })

  // Import the Function as workerd would (WebSocketPair defined), then call its
  // handler exactly as the edge does. This is the fam-mount proof: the shipped
  // Function, not a paraphrase of it, runs the engine with no disk.
  const hadPair = 'WebSocketPair' in globalThis
  const prevPair = globalThis.WebSocketPair
  globalThis.WebSocketPair = class WebSocketPair {}
  let handler
  try {
    handler = (await import(join(root, 'web/functions/api/stamp-canary.js'))).onRequestGet
  } finally {
    if (hadPair) globalThis.WebSocketPair = prevPair
    else delete globalThis.WebSocketPair
  }
  assert.equal(typeof handler, 'function', 'the canary Function exports onRequestGet')

  const res = await handler()
  assert.equal(res.status, 200)
  const body = await res.json()
  assert.equal(body.ok, true, `canary must succeed (got ${body.error || ''})`)
  assert.equal(body.lane, 'workers-storage-adapter')
  assert.equal(body.stamped.readmeFilled, true, 'tokens filled in memory')
  assert.equal(body.stamped.gitignoreMaterialized, true, 'gitignore.tmpl renamed in memory')
  assert.equal(body.stamped.manifestWritten, true, 'stamp manifest written in memory')
  assert.equal(body.stamped.chainResolved, true, 'the profile chain resolved in memory')
})
