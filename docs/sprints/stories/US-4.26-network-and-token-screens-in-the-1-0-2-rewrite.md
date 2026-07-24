---
id: US-4.26
title: "Network & token screens in the 1.0.2 UI rewrite"
epic: EPIC-4
status: done
priority: P3
points: 1
sprint: sprint-2023-M04
version_shipped: 1.0.2
prd_ref: []
assignee:
commit:
created: 2026-07-24
updated: 2026-07-24
---

## Goal

Hold this epic's share of the **1.0.2 rewrite** — the Settings/Networks screen, the token list and
config-token screens, and the network-logo/token-logo surface, re-implemented when the whole
interface was replaced.

## Status

> **✅ done — all 9 rows below are settled and shipped in 1.0.2.** It carries **no FR**: network and
> token management are FR-31 … FR-43; what is recorded here is the rewrite.

## Scope

Folded in from the former one-issue-per-story maintenance ledger on 2026-07-24.

**This is the fifth area the 1.0.2 rewrite turned up in.**
[US-6.7](US-6.7-the-1-0-2-ui-upgrade-programme.md) holds 60 rows from the UI ledger,
[US-8.17](US-8.17-transaction-screens-in-the-1-0-2-rewrite.md) 11 from transactions,
[US-10.15](US-10.15-dapp-screens-in-the-1-0-2-rewrite.md) 3 from dApp,
[US-3.10](US-3.10-account-screens-in-the-1-0-2-rewrite.md) 8 from account, and these 9 sat in the
network & token ledger — same `Upgrade UI - ` title prefix, same programme with no parent issue.
**The rewrite's provable size is now 91 rows across five areas**, and the generator saw it in none.

## Incremental work, fixes & chores

**9 tracker issues**, all shipped in 1.0.2 (4 with a line naming them, 5 delivered without).

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 1.0.2 | [#1013](https://github.com/Koniverse/SubWallet-Extension/issues/1013) | Upgrade UI - Screen Settings / Networks | ✅ done |
| 1.0.2 | [#1016](https://github.com/Koniverse/SubWallet-Extension/issues/1016) | Upgrade UI - Screen Token List | ✅ done |
| 1.0.2 | [#1057](https://github.com/Koniverse/SubWallet-Extension/issues/1057) | Upgrade UI - Update Network's logo & Token's logo | ✅ done |
| 1.0.2 | [#1161](https://github.com/Koniverse/SubWallet-Extension/issues/1161) | Upgrade UI - Do not update the Available balance of the token when turning on token | ✅ done |
| — | [#1100](https://github.com/Koniverse/SubWallet-Extension/issues/1100) | Upgrade UI - An error occurs when turn on Kylin network | ✅ done |
| — | [#1138](https://github.com/Koniverse/SubWallet-Extension/issues/1138) | Upgrade UI - Improve UI on the Config Token screen | ✅ done |
| — | [#1143](https://github.com/Koniverse/SubWallet-Extension/issues/1143) | Upgrade UI - Show incorrect balance on some tokens | ✅ done |
| — | [#1145](https://github.com/Koniverse/SubWallet-Extension/issues/1145) | Upgrade UI - Still allow the user to delete the native token of the custom network | ✅ done |
| — | [#1188](https://github.com/Koniverse/SubWallet-Extension/issues/1188) | Upgrade UI - Do not automatically switch network | ✅ done |

> **Three rows are the screens themselves** — Settings/Networks (#1013), the token list (#1016) and
> network/token logos (#1057) — redrawn as a set. The other six are the behaviour the redraw had to
> preserve: balances on some tokens (#1143, #1161), the native-token delete guard (#1145), automatic
> network switching (#1188), the config-token screen (#1138) and a Kylin-network turn-on error
> (#1100). The chain and token *model* was untouched; only the screens over it were replaced.

## Acceptance criteria

- [x] **AC-1** — All 9 issues above are closed `COMPLETED` and shipped in 1.0.2.
- [x] **AC-2** — No issue here is also a row in US-6.7, US-8.17, US-10.15 or US-3.10: the five halves of the programme partition its issues.

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | `gh issue view 1013` … `1188` → CLOSED / COMPLETED |
| AC-2 | `comm -12 <(grep -o "issues/[0-9]*" docs/sprints/stories/US-4.26-*.md \| sort -u) <(cat docs/sprints/stories/US-6.7-*.md docs/sprints/stories/US-8.17-*.md docs/sprints/stories/US-10.15-*.md docs/sprints/stories/US-3.10-*.md \| grep -o "issues/[0-9]*" \| sort -u)` → empty |

## Cross-references

- [Epic EPIC-4](../epics/EPIC-4.md) · [US-6.7](US-6.7-the-1-0-2-ui-upgrade-programme.md) · [US-8.17](US-8.17-transaction-screens-in-the-1-0-2-rewrite.md) · [US-10.15](US-10.15-dapp-screens-in-the-1-0-2-rewrite.md) · [US-3.10](US-3.10-account-screens-in-the-1-0-2-rewrite.md) · [consolidation note](../../notes/2026-07-24.md#d-epic-24-maintenance--network--token-merged-into-epic-4)
