---
id: US-8.1
title: "Send native & fungible tokens"
epic: EPIC-8
status: backlog
priority: P1
points: 3
sprint:
version_shipped:
prd_ref: [FR-74]
arch_ref: [AD-02]
depends_on: [US-8.7]
assignee:
commit:
created: 2026-06-12
updated: 2026-06-12
---

## Goal

A user can send native tokens and fungible tokens (ERC-20, PSP-22) from any of
their accounts to any compatible address across all five ecosystems — Substrate,
EVM, Bitcoin, TON and Cardano — so that the wallet does the one thing a wallet is
for: move value out. This is the entry point of the money-movement surface; the
fee, safety and history stories all hang off the flow this story establishes.

## Background

Sending is the canonical write path. The send flow is *content*, not *mechanism*:
it gathers recipient + token + amount, reads the transferable balance from the
balance engine ([EPIC-7](../epics/EPIC-7.md), FR-69), bounds the amount by the
existential-deposit guard ([US-8.7](US-8.7-existential-deposit-safety-guard.md)),
and hands a typed transfer to the shared transaction lifecycle engine
([EPIC-2](../epics/EPIC-2.md), FR-12) which validates, signs (via RequestService),
submits and records it. EPIC-8 owns *which fields the user fills and how errors are
shown*; EPIC-2 owns the submit/track/record machine underneath.

Per-ecosystem chain APIs come from `ChainService`
([AD-02](../../ARCHITECTURE.md#architecture-decisions)) — a native Substrate
`balances.transfer`, an EVM ERC-20 `transfer`, a WASM PSP-22 call, a BTC UTXO
spend, a TON jetton transfer and a Cardano asset transfer all build differently but
submit through the same lifecycle. Sized 3 (multi-doc/flow but composes existing
engines; per-ecosystem build is the chain-API surface, not new infra). Materializes
[FR-74](../../PRD.md#functional-requirements). This story is **Retroactive** —
the capability already ships; `commit` / `version_shipped` are backfilled during
version reconciliation.

## Acceptance criteria

- [ ] **AC-1** — **Given** an account with a transferable native balance, **When**
  the user enters a valid recipient and amount and confirms, **Then** the transfer
  is built via the chain's ChainService API (AD-02) and submitted through the
  shared transaction lifecycle, appearing in history.
- [ ] **AC-2** — **Given** a fungible token (ERC-20 on EVM, PSP-22 on WASM),
  **When** the user sends it, **Then** the correct contract transfer is built for
  that ecosystem and the token's decimals are honoured in base units (no float).
- [ ] **AC-3** — **Given** a send across each supported ecosystem (Substrate, EVM,
  Bitcoin, TON, Cardano), **When** the recipient address is for that ecosystem,
  **Then** the send succeeds; an address that does not match the selected
  token's ecosystem is rejected with an inline validation error before submission.
- [ ] **AC-4** — **Given** an amount that exceeds the transferable balance (or
  leaves too little for fees), **When** the user attempts to confirm, **Then** the
  send is blocked with a clear error and no transaction is submitted.

## Tasks

- [ ] **TASK-8.1.1** — Send form: recipient + token + amount with transferable-balance bound (AC: 1, 4)
  - [ ] Read transferable balance from the balance engine (EPIC-7, FR-69).
- [ ] **TASK-8.1.2** — Per-ecosystem transfer build via ChainService (AC: 1, 2, 3)
  - [ ] Native Substrate `balances.transfer`; EVM ERC-20 `transfer`; PSP-22; BTC UTXO; TON jetton; Cardano asset.
- [ ] **TASK-8.1.3** — Address + ecosystem validation; reject cross-ecosystem mismatch inline (AC: 3)
- [ ] **TASK-8.1.4** — Submit through the shared transaction lifecycle; record in history (AC: 1)
- [ ] **TASK-8.1.5** — Amount/decimals in base units (no float); block over-balance sends (AC: 2, 4)

## Dev notes

### Architecture constraints

- [AD-02](../../ARCHITECTURE.md#architecture-decisions) — each ecosystem's transfer is built against its dedicated `ChainService` API object (`SubstrateApi` / `EvmApi` and the per-ecosystem equivalents); the send flow does not hold its own RPC connections.
- This story does NOT introduce new AD entries. Submit/track/record is the EPIC-2 transaction lifecycle (FR-12); signing is the RequestService queue (FR-11, AD-21) — consumed here, not rebuilt.

### Cross-story dependencies

- Builds on [US-8.7](US-8.7-existential-deposit-safety-guard.md) — every Substrate send routes its amount through the ED guard rather than re-deriving the threshold.
- Sibling [US-8.3](US-8.3-custom-fee-and-tip.md) — the fee/tip control attaches to this send flow; coordinate the shared confirmation surface.
- Required by [US-8.4](US-8.4-pay-fees-with-non-native-token.md) — non-native fee selection extends this send's fee step.

### References

- [Source: PRD FR-74](../../PRD.md#functional-requirements) — send native and fungible tokens
- [Source: PRD FR-69](../../PRD.md#functional-requirements) — transferable vs locked balance (EPIC-7)
- [Source: ARCHITECTURE AD-02](../../ARCHITECTURE.md#architecture-decisions) — ChainService per-chain API objects
- [Source: ARCHITECTURE §Transaction & request subsystem](../../ARCHITECTURE.md)

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: send native token → tx appears in history; unit test for transfer build (`services/transaction-service` tests) |
| AC-2 | Manual: send ERC-20 + PSP-22 → correct decimals; test asserts base-unit (`bigint`/`BN`) amount, no float |
| AC-3 | Manual: send across each ecosystem; cross-ecosystem recipient rejected inline |
| AC-4 | Manual: amount > transferable → confirm blocked, no submission |

## Changelog entry

### Added
- Send flow for native and fungible tokens (ERC-20, PSP-22) across Substrate, EVM,
  Bitcoin, TON and Cardano, with per-ecosystem transfer build via ChainService and
  submission through the shared transaction lifecycle.

**Commit**:

## Implementation notes

_Retroactive story — capability already shipped. Fill `commit`, `version_shipped`
and any implementation caveats during version reconciliation._

## Cross-references

- [PRD FR-74](../../PRD.md#functional-requirements)
- [Epic EPIC-8](../epics/EPIC-8.md)
- [US-8.3](US-8.3-custom-fee-and-tip.md)
- [US-8.7](US-8.7-existential-deposit-safety-guard.md)
