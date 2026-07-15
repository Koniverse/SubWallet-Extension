---
id: EPIC-25
title: "Maintenance — Security"
status: in-progress
prd_ref: []
created: 2026-07-15
updated: 2026-07-15
generated_by: koni-docs-gen-maintenance
---

## Goal

Incremental work, fixes and chores for the **Security** area ([EPIC-5](EPIC-5.md)) that materialize no FR of their own. One story per tracker issue, so the CHANGELOG and issue tracker are fully claimed
and the ERP can answer "who shipped what, under which issue" for this area. This epic is a
**ledger, not a plan** — it was generated from the tracker and CHANGELOG by a one-off local
generator (kept in the setup scratchpad, not the repo: it wipes and rebuilds every `generated_by`
file from six `/tmp` caches, so re-running it without those caches would destroy this provenance).

## Why separate from EPIC-5

The 21 product epics are the **FR map**: each story there is a requirement's contract. These
issues materialize no FR — they are fixes, chore bumps, and small increments. Keeping them here
leaves [EPIC-5](EPIC-5.md) readable as the requirement set, while
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

**13 stories** — 12 done (shipped), 0 in flight (ready / in-progress /
review, from the Projects board), 1 backlog (open, not yet started), 0 deprecated
(closed **not-planned / duplicate** — never shipped). Open-issue status mirrors the GitHub
Projects board (#2); closed-issue status comes from the tracker's close reason. Per-issue
detail is the [CHANGELOG coverage index](../../notes/changelog-coverage.md) and each frontmatter.

## Stories

Every story in this ledger, in issue order — click a US to open its tracker link, evidence and
verification. **Assignee** is who the tracker or the `[Issue-N]` PR/commit names (`—` where nobody
is recorded); **Shipped** is the `(Koni)` release, `—` when no CHANGELOG line proves one.

| US | Status | Title | Issue | Assignee | Shipped |
|---|---|---|---|---|---|
| [US-25.1](../stories/US-25.1-external-security-audit.md) | ✅ done | External Security Audit | [#31](https://github.com/Koniverse/SubWallet-Extension/issues/31) | hieudd | — |
| [US-25.2](../stories/US-25.2-leverage-phishing-website-addresses-database-to-protect.md) | ✅ done | Leverage phishing website & addresses database to protect users | [#157](https://github.com/Koniverse/SubWallet-Extension/issues/157) | saltict | 0.3.4 |
| [US-25.3](../stories/US-25.3-update-polkadot-phishing.md) | ✅ done | Update @polkadot/phishing | [#561](https://github.com/Koniverse/SubWallet-Extension/issues/561) | saltict | 0.5.6 |
| [US-25.4](../stories/US-25.4-review-add-phishing-detection-using-chainpatrol-api.md) | ✅ done | Review & Add phishing detection using ChainPatrol api | [#1189](https://github.com/Koniverse/SubWallet-Extension/issues/1189) | saltict | — |
| [US-25.5](../stories/US-25.5-detect-phishing-page-with-chainpatrol.md) | ✅ done | Detect phishing page with ChainPatrol | [#1226](https://github.com/Koniverse/SubWallet-Extension/issues/1226) | S2kael | 1.0.5 |
| [US-25.6](../stories/US-25.6-auto-update-from-phishing-list.md) | ✅ done | Auto-update from phishing list | [#1274](https://github.com/Koniverse/SubWallet-Extension/issues/1274) | S2kael | — |
| [US-25.7](../stories/US-25.7-do-not-detect-phishing-page-with-chainpatrol-on-the-fir.md) | ✅ done | Do not detect Phishing Page with ChainPatrol on the Firefox browser | [#1422](https://github.com/Koniverse/SubWallet-Extension/issues/1422) | S2kael | — |
| [US-25.8](../stories/US-25.8-recheck-problems-in-security-tabs-of-github.md) | ✅ done | Recheck problems in security tabs of github | [#1553](https://github.com/Koniverse/SubWallet-Extension/issues/1553) | S2kael | — |
| [US-25.9](../stories/US-25.9-update-webpack-config-environment-for-page-js-and-conte.md) | ✅ done | Update webpack config environment for page.js and content.js to improve security | [#1823](https://github.com/Koniverse/SubWallet-Extension/issues/1823) | S2kael | 1.1.9 |
| [US-25.10](../stories/US-25.10-fixed-bug-phishing-detection.md) | ✅ done | Fixed bug phishing detection | [#2372](https://github.com/Koniverse/SubWallet-Extension/issues/2372) | saltict | 1.1.27 |
| [US-25.11](../stories/US-25.11-fixed-bug-reset-auto-lock-advanced-phishing-detection-c.md) | ✅ done | Fixed bug Reset Auto-lock, Advanced phishing detection, Camera in case upgrade version | [#3741](https://github.com/Koniverse/SubWallet-Extension/issues/3741) | S2kael | 1.3.28 |
| [US-25.12](../stories/US-25.12-add-another-security-layer.md) | 📋 backlog | Add another security layer | [#4125](https://github.com/Koniverse/SubWallet-Extension/issues/4125) | — | — |
| [US-25.13](../stories/US-25.13-turn-off-advanced-phishing-detection-feature.md) | ✅ done | Turn off 'Advanced phishing detection' feature | [#4891](https://github.com/Koniverse/SubWallet-Extension/issues/4891) | frenkie-ng | 1.3.69 |

## Acceptance criteria

- [ ] **AC-1** — Every Security issue with no FR story has exactly one story here; its status matches the tracker (done = COMPLETED, backlog = open, deprecated = not-planned/duplicate).
- [x] **AC-2** — `npx koni-docs validate` and `node scripts/koni-docs-check-ids.mjs` exit 0.
