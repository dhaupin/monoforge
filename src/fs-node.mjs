// src/fs-node.mjs - the Node default storage adapter.
//
// Split from fs-adapter.mjs so the engine core (stamp.mjs, templates.mjs,
// fs-adapter.mjs) carries NO static `node:fs` import and stays bundleable for
// workerd. Importing this module installs real `node:fs` as the default
// adapter. The three engine entrypoints (index.mjs, stamp.mjs, templates.mjs)
// import it, so under Node the default is unchanged; a bundler targeting a
// worker simply never pulls it in.
import * as nodeFs from 'node:fs'
import { setDefaultFs } from './fs-adapter.mjs'

setDefaultFs(nodeFs)

export const nodeFsAdapter = nodeFs
export default nodeFs
