// src/workers.mjs - the workers-native surface (monoforge#27).
//
// The coreforge rig vendored a fork of the stamp engine because workerd has no
// `node:fs`. This module is the surface that retires the fork: the stamp engine
// plus the storage adapters, with NO import that reaches `node:fs` statically.
// A Cloudflare Worker imports this, seeds its templates into `memoryFs()`, and
// calls `stamp(dir, { fs, root })` - the same truth machinery as Node, only the
// storage differs.
//
// Unlike `src/index.mjs`, this surface deliberately omits `doctor` and `lock`
// (they shell out to git and use `node:fs`); a worker that wants the battery
// runs it in Node. The engine (`stamp`) and the adapters are what the runtime
// boundary needs.
export { default as stamp, readFactoryConfig, tokenReplacements, stampToolName, sha256, RECEIPT } from './stamp.mjs'
export { memoryFs, FS_ADAPTER_METHODS, setDefaultFs, getDefaultFs } from './fs-adapter.mjs'
export { resolveTemplate, resolveChain, TEMPLATES } from './templates.mjs'
