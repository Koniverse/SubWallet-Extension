---
id: US-1.6
title: "Platform operations & out-of-repo tooling"
epic: EPIC-1
status: in-progress
priority: P3
points: 1
sprint: sprint-2026-W30
version_shipped: 
prd_ref: []
assignee: 
commit: 
created: 2026-07-22
updated: 2026-07-22
---

## Goal

Hold the **platform work this tracker recorded whose code does not live in this repository** —
backend middleware, backend deploy pipelines, the ChainList site, an analytics dashboard, a user
support system. It ships no extension capability. Its purpose is that the tracker stays fully
claimed without any of these being mistaken for extension work.

## Scope

This is a **consolidated maintenance story**: it groups 4 tracker issues into one boundary,
replacing the former one-issue-per-story ledger. It materializes **no FR**, and it never will —
an FR describes what the *wallet* does, and none of these is in the wallet. Full traceability is
the table below and the [consolidation note](../../notes/2026-07-22-epic-1-consolidation.md).

**Why these are grouped rather than distributed.** Each is real work the team tracked here, and
each fails the test that would place it in any other story: there is no code in `packages/` to
point at. Filing them against a capability would make that capability's history read as if the
wallet had gained something it did not. Filing them under *Uncategorized* would be wrong in the
other direction — they are not unclassifiable, they are **classified as out-of-repo**.

**What this story deliberately does not do:** assert a `version_shipped` for any row. A release of
this extension does not carry a backend deploy or a support system, so the `Shipped` column stays
`—` for all four even where the work is `done` — the two-branch done-gate
([AGENTS.md](../../../AGENTS.md) rule 4) is exactly this case, one story lower than usual.

**Every row here is now settled** — three `done`, one closed not-planned. The two that were open,
the ChainList page (#2131) and the tracking dashboard (#2529), moved to
[US-1.9](US-1.9-out-of-repo-tooling-not-yet-started.md) on 2026-07-22, so this story records only
work that finished.

**It nevertheless stays `in-progress`, and that is a known gap, not an oversight.** The two-branch
done-gate ([AGENTS.md](../../../AGENTS.md) rule 4) closes a story either with a
`version_shipped` + CHANGELOG entry, or — for a no-requirement story — with `commit` naming a real
SHA. **This story can satisfy neither**: no release of this extension carries a backend deploy, and
no SHA in this repository delivers work done in another one. Marking it `done` anyway would be the
fake-done this program exists to prevent; **how an out-of-repo coverage story closes is an open
question for the owner.**

## Incremental work, fixes & chores

| Shipped | Issue | Title | Status |
|---|---|---|---|
| — | [#2455](https://github.com/Koniverse/SubWallet-Extension/issues/2455) | Build middleware services — cross-chain balance, earning-pool statistics | ⏸️ deprecated |
| — | [#2534](https://github.com/Koniverse/SubWallet-Extension/issues/2534) | Build a user support system | ✅ done |
| — | [#4118](https://github.com/Koniverse/SubWallet-Extension/issues/4118) | Set up a GitHub Action to deploy the SubWallet **backend** | ✅ done |
| — | [#4189](https://github.com/Koniverse/SubWallet-Extension/issues/4189) | Deploy the Bittensor ecosystem features | ✅ done |

> **#2455 is the ancestor of the Services SDK.** It proposed exactly what
> [D66](../../CONTEXT.md#d66-aggregate-multi-chain-data-through-the-subwallet-services-sdk-backend-rather-than-computing-it-on-device)
> later decided — fetch balances and earning statistics from a backend instead of per-chain RPC —
> and was closed not-planned in its own right. The capability arrived through the Services SDK
> ([AD-24](../../ARCHITECTURE.md#architecture-decisions)), not through this issue.

## Acceptance criteria

- [x] **AC-1** — Every issue above is recorded with the tracker's own state, and **none** carries a `version_shipped` — no release of this extension delivers backend or tooling work.

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | `gh issue view <N>` for each row · `grep -c "^version_shipped: .\+" ` on this file → 0 |

## Cross-references

- [Epic EPIC-1](../epics/EPIC-1.md) · [US-1.5](US-1.5-build-ci-and-cross-browser-packaging-hardening.md) · [US-1.9](US-1.9-out-of-repo-tooling-not-yet-started.md) · [D66](../../CONTEXT.md#d66-aggregate-multi-chain-data-through-the-subwallet-services-sdk-backend-rather-than-computing-it-on-device) · [consolidation note](../../notes/2026-07-22-epic-1-consolidation.md)
