---
id: US-5.12
title: "Earlier security audit rounds (2022–2025)"
epic: EPIC-5
status: done
priority: P3
points: 1
sprint: sprint-2023-M08
version_shipped: 1.3.28
prd_ref: []
assignee:
commit:
created: 2026-07-22
updated: 2026-07-22
---

## Goal

Hold the security audit and hardening rounds that **closed before the current remediation started**
— the first external audit, a GitHub security-tab sweep, the webpack environment hardening for the
injected scripts, and a settings-reset defect on upgrade. Four issues, all settled.

## Status

> **✅ done — all four rows below are settled.** It carries **no FR**: NFR-16 / NFR-25 / FR-52 are
> defended by [US-5.10](US-5.10-verichains-audit-remediation-hardening.md), which is still open.
> `version_shipped: 1.3.28` is a **representative anchor** — the most recent constituent with a
> provable release; two of the four carry none.

## Scope

Created under [AGENTS.md](../../../AGENTS.md) rule 9. These four sat in US-5.10's table beside the
five **open** findings its acceptance criteria name, one for one. No AC of that story names any of
these four — they are prehistory, and a table holding both states is the mix rule 9 forbids.

**The table follows the acceptance criteria.** US-5.10's ACs name #4471, #4929, #4959, #4889 and
#4998, so those stay there; these leave.

## Incremental work, fixes & chores

| Shipped | Issue | Title | Status |
|---|---|---|---|
| — | [#31](https://github.com/Koniverse/SubWallet-Extension/issues/31) | External Security Audit | ✅ done |
| — | [#1553](https://github.com/Koniverse/SubWallet-Extension/issues/1553) | Recheck problems in the security tab of GitHub | ✅ done |
| 1.1.9 | [#1823](https://github.com/Koniverse/SubWallet-Extension/issues/1823) | Update the webpack config environment for `page.js` and `content.js` to improve security | ✅ done |
| 1.3.28 | [#3741](https://github.com/Koniverse/SubWallet-Extension/issues/3741) | Fixed bug: reset Auto-lock, Advanced phishing detection and Camera on version upgrade | ✅ done |

> **#1823 and #4929 are the same defect class, three years apart.** #1823 (2023) strips build
> variables out of the injected scripts; #4929 (2026, open in
> [US-5.10](US-5.10-verichains-audit-remediation-hardening.md)) is the secret-in-the-bundle problem
> re-opened. That is why the two stories cross-reference each other.
>
> **#3741 loses three different settings on upgrade** — auto-lock ([US-5.6](US-5.6-auto-lock-timer-and-unlock-type.md)),
> phishing ([US-5.1](US-5.1-phishing-site-and-address-protection.md)) and camera
> ([US-5.7](US-5.7-camera-access-and-one-sign-toggles.md)) — so no feature story owns it; the
> settings-persistence guarantee does.

## Acceptance criteria

- [x] **AC-1** — All four issues above are closed on the tracker with board `Status = Done`, and each carries the release the evidence supports or `—` where none exists.

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | `gh issue view 31` `1553` `1823` `3741` → all CLOSED · board `Status` per [rule 12](../../../AGENTS.md) |

## Cross-references

- [Epic EPIC-5](../epics/EPIC-5.md) · [US-5.10](US-5.10-verichains-audit-remediation-hardening.md) · [consolidation note](../../notes/2026-07-22.md#h-scope-that-never-reached-a-table)
