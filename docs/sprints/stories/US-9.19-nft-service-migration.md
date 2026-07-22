---
id: US-9.19
title: "NFT service migration"
epic: EPIC-9
status: done
priority: P3
points: 1
sprint: sprint-2023-M06
version_shipped: 1.0.2
prd_ref: []
arch_ref: [AD-24]
assignee: nulllpc
commit: e58a9257cb, c42ae99dc9, f143eacc34
created: 2026-07-17
updated: 2026-07-17
---

## Goal

Migrate the NFT feature onto the new-UI service architecture (#967) — shipped in **v1.0.2** as the "Migrate NFT feature into new UI" work. The forward-looking client-side NFT Service + SDK migration continues in [US-9.20](US-9.20-client-side-nft-service-and-sdk-migration.md).

## Status

> **✅ done — shipped in 1.0.2.** Its one acceptance criterion is ticked, and the single row below is settled (shipped).
> **The table is history, not a work list** — a `done` story may not carry an open row ([AGENTS.md](../../../AGENTS.md) rule 9).

## Scope

The NFT-feature migration into the new UI / service architecture (v1.0.2). Superseded, going forward, by the client-side NFT Service work ([US-9.20](US-9.20-client-side-nft-service-and-sdk-migration.md)).

This is a **consolidated maintenance story**: it groups 1 related tracker issue into one capability, replacing the former one-issue-per-story ledger. It materializes **no FR** (the NFT requirement set is [US-9.1](US-9.1-substrate-nft-display.md)…[US-9.10](US-9.10-nft-display-and-transfer-hardening.md)); it records incremental work on this capability. Full issue→story traceability is the table below and [notes/2026-07-17-epic-9-consolidation](../../notes/2026-07-17-epic-9-consolidation.md). **`assignee` / `commit` / `sprint` / `version_shipped` / `points` are a representative backfill anchor** — here, the delivering migration work itself (see Evidence).

## Incremental work, fixes & chores

Chronological by shipped release (1.0.2). The former one-issue-per-story id (retired, never reused — [AGENTS.md](../../../AGENTS.md) rule 1) is listed in the [consolidation note](../../notes/2026-07-17-epic-9-consolidation.md).

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 1.0.2 | [#967](https://github.com/Koniverse/SubWallet-Extension/issues/967) | Migrate NFT feature | ✅ done |

## Evidence

Issue #967 ("Migrate NFT feature") shipped in **v1.0.2** as the combined **"[Issue 1006 + 967] Migrate NFT feature into new UI"** PR. The delivering commits are tagged with the sibling **#1006** ("Upgrade UI - Screen Home / NFT", part of [US-9.10](US-9.10-nft-display-and-transfer-hardening.md)); #1006's own record claims only its *later* UI-fix commits, so the **migration** commits are unclaimed and are exactly this issue's goal ([D106](../../CONTEXT.md) — content over tag):

- `e58a9257cb` — *"[Issue-1006] merge upgrade-ui"*
- `c42ae99dc9` — *"[Issue-1006] finish NFTCollectionDetail"*
- `f143eacc34` — *"[Issue-1006] update handling NFT image"*

by `nulllpc` (git author *Nam Phạm* → `nulllpc`, repo-owner-confirmed in the [contributor map](../../notes/contributor-map.md)). All verified ancestors of `v1.0.2`.

## Acceptance criteria

- [x] **AC-1** — Issue #967 is closed **COMPLETED** and **shipped in v1.0.2**; evidence: the migration commits above are ancestors of `v1.0.2`, delivered as the "Migrate NFT feature into new UI" PR (subject tags sibling #1006 — [D106](../../CONTEXT.md)).

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | `git merge-base --is-ancestor e58a9257cb v1.0.2` exits 0 · `git merge-base --is-ancestor c42ae99dc9 v1.0.2` exits 0 |

## Cross-references

- [Epic EPIC-9](../epics/EPIC-9.md) · [US-9.20](US-9.20-client-side-nft-service-and-sdk-migration.md) · [US-9.10](US-9.10-nft-display-and-transfer-hardening.md) (sibling #1006) · [consolidation note](../../notes/2026-07-17-epic-9-consolidation.md)
