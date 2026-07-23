---
id: US-6.2
title: "Web app (standalone browser app) with feature parity to the extension"
epic: EPIC-6
status: done
priority: P2
points: 5
sprint: sprint-2024-M02
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

## Status

> **✅ done — shipped in 1.1.36.** All acceptance criteria are ticked and the 32 rows below are
> settled: 31 delivered, 1 closed without shipping. **This is the second-largest story in the epic**
> — feature parity was not one delivery, it was thirty-two.

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

## Incremental work, fixes & chores

**32 tracker issues** — 22 with a release, 9 delivered with no line naming them, 1 closed without
shipping. Folded in from the former one-issue-per-story maintenance ledger (2026-07-23).

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 1.1.36 | [#1685](https://github.com/Koniverse/SubWallet-Extension/issues/1685) | WebApp - UI bugs on the Welcome screen | ✅ done |
| 1.1.36 | [#1698](https://github.com/Koniverse/SubWallet-Extension/issues/1698) | WebApp - Bugs related to the History feature | ✅ done |
| 1.1.36 | [#1699](https://github.com/Koniverse/SubWallet-Extension/issues/1699) | WebApp - An error occurs when user click button Cancel on the Confirmations screens | ✅ done |
| 1.1.36 | [#1706](https://github.com/Koniverse/SubWallet-Extension/issues/1706) | WebApp - Update show display version from package.json | ✅ done |
| 1.1.36 | [#1739](https://github.com/Koniverse/SubWallet-Extension/issues/1739) | WebApp - Update UI some screen | ✅ done |
| 1.1.36 | [#1740](https://github.com/Koniverse/SubWallet-Extension/issues/1740) | Can not back to Welcome screen when click back on Create master password screen | ✅ done |
| 1.1.36 | [#1751](https://github.com/Koniverse/SubWallet-Extension/issues/1751) | WebApp - UI bug header | ✅ done |
| 1.1.36 | [#1820](https://github.com/Koniverse/SubWallet-Extension/issues/1820) | WebApp - Update general modal UI | ✅ done |
| 1.1.36 | [#1828](https://github.com/Koniverse/SubWallet-Extension/issues/1828) | WebApp - Screen navigation is incorrect | ✅ done |
| 1.1.36 | [#1831](https://github.com/Koniverse/SubWallet-Extension/issues/1831) | WebApp - Add the tooltip for icon button without text | ✅ done |
| 1.1.36 | [#1863](https://github.com/Koniverse/SubWallet-Extension/issues/1863) | WebApp - Some UI bug | ✅ done |
| 1.1.36 | [#1879](https://github.com/Koniverse/SubWallet-Extension/issues/1879) | WebApp - Update welcome screen | ✅ done |
| 1.1.36 | [#1977](https://github.com/Koniverse/SubWallet-Extension/issues/1977) | WebApp - UI bug on DApps screen | ✅ done |
| 1.1.36 | [#2040](https://github.com/Koniverse/SubWallet-Extension/issues/2040) | Recheck bug show apply master password screen when using webapp | ✅ done |
| 1.1.36 | [#2056](https://github.com/Koniverse/SubWallet-Extension/issues/2056) | WebApp - Show create master password screen when reset wallet | ✅ done |
| 1.1.36 | [#2086](https://github.com/Koniverse/SubWallet-Extension/issues/2086) | WebApp - Improve UI for mobile | ✅ done |
| 1.1.36 | [#2210](https://github.com/Koniverse/SubWallet-Extension/issues/2210) | WebApp - UI bug on the small screen | ✅ done |
| 1.1.36 | [#2326](https://github.com/Koniverse/SubWallet-Extension/issues/2326) | WebApp \| Extension - Incorrect display of filter results when filtering by "Failed" criteria | ✅ done |
| 1.1.36 | [#2417](https://github.com/Koniverse/SubWallet-Extension/issues/2417) | WebApp \| Extension - Fix some UI bug (Round 2) | ✅ done |
| 1.2.26 | [#1902](https://github.com/Koniverse/SubWallet-Extension/issues/1902) | WebApp - The display is very slow when opened for the first time | ✅ done |
| 1.2.26 | [#3258](https://github.com/Koniverse/SubWallet-Extension/issues/3258) | WebApp - Refactor Code to Handle inputValue Not Updating When Clicking Switch Button | ✅ done |
| 1.2.26 | [#3331](https://github.com/Koniverse/SubWallet-Extension/issues/3331) | WebApp - Fix some UI bugs | ✅ done |
| — | [#1686](https://github.com/Koniverse/SubWallet-Extension/issues/1686) | WebApp - Do not attach watch any wallet from Welcome screen | ✅ done |
| — | [#1703](https://github.com/Koniverse/SubWallet-Extension/issues/1703) | WebApp - Update apply apply master password screen | ⏸ deprecated |
| — | [#1704](https://github.com/Koniverse/SubWallet-Extension/issues/1704) | WebApp - Update webapp popup - popover UX | ✅ done |
| — | [#1723](https://github.com/Koniverse/SubWallet-Extension/issues/1723) | WebApp - Update confirmation UX | ✅ done |
| — | [#1730](https://github.com/Koniverse/SubWallet-Extension/issues/1730) | WebApp - Bug duplicate title in some screens | ✅ done |
| — | [#1776](https://github.com/Koniverse/SubWallet-Extension/issues/1776) | WebApp - Re-check screen navigation | ✅ done |
| — | [#1790](https://github.com/Koniverse/SubWallet-Extension/issues/1790) | WebApp - Bugs related to responsive UI | ✅ done |
| — | [#1816](https://github.com/Koniverse/SubWallet-Extension/issues/1816) | WebApp - Update popup position | ✅ done |
| — | [#3343](https://github.com/Koniverse/SubWallet-Extension/issues/3343) | WebApp - The display is very slow when opened for the first time | ✅ done |
| — | [#4535](https://github.com/Koniverse/SubWallet-Extension/issues/4535) | WebApp - Fix some UI bug | ✅ done |

> **Twenty-two of these rows land in 1.1.36 itself.** The WebApp did not reach parity and then
> accumulate fixes — the parity release *is* the pile: welcome screen, header, navigation, modals,
> tooltips, the DApps screen, the small-screen layout, the master-password screen shown when it
> should not be. A surface that reuses the same background still has to re-earn every screen.
>
> **The WebApp has its own version space** ([AGENTS.md](../../../AGENTS.md) rule 1b), which is why nine settled rows carry
> `Shipped: —` rather than missing evidence.
>
> **#1902 and #3343 have the same title** — *"The display is very slow when opened for the first
> time"* — one shipped in 1.2.26 and one carries no line. First-open latency on a web surface that
> boots the whole extension background is the cost of the parity this story claims.

## Cross-references

- [PRD FR-64](../../PRD.md#functional-requirements)
- [Epic EPIC-6](../epics/EPIC-6.md)
- [US-6.1](US-6.1-dark-only-responsive-popup-and-expand-view.md)
- [US-6.3](US-6.3-mobile-web-runner-webview.md)
- [consolidation note](../../notes/2026-07-23.md#d-epic-26-maintenance--ui--ux-merged-into-epic-6)
