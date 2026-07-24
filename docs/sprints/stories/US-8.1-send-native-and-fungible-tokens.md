---
id: US-8.1
title: "Send native & fungible tokens"
epic: EPIC-8
status: done
priority: P1
points: 3
sprint: sprint-2022-M05
version_shipped: 0.4.1
prd_ref: [FR-74]
arch_ref: [AD-02]
depends_on: [US-8.7]
assignee: saltict
commit: f9a9f7c03aad78aac5671c32524f53867af7cad8, de3efec71278634a3d8af07c4e97c8f432b9499c, 05004aa19b45420e4039ea74c808b6d6e8b7cbe7
created: 2026-06-12
updated: 2026-06-12
---

## Goal

A user can send native tokens and fungible tokens (ERC-20, PSP-22) from any of
their accounts to any compatible address across all five ecosystems — Substrate,
EVM, Bitcoin, TON and Cardano — so that the wallet does the one thing a wallet is
for: move value out. This is the entry point of the money-movement surface; the
fee, safety and history stories all hang off the flow this story establishes.

## Status

> **✅ done — shipped in 0.4.1.** All acceptance criteria are ticked and the 59 rows below are
> settled: 58 delivered, 1 closed without shipping. **This is the largest story in the epic** — and
> the reason is in the titles: *"Can't send ASTR"*, *"Add support send EQ token"*, *"Support transfer
> BIT on Pioneer"*, *"Support transfer on TON"*, *"Support transfer for Bitcoin"*. Sending is one
> capability with a per-chain, per-token tail that never ends.

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

- [x] **AC-1** — **Given** an account with a transferable native balance, **When**
  the user enters a valid recipient and amount and confirms, **Then** the transfer
  is built via the chain's ChainService API (AD-02) and submitted through the
  shared transaction lifecycle, appearing in history.
- [x] **AC-2** — **Given** a fungible token (ERC-20 on EVM, PSP-22 on WASM),
  **When** the user sends it, **Then** the correct contract transfer is built for
  that ecosystem and the token's decimals are honoured in base units (no float).
- [x] **AC-3** — **Given** a send across each supported ecosystem (Substrate, EVM,
  Bitcoin, TON, Cardano), **When** the recipient address is for that ecosystem,
  **Then** the send succeeds; an address that does not match the selected
  token's ecosystem is rejected with an inline validation error before submission.
- [x] **AC-4** — **Given** an amount that exceeds the transferable balance (or
  leaves too little for fees), **When** the user attempts to confirm, **Then** the
  send is blocked with a clear error and no transaction is submitted.

## Tasks

- [x] **TASK-8.1.1** — Send form: recipient + token + amount with transferable-balance bound (AC: 1, 4)
  - [x] Read transferable balance from the balance engine (EPIC-7, FR-69).
- [x] **TASK-8.1.2** — Per-ecosystem transfer build via ChainService (AC: 1, 2, 3)
  - [x] Native Substrate `balances.transfer`; EVM ERC-20 `transfer`; PSP-22; BTC UTXO; TON jetton; Cardano asset.
- [x] **TASK-8.1.3** — Address + ecosystem validation; reject cross-ecosystem mismatch inline (AC: 3)
- [x] **TASK-8.1.4** — Submit through the shared transaction lifecycle; record in history (AC: 1)
- [x] **TASK-8.1.5** — Amount/decimals in base units (no float); block over-balance sends (AC: 2, 4)

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

## Incremental work, fixes & chores

**59 tracker issues** landed on the send path — 42 with a release, 16 delivered with no line naming
them, 1 closed without shipping. Folded in from the former one-issue-per-story maintenance ledger
(2026-07-24).

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 0.4.1 | [#32](https://github.com/Koniverse/SubWallet-Extension/issues/32) | Send / Receive EVM assets: Moonbeam & Moonriver and Popular Substrate | ✅ done |
| 0.4.1 | [#118](https://github.com/Koniverse/SubWallet-Extension/issues/118) | Add support transfer some special tokens of Acala, Karura, Interlay, Bifrost | ✅ done |
| 0.4.1 | [#143](https://github.com/Koniverse/SubWallet-Extension/issues/143) | Implement Send fund UI with new Send Fund API | ✅ done |
| 0.4.2 | [#282](https://github.com/Koniverse/SubWallet-Extension/issues/282) | Bug when select aUSD (Acala) to transfer | ✅ done |
| 0.5.2 | [#393](https://github.com/Koniverse/SubWallet-Extension/issues/393) | Improve the UX for contracts transaction with EVM provider | ✅ done |
| 0.5.3 | [#310](https://github.com/Koniverse/SubWallet-Extension/issues/310) | Bug happens on Send Fund/Donate screen when Delete Custom Network | ✅ done |
| 0.5.4 | [#472](https://github.com/Koniverse/SubWallet-Extension/issues/472) | Support Crosschain transfer: aUSD | ✅ done |
| 0.6.5 | [#665](https://github.com/Koniverse/SubWallet-Extension/issues/665) | Support transfer BIT token on Pioneer Network | ✅ done |
| 0.7.4 | [#859](https://github.com/Koniverse/SubWallet-Extension/issues/859) | [Substrate] Update function parse transaction | ✅ done |
| 0.8.1 | [#984](https://github.com/Koniverse/SubWallet-Extension/issues/984) | Add support send EQ token | ✅ done |
| 1.0.2 | [#1232](https://github.com/Koniverse/SubWallet-Extension/issues/1232) | An error occurs when send some token (DOT (Genshiro), xcUNIT (Moonbase)) | ✅ done |
| 1.0.3 | [#1254](https://github.com/Koniverse/SubWallet-Extension/issues/1254) | Improve Transaction UX | ✅ done |
| 1.0.3 | [#1294](https://github.com/Koniverse/SubWallet-Extension/issues/1294) | Can not send EVM Transaction from DApps | ✅ done |
| 1.0.5 | [#1308](https://github.com/Koniverse/SubWallet-Extension/issues/1308) | A pending transaction frenzy can lead to duplicate transactions being created within the same session. | ✅ done |
| 1.0.7 | [#1451](https://github.com/Koniverse/SubWallet-Extension/issues/1451) | Error page when send token of the custom network | ✅ done |
| 1.0.7 | [#1460](https://github.com/Koniverse/SubWallet-Extension/issues/1460) | Script test send fund and fix bug when send fund for some tokens | ✅ done |
| 1.0.7 | [#1482](https://github.com/Koniverse/SubWallet-Extension/issues/1482) | Optimize require enable token in Transaction Screen | ✅ done |
| 1.0.8 | [#1385](https://github.com/Koniverse/SubWallet-Extension/issues/1385) | Update notification in case transaction time out | ✅ done |
| 1.0.8 | [#1492](https://github.com/Koniverse/SubWallet-Extension/issues/1492) | Re-check send fund ERC20  token Polygon | ✅ done |
| 1.0.9 | [#1449](https://github.com/Koniverse/SubWallet-Extension/issues/1449) | Review and support send for more token | ✅ done |
| 1.0.9 | [#1522](https://github.com/Koniverse/SubWallet-Extension/issues/1522) | Do not transfer BNC (Bifrost Polkadot) | ✅ done |
| 1.1.2 | [#1418](https://github.com/Koniverse/SubWallet-Extension/issues/1418) | Update transaction QR code style | ✅ done |
| 1.1.14 | [#1949](https://github.com/Koniverse/SubWallet-Extension/issues/1949) | Update transfer function for Pendulum | ✅ done |
| 1.1.19 | [#2042](https://github.com/Koniverse/SubWallet-Extension/issues/2042) | Re-check transfer function in Polkadot, Kusama network | ✅ done |
| 1.1.21 | [#2146](https://github.com/Koniverse/SubWallet-Extension/issues/2146) | Re-check bug undefined is not an object when perform transaction | ✅ done |
| 1.1.41 | [#2649](https://github.com/Koniverse/SubWallet-Extension/issues/2649) | Extension - Send crash log feature | ✅ done |
| 1.1.42 | [#2659](https://github.com/Koniverse/SubWallet-Extension/issues/2659) | Extension - Update transaction result screen | ✅ done |
| 1.1.65 | [#3041](https://github.com/Koniverse/SubWallet-Extension/issues/3041) | Extension - An error occured in case of transfering PANX (Aleph zero) | ✅ done |
| 1.1.66 | [#2852](https://github.com/Koniverse/SubWallet-Extension/issues/2852) | Support showing balance & transfer for GRC20 tokens | ✅ done |
| 1.1.66 | [#3067](https://github.com/Koniverse/SubWallet-Extension/issues/3067) | Support importing GRC20 token | ✅ done |
| 1.2.2 | [#2517](https://github.com/Koniverse/SubWallet-Extension/issues/2517) | Bug can not send fund on Moonbeam with Polkadot Vault account | ✅ done |
| 1.2.6 | [#3095](https://github.com/Koniverse/SubWallet-Extension/issues/3095) | Support transfer between PAH - KAH | ✅ done |
| 1.2.28 | [#3452](https://github.com/Koniverse/SubWallet-Extension/issues/3452) | Extension - Re-check UI on Transfer screen ( version 1.1.24) | ✅ done |
| 1.2.32 | [#3711](https://github.com/Koniverse/SubWallet-Extension/issues/3711) | Review logic fetching transferable balance | ✅ done |
| 1.3.1 | [#3449](https://github.com/Koniverse/SubWallet-Extension/issues/3449) | Support transfer on TON | ✅ done |
| 1.3.7 | [#3852](https://github.com/Koniverse/SubWallet-Extension/issues/3852) | Extension - Re-check transaction on Polkadot Asset Hub | ✅ done |
| 1.3.10 | [#3896](https://github.com/Koniverse/SubWallet-Extension/issues/3896) | Extension - Unable to transfer local token on Bifrost | ✅ done |
| 1.3.11 | [#3861](https://github.com/Koniverse/SubWallet-Extension/issues/3861) | Extension - Check for errors when making transactions on Tangle mainnet | ✅ done |
| 1.3.23 | [#3862](https://github.com/Koniverse/SubWallet-Extension/issues/3862) | Support transfer ADA and Cardano Native Assets (CIP-26) | ✅ done |
| 1.3.42 | [#4263](https://github.com/Koniverse/SubWallet-Extension/issues/4263) | Extension - Support transfer for Bitcoin | ✅ done |
| 1.3.77 | [#4954](https://github.com/Koniverse/SubWallet-Extension/issues/4954) | Extension - Turn off warning popup for transfers between PAH <> KAH | ✅ done |
| 1.3.78 | [#4900](https://github.com/Koniverse/SubWallet-Extension/issues/4900) | Support Transfer Alpha Token | ✅ done |
| — | [#7](https://github.com/Koniverse/SubWallet-Extension/issues/7) | Send/Receive substrate based chain assets | ✅ done |
| — | [#154](https://github.com/Koniverse/SubWallet-Extension/issues/154) | PHA token transfer successfully but the extension infinity loading | ✅ done |
| — | [#233](https://github.com/Koniverse/SubWallet-Extension/issues/233) | Integrate new send asset flow with custom networks feature | ✅ done |
| — | [#234](https://github.com/Koniverse/SubWallet-Extension/issues/234) | Add support transfer Bifrost sub token | ✅ done |
| — | [#286](https://github.com/Koniverse/SubWallet-Extension/issues/286) | Support transfer balance for the Custom Network | ✅ done |
| — | [#293](https://github.com/Koniverse/SubWallet-Extension/issues/293) | Support transferring native token when adding custom network | ✅ done |
| — | [#326](https://github.com/Koniverse/SubWallet-Extension/issues/326) | Function for perform transferring using web3.js | ✅ done |
| — | [#338](https://github.com/Koniverse/SubWallet-Extension/issues/338) | Can't send token INTERBNC (Kintsugi)/taiKSM (Karura), USDC (Karura) | ✅ done |
| — | [#512](https://github.com/Koniverse/SubWallet-Extension/issues/512) | Can't send ASTR (Astar) token | ✅ done |
| — | [#563](https://github.com/Koniverse/SubWallet-Extension/issues/563) | Support send fund for sub-token on some chain | ✅ done |
| — | [#1223](https://github.com/Koniverse/SubWallet-Extension/issues/1223) | Send multiple transactions | ✅ done |
| — | [#1512](https://github.com/Koniverse/SubWallet-Extension/issues/1512) | Re-check all transaction on Westend | ✅ done |
| — | [#1645](https://github.com/Koniverse/SubWallet-Extension/issues/1645) | Support Zk Assets transaction | ⏸ deprecated |
| — | [#2688](https://github.com/Koniverse/SubWallet-Extension/issues/2688) | [Hotfix] Temporary disable transfer on NUUM token | ✅ done |
| — | [#2727](https://github.com/Koniverse/SubWallet-Extension/issues/2727) | Support transferring Unique NFTs | ✅ done |
| — | [#2757](https://github.com/Koniverse/SubWallet-Extension/issues/2757) | Check transfer not being submitted on Polimec | ✅ done |
| — | [#4138](https://github.com/Koniverse/SubWallet-Extension/issues/4138) | Error when send transaction on Autonomys | ✅ done |

> **The tail is the story.** Roughly two thirds of these rows name a chain or a token: Acala,
> Karura, Kintsugi, Astar, Bifrost, Pioneer, Equilibrium, Genshiro, Moonbeam, Polygon, Polimec,
> Tangle, Autonomys, TON, Cardano, Bitcoin, Bittensor. Every ecosystem the wallet adds re-opens the
> same question — *what does a transfer extrinsic look like here* — and the answer is never
> inherited.
>
> **#2688 is the shape of the emergency lever**: *"[Hotfix] Temporarily disable transfer on NUUM
> token"*. When a token's transfer path is wrong, the honest move is to take it away.
>
> **#1645 (`Support ZK assets transaction`) closed without shipping** — the same zkAsset scope that
> [US-20.10](US-20.10-early-performance-passes.md) records being *removed* from the web-runner
> bundle in 1.1.3 as a performance win. Two ledgers, one decision not to carry zkAssets.

## Cross-references

- [PRD FR-74](../../PRD.md#functional-requirements)
- [Epic EPIC-8](../epics/EPIC-8.md)
- [US-8.3](US-8.3-custom-fee-and-tip.md)
- [US-8.7](US-8.7-existential-deposit-safety-guard.md)
- [consolidation note](../../notes/2026-07-24.md#a-epic-28-maintenance--transactions-merged-into-epic-8)
