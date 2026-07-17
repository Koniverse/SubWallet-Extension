---
id: US-9.13
title: "NFT media & IPFS gateway pipeline"
epic: EPIC-9
status: done
priority: P3
points: 1
sprint: sprint-2025-M09
version_shipped: 1.3.56
prd_ref: [NFR-21]
arch_ref: [AD-25]
assignee: Thiendekaco
commit: d8d80ba60f
created: 2026-07-17
updated: 2026-07-17
---

## Goal

Keep NFT media rendering reliable as upstream sources change — RMRK endpoints/API, nft.storage, the IPFS resolver and gateway fallbacks, image-error and source-failure handling — so a dead asset or a moved endpoint never blanks the collection grid.

## Scope

RMRK/IPFS endpoint & API maintenance, JSON/link parsing, resolver and gateway-fallback fixes, non-extension-environment gateway support, and the Vara/PAH image fix.

This is a **consolidated maintenance story**: it groups 14 related tracker issue(s) into one capability with a clear boundary, replacing the former one-issue-per-story ledger. It materializes **no FR** (the NFT requirement set is [US-9.1](US-9.1-substrate-nft-display.md)…[US-9.10](US-9.10-nft-display-and-transfer-hardening.md)); it records incremental work on this capability. Full issue→story traceability is the table below and [notes/2026-07-17-epic-9-consolidation](../../notes/2026-07-17-epic-9-consolidation.md). **`assignee` / `commit` / `sprint` / `version_shipped` / `points` are a representative backfill anchor** — the most recent shipped constituent (the last row of the timeline), not the full set. The capability actually spans releases 0.4.3 → 1.3.56, so the timeline below is the full record — `version_shipped` names only the last.

## Development timeline & consolidated issues

Chronological by shipped release (0.4.3 → 1.3.56); `—` = closed with no CHANGELOG line. The former one-issue-per-story ids (retired, never reused — [AGENTS.md](../../../AGENTS.md) rule 1) are listed in the [consolidation note](../../notes/2026-07-17-epic-9-consolidation.md).

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 0.4.3 | [#289](https://github.com/Koniverse/SubWallet-Extension/issues/289) | Update ipfs gateway for rmrk | ✅ done |
| 0.5.2 | [#415](https://github.com/Koniverse/SubWallet-Extension/issues/415) | Error parsing JSON from RMRK NFT | ✅ done |
| 0.5.3 | [#480](https://github.com/Koniverse/SubWallet-Extension/issues/480) | Optimize NFT loading with <https://nft.storage/> | ✅ done |
| 0.5.6 | [#557](https://github.com/Koniverse/SubWallet-Extension/issues/557) | Fix bug happens when NFT image error | ✅ done |
| 0.7.2 | [#779](https://github.com/Koniverse/SubWallet-Extension/issues/779) | Update parsing IPFS link for NFT | ✅ done |
| 0.7.5 | [#893](https://github.com/Koniverse/SubWallet-Extension/issues/893) | Update RMRK NFT endpoints | ✅ done |
| 0.8.1 | [#963](https://github.com/Koniverse/SubWallet-Extension/issues/963) | Update RMRK NFT endpoints | ✅ done |
| 1.0.6 | [#1414](https://github.com/Koniverse/SubWallet-Extension/issues/1414) | Update RMRK API | ✅ done |
| 1.1.1 | [#1602](https://github.com/Koniverse/SubWallet-Extension/issues/1602) | Fixed NFT Gateway problems with non-extension environment | ✅ done |
| 1.1.4 | [#1672](https://github.com/Koniverse/SubWallet-Extension/issues/1672) | Can not load another NFTs when collection contain any NFT with wrong information | ✅ done |
| 1.1.11 | [#1656](https://github.com/Koniverse/SubWallet-Extension/issues/1656) | Fix IPFS resolver NFT Problems | ✅ done |
| 1.3.56 | [#4132](https://github.com/Koniverse/SubWallet-Extension/issues/4132) | Fixed bug Do not display NFT images on Vara network, PAH | ✅ done |
| — | [#614](https://github.com/Koniverse/SubWallet-Extension/issues/614) | Bug happens when get NFT from ipfs-gateway.cloud | ✅ done |
| — | [#619](https://github.com/Koniverse/SubWallet-Extension/issues/619) | Improved handling for case the NFT's source failure | ✅ done |

## Acceptance criteria

- [x] **AC-1** — All 14 pursued issue(s) below are closed **COMPLETED** and the capability is present in the app (evidence: the release column + each issue's tracker close). No issue in this group was declined.

## Cross-references

- [Epic EPIC-9](../epics/EPIC-9.md) · [US-9.6](US-9.6-3d-and-video-nft-viewer.md), [US-9.10](US-9.10-nft-display-and-transfer-hardening.md) · [consolidation note](../../notes/2026-07-17-epic-9-consolidation.md)
