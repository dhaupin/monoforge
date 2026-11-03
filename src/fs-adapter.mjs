// src/fs-adapter.mjs - the storage seam for the stamp engine.
//
// The stamp engine touches the filesystem through one narrow surface: does a
// path exist, read/write a file, make a directory, list a directory, remove a
// path, copy a file, stat a path. Under Node those are `node:fs`; under a
// Cloudflare Worker (workerd) there is no `node:fs` at all, which is why the
// coreforge rig vendored a fork that swapped the boundary for an in-memory map.
// This module is that swap, made upstream.
//
// This file imports NOTHING from `node:fs` on purpose: the engine modules
// (stamp.mjs, templates.mjs) and this adapter must be bundleable for workerd.
// The Node default lives in `fs-node.mjs`, which installs itself through
// `setDefaultFs` — so the engine's default is real disk under Node and unset
// under a worker (where the caller passes `memoryFs()` explicitly).
//
// The adapter contract (a structural subset of `node:fs`, so the Node default
// is the real module, not a wrapper):
//
//   existsSync(path) -> boolean
//   readFileSync(path, enc?) -> string | Uint8Array
//   writeFileSync(path, data, enc?)
//   mkdirSync(path, { recursive })
//   readdirSync(path, { withFileTypes }) -> [{ name, isDirectory(), isFile() }]
//   rmSync(path, { recursive, force })
//   copyFileSync(src, dest)
//   statSync(path) -> { isDirectory(), isFile() }
//
// Paths are POSIX strings; the memory adapter normalizes separators so a caller
// never branches on which adapter is in play.

// The methods the engine is allowed to call. Kept as data so a consumer (or a
// test) can assert an adapter is complete rather than discover a hole mid-stamp.
export const FS_ADAPTER_METHODS = [
  'existsSync', 'readFileSync', 'writeFileSync', 'mkdirSync',
  'readdirSync', 'rmSync', 'copyFileSync', 'statSync',
]

// The process-wide default, installed by the Node entry (fs-node.mjs). Null
// under a worker, which is the signal to the engine that an adapter is owed.
let defaultFs = null
export function setDefaultFs(adapter) { defaultFs = adapter }
export function getDefaultFs() { return defaultFs }

const normalize = (p) => {
  const s = String(p).replace(/\\/g, '/').replace(/\/+/g, '/')
  if (s.length > 1 && s.endsWith('/')) return s.slice(0, -1)
  return s === '' ? '/' : s
}

const parentOf = (p) => {
  const i = p.lastIndexOf('/')
  return i <= 0 ? '/' : p.slice(0, i)
}

/**
 * An in-memory adapter with the same contract as `node:fs`. `initial` seeds the
 * tree: `{ '/path/file.txt': 'contents' }` — every parent directory is created
 * implicitly. Values may be strings (UTF-8) or Uint8Array (binary).
 *
 * Workers use this because `node:fs` does not exist under workerd; tests use it
 * to prove a whole stamp runs with no disk at all.
 */
export function memoryFs(initial = {}) {
  const nodes = new Map() // path -> { dir: true } | { dir: false, data }

  const put = (rawPath, data) => nodes.set(normalize(rawPath), { dir: false, data })
  const ensureDir = (rawPath) => {
    const p = normalize(rawPath)
    if (p === '/' || nodes.has(p)) return
    ensureDir(parentOf(p))
    nodes.set(p, { dir: true })
  }

  for (const [path, data] of Object.entries(initial)) {
    ensureDir(parentOf(normalize(path)))
    put(path, typeof data === 'string' ? new TextEncoder().encode(data) : data)
  }

  const readFileSync = (path, enc) => {
    const node = nodes.get(normalize(path))
    if (!node || node.dir) throw Object.assign(new Error(`ENOENT: no such file, '${path}'`), { code: 'ENOENT' })
    if (enc === 'utf8' || enc === 'utf-8') return new TextDecoder().decode(node.data)
    return node.data
  }

  return {
    memory: true,
    existsSync: (path) => nodes.has(normalize(path)),
    readFileSync,
    writeFileSync: (path, data, enc) => {
      ensureDir(parentOf(normalize(path)))
      const bytes = typeof data === 'string'
        ? new TextEncoder().encode(data)
        : data instanceof Uint8Array ? data : new TextEncoder().encode(String(data))
      void enc
      put(path, bytes)
    },
    mkdirSync: (path) => { ensureDir(path) },
    readdirSync: (path, opts = {}) => {
      const base = normalize(path)
      const prefix = base === '/' ? '/' : base + '/'
      const seen = new Map()
      for (const key of nodes.keys()) {
        if (key === base || !key.startsWith(prefix)) continue
        const rest = key.slice(prefix.length)
        const name = rest.split('/')[0]
        if (!name) continue
        const isDir = rest.includes('/') || nodes.get(key)?.dir === true
        if (!seen.has(name)) seen.set(name, isDir)
      }
      const entries = [...seen.entries()].map(([name, isDir]) => ({
        name,
        isDirectory: () => isDir,
        isFile: () => !isDir,
      }))
      if (opts.withFileTypes) return entries
      return entries.map((e) => e.name)
    },
    rmSync: (path, opts = {}) => {
      const target = normalize(path)
      if (!nodes.has(target)) {
        if (opts.force) return
        throw Object.assign(new Error(`ENOENT: no such file or directory, '${path}'`), { code: 'ENOENT' })
      }
      if (!opts.recursive) { nodes.delete(target); return }
      const prefix = target + '/'
      for (const key of [...nodes.keys()]) {
        if (key === target || key.startsWith(prefix)) nodes.delete(key)
      }
    },
    copyFileSync: (src, dest) => {
      const node = nodes.get(normalize(src))
      if (!node || node.dir) throw Object.assign(new Error(`ENOENT: no such file, '${src}'`), { code: 'ENOENT' })
      ensureDir(parentOf(normalize(dest)))
      put(dest, node.data)
    },
    statSync: (path) => {
      const node = nodes.get(normalize(path))
      if (!node) throw Object.assign(new Error(`ENOENT: no such file, '${path}'`), { code: 'ENOENT' })
      return { isDirectory: () => node.dir === true, isFile: () => node.dir !== true }
    },
  }
}
