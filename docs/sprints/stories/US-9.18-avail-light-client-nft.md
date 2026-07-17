---
id: US-9.18
title: "Avail Light Client NFT"
epic: EPIC-9
status: done
priority: P3
points: 1
sprint: sprint-2024-M07
version_shipped: 
prd_ref: []
assignee: bluezdot
commit: ed6f3064b5, f0abcbf792, a934ec9ffc, 8353d097cb
created: 2026-07-17
updated: 2026-07-17
---

## Goal

Support NFTs on the Avail light client and fix Avail-network fetch errors.

## Scope

Avail light-client NFT support and fetch-error handling.

This is a **consolidated maintenance story**: it groups 3 related tracker issue(s) into one capability with a clear boundary, replacing the former one-issue-per-story ledger. It materializes **no FR** (the NFT requirement set is [US-9.1](US-9.1-substrate-nft-display.md)…[US-9.10](US-9.10-nft-display-and-transfer-hardening.md)); it records incremental work on this capability. Full issue→story traceability is the table below and [notes/2026-07-17-epic-9-consolidation](../../notes/2026-07-17-epic-9-consolidation.md). **`assignee` / `commit` / `sprint` / `points` are a representative backfill anchor** — taken from the most recent constituent that carries a commit (the last row of the timeline), not the full set; the per-issue spread is the timeline below. `version_shipped` is left empty because the capability grew across many releases (1.1.68 → 1.2.21) — no single one delivered it.

## Development timeline & consolidated issues

Chronological by shipped release (1.1.68 → 1.2.21); `—` = closed with no CHANGELOG line. The former one-issue-per-story ids (retired, never reused — [AGENTS.md](../../../AGENTS.md) rule 1) are listed in the [consolidation note](../../notes/2026-07-17-epic-9-consolidation.md).

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 1.1.68 | [#3115](https://github.com/Koniverse/SubWallet-Extension/issues/3115) | Fix error when fetching with Avail network | ✅ done |
| 1.2.21 | [#3191](https://github.com/Koniverse/SubWallet-Extension/issues/3191) | Support Avail Light Client NFT | ✅ done |
| — | [#3126](https://github.com/Koniverse/SubWallet-Extension/issues/3126) | Support Avail light client NFT | ✅ done |

## Acceptance criteria

- [x] **AC-1** — All 3 pursued issue(s) below are closed **COMPLETED** and the capability is present in the app (evidence: the release column + each issue's tracker close). No issue in this group was declined.

## Cross-references

- [Epic EPIC-9](../epics/EPIC-9.md) · [US-9.1](US-9.1-substrate-nft-display.md) · [consolidation note](../../notes/2026-07-17-epic-9-consolidation.md)
