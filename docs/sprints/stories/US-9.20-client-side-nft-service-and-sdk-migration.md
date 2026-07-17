---
id: US-9.20
title: "Client-side NFT Service & SDK migration"
epic: EPIC-9
status: backlog
priority: P3
points: 1
sprint: 
version_shipped: 
prd_ref: []
assignee: frenkie-ng
commit: 
created: 2026-07-17
updated: 2026-07-17
---

## Goal

Implement the client-side NFT Service and migrate existing NFT logic onto the SubWallet Services SDK (#4883) — the forward-looking successor to the earlier service migration ([US-9.19](US-9.19-nft-service-migration.md)).

## Scope

Client-side `NftService` + SDK migration. Open, not started.

This is a **consolidated maintenance story**: it groups 1 related tracker issue(s) into one capability with a clear boundary, replacing the former one-issue-per-story ledger. It materializes **no FR** (the NFT requirement set is [US-9.1](US-9.1-substrate-nft-display.md)…[US-9.10](US-9.10-nft-display-and-transfer-hardening.md)); it records incremental work on this capability. Full issue→story traceability is the table below and [notes/2026-07-17-epic-9-consolidation](../../notes/2026-07-17-epic-9-consolidation.md). **This capability is not yet delivered** — `assignee` names the current owner where the tracker records one; `commit` / `sprint` / `version_shipped` stay empty until it ships. `points: 1` marks it as one backfill record.

## Development timeline & consolidated issues

Chronological by shipped release (—); `—` = closed with no CHANGELOG line. The former one-issue-per-story ids (retired, never reused — [AGENTS.md](../../../AGENTS.md) rule 1) are listed in the [consolidation note](../../notes/2026-07-17-epic-9-consolidation.md).

| Shipped | Issue | Title | Status |
|---|---|---|---|
| — | [#4883](https://github.com/Koniverse/SubWallet-Extension/issues/4883) | Implement Client-side NFT Service & Migrate Existing Logic to SDK | 📋 backlog |

## Acceptance criteria

- [ ] **AC-1** — This capability is **open** — 1 issue(s) tracked below, not yet started. No release delivers it.

## Cross-references

- [Epic EPIC-9](../epics/EPIC-9.md) · [US-9.19](US-9.19-nft-service-migration.md) · [consolidation note](../../notes/2026-07-17-epic-9-consolidation.md)
