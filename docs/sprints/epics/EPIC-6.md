---
id: EPIC-6
title: "UI & User Experience"
status: backlog
prd_ref:
  - FR-63
  - FR-64
  - FR-65
  - FR-66
  - FR-67
arch_ref:
  - AD-05
  - AD-03
created: 2026-06-12
updated: 2026-06-12
---

## Goal

Every feature in the wallet renders through one shared experience layer. This
epic owns that layer: a dark-only, responsive UI that runs unchanged as the
extension popup, the full-page expand view, the standalone web app, and the
mobile web-runner WebView — plus the settings and display-currency controls that
shape how all of those surfaces present data. Downstream feature epics get to
stop worrying about *where* they run and *how* values are formatted; they render
into surfaces and read preferences this epic guarantees.

## Overview

### Business context

Before this epic, the product has background logic (keys, chains, balances,
signing) but no consistent shell to render it through, no way to run that logic
outside a browser extension, and no user-facing controls for network/token
visibility or display currency. Every feature would otherwise re-solve layout,
theming, platform packaging, and currency formatting on its own.

EPIC-6 is a **cross-cutting experience layer**, not a feature. It supplies (a)
the dark-only design system and the responsive popup/expand layout (FR-63); (b)
two additional delivery targets — the standalone web app (FR-64) and the mobile
web-runner/WebView host (FR-65) — that reuse the *same*
`@subwallet/extension-base` background logic across all three platforms
([NFR-17](../../PRD.md#non-functional-requirements), [AD-05](../../ARCHITECTURE.md#architecture-decisions));
and (c) the shared preference surfaces: settings management (FR-66) and display
fiat-currency selection (FR-67).

The architectural distinction this epic preserves: it owns the **UI shell and
its portability**, never the data behind it. Platform parity (FR-64/65) is a
*packaging and UI-adaptation* problem on top of a single shared background — the
web app and web-runner bundle `extension-base` unchanged
([AD-05](../../ARCHITECTURE.md#architecture-decisions)); the message-bus
isolation ([AD-03](../../ARCHITECTURE.md#architecture-decisions)) is what makes
the same background addressable from a service worker, a web page, and a WebView
iframe alike. Currency *selection* (the picker + the persisted preference) lives
here; currency-converted *amounts* are computed by the balance epic
([EPIC-7](EPIC-7.md)) which consumes the selected currency.

### Feature pillars

| # | Pillar | Stories | Purpose |
|---|---|---|---|
| 1 | **Responsive design system** | [US-6.1](../stories/US-6.1-dark-only-responsive-popup-and-expand-view.md) | Dark-only theme + popup/expand-view responsive layout, the shell every screen renders into |
| 2 | **Cross-platform parity** | [US-6.2](../stories/US-6.2-web-app-feature-parity.md), [US-6.3](../stories/US-6.3-mobile-web-runner-webview.md) | The standalone web app and mobile web-runner/WebView, both reusing one shared background |
| 3 | **Shared preference surfaces** | [US-6.4](../stories/US-6.4-settings-management.md), [US-6.5](../stories/US-6.5-display-fiat-currency-selection.md) | Settings management (network/token/account metadata) and display-currency selection |
| 4 | **Design-system hardening** | [US-6.6](../stories/US-6.6-design-system-and-ux-hardening.md) | Real UI/UX bug + iteration fixes across the extension & WebApp: scaling/border/scroll regressions, mobile & incomplete-list layout, Confirmation screen, number display |

### Out of scope

- **Notification center / in-app notifications** — owned by [EPIC-19](EPIC-19.md) (utilities). Despite living in the same shell, it is a feature surface, not part of the experience layer; do not include it here.
- **Currency-converted balance & price *amounts*** — owned by [EPIC-7](EPIC-7.md) (balance). This epic ships the currency *picker* and the persisted preference (FR-67); EPIC-7 computes and displays the converted values that read it.
- **Account creation / import / management screens** — owned by [EPIC-3](EPIC-3.md) (account). Settings management here is wallet/app preferences (network, token, account metadata), not the account-identity flows.
- **Master-password / auto-lock / security settings behavior** — owned by [EPIC-5](EPIC-5.md) (security). The Settings *entry points* render here; the lock policy and its enforcement live there.
- **i18n / language-translation runtime** — bundled-locale i18n ([NFR-13](../../PRD.md#non-functional-requirements)) and the planned online translation hot-update (FR-4) are owned by the onboarding/localization epic, not here. This epic ships English-canonical UI.
- **Per-feature screens (send, swap, staking, NFT, dApp)** — owned by their respective feature epics. They *render into* this shell; they are not part of it.

## FR Coverage

| FR | Story | Status |
|----|-------|--------|
| FR-63 | [US-6.1](../stories/US-6.1-dark-only-responsive-popup-and-expand-view.md) | 📋 backlog |
| FR-64 | [US-6.2](../stories/US-6.2-web-app-feature-parity.md) | 📋 backlog |
| FR-65 | [US-6.3](../stories/US-6.3-mobile-web-runner-webview.md) | 📋 backlog |
| FR-66 | [US-6.4](../stories/US-6.4-settings-management.md) | 📋 backlog |
| FR-67 | [US-6.5](../stories/US-6.5-display-fiat-currency-selection.md) | 📋 backlog |

> FR statuses above are **story-planning** statuses (Stream B; all `📋 backlog`).
> The real shipped state of each capability lives in [PRD](../../PRD.md#functional-requirements) — all of
> EPIC-6 is `✅ shipped` there; `done` + `version_shipped` are backfilled during
> version reconciliation. US-6.6 is a hardening story and owns no FR.

## AD Coverage

| AD | Title | Story |
|----|-------|-------|
| AD-05 | Yarn 3 monorepo package boundaries | [US-6.2](../stories/US-6.2-web-app-feature-parity.md), [US-6.3](../stories/US-6.3-mobile-web-runner-webview.md) |
| AD-03 | Background / UI message-bus isolation | [US-6.3](../stories/US-6.3-mobile-web-runner-webview.md) |

> [AD-05](../../ARCHITECTURE.md#architecture-decisions) (twelve-package monorepo
> with `extension-base` shared by `extension-koni`, `webapp`, `web-runner`) is
> the seam that makes parity (FR-64/65) a packaging problem rather than a rewrite.
> [AD-03](../../ARCHITECTURE.md#architecture-decisions) is *referenced* here as
> the boundary the WebView host crosses, but its primary implementation is owned
> by [EPIC-2](EPIC-2.md) (core-platform). [NFR-17](../../PRD.md#non-functional-requirements) (cross-platform
> portability) is the non-functional requirement these two stories satisfy.

## Stories

| ID | Title | Goal | Status | Version |
|---|---|---|---|---|
| [US-6.1](../stories/US-6.1-dark-only-responsive-popup-and-expand-view.md) | Dark-only responsive popup & expand view | One dark-only theme + responsive layout across popup and full-page expand | 📋 backlog | — |
| [US-6.2](../stories/US-6.2-web-app-feature-parity.md) | Web app with feature parity | A standalone browser web app reusing the same background, at parity with the extension | 📋 backlog | — |
| [US-6.3](../stories/US-6.3-mobile-web-runner-webview.md) | Mobile web-runner / WebView | Run the shared background inside a WebView iframe for mobile/non-extension hosts | 📋 backlog | — |
| [US-6.4](../stories/US-6.4-settings-management.md) | Settings management | Manage network selection, token preferences, and account metadata | 📋 backlog | — |
| [US-6.5](../stories/US-6.5-display-fiat-currency-selection.md) | Display fiat-currency selection | Pick the fiat currency used to display balances and prices | 📋 backlog | — |
| [US-6.6](../stories/US-6.6-design-system-and-ux-hardening.md) | Design-system & UX hardening | Real UI/UX bug + iteration fixes across extension & WebApp — scaling/border/scroll regressions, mobile & incomplete-list layout, Confirmation screen, number display | 📋 backlog | — |

> Every FR is assigned a story ID up front (FR order) so numbering is locked — no
> renumber later. US-6.6 is the epic's hardening story (no FR).

## Object map & user-story interactions

### US ↔ entity / subsystem matrix

| US | Primary entity / subsystem | FR |
|---|---|---|
| [US-6.1](../stories/US-6.1-dark-only-responsive-popup-and-expand-view.md) | `ThemeProvider` / `ThemeContext.tsx` + `themes.ts` (dark-only `ThemeNames.DARK`) + responsive popup/expand layout in `@subwallet/extension-koni-ui` | FR-63 |
| [US-6.2](../stories/US-6.2-web-app-feature-parity.md) | `@subwallet/webapp` host bundling `extension-base` + `@subwallet/extension-web-ui` (`webpack.config.cjs`) | FR-64 |
| [US-6.3](../stories/US-6.3-mobile-web-runner-webview.md) | `@subwallet/web-runner` WebView host over `extension-base` (`webpack.config.cjs`), `mobile(…)` bus path | FR-65 |
| [US-6.4](../stories/US-6.4-settings-management.md) | `SettingService` (background) + `Popup/Settings/` surface (network / token / account-metadata preferences) | FR-66 |
| [US-6.5](../stories/US-6.5-display-fiat-currency-selection.md) | `SettingService` `CurrencyType` preference via `pri(settings.savePriceCurrency)` (`RequestChangePriceCurrency`, `DEFAULT_CURRENCY = 'usd'`) | FR-67 |
| [US-6.6](../stories/US-6.6-design-system-and-ux-hardening.md) | Shared design tokens + responsive layout in `extension-koni-ui` / `extension-web-ui`; `NumberDisplay.tsx`, `Popup/Confirmations/` | — |

> **Happy path: N/A** — EPIC-6 is the experience shell, not a single end-to-end flow; its six stories span three independent concerns (responsive design system, cross-platform packaging, preference surfaces) that share no one canonical user path. The display-currency change (US-6.5: picker → `pri(settings.savePriceCurrency)` → `SettingService` persists `CurrencyType` → balance surfaces re-render) is the closest candidate, but its converted-amount step is owned by [EPIC-7](EPIC-7.md), so forcing one diagram here would misrepresent the epic's scope boundary.

## Cross-cutting invariants

- **One shared background across all platforms ([NFR-17](../../PRD.md#non-functional-requirements), [AD-05](../../ARCHITECTURE.md#architecture-decisions)):** the extension, web app, and mobile web-runner all bundle the *same* `@subwallet/extension-base`; no platform forks the background logic. A feature shipped in `extension-base` is reachable from every surface. Enforced by [US-6.2](../stories/US-6.2-web-app-feature-parity.md) / [US-6.3](../stories/US-6.3-mobile-web-runner-webview.md) — any platform-specific divergence lives in the UI/host package, never in `extension-base`.
- **Dark-only, no user-selectable light theme ([FR-63](../../PRD.md#functional-requirements)):** the theme is dark-only; the theme selector is hidden in Settings (light is not user-selectable). Enforced by [US-6.1](../stories/US-6.1-dark-only-responsive-popup-and-expand-view.md) — Settings exposes no theme toggle.
- **UI never touches keys or chains directly ([AD-03](../../ARCHITECTURE.md#architecture-decisions)):** every surface in this epic communicates with the background only over the typed `pri(…)`/`pub(…)` message bus, including the WebView host. No screen reaches a keyring or RPC directly. Enforced across all stories; primarily exercised by [US-6.3](../stories/US-6.3-mobile-web-runner-webview.md).
- **Currency selection is a preference, not a calculation ([FR-67](../../PRD.md#functional-requirements)):** this epic persists the chosen `CurrencyType` and exposes the picker; it does not convert amounts. EPIC-7 reads the preference to format values. Enforced by [US-6.5](../stories/US-6.5-display-fiat-currency-selection.md).
- **Settings is the preference surface, not the policy owner ([FR-66](../../PRD.md#functional-requirements)):** Settings screens render entry points and persist preferences (network/token/account metadata); the behavior behind security/account entries is owned by EPIC-5 / EPIC-3. Enforced by [US-6.4](../stories/US-6.4-settings-management.md).

## Cross-story testing requirements

| Pattern | Stories that apply | Shared infra |
|---|---|---|
| **Cross-surface render parity** (same screen across popup / expand / web app / web-runner) | [US-6.1](../stories/US-6.1-dark-only-responsive-popup-and-expand-view.md), [US-6.2](../stories/US-6.2-web-app-feature-parity.md), [US-6.3](../stories/US-6.3-mobile-web-runner-webview.md), [US-6.6](../stories/US-6.6-design-system-and-ux-hardening.md) | Render harness over the shared `extension-koni-ui` / `extension-web-ui` tree mounted in each host (`@subwallet/webapp`, `@subwallet/web-runner`); assert only host-layer adaptations differ (AD-05) |
| **Dark-only / design-token assertion** | [US-6.1](../stories/US-6.1-dark-only-responsive-popup-and-expand-view.md), [US-6.6](../stories/US-6.6-design-system-and-ux-hardening.md) | `ThemeProvider` mounted with `ThemeNames.DARK` from `themes.ts`; assert no per-screen ad-hoc colors and no exposed theme selector |
| **Responsive / breakpoint + number-display regression** | [US-6.1](../stories/US-6.1-dark-only-responsive-popup-and-expand-view.md), [US-6.6](../stories/US-6.6-design-system-and-ux-hardening.md) | Viewport-matrix fixture (narrow popup ↔ wide expand, >100% zoom, narrow-width lists) pinning #1286 / #2832 / #4236 symptoms; `NumberDisplay.tsx` formatting cases |
| **Settings preference persistence** (round-trip + reactive re-render) | [US-6.4](../stories/US-6.4-settings-management.md), [US-6.5](../stories/US-6.5-display-fiat-currency-selection.md) | `SettingService` fixture asserting `pri(settings.*)` / `pri(settings.savePriceCurrency)` writes persist and re-emit; UI mutates only over the typed bus (AD-03), never chain/key state directly |

> **Cross-reference:** executable scenarios for this epic live in
> `docs/tests/test-cases/EPIC-6.md` (when authored). The table above declares
> the *harness*; the test-cases file owns the *scenarios*.

## Performance budgets & invariants

| Concern | Budget | Story | Rationale |
|---|---|---|---|
| **Dark-only single-palette render** | One applied palette (`ThemeNames.DARK`); no dual-theme parity work and no user-selectable light theme | [US-6.1](../stories/US-6.1-dark-only-responsive-popup-and-expand-view.md) | The design system optimizes for a single palette; the theme selector stays hidden in Settings (FR-63), so screens carry no light-theme branching cost |
| **Single component tree across viewports** | Popup ↔ full-page expand render from one responsive component tree at a wider breakpoint — no popup-only / page-only duplicate screens, state preserved across the transition | [US-6.1](../stories/US-6.1-dark-only-responsive-popup-and-expand-view.md), [US-6.6](../stories/US-6.6-design-system-and-ux-hardening.md) | A parallel screen set would double maintenance and is exactly the drift US-6.6 hardens against; content must degrade gracefully (wrap/scroll/ellipsize) under extreme zoom/width rather than break |
| **One shared background, no per-platform fork** | `@subwallet/webapp` and `@subwallet/web-runner` bundle `extension-base` unchanged; web/mobile full-start on load (no MV3 sleep state); platform divergence lives only in the host/UI layer | [US-6.2](../stories/US-6.2-web-app-feature-parity.md), [US-6.3](../stories/US-6.3-mobile-web-runner-webview.md) | Parity is a packaging concern (AD-05, NFR-17); a forked background would be a second divergent codebase and a security liability, and the WebView host crosses the `pri(…)`/`pub(…)`/`mobile(…)` bus (AD-03) with no key bytes over the bridge |

## Acceptance criteria (propagated from stories)

- [ ] The UI renders dark-only and responsively as both the extension popup and the full-page expand view, with no user-selectable light theme — [US-6.1](../stories/US-6.1-dark-only-responsive-popup-and-expand-view.md)
- [ ] A standalone browser web app runs the same background logic and reaches feature parity with the extension — [US-6.2](../stories/US-6.2-web-app-feature-parity.md)
- [ ] The shared background runs inside a mobile web-runner/WebView host over the same message bus — [US-6.3](../stories/US-6.3-mobile-web-runner-webview.md)
- [ ] A user can manage network selection, token preferences, and account metadata from Settings — [US-6.4](../stories/US-6.4-settings-management.md)
- [ ] A user can select the display fiat currency, and the preference persists and is read across surfaces — [US-6.5](../stories/US-6.5-display-fiat-currency-selection.md)
- [ ] Real UI/UX defects across the extension and WebApp are fixed and pinned against regression — scaling/border/scroll rendering, mobile & incomplete-list responsive layout, the Confirmation screen, and number display — [US-6.6](../stories/US-6.6-design-system-and-ux-hardening.md)
