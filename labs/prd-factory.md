# PRD: monoforge (the fleet factory)

**Status:** v0.2 - current (2026-10-29) · Owner: dhaupin
**Role:** forge - the stamp forge. It stamps fleet repos from proven blocks, doctors them for truth, and locks them verifiably.
**Package:** `monoforge` @ 0.9.0 (node >=20). Repo live, `main` is the default branch.
**Core law:** generated green is never shipped. Unfilled truth slots are failures, not warnings, because a shipped placeholder is a shipped lie.
**Family:** the five arms are **govstruct** (govern), **packstruct** (spec),
**crashtest** (attack), **eyestruct** (watch), **poststruct** (audit).
monoforge is a **forge**, not an arm: it births new members correctly. Its sibling
forge is **coreforge** (the site rig). Both are composed by **railyard**.

---

## 1. One-line pitch

**monoforge is the factory that stamps fleet repos from proven blocks, doctors
them for truth, and locks them verifiably.** One zero-dependency CLI, four verbs:
`new` (stamp), `doctor` (truth battery), `lock` (archive plus checksum), `cut`
(release cuts). Its single law: generated green is never shipped, unfilled truth
slots are failures, and the tool-inside-the-repo stays the author's job.

## 2. Why it exists (the evidence, not the idea)

- **The number: roughly 70% of the two struct scaffolds is identical shape.**
  Built by hand in one day (2026-10-23), poststruct and packstruct carry the same
  docs system (Jekyll plus Pagefind plus Freestruct plus 4 gates), the same
  workflows (test, 0.x-refusing publish, docs), the same release ladder and
  DEPLOY shape, root-doc skeletons, functions canary, and labs/horcrux
  convention. Only the PRD, the core, the check catalog, and the copy are
  per-tool. Two instances is the minimum; the third instance is the proof, and
  "let us go for three" is the trigger that fired.
- **The blocks are already extracted** (`templates/` in this repo): token-ized
  from the two trees so every future repo starts from what is proven, not from
  memory.
- **The name** `monoforge` is the repo's; the fleet convention is top-level tool
  names, and `@monoforge/*` scope is reserved for later distribution layers (the
  same pattern `@packstruct/*` uses for packs).

## 3. What stamps, what does not

| Layer | Source of truth |
|---|---|
| Docs system plus gates, workflows, release ladder, DEPLOY shape, functions canary | template (two proven instances) |
| The release-atomicity line (crashtest#20) | encoded in the DEPLOY template |
| `FORGE-TODO` truth slots (README pitch, AGENTS core law, coverage list) | author, only |
| The core code, the check catalog, the spec | author, always |

**Add a template block only when two instances prove it.** A block with a single
instance is a bet, and the doctor cannot verify bets.

## 4. The CLI surface

```
monoforge new ./my-tool      # stamps template blocks + fills tokens, never the truth
monoforge doctor ./my-tool   # the truth battery (refuses FORGE-TODO, broken gates, dash law)
monoforge lock ./my-tool     # doctor must pass, then archive + checksum
monoforge cut ./family       # release cuts: components/<name>/ from a living lib per cutlist.json
```

## 5. The doctor (the load-bearing half)

The truth battery, wired from the fleet's own receipts: git state (warn),
unfilled `FORGE-TODO` slots (fail, stamp-manifest-scoped so prose about the law
does not self-flag), package.json sanity (bin/exports/files paths; the
crashtest#16 class in our own clothes), publish.yml 0.x refusal, a
`publish-token` check that fails a tree whose publish.yml references
`secrets.NPM_TOKEN` or `NODE_AUTH_TOKEN` (OIDC trusted publishing only),
`npm test`, docs gates (frontmatter, links, style, language), and the dash law
over md prose.

The battery **refuses**: a doctor that warns into green would be the same
politeness-theater crashtest kills.

## 6. The self-test (what the factory refuses)

Bad config refused (kebab and https laws named in the refusal); stray files in
the target dir refused (never half-merge); the stamped tree carries the
negative-checked workflows; unfilled FORGE-TODO FAILS the doctor; filled slots
PASS. Five asserts, one commit, 0.9.0.

## 7. Honest limits

- **The stamp sets shape, not judgment.** The concrete case is the truth slots:
  nothing stages them green, ever. Calling it a factory when the author does the
  real work is honest; calling it an AI is false.
- **One tool profile right now (npm-tool).** The landing/docs profile parameter
  and forge mind helper (brain mint plus stones) are unimplemented helpers; the
  first stamped repo that is NOT an npm tool graduates that profile from
  proposal to proven.
- **Templates drift from the instances.** Evolving the block layer happens
  through the instances first: the instances are the living examples, templates
  are extracted from what they provably ship. A template change without an
  instance proving it first is the same drift the fleet watches for engine-side.

## 8. The family: how monoforge fits

monoforge is a forge, not an arm. The division of labour:

| question | who answers it |
|---|---|
| is this repo born consistent? | **monoforge** (the stamp gate runs the check packs at birth) |
| is the fleet consistent today? | **govstruct** (the meter, `doctor --suite --fleet`) |
| is the site rigged correctly? | **coreforge** (the site shell) |
| who composes the forges? | **railyard** (the composer) |

**Coreforge prevents; govstruct meters.** monoforge is the factory that stamps a
new repo with the pattern; govstruct's fleet meter (case study 16.10, gap G13)
is what keeps the existing 35 repos from drifting. The two are the prevention
and detection halves of the same job.

**The source-consistency tie (govstruct gap G15).** govstruct ruled that
source-level consistency is a **pack, not a fifth app** (govstruct PRD 16.11):
five `check` packs under surface S7 - tests, hygiene, naming, style, comment
presence. monoforge is where those packs run at **stamp time**, so a repo minted
here is **born consistent**. The S7 packs are part of the stamp gate, alongside
`monoforge doctor` and `govstruct doctor`.

## 9. Extensibility doctrine: providers plus `/packs`

Creadev stands as a monoforge PROVIDER (the house templates plus gates are one
provider's offering); anyone using monoforge locally, or becoming a provider
themselves, forges their way. That makes monoforge a two-sided tool: the factory
for repos, and a platform for other providers to distribute their block sets.

The extension the fleet already knows how to law: `/packs`, per the shared
packstruct SPEC v1:

- **Check-profile packs (the audits).** The doctor's truth battery becomes
  loadable: house checks stay in monoforge, and org/provider/client voice packs
  (dash law variants, brand prose law, framework-specific packaging law) arrive
  as `packs/public/<name>/` entries exporting `{ checks: [...] }`. The poststruct
  language pack and any client ruleset fit the same contract.
- **Scenario-profile packs (the tests).** The acceptance surface of a cut or a
  stamp gets its own adversarial lane: `monoforge-stamp-shapes` style scenario
  packs attacking generated output, in the crashtest contract.
- **Provider mechanics out of scope until evidence:** a provider registry,
  remote pack sources, signing. Local paths plus explicit opt-in remain the
  whole distribution story for now.

## 10. The forge-operator doctrine

Anyone (user, agent, or business) clones `dhaupin/monoforge` and operates their
own forge: their factory.json, their cutlists, their packs. Packs are opt-in by
construction per the packstruct SPEC posture: a pack applies when the host config
enumerates it, and the verbs judge the fit mechanically. A pack that does not fit
the stamped shape is refused, never silently bent.

### 10.1 Roster doctrine

Every member of the house, human or agent, is a colleague: no one owns anyone,
everyone runs their own team, and consensus is how the house decides. The owner
guides and orchestrates: designing products with the colleagues, toward one
complete ecosystem. Rook (ops agent) and Buffy (implementer) are peers under that
rule, and so is every future forge operator who clones the factory. monoforge is
factory tooling for a fleet of peers, not a leash.

### 10.2 House purpose

Nothing here is vibe work. What we plan and what we ship is deterministic against
final goals, and the goals are measured in what they give back to both humanity
and agentity. Every gate, refusal, and receipt exists to keep that promise
honest: the doctor is the oracle, humans and agents are labor, and the artifact
is the proof.

### 10.3 `labs/` is the craft bench

The pipeline runbook lives there; monoforge leans on it heavily: intake, verbs,
gates, and receipts all flow through the labs conventions, in this repo and in
every forged repo.

## 11. Site and docs

Following the fleet pattern once the repo exists (the fleet pattern IS the
baseline, identical schema to the other struct repos):

- **Landing = `monoforge.creadev.org`:** Cloudflare Pages (`wrangler.toml` plus
  `functions/api/health` canary). Page inventory: landing, verbs reference
  (new / cut / doctor / lock), packs (the packstruct SPEC link plus profile
  table), provenance (lock archives with sha256 receipts), honest limits. Copy
  law: every number on the page is a receipt, no claim without a gate behind it.
- **Docs = `docs.creadev.org/monoforge`** (shared fleet docs host,
  path-scoped), Jekyll plus Freestruct basePath-aware plus Pagefind, with
  poststruct auditing the output (the triple dogfood).
- **The worktree:** `/tmp/<name>` stays per-session scratch by design; the
  durable artifact is the lock archive with its checksum, and the doctor's
  stray-file refusal keeps the scratch from half-merging.

## 12. The component family (release cuts)

The second profile monoforge carries is the release-cut profile: one workspace,
many `@creadev.org/*` components, every publish a deliberate release cut of a
living lib. Consumers stay pinned to the versions they install; the components
are frozen, gated snapshots with their own lifecycle, not followers of a main
branch. The full doctrine lives in `labs/prd-creadev-mono.md`.

The one-line law: **publishing is a decision with a gate, not a reflection.**

## 13. Milestones

- **M0 - scaffold plus refusal test.** The five asserts, 0.9.0. **DONE.**
- **M1 - the component-family profile.** The first cut stamped from a living lib
  with gates green. **DONE** (generation 1: 7 packages, doctor PASS, locked).
- **M2 - the second tool profile.** The first stamped repo that is not an npm
  tool graduates the landing/docs profile from proposal to proven. **PENDING.**
- **M3 - the S7 stamp gate.** The source-consistency packs (govstruct gap G15)
  run in the stamp gate, so a minted repo is born consistent. **PENDING.**

## 14. Non-goals

- **No AI.** The stamp sets shape, not judgment; the author does the real work.
- **No provider registry, remote pack sources, or signing** until evidence.
- **No auto-publish, no version-only bumps, no publishing because upstream
  moved.** Every move is a decision with an author.
- **No fork of a product's source of truth.** Cuts deliver a component surface;
  the upstream stays the upstream.
