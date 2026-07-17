# 2026-07-17 — `EPIC-29` (Maintenance — NFT) merged into `EPIC-9` (NFT Management)

> **Structural change, docs-only.** The separate NFT maintenance epic was dissolved and its
> ledger folded into the product epic it shadowed. This file is the durable record that
> `EPIC-29` ever existed and where its stories went. `check-ids` treats dated `notes/` files as
> archives, so the retired `EPIC-29` id may be named here without dangling.

**What changed:** `EPIC-29 "Maintenance — NFT"` no longer exists as its own epic. Its **116
stories** now belong to [`EPIC-9`](../sprints/epics/EPIC-9.md), which carries them as a
**"Maintenance ledger"** section beneath its FR / feature-pillar tables. `EPIC-29.md` is deleted.

**Why:** the owner chose to give each product area **one home** — the maintenance ledger lives
inside the feature epic rather than in a parallel layer. This is the first (pilot) area; the
other 19 maintenance epics (`EPIC-22`…`EPIC-28`, `EPIC-30`…`EPIC-41`) are untouched for now. When
the whole program is folded, [CONTEXT D108](../CONTEXT.md) (the "20-epic maintenance layer"
decision) should be superseded by a new decision; until then D108 stands as history and its
"twenty" count is one high.

**Story IDs are NOT renumbered.** Every story keeps its `US-29.x` id and filename
([AGENTS.md](../../AGENTS.md) rule 1 — ids are permanent). Only two things moved per story:
frontmatter `epic: EPIC-29` → `epic: EPIC-9`, and every in-body `EPIC-29` self-reference →
`EPIC-9`. The `29` is now a **retained historical numbering namespace**, not a live epic — an
`EPIC-9` may legitimately own `US-9.x` *and* `US-29.x` stories.

## Mapping

| Retired | Now | What |
| --- | --- | --- |
| `EPIC-29` "Maintenance — NFT" | `EPIC-9` "NFT Management" → **Maintenance ledger** section | the epic |
| `US-29.1` … `US-29.116` | **unchanged** (ids permanent), re-parented to `EPIC-9` | the 116 stories |

## Scope of the edit

- **116 story files** re-parented (`epic:` + in-body refs), `updated: 2026-07-17`.
- **`EPIC-9.md`** gained the ledger section (116-row table + charter); a pre-existing pair of
  stray `</content>` / `</invoke>` lines at its tail was removed in the same pass.
- **`EPIC-29.md`** deleted.
- **`STATUS.md`** regenerated — the NFT rows now roll up under `EPIC-9`.

## Verification

- `grep -rl 'EPIC-29' docs/` → only this dated note (an archive) — no live surface names it.
- Ledger status recomputed from frontmatter: **98 done · 5 backlog · 13 deprecated** (the old
  `EPIC-29` prose Scope said "11 deprecated" — stale; the table already showed 13 after the
  2026-07-16 stateReason scan flipped `US-29.32` and `US-29.77`).
- `node scripts/koni-docs-check-ids.mjs` exits 0 · `npx koni-docs validate` exits 0.
