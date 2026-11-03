// src/refusals.mjs - the refusal-code registry (monoforge#23, the G10 model).
//
// Every refusal the harness emits is a REGISTERED code from spec/refusals.json,
// namespaced `monoforge` in the govstruct spec/refusals.json shape, so a refusal
// one tool emits is a refusal the next tool can read. A code the registry does
// not carry is refused here, loudly: a typo'd code is worse than none, because a
// consumer would log a refusal that no gate ever agreed to.
//
// Node-only (it reads the spec file). The engine core never imports it, so the
// workerd surface is unaffected.
import { readFileSync } from 'node:fs'
import { join } from './paths.mjs'
import { getDefaultFs } from './fs-adapter.mjs'

const defaultRoot = () => join(new URL('..', import.meta.url).pathname)

export const REFUSALS_SCHEMA_VERSION = 1

/** Load and validate the registry. Throws on a malformed spec (never silent). */
export function loadRefusals({ fs = getDefaultFs(), root = defaultRoot() } = {}) {
  const p = join(root, 'spec', 'refusals.json')
  if (!fs.existsSync(p)) throw new Error(`the refusal registry is missing: ${p} (every refusal code must be registered)`)
  let doc
  try { doc = JSON.parse(fs.readFileSync(p, 'utf8')) } catch (e) { throw new Error(`spec/refusals.json is not valid JSON: ${e.message}`) }
  if (doc.schemaVersion !== REFUSALS_SCHEMA_VERSION) throw new Error(`spec/refusals.json schemaVersion must be ${REFUSALS_SCHEMA_VERSION} (got ${doc.schemaVersion})`)
  const codes = doc?.namespaces?.monoforge
  if (!codes || typeof codes !== 'object') throw new Error('spec/refusals.json carries no `monoforge` namespace')
  return codes
}

/** The registered codes (a Set), for the harness's emit guard and the tests. */
export function registeredCodes(opts = {}) {
  return new Set(Object.keys(loadRefusals(opts)))
}

/**
 * Build a typed refusal, refusing to emit an unregistered code. This is the one
 * constructor every harness refusal goes through, so the "every emitted code is
 * registered" law is structural, not a convention.
 */
export function refusal(code, slot, detail, opts = {}) {
  const codes = registeredCodes(opts)
  if (!codes.has(code)) throw new Error(`unregistered refusal code "${code}" - register it in spec/refusals.json before emitting it`)
  return { code, slot: slot ?? null, detail: detail ?? '' }
}
