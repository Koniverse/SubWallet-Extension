---
id: EPIC-16
title: "Hardware Wallet Signing"
status: in-progress
prd_ref:
  - FR-144
  - FR-145
  - FR-146
  - FR-147
arch_ref:
  - AD-04
created: 2026-06-11
updated: 2026-07-24
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
[NFR-14](../../PRD.md#non-functional-requirements)). Supported devices differ only in **transport**: Ledger
over USB/WebHID, Keystone and Polkadot Vault over QR, with more devices planned.

The epic owns **how an external device completes a signature**, not what is being
signed: transaction building belongs to [EPIC-8](EPIC-8.md), the approval/request
queue to [EPIC-2](EPIC-2.md) (RequestService), and software-key accounts to
[EPIC-3](EPIC-3.md).

> FR statuses below are **story-planning** statuses; shipped state is in [PRD](../../PRD.md#functional-requirements).

### Out of scope

- **Software-key accounts** — owned by [EPIC-3](EPIC-3.md). Those keys live in the keyring, not on a device.
- **The approval / request queue** — owned by [EPIC-2](EPIC-2.md) (RequestService). Hardware signing plugs into it.
- **Transaction building & submission** — owned by [EPIC-8](EPIC-8.md). This epic only completes the signature step.

## FR Coverage

| FR | Story | Status |
|----|-------|--------|
| FR-144 | [US-16.1](../stories/US-16.1-ledger-hardware-wallet-signing.md) | ✅ done |
| FR-145 | [US-16.2](../stories/US-16.2-qr-signing-keystone-and-polkadot-vault.md) | ✅ done |
| FR-146 | [US-16.2](../stories/US-16.2-qr-signing-keystone-and-polkadot-vault.md) | ✅ done |
| FR-147 | [US-16.3](../stories/US-16.3-additional-hardware-wallets.md) | 🟡 ready |

## Stories

| ID | Title | Goal | Status | Version |
|---|---|---|---|---|
| [US-16.1](../stories/US-16.1-ledger-hardware-wallet-signing.md) | Ledger hardware-wallet signing | Sign over USB across Substrate generic/per-chain/EVM apps, key never leaves device | ✅ done | 0.5.4 |
| [US-16.2](../stories/US-16.2-qr-signing-keystone-and-polkadot-vault.md) | QR-based signing — Keystone & Polkadot Vault | Fully-offline QR display→scan→submit signing round trip | ✅ done | 0.5.4 |
| [US-16.3](../stories/US-16.3-additional-hardware-wallets.md) | Additional hardware wallets (roadmap) | Trezor, Tangem, D'Cent, Keystone 3 Pro | 🟡 ready | — |
| [US-16.4](../stories/US-16.4-ledger-network-and-app-coverage.md) | Ledger network & app coverage | Bring one more chain — or one more chain-specific Ledger app — onto the signing surface | ✅ done | 1.3.12 |
| [US-16.5](../stories/US-16.5-ledger-connection-and-account-discovery.md) | Ledger connection & account discovery | From a plugged-in device to a usable account: enumerate, filter, attach without duplicates | ✅ done | 1.3.56 |
| [US-16.6](../stories/US-16.6-ledger-signing-across-wallet-features.md) | Ledger signing across wallet features | The hardware branch each feature needs — transfer, XCM, staking, earning, dApp, on-ramp | ✅ done | 1.3.49 |
| [US-16.7](../stories/US-16.7-generic-ledger-app-migration-and-metadata.md) | Generic Ledger app — migration & runtime metadata | One app for all chains instead of one per chain, and the metadata every runtime upgrade invalidates | ✅ done | 1.3.56 |
| [US-16.8](../stories/US-16.8-ledger-asset-recovery-tool.md) | Ledger asset-recovery tool (offline, out-of-repo) | Reach assets stranded on a derivative address the device cannot open | ✅ done | — |
| [US-16.9](../stories/US-16.9-ledger-connection-and-derivation-improvements.md) | Ledger connection & derivation improvements | Custom derivation paths, JSON import, auto-migration, dropping the legacy connector | 📋 backlog | — |
| [US-16.10](../stories/US-16.10-ledger-on-webapp-and-avail-space.md) | Ledger on the WebApp & Avail Space | The non-extension surfaces whose extension halves already shipped | 📋 backlog | — |
| [US-16.11](../stories/US-16.11-qr-device-signing-defects.md) | QR-device signing defects | A Polkadot Vault account that attaches and displays but cannot send | 🚧 in-progress | — |

> **US-16.4 … US-16.11 carry no FR.** They hold the incremental work, fixes and chores that landed
> on this epic's capabilities — **90 tracker issues** folded in from the former one-issue-per-story
> maintenance ledger on 2026-07-23 ([note](../../notes/2026-07-23.md#a-epic-36-maintenance--hardware-wallet-merged-into-epic-16)),
> plus **one recovered from the Transactions ledger** on 2026-07-24
> ([note](../../notes/2026-07-24.md#a-epic-28-maintenance--transactions-merged-into-epic-8)).
> The FR map above is unchanged; the requirement set is still four FRs and three stories.

## Umbrella issues owned by this epic

Two tracker issues here have children and no delivery of their own. They are **the epic's**, not any
story's ([AGENTS.md](../../../AGENTS.md) rule 10) — repeating an umbrella as a row would double-count
work its children already carry.

| Issue | Title | Children | Where the children are |
|---|---|---|---|
| [#4408](https://github.com/Koniverse/SubWallet-Extension/issues/4408) | Integrate Polkadot Ledger App | #2453, #3256, #3307, #3402, #3460 | all five in [US-16.7](../stories/US-16.7-generic-ledger-app-migration-and-metadata.md) |
| [#4175](https://github.com/Koniverse/SubWallet-Extension/issues/4175) | Support cold wallets | #1387, #1829, #831, #3857 | #1387, #1829, #831 in [US-16.3](../stories/US-16.3-additional-hardware-wallets.md); #3857 in [US-16.11](../stories/US-16.11-qr-device-signing-defects.md) |

> **#4408 recovered two issues the ledger never had.** Its child list is the only place
> [#2453](https://github.com/Koniverse/SubWallet-Extension/issues/2453) — *"Integrate Polkadot
> Ledger app from Zondax"*, shipped in 1.2.11 — was reachable from; the generated ledger missed it,
> and [US-16.1](../stories/US-16.1-ledger-hardware-wallet-signing.md) named it only in prose. The
> same list separates [#3402](https://github.com/Koniverse/SubWallet-Extension/issues/3402), which
> the ledger had merged into #3307's row, into an issue of its own.
>
> **#4175's other two children were hardware work sitting in other areas' ledgers, and one has now
> arrived.** [#3857](https://github.com/Koniverse/SubWallet-Extension/issues/3857) — *"Unable to send
> funds out of Polkadot Vault"* — sat in the Transactions ledger; that ledger folded on 2026-07-24
> and the issue is now [US-16.11](../stories/US-16.11-qr-device-signing-defects.md), as this epic
> recorded it would be. **[#831](https://github.com/Koniverse/SubWallet-Extension/issues/831)** —
> *"Integrate with AirGap Vault for QR signer"*, which extends
> [US-16.2](../stories/US-16.2-qr-signing-keystone-and-polkadot-vault.md)'s QR path — was in the
> **dApp** ledger and, when that folded on 2026-07-24, became the first row of
> [US-16.3](../stories/US-16.3-additional-hardware-wallets.md). Both of #4175's misfiled children are
> now home.

## Cross-cutting invariants

- **Key never enters the extension ([NFR-14](../../PRD.md#non-functional-requirements), AD-04):** every device
  flow completes the signature off-extension; the wallet only exchanges
  payload/signature. Enforced by the AC-1 of each **FR story** — US-16.1, US-16.2, US-16.3. The
  maintenance stories US-16.4 … US-16.11 assert coverage of their tracker issues, not behaviour.
- **Transport-adapter abstraction:** a new device is a new transport adapter on the
  shared signing surface (USB / QR / NFC), not new signing logic — the basis for
  the planned devices in FR-147.

## Acceptance criteria (propagated from stories)

- [ ] A transaction can be signed + submitted via Ledger over USB across Substrate
      generic / per-chain / EVM apps, key never leaving the device — [US-16.1](../stories/US-16.1-ledger-hardware-wallet-signing.md)
- [ ] A transaction can be signed + submitted fully offline via Keystone and
      Polkadot Vault over QR — [US-16.2](../stories/US-16.2-qr-signing-keystone-and-polkadot-vault.md)
- [ ] A transaction can be signed + submitted via additional cold-storage devices —
      Trezor, Tangem, D'Cent, Keystone 3 Pro — with the key never entering the
      extension, extending the same off-extension guarantee to the user's device of
      choice — [US-16.3](../stories/US-16.3-additional-hardware-wallets.md)
