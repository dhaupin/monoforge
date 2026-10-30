'use strict'

// The web rig's import-closure gate.
//
// monoforge's `web/` landed from the flowforge rig, but its AppLayout.jsx and
// AppIslands.jsx arrived as eyestruct's versions: they imported pages/Packs.jsx,
// pages/Status.jsx, and two island components that were never copied. Rollup
// cannot resolve a missing module, so `prestruct build` died at the first
// dangling specifier - which is exactly why the Cloudflare Pages check was red
// on main AND on the PR, while every Node lane stayed green (the battery never
// builds web/). A missing import is a hard build break, not a lint nit, so the
// gate is a closure check: every relative specifier under web/src must resolve
// to a file on disk. Caught here, by name, instead of at the host.

const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const SRC = path.join(__dirname, '..', 'web', 'src')

function walk(dir) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(p))
    else if (/\.(jsx?|mjs)$/.test(entry.name)) out.push(p)
  }
  return out
}

function resolves(fromFile, spec) {
  const base = path.resolve(path.dirname(fromFile), spec)
  const candidates = [
    base,
    `${base}.js`, `${base}.jsx`, `${base}.mjs`,
    path.join(base, 'index.js'), path.join(base, 'index.jsx'),
  ]
  return candidates.some((c) => fs.existsSync(c) && fs.statSync(c).isFile())
}

test('every relative import under web/src resolves on disk', () => {
  assert.ok(fs.existsSync(SRC), `web/src is missing at ${SRC}`)
  const dangling = []
  for (const file of walk(SRC)) {
    const source = fs.readFileSync(file, 'utf8')
    for (const m of source.matchAll(/from\s+['"](\.[^'"]+)['"]/g)) {
      if (!resolves(file, m[1])) {
        dangling.push(`${path.relative(SRC, file)} -> ${m[1]}`)
      }
    }
  }
  assert.deepEqual(
    dangling,
    [],
    `dangling import(s) break the prestruct/Rollup build:\n  ${dangling.join('\n  ')}`,
  )
})

test('the gate refuses a dangling specifier by name (the shape that shipped)', () => {
  const dir = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'monoforge-web-'))
  fs.writeFileSync(path.join(dir, 'AppLayout.jsx'), "import Home from './pages/Status.jsx'\n")
  fs.mkdirSync(path.join(dir, 'pages'))
  fs.writeFileSync(path.join(dir, 'pages', 'Home.jsx'), 'export default 1\n')

  const dangling = []
  for (const file of walk(dir)) {
    const source = fs.readFileSync(file, 'utf8')
    for (const m of source.matchAll(/from\s+['"](\.[^'"]+)['"]/g)) {
      if (!resolves(file, m[1])) dangling.push(m[1])
    }
  }
  fs.rmSync(dir, { recursive: true, force: true })
  assert.deepEqual(dangling, ['./pages/Status.jsx'])
})
