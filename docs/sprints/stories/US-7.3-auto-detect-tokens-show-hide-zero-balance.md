---
id: US-7.3
title: "Auto-detect tokens; show/hide zero-balance"
epic: EPIC-7
status: backlog
priority: P1
points: 3
sprint:
version_shipped:
prd_ref: [FR-70]
arch_ref: [AD-24]
depends_on: [US-7.1]
assignee:
commit:
created: 2026-06-12
updated: 2026-06-12
---

## Goal

The wallet automatically discovers which tokens a user holds on supported chains
and shows them without manual import, while letting the user hide zero-balance
tokens — so that the portfolio reflects real holdings on first open and stays
uncluttered by dust and never-held assets.

## Background

A multi-chain wallet tracks a large asset registry, but a user only cares about the
tokens they actually hold. Auto-detection walks the supported-chain asset set,
checks balances through the Services SDK aggregation
([AD-24](../../ARCHITECTURE.md#architecture-decisions)), and surfaces held tokens
into the dashboard set up by
[US-7.1](US-7.1-aggregate-portfolio-across-accounts-and-chains.md) without the user
importing each contract. The flip side is dust and zero-balance noise: the user
needs a show/hide-zero-balance control so the portfolio shows what matters. The
asset registry and its enable/disable state come from the chain-list/static-data
channel; this story owns the *visibility* model on the read surface, not the
registry itself.

Materializes [FR-70](../../PRD.md#functional-requirements). This story is **retroactive** — the capability
already ships; `commit` / `version_shipped` are backfilled during version
reconciliation.

## Acceptance criteria

- [ ] **AC-1** — **Given** an account holding a token that was never manually
  imported, **When** the portfolio loads, **Then** that token is auto-detected and
  shown with its balance (no manual import required).
- [ ] **AC-2** — **Given** the "hide zero-balance" setting is on, **When** the
  portfolio renders, **Then** tokens with a zero balance are hidden; **And** when it
  is off, all enabled tokens are shown including zero-balance ones.
- [ ] **AC-3** — **Given** a token detected on a chain the user has disabled, **When**
  the portfolio renders, **Then** that token is not aggregated until the chain is
  enabled (auto-detect respects chain enable/disable state).
- [ ] **AC-4** — **Given** auto-detection runs across many chains, **When** it
  executes, **Then** it uses the Services-SDK aggregation (AD-24) and does not issue
  per-asset on-device RPC that would breach the memory/read-path budget.

## Tasks

- [ ] **TASK-7.3.1** — Surface auto-detected held tokens into the dashboard (AC: 1, 4)
  - [ ] Drive detection from the Services-SDK aggregated subject (US-7.1 / US-2.5); no per-asset RPC fan-out on-device.
- [ ] **TASK-7.3.2** — Show/hide zero-balance toggle wired to the portfolio render (AC: 2)
  - [ ] Persist the setting; apply the filter at the dashboard list level.
- [ ] **TASK-7.3.3** — Respect chain enable/disable in detection (AC: 3)
  - [ ] Exclude tokens on disabled chains from the aggregate and the list.

## Dev notes

### Architecture constraints

- [AD-24](../../ARCHITECTURE.md#architecture-decisions) — token detection rides the Services-SDK aggregation rather than per-asset on-device RPC across 200+ chains.
- This story does NOT introduce new AD entries.

### Cross-story dependencies

- Builds on [US-7.1](US-7.1-aggregate-portfolio-across-accounts-and-chains.md) — renders into the dashboard and reuses the aggregated-balance subject fixture.
- Sibling [US-7.2](US-7.2-transferable-vs-locked-balance-calculation.md) — both consume the same aggregated subject; coordinate the token-row shape.

### What we explicitly did NOT do

- No custom-token-import UI — adding an arbitrary token by contract is a separate capability; this story only auto-detects from the supported asset set.

### References

- [Source: PRD FR-70](../../PRD.md#functional-requirements) — auto-detect tokens; show/hide zero-balance
- [Source: ARCHITECTURE AD-24](../../ARCHITECTURE.md#architecture-decisions)

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: receive a never-imported token → it appears in the portfolio automatically |
| AC-2 | Manual: toggle hide-zero-balance → zero-balance tokens hide/show accordingly |
| AC-3 | Manual: disable a chain → its tokens drop from the aggregate and list |
| AC-4 | Component test: detection uses the Services-SDK subject; assert no per-asset RPC fan-out |

## Changelog entry

### Added
- Token auto-detection on supported chains driven by the Services-SDK aggregation,
  plus a show/hide zero-balance setting on the portfolio.

**Commit**:

## Implementation notes

_Retroactive story — capability already shipped. Fill `commit`, `version_shipped`
and any implementation caveats during version reconciliation._

## Cross-references

- [PRD FR-70](../../PRD.md#functional-requirements)
- [Epic EPIC-7](../epics/EPIC-7.md)
- [US-7.1](US-7.1-aggregate-portfolio-across-accounts-and-chains.md)
</content>
