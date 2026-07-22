---
id: US-6.3
title: "Mobile app support via web-runner / WebView strategy"
epic: EPIC-6
status: done
priority: P2
points: 5
sprint:
version_shipped: 0.4.2
prd_ref: [FR-65]
arch_ref: [AD-05, AD-03]
depends_on: [US-6.1]
assignee: saltict
commit: b319f9a32b, db39e513c1, 77e5bce0d3
created: 2026-06-12
updated: 2026-06-12
---

## Goal

Run the wallet on mobile by hosting the exact same background logic inside a
WebView iframe (the "web-runner"), so the mobile app reuses the extension's
background instead of reimplementing key, chain, and signing logic natively. The
mobile UI talks to that hosted background over the same typed message bus the
extension uses.

## Background

A native mobile reimplementation of the background (keyring, chain service,
signing) would be a second, divergent codebase — expensive and a security
liability. FR-65 takes the **web-runner / WebView strategy** instead: the
`@subwallet/web-runner` package hosts the `extension-base` background service-
worker logic inside a WebView iframe so the wallet can run in mobile (and other
non-extension) environments ([NFR-17](../../PRD.md#non-functional-requirements)), reusing
`extension-koni-ui` for the UI. This is the same `extension-base` the extension
and web app bundle ([AD-05](../../ARCHITECTURE.md#architecture-decisions)) — one
background, three hosts.

The host crosses the same boundary the extension does: the mobile UI reaches the
hosted background **only** over the typed `pri(…)`/`pub(…)`/`mobile(…)` message
bus ([AD-03](../../ARCHITECTURE.md#architecture-decisions)) — no direct keyring
or RPC access from the UI. The lifecycle differs from the extension's MV3 model:
on mobile the host **re-injects reset data then always full-starts** (no idle
sleep). Like the web app, this is a **separate platform integration** layered on
the shared core, so it is sized larger than a pure UI story.

Materializes [FR-65](../../PRD.md#functional-requirements). Builds on the design system from
[US-6.1](US-6.1-dark-only-responsive-popup-and-expand-view.md). Sibling platform
target: [US-6.2](US-6.2-web-app-feature-parity.md) (standalone web app). This
story is **retroactive** — the capability already ships in the product; `commit`
/ `version_shipped` are backfilled during version reconciliation.

## Acceptance criteria

- [x] **AC-1** — **Given** the `@subwallet/web-runner` host, **When** it loads in
  a WebView/iframe context, **Then** it runs the same `extension-base` background
  logic the extension uses (no native reimplementation of keyring/chain/signing).
- [x] **AC-2** — **Given** the mobile UI, **When** it invokes a background
  operation, **Then** it communicates **only** over the typed
  `pri(…)`/`pub(…)`/`mobile(…)` message bus
  ([AD-03](../../ARCHITECTURE.md#architecture-decisions)) — never a direct key or
  RPC call from the UI layer.
- [x] **AC-3** — **Given** the mobile host starts, **When** it initializes,
  **Then** it re-injects reset data and **always full-starts** (no idle sleep
  state, unlike the extension's MV3 wake/sleep lifecycle).
- [x] **AC-4** — **Given** the WebView loses or re-establishes its context, **When**
  the host re-injects, **Then** the background re-initializes deterministically
  without leaking key material across the bridge boundary.

## Tasks

- [x] **TASK-6.3.1** — Host `extension-base` inside the WebView iframe via
  `@subwallet/web-runner` (AC: 1)
  - [x] Confirm entry/build in `packages/web-runner/webpack.config.cjs`.
- [x] **TASK-6.3.2** — Route all UI ↔ background traffic over the typed message
  bus, including the `mobile(…)` wake path (AC: 2)
  - [x] Verify no keyring/RPC access leaks into the mobile UI package.
- [x] **TASK-6.3.3** — Implement the re-inject-then-full-start lifecycle (no sleep
  state) (AC: 3, 4)
- [x] **TASK-6.3.4** — Verify deterministic re-init on WebView context reset with
  no key bytes crossing the bridge (AC: 4)

## Dev notes

### Architecture constraints

- [AD-05](../../ARCHITECTURE.md#architecture-decisions) — `web-runner` hosts the
  shared `extension-base`; mobile reuses one background, no native fork.
- [AD-03](../../ARCHITECTURE.md#architecture-decisions) — the WebView host
  crosses the same UI/background message-bus boundary; the `mobile(…)` message
  wakes the background fully. (AD-03's primary implementation is owned by
  [EPIC-2](../epics/EPIC-2.md); referenced here as the boundary the host honors.)
- [NFR-17](../../PRD.md#non-functional-requirements) — cross-platform portability of `extension-base` to the
  mobile WebView context.
- This story does NOT introduce new AD entries.

### Cross-story dependencies

- Builds on [US-6.1](US-6.1-dark-only-responsive-popup-and-expand-view.md) — reuses
  the dark-only responsive UI (`extension-koni-ui`).
- Sibling [US-6.2](US-6.2-web-app-feature-parity.md) — the other shared-background
  platform target; both depend on `extension-base` staying host-agnostic.
- Consumes the request/lifecycle plumbing owned by [EPIC-2](../epics/EPIC-2.md)
  (RequestService, MV3/mobile lifecycle); this story does not own it.

### What we explicitly did NOT do

- No native (non-WebView) reimplementation of the background. Trigger to revisit:
  a platform constraint that makes WebView hosting infeasible.

### References

- [Source: PRD FR-65](../../PRD.md#functional-requirements) — mobile support via web-runner / WebView
- [Source: PRD NFR-17](../../PRD.md#non-functional-requirements) — cross-platform portability of `extension-base`
- [Source: ARCHITECTURE AD-05](../../ARCHITECTURE.md#architecture-decisions) — monorepo package boundaries
- [Source: ARCHITECTURE AD-03](../../ARCHITECTURE.md#architecture-decisions) — background / UI message-bus isolation
- [Source: code] `packages/web-runner/` (entry `webpack.config.cjs`)

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Build `packages/web-runner` → load host in a WebView/iframe; account + balance flows run on `extension-base` |
| AC-2 | Audit: mobile UI calls go through `pri(…)`/`pub(…)`/`mobile(…)`; no direct keyring/RPC import in the UI layer |
| AC-3 | Manual: start mobile host → re-injects reset data and full-starts (no sleep transition) |
| AC-4 | Manual: force WebView context reset → background re-inits; no key bytes observed crossing the bridge |

## Changelog entry

### Added
- `@subwallet/web-runner`: hosts `extension-base` background logic inside a WebView iframe for mobile / non-extension environments; re-injects reset data and always full-starts (no idle sleep).

**Commit**:

## Implementation notes

_Retroactive story — capability already shipped. Fill `commit`, `version_shipped`
and any implementation caveats during version reconciliation._

## Files modified

_Filled during version reconciliation._

## Cross-references

- [PRD FR-65](../../PRD.md#functional-requirements)
- [Epic EPIC-6](../epics/EPIC-6.md)
- [US-6.1](US-6.1-dark-only-responsive-popup-and-expand-view.md)
- [US-6.2](US-6.2-web-app-feature-parity.md)
