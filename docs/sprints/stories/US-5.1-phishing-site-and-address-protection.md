---
id: US-5.1
title: "Phishing site blocking (@polkadot/phishing denylist)"
epic: EPIC-5
status: done
priority: P0
points: 5
sprint: sprint-2022-M01
version_shipped: 0.2.1
prd_ref: [FR-52]
arch_ref: [AD-19]
depends_on:
assignee: Tbaut
commit: ae9227ef6dbded627b2cc9d40d2e4609d0f9ad67
created: 2026-06-12
updated: 2026-07-14
external_deps: [chainpatrol_api, polkadot_phishing_list]
---

## Goal

A user who opens a malicious dApp is stopped before any key operation — a
full-screen blocking warning replaces the page — so that they cannot connect a
wallet to a known phishing site.

> **Scope narrowed 2026-07-14 — the address arm was never built** ([CONTEXT D107](../../CONTEXT.md)).
> This story used to claim *"site **& address** protection"* and ticked an AC for screening
> flagged recipient addresses. The repository imports exactly one symbol from
> `@polkadot/phishing` — **`checkIfDenied`**, an *origin* check
> ([Tabs.ts:38](../../../packages/extension-base/src/koni/background/handlers/Tabs.ts)).
> **No address is screened anywhere on the transfer path.** Address screening is
> [FR-62](../../PRD.md#functional-requirements) / [US-5.9](US-5.9-anti-scam-address-screening.md),
> and it is honestly `📋 planned`.

## Status

> **✅ done — shipped in 0.2.1.** All 3 acceptance criteria are ticked, and the 8 rows below are settled (8 shipped).
> **The table is history, not a work list** — a `done` story may not carry an open row ([AGENTS.md](../../../AGENTS.md) rule 9).

## Background

Phishing is the highest-frequency attack on wallet users and it lands *outside* the key
boundary — the user willingly approves a connection or transfer to an attacker-controlled site.
Defence is a screen, not a cryptographic control.

**What is live: the `@polkadot/phishing` denylist.** `Tabs.checkPhishing` calls `checkIfDenied`
against the visited **origin**; a match redirects to the full-screen block page
(`koni/background/handlers/Tabs.ts`). The list auto-updates online
([NFR-4](../../PRD.md#non-functional-requirements)), so a newly flagged site is covered without a
release. The check is stateless with respect to account presence, and must be tested against
high-traffic legitimate sites — a false positive trains users to click through warnings
([§24](../../LESSONS.md)).

**What is not live: ChainPatrol advanced detection.** The parts exist — an `enableChainPatrol`
setting, a `MigrateChainPatrol` job, and `chainPatrolCheckUrl` — but since **1.3.69** the lookup
inside `checkPhishing` is commented out *and the Settings toggle is hidden*
(`showChainPatrol = false`), because it flagged YouTube, Facebook and other legitimate sites.
The commit calls it **temporary**; re-enabling it is forward work owned by
[US-5.10](US-5.10-verichains-audit-remediation-hardening.md) AC-2, gated on a false-positive
regression suite *and* on routing the call through the AD-19 backend proxy — today
`chainPatrolCheckUrl` would hit `app.chainpatrol.io` straight from the client, with the key in
the bundle ([#4929](https://github.com/Koniverse/SubWallet-Extension/issues/4929)).

Materializes [FR-52](../../PRD.md#functional-requirements) — **origin screening only**; FR-52's
text was narrowed to match on 2026-07-14 ([D107](../../CONTEXT.md)). **Retroactive** and
**inherited** (see Implementation notes).

## Acceptance criteria

- [x] **AC-1** — **Given** the user navigates to an origin on the
  `@polkadot/phishing` list, **When** the page loads or requests a wallet
  connection, **Then** a full-screen blocking warning is shown and the wallet
  refuses to connect. *(Shipped via `checkIfDenied`. The ChainPatrol feed is NOT
  consulted on this path today — its lookup is TODO-disabled; re-enabling it is
  forward work owned by [US-5.10](US-5.10-verichains-audit-remediation-hardening.md) AC-2.)*
- [x] **AC-3** — **Given** the `@polkadot/phishing` list updates online, **When** a
  newly flagged site is visited, **Then** it is blocked without an extension release
  (NFR-4).
- [x] **AC-5** — **Given** a high-traffic *legitimate* site (e.g. YouTube,
  Facebook), **When** it is visited, **Then** it is NOT falsely blocked
  (LESSONS §24). *(True today — **but unguarded.** It holds because ChainPatrol,
  the thing that flagged YouTube, is switched off. **There is no phishing test in
  this repo**; `rg -l phishing packages/*/src --type-add 'spec:*.spec.ts' -tspec`
  returns nothing. The regression suite this AC deserves is owed by
  [US-5.10](US-5.10-verichains-audit-remediation-hardening.md) AC-2, which cannot
  re-enable ChainPatrol without one.)*

> **AC-2 and AC-4 were removed on 2026-07-14 — they were ticked and false**
> ([CONTEXT D107](../../CONTEXT.md)). AC-2 claimed flagged **recipient addresses** are
> blocked on the transfer path; nothing screens an address anywhere. AC-4 claimed **no
> provider API key is exposed in the client**; `chainPatrolCheckUrl` calls
> `app.chainpatrol.io` **directly from the extension** — there is no proxy. Both were
> ticked by the batch backfill that flipped this story to `done`, the same sweep whose
> earlier correction removed AC-6 and stopped there. **Their numbers are not reused**
> (rule 1); their scope lives in [FR-62](../../PRD.md#functional-requirements) /
> [US-5.9](US-5.9-anti-scam-address-screening.md) and
> [US-5.10](US-5.10-verichains-audit-remediation-hardening.md) AC-2 respectively.

## Tasks

- [x] **TASK-5.1.1** — Origin screening against `@polkadot/phishing` (AC: 1) — `checkIfDenied`, block-page on match
- [x] **TASK-5.1.3** — Online auto-update of the phishing list (AC: 3) — bundled list + online refresh

> **TASK-5.1.2, TASK-5.1.4 and TASK-5.1.5 were removed on 2026-07-14 — all three were
> ticked and none was done.** 5.1.2 was recipient-address screening (no such code). 5.1.4
> was proxy fail-safe + "no key in bundle" (no proxy). 5.1.5 claimed *"false-positive
> regression coverage"* — **there is no phishing test in this repo at all.** TASK-5.1.1's
> sub-bullet *"route ChainPatrol lookups through the backend proxy"* went with them, for
> the same reason.

## Dev notes

### Architecture constraints

- [AD-19](../../ARCHITECTURE.md#architecture-decisions) — ChainPatrol is a keyed provider; calls go through the SubWallet backend proxy so the key is never in the shipped bundle.
- Phishing detection must be **stateless w.r.t. account presence** — the check runs whether or not a wallet is unlocked ([LESSONS §24](../../LESSONS.md)).
- This story does NOT introduce new AD entries.

### Cross-story dependencies

- Sibling [US-5.8](US-5.8-blockaid-transaction-risk-scanning.md) and [US-5.9](US-5.9-anti-scam-address-screening.md) — all three are inbound-threat screens routed through the backend proxy (AD-19); coordinate the shared proxy-client and fail-safe-degradation pattern.
- Consumed by dApp-connection ([EPIC-10](../epics/EPIC-10.md)) — the connect flow checks the origin block before authorization.

### What we explicitly did NOT do

- No per-user allowlist override UI for blocked origins — blocking is global. Trigger to revisit: support load from false positives on a vetted site.

### References

- [Source: PRD FR-52](../../PRD.md#functional-requirements) — phishing protection (@polkadot/phishing shipped; ChainPatrol partial/disabled)
- [Source: PRD NFR-4](../../PRD.md#non-functional-requirements) — phishing-list online auto-update
- [Source: PRD NFR-16](../../PRD.md#non-functional-requirements) — third-party API-key protection via backend proxy
- [Source: ARCHITECTURE AD-19](../../ARCHITECTURE.md#architecture-decisions) — backend proxy for third-party API keys
- [Source: LESSONS §24](../../LESSONS.md) — stateless phishing detection + high-traffic-site testing
- [Code: `Tabs.checkPhishing`](../../../packages/extension-base/src/koni/background/handlers/Tabs.ts) — `checkIfDenied` (shipped) + TODO-disabled `chainPatrolCheckUrl` block
- [Issue #4929](https://github.com/Koniverse/SubWallet-Extension/issues/4929) — ChainPatrol API key should not ship in the client bundle (route via backend proxy, AD-19)

## Verification commands

| AC | Command |
|---|---|
| AC-1 | `grep -n checkIfDenied packages/extension-base/src/koni/background/handlers/Tabs.ts` → the origin check. Manual: visit a flagged test origin → block screen, connect refused |
| AC-3 | Manual: add an origin to the `@polkadot/phishing` list → visit without rebuild → blocked |
| AC-5 | **No command — this is the point.** The property holds by observation (ChainPatrol is off), not by a test. `grep -rl phishing packages/*/src --include=*.spec.ts` returns nothing. Writing that command is [US-5.10](US-5.10-verichains-audit-remediation-hardening.md) AC-2's job. |

## Changelog entry

### Added
- Phishing protection: full-screen blocking warning for origins flagged by the
  `@polkadot/phishing` community list, with online list auto-update.

### Known limitations / forward work
- **ChainPatrol advanced detection is currently disabled** behind a TODO in
  `Tabs.checkPhishing` because it produced false positives on high-traffic
  legitimate sites (YouTube, Facebook). The setting, migration, and
  `chainPatrolCheckUrl` helper exist, but the lookup is commented out and not on
  the live phishing path. Re-enabling it (false-positive-free) and routing it
  through the AD-19 backend proxy so no key ships in the bundle
  ([#4929](https://github.com/Koniverse/SubWallet-Extension/issues/4929)) is
  forward work.

**Commit**:

## Implementation notes

**Inherited from polkadot-js — not built by SubWallet** ([D105](../../CONTEXT.md)). The fork
brought upstream's git history, tags and CHANGELOG with it, so this section quotes **two
products' version lines**:

| | Release | Date | Author | Commit |
| --- | --- | --- | --- | --- |
| Written upstream | polkadot-js **0.35.1** | 2020-11-30 | `Tbaut` | `ae9227ef6d` |
| Reached a SubWallet user | **0.2.1** — SubWallet's first release | 2022-02-10 | — | — |

> **Read the date, not the number.** Six version numbers exist in *both* lines
> ([§66](../../LESSONS.md)); the date never collides. `version_shipped` may name **only**
> SubWallet's line — it once carried `0.35.1`, which reads as *after* `0.8.1` and implied the
> capability arrived in 2023 when the wallet had it on day one ([D101](../../CONTEXT.md)).
> `check-ids` now rejects a `version_shipped` that is not a `(Koni)` CHANGELOG row. Do **not**
> rewrite the upstream numbers to match ours: they quote upstream's CHANGELOG and tags, and
> editing them makes the citation unverifiable ([D106](../../CONTEXT.md)).
>
> **Anchor on `v0.2.5`, never `v0.2.1`** — SubWallet's 0.2.1 is untagged, and colliding tags
> point upstream (`v0.7.1` is polkadot-js's, 2019). `assignee` stays `Tbaut`: they wrote it.

**Evidence.** CHANGELOG `## [0.35.1] — 2020-11-30`: *"Add phishing site detection and redirection
(Thanks to Tbaut)"* — the earliest bullet delivering the full-screen block. Commit `ae9227ef6d`
(2020-10-13, PR #488) is an ancestor of `v0.35.1` and absent from `v0.34.1`; verified contained in
SubWallet's earliest tag `v0.2.5` by `git merge-base --is-ancestor`. Traced by
[US-21.2](US-21.2-history-backfill.md) (run `wf_6b56f4cd-d08`, confidence **medium**: the upstream
title enumerates *"site & address"* but only the site arm ever shipped here).

**Two guards, both load-bearing:**

- **Do not backfill the ChainPatrol arm as done.** Its lookup on the live path is TODO-disabled.
  Re-enable only after the false-positive suite passes *and* the call moves behind the AD-19
  proxy — forward scope owned by [US-5.10](US-5.10-verichains-audit-remediation-hardening.md)
  AC-2 ([#4929](https://github.com/Koniverse/SubWallet-Extension/issues/4929)), so this story
  carries no forward AC.
- **AC-6 was removed (2026-07-13).** The batch backfill ticked every open AC when it flipped this
  story to `done`, including a *forward* AC the author had deliberately left unticked. Its scope
  lives in US-5.10.

## Incremental work, fixes & chores

The requirement above is the **inherited** polkadot-js denylist check (0.2.1, `sprint-2022-M01`
— [D105](../../CONTEXT.md#d105-the-fork-boundary-is-its-own-window--inherited-work-does-not-go-on-this-teams-board)).
Everything SubWallet itself built on top of it is below: **8 tracker issues** — the phishing
database, the ChainPatrol integration and its fixes, and the eventual decision to turn the
advanced detector off. Folded in from the former one-issue-per-story maintenance ledger
(2026-07-21); chronological by shipped release, `—` where no CHANGELOG line proves one.

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 0.3.4 | [#157](https://github.com/Koniverse/SubWallet-Extension/issues/157) | Leverage phishing website & addresses database to protect users | ✅ done |
| 0.5.6 | [#561](https://github.com/Koniverse/SubWallet-Extension/issues/561) | Update `@polkadot/phishing` | ✅ done |
| — | [#1189](https://github.com/Koniverse/SubWallet-Extension/issues/1189) | Review & add phishing detection using the ChainPatrol API | ✅ done |
| 1.0.5 | [#1226](https://github.com/Koniverse/SubWallet-Extension/issues/1226) | Detect phishing page with ChainPatrol | ✅ done |
| — | [#1274](https://github.com/Koniverse/SubWallet-Extension/issues/1274) | Auto-update from phishing list | ✅ done |
| — | [#1422](https://github.com/Koniverse/SubWallet-Extension/issues/1422) | Do not detect phishing page with ChainPatrol on Firefox | ✅ done |
| 1.1.27 | [#2372](https://github.com/Koniverse/SubWallet-Extension/issues/2372) | Fixed bug phishing detection | ✅ done |
| 1.3.69 | [#4891](https://github.com/Koniverse/SubWallet-Extension/issues/4891) | Turn off "Advanced phishing detection" feature | ✅ done |

> **7 more phishing issues sit in ledgers not yet folded** — titles matching "phishing" in the
> Account and UI/UX ledgers (e.g. *"Do not detect phishing page in case have no account"*,
> *"Improve UI to warn users about phishing websites"*). The 8 above are only what the **security**
> ledger held; this capability's history is longer than this table until the rest are folded.

> **#4891 paused the ChainPatrol arm — it did not close it.** Commit `5b377952ca` (1.3.69)
> comments out the lookup and hides the Settings toggle, and its own subject says
> *"**temporarily** disable"*. Re-enabling is [US-5.10](US-5.10-verichains-audit-remediation-hardening.md)
> AC-2. Note the commit is tagged **`[Issue-4889]`**, a sibling issue — the delivering commit
> names a different issue than the one it satisfies ([D106](../../CONTEXT.md), content over tag).

## Cross-references

- [PRD FR-52](../../PRD.md#functional-requirements)
- [Epic EPIC-5](../epics/EPIC-5.md)
- [LESSONS §24](../../LESSONS.md)
- [Issue #4929](https://github.com/Koniverse/SubWallet-Extension/issues/4929) — ChainPatrol key-in-bundle / backend proxy
- [US-5.8](US-5.8-blockaid-transaction-risk-scanning.md), [US-5.9](US-5.9-anti-scam-address-screening.md)
