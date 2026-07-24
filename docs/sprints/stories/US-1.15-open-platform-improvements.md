---
id: US-1.15
title: "Open platform improvements"
epic: EPIC-1
status: in-progress
priority: P3
points: 4
sprint:
version_shipped:
prd_ref: []
arch_ref:
depends_on:
assignee:
commit:
created: 2026-07-24
updated: 2026-07-24
---

## Goal

The platform work asked for and not delivered — dependency, backend, refactor, mobile and build improvements still open on the tracker.

## Status

> **🚧 in-progress — nothing here has shipped.** All 32 rows below are **open on the tracker**, recovered from the former **Uncategorized** maintenance ledger on 2026-07-24. `commit`, `sprint` and `version_shipped` stay empty until work lands.

## Scope

Folded in from the former **Uncategorized** (triage) maintenance ledger on 2026-07-24, whose issues the
generator could not classify by title. This story is where the open platform issues landed once read.
It materializes **no FR**.

## Incremental work, fixes & chores

**32 tracker issues**, all open.

| Shipped | Issue | Title | Status |
|---|---|---|---|
| — | [#623](https://github.com/Koniverse/SubWallet-Extension/issues/623) | Improve Single Mode | 📋 backlog |
| — | [#1552](https://github.com/Koniverse/SubWallet-Extension/issues/1552) | Bump lib version and update changes from @polkadot/dev | 📋 backlog |
| — | [#1572](https://github.com/Koniverse/SubWallet-Extension/issues/1572) | Update web3.js version from 1.x to ethersJS | 📋 backlog |
| — | [#1594](https://github.com/Koniverse/SubWallet-Extension/issues/1594) | Consider implement lightweight api | 📋 backlog |
| — | [#1689](https://github.com/Koniverse/SubWallet-Extension/issues/1689) | WebApp - Still show modal when user perform Back browser | 📋 backlog |
| — | [#1813](https://github.com/Koniverse/SubWallet-Extension/issues/1813) | WebApp - Handling data synchronization cases | 📋 backlog |
| — | [#1987](https://github.com/Koniverse/SubWallet-Extension/issues/1987) | Supports biometric login for Macbook device | 📋 backlog |
| — | [#2166](https://github.com/Koniverse/SubWallet-Extension/issues/2166) | WebApp - Update background using web-worker | 📋 backlog |
| — | [#2378](https://github.com/Koniverse/SubWallet-Extension/issues/2378) | Review subscription in case there are multiple functions to subscribe to | 📋 backlog |
| — | [#2970](https://github.com/Koniverse/SubWallet-Extension/issues/2970) | Extension - Detect domain is incorrect | 📋 backlog |
| — | [#3012](https://github.com/Koniverse/SubWallet-Extension/issues/3012) | Check for issues related to middleware services | 🟡 ready |
| — | [#3276](https://github.com/Koniverse/SubWallet-Extension/issues/3276) | Add support for Polkadot API | 🚧 in-progress |
| — | [#3419](https://github.com/Koniverse/SubWallet-Extension/issues/3419) | Review DataContext usage | 📋 backlog |
| — | [#3539](https://github.com/Koniverse/SubWallet-Extension/issues/3539) | Update Package Bundling (Webpack, Vite...) | 📋 backlog |
| — | [#3660](https://github.com/Koniverse/SubWallet-Extension/issues/3660) | Improve SubWallet bundling | 📋 backlog |
| — | [#3661](https://github.com/Koniverse/SubWallet-Extension/issues/3661) | Update validation service | 📋 backlog |
| — | [#3663](https://github.com/Koniverse/SubWallet-Extension/issues/3663) | Review data flow | 📋 backlog |
| — | [#3664](https://github.com/Koniverse/SubWallet-Extension/issues/3664) | Update libs | 📋 backlog |
| — | [#3853](https://github.com/Koniverse/SubWallet-Extension/issues/3853) | indexer.availspace.app cert not valid | 📋 backlog |
| — | [#3880](https://github.com/Koniverse/SubWallet-Extension/issues/3880) | Extension - Re-check migration-service on extension | 📋 backlog |
| — | [#3891](https://github.com/Koniverse/SubWallet-Extension/issues/3891) | Extension - Cannot read properties of undefined (reading 'slug') | 📋 backlog |
| — | [#4089](https://github.com/Koniverse/SubWallet-Extension/issues/4089) | Test Avail Light client | 🚧 in-progress |
| — | [#4103](https://github.com/Koniverse/SubWallet-Extension/issues/4103) | WebApp - Improve some feature | 📋 backlog |
| — | [#4143](https://github.com/Koniverse/SubWallet-Extension/issues/4143) | Support DeDot | 🟡 ready |
| — | [#4298](https://github.com/Koniverse/SubWallet-Extension/issues/4298) | Extension - Improve extension side panel | 📋 backlog |
| — | [#4755](https://github.com/Koniverse/SubWallet-Extension/issues/4755) | Recheck usage of currentEra in code base | 📋 backlog |
| — | [#4865](https://github.com/Koniverse/SubWallet-Extension/issues/4865) | [Phase 2] Improve the routing architect to select optimal quote and path | 📋 backlog |
| — | [#4866](https://github.com/Koniverse/SubWallet-Extension/issues/4866) | Extension - [Feature] Create staticContent, staticData in SDK | 👀 review |
| — | [#4923](https://github.com/Koniverse/SubWallet-Extension/issues/4923) | Replace Console Statements with Proper Logging Service | 📋 backlog |
| — | [#4924](https://github.com/Koniverse/SubWallet-Extension/issues/4924) | Refactor code related to get block explorer url | 📋 backlog |
| — | [#4930](https://github.com/Koniverse/SubWallet-Extension/issues/4930) | Replace console usage with centralized logger across all packages (excluding extension-base) | 📋 backlog |
| — | [#5004](https://github.com/Koniverse/SubWallet-Extension/issues/5004) | WebApp - Update the latest code 1.3.83 | 👀 review |

> **The open half of the platform maintenance.** Backend, dependency, refactor and mobile improvements that are still on the board; when one ships it moves to the settled platform story that owns its cluster (US-1.11 … US-1.14).

## Acceptance criteria

- [ ] **AC-1** — Every row above is open on the tracker; none claims a `version_shipped`.
- [ ] **AC-2** — When a row ships, it moves to the capability story that owns its behaviour and leaves this list.

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | `gh issue view <N>` for each row |
| AC-2 | Manual: routing recorded in the [consolidation note](../../notes/2026-07-24.md#f-epic-41-maintenance--uncategorized-distributed-across-the-fr-epics) |

## Cross-references

- [Epic EPIC-1](../epics/EPIC-1.md) · [US-1.11](US-1.11-dependency-library-and-build-maintenance.md) … [US-1.14](US-1.14-uncategorized-platform-maintenance.md) · [consolidation note](../../notes/2026-07-24.md#f-epic-41-maintenance--uncategorized-distributed-across-the-fr-epics)
