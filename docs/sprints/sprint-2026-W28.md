---
id: sprint-2026-W28
status: in-progress
start: 2026-07-06
end: 2026-07-12
goal: "Launch EPIC-21 docs conformance program — contributor map, history backfill, and conformance close-out"
---

## Sprint scope

| US | Title | Epic | Pri | Points | Status | Carry | Story file |
| --- | --- | --- | --- | --- | --- | --- | --- |
| US-21.1 | Contributor identity map | EPIC-21 | P1 | 3 | 👀 review | new | [link](stories/US-21.1-contributor-identity-map.md) |
| US-21.2 | History backfill | EPIC-21 | P1 | 13 | 👀 review | new | [link](stories/US-21.2-history-backfill.md) |
| US-21.3 | Conformance close-out | EPIC-21 | P1 | 5 | 👀 review | new | [link](stories/US-21.3-conformance-close-out.md) |

## Sprint goal recap

This sprint launches the **docs conformance program** (EPIC-21) as the first wave of the koni-docs adoption roadmap (see [2026-07-09.md](../notes/2026-07-09.md)). All three stories are greenfield — no carry-over from prior sprints.

The sequencing follows the dependency chain: US-21.1 (contributor map) must complete before US-21.2 (history backfill), which must complete before US-21.3 (conformance close-out). US-21.2 is the largest story (13pt) and spans the full sprint; the plan below phases accordingly.

**Deliverable**: By sprint end, `npx koni-docs validate` exits zero, all 174 stories have canonical metadata, and the conformance invariants are CI-gated.

## Phased plan

1. **Phase 1 — Identity resolution** (~2 days, Jul 6–7): Build the contributor map from `git shortlog` + GitHub API. Write `docs/notes/contributor-map.md`. Hand off to US-21.2.
2. **Phase 2 — Backfill** (~5 days, Jul 8–12): Run `koni-docs backfill-commits`, backfill `version_shipped`, bump VERSION, update PRD/epic/sprint layers. US-21.2 runs in parallel with US-21.1's output.
3. **Phase 3 — Close conformance** (~2 days, Jul 11–12): Run 5-layer consistency check, graduate notes, regenerate STATUS.md, verify `koni-docs validate` exits zero.

## Risks & dependencies

- **Contributor map completeness** — *Impact*: missing identities delay US-21.2 assignee backfill. *Mitigation*: flag orphans for manual resolution; proceed with resolved subset. *Owner*: @tunghp2002.
- **US-21.2 size (13pt)** — *Impact*: may not complete within single sprint. *Mitigation*: split strategy already documented in story; Phase 2 can be carried to W29 if needed.
- **`koni-docs validate` flakiness** — *Impact*: false positives from FR-reachability on PRD sections. *Mitigation*: run `--json` for precise error location; fix per-field.

## Per-Epic Retrospective

*(to be filled at sprint close)*
