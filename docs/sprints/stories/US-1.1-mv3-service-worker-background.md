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
updated: 2026-06-12
---

## Goal

Run the SubWallet background as a Manifest V3 event-driven service worker that
Chrome and Firefox both accept, surviving the worker's shutdown/wake cycle
without losing wallet state. This is the foundation everything else stands on:
once it holds, every downstream epic gets to stop worrying about whether the
background is alive, how it wakes, or whether its state survives an eviction.

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

## Cross-references

- [PRD FR-1](../../PRD.md#functional-requirements)
- [Epic EPIC-1](../epics/EPIC-1.md)
- [ARCHITECTURE AD-08 / AD-20](../../ARCHITECTURE.md#architecture-decisions)
- [US-1.2](US-1.2-yarn-3-monorepo-shared-across-extension-web-mobile.md)
- [US-1.5](US-1.5-build-ci-and-cross-browser-packaging-hardening.md)
