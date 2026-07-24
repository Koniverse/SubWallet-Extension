---
id: US-4.4
title: "Substrate parachain registry (200+)"
epic: EPIC-4
status: done
priority: P1
points: 3
sprint: sprint-2023-M03
version_shipped: 1.0.1
prd_ref: [FR-35]
arch_ref: [AD-02, AD-07]
depends_on: [US-4.1]
assignee: saltict
commit: f5464cf01e, e7dd01a793
created: 2026-06-12
updated: 2026-06-12
---

> **⚠️ Corrected 2026-07-13 — AD-07's mechanism does not exist.** Wherever this file says
> reads ride a *"lightweight WsProvider"* and that a full `ApiPromise` is deferred to
> extrinsic construction, that is inherited from [AD-07](../../ARCHITECTURE.md#architecture-decisions),
> which was **decided in 2022 and never implemented**: `SubstrateApi` builds a full
> `ApiPromise` eagerly per enabled chain and the read path reads off it. Every memory figure
> here (~72 MB / ~264 MB) is a 2022 MV2-era claim with **no probe behind it**. **NFR-11 has
> since been retired and [US-20.3](US-20.3-read-path-memory-budget.md) deprecated** — memory
> is no longer a stated requirement ([CONTEXT D95](../../CONTEXT.md) / D96). Treat every
> memory sentence in this file as historical. If a memory complaint appears: **measure
> first** ([LESSONS §64](../../LESSONS.md)).


## Goal

The wallet ships a Polkadot/Substrate registry covering 200+ networks
(relay chains and parachains) with a live connectivity status per chain, so a
user can find and trust any Substrate network the moment they enable it.

## Status

> **✅ done — shipped in 1.0.1.** All acceptance criteria are ticked and the 27 rows below are
> settled: 25 delivered, 2 closed without shipping.

## Background

The Substrate side of the wallet is not a handful of chains — it is the whole
Polkadot/Kusama relay + parachain set, 200+ networks. Each enabled chain is a
`SubstrateApi` object wrapping `@polkadot/api`
([AD-02](../../ARCHITECTURE.md#architecture-decisions)). Doing that naïvely is a
memory problem: a full `ApiPromise` for 20 chains consumed ~264 MB, so balance/
token queries use the lightweight WsProvider connector and the full `ApiPromise`
is deferred to extrinsic construction
([AD-07](../../ARCHITECTURE.md#architecture-decisions)). The registry surfaces a
live connectivity indicator per chain so users see which endpoints are healthy.

This is the largest single-ecosystem surface in the epic and the reason the
AD-07 memory budget exists; the planned light-client fallback
([US-4.9](US-4.9-substrate-light-client-fallback.md)) extends it for chains with
no reachable RPC.

Materializes [FR-35](../../PRD.md#epic-4--chain-management). **Retroactive** —
already shipped.

## Acceptance criteria

- [x] **AC-1** — **Given** the network registry, **When** the user browses it,
  **Then** 200+ Substrate networks (relay + parachains) are listed and searchable.
- [x] **AC-2** — **Given** an enabled Substrate chain, **When** it connects via
  `SubstrateApi`, **Then** a live connectivity status (connected / connecting /
  unavailable) is shown.
- [x] **AC-3** — **Given** many enabled Substrate chains, **When** the wallet runs,
  **Then** balance/token queries use the lightweight WsProvider so RAM does not
  scale with the full ApiPromise per chain (AD-07).
- [x] **AC-4** — **Given** a chain whose endpoint is unreachable, **When** connection
  is attempted, **Then** its status shows unavailable without blocking the rest of
  the registry.

## Tasks

- [x] **TASK-4.4.1** — Registry of 200+ Substrate networks (relay + parachains), searchable (AC: 1)
- [x] **TASK-4.4.2** — Per-chain live connectivity status driven by `SubstrateApi` connect state (AC: 2, 4)
- [x] **TASK-4.4.3** — ~~WsProvider-first connection; defer full `ApiPromise` to extrinsic build~~ — **never built** (see the banner). What shipped: a `WsProvider` handed straight into a full `ApiPromise`, one per enabled chain.

## Dev notes

### Architecture constraints

- [AD-02](../../ARCHITECTURE.md#architecture-decisions) — each enabled Substrate chain is a managed `SubstrateApi` object.
- [AD-07](../../ARCHITECTURE.md#architecture-decisions) — lightweight WsProvider for balance queries; full ApiPromise only on extrinsic construction (memory ceiling).
- This story introduces no new AD entries.

### Cross-story dependencies

- Builds on [US-4.1](US-4.1-add-remove-networks-and-custom-rpc.md) — enable/disable + custom-RPC apply to registry chains.
- Required by [US-4.9](US-4.9-substrate-light-client-fallback.md) — the light client is the fallback path for registry chains with no reachable RPC.

### Performance budget

- WsProvider-only mode: RAM ~constant regardless of enabled-chain count (full ApiPromise hit ~264 MB for 20 chains).
- Story PR must confirm balance/token queries do not instantiate a full ApiPromise per chain.

### Dev notes — points

3 pts — a registry/connectivity feature on the existing Substrate API object
(`@polkadot/api` already integrated; not a new external ecosystem), per SKILL
§3a-bis.

### References

- [Source: PRD FR-35](../../PRD.md#epic-4--chain-management) — 200+-network registry with live connectivity
- [Source: ARCHITECTURE AD-02](../../ARCHITECTURE.md#architecture-decisions)
- [Source: ARCHITECTURE AD-07](../../ARCHITECTURE.md#architecture-decisions)

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: browse registry → 200+ Substrate networks searchable |
| AC-2, AC-4 | Manual: enable a chain → live status; unreachable chain → unavailable, registry usable |
| AC-3 | ⚠️ Unverifiable as written — there is no WsProvider-only mode and no memory probe. [US-20.3](US-20.3-read-path-memory-budget.md) owns measuring the real ceiling. |

## Changelog entry

### Added
- Polkadot/Substrate registry of 200+ networks with per-chain live connectivity status, on the WsProvider-first connection model.

**Commit**:

## Implementation notes

Traced 2026-07-13 (US-21.2 straggler pass; the batch-2 verifier had nulled this one as "predates tagged history"). **Completion rule** — the story's headline enumerates *200+ networks* **and** *live per-chain connectivity status*, so the version is the release that completes the enumeration, not the one that started it. The three rungs, each verified against the tree at that release's commit: an in-repo Substrate registry shipped in **0.0.1** (`endpoints.ts`, 31 networks: 3 relay + 25 parachains — a Koni original, empty at every pre-fork polkadot-js release commit); live `NETWORK_STATUS` first appears in **0.4.3**; and the in-repo registry never exceeded **76** networks (plateau 0.4.3 → 0.8.4), so *200+* is only true from **1.0.1**, the first release depending on the external `@subwallet/chain-list` package (`f5464cf01e`, "[Issue-894] Move @subwallet/chain to @subwallet/chain-list") alongside `ChainService`'s `_ChainConnectionStatus` (`e7dd01a793`). 1.0.1 has no tag; both commits verified contained in its release commit `ad2567d9ae` from docs/CHANGELOG.md.

## Incremental work, fixes & chores

**27 tracker issues** landed on the parachain registry and ecosystem integrations — 15 with a release, 10 delivered with no line naming them, 2 closed without shipping. Folded in from the former one-issue-per-story maintenance ledger (2026-07-24).

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 0.4.1 | [#203](https://github.com/Koniverse/SubWallet-Extension/issues/203) | Update Centrifuge Parachain info | ✅ done |
| 0.4.7 | [#363](https://github.com/Koniverse/SubWallet-Extension/issues/363) | Update Bifrost Polkadot Parachain | ✅ done |
| 0.5.3 | [#339](https://github.com/Koniverse/SubWallet-Extension/issues/339) | Add new networks (parachain winners on Kusama & Polkadot) | ✅ done |
| 0.5.6 | [#185](https://github.com/Koniverse/SubWallet-Extension/issues/185) | Integrate aUSD and USDT on Bifrost | ✅ done |
| 0.5.7 | [#605](https://github.com/Koniverse/SubWallet-Extension/issues/605) | Integrate Gear testnet into SubWallet | ✅ done |
| 0.6.2 | [#331](https://github.com/Koniverse/SubWallet-Extension/issues/331) | Single Mode feature customize for Parachain & Solo chains | ✅ done |
| 0.6.4 | [#608](https://github.com/Koniverse/SubWallet-Extension/issues/608) | Add new networks (new parachain winners) | ✅ done |
| 0.6.7 | [#710](https://github.com/Koniverse/SubWallet-Extension/issues/710) | Add default option for parachain inflation information | ✅ done |
| 0.6.7 | [#734](https://github.com/Koniverse/SubWallet-Extension/issues/734) | Integrate Snow Parachain | ✅ done |
| 0.7.6 | [#908](https://github.com/Koniverse/SubWallet-Extension/issues/908) | Add the missing networks in Polkadot & Parachain group | ✅ done |
| 0.7.6 | [#909](https://github.com/Koniverse/SubWallet-Extension/issues/909) | Add the missing networks in Kusama & Parachain group | ✅ done |
| 1.1.56 | [#2850](https://github.com/Koniverse/SubWallet-Extension/issues/2850) | Improve withdraw time for parachain | ✅ done |
| 1.3.25 | [#4085](https://github.com/Koniverse/SubWallet-Extension/issues/4085) | Extension - Integrate Meld All in One Wizard | ✅ done |
| 1.3.25 | [#4086](https://github.com/Koniverse/SubWallet-Extension/issues/4086) | Fix bug integrating Wagmi into SubWallet | ✅ done |
| 1.3.29 | [#4198](https://github.com/Koniverse/SubWallet-Extension/issues/4198) | Update Meld Integration Issues | ✅ done |
| — | [#9](https://github.com/Koniverse/SubWallet-Extension/issues/9) | Integrate all parachains assets in to SubWallet | ✅ done |
| — | [#13](https://github.com/Koniverse/SubWallet-Extension/issues/13) | Integrate Dotsama ecosystem testnets: Rococo, Westend | ✅ done |
| — | [#82](https://github.com/Koniverse/SubWallet-Extension/issues/82) | Change the experience when clicking on a relaychain or Parachain, instead of dropdown, it will go to a new screen | ✅ done |
| — | [#174](https://github.com/Koniverse/SubWallet-Extension/issues/174) | Integrate Genshiro & Equilibrium | ✅ done |
| — | [#190](https://github.com/Koniverse/SubWallet-Extension/issues/190) | Add Sakura Parachain | ✅ done |
| — | [#554](https://github.com/Koniverse/SubWallet-Extension/issues/554) | Create PR for the ArthSwap team to integrate SubWallet | ✅ done |
| — | [#615](https://github.com/Koniverse/SubWallet-Extension/issues/615) | Create a PR request to integrate SubWallet into Mangata | ⏸ deprecated |
| — | [#624](https://github.com/Koniverse/SubWallet-Extension/issues/624) | Create a PR request to integrate SubWallet into Rainbowkit | ✅ done |
| — | [#842](https://github.com/Koniverse/SubWallet-Extension/issues/842) | Add support for new networks (new parachains winners) | ✅ done |
| — | [#1304](https://github.com/Koniverse/SubWallet-Extension/issues/1304) | Create PR request to integrate SubWallet into Composable Finance dapps | ⏸ deprecated |
| — | [#1719](https://github.com/Koniverse/SubWallet-Extension/issues/1719) | Create PR to integrate SubWallet to Wagmi support List | ✅ done |
| — | [#4354](https://github.com/Koniverse/SubWallet-Extension/issues/4354) | Review and Update Kusama & Westend Network Integrations in SubWallet | ✅ done |

> **The 200+-network registry grew one parachain at a time.** *"Integrate X"* — Genshiro,
> Equilibrium, Bifrost, Gear, Kilt — is the recurring shape, plus the testnets (#13 Rococo/Westend).
> A distinct sub-cluster is *outbound*: *"Create a PR to integrate SubWallet into Y"* (ArthSwap,
> Mangata, Rainbowkit, Wagmi) — work done in another team's repo to get SubWallet listed, recorded
> here because that is the registry-adjacent surface it exercised.

## Cross-references

- [PRD FR-35](../../PRD.md#epic-4--chain-management) · [Epic EPIC-4](../epics/EPIC-4.md) · [US-4.9](US-4.9-substrate-light-client-fallback.md)
- [consolidation note](../../notes/2026-07-24.md#d-epic-24-maintenance--network--token-merged-into-epic-4)
