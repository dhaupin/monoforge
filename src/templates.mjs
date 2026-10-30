// src/templates.mjs - the template registry and the CHAIN resolver.
//
// A template is a named profile of the fleet scaffold. Profiles CHAIN the way
// vant chains skills (docs/essential/extensibility.md) and the way coreforge
// chains its site profiles: a profile's TEMPLATE.md frontmatter carries a
// `chain:` list of child profiles, and the parent COMPOSES them rather than
// duplicating their files. `monoforge` chains `monoforge-headless`, so the CI
// battery (`.github/`) lives ONCE in the headless profile and the full stamp
// inherits it - one copy, no drift between the two shapes.
//
// Resolution mirrors vant's override rule: children first (depth-first, in
// `chain` order), then the parent's own files on top, so a parent file of the
// same path WINS. A cycle is refused, named.
//
//   node src/templates.mjs --list          the profiles + their chains
//   node src/templates.mjs --resolve NAME   print the resolved file set
//
// The registry is the source of truth for `stamp` (which copies a resolved
// profile into a new repo) and for the tests. It is the only place a profile
// is declared; adding one is one entry here.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = join(fileURLToPath(new URL('..', import.meta.url)))

// The profiles. `from` names the template dirs/files the stamp copies;
// `chain` names child profiles composed underneath this one. A leaf profile
// carries its files and chains nothing.
export const TEMPLATES = {
  // The full fleet scaffold: the docs system + gates + root docs + the labs /
  // horcrux convention + the Pages canary, chaining the CI battery. A stamped
  // repo gets the whole tree from one call.
  monoforge: {
    description: 'The full fleet scaffold - docs, gates, root docs, labs/horcrux, canary - chaining the CI battery.',
    chain: ['monoforge-headless'],
  },
  // CI only: the `.github/` battery (test / docs / publish). A repo that brings
  // its own docs tree still inherits the gates, the docs lane, and the release
  // ladder.
  'monoforge-headless': {
    description: 'CI only - the .github/ battery (test, docs, publish), no scaffold.',
    chain: [],
  },
}

// Parse a TEMPLATE.md manifest (vant SKILL.md shape: YAML frontmatter, then a
// human body). Returns { name, description, chain } or null when absent.
// Minimal frontmatter reader (no yaml dep - monoforge is zero-dependency):
// it understands the two shapes the manifests use, a scalar and a `- item`
// list.
export function parseManifest(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/)
  if (!m) return null
  const fm = m[1]
  const name = (fm.match(/^name:\s*(.+)$/m) || [])[1]?.trim()
  let description = (fm.match(/^description:\s*(.+)$/m) || [])[1]?.trim()
  if (description === '>' || description === '|') description = ''
  let chain = []
  const inline = fm.match(/^chain:\s*\[([^\]]*)\]/m)
  if (inline) {
    chain = inline[1].split(',').map((s) => s.trim()).filter(Boolean)
  } else {
    const block = fm.match(/^chain:\s*\n((?:[ \t]*-[ \t]*.+\n?)*)/m)
    if (block) chain = [...block[1].matchAll(/^[ \t]*-[ \t]*(.+)$/gm)].map((x) => x[1].trim())
  }
  return { name, description, chain }
}

// Resolve a profile's chain depth-first: children first (in order), then the
// profile itself. Parent overrides child on a path collision, which falls out
// of applying children before parents. A cycle or an unknown child refuses.
export function resolveChain(name, seen = []) {
  if (seen.includes(name)) {
    throw new Error(`template chain cycle: ${[...seen, name].join(' -> ')}`)
  }
  const cfg = TEMPLATES[name]
  if (!cfg) throw new Error(`unknown template profile "${name}" (known: ${Object.keys(TEMPLATES).join(', ')})`)
  const order = []
  for (const child of cfg.chain) order.push(...resolveChain(child, [...seen, name]))
  order.push(name)
  return order
}

// Load a profile's file map (rel -> source path) by walking templates/<name>/.
// TEMPLATE.md is forge metadata, not payload, so it is skipped.
export function loadProfile(name) {
  const dir = join(ROOT, 'templates', name)
  if (!existsSync(dir)) throw new Error(`template "${name}" is not present - the scaffold is missing templates/${name}/`)
  const files = new Map()
  const walk = (d, rel) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const r = rel ? `${rel}/${e.name}` : e.name
      if (e.isDirectory()) { walk(join(d, e.name), r); continue }
      if (r === 'TEMPLATE.md') continue
      files.set(r, join(d, e.name))
    }
  }
  walk(dir, '')
  return files
}

// Resolve a profile into the file map `stamp` copies: children first, then the
// parent, parent wins on collision (vant's override rule).
export function resolveTemplate(name) {
  const merged = new Map()
  for (const profile of resolveChain(name)) {
    for (const [rel, src] of loadProfile(profile)) merged.set(rel, src)
  }
  return merged
}

// CLI: --list / --resolve NAME, for eyeballing and for the tests.
if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const argv = process.argv.slice(2)
  if (argv.includes('--list')) {
    for (const [name, cfg] of Object.entries(TEMPLATES)) {
      console.log(`${name}: ${cfg.description}`)
      if (cfg.chain.length) console.log(`  chain: ${cfg.chain.join(', ')}`)
    }
    process.exit(0)
  }
  const i = argv.indexOf('--resolve')
  if (i !== -1) {
    const name = argv[i + 1]
    const files = resolveTemplate(name)
    for (const rel of [...files.keys()].sort()) console.log(rel)
    console.log(`# ${files.size} file(s) from ${resolveChain(name).join(' + ')}`)
    process.exit(0)
  }
  console.log('usage: node src/templates.mjs --list | --resolve <name>')
  process.exit(2)
}
