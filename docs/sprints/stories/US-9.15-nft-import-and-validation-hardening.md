---
id: US-9.15
title: "NFT import & validation hardening"
epic: EPIC-9
status: done
priority: P3
points: 1
sprint: sprint-2025-M12
version_shipped: 1.3.68
prd_ref: []
assignee: frenkie-ng
commit: c19e71f494, 8af7749199, 0e57b1a188, 3973b29199, c2c09972bb
created: 2026-07-17
updated: 2026-07-17
---

## Goal

Make custom NFT import robust — presence/absence of `tokenOfOwnerByIndex`, ERC-721 on new chains (Rari), import-flow bugs and input validation — extending custom import ([US-9.8](US-9.8-custom-nft-import.md)).

## Scope

Import-flow bug fixes, `tokenOfOwnerByIndex` validation (present and absent), ERC-721 support on new chains, and collection-name input handling. Three issues were closed could-not-reproduce / superseded.

This is a **consolidated maintenance story**: it groups 11 related tracker issue(s) into one capability with a clear boundary, replacing the former one-issue-per-story ledger. It materializes **no FR** (the NFT requirement set is [US-9.1](US-9.1-substrate-nft-display.md)…[US-9.10](US-9.10-nft-display-and-transfer-hardening.md)); it records incremental work on this capability. Full issue→story traceability is the table below and [notes/2026-07-17-epic-9-consolidation](../../notes/2026-07-17-epic-9-consolidation.md). **`assignee` / `commit` / `sprint` / `version_shipped` / `points` are a representative backfill anchor** — the most recent shipped constituent (the last row of the timeline), not the full set. The capability actually spans releases 1.1.36 → 1.3.68, so the timeline below is the full record — `version_shipped` names only the last.

## Development timeline & consolidated issues

Chronological by shipped release (1.1.36 → 1.3.68); `—` = closed with no CHANGELOG line. The former one-issue-per-story ids (retired, never reused — [AGENTS.md](../../../AGENTS.md) rule 1) are listed in the [consolidation note](../../notes/2026-07-17-epic-9-consolidation.md).

> 3 issue(s) here are ⏸ **deprecated** — closed not-planned / superseded, never shipped.

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 1.1.36 | [#1216](https://github.com/Koniverse/SubWallet-Extension/issues/1216) | Do not save Collection name input when import NFT | ✅ done |
| 1.3.2 | [#3609](https://github.com/Koniverse/SubWallet-Extension/issues/3609) | Add validate tokenOfOwnerByIndex when import NFT | ✅ done |
| 1.3.2 | [#3699](https://github.com/Koniverse/SubWallet-Extension/issues/3699) | Extension - Add validate when import NFT in case there is no method tokenOfOwnerByIndex | ✅ done |
| 1.3.16 | [#380](https://github.com/Koniverse/SubWallet-Extension/issues/380) | Bug happens when user perform import tokens, import NFT | ✅ done |
| 1.3.49 | [#3818](https://github.com/Koniverse/SubWallet-Extension/issues/3818) | Fixed bug import NFT (#3837) | ✅ done |
| 1.3.68 | [#4568](https://github.com/Koniverse/SubWallet-Extension/issues/4568) | Support show NFT haven't method tokenOfOwnerByIndex | ✅ done |
| 1.3.68 | [#4625](https://github.com/Koniverse/SubWallet-Extension/issues/4625) | Unable to import NFT ERC-721 on Rari chain | ✅ done |
| — | [#620](https://github.com/Koniverse/SubWallet-Extension/issues/620) | Import NFT button not showing after viewing NFT details | ✅ done |
| — | [#1430](https://github.com/Koniverse/SubWallet-Extension/issues/1430) | Crash app in case import NFT by ERC20, PSP22 contract | ⏸ deprecated |
| — | [#3841](https://github.com/Koniverse/SubWallet-Extension/issues/3841) | Extension - Don't show NFT although imported successfully | ⏸ deprecated |
| — | [#3990](https://github.com/Koniverse/SubWallet-Extension/issues/3990) | Extension - Unable to import NFT | ⏸ deprecated |

## Acceptance criteria

- [x] **AC-1** — All 8 pursued issue(s) below are closed **COMPLETED** and the capability is present in the app (evidence: the release column + each issue's tracker close). 3 issue(s) were closed **not-planned / superseded** and never shipped (⏸ below) — recorded for coverage, not counted as delivered.

## Cross-references

- [Epic EPIC-9](../epics/EPIC-9.md) · [US-9.8](US-9.8-custom-nft-import.md) · [consolidation note](../../notes/2026-07-17-epic-9-consolidation.md)
