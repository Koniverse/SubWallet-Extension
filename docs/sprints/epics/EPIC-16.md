---
id: EPIC-16
title: "hardware-wallet"
status: in-progress
prd_ref:
  - FR-146
  - FR-147
  - FR-148
  - FR-149
arch_ref:
  - AD-04
created: 2026-06-11
updated: 2026-06-11
---

## Goal

Serve security-conscious users with cold-storage signing — the private key never
enters the extension; the signing step completes on an external device.

## Overview

### Business context

Before this epic, signing is only possible with software keys held in the
background keyring (EPIC-3). EPIC-16 adds the **external-device signing path**:
the wallet builds and validates the payload, the device signs, and the wallet
submits — the offline branch of the keyring boundary ([AD-04](../../ARCHITECTURE.md#architecture-decisions),
[NFR-14](../../PRD.md)). Supported devices differ only in **transport**: Ledger
over USB/WebHID, Keystone and Polkadot Vault over QR, with more devices planned.

The epic owns **how an external device completes a signature**, not what is being
signed: transaction building belongs to [EPIC-8](EPIC-8.md), the approval/request
queue to [EPIC-2](EPIC-2.md) (RequestService), and software-key accounts to
[EPIC-3](EPIC-3.md).

> FR statuses below are **story-planning** statuses; shipped state is in [PRD](../../PRD.md).

### Out of scope

- **Software-key accounts** — owned by [EPIC-3](EPIC-3.md). Those keys live in the keyring, not on a device.
- **The approval / request queue** — owned by [EPIC-2](EPIC-2.md) (RequestService). Hardware signing plugs into it.
- **Transaction building & submission** — owned by [EPIC-8](EPIC-8.md). This epic only completes the signature step.

## FR Coverage

| FR | Story | Status |
|----|-------|--------|
| FR-146 | [US-16.1](../stories/US-16.1-ledger-hardware-wallet-signing.md) | 📋 backlog |
| FR-147 | [US-16.2](../stories/US-16.2-qr-signing-keystone-and-polkadot-vault.md) | 📋 backlog |
| FR-148 | [US-16.2](../stories/US-16.2-qr-signing-keystone-and-polkadot-vault.md) | 📋 backlog |
| FR-149 | US-16.3 _(planned)_ | 📋 backlog |

## Stories

| ID | Title | Goal | Status | Version |
|---|---|---|---|---|
| [US-16.1](../stories/US-16.1-ledger-hardware-wallet-signing.md) | Ledger hardware-wallet signing | Sign over USB across Substrate generic/per-chain/EVM apps, key never leaves device | 📋 backlog | — |
| [US-16.2](../stories/US-16.2-qr-signing-keystone-and-polkadot-vault.md) | QR-based signing — Keystone & Polkadot Vault | Fully-offline QR display→scan→submit signing round trip | 📋 backlog | — |
| US-16.3 | Additional hardware wallets (roadmap) | Trezor, Tangem, D'Cent, Keystone 3 Pro | 📋 backlog | — |

## Cross-cutting invariants

- **Key never enters the extension ([NFR-14](../../PRD.md), AD-04):** every device
  flow completes the signature off-extension; the wallet only exchanges
  payload/signature. Enforced by each story's AC-1.
- **Transport-adapter abstraction:** a new device is a new transport adapter on the
  shared signing surface (USB / QR / NFC), not new signing logic — the basis for
  the planned devices in FR-149.

## Acceptance criteria (propagated from stories)

- [ ] A transaction can be signed + submitted via Ledger over USB across Substrate
      generic / per-chain / EVM apps, key never leaving the device — [US-16.1](../stories/US-16.1-ledger-hardware-wallet-signing.md)
- [ ] A transaction can be signed + submitted fully offline via Keystone and
      Polkadot Vault over QR — [US-16.2](../stories/US-16.2-qr-signing-keystone-and-polkadot-vault.md)
- [ ] _(pending story for FR-149 — additional devices: Trezor, Tangem, D'Cent, Keystone 3 Pro)_
