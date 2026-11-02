# Manual Test Report — EPIC-42 — 2026-11-02

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-11-02 |
| Tester | MaiThuongNinni |
| Environment | Extension — subwallet-dev build |
| Runner | manual (extension) |
| Build under test | subwallet-dev |
| Stories tested | US-42.31 — in progress |
| Total bugs found | 0 |
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| P3 | 0 |
| Status | done |

---

## US-42.31 — Release SubWallet Extension v1.3.91

Today covers two things on the dev build: the chainlist half of the gate (the ChainList #710 maintenance) and the full regression pass. The multisig half passed on 10-30.

The chainlist lines were run on both a fresh install and an upgrade from v1.3.90, and hold on both.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|
| AC-1b-01 | `xgr` — XGRChain, chainId 1643, XGR | ✅ Pass | |
| AC-1b-02 | `robinhood_chain` — chainId 4663, ETH under the ETH-Ethereum multi-chain asset | ✅ Pass | |
| AC-1b-03 | `megaeth` — chainId 4326, ETH, same multi-chain asset | ✅ Pass | |
| AC-1b-04 | `plasma` — chainId 9745, XPL | ✅ Pass | |
| AC-1b-05 | `somnia` — chainId 5031, SOMI | ✅ Pass | |
| AC-1b-06 | `arc` — chainId 5042, USDC as the native token | ✅ Pass | |
| AC-1b-07 | `sei_evm` — chainId 1329, SEI | ✅ Pass | |
| AC-1b-08 | `kaia` — chainId 8217, KAIA | ✅ Pass | |
| AC-1b-09 | `cronos` — chainId 25, CRO | ✅ Pass | |
| AC-1b-10 | `berachain` — chainId 80094, BERA | ✅ Pass | |
| AC-1b-11 | `ronin` — chainId 2020, RON | ✅ Pass | |
| AC-1b-12 | `flow_evm` — chainId 747, FLOW | ✅ Pass | |
| AC-1b-13 | The 12 testnets are present and connect | ✅ Pass | |
| AC-1b-14 | Each new chain's logo renders, not a placeholder | ✅ Pass | |
| AC-1b-15 | A price shows for the chains that carry a priceId | ✅ Pass | |
| AC-1b-16 | Deactivated chains gone from Manage networks, token picker, send and swap | ✅ Pass | |
| AC-1b-17 | A balance held on a deactivated chain is still readable, account still opens | ✅ Pass | |
| AC-1b-18 | Nothing references a deactivated chain and breaks | ✅ Pass | |
| AC-1b-19 | A renamed subnet shows its new name and icon, balance unchanged | ✅ Pass | keyed by netuid |
| AC-1b-20 | A subnet whose symbol changed shows the new symbol, same balance | ✅ Pass | |
| AC-1b-21 | SN103 reads Deprecated with the default icon, SN116 reads Carbon | ✅ Pass | |
| AC-1b-22 | SN111 has `assetType: LOCAL` and appears in the alpha balance subscription | ✅ Pass | |
| AC-1b-23 | Bittensor accepts a multisig account and raises a notification on a pending approval | ✅ Pass | |
| AC-1b-24 | Bittensor Testnet accepts a multisig account the same way | ✅ Pass | |
| AC-1b-25 | GEB reads GEB with its new icon, connects on both `geb.network` endpoints | ✅ Pass | |
| AC-1b-26 | A balance held on GEB before the rename is unchanged | ✅ Pass | chainId 11501 unmoved |
| AC-1b-27 | GEB's explorer link opens `scan.geb.network` and finds a transaction | ✅ Pass | |
| AC-1b-28 | `atletaOlympia_testnet` connects on its new genesis hash, no mismatch warning | ✅ Pass | |
| AC-1b-29 | The 72 chains with a provider change each connect, removed endpoints gone, added ones selectable | ✅ Pass | list in the [2026-10-09 report](../../2026-10/2026-10-09/report-manual.md) |
| AC-1b-30 | No chain is left with an empty provider list | ✅ Pass | |
| AC-1b-31 | The whole chainlist change holds on a fresh install | ✅ Pass | |
| AC-1b-32 | The whole chainlist change holds on an upgrade from v1.3.90 | ✅ Pass | |

### Chains newly added

Twelve mainnet chains and their twelve testnets. Each is in Manage networks, connects, carries the chainId and native token the issue names, renders its own logo rather than a placeholder, and shows a price where the chain has a priceId.

| Chain | Slug | Chain ID | Native | Price |
|---|---|---|---|---|
| XGRChain | `xgr` | 1643 | XGR | shown |
| Robinhood Chain | `robinhood_chain` | 4663 | ETH | via ethereum |
| MegaETH | `megaeth` | 4326 | ETH | via ethereum |
| Plasma | `plasma` | 9745 | XPL | shown |
| Somnia | `somnia` | 5031 | SOMI | shown |
| Arc | `arc` | 5042 | USDC | shown |
| Sei EVM | `sei_evm` | 1329 | SEI | shown |
| Kaia | `kaia` | 8217 | KAIA | shown |
| Cronos | `cronos` | 25 | CRO | shown |
| Berachain | `berachain` | 80094 | BERA | shown |
| Ronin | `ronin` | 2020 | RON | shown |
| Flow EVM | `flow_evm` | 747 | FLOW | shown |

Two of these are worth naming on their own. Arc's native token is USDC, not a token of its own, and it reads that way in the wallet. The ETH on Robinhood Chain and MegaETH belongs to the `ETH-Ethereum` multi-chain asset rather than standing as a separate token, and it groups correctly — Robinhood Chain Testnet likewise sits under `ETH-EthereumSepolia`.

The twelve testnets are present and connect: XGR Testnet, Robinhood Chain Testnet, MegaETH Testnet, Plasma Testnet, Somnia Testnet, Arc Testnet, Sei EVM Testnet, Kaia Kairos, Cronos Testnet, Berachain Bepolia, Ronin Saigon and Flow EVM Testnet.

### Chains deactivated

The chains #710 set to `INACTIVE` are gone from Manage networks, from the token picker and from the send and swap flows. A balance held on one of them is still readable and the account still opens — the entries and their assets were kept and only `chainStatus` changed, so nothing that referenced them broke. No screen comes up blank where a deactivated chain used to be listed.

These were walked chain by chain in US-42.28 and US-42.30, so today's check is that the release build still behaves, not a second enumeration.

### Bittensor subnets

The 102 resynced subnets carry their new names, symbols and icons, and no balance moved with them. That is the point of the sync: slugs were left alone and balances are keyed by `metadata.netuid`, so a user who held an alpha token still holds it under the new name.

Two subnets changed again in the 06/10 resync and both read correctly: SN103 is now Deprecated with the default icon, SN116 is Carbon with its official logo. SN111 had `assetType: null` on dev, which made the Extension skip it in the alpha balance subscription; it is now `LOCAL` and appears.

### Feature updates

Multisig on Bittensor is the main one. `supportMultisig` went from `null` to `true` on both Bittensor and Bittensor Testnet, and both now accept a multisig account: the chain is offered when creating one, and a pending approval raises a notification on it. The Extension's multisig service is chain-agnostic — it needs `api.query.multisig.multisigs` and `api.tx.multisig.asMulti`, both of which the subtensor runtime has.

GEB is the rename of BEVM. It reads GEB in Manage networks and the token picker with its new icon, connects on `rpc-mainnet-1` and `rpc-mainnet-2.geb.network`, and its explorer link opens `scan.geb.network` and finds a transaction. A balance held on it before the rename is untouched, which is what chainId 11501 staying put should mean.

Atleta Olympia connects on its new genesis hash after the testnet reset, with no mismatch warning.

### RPC changes

The 72 chains whose provider lists were rewritten all connect, with every removed endpoint gone from the list and every added one selectable. No chain is left with an empty provider list. The full per-chain list is in the [2026-10-09 report](../../2026-10/2026-10-09/report-manual.md), copied there from section 1 of the issue.

### Fresh install and upgrade

Every line above was run twice, once on a clean profile and once as an upgrade from v1.3.90. The upgrade keeps accounts, chains, tokens, balances and settings, and the new chain list arrives with it.

### The regression pass on dev — split today, and passed

Same problem as AC-1a and AC-1b, third form. AC-2 read "regression pass on dev finds no new issues", pointing at a 17-line checklist headed "run this list at each stage". Those 17 lines were shared by dev, master, draft and production, so ticking one for dev would have claimed it for the other three, and AC-2 itself only moved once the whole pass was finished. A full day of regression testing would have had nowhere to go.

It is now AC-2-01 to AC-2-31 on the story, one line per thing a tester finishes and can tick:

| Group | Lines | Covers |
|---|---|---|
| Accounts and unlocking | AC-2-01 → 11 | create, import by mnemonic and by private key, account switching, All accounts, master password, a wrong password, passkey, auto-lock, export, remove |
| Sending and receiving | AC-2-12 → 16 | native on substrate, native on EVM, a non-native token, receive and QR, the History entry |
| Swap, stake and claim | AC-2-17 → 21 | one swap route, stake, unstake with its unlock time, claim, the earning screen loading |
| XCM | AC-2-22 → 23 | relay to parachain and parachain to parachain, each with the fee shown and both sides updating |
| dApp and notifications | AC-2-24 → 27 | WalletConnect, the injected provider, the multisig notification, the other notification kinds |
| Networks and settings | AC-2-28 → 31 | Manage networks, enable and disable, a custom network and token, language, currency and hide-balance |

AC-2 stays as the single line meaning the dev pass is complete, ticked last.

The same 31 lines serve the master build (AC-4) and the draft build (AC-6) — run again on that build and recorded in that day's report, rather than copied into the story four times. Production is deliberately shallower: AC-7c is unlock, balances, one send, one swap, the multisig notification and Manage networks, because the published build is the one already tested at draft. The upgrade path came out of the per-stage list and is AC-11, run once at draft.

Two things changed in content, not just in shape. XCM had two items with no fee or balance check on one of them, and both now require the fee shown and both sides updated, which is where XCM fails when it fails. A wrong master password, a custom network and token, and the settings that have to persist were not on the old list at all.

All 31 lines ran today and pass, so AC-2 is ticked.

| AC | Description | Result | Notes |
|---|---|---|---|
| AC-2-01 | Create a new account, the seed phrase shows and the account opens with its balance | ✅ Pass | |
| AC-2-02 | Import an account from a mnemonic, the address matches what it was before | ✅ Pass | |
| AC-2-03 | Import an account from a private key, the address matches | ✅ Pass | |
| AC-2-04 | Switch between accounts, each shows its own balance across chains | ✅ Pass | |
| AC-2-05 | All accounts shows the total and lists every account | ✅ Pass | |
| AC-2-06 | The master password unlocks the wallet | ✅ Pass | |
| AC-2-07 | A wrong master password is refused with the right message, no lockout | ✅ Pass | |
| AC-2-08 | The passkey unlocks the wallet if it is on | ✅ Pass | |
| AC-2-09 | Auto-lock triggers on its timer and the wallet reopens correctly | ✅ Pass | |
| AC-2-10 | Export an account as JSON and as a seed phrase, both correct | ✅ Pass | |
| AC-2-11 | Remove an account, it is gone and the others are untouched | ✅ Pass | |
| AC-2-12 | Send a native token on a substrate chain, fee shown before signing, balance updates after | ✅ Pass | |
| AC-2-13 | Send a native token on an EVM chain, same check | ✅ Pass | |
| AC-2-14 | Send a non-native token, the fee is charged in the right token | ✅ Pass | |
| AC-2-15 | Receive — the address shows, copies, and the QR scans | ✅ Pass | |
| AC-2-16 | The transaction appears in History with the right status, amount and fee | ✅ Pass | |
| AC-2-17 | Swap on at least one route, the quote shows and the swap completes | ✅ Pass | |
| AC-2-18 | Stake on at least one network, the position shows after | ✅ Pass | |
| AC-2-19 | Unstake on the same network, the unstaking entry shows with its unlock time | ✅ Pass | |
| AC-2-20 | Claim rewards on at least one network | ✅ Pass | |
| AC-2-21 | The earning screen loads its positions and APY without an error state | ✅ Pass | |
| AC-2-22 | XCM relay chain to parachain, the fee shows and both balances update | ✅ Pass | |
| AC-2-23 | XCM parachain to parachain, the fee shows and both balances update | ✅ Pass | |
| AC-2-24 | Connect to a dApp over WalletConnect, sign a message and a transaction | ✅ Pass | |
| AC-2-25 | Connect to a dApp over the injected provider, sign a message and a transaction | ✅ Pass | |
| AC-2-26 | A multisig transaction raises a notification, and signing from it completes | ✅ Pass | |
| AC-2-27 | Notifications of other kinds are unaffected in content, order and unread state | ✅ Pass | |
| AC-2-28 | Manage networks opens, the chain list loads, deactivated gone and new ones present | ✅ Pass | |
| AC-2-29 | Enable and disable a network, the token list follows and nothing else breaks | ✅ Pass | |
| AC-2-30 | Add a custom network and a custom token, both work and survive a reopen | ✅ Pass | |
| AC-2-31 | Settings — language, currency and the hide-balance toggle all apply and persist | ✅ Pass | |
| AC-2 | Regression pass on dev finds no new issues — all 31 lines pass | ✅ Pass | |

Four of these were not on the old 17-line checklist at all and pass on their first run: a wrong master password being refused without locking the user out (AC-2-07), a custom network and token surviving a reopen (AC-2-30), and the settings that have to persist (AC-2-31), plus the earning screen loading its positions and APY (AC-2-21). The two XCM lines also pass on the stricter wording written in the same session — the fee shown and both sides updated, not just that the transfer completes.

Nothing in the release content broke anything on this list. No bugs.

US-42.31 now stands at 105 AC, 88 pass. The 17 left are all stages past dev.

### Bugs

None.

## Summary

The chainlist half of the v1.3.91 gate passes, all 32 lines, on both a fresh install and an upgrade from v1.3.90.

The 12 new mainnet chains and their 12 testnets connect with the right chainId, native token, logo and price. The deactivated chains are out of the lists while balances held on them stay readable. The 102 Bittensor subnets carry new names, symbols and icons with nothing moved, since balances are keyed by netuid. Bittensor and Bittensor Testnet now take a multisig account and raise notifications on it. GEB keeps its balance and explorer through the rename, and Atleta Olympia connects on its new genesis.

AC-1b was one line when this story was written — the chainlist maintenance is live — covering a change that spans 24 chains added, 66 deactivated, 102 subnets resynced, 72 provider lists rewritten and five feature updates. It is now 32 lines taken from the sections of ChainList #710, so a session's work can be recorded as it happens.

The dev regression pass was split the same way and passes in full. AC-2 was one line over a 17-line checklist shared by all four stages, so a day of regression testing could not be recorded for dev without claiming master and draft as well. It is now AC-2-01 to AC-2-31, all 31 ticked today, and the same 31 lines serve the master and draft passes with production left deliberately shallower as AC-7c.

Four checks that were not on the old list pass on their first run: a wrong master password refused without a lockout, a custom network and token surviving a reopen, the settings that have to persist, and the earning screen loading its positions and APY. The two XCM lines pass on the stricter wording — the fee shown and both sides updated, not just that the transfer completes.

Nothing in the release content broke anything in the regression list. No bugs today.

US-42.31 stands at 88 of 105. The 17 left are all stages past dev: the master build, the draft release, production, the locale read and the fresh-install and upgrade runs.
