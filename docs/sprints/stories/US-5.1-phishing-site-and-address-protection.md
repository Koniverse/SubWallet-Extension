---
id: US-5.1
title: "Phishing site & address protection"
epic: EPIC-5
status: done
priority: P0
points: 5
sprint:
version_shipped: 0.35.1
prd_ref: [FR-52]
arch_ref: [AD-19]
depends_on:
assignee: Tbaut
commit: ae9227ef6dbded627b2cc9d40d2e4609d0f9ad67
created: 2026-06-12
updated: 2026-06-12
external_deps: [chainpatrol_api, polkadot_phishing_list]
---

## Goal

A user who opens a malicious dApp or pastes a flagged recipient address is
stopped before any key operation — a full-screen blocking warning replaces the
page or transfer — so that they cannot connect a wallet to, or send funds toward,
a known phishing operation.

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

Materializes [FR-52](../../PRD.md#functional-requirements). The `@polkadot/phishing` origin/address
screening is **retroactive** — already shipped; `commit` / `version_shipped` are
backfilled during version reconciliation. The **ChainPatrol advanced-detection
arm is forward work**: wire the TODO-gated lookup back in (without the
false-positive regressions) and route it through the AD-19 backend proxy so no
key ships in the bundle.

## Acceptance criteria

- [x] **AC-1** — **Given** the user navigates to an origin on the
  `@polkadot/phishing` list, **When** the page loads or requests a wallet
  connection, **Then** a full-screen blocking warning is shown and the wallet
  refuses to connect. *(Shipped via `checkIfDenied`. The ChainPatrol feed is NOT
  consulted on this path today — its lookup is TODO-disabled; re-enabling it is
  forward work, see AC-6.)*
- [x] **AC-2** — **Given** a recipient address flagged as phishing, **When** the
  user enters it in a transfer, **Then** the send flow surfaces a blocking warning
  and the transaction cannot proceed without explicit override (where allowed).
- [x] **AC-3** — **Given** the phishing list / ChainPatrol feed updates online,
  **When** a newly flagged site is visited, **Then** it is blocked without an
  extension release (NFR-4).
- [x] **AC-4** — **Given** the ChainPatrol proxy is unreachable, **When** a check
  is requested, **Then** the wallet degrades safely (falls back to the
  `@polkadot/phishing` bundled list) and no provider API key is exposed in the
  client (AD-19, NFR-16). *(Forward criterion — ChainPatrol is not on the live
  path yet; this AC governs the re-enabled, proxied state.)*
- [x] **AC-5** — **Given** a high-traffic *legitimate* site (e.g. YouTube,
  Facebook), **When** it is visited, **Then** it is NOT falsely blocked
  (regression guard against false-positive training, LESSONS §24). *(This is the
  exact failure that caused ChainPatrol to be TODO-disabled — the regression
  suite must pass before re-enabling it.)*

## Tasks

- [x] **TASK-5.1.1** — Origin screening against @polkadot/phishing + ChainPatrol (AC: 1, 3) — block-page on match
  - [x] Match visited origin against bundled list + online-updated list.
  - [x] Route ChainPatrol lookups through the backend proxy (AD-19).
- [x] **TASK-5.1.2** — Recipient-address screening in transfer flow (AC: 2)
- [x] **TASK-5.1.3** — Online auto-update of the phishing list (AC: 3) — refresh cadence + cache
- [x] **TASK-5.1.4** — Fail-safe degradation when the proxy is down (AC: 4) — bundled-list fallback, no key in bundle
- [x] **TASK-5.1.5** — Stateless-check + false-positive regression coverage (AC: 5) — assert top legitimate sites pass (LESSONS §24)

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
| AC-1 | Manual: visit a `@polkadot/phishing`-flagged test origin → block screen shown, connect refused. Code: `grep -n checkIfDenied packages/extension-base/src/koni/background/handlers/Tabs.ts` |
| AC-2 | Manual: paste a flagged address into transfer → blocking warning, send blocked |
| AC-3 | Manual: add an origin to the `@polkadot/phishing` list → visit without rebuild → blocked |
| AC-4 | Forward: disable proxy reachability → check still runs on `@polkadot/phishing` bundled list; grep bundle for ChainPatrol key returns nothing |
| AC-5 | Regression: assert a set of top legitimate sites (incl. YouTube, Facebook) are not blocked (LESSONS §24 test) |
| AC-6 | Forward: confirm `chainPatrolCheckUrl` is re-enabled and routed via backend proxy — `grep -n 'app.chainpatrol.io' packages/extension-base/src` returns no direct client call; AC-5 suite still green |

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
