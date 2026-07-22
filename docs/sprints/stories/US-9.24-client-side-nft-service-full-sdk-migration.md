---
id: US-9.24
title: "Client-side NFT Service — full SDK migration (improvement on US-9.20)"
epic: EPIC-9
status: backlog
priority: P3
points: 1
sprint:
version_shipped:
prd_ref: []
arch_ref: [AD-24]
assignee: frenkie-ng
commit:
created: 2026-07-22
updated: 2026-07-22
---

## Goal

Migrate the **remaining chains** onto the client-side `NftService` and the SubWallet Services SDK
([#4885](https://github.com/Koniverse/SubWallet-Extension/issues/4885), *Phase 2*) — everything
Phase 1 did not move. Open, In Backlog on the board.

## Status

> **📋 backlog — nothing here has shipped.** The single row below is **open on the tracker**, and
> its one acceptance criterion is not ticked. `assignee`, `commit`, `sprint` and
> `version_shipped` stay empty until it ships.

## Scope

This is the **unfinished half of [US-9.20](US-9.20-client-side-nft-service-and-sdk-migration.md)**,
split out on 2026-07-22. Phase 1 shipped in **1.3.80** (#4884 — `NFTService` plus the EVM and
Unique handlers) and stays in US-9.20; this is the rest of the migration.

It materializes **no FR** — the NFT requirement set is
[US-9.1](US-9.1-substrate-nft-display.md)…[US-9.10](US-9.10-nft-display-and-transfer-hardening.md);
a migration changes where the logic runs, not what the wallet promises. It consumes
[AD-24](../../ARCHITECTURE.md#architecture-decisions), it does not re-decide it.

**The split fixed a false claim, not just a layout.** Until 2026-07-22 US-9.20's AC-1 read *"This
capability is **open** — 1 issue(s) tracked below, not yet started. No release delivers it"* while
its own table showed #4884 `✅ done @ 1.3.80`. One story cannot both be undelivered and shipped;
Phase 1 is shipped and this is the part that is not
([D107](../../CONTEXT.md#d107-a-ticked-ac-is-a-claim-about-the-code--four-of-us-51s-were-false-and-one-was-a-p0-security-claim)).

> **This story was itself anchored on the wrong issue for a few hours.** It first claimed
> [#4883](https://github.com/Koniverse/SubWallet-Extension/issues/4883) — which is the **parent**
> of the already-shipped #4884, so a reader following it landed on an issue containing completed
> work. #4883 is an umbrella and belongs to [EPIC-9](../epics/EPIC-9.md)
> ([AGENTS.md](../../../AGENTS.md) rule 10); the open leaf is **#4885**. That issue was also in the
> wrong ledger — filed under Network & Token, whose ledger story is retired. Both corrections, and
> the retired id, are in the [umbrella sweep](../../notes/2026-07-22-umbrella-sweep.md).

## Incremental work, fixes & chores

| Shipped | Issue | Title | Status |
|---|---|---|---|
| — | [#4885](https://github.com/Koniverse/SubWallet-Extension/issues/4885) | Migrate Remaining Chains to SDK & Integrate into NFTService (Phase 2) | 📋 backlog |

## Acceptance criteria

- [ ] **AC-1** — The NFT handlers Phase 1 left behind run through the client-side `NftService` / Services SDK path, and no NFT surface still reads through the pre-migration route.

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | `gh issue view 4885` → state · `ls packages/extension-base/src/services/nft-service/nft-handlers/` → every handler on the SDK path |

## Cross-references

- [Epic EPIC-9](../epics/EPIC-9.md) · [US-9.20](US-9.20-client-side-nft-service-and-sdk-migration.md) · [US-9.19](US-9.19-nft-service-migration.md) · [consolidation note](../../notes/2026-07-17-epic-9-consolidation.md) · [umbrella sweep](../../notes/2026-07-22-umbrella-sweep.md)
