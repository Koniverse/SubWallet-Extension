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

## Background

Phishing is the highest-frequency attack against wallet users, and it lands
*outside* the key boundary: the user willingly approves a connection or transfer
to an attacker-controlled site/address. Defence is therefore a screen, not a
cryptographic control.

The **`@polkadot/phishing`** community list is the **shipped/active** detection
path: `Tabs.checkPhishing` calls `checkIfDenied` from `@polkadot/phishing`
(bundled + online auto-update) against the visited origin, and a match redirects
to the full-screen block page
(`packages/extension-base/src/koni/background/handlers/Tabs.ts`).

**ChainPatrol advanced detection is PARTIAL / currently disabled.** The pieces
exist — an `enableChainPatrol` setting, a `MigrateChainPatrol` migration, and a
`chainPatrolCheckUrl` helper that hits `app.chainpatrol.io/api/v2/asset/check` —
but the actual lookup inside `checkPhishing` is **commented out behind a TODO**
("Temporarily disable the Advanced phishing detection feature because it produces
incorrect results … incorrectly flags YouTube, Facebook, and other social media
platforms as phishing"). So even when the user toggles ChainPatrol on, the live
phishing path does not consult it today. There is also an **API-key-in-bundle
concern**: `chainPatrolCheckUrl` currently calls the ChainPatrol API directly
from the client rather than through a backend proxy (relates to issue
[#4929](https://github.com/Koniverse/SubWallet-Extension/issues/4929)); AD-19's
proxy is the target end-state, not the as-shipped behavior.

The check must be **stateless with respect to account presence** and tested
against high-traffic legitimate sites to avoid false positives that train users
to click through warnings ([LESSONS §24](../../LESSONS.md)) — the disabled-by-TODO
ChainPatrol path is itself a concrete instance of that false-positive risk. The
blocking warning auto-updates online ([NFR-4](../../PRD.md#non-functional-requirements)) so a newly flagged
site is covered without an extension release.

Materializes [FR-52](../../PRD.md#functional-requirements) — **origin screening only**; FR-52's
text was narrowed to match on 2026-07-14 ([CONTEXT D107](../../CONTEXT.md)). **Retroactive** —
already shipped, and inherited (see Implementation notes). The **ChainPatrol arm is forward
work** owned by [US-5.10](US-5.10-verichains-audit-remediation-hardening.md) AC-2: wire the
TODO-gated lookup back in *behind a false-positive regression suite*, and route it through the
AD-19 backend proxy so no key ships in the bundle
([#4929](https://github.com/Koniverse/SubWallet-Extension/issues/4929)).

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

> ## ⚠️ Every version number below this line is **polkadot-js's**, not SubWallet's
>
> This story is **inherited** — the code was written upstream, years before SubWallet existed
> ([CONTEXT D105](../../CONTEXT.md)). So this section quotes **two different products' version
> lines**, and they are not comparable:
>
> | | |
> | --- | --- |
> | **SubWallet** (this product) | `0.2.1` (2022-02-10, the first release) → `1.3.83`. **This is the only line `version_shipped` may name.** |
> | **polkadot-js** (upstream, inherited) | `0.5.1` … `0.35.1` … `0.42.1`. Appears **only** in the provenance table and the evidence paragraph below, always beside a **pre-2022 date**. |
>
> **Read the date, not the number.** Six version numbers exist in *both* lines
> ([LESSONS §66](../../LESSONS.md)) — the date never collides. And do not "fix" a number
> below to look like SubWallet's: they are quotations of upstream's CHANGELOG and git tags,
> and rewriting them makes the citation unverifiable ([CONTEXT D106](../../CONTEXT.md)).

**Inherited from polkadot-js — `version_shipped` corrected 2026-07-14 ([CONTEXT D101](../../CONTEXT.md)).**
This capability was **not built by SubWallet**. It came with the fork: SubWallet-Extension is a
fork of the **polkadot-js extension**, and inherited its git history, tags and CHANGELOG.

| | |
| --- | --- |
| Upstream release | **polkadot-js 0.35.1**, **2020-11-30** — *not on SubWallet's version line* |
| Upstream author | `Tbaut` — a polkadot-js maintainer |
| Upstream commit | `ae9227ef6dbded627b2cc9d40d2e4609d0f9ad67` — the @polkadot/phishing site-denylist check |
| **Reached a SubWallet user in** | **0.2.1** (2022-02-10) — SubWallet's **first** release |

This story used to carry that upstream number **in `version_shipped`**, which was **actively
misleading**: read on SubWallet's version line, `0.35.1` sits *after* `0.8.1` — so the docs
implied the capability arrived mid-2023, when in fact **SubWallet had it from day one**.
`version_shipped` answers *"which release of **this product** first gave a user this
capability"*; the answer is **0.2.1**. That mistake can no longer be made silently:
`scripts/koni-docs-check-ids.mjs` rejects any `version_shipped` that is not a `(Koni)` row in
the CHANGELOG ([CONTEXT D106](../../CONTEXT.md)).

Verified: the upstream commit is an ancestor of **`v0.2.5`**, SubWallet's earliest tag
(`git merge-base --is-ancestor`; SubWallet's 0.2.1 is untagged, so `v0.2.5` is its anchor per
the [US-21.2](US-21.2-history-backfill.md) rule). **Do not anchor on `v0.2.1`** — no such tag
exists here, and the tags that *do* collide point upstream (`v0.7.1` is polkadot-js's, 2019).

`assignee` stays `Tbaut` — they wrote the code, and that is true. See [LESSONS §66](../../LESSONS.md).

Backfilled by US-21.2 (multi-agent trace + adversarial verify, run `wf_6b56f4cd-d08`; trace confidence: medium, rule: first-delivery).

**Evidence:** CHANGELOG "## [0.35.1] — 2020-11-30": "Add phishing site detection and redirection (Thanks to Tbaut)" — earliest bullet delivering the full-screen phishing block; commit ae9227ef6d (2020-10-13, PR #488) is an ancestor of v0.35.1 (merge-base check exit 0) and absent from v0.34.1. Medium, not high: the title enumerates "site & address" but the address arm never shipped in this repo (no bullet, no @polkadot/phishing address check on the live transfer path — scope sits in sibling US-5.9) and the ChainPatrol arm is TODO-disabled forward work, so only the site arm is traced; delivery is also upstream-inherited (polkadot-js/extension release pre-fork).

Commits `ae9227ef6dbded627b2cc9d40d2e4609d0f9ad67` verified contained in the v0.35.1 anchor via `git merge-base --is-ancestor`; assignee resolved through the [US-21.1 contributor map](../../notes/contributor-map.md).

**Do not backfill the ChainPatrol arm as done.** The live path's ChainPatrol lookup is
TODO-disabled. Re-enable it only after the false-positive regression suite passes *and*
the call is moved behind the AD-19 backend proxy — that forward scope is already owned
by [US-5.10](US-5.10-verichains-audit-remediation-hardening.md) AC-2
([#4929](https://github.com/Koniverse/SubWallet-Extension/issues/4929)), so this story
carries no forward AC of its own.

**Scope correction (2026-07-13, US-21.2):** the batch backfill ticked every open AC
when it flipped this story to `done`, including a *forward* AC-6 that the author had
deliberately left unticked. AC-6 is removed here — its scope lives in US-5.10.

## Cross-references

- [PRD FR-52](../../PRD.md#functional-requirements)
- [Epic EPIC-5](../epics/EPIC-5.md)
- [LESSONS §24](../../LESSONS.md)
- [Issue #4929](https://github.com/Koniverse/SubWallet-Extension/issues/4929) — ChainPatrol key-in-bundle / backend proxy
- [US-5.8](US-5.8-blockaid-transaction-risk-scanning.md), [US-5.9](US-5.9-anti-scam-address-screening.md)
