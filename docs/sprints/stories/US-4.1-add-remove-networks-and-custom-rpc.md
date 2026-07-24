---
id: US-4.1
title: "Add/remove networks + custom RPC"
epic: EPIC-4
status: done
priority: P1
points: 3
sprint: sprint-2022-M05
version_shipped: 0.4.3
prd_ref: [FR-31]
arch_ref: [AD-02]
depends_on:
assignee: saltict
commit: 4e32896869, a2ef6ef7a3, af8c77e83d
created: 2026-06-12
updated: 2026-06-12
---

## Goal

A user can add or remove networks and point any chain at a custom RPC endpoint
from Settings, so the wallet is not limited to the bundled defaults and can be
repaired when a public endpoint is down.

## Status

> **✅ done — shipped in 0.4.3.** All acceptance criteria are ticked and the 86 rows below are
> settled: 78 delivered, 8 closed without shipping. **This is the largest story in the epic** —
> network management is the biggest maintenance surface in the wallet.

## Background

Network management is the entry point of the whole chain-management surface: a
user adds a network (by chain spec / genesis), removes one they do not use, and
overrides the RPC endpoint per chain when the default is rate-limited or
offline. Each enabled chain is connected through a `ChainService` per-chain API
object ([AD-02](../../ARCHITECTURE.md#architecture-decisions)); custom-RPC and
enable/disable state is persisted in the background store and re-applied on
re-connect.

This is the foundation the rest of the epic builds on — the registry
([US-4.4](US-4.4-substrate-parachain-registry.md)), bulk operations
([US-4.2](US-4.2-bulk-disable-and-reset-default-networks.md)) and the
light-client fallback ([US-4.9](US-4.9-substrate-light-client-fallback.md)) all
manipulate the same active-chain configuration this story owns.

Materializes [FR-31](../../PRD.md#epic-4--chain-management). **Retroactive** —
already shipped.

## Acceptance criteria

- [x] **AC-1** — **Given** the Manage Networks screen, **When** the user enables or
  adds a network, **Then** a `ChainService` API object is created and the network
  becomes active with a connectivity indicator.
- [x] **AC-2** — **Given** an active network, **When** the user enters a custom RPC
  URL, **Then** the chain reconnects through that endpoint and the override
  persists across restarts.
- [x] **AC-3** — **Given** a network the user removes/disables, **When** removal is
  confirmed, **Then** the chain is disconnected and its API object torn down.
- [x] **AC-4** — **Given** an invalid or unreachable custom RPC URL, **When** the
  user saves it, **Then** a clear connection error is shown and the prior working
  endpoint is retained (nothing is silently broken).

## Tasks

- [x] **TASK-4.1.1** — Manage-Networks add/enable/remove flow wired to `ChainService` lifecycle (AC: 1, 3)
- [x] **TASK-4.1.2** — Per-chain custom-RPC override: persist + reconnect (AC: 2)
- [x] **TASK-4.1.3** — Custom-RPC validation + connection-failure error state, keep last-good endpoint (AC: 4)

## Dev notes

### Architecture constraints

- [AD-02](../../ARCHITECTURE.md#architecture-decisions) — enable/disable and custom RPC operate on the per-chain API object lifecycle; no ad-hoc chain lookups.
- This story introduces no new AD entries.

### Cross-story dependencies

- Required by [US-4.2](US-4.2-bulk-disable-and-reset-default-networks.md) — bulk disable/reset operates on the active-chain set this story manages.
- Required by [US-4.4](US-4.4-substrate-parachain-registry.md) — the registry is the catalog this add/enable flow draws from.

### Dev notes — points

3 pts — a config/registry feature on top of the existing `ChainService` engine
(no external system integration), per SKILL §3a-bis (multi-doc / internal
integration).

### References

- [Source: PRD FR-31](../../PRD.md#epic-4--chain-management) — add/remove networks; custom RPC per chain
- [Source: ARCHITECTURE AD-02](../../ARCHITECTURE.md#architecture-decisions) — ChainService per-chain API objects

## Verification commands

| AC | Command |
|---|---|
| AC-1, AC-3 | Manual: enable then remove a network → connects then tears down |
| AC-2 | Manual: set a custom RPC, restart → override persists, chain connects via it |
| AC-4 | Manual: enter a bad RPC URL → error shown, previous endpoint retained |

## Changelog entry

### Added
- Add / remove networks and per-chain custom RPC endpoint configuration from Settings.

**Commit**:

## Implementation notes

Backfilled by US-21.2 (multi-agent trace + adversarial verify, run `wf_6b56f4cd-d08`; trace confidence: high, rule: first-delivery).

**Evidence:** CHANGELOG "## [0.4.3] — 2022-05-31": "Custom network, Custom Endpoint (#36)" — earliest bullet delivering add/remove networks with a custom RPC endpoint; delivered via feature branch koni/dev/issue-36-52 whose PR #229 merge (4e32896869, 196 files) and delete-network feature commit (a2ef6ef7a3) are verified ancestors of v0.4.3. Later "Temporarily remove 'Add custom network' (#464)" in 0.5.3 was explicitly temporary and the capability returned (custom-network bullets resume in 1.x), so no removal flag.

Commits `4e32896869, a2ef6ef7a3, af8c77e83d` verified contained in the v0.4.3 anchor via `git merge-base --is-ancestor`; assignee resolved through the [US-21.1 contributor map](../../notes/contributor-map.md).

## Incremental work, fixes & chores

**86 tracker issues** landed on network management, custom RPC and per-network config — 52 with a release, 27 delivered with no line naming them, 8 closed without shipping. Folded in from the former one-issue-per-story maintenance ledger (2026-07-24).

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 0.3.4 | [#172](https://github.com/Koniverse/SubWallet-Extension/issues/172) | Update new network Apr 16, 2022 | ✅ done |
| 0.3.4 | [#180](https://github.com/Koniverse/SubWallet-Extension/issues/180) | Some networks show the wrong group | ✅ done |
| 0.4.6 | [#343](https://github.com/Koniverse/SubWallet-Extension/issues/343) | Bug happens when change Origin Chain | ✅ done |
| 0.4.9 | [#387](https://github.com/Koniverse/SubWallet-Extension/issues/387) | Add new network, update endpoint: Tinkernet, Imbue, HydraDX,... | ✅ done |
| 0.4.9 | [#408](https://github.com/Koniverse/SubWallet-Extension/issues/408) | Some errors related to Network Settings | ✅ done |
| 0.5.2 | [#421](https://github.com/Koniverse/SubWallet-Extension/issues/421) | Error enabling Litentry/Litmus network | ✅ done |
| 0.5.3 | [#311](https://github.com/Koniverse/SubWallet-Extension/issues/311) | Displaying incorrect balance & load incorrect view when update configure network | ✅ done |
| 0.5.6 | [#558](https://github.com/Koniverse/SubWallet-Extension/issues/558) | Add new networks to SubWallet | ✅ done |
| 0.5.6 | [#578](https://github.com/Koniverse/SubWallet-Extension/issues/578) | Update information for Ternoa network | ✅ done |
| 0.5.7 | [#581](https://github.com/Koniverse/SubWallet-Extension/issues/581) | Remove Neumann Network | ✅ done |
| 0.6.1 | [#632](https://github.com/Koniverse/SubWallet-Extension/issues/632) | Add another endpoint for GM Chain | ✅ done |
| 0.6.4 | [#637](https://github.com/Koniverse/SubWallet-Extension/issues/637) | Push Pioneer Network to the top to support Promotion activity | ✅ done |
| 0.6.4 | [#651](https://github.com/Koniverse/SubWallet-Extension/issues/651) | Update subscan for Subspace 2a network | ✅ done |
| 0.6.5 | [#669](https://github.com/Koniverse/SubWallet-Extension/issues/669) | Update Zeitgeist endpoints | ✅ done |
| 0.6.6 | [#388](https://github.com/Koniverse/SubWallet-Extension/issues/388) | Add auto-compounding for TUR (Turing Network) inside SubWallet | ✅ done |
| 0.6.6 | [#685](https://github.com/Koniverse/SubWallet-Extension/issues/685) | Update Acala endpoints | ✅ done |
| 0.6.7 | [#697](https://github.com/Koniverse/SubWallet-Extension/issues/697) | Update provider URL for some chain | ✅ done |
| 0.6.9 | [#730](https://github.com/Koniverse/SubWallet-Extension/issues/730) | Add support Bobanetwork | ✅ done |
| 0.6.9 | [#775](https://github.com/Koniverse/SubWallet-Extension/issues/775) | Update Amplitude endpoint | ✅ done |
| 0.7.3 | [#789](https://github.com/Koniverse/SubWallet-Extension/issues/789) | Bug automatically redirects to the Ethereum network when requesting permission | ✅ done |
| 0.7.4 | [#873](https://github.com/Koniverse/SubWallet-Extension/issues/873) | Integrate xx.network - a L1 Substrate-based network | ✅ done |
| 0.7.5 | [#788](https://github.com/Koniverse/SubWallet-Extension/issues/788) | Add support for the Octopus Network ecosystem | ✅ done |
| 0.7.6 | [#903](https://github.com/Koniverse/SubWallet-Extension/issues/903) | Check and add more network from Polkadot{.js} App | ✅ done |
| 0.7.6 | [#910](https://github.com/Koniverse/SubWallet-Extension/issues/910) | Add the missing networks in Live Networks group | ✅ done |
| 0.7.6 | [#936](https://github.com/Koniverse/SubWallet-Extension/issues/936) | Update default endpoint for Basilisk, HydraDX | ✅ done |
| 0.7.7 | [#951](https://github.com/Koniverse/SubWallet-Extension/issues/951) | Update APR for Turing Network | ✅ done |
| 0.7.8 | [#977](https://github.com/Koniverse/SubWallet-Extension/issues/977) | Update endpoint for some chain | ✅ done |
| 0.8.4 | [#646](https://github.com/Koniverse/SubWallet-Extension/issues/646) | Integrate Aventus Network | ✅ done |
| 1.0.2 | [#1237](https://github.com/Koniverse/SubWallet-Extension/issues/1237) | Status of network show incorrect | ✅ done |
| 1.0.2 | [#1247](https://github.com/Koniverse/SubWallet-Extension/issues/1247) | Re-check the feature of automatically turning on the network according to the existing balance | ✅ done |
| 1.0.5 | [#1348](https://github.com/Koniverse/SubWallet-Extension/issues/1348) | Update URL explorer for Subspace networks | ✅ done |
| 1.0.6 | [#1429](https://github.com/Koniverse/SubWallet-Extension/issues/1429) | Update APR for A0 and re-check for more chain | ✅ done |
| 1.0.11 | [#1508](https://github.com/Koniverse/SubWallet-Extension/issues/1508) | Fix bug detecting on-chain attributes for WASM NFTs | ✅ done |
| 1.1.5 | [#1633](https://github.com/Koniverse/SubWallet-Extension/issues/1633) | Sync configuration of the network and token | ✅ done |
| 1.1.8 | [#1752](https://github.com/Koniverse/SubWallet-Extension/issues/1752) | Show incorrect Minumum active value on the Network detail screen | ✅ done |
| 1.1.11 | [#1866](https://github.com/Koniverse/SubWallet-Extension/issues/1866) | The network address displayed is incorrect | ✅ done |
| 1.1.14 | [#1939](https://github.com/Koniverse/SubWallet-Extension/issues/1939) | Improve network and asset subscription | ✅ done |
| 1.1.17 | [#2019](https://github.com/Koniverse/SubWallet-Extension/issues/2019) | The default vara network is enabled | ✅ done |
| 1.1.21 | [#2158](https://github.com/Koniverse/SubWallet-Extension/issues/2158) | Hide the token of the Inactive chain | ✅ done |
| 1.1.24 | [#2258](https://github.com/Koniverse/SubWallet-Extension/issues/2258) | Re-check for networks that are using Parity RPC | ✅ done |
| 1.1.39 | [#2609](https://github.com/Koniverse/SubWallet-Extension/issues/2609) | Update IPFS domain for NFTs from Unique network | ✅ done |
| 1.1.41 | [#2550](https://github.com/Koniverse/SubWallet-Extension/issues/2550) | Optimize performance by separate chain status and chain state | ✅ done |
| 1.1.41 | [#2585](https://github.com/Koniverse/SubWallet-Extension/issues/2585) | Integrate Continuum network | ✅ done |
| 1.1.41 | [#2676](https://github.com/Koniverse/SubWallet-Extension/issues/2676) | Integrate LLD and LLM from Liberland network | ✅ done |
| 1.1.53 | [#2885](https://github.com/Koniverse/SubWallet-Extension/issues/2885) | Error when fetching balance with Enjin Relay Chain | ✅ done |
| 1.1.60 | [#2966](https://github.com/Koniverse/SubWallet-Extension/issues/2966) | [Extension] Add support for Mythos Chain | ✅ done |
| 1.1.63 | [#3037](https://github.com/Koniverse/SubWallet-Extension/issues/3037) | Network's status show incorrect | ✅ done |
| 1.1.67 | [#3084](https://github.com/Koniverse/SubWallet-Extension/issues/3084) | Fix bug integrating chain online | ✅ done |
| 1.3.23 | [#3864](https://github.com/Koniverse/SubWallet-Extension/issues/3864) | Extension - Unified address format integration | ✅ done |
| 1.3.42 | [#4414](https://github.com/Koniverse/SubWallet-Extension/issues/4414) | [UI] Update outdated functions related to address/chain/token handling [Phase 1] | ⏸ deprecated |
| 1.3.54 | [#4013](https://github.com/Koniverse/SubWallet-Extension/issues/4013) | Extension - Update for patch chain | ✅ done |
| 1.3.76 | [#4972](https://github.com/Koniverse/SubWallet-Extension/issues/4972) | [Extension] Unable to turn network when no add correct API key | ✅ done |
| — | [#6](https://github.com/Koniverse/SubWallet-Extension/issues/6) | Show balance for substrate based chain assets | ✅ done |
| — | [#14](https://github.com/Koniverse/SubWallet-Extension/issues/14) | Integrate some Independent Substrate chains: Edgeware, AlephZero | ✅ done |
| — | [#51](https://github.com/Koniverse/SubWallet-Extension/issues/51) | isEthereum`  - Option: default is false  - Determind if the network supports Ethereum` | ✅ done |
| — | [#58](https://github.com/Koniverse/SubWallet-Extension/issues/58) | Avatar GUI error when choosing Moonriver, Moonbeam chain | ✅ done |
| — | [#73](https://github.com/Koniverse/SubWallet-Extension/issues/73) | Check the status of not showing the balance of some networks for the first time after installation | ✅ done |
| — | [#77](https://github.com/Koniverse/SubWallet-Extension/issues/77) | Can't display All Network when viewing the balance details of any 1 network | ✅ done |
| — | [#306](https://github.com/Koniverse/SubWallet-Extension/issues/306) | The Sub-token doesn't occasionally display on Chain | ⏸ deprecated |
| — | [#307](https://github.com/Koniverse/SubWallet-Extension/issues/307) | Custom Network for Providers URL support both Substrate Chain & EVM Chain | ⏸ deprecated |
| — | [#391](https://github.com/Koniverse/SubWallet-Extension/issues/391) | Update some features for custom network | ✅ done |
| — | [#590](https://github.com/Koniverse/SubWallet-Extension/issues/590) | Integrate Joystream network and NFTs | ✅ done |
| — | [#595](https://github.com/Koniverse/SubWallet-Extension/issues/595) | Separate network services | ✅ done |
| — | [#792](https://github.com/Koniverse/SubWallet-Extension/issues/792) | Do not show sub-token of the Ethereum, Binance network on the Firefox browser in case update version extension | ✅ done |
| — | [#938](https://github.com/Koniverse/SubWallet-Extension/issues/938) | Follow-up some networks to add new | ✅ done |
| — | [#988](https://github.com/Koniverse/SubWallet-Extension/issues/988) | Add support new endpoint for Astar | ✅ done |
| — | [#1135](https://github.com/Koniverse/SubWallet-Extension/issues/1135) | Update endpoint for Shiden-EVM | ✅ done |
| — | [#1241](https://github.com/Koniverse/SubWallet-Extension/issues/1241) | Do not display the add network screen in case the network already exists | ✅ done |
| — | [#1276](https://github.com/Koniverse/SubWallet-Extension/issues/1276) | Update network name: "InvArch Tinker" -> "Tinkernet" | ✅ done |
| — | [#1536](https://github.com/Koniverse/SubWallet-Extension/issues/1536) | Re-check nominated record of the Calamari network | ⏸ deprecated |
| — | [#1597](https://github.com/Koniverse/SubWallet-Extension/issues/1597) | Update enable chain interaction UX | ✅ done |
| — | [#1796](https://github.com/Koniverse/SubWallet-Extension/issues/1796) | Reseach Avail network | ✅ done |
| — | [#2137](https://github.com/Koniverse/SubWallet-Extension/issues/2137) | Improve UX: Enables faster RPC updates | ⏸ deprecated |
| — | [#2232](https://github.com/Koniverse/SubWallet-Extension/issues/2232) | Re-check all functions on Moonbeam network | ⏸ deprecated |
| — | [#2392](https://github.com/Koniverse/SubWallet-Extension/issues/2392) | Setup banner to notify to user about serveral networks | ✅ done |
| — | [#2486](https://github.com/Koniverse/SubWallet-Extension/issues/2486) | [Manta] Integrate Manta Atlantic Network | ✅ done |
| — | [#2591](https://github.com/Koniverse/SubWallet-Extension/issues/2591) | Support Paseo network | ✅ done |
| — | [#2927](https://github.com/Koniverse/SubWallet-Extension/issues/2927) | Re-check case remove custom network | ⏸ deprecated |
| — | [#3016](https://github.com/Koniverse/SubWallet-Extension/issues/3016) | Check online network integration | ✅ done |
| — | [#3596](https://github.com/Koniverse/SubWallet-Extension/issues/3596) | Update UI for Chain abstraction demo | ✅ done |
| — | [#3693](https://github.com/Koniverse/SubWallet-Extension/issues/3693) | Write script to validate chain - asset relationship | ✅ done |
| — | [#3868](https://github.com/Koniverse/SubWallet-Extension/issues/3868) | [Chain abstraction] Setup chain abstraction explorer website | ✅ done |
| — | [#3882](https://github.com/Koniverse/SubWallet-Extension/issues/3882) | [Chain abstraction] Update UI for chain abstraction explorer website | ✅ done |
| — | [#4123](https://github.com/Koniverse/SubWallet-Extension/issues/4123) | Extension - Fix bug related to RPC | ✅ done |
| — | [#4406](https://github.com/Koniverse/SubWallet-Extension/issues/4406) | VARA network nor Wallet balance | ✅ done |
| — | [#4659](https://github.com/Koniverse/SubWallet-Extension/issues/4659) | [Extension][Manage network/Filter] Display incorrect list of networks when combining enabled/disabled filter and other filters | ⏸ deprecated |

> **Adding a chain and fixing an endpoint never stop.** *"Add new network X"*, *"update X
> endpoints"*, *"integrate X network"* recur across three years — SubWallet grew its network set one
> issue at a time, and each new chain brought its own endpoint drift, wrong-group, and balance-display
> bugs. The custom-network / custom-RPC surface ([US-4.1](US-4.1-add-remove-networks-and-custom-rpc.md)'s
> own charter) is where a user-supplied endpoint meets reality; its *ongoing* reliability work has a
> dedicated anchor in [US-4.22](US-4.22-rpc-and-endpoint-management-hardening.md).

## Cross-references

- [PRD FR-31](../../PRD.md#epic-4--chain-management) · [Epic EPIC-4](../epics/EPIC-4.md) · [US-4.2](US-4.2-bulk-disable-and-reset-default-networks.md) · [US-4.4](US-4.4-substrate-parachain-registry.md)
- [consolidation note](../../notes/2026-07-24.md#d-epic-24-maintenance--network--token-merged-into-epic-4)
