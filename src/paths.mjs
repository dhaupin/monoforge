// src/paths.mjs - the tiny POSIX path helpers the stamp engine needs.
//
// The engine core must bundle for workerd, where `node:path` exists only with
// the `nodejs_compat` flag. Rather than require that flag, the engine uses these
// four helpers - join, dirname, relative, normalize - which cover exactly the
// operations a template walk performs and nothing more. They are POSIX-only
// (both adapters normalize separators to `/`), which is all the engine ever
// passes them.

const norm = (p) => {
  const abs = String(p).startsWith('/')
  const out = []
  for (const seg of String(p).split('/')) {
    if (seg === '' || seg === '.') continue
    if (seg === '..') { if (out.length && out[out.length - 1] !== '..') out.pop(); else if (!abs) out.push('..'); continue }
    out.push(seg)
  }
  const body = out.join('/')
  if (abs) return '/' + body
  return body === '' ? '.' : body
}

/** POSIX `path.join`: segments joined by `/`, then normalized (`.`/`..` resolved). */
export function join(...parts) {
  return norm(parts.filter((p) => p != null && p !== '').join('/'))
}

/** POSIX `path.dirname`. */
export function dirname(p) {
  const s = norm(p)
  if (s === '/' || s === '.') return s === '/' ? '/' : '.'
  const i = s.lastIndexOf('/')
  if (i < 0) return '.'
  if (i === 0) return '/'
  return s.slice(0, i)
}

/** POSIX `path.relative`: the path from `from` to `to` (both treated as dirs/files). */
export function relative(from, to) {
  const f = norm(from).split('/').filter(Boolean)
  const t = norm(to).split('/').filter(Boolean)
  let i = 0
  while (i < f.length && i < t.length && f[i] === t[i]) i++
  const up = f.slice(i).map(() => '..')
  return [...up, ...t.slice(i)].join('/')
}

export { norm as normalize }
