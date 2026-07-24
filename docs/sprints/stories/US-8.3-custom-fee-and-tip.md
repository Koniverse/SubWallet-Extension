---
id: US-8.3
title: "Custom fee / tip"
epic: EPIC-8
status: done
priority: P1
points: 5
sprint: sprint-2025-M03
version_shipped: 1.3.24
prd_ref: [FR-76]
arch_ref: [AD-02, AD-25]
depends_on: [US-8.1]
assignee: frenkie-ng
commit: 582568f97d, 17d8f4153d, de412ae0fe
created: 2026-06-12
updated: 2026-06-12
---

## Goal

A user can override the default transaction cost — set a tip on Substrate or pick a
fee level (and edit gas parameters) on EVM — so that they can speed up a transfer
when the network is busy or economise when it is not, instead of being locked to a
single estimate. This is the user-facing control surface over the fee engine; the
engine computes, the user chooses.

## Status

> **✅ done — shipped in 1.3.24.** All acceptance criteria are ticked and the 9 rows below are
> settled: 8 delivered, 1 closed without shipping. Its umbrella
> [#4371](https://github.com/Koniverse/SubWallet-Extension/issues/4371) — *"Custom fee token"* — is
> owned by [EPIC-8](../epics/EPIC-8.md) rather than repeated here ([AGENTS.md](../../../AGENTS.md) rule 10).

## Background

Fee control is *presentation + selection* over the fee engine
([EPIC-2](../epics/EPIC-2.md), FR-10), not a re-computation. Substrate and EVM have
fundamentally different fee models — Substrate is weight-fee + optional tip; EVM is
gas-price / EIP-1559 maxFee + maxPriorityFee with a gas-limit — so the control
presents the right inputs per ecosystem and feeds the user's choice back into the
transaction the lifecycle engine validates. EVM gas suggestions are sourced through
the cache/CDN proxy ([AD-25](../../ARCHITECTURE.md#architecture-decisions),
`api-cache` EVM-gas slice); per-chain APIs come from `ChainService`
([AD-02](../../ARCHITECTURE.md#architecture-decisions)).

The defining correctness risk is arithmetic: fee, tip and gas are integer base
units, and a float on any of them is a fund-impacting bug — this is the epic's
BigInt invariant, regression-guarded by
[US-8.12](US-8.12-fee-bigint-and-gas-estimation-hardening.md). Sized 5 (production
fee-control surface spanning two distinct fee models with an external gas source).
Materializes [FR-76](../../PRD.md#functional-requirements). This story is
**Retroactive** — the capability already ships; `commit` / `version_shipped` are
backfilled during version reconciliation.

## Acceptance criteria

- [x] **AC-1** — **Given** a Substrate transfer, **When** the user sets a tip,
  **Then** the tip (in base units) is added to the extrinsic and the displayed
  total cost updates accordingly before submission.
- [x] **AC-2** — **Given** an EVM transfer, **When** the user selects a fee level
  or edits maxFee / maxPriorityFee / gas-limit, **Then** the chosen parameters are
  applied to the transaction and the estimated cost reflects them.
- [x] **AC-3** — **Given** any fee/tip input, **When** it is entered, **Then** all
  fee, tip and gas math is performed in integer base units (`bigint` / `BN`) with
  no `number`/float coercion of an amount.
- [x] **AC-4** — **Given** an invalid custom value (gas-limit below the estimated
  minimum, or a tip/fee that leaves the account unable to cover the total), **When**
  the user attempts to confirm, **Then** the input is rejected with an inline error
  and the transaction is not submitted.

## Tasks

- [x] **TASK-8.3.1** — Substrate tip input wired into the extrinsic + total-cost display (AC: 1, 3)
- [x] **TASK-8.3.2** — EVM fee-level / EIP-1559 editor (maxFee, maxPriorityFee, gas-limit) (AC: 2, 3)
  - [x] Source EVM gas suggestions via the `api-cache` proxy (AD-25).
- [x] **TASK-8.3.3** — Feed the user's choice into the fee engine preflight / lifecycle validate step (AC: 1, 2)
- [x] **TASK-8.3.4** — BigInt-only arithmetic for fee/tip/gas (AC: 3)
- [x] **TASK-8.3.5** — Validate custom values; reject under-min gas-limit / unaffordable total (AC: 4)

## Dev notes

### Architecture constraints

- [AD-02](../../ARCHITECTURE.md#architecture-decisions) — fee/gas estimation and extrinsic build use the per-chain `ChainService` API objects.
- [AD-25](../../ARCHITECTURE.md#architecture-decisions) — EVM gas suggestions ride the `api-cache` proxy slice, not a direct provider call.
- This story does NOT introduce new AD entries. The fee *engine* (FR-10) and the lifecycle validate step (FR-12) are owned by [EPIC-2](../epics/EPIC-2.md); this story drives them.

### Cross-story dependencies

- Builds on [US-8.1](US-8.1-send-native-and-fungible-tokens.md) — the fee/tip control attaches to the send confirmation surface.
- Sibling [US-8.4](US-8.4-pay-fees-with-non-native-token.md) — extends the fee step with a non-native fee-token selector; coordinate the shared fee component.
- Sibling [US-8.12](US-8.12-fee-bigint-and-gas-estimation-hardening.md) — owns the BigInt/gas-estimation regression guard this story must pass.

### Performance budget

- Fee/gas suggestion fetch must not block the send form: the form stays interactive while a default estimate is shown, refined when the suggestion resolves.
- Defended by the EVM-gas path test in `services` fee tests.

### References

- [Source: PRD FR-76](../../PRD.md#functional-requirements) — custom fee / tip (Substrate + EVM)
- [Source: PRD FR-10](../../PRD.md#functional-requirements) — fee engine (EPIC-2)
- [Source: ARCHITECTURE AD-02](../../ARCHITECTURE.md#architecture-decisions), [AD-25](../../ARCHITECTURE.md#architecture-decisions)

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: Substrate tip → total cost updates; extrinsic carries the tip |
| AC-2 | Manual: EVM → edit maxFee/priority/gas-limit → cost reflects choice |
| AC-3 | Test asserts fee/tip/gas use `bigint`/`BN`; grep for `parseFloat`/`Number(` on fee fields returns none |
| AC-4 | Manual: under-min gas-limit or unaffordable tip → inline error, no submit |

## Changelog entry

### Added
- Custom fee/tip control: Substrate tip input and EVM fee-level / EIP-1559
  (maxFee, maxPriorityFee, gas-limit) editor, feeding the user's choice into the
  fee engine preflight, with BigInt-only arithmetic and validation.

**Commit**:

## Implementation notes

_Retroactive story — capability already shipped. Fill `commit`, `version_shipped`
and any implementation caveats during version reconciliation._

## Incremental work, fixes & chores

**9 tracker issues** — 7 with a release, 1 delivered with no line naming it, 1 closed without
shipping. Folded in from the former one-issue-per-story maintenance ledger (2026-07-24).

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 1.3.24 | [#3658](https://github.com/Koniverse/SubWallet-Extension/issues/3658) | Allow customizing fee for substrate/evm transactions | ✅ done |
| 1.3.53 | [#4461](https://github.com/Koniverse/SubWallet-Extension/issues/4461) | Extension - Bug when custom priority fee for EVM | ✅ done |
| 1.3.53 | [#4559](https://github.com/Koniverse/SubWallet-Extension/issues/4559) | Extension - Update logic for rpc that don't support custom fee on EVM system | ✅ done |
| 1.3.53 | [#4585](https://github.com/Koniverse/SubWallet-Extension/issues/4585) | Extension - Hide icon Edit fee with some networks not supported | ✅ done |
| 1.3.55 | [#4065](https://github.com/Koniverse/SubWallet-Extension/issues/4065) | Fix some bug for customizing fee for substrate/evm transactions features | ✅ done |
| 1.3.62 | [#4652](https://github.com/Koniverse/SubWallet-Extension/issues/4652) | Missing "Edit Fee" button / Improve fee loading UI | ✅ done |
| 1.3.67 | [#4716](https://github.com/Koniverse/SubWallet-Extension/issues/4716) | Configure gas limit & max gas fee for Energy Web Chain | ✅ done |
| — | [#60](https://github.com/Koniverse/SubWallet-Extension/issues/60) | Check transaction processing speed with Tip and without Tip | ✅ done |
| — | [#330](https://github.com/Koniverse/SubWallet-Extension/issues/330) | Transfer with account keep-alive checks & add transaction tip | ⏸ deprecated |

> **Custom fee shipped in 1.3.24 and took five more releases to hold.** #4065 (1.3.55) fixed bugs in
> it, #4461 and #4559 and #4585 all land in 1.3.53, #4652 in 1.3.62, #4716 in 1.3.67. Letting the
> user set a fee means every RPC that *cannot* accept one has to be detected and the control hidden —
> which is what #4559 and #4585 do.
>
> **#330 is the same idea eleven versions early and closed `NOT_PLANNED`**: *"transfer with
> account keep-alive checks & add transaction tip"* (2022). The tip half waited for 1.3.24; the
> keep-alive half became [US-8.7](US-8.7-existential-deposit-safety-guard.md).

## Cross-references

- [PRD FR-76](../../PRD.md#functional-requirements)
- [Epic EPIC-8](../epics/EPIC-8.md)
- [US-8.4](US-8.4-pay-fees-with-non-native-token.md)
- [US-8.12](US-8.12-fee-bigint-and-gas-estimation-hardening.md)
- [consolidation note](../../notes/2026-07-24.md#a-epic-28-maintenance--transactions-merged-into-epic-8)
