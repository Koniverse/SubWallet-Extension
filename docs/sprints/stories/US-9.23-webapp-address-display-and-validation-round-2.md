---
id: US-9.23
title: "WebApp address display & validation, round 2 (improvement on US-9.10)"
epic: EPIC-9
status: backlog
priority: P3
points: 1
sprint:
version_shipped:
prd_ref: []
assignee:
commit:
created: 2026-07-22
updated: 2026-07-22
---

## Goal

Finish the **second round of address display and validation on the WebApp** across Send token,
Send NFT and History
([#2858](https://github.com/Koniverse/SubWallet-Extension/issues/2858)). Open since 2024-04-03,
not started.

## Status

> **📋 backlog — nothing here has shipped.** The single row below is **open on the tracker**, and
> its one acceptance criterion is not ticked. `assignee`, `commit`, `sprint` and
> `version_shipped` stay empty until it ships.

## Scope

This is an **improvement story on a hardening one**.
[US-9.10](US-9.10-nft-display-and-transfer-hardening.md) carries 24 settled rows — 20 shipped
fixes and 4 closed not-planned. This was its only open row, and it moved here on 2026-07-22 so
US-9.10 can pass its done-pass on what it actually delivered.

It materializes **no FR** — US-9.10 defends FR-85 / FR-89 / FR-92 and keeps them.

**The title says "Round 2", and round 1 is not in this story.** Whichever issue was round 1 closed
long enough ago to be somewhere else in the NFT ledger; this story claims only #2858 and does not
assert what round 1 was. Naming a round-1 issue without checking would be the reconstruction habit
this program exists to unwind.

## Incremental work, fixes & chores

| Shipped | Issue | Title | Status |
|---|---|---|---|
| — | [#2858](https://github.com/Koniverse/SubWallet-Extension/issues/2858) | WebApp — Adjust showing/validating address on Send token, Send NFT, History (Round 2) | 📋 backlog |

## Acceptance criteria

- [ ] **AC-1** — On the WebApp, addresses render and validate consistently across Send token, Send NFT and History, and the specific adjustments listed on #2858 are covered.

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | `gh issue view 2858` → state · manual: WebApp Send token / Send NFT / History, address display + validation |

## Cross-references

- [Epic EPIC-9](../epics/EPIC-9.md) · [US-9.10](US-9.10-nft-display-and-transfer-hardening.md) · [US-9.5](US-9.5-nft-transfer-send.md) · [consolidation note](../../notes/2026-07-17.md)
