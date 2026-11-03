// src/stamp.mjs - monoforge new: stamp a fleet repo from template blocks.
// The config (factory.json) is validated HARD before anything is written:
// a half-specified repo is refused, never half-created.
//
// Coexistence (monoforge#4): a re-stamp over a tree this factory already
// stamped (it carries our receipt) overlays only the files still matching the
// factory's last emission. A template path the host has edited since - a
// crashtest.config.js, an AGENTS house-rules edit, a CI lane - is skipped by
// name and never clobbered, so convergence never eats host state.
//
// Storage seam (monoforge#27): every filesystem touch goes through an injected
// adapter (src/fs-adapter.mjs). The default IS `node:fs` under Node, so the CLI
// is unchanged; a workers consumer passes `memoryFs()` to run the SAME engine
// with no disk (the coreforge fork's reason for existing). The engine core
// imports no `node:*` - paths come from src/paths.mjs and the receipt hash from
// src/sha256.mjs - so it bundles for workerd with no compat flag.
import { join, relative, dirname } from './paths.mjs'
import { getDefaultFs } from './fs-adapter.mjs'
import { sha256 } from './sha256.mjs'
import { resolveTemplate, resolveChain, TEMPLATES } from './templates.mjs'

// Pure-JS file-URL reader so the engine core imports no `node:*` (workerd
// bundleable). A worker consumer passes `root`, so this default is Node-only.
let ROOT_CACHE
const fileUrlToPath = (u) => decodeURIComponent(String(u).replace(/^file:\/\//, '').replace(/^\/([A-Za-z]:)/, '$1'))
const defaultRoot = () => (ROOT_CACHE ??= join(fileUrlToPath(new URL('..', import.meta.url))))
const defaultFs = () => {
  const fs = getDefaultFs()
  if (!fs) throw new Error('no storage adapter is set - pass { fs: memoryFs() } (see src/fs-adapter.mjs)')
  return fs
}

export function readFactoryConfig(dir, { fs = defaultFs() } = {}) {
  const cfgPath = join(dir, 'factory.json')
  if (!fs.existsSync(cfgPath)) {
    return { ok: false, code: 'E_CONFIG_MISSING', slot: 'factory.json', error: `no factory.json in ${dir}/ - monoforge new <dir> needs a config; see README for the schema` }
  }
  let cfg
  try { cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8')) } catch (e) {
    return { ok: false, code: 'E_CONFIG_INVALID', slot: 'factory.json', error: `factory.json is not valid JSON: ${e.message}` }
  }
  const required = ['name', 'species', 'pitch', 'description', 'siteDomain']
  const missing = required.filter((k) => typeof cfg[k] !== 'string' || !cfg[k].trim())
  if (missing.length) return { ok: false, code: 'E_FIELD_MISSING', slot: missing.join(', '), error: `factory.json missing required keys: ${missing.join(', ')}` }
  if (!/^[a-z0-9][a-z0-9-]*$/.test(cfg.name)) return { ok: false, code: 'E_ID_FORMAT', slot: 'name', error: `name must be kebab-case (got ${JSON.stringify(cfg.name)})` }
  if (!/^https:\/\//.test(cfg.siteDomain)) return { ok: false, code: 'E_SITE_DOMAIN', slot: 'siteDomain', error: 'siteDomain must be an absolute https URL (the landing domain)' }
  cfg.docsPath = typeof cfg.docsPath === 'string' && cfg.docsPath.trim() ? cfg.docsPath.trim() : `docs.creadev.org/${cfg.name}`
  cfg.version = typeof cfg.version === 'string' && /^\d+\.\d+(\.\d+)?$/.test(cfg.version) ? cfg.version : '0.9.0'
  cfg.docsHost = cfg.docsPath.split('/')[0]
  return { ok: true, cfg }
}

const STAMP_TOOL = 'monoforge'

// One token convention for the whole template layer: __TOKENS__ map to the
// authored factory config. (Dogfood fix, eyestruct 2026-10-24: the first
// non-monoforge stamp left raw __NAME__/__PITCH__ tokens and mutated the
// stamp-tool attribution, because the old map spoke two conventions.)
export function tokenReplacements(cfg, stampDate) {
  return [
    ['__NAME__', cfg.name],
    ['__SPECIES__', cfg.species],
    ['__PITCH__', cfg.pitch],
    ['__DESCRIPTION__', cfg.description],
    ['__DESCRIPTION_LONG__', cfg.description],
    ['__VERSION__', cfg.version],
    ['__SITE_URL__', cfg.siteDomain],
    ['__DOCS_URL__', cfg.docsPath],
    ['__STAMP_DATE__', stampDate],
    ['__STAMP_TOOL__', STAMP_TOOL],
  ]
}

export const stampToolName = STAMP_TOOL

// The receipt's per-file content hash (see src/sha256.mjs for why it is pure
// JS rather than `node:crypto`). Re-exported so the engine's public surface is
// unchanged.
export { sha256 }

// The receipt path a stamped tree carries. Its presence is what makes a
// non-empty directory a RE-STAMP rather than a stray dir to refuse.
export const RECEIPT = '.monoforge-stamp.json'

export function readReceipt(dir, { fs = defaultFs() } = {}) {
  const p = join(dir, RECEIPT)
  if (!fs.existsSync(p)) return null
  try {
    const r = JSON.parse(fs.readFileSync(p, 'utf8'))
    return r && r.stampTool === STAMP_TOOL ? r : null
  } catch { return null }
}

export default async function stamp(dir, opts = {}) {
  const fs = opts.fs ?? defaultFs()
  const root = opts.root ?? defaultRoot()
  const cfgRes = readFactoryConfig(dir, { fs })
  if (!cfgRes.ok) return { ok: false, code: cfgRes.code, slot: cfgRes.slot, error: cfgRes.error }
  const cfg = cfgRes.cfg

  // A re-stamp overlays a tree this factory already stamped (it carries our
  // receipt). Any OTHER non-empty directory is refused: never half-merge a
  // stranger's content. The receipt's own identity is checked, so a re-stamp
  // can never silently rewrite a repo that answers to a different name.
  const receipt = readReceipt(dir, { fs })
  const restamp = Boolean(receipt)
  if (fs.existsSync(dir)) {
    const stray = fs.readdirSync(dir).filter((f) => !['factory.json', '.git'].includes(f))
    if (stray.length && !restamp) {
      return { ok: false, code: 'E_STRAY_DIR', slot: dir, error: `${dir} already contains ${stray.join(', ')} - run in an empty directory holding only factory.json` }
    }
    if (restamp && receipt.name && receipt.name !== cfg.name) {
      return { ok: false, code: 'E_IDENTITY_DRIFT', slot: 'name', error: `${dir} was stamped as "${receipt.name}" - refusing to re-stamp it as "${cfg.name}" (identity drift is not a re-stamp)` }
    }
  }
  // Resolve the profile's chain (children first, parent wins on collision) and
  // copy the composed file set. `factory.json.profile` selects the profile;
  // it defaults to the full scaffold. An unknown profile refuses by name, the
  // same law as a bad config.
  const profile = typeof cfg.profile === 'string' && cfg.profile.trim() ? cfg.profile.trim() : 'monoforge'
  if (!TEMPLATES[profile]) {
    return { ok: false, code: 'E_PROFILE_UNKNOWN', slot: 'profile', error: `factory.json profile "${profile}" is not a known profile (known: ${Object.keys(TEMPLATES).join(', ')})` }
  }
  let resolved
  try {
    resolved = resolveTemplate(profile, { fs, root })
  } catch (e) {
    return { ok: false, code: 'E_TEMPLATE_RESOLUTION', slot: profile, error: `template resolution failed: ${e.message}` }
  }
  if (resolved.size === 0) return { ok: false, code: 'E_TEMPLATE_EMPTY', slot: profile, error: `profile "${profile}" resolved to no files - the scaffold is missing templates/${profile}/` }

  fs.mkdirSync(dir, { recursive: true })
  // Coexistence: on a re-stamp, a template path whose on-disk bytes no longer
  // match the receipt's recorded hash is host-authored (crashtest.config.js,
  // scenario packs, an edited AGENTS/CI lane) - skip it, loudly, never bleed.
  // New template paths are copied; pristine ones are refreshed in place.
  const priorHashes = (restamp && receipt.hashes && typeof receipt.hashes === 'object') ? receipt.hashes : {}
  const skipped = []
  const copied = []
  for (const [rel, src] of resolved) {
    const dest = join(dir, rel)
    const exists = fs.existsSync(dest)
    if (exists && restamp) {
      const recorded = priorHashes[rel]
      const onDisk = sha256(fs.readFileSync(dest, 'utf8'))
      if (recorded && onDisk !== recorded) { skipped.push(rel); continue }
    }
    fs.mkdirSync(dirname(dest), { recursive: true })
    fs.copyFileSync(src, dest)
    copied.push(rel)
  }

  const stampDate = new Date().toISOString().slice(0, 10)
  const reps = tokenReplacements(cfg, stampDate)
  const touched = []
  let filled = 0
  // Only files this stamp actually emitted are token-filled: a skipped
  // host-authored file keeps its bytes verbatim (a re-stamp never rewrites
  // the host's state, not even a stray token in it).
  const walk = (d) => {
    for (const f of fs.readdirSync(d, { withFileTypes: true })) {
      const p = join(d, f.name)
      if (f.isDirectory()) { walk(p); continue }
      const rel = relative(dir, p)
      if (restamp && skipped.includes(rel)) continue
      if (restamp && !copied.includes(rel) && rel !== 'gitignore.tmpl') continue
      let s = fs.readFileSync(p, 'utf8')
      const before = s
      for (const [tok, val] of reps) s = s.replaceAll(tok, val)
      if (s !== before) { fs.writeFileSync(p, s); filled++ }
      touched.push(rel)
    }
  }
  walk(dir)
  // gitignore.tmpl -> .gitignore
  const gi = join(dir, 'gitignore.tmpl')
  if (fs.existsSync(gi)) {
    const giRel = '.gitignore'
    if (!(restamp && priorHashes[giRel] && sha256(fs.readFileSync(join(dir, giRel), 'utf8')) !== priorHashes[giRel])) {
      fs.writeFileSync(join(dir, giRel), fs.readFileSync(gi, 'utf8'))
    } else {
      skipped.push(giRel)
    }
    fs.rmSync(gi)
    if (!touched.includes(giRel)) touched.push(giRel)
  }
  // receipt: the record of what the stamp actually emitted. `files` keeps its
  // long-standing meaning - exactly the token-filled files - because the doctor
  // scopes its truth-slot scan to them, so prose that merely DOCUMENTS the
  // FORGE-TODO convention never self-flags. `hashes` is the new sibling: the
  // sha256 of every path the stamp touched, as the factory LAST emitted it,
  // which a later re-stamp reads to tell a pristine template file from a
  // host-authored one.
  const emitted = [...new Set([...touched, ...copied, ...skipped])].filter((rel) => fs.existsSync(join(dir, rel)))
  const hashes = {}
  for (const rel of emitted) {
    try { hashes[rel] = sha256(fs.readFileSync(join(dir, rel), 'utf8')) } catch {}
  }
  // A skipped (host-authored) template path keeps the factory's LAST recorded
  // emission hash - not its own bytes - so every future re-stamp still reads
  // it as host-owned and leaves it alone. Overwriting with the host's bytes
  // would make it look pristine next time and get clobbered.
  for (const rel of skipped) {
    if (priorHashes[rel]) hashes[rel] = priorHashes[rel]
  }
  fs.writeFileSync(join(dir, RECEIPT), JSON.stringify({
    stampTool: STAMP_TOOL,
    name: cfg.name,
    version: cfg.version,
    date: stampDate,
    files: touched,
    hashes,
  }, null, 2) + '\n')
  return { ok: true, dir, filled, manifest: touched.length, skipped, restamp, cfg }
}
