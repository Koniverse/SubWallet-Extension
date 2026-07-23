---
id: US-6.9
title: "Phishing & security surfaces"
epic: EPIC-6
status: done
priority: P3
points: 2
sprint: sprint-2025-M09
version_shipped: 1.3.56
prd_ref: []
assignee:
commit:
created: 2026-07-23
updated: 2026-07-23
---

## Goal

Render the **warning a user is supposed to stop at**. The detection is
[EPIC-5](../epics/EPIC-5.md)'s; the screen that has to be believed, and the escape hatch on it, are
this epic's.

## Status

> **✅ done — all 4 rows below are settled**, 2 with a release and 2 delivered with no line naming
> them. It carries **no FR** — phishing protection is
> [FR-53](../../PRD.md#functional-requirements), owned by
> [US-5.1](US-5.1-phishing-site-and-address-protection.md).

## Scope

Folded in from the former one-issue-per-story maintenance ledger on 2026-07-23. Its own story
because the boundary is real and worth stating: **EPIC-5 decides a site is dangerous, EPIC-6 decides
what the user sees when it does.** The phishing *screen* was also rebuilt as part of the 1.0.2
programme ([#1004](https://github.com/Koniverse/SubWallet-Extension/issues/1004), in
[US-6.7](US-6.7-the-1-0-2-ui-upgrade-programme.md)).

## Incremental work, fixes & chores

**4 tracker issues** — 2 with a release, 2 delivered with no line naming them.

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 1.0.6 | [#1380](https://github.com/Koniverse/SubWallet-Extension/issues/1380) | Add the option "I trust this site" on the phishing page screen | ✅ done |
| 1.3.56 | [#4617](https://github.com/Koniverse/SubWallet-Extension/issues/4617) | Extension - Improve UX for the "Advanced phishing detection" feature | ✅ done |
| — | [#592](https://github.com/Koniverse/SubWallet-Extension/issues/592) | Improve UI to warn users about phishing websites | ✅ done |
| — | [#814](https://github.com/Koniverse/SubWallet-Extension/issues/814) | Improve UI when users access phishing websites (listed on Polkadot JS Phishing list) | ✅ done |

> **#1380 is the row that admits the warning can be wrong.** *"Add the option 'I trust this site' on
> the phishing page screen"* (1.0.6) — a false positive on a blocklist the wallet does not maintain
> would otherwise lock a user out of their own dApp. A security surface with no override is a
> support ticket.
>
> **The list is somebody else's.** #814 names it: *"listed on Polkadot JS Phishing list"*. What this
> story owns is presentation of a third-party verdict, which is why the escape hatch matters.
>
> **#4617 is nine releases of distance from #592.** The same surface — warn the user — asked again
> in 1.3.56 as *"improve UX for the Advanced phishing detection feature"*, after the detection got
> better and the screen had to say something more specific than *this site is dangerous*.

## Acceptance criteria

- [x] **AC-1** — All 4 issues above are closed `COMPLETED` on the tracker with board `Status = Done`, each carrying the release the evidence supports or `—` where none exists.

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | `gh issue view 592` `814` `1380` `4617` → CLOSED / COMPLETED · board `Status` per [rule 12](../../../AGENTS.md) |

## Cross-references

- [Epic EPIC-6](../epics/EPIC-6.md) · [US-5.1](US-5.1-phishing-site-and-address-protection.md) · [US-6.7](US-6.7-the-1-0-2-ui-upgrade-programme.md) · [consolidation note](../../notes/2026-07-23.md#d-epic-26-maintenance--ui--ux-merged-into-epic-6)
