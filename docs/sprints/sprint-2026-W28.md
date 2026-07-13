---
id: sprint-2026-W28
status: done
start: 2026-07-06
end: 2026-07-12
goal: "Launch EPIC-21 docs conformance program — contributor map, history backfill, and conformance close-out"
---

## Sprint scope

| US | Title | Epic | Pri | Points | Status | Carry | Story file |
| --- | --- | --- | --- | --- | --- | --- | --- |
| US-21.1 | Contributor identity map | EPIC-21 | P1 | 3 | ✅ done | new | [link](stories/US-21.1-contributor-identity-map.md) |
| US-21.2 | History backfill | EPIC-21 | P1 | 13 | ✅ done | new | [link](stories/US-21.2-history-backfill.md) |
| US-21.3 | Conformance close-out | EPIC-21 | P1 | 5 | ✅ done | new | [link](stories/US-21.3-conformance-close-out.md) |

**Closed 2026-07-13** — 21/21 points delivered, all three stories `done`. Retrospective below.

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

### EPIC-21 — Docs & Conformance Infrastructure — 21/21 pts, 3/3 stories `done`

**Goal met.** `npx koni-docs validate` exits zero, 113 stories carry a traced
`version_shipped`, 282 commit references pass space-aware containment, every git identity
resolves to a GitHub login, and STATUS.md is generated rather than hand-kept.

#### What went well

- **The trace found real defects, not just missing metadata.** Backfilling a version forced
  every claim to be checked against git — and seven of them failed. See
  [EPIC-21 § What this epic actually found](epics/EPIC-21.md).
- **The 5-layer check is now cheap to re-run.** The expensive part was the first pass; the
  invariants are mechanical from here.
- **Deletion beat documentation.** The most valuable output of the sprint was subtracting:
  NFR-11 retired, AD-07 marked never-implemented, 2 duplicate stories and 1 phantom
  integration removed. Docs get better by shrinking at least as often as by growing.

#### What went wrong

- **The sprint ran 1 day over and the scope grew mid-flight.** Neither was a planning miss —
  the verification kept surfacing product decisions (withdraw FR-120/157, retire NFR-11) that
  had to go to the owner. **Budget for this next time:** a conformance pass over docs that
  have never been checked will find product questions, and those cost owner time, not points.
- **The epic's own charter was false.** It promised to touch no FR and no story set; it did
  both, on day one, necessarily. Rewritten this sprint — [CONTEXT D97](../CONTEXT.md),
  [LESSONS §65](../LESSONS.md).
- **Four data errors reached the owner before they reached a check.** FR-23 marked shipped
  though never built; the earning T&C mechanism left at `review` though shipped; FR-124 shown
  as planned though in review; a CHANGELOG issue number off by ten. Root causes: a script that
  ticked *every* open AC when closing a story (including ones explicitly marked *forward*), and
  a reconcile rule — *"a `done` story means all its FRs shipped"* — that is simply **wrong for a
  multi-FR story**. Both are fixed; the lesson is that a rule which is true for the common case
  is still a bug.
- **EPIC-20 was invisible for the entire trace.** It was classified as a "roadmap" epic and
  therefore excluded from the 113-story trace set — so nothing in it was ever checked. Four
  items had in fact shipped. **An epic's classification is an assumption, not evidence**
  ([LESSONS §64](../LESSONS.md)).

#### Carried forward (not scheduled — no W29 committed)

| Item | Why it is not in this sprint |
| --- | --- |
| **US-21.4 — issue → story coverage index** | The CHANGELOG cites **1094 issues; only 65 are claimed by any story (94% unclaimed).** Most need only a link, but the 75 "capability-ish" 1.3.x entries are the bucket that can hide a missing FR (e.g. #4692 HOLLAR mainnet, #4829 Bittensor Root staking, #4795 Tanssi collator APY). Deferred by the owner — a real gap, deliberately left open rather than half-closed. |
| **US-20.3 — read-path memory budget** | ⏸️ **deprecated**, not carried. The requirement it defended no longer exists ([D96](../CONTEXT.md)). |
| **The 3 freed points** | Recommended spend: merge `koni/dev/issue-4984` (multicall3 balance batching, written and unmerged) and fix #4021 (unbounded `while (isContinue)` notification pagination, firing 4× per address every 30 min). Both are live, measurable waste — unlike the memory budget we just retired. |
