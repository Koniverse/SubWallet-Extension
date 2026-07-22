---
id: US-9.20
title: "Client-side NFT Service & SDK migration"
epic: EPIC-9
status: done
priority: P3
points: 1
sprint: sprint-2026-M02
version_shipped: 1.3.80
prd_ref: []
arch_ref: [AD-24]
assignee: frenkie-ng
commit: 673c2719e6, e0edb482ab, 104eb5c6d8, 6d0a362943
created: 2026-07-17
updated: 2026-07-22
---

## Goal

Stand up the client-side `NftService` and move the EVM and Unique NFT handlers onto it (#4884, shipped **1.3.80**) — Phase 1 of the migration onto the SubWallet Services SDK, and the successor to the earlier service migration ([US-9.19](US-9.19-nft-service-migration.md)).

## Status

> **✅ done — shipped in 1.3.80.** AC-1 is ticked and the single row below is closed: #4884
> delivered the client-side `NftService` plus the EVM and Unique handlers. **Phase 1 only** — the
> rest of the migration (#4883) is [US-9.24](US-9.24-client-side-nft-service-full-sdk-migration.md).
> Until 2026-07-22 this story claimed the opposite, asserting *"not yet started, no release delivers
> it"* above a row reading `done @ 1.3.80`.

## Scope

**Phase 1 of the client-side `NftService` + SDK migration**, shipped in **1.3.80** (#4884 — `NFTService` plus the EVM and Unique handlers). It materializes **no FR** (the NFT requirement set is [US-9.1](US-9.1-substrate-nft-display.md)…[US-9.10](US-9.10-nft-display-and-transfer-hardening.md)); a migration changes where logic runs, not what the wallet promises. Full issue→story traceability is the table below and [the 2026-07-17 note](../../notes/2026-07-17.md). `points: 1` marks it as one backfill record.

> **This story asserted the opposite until 2026-07-22.** Its AC-1 read *"This capability is
> **open** — 1 issue(s) tracked below, not yet started. No release delivers it"* while its own
> table showed #4884 `✅ done @ 1.3.80`. A story cannot be both undelivered and shipped
> ([D107](../../CONTEXT.md#d107-a-ticked-ac-is-a-claim-about-the-code--four-of-us-51s-were-false-and-one-was-a-p0-security-claim)).
> The remaining migration ([#4883](https://github.com/Koniverse/SubWallet-Extension/issues/4883))
> moved to [US-9.24](US-9.24-client-side-nft-service-full-sdk-migration.md); Phase 1 stays here,
> `done` on the release that carries it.

## Incremental work, fixes & chores

Chronological by shipped release (—); `—` = closed with no CHANGELOG line. The former one-issue-per-story ids (retired, never reused — [AGENTS.md](../../../AGENTS.md) rule 1) are listed in the [consolidation note](../../notes/2026-07-17.md).

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 1.3.80 | [#4884](https://github.com/Koniverse/SubWallet-Extension/issues/4884) | Implement NFTService + migrate EVM & Unique NFT logic (Phase 1) | ✅ done |

## Acceptance criteria

- [x] **AC-1** — The client-side `NftService` exists and the EVM and Unique NFT handlers run through it, delivered by [#4884](https://github.com/Koniverse/SubWallet-Extension/issues/4884) in **1.3.80**.

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | `gh issue view 4884` → CLOSED/COMPLETED · CHANGELOG 1.3.80 names it · `ls packages/extension-base/src/services/nft-service/` |

## Implementation notes

**Evidence:** CHANGELOG `## 1.3.80` (Build date: Jun 02, 2026) — *"Implement NFTService + Migrate EVM & Unique Network NFT logic (Phase 1) (#4884)"*. The four commits above create and populate the service — `673c2719e6` renames the folder into `nft-service`, `e0edb482ab` removes the EVM on-chain fetch handler after migrating to the SDK, `104eb5c6d8` adds the service event listeners, `6d0a362943` maps NFT data through the new endpoint — and each has `v1.3.80` as its first containing release tag (`git tag --contains <sha> | sort -V | head -1`). Last substantive commit 2026-02-23, so `sprint` is reconstructed as `sprint-2026-M02`.

> **#4884 has one sub-issue, and another story owns it.**
> [#4768](https://github.com/Koniverse/SubWallet-Extension/issues/4768) *"Implement UI to support
> the Nested NFT standard"* is its child and is a row in
> [US-9.2](US-9.2-nested-bundled-nft-display.md). #4884 stays a row here rather than moving to the
> epic's umbrella table because it carries **its own CHANGELOG line** in 1.3.80 — it delivered
> something ([AGENTS.md](../../../AGENTS.md) rule 10). The parent of *both* is #4883, which is the
> umbrella and is recorded on [EPIC-9](../epics/EPIC-9.md).

> **Not every `[Issue-4884]` commit is this work.** `5fcc109aee` *"add account details for multisig"* carries the same tag and is v1.3.74 multisig UI — a branch-tag collision, the case [D106](../../CONTEXT.md#d106-commit-names-what-made-the-capability-true--a-release-bump-made-nothing-true) covers. The four cited above were selected by content, not by tag.

## Cross-references

- [Epic EPIC-9](../epics/EPIC-9.md) · [US-9.19](US-9.19-nft-service-migration.md) · [US-9.24](US-9.24-client-side-nft-service-full-sdk-migration.md) · [consolidation note](../../notes/2026-07-17.md)
