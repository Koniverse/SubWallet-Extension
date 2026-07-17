---
id: US-9.17
title: "Bitcoin Ordinals & inscriptions (shipped)"
epic: EPIC-9
status: done
priority: P3
points: 1
sprint: sprint-2023-M12
version_shipped: 
prd_ref: []
assignee: nulllpc
commit: c3d44f7033, 5899d247ea
created: 2026-07-17
updated: 2026-07-17
---

## Goal

Show Bitcoin Ordinals inscriptions on the SubWallet web app and keep the Bitcoin on-chain data source correct — migrating hosted BTC APIs to the Blockstream API and fixing host-API data mismatches (fees, inscriptions, runes).

## Scope

Webapp ordinals/inscriptions display and Bitcoin data-source maintenance. Full **extension**-side RUNE & Ordinal support is tracked separately in [US-9.7](US-9.7-bitcoin-ordinals-display.md) (backlog).

This is a **consolidated maintenance story**: it groups 4 related tracker issue(s) into one capability with a clear boundary, replacing the former one-issue-per-story ledger. It materializes **no FR** (the NFT requirement set is [US-9.1](US-9.1-substrate-nft-display.md)…[US-9.10](US-9.10-nft-display-and-transfer-hardening.md)); it records incremental work on this capability. Full issue→story traceability is the table below and [notes/2026-07-17-epic-9-consolidation](../../notes/2026-07-17-epic-9-consolidation.md). **`assignee` / `commit` / `sprint` / `points` are a representative backfill anchor** — taken from the most recent constituent that carries a commit (the last row of the timeline), not the full set; the per-issue spread is the timeline below. `version_shipped` is left empty because the capability grew across many releases (1.1.36 → 1.1.36) — no single one delivered it.

## Development timeline & consolidated issues

Chronological by shipped release (1.1.36 → 1.1.36); `—` = closed with no CHANGELOG line. The former one-issue-per-story ids (retired, never reused — [AGENTS.md](../../../AGENTS.md) rule 1) are listed in the [consolidation note](../../notes/2026-07-17-epic-9-consolidation.md).

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 1.1.36 | [#2380](https://github.com/Koniverse/SubWallet-Extension/issues/2380) | Showing ordinals on webapp | ✅ done |
| 1.1.36 | [#2399](https://github.com/Koniverse/SubWallet-Extension/issues/2399) | Add more inscriptions on SubWallet Web app | ✅ done |
| — | [#4991](https://github.com/Koniverse/SubWallet-Extension/issues/4991) | Replace hosted BTC APIs with Blockstream API and evaluate Runes/Ordinals alternatives | ✅ done |
| — | [#4997](https://github.com/Koniverse/SubWallet-Extension/issues/4997) | Bitcoin on-chain data mismatch on host API (Fees, Inscriptions, Runes) | ✅ done |

## Acceptance criteria

- [x] **AC-1** — All 4 pursued issue(s) below are closed **COMPLETED** and the capability is present in the app (evidence: the release column + each issue's tracker close). No issue in this group was declined.

## Cross-references

- [Epic EPIC-9](../epics/EPIC-9.md) · [US-9.7](US-9.7-bitcoin-ordinals-display.md) · [consolidation note](../../notes/2026-07-17-epic-9-consolidation.md)
