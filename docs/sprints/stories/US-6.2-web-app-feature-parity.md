---
id: US-6.2
title: "Web app (standalone browser app) with feature parity to the extension"
epic: EPIC-6
status: done
priority: P2
points: 5
sprint:
version_shipped: 1.1.36
prd_ref: [FR-64]
arch_ref: [AD-05]
depends_on: [US-6.1]
assignee: saltict
commit: 918864fcfb33157282a901b1e1fe2cfc81976f1a, 5bcfa96704687201b7c7c4ec158aad173aef3c1b
created: 2026-06-12
updated: 2026-06-12
---

## Goal

Let users run the full wallet as a standalone browser web app — no extension
install required — at feature parity with the extension. The same accounts,
chains, balances, and flows are available because the web app bundles the *same*
background logic; only the packaging and a few web-specific UI adaptations
differ.

## Background

The extension is the primary delivery target, but a non-trivial audience cannot
or will not install a browser extension. FR-64 ships a **standalone web app**
that bundles `extension-base` (the background logic) together with
`extension-web-ui` into a fully self-contained browser app
([NFR-17](../../PRD.md#non-functional-requirements)). Parity is achievable *only* because of the
twelve-package monorepo boundary
([AD-05](../../ARCHITECTURE.md#architecture-decisions)): the web app reuses
`@subwallet/extension-base` unchanged and pairs it with
`@subwallet/extension-web-ui` (the web-adapted mirror of the extension UI), so a
feature implemented once in the background is reachable from both targets without
a fork. The build is the `@subwallet/webapp` package
(`yarn webapp:build` / `webapp:dev`).

Unlike the extension's MV3 service-worker lifecycle, the web app **full-starts on
load with no sleep state** — a platform packaging difference that lives entirely
in the host/UI layer, never in `extension-base`. This is a **separate platform
integration** on top of the shared core, which is why it is sized larger than a
pure UI story.

Materializes [FR-64](../../PRD.md#functional-requirements). Builds on the design system from
[US-6.1](US-6.1-dark-only-responsive-popup-and-expand-view.md). Sibling platform
target: [US-6.3](US-6.3-mobile-web-runner-webview.md) (mobile WebView). This
story is **retroactive** — the capability already ships in the product; `commit`
/ `version_shipped` are backfilled during version reconciliation.

## Acceptance criteria

- [x] **AC-1** — **Given** the `@subwallet/webapp` build, **When** it is served
  as a standalone browser app (no extension installed), **Then** the wallet runs
  end-to-end (create/import account, view balances, send) from the same
  `extension-base` background logic.
- [x] **AC-2** — **Given** a feature implemented in `@subwallet/extension-base`,
  **When** it is invoked from the web app, **Then** it behaves at parity with the
  extension (no background logic forked into the web layer — AD-05).
- [x] **AC-3** — **Given** the web app loads, **When** the background initializes,
  **Then** it **full-starts on load with no sleep state** (vs. the extension's
  MV3 wake/sleep lifecycle), and platform differences live only in the
  host/UI layer.
- [x] **AC-4** — **Given** the web app is open in a desktop browser, **When** the
  viewport changes, **Then** the dark-only responsive layout from US-6.1 applies
  (no separate web-only theme).

## Tasks

- [x] **TASK-6.2.1** — Stand up the `@subwallet/webapp` bundle combining
  `extension-base` + `extension-web-ui` (AC: 1)
  - [x] Confirm entry/build in `packages/webapp/webpack.config.cjs`
    (`yarn webapp:build`).
- [x] **TASK-6.2.2** — Keep all background logic in `extension-base`; web-specific
  adaptations stay in `extension-web-ui` (AC: 2)
  - [x] Audit that no chain/key logic is reimplemented in the web UI package.
- [x] **TASK-6.2.3** — Wire the web full-start-on-load lifecycle (no sleep
  state) (AC: 3)
- [x] **TASK-6.2.4** — Verify the dark-only responsive design system renders in
  the web app (AC: 4)

## Dev notes

### Architecture constraints

- [AD-05](../../ARCHITECTURE.md#architecture-decisions) — `extension-base` is the
  shared background; the web app pairs it with `extension-web-ui`. Parity is a
  packaging concern, not a rewrite — no background fork.
- [NFR-17](../../PRD.md#non-functional-requirements) — the same background logic must run in the web app
  context; the web full-starts on load (no MV3 sleep state).
- This story does NOT introduce new AD entries.

### Cross-story dependencies

- Builds on [US-6.1](US-6.1-dark-only-responsive-popup-and-expand-view.md) — reuses
  the dark-only responsive design tokens (via `extension-web-ui`).
- Sibling [US-6.3](US-6.3-mobile-web-runner-webview.md) — the other platform
  target on the same shared background; coordinate any `extension-base`
  cross-platform assumptions.
- Hardened by [US-6.6](US-6.6-design-system-and-ux-hardening.md) — cross-platform
  parity/consistency regression coverage.

### What we explicitly did NOT do

- No fork of `extension-base` for the web — all background logic stays shared.
  Trigger to revisit: a web-only background capability that cannot be expressed
  in the shared package.

### References

- [Source: PRD FR-64](../../PRD.md#functional-requirements) — web app with feature parity to the extension
- [Source: PRD NFR-17](../../PRD.md#non-functional-requirements) — cross-platform portability of `extension-base`
- [Source: ARCHITECTURE AD-05](../../ARCHITECTURE.md#architecture-decisions) — monorepo package boundaries (`extension-base` shared across targets)
- [Source: code] `packages/webapp/` (entry `webpack.config.cjs`), `packages/extension-web-ui/`

## Verification commands

| AC | Command |
|---|---|
| AC-1 | `yarn webapp:build` then serve the bundle → create account, view balances, send end-to-end |
| AC-2 | Audit: no chain/key logic duplicated in `packages/extension-web-ui` (it imports `@subwallet/extension-base`) |
| AC-3 | Manual: load web app → background full-starts immediately, no sleep transition |
| AC-4 | Manual: resize web app → dark-only responsive layout applies |

## Changelog entry

### Added
- `@subwallet/webapp`: standalone browser web app bundling `extension-base` + `extension-web-ui` at feature parity with the extension; full-starts on load (no MV3 sleep state).

**Commit**:

## Implementation notes

_Retroactive story — capability already shipped. Fill `commit`, `version_shipped`
and any implementation caveats during version reconciliation._

## Files modified

_Filled during version reconciliation._

## Cross-references

- [PRD FR-64](../../PRD.md#functional-requirements)
- [Epic EPIC-6](../epics/EPIC-6.md)
- [US-6.1](US-6.1-dark-only-responsive-popup-and-expand-view.md)
- [US-6.3](US-6.3-mobile-web-runner-webview.md)
