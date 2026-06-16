---
id: US-4.15
title: "Flow network support (Cadence & EVM)"
epic: EPIC-4
status: backlog
priority: P1
points: 5
sprint:
version_shipped:
prd_ref: [FR-46]
arch_ref: [AD-02]
depends_on: [US-4.1]
assignee:
commit:
created: 2026-06-12
updated: 2026-06-12
---

## Goal

A user can hold and view Flow assets from the same unified wallet across both Flow
runtimes — native Cadence and Flow EVM — so the Flow ecosystem joins the
multi-chain account without a separate seed.

## Background

Flow exposes two execution environments: the native Cadence runtime (account-model
with a distinct address/key model) and Flow EVM (EVM-compatible). Supporting it is
a new-ecosystem integration that must model both runtimes. Flow EVM can reuse the
existing `EvmApi` path ([AD-02](../../ARCHITECTURE.md#architecture-decisions)),
while native Cadence needs its own API-object type and account derivation. Both
derive from the unified multi-chain seed
([AD-11](../../ARCHITECTURE.md#architecture-decisions), EPIC-3).

This story is **forward-looking** — FR-46 is `📋 planned`. It covers **network
presence (Cadence + Flow EVM) + account model + balance reads**; transfer and dApp
flows are deferred to their consuming epics when scheduled.

Tracked by [#4760](https://github.com/Koniverse/SubWallet-Extension/issues/4760) —
[Integration] Support Flow Network (Cadence & EVM).

Materializes [FR-46](../../PRD.md#epic-4--chain-management).

## Acceptance criteria

- [ ] **AC-1** — **Given** the Flow ecosystem is enabled, **When** an account is
  set up, **Then** a Flow account derives from the unified seed (no separate
  seed/backup, AD-11) for the Cadence runtime, and its address is shown.
- [ ] **AC-2** — **Given** Flow EVM is enabled, **When** balances load, **Then**
  the Flow EVM chain resolves through the EVM API path (AD-02) like any EVM network.
- [ ] **AC-3** — **Given** an enabled native Flow (Cadence) account, **When**
  balances load, **Then** FLOW and Cadence-token balances resolve through the Flow
  (Cadence) API object.
- [ ] **AC-4** — **Given** a Flow endpoint (Cadence or EVM) is unreachable, **When**
  data is requested, **Then** a clear unavailable state is shown without breaking
  other ecosystems.

## Tasks

- [ ] **TASK-4.15.1** — Flow EVM as an `EvmApi` chain entry (AC: 2)
- [ ] **TASK-4.15.2** — Native Flow (Cadence) API object wired into `ChainService` (AC: 3, 4)
- [ ] **TASK-4.15.3** — Seed-derived Flow Cadence account + address derivation (AC: 1)
- [ ] **TASK-4.15.4** — FLOW + Cadence-token balance reads (AC: 3)
- [ ] **TASK-4.15.5** — Endpoint-unavailable error states for both runtimes (AC: 4)

## Dev notes

### Architecture constraints

- [AD-02](../../ARCHITECTURE.md#architecture-decisions) — Flow EVM reuses the `EvmApi` object; native Cadence connects through a new dedicated API-object type.
- [AD-11](../../ARCHITECTURE.md#architecture-decisions) — both Flow runtimes derive from the unified seed (EPIC-3).
- This story introduces no new AD entries; the Cadence account/key model may warrant a CONTEXT decision at implementation time.

### Cross-story dependencies

- Builds on [US-4.1](US-4.1-add-remove-networks-and-custom-rpc.md) and reuses the EVM path from [US-4.5](US-4.5-evm-network-support.md) for Flow EVM.
- Sibling of [US-4.14](US-4.14-midnight-network-support.md), [US-4.16](US-4.16-cosmos-ecosystem-support.md), [US-4.17](US-4.17-solana-support.md).

### What we explicitly did NOT do

- No Flow transfer or dApp UX in this story — scoped to dual-runtime presence + balances; deferred.

### Dev notes — points

5 pts — a new-ecosystem integration spanning two runtimes (Cadence API object +
Flow EVM reuse), per SKILL §3a-bis (1 external system integration). Forward-looking
(FR-46 planned).

### References

- [Source: PRD FR-46](../../PRD.md#epic-4--chain-management) — Flow network support (Cadence & EVM)
- [Source: ARCHITECTURE AD-02](../../ARCHITECTURE.md#architecture-decisions) — ChainService per-chain API objects
- [Source: ARCHITECTURE AD-11](../../ARCHITECTURE.md#architecture-decisions) — unified multi-chain account model
- [Roadmap: #4760](https://github.com/Koniverse/SubWallet-Extension/issues/4760) — [Integration] Support Flow Network (Cadence & EVM)

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: enable Flow → Cadence account from unified seed, address shown |
| AC-2 | Manual: Flow EVM balances resolve via the EVM path |
| AC-3 | Manual: native Flow FLOW/Cadence-token balances resolve |
| AC-4 | Manual: block a Flow endpoint → unavailable state, other chains fine |

## Changelog entry

### Added
- Flow network support across the native Cadence runtime and Flow EVM, with seed-derived accounts and balance display.

**Commit**:

## Implementation notes

_Forward-looking (FR-46 planned). Fill on implementation._

## Cross-references

- [PRD FR-46](../../PRD.md#epic-4--chain-management) · [Epic EPIC-4](../epics/EPIC-4.md) · [US-4.5](US-4.5-evm-network-support.md) · [#4760](https://github.com/Koniverse/SubWallet-Extension/issues/4760)
