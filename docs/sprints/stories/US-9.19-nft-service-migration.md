---
id: US-9.19
title: "NFT service migration"
epic: EPIC-9
status: done
priority: P3
points: 1
sprint: sprint-2023-M06
version_shipped: 
prd_ref: []
assignee: 
commit: 
created: 2026-07-17
updated: 2026-07-17
---

## Goal

Migrate the NFT feature onto the then-current service architecture (#967). The forward-looking client-side NFT Service + SDK migration continues in [US-9.20](US-9.20-client-side-nft-service-and-sdk-migration.md).

## Scope

The NFT-feature service migration. Superseded, going forward, by the client-side NFT Service work.

This is a **consolidated maintenance story**: it groups 1 related tracker issue(s) into one capability with a clear boundary, replacing the former one-issue-per-story ledger. It materializes **no FR** (the NFT requirement set is [US-9.1](US-9.1-substrate-nft-display.md)…[US-9.10](US-9.10-nft-display-and-transfer-hardening.md)); it records incremental work on this capability. Full issue→story traceability is the table below and [notes/2026-07-17-epic-9-consolidation](../../notes/2026-07-17-epic-9-consolidation.md). **`assignee` / `commit` / `sprint` / `points` are a representative backfill anchor** — taken from the most recent constituent that carries a commit (the last row of the timeline), not the full set; the per-issue spread is the timeline below. `version_shipped` is left empty because the capability grew across many releases (—) — no single one delivered it.

## Development timeline & consolidated issues

Chronological by shipped release (—); `—` = closed with no CHANGELOG line. The former one-issue-per-story ids (retired, never reused — [AGENTS.md](../../../AGENTS.md) rule 1) are listed in the [consolidation note](../../notes/2026-07-17-epic-9-consolidation.md).

| Shipped | Issue | Title | Status |
|---|---|---|---|
| — | [#967](https://github.com/Koniverse/SubWallet-Extension/issues/967) | Migrate NFT feature | ✅ done |

## Acceptance criteria

- [x] **AC-1** — All 1 pursued issue(s) below are closed **COMPLETED** and the capability is present in the app (evidence: the release column + each issue's tracker close). No issue in this group was declined.

## Cross-references

- [Epic EPIC-9](../epics/EPIC-9.md) · [US-9.20](US-9.20-client-side-nft-service-and-sdk-migration.md) · [consolidation note](../../notes/2026-07-17-epic-9-consolidation.md)
