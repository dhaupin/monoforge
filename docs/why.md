---
version: '1.0'
permalink: why/
layout: default
title: Why monoforge
description: Generated green is never shipped. Why a factory repo must refuse unfilled slots instead of warning, and why stamped blocks come only from instances already proven.
nav_order: 7
---

# Why monoforge

A shipped placeholder is a shipped lie. monoforge exists so a new fleet repo
inherits proven truth instead of a hand-copied guess.

## The problem: copy-and-hope

Every new repo in a fleet starts the same way: copy the last one, rename what
you remember, and hope you renamed the rest. The parts you forgot do not fail
loudly. They ship as a placeholder that reads as truth.

A fleet repo carries a lot of truth: a docs system, workflows, a release
ladder, gates. Copying one by hand carries the truth and the residue together.
The residue is the unfilled slot, the stale name, the gate that was never
wired, and none of it fails the build because it was never checked.

The fix is not a better checklist. A checklist is the thing that already
failed. The fix is a stamp layer that carries only what two proven instances
already validated, and a doctor that treats an unfilled slot as a failure
rather than a warning.

## The thesis: generated green is never shipped

The stamp layer carries only what two proven instances already validated - the
rule of three: a block lands when a second real instance needs it. Nothing
speculative rides a fresh repo, so there is no unproven block to drift.

The doctor runs the same truth battery the fleet reads, and an unfilled
`FORGE-TODO` slot is a failure, not a warning. A doctor that warns into green is
politeness theater; monoforge refuses nameably so a placeholder can never ship
as truth.

## Who it is for

Anyone growing a fleet of repos that must agree about themselves: the
maintainer stamping the next member, the CI that has to prove every stamped
repo carries the same gates, and the agent that has to stand up a new repo
without hand-copying the last one.

<div class="crosslinks">
<p><strong>Next:</strong>
<a href="{{ '/what/' | relative_url }}">what monoforge is</a> ·
<a href="{{ '/about/' | relative_url }}">about the project</a></p>
</div>
