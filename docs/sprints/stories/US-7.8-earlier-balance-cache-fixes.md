---
id: US-7.8
title: "Earlier balance-cache fixes (2022–2023)"
epic: EPIC-7
status: done
priority: P3
points: 1
sprint: sprint-2023-M06
version_shipped: 1.1.29
prd_ref: []
assignee:
commit:
created: 2026-07-22
updated: 2026-07-22
---

## Goal

Hold the balance-cache work that **shipped before the current hardening scope was written** — the
caching defect that started it, the reload control, and the WebApp hide-balance leak. Three issues,
all settled.

## Status

> **✅ done — all three rows below are settled.** It carries **no FR**: the cache-freshness invariant
> is defended by [US-7.7](US-7.7-balance-cache-invalidation-hardening.md), whose own three issues
> are still open. `version_shipped: 1.1.29` is a **representative anchor** — the one constituent
> with a provable release.

## Scope

Created under [AGENTS.md](../../../AGENTS.md) rule 9. These three sat in US-7.7's table beside the
three **open** issues its acceptance criteria name one for one. **The table follows the acceptance
criteria** — whichever side the ACs name is the side that stays, so the prehistory leaves.

## Incremental work, fixes & chores

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 1.1.29 | [#2381](https://github.com/Koniverse/SubWallet-Extension/issues/2381) | Add the reload-balance feature | ✅ done |
| — | [#481](https://github.com/Koniverse/SubWallet-Extension/issues/481) | Wrong balance display due to data caching | ✅ done |
| — | [#1690](https://github.com/Koniverse/SubWallet-Extension/issues/1690) | WebApp — still shows the balance when the user selects hide balance | ✅ done |

> **#481 is the defect the whole hardening story exists for**, four years early: *"Wrong balance
> display due to data caching"*. The invariant it names — a cached balance must not outlive the
> thing that invalidates it — is what
> [US-7.7](US-7.7-balance-cache-invalidation-hardening.md)'s acceptance criteria still assert.
>
> **#2381 is the answer to #2194**, *"Add a refresh button"*, which closed `NOT_PLANNED` in
> [US-7.1](US-7.1-aggregate-portfolio-across-accounts-and-chains.md). A reload control shipped; a
> refresh *button* did not.

## Acceptance criteria

- [x] **AC-1** — All three issues above are closed on the tracker with board `Status = Done`, and each carries the release the evidence supports or `—` where none exists.

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | `gh issue view 2381` `481` `1690` → all CLOSED · board `Status` per [rule 12](../../../AGENTS.md) |

## Cross-references

- [Epic EPIC-7](../epics/EPIC-7.md) · [US-7.7](US-7.7-balance-cache-invalidation-hardening.md) · [US-7.1](US-7.1-aggregate-portfolio-across-accounts-and-chains.md) · [consolidation note](../../notes/2026-07-22.md#l-epic-27-maintenance--portfolio-merged-into-epic-7)
