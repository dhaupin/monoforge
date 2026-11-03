// src/index.mjs - programmatic surface: the three verbs of the factory, plus
// the storage adapters a workers consumer imports instead of vendoring the
// engine (monoforge#27). Importing this module installs `node:fs` as the
// default adapter under Node; under a worker the caller passes `memoryFs()`
// to `stamp` explicitly and never reaches the Node default.
// Node entry: installing the default adapter here (a static side-effect import)
// keeps `node:fs` out of the engine core, so `src/workers.mjs` bundles for
// workerd with no compat flag. A worker imports `src/workers.mjs`, never this.
import './fs-node.mjs'

export { default as stamp } from './stamp.mjs'
export { default as doctor } from './doctor.mjs'
export { default as lock } from './lock.mjs'
export { default as harness, run as runHarness } from './harness.mjs'
export { loadRefusals, registeredCodes, refusal } from './refusals.mjs'
export { memoryFs, FS_ADAPTER_METHODS, setDefaultFs, getDefaultFs } from './fs-adapter.mjs'
export { nodeFsAdapter } from './fs-node.mjs'
export { sha256 } from './sha256.mjs'
export { resolveTemplate, resolveChain, TEMPLATES } from './templates.mjs'
