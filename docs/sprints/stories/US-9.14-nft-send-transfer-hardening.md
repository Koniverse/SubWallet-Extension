---
id: US-9.14
title: "NFT send / transfer hardening"
epic: EPIC-9
status: done
priority: P3
points: 1
sprint: sprint-2024-M12
version_shipped: 1.3.9
prd_ref: []
assignee: PDTnhah
commit: 97d65debec, 3859c239de, 460ead0e9c, 9e4fd519f5
created: 2026-07-17
updated: 2026-07-17
---

## Goal

Harden the NFT send path across chains and surfaces — QR accounts, all-accounts quantity, the unified address-input component, transfer amount/history correctness, and Vara/Ethereum specifics — building on core transfer ([US-9.5](US-9.5-nft-transfer-send.md)).

## Scope

Send bug fixes (balance, error states, Ethereum, Bit.Country), QR transfer, address input & validation, address-book navigation, and transfer amount/history correctness. Round-2 address validation (#2858) is tracked open in [US-9.10](US-9.10-nft-display-and-transfer-hardening.md).

This is a **consolidated maintenance story**: it groups 17 related tracker issue(s) into one capability with a clear boundary, replacing the former one-issue-per-story ledger. It materializes **no FR** (the NFT requirement set is [US-9.1](US-9.1-substrate-nft-display.md)…[US-9.10](US-9.10-nft-display-and-transfer-hardening.md)); it records incremental work on this capability. Full issue→story traceability is the table below and [notes/2026-07-17-epic-9-consolidation](../../notes/2026-07-17-epic-9-consolidation.md). **`assignee` / `commit` / `sprint` / `version_shipped` / `points` are a representative backfill anchor** — the most recent shipped constituent (the last row of the timeline), not the full set. The capability actually spans releases 0.4.1 → 1.3.9, so the timeline below is the full record — `version_shipped` names only the last.

## Development timeline & consolidated issues

Chronological by shipped release (0.4.1 → 1.3.9); `—` = closed with no CHANGELOG line. The former one-issue-per-story ids (retired, never reused — [AGENTS.md](../../../AGENTS.md) rule 1) are listed in the [consolidation note](../../notes/2026-07-17-epic-9-consolidation.md).

> 2 issue(s) here are ⏸ **deprecated** — closed not-planned / superseded, never shipped.

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 0.4.1 | [#209](https://github.com/Koniverse/SubWallet-Extension/issues/209) | Fix bug can not send EVM NFT | ✅ done |
| 0.4.3 | [#265](https://github.com/Koniverse/SubWallet-Extension/issues/265) | Bug Send NFT when balance is too low | ✅ done |
| 0.4.4 | [#321](https://github.com/Koniverse/SubWallet-Extension/issues/321) | Fix bug 'Encountered an error, please try again' when Send NFT | ✅ done |
| 0.6.8 | [#747](https://github.com/Koniverse/SubWallet-Extension/issues/747) | Issue sending Bit.Country NFT and displaying BIT token | ✅ done |
| 0.6.8 | [#759](https://github.com/Koniverse/SubWallet-Extension/issues/759) | Unable to send NFT with QR Account in case of network not selected | ✅ done |
| 1.1.27 | [#2373](https://github.com/Koniverse/SubWallet-Extension/issues/2373) | Fixed bug show transfer NFT history details | ✅ done |
| 1.1.36 | [#1830](https://github.com/Koniverse/SubWallet-Extension/issues/1830) | WebApp - Error page in case send NFT | ✅ done |
| 1.1.36 | [#1957](https://github.com/Koniverse/SubWallet-Extension/issues/1957) | WebApp - Can't navigate Address book screen when send NFT | ✅ done |
| 1.1.55 | [#2695](https://github.com/Koniverse/SubWallet-Extension/issues/2695) | WebApp - Adjust showing/validating address on Send token, Send NFT, History | ✅ done |
| 1.2.10 | [#3133](https://github.com/Koniverse/SubWallet-Extension/issues/3133) | Fix bug Show incorrect Amount on Transaction history, Transaction confirmation for transfer NFT | ✅ done |
| 1.3.1 | [#3537](https://github.com/Koniverse/SubWallet-Extension/issues/3537) | Unified account - Update address input component for NFT transfer | ✅ done |
| 1.3.9 | [#3762](https://github.com/Koniverse/SubWallet-Extension/issues/3762) | Fixed bug send NFT on Ethereum network | ✅ done |
| — | [#350](https://github.com/Koniverse/SubWallet-Extension/issues/350) | [QR] [Transfer] [NFT] Support transfer NFT via QR | ✅ done |
| — | [#729](https://github.com/Koniverse/SubWallet-Extension/issues/729) | Show incorrect NFT quantity on All Accounts mode in case send NFT on the same wallet | ✅ done |
| — | [#1132](https://github.com/Koniverse/SubWallet-Extension/issues/1132) | An error occurs when send WASM NFT | ⏸ deprecated |
| — | [#3287](https://github.com/Koniverse/SubWallet-Extension/issues/3287) | WebApp - Show incorrect Amount on Transaction confirmation for transfer NFT | ⏸ deprecated |
| — | [#3716](https://github.com/Koniverse/SubWallet-Extension/issues/3716) | Extension - Don't show transferable balance when send NFT on Vara network | ✅ done |

## Acceptance criteria

- [x] **AC-1** — All 15 pursued issue(s) below are closed **COMPLETED** and the capability is present in the app (evidence: the release column + each issue's tracker close). 2 issue(s) were closed **not-planned / superseded** and never shipped (⏸ below) — recorded for coverage, not counted as delivered.

## Cross-references

- [Epic EPIC-9](../epics/EPIC-9.md) · [US-9.5](US-9.5-nft-transfer-send.md), [US-9.10](US-9.10-nft-display-and-transfer-hardening.md) · [consolidation note](../../notes/2026-07-17-epic-9-consolidation.md)
