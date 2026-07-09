# CHANGELOG

Release history for **SubWallet Extension**, in the koni-docs changelog format.

> **Two changelogs exist while the CI migration is pending.**
>
> This file is the canonical one. The root [`CHANGELOG.md`](../CHANGELOG.md) is the
> untouched legacy copy, kept only because
> [`scripts/koni-ci-ghact-build.mjs`](../scripts/koni-ci-ghact-build.mjs) still reads it
> to gate GitHub releases: it greps for a bare `## <version>` heading, which the
> koni-docs `## [<version>] — …` format below deliberately does not match.
>
> **To retire the root file**: delete it, point that `readFileSync` at
> `docs/CHANGELOG.md`, and change the grep to `## [${version}]`. Until then a release
> must be written to **both** files.
>
> Versions are the product versions from `VERSION` / root `package.json`.

> **Dates come from git, not from the source file.** Where the root file's
> `Build date:` disagreed with the release commit, the commit won — per the
> reconciliation rule in [notes/2026-07-07.md](notes/2026-07-07.md) ("code wins").
> 24 dates were corrected this way, including three whose year was
> off by one (0.7.8, 0.7.9, 0.8.1 are dated 2022 in the source but shipped 2023).
>
> 6 of the earliest Koni releases carry no `**Commit**` line: they predate this
> repository's recorded history and no commit identifies them. A wrong SHA would be
> worse than none (RULE-2).
>
> **6 version numbers appear twice** — 0.8.1, 0.7.1, 0.6.1, 0.4.1, 0.3.1, 0.2.1 — because the Koni
> fork restarted its numbering over versions the upstream polkadot-js extension had
> already used. The two entries are distinguished by date and by the `(Koni)` title;
> any tool that keys on the version string alone will find the first one.

## [Unreleased]

(empty — track unreleased changes here; new version sections are inserted above the
previous version, anchored on this block, per the koni-docs changelog template)

<!-- Version drift: the newest entry below is 1.3.82, but VERSION and PRD.md
     still read 1.3.79. Bumping them is Wave 2 of docs/notes/2026-07-09.md. -->

---

## [1.3.82] — 2026-07-06 — Release 1.3.82 (Koni) — v1.3.82

Features & Updates:

- Remove Polygon zkEVM support due to network sunset (#5002)

Bug fixes:

- Signing popup crashes with "Unable to create Enum via index 9" when SignerPayload.assetId is a V5 cross-consensus Location (#4989)

**Commit**: 459b9d18e3

---

## [1.3.81] — 2026-07-03 — Release 1.3.81 (Koni) — v1.3.81

=> This version was skipped due to a release issue.

**Commit**: 8527b46727

---

## [1.3.80] — 2026-06-02 — Release 1.3.80 (Koni) — v1.3.80

Features & Updates:

- Extension - Re-check transaction failed in case transfer max with balance = ED (#2641)
- Extension - Show incorrect network address on XCM confirmation screen when perform Swap, Earning (#3936)
- Re-check logic approve token when perform XCM (#4830)
- Implement NFTService + Migrate EVM & Unique Network NFT logic (Phase 1) (#4884)

**Commit**: bcbdaeeec0

---

## [1.3.79] — 2026-05-21 — Release 1.3.79 (Koni) — v1.3.79

Features & Updates:

- Alpha price calculation mismatch vs TaoStats (#4987)
- Update ParaSpell API integration to v1 (#4979)
- Extension – Some issues when merging in version 1.3.78 (#4988)
- Refactor Swap Service interface and redundant code (#4826)

**Commit**: 95a43f918f

---

## [1.3.78] — 2026-05-14 — Release 1.3.78 (Koni) — v1.3.78

Features & Updates:

- Extension - Support display destination fee for transfer XCM (#4278)
- Calculate exactly estimate fee for bridge step in liquid staking (#4803)
- Disable all networks' switch to Manage Networks page (#4970)
- Update for chain-list stable v0.2.127
  - Support Transfer Alpha Token (#4900)
  - Bridge native TAO <-> Subtensor EVM (#4901)
  - Support bittensor on-chain swap (#4899)
  - [Subtensor EVM] Add support for some alpha tokens

**Commit**: c1c25d8ac6

---

## [1.3.77] — 2026-04-09 — Release 1.3.77 (Koni) — v1.3.77

Features & Updates:

- Improve Proxy account features (#4942)
- Improve Multisig account feature  (#4963)
- Turn off warning popup for transfers between PAH <> KAH (#4954)
- Support stDOT LSD sunset (#4968)
- Update for chainlist stable v0.2.126

**Commit**: b237bb8627

---

## [1.3.76] — 2026-03-20 — Release 1.3.76 (Koni) — v1.3.76

Features & Updates:

- Unable to turn network when no add correct API key (#4972)
- Display token name and subnet ID for subnet tokens | Bittensor (#4892)
- Support the newly updated Root staking feature | Bittensor (#4829)

**Commit**: 0acb0c93a6

---

## [1.3.75] — 2026-03-17 — Release 1.3.75 (Koni) — v1.3.75

Features & Updates:

- Add user-configurable Subscan API Key in settings (#4965)

**Commit**: 3da9ca0dcb

---

## [1.3.74] — 2026-02-11 — Release 1.3.74 (Koni) — v1.3.74

Features & Updates:

- Support Multisig Account Phase 1 (#4855)

**Commit**: fa101d21f3

---

## [1.3.73] — 2026-01-22 — Release 1.3.73 (Koni) — v1.3.73

Features & Updates:

- Update @subwallet-monorepos/subwallet-services-sdk 0.1.16 (#4957)
- Remove the Crowdloans tab (#4920)

Bug fixes:

- Fix bug get Earning position parachain (#4950)

**Commit**: 7551180ab3

---

## [1.3.72] — 2026-01-14 — Release 1.3.72 (Koni) — v1.3.72

Features & Updates:

- Integrate Proxy Account Support (#4725)
- Update chain-list stable v0.2.123 (#4861)
- Add support for USDC & stEWT (#639)
- Migrate to ParaSpell V5 (#4908)

**Commit**: 143a9f8e55

---

## [1.3.71] — 2025-12-29 — Release 1.3.71 (Koni) — v1.3.71

Features & Updates:

- Improve token enabling (Round 2) (#4247)
- Update libs for SubWallet Extensions (#4808)
- Support Import from Trust Wallet to SubWallet (#4762)

**Commit**: 1c54706967

---

## [1.3.70] — 2025-12-11 — Release 1.3.70 (Koni) — v1.3.70

Features & Updates:

- Support OpenGov (Phase 1) (#4678)

**Commit**: 14e64fc98e

---

## [1.3.69] — 2025-12-08 — Release 1.3.69 (Koni) — v1.3.69

Features & Updates:

- Update chain-list stable v0.2.122 (#4827)
- Turn off "Advanced phishing detection" feature (#4891)

**Commit**: 0a5cfcf145

---

## [1.3.68] — 2025-12-03 — Release 1.3.68 (Koni) — v1.3.68

Features & Updates:

- Standardize the Module Price History according to the new standard (#4784)
- Locked Balance Display (#4708)
- Update Transak Widget URL (#4835)

Bug fixes:

- Unable to import NFT ERC-721 on Rari chain (#4625)
- Support show NFT haven't method tokenOfOwnerByIndex (#4568)

**Commit**: 94d9b869ca

---

## [1.3.67] — 2025-11-13 — Release 1.3.67 (Koni) — v1.3.67

Features & Updates:

- Improve Swap validation by Dry-run-preview API from ParaSpell (#4671)
- Configure gas limit & max gas fee for Energy Web Chain (#4716)

**Commit**: 4d510d3a85

---

## [1.3.66] — 2025-11-07 — Release 1.3.66 (Koni) — v1.3.66

Features & Updates:

- Update chain-list stable v0.2.121 (#4812):
  - Add multichain asset for ANLOG token
  - Update alpha token netuid 71: ( name: Fa -> Leadpoet , symbol: ف -> ㄴ, priceId: dtao-71 -> kora )
- Re-enable Cross-chain transfer related to Relay-chain (#4822)
- Rounded value parameter send in EVM transaction request (#3632)

**Commit**: e69aef4e13

---

## [1.3.65] — 2025-11-06 — Release 1.3.65 (Koni) — v1.3.65

Features & Updates:

- Improve detect assets & optimize enabled tokens on EVM chains (#4542)
- Improve estimate fee through Across Bridge (#4310)
- Check buy options for DOT & KSM token (#4815)
- Add Collator's APY for Tanssi Staking (#4795)
- Some updates after Polkadot Asset Hub Migration (#4819)
- Update altinputasset for some liquid staking (#4813)

**Commit**: 3a888f3d8f

---

## [1.3.64] — 2025-10-31 — Release 1.3.64 (Koni) — v1.3.64

Features & Updates:

- [Energy Web X] Display APY for collators in collator list (#4739)
- Polkadot Asset Hub Migration (#4790)
- Update chain-list stable v0.2.120 (#4797):
  - Add XCM support for MYTH from Mythos -> Polkadot Asset Hub
  - Update symbol for GLMR.wb (Moonriver) (GLMR.wb -> GLMR.mb)
  - Remove Polkadot & Kusama related XCM Ref
  - [Hydration] Add support for ENA
  - [Hydration] Add swap support for ENA

**Commit**: 0ad17018c9

---

## [1.3.63] — 2025-10-23 — Release 1.3.63 (Koni) — v1.3.63

Features & Updates:

- Add support for in-app TANSSI staking (#4666)
- Update params for XCM transfer - Related to DOT/KSM XCM (#4787)
- Update Earning Info config for migrated chain after AHM (#4752)
- Integrate Optimex into BTC Swap Flow (#4496)
- Update chain-list stable v0.2.119 (#4767)
  - Re-check metadata for tokens that support XCM
  - \[Moonriver\] Add support for Bridged GLMR
  - \[Moonbeam\] Add support for Bridged MOVR
  - \[Hydration\] Add support for PAXG
  - Update outdated data

**Commit**: b1527c5615

---

## [1.3.62] — 2025-10-10 — Release 1.3.62 (Koni) — v1.3.62

Features & Updates:

- Update chain-list stable v0.2.118 (#4730):
  - [Xode] Add XCM support for DOT & USDT

Bug fixes:

- Fixed missing "Edit Fee" button / Improve fee loading UI (#4652)
- Fixed issue can not update patch and online resources (#4536)
- Fixed some UI bugs for migrated chain after AHM on Earning features (#4754)
- Fixed bug show Earning options for Kusama although AHM migrated (#4763)
- Fixed bug don't show toast message validate in case input amount < 1 when transfer Cardano (#4706)

**Commit**: eb99bab70a

---

## [1.3.61] — 2025-10-04 — Release 1.3.61 (Koni) — v1.3.61

Features & Updates:

- Hide copy/QR content for relay chain addresses (AssetHub migration) (#4735)
- Re-check for Paseo after migrated (#4507)

Bug fixes:

- Fixed crash in EarningPositions when asset is undefined (read property 'decimals' of undefined) in case update version (#4731)

**Commit**: b176302b37

---

## [1.3.60] — 2025-10-02 — Release 1.3.60 (Koni) — v1.3.60

Features & Updates:

- [zkVerify Mainnet] Add support for in-app VFY staking (#4688)
- Update chain-list version v0.2.117 (#4693):
  - [Xode] Add block explorer only for when users want to view transaction details SubWallet-ChainList
  - Add group for VFY tokens

Bug fixes:

- Fixed error when performing EWC staking (#4694)

**Commit**: 8edf28c95f

---

## [1.3.59] — 2025-09-23 — Release 1.3.59 (Koni) — v1.3.59

Features & Updates:

- Update chain-list stable v0.2.116 (#4704):
- Support HOLLAR mainnet (#4692)

**Commit**: 2e764d70b3

---

## [1.3.58] — 2025-09-19 — Release 1.3.58 (Koni) — v1.3.58

Features & Updates:

- Update chain-list stable v0.2.115 (#4668)
  - Add XCM support for teleporting KSM between encointer-kusama and asset-hub-kusama
  - Add block explorer only for when users want to view transaction details
  - Fixed bug do not show HOLLAR balance
  - Remove USDC.wh token (Moonbeam)
  - ...

Bug fixes:

- Fixed bug Show incorrect amount when transfer max (#4462)

**Commit**: e8a5edd5e9

---

## [1.3.57] — 2025-09-17 — Release 1.3.57 (Koni) — v1.3.57

Features & Updates:

- Add support for in-app EWT staking (#4638)

**Commit**: 17cc72e920

---

## [1.3.56] — 2025-09-11 — Release 1.3.56 (Koni) — v1.3.56

Features & Updates:

- Improve UX for the "Advanced phishing detection" feature (#4617)
- Update ledger-substrate-js library (Round 2) (#4501)
- Update chain-list stable v0.2.114 (#4651)
  - Add support for Wormhole Bridged WSOL (SOL) for Unichain mainnet
  - Add support for Hydration Hollarnet
  - [Moonbeam] Remove USDC.wh token

Bug fixes:

- Fixed bug Do not display NFT images on Vara network, PAH (#4132)
- Fixed bug Show incorrect pool/validator when earning on All accounts mode (#3972)
- Fixed automatically adding suffix to account name (#4620)
- Fixed bug Unmatched address set when connecting via Ledger Polkadot app & Ledger Avail Recovery app (#4645)
- Fixed TAO's position in Earning options (#4654)

**Commit**: c1301536b2

---

## [1.3.55] — 2025-09-05 — Release 1.3.55 (Koni) — v1.3.55

Features & Updates:

- Migrate to ParaSpell V4 & Update asset metadata (#4606)
- Add support new XCM channels (#1457)
  - DOT (Hydration) <--> PAH
  - DOT (Hydration) <--> Bifrost Polkadot
  - DOT (Bifrost Polkadot) <--> PAH
  - USDT: Bifrost Polkadot <--> Hydration
- Remove MYTH (PAH -> Ethereum) (#4444)
- Replace Hardcoded Strings with i18n Keys (#4515)
- Add notification when dapp connection but network does not exist (#3753)
- Apply dry-run to validate bridge step for swap feature (#4644)
- Update chainlist stable v0.2.113 (#4616)
  - Add support for RegionX Kusama parachain, Stable Testnet, Abstract Mainnet
  - [Commune AI] Add block explorer
  - Add support for MYTH (base), TRAC (NeuroWeb Mainnet)
  - [Polygon] Update USDT's token information
  - Add chainbalanceSlug for Tanssi Mainnet
  - Remove more networks in the Polkadot & Ethereum ecosystems, KILT token (Hydration), USDt (KAH)
  - Remove KILT staking

Bug fixes:

- Fixed some bug for customizing fee for substrate/evm transactions features (#4065)
- Fixed bug Incorrect price history chart display when changing currency in popup mode (#4586)
- Fixed min amount on popup Pay attention in case there is not enough balance to stake (#3930)

**Commit**: b1ef21fe42

---

## [1.3.54] — 2025-08-21 — Release 1.3.54 (Koni) — v1.3.54

Features & Updates:

- Support swap for Unichain (#4389)
- Support Change validator for more chains (#4540)
  - Vara
  - Aleph Zero
  - Polkadex
  - Avail
  - Edgeware
  - Ternoa
  - Dentnet
  - Cere
  - Testnet networks: Westend, Vara Testnet, Aleph Zero Testnet, Avail Turing
- Support bridge tBTC (Ethereum) to tBTC (Hydration) via Snowbridge (#4593)
- Update for patch chain (#4013)
- Update logo for subnet on Earning features (#4551, #4626)
- Update TAO staking fee (#4604)
- Update chain-list stable v0.2.112 (#4517)
  - Update information for some tokens for Fraxtal Mainnet L2
  - Update token symbol (ticker) of some tokens for Bifrost testnet, Autonomys Taurus Testnet, Polkadot Chainflip Testnet, Energy Web X Rococo/Energy Web X Paseo
  - Update block explorer for some networks: Polkadot Collectives, Polkadot People, ....
  - Update USDT token information for Arbitrum One
  - ...

Bug fixes:

- Handle case connecting with network systems that do not support WalletConnect connection (#4598)
- Fixed bug getting too many requests from Earning feature of Bittensor (#4623)

**Commit**: d0158087d4

---

## [1.3.53] — 2025-08-12 — Release 1.3.53 (Koni) — v1.3.53

Features & Update:

- Update UX/UI when support Swap for Bitcoin on Chainflip (#4581)
- Update some UI for Change validator feature (#4539)
- Improve UI for case connection unsuccessfully when connect WalletConnect (#3456)
- Update logic for rpc that don't support custom fee on EVM system (#4559)
- Hide icon Edit fee with some networks not supported (#4585)

Bug fixed:

- Fixed bug Can not disconnect when connecting to 2 URIs of the same website with WalletConnect (#2917)
- Fixed bug Can not import Json Account from Polkadot{.js} extension (#4565)
- Fixed bug Can't import JSON file(from Migrate account) on store version (#4031)
- Fixed bug when custom priority fee for EVM (#4461)
- Fixed bug Unable to detect domains name when transfer (#4072)
- Fixed bug Unable to connect to Ledger apps via Ledger Nano X 2.5.0 & Ledger Nano S+ 1.4.0 (#4592)

**Commit**: 15568ef03e

---

## [1.3.52] — 2025-08-07 — Release 1.3.52 (Koni) — v1.3.52

Features & Update:

- Refactor TAO earning position logic (#4520)
- Update coinbase on-ramp feature (#4572)
- Apply sw version when request to Backend (#4465)
- Update chain-list stable v0.2.111 (#4546)
  - Update block explorer for Polkadex, Moonbeam, Autonomys Mainnet
  - Update logo for the NEURO token & the network for NeuroWeb Mainnet
  - Exclude INACTIVE networks from destination chain display
  - ...

Bug fixed:

- Fixed bug when withdraw (#4575)
- Fixed bug no network support when connecting to the WalletConnect (#3025)

**Commit**: 591be2f21e

---

## [1.3.51] — 2025-07-31 — Release 1.3.51 (Koni) — v1.3.51

Features & Update:

- Support for Bitcoin swap on ChainFlip (#4573)

**Commit**: 6c5c0bec7b

---

## [1.3.50] — 2025-07-30 — Release 1.3.50 (Koni) — v1.3.50

Features & Update:

- Support for New Swap Pairs on Chainflip (#4495)

**Commit**: c68273583f

---

## [1.3.49] — 2025-07-28 — Release 1.3.49 (Koni) — v1.3.49

Features & Update:

- Display On-Chain Identity for Validators (#4449)
- Re-check and update block action when stake with ledger account (#4464)
- Block networks (Substrate & Ethereum) without runtime update for Ledger Substrate accounts (#4531)
- Filter "To token" Based on Selected "From token" - Round 1 (#4468)

Bug fixed:

- Fixed bug import NFT (#3837) (#3818)

**Commit**: 10867f43ca

---

## [1.3.48] — 2025-07-21 — Release 1.3.48 (Koni) — v1.3.48

Features & Update:

- Support Change validator feature (#4214)
- Stake TAO with Seamless Validator Switching (#4359)
- Turn off default enabled tokens (#4475)
- Update new content to submitted screen when swap (#4512)
- Update chain-list stable v0.2.110 (#4521)

Bug fixed:

- Fixed bug when stake/unstake with subnet staking (#4510)
- Fixed bug Cannot withdraw on Westend Asset Hub (#4522)
- Fixed bug auto-enable chain for popular tokens (#4525)
- Fixed bug SubWallet flagged by Avast and blocks connection to Polkadot.js (#4375)

**Commit**: ed31bd22d6

---

## [1.3.47] — 2025-07-11 — Release 1.3.47 (Koni) — v1.3.47

Features & Update:

- Optimize Subscan API request (#4458)
- Update Gears Library (#4443)
- Support buy token BTC (Bitcoin) (#4490)
- Update chainlist stable v0.2.108 (#4458)
  - Update block explorer for TON Network
  - Add support for gigaETH token
  - Support for PolkaVM Compatibility
  - Add swap support for gigaETH
  - ...

Bug fixed:

- Fixed bug Don't show list address type for BTC token when get address on Token details screen (#4481)

**Commit**: 895002c5b8

---

## [1.3.46] — 2025-07-04 — Release 1.3.46 (Koni) — v1.3.46

Features & Update:

- Update ledger-substrate-js library (#4365)
- Upgrading certain technical issues of the EVM provider (#2871)
- Support Asset Hub migration (#3710)

**Commit**: 81de40416e

---

## [1.3.45] — 2025-07-01 — Release 1.3.45 (Koni) — v1.3.45

Bug fixed:

- Fixed error validate receive address when transferring MYTH (Mythos) (#4486)

**Commit**: e690ac5221

---

## [1.3.44] — 2025-06-27 — Release 1.3.44 (Koni) — v1.3.44

Bug fixed:

- Hot fix error validate receive address when transferring MYTH (Mythos) (#4486)

**Commit**: 6aff3baf2b

---

## [1.3.43] — 2025-06-26 — Release 1.3.43 (Koni) — v1.3.43

Features & Update:

- TAO On-ramp Integration in SubWallet (#4358)
- Update content for Buy & Sell tokens (#4456)
- Update script scan list token support feature on/off-ramp (#4350)
- Unblock when perform stake on Bifrost with ledger account (#3931)

Bug fixed:

- Fixed bug when perform stake on Moonbase/Moonbeam/Moonriver (#4224)
- Fixed bug Fails to Load on the Hone and earning screen (#4478)

**Commit**: 00b49c6d64

---

## [1.3.42] — 2025-06-23 — Release 1.3.42 (Koni) — v1.3.42

Features & Update:

- Support Bitcoin account (#4168)
  - Support Bitcoin for new unified account (#4200)
  - Migrate unifed account to support Bitcoin (#4201)
  - Support watch-only account for Bitcoin (#4228)
  - Support bitcoin derivation with unified account (#4261)
  - Support import/export Bitcoin account (#4262)
  - Improvements unified account after Bitcoin supported (#4094)
  - Review address/chain/token handling for Bitcoin support (#4297)
  - Improve UI after Bitcoin integration (#4316)
- Update logic fetching Bitcoin balance (#4162)
- Support transfer for Bitcoin (#4263)
- Optimize Request Handling in SendFund Form (#4434)
- Optimize Lifecycle Management - P1 (#4428)
- Update chain-list stable v0.2.106 (#4410)

Bug fixed:

- Fixed some UI bugs after Bitcoin integration (#4412, #4425)

**Commit**: 35b31587e7

---

## [1.3.41] — 2025-06-11 — Release 1.3.41 (Koni) — v1.3.41

Features & Update:

- Support Asset Hub Testnet swap for Chainflip (#4265)
- Exposed API Key in SubWallet Chrome Extension
- Moving BlockFrost interaction Logic to the Backend (#4368)
- Update UI Connect dApp screen (#4377)

Bug fixed:

- Fixed bug show Moonbeam local token balance (#4413)
- Fixed bug Unable to XCM Polkadot Asset Hub -> Kusama Asset Hub (#4416)
- Fixed bug Error page when use marketing campaign (#4403)
- Fixed bug navigating actions in Earning feature (#4441)

**Commit**: 057386979f

---

## [1.3.40] — 2025-05-30 — Release 1.3.40 (Koni) — v1.3.40

Features & Update:

- Update chain-list stable v0.2.105 (#4273),
- Update SimpleSwap API
- Update Paraspell's fee calculation API (#4314),

Bug fixed:

- Fixed bug Wrong Price Impact When Swapping on PAH (#4241)

**Commit**: ac934140ed

---

## [1.3.39] — 2025-05-26 — Release 1.3.39 (Koni) — v1.3.39

Bug fixed:

- Fix bug error page when connect with dApp (#4401)

**Commit**: a85af27f86

---

## [1.3.38] — 2025-05-23 — Release 1.3.38 (Koni) — v1.3.38

Features & Update:

- Support Bridge-Swap process for cross-chain swap on EVM (#4321)
- Update UI to clearly display fees (#4347)

Bug fixed:

- Fixed bug related to feedback from Cardano Foundation (#4352)

**Commit**: c0aa94e6c7

---

## [1.3.37] — 2025-05-23 — Release 1.3.37 (Koni) — v1.3.37

Features & Update:

- Update fee for UniSwap (#4385)
- Update Wallet Connector Libraries (#4353)
- Turn off the update manifest v3 popup (#4023)

Bug fixed:

- Fixed bug when connects to Remix (#4330)

**Commit**: 49789de9b3

---

## [1.3.36] — 2025-05-16 — Release 1.3.36 (Koni) — v1.3.36

Features & Update:

- Support KyberSwap Aggregator (#4144)
- Support UniswapX Dutch Swap (#4293)
- Review Uniswap fee (#4088)

**Commit**: 07cea86dd5

---

## [1.3.35] — 2025-05-09 — Release 1.3.35 (Koni) — v1.3.35

Features & Update:

- Refactor Across bridge (#4282)
- Review extrinsic status subscription (#4240)
- Update content in-app for swap (#4259)

Bug fixed:

- Fixed bug Cannot sign transaction when chain connection not be initialized (#4300)
- Fixed bug connecting to Aleph Zero EVM dapp (#4320)
- Fixed bug related to price chart for derivation token (#4332, #4344)

**Commit**: f67dfecc43

---

## [1.3.34] — 2025-05-05 — Release 1.3.34 (Koni) — v1.3.34

Features & Update:

- Support extension side panel (#4091)
- Update padding for the time frame selector for price chart

**Commit**: 6fff6b28ff

---

## [1.3.33] — 2025-04-30 — Release 1.3.33 (Koni) — v1.3.33

Features & Update:

- Support price chart (#4122, #4266)
- Update link for "Contact support" (#4324)

**Commit**: 300d28880c

---

## [1.3.32] — 2025-04-26 — Release 1.3.32 (Koni) — v1.3.32

Features & Update:

- Support CIP-30 on Cardano (#4100)
- Support swap-bridge for EVM chains (#4220)
- Swap support and direct cross-chain swap on more EVM chains (#4219)
- Change TAO's position in Earning options (#4290)
- Update features related to middleware services (#4312)
- Update chain-list

Bug fixed:

- Fixed bug when stake for subnet (#4287)

**Commit**: 0d95cc2b71

---

## [1.3.31] — 2025-04-18 — Release 1.3.31 (Koni) — v1.3.31

Features & Update:

- Improve token enabling (#3960)
- Update XCM feature:
  - Estimate delivery fee when XCM (#4133)
  - Dry run XCM (#4134)
  - Improve validate recipient when make XCM transfer (#4233)
- Support Across bridge (#3918, #4299)
- Update chain-list stable v0.2.103 (#4163)
- Support GIGADOT token for Hydration (#4283)

Bug fixed:

- Fixed XCM bugs:
  - Fixed bug XCM USDT: PAH -> ASTR (#3606)
  - Fixed bug XCM for Acala (#3725)
  - Fixed bug Cannot read properties of undefined when performing XCM for Moonbeam (#3903)

**Commit**: f290efb637

---

## [1.3.30] — 2025-04-14 — Release 1.3.30 (Koni) — v1.3.30

Features & Update:

- Improve UX for swap cross-chain Round 2 (#4114):
  - Improve swap feature (#4069)
  - Improve Select provider in Swap feature (#3933)
  - Optimize swap pair selection (#3902)
  - Update New UI for Swap quote (#4204)
  - Recheck swap quote with asset hub (#4113)
- Support custom slippage for TAO subnet staking (#4145)
- Add APY information for TAO and dTao staking (#4217)

Bug fixed:

- Fixed enforcing the minimum miner tip 1 wei (#2393)
- Fixed UX for swap cross-chain Round 2 (#4114)
  - Error when swap on hydration (#3993)
  - Fixed bug Cannot read properties of undefined (reading 'destinationTokenInfo') when open the old Notification details (#4195)
  - Fixed bug Error page when perform sign permit from Uniswap (#4248)

**Commit**: 577bae0a04

---

## [1.3.29] — 2025-04-08 — Release 1.3.29 (Koni) — v1.3.29

Features & Update:

- Support auto detect balance for EVM (#2836)
- Sort token by balance (#2339)
- Update for Meld on-ramp (#4198)
- Add validate sufficient token for XCM transfer (#3895)

Bug fixed:

- Fixed bug getting EVM addresses when connecting to Autonomy (#4172)

**Commit**: b172e9bfc3

---

## [1.3.28] — 2025-04-02 — Release 1.3.28 (Koni) — v1.3.28

Features & Update:

- Show value of derivative token relative to the origin tokens (#4081)
- Add dTAO token (#4151)
- Display dTAO balance like another token (#4150)

Bug fixed:

- Fixed bug related to subnet staking feature (#4140)
- Fixed bug Reset Auto-lock, Advanced phishing detection, Camera in case upgrade version (#3741)

**Commit**: 6e39edfb4d

---

## [1.3.27] — 2025-03-29 — Release 1.3.27 (Koni) — v1.3.27

Features & Update:

- Improve UX for swap cross-chain round 1 (#4090)
- Update chainlist stable version 0.2.102 (#4058)
- Update API key for blockfrost on Cardano (#4164)

Bug fixed:

- Fixed bug Swap from DOT -> ETH(Arbitrum) (#4141)

**Commit**: 734c548591

---

## [1.3.26] — 2025-03-27 — Release 1.3.26 (Koni) — v1.3.26

Bug fixed:

- Fixed bug show balance for Polimec (#4058)
- Fixed bug View explorer for Bittensor (#4058)

**Commit**: 329c84077a

---

## [1.3.25] — 2025-03-24 — Release 1.3.25 (Koni) — v1.3.25

Features & Update:

- Support dTAO staking (#4036)
- Integrate Meld All in One Wizard (#4085)

Bug fixed:

- Fixed bug integrating Wagmi into SubWallet (#4086)

**Commit**: 51be24cca1

---

## [1.3.24] — 2025-03-18 — Release 1.3.24 (Koni) — v1.3.24

Features & Update:

- Auto update metadata for substrate chain (#4037)
- Allow customizing fee for substrate/evm transactions (#3658)
- Support custom fee token when sending token on Hydration (#4045)

Bug fixed:

- Fixed bug Can't reset data when search on select token popup (#3786)

**Commit**: 638f989896

---

## [1.3.23] — 2025-03-05 — Release 1.3.23 (Koni) — v1.3.23

Features & Update:

- Support Uniswap (#3977)
- Support Cardano (#3816, #3924, #3925, #3942)
- Support Migrate account feature (#3926, #4016)
- Unified address format integration (#3864)

Bug fixed:

- Fix Bug when unstaking vDOT, vMANTA (#4054)

**Commit**: 256f98fe0b

---

## [1.3.22] — 2025-03-04 — Release 1.3.22 (Koni) — v1.3.22

Features & Update:

- Support staking for Mythos (#3984)

**Commit**: 5687ad1071

---

## [1.3.21] — 2025-02-28 — Release 1.3.21 (Koni) — v1.3.21

Features & Update:

- Allow signing once for multiple transactions (#3901)
- Update chain-list stable v0.2.99 (#4007)

**Commit**: 3f05a9b8d0

---

## [1.3.20] — 2025-02-24 — Release 1.3.20 (Koni) — v1.3.20

Features & Update:

- Support transferring VARCH on InvArch Network

Bug fixed:

- Fixed bug Unable to estimate fee when signing for dApp (#4050)

**Commit**: c6418f3b79

---

## [1.3.19] — 2025-02-21 — Release 1.3.19 (Koni) — v1.3.19

Bug fixed:

- Fixed bug related to custom token to paid fee

**Commit**: d8fa53c223

---

## [1.3.18] — 2025-02-20 — Release 1.3.18 (Koni) — v1.3.18

Features & Update:

- Support paying fee with non-native tokens on Asset Hub (#3590)

**Commit**: 01dfb01730

---

## [1.3.17] — 2025-02-18 — Release 1.3.17 (Koni) — v1.3.17

Features & Update:

- Show well-known tokens on top (#3920)
- Unable to load TAO balance (#4032)

Bug fixed:

- Fixed bug Show incorrect APY for some chains (#4026)
- Fixed rate limit api key for Bittensor(TAO) (#4029)

**Commit**: d9b1e35dc1

---

## [1.3.16] — 2025-02-10 — Release 1.3.16 (Koni) — v1.3.16

Features & Update:

- Add in-app staking for Analog

**Commit**: afbc58a3e3

---

## [1.3.15] — 2025-02-06 — Release 1.3.15 (Koni) — v1.3.15

Bug fixed:

- Fix issue Don't open the extension related to Patch feature (#4002)
- Fix bug Do not show earning position for Bittensor (#4006)

**Commit**: 406874dfac

---

## [1.3.14] — 2025-01-24 — Release 1.3.14 (Koni) — v1.3.14

Features & Update:

- Update chain-list stable (#3974)
- Add staking support for CERE (#360)

**Commit**: d1e054b367

---

## [1.3.13] — 2025-01-21 — Release 1.3.13 (Koni) — v1.3.13

Features & Update:

- Re-enable search token feature (#3958)
- Update signing flow with metadata (#3306)

Bug fixed:

- Fix bug setup validator related maxCount (#3971)

**Commit**: 8358f527ed

---

## [1.3.12] — 2025-01-06 — Release 1.3.12 (Koni) — v1.3.12

Features & Update:

- Add referral code for Bifrost Liquid Staking (vDOT, vMANTA)
- Support bridge ETH <-> POS (#3893)
- Support Avail Recovery app (#3915)
- Set up SubWallet validators (#2533)
- Update chain-list (#3897)

Bug fixed:

- Fix max transferable for Avail Bridge (#3911)

**Commit**: 1f327e40a6

---

## [1.3.11] — 2024-12-23 — Release 1.3.11 (Koni) — v1.3.11

Features & Update:

- Support swap TAO on SimpleSwap (#3855)
- Update content on unstake screen for some earning options (#3778)

Bug fixed:

- Fix errors when making transactions on Tangle mainnet (#3861)

**Commit**: 84d752c0c3

---

## [1.3.10] — 2024-12-12 — Release 1.3.10 (Koni) — v1.3.10

Features & Update:

- Update version polkadot api (#3888)
- Unable to transfer local token on Bifrost (#3896)

**Commit**: aecd1c0a04

---

## [1.3.9] — 2024-12-09 — Release 1.3.9 (Koni) — v1.3.9

Features & Update:

- Allow Polkadot namespace use EVM address (#3870)
- Support Generic ledger app for Vara network (#3835)

Bug fixed:

- Fixed bug validating recipient balance when sending Substrate token (#3713)
- Fixed bug send NFT on Ethereum network (#3762)

**Commit**: d8c772a653

---

## [1.3.8] — 2024-12-03 — Release 1.3.8 (Koni) — v1.3.8

Features & Update:

- Improve chain-list online patch (#3132)
- Support Unified bridge on Polygon (#3826)
  - ETH: Ethereum -> Polygon zkEVM
  - ETH: Polygon zkEVM -> Ethereum
- Update chain-list
  - Add support for G6 network testnet
  - Add support for LOVA token (PAH, Hydration)
  - Add support for PIP token (Storty Odyssey Testnet)
  - Add support for Fraxtal Mainnet
  - Add support for Cyber
  - Update Aventus Block Explorer
  - Delete Story Public Tesnet (Iliad testnet)

**Commit**: 6d05bd42e2

---

## [1.3.7] — 2024-11-23 — Release 1.3.7 (Koni) — v1.3.7

Features & Update:

- Update chain-list (#3846)
  - Add support for Gnosis
  - Add support for Autonomys Mainnet
  - Add support for KMA (Manta Pacific), USDC (Base Mainnet)
  - Update information for some chains and tokens: add explorer, price-id, logo & name
- Improve display collators list (#2751)
- Improve block action online by environment (#3814)
- Integration NFT for Story Protocol (#3854)

Bug fixed:

- Re-check transaction on Polkadot Asset Hub (#3852)

**Commit**: 90a7fc15e8

---

## [1.3.6] — 2024-11-07 — Release 1.3.6 (Koni) — v1.3.6

Features & Update:

- Update chain-list (#3828)
  - Add Polygon Amoy testnet
  - Add Polygon zkEVM Cardona testnet
  - Add WETH, POL, USDC (Amoy)
  - Add ETH, MATIC, POL (Cardona)
  - Update explorer for Tangle network

Bug fixed:

- Fixed error auto reset data on Pool field (#3001)

**Commit**: 4b5d2b2827

---

## [1.3.5] — 2024-10-31 — Release 1.3.5 (Koni) — v1.3.5

Features & Update:

- Support ERC-1155 (#3726)
- Refactor logic parsing data from contract response (#3070)
- Re-check some old types from ExtrinsicType (#3654)
- Update chain-list (#3815)
  - Add support for World Chain
  - Add support for Mode Mainnet
  - Add support for Lisk mainnet
  - Add support for Zircuit mainnet
  - Add support for Tangle Network mainnet
  - Add support Story Odyssey Testnet

Bug fixed:

- Fixed bug Do not show token (#3721)

**Commit**: 6b2b19f7dd

---

## [1.3.4] — 2024-10-28 — Release 1.3.4 (Koni) — v1.3.4

Features & Update:

- Integrate Avail Bridge (#3423)
- Support Notification in app (#3507, #3515)
- Allow importing assets on Asset Hub (#3636)
- Update api key for TAO(Bittensor) (#3809)
- Update chain-list (#3806)
  - Add support for Unichain testnet
  - Update address prefix for Bifrost

**Commit**: 4b898b40b9

---

## [1.3.3] — 2024-10-16 — Release 1.3.3 (Koni) — v1.3.3

Features & Update:

- Fix bug Do not show watch-only account on History (#3732)
- Update Network details screen for TON (#3747)
- Update chain-list
  - Update logo for MATIC token
  - Remove Tinkernet

Bugs fixed:

- Fix min stake for TAO(Bittensor) (#3788)
- Fix bug show OG WUD BURN NFT Collection (#3791)

**Commit**: 947cf51896

---

## [1.3.2] — 2024-10-12 — Release 1.3.2 (Koni) — v1.3.2

Features & Update:

- Support TAO in-app staking (#2505)
- Support Ternoa NFT (#3559)
- Update default slippage for ChainFlip (#3634)
- Support export for Derived account (#3751)
- Update address for TON testnet in the token detail screen on All accounts mode (#3752)
- Improve UI related to Account selector screen (#3755, #3772))
- Improve UI related to Select token screen (#3756)
- Add infobox about Wallet version for TON token (#3718)
- Update chainlist (#3760)
  - Add support for LogX token
  - Add support for Mantle Network
  - Add support for MATIC (Polygon zkEVM) and POL (Ethereum) token
  - Add support for zkVerify Testnet
  - Add support for RARI Chain
  - Add support for Scroll mainnet
  - Update some information:
    - Update Avail group token
    - Re-check enable TON (TON network) token
- Add validate tokenOfOwnerByIndex when import NFT (#3609)

**Commit**: 68fcf5149e

---

## [1.3.1] — 2024-10-08 — Release 1.3.1 (Koni) — v1.3.1

Features & Update:

- Support Unified account

**Commit**: ed98953615

---

## [1.2.32] — 2024-10-01 — Release 1.2.32 (Koni) — v1.2.32

Features & Update:

- Improve marketing campaign (#3461, #2807)

Bugs fixed:

- Hot fix handle API status (#3711)

**Commit**: 2c00906ebd

---

## [1.2.31] — 2024-09-28 — Release 1.2.31 (Koni) — v1.2.31

Features & Update:

- Block action online (#3635)
- Update chain-list (#3680)
  - Add XCM support for KSM between Bifrost KSM <> Kusama
  - Update RPC for Cess Network
- Add swap pairs for Hydration and ChainFlip (#3633, #3651)

Bugs fixed:

- Fix bug Do not show earning position for StellaSwap (#3647)
- Fix bug Can't import JSON file containing Unified account (#3643)

**Commit**: 39db6f9866

---

## [1.2.30] — 2024-09-20 — Release 1.2.30 (Koni) — v1.2.30

Features & Update:

- Add Chainflip broker (#3483)
- Re-calculate max transferable for XCM native token (#3617)
- Update chain-list (#3637)
  - Add support for Tether's XAUt token
  - Add support for BUNS token for PAH, Hydration
  - Add support for Ternoa zkEVM + Testnet
  - Update information for some chains (<https://github.com/Koniverse/SubWallet-ChainList/issues/302>)
    - DOT <-> CFG
    - CFG <-> USDT
    - DOT <-> BNC
    - BNC <-> USDT
    - BNC <-> HDX
  - Add support for new swap pairs on Hydration
  - Hidden XCM on Pioneer

Bugs fixed:

- Fix bug not showing balance of VFT tokens (#3612)
- Fix bug do not show balance (#3653)

**Commit**: 65a2517276

---

## [1.2.29] — 2024-09-13 — Release 1.2.29 (Koni) — v1.2.29

Features & Update:

- Support XCM for Ledger Polkadot generic app (#3458)
- Adjust showing/validating address on Earning actions (#2703)
- Update chain-list (#3558)
  - Add support for Creditcoin CC3 Mainnet
  - Add support for vASTR on Hydration
  - Add support for Cypress tokens on Hydration, PAH
  - Update some network and token information
  - Add support for new swap pairs on Hydration
- Support XCM channels (#3453)
  - MYTH: Hydration --> Mythos
  - MYTH: PAH --> Mythos

Bugs fixed:

- Fixed bug Do not show token when standing on All accounts mode in case token does not get balance (#2352)
- Fix bug do not show lock balance in case account have Kusama nomination pool (#3579)
- Fix bug XCM for channel: DOT: KAH -> PAH (#3561)
- Fix bug display wrong APY for Polkadot staking option (#3601)

**Commit**: 6071bfea40

---

## [1.2.28] — 2024-09-04 — Release 1.2.28 (Koni) — v1.2.28

Features & Update:

- Format error when connecting to dApp (#3445)
- Update connector version (#3363)
- Update substrate dApp connect interface to allow dApp connect with EVM account (#3401)
- Improve Amount input field (#1905)
- Improve fetching era stakers (#3467)
- Add warning in case user earn for both nomination pool and direct (#3477)
- Add Notice of need to unstake for users who are simultaneously staking for both Direct and Nomination Pool (#3484)
- Improve condition for Marketing campaign (#3468)
- Update chain-list (#3518)
  - Add support for Polygon zkEVM
  - Add support for Immutable zkEVM
  - Add support for Story Public Testnet
  - Add support for Soneium Testnet
  - Update logo for some chains, tokens

Bugs fixed:

- Fix UI bug on the Transfer screen (#3452)
- Fix bug XCM (#3519)

**Commit**: cd1438c541

---

## [1.2.27] — 2024-08-22 — Release 1.2.27 (Koni) — v1.2.27

Features & Update:

- Update balance calculation for DeepBrainChain (#3481)
- Update chain-list (#3478)
  - Add support for 5ireChain mainnet
  - Update decimals for Litmus, Litentry
  - Update ED for some token: USDT, USDC (PAH), LIT (Litmus), LIT (Litentry), WUD (Hydration)

**Commit**: 6140ab5a25

---

## [1.2.26] — 2024-08-19 — Release 1.2.26 (Koni) — v1.2.26

Bugs fixed:

- Update earning feature with cache from middleware service

**Commit**: e75c937e10

---

## [1.2.25] — 2024-08-17 — Release 1.2.25 (Koni) — v1.2.25

Features & Update:

- Update balance calculation for nomination pool runtime update (#3443)
- Do not allow send to empty account (Native token balance = 0) (#2783)
- Add validate for Solochain when receive, transfer with Generic ledger account (#3464)
- Update chainlist (#3451)
  - Add support for Blast Mainnet
  - Add in-app staking support for DENTX

Bugs fixed:

- Fix Input overflow width issue (#3441)
- Fix bug Do not show Signature popup in case not enough balance to cover gas fee (#2501)

**Commit**: 7db9b55525

---

## [1.2.24] — 2024-08-09 — Release 1.2.24 (Koni) — v1.2.24

Features & Update:

- Allow to use Migration Polkadot App to attach Ledger account (#3307, #3402)
- Hide direct api usage of polkadot/js (#3308)
- Improve performance upon showing Marketing Campaign (#3414)
- Update chainlist (#3425)
  - Add support for Pendulum assets (ASTR, vDOT, BNC)
  - Add support for Exosama network

**Commit**: 16194ce49e

---

## [1.2.23] — 2024-08-03 — Release 1.2.23 (Koni) — v1.2.23

Features & Update:

- Update chain-list (#3403)
  - Add support for ROUTE token
  - Add support for Aleph Zero EVM (mainnet)
  - Update price-id for AZERO EVM

**Commit**: 4a5f2ed1ac

---

## [1.2.22] — 2024-07-31 — Release 1.2.22 (Koni) — v1.2.22

Features & Update:

- Update chain-list (#3385)
- Integrate Avail Ledger app (#2982)

Bugs fixed:

- Fix bug Show incorrect withdrawal information of the Bifrost liquid staking when all accounts mode (#3327)
- Fix bug do not show root screen after remove account (#3148)
- Fix bug Show blank screen when attach account (#3054)

**Commit**: a3c0a9cf92

---

## [1.2.21] — 2024-07-24 — Release 1.2.21 (Koni) — v1.2.21

Bugs fixed:
Fix a few bugs for Avail (#3378)

- Add AVAIL token on Ethereum
- Integrate Avail OG NFT
- Setup default nomination pool online
- Update Avail staking APY
- Fix bug when click "View details" on the Sign transaction from dApp

**Commit**: c08618703b

---

## [1.2.20] — 2024-07-23 — Release 1.2.20 (Koni) — v1.2.20

Features & Update:

- Update chain-list for Avail

**Commit**: b0f31d15ad

---

## [1.2.19] — 2024-07-23 — Release 1.2.19 (Koni) — v1.2.19

Features & Update:

- Update chain-list for Avail

**Commit**: 3460b74b70

---

## [1.2.18] — 2024-07-23 — Release 1.2.18 (Koni) — v1.2.18

Features & Update:

- Update chain-list for Avail (#3369)

**Commit**: 460dd083b9

---

## [1.2.17] — 2024-07-22 — Release 1.2.17 (Koni) — v1.2.17

Features & Update:

- Set default pool and default validator for Avail (#3365)

**Commit**: 3f2dc7041a

---

## [1.2.16] — 2024-07-19 — Release 1.2.16 (Koni) — v1.2.16

Features & Update:

- Move step shorten metadata and calculate metadataHash to client (#3305)
- Add support Ledger for Polkadex (#3231)
- Improve the staking reward information retrieval (#3326)
- Update Vara token sdk version (#3270)
- Update chain-list
  - Remove Avail Goldberg testnet
  - Add support for Aleph Zero EVM testnet
  - Add support for Cere Network
  - Add KOL / Kolkadot on PAH, Hydration

Bugs fixed:

- Fix bug connecting to uquid dapp with Wallet Connect (#3275)

**Commit**: 1894de4192

---

## [1.2.15] — 2024-07-12 — Release 1.2.15 (Koni) — v1.2.15

Features & Update:

- Update chain-list
  - Add support for Aura Network
  - Update SQD token logo
  - Support Decoded collection from Unique
  - Add multi-chain asset for some token
- Update chain-list health-check and report RPC connect status (#3243)
- Update fallback API for SubWallet API (Price, Exchange rate) (#3183)
- Add validate account in case sign transaction with Ledger account (#3263)

Bugs fixed:

- Fix bug calculating balance for relaychain (#3312)
- Fix bug show withdraw information for the Acala liquid staking (#2965)

**Commit**: 044c8735ef

---

## [1.2.14] — 2024-07-09 — Release 1.2.14 (Koni) — v1.2.14

Features & Update:

- Add support Swap Asset Hub (#3272)

Bugs fixed:

- Fix bug Cannot read properties of undefined (reading 'filter') related to Mission pool (#3289)
- Hotfix update chain-list stable version
- Fix bug transaction has a bad signature when transfer AVL token (#3300)

**Commit**: 881cb3fb2c

---

## [1.2.13] — 2024-07-05 — Release 1.2.13 (Koni) — v1.2.13

Features & Update:

- Update chain-list
  - Add support for MYTH token
  - Add support for WIFD token
- Update UI for the Signature request screen from dApp (#3260)
- Update UI for Mission pool feature (#3212)
- Change token type from GRC-20 to VFT (#3268)

Bugs fixed:

- Fix bug Do not show account to get address when stand on All accounts mode (#3283)

**Commit**: fc254ff37e

---

## [1.2.12] — 2024-07-02 — Release 1.2.12 (Koni) — v1.2.12

Features & Update:

- Update chainlist:
  - Add support for Berachain testnet
  - Add support for Atleta Testnet
- Remove Interlay lending (#3226)

Bugs fixed:

- Fix bug Cannot read properties of undefined (reading 'includes') (#3259)
- Fix bug Do not show Interlay's earning position (#3234)
- Fix bug not showing popup Swap confirmation when swap with Injected account (#3230)

**Commit**: 67f2e645db

---

## [1.2.11] — 2024-06-29 — Release 1.2.11 (Koni) — v1.2.11

Features & Update:

- Integrate Polkadot Ledger app from Zondax (#2453)

Bugs fixed:

- Fix bug Show incorrect screen when perform earning actions with Ledger's EVM account (#3254)

**Commit**: d5dcac1341

---

## [1.2.10] — 2024-06-25 — Release 1.2.10 (Koni) — v1.2.10

Features & Update:

- Update subwallet-react-ui (#3228)
- Fix bug Screen flickering error when interacting with extensions (#3131)
- Fix bug Show incorrect Amount on Transaction history, Transaction confirmation for transfer NFT (#3133)

**Commit**: b9762d19c3

---

## [1.2.9] — 2024-06-24 — Release 1.2.9 (Koni) — v1.2.9

Features & Update:

- Update chain-list (#3214)
  - Add support for Analog Testnet
  - Add support for more tokens on HydraDX
  - Add support for tokens listed on StellaSwap Pulsar
  - Add support for Karura assets
  - Update logo for some tokens
  - Update chain type for some chains
- Support SnowBridge (#1984)

Bugs fixed:

- Fix bug Error can't read properties of undefined (reading 'filter')

**Commit**: f2f04e416e

---

## [1.2.8] — 2024-06-21 — Release 1.2.8 (Koni) — v1.2.8

Bugs fixed:

- Fix bug Error can't read properties of undefined (reading 'filter') (#3218)

**Commit**: 50691f0dfc

---

## [1.2.7] — 2024-06-20 — Release 1.2.7 (Koni) — v1.2.7

Features & Update:

- Support MV3 on Firefox (#3108)

**Commit**: cbbd162d15

---

## [1.2.6] — 2024-06-19 — Release 1.2.6 (Koni) — v1.2.6

Features & Update:

- Improve the Marketing Campaign application mechanism (#2806)
- Update chain-list (#3185)
  - Add vASTR token
  - Remove priceid vETH
  - Update provider
- Show nomination pool with block status (#3043)
- Hide the popup Remind backup seed phrase (#3198)
- Support transfer between PAH - KAH (#3095)

Bugs fixed:

- Check error logs in earning feature (#3197)
- Fixed bug related to earning feature ( Round 5) (#2995)

**Commit**: 9fcbb1fa5f

---

## [1.2.5] — 2024-06-11 — Release 1.2.5 (Koni) — v1.2.5

Features & Update:

- Add CheckMetadataHash signed extension support (#3175)
- Improve the Substrate Provider to meet the demands of dApps utilizing both EVM and Substrate (#2869)
- Refactoring code earning service (#3000)

Bugs fixed:

- Fixed bug Sign transaction failed for some tokens with Aleph Zero Ledger account (#3145)

**Commit**: edf836dc4d

---

## [1.2.4] — 2024-06-08 — Release 1.2.4 (Koni) — v1.2.4

Features & Update:

- Update Parallel liquid staking (#3139)
- Update lock time of MV3 extension (#3144)
- Support more XCM channels (#3134)
  - Support transfer between PAH - KAH
  - Add XCM support for Pendulum:
    - USDT: Polkadot Asset Hub **<-->** Pendulum
    - USDC: Polkadot Asset Hub **<-->** Pendulum
    - DOT: Polkadot **<-->** Pendulum
- Update chainlist
  - Add support for BORK token
  - Update HydraDX information
- Add the "View on explorer" button on the Token details screen (#3053)
- Update some message related to earning feature (#3150)
- Update transferable formula for system pallet v1 (#3166)

**Commit**: 6e54674edc

---

## [1.2.3] — 2024-06-03 — Release 1.2.3 (Koni) — v1.2.3

Features & Update:

- Update chain-list (#3094)
  - Remove bit.country testnet, Ethereum Goerli
  - Add support for Ink Whale token INW2
  - Add support for Kreivo Network
  - Add support Bitlayer
  - Add support Bsquared network
  - Add support BounceBit
- Improve swap quote fetching speed (#3104)
- Update transferable balance calculation formula (2118)

**Commit**: cc7dbf43b7

---

## [1.2.2] — 2024-05-30 — Release 1.2.2 (Koni) — v1.2.2

Features & Update:

- Remove support for Moonbeam on Polkadot vault (#3056)
- Update UI for Earning position details (#3127)
- Remove the logic that differentiates between Native tokens and Local tokens in case show sub-logo (#3075)
- Show duplicate transaction history when transfer local token (#2613)

Bugs fixed:

- Fixed some bug related to MV3 (#3146)
  - Timing logic to display seed phrase backup prompt popup
  - Bug disconnect port

**Commit**: a9448c5213

---

## [1.2.1] — 2024-05-28 — Release 1.2.1 (Koni) — v1.2.1

Features & Update:

- Update Extension Manifest V3 (#2205)
- Handle case displayed account with specific network (#2709)

**Commit**: 78f25028a0

---

## [1.1.68] — 2024-05-25 — Release 1.1.68 (Koni) — v1.1.68

Features & Update:

- Update chainlist (#3088)
  - Add support for STINK token
  - Add support for WUD token on HydraDX and Polkadot Asset Hub
  - Add support for WIFD on HydraDX and Polkadot Asset Hub
  - Add support for Linea
  - Add support for bridged tokens
  - Update logo Moonriver, Moonbeam
  - Add support for Kusama people chain
- Add popup to remind users to perform backups account (popup hiển thị định kỳ) (#2317)
- Add popup remind backup account (popup hiển thị ngay khi mở trình duyệt) (#3050)
- Add highlight button Export multi account when navigate to select account screen (#3090, #3108)

Bugs fixed:

- Fix bug missing custom tokens on applying online patch (#3101)
- Fix error when fetching with Avail network (#3115)

**Commit**: 70e26e92a0

---

## [1.1.67] — 2024-05-22 — Release 1.1.67 (Koni) — v1.1.67

Features & Update:

- Update chain-list:
  - Update price-id for DED
  - Update ED for Vara

Bugs fixed:

- Fix bug integrating chain online (#3084)

**Commit**: ef638e5698

---

## [1.1.66] — 2024-05-21 — Release 1.1.66 (Koni) — v1.1.66

Features & Update:

- Update chain-list (#3055)
  - Support SQD token on Arbitrum
  - Support for Common LP Drops and Common Staking Drops
  - Update price-id for AUDD
- Update new chain-list interface (#3085)
- Support GRC-20 token (#2852, #3067)

Bugs fixed:

- Handle the case of not resetting the wallet to the default state when click Erase all (#3035)

**Commit**: 95fe257913

---

## [1.1.65] — 2024-05-16 — Release 1.1.65 (Koni) — v1.1.65

Features & Update:

- Update chain-list (#3040)
  - Update chainBalanceSlug and explorer for some chains
  - Add support for Hyperbridge (Nexus)
  - Add support for CESS testnet
  - Add support for Pendulum, Amplitude assets
  - Add support for BOB and tokens on BOB

Bugs fixed:

- Fixed bug Unable to back screen in case open General settings to Marketing campaign (#3062)
- Fixed bug when transferring PSP22 token (#3041)

**Commit**: b2ccf85040

---

## [1.1.64] — 2024-05-10 — Release 1.1.64 (Koni) — v1.1.64

Features & Update:

- Update chain-list (#3020)
  - Add support for Curio Network
  - Add new blockchain explorer for InvArch
  - Add explorer for Mythos and Avail Turing
  - Update ED for Mythos
  - Update symbol for native token on Commune AI: C -> COMAI

Bugs fixed:

- Fixed bug enable chains when detect balance (#2882)
- Fixed bug  Invalid recipient address when Dapp deploy smart contract (#2859)

**Commit**: 0945fdb859

---

## [1.1.63] — 2024-05-09 — Release 1.1.63 (Koni) — v1.1.63

Bugs fixed:

- Fixed cannot signing with dApp in case network is not publish (#3027)
- Fixed bug Network's status show incorrect (#3037)

**Commit**: a4f441a653

---

## [1.1.62] — 2024-05-08 — Release 1.1.62 (Koni) — v1.1.62

Features & Update:

- Add more currency type (#2738, #3011)
- Disallow staking to collators/pools that maxed out member threshold (#2743, 2754)
- Display list Recommended by label in Select pool screen (#2940)

Bugs fixed:

- Fixed bug Don't display network on Mission pool details (#3005)
- Fixed bug Can't hit the "Confirm" button on ToS of the Swap feature (#3007)
- Fixed bug Error getting wrong validator address (#2821)
- Update Validator name/ Collator name (#2998)

**Commit**: 74c59d9abe

---

## [1.1.61] — 2024-05-02 — Release 1.1.61 (Koni) — v1.1.61

Features & Update:

- Hide popup Introducing Earning feature (#2948)

Bugs fixed:

- Fixed bug Cannot read properties of undefined (reading 'length') (#2986)
- Fixed bug related to earning feature (#2680)

**Commit**: 3d021adad8

---

## [1.1.60] — 2024-04-29 — Release 1.1.60 (Koni) — v1.1.60

Features & Update:

- Add support Mythos chain (#2966)
- Set default pool for Avail Turing (#2971)

**Commit**: 5dd2e22797

---

## [1.1.59] — 2024-04-25 — Release 1.1.59 (Koni) — v1.1.59

Features & Update:

- Support staking for Avail Turing (#2963)

**Commit**: ff4b206eb7

---

## [1.1.58] — 2024-04-24 — Release 1.1.58 (Koni) — v1.1.58

Features & Update:

- Add show/hide password for case input password (#2555)
- Update chain-list (#2947)
  - Set "SubWallet Official 3" as the default pool for Vara
  - Add support for Commune AI blockchain and COMAI token (Mainnet)
  - Add Block Explorer for Enjin Relaychain, Enjin Matrix
  - Add support for DBC network
  - Add support Avail Turing

Bugs fixed:

- Fixed bug Do not show transaction history in case sender account is null (#2955)

**Commit**: 38f031e806

---

## [1.1.57] — 2024-04-23 — Release 1.1.57 (Koni) — v1.1.57

Bugs fixed:

- Fix bug related to Aleph Zero transfer and staking (#2655)
- Fix issue related to earning status (#2941)

**Commit**: e98f053a79

---

## [1.1.56] — 2024-04-19 — Release 1.1.56 (Koni) — v1.1.56

Features & Update:

- Update chainlist (#2931)
  - Add rpc  for Liberland: wss://liberland-rpc.dwellir.com
  - Add support for STINK token
  - Add support for PINK token on Base network
  - Support Paseo network
- Bump Polkadot dependencies (#2853)
- Support NFTs on Asset Hub (#2934)
- Update withdraw time for Parachain (#2830)

Bugs fixed:

- Fixed bug parsing Earning status for Nomination pool (#2937)

**Commit**: ad2b6afa58

---

## [1.1.55] — 2024-04-14 — Release 1.1.55 (Koni) — v1.1.55

Features & Update:

- Implement Swap feature for extension (#2823)
- Support Export all accounts feature (#2819)
- Add warning message for cross chain transfer to an exchange (CEX) (#2873)
- Update chain-list (#2890)
  - Add support for Acurast Canary
  - Add support for token BEEFY for AssetHub and HydraDX
  - Add support Humanode - HMND (Substrate) / eHMND (EVM)
  - Update logo for Viction
  - Add xcDED for Moonbeam
  - Update ChainAsset
- Automatically enable network when connecting via Substrate provider (#2899)

Bugs fixed:

- Fixed bug show minimum active stake (#2889)
- Fixed bug Error page when sign message with WalletConnect (#2915)
- Fixed bug displaying 'connection existed' when connecting WalletConnect (#2903)

**Commit**: b65d4ed8e0

---

## [1.1.54] — 2024-04-09 — Release 1.1.54 (Koni) — v1.1.54

Bugs fixed:

- Fix issue in transaction screen (#2891)
- Fix error in setting screen

**Commit**: 7191299927

---

## [1.1.53] — 2024-04-08 — Release 1.1.53 (Koni) — v1.1.53

Bugs fixed:

- Fixed bug fetching balance with Enjin Relay Chain (#2885)
- Fixed bug Wallet Connect not show connection popup (#2407)
- Fixed bug Some required methods are missing when connecting Dapp to Subwallet via WalletConnect (#2860)

**Commit**: 6dca1331e1

---

## [1.1.52] — 2024-04-05 — Release 1.1.52 (Koni) — v1.1.52

Features & Update:

- Update balance service (#2416)
- Improve UX UI for earning feature (#2827)
- Update message when navigate user to the Astar portal to stake (#2847)
- Update chain-list (#2851)
  - Add support for X Layer mainnet, X Layer testnet
  - Add support for ASTR token on Astar zkEVM
  - Add support DOTA token on Polkadot Asset Hub
  - Add support BNCS for Moonbeam

Bugs fixed:

- Fixed bug show earnings screen although back to home (#2742)

**Commit**: e460c992de

---

## [1.1.51] — 2024-04-02 — Release 1.1.51 (Koni) — v1.1.51

Features & Update:

- Update withdraw time for parachain staking (#2829)

**Commit**: de5b1d9667

---

## [1.1.50] — 2024-03-28 — Release 1.1.50 (Koni) — v1.1.50

Features & Update:

- Integrate asset online (#2790)
- Add Swap button (#2784)
- Update chain-list (#2805)
  - Add support for RMRK token for Astar EVM
  - Add support for Creditcoin cc3 testnet

Bugs fixed:

- Fixed bug Do not show balance in case standing on History list to search token (#2791)

**Commit**: 6c27de71b0

---

## [1.1.49] — 2024-03-26 — Release 1.1.49 (Koni) — v1.1.49

Features & Update:

- Improve UI for Mission Pools (#2796)

Bugs fixed:

- Check transfer logic that can potentially affect ED (#2798)
- Handle case slow getting max transferable cause wrong amount when submit max transfer (#2793)
- Fixed bug when performing XCM transfer on Kusama (#2814)
- Fixed bug Error parsing token balance for frozen asset on Asset Hub (#2799)

**Commit**: a05736d9c4

---

## [1.1.48] — 2024-03-25 — Release 1.1.48 (Koni) — v1.1.48

Bugs fixed:

- Fix send fund error (#2795)

**Commit**: 853940622c

---

## [1.1.47] — 2024-03-23 — Release 1.1.47 (Koni) — v1.1.47

Features & Update:

- Add support XCM for PINK token (#2786)
  - Default enable DOT, DED, PINK on Asset Hub and xcPINK on Moonbeam

**Commit**: 61a9d2d388

---

## [1.1.46] — 2024-03-22 — Release 1.1.46 (Koni) — v1.1.46

Features & Update:

- Merge dApp request from both of interface into one interface (#2722)
- Support connect Ledger device for Asset Hub (#2785)
- Support Mission Pool for Extension (#2781)

**Commit**: c22f0ed9f8

---

## [1.1.45] — 2024-03-20 — Release 1.1.45 (Koni) — v1.1.45

Features & Update:

- Update explorer URL for Avail testnet (#2767)
- Update chain-list 0.2.45 (#2771)
  - Update symbol, Network name for OriginTrail and Tomochain
  - Update symbol on history details screen when changing
  - Update provider, price-id and block explorer for Polimec
  - Support in-app staking for Polimec
  - Update Astar and Astar EVM chain logo
  - Update ASTR token logo on all chain
  - Add support for DED token

Bugs fixed:

- Fixed bug connect a Ledger device (#2608)

**Commit**: 2a6b334dd1

---

## [1.1.44] — 2024-03-16 — Release 1.1.44 (Koni) — v1.1.44

Features & Update:

- Update Subscan service (#2731)
- Add subject email in case select contact support feature (#2729)
- Update email support (#2759)
- Update Chain-list (#2694)
  - Update chain data and Chain assets
  - Support CreditCoin EVM testnet
  - Support Astar zkEVM
  - Update block explorer for Continuum
  - Support transferring Unique NFTs
  - Discontinued support transfer local token for Crab Parachain and Pangolin

Bugs fixed:

- Fixed bug error page on NFT details screen (#2748)

**Commit**: 1f75c04107

---

## [1.1.43] — 2024-03-11 — Release 1.1.43 (Koni) — v1.1.43

Bugs fixed:

- Fixed bug not updating blocked XCM channels

**Commit**: 18ed580464

---

## [1.1.42] — 2024-03-08 — Release 1.1.42 (Koni) — v1.1.42

Features & Update:

- Update transaction result screen (#2659)
- Update Manta staking APY formula (#2513)
- Update chain-list (#2698)
  - Inactive Kapex
  - Add support for more tokens on HydraDX
  - Add support for DENTNet
  - Add support for Phyken network (testnet)
  - Add support for Tangle Network
  - Support transfer for NUUM

Bugs fixed:

- Disable auto enable wallet while request "eth_account"

**Commit**: 61fb078aa5

---

## [1.1.41] — 2024-03-02 — Release 1.1.41 (Koni) — v1.1.41

Features & Update:

- Restructure Settings screen (#2647)
- Support Send crash log feature (#2649)
- Optimize Earning Performance Round 2 (Caching most of data) (#2636)
- Enable price-id online (#2664)
- Improve EVM network fee (#2670)
- Optimize performance by separate chain status and chain state (#2550)
- Update chain-list
  - Support NFT and Send token on Continuum network (#2585)
  - Update priceId for Cypress on Moonbeam
  - Support Rococo asset hub (#2604)
  - Support X1 OKX Testnet
  - Support Liberland Testnet and Liberland Mainnet
  - Disable support staking for Ternoa Testnet.

Bugs fixed:

- Fixed bug showing withdrawal time on un-staking (#2581)
- Fixed bug sending AVL on Avail Goldberg testnet (#2538)
- Re-check case update data after performing actions (unstake, cancel unstake, withdraw) (#2682)

**Commit**: 7f9f48e07a

---

## [1.1.40] — 2024-02-29 — Release 1.1.40 (Koni) — v1.1.40

Features & Update:

- Update pool default for VARA (#2678)

**Commit**: d463948b03

---

## [1.1.39] — 2024-02-24 — Release 1.1.39 (Koni) — v1.1.39

Features & Update:

- Adjust showing/validating address on Send fund (#2628)
- Update IPFS domain for NFTs from Unique network (#2609)
- Update filtering out blocked validators (#2632)
- Re-check case send token on Acala-EVM with Ledger account (#2625)
- Turn off popup remind claim rewards for dApp staking (#2622)
- Update tab bar (#2631)
- Update validation logic for Chainlist (#2617)

Bugs fixed:

- Fixed bug related to earning feature (#2598)
- Fixed bug showing positions (#2612)
- Fixed bug show incorrect token in case the wallet has only 1 account type (#2616)

**Commit**: 9dfb57fd39

---

## [1.1.38] — 2024-02-17 — Release 1.1.38 (Koni) — v1.1.38

Features & Update:

- Update estimating EVM transaction fee for Energy Web Chain (#2606)
- Update chain-list (#2570)
  - Add support more tokens: PINK (Statemint), xcPINK (Moonbeam), INTR (HydraDX)
  - Update explorer for Subspace Gemini 3g & 3h
  - Update price_id for Energy Web X
  - Update hasValue info for some tokens

Bugs fixed:

- Fixed some UI bug (#2509)

**Commit**: 6e7e244bf5

---

## [1.1.37] — 2024-02-07 — Release 1.1.37 (Koni) — v1.1.37

Features & Update:

- Add popup Introducing Earning feature (#2599)

Bugs fixed:

- Fixed bug Unable to connect with eip6763 dApp (#2590)

**Commit**: 8320b1e3f4

---

## [1.1.36] — 2024-02-06 — Release 1.1.36 (Koni) — v1.1.36

Features & Update:

- Update staking APY formula for relaychain (#2563)
- Unique Network and Quartz NFTs support (#2580)
- Migrate to earning feature (#2361, #2558, #2561)
- Support vManta liquid staking on Bifrost (#2569)
- Update position and options actions for Astar Staking DApp (#2594)
- Update chain-list (#2586)
- Remove explorer on Genshiro network
- Update chain subspace gemini 3h
- Check fee estimation on EVM networks (#2336)

**Commit**: c2c5bfbf29

---

## [1.1.35] — 2024-02-02 — Release 1.1.35 (Koni) — v1.1.35

Features & Update:

- Set pool default for Aleph Zero (#2578)
- Update disabled XCM channels online (#2463)

**Commit**: c83a852297

---

## [1.1.34] — 2024-02-01 — Release 1.1.34 (Koni) — v1.1.34

Features & Update:

- Update unstaking request info for KREST, AMPE (#2544)
- Add popup want to user claim reward when Astar update dApp staking v3 (#2545)
- Change "Claim rewards" to "Check rewards" for dApp staking (#2497)
- Update RPC online (#2463)

Bugs fixed:

- Fixed bug Show incorrect tokens on the balance screen in case an account with the type 'ed25519' is imported (#2518)
- Fixed bug not showing GENS token from Genshiro (#2540)

**Commit**: 084530f0fa

---

## [1.1.33] — 2024-01-23 — Release 1.1.33 (Koni) — v1.1.33

Features & Update:

- Add "time-out" status for transaction history (#2387)
- Auto import EVM network with source from online resources (#2472)
- Add support in-app staking for KREST (#2492)
- Update chain-list (#2508)
- Support XCM transfer between Manta Atlantic and other networks
  - DOT (Polkadot) <-> DOT (Manta Atlantic)
  - DOT (Manta Atlantic) <-> DOT (Moonbeam)
  - MANTA (Manta Atlantic) <-> MANTA (Moonbeam)
  - Update price for MANTA
- Update Jur default RPC

Bugs fixed:

- Improve banner campaign in app (#2038)

**Commit**: 40e3f21499

---

## [1.1.32] — 2024-01-15 — Release 1.1.32 (Koni) — v1.1.32

Features & Update:

- Update chain-list (#2489)
  - Integrate Manta Atlantic Network
  - Add new RPCs for Jur Network
  - Support transferring for BNCS
  - Add support for in-app Manta staking
- Support "Request a feature" feature (#2467)

Bugs fixed:

- Fixed bug Do not show banner on Crowdloans tab (#2487)

**Commit**: b9e9a9a598

---

## [1.1.31] — 2024-01-11 — Release 1.1.31 (Koni) — v1.1.31

Features & Update:

- Update chain-list (#2465)
  - Add Manta Pacific chain
  - Update endpoints for some chain (Parallel, Polkadex, Acala, Moonbeam, Bifrost Polkadot, Interlay)
  - Update logo for Energy Web X and Energy Web X Rococo
  - Add Polkadex Parachain

Bugs fixed:

- Fixed bug Do not detect phishing page in case have no account in wallet (#2390)
- Fixed bug Show custom network on the token list when nominate (#2452)

**Commit**: ce492a043c

---

## [1.1.30] — 2024-01-05 — Release 1.1.30 (Koni) — v1.1.30

Features & Update:

- Update chain-list (#2447)
  - Add new provider for Parallel
  - Add support new network: InvArch
  - Add support new token: cDOT-7/14 (Parallel)
- Handle fallback for online content (#2391)

Bugs fixed:

- Hot fix bug estimating EVM transaction fee (#2412)
- Fixed bug Do not display the account in the account details tab in case the entire account balance is locked (#2429)

**Commit**: d9bba51995

---

## [1.1.29] — 2023-12-29 — Release 1.1.29 (Koni) — v1.1.29

Features & Update:

- Add T&C (#2330)
- Add reload balance feature (#2381)
- Update token details screen (#2340)
- Remove some RPC on Polkadot and Kusama (#2425)

Bugs fixed:

- Fixed some UI bug (#2203)
- Fixed bug can not connect to WalletConnect (#2413)

**Commit**: c1e4dc2df8

---

## [1.1.28] — 2023-12-25 — Release 1.1.28 (Koni) — v1.1.28

Features & Update:

- Add support Polimec (#2404)
- Allow access extension from iframe (#2406)

**Commit**: 674af5e64e

---

## [1.1.27] — 2023-12-20 — Release 1.1.27 (Koni) — v1.1.27

Features & Update:

- Sort the Current account on top in the Account selector (#2318)
- Update API staking for Astar (#2370)
- Add Azero Domains is default pool (#2385)
- Update chain-list (#2368)
  - Some update for 3DPass (addd new RPC, update logo, update explorer, update price)
    - Add support Energy Web X

Bugs fixed:

- Fixed bug dApp detection when connect wallet (#1936)
- Fixed UI bug show balance in the Token details screen (#2201)
- Fixed bug show EVM transaction history (#2362)
- Fixed bug show transfer NFT history details (#2373)
- Fixed bug phishing detection (#2372)

**Commit**: 2253b39837

---

## [1.1.26] — 2023-12-16 — Release 1.1.26 (Koni) — v1.1.26

Features & Update:

- Support some XCM transfer (#2353)
- Update chain-list (#2329)
  - Update USDC on Polygon network
  - Support Energy Web X testate
- Update rdns for EIP-6963 (#2328)
- Show Copy and QR code when hover account (#2114)
- Update precise start/end time of an era (#2313)
- Add support for AZERO fiat onramp on Banxa (#2319)
- Update top nominators getting rewards (#2324)

Bugs fixed:

- Fixed bug show incorrect balance on All account mode when switch account (#2323)
- Fixed bug do not navigate when click on hyperlink in attach account (#2316)

**Commit**: 2002b00578

---

## [1.1.25] — 2023-12-07 — Release 1.1.25 (Koni) — v1.1.25

Features & Update:

- Support EIP-6963 (Multi eth provider) (#2021)
- Update showing estimated withdrawal time on staking (#2304)
- Update APY for Vara network (#2301)
- Update chain list (#2302)
  - Integrate EWX Staging Parachain (testnet)
  - Integrate EWC EVM chain
  - Update Avail testate

Bugs fixed:

- Fixed bug display dApp/pool/validator/collator name (#2130)

**Commit**: 733d3e1777

---

## [1.1.24] — 2023-12-01 — Release 1.1.24 (Koni) — v1.1.24

Features & Update:

- Support show balance detail by account on All accounts mode (#1997)
- Support staking for Goldberg (#2181)
- Add block explorer for Creditcoin (#2287)
- Update new way to fetch transaction history (#2223)
- Update the default logo (#1791)
- Update RPC for some chains (#2293)
- The default pool setting for Vara is SubWallet Official (#2291)
- Improve validator/pool selection UX (#2246)

Bugs fixed:

- Fixed bug error submitting transaction on Astar EVM (#2255)
- Fixed bug show staking earning status on Creditcoin (#2277)
- Fixed bug showing staking rewards on Moonbeam (#2213)

**Commit**: bdd98e044f

---

## [1.1.23] — 2023-11-24 — Release 1.1.23 (Koni) — v1.1.23

Features & Update:

- Support staking AZERO with Ledger (#2219)
- Update chain-list (#2198)
  - Add logo for custom network GOS
  - Add price id for KREST
- Update XCM for Astar network (#2196)

Bugs fixed:

- Fixed bug decode dApp address (#2139)
- Fixed bug automatically activate tokens based on account balance (#1500)
- Fixed bug missing crowdloan (#2199)
- Fixed bug browser waste time when load extension (#2207) and add the loading effect when open app (#2228)

**Commit**: f6bbdda50b

---

## [1.1.22] — 2023-11-15 — Release 1.1.22 (Koni) — v1.1.22

Features & Update:

- Update chain-list (#2178)
  - Add support for Enjin Relaychain and Enjin Matrixchain
  - Add support for Vara testnet
  - Add support for Goldberg testnet
- Update WalletConnect namespace (#2119)

Bugs fixed:

- Fixed bug chainStaking Metadata on Kusama (#2162)
- Fixed bug Can’t get balance of the ENJ token (#2154)

**Commit**: 616165cf98

---

## [1.1.21] — 2023-11-08 — Release 1.1.21 (Koni) — v1.1.21

Features & Update:

- Support nomination pool for Vara network (#2152)
- Update chain list (#2145)
  - Add support Subspace Gemini 3g
  - Update logo and price of the PHA token

Bugs fixed:

- Fixed bug undefined is not an object when perform transaction (#2146)
- Fixed bug show error page when opening the app with an invalid URL (#2072)
- Fixed bug still show token of the inactive network (#2158)

**Commit**: e1c6af305e

---

## [1.1.20] — 2023-11-04 — Release 1.1.20 (Koni) — v1.1.20

Features & Update:

- Update online token list in fiat-onramp feature (#2031)
- Sorting the token list to buy (#2025)
- Add “Token Name” to the token screens (#1946)
- Hide the AutoSelect validator/collator/dApp button if this method is not supported (#2020)
- Update chain list (#2105)
  - Update RPC for some chains
  - Update USDC token and add USDC.e token on Arbitrum One
  - Add support XCM transfer DOT tokens:
  - Polkadot —> Parallel
  - Polkadot —> Interlay
  - Polkadot —> Bifrost Polkadot

Bugs fixed:

- Fixed UI bug when scrolling on the Token detail screen (#2104)
- Fixed bug XCM transfer USDT (Parallel —> Statemint) (#2091)
- Fixed bug decoding dApp staking when unstake (#2129)
- Fixed bug in case save file when create new account, export account (#2100)

**Commit**: 4795493466

---

## [1.1.19] — 2023-10-26 — Release 1.1.19 (Koni) — v1.1.19

Features & Update:

- Update chainlist (#2033)
  - Review and update OnFinality RPC
  - Remove Bobabeam network
  - Add support ZetaChain EVM
  - Add support Xcavate testnet

Bugs fixed:

- Fixed bug estimating fee on calculating max transferable (#2079)
- Fixed bug Get Ledger account addresses on incompatible networks (#2075)
- Fixed bug transfer on Rococo (#2042)

**Commit**: d349e979e5

---

## [1.1.18] — 2023-10-20 — Release 1.1.18 (Koni) — v1.1.18

Features & Update:

- Support notification in browser and banner in app (#2000)
- Update crowdloan data (#2035)
- Update message on the Create on account screen (#2039)

Bugs fixed:

- Fixed bug IPFS in Firefox browser (#1995)
- Fixed bug Do not show Acala, Karura NFT (#2029)
- Fixed bug Show apply master password when access via URL (2040)

**Commit**: f266c489c9

---

## [1.1.17] — 2023-10-17 — Release 1.1.17 (Koni) — v1.1.17

Features & Update:
The default Vara network is enabled (#2019)

- Update coinable ID for product environment (#2017)
- Replace the user feedback form when uninstalling extension (#2010)
- Update chain list (#1998)
  - Update RPC for Pioneer network
  - Add support for Vara NFTs
- Updated list of tokens supported by Transak (#2026)

**Commit**: 12c2e48459

---

## [1.1.16] — 2023-10-07 — Release 1.1.16 (Koni) — v1.1.16

Features & Update:

- Add support for the sub0 2023 Biodiversity NFT Collection (#1982)

Bugs fixed:

- Fixed bug when connect to dApp via WallectConnect (#1981)

**Commit**: aaa0800955

---

## [1.1.15] — 2023-09-30 — Release 1.1.15 (Koni) — v1.1.15

Features & Update:

- Update token’s logo retrieval mechanism (#1947)
- Support Ledger for more chains (#1942)
  - Karura
  - xx network
  - Polymesh
  - Edgeware
- Update chain list (#1941)
  - Add XCM support for more tokens:
    - KSM: Kusma —> Amplitude
    - USDC: Polkadot Asset Hub <—> HydraDX
  - Integrated Neuroguns NFT Collection on the Astar network
  - Integrated new networks: Bittensor, Dancebox
  - Add staking support for Vara network
  - Update price for some tokens: PANX, VARA
  - Update RPC for Imbue network

Bugs fixed:

- Fixed bug Do not scroll the network list in case of connecting dApp via WalletConnect (#1926)
- Fixed bug Navigate incorrect in case Create one when connect dApp (#1930)

**Commit**: 73e4fb5707

---

## [1.1.14] — 2023-09-26 — Release 1.1.14 (Koni) — v1.1.14

Features & Update:

- Improve network and asset subscription (#1939)
- Update transfer function for Pendulum (#1950)

**Commit**: 329b77a4bd

---

## [1.1.13] — 2023-09-21 — Release 1.1.13 (Koni) — v1.1.13

Features & Update:

- Update empty list screens (#1857)
- Allow paste Amount to send (#1872)
- Add injected placeholder to avoid extension cannot load in the first time (#1906)

Bugs fixed:

- Fixed bug Do not show status of the crowd loans item (Acala) (#1860)
- Fixed bug Do not auto-lock after imported multiple account (#1910)
- Fixed bug Do not show selected account (#1919)

**Commit**: 32f50317a0

---

## [1.1.12] — 2023-09-15 — Release 1.1.12 (Koni) — v1.1.12

Features & Update:

- Handle the case of signing transactions from dApp using a Ledger account (#1874)
- Update web-runner for i18n for background (#1815)
- Update chain list (#1896)
  - Update block explorer for Avalanche C
  - Add support USDC for Polkadot Asset Hub
  - Add support Acala EVM network

Bugs fixed:

- Fixed bug Show incorrect message when the minimum active stake is a real number (#1901)
- Fixed bug Create incorrect account when connect dApp (#1912)

**Commit**: 8b76b54d56

---

## [1.1.11] — 2023-09-09 — Release 1.1.11 (Koni) — v1.1.11

Features & Update:

- Support Ledger for Astar (#1814)
- Integrate Coinbase Pay fiat on-ramp feature (#1834)
- Support staking in app for Creditcoin (#1891)
- Support new language: Russia (#1658)
- Update list of tokens supported on fiat-onramp feature (#1848)
- Improve auto-lock feature for mobile app (#1763)
- Update chain list (#1861)
  - Add new tokens
    - USDD on Ethereum, BSC
    - DOT tokens:
      - DOT (Bifrost Polkadot)
      - sDOT, DOT (Parallel)
      - DOT (Interlay)
      - DOT (HydraDX)
    - ASTR on Moonbeam
  - Add new networks
    - Base
    - Avalanche C

Bugs fixed:

- Fixed bug The network address displayed is incorrect (#1866)
- Fixed bug bug related to web runner v1.1.10 when used for mobile applications (#1882)

**Commit**: c194a56a81

---

## [1.1.10] — 2023-08-26 — Release 1.1.10 (Koni) — v1.1.10

Features & Update:

- Save entered transaction information when closing and reopening the extension (#1555)
- Support multi-language for messages returned from the background (round 1) (#1640)
- Support new language: Japanese (#1644)
- Improve lock UX (#1684)
- Improve import security (#1798)
- Update chain list: Add support Gemini 3f, Update RPC for Creditcoin (#1839)

**Commit**: 004063b45b

---

## [1.1.9] — 2023-08-22 — Release 1.1.9 (Koni) — v1.1.9

Features & Update:

- Improve case delete connection when reset wallet (#1760)
- Update Banxa service (#1806)
- Update chain-list (#1821)
  - Integrate Jur Node network
  - Integrate Azero Domain NFT

Bugs fixed:

- Fix a few minor bugs with NFT (#1817)
- Update webpack config environment for page.js and content.js to improve security (#1823)

**Commit**: 1ec099a40b

---

## [1.1.8] — 2023-08-12 — Release 1.1.8 (Koni) — v1.1.8

Features & Update:

- Integrate Azero domain (#1750)
- Show collection ID and NFT Id in the NFT detail screen (#1784)
- Update chain list (#1777)
  - Remove Snow and Arctic network
  - Integrate Deeper network

Bugs fixed:

- Fixed bug showing staking APY (#1726)
- Fixed bug showing token price for staking item (Calamari network) (#1766)
- Fixed bug showing Minimum active value on the network detail screen (#1752)
- Fixed bug Validator avatars are auto-generated continuously (#1757)
- Fixed bug do not delete connection when reset wallet (#1762)

**Commit**: 08d7704b59

---

## [1.1.7] — 2023-08-06 — Release 1.1.7 (Koni) — v1.1.7

Bugs fixed:

- Fix error issue can not get address
- Fix error can not export account
- Fix error can not buy with Banxa

**Commit**: 3998e2ccdc

---

## [1.1.6] — 2023-08-04 — Release 1.1.6 (Koni) — v1.1.6

Features & Update:

- Integrate Banxa for fiat on-ramp (#1084)
- Optimize WalletConnect - Not implement if no connection (#1626)
- Update showing min stake value (#1537)
- Improve connection status (#1554)
- Improve EVM Inject Object (#1710)
- Update chain list (#1715)
  - Integrate Krest network
  - Add PANX token for Aleph Zero network
  - Support staking for Avail
  - Support staking for Edgeware

Bugs fixed:

- Fixed bug Still show history of the removed account (#1731)
- Fixed bug Showing staking account on the Staking detail screen (#1643)
- Fixed bug Do not show validator on the Select validator screen in case turn on network when stake (#1496)
- Fixed bug Still show NFT and staking data when turn off all networks (#1728)
- Fixed bug Do not reset selected validator when change token to stake (#1721)
- Fixed bug Do not display the history of addresses other than the original address (#1748)

**Commit**: 4fcb4e32fd

---

## [1.1.5] — 2023-07-29 — Release 1.1.5 (Koni) — v1.1.5

Features & Update:

- Update logo for Avail network (#1708)
- Allow substrate Dapp subscribe allow access accounts List (#1712)

Bugs fixed:

- Fixed bug signature method handling is not supported for Wallet Connect (#1674)
- Fixed bug does not synchronize the configuration of the network and the token (#1633)
- Fixed bug still send local token in case the native token balance = 0 (#1667)

**Commit**: 93152684bd

---

## [1.1.4] — 2023-07-24 — Release 1.1.4 (Koni) — v1.1.4

Bugs fixed:

- Can not load another NFTs when collection contain any NFT with wrong information (#1672)

**Commit**: f7bf82fe8a

---

## [1.1.3] — 2023-07-21 — Release 1.1.3 (Koni) — v1.1.3

Features & Update:

- Support show/hide balance (#1582)
- Support sort token by value (#1444)
- Update UI for notification (#1639)
- Auto update metadata (#588)
- Update chainlist (0.2.7) (#1661)
  - Integrate aSEED token for Acala
  - Add support for LPtokens and qTokens on Interlay

Bugs fixed:

- Fixed bug video NFT size (#1651)
- Fixed bug Show incorrect transaction time on the history screen (#1654)
- Fixed bug Do not validate amount of the recipient address in case send token (#1657)
- Fix bug signing transaction on Avail (#1670)

**Commit**: e901052f5e

---

## [1.1.2] — 2023-07-14 — Release 1.1.2 (Koni) — v1.1.2

Features & Update:

- Integrate Land/Estate NFT on Pioneer's metaverses (#1335)
- Add Staking Support For Pendulum (#1595)
- Support language: Vietnamese, Chinese (#1630)
- Update QR code style for transaction with QR-signer account (#1418)
- Support camera for WalletConnect (#1627)
- Implement reload button on the Staking screen (#1545)
- Improve calculation of withdrawal time (#1585)
- Updated the criteria's icon on the Sorting pool/validator/collator/dApp screen (#1634)

Bugs fixed:

- Fixed bug Show incorrect earning reward status on All accounts mode (#1456)
- Fixed bug Show incorrect withdrawal amount in case have multiple withdrawal requests (#1557)
- Fixed Deprecate nominator controller accounts on some chains (#1350)
- Fixed bug Still showing NFTs that have been sent (#1615)
- Fixed sync configuration between expand view and popup view (#1243)
- Fixed bug QR scanner not found (#1253)
- Fixed UI bugs (#1548, #1507)

Update chainlist (#1620)

- Add support for Gemini 3e
- Update price ID for JOY
- Integrate Fantom network
- Add support for USDT, DOT on Pendulum
- Update XCM for Acala

**Commit**: 1e9b1e2de3

---

## [1.1.1] — 2023-07-06 — Release 1.1.1 (Koni) — v1.1.1

Features & Update:

- Integrate WalletConnect (#1497)
- Support viewing ZK tokens on Manta (#1525)
- Update XCM for Astar, Interlay, HydraDX (#1579)
- Support add PSP token from dApp (#1529)
- Improved connection experience with Ledger (#1573)

Bugs fixed:

- Fixed bugs related to address book (#1559)
- Fixed NFT Gateway problems with non-extension environment (#1602)
- Fixed bugs on the Staking screens (#1475)
- Fixed bug show transaction fee on the History detail screen (#1580)

Update `@subwallet/chain-list@0.2.4` (#1590):

- Supported LP Tokens on Kintsugi (LP kBTC-USDT, LP KSM-kBTC, LP KSM-KINT)

**Commit**: c35b93b8d7

---

## [1.0.12] — 2023-06-29 — Release 1.0.12 (Koni) — v1.0.12

Features & Update:

- Add support Ledger with Aleph Zero network (#1565)

Bugs fixed:

- Fixed UI bugs on the Expand view (#1569)

Update `@subwallet/chain-list@0.2.3` (#1576):

- Add support for vFIL (Bifrost Polkadot), vETH (Ethereum)

**Commit**: 8f46e6bfc4

---

## [1.0.11] — 2023-06-24 — Release 1.0.11 (Koni) — v1.0.11

Features & Update:

- Improve connection stability (#1469)
- Allow user download seed phrase file (#1560)
- Update UI for expand view (#1229)

Bugs fixed:

- Fix bug detecting on-chain attributes for WASM NFTs (#1511)

Update `@subwallet/chain-list@0.2.2` (#1556):

- Integrate Polkadot Bridge Hub, Kusama Bridge Hub, Polkadot Collectives Parachain
- Add logo for $CP token on Moonbeam

**Commit**: c329fc64be

---

## [1.0.10] — 2023-06-17 — Release 1.0.10 (Koni) — v1.0.10

Features & Update:

- Update Receive icon to Copy icon on Homepage screen (#1531)
- Support display 3D NFT (#1516)
- Re-check and update XCM feature for some chains: Polkadot, Statemint, Statemine, Bifrost Polkadot (#1546)

Bugs fixed:

- Fixed bug Show incorrect address book type (#1524)
- Fixed bug Error fetching nominator data for Calamari (#1538)
- Fixed bug Show incorrect Destination Chain fee on XCM history detail (#1550)

Update `@subwallet/chain-list@0.2.1` (#1541):

- Add INW (Aleph Zero) token
- Add support for Avail testnet (Kate)
- Re-name Statemint & Statemint Parachain to Polkadot Asset Hub & Kusama Asset Hub

**Commit**: ed0b82d3bd

---

## [1.0.9] — 2023-06-13 — Release 1.0.9 (Koni) — v1.0.9

Features & Update:

- Integration Ledger EVM account (#538)
- Allow DApp access to read-only account (#1225)
- Review and support send fund for more token (#1449)
- Optimize decode contract in transaction (#1474)
- Update the new send fund screen (#1509)
- Update chain-list (#1519)
- Update uninstall URL (#1530)

Bugs fixed:

- Fixed bug Do not get transaction history in case the wallet have multi-account (#1411)
- Fixed bug Show duplicate token on receive list when search custom token (#1514)
- Fixed bug Do not transfer BNC token on the Bifrost Polkadot (#1522)
- Fixed bug "Bad signature" when personal sign with EVM Ledger account (#1533)

Update `@subwallet/chain-list@0.1.11`:

- Add vsTokens and vTokens
- Add VERSE token
- Support WASM NFT Collection on the Astar network
- Support USAGII NFT collection from Paras on the Astar network
- Hide the channel xcm USDT: Equilibrium —> Statemint
- Update provider for Calamari

**Commit**: d6998a8708

---

## [1.0.8] — 2023-06-08 — Release 1.0.8 (Koni) — v1.0.8

Features & Update:

- Add validate for case: the transaction amount is too small to keep the destination account alive (#1479)
- Update notification in case transaction time out (#1385)
- Add support for USDT on more chains and update param for XCM on Astar (#1352)
- Update some screens follow by design (#1419)

Fixed bugs:

- Fixed bug Don’t show send history in case xcm on same account (#1499)
- Fixed bug error page when perform XCM on Firefox browser (#1505)
- Fixed bug Do not Apply master password in case import multi account but file json have information "IsMasterPassword" (#1490)
- Fixed bug send fund ERC20 token on Polygon (#1492)

**Commit**: 0f1d139c6d

---

## [1.0.7] — 2023-06-01 — Release 1.0.7 (Koni) — v1.0.7

Features & Update:

- Implemented immediate display of the "Add network" screen upon pressing "Add to network" from dApp (#1398)
- Optimized staking performance (#1461)
- Excluded Ledger account from the "My Wallet" list when sending tokens that are not supported by the Ledger account (#1454)
- Added support for "Unstake Max" functionality (#1311)
- Added validation for the scenario "Transfer Max local token. (#1458)
- Optimized the requirement to enable tokens in the Transaction Screen (#1482)

Updated chain list

- Reviewed and updated PriceID.

Fixed bugs:

- Resolved bugs related to sending funds on some tokens after running script tests (#1460)
- Fixed the bug causing an error page when sending tokens on a custom network (#1451)
- Fixed the bug in calculating Ternoa Staking APR (#1108)
- Resolved the bug causing failure to stake for certain dApps (#1445)
- Fixed the bug causing failure to stake more for a pool in cases where an unstake request was present (#1470)
- Updated web runner to fix ABI block explorer on mobile (#1472)

**Commit**: 8412da0394

---

## [1.0.6] — 2023-05-26 — Release 1.0.6 (Koni) — v1.0.6

Features & Update:

- Add “I trust this site” option on the phishing page screen (#1380)
- Temporarily hide XCM channels from Moonbeam (#1440)
- Update login & welcome screen (#1450)

Update chain list:

- Update logo for some chains and some tokens
- Add USDT, USDC on EVM chain
- Add Support For AI Serpenator NFT Collection

Fixed bugs:

- Fix bug show unclaim reward (#1432)
- Update APR for some chain (#1429)
- Fix bug show Moonfit’s NFT (#1404)
- Fix bug when stake (#1392)
- Update RMRK API (#1414)
- Fix bug get balance when send token (#1428)

**Commit**: 8b0d53f9ce

---

## [1.0.5] — 2023-05-21 — Release 1.0.5 (Koni) — v1.0.5

Features & Update:

- Detect phishing page with ChainPatrol (#1226)
- Add policy for a master password (#1369)
- Improve auto-lock wallet (#1731)
- Add more search criteria (#1361)
- Handler transaction last status when stop extension and transaction in submitting phase (#1362, #1370)
- Update Parity Signer logo & name (#1351)
- Spelling update (#1384)
- Update the style of the QR code (#1389)
- Remove some logs (#1373)
- Update URL explorer for Subspace networks (#1348)
- Handle case access camera setting when have no account on the wallet (#1401)

Update chain list:

- Update Tinkernet (#1)
- Add URL and update logo for Subspace network (#10)
- Integrate Vara network (#11)
- Integrate Snow EVM network (#12)
- Integrate Darwinia 2 (#19)
- Update RPC endpoint for Mangata (#27)
- Update Zeitgeist and Subsocial integration (#29)

Bug fixed:

- Fixed bug get balance when import multi-account (#1353)
- UI bug when scrolling (#1336)
- Fixed bug get balance (#1360)
- Fixed bug get transaction’s fee (#1361)
- Fixed bug show the WND balance (#1355)
- Re-check staking data on Shibuya network (#1310)
- Fixed bug the address validator auto detect to Substrate address (#1346)
- Add support view on browser for some chain (#1381)
- Fixed bug on Firefox browser (#1394, #1393)
- Fixed bug import private key (#1395)
- Fixed bug showing min pooled amount (#1396)

**Commit**: 80afa2a09f

---

## [1.0.4] — 2023-05-12 — Release 1.0.4 (Koni) — v1.0.4

Fixed bugs:

- Still allows importing tokens without Decimal, Symbol (#1314)
- Can't pool after withdraw all (#1323)
- Do not automatically switch the network according to the dApp in case of version upgrade (#1301)
- Show the alternate title name of Dapp in the Manage website access screen (#1234)
- Bug related to address book (#1279)
- Handling the case of importing multiple accounts using a JSON file when an account already exists (#1329)

Update, Features:

- Add support for $NEER on Transak (#1317)
- Enable native token automatically when enabling local token from the transfer screen (#1289)
- Reset Wallet Feature (#1224)

**Commit**: fd2036af92

---

## [1.0.3] — 2023-05-06 — Release 1.0.3 (Koni) — v1.0.3

Update:

- Improve transaction UX (#1254)
- Update wake up / sleep with history and price service (#1239)
- Update get chain, assets logo direct from @subwallet/chain-list package (#1273)
- Update fetching staking info with middleware service (#1263)

Bugs:

- Update out date libs (#1306)

**Commit**: 27049bb5bb

---

## [1.0.2] — 2023-04-29 — Release 1.0.2 (Koni) — v1.0.2

Update:

- Support Address Book

Bug fixes:

- Fix many bugs from version 1.0.1

**Commit**: 47ae912b5a

---

## [1.0.1] — 2023-03-31 — Release 1.0.1 (Koni) — v1.0.1

Upgrade:

- All extension UI
- New Transaction Handler
- ...

**Commit**: ad2567d9ae

---

## [0.8.4] — 2023-03-31 — Release 0.8.4 (Koni) — v0.8.4

Update:

- Integrate Aventus Network (#646)
- Add ArtZero API & fix bug show NFT (#1112)
- Update Azero block explorer (#1117)

Bug fixes:

- Fix bug importing PSP22 tokens (#1118)

**Commit**: b90024a0cd

---

## [0.8.3] — 2023-03-29 — Release 0.8.3 (Koni) — v0.8.3

Update:

- Update explorer for Gemini 3c, 2a (#1089)
- Equilibrium logo update (#1098)
- Add XCM for Kusama --> Statemint (#1094)
- Update logic for ink 4.0 and delete old PSP token (#1095)

**Commit**: 7195cf765a

---

## [0.8.2] — 2023-03-15 — Release 0.8.2 (Koni) — v0.8.2

Update:

- Update Token's logo of the Equilibrium (#1032)
- Add support Subspace Gemini 3c (#1077)
- Temporarily hide Kintsugi in the Origin Chain list (#1086)

Bug fixes:

- Fix bug XCM for Moonbeam, Bifrost Kusama (#1000)

**Commit**: 487aab593d

---

## [0.8.1] — 2023-02-03 — Release 0.8.1 (Koni) — v0.8.1

Update:

- Update RMRK NFT endpoints (#963)
- Add support send EQ token (#984)

Bug fixes:

- Fix duplicate crowdloan problems (#991)
- Fix the staking validator's expected return for relaychain (#997)
- Fix bug can not connect to AstarEVM (#1001)

**Commit**: b3c903307a

---

## [0.7.9] — 2023-01-30 — Release 0.7.9 (Koni) — v0.7.9

Update:

- Add the coingecko key for Nodle (#983)
- Support Shiden base PSP-34 contract (#985)

Bug fixes:

- Fix bug getting multiple balances for Equilibrium (#981)

**Commit**: 66dd7ca51e

---

## [0.7.8] — 2023-01-19 — Release 0.7.8 (Koni) — v0.7.8

Update:

- Update Equilibrium balance structure (#975)
- Update networks endpoint (#977)

Bug fixes:

- Fix bug getting multiple balances for Equilibrium (#981)

**Commit**: 58f7e822d7

---

## [0.7.7] — 2022-12-28 — Release 0.7.7 (Koni) — v0.7.7

Update:

- Add the warning message for invalid Amount input cases (for send fund feature) (#874)
- Update balance logic for Equilibrium (#902)
- Add support for Astar, Shiden Light Client (#911)
- Update APR for Turing Network (#951)

Bug fixes:

- Fix XCM transfer feature for the some chain (#945)
- Update "readonly account" to "read-only account" (#949)
- Do not show sub0 Lisbon 2022 NFT (#950)
- Fix the error when adding a token from dApp (#959)

**Commit**: 3996e82cda

---

## [0.7.6] — 2022-12-17 — Release 0.7.6 (Koni) — v0.7.6

Update:

- Update default endpoint for Basilisk, HydraDX (#936)
- Add support for $AZERO nomination pool staking (Aleph Zero) (#933)
- Showing crowdloan contribution in case the network is not live yet (#932)
- Integrate $TFA token into SubWallet(#928)
- Add the missing networks in Polkadot & Parachain group (#908)
- Add the missing networks in Kusama & Parachain group (#909)
- Add the missing networks in Live Networks group (#910)
- Update new way to get transaction history (#820)

**Commit**: 6f35f5f002

---

## [0.7.5] — 2022-12-15 — Release 0.7.5 (Koni) — v0.7.5

Update:

- Add support for the Octopus Network ecosystem (#788)
- Handle case attach and send asset for Ledger account with addess index #0 (#846)
- Update default network for sign message request (#890)
- Update RMRK NFT endpoints (#893)
- Turn off background in case extension reloaded and popup never opened (#912)
- Update price for iBTC (#921)

Bug fixes:

- Fix showing incorrect Unclaim reward information on "All Accounts" mode (#907)
- Fix wrong signature when signing raw with QR Signer account (#897)
- Add incrementDelegatorRewards call to Amplitude reward claiming (#914)
- Update message when scan QR code with QR signer account in case the account does not exist (#889)
- Update get balance function for Kusama (#916)

**Commit**: 5a913d9096

---

## [0.7.4] — 2022-12-04 — Release 0.7.4 (Koni) — v0.7.4

Update:

- Integrate Watr Protocol and Token (#854)
- Support claim staking reward for Amplitude (#867)
- Integrate xx.network - a L1 Substrate-based network (#873)
- Add Subspace Gemini 3 Testnet (#875)

Bug fixes:

- Fix bug NFT displays an error after update function parses transaction in case upgrade version (#864)
- Fix bug don't show the QR code to sign an approved transaction after remembering the password with the QR-signer account (#871)
- Fix bug don't show validator on the Amplitude network and update expected return (#884)
- Fix bug don't show the Export account screen when visit it from the get wallet address screen (#885)

**Commit**: e05ece8e2f

---

## [0.7.3] — 2022-11-25 — Release 0.7.3 (Koni) — v0.7.3

Update:

- Remove EVM crowdloan record (#865)

Bug fixes:

- Bug automatically redirects to the Ethereum network when requesting permission (#789)
- Fix other bug in case unstake (#804)
- Do not show tooltip on the Firefox browser (#830)
- Show incorrect screen when re-open the extension after staking successfully (#845)
- Do not show message when staking record does not exist yet (#849)

**Commit**: b82dec432a

---

## [0.7.2] — 2022-11-19 — Release 0.7.2 (Koni) — v0.7.2

Update:

- Add support staking for Amplitude/Kilt (#653)
- Support staking for Shiden (#801)
- Support claim reward feature for QR Account (#690)
- Support sending PSP tokens for QR-signer account (#751)
- Support ReadOnly account (#757)
- Show nomination pool stake balance (#796)
- Add unclaimed reward info/Support reward withdrawing for nomination pool (#812)
- Update message when having no account to connect to dApp (#798)
- Update BIT token logo (#816)

Bug fixes:

- Minor bugs on staking (#824)
- Error when use stake action on Turing Staging/ Turing network with QR signer account (#743)
- Error withdrawing stake with slashing spans (#809)
- Show incorrect the transfer result on the transaction history screen (#827)
- Incorrect navigation when cancel transaction with QR signer account (#825)
- Can not sign the Claim reward transaction with QR-signer account (#838)

**Commit**: a1f98048fd

---

## [0.7.1] — 2022-11-10 — Release 0.7.1 (Koni) — v0.7.1

Update:

- Show nomination pool stake balance (#796)

Bug fixes:

- Bug parsing IPFS link (#794)

**Commit**: 58dd43728a

---

## [0.6.9] — 2022-11-04 — Release 0.6.9 (Koni) — v0.6.9

Update:

- Support staking for KMA (Calamari parachain) (#755)
- Support Boba Networks (#730)
- Add top token on ETH and BSC (#760)
- Support sending BIT token for Bit.Country Alpha Net (#773)
- Update Amplitude endpoint (#775)
- Update price for KBTC (#785)

Bug fixes:

- Error while try to subscribe event data with ETH, BNB or another https provider (#783)

**Commit**: 60221e8c5b

---

## [0.6.8] — 2022-10-31 — Release 0.6.8 (Koni) — v0.6.8

Update:

- Support sending PSP tokens (#742)
- Support transfer and XCM for Statemine/Statemint (#684)
- Keystone - adding brand name (#752)

Bug fixes:

- Update the "expected return" to staking for some chain (#719)
- Infinite load when stake/unstake in the following cases (#724)
- Issue sending Bit.Country NFT and displaying BIT token (#747)
- Unable to send NFT with QR Account in case of network not selected (#759)

**Commit**: a416445ff1

---

## [0.6.7] — 2022-10-22 — Release 0.6.7 (Koni) — v0.6.7

Update:

- Support token import for PSP-22 and PSP-34 (#477)
- Add USDT on Polkadot (#679)
- Enable xcm transfer for Acala chain (#695)
- Update provider URL for some chains (#697)
- Support export account via QR (#709)
- Support Ethereum and Binance Smart Chain (#426)
- Support on-ramp for Binance & Etheneum network (#736)
- Support Snow Parachain (#734)

Bug fixes:

- Still shows deleted NFTs (#497)
- Some errors occurred when updating the caching mechanism (#583)
- Do not show crowdloan status (#705)
- An error occurs when a user deletes tokens in case the tokens to be deleted have the same address contract (#714)
- Can't unstake, withdraw on parachain when using a QR signer account (#717)

**Commit**: d4fcda246e

---

## [0.6.6] — 2022-09-30 — Release 0.6.6 (Koni) — v0.6.6

Update:

- Update Acala endpoints (#685)
- Change transfer warning when the account cannot be reaped (#681)
- Integration Ledger Acala account (#564)
- Update $ price for ZTG token (#671)
- Integrate Auto-Compound Staking Reward API for Turing Network (#520)
- Add staking for $CAPS and add support for Ternoa's testnet Alphanet (#636)

Bug fixes:

- Still shows deleted NFTs (#497)
- Some errors occurred when updating the caching mechanism (#583)
- Some bugs related to custom tokens when the chain is disconnected (#687)

**Commit**: 2ac68edeeb

---

## [0.6.5] — 2022-09-24 — Release 0.6.5 (Koni) — v0.6.5

Update:

- Integrate Pioneer Network NFT (#649)
- Support 3D viewer for NFT (#662)
- Support transfer BIT token on Pioneer Network (#665)
- Temporarily disable XCM for Acala (#667)
- Update Zeitgeist endpoints (#669)

Bug fixes:

- Handle estimated fee error on NFT sending + staking (#648)

**Commit**: 986d087b92

---

## [0.6.4] — 2022-09-22 — Release 0.6.4 (Koni) — v0.6.4

Update:

- Add new networks (new parachain winners) (#608)
- Add more attributes to NFT collection and item (#643)
- Update subscan for Subspace 2a network (#651)

Bug fixes:

- Can't see the NFT in case NFT Collection is on multi-page (#639)

**Commit**: 5c42fa4aa7

---

## [0.6.2] — 2022-09-16 — Release 0.6.2 (Koni) — v0.6.2

Update:

- Support Single-chain mode feature customize for Parachain & Solo chains (#331)

**Commit**: 9dd5c85eab

---

## [0.6.1] — 2022-09-13 — Release 0.6.1 (Koni) — v0.6.1

Update:

- Integrate Bit.Country Token and XCM (#621)
- Update Gear Staging Testnet logo (#625)
- Update ArthSwap logo (ARSW token on Astar-EVM) (#626)
- Update default provider for Subspace Gemini 1 (#628)
- Update endpoint list for GM Chain (#632)

**Commit**: a075ba1120

---

## [0.5.9] — 2022-09-07 — Release 0.5.9 (Koni) — v0.5.9

Bug fixes:

- Fix error of ipfs-gateway.cloud (#612)
- Fix Transak logo (#616)

**Commit**: c5c55c70b4

---

## [0.5.8] — 2022-09-06 — Release 0.5.8 (Koni) — v0.5.8

Update:

- Add support Subspace Gemini 2a

**Commit**: 91053804df

---

## [0.5.7] — 2022-09-06 — Release 0.5.7 (Koni) — v0.5.7

Update:

- Integrate on-ramp feature to buy crypto from fiat currencies (#245)
- Improved decimal display UX (#585)
- Integrate Gear testnet into SubWallet (#605)
- Update the logo of xcINTR, xciBTC, xckBTC, xcCSM, xcSDN, xcKMA, xcLIT, xcCRAB, xcTEER#524

Bug fixes:

- Fix bug inject provider not auto remove (#591)
- Fix bug still shows deleted NFTs (#497)
- Fix issues related to QR Signer (#525)
- Fix issue display lack of transaction history when user performs xcm transfer#586
- Fix showing incorrect transferable balance for PRING token (#576)
- Fix bug can't view transaction history of Moonbase Alpha network (#584)
- Fix bug happens when user disconnect network or remove account that selected to buy cryptos (#609)
- Fix support Xcm transfer on Kusama, Polkadot, Astar, Shiden chain for QR Account (#552)

**Commit**: cc7bfffca5

---

## [0.5.6] — 2022-08-24 — Release 0.5.6 (Koni) — v0.5.6

Update:

- Add new networks to SubWallet (#558)
  - Amplitude
  - GM Parachain
  - Integritee Polkadot
  - Integritee Kusama
  - Tanganika Network
  - Coinversation
  - Ternoa Network
- Add Suspace testnets into SubWallet (#553)
- Add support for DOT on Astar Native and on Astar EVM (#450)
- Integrate aUSD and USDT on Bifrost (#185)

Bug fixes:

- Fix bug not trigger accountChanged when changed account list and submit authList of DApp (#518)
- Fix some issues related to "minimum stake" in cases stake more and unstake (#555)
- Fix bug showing balance on very small balance (#556)
- Fix bug happens when NFT image error (#557)
- Fix bug can't XCM Transfer of the Bifrost Chain (#333)
- Fix some bugs & feedback to improve UX-UI (#340)
- Fix bug parsing Acala crowdloan data (#568)
- Fix staking data UI error (#567)

**Commit**: 652138b050

---

## [0.5.5] — 2022-08-11 — Release 0.5.5 (Koni) — v0.5.5

Update:

- Add feature to allow first-time users to import their Metamask private keys (#254)
- Add support for transaction history on Astar EVM (#454)
- Update XCM transfer support for Relaychain to Parachains (#411)

Bug fixes:

- Fix bug display wrong connection information with DApps (#498)
- Fix bug some dApp can't connect to wallet when user close extension (#530)

**Commit**: b9452e40f8

---

## [0.5.4] — 2022-08-05 — Release 0.5.4 (Koni) — v0.5.4

Update:

- Support interaction with other devices (Ledger and Parity Signer, Stylo...) for signature (#150)
- Support cross chain transfer: aUSD (#472)
- Update response information of EVM Provider (#489)
- Add the checkbox "Auto connect to all EVM DApps after importing" in the Import Private Key screen (#358)
- Add Moonpets NFT (#517)

Bug fixes:

- Fix balance showing incorrect in Send Fund screen in case create/forget acc successfully (#271)

**Commit**: ccb27bd41a

---

## [0.5.3] — 2022-07-29 — Release 0.5.3 (Koni) — v0.5.3

Update:

- Add Clover EVM Network (#223)
- Improve data fetching for better performance and UX (#255)
- Optimize NFT loading with <https://nft.storage/> (#480)
- Temporarily remove "Add custom network" (#464)
- Support staking for more chains (#386)
- Display connection information with DApps (#469)
- Add taiKSM and 3USD on Karura and tDOT on Acala (#417)
- Integrate tokens for dapps on Moonbeam/Moonriver (#485)

Bug fixes:

- Fix bug happens on Send Fund/Donate screen when Delete Custom Network (#310)
- Fix bug displaying incorrect balance & load incorrect view when update configure network (#311)
- Fixed incorrect number of connected accounts displayed on "Manage Website Access" screen in case of "Connect All Accounts" (#355)
- Fixed bug do not display popup connect wallet in case upgrade version (#401)
- Fix bug adding default EVM token after deleting it (#490)
- Update logo & modal style (#499)

**Commit**: 76905348af

---

## [0.5.2] — 2022-07-22 — Release 0.5.2 (Koni) — v0.5.2

Update:

- Improve the UX for contracts transaction with EVM provider (#393)
- Add select acc screen when the user in All Account mode to show address (#425)

Bug fixes:

- Fix account balance still gets calculating from test net (#145)
- Fix do not automatically connect account in case create both Substrate & EVM Account (#297)
- Fix can't sign & can't turn off popup Signing with Ledger account (#327)
- Fix copy account anytime user click on Manage Account icon (#336)
- Fix do not show avatar account (#354, #457)
- Fix error logs from koni-content (#438)
- Fix the issues with EVM Provider by late initialized (#444)

**Commit**: 88924a5315

---

## [0.4.9] — 2022-07-02 — Release 0.4.9 (Koni) — v0.4.9

Update:

- Add new network, update endpoint: Tinkernet, Imbue, HydraDX,...(#387)

Bug fixes:

- Fix bug report by Moonbeam team (#392)
- Fix bug can not scan QR (#394)
- Fix some errors related to Network Settings (#408)

**Commit**: dcae42ccad

---

## [0.4.8] — 2022-06-25 — Release 0.4.8 (Koni) — v0.4.8

Update:

- Update new way to interaction with chainId and accounts in EVM Provider (#357)

Bug fixes:

- Fix miscalculation of unstaking time (#382)
- Fix bug not show transaction after transfer from astar app via EVM Provider

**Commit**: 628c0ef594

---

## [0.4.7] — 2022-06-24 — Release 0.4.7 (Koni) — v0.4.7

Update:

- Staking Button in SubWallet (#42)
- Support import EVM tokens (#357)
- Support Shibuya Testnet (#357)
- Improve request permission screen (#377)

Bug fixes:

- Some problems with connect with EVM DApp Interface (#359)
- Not showing crowdloan data properly (#375)

**Commit**: 776350f11d

---

## [0.4.6] — 2022-06-18 — Release 0.4.6 (Koni) — v0.4.6

Update:

- Support EVM DApp, demo can be found at <https://connect.subwallet.app/>

**Commit**: f22ee3d159

---

## [0.4.5] — 2022-06-09 — Release 0.4.5 (Koni) — v0.4.5

Update:

- Support Send / Receive cross-chain assets (update some label and variablea and xc logo) (#35)

**Commit**: 57095ab698

---

## [0.4.4] — 2022-06-08 — Release 0.4.4 (Koni) — v0.4.4

Update:

- Support Send / Receive cross-chain assets (#35)

Bug Fixed:

- Fix bug display incorrect transferable balance in the Send Fund/Donate/XCM Transfer screen (#303)
- Fix bug happens when user delete all custom tokens & predefined tokens (#314)
- Fix bug "Encountered an error, please try again" when Send NFT (#321)
- Fix bug can not send fund/XCM transfer of the Kintsugi Chain (#332)

**Commit**: 7e016f2052

---

## [0.4.3] — 2022-05-31 — Release 0.4.3 (Koni) — v0.4.3

Update:

- Custom network, Custom Endpoint (#36)
- Integrate SubSpace Token (#301)

Bug Fixed:

- Display 2 popup connect when connect to <https://portal.astar.network>... (#285)
- Bug happens when viewing Transaction History after Delete token (#296)
- Other defects related to Import EVM Tokens (#266)
- Bug Send NFT when balance is too low (#265)

**Commit**: 19b50e4cf6

---

## [0.4.2] — 2022-05-20 — Release 0.4.2 (Koni) — v0.4.2

Update:

- Add Moonbeam and Moonriver staking data (#104)
- Integrate Genshiro & Equilibrium (#174)
- Integrate new cross-chain tokens on Karura (RMRK, ARIS, QTZ, ...) (#184)
- Add more Astar EVM tokens (#186)
- Improve import Private key feature (#208)

Bug Fixed:

- Fix when select aUSD (Acala) to transfer (#282)
- Fix the balance display incorrect after transfer Sub-token successfully (#283)
- Fix can't connect account in case user created account successfully while popup connect wallet is displaying (#231)
- Fix some style bug in (#258)
- Fix display multi popup connect wallet (#227)
- Fix tooltip not showing on the popup view on firefox browser (#224)

**Commit**: e99a340365

---

## [0.4.1] — 2022-05-11 — Release 0.4.1 (Koni) — v0.4.1

Update:

- Support import ERC20 and ERC721 for EVM Networks (#160)
- Implement new Send Fund UI with support send tokens, send EVM assets (#32, #143, #118)
- Add option allow accept all website on create account screen (#198)
- Update Centrifuge Parachain info (#203)
- Update logo of $CHRWNA, $CHAO (#193,#195)

Bug Fixed:

- Fix extension error when entering Substrate's seed phrase but selecting EVM account (#192)
- Fix bug can not load NFT (#200)
- Fix bug can not send EVM NFT (#209)
- Fix bug display incorrect screen when connection is lost (#225)
- Fix bug and improve some experience (#168)
- Fix bug not update them when change them from popup view (#228)

**Commit**: c850efb8ae

---

## [0.3.6] — 2022-04-22 — Release 0.3.6 (Koni) — v0.3.6

Update:

- Split background.js and extension.js into multi file for loading faster and can be submit to Firefox store (#80)
- Update Centrifuge Parachain info (#203)
- Support ERC20 tokens of Moonfit on Moonbase (#201)

**Commit**: c349ced235

---

## [0.3.5] — 2022-04-18 — Release 0.3.5 (Koni) — v0.3.5

Bug Fixed:

- Fix Astar issues on display NFT because wrong IPFS

**Commit**: 9b36dd3baf

---

## [0.3.4] — 2022-04-16 — Release 0.3.4 (Koni) — v0.3.4

Update:

- Improve custom access screen (issue #91)
- Update stable coin tokens and others in some networks (issue #117,#170)
  - Statemine
  - Moonbeam
  - Moonriver
  - Karura
  - Bifrost

Bug Fixed:

- Fix network list is incorrect in case importing an account from seed phrase when there is no account yet (issue #120)
- Fix grammar error and type issue of button (issue #156,#166)
- Fix some network in wrong group (issue #180)

**Commit**: d04111d1db

---

## [0.3.3] — 2022-04-08 — Release 0.3.3 (Koni) — v0.3.3

Update:

- Support get Shiden balance and tokens (issue #136)
- Improve NFT display with extending mode (issue #109)

Bug Fixed:

- Some problems related to NFT function (issue #105)
- Not have website list in website access screen

**Commit**: 1a34f5362a

---

## [0.3.2] — 2022-04-07 — Release 0.3.2 (Koni) — v0.3.2

Update:

- Improve the custom access screen (issue #91)
- Display Astar(EVM) tokens balances and ERC20 tokens (issue #92)
- Update the new Settings screen (issue #85)
- Integrate Astar NFT (issue #44)
  - AstarDegens
  - Astarians
  - AstarBots
  - AstarGhost
  - Astar Kevin
  - Astar Punk X
  - Astar Invisible Friends
  - Astar MetaLion Kingdom
  - Astar Karafuru

**Commit**: 80a323d9fb

---

## [0.3.1] — 2022-04-05 — Release 0.3.1 (Koni) — v0.3.1

Complete External security audit

Update:

- Display Moonbeam / Moonriver NFT (issue #33)
- Send & Receive Moonbeam / Moonriver NFT (issue #34)
- Support EVM Account for Astar Network (issue #92)
- Support Ledger: Attach account, show balance, receive assets (issue #43)
- Integrate Bit.Country NFT: Display, Send, Receive (issue #52)
- Improve experience when clicking the disconnect icon (issue #86)
- Improved import JSON file from Polkadot {.js}: Single Account and All Account (Issue #88 & #90)

Bug Fixed:

- Fix some bugs with AlephZero balance (issue #50)
- Fix some small bugs

**Commit**: 209909844e

---

## [0.2.9] — 2022-03-22 — Release 0.2.9 (Koni) — v0.2.9

Complete external security audit
Update:

- Show Moonbase and Moonriver tokens balance
- Show Bifrost cross-chain tokens Balance: DOT, KAR, KSM, kUSD, PHA, RMRK, ZLK
- Improve some UX tasks

Bug Fixed:

- Display RMRK 2.0
- Staking balance

**Commit**: d810a400a7

---

## [0.2.8] — 2022-03-18 — Release 0.2.8 (Koni) — v0.2.8

Complete External Security Audit
**Update:**

- Send and Receive NFT: Acala, RMRK, Quartz, Statemine
- Support RMRK 2.0 NFT for Singular
- Show Karura and Acala tokens balances: LCDOT, LDOT, DOT,aUSD, kUSD
- Show Karura and Acala cross-chain assets: BNC, KINT, KSM, LKSM, PHA, TAI, kBTC, vsKSM, RMRK
- Import Private key for EVM account from Metamask
- Hide account balance
- Customize avatar for All account

**Bug Fixed:**

- Bug when search account
- Temporary remove Export all account feature

**Commit**: f30463904d

---

## [0.2.7] — 2022-03-08 — Release 0.2.7 (Koni) — v0.2.7

**Update:**

- Support $GLMR, $MOVR
- Shows balance amount in multiple formats
- Update Transactions history screen using SubQuery data
- Update export Private key for Metamask
- Improve NFT display performance
- Add Bit.Country Testnet

**Bug Fixed:**

- Fix request access UI
- Fix Scan Address Qr UI
- Fix RMRK's NFT display error by wrong metadata

---

**Commit**: 5e353479c3

---

## [0.2.6] — 2022-03-03 — Release 0.2.6 (Koni) — v0.2.6

**Update:**

- Update Crowdloan Status
- Update Crowdloan Link
- Add Donate button
- Add Moonbase Alpha Testnet
- Update Sign and Request access screen
- Some small UI update
- Improve performance for Staking tab
- Remove require enter account name when creating an account

**Bug Fixed:**

- Karura's NFT display error

---

**Commit**: 1466becd1c

---

## [0.2.5] — 2022-02-25 — Release 0.2.5 (Koni) — v0.2.5

Changes:

- Add crowdloan funds status
- Support SubSquid Graphql
- Update style Authorize, Metadata, Signing, Export All, Export, Forget screen
- ...

**Commit**: e72795334c

---

## [0.2.3] — 2022-02-21 — Release 0.2.3 (Koni) — v0.2.3

Complete internal security audit

Update:

- Add Rococo explorer with Subscan
- Add ParaID for Polkadex to view Polkadot crowdloan contributed

---

> Commit unresolved: this release predates the repository's recorded history — no release commit or `package.json` bump identifies it.

---

## [0.2.2] — 2022-02-19 — Release 0.2.2 (Koni) — v0.2.2

Complete internal security audit

Update:

- Added the feature to track the balances of multiple accounts in one wallet
- Integration Quartz Network's NFT
- Integration Layer 1 blockchain built on Substrate Aleph Zero
- Displays Staking information of some networks in the Polkadot and Kusama ecosystem

Bugs Fixed:

- Extension Crash due to memory overflow when loading NFT data
- Unstable NFT data display when switching between multiple accounts

---

> Commit unresolved: this release predates the repository's recorded history — no release commit or `package.json` bump identifies it.

---

## [0.2.1] — 2022-02-10 — Release 0.2.1 (Koni) — v0.2.1

Complete internal security audit

Update:

- Update new architecture
- Update new layout
- Integration RMRK's NFT display feature
- Integration Unique's NFT display feature
- Integration Acala's NFT display feature
- Add Polkadot and Kusama staking display feature

---

> Commit unresolved: this release predates the repository's recorded history — no release commit or `package.json` bump identifies it.

---

## [0.1.0] — 2022-01-25 — Release 0.1.0 (Koni) — v0.1.0

Complete internal security audit

Update:

- Packaged according to the standards of Firefox Extension
- Add loading screen with SubWallet logo
- Add mechanism to update Crowdloan data every second

Bugs Fixed:

- No warning when entering the wrong password when restoring from JSON file

---

> Commit unresolved: this release predates the repository's recorded history — no release commit or `package.json` bump identifies it.

---

## [0.0.3] — 2022-01-16 — Release 0.0.3 (Koni) — v0.0.3

Complete internal security audi

Update

- Crowdloan Balance Management
- Add Rococo Relaychain Testnet
- Add another network in supported networks
- Supported Brave, MS Edge, and Firefox

---

> Commit unresolved: this release predates the repository's recorded history — no release commit or `package.json` bump identifies it.

---

## [0.0.2] — 2022-01-10 — Release 0.0.2 (Koni) — v0.0.2

Complete internal security audit

Update

- Add option: Show zero balance when choosing to Allow use on any chain
- Add screen: Transactions result when Send Fund
- Add button view transaction on Subscan.io on Transactions result
- Add Westend Relaychain Test Network
- Add searchable for choose network input when creating new account
- Add tooltip for send, receive and swap in the homepage
- Update the wallet address format in the chain list
- Update new style and Logo
- Improved text color contrast
- And some small change

Bugs Fixed

- Do not automatically jump to the new account screen after restoring from the JSON file
- No drop down to the selection screen when clicking input title in the send fund screen
- Missing icon corner and border corner
- Wrong slider state displayed in the screen manage Website Access
- Logical error when searching for a network that has not combined both filter conditions.
- Can't use the feature: Transfer the full account balance, reap the sender
- And some UI bugs

---

> Commit unresolved: this release predates the repository's recorded history — no release commit or `package.json` bump identifies it.

---

## [0.0.1] — 2022-01-17 — Release 0.0.1 (Koni) — v0.0.1

with basic features

Update:

- Create an account
- Restore and import account
- Receive and send fund
- Manage an account balance
- And much more

---

**Commit**: 0d78ecaf7e

---

## [0.42.5] — 2022-01-10 — Release 0.42.5 — v0.42.5

**Important** Not published to the stores, aligns with latest released packages.

Changes:

- Ensure that only latest metadata is applied (when multiple genesis)
- Rename all `*.ignore-component-test.spec.ts` to `*.spec.ts` (cross-repo consistency)
- Only apply cross-browser environment globally in non-content scripts
- Ensure package path is availble under ESM & CJS
- Bump `@polkadot/util` to 8.3.1
- Bump `@polkadot/api` to 7.3.1

**Commit**: d9b3c5a069

---

## [0.42.4] — 2021-12-27 — Release 0.42.4 — v0.42.4

**Important** As 0.42.3, not published to the stores, fixes dependency issue in 0.42.4.

Changes:

- Ensure `@subwallet/extension-mocks` is correctly listed as devDependency

**Commit**: c3003c11a3

---

## [0.42.3] — 2021-12-27 — Release 0.42.3 — v0.42.3

**Important** Not published to the stores, aligns with latest released packages.

Contributed:

- Fix typo on <https://polkadot.js.org/docs/> (Thanks to <https://github.com/michaelhealyco>)

Changes:

- Bump `@polkadot/util` to 8.2.2
- Bump `@polkadot/api` to 7.1.1

**Commit**: 78726a852d

---

## [0.42.2] — 2021-12-10 — Release 0.42.2 — v0.42.2

Changes:

- Fix bug introduced in 0.42.1 where account storage is not portable after the base port update

**Commit**: 8f8460e25c

---

## [0.42.1] — 2021-12-10 — Release 0.42.1 — v0.42.1

Contributed:

- Allow for configuration of base ports (Thanks to <https://github.com/AndreiEres>)
- Adjust messaging for non-signRaw accounts (Thanks to <https://github.com/BigBadAlien>)
- Additional tests for Ethereum derivation (Thanks to <https://github.com/joelamouche>)

Changes:

- Adjust `chrome.*` location via polyfill on non-Chrome browsers
- Allow import of account via QR (where seed is provided)
- Expand error messaging for non-compatible Ledger chains
- Bump `@polkadot/util` to 8.1.2
- Bump `@polkadot/api` to 6.11.1

**Commit**: 1ca53bc1dc

---

## [0.41.2] — 2021-11-30 — Release 0.41.2 — v0.41.2

**Important** Not published to the stores, aligns with latest released packages.

Changes:

- Expand error messaging for non-compatible Ledger chains
- Bump `@polkadot/util` to 8.0.4
- Bump `@polkadot/api` to 6.10.2

**Commit**: e9ce780824

---

## [0.41.1] — 2021-11-08 — Release 0.41.1 — v0.41.1

Contributed:

- Add search functionality (Thanks to <https://github.com/Tbaut>)
- Add Urdu translation (Thanks to <https://github.com/itsonal>)

Changes:

- Detect Ascii bytes (& display) when signing
- Correctly detect and create Ethereum-compatible chain accounts
- Ensure site authorization toggle is saved
- Optimize metadata conversion process
- Bump `@polkadot/util` to 7.8.2
- Bump `@polkadot/api` to 6.7.1

**Commit**: 63d29819bc

---

## [0.40.4] — 2021-10-25 — Release 0.40.4 — v0.40.4

**Important** Not published to the stores, aligns with latest released packages.

Changes:

- Ensure site authorization toggle is saved
- Optimize metadata conversion process
- Bump `@polkadot/util` to 7.6.1
- Bump `@polkadot/api` to 6.5.1

**Commit**: 0b49ff4a8d

---

## [0.40.3] — 2021-09-18 — Release 0.40.3 — v0.40.3

**Important** Not published to the stores, aligns with latest released packages.

Changes:

- Expose `wrapBytes`, `unwrapBytes` directly from `@polkadot/util`
- Bump `@polkadot/util` to 7.4.1
- Bump `@polkadot/api` to 6.0.1

**Commit**: 0992b6c763

---

## [0.40.2] — 2021-09-16 — Release 0.40.2 — v0.40.2

Changes:

- Fix polish translation (valid JSON)

**Commit**: d52ae696ee

---

## [0.40.1] — 2021-09-16 — Release 0.40.1 — v0.40.1

- **Important** The signatures generated now via the extension will be a wrapped data set, i.e. `signRaw` cannot be used directly to sign transactions, rather it is only meant to be used for actual messages

Contributed:

- Support signing of raw data via Qr (Thanks to <https://github.com/Tbaut>, prior 0.38.4)
- Add Polish language support (Thanks to <https://github.com/ccris02>, prior 0.38.8)
- Add Thai language support (Thanks to <https://github.com/Chakrarin>)
- Display Ethereum formatted addressed for compatible chains (Thanks to <https://github.com/joelamouche>)
- Allow import of Metamask addresses for compatible chains (Thanks to <https://github.com/joelamouche>)
- Add configurable popup location (Thanks to <https://github.com/shawntabrizi>)

Changes:

- Raw signing interfaces will now always place a `<Bytes>...</Bytes>` wrapper around signed data (via `wrapBytes` in `extension-dapp`)
- Adjust raw signing outputs with data wrapper
- Adjust settings menu layouts
- Cater for v14 metadata formats
- Cater for `#` in phishing Urls as part of the checks
- Bump `@polkadot/api` & `@polkadot/util` to latest versions

**Commit**: e0b299324a

---

## [0.39.3] — 2021-08-16 — Release 0.39.3 — v0.39.3

**Important** Not published to the stores, aligns with latest released packages.

Changes:

- Bump `@polkadot/api` to `5.5.1`
- Bump `@polkadot/util` to `7.2.1`

**Commit**: f440ddb3ef

---

## [0.39.2] — 2021-08-02 — Release 0.39.2 — v0.39.2

**Important** Not published to the stores, aligns with latest released packages.

Changes:

- Bump `@polkadot/api` to `5.3.1`
- Bump `@polkadot/util` to `7.1.1`

**Commit**: 9664180538

---

## [0.39.1] — 2021-07-11 — Release 0.39.1 — v0.39.1

**Important** Not published to the stores, aligns with latest released packages.

Changes:

- Allow building as a completely stand-alone browser bundle (experimental)
- Bump `@polkadot/api` to `5.0.1`
- Bump `@polkadot/util` to `7.0.1`

**Commit**: c50fb0ff1d

---

## [0.38.8] — 2021-07-05 — Release 0.38.8 — v0.38.8

**Important** Not published to the stores, aligns with latest released packages.

Contributed:

- Add pl i18n (Thanks to <https://github.com/ccris02>)

Changes:

- Bump `@polkadot/api` to `4.17.1`
- Bump `@polkadot/util` to `6.11.1`

**Commit**: 70c72ced6f

---

## [0.38.7] — 2021-06-26 — Release 0.38.7 — v0.38.7

**Important** Not published to the stores, aligns with latest released packages.

Changes:

- Bump `@polkadot/api` to `4.16.1`
- Bump `@polkadot/util` to `6.10.1`

**Commit**: 6f1fdc226e

---

## [0.38.6] — 2021-06-20 — Release 0.38.6 — v0.38.6

**Important** Not published to the stores, aligns with latest released packages.

Changes:

- Bump `@polkadot/api` to `4.15.1`
- Bump `@polkadot/util` to `6.9.1`

**Commit**: 18b772f186

---

## [0.38.5] — 2021-06-14 — Release 0.38.5 — v0.38.5

**Important** Not published to the stores, aligns with latest released packages.

Changes:

- Raw signing interface will not re-wrap Ethereum-type messages
- Bump `@polkadot/api` to `4.14.1`
- Bump `@polkadot/util` to `6.8.1`

**Commit**: a26c8fa38e

---

## [0.38.4] — 2021-06-11 — Release 0.38.4 — v0.38.4

**Important** Not published to the stores, just made available to expose `{unwrap, wrap}Bytes`

Contributed:

- Support signing of raw data via Qr (Thanks to <https://github.com/Tbaut>)

Changes:

- Raw signing interfaces will now always place a `<Bytes>...</Bytes>` wrapper around signed data

**Commit**: 33331a0138

---

## [0.38.3] — 2021-05-31 — Release 0.38.3 — v0.38.3

Contributed:

- Fix Chromium not displaying accounts due to height mismatch (Thanks to <https://github.com/wirednkod>)

**Commit**: 89c6852448

---

## [0.38.2] — 2021-05-30 — Release 0.38.2 — v0.38.2

**Important** Not published to the stores, just made available to ensure users can have access to a version that uses the latest `@polkadot/{api, util}`

Changes:

- Bump `@polkadot/api` to `4.12.1`
- Bump `@polkadot/util` to `6.6.1`

**Commit**: f98c98d818

---

## [0.38.1] — 2021-05-25 — Release 0.38.1 — v0.38.1

Contributed:

- Support IPFS/IPNS uls (Thanks to <https://github.com/carumusan>)
- Batch export of all accounts (Thanks to <https://github.com/BubbleBear>)
- Turkish i18n (Thanks to <https://github.com/zinderud>)
- Support for custom signed extensions (Thanks to <https://github.com/KarishmaBothara>)
- Adjust background handler port mapping (Thanks to <https://github.com/hlminh2000>)
- Prevent 3rd party authorize abuse (Thanks to <https://github.com/remon-nashid>)
- Use file-saver for account export (Thanks to <https://github.com/Tbaut>)
- Language fixes (Thanks to <https://github.com/n3wborn>)

Changes:

- Support for Metadata v13 from Substrate
- Bump `@polkadot/api` & `@polkadot/util` to latest released versions
- Swap to use of ESM modules all in published packages

**Commit**: 80dd1d9f53

---

## [0.37.2] — 2021-02-28 — Release 0.37.2 — v0.37.2

**Important** Not published to the stores, just made available to ensure users can have access to a version that uses the latest `@polkadot/{api, util}`

Contributed:

- Adjust tests to get rid of warnings (Thanks to <https://github.com/Tbaut>)

Changes:

- Bump `@polkadot/api` & `@polkadot/util` to latest released versions

**Commit**: 69245841e9

---

## [0.37.1] — 2021-02-10 — Release 0.37.1 — v0.37.1

Contributed:

- Ensure accounts check against raw public keys (Thanks to <https://github.com/yuzhiyou1990>)
- Add support for Ledger devices (Thanks to <https://github.com/Tbaut>)
- Add network selectors on the creation of all accounts (Thanks to <https://github.com/Tbaut>)
- Add explicit derivation field on seed imports (Thanks to <https://github.com/Tbaut>)
- Adjust slider color for dark theme (Thanks to <https://github.com/Tbaut>)
- Expand and cleanup tests (Thanks to <https://github.com/Tbaut>)
- Allow custom chains to be selected as tie-to chains (Thanks to <https://github.com/Tbaut>)
- Various UI adjustments for consistency (Thanks to <https://github.com/Tbaut>)
- Update i18n fr (Thanks to <https://github.com/Tbaut>)

Changes:

- Support for latest JS APIs
- Adjust phishing detection to check newly opened tabs

**Commit**: cf6622d52a

---

## [0.36.1] — 2021-01-05 — Release 0.36.1 — v0.36.1

Contributed:

- Allow for the management of per-site approvals (Thanks to <https://github.com/Tbaut>)
- Add support for Ethereum account imports (Thanks to <https://github.com/Tbaut>)
- Split account derivation and from-seed creation flows (Thanks to <https://github.com/Tbaut>)
- Fix overlapping error labels (Thanks to <https://github.com/Tbaut>)
- Rework JSON restoration for consistency (Thanks to <https://github.com/Tbaut>)
- Leverage cache for phishing detection (Thanks to <https://github.com/Tbaut>)
- Allow ecdsa accounts to be injected (Thanks to <https://github.com/Tbaut>)
- Adjust display for overly long names (Thanks to <https://github.com/Tbaut>)
- Ensure that attached chain/prefix is always used on accounts (Thanks to <https://github.com/Tbaut>)
- Show account name (as entered) in creation screens (Thanks to <https://github.com/Tbaut>)
- show wrong password error on export screen (Thanks to <https://github.com/Tbaut>)
- Add new UI tests and fix skipped tests (Thanks to <https://github.com/Tbaut>)
- Additional fr translations (Thanks to <https://github.com/Tbaut>)

Changes:

- Swap to using Webpack 5 for reproducible builds
- Swap to using TypeScript type imports
- Hide parent/derivation-path when account is not derived

**Commit**: addbc1cf11

---

## [0.35.1] — 2020-11-30 — Release 0.35.1 — v0.35.1

Contributed:

- Add i18n French (Thanks to <https://github.com/Tbaut>)
- Add a caps-lock warning for passwords (Thanks to <https://github.com/Tbaut>)
- Unify warning/error messages between components (Thanks to <https://github.com/Tbaut>)
- Adjust notification window for cross-platform consistency (Thanks to <https://github.com/Tbaut>)
- Set account visibility directly from icon click (Thanks to <https://github.com/Tbaut>)
- Don't indicate name errors before any value is entered (Thanks to <https://github.com/Tbaut>)
- Swap icons to the Font Awesome (instead of built-in) (Thanks to <https://github.com/Tbaut>)
- Use `@polkadot/networks` for known ss58 formats/genesis (Thanks to <https://github.com/Tbaut>)
- Add phishing site detection and redirection (Thanks to <https://github.com/Tbaut>)
- Add indicator icon for external accounts (Thanks to <https://github.com/Tbaut>)
- Add error boundaries across all UI components (Thanks to <https://github.com/Tbaut>)
- Group accounts by network, sort by name & path (Thanks to <https://github.com/Tbaut>)
- Fix derive suggestions to update when switching root (Thanks to <https://github.com/Tbaut>)
- Adjust window opening logic to be generic (Thanks to <https://github.com/Tbaut>)
- Add i18n language selection dropdown (Thanks to <https://github.com/Tbaut>)
- Adjust password expiry to extend timeperiod (Thanks to <https://github.com/Tbaut>)
- Rework password caching for security & robustness (Thanks to <https://github.com/Tbaut>)
- Share password expiry length between back/front-ends (Thanks to <https://github.com/Tbaut>)
- Cleanup all global styles and usage (Thanks to <https://github.com/Tbaut>)

Changes:

- Adjust web3Enable for better on-load detection
- Support for all latest Substrate/Polkadot types

**Commit**: 7846fb75ad

---

## [0.34.1] — 2020-09-15 — Release 0.34.1 — v0.34.1

Contributed:

- Add support for extension change password messaging (Thanks to <https://github.com/remon-nashid>)
- `web3Accounts` now allows the specification of the ss58Format (Thanks to <https://github.com/Tbaut>)

Changes:

- Support for latest Metadata v12 formats

**Commit**: 8ec5771fe5

---

## [0.33.4] — 2020-09-09 — Release 0.33.4 — v0.33.4

Contributed:

- Fix back button display on create account (Thanks to <https://github.com/Tbaut>)

Changes:

- Reproducible builds with Webpack optimization flags

**Commit**: 5d17a85616

---

## [0.33.2] — 2020-09-07 — Release 0.33.2 — v0.33.2

Changes:

- Fix zip output to correctly include all source files

**Commit**: 0a6958548f

---

## [0.33.1] — 2020-09-07 — Release 0.33.1 — v0.33.1

Contributed:

- Include Subsocial ss58 (Thanks to <https://github.com/F3Joule>)
- Add Crab network (Thanks to <https://github.com/WoeOm>)
- README updates (Thanks to <https://github.com/Noc2>)
- Runtime checks for web3Enable params (Thanks to <https://github.com/Tbaut>)

Changes:

- Add option to not ask password for 15 minutes (when signing transactions)
- Derived accounts uses the parent genesisHash by default (attaches to same chain)
- Make import from seed, QR & JSON options available on first-start
- Adjust popup width, allowing full display of e.g. addresses
- Always display network selection on all accounts
- Handling signing rejections (any order) transparently
- Small overall UI and use adjustments
- Latest upstream polkadot-js dependencies
- Prepare for i18n translations with initial i18next setup
- Rendering optimizations for Extrinsic displays

**Commit**: e5d4386294

---

## [0.32.1] — 2020-07-28 — Release 0.32.1 — v0.32.1

Contributed:

- Add Kulupu to the chain lock dropdown (Thanks to <https://github.com/carumusan>)
- Minor README updates (Thanks to <https://github.com/marceljay>)

Changes:

- Allow enter on signing to screens to submit
- Update to v3 JSON file format (with kdf)
- Update Polkadot naming (dropping CC1)
- Add base known chain info to icon/ss58 display lookups
- Adjust IdentityIcon backgrounds between dark/light themes

**Commit**: b7bc0da237

---

## [0.31.1] — 2020-06-24 — Release 0.31.1 — v0.31.1

Changes:

- Indicate password error when account cannot be unlocked on signing
- Support for new Polkadot/Kusama/Substrate signing payloads

**Commit**: 104ced876a

---

## [0.30.1] — 2020-06-08 — Release 0.30.1 — v0.30.1

Contributed:

- Add the ability to import JSON keystore files (Thanks to <https://github.com/shawntabrizi>)
- Updated to derivation documentation (Thanks to <https://github.com/EthWorks>)

Changes:

- Rework account creation with top-level menu
- Allow accounts to be hidden, i.e. not injected (per account setting)
- Adjust allowed mnemonic seed strengths, 12, 15, 18, 21 & 24 all allowed
- Allow accounts to be tied to a specific network genesis (along with display)
- Allow accounts to be made hidden, i.e. not injected into dapps
- Remove duplication with Default/Substrate prefixes in dropdown (equivalent, only generic displayed)
- Display child accounts when no parent has been found (orphans)
- Display derived suri alongside parent account names
- Remove all bundled metadata, update is available for dapps to keep current
- Sorting of injected accounts based on created timestamp

**Commit**: b7176010a5

---

## [0.25.1] — 2020-05-14 — Release 0.25.1 — v0.25.1

Contributed:

- New account creation with default derivation (Thanks to <https://github.com/EthWorks>)

Changes:

- Adjust `web3Enable` promise to only resolve after the document has been loaded (is interactive)
- Update `signedExtensions` to cater for new chains
- Update metadata for latest Kusama

**Commit**: 4e3ba14eeb

---

## [0.24.1] — 2020-04-19 — Release 0.24.1 — v0.24.1

Contributed:

- Allow for per root-account derivation & indicators (Thanks to <https://github.com/EthWorks>)
- Add consistent validation to all text inputs (Thanks to <https://github.com/EthWorks>)
- Make address copy interfaces easily accessible (Thanks to <https://github.com/EthWorks>)

Changes:

- Latest dependency updates, base types for all latest Polkadot/Substrate chains
- Rework base storage access & cross-browser interfaces for consistency
- UI consistency adjustments & code maintainability cleanups

**Commit**: f349c24761

---

## [0.23.1] — 2020-03-26 — Release 0.23.1 — v0.23.1

Contributed:

- Extract shared background code for re-use (Thanks to <https://github.com/amaurymartiny>)

Changes:

- Expose available genesisHash/specVersion to the dapps using the extension
- Allow prompts for metadata from dapps before decoding
- Add latest metadata for the Kusama network

**Commit**: d92a02dff4

---

## [0.22.1] — 2020-03-03 — Release 0.22.1 — v0.22.1

Contributed:

- Fix uncaught exception when tab closes without action (Thanks to <https://github.com/amaurymartiny>)
- Add preliminary support for provider injection, no UI config (Thanks to <https://github.com/amaurymartiny>)

Changes:

- Dependencies updated to latest versions

**Commit**: 0fca577343

---

## [0.21.1] — 2020-02-07 — Release 0.21.1 — v0.21.1

Changes:

- Rebuild for re-publish
- Dependencies updated to latest versions

**Commit**: 5f294e95ed

---

## [0.20.1] — 2020-01-27 — Release 0.20.1 — v0.20.1

Contributed:

- Redesign of all UI components and views (Thanks to <https://github.com/EthWorks>)

Changes:

- Account copy now respects the address formatting
- Updated to latest polkadot-js/api

**Commit**: fb0ea0522b

---

## [0.14.1] — 2019-12-10 — Release 0.14.1 — v0.14.1

Contributed:

- Implement ability to sign raw messages (Thanks to <https://github.com/c410-f3r>)

Changes:

- Support for Kusama CC3
- Allow the use of hex seeds as part of account creation

**Commit**: cb13202da9

---

## [0.13.1] — 2019-10-25 — Release 0.13.1 — v0.13.1

Contributed:

- Account export functionality (Thanks to <https://github.com/Anze1m>)

Changes:

- Add a setting to switch off camera access
- Support for latest Polkadot/Substrate clients with v8 metadata & v4 transactions
- Remove support for non-operational Kusama CC1 network

**Commit**: 91184ab5cc

---

## [0.12.1] — 2019-10-02 — Release 0.12.1 — v0.12.1

Changes:

- Support for Kusama CC2
- Update to to latest stable dependencies

**Commit**: 5c5e7912a8

---

## [0.11.1] — 2019-09-20 — Release 0.11.1 — v0.11.1

Changes:

- Cleanup metadata handling, when outdated for a node, transparently handle parsing errors
- Added Edgeware chain & metadata information
- Display addresses correctly formatted based on the ss58 chain identifiers
- Display identity icons based on chain types for known chains
- Integrate latest @polkadot/util, @polkadot-js/ui & @polkadot/api dependencies
- Updated to Babel 7.6 (build and runtime improvements)

**Commit**: 69e4d0639c

---

## [0.10.1] — 2019-09-10 — Release 0.10.1 — v0.10.1

Changes:

- Support for external accounts as presented by mobile signers, e.g. the Parity Signer
- Allow the extension UI to be opened in a new tab
- Adjust embedded chain metadata to only contain actual calls (for decoding)
- Minor code maintainability enhancements

**Commit**: 9d766277e6

---

## [0.9.1] — 2019-08-31 — Release 0.9.1 — v0.9.1

Changes:

- Fix an initialization error in extension-dapp

**Commit**: af4d38013e

---

## [0.8.1] — 2019-08-25 — Release 0.8.1 — v0.8.1

Changes:

- Add basic support for seed derivation as part of the account import. Seeds can be followed by the derivation path, and derivation is applied on creation.
- Update the polkadot-js/api version to 0.90.1, the first non-beta version with full support for Kusama

**Commit**: 6e5609d410

---

## [0.7.1] — 2019-08-19 — Release 0.7.1 — v0.7.1

Changes:

- Updated the underlying polkadot-js/api version to support the most-recent signing payload extensions, as will be available on Kusama

**Commit**: 7722dc7a85

---

## [0.6.1] — 2019-08-03 — Release 0.6.1 — v0.6.1

Changes:

- Support Extrinsics v3 from substrate 2.x, this signs an extrinsic with the genesisHash

**Commit**: 540370c64f

---

## [0.5.1] — 2019-07-25 — Release 0.5.1 — v0.5.1

Changes:

- Always check for site permissions on messages, don't assume that messages originate from the libraries provided
- Change the injected Signer interface to support the upcoming Kusama transaction format

**Commit**: 5f22f67d55

---

## [0.4.1] — 2019-07-18 — Release 0.4.1 — v0.4.1

Changes:

- Transactions are now signed with expiry information, so each transaction is mortal by default
- Unneeded scrollbars on Firefox does not appear anymore (when window is popped out)
- Cater for the setting of multiple network prefixes, e.g. Kusama
- Project icon has been updated

**Commit**: 30fc7f7c13

---

## [0.3.1] — 2019-07-14 — Release 0.3.1 — v0.3.1

Changes:

- Signing a transaction now displays the Mortal/Immortal status
- Don't request focus for popup window (this is not available on FF)
- `yarn build:zip` now builds a source zip as well (for store purposes)

**Commit**: 008401864d

---

## [0.2.1] — 2019-07-12 — Release 0.2.1 — v0.2.1

Changes:

- First release to Chrome and FireFox stores, basic functionality only

**Commit**: 1e96fdce1d
