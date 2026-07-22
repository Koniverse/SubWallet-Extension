---
id: US-8.12
title: "Fee/BigInt & gas-estimation hardening"
epic: EPIC-8
status: backlog
priority: P1
points: 5
sprint:
version_shipped:
prd_ref: [FR-76, FR-77, FR-80, NFR-22]
arch_ref: [AD-02, AD-25]
depends_on: [US-8.1, US-8.3, US-8.4, US-8.7]
assignee:
commit:
created: 2026-06-12
updated: 2026-07-13
---

## Goal

Keep the money-math of the transaction surface correct: the fee and amount a user
sees and signs must match what the chain actually charges, and a transfer at the
existential-deposit boundary must never fail silently or strand funds. This story
re-grounds the EPIC-8 correctness cluster in the real fee/amount/ED bugs that have
recurred on the send and confirmation surfaces — wrong or stale estimated fees,
broken non-native fee payment, transfer-max/transfer-all failures when the balance
equals the ED, and transactions that fail with no actionable error. Its value: a
user reads an accurate fee, can pay it (native or non-native), can empty an account
down to the ED, and — when something does go wrong — is told why.

## Background

This is the **bug / iteration (hardening) cluster** for EPIC-8. It defends the
*correctness* of the fee / amount / ED arithmetic behind the user-facing send and
confirmation surfaces — `prd_ref` therefore points at the FRs whose surfaces it keeps
honest (FR-76 custom fee/tip, FR-77 non-native fee token, FR-80 ED guard). **There is
no "arithmetic-correctness NFR"** — an earlier draft of this story claimed one; none of
the PRD's 21 NFR rows covers numeric correctness (the fee-estimation usage of US-8.3 / US-8.4, the ED-threshold
math of US-8.7, and the send amount bounds of US-8.1). It does **not** re-implement
the fee engine (FR-10, owned by [EPIC-2](../epics/EPIC-2.md)); it hardens the
EPIC-8-facing usage of it and closes the real reported defects below, keeping them
closed with regression coverage.

The reported issues group into four correctness traps, all the same underlying logic
(fee/amount/ED arithmetic against the chain), which is why this stays one story:

1. **Fee-estimation accuracy** — the estimated fee displayed on Transfer /
   confirmation (and in swap / earning) must match what substrate/EVM actually
   charges, and must degrade sanely when the network is disconnected rather than
   showing a stale or wrong number:
   [#4649](https://github.com/Koniverse/SubWallet-Extension/issues/4649) (display
   estimated fee for substrate/EVM on Transfer / confirmation),
   [#4552](https://github.com/Koniverse/SubWallet-Extension/issues/4552) (re-check
   estimated-fee logic when paying with a non-native token on a PAH network),
   [#2643](https://github.com/Koniverse/SubWallet-Extension/issues/2643) (re-check
   estimated fee when the network is disconnected),
   [#4936](https://github.com/Koniverse/SubWallet-Extension/issues/4936) (update fee
   display in swap / earning).
2. **Paying fees with a non-native token** — the conversion and selection logic for
   non-native fee tokens (Asset Hub / PAH / Hydration) must compute the right fee in
   the chosen token and actually let the transaction pay it:
   [#4043](https://github.com/Koniverse/SubWallet-Extension/issues/4043) (bug paying
   fee with non-native tokens),
   [#4552](https://github.com/Koniverse/SubWallet-Extension/issues/4552) (estimated-fee
   logic for the non-native PAH path — spans this group and group 1).
3. **ED / BigInt edge math (transfer-max / transfer-all at the ED boundary)** — the
   BigInt arithmetic that bounds a max/all transfer against transferable balance,
   fee, and the existential deposit must be exact in base units; the known breakage is
   at the boundary where transferable equals the ED:
   [#3314](https://github.com/Koniverse/SubWallet-Extension/issues/3314) (re-check
   transfer-all when Transferable = ED),
   [#4985](https://github.com/Koniverse/SubWallet-Extension/issues/4985) (WebApp:
   transaction failed when transfer-max with balance = ED).
4. **Error surfacing** — when fee/amount/ED math (or the submit it feeds) does fail,
   the user must get a specific, actionable message, not a bare failure:
   [#3240](https://github.com/Koniverse/SubWallet-Extension/issues/3240) (transfer
   failed but no specific error message).

This story is **retroactive / ongoing** — much of this hardening already shipped
incrementally on the send surface; `commit` / `version_shipped` are backfilled during
version reconciliation, and the story stays open to absorb later fee/amount/ED fixes.
Sized 5 (multi-area: fee estimation + non-native fee + ED/BigInt + error surfacing,
across Substrate and EVM, with regression coverage).

## Acceptance criteria

- [ ] **AC-1** *(fee-estimation accuracy)* — **Given** a Substrate or EVM transfer on
  the Transfer / confirmation screen, **When** the estimated fee is displayed, **Then**
  it matches the fee the chain actually charges for that extrinsic / transaction (within
  the chain's estimation tolerance), and the same accurate fee is reflected in the swap
  and earning fee displays — closing
  [#4649](https://github.com/Koniverse/SubWallet-Extension/issues/4649) and
  [#4936](https://github.com/Koniverse/SubWallet-Extension/issues/4936).
- [ ] **AC-2** *(non-native fee payment)* — **Given** a chain that supports paying fees
  with a non-native token (Asset Hub / PAH / Hydration), **When** the user selects a
  non-native fee token, **Then** the fee is computed and displayed in that token and the
  transaction successfully pays the fee in it — closing
  [#4043](https://github.com/Koniverse/SubWallet-Extension/issues/4043) and the
  non-native PAH estimated-fee path of
  [#4552](https://github.com/Koniverse/SubWallet-Extension/issues/4552).
- [ ] **AC-3** *(ED / BigInt edge)* — **Given** an account whose transferable balance
  equals (or is at the boundary of) the existential deposit, **When** the user does a
  transfer-max or transfer-all, **Then** the amount is computed in BigInt base units
  against transferable − fee − ED and the transfer either succeeds or is blocked with a
  clear reason — never a silent failure — closing
  [#3314](https://github.com/Koniverse/SubWallet-Extension/issues/3314) and
  [#4985](https://github.com/Koniverse/SubWallet-Extension/issues/4985).
- [ ] **AC-4** *(unhappy path — network disconnect)* — **Given** the network is
  disconnected (or the fee source is unavailable), **When** a fee estimate is requested,
  **Then** the UI does not show a stale or wrong fee: it surfaces an unavailable /
  retrying state and does not let the user sign against a bogus estimate — closing
  [#2643](https://github.com/Koniverse/SubWallet-Extension/issues/2643).
- [ ] **AC-5** *(unhappy path — error surfacing)* — **Given** a transfer that fails
  during fee/amount/ED validation or submit, **When** the failure is surfaced, **Then**
  the user sees a specific, actionable error message identifying the cause (e.g.
  insufficient fee, below ED, network unavailable) rather than a bare "transaction
  failed" — closing
  [#3240](https://github.com/Koniverse/SubWallet-Extension/issues/3240).

## Tasks

- [ ] **TASK-8.12.1** — Re-check and correct the displayed estimated fee for substrate
  and EVM transfers on the Transfer / confirmation surface, and propagate the corrected
  fee to swap and earning displays (AC: 1)
- [ ] **TASK-8.12.2** — Fix the non-native fee path: correct fee computation/conversion
  in the selected non-native token on Asset Hub / PAH / Hydration and ensure the
  transaction pays the fee in it (AC: 2)
- [ ] **TASK-8.12.3** — Re-check transfer-max / transfer-all BigInt math at the ED
  boundary (transferable = ED), in base units against transferable − fee − ED, so the
  transfer succeeds or is blocked with a reason, never silently fails (AC: 3)
- [ ] **TASK-8.12.4** — Handle the network-disconnected / fee-source-unavailable case:
  surface an unavailable/retry state instead of a stale fee and block signing against a
  bogus estimate (AC: 4)
- [ ] **TASK-8.12.5** — Surface specific, actionable error messages for fee/amount/ED
  validation and submit failures instead of a bare failure (AC: 5)
- [ ] **TASK-8.12.6** — Regression coverage: tests / guards anchored on #4649, #4552,
  #2643, #4936, #4043, #3314, #4985, #3240 so the fee/amount/ED traps cannot silently
  reappear (AC: 1, 2, 3, 4, 5)

## Dev notes

### Architecture constraints

- [AD-02](../../ARCHITECTURE.md#architecture-decisions) — fee computation, transaction
  build and submit run against the per-chain `ChainService` API objects (`SubstrateApi`
  / `EvmApi`); this story hardens that fee/build/submit surface's EPIC-8-facing usage,
  it does not re-implement the engine.
- [AD-25](../../ARCHITECTURE.md#architecture-decisions) — EVM gas / fee-source data is
  fronted by the `api-cache` proxy; fee estimates must stay consistent with that source
  and degrade to an unavailable state (not a stale value) when it cannot be reached.
- This story does NOT introduce new AD entries. The fee *engine* (FR-10) and the
  transaction lifecycle (FR-12) are owned by [EPIC-2](../epics/EPIC-2.md); this story
  adds correctness fixes and regression coverage around their EPIC-8-facing usage. There
  is no dedicated existential-deposit AD — the ED threshold math is a property of the
  send flow (US-8.7) over AD-02 balances.

### Cross-story dependencies

- Builds on [US-8.1](US-8.1-send-native-and-fungible-tokens.md) — hardens the send
  amount bounds (transfer-max / transfer-all) this story corrects at the ED boundary.
- Builds on [US-8.3](US-8.3-custom-fee-and-tip.md) — hardens the displayed-fee accuracy
  on the custom fee/tip surface (substrate + EVM).
- Builds on [US-8.4](US-8.4-pay-fees-with-non-native-token.md) — fixes the non-native
  fee conversion/selection path (Asset Hub / PAH / Hydration).
- Builds on [US-8.7](US-8.7-existential-deposit-safety-guard.md) — the ED threshold this
  story's transfer-max/transfer-all math is bounded against.
- Sibling to every send story — the fee/amount BigInt invariant applies epic-wide.

### What we explicitly did NOT do

- No re-implementation of the fee engine — this is targeted correctness fixes plus
  regression coverage around the EPIC-8 usage, not an engine rewrite. Trigger to
  revisit: a systemic fee-engine defect that needs engine-level change (lands in
  [EPIC-2](../epics/EPIC-2.md)).
- No change to the existential-deposit policy itself — the warning/guard behavior is
  owned by [US-8.7](US-8.7-existential-deposit-safety-guard.md); this story only fixes
  the arithmetic at the boundary.

### Points justification

5 pts (§3a-bis — multi-area / multiple internal integrations, ~3-4 days). The story
spans four correctness areas (fee-estimation display, non-native fee payment, ED/BigInt
transfer-max/transfer-all edge, error surfacing) across both Substrate and EVM, plus
regression coverage, and touches several surfaces (Transfer / confirmation, swap,
earning). It stays one story because all of it is the same fee/amount/ED arithmetic
against the chain — splitting would fragment one logical invariant. It is not 8: the
work is bounded reliability hardening on a single transaction surface riding the
existing fee engine (US-8.3/8.4) and ED guard (US-8.7), not a multi-week or
cross-product effort.

### References

- [Source: PRD NFR-22](../../PRD.md#non-functional-requirements) — financial-figure accuracy. **This story owns it** for fees.
- [Issue #4043](https://github.com/Koniverse/SubWallet-Extension/issues/4043) — Fix bug paying fee with non-native tokens
- [Issue #4552](https://github.com/Koniverse/SubWallet-Extension/issues/4552) — Re-check estimated-fee logic when paying with a non-native token (PAH network)
- [Issue #4649](https://github.com/Koniverse/SubWallet-Extension/issues/4649) — Re-check display estimated fee for substrate/EVM on Transfer / confirmation
- [Issue #4936](https://github.com/Koniverse/SubWallet-Extension/issues/4936) — Update display fee in swap, earning
- [Issue #2643](https://github.com/Koniverse/SubWallet-Extension/issues/2643) — Re-check estimated fee in case network disconnect
- [Issue #3314](https://github.com/Koniverse/SubWallet-Extension/issues/3314) — Re-check transfer-all when Transferable = ED
- [Issue #4985](https://github.com/Koniverse/SubWallet-Extension/issues/4985) — [WebApp] Transaction failed when transfer-max with balance = ED
- [Issue #3240](https://github.com/Koniverse/SubWallet-Extension/issues/3240) — Transfer failed but no specific error message
- [Source: ARCHITECTURE AD-02](../../ARCHITECTURE.md#architecture-decisions) — ChainService per-chain API objects (fee / build / submit)
- [Source: ARCHITECTURE AD-25](../../ARCHITECTURE.md#architecture-decisions) — `api-cache` EVM-gas / fee-source proxy

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: Substrate + EVM transfer on Transfer / confirmation → displayed fee matches on-chain charge; same fee reflected in swap / earning (#4649, #4936). Regression test for the fee-display path passes |
| AC-2 | Manual: select a non-native fee token on Asset Hub / PAH / Hydration → fee shown in that token and transaction pays it (#4043, #4552) |
| AC-3 | Manual: account with transferable = ED → transfer-max / transfer-all computes amount in BigInt base units and succeeds or blocks with a reason, never silently fails (#3314, #4985) |
| AC-4 | Manual: disconnect the network / fee source → UI shows unavailable/retry, no stale fee, signing blocked against a bogus estimate (#2643) |
| AC-5 | Manual: force a fee/amount/ED validation or submit failure → specific actionable error message, not a bare "transaction failed" (#3240) |

## Changelog entry

### Fixed
- Corrected estimated-fee display for substrate/EVM transfers on Transfer /
  confirmation and propagated it to swap / earning (#4649, #4936).
- Fixed paying fees with a non-native token on Asset Hub / PAH / Hydration, including
  the estimated-fee logic on the PAH path (#4043, #4552).
- Fixed transfer-max / transfer-all BigInt arithmetic at the existential-deposit
  boundary (transferable = ED) so the transfer no longer fails silently (#3314, #4985).
- Fee estimation now degrades to an unavailable/retry state when the network is
  disconnected instead of showing a stale fee (#2643).
- Transfer failures now surface a specific, actionable error message (#3240).

**Commit**:

## Implementation notes

_Retroactive / ongoing hardening cluster — much already shipped incrementally on the
send surface. Fill `commit`, `version_shipped` and caveats during version
reconciliation; the story stays open to absorb later fee/amount/ED fixes._

## Cross-references

- [Epic EPIC-8](../epics/EPIC-8.md)
- [US-8.1](US-8.1-send-native-and-fungible-tokens.md)
- [US-8.3](US-8.3-custom-fee-and-tip.md)
- [US-8.4](US-8.4-pay-fees-with-non-native-token.md)
- [US-8.7](US-8.7-existential-deposit-safety-guard.md)
- [Issue #4043](https://github.com/Koniverse/SubWallet-Extension/issues/4043) · [#4552](https://github.com/Koniverse/SubWallet-Extension/issues/4552) · [#4649](https://github.com/Koniverse/SubWallet-Extension/issues/4649) · [#4936](https://github.com/Koniverse/SubWallet-Extension/issues/4936) · [#2643](https://github.com/Koniverse/SubWallet-Extension/issues/2643) · [#3314](https://github.com/Koniverse/SubWallet-Extension/issues/3314) · [#4985](https://github.com/Koniverse/SubWallet-Extension/issues/4985) · [#3240](https://github.com/Koniverse/SubWallet-Extension/issues/3240)
