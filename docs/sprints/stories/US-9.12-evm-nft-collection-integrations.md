---
id: US-9.12
title: "EVM NFT collection integrations"
epic: EPIC-9
status: done
priority: P3
points: 1
sprint: sprint-2024-M11
version_shipped: 
prd_ref: []
assignee: tunghp2002
commit: b085296bc1, 76b72aae62, f405285929
created: 2026-07-17
updated: 2026-07-17
---

## Goal

Onboard EVM-side NFT collections and networks — Moonbeam/Moonriver, MoonFit, Moonpets, Snow, and Story Protocol IP-NFTs — through the EVM handler ([US-9.3](US-9.3-evm-nft-display.md)), feeding the same NFT grid.

## Scope

EVM chain/collection onboarding and the Story Protocol IP-NFT integration. The first Story Protocol attempt was superseded by the shipped one.

This is a **consolidated maintenance story**: it groups 9 related tracker issue(s) into one capability with a clear boundary, replacing the former one-issue-per-story ledger. It materializes **no FR** (the NFT requirement set is [US-9.1](US-9.1-substrate-nft-display.md)…[US-9.10](US-9.10-nft-display-and-transfer-hardening.md)); it records incremental work on this capability. Full issue→story traceability is the table below and [notes/2026-07-17-epic-9-consolidation](../../notes/2026-07-17-epic-9-consolidation.md). **`assignee` / `commit` / `sprint` / `points` are a representative backfill anchor** — taken from the most recent constituent that carries a commit (the last row of the timeline), not the full set; the per-issue spread is the timeline below. `version_shipped` is left empty because the capability grew across many releases (0.3.1 → 1.3.7) — no single one delivered it.

## Development timeline & consolidated issues

Chronological by shipped release (0.3.1 → 1.3.7); `—` = closed with no CHANGELOG line. The former one-issue-per-story ids (retired, never reused — [AGENTS.md](../../../AGENTS.md) rule 1) are listed in the [consolidation note](../../notes/2026-07-17-epic-9-consolidation.md).

> 1 issue(s) here are ⏸ **deprecated** — closed not-planned / superseded, never shipped.

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 0.3.1 | [#34](https://github.com/Koniverse/SubWallet-Extension/issues/34) | Send & Receive Moonbeam / Moonriver NFT | ✅ done |
| 0.5.4 | [#517](https://github.com/Koniverse/SubWallet-Extension/issues/517) | Add Moonpets NFT | ✅ done |
| 0.5.6 | [#467](https://github.com/Koniverse/SubWallet-Extension/issues/467) | Integration MoonFit NFT | ✅ done |
| 1.0.5 | [#12](https://github.com/Koniverse/SubWallet-Extension/issues/12) | Integrate Snow EVM network | ✅ done |
| 1.0.5 | [#27](https://github.com/Koniverse/SubWallet-Extension/issues/27) | Update RPC endpoint for Mangata | ✅ done |
| 1.0.6 | [#1404](https://github.com/Koniverse/SubWallet-Extension/issues/1404) | Fix bug show Moonfit’s NFT | ✅ done |
| 1.3.7 | [#3854](https://github.com/Koniverse/SubWallet-Extension/issues/3854) | Integration NFT for Story Protocol | ✅ done |
| — | [#3850](https://github.com/Koniverse/SubWallet-Extension/issues/3850) | Extension - Integration NFT for Story Protocol | ⏸ deprecated |
| — | [#4028](https://github.com/Koniverse/SubWallet-Extension/issues/4028) | Extension - Follow display NFT for Story Odyssey Testnet after mainnet | ✅ done |

## Acceptance criteria

- [x] **AC-1** — All 8 pursued issue(s) below are closed **COMPLETED** and the capability is present in the app (evidence: the release column + each issue's tracker close). 1 issue(s) were closed **not-planned / superseded** and never shipped (⏸ below) — recorded for coverage, not counted as delivered.

## Cross-references

- [Epic EPIC-9](../epics/EPIC-9.md) · [US-9.3](US-9.3-evm-nft-display.md) · [consolidation note](../../notes/2026-07-17-epic-9-consolidation.md)
