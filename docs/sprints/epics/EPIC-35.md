---
id: EPIC-35
title: "Maintenance — Governance"
status: in-progress
prd_ref: []
created: 2026-07-15
updated: 2026-07-15
generated_by: koni-docs-gen-maintenance
---

## Goal

Incremental work, fixes and chores for the **Governance** area ([EPIC-15](EPIC-15.md)) that materialize no FR of their own. One story per tracker issue, so the CHANGELOG and issue tracker are fully claimed
and the ERP can answer "who shipped what, under which issue" for this area. This epic is a
**ledger, not a plan** — it was generated from the tracker and CHANGELOG by a one-off local
generator (kept in the setup scratchpad, not the repo: it wipes and rebuilds every `generated_by`
file from six `/tmp` caches, so re-running it without those caches would destroy this provenance).

## Why separate from EPIC-15

The 21 product epics are the **FR map**: each story there is a requirement's contract. These
issues materialize no FR — they are fixes, chore bumps, and small increments. Keeping them here
leaves [EPIC-15](EPIC-15.md) readable as the requirement set, while
still giving every shipped issue exactly one owning story ([CONTEXT D107](../../CONTEXT.md) on
keeping the unit of status honest).

## What a story here is — and is not

- **It records the tracker, not the code.** Its acceptance criterion is a *coverage* assertion
  ("issue #N shipped in vX" / "closed on the tracker"), never an invented Given/When/Then — that
  is the [US-5.1](../stories/US-5.1-phishing-site-and-address-protection.md) failure this program
  exists to prevent ([LESSONS §68](../../LESSONS.md)).
- **`points: 1` is a count, not a Fibonacci estimate.** One story = one shipped issue. **Never
  sum these with the product stories' points** — a rollup here measures issue throughput.
- **`sprint` is a real month** (a single issue closed in one month), not a rollup ([D105](../../CONTEXT.md)).

## Scope

**25 stories** — 22 done (shipped), 1 in flight (ready / in-progress /
review, from the Projects board), 1 backlog (open, not yet started), 1 deprecated
(closed **not-planned / duplicate** — never shipped). Open-issue status mirrors the GitHub
Projects board (#2); closed-issue status comes from the tracker's close reason. Per-issue
detail is the [CHANGELOG coverage index](../../notes/changelog-coverage.md) and each frontmatter.

## Stories

Every story in this ledger, in issue order — click a US to open its tracker link, evidence and
verification. **Assignee** is who the tracker or the `[Issue-N]` PR/commit names (`—` where nobody
is recorded); **Shipped** is the `(Koni)` release, `—` when no CHANGELOG line proves one.

| US | Status | Title | Issue | Assignee | Shipped |
|---|---|---|---|---|---|
| [US-35.1](../stories/US-35.1-add-icon-info-for-delegationitem.md) | ✅ done | Add icon info for DelegationItem | [#720](https://github.com/Koniverse/SubWallet-Extension/issues/720) | S2kael | 0.6.7 |
| [US-35.2](../stories/US-35.2-add-incrementdelegatorrewards-call-to-amplitude-reward.md) | ✅ done | Add incrementDelegatorRewards call to Amplitude reward claiming | [#914](https://github.com/Koniverse/SubWallet-Extension/issues/914) | nulllpc | 0.7.5 |
| [US-35.3](../stories/US-35.3-support-opengov-and-vote-delegation-on-polkadot.md) | ✅ done | Support OpenGov and Vote Delegation on Polkadot | [#2216](https://github.com/Koniverse/SubWallet-Extension/issues/2216) | nulllpc | 1.1.36 |
| [US-35.4](../stories/US-35.4-webapp-mobile-integrate-opengov.md) | ⏸️ deprecated | WebApp \| Mobile - Integrate OpenGov | [#2221](https://github.com/Koniverse/SubWallet-Extension/issues/2221) | saltict | — |
| [US-35.5](../stories/US-35.5-opengov-experiment-implement-logic-api-integration.md) | ✅ done | [OpenGov] Experiment: Implement logic & API integration | [#2222](https://github.com/Koniverse/SubWallet-Extension/issues/2222) | tunghp2002 | — |
| [US-35.6](../stories/US-35.6-research-opengov.md) | ✅ done | Research OpenGov | [#2271](https://github.com/Koniverse/SubWallet-Extension/issues/2271) | bluezdot | — |
| [US-35.7](../stories/US-35.7-opengov-support-polkadot-governance.md) | 🚧 in-progress | [OpenGov] Support Polkadot Governance | [#4257](https://github.com/Koniverse/SubWallet-Extension/issues/4257) | frenkie-ng | — |
| [US-35.8](../stories/US-35.8-opengov-extension-ui-ux-review-evaluate-governance-feat.md) | ✅ done | [OpenGov][Extension] UI/UX Review Evaluate governance feature | [#4492](https://github.com/Koniverse/SubWallet-Extension/issues/4492) | lw-cdm | — |
| [US-35.9](../stories/US-35.9-opengov-extension-phase-1-build-logic-services-and-conn.md) | ✅ done | [OpenGov][Extension] Phase 1 - Build logic services and connect initial UI flow | [#4529](https://github.com/Koniverse/SubWallet-Extension/issues/4529) | lw-cdm | 1.3.70 |
| [US-35.10](../stories/US-35.10-opengov-extension-phase-1-finalize-ui-and-polish-produc.md) | ✅ done | [OpenGov][Extension] Phase 1 - Finalize UI and polish product for Referenda & Votes | [#4530](https://github.com/Koniverse/SubWallet-Extension/issues/4530) | lw-cdm | 1.3.70 |
| [US-35.11](../stories/US-35.11-opengov-doc-opengov-technical-design.md) | ✅ done | [OpenGov][Doc] OpenGov Technical Design | [#4553](https://github.com/Koniverse/SubWallet-Extension/issues/4553) | tunghp2002 | — |
| [US-35.12](../stories/US-35.12-support-opengov-phase-1.md) | ✅ done | Support OpenGov (Phase 1) | [#4678](https://github.com/Koniverse/SubWallet-Extension/issues/4678) | tunghp2002 | 1.3.70 |
| [US-35.13](../stories/US-35.13-opengov-extension-phase-1-prepare-data-and-logic-for-sc.md) | ✅ done | [OpenGov][Extension] Phase 1 - Prepare data and logic for screens | [#4680](https://github.com/Koniverse/SubWallet-Extension/issues/4680) | tunghp2002 | — |
| [US-35.14](../stories/US-35.14-opengov-extension-phase-1-referenda-list.md) | ✅ done | [OpenGov][Extension] Phase 1 - Referenda List | [#4681](https://github.com/Koniverse/SubWallet-Extension/issues/4681) | lw-cdm | — |
| [US-35.15](../stories/US-35.15-opengov-extension-phase-1-referendum-detail.md) | ✅ done | [OpenGov][Extension] Phase 1 - Referendum Detail | [#4682](https://github.com/Koniverse/SubWallet-Extension/issues/4682) | lw-cdm | — |
| [US-35.16](../stories/US-35.16-opengov-extension-phase-1-vote-revote-form.md) | ✅ done | [OpenGov][Extension] Phase 1 - Vote/Revote Form | [#4683](https://github.com/Koniverse/SubWallet-Extension/issues/4683) | lw-cdm | — |
| [US-35.17](../stories/US-35.17-opengov-extension-phase-1-vote-revote-confirmation.md) | ✅ done | [OpenGov][Extension] Phase 1 - Vote/Revote Confirmation | [#4684](https://github.com/Koniverse/SubWallet-Extension/issues/4684) | lw-cdm | — |
| [US-35.18](../stories/US-35.18-opengov-extension-phase-1-unvote-form-confirmation.md) | ✅ done | [OpenGov][Extension] Phase 1 - Unvote form & confirmation | [#4685](https://github.com/Koniverse/SubWallet-Extension/issues/4685) | frenkie-ng | 1.3.70 |
| [US-35.19](../stories/US-35.19-opengov-extension-phase-1-locked-token-detail-screen.md) | ✅ done | [OpenGov][Extension] Phase 1 - Locked Token Detail screen | [#4686](https://github.com/Koniverse/SubWallet-Extension/issues/4686) | Thiendekaco | — |
| [US-35.20](../stories/US-35.20-opengov-extension-phase-1-unlock-token-form-confirmatio.md) | ✅ done | [OpenGov][Extension] Phase 1 - Unlock token form & confirmation | [#4687](https://github.com/Koniverse/SubWallet-Extension/issues/4687) | Thiendekaco | — |
| [US-35.21](../stories/US-35.21-opengov-extension-phase-1-integrate-opengov-transaction.md) | ✅ done | [OpenGov][Extension] Phase 1 - Integrate OpenGov transactions into History | [#4689](https://github.com/Koniverse/SubWallet-Extension/issues/4689) | tunghp2002 | — |
| [US-35.22](../stories/US-35.22-opengov-extension-research-and-integrate-supported-netw.md) | ✅ done | [OpenGov][Extension] Research and Integrate Supported Networks | [#4722](https://github.com/Koniverse/SubWallet-Extension/issues/4722) | tunghp2002 | — |
| [US-35.23](../stories/US-35.23-opengov-extension-display-referendums-from-chains-using.md) | ✅ done | [OpenGov][Extension] Display referendums from chains using the old governance system (Governance V1) | [#4729](https://github.com/Koniverse/SubWallet-Extension/issues/4729) | Thiendekaco | 1.3.70 |
| [US-35.24](../stories/US-35.24-opengov-extension-other-issues-for-opengov-integration.md) | ✅ done | [OpenGov][Extension] Other issues for OpenGov Integration | [#4809](https://github.com/Koniverse/SubWallet-Extension/issues/4809) | Thiendekaco | — |
| [US-35.25](../stories/US-35.25-extention-add-block-action-handling-for-new-features-go.md) | 📋 backlog | Extention - Add Block Action handling for new features (Governance, Proxy Account) | [#4933](https://github.com/Koniverse/SubWallet-Extension/issues/4933) | bluezdot | — |

## Acceptance criteria

- [ ] **AC-1** — Every Governance issue with no FR story has exactly one story here; its status matches the tracker (done = COMPLETED, backlog = open, deprecated = not-planned/duplicate).
- [x] **AC-2** — `npx koni-docs validate` and `node scripts/koni-docs-check-ids.mjs` exit 0.
