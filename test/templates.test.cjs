// test/templates.test.cjs - the template registry + chain resolver, both ways.
//
// The template layer is what `stamp` copies. A profile CHAINS its children
// (coreforge/vant shape): children first, parent wins on a path collision, a
// cycle refuses by name. These asserts pin that contract with real files on
// disk, no mocks.
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const root = path.join(__dirname, '..')
const mod = path.join(root, 'src', 'templates.mjs')

async function load() {
  // Install the node:fs default adapter (the engine core is runtime-agnostic;
  // see src/fs-adapter.mjs) before resolving templates off disk.
  await import(pathToFileURL(path.join(root, 'src', 'fs-node.mjs')).href)
  // Fresh import each time so a test that mutates the registry does not leak.
  return import(pathToFileURL(mod).href + '?t=' + Math.random())
}
const { pathToFileURL } = require('node:url')

test('the registry declares monoforge chaining monoforge-headless', async () => {
  const { TEMPLATES, resolveChain } = await load()
  assert.deepEqual(TEMPLATES.monoforge.chain, ['monoforge-headless'])
  assert.deepEqual(TEMPLATES['monoforge-headless'].chain, [])
  assert.deepEqual(resolveChain('monoforge'), ['monoforge-headless', 'monoforge'])
})

test('the composed profile carries the headless .github battery once (no drift copy)', async () => {
  const { resolveTemplate, resolveChain } = await load()
  const full = resolveTemplate('monoforge')
  const headless = resolveTemplate('monoforge-headless')
  for (const rel of headless.keys()) {
    assert.ok(full.has(rel), `composed profile is missing chained file ${rel}`)
  }
  // The battery comes from the headless profile only - one copy, not two.
  assert.ok(full.has('.github/workflows/test.yml'))
  assert.equal(resolveChain('monoforge').filter((p) => p === 'monoforge-headless').length, 1)
})

test('a profile file is never the TEMPLATE.md manifest (metadata, not payload)', async () => {
  const { resolveTemplate } = await load()
  for (const rel of resolveTemplate('monoforge').keys()) {
    assert.ok(!rel.endsWith('TEMPLATE.md'), `manifest leaked into the payload: ${rel}`)
  }
})

test('a parent overrides a child on a path collision (vant override rule)', async () => {
  const { TEMPLATES, resolveTemplate } = await load()
  // Plant a colliding file in both profiles, resolve, and assert the parent won.
  const childRel = 'docs/index.md'
  const childPath = path.join(root, 'templates', 'monoforge-headless', childRel)
  const parentPath = path.join(root, 'templates', 'monoforge', childRel)
  const parentOrig = fs.readFileSync(parentPath, 'utf8')
  fs.mkdirSync(path.dirname(childPath), { recursive: true })
  fs.writeFileSync(childPath, 'CHILD COPY\n')
  try {
    const resolved = resolveTemplate('monoforge')
    assert.equal(fs.readFileSync(resolved.get(childRel), 'utf8'), parentOrig, 'parent must win on collision')
  } finally {
    fs.rmSync(path.join(root, 'templates', 'monoforge-headless', 'docs'), { recursive: true, force: true })
  }
})

test('a chain cycle is refused by name, never resolved into a loop', async () => {
  const { TEMPLATES, resolveChain } = await load()
  TEMPLATES['monoforge-headless'].chain = ['monoforge']
  try {
    assert.throws(() => resolveChain('monoforge'), /cycle/)
  } finally {
    TEMPLATES['monoforge-headless'].chain = []
  }
})

test('an unknown profile refuses by name (never a silent empty stamp)', async () => {
  const { resolveChain } = await load()
  assert.throws(() => resolveChain('nope'), /unknown template profile/)
})

// The template layer ships workflows a stamp copies into a NEW repo, so a
// floating action ref here would seed the whole fleet with floats. The family
// pin guard scans root .github/workflows only (a byte-identical copy in every
// sibling), so the template tree needs its own teeth.
function floatingRefsIn(dir) {
  const out = []
  if (!fs.existsSync(dir)) return out
  for (const f of fs.readdirSync(dir).filter((n) => n.endsWith('.yml') || n.endsWith('.yaml'))) {
    const body = fs.readFileSync(path.join(dir, f), 'utf8')
    for (const line of body.split('\n')) {
      const m = line.match(/^\s*-?\s*uses:\s*(\S+)/)
      if (!m) continue
      const ref = m[1]
      if (ref.startsWith('./') || ref.startsWith('docker://')) continue
      const at = ref.lastIndexOf('@')
      const pin = at === -1 ? '' : ref.slice(at + 1)
      if (!/^[0-9a-f]{40}$/.test(pin)) out.push(`${f}: ${ref}`)
    }
  }
  return out
}

test('every template workflow action is SHA-pinned (a stamp never seeds a float)', () => {
  const dir = path.join(root, 'templates', 'monoforge-headless', '.github', 'workflows')
  assert.deepEqual(floatingRefsIn(dir), [], 'template workflow carries a floating action ref')
})

test('the template pin check bites both ways (a planted float is caught)', () => {
  const dir = path.join(root, 'templates', 'monoforge-headless', '.github', 'workflows')
  const planted = path.join(dir, 'zz-float-probe.yml')
  fs.writeFileSync(planted, 'jobs:\n  x:\n    steps:\n      - uses: actions/checkout@v4\n')
  try {
    assert.deepEqual(floatingRefsIn(dir), ['zz-float-probe.yml: actions/checkout@v4'])
  } finally {
    fs.rmSync(planted, { force: true })
  }
})
