// forge-shapes - the check-profile pack over a monoforge-stamped tree
// (monoforge#3). Pure reads: it opens the receipt and the files the receipt
// names, and reports what it finds. Zero network, zero writes.
//
// Why a pack when the doctor already checks this: the doctor is monoforge's
// own inline catalog, hard-wired to the factory. A pack is the PORTABLE
// judgment - the same claims, re-runnable by any host that loads it, against
// any stamped tree. The two are twins on purpose; the pack is the one that
// travels.
//
// THE CONTRACT with the target (ctx.forgeTree):
//   root                 -> absolute path to the stamped tree, or null (the
//                           pack then dockets one BOUNDED row and audits
//                           nothing - an absent target is never a pass)
//   exists(rel)          -> boolean
//   text(rel)            -> string | null
//
// Verdict taxonomy (family): PASSED / BOUNDED / EXPLOITED. BOUNDED never
// reads as green.

export const PKG = 'packs/public/forge-shapes'
export const REQUIRED_KEYS = ['forgeTree']

const PACK = 'forge-shapes'
const TODO_MARK = 'FORGE-TODO'

class Verdicts {
  constructor() { this.rows = [] }
  passed(id, detail) { this.rows.push({ pack: PACK, id, verdict: 'PASSED', detail: String(detail || '').slice(0, 220) }) }
  bounded(id, bound, detail) { this.rows.push({ pack: PACK, id, verdict: 'BOUNDED', bound, detail: String(detail || '').slice(0, 220) }) }
  failed(id, fault) { this.rows.push({ pack: PACK, id, verdict: 'EXPLOITED', detail: String(fault.problem || JSON.stringify(fault)).slice(0, 220), fault }) }
  get ok() { return !this.rows.some((r) => r.verdict === 'EXPLOITED') }
}

function take(ctx, key) {
  const value = ctx?.[key]
  if (value === undefined) throw new TypeError(`${PKG}: ctx[${JSON.stringify(key)}] is missing - the runner did not arm the ${key} contract`)
  return value
}

// The check ids this pack declares (SPEC section 7 census; the check profile's
// `checks[]`). Kept in sync with the run() bodies below - a drift here is a
// missing id, caught by the pack's own fixtures.
export const checks = [
  { id: 'forge/receipt-present' },
  { id: 'forge/receipt-files-exist' },
  { id: 'forge/truth-slot-clean' },
  { id: 'forge/stamp-token-clean' },
  { id: 'forge/package-paths' },
  { id: 'forge/publish-gate' },
]

export function run(ctx) {
  for (const key of REQUIRED_KEYS) take(ctx, key)
  const v = new Verdicts()
  const tree = ctx.forgeTree

  if (!tree || tree.root == null) {
    v.bounded('forge/receipt-present', 'target-tree-absent', 'no stamped tree armed (set FORGE_TREE) - nothing was audited, nothing was passed')
    return { ok: v.ok, rows: v.rows }
  }

  // --- receipt-present: the receipt ships and parses ---
  const raw = tree.text('.monoforge-stamp.json')
  if (raw == null) {
    v.failed('forge/receipt-present', { problem: 'no .monoforge-stamp.json - the tree carries no stamp receipt, so nothing here proves it was minted by the factory' })
    return { ok: v.ok, rows: v.rows }
  }
  let receipt
  try {
    receipt = JSON.parse(raw)
  } catch (err) {
    v.failed('forge/receipt-present', { problem: `.monoforge-stamp.json is unparseable: ${err.message}` })
    return { ok: v.ok, rows: v.rows }
  }
  const files = Array.isArray(receipt.files) ? receipt.files : []
  if (!receipt.name || !files.length) {
    v.failed('forge/receipt-present', { problem: `receipt is missing its identity or file list (name=${JSON.stringify(receipt.name)}, files=${files.length})` })
    return { ok: v.ok, rows: v.rows }
  }
  v.passed('forge/receipt-present', `receipt for "${receipt.name}" lists ${files.length} file(s)`)

  // --- receipt-files-exist: every file the receipt claims is on disk ---
  const missing = files.filter((f) => !tree.exists(f))
  if (missing.length) {
    v.failed('forge/receipt-files-exist', { problem: 'the receipt claims files that do not ship - a receipt is a promise about bytes', missing })
  } else {
    v.passed('forge/receipt-files-exist', `all ${files.length} receipted file(s) exist`)
  }

  // --- truth-slot-clean / stamp-token-clean: the shipped-placeholder law ---
  const todoFiles = []
  const tokenFiles = []
  for (const rel of files) {
    const text = tree.text(rel)
    if (text == null) continue
    const n = (text.match(new RegExp(TODO_MARK, 'g')) || []).length
    if (n) todoFiles.push({ file: rel, count: n })
    const rawTokens = text.match(/__[A-Z][A-Z0-9_]*__/g) || []
    if (rawTokens.length) tokenFiles.push({ file: rel, tokens: [...new Set(rawTokens)] })
  }
  if (todoFiles.length) {
    v.failed('forge/truth-slot-clean', { problem: 'a receipted file still carries a FORGE-TODO truth slot - a shipped placeholder is a shipped lie', files: todoFiles })
  } else {
    v.passed('forge/truth-slot-clean', `${files.length} receipted file(s): no unfilled FORGE-TODO slot`)
  }
  if (tokenFiles.length) {
    v.failed('forge/stamp-token-clean', { problem: 'a receipted file still carries a raw __TOKEN__ - the stamp never finished', files: tokenFiles })
  } else {
    v.passed('forge/stamp-token-clean', `${files.length} receipted file(s): no raw stamp token survived`)
  }

  // --- package-paths: bin / exports / files entries all resolve ---
  const pkgRaw = tree.text('package.json')
  if (pkgRaw == null) {
    v.bounded('forge/package-paths', 'package-json-absent', 'no package.json in the tree - this check cannot fire, so it does not pass')
  } else {
    let pkg
    try { pkg = JSON.parse(pkgRaw) } catch (err) {
      v.failed('forge/package-paths', { problem: `package.json is unparseable: ${err.message}` })
      pkg = null
    }
    if (pkg) {
      const broken = []
      for (const [name, b] of Object.entries(pkg.bin || {})) if (!tree.exists(b)) broken.push({ key: `bin.${name}`, path: b })
      for (const [key, val] of Object.entries(pkg.exports || {})) {
        const p = typeof val === 'string' ? val : val?.import
        if (p && !p.includes('*') && !tree.exists(p)) broken.push({ key: `exports.${key}`, path: p })
      }
      for (const f of pkg.files || []) {
        if (f.startsWith('!') || f.includes('*')) continue
        if (!tree.exists(f)) broken.push({ key: 'files', path: f })
      }
      if (broken.length) v.failed('forge/package-paths', { problem: 'a package.json bin/exports/files entry does not resolve (the crashtest#16 class)', broken })
      else v.passed('forge/package-paths', 'every bin/exports/files entry resolves')
    }
  }

  // --- publish-gate: 0.x refusal present, no publish token ---
  const pub = tree.text('.github/workflows/publish.yml')
  if (pub == null) {
    v.bounded('forge/publish-gate', 'publish-workflow-absent', 'no .github/workflows/publish.yml - a tree without a publish lane has no gate to grade')
  } else {
    const refusesZero = /startsWith\(['"]v0\.|0\.\*\)/.test(pub)
    const codeLines = pub.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n')
    const hasToken = /secrets\.NPM_TOKEN|NODE_AUTH_TOKEN/.test(codeLines)
    if (!refusesZero || hasToken) {
      v.failed('forge/publish-gate', {
        problem: 'the publish workflow does not refuse 0.x refs, or references a publish token (the family law is OIDC trusted publishing only)',
        refusesZero,
        hasToken,
      })
    } else {
      v.passed('forge/publish-gate', 'publish.yml refuses 0.x refs and carries no publish token')
    }
  }

  return { ok: v.ok, rows: v.rows }
}

export default { checks, run, PKG, REQUIRED_KEYS }
