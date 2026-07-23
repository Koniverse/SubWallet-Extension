---
id: US-1.1
title: "MV3 service-worker background for Chrome/Firefox compliance"
epic: EPIC-1
status: done
priority: P0
points: 8
sprint: sprint-2024-M06
version_shipped: 1.2.7
prd_ref: [FR-1]
arch_ref: [AD-08, AD-20]
depends_on:
assignee: saltict
commit: f268562cdac6c1b65afed42924452cbfa3ceb360, ec35731e50ce11b9ecedd1d75ee6a399b9cfcb91, 49a361953cde851226b1f86cf54db6b559eb7917
created: 2026-06-12
updated: 2026-07-22
---

## Goal

Run the SubWallet background as a Manifest V3 event-driven service worker that
Chrome and Firefox both accept, surviving the worker's shutdown/wake cycle
without losing wallet state. This is the foundation everything else stands on:
once it holds, every downstream epic gets to stop worrying about whether the
background is alive, how it wakes, or whether its state survives an eviction.

## Status

> **✅ done — shipped in 1.2.7.** All 5 acceptance criteria are ticked, and the 2 rows below are settled (1 shipped, 1 closed not-planned).
> **The table is history, not a work list** — a `done` story may not carry an open row ([AGENTS.md](../../../AGENTS.md) rule 9).

## Background

Chrome's MV3 enforcement timeline removed the persistent background page the
extension was originally built on (the polkadot-js MV2 model, AD-10), leaving no
viable alternative but to rebuild the background layer around an event-driven
service worker ([AD-08](../../ARCHITECTURE.md#architecture-decisions)). Two
problems had to be solved at once: WASM (the `@polkadot` crypto and Cardano
serialization modules) had to load under MV3's stricter CSP — resolved via
`wasm-unsafe-eval` from Chrome 102+ — and the service worker is *evicted when
idle* (~5 min), so all background state must be rehydratable on wake.

The wake/sleep behaviour is formalized as a four-state lifecycle
([AD-20](../../ARCHITECTURE.md#architecture-decisions)): an `ActionHandler` +
`connectionMap` drive the worker through Init → Start-Partially → Start-Fully →
Sleep. A `pub(…)` message wakes it partially, a `pri(…)`/`mobile(…)` message
wakes it fully, the last port disconnect sleeps it after `SLEEP_TIMEOUT`, and a
`HeartBeat` keeps it alive while ports are open. A `ServiceStatus` machine makes
those transitions idempotent so a request that needs only a few chains does not
start all 200+. State persists to `chrome.storage.local` and dexie (NFR-8) so a
fresh wake rehydrates settings, account metadata and network state.

Materializes [FR-1](../../PRD.md#functional-requirements). This story is **retroactive** — the MV3
background already ships in the product; `commit` / `version_shipped` are
backfilled during version reconciliation. The packaging that makes the MV3
output loadable in Firefox (chunk splitting) is owned by the sibling
[US-1.2](US-1.2-yarn-3-monorepo-shared-across-extension-web-mobile.md).

## Acceptance criteria

- [x] **AC-1** — **Given** a Chrome 102+ install, **When** the extension is
  loaded, **Then** the background runs as an MV3 service worker (not a persistent
  page) and WASM crypto initializes under the `wasm-unsafe-eval` CSP without a
  CSP violation (AD-08).
- [x] **AC-2** — **Given** a running background with persisted settings, account
  metadata and network state, **When** the service worker is evicted and later
  woken, **Then** that state is fully rehydrated from `chrome.storage.local` /
  dexie and no wallet data is lost (NFR-8).
- [x] **AC-3** — **Given** the four-state lifecycle (AD-20), **When** a `pub(…)`
  message arrives, **Then** the worker wakes *partially*; **And** when a
  `pri(…)`/`mobile(…)` message arrives it wakes *fully*; **And** after the last
  port disconnects it returns to Sleep after `SLEEP_TIMEOUT`.
- [x] **AC-4** — **Given** repeated or concurrent wake triggers, **When** they
  arrive during a transition, **Then** the `ServiceStatus` machine keeps the
  transition idempotent and does NOT start all chains for a request that needs
  only a few (no duplicate Start-Fully).
- [x] **AC-5** — **Given** the produced MV3 build, **When** it is submitted to
  Firefox, **Then** the manifest is accepted (MV3 descriptor + CSP valid for
  Firefox) — the cross-browser compliance unhappy path.

## Tasks

- [x] **TASK-1.1.1** — Rebuild the background entry as an MV3 service worker (AC: 1)
  - [x] Author `packages/extension-koni/src/background.ts` as the service-worker entry compiled from `manifest.json` (MV3 descriptor).
  - [x] Add `wasm-unsafe-eval` to the manifest CSP so `@polkadot` / Cardano WASM loads (Chrome 102+).
- [x] **TASK-1.1.2** — Implement the four-state lifecycle (AC: 3, 4)
  - [x] Wire `ActionHandler` + `connectionMap` for Init → Start-Partially → Start-Fully → Sleep in `extension-koni`.
  - [x] Map `pub(…)` → partial wake, `pri(…)`/`mobile(…)` → full wake, last-disconnect → Sleep after `SLEEP_TIMEOUT`.
  - [x] Add the `HeartBeat` keep-alive while ports are open.
- [x] **TASK-1.1.3** — Make transitions idempotent via `ServiceStatus` (AC: 4)
  - [x] Use the `generalStatus` machine in `State.ts` so concurrent wakes do not double-start chains.
- [x] **TASK-1.1.4** — State persistence + rehydration on wake (AC: 2)
  - [x] Persist settings/account-metadata/network state to `chrome.storage.local` + dexie; rehydrate on cold wake.
- [x] **TASK-1.1.5** — Cross-browser manifest validation (AC: 5)
  - [x] Validate the MV3 manifest + CSP load in both Chrome and Firefox.

## Dev notes

### Architecture constraints

- [AD-08](../../ARCHITECTURE.md#architecture-decisions) — MV3 service worker replaces the MV2 persistent page; WASM via `wasm-unsafe-eval` CSP. This story does NOT keep any MV2 fallback.
- [AD-20](../../ARCHITECTURE.md#architecture-decisions) — the four-state lifecycle + `HeartBeat` is the *required* shape; a story may not introduce an alternative wake model.
- Supersedes the polkadot-js MV2 model inherited via AD-10; this story is the MV3 realization referenced by AD-08.
- This story does NOT introduce new AD entries.

### Cross-story dependencies

- Required by every other epic — all background engines ([EPIC-2](../epics/EPIC-2.md)) run inside this worker and rely on the wake/sleep contract.
- Sibling [US-1.2](US-1.2-yarn-3-monorepo-shared-across-extension-web-mobile.md) — owns the Webpack chunk splitting (AD-06) that makes this MV3 output loadable in Firefox; coordinate the manifest + CSP.
- Hardened by [US-1.5](US-1.5-build-ci-and-cross-browser-packaging-hardening.md) — build, CI and cross-browser packaging edge cases are tracked there.

### References

- [Source: PRD FR-1](../../PRD.md#functional-requirements) — MV3 service-worker background
- [Source: PRD NFR-8](../../PRD.md#non-functional-requirements) — MV3 compatibility, WASM CSP, state-persistence on shutdown/wake
- [Source: ARCHITECTURE §Runtime lifecycle & service coordination](../../ARCHITECTURE.md)
- [Source: ARCHITECTURE AD-08, AD-20](../../ARCHITECTURE.md#architecture-decisions) — issues #349, #413, #412, #707, #782

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Load unpacked in Chrome 102+; DevTools → Application → Service Workers shows the background worker active; no CSP error on WASM init |
| AC-2 | Stop the service worker in DevTools, trigger a `pub(…)`; confirm settings/accounts/network state rehydrate from `chrome.storage.local` / dexie |
| AC-3 | Send `pub(…)` then `pri(…)`; observe `generalStatus` in `State.ts` transition Start-Partially → Start-Fully; disconnect all ports → Sleep after `SLEEP_TIMEOUT` |
| AC-4 | Fire concurrent wake triggers; assert no duplicate Start-Fully and not-all-chains-started in `extension-koni` `ActionHandler` |
| AC-5 | `yarn webpack:build:extension` → submit/load the build in Firefox; manifest accepted |

## Changelog entry

### Added
- MV3 service-worker background (`packages/extension-koni/src/background.ts`) with `wasm-unsafe-eval` CSP for WASM crypto under Chrome 102+.
- Four-state background lifecycle (Init → Start-Partially → Start-Fully → Sleep) via `ActionHandler` + `connectionMap` + `HeartBeat`, with an idempotent `ServiceStatus` machine.
- State rehydration from `chrome.storage.local` / dexie on service-worker wake.

### Changed
- Background layer migrated from the MV2 persistent page to an MV3 event-driven service worker.

**Commit**:

## Implementation notes

_Retroactive story — capability already shipped. Fill `commit`, `version_shipped`
and any implementation caveats (e.g. specific Chrome/Firefox quirks) during
version reconciliation._

## Incremental work, fixes & chores

**15 tracker issues** of incremental work landed on this capability — background-state persistence, one lifecycle behaviour closed not-planned, and the whole MV3 migration arc: the switch itself, its follow-up defect rounds, and the Firefox attempt that ended in a rollback. Folded in from the former one-issue-per-story maintenance ledger (2026-07-22); `—` where no CHANGELOG line proves a release.

> **All 15 rows are settled.** One more — the Firefox background-stop recheck
> ([#3222](https://github.com/Koniverse/SubWallet-Extension/issues/3222)) — sat here until
> 2026-07-22 and moved to [US-1.7](US-1.7-firefox-background-lifecycle-recheck.md). A `done`
> story may not carry unfinished work: [AGENTS.md](../../../AGENTS.md) rule 4 forbids it an
> unticked AC, and an open row in this table is the same claim through a different field.
>
> **13 of these arrived on 2026-07-22** out of the performance ledger, which had held the MV3
> migration because MV3 was pursued *for* performance. The migration materializes FR-1, and this
> story owns it.
>
> **The Firefox arc ends in a rollback, and the last row is the rollback.** #3109 → #3330 → #3364,
> and #3364's own commit is `5c46c04e2e` *"Update build packaging and rollback Firefox to MV2"*
> (2024-08-21, first tag **v1.2.28**). Firefox has run MV2 ever since — which is why
> [FR-1](../../PRD.md#functional-requirements) no longer names it.

| Shipped | Issue | Title | Status |
|---|---|---|---|
| — | [#334](https://github.com/Koniverse/SubWallet-Extension/issues/334) | Make the wallet extension in Chrome persist its state | ✅ done |
| — | [#2471](https://github.com/Koniverse/SubWallet-Extension/issues/2471) | Do not navigate to the Chrome store while the extension is disabled | ⏸️ deprecated |
| 1.2.1 | [#2205](https://github.com/Koniverse/SubWallet-Extension/issues/2205) | Update extension to MV3 | ✅ done |
| 1.2.1 | [#2681](https://github.com/Koniverse/SubWallet-Extension/issues/2681) | Extension — Improve MV3 | ✅ done |
| — | [#2949](https://github.com/Koniverse/SubWallet-Extension/issues/2949) | Can't fetch online resources on MV3 | ✅ done |
| — | [#2951](https://github.com/Koniverse/SubWallet-Extension/issues/2951) | Update newest code into MV3 version | ✅ done |
| — | [#2980](https://github.com/Koniverse/SubWallet-Extension/issues/2980) | Extension — Some errors appear on MV3 | ✅ done |
| — | [#3045](https://github.com/Koniverse/SubWallet-Extension/issues/3045) | Extension — Follow-up MV3 version | ✅ done |
| 1.1.66 | [#3060](https://github.com/Koniverse/SubWallet-Extension/issues/3060) | Extension — MV3 — Auto reset currency in case upgrade version | ✅ done |
| — | [#3066](https://github.com/Koniverse/SubWallet-Extension/issues/3066) | Extension — MV3 — Handle some errors on MV3 | ✅ done |
| 1.2.7 | [#3109](https://github.com/Koniverse/SubWallet-Extension/issues/3109) | MV3 on Firefox | ✅ done |
| 1.2.2 | [#3146](https://github.com/Koniverse/SubWallet-Extension/issues/3146) | Extension — Fix some bugs related MV3 extension | ✅ done |
| 1.2.4 | [#3144](https://github.com/Koniverse/SubWallet-Extension/issues/3144) | Extension — Update lock time of MV3 extension | ✅ done |
| — | [#3330](https://github.com/Koniverse/SubWallet-Extension/issues/3330) | Re-test MV3 on Firefox | ✅ done |
| 1.2.28 | [#3364](https://github.com/Koniverse/SubWallet-Extension/issues/3364) | Extension — Check validate on Firefox when submitting the MV3 version | ✅ done |

## Cross-references

- [PRD FR-1](../../PRD.md#functional-requirements)
- [Epic EPIC-1](../epics/EPIC-1.md)
- [US-1.7](US-1.7-firefox-background-lifecycle-recheck.md) — the open Firefox recheck this story no longer carries
- [ARCHITECTURE AD-08 / AD-20](../../ARCHITECTURE.md#architecture-decisions)
- [US-1.2](US-1.2-yarn-3-monorepo-shared-across-extension-web-mobile.md)
- [US-1.5](US-1.5-build-ci-and-cross-browser-packaging-hardening.md)
