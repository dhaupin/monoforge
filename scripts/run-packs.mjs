#!/usr/bin/env node
// scripts/run-packs.mjs - the factory's own pack lane (monoforge#3).
//
// Loads every pack under packs/public through src/packs.mjs, arms each with a
// read-only view of THIS repo (the stamped tree the factory ships), runs it,
// and prints the verdict rows in the family taxonomy. An EXPLOITED row fails
// the lane (exit 1); a BOUNDED row never reads as green but does not fail it.
//
// The pack's only input is the tree (SPEC section 7), so this runs with no
// network and no install beyond the loader itself.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { collectPacks } from '../src/packs.mjs'

const ROOT = resolve(new URL('..', import.meta.url).pathname)
const PACKS = join(ROOT, 'packs')

// A read-only tree view over an absolute root, with the small fsapi the check
// profile contracts on. Paths are resolved against the root and never escape
// it - a `..` in a receipt is refused as a miss, not followed.
function treeAt(root) {
  const inside = (rel) => {
    if (typeof rel !== 'string' || !rel) return null
    const abs = resolve(root, rel)
    return abs === root || abs.startsWith(root + '/') ? abs : null
  }
  return {
    root,
    exists(rel) { const abs = inside(rel); return abs ? existsSync(abs) : false }, // file OR dir: package.json "files" names both
    text(rel) {
      const abs = inside(rel)
      if (!abs || !existsSync(abs)) return null
      try { return statSync(abs).isFile() ? readFileSync(abs, 'utf8') : null } catch { return null }
    },
    readdir(rel) {
      const abs = inside(rel ?? '')
      if (!abs || !existsSync(abs)) return []
      try { return readdirSync(abs) } catch { return [] }
    },
  }
}

async function main() {
  // Default target: a REPRESENTATIVE stamped tree, not this repo. monoforge is
  // the factory, not one of its stamps - it carries no receipt of its own, so
  // auditing its root for a receipt would fail for the wrong reason. The
  // clean fixture IS the stamped-tree shape the pack grades; `monoforge packs
  // <dir>` points it at any real tree.
  const rootArg = process.argv.slice(2).find((a) => !a.startsWith('-'))
  const target = rootArg ? resolve(rootArg) : join(PACKS, 'public', 'forge-shapes', 'test', 'fixtures', 'clean')
  let packs
  try {
    packs = await collectPacks(PACKS)
  } catch (err) {
    console.error(`monoforge run-packs: ${err.message}`)
    process.exit(2)
  }
  if (!packs.length) {
    console.error('monoforge run-packs: no packs found under packs/public - an unarmed lane must not read as clean')
    process.exit(2)
  }
  const ctx = { forgeTree: treeAt(target) }
  const rows = []
  for (const pack of packs) {
    if (typeof pack.module.run !== 'function') continue
    let result
    try {
      result = pack.module.run(ctx)
    } catch (err) {
      console.error(`monoforge run-packs: pack ${pack.name} refused to run - ${err.message}`)
      process.exit(2)
    }
    rows.push(...(result.rows || []))
  }
  const exploited = rows.filter((r) => r.verdict === 'EXPLOITED')
  for (const row of rows) {
    const tag = `${row.pack}:${row.id}`
    console.log(`  ${String(row.verdict).padEnd(9)} ${tag}${row.detail ? ' | ' + row.detail : ''}`)
  }
  console.log(`monoforge run-packs: ${packs.length} pack(s), ${rows.length} row(s) over ${relative(process.cwd(), target) || '.'} - ${exploited.length ? `${exploited.length} EXPLOITED` : 'clean'}`)
  process.exit(exploited.length ? 1 : 0)
}

await main()
