---
id: US-6.12
title: "Early UX iteration (pre-design-system)"
epic: EPIC-6
status: done
priority: P3
points: 2
sprint: sprint-2023-M08
version_shipped: 1.1.10
prd_ref: []
assignee:
commit:
created: 2026-07-23
updated: 2026-07-23
---

## Goal

Hold the UX work that happened **before the wallet had a design system** — the years when improving
the interface meant a ticket called *"some bugs & feedback to improve UX-UI"* rather than a component
in a kit.

## Status

> **✅ done — all 14 rows below are settled**: 12 delivered, 2 closed without shipping. It carries
> **no FR**: FR-63 … FR-67 are the surfaces themselves, owned by
> [US-6.1](US-6.1-dark-only-responsive-popup-and-expand-view.md) …
> [US-6.5](US-6.5-display-fiat-currency-selection.md).
>
> **`version_shipped: 1.1.10` is a representative anchor, not the whole set** — the most recent
> constituent with a provable release. Most of this story predates 1.0.

## Scope

Created under [AGENTS.md](../../../AGENTS.md) rule 9 during the 2026-07-23 fold. These fourteen are
general UX iteration with no single owning capability — they touch permissions, access, grammar,
lock, data fetching and the first MVP. Distributing them across US-6.1 … US-6.5 would put each in a
story whose acceptance criteria it does not test.

## Incremental work, fixes & chores

**14 tracker issues** — 10 with a release, 2 delivered with no line naming them, 2 closed without
shipping.

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 0.3.4 | [#91](https://github.com/Koniverse/SubWallet-Extension/issues/91) | Custom Access screen improvements | ✅ done |
| 0.3.4 | [#156](https://github.com/Koniverse/SubWallet-Extension/issues/156) | Grammar error on button | ✅ done |
| 0.3.4 | [#166](https://github.com/Koniverse/SubWallet-Extension/issues/166) | Typo on button | ✅ done |
| 0.4.7 | [#377](https://github.com/Koniverse/SubWallet-Extension/issues/377) | Improve request permission screen | ✅ done |
| 0.5.3 | [#255](https://github.com/Koniverse/SubWallet-Extension/issues/255) | Improve data fetching for better performance and UX | ✅ done |
| 0.5.6 | [#340](https://github.com/Koniverse/SubWallet-Extension/issues/340) | Some bugs & feedback to improve UX-UI | ✅ done |
| 0.6.9 | [#777](https://github.com/Koniverse/SubWallet-Extension/issues/777) | Remove _NftItem interface in extension UI | ✅ done |
| 0.7.5 | [#912](https://github.com/Koniverse/SubWallet-Extension/issues/912) | Turn off background in case extension reloaded and popup never opened | ✅ done |
| 1.0.5 | [#19](https://github.com/Koniverse/SubWallet-Extension/issues/19) | Donate button for charity program | ✅ done |
| 1.1.10 | [#1684](https://github.com/Koniverse/SubWallet-Extension/issues/1684) | Extension - Improve lock UX | ✅ done |
| — | [#5](https://github.com/Koniverse/SubWallet-Extension/issues/5) | Improve Polkadot JS Extension UX/UI for more friendly | ✅ done |
| — | [#8](https://github.com/Koniverse/SubWallet-Extension/issues/8) | Some tasks about UX improvement after building the first MVP version | ✅ done |
| — | [#577](https://github.com/Koniverse/SubWallet-Extension/issues/577) | Some UI bugs & feedback to improve UX-UI (v2) | ⏸ deprecated |
| — | [#2525](https://github.com/Koniverse/SubWallet-Extension/issues/2525) | Optimize UX/UI round 1 | ⏸ deprecated |

> **#5 and #8 are issue numbers five and eight.** *"Improve Polkadot JS Extension UX/UI for more
> friendly"* and *"Some tasks about UX improvement after building the first MVP version"* — the
> wallet began as a fork whose first two UX tickets were *make the inherited interface better*. The
> 1.0.2 rewrite in [US-6.7](US-6.7-the-1-0-2-ui-upgrade-programme.md) is the eventual answer to
> issue #5.
>
> **Three rows are the same ticket, three times, and one of them was abandoned**: #340 (0.5.6,
> *"some bugs & feedback to improve UX-UI"*), #577 (*"…(v2)"*, closed `NOT_PLANNED`), #2525
> (*"optimize UX/UI round 1"*, closed `NOT_PLANNED`). A ticket with no scope cannot be finished, so
> two of the three were eventually dropped — and the same instinct is alive today in
> [US-6.6](US-6.6-design-system-and-ux-hardening.md)'s three UX-backlog issues.
>
> **#19's title in the generated ledger was not its title.** The ledger recorded it as *"Integrate
> Darwinia 2"*, taken from a CHANGELOG bullet; the tracker says **"Donate button for charity
> program"**. It is a UI element, which is why it is here at all — under the ledger's title it looked
> mis-filed.
>
> **#777 is a UI ticket about deleting a type.** *"Remove `_NftItem` interface in extension UI"*
> (0.6.9) — before the design system there was no boundary between the interface and the data
> shapes behind it, and cleaning one meant filing against the other.

## Acceptance criteria

- [x] **AC-1** — All 14 issues above are closed on the tracker, each carrying the release the evidence supports or `—` where none exists, and each `⏸ deprecated` row is closed `NOT_PLANNED`/`DUPLICATE` or carries board `Status = Cancel`.
- [x] **AC-2** — #19's tracker title is *"Donate button for charity program"*, not the *"Integrate Darwinia 2"* the generated ledger carried.

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | `gh issue view <N>` for each row → CLOSED · board `Status` per [rule 12](../../../AGENTS.md) |
| AC-2 | `gh issue view 19 --json title` → `Donate button for charity program` |

## Cross-references

- [Epic EPIC-6](../epics/EPIC-6.md) · [US-6.7](US-6.7-the-1-0-2-ui-upgrade-programme.md) · [US-6.6](US-6.6-design-system-and-ux-hardening.md) · [consolidation note](../../notes/2026-07-23.md#d-epic-26-maintenance--ui--ux-merged-into-epic-6)
