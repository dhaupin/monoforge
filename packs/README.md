# packs/ - the factory's own check packs

This directory is monoforge's home for [**packstruct**](https://packstruct.creadev.org)
packs, in the family's two-seam split:

- **files** travel as an **artifact** (our `lock`: a `.tar.gz` + sha256 with a
  manifest inside)
- **judgment** travels as a **pack** (packstruct SPEC v1, `check` profile:
  `{ checks: [...] }`, pure reading over a tree)

A pack is a `pack.json` manifest plus the entry module it names. SPEC v1 has no
field for files to write, so a pack can only ever READ a tree - which is exactly
the doctor's lane. That is why the factory's portable judgment lives here and its
file-copying lives in `templates/`.

## The two visibility folders

- `packs/public/` - tracked, reusable across targets. A pack that names its
  target's vocabulary takes it through `ctx`, so another repo can adopt the pack
  without editing it.
- `packs/local/` - gitignored, machine-private. Not used here.

## Run it

```bash
npm run lint:packs     # packstruct lint packs --deep   (manifest + entry shape)
npm run conform:packs  # the spec's own loader harness   (8/8 required)
npm run packs          # run every pack over THIS repo, print the verdict rows
```

All three ride `npm run check`. `npm run packs` fails on a NEW `EXPLOITED`
verdict; a `BOUNDED` row never reads as green but does not fail the lane.

## The pack(s) in this repo

### `forge-shapes` - the stamped-tree checks

Six pure-reading checks over a tree the factory stamped:

| Check | What it proves |
|---|---|
| `forge/receipt-present` | the receipt ships and parses (identity + file list) |
| `forge/receipt-files-exist` | every file the receipt claims is on disk |
| `forge/truth-slot-clean` | no `FORGE-TODO` truth slot survived the stamp |
| `forge/stamp-token-clean` | no raw `__TOKEN__` survived the stamp |
| `forge/package-paths` | every `package.json` bin/exports/files entry resolves |
| `forge/publish-gate` | `publish.yml` refuses 0.x and carries no publish token |

Verdict taxonomy (family): `PASSED` / `BOUNDED` / `EXPLOITED`. The pack ships
`test/fixtures/` proving each verdict both ways (SPEC section 4); its self-audit
runs in `test/packs.test.mjs`.

## The loader

`src/packs.mjs` is the loader the spec's own harness grades:

```bash
npx packstruct audit-conformance . --loader "node src/packs.mjs {packs}"
```

Every refusal is instant, one-line, and names the pack (SPEC section 5). Exit 0
conforming / 1 violations / 2 usage.
