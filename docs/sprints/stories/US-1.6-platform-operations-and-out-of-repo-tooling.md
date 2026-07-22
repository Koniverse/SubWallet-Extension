---
id: US-1.6
title: "Platform operations & out-of-repo tooling"
epic: EPIC-1
status: done
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

## Status

> **✅ done — and no release carries it.** Every row below is closed on the tracker (2 COMPLETED,
> 1 NOT_PLANNED) and AC-1, a coverage assertion, holds. `version_shipped` and `commit` are empty
> **on purpose**: the work happened in other repositories, so no release of this extension delivers
> it and no SHA here implements it. That is the done-gate's **third branch**
> ([AGENTS.md](../../../AGENTS.md) rule 4). **`done` claims a complete record, not a shipped
> capability.** The two items nobody started left for
> [US-1.9](US-1.9-out-of-repo-tooling-not-yet-started.md), and a fourth row left because it did
> **not** belong here at all — see below.

## Scope

This is a **consolidated maintenance story**: it groups 3 tracker issues into one boundary,
replacing the former one-issue-per-story ledger. It materializes **no FR**, and it never will —
an FR describes what the *wallet* does, and none of these is in the wallet. Full traceability is
the table below and the [consolidation note](../../notes/2026-07-22.md#b-epic-22-maintenance--build--platform-merged-into-epic-1).

**Why these are grouped rather than distributed.** Each is real work the team tracked here, and
each fails the test that would place it in any other story: there is no code in `packages/` to
point at. Filing them against a capability would make that capability's history read as if the
wallet had gained something it did not. Filing them under *Uncategorized* would be wrong in the
other direction — they are not unclassifiable, they are **classified as out-of-repo**.

**What this story deliberately does not do:** assert a `version_shipped` for any row. A release of
this extension does not carry a backend deploy or a support system, so the `Shipped` column stays
`—` for all three even where the work is `done` — the done-gate's third branch
([AGENTS.md](../../../AGENTS.md) rule 4) is exactly this case.

> **One row was here by mistake and is gone.** [#4189](https://github.com/Koniverse/SubWallet-Extension/issues/4189)
> *"Deploying Bittensor ecosystem features"* is **not** out-of-repo work: it is a cross-epic
> umbrella over **six sub-issues that all shipped**, in releases 1.3.28 through 1.3.48. A title
> heuristic read *"Deploying …"* as a deploy chore. It moved to
> [US-32.373](US-32.373-deploying-bittensor-ecosystem-features.md) on 2026-07-22, and the six
> child stories that named this story as their parent were repointed with it. **The test that
> catches this class:** an out-of-repo issue has **no sub-issues in this tracker and no CHANGELOG
> line** — `gh api repos/Koniverse/SubWallet-Extension/issues/<N>/sub_issues` returns empty for the
> three that remain, and returned six for #4189.

**Every row here is now settled** — two `done`, one closed not-planned. The two that were open,
the ChainList page (#2131) and the tracking dashboard (#2529), moved to
[US-1.9](US-1.9-out-of-repo-tooling-not-yet-started.md) on 2026-07-22, so this story records only
work that finished.

**So the story is `done`.** Its deliverable is the record, and the record is complete: all four
issues are closed on the tracker — three COMPLETED, one NOT_PLANNED — and AC-1, a coverage
assertion, holds. `version_shipped` and `commit` stay **empty on purpose**: no release of this
extension carries a backend deploy, and no SHA in this repository delivers work done in another
one. Demanding either would leave this story permanently un-closable, which is why the owner
extended the done-gate with a third branch on 2026-07-22
([AGENTS.md](../../../AGENTS.md) rule 4) — the case
[D97](../../CONTEXT.md#d97-what-a-docs-epic-may-change--and-when-a-story-that-ships-in-no-release-is-done)
did not foresee when it wrote the first two.

**`done` here claims a complete record, not a shipped capability.** No user of this extension
gained anything from these four issues; the `Shipped` column says `—` on every row, and the two
that were never started left for [US-1.9](US-1.9-out-of-repo-tooling-not-yet-started.md). The
preview tool will warn that a `done` story has no `version_shipped` — that warning is a known
viewer defect, documented in [AGENTS.md](../../../AGENTS.md), and must not be "fixed" by
inventing a release.

## Incremental work, fixes & chores

| Shipped | Issue | Title | Status |
|---|---|---|---|
| — | [#2455](https://github.com/Koniverse/SubWallet-Extension/issues/2455) | Build middleware services — cross-chain balance, earning-pool statistics | ⏸️ deprecated |
| — | [#2534](https://github.com/Koniverse/SubWallet-Extension/issues/2534) | Build a user support system | ✅ done |
| — | [#4118](https://github.com/Koniverse/SubWallet-Extension/issues/4118) | Set up a GitHub Action to deploy the SubWallet **backend** | ✅ done |

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
| AC-1 | `gh issue view 2455` `2534` `4118` → all CLOSED (2 COMPLETED, 1 NOT_PLANNED) · each `.../sub_issues` empty · `grep -c "^version_shipped: .\+"` on this file → 0 |

## Cross-references

- [Epic EPIC-1](../epics/EPIC-1.md) · [US-1.5](US-1.5-build-ci-and-cross-browser-packaging-hardening.md) · [US-1.9](US-1.9-out-of-repo-tooling-not-yet-started.md) · [D66](../../CONTEXT.md#d66-aggregate-multi-chain-data-through-the-subwallet-services-sdk-backend-rather-than-computing-it-on-device) · [consolidation note](../../notes/2026-07-22.md#b-epic-22-maintenance--build--platform-merged-into-epic-1)
