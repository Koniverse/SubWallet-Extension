---
id: US-4.25
title: "Open network & token improvements"
epic: EPIC-4
status: in-progress
priority: P3
points: 5
sprint:
version_shipped:
prd_ref: []
assignee:
commit:
created: 2026-07-24
updated: 2026-07-24
---

## Goal

The network- and token-management work that is asked for and not delivered — spread across chain
integration, token detection, search, display and the WebApp — that no shipped capability story can
carry without becoming a mix of done and open rows.

## Status

> **🚧 in-progress — nothing here has shipped.** All 37 rows below are **open on the tracker**. No
> acceptance criterion is ticked, and `commit`, `sprint` and `version_shipped` stay empty until work
> lands in a release.

## Scope

This is the **open catch-all** for EPIC-4. Every capability and maintenance story in this epic that is
`done` shed its open rows here, because a `done` story may not carry an open row
([AGENTS.md](../../../AGENTS.md) rule 9). The rows come from many themes — chain integration, token
detection/search/display, the WebApp — and are held together only by being unfinished.

It materializes **no FR**. Themed open work with a dedicated home went there instead: open RPC /
endpoint reliability is [US-4.22](US-4.22-rpc-and-endpoint-management-hardening.md), the Asset Hub
migration is [US-4.21](US-4.21-asset-hub-migration-hardening.md), and the Bitcoin-API path is
[US-4.23](US-4.23-bitcoin-api-path-hardening.md). What remains here is the unthemed remainder.

## Incremental work, fixes & chores

**37 tracker issues**, all open.

| Shipped | Issue | Title | Status |
|---|---|---|---|
| — | [#155](https://github.com/Koniverse/SubWallet-Extension/issues/155) | Integrate with Kilt Protocol | 📋 backlog |
| — | [#634](https://github.com/Koniverse/SubWallet-Extension/issues/634) | Create PR for the Starlay team to integrate SubWallet | 📋 backlog |
| — | [#856](https://github.com/Koniverse/SubWallet-Extension/issues/856) | Integrate wallet-to-wallet message solution from Gear Technologies | 📋 backlog |
| — | [#857](https://github.com/Koniverse/SubWallet-Extension/issues/857) | Integrate Domain Chain into SubWallet | 📋 backlog |
| — | [#948](https://github.com/Koniverse/SubWallet-Extension/issues/948) | Integrate Ternoa NFTs | 📋 backlog |
| — | [#1262](https://github.com/Koniverse/SubWallet-Extension/issues/1262) | Integrate Aventus NFTs | 📋 backlog |
| — | [#1313](https://github.com/Koniverse/SubWallet-Extension/issues/1313) | Integrate Joystream NFTs into SubWallet | 📋 backlog |
| — | [#1359](https://github.com/Koniverse/SubWallet-Extension/issues/1359) | Improve chain-list on extension | 📋 backlog |
| — | [#1735](https://github.com/Koniverse/SubWallet-Extension/issues/1735) | WebApp - Update UI Manage network by tab: Substrate, EVM | 📋 backlog |
| — | [#1824](https://github.com/Koniverse/SubWallet-Extension/issues/1824) | Bugs related to Manage networks feature | 📋 backlog |
| — | [#1911](https://github.com/Koniverse/SubWallet-Extension/issues/1911) | WebApp - An error occurred when turning on/off the network | 📋 backlog |
| — | [#2239](https://github.com/Koniverse/SubWallet-Extension/issues/2239) | Handle the case of not being able to turn on/turn off the network if the network previously failed | 📋 backlog |
| — | [#2267](https://github.com/Koniverse/SubWallet-Extension/issues/2267) | Extension - Add fields to update logo for custom token/ network | 📋 backlog |
| — | [#2574](https://github.com/Koniverse/SubWallet-Extension/issues/2574) | WebApp - Added footer for some token detail screens | 📋 backlog |
| — | [#2589](https://github.com/Koniverse/SubWallet-Extension/issues/2589) | Add new feature: Automatically detect all users' assets on all networks and show on the wallet | 📋 backlog |
| — | [#2667](https://github.com/Koniverse/SubWallet-Extension/issues/2667) | Distinguishing tokens with similar symbols | 📋 backlog |
| — | [#2800](https://github.com/Koniverse/SubWallet-Extension/issues/2800) | Update auto enable tokens | 📋 backlog |
| — | [#2907](https://github.com/Koniverse/SubWallet-Extension/issues/2907) | WebApp - Cannot search for tokens if token name is different from group token name | 📋 backlog |
| — | [#3029](https://github.com/Koniverse/SubWallet-Extension/issues/3029) | Extension - Error loading when click group token details | 📋 backlog |
| — | [#3424](https://github.com/Koniverse/SubWallet-Extension/issues/3424) | WebApp - Update token list (Hompage) in responsive screen | 📋 backlog |
| — | [#3439](https://github.com/Koniverse/SubWallet-Extension/issues/3439) | Extension - Improve UI on Select network screen when attach Migration App | 📋 backlog |
| — | [#3582](https://github.com/Koniverse/SubWallet-Extension/issues/3582) | Extension - Do not show the list of tokens available for purchase in case the network is not enabled | 📋 backlog |
| — | [#3722](https://github.com/Koniverse/SubWallet-Extension/issues/3722) | Extension - Error when working with rpc : "light-client" | 📋 backlog |
| — | [#3823](https://github.com/Koniverse/SubWallet-Extension/issues/3823) | Extension - Check the issue of not displaying logo | 📋 backlog |
| — | [#3887](https://github.com/Koniverse/SubWallet-Extension/issues/3887) | Bug sending tokens on Astar portal | 📋 backlog |
| — | [#3957](https://github.com/Koniverse/SubWallet-Extension/issues/3957) | Extension - Integrate Subwallet into Privy | 📋 backlog |
| — | [#3961](https://github.com/Koniverse/SubWallet-Extension/issues/3961) | Extension - Improve search token | 📋 backlog |
| — | [#4102](https://github.com/Koniverse/SubWallet-Extension/issues/4102) | Extension - Improve Customize asset display screen | 📋 backlog |
| — | [#4395](https://github.com/Koniverse/SubWallet-Extension/issues/4395) | Research Midnight network | 🚧 in-progress |
| — | [#4603](https://github.com/Koniverse/SubWallet-Extension/issues/4603) | Extension – Bundling Extension Code for Mobile Wallet App Integration | 📋 backlog |
| — | [#4906](https://github.com/Koniverse/SubWallet-Extension/issues/4906) | Add Cardano Preview Network | 📋 backlog |
| — | [#2236](https://github.com/Koniverse/SubWallet-Extension/issues/2236) | Bug when add new provider of different type | 📋 backlog |
| — | [#2768](https://github.com/Koniverse/SubWallet-Extension/issues/2768) | Extension - Improve Subscan service | 📋 backlog |
| — | [#3415](https://github.com/Koniverse/SubWallet-Extension/issues/3415) | WebApp - Check case input value min on Hydradation | 📋 backlog |
| — | [#3530](https://github.com/Koniverse/SubWallet-Extension/issues/3530) | Update Verify Chainlist page | 📋 backlog |
| — | [#4361](https://github.com/Koniverse/SubWallet-Extension/issues/4361) | Extension - Index UTXOs | 📋 backlog |
| — | [#4400](https://github.com/Koniverse/SubWallet-Extension/issues/4400) | 🚀 Migration to ink! v6 & Support for pallet_revive on Polkadot Hub | 🚧 in-progress |

> **+6 open rows recovered from the Uncategorized ledger** (2026-07-24) — open network/token work the triage bucket held.

> **Token detection and display is the largest open theme** — auto-detect all assets (#2589), update
> auto-enable (#2800), search improvements (#3961, #2907), distinguishing similar symbols (#2667),
> customize the asset-display screen (#4102). The rest are one-offs: chain integrations still on the
> backlog (Kilt #155, Domain Chain #857, Ternoa/Aventus/Joystream NFTs), a Midnight research spike
> (#4395), Cardano Preview network (#4906), and the mobile-bundling chore (#4603).

## Acceptance criteria

- [ ] **AC-1** — Every row above is open on the tracker (not `CLOSED`); none claims a `version_shipped`.
- [ ] **AC-2** — When any row ships, it moves to the capability story that owns its behaviour and leaves this list.

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | `gh issue view 2589` `3961` `4906` → OPEN |
| AC-2 | Manual: on each release, re-home any row that shipped into its capability story |

## Cross-references

- [Epic EPIC-4](../epics/EPIC-4.md) · [US-4.22](US-4.22-rpc-and-endpoint-management-hardening.md) · [US-4.12](US-4.12-token-registry-enable-disable.md) · [consolidation note](../../notes/2026-07-24.md#d-epic-24-maintenance--network--token-merged-into-epic-4)
