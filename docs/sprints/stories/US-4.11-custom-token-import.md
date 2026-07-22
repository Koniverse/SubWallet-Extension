---
id: US-4.11
title: "Custom token import (ERC-20 / PSP-22)"
epic: EPIC-4
status: done
priority: P1
points: 3
sprint:
version_shipped: 0.6.7
prd_ref: [FR-42]
arch_ref: [AD-02]
depends_on: [US-4.1]
assignee: nulllpc
commit: 2b181e4c8a, 52d791e49c, 35f5a8aa31
created: 2026-06-12
updated: 2026-06-12
---

## Goal

A user can add any ERC-20 or PSP-22 token to the wallet by pasting its contract
address, so tokens that are not yet in the bundled registry still show a balance
and can be transferred.

## Background

Not every token ships in the auto-updated asset registry
([US-4.3](US-4.3-auto-update-chain-list-and-token-metadata.md)). Custom token
import lets a user add a fungible token by contract address on an already-enabled
chain — ERC-20 on EVM networks, PSP-22 on Substrate contract chains — by reading
the on-chain token metadata (symbol, decimals) through the chain's `ChainService`
API object ([AD-02](../../ARCHITECTURE.md#architecture-decisions)) and writing a
custom entry into the asset registry. The imported token then participates in
balance detection and transfer like any registry token.

This story covers **adding** custom tokens; controlling per-token visibility
(show/hide, including registry tokens) is the sibling
[US-4.12](US-4.12-token-registry-enable-disable.md). It depends on the chain
already being enabled ([US-4.1](US-4.1-add-remove-networks-and-custom-rpc.md)).

Materializes [FR-42](../../PRD.md#epic-4--chain-management). **Retroactive** —
already shipped.

## Acceptance criteria

- [x] **AC-1** — **Given** an enabled EVM chain, **When** the user pastes a valid
  ERC-20 contract address, **Then** the token's symbol/decimals are read on-chain
  and a custom asset-registry entry is created.
- [x] **AC-2** — **Given** an enabled Substrate contract chain, **When** the user
  pastes a valid PSP-22 contract address, **Then** the token is imported the same
  way.
- [x] **AC-3** — **Given** an imported custom token, **When** the portfolio
  refreshes, **Then** its balance is detected and it is transferable like a
  registry token.
- [x] **AC-4** — **Given** an invalid contract address, an address on a disabled
  chain, or a non-token contract, **When** the user attempts import, **Then** a
  clear validation error is shown and no registry entry is created.

## Tasks

- [x] **TASK-4.11.1** — Import-by-contract flow: read on-chain token metadata (symbol/decimals) per ecosystem (AC: 1, 2)
- [x] **TASK-4.11.2** — Write custom entry into the asset registry; wire into balance detection (AC: 3)
- [x] **TASK-4.11.3** — Validation: bad/duplicate/non-token contract, disabled chain → error, no entry (AC: 4)

## Dev notes

### Architecture constraints

- [AD-02](../../ARCHITECTURE.md#architecture-decisions) — token metadata is read through the chain's existing per-chain API object; import does not create a new chain object.
- The custom entry lives in the same asset registry the auto-update channel (AD-25, [US-4.3](US-4.3-auto-update-chain-list-and-token-metadata.md)) populates; custom entries must not be overwritten by a registry refresh.
- This story introduces no new AD entries.

### Cross-story dependencies

- Builds on [US-4.1](US-4.1-add-remove-networks-and-custom-rpc.md) — import targets an already-enabled chain's API object.
- Sibling [US-4.12](US-4.12-token-registry-enable-disable.md) — both mutate the asset registry; coordinate the registry shape (custom-entry flag + visibility flag).

### Dev notes — points

3 pts — a config/registry feature on top of existing chain API objects (no new
ecosystem, no external system): read metadata + write a registry entry, per SKILL
§3a-bis (multi-doc / internal integration).

### References

- [Source: PRD FR-42](../../PRD.md#epic-4--chain-management) — add ERC-20 / PSP-22 tokens by contract address
- [Source: ARCHITECTURE AD-02](../../ARCHITECTURE.md#architecture-decisions) — ChainService per-chain API objects

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: paste an ERC-20 contract on an EVM chain → symbol/decimals read, token added |
| AC-2 | Manual: paste a PSP-22 contract on a Substrate contract chain → token added |
| AC-3 | Manual: imported token shows a balance and is transferable |
| AC-4 | Manual: bad address / disabled chain → validation error, no entry |

## Changelog entry

### Added
- Custom token import: add ERC-20 / PSP-22 tokens by contract address on an enabled chain (on-chain metadata read into the asset registry).

**Commit**:

## Implementation notes

Backfilled by US-21.2 (multi-agent trace + adversarial verify, run `wf_6b56f4cd-d08`; trace confidence: high, rule: completion).

**Evidence:** Title enumerates ERC-20 + PSP-22, so completion rule applies: ERC-20 import first shipped in 0.4.1 ("Support import ERC20 and ERC721 for EVM Networks (#160)"), and the enumeration completes in 0.6.7 ("Support token import for PSP-22 and PSP-34 (#477)", 2022-10-22); the PSP-22 work landed via PR #698 (branch koni/dev/issue-635) whose merge and feature commits are all ancestors of v0.6.7 (verified with git merge-base --is-ancestor), with v0.6.7 the first tag containing them.

Commits `2b181e4c8a, 52d791e49c, 35f5a8aa31` verified contained in the v0.6.7 anchor via `git merge-base --is-ancestor`; assignee resolved through the [US-21.1 contributor map](../../notes/contributor-map.md).

## Cross-references

- [PRD FR-42](../../PRD.md#epic-4--chain-management) · [Epic EPIC-4](../epics/EPIC-4.md) · [US-4.12](US-4.12-token-registry-enable-disable.md) · [US-4.3](US-4.3-auto-update-chain-list-and-token-metadata.md)
