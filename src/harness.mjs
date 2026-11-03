// src/harness.mjs - the headless stamp harness (monoforge#23).
//
// The verbs already work as a human CLI; this is the same machinery as an
// in-process, structured surface so railyard's door can drive the stamp loop
// (`new -> doctor -> lock`) without a shell and read a typed result instead of
// prose. No sockets, no subprocess: the family's in-process law.
//
// The shape railyard's `railyard_stamp` consumes:
//
//   { verb, ok, verdicts: [{ gate, ok, counts }], refusals: [{ code, slot, detail }], grant, receipt }
//
// Every refusal code is REGISTERED in spec/refusals.json (the G10 model); the
// harness refuses to emit a code it has not registered, so a consumer can log
// and route refusals portably.
//
// A grant `{ kind, scope }` is optional and opaque: the forge never sees the
// credential, it echoes the grant back so railyard's audit ledger can record
// the spend (G5 + G14). The harness never reads a secret.
import { getDefaultFs } from './fs-adapter.mjs'
import { refusal } from './refusals.mjs'
import stamp from './stamp.mjs'
import doctor from './doctor.mjs'
import lock from './lock.mjs'

const VERBS = new Set(['new', 'doctor', 'lock', 'stamp'])

// Normalize the doctor's findings into typed refusals. A warn is not a refusal.
function refusalsFromDoctor(r) {
  return r.findings
    .filter((f) => f.level === 'fail')
    .map((f) => refusal(f.code, f.slot ?? null, f.message))
}

function grantEcho(grant) {
  if (grant == null) return null
  const bad = typeof grant !== 'object' || typeof grant.kind !== 'string' || !grant.kind
    || typeof grant.scope !== 'string' || !grant.scope
  if (bad) return { invalid: refusal('E_GRANT_INVALID', 'grant', 'grant must be { kind: string, scope: string }') }
  // Echo kind + scope only: a grant row for the ledger, never the credential.
  return { kind: grant.kind, scope: grant.scope, spent: true }
}

/**
 * Drive one verb in-process and return a structured receipt.
 *
 * @param {string} verb  one of new | doctor | lock | stamp
 * @param {string} dir   the target tree
 * @param {object} opts  { fs, root, grant, out }
 */
export async function run(verb, dir, opts = {}) {
  if (!VERBS.has(verb)) {
    return {
      verb, ok: false, dir,
      verdicts: [],
      refusals: [refusal('E_VERB_UNKNOWN', 'verb', `unknown verb "${verb}" (known: ${[...VERBS].join(', ')})`)],
      grant: null, receipt: null,
    }
  }

  const grant = grantEcho(opts.grant)
  const base = { verb, dir, grant: grant?.invalid ? null : grant, receipt: null }

  // A malformed grant is refused before any write: the ledger row is the point,
  // and an unreadable grant is not a row.
  if (grant?.invalid) return { ...base, ok: false, verdicts: [], refusals: [grant.invalid] }

  if (verb === 'doctor') {
    const r = await doctor(dir, opts)
    const refusals = refusalsFromDoctor(r)
    return {
      ...base, ok: r.ok,
      verdicts: [{ gate: 'monoforge doctor', ok: r.ok, counts: r.counts }],
      refusals,
      receipt: { gate: 'monoforge doctor', counts: r.counts, findings: r.findings },
    }
  }

  if (verb === 'new' || verb === 'stamp') {
    const r = await stamp(dir, opts)
    if (!r.ok) return { ...base, ok: false, verdicts: [], refusals: [refusal(r.code, r.slot ?? null, r.error)] }
    return {
      ...base, ok: true,
      verdicts: [{ gate: 'monoforge new', ok: true, counts: { fail: 0, warn: 0 } }],
      refusals: [],
      receipt: { gate: 'monoforge new', name: r.cfg.name, files: r.manifest, skipped: r.skipped, restamp: r.restamp },
    }
  }

  // lock = doctor (typed) then archive. A doctor fail refuses before the write.
  const d = await doctor(dir, opts)
  const drefusals = refusalsFromDoctor(d)
  if (!d.ok) {
    return {
      ...base, ok: false,
      verdicts: [{ gate: 'monoforge doctor', ok: false, counts: d.counts }],
      refusals: drefusals,
      receipt: { gate: 'monoforge doctor', counts: d.counts, findings: d.findings },
    }
  }
  const r = await lock(dir, opts)
  if (!r.ok) {
    return {
      ...base, ok: false,
      verdicts: [{ gate: 'monoforge doctor', ok: true, counts: d.counts }],
      refusals: [refusal(r.code, r.slot ?? null, r.error)],
      receipt: { gate: 'monoforge lock', counts: d.counts, archive: null, sha: null },
    }
  }
  return {
    ...base, ok: true,
    verdicts: [{ gate: 'monoforge doctor', ok: true, counts: d.counts }, { gate: 'monoforge lock', ok: true, counts: { fail: 0, warn: d.counts.warn } }],
    refusals: [],
    receipt: { gate: 'monoforge lock', name: r.archive.replace(/-lock\.tar\.gz$/, ''), archive: r.archive, sha: r.sha, counts: d.counts },
  }
}

export default run
export { VERBS }
