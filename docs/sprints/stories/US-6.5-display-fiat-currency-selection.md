---
id: US-6.5
title: "Select display fiat currency for balances and prices"
epic: EPIC-6
status: backlog
priority: P2
points: 2
sprint:
version_shipped:
prd_ref: [FR-67]
arch_ref: [AD-03]
depends_on: [US-6.4]
assignee:
commit:
created: 2026-06-12
updated: 2026-06-12
---

## Goal

Let users see their portfolio in the currency they think in. The user picks a
display fiat currency once; the wallet persists that choice and every balance and
price across the app is formatted in it.

## Background

The wallet defaults to USD, but a global user base needs balances and prices in
their own currency. FR-67 ships a **display-currency selector**: a Settings entry
where the user chooses from the supported `CurrencyType` set (USD default, plus
others), persisted by the background `SettingService` via the
`pri(settings.savePriceCurrency)` handler.

The scope boundary is deliberate and narrow: this story owns the **picker and the
persisted preference**, not the conversion math. The balance epic
([EPIC-7](EPIC-7.md)) reads the selected currency and computes/formats the
converted amounts on every balance and price surface — that is why this is a
small story (a settings selector + a persisted preference), not a large one.
Conversion rates themselves are sourced through the cache/proxy layer
([NFR-21](../../PRD.md#non-functional-requirements)) consumed downstream.

Materializes [FR-67](../../PRD.md#functional-requirements). Lives in the Settings surface owned by
[US-6.4](US-6.4-settings-management.md). This story is **retroactive** — the
capability already ships in the product; `commit` / `version_shipped` are
backfilled during version reconciliation.

## Acceptance criteria

- [ ] **AC-1** — **Given** the Settings currency entry, **When** the user selects
  a supported `CurrencyType`, **Then** the choice is persisted via
  `pri(settings.savePriceCurrency)` and survives reload / app restart.
- [ ] **AC-2** — **Given** a selected display currency, **When** balances and
  prices render, **Then** they display in the selected currency's symbol/format
  across every surface (the conversion itself is performed by EPIC-7 reading this
  preference).
- [ ] **AC-3** — **Given** no prior selection, **When** the wallet first runs,
  **Then** the display currency defaults to USD (`DEFAULT_CURRENCY`).
- [ ] **AC-4** — **Given** the selection is changed, **When** the new currency is
  applied, **Then** all open balance/price surfaces re-render in the new currency
  without requiring a manual refresh.

## Tasks

- [ ] **TASK-6.5.1** — Currency-selector UI in Settings over the supported
  `CurrencyType` set (AC: 1, 3)
- [ ] **TASK-6.5.2** — Persist the choice via `pri(settings.savePriceCurrency)`
  on the background `SettingService` (AC: 1, 4)
  - [ ] Confirm `DEFAULT_CURRENCY = 'usd'` as the fallback default.
- [ ] **TASK-6.5.3** — Ensure balance/price surfaces re-render reactively on
  change (the preference is the source of truth EPIC-7 reads) (AC: 2, 4)

## Dev notes

### Architecture constraints

- [AD-03](../../ARCHITECTURE.md#architecture-decisions) — the currency preference
  is written via `pri(settings.savePriceCurrency)` to the background; the UI does
  not hold authoritative preference state.
- This story does NOT introduce new AD entries.

### Cross-story dependencies

- Builds on [US-6.4](US-6.4-settings-management.md) — the currency selector lives
  in the Settings surface that story owns.
- Required by [EPIC-7](EPIC-7.md) balance stories — they read the persisted
  `CurrencyType` to convert and format displayed amounts. This story does NOT
  perform the conversion.

### What we explicitly did NOT do

- No currency *conversion* math or rate fetching — owned by EPIC-7 (which reads
  this preference) and the cache/proxy layer (NFR-21). This story only persists
  the choice.

### References

- [Source: PRD FR-67](../../PRD.md#functional-requirements) — select display fiat currency for balances and prices
- [Source: ARCHITECTURE AD-03](../../ARCHITECTURE.md#architecture-decisions) — background / UI message-bus isolation
- [Source: code] `CurrencyType` + `RequestChangePriceCurrency` + `pri(settings.savePriceCurrency)` in `packages/extension-base/src/background/KoniTypes.ts`; `DEFAULT_CURRENCY` in `packages/extension-base/src/services/setting-service/constants.ts`

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: Settings → select a currency → persists across reload (`pri(settings.savePriceCurrency)` fires) |
| AC-2 | Manual: balances/prices render in the selected currency's symbol/format |
| AC-3 | Fresh install → display currency defaults to USD (`DEFAULT_CURRENCY = 'usd'`) |
| AC-4 | Manual: change currency with balance surfaces open → they re-render without manual refresh |

## Changelog entry

### Added
- Display fiat-currency selector in Settings: pick the currency used to format balances and prices; persisted via `pri(settings.savePriceCurrency)`, defaults to USD.

**Commit**:

## Implementation notes

_Retroactive story — capability already shipped. Fill `commit`, `version_shipped`
and any implementation caveats during version reconciliation._

## Cross-references

- [PRD FR-67](../../PRD.md#functional-requirements)
- [Epic EPIC-6](../epics/EPIC-6.md)
- [US-6.4](US-6.4-settings-management.md)
- [EPIC-7](../epics/EPIC-7.md)
