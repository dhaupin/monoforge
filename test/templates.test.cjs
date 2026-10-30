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
