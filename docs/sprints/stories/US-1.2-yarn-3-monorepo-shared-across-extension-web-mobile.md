---
id: US-1.2
title: "Yarn 3 monorepo shared across extension, web app and mobile"
epic: EPIC-1
status: done
priority: P0
points: 5
sprint: sprint-2024-M02
version_shipped: 1.1.36
prd_ref: [FR-2]
arch_ref: [AD-05, AD-06]
depends_on:
assignee: saltict
commit: 918864fcfb, b319f9a32b
created: 2026-06-12
updated: 2026-06-12
---

## Goal

Structure the codebase as a Yarn 3 monorepo whose `@subwallet/extension-base`
core is reused verbatim by the browser extension, the standalone web app and the
mobile web-runner — so a single background implementation powers all three
surfaces and a new feature is written once, not three times. Downstream feature
epics get to write against one shared core and trust it runs everywhere.

## Background

SubWallet ships three runtime surfaces (browser extension, web app, mobile
WebView) that must share the same non-custodial background logic. The codebase is
split into twelve packages with explicit peer/runtime dependencies
([AD-05](../../ARCHITECTURE.md#architecture-decisions)) so that
`@subwallet/extension-base` — account management, balance, chain connectivity,
transaction, earning, NFT, the message-bus handlers, storage and cron jobs — is
consumed unchanged by `extension-koni` (extension), `webapp` (web app) and
`web-runner` (mobile WebView host). This boundary is what makes NFR-17
(cross-platform portability) hold: the same background runs in the extension
service worker, the web app and the mobile WebView.

The build side has its own hard constraint. Firefox caps extension-submission
files at ~4 MB each, so Webpack 5 splits the output into many smaller chunks
rather than one monolith ([AD-06](../../ARCHITECTURE.md#architecture-decisions));
this also reduces the memory overhead of large monolithic JS. Dependency hygiene
is a requirement too: the Yarn 3 lock file is committed and core wallet packages
are published to npm with no private-registry dependencies (NFR-19), keeping the
supply chain auditable.

Materializes [FR-2](../../PRD.md#functional-requirements). This story is **retroactive** — the monorepo
already ships in the product; `commit` / `version_shipped` are backfilled during
version reconciliation. Sibling [US-1.1](US-1.1-mv3-service-worker-background.md)
produces the MV3 background that this monorepo packages; the chunk-size guard
that keeps it under the Firefox limit is hardened in
[US-1.5](US-1.5-build-ci-and-cross-browser-packaging-hardening.md).

## Acceptance criteria

- [x] **AC-1** — **Given** the monorepo, **When** the workspace is installed,
  **Then** the codebase resolves as Yarn 3 packages with explicit peer/runtime
  dependencies and `@subwallet/extension-base` is a shared dependency of
  `extension-koni`, `webapp` and `web-runner` (AD-05).
- [x] **AC-2** — **Given** the shared core, **When** `extension-base` is built,
  **Then** it contains no import of an extension-only, webapp-only or
  web-runner-only API — the same background logic is portable across all three
  contexts (NFR-17).
- [x] **AC-3** — **Given** the extension Webpack build, **When** it emits its
  output, **Then** the bundle is split into many chunks and **no single emitted
  file exceeds Firefox's ~4 MB per-file submission limit** (AD-06, NFR-9).
- [x] **AC-4** — **Given** dependency policy, **When** the lockfile and manifests
  are inspected, **Then** the Yarn 3 lock is committed and core wallet packages
  declare no private-registry dependency (NFR-19) — the supply-chain unhappy path
  (a private/unpublished core dep) is rejected.

## Tasks

- [x] **TASK-1.2.1** — Establish the twelve-package Yarn 3 workspace (AC: 1)
  - [x] Define package boundaries with explicit peer/runtime deps per AD-05; wire `extension-base` as the shared core.
- [x] **TASK-1.2.2** — Enforce `extension-base` platform-agnosticism (AC: 2)
  - [x] Keep extension/webapp/web-runner-specific code out of `extension-base`; build all three targets to prove portability (NFR-17).
- [x] **TASK-1.2.3** — Configure Webpack 5 chunk splitting (AC: 3)
  - [x] Set `packages/extension-koni/webpack.config.cjs` to split output into sub-4 MB chunks (AD-06).
- [x] **TASK-1.2.4** — Dependency-hygiene gate (AC: 4)
  - [x] Commit the Yarn 3 lockfile; assert no private-registry deps in core packages (NFR-19).

## Dev notes

### Architecture constraints

- [AD-05](../../ARCHITECTURE.md#architecture-decisions) — twelve packages with explicit boundaries; `extension-base` shared by extension/web/mobile. UI and background logic stay decoupled.
- [AD-06](../../ARCHITECTURE.md#architecture-decisions) — Webpack 5 bundle splitting to stay under Firefox's ~4 MB per-file cap; this forecloses a single-bundle build.
- This story does NOT introduce new AD entries.

### Cross-story dependencies

- Sibling [US-1.1](US-1.1-mv3-service-worker-background.md) — produces the MV3 background entry this monorepo packages; coordinate the manifest/CSP.
- Required by [US-1.3](US-1.3-online-chain-list-hot-update.md) and every feature epic — they add packages/features inside this workspace and rely on the shared `extension-base`.
- Hardened by [US-1.5](US-1.5-build-ci-and-cross-browser-packaging-hardening.md) — the CI chunk-size assertion that *continuously* defends AC-3 lives there.

### Performance budget

- No single emitted Webpack chunk may exceed Firefox's ~4 MB per-file submission limit (AD-06, NFR-9).
- Measured by inspecting the `packages/extension-koni` build output; continuously enforced by the CI guard in [US-1.5](US-1.5-build-ci-and-cross-browser-packaging-hardening.md).

### References

- [Source: PRD FR-2](../../PRD.md#functional-requirements) — Yarn 3 monorepo shared across extension/web/mobile
- [Source: PRD NFR-9](../../PRD.md#non-functional-requirements) — Firefox per-file size limit (chunk splitting)
- [Source: PRD NFR-17](../../PRD.md#non-functional-requirements) — cross-platform portability of `extension-base`
- [Source: PRD NFR-19](../../PRD.md#non-functional-requirements) — dependency auditability (Yarn 3 lock, npm-only)
- [Source: ARCHITECTURE §Package map / Build and deploy](../../ARCHITECTURE.md)
- [Source: ARCHITECTURE AD-05, AD-06](../../ARCHITECTURE.md#architecture-decisions) — issues #276, #169, #594, #48, #80, #131

## Verification commands

| AC | Command |
|---|---|
| AC-1 | `yarn install` resolves the workspace; confirm `@subwallet/extension-base` is a dependency of `extension-koni`, `webapp`, `web-runner` in their `package.json` |
| AC-2 | Build all three targets (`yarn webpack:build:extension`, `yarn webapp:build`, `yarn web-runner:build`); all succeed against the shared `extension-base` |
| AC-3 | `yarn webpack:build:extension` then check emitted file sizes — every chunk < ~4 MB |
| AC-4 | Confirm `yarn.lock` is committed; grep core package manifests for any non-npm/private registry dependency (expect none) |

## Changelog entry

### Added
- Yarn 3 twelve-package monorepo with explicit peer/runtime boundaries; `@subwallet/extension-base` shared by `extension-koni`, `webapp` and `web-runner`.
- Webpack 5 chunk-splitting config keeping every emitted file under Firefox's ~4 MB submission limit.

**Commit**:

## Implementation notes

_Retroactive story — capability already shipped. Fill `commit`, `version_shipped`
and any package-boundary caveats during version reconciliation._

## Cross-references

- [PRD FR-2](../../PRD.md#functional-requirements)
- [Epic EPIC-1](../epics/EPIC-1.md)
- [ARCHITECTURE AD-05 / AD-06](../../ARCHITECTURE.md#architecture-decisions)
- [US-1.1](US-1.1-mv3-service-worker-background.md)
- [US-1.5](US-1.5-build-ci-and-cross-browser-packaging-hardening.md)
