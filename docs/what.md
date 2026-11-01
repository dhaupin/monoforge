---
version: '1.0'
permalink: what/
layout: default
title: What monoforge is
description: One zero-dependency factory - stamp a repo from proven blocks, doctor it against the truth battery, cut a component family, and lock the green tree with a checksum.
nav_order: 8
---

# What monoforge is

monoforge is a zero-dependency CLI. You describe the repo in `factory.json`, and
the factory stamps the blocks, doctors the result, and locks the green tree.

## The verbs

Stamp, doctor, lock, cut.

```bash
# stamp template blocks + fill tokens, never the truth
monoforge new ./my-tool

# the truth battery: refuses FORGE-TODO, broken gates, dash law
monoforge doctor ./my-tool

# doctor must pass, then archive + checksum
monoforge lock ./my-tool

# release cuts: components/<name>/ from a living lib
monoforge cut ./family
```

## What the doctor checks

The doctor runs the same battery the fleet reads: the test lane, the docs
gates, the release ladder, and the dash law. An unfilled `FORGE-TODO` slot
fails by name, and a broken gate fails rather than warns.

The `cut` verb stamps a component-family workspace from a living lib per
`cutlist.json`: intra-graph requires are rewritten to scoped deps, and an
unmapped internal dependency refuses. Shortfall lazies must be declared and
ship as documented call-site degrades.

## Where it sits

monoforge is the factory the struct family stamps from: the blocks carry the
docs system, the workflows, and the release ladder every member shares, so a
new repo inherits the gates from birth instead of re-deriving them. The blocks
come from proven instances -
[poststruct](https://github.com/dhaupin/poststruct) and
[packstruct](https://github.com/dhaupin/packstruct) - never from aspiration.

<div class="crosslinks">
<p><strong>Next:</strong>
<a href="{{ '/about/' | relative_url }}">about the project</a> ·
<a href="{{ '/verbs/' | relative_url }}">the verb reference</a></p>
</div>
