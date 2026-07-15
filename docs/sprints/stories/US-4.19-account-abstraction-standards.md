---
id: US-4.19
title: "Account-abstraction standards (ERC-4337 / EIP-7702 / EIP-7683)"
epic: EPIC-4
status: in-progress
priority: P2
points: 8
sprint: sprint-2026-W28
version_shipped:
prd_ref: [FR-50]
arch_ref: [AD-02, AD-24]
depends_on: [US-4.5]
assignee:
commit:
created: 2026-06-12
updated: 2026-07-15
---

## Status refresh — 2026-07-15

> Synced from GitHub Projects board #2 ("SubWallet.App – Development"): issue #4210 is **Follow Up** there, so this story moves `backlog` → `in-progress` (sprint `sprint-2026-W28`). Only status/sprint changed; Goal, AC and reasoning below are untouched. The board is the live source for workflow state.

## Goal

A user gets smart-account and cross-chain-intent capabilities on EVM chains —
gas-sponsored / batched operations (ERC-4337), EOA-to-smart-account upgrades
(EIP-7702), and cross-chain intents (EIP-7683) — so the wallet can express modern
account-abstraction flows instead of plain EOA transactions.

## Background

Account abstraction lets an account be programmable: ERC-4337 routes user
operations through bundlers + a paymaster (gas sponsorship, batching) without
changing the protocol; EIP-7702 lets an EOA temporarily delegate to smart-account
code; EIP-7683 standardises cross-chain intents (a user states an outcome and a
filler executes it across chains). Integrating these means adding AA-standard
adapters on top of the EVM API path
([AD-02](../../ARCHITECTURE.md#architecture-decisions),
[US-4.5](US-4.5-evm-network-support.md)) and using the backend Services SDK
([AD-24](../../ARCHITECTURE.md#architecture-decisions)) for bundler/intent
aggregation where applicable.

This is the **standards layer** of the chain-abstraction platform: it generalises
account abstraction over EVM (whereas [US-4.10](US-4.10-starknet-ecosystem-integration.md)
is AA-native to Starknet), and it can sit on top of the chain-abstraction SDK
([US-4.18](US-4.18-chain-abstraction-sdk.md)). It is the most forward-looking of the
chain-abstraction FRs (FR-50 is `📋 planned` in the PRD); per the Stream-B
rule this planning story is created with `status: backlog` and reconciled to its
real status during version reconciliation.

Tracked by [#4210](https://github.com/Koniverse/SubWallet-Extension/issues/4210) —
Implement EIP7702 into SubWallet, and
[#4193](https://github.com/Koniverse/SubWallet-Extension/issues/4193) — Support for
more Ethereum use cases.

Materializes [FR-50](../../PRD.md#epic-4--chain-management).

## Acceptance criteria

- [ ] **AC-1** — **Given** an EVM chain with ERC-4337 support, **When** the user
  performs a sponsored or batched operation, **Then** a UserOperation is built,
  routed through a bundler/paymaster, and tracked to inclusion (AD-02, AD-24).
- [ ] **AC-2** — **Given** an EOA on a chain supporting EIP-7702, **When** the user
  opts into a smart-account upgrade, **Then** the delegation is constructed and
  applied per the standard, and the user can revert to plain EOA behaviour.
- [ ] **AC-3** — **Given** a cross-chain intent (EIP-7683), **When** the user
  states a desired outcome, **Then** an intent is created, surfaced to fillers, and
  its fulfilment is tracked across chains.
- [ ] **AC-4** — **Given** a chain that does not support a requested standard, or a
  bundler/filler outage, **When** the user attempts the action, **Then** a clear
  capability/availability error is shown and nothing is submitted.

## Tasks

- [ ] **TASK-4.19.1** — ERC-4337 UserOperation build + bundler/paymaster routing + inclusion tracking (AC: 1)
- [ ] **TASK-4.19.2** — EIP-7702 EOA→smart-account delegation construction + revert path (AC: 2)
- [ ] **TASK-4.19.3** — EIP-7683 cross-chain intent creation + filler surface + cross-chain tracking (AC: 3)
- [ ] **TASK-4.19.4** — Per-chain capability detection (which standards are supported where) (AC: 1, 2, 3, 4)
- [ ] **TASK-4.19.5** — Unsupported-standard / bundler-or-filler-outage error states (AC: 4)

## Dev notes

### Architecture constraints

- [AD-02](../../ARCHITECTURE.md#architecture-decisions) — AA adapters layer on the EVM API object; they do not bypass `ChainService`.
- [AD-24](../../ARCHITECTURE.md#architecture-decisions) — bundler/intent aggregation uses the backend Services SDK where applicable.
- Signing/keys stay in the wallet boundary (AD-04, EPIC-2): AA changes the operation shape, not where keys live.
- This story may introduce a new AD entry for the AA-standards adapter model — append a CONTEXT decision at implementation time if so.

### Cross-story dependencies

- Builds on [US-4.5](US-4.5-evm-network-support.md) — AA standards layer on the EVM API path.
- Can build on [US-4.18](US-4.18-chain-abstraction-sdk.md) — the chain-abstraction SDK is a natural lower layer.
- Sibling of [US-4.10](US-4.10-starknet-ecosystem-integration.md) — Starknet is AA-native; this story generalises AA over EVM.

### What we explicitly did NOT do

- No custom (non-standard) smart-account implementation — scope is the ERC-4337 / EIP-7702 / EIP-7683 standards only.
- No self-hosted bundler/filler infrastructure — routed via the backend Services SDK / external providers. Trigger to revisit: provider reliability.

### Dev notes — points

8 pts — account-abstraction standards integration: three distinct standards
(ERC-4337 / EIP-7702 / EIP-7683) with bundler/paymaster/filler routing and
per-chain capability detection — multi-system integration per SKILL §3a-bis (8).
Forward-looking — FR-50 `📋 planned`; planning story is `backlog`.

### References

- [Source: PRD FR-50](../../PRD.md#epic-4--chain-management) — ERC-4337 / EIP-7702 / EIP-7683 account-abstraction & cross-chain intents
- [Source: ARCHITECTURE AD-02](../../ARCHITECTURE.md#architecture-decisions) — ChainService per-chain API objects
- [Source: ARCHITECTURE AD-24](../../ARCHITECTURE.md#architecture-decisions) — backend Services SDK for multi-chain data aggregation
- [Roadmap: #4210](https://github.com/Koniverse/SubWallet-Extension/issues/4210) — Implement EIP7702 into SubWallet
- [Roadmap: #4193](https://github.com/Koniverse/SubWallet-Extension/issues/4193) — Support for more Ethereum use cases

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: sponsored/batched op → UserOperation routed via bundler/paymaster, tracked |
| AC-2 | Manual: EIP-7702 upgrade applied + revert to EOA works |
| AC-3 | Manual: EIP-7683 intent created, filled, tracked cross-chain |
| AC-4 | Manual: unsupported standard / bundler outage → capability error, nothing submitted |

## Changelog entry

### Added
- Account-abstraction standards on EVM: ERC-4337 (sponsored/batched ops), EIP-7702 (EOA→smart-account), and EIP-7683 (cross-chain intents).

**Commit**:

## Implementation notes

_Forward-looking — FR-50 `📋 planned`. Fill on implementation; reconcile status during version reconciliation._

## Cross-references

- [PRD FR-50](../../PRD.md#epic-4--chain-management) · [Epic EPIC-4](../epics/EPIC-4.md) · [US-4.18](US-4.18-chain-abstraction-sdk.md) · [US-4.10](US-4.10-starknet-ecosystem-integration.md) · [#4210](https://github.com/Koniverse/SubWallet-Extension/issues/4210) · [#4193](https://github.com/Koniverse/SubWallet-Extension/issues/4193)
