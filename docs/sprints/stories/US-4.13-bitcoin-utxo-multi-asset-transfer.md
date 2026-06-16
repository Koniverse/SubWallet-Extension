---
id: US-4.13
title: "Bitcoin UTXO multi-asset transfer & custom fee"
epic: EPIC-4
status: backlog
priority: P1
points: 5
sprint:
version_shipped:
prd_ref: [FR-44]
arch_ref: [AD-12, AD-19]
depends_on: [US-4.6]
assignee:
commit:
created: 2026-06-12
updated: 2026-06-12
---

## Goal

A user can send Bitcoin and Bitcoin-native assets with explicit control over UTXO
selection and the fee rate, so they can move multiple assets and tune cost/speed
on the UTXO model the way the rest of the wallet handles account-model chains.

## Background

The Bitcoin network integration ([US-4.6](US-4.6-bitcoin-network-integration.md))
established the three-address keyring (BIP44/84/86), the PSBT signing model
([AD-12](../../ARCHITECTURE.md#architecture-decisions)) and the backend-proxied
indexer ([AD-19](../../ARCHITECTURE.md#architecture-decisions)). This story builds
the **transfer path** on top: a UTXO coin-selection + PSBT-construction flow that
supports Bitcoin-native multi-asset transfers and exposes a manual fee-rate
control (sat/vB), so the user is not locked to a single estimated fee. Because
Bitcoin is UTXO-based, fee and change handling differ fundamentally from the
account-model send flow in [EPIC-8](../epics/EPIC-8.md) — this chain-level UTXO/fee
modelling is why the story sits in chain-management rather than the generic
transaction epic.

This story is **forward-looking** — FR-44 is `📋 planned`. It depends on the
shipped Bitcoin address/API model and reuses the backend-proxied indexer for UTXO
enumeration and fee estimation.

Tracked by [#4366](https://github.com/Koniverse/SubWallet-Extension/issues/4366) —
[UTXO] Transfer multi assets in one transaction, and
[#4355](https://github.com/Koniverse/SubWallet-Extension/issues/4355) — Support for
custom fees and a transfer maximum for Bitcoin.

Materializes [FR-44](../../PRD.md#epic-4--chain-management).

## Acceptance criteria

- [ ] **AC-1** — **Given** a funded Bitcoin account, **When** the user sends BTC,
  **Then** UTXOs are selected, a PSBT is built, signed and broadcast, change
  returns to the account, and the tx appears in history (AD-12).
- [ ] **AC-2** — **Given** a Bitcoin-native multi-asset context, **When** the user
  transfers a non-BTC Bitcoin asset, **Then** the correct UTXOs/outputs are
  constructed for that asset in one signed PSBT.
- [ ] **AC-3** — **Given** the send screen, **When** the user sets a custom fee
  rate (sat/vB), **Then** the PSBT uses that rate and shows the resulting total
  fee and estimated confirmation before signing.
- [ ] **AC-4** — **Given** insufficient funds for amount + fee, a dust output, or
  an unreachable indexer, **When** the user attempts the transfer, **Then** a clear
  error is shown and nothing is broadcast.

## Tasks

- [ ] **TASK-4.13.1** — UTXO enumeration + coin selection via the backend-proxied indexer (AC: 1, 4)
- [ ] **TASK-4.13.2** — PSBT construction (inputs/outputs/change) + sign + broadcast + history (AC: 1, 2)
- [ ] **TASK-4.13.3** — Bitcoin-native multi-asset output construction (AC: 2)
- [ ] **TASK-4.13.4** — Custom fee-rate control (sat/vB) with total-fee + ETA preview (AC: 3)
- [ ] **TASK-4.13.5** — Insufficient-funds / dust / indexer-unavailable error states (AC: 4)

## Dev notes

### Architecture constraints

- [AD-12](../../ARCHITECTURE.md#architecture-decisions) — transfers are constructed as PSBTs against the three-address Bitcoin keyring.
- [AD-19](../../ARCHITECTURE.md#architecture-decisions) — UTXO enumeration and fee estimation go through the backend-proxied indexer (no key in bundle).
- This story introduces no new AD entries; if multi-asset Bitcoin (e.g. Runes/BRC-20) modelling warrants a decision at implementation time, append a CONTEXT entry then.

### Cross-story dependencies

- Builds on [US-4.6](US-4.6-bitcoin-network-integration.md) — reuses the Bitcoin keyring (BIP44/84/86), PSBT model and proxied indexer.
- Related to the Bitcoin Ordinals/inscriptions display (EPIC-9) and Bitcoin dApp PSBT connection (EPIC-10) — coordinate the PSBT-building helpers if shared.

### Performance budget

- UTXO selection + PSBT build is a foreground send action; coin selection must stay responsive for accounts with many UTXOs (paginate/limit indexer reads rather than fetching the full UTXO set synchronously).

### What we explicitly did NOT do

- No replace-by-fee (RBF) bump UI in this story — deferred; trigger to revisit: user demand for stuck-tx acceleration.
- No coin-control UI for manual per-UTXO selection beyond automatic selection — deferred to a later iteration.

### Dev notes — points

5 pts — an external-system transfer path with non-trivial chain-level modelling
(UTXO coin selection, PSBT multi-asset outputs, custom fee), per SKILL §3a-bis (1
external system integration). Forward-looking (FR-44 planned).

### References

- [Source: PRD FR-44](../../PRD.md#epic-4--chain-management) — Bitcoin UTXO multi-asset transfer & custom fee control
- [Source: ARCHITECTURE AD-12](../../ARCHITECTURE.md#architecture-decisions) — Bitcoin integration model (PSBT)
- [Source: ARCHITECTURE AD-19](../../ARCHITECTURE.md#architecture-decisions) — backend proxy for API keys
- [Roadmap: #4366](https://github.com/Koniverse/SubWallet-Extension/issues/4366) — [UTXO] Transfer multi assets in one transaction
- [Roadmap: #4355](https://github.com/Koniverse/SubWallet-Extension/issues/4355) — Support for custom fees and a transfer maximum for Bitcoin

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: send BTC → PSBT built/signed/broadcast, change returns, tx in history |
| AC-2 | Manual: transfer a Bitcoin-native asset → correct outputs in one PSBT |
| AC-3 | Manual: set a custom sat/vB → PSBT uses it, fee + ETA shown pre-sign |
| AC-4 | Manual: insufficient funds / dust / blocked indexer → error, nothing broadcast |

## Changelog entry

### Added
- Bitcoin UTXO multi-asset transfer with PSBT construction, change handling and a manual custom fee-rate (sat/vB) control.

**Commit**:

## Implementation notes

_Forward-looking (FR-44 planned). Fill on implementation._

## Cross-references

- [PRD FR-44](../../PRD.md#epic-4--chain-management) · [Epic EPIC-4](../epics/EPIC-4.md) · [US-4.6](US-4.6-bitcoin-network-integration.md) · [#4366](https://github.com/Koniverse/SubWallet-Extension/issues/4366) · [#4355](https://github.com/Koniverse/SubWallet-Extension/issues/4355)
