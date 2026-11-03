// web/functions/_lib/canary-templates.mjs - the in-memory template fixture the
// /api/stamp-canary Function stamps through.
//
// A worker has no filesystem, so the canary cannot read the repo's real
// `templates/` at runtime. This committed map is the smallest tree that still
// exercises every branch of the stamp engine in memory: a profile CHAIN
// (`monoforge` chaining `monoforge-headless`), a token-filled file, the
// `gitignore.tmpl` rename, and a nested file. The keys are repo-relative
// (`templates/<profile>/<rel>`), so the Function seeds them verbatim under an
// in-memory root and the engine's own chain resolver does the rest.
//
// It is deliberately NOT a copy of a real profile - the engine's contract
// against the real templates is proven in test/workers-compat.test.mjs, which
// runs in Node where the disk exists.
export const CANARY_TEMPLATES = {
  'templates/monoforge-headless/TEMPLATE.md': '---\nname: monoforge-headless\ndescription: in-memory canary child\nchain: []\n---\n',
  'templates/monoforge-headless/ci/verify.txt': 'headless battery block for __NAME__\n',
  'templates/monoforge/TEMPLATE.md': '---\nname: monoforge\ndescription: in-memory canary parent\nchain: [monoforge-headless]\n---\n',
  'templates/monoforge/README.md': '# __NAME__\n\n__PITCH__\n\nStatus: FORGE-TODO\n',
  'templates/monoforge/gitignore.tmpl': 'node_modules/\ndist/\n',
  'templates/monoforge/docs/index.md': '# __NAME__ docs\n\n__DESCRIPTION__\n',
}

// The factory config the canary stamps with (a fixed, valid, honest shape).
export const CANARY_FACTORY = {
  name: 'canary-stamp',
  species: 'stamp canary',
  pitch: 'Proves the workers storage adapter runs the engine with no disk.',
  description: 'A synthetic repo the deployed Function stamps in memory to prove the storage adapter lane runs under workerd.',
  siteDomain: 'https://canary-stamp.creadev.org',
}
