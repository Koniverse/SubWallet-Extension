---
id: EPIC-38
title: "Maintenance — Multisig"
status: in-progress
prd_ref: []
created: 2026-07-15
updated: 2026-07-15
generated_by: koni-docs-gen-maintenance
---

## Goal

The **Multisig** area's tracker issues ([EPIC-18](EPIC-18.md)) — the Phase-1 build tickets that *collectively* implemented the shipped FRs (FR-149, FR-150), plus the fixes and chores around them. None carries an FR **of its own** (the contracts are EPIC-18's), so each becomes one owning story per tracker issue and the CHANGELOG and issue tracker are fully claimed
and the ERP can answer "who shipped what, under which issue" for this area. This epic is a
**ledger, not a plan** — it was generated from the tracker and CHANGELOG by a one-off local
generator (kept in the setup scratchpad, not the repo: it wipes and rebuilds every `generated_by`
file from six `/tmp` caches, so re-running it without those caches would destroy this provenance).

## Why separate from EPIC-18

The 21 product epics are the **FR map**: each story there is a requirement's contract — [EPIC-18](EPIC-18.md)
holds exactly three (FR-149, FR-150, FR-151). This epic holds the **tracker issues** of the same
area: the Phase-1 build tickets (#4841 account management, #4869 create-account screen, …) that
*collectively* materialized FR-149 and FR-150, plus fixes and chores. They **implement** the FRs
but carry no FR **of their own** — so keeping them here leaves [EPIC-18](EPIC-18.md) readable as a
three-contract requirement set instead of a 20-ticket backlog, while every shipped issue still gets
exactly one owning story ([CONTEXT D107](../../CONTEXT.md) on keeping the unit of status honest).
**The overlap with EPIC-18 is intentional — the FR is the contract, these are its issues, not a
second copy of the scope — and their `points` are never summed with EPIC-18's** (see below).

## What a story here is — and is not

- **It records the tracker, not the code.** Its acceptance criterion is a *coverage* assertion
  ("issue #N shipped in vX" / "closed on the tracker"), never an invented Given/When/Then — that
  is the [US-5.1](../stories/US-5.1-phishing-site-and-address-protection.md) failure this program
  exists to prevent ([LESSONS §68](../../LESSONS.md)).
- **`points: 1` is a count, not a Fibonacci estimate.** One story = one shipped issue. **Never
  sum these with the product stories' points** — a rollup here measures issue throughput.
- **`sprint` is a real month** (a single issue closed in one month), not a rollup ([D105](../../CONTEXT.md)).

## Scope

**20 stories** — 13 done (shipped), 2 in flight (ready / in-progress /
review, from the Projects board), 5 backlog (open, not yet started), 0 deprecated
(closed **not-planned / duplicate** — never shipped). Open-issue status mirrors the GitHub
Projects board (#2); closed-issue status comes from the tracker's close reason. Per-issue
detail is the [CHANGELOG coverage index](../../notes/changelog-coverage.md) and each frontmatter.

## Stories

Every story in this ledger, in issue order — click a US to open its tracker link, evidence and
verification. **Assignee** is who the tracker or the `[Issue-N]` PR/commit names (`—` where nobody
is recorded); **Shipped** is the `(Koni)` release, `—` when no CHANGELOG line proves one.

| US | Status | Title | Issue | Assignee | Shipped |
|---|---|---|---|---|---|
| [US-38.1](../stories/US-38.1-support-multisig-features.md) | ✅ done | Support multisig features | [#1426](https://github.com/Koniverse/SubWallet-Extension/issues/1426) | nulllpc | — |
| [US-38.2](../stories/US-38.2-multisig-support-multisig-account.md) | 🚧 in-progress | [Multisig] Support Multisig account | [#1677](https://github.com/Koniverse/SubWallet-Extension/issues/1677) | bluezdot | — |
| [US-38.3](../stories/US-38.3-multisig-extension-support.md) | 📋 backlog | [Multisig] Extension support | [#4696](https://github.com/Koniverse/SubWallet-Extension/issues/4696) | bluezdot | — |
| [US-38.4](../stories/US-38.4-multisig-mobile-support.md) | 📋 backlog | [Multisig] Mobile support | [#4697](https://github.com/Koniverse/SubWallet-Extension/issues/4697) | — | — |
| [US-38.5](../stories/US-38.5-multisig-webapp-support.md) | 📋 backlog | [Multisig] WebApp support | [#4698](https://github.com/Koniverse/SubWallet-Extension/issues/4698) | — | — |
| [US-38.6](../stories/US-38.6-multisig-reseach-multisig-technical-research.md) | ✅ done | [Multisig][Reseach] Multisig Technical Research | [#4744](https://github.com/Koniverse/SubWallet-Extension/issues/4744) | bluezdot | — |
| [US-38.7](../stories/US-38.7-multisig-extension-phase-1-core-multisig-management.md) | 🚧 in-progress | [Multisig] [Extension] Phase 1: Core Multisig Management | [#4838](https://github.com/Koniverse/SubWallet-Extension/issues/4838) | bluezdot | — |
| [US-38.8](../stories/US-38.8-multisig-extension-phase-1-multisig-account-management.md) | ✅ done | [Multisig] [Extension] [Phase 1] Multisig Account Management | [#4841](https://github.com/Koniverse/SubWallet-Extension/issues/4841) | bluezdot | 1.3.74 |
| [US-38.9](../stories/US-38.9-multisig-extension-phase-1-pending-transaction-detectio.md) | ✅ done | [Multisig] [Extension] [Phase 1] Pending Transaction Detection | [#4842](https://github.com/Koniverse/SubWallet-Extension/issues/4842) | bluezdot | 1.3.74 |
| [US-38.10](../stories/US-38.10-multisig-extension-phase-1-implement-multisig-actions.md) | ✅ done | [Multisig] [Extension] [Phase 1] Implement Multisig Actions | [#4843](https://github.com/Koniverse/SubWallet-Extension/issues/4843) | bluezdot | 1.3.74 |
| [US-38.11](../stories/US-38.11-multisig-extension-phase-2-multisig-account-detection.md) | 📋 backlog | [Multisig] [Extension] [Phase 2] Multisig Account Detection | [#4844](https://github.com/Koniverse/SubWallet-Extension/issues/4844) | bluezdot | — |
| [US-38.12](../stories/US-38.12-multisig-extension-phase-1-background.md) | ✅ done | [Multisig] [Extension] [Phase 1] Background | [#4856](https://github.com/Koniverse/SubWallet-Extension/issues/4856) | bluezdot | 1.3.74 |
| [US-38.13](../stories/US-38.13-multisig-extension-phase-1-create-multisig-account.md) | ✅ done | [Multisig] [Extension] [Phase 1] Create Multisig account | [#4869](https://github.com/Koniverse/SubWallet-Extension/issues/4869) | frenkie-ng | 1.3.74 |
| [US-38.14](../stories/US-38.14-multisig-extension-phase-1-experiments-and-init-core-se.md) | ✅ done | [Multisig] [Extension] [Phase 1] Experiments and Init Core Service | [#4870](https://github.com/Koniverse/SubWallet-Extension/issues/4870) | bluezdot | 1.3.74 |
| [US-38.15](../stories/US-38.15-multisig-extension-phase-1-implement-history-screen.md) | ✅ done | [Multisig] [Extension] [Phase 1] Implement History screen | [#4871](https://github.com/Koniverse/SubWallet-Extension/issues/4871) | frenkie-ng | 1.3.74 |
| [US-38.16](../stories/US-38.16-multisig-extension-phase-1-implement-notification-scree.md) | ✅ done | [Multisig] [Extension] [Phase 1] Implement Notification screen | [#4874](https://github.com/Koniverse/SubWallet-Extension/issues/4874) | frenkie-ng | 1.3.74 |
| [US-38.17](../stories/US-38.17-multisig-extension-phase-1-handle-mechanism-to-trigger.md) | ✅ done | [Multisig] [Extension] [Phase 1] Handle mechanism to trigger multisig notifications | [#4913](https://github.com/Koniverse/SubWallet-Extension/issues/4913) | bluezdot | 1.3.74 |
| [US-38.18](../stories/US-38.18-multisig-extension-phase-1-classify-and-handle-data-for.md) | ✅ done | [Multisig] [Extension] [Phase 1] Classify and handle data for all multisig types | [#4921](https://github.com/Koniverse/SubWallet-Extension/issues/4921) | bluezdot | — |
| [US-38.19](../stories/US-38.19-multisig-extension-phase-2-improve-display-multisig-det.md) | 📋 backlog | [Multisig] [Extension] [Phase 2] Improve display Multisig detail by type | [#4927](https://github.com/Koniverse/SubWallet-Extension/issues/4927) | bluezdot | — |
| [US-38.20](../stories/US-38.20-multisig-extension-phase-1-handle-init-multisig-transac.md) | ✅ done | [Multisig] [Extension] [Phase 1] Handle Init Multisig Transaction | [#4938](https://github.com/Koniverse/SubWallet-Extension/issues/4938) | bluezdot | 1.3.74 |

## Acceptance criteria

- [ ] **AC-1** — Every Multisig issue with no FR story has exactly one story here; its status matches the tracker (done = COMPLETED, backlog = open, deprecated = not-planned/duplicate).
- [x] **AC-2** — `npx koni-docs validate` and `node scripts/koni-docs-check-ids.mjs` exit 0.
