---
id: US-9.11
title: "Substrate NFT collection & chain integrations"
epic: EPIC-9
status: done
priority: P3
points: 1
sprint: sprint-2024-M10
version_shipped: 1.3.2
prd_ref: []
assignee: tunghp2002
commit: e8f6044397, 8b1d8a175e, 691f7d7c86
created: 2026-07-17
updated: 2026-07-17
---

## Goal

Progressively onboard NFT support for Substrate ecosystems and individual collections beyond the core standards — Astar, Bit.Country/Pioneer, Karura, Unique, Zeitgeist, Ternoa, ArtZero and others. Each is a handler or collection-config addition behind the one NFT grid ([US-9.1](US-9.1-substrate-nft-display.md)), never a new screen.

## Scope

Per-chain / per-collection onboarding, collection metadata & attributes (owner, Pioneer land/estate), per-marketplace API config (ArtZero for Astar), the ink!4.0 / PSP migration, and collection-visibility fixes. Declined integrations are recorded, not silently dropped.

This is a **consolidated maintenance story**: it groups 25 related tracker issue(s) into one capability with a clear boundary, replacing the former one-issue-per-story ledger. It materializes **no FR** (the NFT requirement set is [US-9.1](US-9.1-substrate-nft-display.md)…[US-9.10](US-9.10-nft-display-and-transfer-hardening.md)); it records incremental work on this capability. Full issue→story traceability is the table below and [notes/2026-07-17-epic-9-consolidation](../../notes/2026-07-17-epic-9-consolidation.md). **`assignee` / `commit` / `sprint` / `version_shipped` / `points` are a representative backfill anchor** — the most recent shipped constituent (the last row of the timeline), not the full set. The capability actually spans releases 0.3.1 → 1.3.2, so the timeline below is the full record — `version_shipped` names only the last.

## Development timeline & consolidated issues

Chronological by shipped release (0.3.1 → 1.3.2); `—` = closed with no CHANGELOG line. The former one-issue-per-story ids (retired, never reused — [AGENTS.md](../../../AGENTS.md) rule 1) are listed in the [consolidation note](../../notes/2026-07-17-epic-9-consolidation.md).

> 3 issue(s) here are ⏸ **deprecated** — closed not-planned / superseded, never shipped.

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 0.3.1 | [#52](https://github.com/Koniverse/SubWallet-Extension/issues/52) | Integrate Bit.Country NFT: Display, Send, Receive | ✅ done |
| 0.3.2 | [#44](https://github.com/Koniverse/SubWallet-Extension/issues/44) | Integrate Astar NFT | ✅ done |
| 0.3.4 | [#175](https://github.com/Koniverse/SubWallet-Extension/issues/175) | Update Astar NFT: Astar Pass & Astar Cats | ✅ done |
| 0.4.2 | [#184](https://github.com/Koniverse/SubWallet-Extension/issues/184) | Integrate new cross-chain tokens on Karura (RMRK, ARIS, QTZ, ...) | ✅ done |
| 0.6.4 | [#654](https://github.com/Koniverse/SubWallet-Extension/issues/654) | Add owner attribute to Pioneer NFT | ✅ done |
| 0.6.5 | [#649](https://github.com/Koniverse/SubWallet-Extension/issues/649) | Integrate Pioneer Network NFT | ✅ done |
| 0.6.7 | [#635](https://github.com/Koniverse/SubWallet-Extension/issues/635) | Integration ArtZero NFT | ✅ done |
| 0.7.7 | [#950](https://github.com/Koniverse/SubWallet-Extension/issues/950) | Do not show sub0 Lisbon 2022 NFT | ✅ done |
| 0.8.3 | [#1095](https://github.com/Koniverse/SubWallet-Extension/issues/1095) | Update logic for ink 4.0 and delete old PSP token | ✅ done |
| 1.0.5 | [#29](https://github.com/Koniverse/SubWallet-Extension/issues/29) | Update Zeitgeist and Subsocial integration | ✅ done |
| 1.1.2 | [#1335](https://github.com/Koniverse/SubWallet-Extension/issues/1335) | Integrate Land/Estate NFT on Pioneer's metaverses | ✅ done |
| 1.1.18 | [#2029](https://github.com/Koniverse/SubWallet-Extension/issues/2029) | Fixed bug Do not show Acala, Karura NFT | ✅ done |
| 1.3.2 | [#3559](https://github.com/Koniverse/SubWallet-Extension/issues/3559) | Support Ternoa NFT | ✅ done |
| — | [#28](https://github.com/Koniverse/SubWallet-Extension/issues/28) | Send / Receive NFT: Acala & Karura | ✅ done |
| — | [#30](https://github.com/Koniverse/SubWallet-Extension/issues/30) | Send / Receive NFT: Statemine / Statemint | ✅ done |
| — | [#194](https://github.com/Koniverse/SubWallet-Extension/issues/194) | Collect NFT on Singular.app but it doesnt show on SubWallet | ✅ done |
| — | [#205](https://github.com/Koniverse/SubWallet-Extension/issues/205) | Add Polka Potions NFT collection | ✅ done |
| — | [#230](https://github.com/Koniverse/SubWallet-Extension/issues/230) | Integrate NFTs on Altair NFT Playground | ⏸ deprecated |
| — | [#603](https://github.com/Koniverse/SubWallet-Extension/issues/603) | Integrate Gromlins NFT | ⏸ deprecated |
| — | [#622](https://github.com/Koniverse/SubWallet-Extension/issues/622) | Support Bit.Country'NFT Trading and Land Portfolio | ✅ done |
| — | [#688](https://github.com/Koniverse/SubWallet-Extension/issues/688) | Support Zeitgeist NFT | ✅ done |
| — | [#1285](https://github.com/Koniverse/SubWallet-Extension/issues/1285) | Add ArtZero API for Astar's NFT | ✅ done |
| — | [#1441](https://github.com/Koniverse/SubWallet-Extension/issues/1441) | Integrate Unique's NFT into SubWallet | ✅ done |
| — | [#1646](https://github.com/Koniverse/SubWallet-Extension/issues/1646) | Support Zk Assets NFT | ⏸ deprecated |
| — | [#2195](https://github.com/Koniverse/SubWallet-Extension/issues/2195) | Recheck the impact on NFT features when ArtZero updates its API | ✅ done |

## Acceptance criteria

- [x] **AC-1** — All 22 pursued issue(s) below are closed **COMPLETED** and the capability is present in the app (evidence: the release column + each issue's tracker close). 3 issue(s) were closed **not-planned / superseded** and never shipped (⏸ below) — recorded for coverage, not counted as delivered.

## Cross-references

- [Epic EPIC-9](../epics/EPIC-9.md) · [US-9.1](US-9.1-substrate-nft-display.md) · [consolidation note](../../notes/2026-07-17-epic-9-consolidation.md)
