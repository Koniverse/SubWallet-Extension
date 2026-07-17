---
id: US-9.16
title: "NFT display, detail & webapp UI hardening"
epic: EPIC-9
status: done
priority: P3
points: 1
sprint: sprint-2024-M10
version_shipped: 1.3.3
prd_ref: []
assignee: tunghp2002
commit: a0eba39f51
created: 2026-07-17
updated: 2026-07-17
---

## Goal

Keep the NFT surface correct as the app evolved (extension → webapp, successive UI upgrades) — the detail screen, collection/item IDs, sent-NFT and off-network display, cross-browser rendering and attributes — so what the user sees matches what they actually hold.

## Scope

Display/detail-screen fixes, Home/NFT UI upgrades, sent-NFT and turned-off-network visibility, cross-browser (2-browser) consistency, the manage-NFT webapp surface, and per-collection display bugs (OG WUD BURN, sub0 Lisbon).

This is a **consolidated maintenance story**: it groups 24 related tracker issue(s) into one capability with a clear boundary, replacing the former one-issue-per-story ledger. It materializes **no FR** (the NFT requirement set is [US-9.1](US-9.1-substrate-nft-display.md)…[US-9.10](US-9.10-nft-display-and-transfer-hardening.md)); it records incremental work on this capability. Full issue→story traceability is the table below and [notes/2026-07-17-epic-9-consolidation](../../notes/2026-07-17-epic-9-consolidation.md). **`assignee` / `commit` / `sprint` / `version_shipped` / `points` are a representative backfill anchor** — the most recent shipped constituent (the last row of the timeline), not the full set. The capability actually spans releases 0.3.3 → 1.3.3, so the timeline below is the full record — `version_shipped` names only the last.

## Development timeline & consolidated issues

Chronological by shipped release (0.3.3 → 1.3.3); `—` = closed with no CHANGELOG line. The former one-issue-per-story ids (retired, never reused — [AGENTS.md](../../../AGENTS.md) rule 1) are listed in the [consolidation note](../../notes/2026-07-17-epic-9-consolidation.md).

> 4 issue(s) here are ⏸ **deprecated** — closed not-planned / superseded, never shipped.

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 0.3.3 | [#105](https://github.com/Koniverse/SubWallet-Extension/issues/105) | Some problems related to NFT function | ✅ done |
| 0.3.3 | [#109](https://github.com/Koniverse/SubWallet-Extension/issues/109) | Improve NFT display with extending mode | ✅ done |
| 0.3.4 | [#102](https://github.com/Koniverse/SubWallet-Extension/issues/102) | Improve get NFT flow | ✅ done |
| 0.4.1 | [#200](https://github.com/Koniverse/SubWallet-Extension/issues/200) | Fix bug can not load NFT | ✅ done |
| 0.6.4 | [#643](https://github.com/Koniverse/SubWallet-Extension/issues/643) | Add more attributes to NFT collection and item | ✅ done |
| 0.7.4 | [#864](https://github.com/Koniverse/SubWallet-Extension/issues/864) | Fix bug NFT displays an error after update function parses transaction in case upgrade version | ✅ done |
| 1.0.2 | [#1006](https://github.com/Koniverse/SubWallet-Extension/issues/1006) | Upgrade UI - Screen Home / NFT | ✅ done |
| 1.0.2 | [#1172](https://github.com/Koniverse/SubWallet-Extension/issues/1172) | Upgrade UI - Improve some issues related to the NFT feature | ✅ done |
| 1.0.2 | [#1235](https://github.com/Koniverse/SubWallet-Extension/issues/1235) | Still showing sent NFT when using 2 different browser | ✅ done |
| 1.1.8 | [#1784](https://github.com/Koniverse/SubWallet-Extension/issues/1784) | Show collection ID and NFT Id in the NFT detail screen | ✅ done |
| 1.1.9 | [#1817](https://github.com/Koniverse/SubWallet-Extension/issues/1817) | Fix a few minor bugs with NFT | ✅ done |
| 1.1.36 | [#1683](https://github.com/Koniverse/SubWallet-Extension/issues/1683) | WebApp - Bugs related Manage NFT feature | ✅ done |
| 1.1.36 | [#1835](https://github.com/Koniverse/SubWallet-Extension/issues/1835) | WebApp - Still showing sent NFT | ✅ done |
| 1.1.36 | [#1978](https://github.com/Koniverse/SubWallet-Extension/issues/1978) | WebApp - NFT isn't displayed after import successfully | ✅ done |
| 1.1.44 | [#2748](https://github.com/Koniverse/SubWallet-Extension/issues/2748) | Fixed bug error page on NFT details screen | ✅ done |
| 1.3.3 | [#3791](https://github.com/Koniverse/SubWallet-Extension/issues/3791) | Fix bug show OG WUD BURN NFT Collection | ✅ done |
| — | [#95](https://github.com/Koniverse/SubWallet-Extension/issues/95) | Display incorrect screen when click on “Back to Homepage” button in case Send NFT History has just been recorded on Subs | ✅ done |
| — | [#97](https://github.com/Koniverse/SubWallet-Extension/issues/97) | Can't open or takes a long time to open the extension if I previously turned off the extension in the NFT tab ... | ✅ done |
| — | [#1151](https://github.com/Koniverse/SubWallet-Extension/issues/1151) | Upgrade UI - Still show NFT when turning off the network | ✅ done |
| — | [#1154](https://github.com/Koniverse/SubWallet-Extension/issues/1154) | Upgrade UI - Still shows NFT sent | ✅ done |
| — | [#1258](https://github.com/Koniverse/SubWallet-Extension/issues/1258) | Show duplicate network enable message in the import token, import nft screen | ⏸ deprecated |
| — | [#1300](https://github.com/Koniverse/SubWallet-Extension/issues/1300) | Bug when URL NFT collection fails | ⏸ deprecated |
| — | [#1909](https://github.com/Koniverse/SubWallet-Extension/issues/1909) | WebApp - Re- check NFT of the Statemine network | ⏸ deprecated |
| — | [#2106](https://github.com/Koniverse/SubWallet-Extension/issues/2106) | Do not delete NFT data when reset wallet | ⏸ deprecated |

## Acceptance criteria

- [x] **AC-1** — All 20 pursued issue(s) below are closed **COMPLETED** and the capability is present in the app (evidence: the release column + each issue's tracker close). 4 issue(s) were closed **not-planned / superseded** and never shipped (⏸ below) — recorded for coverage, not counted as delivered.

## Cross-references

- [Epic EPIC-9](../epics/EPIC-9.md) · [US-9.1](US-9.1-substrate-nft-display.md), [US-9.10](US-9.10-nft-display-and-transfer-hardening.md) · [consolidation note](../../notes/2026-07-17-epic-9-consolidation.md)
