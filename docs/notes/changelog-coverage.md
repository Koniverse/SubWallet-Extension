# CHANGELOG coverage index

> **Generated — do not hand-edit.** Built by a one-off local helper (kept in the setup scratchpad, not the repo).
> This is the ERP data source: every issue cited in a SubWallet (Koni) CHANGELOG
> release, the release it shipped in, and who implemented it. It indexes the
> **record**, not the code — it makes no acceptance-criteria claim ([LESSONS §68](../LESSONS.md)).

An issue is **cited** when a story names its number (certain); **linked** when no story
cites it but a same-epic story shares its capability (inferred — a link to verify);
**routed** when only the epic area is clear; **unowned** when even that is not. The last
two buckets — **the residue** — are the only issues a genuinely-new story could be about.

- Issues cited in 251 Koni releases: **1124**
- **Cited** by a story (certain): **1123**
- **Linked** to an existing story (inferred by capability): **1**
- **Routed** to an epic, no story: **0**
- **Unowned** (needs triage): **0**
- → residue that could warrant a new story: **0**
- Assignee resolved (tracker or git): **1109/1124**

## Cited — issue number appears in a story

| issue | shipped as | release | date | US |
| --- | --- | --- | --- | --- |
| [#80](https://github.com/Koniverse/SubWallet-Extension/issues/80) | Split background.js and extension.js into multi file for loading faster and can be submit to Firefox store (#80) | 0.3.6 | 2022-04-22 | US-1.2 |
| [#667](https://github.com/Koniverse/SubWallet-Extension/issues/667) | Temporarily disable XCM for Acala (#667) | 0.6.5 | 2022-09-24 | US-1.3 |
| [#1710](https://github.com/Koniverse/SubWallet-Extension/issues/1710) | Improve EVM Inject Object (#1710) | 1.1.6 | 2023-08-04 | US-10.1 |
| [#2021](https://github.com/Koniverse/SubWallet-Extension/issues/2021) | Support EIP-6963 (Multi eth provider) (#2021) | 1.1.25 | 2023-12-07 | US-10.1 |
| [#1533](https://github.com/Koniverse/SubWallet-Extension/issues/1533) | Fixed bug "Bad signature" when personal sign with EVM Ledger account (#1533) | 1.0.9 | 2023-06-13 | US-10.8 |
| [#2915](https://github.com/Koniverse/SubWallet-Extension/issues/2915) | Fixed bug Error page when sign message with WalletConnect (#2915) | 1.1.55 | 2024-04-14 | US-10.8 |
| [#4090](https://github.com/Koniverse/SubWallet-Extension/issues/4090) | Improve UX for swap cross-chain round 1 (#4090) | 1.3.27 | 2025-03-29 | US-11.8 |
| [#4114](https://github.com/Koniverse/SubWallet-Extension/issues/4114) | Improve UX for swap cross-chain Round 2 (#4114): | 1.3.30 | 2025-04-14 | US-11.8 |
| [#5007](https://github.com/Koniverse/SubWallet-Extension/issues/5007) | Add earning term and condition display mechanism (#5007) | 1.3.83 | 2026-07-09 | US-12.15 |
| [#796](https://github.com/Koniverse/SubWallet-Extension/issues/796) | Show nomination pool stake balance (#796) | 0.7.2 | 2022-11-19 | US-12.2 |
| [#812](https://github.com/Koniverse/SubWallet-Extension/issues/812) | Add unclaimed reward info/Support reward withdrawing for nomination pool (#812) | 0.7.2 | 2022-11-19 | US-12.2 |
| [#1323](https://github.com/Koniverse/SubWallet-Extension/issues/1323) | Can't pool after withdraw all (#1323) | 1.0.4 | 2023-05-12 | US-12.2 |
| [#42](https://github.com/Koniverse/SubWallet-Extension/issues/42) | Staking Button in SubWallet (#42) | 0.4.7 | 2022-06-24 | US-12.3 |
| [#386](https://github.com/Koniverse/SubWallet-Extension/issues/386) | Support staking for more chains (#386) | 0.5.3 | 2022-07-29 | US-12.3 |
| [#2361](https://github.com/Koniverse/SubWallet-Extension/issues/2361) | Migrate to earning feature (#2361, #2558, #2561) | 1.1.36 | 2024-02-06 | US-12.4 |
| [#2558](https://github.com/Koniverse/SubWallet-Extension/issues/2558) | Migrate to earning feature (#2361, #2558, #2561) | 1.1.36 | 2024-02-06 | US-12.4 |
| [#2561](https://github.com/Koniverse/SubWallet-Extension/issues/2561) | Migrate to earning feature (#2361, #2558, #2561) | 1.1.36 | 2024-02-06 | US-12.4 |
| [#2569](https://github.com/Koniverse/SubWallet-Extension/issues/2569) | Support vManta liquid staking on Bifrost (#2569) | 1.1.36 | 2024-02-06 | US-12.4 |
| [#2965](https://github.com/Koniverse/SubWallet-Extension/issues/2965) | Fix bug show withdraw information for the Acala liquid staking (#2965) | 1.2.15 | 2024-07-12 | US-12.4 |
| [#3139](https://github.com/Koniverse/SubWallet-Extension/issues/3139) | Update Parallel liquid staking (#3139) | 1.2.4 | 2024-06-08 | US-12.4 |
| [#3647](https://github.com/Koniverse/SubWallet-Extension/issues/3647) | Fix bug Do not show earning position for StellaSwap (#3647) | 1.2.31 | 2024-09-28 | US-12.4 |
| [#1310](https://github.com/Koniverse/SubWallet-Extension/issues/1310) | Re-check staking data on Shibuya network (#1310) | 1.0.5 | 2023-05-21 | US-12.5 |
| [#1445](https://github.com/Koniverse/SubWallet-Extension/issues/1445) | Resolved the bug causing failure to stake for certain dApps (#1445) | 1.0.7 | 2023-06-01 | US-12.5 |
| [#2129](https://github.com/Koniverse/SubWallet-Extension/issues/2129) | Fixed bug decoding dApp staking when unstake (#2129) | 1.1.20 | 2023-11-04 | US-12.5 |
| [#3226](https://github.com/Koniverse/SubWallet-Extension/issues/3226) | Remove Interlay lending (#3226) | 1.2.12 | 2024-07-02 | US-12.7 |
| [#3234](https://github.com/Koniverse/SubWallet-Extension/issues/3234) | Fix bug Do not show Interlay's earning position (#3234) | 1.2.12 | 2024-07-02 | US-12.7 |
| [#3423](https://github.com/Koniverse/SubWallet-Extension/issues/3423) | Integrate Avail Bridge (#3423) | 1.3.4 | 2024-10-28 | US-13.6 |
| [#3826](https://github.com/Koniverse/SubWallet-Extension/issues/3826) | Support Unified bridge on Polygon (#3826) | 1.3.8 | 2024-12-03 | US-13.6 |
| [#3893](https://github.com/Koniverse/SubWallet-Extension/issues/3893) | Support bridge ETH <-> POS (#3893) | 1.3.12 | 2025-01-06 | US-13.6 |
| [#4350](https://github.com/Koniverse/SubWallet-Extension/issues/4350) | Update script scan list token support feature on/off-ramp (#4350) | 1.3.43 | 2025-06-26 | US-14.2 |
| [#4456](https://github.com/Koniverse/SubWallet-Extension/issues/4456) | Update content for Buy & Sell tokens (#4456) | 1.3.43 | 2025-06-26 | US-14.2 |
| [#43](https://github.com/Koniverse/SubWallet-Extension/issues/43) | Support Ledger: Attach account, show balance, receive assets (issue #43) | 0.3.1 | 2022-04-05 | US-16.1 |
| [#150](https://github.com/Koniverse/SubWallet-Extension/issues/150) | Support interaction with other devices (Ledger and Parity Signer, Stylo...) for signature (#150) | 0.5.4 | 2022-08-05 | US-16.1 |
| [#327](https://github.com/Koniverse/SubWallet-Extension/issues/327) | Fix can't sign & can't turn off popup Signing with Ledger account (#327) | 0.5.2 | 2022-07-22 | US-16.1 |
| [#538](https://github.com/Koniverse/SubWallet-Extension/issues/538) | Integration Ledger EVM account (#538) | 1.0.9 | 2023-06-13 | US-16.1 |
| [#2453](https://github.com/Koniverse/SubWallet-Extension/issues/2453) | Integrate Polkadot Ledger app from Zondax (#2453) | 1.2.11 | 2024-06-29 | US-16.1 |
| [#4725](https://github.com/Koniverse/SubWallet-Extension/issues/4725) | Integrate Proxy Account Support (#4725) | 1.3.72 | 2026-01-14 | US-17.1 |
| [#4942](https://github.com/Koniverse/SubWallet-Extension/issues/4942) | Improve Proxy account features (#4942) | 1.3.77 | 2026-04-09 | US-17.1 |
| [#4855](https://github.com/Koniverse/SubWallet-Extension/issues/4855) | Support Multisig Account Phase 1 (#4855) | 1.3.74 | 2026-02-11 | US-18.1 |
| [#4963](https://github.com/Koniverse/SubWallet-Extension/issues/4963) | Improve Multisig account feature  (#4963) | 1.3.77 | 2026-04-09 | US-18.1 |
| [#4428](https://github.com/Koniverse/SubWallet-Extension/issues/4428) | Optimize Lifecycle Management - P1 (#4428) | 1.3.42 | 2025-06-23 | US-20.1 |
| [#4478](https://github.com/Koniverse/SubWallet-Extension/issues/4478) | Fixed bug Fails to Load on the Hone and earning screen (#4478) | 1.3.43 | 2025-06-26 | US-20.1 |
| [#4434](https://github.com/Koniverse/SubWallet-Extension/issues/4434) | Optimize Request Handling in SendFund Form (#4434) | 1.3.42 | 2025-06-23 | US-20.2 |
| [#4448](https://github.com/Koniverse/SubWallet-Extension/issues/4448) | Optimize Subscan API request (#4448 — the published release note said `#4458` in error; #4458 is the chain-list bump below. The work is PR #4470 / branch `koni/ | 1.3.47 | 2025-07-11 | US-20.2 |
| [#4458](https://github.com/Koniverse/SubWallet-Extension/issues/4458) | Optimize Subscan API request (#4448 — the published release note said `#4458` in error; #4458 is the chain-list bump below. The work is PR #4470 / branch `koni/ | 1.3.47 | 2025-07-11 | US-20.2 |
| [#4465](https://github.com/Koniverse/SubWallet-Extension/issues/4465) | Apply sw version when request to Backend (#4465) | 1.3.52 | 2025-08-07 | US-20.2 |
| [#4470](https://github.com/Koniverse/SubWallet-Extension/issues/4470) | Optimize Subscan API request (#4448 — the published release note said `#4458` in error; #4458 is the chain-list bump below. The work is PR #4470 / branch `koni/ | 1.3.47 | 2025-07-11 | US-20.2 |
| [#4623](https://github.com/Koniverse/SubWallet-Extension/issues/4623) | Fixed bug getting too many requests from Earning feature of Bittensor (#4623) | 1.3.54 | 2025-08-21 | US-20.2 |
| [#4965](https://github.com/Koniverse/SubWallet-Extension/issues/4965) | Add user-configurable Subscan API Key in settings (#4965) | 1.3.75 | 2026-03-17 | US-20.2 |
| [#3020](https://github.com/Koniverse/SubWallet-Extension/issues/3020) | Update chain-list (#3020) | 1.1.64 | 2024-05-10 | US-20.3 |
| [#160](https://github.com/Koniverse/SubWallet-Extension/issues/160) | Support import ERC20 and ERC721 for EVM Networks (#160) | 0.4.1 | 2022-05-11 | US-21.2 |
| [#911](https://github.com/Koniverse/SubWallet-Extension/issues/911) | Add support for Astar, Shiden Light Client (#911) | 0.7.7 | 2022-12-28 | US-21.2 |
| [#4163](https://github.com/Koniverse/SubWallet-Extension/issues/4163) | Update chain-list stable v0.2.103 (#4163) | 1.3.31 | 2025-04-18 | US-22.18 |
| [#1995](https://github.com/Koniverse/SubWallet-Extension/issues/1995) | Fixed bug IPFS in Firefox browser (#1995) | 1.1.18 | 2023-10-20 | US-22.5 |
| [#1910](https://github.com/Koniverse/SubWallet-Extension/issues/1910) | Fixed bug Do not auto-lock after imported multiple account (#1910) | 1.1.13 | 2023-09-21 | US-23.109 |
| [#1919](https://github.com/Koniverse/SubWallet-Extension/issues/1919) | Fixed bug Do not show selected account (#1919) | 1.1.13 | 2023-09-21 | US-23.111 |
| [#1946](https://github.com/Koniverse/SubWallet-Extension/issues/1946) | Add “Token Name” to the token screens (#1946) | 1.1.20 | 2023-11-04 | US-23.114 |
| [#2039](https://github.com/Koniverse/SubWallet-Extension/issues/2039) | Update message on the Create on account screen (#2039) | 1.1.18 | 2023-10-20 | US-23.116 |
| [#2100](https://github.com/Koniverse/SubWallet-Extension/issues/2100) | Fixed bug in case save file when create new account, export account (#2100) | 1.1.20 | 2023-11-04 | US-23.117 |
| [#2114](https://github.com/Koniverse/SubWallet-Extension/issues/2114) | Show Copy and QR code when hover account (#2114) | 1.1.26 | 2023-12-16 | US-23.118 |
| [#88](https://github.com/Koniverse/SubWallet-Extension/issues/88) | Improved import JSON file from Polkadot {.js}: Single Account and All Account (Issue #88 & #90) | 0.3.1 | 2022-04-05 | US-23.12 |
| [#90](https://github.com/Koniverse/SubWallet-Extension/issues/90) | Improved import JSON file from Polkadot {.js}: Single Account and All Account (Issue #88 & #90) | 0.3.1 | 2022-04-05 | US-23.12 |
| [#2223](https://github.com/Koniverse/SubWallet-Extension/issues/2223) | Update new way to fetch transaction history (#2223) | 1.1.24 | 2023-12-01 | US-23.121 |
| [#2318](https://github.com/Koniverse/SubWallet-Extension/issues/2318) | Sort the Current account on top in the Account selector (#2318) | 1.1.27 | 2023-12-20 | US-23.124 |
| [#2323](https://github.com/Koniverse/SubWallet-Extension/issues/2323) | Fixed bug show incorrect balance on All account mode when switch account (#2323) | 1.1.26 | 2023-12-16 | US-23.125 |
| [#2352](https://github.com/Koniverse/SubWallet-Extension/issues/2352) | Fixed bug Do not show token when standing on All accounts mode in case token does not get balance (#2352) | 1.2.29 | 2024-09-13 | US-23.128 |
| [#2390](https://github.com/Koniverse/SubWallet-Extension/issues/2390) | Fixed bug Do not detect phishing page in case have no account in wallet (#2390) | 1.1.31 | 2024-01-11 | US-23.130 |
| [#2429](https://github.com/Koniverse/SubWallet-Extension/issues/2429) | Fixed bug Do not display the account in the account details tab in case the entire account balance is locked (#2429) | 1.1.30 | 2024-01-05 | US-23.133 |
| [#2472](https://github.com/Koniverse/SubWallet-Extension/issues/2472) | Auto import EVM network with source from online resources (#2472) | 1.1.33 | 2024-01-23 | US-23.134 |
| [#2518](https://github.com/Koniverse/SubWallet-Extension/issues/2518) | Fixed bug Show incorrect tokens on the balance screen in case an account with the type 'ed25519' is imported (#2518) | 1.1.34 | 2024-02-01 | US-23.136 |
| [#2616](https://github.com/Koniverse/SubWallet-Extension/issues/2616) | Fixed bug show incorrect token in case the wallet has only 1 account type (#2616) | 1.1.39 | 2024-02-24 | US-23.137 |
| [#2709](https://github.com/Koniverse/SubWallet-Extension/issues/2709) | Handle case displayed account with specific network (#2709) | 1.2.1 | 2024-05-28 | US-23.140 |
| [#2819](https://github.com/Koniverse/SubWallet-Extension/issues/2819) | Support Export all accounts feature (#2819) | 1.1.55 | 2024-04-14 | US-23.143 |
| [#3050](https://github.com/Koniverse/SubWallet-Extension/issues/3050) | Add popup remind backup account (popup hiển thị ngay khi mở trình duyệt) (#3050) | 1.1.68 | 2024-05-25 | US-23.147 |
| [#3054](https://github.com/Koniverse/SubWallet-Extension/issues/3054) | Fix bug Show blank screen when attach account (#3054) | 1.2.22 | 2024-07-31 | US-23.148 |
| [#3090](https://github.com/Koniverse/SubWallet-Extension/issues/3090) | Add highlight button Export multi account when navigate to select account screen (#3090, #3108) | 1.1.68 | 2024-05-25 | US-23.150 |
| [#3108](https://github.com/Koniverse/SubWallet-Extension/issues/3108) | Support MV3 on Firefox (#3108) | 1.2.7 | 2024-06-20 | US-23.152 |
| [#3148](https://github.com/Koniverse/SubWallet-Extension/issues/3148) | Fix bug do not show root screen after remove account (#3148) | 1.2.22 | 2024-07-31 | US-23.154 |
| [#3198](https://github.com/Koniverse/SubWallet-Extension/issues/3198) | Hide the popup Remind backup seed phrase (#3198) | 1.2.6 | 2024-06-19 | US-23.155 |
| [#3283](https://github.com/Koniverse/SubWallet-Extension/issues/3283) | Fix bug Do not show account to get address when stand on All accounts mode (#3283) | 1.2.13 | 2024-07-05 | US-23.157 |
| [#120](https://github.com/Koniverse/SubWallet-Extension/issues/120) | Fix network list is incorrect in case importing an account from seed phrase when there is no account yet (issue #120) | 0.3.4 | 2022-04-16 | US-23.16 |
| [#145](https://github.com/Koniverse/SubWallet-Extension/issues/145) | Fix account balance still gets calculating from test net (#145) | 0.5.2 | 2022-07-22 | US-23.18 |
| [#3636](https://github.com/Koniverse/SubWallet-Extension/issues/3636) | Allow importing assets on Asset Hub (#3636) | 1.3.4 | 2024-10-28 | US-23.188 |
| [#3643](https://github.com/Koniverse/SubWallet-Extension/issues/3643) | Fix bug Can't import JSON file containing Unified account (#3643) | 1.2.31 | 2024-09-28 | US-23.191 |
| [#192](https://github.com/Koniverse/SubWallet-Extension/issues/192) | Fix extension error when entering Substrate's seed phrase but selecting EVM account (#192) | 0.4.1 | 2022-05-11 | US-23.20 |
| [#3721](https://github.com/Koniverse/SubWallet-Extension/issues/3721) | Fixed bug Do not show token (#3721) | 1.3.5 | 2024-10-31 | US-23.203 |
| [#3732](https://github.com/Koniverse/SubWallet-Extension/issues/3732) | Fix bug Do not show watch-only account on History (#3732) | 1.3.3 | 2024-10-16 | US-23.207 |
| [#3751](https://github.com/Koniverse/SubWallet-Extension/issues/3751) | Support export for Derived account (#3751) | 1.3.2 | 2024-10-12 | US-23.208 |
| [#3752](https://github.com/Koniverse/SubWallet-Extension/issues/3752) | Update address for TON testnet in the token detail screen on All accounts mode (#3752) | 1.3.2 | 2024-10-12 | US-23.209 |
| [#198](https://github.com/Koniverse/SubWallet-Extension/issues/198) | Add option allow accept all website on create account screen (#198) | 0.4.1 | 2022-05-11 | US-23.21 |
| [#3755](https://github.com/Koniverse/SubWallet-Extension/issues/3755) | Improve UI related to Account selector screen (#3755, #3772)) | 1.3.2 | 2024-10-12 | US-23.210 |
| [#3772](https://github.com/Koniverse/SubWallet-Extension/issues/3772) | Improve UI related to Account selector screen (#3755, #3772)) | 1.3.2 | 2024-10-12 | US-23.210 |
| [#3926](https://github.com/Koniverse/SubWallet-Extension/issues/3926) | Support Migrate account feature (#3926, #4016) | 1.3.23 | 2025-03-05 | US-23.216 |
| [#4016](https://github.com/Koniverse/SubWallet-Extension/issues/4016) | Support Migrate account feature (#3926, #4016) | 1.3.23 | 2025-03-05 | US-23.216 |
| [#208](https://github.com/Koniverse/SubWallet-Extension/issues/208) | Improve import Private key feature (#208) | 0.4.2 | 2022-05-20 | US-23.22 |
| [#4031](https://github.com/Koniverse/SubWallet-Extension/issues/4031) | Fixed bug Can't import JSON file(from Migrate account) on store version (#4031) | 1.3.53 | 2025-08-12 | US-23.224 |
| [#4094](https://github.com/Koniverse/SubWallet-Extension/issues/4094) | Improvements unified account after Bitcoin supported (#4094) | 1.3.42 | 2025-06-23 | US-23.227 |
| [#4168](https://github.com/Koniverse/SubWallet-Extension/issues/4168) | Support Bitcoin account (#4168) | 1.3.42 | 2025-06-23 | US-23.227 |
| [#223](https://github.com/Koniverse/SubWallet-Extension/issues/223) | Add Clover EVM Network (#223) | 0.5.3 | 2022-07-29 | US-23.23 |
| [#4200](https://github.com/Koniverse/SubWallet-Extension/issues/4200) | Support Bitcoin for new unified account (#4200) | 1.3.42 | 2025-06-23 | US-23.231 |
| [#4201](https://github.com/Koniverse/SubWallet-Extension/issues/4201) | Migrate unifed account to support Bitcoin (#4201) | 1.3.42 | 2025-06-23 | US-23.232 |
| [#4228](https://github.com/Koniverse/SubWallet-Extension/issues/4228) | Support watch-only account for Bitcoin (#4228) | 1.3.42 | 2025-06-23 | US-23.236 |
| [#4261](https://github.com/Koniverse/SubWallet-Extension/issues/4261) | Support bitcoin derivation with unified account (#4261) | 1.3.42 | 2025-06-23 | US-23.237 |
| [#4262](https://github.com/Koniverse/SubWallet-Extension/issues/4262) | Support import/export Bitcoin account (#4262) | 1.3.42 | 2025-06-23 | US-23.238 |
| [#254](https://github.com/Koniverse/SubWallet-Extension/issues/254) | Add feature to allow first-time users to import their Metamask private keys (#254) | 0.5.5 | 2022-08-11 | US-23.24 |
| [#4332](https://github.com/Koniverse/SubWallet-Extension/issues/4332) | Fixed bug related to price chart for derivation token (#4332, #4344) | 1.3.35 | 2025-05-09 | US-23.241 |
| [#4344](https://github.com/Koniverse/SubWallet-Extension/issues/4344) | Fixed bug related to price chart for derivation token (#4332, #4344) | 1.3.35 | 2025-05-09 | US-23.241 |
| [#4565](https://github.com/Koniverse/SubWallet-Extension/issues/4565) | Fixed bug Can not import Json Account from Polkadot{.js} extension (#4565) | 1.3.53 | 2025-08-12 | US-23.243 |
| [#4620](https://github.com/Koniverse/SubWallet-Extension/issues/4620) | Fixed automatically adding suffix to account name (#4620) | 1.3.56 | 2025-09-11 | US-23.244 |
| [#4735](https://github.com/Koniverse/SubWallet-Extension/issues/4735) | Hide copy/QR content for relay chain addresses (AssetHub migration) (#4735) | 1.3.61 | 2025-10-04 | US-23.247 |
| [#4762](https://github.com/Koniverse/SubWallet-Extension/issues/4762) | Support Import from Trust Wallet to SubWallet (#4762) | 1.3.71 | 2025-12-29 | US-23.249 |
| [#266](https://github.com/Koniverse/SubWallet-Extension/issues/266) | Other defects related to Import EVM Tokens (#266) | 0.4.3 | 2022-05-31 | US-23.25 |
| [#336](https://github.com/Koniverse/SubWallet-Extension/issues/336) | Fix copy account anytime user click on Manage Account icon (#336) | 0.5.2 | 2022-07-22 | US-23.29 |
| [#354](https://github.com/Koniverse/SubWallet-Extension/issues/354) | Fix do not show avatar account (#354, #457) | 0.5.2 | 2022-07-22 | US-23.30 |
| [#457](https://github.com/Koniverse/SubWallet-Extension/issues/457) | Fix do not show avatar account (#354, #457) | 0.5.2 | 2022-07-22 | US-23.30 |
| [#394](https://github.com/Koniverse/SubWallet-Extension/issues/394) | Fix bug can not scan QR (#394) | 0.4.9 | 2022-07-02 | US-23.32 |
| [#425](https://github.com/Koniverse/SubWallet-Extension/issues/425) | Add select acc screen when the user in All Account mode to show address (#425) | 0.5.2 | 2022-07-22 | US-23.33 |
| [#709](https://github.com/Koniverse/SubWallet-Extension/issues/709) | Support export account via QR (#709) | 0.6.7 | 2022-10-22 | US-23.45 |
| [#757](https://github.com/Koniverse/SubWallet-Extension/issues/757) | Support ReadOnly account (#757) | 0.7.2 | 2022-11-19 | US-23.47 |
| [#885](https://github.com/Koniverse/SubWallet-Extension/issues/885) | Fix bug don't show the Export account screen when visit it from the get wallet address screen (#885) | 0.7.4 | 2022-12-04 | US-23.49 |
| [#949](https://github.com/Koniverse/SubWallet-Extension/issues/949) | Update "readonly account" to "read-only account" (#949) | 0.7.7 | 2022-12-28 | US-23.52 |
| [#1118](https://github.com/Koniverse/SubWallet-Extension/issues/1118) | Fix bug importing PSP22 tokens (#1118) | 0.8.4 | 2023-03-31 | US-23.60 |
| [#1253](https://github.com/Koniverse/SubWallet-Extension/issues/1253) | Fixed bug QR scanner not found (#1253) | 1.1.2 | 2023-07-14 | US-23.70 |
| [#1314](https://github.com/Koniverse/SubWallet-Extension/issues/1314) | Still allows importing tokens without Decimal, Symbol (#1314) | 1.0.4 | 2023-05-12 | US-23.71 |
| [#1329](https://github.com/Koniverse/SubWallet-Extension/issues/1329) | Handling the case of importing multiple accounts using a JSON file when an account already exists (#1329) | 1.0.4 | 2023-05-12 | US-23.72 |
| [#1350](https://github.com/Koniverse/SubWallet-Extension/issues/1350) | Fixed Deprecate nominator controller accounts on some chains (#1350) | 1.1.2 | 2023-07-14 | US-23.73 |
| [#1389](https://github.com/Koniverse/SubWallet-Extension/issues/1389) | Update the style of the QR code (#1389) | 1.0.5 | 2023-05-21 | US-23.74 |
| [#1395](https://github.com/Koniverse/SubWallet-Extension/issues/1395) | Fixed bug import private key (#1395) | 1.0.5 | 2023-05-21 | US-23.75 |
| [#1401](https://github.com/Koniverse/SubWallet-Extension/issues/1401) | Handle case access camera setting when have no account on the wallet (#1401) | 1.0.5 | 2023-05-21 | US-23.76 |
| [#1490](https://github.com/Koniverse/SubWallet-Extension/issues/1490) | Fixed bug Do not Apply master password in case import multi account but file json have information "IsMasterPassword" (#1490) | 1.0.8 | 2023-06-08 | US-23.79 |
| [#1500](https://github.com/Koniverse/SubWallet-Extension/issues/1500) | Fixed bug automatically activate tokens based on account balance (#1500) | 1.1.23 | 2023-11-24 | US-23.80 |
| [#1560](https://github.com/Koniverse/SubWallet-Extension/issues/1560) | Allow user download seed phrase file (#1560) | 1.0.11 | 2023-06-24 | US-23.81 |
| [#1630](https://github.com/Koniverse/SubWallet-Extension/issues/1630) | Support language: Vietnamese, Chinese (#1630) | 1.1.2 | 2023-07-14 | US-23.83 |
| [#1640](https://github.com/Koniverse/SubWallet-Extension/issues/1640) | Support multi-language for messages returned from the background (round 1) (#1640) | 1.1.10 | 2023-08-26 | US-23.84 |
| [#1658](https://github.com/Koniverse/SubWallet-Extension/issues/1658) | Support new language: Russia (#1658) | 1.1.11 | 2023-09-09 | US-23.86 |
| [#1731](https://github.com/Koniverse/SubWallet-Extension/issues/1731) | Fixed bug Still show history of the removed account (#1731) | 1.1.6 | 2023-08-04 | US-23.93 |
| [#1750](https://github.com/Koniverse/SubWallet-Extension/issues/1750) | Integrate Azero domain (#1750) | 1.1.8 | 2023-08-12 | US-23.98 |
| [#909](https://github.com/Koniverse/SubWallet-Extension/issues/909) | Add the missing networks in Kusama & Parachain group (#909) | 0.7.6 | 2022-12-17 | US-24.100 |
| [#910](https://github.com/Koniverse/SubWallet-Extension/issues/910) | Add the missing networks in Live Networks group (#910) | 0.7.6 | 2022-12-17 | US-24.101 |
| [#928](https://github.com/Koniverse/SubWallet-Extension/issues/928) | Integrate $TFA token into SubWallet(#928) | 0.7.6 | 2022-12-17 | US-24.103 |
| [#936](https://github.com/Koniverse/SubWallet-Extension/issues/936) | Update default endpoint for Basilisk, HydraDX (#936) | 0.7.6 | 2022-12-17 | US-24.104 |
| [#951](https://github.com/Koniverse/SubWallet-Extension/issues/951) | Update APR for Turing Network (#951) | 0.7.7 | 2022-12-28 | US-24.107 |
| [#977](https://github.com/Koniverse/SubWallet-Extension/issues/977) | Update networks endpoint (#977) | 0.7.8 | 2023-01-19 | US-24.108 |
| [#1032](https://github.com/Koniverse/SubWallet-Extension/issues/1032) | Update Token's logo of the Equilibrium (#1032) | 0.8.2 | 2023-03-15 | US-24.112 |
| [#1086](https://github.com/Koniverse/SubWallet-Extension/issues/1086) | Temporarily hide Kintsugi in the Origin Chain list (#1086) | 0.8.2 | 2023-03-15 | US-24.114 |
| [#1098](https://github.com/Koniverse/SubWallet-Extension/issues/1098) | Equilibrium logo update (#1098) | 0.8.3 | 2023-03-29 | US-24.115 |
| [#1273](https://github.com/Koniverse/SubWallet-Extension/issues/1273) | Update get chain, assets logo direct from @subwallet/chain-list package (#1273) | 1.0.3 | 2023-05-06 | US-24.132 |
| [#1348](https://github.com/Koniverse/SubWallet-Extension/issues/1348) | Update URL explorer for Subspace networks (#1348) | 1.0.5 | 2023-05-21 | US-24.139 |
| [#117](https://github.com/Koniverse/SubWallet-Extension/issues/117) | Update stable coin tokens and others in some networks (issue #117,#170) | 0.3.4 | 2022-04-16 | US-24.14 |
| [#170](https://github.com/Koniverse/SubWallet-Extension/issues/170) | Update stable coin tokens and others in some networks (issue #117,#170) | 0.3.4 | 2022-04-16 | US-24.14 |
| [#1355](https://github.com/Koniverse/SubWallet-Extension/issues/1355) | Fixed bug show the WND balance (#1355) | 1.0.5 | 2023-05-21 | US-24.140 |
| [#1429](https://github.com/Koniverse/SubWallet-Extension/issues/1429) | Update APR for some chain (#1429) | 1.0.6 | 2023-05-26 | US-24.147 |
| [#1444](https://github.com/Koniverse/SubWallet-Extension/issues/1444) | Support sort token by value (#1444) | 1.1.3 | 2023-07-21 | US-24.149 |
| [#1511](https://github.com/Koniverse/SubWallet-Extension/issues/1511) | Fix bug detecting on-chain attributes for WASM NFTs (#1511) | 1.0.11 | 2023-06-24 | US-24.151 |
| [#1519](https://github.com/Koniverse/SubWallet-Extension/issues/1519) | Update chain-list (#1519) | 1.0.9 | 2023-06-13 | US-24.152 |
| [#1525](https://github.com/Koniverse/SubWallet-Extension/issues/1525) | Support viewing ZK tokens on Manta (#1525) | 1.1.1 | 2023-07-06 | US-24.153 |
| [#1541](https://github.com/Koniverse/SubWallet-Extension/issues/1541) | Update `@subwallet/chain-list@0.2.1` (#1541): | 1.0.10 | 2023-06-17 | US-24.156 |
| [#1620](https://github.com/Koniverse/SubWallet-Extension/issues/1620) | Update chainlist (#1620) | 1.1.2 | 2023-07-14 | US-24.158 |
| [#1633](https://github.com/Koniverse/SubWallet-Extension/issues/1633) | Fixed bug does not synchronize the configuration of the network and the token (#1633) | 1.1.5 | 2023-07-29 | US-24.159 |
| [#136](https://github.com/Koniverse/SubWallet-Extension/issues/136) | Support get Shiden balance and tokens (issue #136) | 0.3.3 | 2022-04-08 | US-24.16 |
| [#1715](https://github.com/Koniverse/SubWallet-Extension/issues/1715) | Update chain list (#1715) | 1.1.6 | 2023-08-04 | US-24.161 |
| [#1752](https://github.com/Koniverse/SubWallet-Extension/issues/1752) | Fixed bug showing Minimum active value on the network detail screen (#1752) | 1.1.8 | 2023-08-12 | US-24.164 |
| [#1777](https://github.com/Koniverse/SubWallet-Extension/issues/1777) | Update chain list (#1777) | 1.1.8 | 2023-08-12 | US-24.165 |
| [#1791](https://github.com/Koniverse/SubWallet-Extension/issues/1791) | Update the default logo (#1791) | 1.1.24 | 2023-12-01 | US-24.167 |
| [#1821](https://github.com/Koniverse/SubWallet-Extension/issues/1821) | Update chain-list (#1821) | 1.1.9 | 2023-08-22 | US-24.171 |
| [#1861](https://github.com/Koniverse/SubWallet-Extension/issues/1861) | Update chain list (#1861) | 1.1.11 | 2023-09-09 | US-24.174 |
| [#1866](https://github.com/Koniverse/SubWallet-Extension/issues/1866) | Fixed bug The network address displayed is incorrect (#1866) | 1.1.11 | 2023-09-09 | US-24.175 |
| [#1896](https://github.com/Koniverse/SubWallet-Extension/issues/1896) | Update chain list (#1896) | 1.1.12 | 2023-09-15 | US-24.176 |
| [#1939](https://github.com/Koniverse/SubWallet-Extension/issues/1939) | Improve network and asset subscription (#1939) | 1.1.14 | 2023-09-26 | US-24.178 |
| [#1947](https://github.com/Koniverse/SubWallet-Extension/issues/1947) | Update token’s logo retrieval mechanism (#1947) | 1.1.15 | 2023-09-30 | US-24.179 |
| [#1982](https://github.com/Koniverse/SubWallet-Extension/issues/1982) | Add support for the sub0 2023 Biodiversity NFT Collection (#1982) | 1.1.16 | 2023-10-07 | US-24.180 |
| [#1997](https://github.com/Koniverse/SubWallet-Extension/issues/1997) | Support show balance detail by account on All accounts mode (#1997) | 1.1.24 | 2023-12-01 | US-24.181 |
| [#2019](https://github.com/Koniverse/SubWallet-Extension/issues/2019) | The default Vara network is enabled (#2019) | 1.1.17 | 2023-10-17 | US-24.183 |
| [#2104](https://github.com/Koniverse/SubWallet-Extension/issues/2104) | Fixed UI bug when scrolling on the Token detail screen (#2104) | 1.1.20 | 2023-11-04 | US-24.184 |
| [#2154](https://github.com/Koniverse/SubWallet-Extension/issues/2154) | Fixed bug Can’t get balance of the ENJ token (#2154) | 1.1.22 | 2023-11-15 | US-24.186 |
| [#2158](https://github.com/Koniverse/SubWallet-Extension/issues/2158) | Fixed bug still show token of the inactive network (#2158) | 1.1.21 | 2023-11-08 | US-24.187 |
| [#2198](https://github.com/Koniverse/SubWallet-Extension/issues/2198) | Update chain-list (#2198) | 1.1.23 | 2023-11-24 | US-24.189 |
| [#174](https://github.com/Koniverse/SubWallet-Extension/issues/174) | Integrate Genshiro & Equilibrium (#174) | 0.4.2 | 2022-05-20 | US-24.19 |
| [#2201](https://github.com/Koniverse/SubWallet-Extension/issues/2201) | Fixed UI bug show balance in the Token details screen (#2201) | 1.1.27 | 2023-12-20 | US-24.190 |
| [#2293](https://github.com/Koniverse/SubWallet-Extension/issues/2293) | Update RPC for some chains (#2293) | 1.1.24 | 2023-12-01 | US-24.193 |
| [#2287](https://github.com/Koniverse/SubWallet-Extension/issues/2287) | Add block explorer for Creditcoin (#2287) | 1.1.24 | 2023-12-01 | US-24.195 |
| [#2302](https://github.com/Koniverse/SubWallet-Extension/issues/2302) | Update chain list (#2302) | 1.1.25 | 2023-12-07 | US-24.196 |
| [#2329](https://github.com/Koniverse/SubWallet-Extension/issues/2329) | Update chain-list (#2329) | 1.1.26 | 2023-12-16 | US-24.197 |
| [#2339](https://github.com/Koniverse/SubWallet-Extension/issues/2339) | Sort token by balance (#2339) | 1.3.29 | 2025-04-08 | US-24.198 |
| [#2340](https://github.com/Koniverse/SubWallet-Extension/issues/2340) | Update token details screen (#2340) | 1.1.29 | 2023-12-29 | US-24.199 |
| [#2368](https://github.com/Koniverse/SubWallet-Extension/issues/2368) | Update chain-list (#2368) | 1.1.27 | 2023-12-20 | US-24.200 |
| [#2404](https://github.com/Koniverse/SubWallet-Extension/issues/2404) | Add support Polimec (#2404) | 1.1.28 | 2023-12-25 | US-24.202 |
| [#2425](https://github.com/Koniverse/SubWallet-Extension/issues/2425) | Remove some RPC on Polkadot and Kusama (#2425) | 1.1.29 | 2023-12-29 | US-24.203 |
| [#2452](https://github.com/Koniverse/SubWallet-Extension/issues/2452) | Fixed bug Show custom network on the token list when nominate (#2452) | 1.1.31 | 2024-01-11 | US-24.204 |
| [#2509](https://github.com/Koniverse/SubWallet-Extension/issues/2509) | Fixed some UI bug (#2509) | 1.1.38 | 2024-02-17 | US-24.209 |
| [#180](https://github.com/Koniverse/SubWallet-Extension/issues/180) | Fix some network in wrong group (issue #180) | 0.3.4 | 2022-04-16 | US-24.21 |
| [#2540](https://github.com/Koniverse/SubWallet-Extension/issues/2540) | Fixed bug not showing GENS token from Genshiro (#2540) | 1.1.34 | 2024-02-01 | US-24.210 |
| [#2550](https://github.com/Koniverse/SubWallet-Extension/issues/2550) | Optimize performance by separate chain status and chain state (#2550) | 1.1.41 | 2024-03-02 | US-24.211 |
| [#2585](https://github.com/Koniverse/SubWallet-Extension/issues/2585) | Support NFT and Send token on Continuum network (#2585) | 1.1.41 | 2024-03-02 | US-24.213 |
| [#2609](https://github.com/Koniverse/SubWallet-Extension/issues/2609) | Update IPFS domain for NFTs from Unique network (#2609) | 1.1.39 | 2024-02-24 | US-24.216 |
| [#185](https://github.com/Koniverse/SubWallet-Extension/issues/185) | Integrate aUSD and USDT on Bifrost (#185) | 0.5.6 | 2022-08-24 | US-24.22 |
| [#2771](https://github.com/Koniverse/SubWallet-Extension/issues/2771) | Update chain-list 0.2.45 (#2771) | 1.1.45 | 2024-03-20 | US-24.221 |
| [#2791](https://github.com/Koniverse/SubWallet-Extension/issues/2791) | Fixed bug Do not show balance in case standing on History list to search token (#2791) | 1.1.50 | 2024-03-28 | US-24.222 |
| [#2799](https://github.com/Koniverse/SubWallet-Extension/issues/2799) | Fixed bug Error parsing token balance for frozen asset on Asset Hub (#2799) | 1.1.49 | 2024-03-26 | US-24.223 |
| [#2805](https://github.com/Koniverse/SubWallet-Extension/issues/2805) | Update chain-list (#2805) | 1.1.50 | 2024-03-28 | US-24.225 |
| [#2851](https://github.com/Koniverse/SubWallet-Extension/issues/2851) | Update chain-list (#2851) | 1.1.52 | 2024-04-05 | US-24.229 |
| [#186](https://github.com/Koniverse/SubWallet-Extension/issues/186) | Add more Astar EVM tokens (#186) | 0.4.2 | 2022-05-20 | US-24.23 |
| [#2885](https://github.com/Koniverse/SubWallet-Extension/issues/2885) | Fixed bug fetching balance with Enjin Relay Chain (#2885) | 1.1.53 | 2024-04-08 | US-24.230 |
| [#2890](https://github.com/Koniverse/SubWallet-Extension/issues/2890) | Update chain-list (#2890) | 1.1.55 | 2024-04-14 | US-24.231 |
| [#2934](https://github.com/Koniverse/SubWallet-Extension/issues/2934) | Support NFTs on Asset Hub (#2934) | 1.1.56 | 2024-04-19 | US-24.234 |
| [#2947](https://github.com/Koniverse/SubWallet-Extension/issues/2947) | Update chain-list (#2947) | 1.1.58 | 2024-04-24 | US-24.235 |
| [#2966](https://github.com/Koniverse/SubWallet-Extension/issues/2966) | Add support Mythos chain (#2966) | 1.1.60 | 2024-04-29 | US-24.237 |
| [#3037](https://github.com/Koniverse/SubWallet-Extension/issues/3037) | Fixed bug Network's status show incorrect (#3037) | 1.1.63 | 2024-05-09 | US-24.240 |
| [#3053](https://github.com/Koniverse/SubWallet-Extension/issues/3053) | Add the "View on explorer" button on the Token details screen (#3053) | 1.2.4 | 2024-06-08 | US-24.241 |
| [#3075](https://github.com/Koniverse/SubWallet-Extension/issues/3075) | Remove the logic that differentiates between Native tokens and Local tokens in case show sub-logo (#3075) | 1.2.2 | 2024-05-30 | US-24.242 |
| [#3084](https://github.com/Koniverse/SubWallet-Extension/issues/3084) | Fix bug integrating chain online (#3084) | 1.1.67 | 2024-05-22 | US-24.243 |
| [#3101](https://github.com/Koniverse/SubWallet-Extension/issues/3101) | Fix bug missing custom tokens on applying online patch (#3101) | 1.1.68 | 2024-05-25 | US-24.246 |
| [#193](https://github.com/Koniverse/SubWallet-Extension/issues/193) | Update logo of $CHRWNA, $CHAO (#193,#195) | 0.4.1 | 2022-05-11 | US-24.25 |
| [#195](https://github.com/Koniverse/SubWallet-Extension/issues/195) | Update logo of $CHRWNA, $CHAO (#193,#195) | 0.4.1 | 2022-05-11 | US-24.25 |
| [#3268](https://github.com/Koniverse/SubWallet-Extension/issues/3268) | Change token type from GRC-20 to VFT (#3268) | 1.2.13 | 2024-07-05 | US-24.250 |
| [#3270](https://github.com/Koniverse/SubWallet-Extension/issues/3270) | Update Vara token sdk version (#3270) | 1.2.16 | 2024-07-19 | US-24.251 |
| [#3305](https://github.com/Koniverse/SubWallet-Extension/issues/3305) | Move step shorten metadata and calculate metadataHash to client (#3305) | 1.2.16 | 2024-07-19 | US-24.255 |
| [#201](https://github.com/Koniverse/SubWallet-Extension/issues/201) | Support ERC20 tokens of Moonfit on Moonbase (#201) | 0.3.6 | 2022-04-22 | US-24.26 |
| [#3612](https://github.com/Koniverse/SubWallet-Extension/issues/3612) | Fix bug not showing balance of VFT tokens (#3612) | 1.2.30 | 2024-09-20 | US-24.263 |
| [#3710](https://github.com/Koniverse/SubWallet-Extension/issues/3710) | Support Asset Hub migration (#3710) | 1.3.46 | 2025-07-04 | US-24.265 |
| [#3713](https://github.com/Koniverse/SubWallet-Extension/issues/3713) | Fixed bug validating recipient balance when sending Substrate token (#3713) | 1.3.9 | 2024-12-09 | US-24.266 |
| [#3718](https://github.com/Koniverse/SubWallet-Extension/issues/3718) | Add infobox about Wallet version for TON token (#3718) | 1.3.2 | 2024-10-12 | US-24.268 |
| [#203](https://github.com/Koniverse/SubWallet-Extension/issues/203) | Update Centrifuge Parachain info (#203) | 0.4.1 | 2022-05-11 | US-24.27 |
| [#3747](https://github.com/Koniverse/SubWallet-Extension/issues/3747) | Update Network details screen for TON (#3747) | 1.3.3 | 2024-10-16 | US-24.271 |
| [#3756](https://github.com/Koniverse/SubWallet-Extension/issues/3756) | Improve UI related to Select token screen (#3756) | 1.3.2 | 2024-10-12 | US-24.272 |
| [#3786](https://github.com/Koniverse/SubWallet-Extension/issues/3786) | Fixed bug Can't reset data when search on select token popup (#3786) | 1.3.24 | 2025-03-18 | US-24.273 |
| [#3816](https://github.com/Koniverse/SubWallet-Extension/issues/3816) | Support Cardano (#3816, #3924, #3925, #3942) | 1.3.23 | 2025-03-05 | US-24.274 |
| [#3924](https://github.com/Koniverse/SubWallet-Extension/issues/3924) | Support Cardano (#3816, #3924, #3925, #3942) | 1.3.23 | 2025-03-05 | US-24.274 |
| [#3925](https://github.com/Koniverse/SubWallet-Extension/issues/3925) | Support Cardano (#3816, #3924, #3925, #3942) | 1.3.23 | 2025-03-05 | US-24.274 |
| [#3942](https://github.com/Koniverse/SubWallet-Extension/issues/3942) | Support Cardano (#3816, #3924, #3925, #3942) | 1.3.23 | 2025-03-05 | US-24.274 |
| [#3864](https://github.com/Koniverse/SubWallet-Extension/issues/3864) | Unified address format integration (#3864) | 1.3.23 | 2025-03-05 | US-24.276 |
| [#3920](https://github.com/Koniverse/SubWallet-Extension/issues/3920) | Show well-known tokens on top (#3920) | 1.3.17 | 2025-02-18 | US-24.281 |
| [#3958](https://github.com/Koniverse/SubWallet-Extension/issues/3958) | Re-enable search token feature (#3958) | 1.3.13 | 2025-01-21 | US-24.283 |
| [#3960](https://github.com/Koniverse/SubWallet-Extension/issues/3960) | Improve token enabling (#3960) | 1.3.31 | 2025-04-18 | US-24.284 |
| [#4013](https://github.com/Koniverse/SubWallet-Extension/issues/4013) | Update for patch chain (#4013) | 1.3.54 | 2025-08-21 | US-24.286 |
| [#4037](https://github.com/Koniverse/SubWallet-Extension/issues/4037) | Auto update metadata for substrate chain (#4037) | 1.3.24 | 2025-03-18 | US-24.288 |
| [#4081](https://github.com/Koniverse/SubWallet-Extension/issues/4081) | Show value of derivative token relative to the origin tokens (#4081) | 1.3.28 | 2025-04-02 | US-24.289 |
| [#4085](https://github.com/Koniverse/SubWallet-Extension/issues/4085) | Integrate Meld All in One Wizard (#4085) | 1.3.25 | 2025-03-24 | US-24.290 |
| [#4086](https://github.com/Koniverse/SubWallet-Extension/issues/4086) | Fixed bug integrating Wagmi into SubWallet (#4086) | 1.3.25 | 2025-03-24 | US-24.291 |
| [#4150](https://github.com/Koniverse/SubWallet-Extension/issues/4150) | Display dTAO balance like another token (#4150) | 1.3.28 | 2025-04-02 | US-24.294 |
| [#4151](https://github.com/Koniverse/SubWallet-Extension/issues/4151) | Add dTAO token (#4151) | 1.3.28 | 2025-04-02 | US-24.295 |
| [#4198](https://github.com/Koniverse/SubWallet-Extension/issues/4198) | Update for Meld on-ramp (#4198) | 1.3.29 | 2025-04-08 | US-24.298 |
| [#4241](https://github.com/Koniverse/SubWallet-Extension/issues/4241) | Fixed bug Wrong Price Impact When Swapping on PAH (#4241) | 1.3.40 | 2025-05-30 | US-24.299 |
| [#4247](https://github.com/Koniverse/SubWallet-Extension/issues/4247) | Improve token enabling (Round 2) (#4247) | 1.3.71 | 2025-12-29 | US-24.300 |
| [#4297](https://github.com/Koniverse/SubWallet-Extension/issues/4297) | Review address/chain/token handling for Bitcoin support (#4297) | 1.3.42 | 2025-06-23 | US-24.302 |
| [#4316](https://github.com/Koniverse/SubWallet-Extension/issues/4316) | Improve UI after Bitcoin integration (#4316) | 1.3.42 | 2025-06-23 | US-24.304 |
| [#4412](https://github.com/Koniverse/SubWallet-Extension/issues/4412) | Fixed some UI bugs after Bitcoin integration (#4412, #4425) | 1.3.42 | 2025-06-23 | US-24.308 |
| [#4425](https://github.com/Koniverse/SubWallet-Extension/issues/4425) | Fixed some UI bugs after Bitcoin integration (#4412, #4425) | 1.3.42 | 2025-06-23 | US-24.308 |
| [#4413](https://github.com/Koniverse/SubWallet-Extension/issues/4413) | Fixed bug show Moonbeam local token balance (#4413) | 1.3.41 | 2025-06-11 | US-24.309 |
| [#301](https://github.com/Koniverse/SubWallet-Extension/issues/301) | Integrate SubSpace Token (#301) | 0.4.3 | 2022-05-31 | US-24.31 |
| [#4468](https://github.com/Koniverse/SubWallet-Extension/issues/4468) | Filter "To token" Based on Selected "From token" - Round 1 (#4468) | 1.3.49 | 2025-07-28 | US-24.311 |
| [#4475](https://github.com/Koniverse/SubWallet-Extension/issues/4475) | Turn off default enabled tokens (#4475) | 1.3.48 | 2025-07-21 | US-24.312 |
| [#4481](https://github.com/Koniverse/SubWallet-Extension/issues/4481) | Fixed bug Don't show list address type for BTC token when get address on Token details screen (#4481) | 1.3.47 | 2025-07-11 | US-24.313 |
| [#4522](https://github.com/Koniverse/SubWallet-Extension/issues/4522) | Fixed bug Cannot withdraw on Westend Asset Hub (#4522) | 1.3.48 | 2025-07-21 | US-24.314 |
| [#4525](https://github.com/Koniverse/SubWallet-Extension/issues/4525) | Fixed bug auto-enable chain for popular tokens (#4525) | 1.3.48 | 2025-07-21 | US-24.315 |
| [#4542](https://github.com/Koniverse/SubWallet-Extension/issues/4542) | Improve detect assets & optimize enabled tokens on EVM chains (#4542) | 1.3.65 | 2025-11-06 | US-24.316 |
| [#4278](https://github.com/Koniverse/SubWallet-Extension/issues/4278) | Extension - Support display destination fee for transfer XCM (#4278) | 1.3.78 | 2026-05-14 | US-24.319 |
| [#4606](https://github.com/Koniverse/SubWallet-Extension/issues/4606) | Migrate to ParaSpell V4 & Update asset metadata (#4606) | 1.3.55 | 2025-09-05 | US-24.319 |
| [#4730](https://github.com/Koniverse/SubWallet-Extension/issues/4730) | Update chain-list stable v0.2.118 (#4730): | 1.3.62 | 2025-10-10 | US-24.324 |
| [#4767](https://github.com/Koniverse/SubWallet-Extension/issues/4767) | Update chain-list stable v0.2.119 (#4767) | 1.3.63 | 2025-10-23 | US-24.327 |
| [#4790](https://github.com/Koniverse/SubWallet-Extension/issues/4790) | Polkadot Asset Hub Migration (#4790) | 1.3.64 | 2025-10-31 | US-24.328 |
| [#4797](https://github.com/Koniverse/SubWallet-Extension/issues/4797) | Update chain-list stable v0.2.120 (#4797): | 1.3.64 | 2025-10-31 | US-24.330 |
| [#4812](https://github.com/Koniverse/SubWallet-Extension/issues/4812) | Update chain-list stable v0.2.121 (#4812): | 1.3.66 | 2025-11-07 | US-24.331 |
| [#4819](https://github.com/Koniverse/SubWallet-Extension/issues/4819) | Some updates after Polkadot Asset Hub Migration (#4819) | 1.3.65 | 2025-11-06 | US-24.332 |
| [#4827](https://github.com/Koniverse/SubWallet-Extension/issues/4827) | Update chain-list stable v0.2.122 (#4827) | 1.3.69 | 2025-12-08 | US-24.333 |
| [#4861](https://github.com/Koniverse/SubWallet-Extension/issues/4861) | Update chain-list stable v0.2.123 (#4861) | 1.3.72 | 2026-01-14 | US-24.334 |
| [#4892](https://github.com/Koniverse/SubWallet-Extension/issues/4892) | Display token name and subnet ID for subnet tokens \| Bittensor (#4892) | 1.3.76 | 2026-03-20 | US-24.336 |
| [#4972](https://github.com/Koniverse/SubWallet-Extension/issues/4972) | Unable to turn network when no add correct API key (#4972) | 1.3.76 | 2026-03-20 | US-24.339 |
| [#4979](https://github.com/Koniverse/SubWallet-Extension/issues/4979) | Update ParaSpell API integration to v1 (#4979) | 1.3.79 | 2026-05-21 | US-24.340 |
| [#311](https://github.com/Koniverse/SubWallet-Extension/issues/311) | Fix bug displaying incorrect balance & load incorrect view when update configure network (#311) | 0.5.3 | 2022-07-29 | US-24.36 |
| [#314](https://github.com/Koniverse/SubWallet-Extension/issues/314) | Fix bug happens when user delete all custom tokens & predefined tokens (#314) | 0.4.4 | 2022-06-08 | US-24.37 |
| [#331](https://github.com/Koniverse/SubWallet-Extension/issues/331) | Support Single-chain mode feature customize for Parachain & Solo chains (#331) | 0.6.2 | 2022-09-16 | US-24.38 |
| [#387](https://github.com/Koniverse/SubWallet-Extension/issues/387) | Add new network, update endpoint: Tinkernet, Imbue, HydraDX,...(#387) | 0.4.9 | 2022-07-02 | US-24.42 |
| [#408](https://github.com/Koniverse/SubWallet-Extension/issues/408) | Fix some errors related to Network Settings (#408) | 0.4.9 | 2022-07-02 | US-24.46 |
| [#485](https://github.com/Koniverse/SubWallet-Extension/issues/485) | Integrate tokens for dapps on Moonbeam/Moonriver (#485) | 0.5.3 | 2022-07-29 | US-24.50 |
| [#490](https://github.com/Koniverse/SubWallet-Extension/issues/490) | Fix bug adding default EVM token after deleting it (#490) | 0.5.3 | 2022-07-29 | US-24.51 |
| [#499](https://github.com/Koniverse/SubWallet-Extension/issues/499) | Update logo & modal style (#499) | 0.5.3 | 2022-07-29 | US-24.52 |
| [#524](https://github.com/Koniverse/SubWallet-Extension/issues/524) | Update the logo of xcINTR, xciBTC, xckBTC, xcCSM, xcSDN, xcKMA, xcLIT, xcCRAB, xcTEER#524 | 0.5.7 | 2022-09-06 | US-24.53 |
| [#558](https://github.com/Koniverse/SubWallet-Extension/issues/558) | Add new networks to SubWallet (#558) | 0.5.6 | 2022-08-24 | US-24.55 |
| [#588](https://github.com/Koniverse/SubWallet-Extension/issues/588) | Auto update metadata (#588) | 1.1.3 | 2023-07-21 | US-24.58 |
| [#605](https://github.com/Koniverse/SubWallet-Extension/issues/605) | Integrate Gear testnet into SubWallet (#605) | 0.5.7 | 2022-09-06 | US-24.61 |
| [#608](https://github.com/Koniverse/SubWallet-Extension/issues/608) | Add new networks (new parachain winners) (#608) | 0.6.4 | 2022-09-22 | US-24.62 |
| [#625](https://github.com/Koniverse/SubWallet-Extension/issues/625) | Update Gear Staging Testnet logo (#625) | 0.6.1 | 2022-09-13 | US-24.65 |
| [#626](https://github.com/Koniverse/SubWallet-Extension/issues/626) | Update ArthSwap logo (ARSW token on Astar-EVM) (#626) | 0.6.1 | 2022-09-13 | US-24.66 |
| [#632](https://github.com/Koniverse/SubWallet-Extension/issues/632) | Update endpoint list for GM Chain (#632) | 0.6.1 | 2022-09-13 | US-24.67 |
| [#646](https://github.com/Koniverse/SubWallet-Extension/issues/646) | Integrate Aventus Network (#646) | 0.8.4 | 2023-03-31 | US-24.70 |
| [#651](https://github.com/Koniverse/SubWallet-Extension/issues/651) | Update subscan for Subspace 2a network (#651) | 0.6.4 | 2022-09-22 | US-24.71 |
| [#669](https://github.com/Koniverse/SubWallet-Extension/issues/669) | Update Zeitgeist endpoints (#669) | 0.6.5 | 2022-09-24 | US-24.73 |
| [#671](https://github.com/Koniverse/SubWallet-Extension/issues/671) | Update $ price for ZTG token (#671) | 0.6.6 | 2022-09-30 | US-24.74 |
| [#685](https://github.com/Koniverse/SubWallet-Extension/issues/685) | Update Acala endpoints (#685) | 0.6.6 | 2022-09-30 | US-24.75 |
| [#697](https://github.com/Koniverse/SubWallet-Extension/issues/697) | Update provider URL for some chains (#697) | 0.6.7 | 2022-10-22 | US-24.76 |
| [#714](https://github.com/Koniverse/SubWallet-Extension/issues/714) | An error occurs when a user deletes tokens in case the tokens to be deleted have the same address contract (#714) | 0.6.7 | 2022-10-22 | US-24.78 |
| [#730](https://github.com/Koniverse/SubWallet-Extension/issues/730) | Support Boba Networks (#730) | 0.6.9 | 2022-11-04 | US-24.80 |
| [#734](https://github.com/Koniverse/SubWallet-Extension/issues/734) | Support Snow Parachain (#734) | 0.6.7 | 2022-10-22 | US-24.81 |
| [#742](https://github.com/Koniverse/SubWallet-Extension/issues/742) | Support sending PSP tokens (#742) | 0.6.8 | 2022-10-31 | US-24.82 |
| [#760](https://github.com/Koniverse/SubWallet-Extension/issues/760) | Add top token on ETH and BSC (#760) | 0.6.9 | 2022-11-04 | US-24.83 |
| [#773](https://github.com/Koniverse/SubWallet-Extension/issues/773) | Support sending BIT token for Bit.Country Alpha Net (#773) | 0.6.9 | 2022-11-04 | US-24.84 |
| [#775](https://github.com/Koniverse/SubWallet-Extension/issues/775) | Update Amplitude endpoint (#775) | 0.6.9 | 2022-11-04 | US-24.85 |
| [#788](https://github.com/Koniverse/SubWallet-Extension/issues/788) | Add support for the Octopus Network ecosystem (#788) | 0.7.5 | 2022-12-15 | US-24.87 |
| [#789](https://github.com/Koniverse/SubWallet-Extension/issues/789) | Bug automatically redirects to the Ethereum network when requesting permission (#789) | 0.7.3 | 2022-11-25 | US-24.88 |
| [#816](https://github.com/Koniverse/SubWallet-Extension/issues/816) | Update BIT token logo (#816) | 0.7.2 | 2022-11-19 | US-24.90 |
| [#854](https://github.com/Koniverse/SubWallet-Extension/issues/854) | Integrate Watr Protocol and Token (#854) | 0.7.4 | 2022-12-04 | US-24.93 |
| [#873](https://github.com/Koniverse/SubWallet-Extension/issues/873) | Integrate xx.network - a L1 Substrate-based network (#873) | 0.7.4 | 2022-12-04 | US-24.96 |
| [#908](https://github.com/Koniverse/SubWallet-Extension/issues/908) | Add the missing networks in Polkadot & Parachain group (#908) | 0.7.6 | 2022-12-17 | US-24.99 |
| [#2372](https://github.com/Koniverse/SubWallet-Extension/issues/2372) | Fixed bug phishing detection (#2372) | 1.1.27 | 2023-12-20 | US-25.10 |
| [#3741](https://github.com/Koniverse/SubWallet-Extension/issues/3741) | Fixed bug Reset Auto-lock, Advanced phishing detection, Camera in case upgrade version (#3741) | 1.3.28 | 2025-04-02 | US-25.11 |
| [#4891](https://github.com/Koniverse/SubWallet-Extension/issues/4891) | Turn off "Advanced phishing detection" feature (#4891) | 1.3.69 | 2025-12-08 | US-25.13 |
| [#1226](https://github.com/Koniverse/SubWallet-Extension/issues/1226) | Detect phishing page with ChainPatrol (#1226) | 1.0.5 | 2023-05-21 | US-25.5 |
| [#1823](https://github.com/Koniverse/SubWallet-Extension/issues/1823) | Update webpack config environment for page.js and content.js to improve security (#1823) | 1.1.9 | 2023-08-22 | US-25.9 |
| [#255](https://github.com/Koniverse/SubWallet-Extension/issues/255) | Improve data fetching for better performance and UX (#255) | 0.5.3 | 2022-07-29 | US-26.10 |
| [#258](https://github.com/Koniverse/SubWallet-Extension/issues/258) | Fix some style bug in (#258) | 0.4.2 | 2022-05-20 | US-26.11 |
| [#1748](https://github.com/Koniverse/SubWallet-Extension/issues/1748) | Fixed bug Do not display the history of addresses other than the original address (#1748) | 1.1.6 | 2023-08-04 | US-26.111 |
| [#340](https://github.com/Koniverse/SubWallet-Extension/issues/340) | Fix some bugs & feedback to improve UX-UI (#340) | 0.5.6 | 2022-08-24 | US-26.12 |
| [#1857](https://github.com/Koniverse/SubWallet-Extension/issues/1857) | Update empty list screens (#1857) | 1.1.13 | 2023-09-21 | US-26.121 |
| [#377](https://github.com/Koniverse/SubWallet-Extension/issues/377) | Improve request permission screen (#377) | 0.4.7 | 2022-06-24 | US-26.13 |
| [#2038](https://github.com/Koniverse/SubWallet-Extension/issues/2038) | Improve banner campaign in app (#2038) | 1.1.33 | 2024-01-23 | US-26.131 |
| [#2203](https://github.com/Koniverse/SubWallet-Extension/issues/2203) | Fixed some UI bug (#2203) | 1.1.29 | 2023-12-29 | US-26.137 |
| [#2317](https://github.com/Koniverse/SubWallet-Extension/issues/2317) | Add popup to remind users to perform backups account (popup hiển thị định kỳ) (#2317) | 1.1.68 | 2024-05-25 | US-26.140 |
| [#2362](https://github.com/Koniverse/SubWallet-Extension/issues/2362) | Fixed bug show EVM transaction history (#2362) | 1.1.27 | 2023-12-20 | US-26.142 |
| [#2387](https://github.com/Koniverse/SubWallet-Extension/issues/2387) | Add "time-out" status for transaction history (#2387) | 1.1.33 | 2024-01-23 | US-26.143 |
| [#2647](https://github.com/Koniverse/SubWallet-Extension/issues/2647) | Restructure Settings screen (#2647) | 1.1.41 | 2024-03-02 | US-26.151 |
| [#2751](https://github.com/Koniverse/SubWallet-Extension/issues/2751) | Improve display collators list (#2751) | 1.3.7 | 2024-11-23 | US-26.154 |
| [#2796](https://github.com/Koniverse/SubWallet-Extension/issues/2796) | Improve UI for Mission Pools (#2796) | 1.1.49 | 2024-03-26 | US-26.155 |
| [#585](https://github.com/Koniverse/SubWallet-Extension/issues/585) | Improved decimal display UX (#585) | 0.5.7 | 2022-09-06 | US-26.16 |
| [#3062](https://github.com/Koniverse/SubWallet-Extension/issues/3062) | Fixed bug Unable to back screen in case open General settings to Marketing campaign (#3062) | 1.1.65 | 2024-05-16 | US-26.161 |
| [#3131](https://github.com/Koniverse/SubWallet-Extension/issues/3131) | Fix bug Screen flickering error when interacting with extensions (#3131) | 1.2.10 | 2024-06-25 | US-26.162 |
| [#3228](https://github.com/Koniverse/SubWallet-Extension/issues/3228) | Update subwallet-react-ui (#3228) | 1.2.10 | 2024-06-25 | US-26.164 |
| [#3507](https://github.com/Koniverse/SubWallet-Extension/issues/3507) | Support Notification in app (#3507, #3515) | 1.3.4 | 2024-10-28 | US-26.169 |
| [#3515](https://github.com/Koniverse/SubWallet-Extension/issues/3515) | Support Notification in app (#3507, #3515) | 1.3.4 | 2024-10-28 | US-26.169 |
| [#4023](https://github.com/Koniverse/SubWallet-Extension/issues/4023) | Turn off the update manifest v3 popup (#4023) | 1.3.37 | 2025-05-23 | US-26.175 |
| [#4347](https://github.com/Koniverse/SubWallet-Extension/issues/4347) | Update UI to clearly display fees (#4347) | 1.3.38 | 2025-05-23 | US-26.178 |
| [#4617](https://github.com/Koniverse/SubWallet-Extension/issues/4617) | Improve UX for the "Advanced phishing detection" feature (#4617) | 1.3.56 | 2025-09-11 | US-26.187 |
| [#4739](https://github.com/Koniverse/SubWallet-Extension/issues/4739) | [Energy Web X] Display APY for collators in collator list (#4739) | 1.3.64 | 2025-10-31 | US-26.189 |
| [#820](https://github.com/Koniverse/SubWallet-Extension/issues/820) | Update new way to get transaction history (#820) | 0.7.6 | 2022-12-17 | US-26.21 |
| [#830](https://github.com/Koniverse/SubWallet-Extension/issues/830) | Do not show tooltip on the Firefox browser (#830) | 0.7.3 | 2022-11-25 | US-26.22 |
| [#912](https://github.com/Koniverse/SubWallet-Extension/issues/912) | Turn off background in case extension reloaded and popup never opened (#912) | 0.7.5 | 2022-12-15 | US-26.23 |
| [#19](https://github.com/Koniverse/SubWallet-Extension/issues/19) | Integrate Darwinia 2 (#19) | 1.0.5 | 2023-05-21 | US-26.3 |
| [#85](https://github.com/Koniverse/SubWallet-Extension/issues/85) | Update the new Settings screen (issue #85) | 0.3.2 | 2022-04-07 | US-26.5 |
| [#91](https://github.com/Koniverse/SubWallet-Extension/issues/91) | Improve custom access screen (issue #91) | 0.3.4 | 2022-04-16 | US-26.6 |
| [#156](https://github.com/Koniverse/SubWallet-Extension/issues/156) | Fix grammar error and type issue of button (issue #156,#166) | 0.3.4 | 2022-04-16 | US-26.7 |
| [#166](https://github.com/Koniverse/SubWallet-Extension/issues/166) | Fix grammar error and type issue of button (issue #156,#166) | 0.3.4 | 2022-04-16 | US-26.7 |
| [#224](https://github.com/Koniverse/SubWallet-Extension/issues/224) | Fix tooltip not showing on the popup view on firefox browser (#224) | 0.4.2 | 2022-05-20 | US-26.8 |
| [#1229](https://github.com/Koniverse/SubWallet-Extension/issues/1229) | Update UI for expand view (#1229) | 1.0.11 | 2023-06-24 | US-26.82 |
| [#1243](https://github.com/Koniverse/SubWallet-Extension/issues/1243) | Fixed sync configuration between expand view and popup view (#1243) | 1.1.2 | 2023-07-14 | US-26.84 |
| [#1336](https://github.com/Koniverse/SubWallet-Extension/issues/1336) | UI bug when scrolling (#1336) | 1.0.5 | 2023-05-21 | US-26.87 |
| [#1380](https://github.com/Koniverse/SubWallet-Extension/issues/1380) | Add “I trust this site” option on the phishing page screen (#1380) | 1.0.6 | 2023-05-26 | US-26.88 |
| [#1393](https://github.com/Koniverse/SubWallet-Extension/issues/1393) | Fixed bug on Firefox browser (#1394, #1393) | 1.0.5 | 2023-05-21 | US-26.89 |
| [#1394](https://github.com/Koniverse/SubWallet-Extension/issues/1394) | Fixed bug on Firefox browser (#1394, #1393) | 1.0.5 | 2023-05-21 | US-26.89 |
| [#228](https://github.com/Koniverse/SubWallet-Extension/issues/228) | Fix bug not update them when change them from popup view (#228) | 0.4.1 | 2022-05-11 | US-26.9 |
| [#1419](https://github.com/Koniverse/SubWallet-Extension/issues/1419) | Update some screens follow by design (#1419) | 1.0.8 | 2023-06-08 | US-26.90 |
| [#1450](https://github.com/Koniverse/SubWallet-Extension/issues/1450) | Update login & welcome screen (#1450) | 1.0.6 | 2023-05-26 | US-26.92 |
| [#1507](https://github.com/Koniverse/SubWallet-Extension/issues/1507) | Fixed UI bugs (#1548, #1507) | 1.1.2 | 2023-07-14 | US-26.93 |
| [#1548](https://github.com/Koniverse/SubWallet-Extension/issues/1548) | Fixed UI bugs (#1548, #1507) | 1.1.2 | 2023-07-14 | US-26.93 |
| [#1569](https://github.com/Koniverse/SubWallet-Extension/issues/1569) | Fixed UI bugs on the Expand view (#1569) | 1.0.12 | 2023-06-29 | US-26.95 |
| [#1639](https://github.com/Koniverse/SubWallet-Extension/issues/1639) | Update UI for notification (#1639) | 1.1.3 | 2023-07-21 | US-26.97 |
| [#1644](https://github.com/Koniverse/SubWallet-Extension/issues/1644) | Support new language: Japanese (#1644) | 1.1.10 | 2023-08-26 | US-26.98 |
| [#1684](https://github.com/Koniverse/SubWallet-Extension/issues/1684) | Improve lock UX (#1684) | 1.1.10 | 2023-08-26 | US-26.99 |
| [#981](https://github.com/Koniverse/SubWallet-Extension/issues/981) | Fix bug getting multiple balances for Equilibrium (#981) | 0.7.9 | 2023-01-30 | US-27.10 |
| [#1360](https://github.com/Koniverse/SubWallet-Extension/issues/1360) | Fixed bug get balance (#1360) | 1.0.5 | 2023-05-21 | US-27.13 |
| [#1428](https://github.com/Koniverse/SubWallet-Extension/issues/1428) | Fix bug get balance when send token (#1428) | 1.0.6 | 2023-05-26 | US-27.14 |
| [#1582](https://github.com/Koniverse/SubWallet-Extension/issues/1582) | Support show/hide balance (#1582) | 1.1.3 | 2023-07-21 | US-27.16 |
| [#1667](https://github.com/Koniverse/SubWallet-Extension/issues/1667) | Fixed bug still send local token in case the native token balance = 0 (#1667) | 1.1.5 | 2023-07-29 | US-27.17 |
| [#2381](https://github.com/Koniverse/SubWallet-Extension/issues/2381) | Add reload balance feature (#2381) | 1.1.29 | 2023-12-29 | US-27.24 |
| [#2393](https://github.com/Koniverse/SubWallet-Extension/issues/2393) | Fixed enforcing the minimum miner tip 1 wei (#2393) | 1.3.30 | 2025-04-14 | US-27.25 |
| [#2416](https://github.com/Koniverse/SubWallet-Extension/issues/2416) | Update balance service (#2416) | 1.1.52 | 2024-04-05 | US-27.26 |
| [#2664](https://github.com/Koniverse/SubWallet-Extension/issues/2664) | Enable price-id online (#2664) | 1.1.41 | 2024-03-02 | US-27.28 |
| [#2836](https://github.com/Koniverse/SubWallet-Extension/issues/2836) | Support auto detect balance for EVM (#2836) | 1.3.29 | 2025-04-08 | US-27.31 |
| [#3183](https://github.com/Koniverse/SubWallet-Extension/issues/3183) | Update fallback API for SubWallet API (Price, Exchange rate) (#3183) | 1.2.15 | 2024-07-12 | US-27.33 |
| [#3312](https://github.com/Koniverse/SubWallet-Extension/issues/3312) | Fix bug calculating balance for relaychain (#3312) | 1.2.15 | 2024-07-12 | US-27.35 |
| [#3481](https://github.com/Koniverse/SubWallet-Extension/issues/3481) | Update balance calculation for DeepBrainChain (#3481) | 1.2.27 | 2024-08-22 | US-27.37 |
| [#556](https://github.com/Koniverse/SubWallet-Extension/issues/556) | Fix bug showing balance on very small balance (#556) | 0.5.6 | 2022-08-24 | US-27.4 |
| [#4032](https://github.com/Koniverse/SubWallet-Extension/issues/4032) | Unable to load TAO balance (#4032) | 1.3.17 | 2025-02-18 | US-27.40 |
| [#4122](https://github.com/Koniverse/SubWallet-Extension/issues/4122) | Support price chart (#4122, #4266) | 1.3.33 | 2025-04-30 | US-27.41 |
| [#4266](https://github.com/Koniverse/SubWallet-Extension/issues/4266) | Support price chart (#4122, #4266) | 1.3.33 | 2025-04-30 | US-27.41 |
| [#4162](https://github.com/Koniverse/SubWallet-Extension/issues/4162) | Update logic fetching Bitcoin balance (#4162) | 1.3.42 | 2025-06-23 | US-27.43 |
| [#4586](https://github.com/Koniverse/SubWallet-Extension/issues/4586) | Fixed bug Incorrect price history chart display when changing currency in popup mode (#4586) | 1.3.55 | 2025-09-05 | US-27.48 |
| [#785](https://github.com/Koniverse/SubWallet-Extension/issues/785) | Update price for KBTC (#785) | 0.6.9 | 2022-11-04 | US-27.5 |
| [#4708](https://github.com/Koniverse/SubWallet-Extension/issues/4708) | Locked Balance Display (#4708) | 1.3.68 | 2025-12-03 | US-27.50 |
| [#4784](https://github.com/Koniverse/SubWallet-Extension/issues/4784) | Standardize the Module Price History according to the new standard (#4784) | 1.3.68 | 2025-12-03 | US-27.52 |
| [#4987](https://github.com/Koniverse/SubWallet-Extension/issues/4987) | Alpha price calculation mismatch vs TaoStats (#4987) | 1.3.79 | 2026-05-21 | US-27.54 |
| [#902](https://github.com/Koniverse/SubWallet-Extension/issues/902) | Update balance logic for Equilibrium (#902) | 0.7.7 | 2022-12-28 | US-27.6 |
| [#916](https://github.com/Koniverse/SubWallet-Extension/issues/916) | Update get balance function for Kusama (#916) | 0.7.5 | 2022-12-15 | US-27.7 |
| [#921](https://github.com/Koniverse/SubWallet-Extension/issues/921) | Update price for iBTC (#921) | 0.7.5 | 2022-12-15 | US-27.8 |
| [#975](https://github.com/Koniverse/SubWallet-Extension/issues/975) | Update Equilibrium balance structure (#975) | 0.7.8 | 2023-01-19 | US-27.9 |
| [#1950](https://github.com/Koniverse/SubWallet-Extension/issues/1950) | Update transfer function for Pendulum (#1950) | 1.1.14 | 2023-09-26 | US-28.101 |
| [#2042](https://github.com/Koniverse/SubWallet-Extension/issues/2042) | Fixed bug transfer on Rococo (#2042) | 1.1.19 | 2023-10-26 | US-28.102 |
| [#2079](https://github.com/Koniverse/SubWallet-Extension/issues/2079) | Fixed bug estimating fee on calculating max transferable (#2079) | 1.1.19 | 2023-10-26 | US-28.103 |
| [#2146](https://github.com/Koniverse/SubWallet-Extension/issues/2146) | Fixed bug undefined is not an object when perform transaction (#2146) | 1.1.21 | 2023-11-08 | US-28.106 |
| [#2255](https://github.com/Koniverse/SubWallet-Extension/issues/2255) | Fixed bug error submitting transaction on Astar EVM (#2255) | 1.1.24 | 2023-12-01 | US-28.109 |
| [#2336](https://github.com/Koniverse/SubWallet-Extension/issues/2336) | Check fee estimation on EVM networks (#2336) | 1.1.36 | 2024-02-06 | US-28.111 |
| [#2412](https://github.com/Koniverse/SubWallet-Extension/issues/2412) | Hot fix bug estimating EVM transaction fee (#2412) | 1.1.30 | 2024-01-05 | US-28.113 |
| [#2606](https://github.com/Koniverse/SubWallet-Extension/issues/2606) | Update estimating EVM transaction fee for Energy Web Chain (#2606) | 1.1.38 | 2024-02-17 | US-28.116 |
| [#2613](https://github.com/Koniverse/SubWallet-Extension/issues/2613) | Show duplicate transaction history when transfer local token (#2613) | 1.2.2 | 2024-05-30 | US-28.117 |
| [#2628](https://github.com/Koniverse/SubWallet-Extension/issues/2628) | Adjust showing/validating address on Send fund (#2628) | 1.1.39 | 2024-02-24 | US-28.119 |
| [#271](https://github.com/Koniverse/SubWallet-Extension/issues/271) | Fix balance showing incorrect in Send Fund screen in case create/forget acc successfully (#271) | 0.5.4 | 2022-08-05 | US-28.12 |
| [#2641](https://github.com/Koniverse/SubWallet-Extension/issues/2641) | Extension - Re-check transaction failed in case transfer max with balance = ED (#2641) | 1.3.80 | 2026-06-02 | US-28.120 |
| [#2649](https://github.com/Koniverse/SubWallet-Extension/issues/2649) | Support Send crash log feature (#2649) | 1.1.41 | 2024-03-02 | US-28.122 |
| [#2659](https://github.com/Koniverse/SubWallet-Extension/issues/2659) | Update transaction result screen (#2659) | 1.1.42 | 2024-03-08 | US-28.123 |
| [#2670](https://github.com/Koniverse/SubWallet-Extension/issues/2670) | Improve EVM network fee (#2670) | 1.1.41 | 2024-03-02 | US-28.124 |
| [#282](https://github.com/Koniverse/SubWallet-Extension/issues/282) | Fix when select aUSD (Acala) to transfer (#282) | 0.4.2 | 2022-05-20 | US-28.13 |
| [#2783](https://github.com/Koniverse/SubWallet-Extension/issues/2783) | Do not allow send to empty account (Native token balance = 0) (#2783) | 1.2.25 | 2024-08-17 | US-28.133 |
| [#2793](https://github.com/Koniverse/SubWallet-Extension/issues/2793) | Handle case slow getting max transferable cause wrong amount when submit max transfer (#2793) | 1.1.49 | 2024-03-26 | US-28.134 |
| [#2795](https://github.com/Koniverse/SubWallet-Extension/issues/2795) | Fix send fund error (#2795) | 1.1.48 | 2024-03-25 | US-28.135 |
| [#2798](https://github.com/Koniverse/SubWallet-Extension/issues/2798) | Check transfer logic that can potentially affect ED (#2798) | 1.1.49 | 2024-03-26 | US-28.136 |
| [#283](https://github.com/Koniverse/SubWallet-Extension/issues/283) | Fix the balance display incorrect after transfer Sub-token successfully (#283) | 0.4.2 | 2022-05-20 | US-28.14 |
| [#2852](https://github.com/Koniverse/SubWallet-Extension/issues/2852) | Support GRC-20 token (#2852, #3067) | 1.1.66 | 2024-05-21 | US-28.140 |
| [#3067](https://github.com/Koniverse/SubWallet-Extension/issues/3067) | Support GRC-20 token (#2852, #3067) | 1.1.66 | 2024-05-21 | US-28.140 |
| [#2873](https://github.com/Koniverse/SubWallet-Extension/issues/2873) | Add warning message for cross chain transfer to an exchange (CEX) (#2873) | 1.1.55 | 2024-04-14 | US-28.141 |
| [#2955](https://github.com/Koniverse/SubWallet-Extension/issues/2955) | Fixed bug Do not show transaction history in case sender account is null (#2955) | 1.1.58 | 2024-04-24 | US-28.144 |
| [#3041](https://github.com/Koniverse/SubWallet-Extension/issues/3041) | Fixed bug when transferring PSP22 token (#3041) | 1.1.65 | 2024-05-16 | US-28.146 |
| [#3095](https://github.com/Koniverse/SubWallet-Extension/issues/3095) | Support transfer between PAH - KAH (#3095) | 1.2.6 | 2024-06-19 | US-28.148 |
| [#3166](https://github.com/Koniverse/SubWallet-Extension/issues/3166) | Update transferable formula for system pallet v1 (#3166) | 1.2.4 | 2024-06-08 | US-28.151 |
| [#3452](https://github.com/Koniverse/SubWallet-Extension/issues/3452) | Fix UI bug on the Transfer screen (#3452) | 1.2.28 | 2024-09-04 | US-28.155 |
| [#3590](https://github.com/Koniverse/SubWallet-Extension/issues/3590) | Support paying fee with non-native tokens on Asset Hub (#3590) | 1.3.18 | 2025-02-20 | US-28.163 |
| [#3632](https://github.com/Koniverse/SubWallet-Extension/issues/3632) | Rounded value parameter send in EVM transaction request (#3632) | 1.3.66 | 2025-11-07 | US-28.165 |
| [#3653](https://github.com/Koniverse/SubWallet-Extension/issues/3653) | Fix bug do not show balance (#3653) | 1.2.30 | 2024-09-20 | US-28.167 |
| [#3658](https://github.com/Koniverse/SubWallet-Extension/issues/3658) | Allow customizing fee for substrate/evm transactions (#3658) | 1.3.24 | 2025-03-18 | US-28.168 |
| [#296](https://github.com/Koniverse/SubWallet-Extension/issues/296) | Bug happens when viewing Transaction History after Delete token (#296) | 0.4.3 | 2022-05-31 | US-28.17 |
| [#3711](https://github.com/Koniverse/SubWallet-Extension/issues/3711) | Hot fix handle API status (#3711) | 1.2.32 | 2024-10-01 | US-28.170 |
| [#3852](https://github.com/Koniverse/SubWallet-Extension/issues/3852) | Re-check transaction on Polkadot Asset Hub (#3852) | 1.3.7 | 2024-11-23 | US-28.171 |
| [#3861](https://github.com/Koniverse/SubWallet-Extension/issues/3861) | Fix errors when making transactions on Tangle mainnet (#3861) | 1.3.11 | 2024-12-23 | US-28.173 |
| [#3896](https://github.com/Koniverse/SubWallet-Extension/issues/3896) | Unable to transfer local token on Bifrost (#3896) | 1.3.10 | 2024-12-12 | US-28.176 |
| [#310](https://github.com/Koniverse/SubWallet-Extension/issues/310) | Fix bug happens on Send Fund/Donate screen when Delete Custom Network (#310) | 0.5.3 | 2022-07-29 | US-28.18 |
| [#4045](https://github.com/Koniverse/SubWallet-Extension/issues/4045) | Support custom fee token when sending token on Hydration (#4045) | 1.3.24 | 2025-03-18 | US-28.182 |
| [#4065](https://github.com/Koniverse/SubWallet-Extension/issues/4065) | Fixed some bug for customizing fee for substrate/evm transactions features (#4065) | 1.3.55 | 2025-09-05 | US-28.183 |
| [#4072](https://github.com/Koniverse/SubWallet-Extension/issues/4072) | Fixed bug Unable to detect domains name when transfer (#4072) | 1.3.53 | 2025-08-12 | US-28.184 |
| [#4263](https://github.com/Koniverse/SubWallet-Extension/issues/4263) | Support transfer for Bitcoin (#4263) | 1.3.42 | 2025-06-23 | US-28.187 |
| [#4314](https://github.com/Koniverse/SubWallet-Extension/issues/4314) | Update Paraspell's fee calculation API (#4314), | 1.3.40 | 2025-05-30 | US-28.188 |
| [#4461](https://github.com/Koniverse/SubWallet-Extension/issues/4461) | Fixed bug when custom priority fee for EVM (#4461) | 1.3.53 | 2025-08-12 | US-28.191 |
| [#4462](https://github.com/Koniverse/SubWallet-Extension/issues/4462) | Fixed bug Show incorrect amount when transfer max (#4462) | 1.3.58 | 2025-09-19 | US-28.192 |
| [#4486](https://github.com/Koniverse/SubWallet-Extension/issues/4486) | Fixed error validate receive address when transferring MYTH (Mythos) (#4486) | 1.3.45 | 2025-07-01 | US-28.193 |
| [#4559](https://github.com/Koniverse/SubWallet-Extension/issues/4559) | Update logic for rpc that don't support custom fee on EVM system (#4559) | 1.3.53 | 2025-08-12 | US-28.194 |
| [#4585](https://github.com/Koniverse/SubWallet-Extension/issues/4585) | Hide icon Edit fee with some networks not supported (#4585) | 1.3.53 | 2025-08-12 | US-28.195 |
| [#4652](https://github.com/Koniverse/SubWallet-Extension/issues/4652) | Fixed missing "Edit Fee" button / Improve fee loading UI (#4652) | 1.3.62 | 2025-10-10 | US-28.196 |
| [#4706](https://github.com/Koniverse/SubWallet-Extension/issues/4706) | Fixed bug don't show toast message validate in case input amount < 1 when transfer Cardano (#4706) | 1.3.62 | 2025-10-10 | US-28.197 |
| [#4716](https://github.com/Koniverse/SubWallet-Extension/issues/4716) | Configure gas limit & max gas fee for Energy Web Chain (#4716) | 1.3.67 | 2025-11-13 | US-28.198 |
| [#32](https://github.com/Koniverse/SubWallet-Extension/issues/32) | Implement new Send Fund UI with support send tokens, send EVM assets (#32, #143, #118) | 0.4.1 | 2022-05-11 | US-28.2 |
| [#118](https://github.com/Koniverse/SubWallet-Extension/issues/118) | Implement new Send Fund UI with support send tokens, send EVM assets (#32, #143, #118) | 0.4.1 | 2022-05-11 | US-28.2 |
| [#143](https://github.com/Koniverse/SubWallet-Extension/issues/143) | Implement new Send Fund UI with support send tokens, send EVM assets (#32, #143, #118) | 0.4.1 | 2022-05-11 | US-28.2 |
| [#4900](https://github.com/Koniverse/SubWallet-Extension/issues/4900) | Support Transfer Alpha Token (#4900) | 1.3.78 | 2026-05-14 | US-28.200 |
| [#4954](https://github.com/Koniverse/SubWallet-Extension/issues/4954) | Turn off warning popup for transfers between PAH <> KAH (#4954) | 1.3.77 | 2026-04-09 | US-28.201 |
| [#393](https://github.com/Koniverse/SubWallet-Extension/issues/393) | Improve the UX for contracts transaction with EVM provider (#393) | 0.5.2 | 2022-07-22 | US-28.25 |
| [#454](https://github.com/Koniverse/SubWallet-Extension/issues/454) | Add support for transaction history on Astar EVM (#454) | 0.5.5 | 2022-08-11 | US-28.26 |
| [#472](https://github.com/Koniverse/SubWallet-Extension/issues/472) | Support cross chain transfer: aUSD (#472) | 0.5.4 | 2022-08-05 | US-28.27 |
| [#576](https://github.com/Koniverse/SubWallet-Extension/issues/576) | Fix showing incorrect transferable balance for PRING token (#576) | 0.5.7 | 2022-09-06 | US-28.32 |
| [#584](https://github.com/Koniverse/SubWallet-Extension/issues/584) | Fix bug can't view transaction history of Moonbase Alpha network (#584) | 0.5.7 | 2022-09-06 | US-28.33 |
| [#665](https://github.com/Koniverse/SubWallet-Extension/issues/665) | Support transfer BIT token on Pioneer Network (#665) | 0.6.5 | 2022-09-24 | US-28.34 |
| [#681](https://github.com/Koniverse/SubWallet-Extension/issues/681) | Change transfer warning when the account cannot be reaped (#681) | 0.6.6 | 2022-09-30 | US-28.35 |
| [#827](https://github.com/Koniverse/SubWallet-Extension/issues/827) | Show incorrect the transfer result on the transaction history screen (#827) | 0.7.2 | 2022-11-19 | US-28.38 |
| [#874](https://github.com/Koniverse/SubWallet-Extension/issues/874) | Add the warning message for invalid Amount input cases (for send fund feature) (#874) | 0.7.7 | 2022-12-28 | US-28.40 |
| [#984](https://github.com/Koniverse/SubWallet-Extension/issues/984) | Add support send EQ token (#984) | 0.8.1 | 2023-02-03 | US-28.44 |
| [#1254](https://github.com/Koniverse/SubWallet-Extension/issues/1254) | Improve transaction UX (#1254) | 1.0.3 | 2023-05-06 | US-28.61 |
| [#1361](https://github.com/Koniverse/SubWallet-Extension/issues/1361) | Add more search criteria (#1361) | 1.0.5 | 2023-05-21 | US-28.67 |
| [#1381](https://github.com/Koniverse/SubWallet-Extension/issues/1381) | Add support view on browser for some chain (#1381) | 1.0.5 | 2023-05-21 | US-28.68 |
| [#1385](https://github.com/Koniverse/SubWallet-Extension/issues/1385) | Update notification in case transaction time out (#1385) | 1.0.8 | 2023-06-08 | US-28.69 |
| [#1411](https://github.com/Koniverse/SubWallet-Extension/issues/1411) | Fixed bug Do not get transaction history in case the wallet have multi-account (#1411) | 1.0.9 | 2023-06-13 | US-28.70 |
| [#1418](https://github.com/Koniverse/SubWallet-Extension/issues/1418) | Update QR code style for transaction with QR-signer account (#1418) | 1.1.2 | 2023-07-14 | US-28.71 |
| [#1449](https://github.com/Koniverse/SubWallet-Extension/issues/1449) | Review and support send fund for more token (#1449) | 1.0.9 | 2023-06-13 | US-28.73 |
| [#1451](https://github.com/Koniverse/SubWallet-Extension/issues/1451) | Fixed the bug causing an error page when sending tokens on a custom network (#1451) | 1.0.7 | 2023-06-01 | US-28.74 |
| [#1458](https://github.com/Koniverse/SubWallet-Extension/issues/1458) | Added validation for the scenario "Transfer Max local token. (#1458) | 1.0.7 | 2023-06-01 | US-28.75 |
| [#1460](https://github.com/Koniverse/SubWallet-Extension/issues/1460) | Resolved bugs related to sending funds on some tokens after running script tests (#1460) | 1.0.7 | 2023-06-01 | US-28.76 |
| [#1474](https://github.com/Koniverse/SubWallet-Extension/issues/1474) | Optimize decode contract in transaction (#1474) | 1.0.9 | 2023-06-13 | US-28.77 |
| [#1479](https://github.com/Koniverse/SubWallet-Extension/issues/1479) | Add validate for case: the transaction amount is too small to keep the destination account alive (#1479) | 1.0.8 | 2023-06-08 | US-28.78 |
| [#1482](https://github.com/Koniverse/SubWallet-Extension/issues/1482) | Optimized the requirement to enable tokens in the Transaction Screen (#1482) | 1.0.7 | 2023-06-01 | US-28.79 |
| [#1492](https://github.com/Koniverse/SubWallet-Extension/issues/1492) | Fixed bug send fund ERC20 token on Polygon (#1492) | 1.0.8 | 2023-06-08 | US-28.80 |
| [#1509](https://github.com/Koniverse/SubWallet-Extension/issues/1509) | Update the new send fund screen (#1509) | 1.0.9 | 2023-06-13 | US-28.81 |
| [#1514](https://github.com/Koniverse/SubWallet-Extension/issues/1514) | Fixed bug Show duplicate token on receive list when search custom token (#1514) | 1.0.9 | 2023-06-13 | US-28.83 |
| [#1522](https://github.com/Koniverse/SubWallet-Extension/issues/1522) | Fixed bug Do not transfer BNC token on the Bifrost Polkadot (#1522) | 1.0.9 | 2023-06-13 | US-28.84 |
| [#1531](https://github.com/Koniverse/SubWallet-Extension/issues/1531) | Update Receive icon to Copy icon on Homepage screen (#1531) | 1.0.10 | 2023-06-17 | US-28.85 |
| [#1555](https://github.com/Koniverse/SubWallet-Extension/issues/1555) | Save entered transaction information when closing and reopening the extension (#1555) | 1.1.10 | 2023-08-26 | US-28.87 |
| [#1654](https://github.com/Koniverse/SubWallet-Extension/issues/1654) | Fixed bug Show incorrect transaction time on the history screen (#1654) | 1.1.3 | 2023-07-21 | US-28.89 |
| [#1657](https://github.com/Koniverse/SubWallet-Extension/issues/1657) | Fixed bug Do not validate amount of the recipient address in case send token (#1657) | 1.1.3 | 2023-07-21 | US-28.90 |
| [#1872](https://github.com/Koniverse/SubWallet-Extension/issues/1872) | Allow paste Amount to send (#1872) | 1.1.13 | 2023-09-21 | US-28.96 |
| [#12](https://github.com/Koniverse/SubWallet-Extension/issues/12) | Integrate Snow EVM network (#12) | 1.0.5 | 2023-05-21 | US-9.3 |
| [#3762](https://github.com/Koniverse/SubWallet-Extension/issues/3762) | Fixed bug send NFT on Ethereum network (#3762) | 1.3.9 | 2024-12-09 | US-9.5 |
| [#3791](https://github.com/Koniverse/SubWallet-Extension/issues/3791) | Fix bug show OG WUD BURN NFT Collection (#3791) | 1.3.3 | 2024-10-16 | US-9.10 |
| [#3818](https://github.com/Koniverse/SubWallet-Extension/issues/3818) | Fixed bug import NFT (#3837) (#3818) | 1.3.49 | 2025-07-28 | US-9.8 |
| [#3837](https://github.com/Koniverse/SubWallet-Extension/issues/3837) | Fixed bug import NFT (#3837) (#3818) | 1.3.49 | 2025-07-28 | US-9.8 |
| [#3854](https://github.com/Koniverse/SubWallet-Extension/issues/3854) | Integration NFT for Story Protocol (#3854) | 1.3.7 | 2024-11-23 | US-9.3 |
| [#4132](https://github.com/Koniverse/SubWallet-Extension/issues/4132) | Fixed bug Do not display NFT images on Vara network, PAH (#4132) | 1.3.56 | 2025-09-11 | US-9.13 |
| [#4568](https://github.com/Koniverse/SubWallet-Extension/issues/4568) | Support show NFT haven't method tokenOfOwnerByIndex (#4568) | 1.3.68 | 2025-12-03 | US-9.8 |
| [#4625](https://github.com/Koniverse/SubWallet-Extension/issues/4625) | Unable to import NFT ERC-721 on Rari chain (#4625) | 1.3.68 | 2025-12-03 | US-9.8 |
| [#4884](https://github.com/Koniverse/SubWallet-Extension/issues/4884) | Implement NFTService + Migrate EVM & Unique Network NFT logic (Phase 1) (#4884) | 1.3.80 | 2026-06-02 | US-9.20 |
| [#105](https://github.com/Koniverse/SubWallet-Extension/issues/105) | Some problems related to NFT function (issue #105) | 0.3.3 | 2022-04-08 | US-9.10 |
| [#109](https://github.com/Koniverse/SubWallet-Extension/issues/109) | Improve NFT display with extending mode (issue #109) | 0.3.3 | 2022-04-08 | US-9.10 |
| [#184](https://github.com/Koniverse/SubWallet-Extension/issues/184) | Integrate new cross-chain tokens on Karura (RMRK, ARIS, QTZ, ...) (#184) | 0.4.2 | 2022-05-20 | US-9.1 |
| [#200](https://github.com/Koniverse/SubWallet-Extension/issues/200) | Fix bug can not load NFT (#200) | 0.4.1 | 2022-05-11 | US-9.10 |
| [#209](https://github.com/Koniverse/SubWallet-Extension/issues/209) | Fix bug can not send EVM NFT (#209) | 0.4.1 | 2022-05-11 | US-9.5 |
| [#27](https://github.com/Koniverse/SubWallet-Extension/issues/27) | Update RPC endpoint for Mangata (#27) | 1.0.5 | 2023-05-21 | US-9.3 |
| [#265](https://github.com/Koniverse/SubWallet-Extension/issues/265) | Bug Send NFT when balance is too low (#265) | 0.4.3 | 2022-05-31 | US-9.5 |
| [#321](https://github.com/Koniverse/SubWallet-Extension/issues/321) | Fix bug "Encountered an error, please try again" when Send NFT (#321) | 0.4.4 | 2022-06-08 | US-9.5 |
| [#480](https://github.com/Koniverse/SubWallet-Extension/issues/480) | Optimize NFT loading with <https://nft.storage/> (#480) | 0.5.3 | 2022-07-29 | US-9.13 |
| [#517](https://github.com/Koniverse/SubWallet-Extension/issues/517) | Add Moonpets NFT (#517) | 0.5.4 | 2022-08-05 | US-9.3 |
| [#557](https://github.com/Koniverse/SubWallet-Extension/issues/557) | Fix bug happens when NFT image error (#557) | 0.5.6 | 2022-08-24 | US-9.13 |
| [#639](https://github.com/Koniverse/SubWallet-Extension/issues/639) | Add support for USDC & stEWT (#639) | 1.3.72 | 2026-01-14 | US-24.341 |
| [#643](https://github.com/Koniverse/SubWallet-Extension/issues/643) | Add more attributes to NFT collection and item (#643) | 0.6.4 | 2022-09-22 | US-9.10 |
| [#29](https://github.com/Koniverse/SubWallet-Extension/issues/29) | Update Zeitgeist and Subsocial integration (#29) | 1.0.5 | 2023-05-21 | US-9.1 |
| [#649](https://github.com/Koniverse/SubWallet-Extension/issues/649) | Integrate Pioneer Network NFT (#649) | 0.6.5 | 2022-09-24 | US-9.1 |
| [#747](https://github.com/Koniverse/SubWallet-Extension/issues/747) | Issue sending Bit.Country NFT and displaying BIT token (#747) | 0.6.8 | 2022-10-31 | US-9.5 |
| [#759](https://github.com/Koniverse/SubWallet-Extension/issues/759) | Unable to send NFT with QR Account in case of network not selected (#759) | 0.6.8 | 2022-10-31 | US-9.5 |
| [#864](https://github.com/Koniverse/SubWallet-Extension/issues/864) | Fix bug NFT displays an error after update function parses transaction in case upgrade version (#864) | 0.7.4 | 2022-12-04 | US-9.10 |
| [#893](https://github.com/Koniverse/SubWallet-Extension/issues/893) | Update RMRK NFT endpoints (#893) | 0.7.5 | 2022-12-15 | US-9.13 |
| [#950](https://github.com/Koniverse/SubWallet-Extension/issues/950) | Do not show sub0 Lisbon 2022 NFT (#950) | 0.7.7 | 2022-12-28 | US-9.1 |
| [#963](https://github.com/Koniverse/SubWallet-Extension/issues/963) | Update RMRK NFT endpoints (#963) | 0.8.1 | 2023-02-03 | US-9.13 |
| [#1095](https://github.com/Koniverse/SubWallet-Extension/issues/1095) | Update logic for ink 4.0 and delete old PSP token (#1095) | 0.8.3 | 2023-03-29 | US-9.1 |
| [#34](https://github.com/Koniverse/SubWallet-Extension/issues/34) | Send & Receive Moonbeam / Moonriver NFT (issue #34) | 0.3.1 | 2022-04-05 | US-9.3 |
| [#1335](https://github.com/Koniverse/SubWallet-Extension/issues/1335) | Integrate Land/Estate NFT on Pioneer's metaverses (#1335) | 1.1.2 | 2023-07-14 | US-9.1 |
| [#1404](https://github.com/Koniverse/SubWallet-Extension/issues/1404) | Fix bug show Moonfit’s NFT (#1404) | 1.0.6 | 2023-05-26 | US-9.3 |
| [#1414](https://github.com/Koniverse/SubWallet-Extension/issues/1414) | Update RMRK API (#1414) | 1.0.6 | 2023-05-26 | US-9.13 |
| [#1602](https://github.com/Koniverse/SubWallet-Extension/issues/1602) | Fixed NFT Gateway problems with non-extension environment (#1602) | 1.1.1 | 2023-07-06 | US-9.13 |
| [#44](https://github.com/Koniverse/SubWallet-Extension/issues/44) | Integrate Astar NFT (issue #44) | 0.3.2 | 2022-04-07 | US-9.1 |
| [#1672](https://github.com/Koniverse/SubWallet-Extension/issues/1672) | Can not load another NFTs when collection contain any NFT with wrong information (#1672) | 1.1.4 | 2023-07-24 | US-9.13 |
| [#1784](https://github.com/Koniverse/SubWallet-Extension/issues/1784) | Show collection ID and NFT Id in the NFT detail screen (#1784) | 1.1.8 | 2023-08-12 | US-9.10 |
| [#1817](https://github.com/Koniverse/SubWallet-Extension/issues/1817) | Fix a few minor bugs with NFT (#1817) | 1.1.9 | 2023-08-22 | US-9.10 |
| [#52](https://github.com/Koniverse/SubWallet-Extension/issues/52) | Integrate Bit.Country NFT: Display, Send, Receive (issue #52) | 0.3.1 | 2022-04-05 | US-9.1 |
| [#2029](https://github.com/Koniverse/SubWallet-Extension/issues/2029) | Fixed bug Do not show Acala, Karura NFT (#2029) | 1.1.18 | 2023-10-20 | US-9.1 |
| [#2373](https://github.com/Koniverse/SubWallet-Extension/issues/2373) | Fixed bug show transfer NFT history details (#2373) | 1.1.27 | 2023-12-20 | US-9.5 |
| [#2748](https://github.com/Koniverse/SubWallet-Extension/issues/2748) | Fixed bug error page on NFT details screen (#2748) | 1.1.44 | 2024-03-16 | US-9.10 |
| [#3115](https://github.com/Koniverse/SubWallet-Extension/issues/3115) | Fix error when fetching with Avail network (#3115) | 1.1.68 | 2024-05-25 | US-9.1 |
| [#3133](https://github.com/Koniverse/SubWallet-Extension/issues/3133) | Fix bug Show incorrect Amount on Transaction history, Transaction confirmation for transfer NFT (#3133) | 1.2.10 | 2024-06-25 | US-9.5 |
| [#3559](https://github.com/Koniverse/SubWallet-Extension/issues/3559) | Support Ternoa NFT (#3559) | 1.3.2 | 2024-10-12 | US-9.1 |
| [#3609](https://github.com/Koniverse/SubWallet-Extension/issues/3609) | Add validate tokenOfOwnerByIndex when import NFT (#3609) | 1.3.2 | 2024-10-12 | US-9.8 |
| [#1762](https://github.com/Koniverse/SubWallet-Extension/issues/1762) | Fixed bug do not delete connection when reset wallet (#1762) | 1.1.8 | 2023-08-12 | US-30.100 |
| [#1806](https://github.com/Koniverse/SubWallet-Extension/issues/1806) | Update Banxa service (#1806) | 1.1.9 | 2023-08-22 | US-30.105 |
| [#1906](https://github.com/Koniverse/SubWallet-Extension/issues/1906) | Add injected placeholder to avoid extension cannot load in the first time (#1906) | 1.1.13 | 2023-09-21 | US-30.110 |
| [#1912](https://github.com/Koniverse/SubWallet-Extension/issues/1912) | Fixed bug Create incorrect account when connect dApp (#1912) | 1.1.12 | 2023-09-15 | US-30.112 |
| [#1926](https://github.com/Koniverse/SubWallet-Extension/issues/1926) | Fixed bug Do not scroll the network list in case of connecting dApp via WalletConnect (#1926) | 1.1.15 | 2023-09-30 | US-30.114 |
| [#1930](https://github.com/Koniverse/SubWallet-Extension/issues/1930) | Fixed bug Navigate incorrect in case Create one when connect dApp (#1930) | 1.1.15 | 2023-09-30 | US-30.115 |
| [#1936](https://github.com/Koniverse/SubWallet-Extension/issues/1936) | Fixed bug dApp detection when connect wallet (#1936) | 1.1.27 | 2023-12-20 | US-30.117 |
| [#1981](https://github.com/Koniverse/SubWallet-Extension/issues/1981) | Fixed bug when connect to dApp via WallectConnect (#1981) | 1.1.16 | 2023-10-07 | US-30.119 |
| [#2119](https://github.com/Koniverse/SubWallet-Extension/issues/2119) | Update WalletConnect namespace (#2119) | 1.1.22 | 2023-11-15 | US-30.129 |
| [#225](https://github.com/Koniverse/SubWallet-Extension/issues/225) | Fix bug display incorrect screen when connection is lost (#225) | 0.4.1 | 2022-05-11 | US-30.13 |
| [#2139](https://github.com/Koniverse/SubWallet-Extension/issues/2139) | Fixed bug decode dApp address (#2139) | 1.1.23 | 2023-11-24 | US-30.132 |
| [#2407](https://github.com/Koniverse/SubWallet-Extension/issues/2407) | Fixed bug Wallet Connect not show connection popup (#2407) | 1.1.53 | 2024-04-08 | US-30.139 |
| [#227](https://github.com/Koniverse/SubWallet-Extension/issues/227) | Fix display multi popup connect wallet (#227) | 0.4.2 | 2022-05-20 | US-30.14 |
| [#2413](https://github.com/Koniverse/SubWallet-Extension/issues/2413) | Fixed bug can not connect to WalletConnect (#2413) | 1.1.29 | 2023-12-29 | US-30.140 |
| [#2501](https://github.com/Koniverse/SubWallet-Extension/issues/2501) | Fix bug Do not show Signature popup in case not enough balance to cover gas fee (#2501) | 1.2.25 | 2024-08-17 | US-30.143 |
| [#2722](https://github.com/Koniverse/SubWallet-Extension/issues/2722) | Merge dApp request from both of interface into one interface (#2722) | 1.1.46 | 2024-03-22 | US-30.149 |
| [#231](https://github.com/Koniverse/SubWallet-Extension/issues/231) | Fix can't connect account in case user created account successfully while popup connect wallet is displaying (#231) | 0.4.2 | 2022-05-20 | US-30.15 |
| [#2859](https://github.com/Koniverse/SubWallet-Extension/issues/2859) | Fixed bug  Invalid recipient address when Dapp deploy smart contract (#2859) | 1.1.64 | 2024-05-10 | US-30.152 |
| [#2860](https://github.com/Koniverse/SubWallet-Extension/issues/2860) | Fixed bug Some required methods are missing when connecting Dapp to Subwallet via WalletConnect (#2860) | 1.1.53 | 2024-04-08 | US-30.153 |
| [#2891](https://github.com/Koniverse/SubWallet-Extension/issues/2891) | Fix issue in transaction screen (#2891) | 1.1.54 | 2024-04-09 | US-30.154 |
| [#2899](https://github.com/Koniverse/SubWallet-Extension/issues/2899) | Automatically enable network when connecting via Substrate provider (#2899) | 1.1.55 | 2024-04-14 | US-30.157 |
| [#2903](https://github.com/Koniverse/SubWallet-Extension/issues/2903) | Fixed bug displaying 'connection existed' when connecting WalletConnect (#2903) | 1.1.55 | 2024-04-14 | US-30.158 |
| [#2917](https://github.com/Koniverse/SubWallet-Extension/issues/2917) | Fixed bug Can not disconnect when connecting to 2 URIs of the same website with WalletConnect (#2917) | 1.3.53 | 2025-08-12 | US-30.159 |
| [#3025](https://github.com/Koniverse/SubWallet-Extension/issues/3025) | Fixed bug no network support when connecting to the WalletConnect (#3025) | 1.3.52 | 2025-08-07 | US-30.166 |
| [#3027](https://github.com/Koniverse/SubWallet-Extension/issues/3027) | Fixed cannot signing with dApp in case network is not publish (#3027) | 1.1.63 | 2024-05-09 | US-30.167 |
| [#3175](https://github.com/Koniverse/SubWallet-Extension/issues/3175) | Add CheckMetadataHash signed extension support (#3175) | 1.2.5 | 2024-06-11 | US-30.171 |
| [#3243](https://github.com/Koniverse/SubWallet-Extension/issues/3243) | Update chain-list health-check and report RPC connect status (#3243) | 1.2.15 | 2024-07-12 | US-30.172 |
| [#3260](https://github.com/Koniverse/SubWallet-Extension/issues/3260) | Update UI for the Signature request screen from dApp (#3260) | 1.2.13 | 2024-07-05 | US-30.174 |
| [#3275](https://github.com/Koniverse/SubWallet-Extension/issues/3275) | Fix bug connecting to uquid dapp with Wallet Connect (#3275) | 1.2.16 | 2024-07-19 | US-30.175 |
| [#3300](https://github.com/Koniverse/SubWallet-Extension/issues/3300) | Fix bug transaction has a bad signature when transfer AVL token (#3300) | 1.2.14 | 2024-07-09 | US-30.177 |
| [#3306](https://github.com/Koniverse/SubWallet-Extension/issues/3306) | Update signing flow with metadata (#3306) | 1.3.13 | 2025-01-21 | US-30.178 |
| [#285](https://github.com/Koniverse/SubWallet-Extension/issues/285) | Display 2 popup connect when connect to <https://portal.astar.network>... (#285) | 0.4.3 | 2022-05-31 | US-30.18 |
| [#3363](https://github.com/Koniverse/SubWallet-Extension/issues/3363) | Update connector version (#3363) | 1.2.28 | 2024-09-04 | US-30.181 |
| [#3401](https://github.com/Koniverse/SubWallet-Extension/issues/3401) | Update substrate dApp connect interface to allow dApp connect with EVM account (#3401) | 1.2.28 | 2024-09-04 | US-30.182 |
| [#3445](https://github.com/Koniverse/SubWallet-Extension/issues/3445) | Format error when connecting to dApp (#3445) | 1.2.28 | 2024-09-04 | US-30.184 |
| [#3456](https://github.com/Koniverse/SubWallet-Extension/issues/3456) | Improve UI for case connection unsuccessfully when connect WalletConnect (#3456) | 1.3.53 | 2025-08-12 | US-30.185 |
| [#297](https://github.com/Koniverse/SubWallet-Extension/issues/297) | Fix do not automatically connect account in case create both Substrate & EVM Account (#297) | 0.5.2 | 2022-07-22 | US-30.19 |
| [#3753](https://github.com/Koniverse/SubWallet-Extension/issues/3753) | Add notification when dapp connection but network does not exist (#3753) | 1.3.55 | 2025-09-05 | US-30.192 |
| [#3870](https://github.com/Koniverse/SubWallet-Extension/issues/3870) | Allow Polkadot namespace use EVM address (#3870) | 1.3.9 | 2024-12-09 | US-30.194 |
| [#3901](https://github.com/Koniverse/SubWallet-Extension/issues/3901) | Allow signing once for multiple transactions (#3901) | 1.3.21 | 2025-02-28 | US-30.195 |
| [#4050](https://github.com/Koniverse/SubWallet-Extension/issues/4050) | Fixed bug Unable to estimate fee when signing for dApp (#4050) | 1.3.20 | 2025-02-24 | US-30.200 |
| [#4172](https://github.com/Koniverse/SubWallet-Extension/issues/4172) | Fixed bug getting EVM addresses when connecting to Autonomy (#4172) | 1.3.29 | 2025-04-08 | US-30.201 |
| [#4300](https://github.com/Koniverse/SubWallet-Extension/issues/4300) | Fixed bug Cannot sign transaction when chain connection not be initialized (#4300) | 1.3.35 | 2025-05-09 | US-30.204 |
| [#4320](https://github.com/Koniverse/SubWallet-Extension/issues/4320) | Fixed bug connecting to Aleph Zero EVM dapp (#4320) | 1.3.35 | 2025-05-09 | US-30.206 |
| [#4330](https://github.com/Koniverse/SubWallet-Extension/issues/4330) | Fixed bug when connects to Remix (#4330) | 1.3.37 | 2025-05-23 | US-30.207 |
| [#4353](https://github.com/Koniverse/SubWallet-Extension/issues/4353) | Update Wallet Connector Libraries (#4353) | 1.3.37 | 2025-05-23 | US-30.208 |
| [#4375](https://github.com/Koniverse/SubWallet-Extension/issues/4375) | Fixed bug SubWallet flagged by Avast and blocks connection to Polkadot.js (#4375) | 1.3.48 | 2025-07-21 | US-30.210 |
| [#4377](https://github.com/Koniverse/SubWallet-Extension/issues/4377) | Update UI Connect dApp screen (#4377) | 1.3.41 | 2025-06-11 | US-30.211 |
| [#4401](https://github.com/Koniverse/SubWallet-Extension/issues/4401) | Fix bug error page when connect with dApp (#4401) | 1.3.39 | 2025-05-26 | US-30.212 |
| [#4598](https://github.com/Koniverse/SubWallet-Extension/issues/4598) | Handle case connecting with network systems that do not support WalletConnect connection (#4598) | 1.3.54 | 2025-08-21 | US-30.216 |
| [#355](https://github.com/Koniverse/SubWallet-Extension/issues/355) | Fixed incorrect number of connected accounts displayed on "Manage Website Access" screen in case of "Connect All Accounts" (#355) | 0.5.3 | 2022-07-29 | US-30.24 |
| [#357](https://github.com/Koniverse/SubWallet-Extension/issues/357) | Update new way to interaction with chainId and accounts in EVM Provider (#357) | 0.4.8 | 2022-06-25 | US-30.25 |
| [#358](https://github.com/Koniverse/SubWallet-Extension/issues/358) | Add the checkbox "Auto connect to all EVM DApps after importing" in the Import Private Key screen (#358) | 0.5.4 | 2022-08-05 | US-30.26 |
| [#359](https://github.com/Koniverse/SubWallet-Extension/issues/359) | Some problems with connect with EVM DApp Interface (#359) | 0.4.7 | 2022-06-24 | US-30.27 |
| [#401](https://github.com/Koniverse/SubWallet-Extension/issues/401) | Fixed bug do not display popup connect wallet in case upgrade version (#401) | 0.5.3 | 2022-07-29 | US-30.28 |
| [#469](https://github.com/Koniverse/SubWallet-Extension/issues/469) | Display connection information with DApps (#469) | 0.5.3 | 2022-07-29 | US-30.31 |
| [#498](https://github.com/Koniverse/SubWallet-Extension/issues/498) | Fix bug display wrong connection information with DApps (#498) | 0.5.5 | 2022-08-11 | US-30.33 |
| [#518](https://github.com/Koniverse/SubWallet-Extension/issues/518) | Fix bug not trigger accountChanged when changed account list and submit authList of DApp (#518) | 0.5.6 | 2022-08-24 | US-30.34 |
| [#525](https://github.com/Koniverse/SubWallet-Extension/issues/525) | Fix issues related to QR Signer (#525) | 0.5.7 | 2022-09-06 | US-30.35 |
| [#530](https://github.com/Koniverse/SubWallet-Extension/issues/530) | Fix bug some dApp can't connect to wallet when user close extension (#530) | 0.5.5 | 2022-08-11 | US-30.36 |
| [#687](https://github.com/Koniverse/SubWallet-Extension/issues/687) | Some bugs related to custom tokens when the chain is disconnected (#687) | 0.6.6 | 2022-09-30 | US-30.41 |
| [#751](https://github.com/Koniverse/SubWallet-Extension/issues/751) | Support sending PSP tokens for QR-signer account (#751) | 0.7.2 | 2022-11-19 | US-30.49 |
| [#798](https://github.com/Koniverse/SubWallet-Extension/issues/798) | Update message when having no account to connect to dApp (#798) | 0.7.2 | 2022-11-19 | US-30.52 |
| [#825](https://github.com/Koniverse/SubWallet-Extension/issues/825) | Incorrect navigation when cancel transaction with QR signer account (#825) | 0.7.2 | 2022-11-19 | US-30.55 |
| [#871](https://github.com/Koniverse/SubWallet-Extension/issues/871) | Fix bug don't show the QR code to sign an approved transaction after remembering the password with the QR-signer account (#871) | 0.7.4 | 2022-12-04 | US-30.57 |
| [#889](https://github.com/Koniverse/SubWallet-Extension/issues/889) | Update message when scan QR code with QR signer account in case the account does not exist (#889) | 0.7.5 | 2022-12-15 | US-30.58 |
| [#890](https://github.com/Koniverse/SubWallet-Extension/issues/890) | Update default network for sign message request (#890) | 0.7.5 | 2022-12-15 | US-30.59 |
| [#897](https://github.com/Koniverse/SubWallet-Extension/issues/897) | Fix wrong signature when signing raw with QR Signer account (#897) | 0.7.5 | 2022-12-15 | US-30.60 |
| [#959](https://github.com/Koniverse/SubWallet-Extension/issues/959) | Fix the error when adding a token from dApp (#959) | 0.7.7 | 2022-12-28 | US-30.62 |
| [#1001](https://github.com/Koniverse/SubWallet-Extension/issues/1001) | Fix bug can not connect to AstarEVM (#1001) | 0.8.1 | 2023-02-03 | US-30.63 |
| [#86](https://github.com/Koniverse/SubWallet-Extension/issues/86) | Improve experience when clicking the disconnect icon (issue #86) | 0.3.1 | 2022-04-05 | US-30.7 |
| [#1225](https://github.com/Koniverse/SubWallet-Extension/issues/1225) | Allow DApp access to read-only account (#1225) | 1.0.9 | 2023-06-13 | US-30.70 |
| [#1234](https://github.com/Koniverse/SubWallet-Extension/issues/1234) | Show the alternate title name of Dapp in the Manage website access screen (#1234) | 1.0.4 | 2023-05-12 | US-30.72 |
| [#1301](https://github.com/Koniverse/SubWallet-Extension/issues/1301) | Do not automatically switch the network according to the dApp in case of version upgrade (#1301) | 1.0.4 | 2023-05-12 | US-30.74 |
| [#1351](https://github.com/Koniverse/SubWallet-Extension/issues/1351) | Update Parity Signer logo & name (#1351) | 1.0.5 | 2023-05-21 | US-30.76 |
| [#1384](https://github.com/Koniverse/SubWallet-Extension/issues/1384) | Spelling update (#1384) | 1.0.5 | 2023-05-21 | US-30.76 |
| [#1398](https://github.com/Koniverse/SubWallet-Extension/issues/1398) | Implemented immediate display of the "Add network" screen upon pressing "Add to network" from dApp (#1398) | 1.0.7 | 2023-06-01 | US-30.78 |
| [#1469](https://github.com/Koniverse/SubWallet-Extension/issues/1469) | Improve connection stability (#1469) | 1.0.11 | 2023-06-24 | US-30.81 |
| [#1497](https://github.com/Koniverse/SubWallet-Extension/issues/1497) | Integrate WalletConnect (#1497) | 1.1.1 | 2023-07-06 | US-30.82 |
| [#1529](https://github.com/Koniverse/SubWallet-Extension/issues/1529) | Support add PSP token from dApp (#1529) | 1.1.1 | 2023-07-06 | US-30.84 |
| [#1554](https://github.com/Koniverse/SubWallet-Extension/issues/1554) | Improve connection status (#1554) | 1.1.6 | 2023-08-04 | US-30.85 |
| [#1580](https://github.com/Koniverse/SubWallet-Extension/issues/1580) | Fixed bug show transaction fee on the History detail screen (#1580) | 1.1.1 | 2023-07-06 | US-30.87 |
| [#1626](https://github.com/Koniverse/SubWallet-Extension/issues/1626) | Optimize WalletConnect - Not implement if no connection (#1626) | 1.1.6 | 2023-08-04 | US-30.90 |
| [#1627](https://github.com/Koniverse/SubWallet-Extension/issues/1627) | Support camera for WalletConnect (#1627) | 1.1.2 | 2023-07-14 | US-30.91 |
| [#1670](https://github.com/Koniverse/SubWallet-Extension/issues/1670) | Fix bug signing transaction on Avail (#1670) | 1.1.3 | 2023-07-21 | US-30.92 |
| [#1674](https://github.com/Koniverse/SubWallet-Extension/issues/1674) | Fixed bug signature method handling is not supported for Wallet Connect (#1674) | 1.1.5 | 2023-07-29 | US-30.93 |
| [#1712](https://github.com/Koniverse/SubWallet-Extension/issues/1712) | Allow substrate Dapp subscribe allow access accounts List (#1712) | 1.1.5 | 2023-07-29 | US-30.97 |
| [#4644](https://github.com/Koniverse/SubWallet-Extension/issues/4644) | Apply dry-run to validate bridge step for swap feature (#4644) | 1.3.55 | 2025-09-05 | US-31.100 |
| [#4671](https://github.com/Koniverse/SubWallet-Extension/issues/4671) | Improve Swap validation by Dry-run-preview API from ParaSpell (#4671) | 1.3.67 | 2025-11-13 | US-31.101 |
| [#4826](https://github.com/Koniverse/SubWallet-Extension/issues/4826) | Refactor Swap Service interface and redundant code (#4826) | 1.3.79 | 2026-05-21 | US-31.107 |
| [#4899](https://github.com/Koniverse/SubWallet-Extension/issues/4899) | Support bittensor on-chain swap (#4899) | 1.3.78 | 2026-05-14 | US-31.108 |
| [#2590](https://github.com/Koniverse/SubWallet-Extension/issues/2590) | Fixed bug Unable to connect with eip6763 dApp (#2590) | 1.1.37 | 2024-02-07 | US-31.11 |
| [#2784](https://github.com/Koniverse/SubWallet-Extension/issues/2784) | Add Swap button (#2784) | 1.1.50 | 2024-03-28 | US-31.15 |
| [#2823](https://github.com/Koniverse/SubWallet-Extension/issues/2823) | Implement Swap feature for extension (#2823) | 1.1.55 | 2024-04-14 | US-31.16 |
| [#3007](https://github.com/Koniverse/SubWallet-Extension/issues/3007) | Fixed bug Can't hit the "Confirm" button on ToS of the Swap feature (#3007) | 1.1.62 | 2024-05-08 | US-31.23 |
| [#3104](https://github.com/Koniverse/SubWallet-Extension/issues/3104) | Improve swap quote fetching speed (#3104) | 1.2.3 | 2024-06-03 | US-31.24 |
| [#3272](https://github.com/Koniverse/SubWallet-Extension/issues/3272) | Add support Swap Asset Hub (#3272) | 1.2.14 | 2024-07-09 | US-31.29 |
| [#3453](https://github.com/Koniverse/SubWallet-Extension/issues/3453) | Support XCM channels (#3453) | 1.2.29 | 2024-09-13 | US-31.31 |
| [#3483](https://github.com/Koniverse/SubWallet-Extension/issues/3483) | Add Chainflip broker (#3483) | 1.2.30 | 2024-09-20 | US-31.34 |
| [#3633](https://github.com/Koniverse/SubWallet-Extension/issues/3633) | Add swap pairs for Hydration and ChainFlip (#3633, #3651) | 1.2.31 | 2024-09-28 | US-31.38 |
| [#3651](https://github.com/Koniverse/SubWallet-Extension/issues/3651) | Add swap pairs for Hydration and ChainFlip (#3633, #3651) | 1.2.31 | 2024-09-28 | US-31.38 |
| [#3634](https://github.com/Koniverse/SubWallet-Extension/issues/3634) | Update default slippage for ChainFlip (#3634) | 1.3.2 | 2024-10-12 | US-31.39 |
| [#3855](https://github.com/Koniverse/SubWallet-Extension/issues/3855) | Support swap TAO on SimpleSwap (#3855) | 1.3.11 | 2024-12-23 | US-31.41 |
| [#3933](https://github.com/Koniverse/SubWallet-Extension/issues/3933) | Improve Select provider in Swap feature (#3933) | 1.3.30 | 2025-04-14 | US-31.43 |
| [#3936](https://github.com/Koniverse/SubWallet-Extension/issues/3936) | Extension - Show incorrect network address on XCM confirmation screen when perform Swap, Earning (#3936) | 1.3.80 | 2026-06-02 | US-31.44 |
| [#3977](https://github.com/Koniverse/SubWallet-Extension/issues/3977) | Support Uniswap (#3977) | 1.3.23 | 2025-03-05 | US-31.46 |
| [#3993](https://github.com/Koniverse/SubWallet-Extension/issues/3993) | Error when swap on hydration (#3993) | 1.3.30 | 2025-04-14 | US-31.47 |
| [#4069](https://github.com/Koniverse/SubWallet-Extension/issues/4069) | Improve swap feature (#4069) | 1.3.30 | 2025-04-14 | US-31.49 |
| [#4088](https://github.com/Koniverse/SubWallet-Extension/issues/4088) | Review Uniswap fee (#4088) | 1.3.36 | 2025-05-16 | US-31.52 |
| [#4113](https://github.com/Koniverse/SubWallet-Extension/issues/4113) | Recheck swap quote with asset hub (#4113) | 1.3.30 | 2025-04-14 | US-31.55 |
| [#4141](https://github.com/Koniverse/SubWallet-Extension/issues/4141) | Fixed bug Swap from DOT -> ETH(Arbitrum) (#4141) | 1.3.27 | 2025-03-29 | US-31.56 |
| [#4144](https://github.com/Koniverse/SubWallet-Extension/issues/4144) | Support KyberSwap Aggregator (#4144) | 1.3.36 | 2025-05-16 | US-31.57 |
| [#4204](https://github.com/Koniverse/SubWallet-Extension/issues/4204) | Update New UI for Swap quote (#4204) | 1.3.30 | 2025-04-14 | US-31.61 |
| [#4219](https://github.com/Koniverse/SubWallet-Extension/issues/4219) | Swap support and direct cross-chain swap on more EVM chains (#4219) | 1.3.32 | 2025-04-26 | US-31.64 |
| [#4220](https://github.com/Koniverse/SubWallet-Extension/issues/4220) | Support swap-bridge for EVM chains (#4220) | 1.3.32 | 2025-04-26 | US-31.65 |
| [#4248](https://github.com/Koniverse/SubWallet-Extension/issues/4248) | Fixed bug Error page when perform sign permit from Uniswap (#4248) | 1.3.30 | 2025-04-14 | US-31.67 |
| [#4259](https://github.com/Koniverse/SubWallet-Extension/issues/4259) | Update content in-app for swap (#4259) | 1.3.35 | 2025-05-09 | US-31.68 |
| [#4265](https://github.com/Koniverse/SubWallet-Extension/issues/4265) | Support Asset Hub Testnet swap for Chainflip (#4265) | 1.3.41 | 2025-06-11 | US-31.70 |
| [#4283](https://github.com/Koniverse/SubWallet-Extension/issues/4283) | Support GIGADOT token for Hydration (#4283) | 1.3.31 | 2025-04-18 | US-31.72 |
| [#4293](https://github.com/Koniverse/SubWallet-Extension/issues/4293) | Support UniswapX Dutch Swap (#4293) | 1.3.36 | 2025-05-16 | US-31.73 |
| [#4321](https://github.com/Koniverse/SubWallet-Extension/issues/4321) | Support Bridge-Swap process for cross-chain swap on EVM (#4321) | 1.3.38 | 2025-05-23 | US-31.76 |
| [#4385](https://github.com/Koniverse/SubWallet-Extension/issues/4385) | Update fee for UniSwap (#4385) | 1.3.37 | 2025-05-23 | US-31.81 |
| [#4389](https://github.com/Koniverse/SubWallet-Extension/issues/4389) | Support swap for Unichain (#4389) | 1.3.54 | 2025-08-21 | US-31.83 |
| [#4495](https://github.com/Koniverse/SubWallet-Extension/issues/4495) | Support for New Swap Pairs on Chainflip (#4495) | 1.3.50 | 2025-07-30 | US-31.91 |
| [#4496](https://github.com/Koniverse/SubWallet-Extension/issues/4496) | Integrate Optimex into BTC Swap Flow (#4496) | 1.3.63 | 2025-10-23 | US-31.92 |
| [#4512](https://github.com/Koniverse/SubWallet-Extension/issues/4512) | Update new content to submitted screen when swap (#4512) | 1.3.48 | 2025-07-21 | US-31.93 |
| [#4517](https://github.com/Koniverse/SubWallet-Extension/issues/4517) | Update chain-list stable v0.2.112 (#4517) | 1.3.54 | 2025-08-21 | US-31.94 |
| [#4573](https://github.com/Koniverse/SubWallet-Extension/issues/4573) | Support for Bitcoin swap on ChainFlip (#4573) | 1.3.51 | 2025-07-31 | US-31.95 |
| [#4581](https://github.com/Koniverse/SubWallet-Extension/issues/4581) | Update UX/UI when support Swap for Bitcoin on Chainflip (#4581) | 1.3.53 | 2025-08-12 | US-31.96 |
| [#4593](https://github.com/Koniverse/SubWallet-Extension/issues/4593) | Support bridge tBTC (Ethereum) to tBTC (Hydration) via Snowbridge (#4593) | 1.3.54 | 2025-08-21 | US-31.98 |
| [#11](https://github.com/Koniverse/SubWallet-Extension/issues/11) | Integrate Vara network (#11) | 1.0.5 | 2023-05-21 | US-32.1 |
| [#375](https://github.com/Koniverse/SubWallet-Extension/issues/375) | Not showing crowdloan data properly (#375) | 0.4.7 | 2022-06-24 | US-32.10 |
| [#1726](https://github.com/Koniverse/SubWallet-Extension/issues/1726) | Fixed bug showing staking APY (#1726) | 1.1.8 | 2023-08-12 | US-32.100 |
| [#1728](https://github.com/Koniverse/SubWallet-Extension/issues/1728) | Fixed bug Still show NFT and staking data when turn off all networks (#1728) | 1.1.6 | 2023-08-04 | US-32.101 |
| [#1757](https://github.com/Koniverse/SubWallet-Extension/issues/1757) | Fixed bug Validator avatars are auto-generated continuously (#1757) | 1.1.8 | 2023-08-12 | US-32.105 |
| [#1766](https://github.com/Koniverse/SubWallet-Extension/issues/1766) | Fixed bug showing token price for staking item (Calamari network) (#1766) | 1.1.8 | 2023-08-12 | US-32.106 |
| [#382](https://github.com/Koniverse/SubWallet-Extension/issues/382) | Fix miscalculation of unstaking time (#382) | 0.4.8 | 2022-06-25 | US-32.11 |
| [#1860](https://github.com/Koniverse/SubWallet-Extension/issues/1860) | Fixed bug Do not show status of the crowd loans item (Acala) (#1860) | 1.1.13 | 2023-09-21 | US-32.114 |
| [#1891](https://github.com/Koniverse/SubWallet-Extension/issues/1891) | Support staking in app for Creditcoin (#1891) | 1.1.11 | 2023-09-09 | US-32.117 |
| [#1901](https://github.com/Koniverse/SubWallet-Extension/issues/1901) | Fixed bug Show incorrect message when the minimum active stake is a real number (#1901) | 1.1.12 | 2023-09-15 | US-32.119 |
| [#2020](https://github.com/Koniverse/SubWallet-Extension/issues/2020) | Hide the AutoSelect validator/collator/dApp button if this method is not supported (#2020) | 1.1.20 | 2023-11-04 | US-32.135 |
| [#2035](https://github.com/Koniverse/SubWallet-Extension/issues/2035) | Update crowdloan data (#2035) | 1.1.18 | 2023-10-20 | US-32.136 |
| [#2130](https://github.com/Koniverse/SubWallet-Extension/issues/2130) | Fixed bug display dApp/pool/validator/collator name (#2130) | 1.1.25 | 2023-12-07 | US-32.147 |
| [#2152](https://github.com/Koniverse/SubWallet-Extension/issues/2152) | Support nomination pool for Vara network (#2152) | 1.1.21 | 2023-11-08 | US-32.149 |
| [#2162](https://github.com/Koniverse/SubWallet-Extension/issues/2162) | Fixed bug chainStaking Metadata on Kusama (#2162) | 1.1.22 | 2023-11-15 | US-32.152 |
| [#2181](https://github.com/Koniverse/SubWallet-Extension/issues/2181) | Support staking for Goldberg (#2181) | 1.1.24 | 2023-12-01 | US-32.154 |
| [#2199](https://github.com/Koniverse/SubWallet-Extension/issues/2199) | Fixed bug missing crowdloan (#2199) | 1.1.23 | 2023-11-24 | US-32.158 |
| [#2213](https://github.com/Koniverse/SubWallet-Extension/issues/2213) | Fixed bug showing staking rewards on Moonbeam (#2213) | 1.1.24 | 2023-12-01 | US-32.159 |
| [#2246](https://github.com/Koniverse/SubWallet-Extension/issues/2246) | Improve validator/pool selection UX (#2246) | 1.1.24 | 2023-12-01 | US-32.161 |
| [#2277](https://github.com/Koniverse/SubWallet-Extension/issues/2277) | Fixed bug show staking earning status on Creditcoin (#2277) | 1.1.24 | 2023-12-01 | US-32.163 |
| [#2291](https://github.com/Koniverse/SubWallet-Extension/issues/2291) | The default pool setting for Vara is SubWallet Official (#2291) | 1.1.24 | 2023-12-01 | US-32.165 |
| [#2301](https://github.com/Koniverse/SubWallet-Extension/issues/2301) | Update APY for Vara network (#2301) | 1.1.25 | 2023-12-07 | US-32.167 |
| [#2304](https://github.com/Koniverse/SubWallet-Extension/issues/2304) | Update showing estimated withdrawal time on staking (#2304) | 1.1.25 | 2023-12-07 | US-32.168 |
| [#2324](https://github.com/Koniverse/SubWallet-Extension/issues/2324) | Update top nominators getting rewards (#2324) | 1.1.26 | 2023-12-16 | US-32.169 |
| [#2370](https://github.com/Koniverse/SubWallet-Extension/issues/2370) | Update API staking for Astar (#2370) | 1.1.27 | 2023-12-20 | US-32.174 |
| [#2385](https://github.com/Koniverse/SubWallet-Extension/issues/2385) | Add Azero Domains is default pool (#2385) | 1.1.27 | 2023-12-20 | US-32.176 |
| [#520](https://github.com/Koniverse/SubWallet-Extension/issues/520) | Integrate Auto-Compound Staking Reward API for Turing Network (#520) | 0.6.6 | 2022-09-30 | US-32.18 |
| [#2487](https://github.com/Koniverse/SubWallet-Extension/issues/2487) | Fixed bug Do not show banner on Crowdloans tab (#2487) | 1.1.32 | 2024-01-15 | US-32.184 |
| [#2492](https://github.com/Koniverse/SubWallet-Extension/issues/2492) | Add support in-app staking for KREST (#2492) | 1.1.33 | 2024-01-23 | US-32.185 |
| [#2497](https://github.com/Koniverse/SubWallet-Extension/issues/2497) | Change "Claim rewards" to "Check rewards" for dApp staking (#2497) | 1.1.34 | 2024-02-01 | US-32.186 |
| [#2505](https://github.com/Koniverse/SubWallet-Extension/issues/2505) | Support TAO in-app staking (#2505) | 1.3.2 | 2024-10-12 | US-32.190 |
| [#2513](https://github.com/Koniverse/SubWallet-Extension/issues/2513) | Update Manta staking APY formula (#2513) | 1.1.42 | 2024-03-08 | US-32.191 |
| [#2533](https://github.com/Koniverse/SubWallet-Extension/issues/2533) | Set up SubWallet validators (#2533) | 1.3.12 | 2025-01-06 | US-32.194 |
| [#2544](https://github.com/Koniverse/SubWallet-Extension/issues/2544) | Update unstaking request info for KREST, AMPE (#2544) | 1.1.34 | 2024-02-01 | US-32.197 |
| [#2545](https://github.com/Koniverse/SubWallet-Extension/issues/2545) | Add popup want to user claim reward when Astar update dApp staking v3 (#2545) | 1.1.34 | 2024-02-01 | US-32.198 |
| [#555](https://github.com/Koniverse/SubWallet-Extension/issues/555) | Fix some issues related to "minimum stake" in cases stake more and unstake (#555) | 0.5.6 | 2022-08-24 | US-32.20 |
| [#2563](https://github.com/Koniverse/SubWallet-Extension/issues/2563) | Update staking APY formula for relaychain (#2563) | 1.1.36 | 2024-02-06 | US-32.201 |
| [#2578](https://github.com/Koniverse/SubWallet-Extension/issues/2578) | Set pool default for Aleph Zero (#2578) | 1.1.35 | 2024-02-02 | US-32.206 |
| [#2581](https://github.com/Koniverse/SubWallet-Extension/issues/2581) | Fixed bug showing withdrawal time on un-staking (#2581) | 1.1.41 | 2024-03-02 | US-32.207 |
| [#2594](https://github.com/Koniverse/SubWallet-Extension/issues/2594) | Update position and options actions for Astar Staking DApp (#2594) | 1.1.36 | 2024-02-06 | US-32.208 |
| [#2598](https://github.com/Koniverse/SubWallet-Extension/issues/2598) | Fixed bug related to earning feature (#2598) | 1.1.39 | 2024-02-24 | US-32.209 |
| [#567](https://github.com/Koniverse/SubWallet-Extension/issues/567) | Fix staking data UI error (#567) | 0.5.6 | 2022-08-24 | US-32.21 |
| [#2599](https://github.com/Koniverse/SubWallet-Extension/issues/2599) | Add popup Introducing Earning feature (#2599) | 1.1.37 | 2024-02-07 | US-32.210 |
| [#2612](https://github.com/Koniverse/SubWallet-Extension/issues/2612) | Fixed bug showing positions (#2612) | 1.1.39 | 2024-02-24 | US-32.211 |
| [#2622](https://github.com/Koniverse/SubWallet-Extension/issues/2622) | Turn off popup remind claim rewards for dApp staking (#2622) | 1.1.39 | 2024-02-24 | US-32.213 |
| [#2632](https://github.com/Koniverse/SubWallet-Extension/issues/2632) | Update filtering out blocked validators (#2632) | 1.1.39 | 2024-02-24 | US-32.215 |
| [#2636](https://github.com/Koniverse/SubWallet-Extension/issues/2636) | Optimize Earning Performance Round 2 (Caching most of data) (#2636) | 1.1.41 | 2024-03-02 | US-32.216 |
| [#568](https://github.com/Koniverse/SubWallet-Extension/issues/568) | Fix bug parsing Acala crowdloan data (#568) | 0.5.6 | 2022-08-24 | US-32.22 |
| [#2655](https://github.com/Koniverse/SubWallet-Extension/issues/2655) | Fix bug related to Aleph Zero transfer and staking (#2655) | 1.1.57 | 2024-04-23 | US-32.221 |
| [#2678](https://github.com/Koniverse/SubWallet-Extension/issues/2678) | Update pool default for VARA (#2678) | 1.1.40 | 2024-02-29 | US-32.224 |
| [#2680](https://github.com/Koniverse/SubWallet-Extension/issues/2680) | Fixed bug related to earning feature (#2680) | 1.1.61 | 2024-05-02 | US-32.225 |
| [#2682](https://github.com/Koniverse/SubWallet-Extension/issues/2682) | Re-check case update data after performing actions (unstake, cancel unstake, withdraw) (#2682) | 1.1.41 | 2024-03-02 | US-32.226 |
| [#2703](https://github.com/Koniverse/SubWallet-Extension/issues/2703) | Adjust showing/validating address on Earning actions (#2703) | 1.2.29 | 2024-09-13 | US-32.228 |
| [#2781](https://github.com/Koniverse/SubWallet-Extension/issues/2781) | Support Mission Pool for Extension (#2781) | 1.1.46 | 2024-03-22 | US-32.231 |
| [#2742](https://github.com/Koniverse/SubWallet-Extension/issues/2742) | Fixed bug show earnings screen although back to home (#2742) | 1.1.52 | 2024-04-05 | US-32.234 |
| [#2743](https://github.com/Koniverse/SubWallet-Extension/issues/2743) | Disallow staking to collators/pools that maxed out member threshold (#2743, 2754) | 1.1.62 | 2024-05-08 | US-32.235 |
| [#2821](https://github.com/Koniverse/SubWallet-Extension/issues/2821) | Fixed bug Error getting wrong validator address (#2821) | 1.1.62 | 2024-05-08 | US-32.239 |
| [#636](https://github.com/Koniverse/SubWallet-Extension/issues/636) | Add staking for $CAPS and add support for Ternoa's testnet Alphanet (#636) | 0.6.6 | 2022-09-30 | US-32.24 |
| [#2827](https://github.com/Koniverse/SubWallet-Extension/issues/2827) | Improve UX UI for earning feature (#2827) | 1.1.52 | 2024-04-05 | US-32.241 |
| [#2829](https://github.com/Koniverse/SubWallet-Extension/issues/2829) | Update withdraw time for parachain staking (#2829) | 1.1.51 | 2024-04-02 | US-32.242 |
| [#2830](https://github.com/Koniverse/SubWallet-Extension/issues/2830) | Update withdraw time for Parachain (#2830) | 1.1.56 | 2024-04-19 | US-32.243 |
| [#2847](https://github.com/Koniverse/SubWallet-Extension/issues/2847) | Update message when navigate user to the Astar portal to stake (#2847) | 1.1.52 | 2024-04-05 | US-32.246 |
| [#2889](https://github.com/Koniverse/SubWallet-Extension/issues/2889) | Fixed bug show minimum active stake (#2889) | 1.1.55 | 2024-04-14 | US-32.251 |
| [#2937](https://github.com/Koniverse/SubWallet-Extension/issues/2937) | Fixed bug parsing Earning status for Nomination pool (#2937) | 1.1.56 | 2024-04-19 | US-32.253 |
| [#2940](https://github.com/Koniverse/SubWallet-Extension/issues/2940) | Display list Recommended by label in Select pool screen (#2940) | 1.1.62 | 2024-05-08 | US-32.255 |
| [#2941](https://github.com/Koniverse/SubWallet-Extension/issues/2941) | Fix issue related to earning status (#2941) | 1.1.57 | 2024-04-23 | US-32.256 |
| [#2948](https://github.com/Koniverse/SubWallet-Extension/issues/2948) | Hide popup Introducing Earning feature (#2948) | 1.1.61 | 2024-05-02 | US-32.257 |
| [#2963](https://github.com/Koniverse/SubWallet-Extension/issues/2963) | Support staking for Avail Turing (#2963) | 1.1.59 | 2024-04-25 | US-32.258 |
| [#2971](https://github.com/Koniverse/SubWallet-Extension/issues/2971) | Set default pool for Avail Turing (#2971) | 1.1.60 | 2024-04-29 | US-32.259 |
| [#648](https://github.com/Koniverse/SubWallet-Extension/issues/648) | Handle estimated fee error on NFT sending + staking (#648) | 0.6.5 | 2022-09-24 | US-32.26 |
| [#2995](https://github.com/Koniverse/SubWallet-Extension/issues/2995) | Fixed bug related to earning feature ( Round 5) (#2995) | 1.2.6 | 2024-06-19 | US-32.261 |
| [#2998](https://github.com/Koniverse/SubWallet-Extension/issues/2998) | Update Validator name/ Collator name (#2998) | 1.1.62 | 2024-05-08 | US-32.263 |
| [#3000](https://github.com/Koniverse/SubWallet-Extension/issues/3000) | Refactoring code earning service (#3000) | 1.2.5 | 2024-06-11 | US-32.264 |
| [#3001](https://github.com/Koniverse/SubWallet-Extension/issues/3001) | Fixed error auto reset data on Pool field (#3001) | 1.3.6 | 2024-11-07 | US-32.265 |
| [#3005](https://github.com/Koniverse/SubWallet-Extension/issues/3005) | Fixed bug Don't display network on Mission pool details (#3005) | 1.1.62 | 2024-05-08 | US-32.267 |
| [#653](https://github.com/Koniverse/SubWallet-Extension/issues/653) | Add support staking for Amplitude/Kilt (#653) | 0.7.2 | 2022-11-19 | US-32.27 |
| [#3043](https://github.com/Koniverse/SubWallet-Extension/issues/3043) | Show nomination pool with block status (#3043) | 1.2.6 | 2024-06-19 | US-32.272 |
| [#3127](https://github.com/Koniverse/SubWallet-Extension/issues/3127) | Update UI for Earning position details (#3127) | 1.2.2 | 2024-05-30 | US-32.276 |
| [#3150](https://github.com/Koniverse/SubWallet-Extension/issues/3150) | Update some message related to earning feature (#3150) | 1.2.4 | 2024-06-08 | US-32.278 |
| [#3197](https://github.com/Koniverse/SubWallet-Extension/issues/3197) | Check error logs in earning feature (#3197) | 1.2.6 | 2024-06-19 | US-32.280 |
| [#3289](https://github.com/Koniverse/SubWallet-Extension/issues/3289) | Fix bug Cannot read properties of undefined (reading 'filter') related to Mission pool (#3289) | 1.2.14 | 2024-07-09 | US-32.284 |
| [#3326](https://github.com/Koniverse/SubWallet-Extension/issues/3326) | Improve the staking reward information retrieval (#3326) | 1.2.16 | 2024-07-19 | US-32.287 |
| [#3327](https://github.com/Koniverse/SubWallet-Extension/issues/3327) | Fix bug Show incorrect withdrawal information of the Bifrost liquid staking when all accounts mode (#3327) | 1.2.22 | 2024-07-31 | US-32.288 |
| [#690](https://github.com/Koniverse/SubWallet-Extension/issues/690) | Support claim reward feature for QR Account (#690) | 0.7.2 | 2022-11-19 | US-32.29 |
| [#3365](https://github.com/Koniverse/SubWallet-Extension/issues/3365) | Set default pool and default validator for Avail (#3365) | 1.2.17 | 2024-07-22 | US-32.291 |
| [#3443](https://github.com/Koniverse/SubWallet-Extension/issues/3443) | Update balance calculation for nomination pool runtime update (#3443) | 1.2.25 | 2024-08-17 | US-32.294 |
| [#3477](https://github.com/Koniverse/SubWallet-Extension/issues/3477) | Add warning in case user earn for both nomination pool and direct (#3477) | 1.2.28 | 2024-09-04 | US-32.297 |
| [#3484](https://github.com/Koniverse/SubWallet-Extension/issues/3484) | Add Notice of need to unstake for users who are simultaneously staking for both Direct and Nomination Pool (#3484) | 1.2.28 | 2024-09-04 | US-32.298 |
| [#705](https://github.com/Koniverse/SubWallet-Extension/issues/705) | Do not show crowdloan status (#705) | 0.6.7 | 2022-10-22 | US-32.30 |
| [#3579](https://github.com/Koniverse/SubWallet-Extension/issues/3579) | Fix bug do not show lock balance in case account have Kusama nomination pool (#3579) | 1.2.29 | 2024-09-13 | US-32.305 |
| [#3601](https://github.com/Koniverse/SubWallet-Extension/issues/3601) | Fix bug display wrong APY for Polkadot staking option (#3601) | 1.2.29 | 2024-09-13 | US-32.306 |
| [#3778](https://github.com/Koniverse/SubWallet-Extension/issues/3778) | Update content on unstake screen for some earning options (#3778) | 1.3.11 | 2024-12-23 | US-32.312 |
| [#3788](https://github.com/Koniverse/SubWallet-Extension/issues/3788) | Fix min stake for TAO(Bittensor) (#3788) | 1.3.3 | 2024-10-16 | US-32.313 |
| [#3930](https://github.com/Koniverse/SubWallet-Extension/issues/3930) | Fixed min amount on popup Pay attention in case there is not enough balance to stake (#3930) | 1.3.55 | 2025-09-05 | US-32.317 |
| [#3971](https://github.com/Koniverse/SubWallet-Extension/issues/3971) | Fix bug setup validator related maxCount (#3971) | 1.3.13 | 2025-01-21 | US-32.318 |
| [#3972](https://github.com/Koniverse/SubWallet-Extension/issues/3972) | Fixed bug Show incorrect pool/validator when earning on All accounts mode (#3972) | 1.3.56 | 2025-09-11 | US-32.319 |
| [#717](https://github.com/Koniverse/SubWallet-Extension/issues/717) | Can't unstake, withdraw on parachain when using a QR signer account (#717) | 0.6.7 | 2022-10-22 | US-32.32 |
| [#3984](https://github.com/Koniverse/SubWallet-Extension/issues/3984) | Support staking for Mythos (#3984) | 1.3.22 | 2025-03-04 | US-32.320 |
| [#4006](https://github.com/Koniverse/SubWallet-Extension/issues/4006) | Fix bug Do not show earning position for Bittensor (#4006) | 1.3.15 | 2025-02-06 | US-32.321 |
| [#4036](https://github.com/Koniverse/SubWallet-Extension/issues/4036) | Support dTAO staking (#4036) | 1.3.25 | 2025-03-24 | US-32.322 |
| [#4054](https://github.com/Koniverse/SubWallet-Extension/issues/4054) | Fix Bug when unstaking vDOT, vMANTA (#4054) | 1.3.23 | 2025-03-05 | US-32.323 |
| [#4140](https://github.com/Koniverse/SubWallet-Extension/issues/4140) | Fixed bug related to subnet staking feature (#4140) | 1.3.28 | 2025-04-02 | US-32.324 |
| [#4145](https://github.com/Koniverse/SubWallet-Extension/issues/4145) | Support custom slippage for TAO subnet staking (#4145) | 1.3.30 | 2025-04-14 | US-32.325 |
| [#4214](https://github.com/Koniverse/SubWallet-Extension/issues/4214) | Support Change validator feature (#4214) | 1.3.48 | 2025-07-21 | US-32.328 |
| [#4217](https://github.com/Koniverse/SubWallet-Extension/issues/4217) | Add APY information for TAO and dTao staking (#4217) | 1.3.30 | 2025-04-14 | US-32.329 |
| [#719](https://github.com/Koniverse/SubWallet-Extension/issues/719) | Update the "expected return" to staking for some chain (#719) | 0.6.8 | 2022-10-31 | US-32.33 |
| [#4224](https://github.com/Koniverse/SubWallet-Extension/issues/4224) | Fixed bug when perform stake on Moonbase/Moonbeam/Moonriver (#4224) | 1.3.43 | 2025-06-26 | US-32.330 |
| [#4287](https://github.com/Koniverse/SubWallet-Extension/issues/4287) | Fixed bug when stake for subnet (#4287) | 1.3.32 | 2025-04-26 | US-32.333 |
| [#4290](https://github.com/Koniverse/SubWallet-Extension/issues/4290) | Change TAO's position in Earning options (#4290) | 1.3.32 | 2025-04-26 | US-32.334 |
| [#4359](https://github.com/Koniverse/SubWallet-Extension/issues/4359) | Stake TAO with Seamless Validator Switching (#4359) | 1.3.48 | 2025-07-21 | US-32.335 |
| [#4441](https://github.com/Koniverse/SubWallet-Extension/issues/4441) | Fixed bug navigating actions in Earning feature (#4441) | 1.3.41 | 2025-06-11 | US-32.336 |
| [#4449](https://github.com/Koniverse/SubWallet-Extension/issues/4449) | Display On-Chain Identity for Validators (#4449) | 1.3.49 | 2025-07-28 | US-32.337 |
| [#724](https://github.com/Koniverse/SubWallet-Extension/issues/724) | Infinite load when stake/unstake in the following cases (#724) | 0.6.8 | 2022-10-31 | US-32.34 |
| [#4510](https://github.com/Koniverse/SubWallet-Extension/issues/4510) | Fixed bug when stake/unstake with subnet staking (#4510) | 1.3.48 | 2025-07-21 | US-32.340 |
| [#4520](https://github.com/Koniverse/SubWallet-Extension/issues/4520) | Refactor TAO earning position logic (#4520) | 1.3.52 | 2025-08-07 | US-32.341 |
| [#4539](https://github.com/Koniverse/SubWallet-Extension/issues/4539) | Update some UI for Change validator feature (#4539) | 1.3.53 | 2025-08-12 | US-32.342 |
| [#4540](https://github.com/Koniverse/SubWallet-Extension/issues/4540) | Support Change validator for more chains (#4540) | 1.3.54 | 2025-08-21 | US-32.343 |
| [#4551](https://github.com/Koniverse/SubWallet-Extension/issues/4551) | Update logo for subnet on Earning features (#4551, #4626) | 1.3.54 | 2025-08-21 | US-32.344 |
| [#4626](https://github.com/Koniverse/SubWallet-Extension/issues/4626) | Update logo for subnet on Earning features (#4551, #4626) | 1.3.54 | 2025-08-21 | US-32.344 |
| [#4604](https://github.com/Koniverse/SubWallet-Extension/issues/4604) | Update TAO staking fee (#4604) | 1.3.54 | 2025-08-21 | US-32.347 |
| [#4638](https://github.com/Koniverse/SubWallet-Extension/issues/4638) | Add support for in-app EWT staking (#4638) | 1.3.57 | 2025-09-17 | US-32.348 |
| [#4654](https://github.com/Koniverse/SubWallet-Extension/issues/4654) | Fixed TAO's position in Earning options (#4654) | 1.3.56 | 2025-09-11 | US-32.349 |
| [#743](https://github.com/Koniverse/SubWallet-Extension/issues/743) | Error when use stake action on Turing Staging/ Turing network with QR signer account (#743) | 0.7.2 | 2022-11-19 | US-32.35 |
| [#4666](https://github.com/Koniverse/SubWallet-Extension/issues/4666) | Add support for in-app TANSSI staking (#4666) | 1.3.63 | 2025-10-23 | US-32.350 |
| [#4688](https://github.com/Koniverse/SubWallet-Extension/issues/4688) | [zkVerify Mainnet] Add support for in-app VFY staking (#4688) | 1.3.60 | 2025-10-02 | US-32.352 |
| [#4694](https://github.com/Koniverse/SubWallet-Extension/issues/4694) | Fixed error when performing EWC staking (#4694) | 1.3.60 | 2025-10-02 | US-32.353 |
| [#4731](https://github.com/Koniverse/SubWallet-Extension/issues/4731) | Fixed crash in EarningPositions when asset is undefined (read property 'decimals' of undefined) in case update version (#4731) | 1.3.61 | 2025-10-04 | US-32.354 |
| [#4752](https://github.com/Koniverse/SubWallet-Extension/issues/4752) | Update Earning Info config for migrated chain after AHM (#4752) | 1.3.63 | 2025-10-23 | US-32.355 |
| [#4754](https://github.com/Koniverse/SubWallet-Extension/issues/4754) | Fixed some UI bugs for migrated chain after AHM on Earning features (#4754) | 1.3.62 | 2025-10-10 | US-32.356 |
| [#4763](https://github.com/Koniverse/SubWallet-Extension/issues/4763) | Fixed bug show Earning options for Kusama although AHM migrated (#4763) | 1.3.62 | 2025-10-10 | US-32.357 |
| [#755](https://github.com/Koniverse/SubWallet-Extension/issues/755) | Support staking for KMA (Calamari parachain) (#755) | 0.6.9 | 2022-11-04 | US-32.36 |
| [#4795](https://github.com/Koniverse/SubWallet-Extension/issues/4795) | Add Collator's APY for Tanssi Staking (#4795) | 1.3.65 | 2025-11-06 | US-32.360 |
| [#4803](https://github.com/Koniverse/SubWallet-Extension/issues/4803) | Calculate exactly estimate fee for bridge step in liquid staking (#4803) | 1.3.78 | 2026-05-14 | US-32.361 |
| [#4813](https://github.com/Koniverse/SubWallet-Extension/issues/4813) | Update altinputasset for some liquid staking (#4813) | 1.3.65 | 2025-11-06 | US-32.363 |
| [#4829](https://github.com/Koniverse/SubWallet-Extension/issues/4829) | Support the newly updated Root staking feature \| Bittensor (#4829) | 1.3.76 | 2026-03-20 | US-32.364 |
| [#4920](https://github.com/Koniverse/SubWallet-Extension/issues/4920) | Remove the Crowdloans tab (#4920) | 1.3.73 | 2026-01-22 | US-32.369 |
| [#4950](https://github.com/Koniverse/SubWallet-Extension/issues/4950) | Fix bug get Earning position parachain (#4950) | 1.3.73 | 2026-01-22 | US-32.370 |
| [#801](https://github.com/Koniverse/SubWallet-Extension/issues/801) | Support staking for Shiden (#801) | 0.7.2 | 2022-11-19 | US-32.38 |
| [#804](https://github.com/Koniverse/SubWallet-Extension/issues/804) | Fix other bug in case unstake (#804) | 0.7.3 | 2022-11-25 | US-32.39 |
| [#809](https://github.com/Koniverse/SubWallet-Extension/issues/809) | Error withdrawing stake with slashing spans (#809) | 0.7.2 | 2022-11-19 | US-32.40 |
| [#824](https://github.com/Koniverse/SubWallet-Extension/issues/824) | Minor bugs on staking (#824) | 0.7.2 | 2022-11-19 | US-32.41 |
| [#838](https://github.com/Koniverse/SubWallet-Extension/issues/838) | Can not sign the Claim reward transaction with QR-signer account (#838) | 0.7.2 | 2022-11-19 | US-32.43 |
| [#845](https://github.com/Koniverse/SubWallet-Extension/issues/845) | Show incorrect screen when re-open the extension after staking successfully (#845) | 0.7.3 | 2022-11-25 | US-32.44 |
| [#849](https://github.com/Koniverse/SubWallet-Extension/issues/849) | Do not show message when staking record does not exist yet (#849) | 0.7.3 | 2022-11-25 | US-32.45 |
| [#865](https://github.com/Koniverse/SubWallet-Extension/issues/865) | Remove EVM crowdloan record (#865) | 0.7.3 | 2022-11-25 | US-32.46 |
| [#867](https://github.com/Koniverse/SubWallet-Extension/issues/867) | Support claim staking reward for Amplitude (#867) | 0.7.4 | 2022-12-04 | US-32.47 |
| [#884](https://github.com/Koniverse/SubWallet-Extension/issues/884) | Fix bug don't show validator on the Amplitude network and update expected return (#884) | 0.7.4 | 2022-12-04 | US-32.49 |
| [#907](https://github.com/Koniverse/SubWallet-Extension/issues/907) | Fix showing incorrect Unclaim reward information on "All Accounts" mode (#907) | 0.7.5 | 2022-12-15 | US-32.50 |
| [#932](https://github.com/Koniverse/SubWallet-Extension/issues/932) | Showing crowdloan contribution in case the network is not live yet (#932) | 0.7.6 | 2022-12-17 | US-32.51 |
| [#933](https://github.com/Koniverse/SubWallet-Extension/issues/933) | Add support for $AZERO nomination pool staking (Aleph Zero) (#933) | 0.7.6 | 2022-12-17 | US-32.52 |
| [#991](https://github.com/Koniverse/SubWallet-Extension/issues/991) | Fix duplicate crowdloan problems (#991) | 0.8.1 | 2023-02-03 | US-32.55 |
| [#997](https://github.com/Koniverse/SubWallet-Extension/issues/997) | Fix the staking validator's expected return for relaychain (#997) | 0.8.1 | 2023-02-03 | US-32.56 |
| [#104](https://github.com/Koniverse/SubWallet-Extension/issues/104) | Add Moonbeam and Moonriver staking data (#104) | 0.4.2 | 2022-05-20 | US-32.6 |
| [#1108](https://github.com/Koniverse/SubWallet-Extension/issues/1108) | Fixed the bug in calculating Ternoa Staking APR (#1108) | 1.0.7 | 2023-06-01 | US-32.64 |
| [#1263](https://github.com/Koniverse/SubWallet-Extension/issues/1263) | Update fetching staking info with middleware service (#1263) | 1.0.3 | 2023-05-06 | US-32.70 |
| [#1311](https://github.com/Koniverse/SubWallet-Extension/issues/1311) | Added support for "Unstake Max" functionality (#1311) | 1.0.7 | 2023-06-01 | US-32.72 |
| [#1346](https://github.com/Koniverse/SubWallet-Extension/issues/1346) | Fixed bug the address validator auto detect to Substrate address (#1346) | 1.0.5 | 2023-05-21 | US-32.76 |
| [#1353](https://github.com/Koniverse/SubWallet-Extension/issues/1353) | Fixed bug get balance when import multi-account (#1353) | 1.0.5 | 2023-05-21 | US-32.77 |
| [#1392](https://github.com/Koniverse/SubWallet-Extension/issues/1392) | Fix bug when stake (#1392) | 1.0.6 | 2023-05-26 | US-32.78 |
| [#1396](https://github.com/Koniverse/SubWallet-Extension/issues/1396) | Fixed bug showing min pooled amount (#1396) | 1.0.5 | 2023-05-21 | US-32.79 |
| [#1432](https://github.com/Koniverse/SubWallet-Extension/issues/1432) | Fix bug show unclaim reward (#1432) | 1.0.6 | 2023-05-26 | US-32.81 |
| [#1456](https://github.com/Koniverse/SubWallet-Extension/issues/1456) | Fixed bug Show incorrect earning reward status on All accounts mode (#1456) | 1.1.2 | 2023-07-14 | US-32.84 |
| [#1461](https://github.com/Koniverse/SubWallet-Extension/issues/1461) | Optimized staking performance (#1461) | 1.0.7 | 2023-06-01 | US-32.85 |
| [#1470](https://github.com/Koniverse/SubWallet-Extension/issues/1470) | Fixed the bug causing failure to stake more for a pool in cases where an unstake request was present (#1470) | 1.0.7 | 2023-06-01 | US-32.87 |
| [#1475](https://github.com/Koniverse/SubWallet-Extension/issues/1475) | Fixed bugs on the Staking screens (#1475) | 1.1.1 | 2023-07-06 | US-32.89 |
| [#1496](https://github.com/Koniverse/SubWallet-Extension/issues/1496) | Fixed bug Do not show validator on the Select validator screen in case turn on network when stake (#1496) | 1.1.6 | 2023-08-04 | US-32.91 |
| [#1537](https://github.com/Koniverse/SubWallet-Extension/issues/1537) | Update showing min stake value (#1537) | 1.1.6 | 2023-08-04 | US-32.92 |
| [#1545](https://github.com/Koniverse/SubWallet-Extension/issues/1545) | Implement reload button on the Staking screen (#1545) | 1.1.2 | 2023-07-14 | US-32.93 |
| [#1595](https://github.com/Koniverse/SubWallet-Extension/issues/1595) | Add Staking Support For Pendulum (#1595) | 1.1.2 | 2023-07-14 | US-32.94 |
| [#1634](https://github.com/Koniverse/SubWallet-Extension/issues/1634) | Updated the criteria's icon on the Sorting pool/validator/collator/dApp screen (#1634) | 1.1.2 | 2023-07-14 | US-32.95 |
| [#1643](https://github.com/Koniverse/SubWallet-Extension/issues/1643) | Fixed bug Showing staking account on the Staking detail screen (#1643) | 1.1.6 | 2023-08-04 | US-32.96 |
| [#1721](https://github.com/Koniverse/SubWallet-Extension/issues/1721) | Fixed bug Do not reset selected validator when change token to stake (#1721) | 1.1.6 | 2023-08-04 | US-32.99 |
| [#411](https://github.com/Koniverse/SubWallet-Extension/issues/411) | Update XCM transfer support for Relaychain to Parachains (#411) | 0.5.5 | 2022-08-11 | US-33.10 |
| [#4787](https://github.com/Koniverse/SubWallet-Extension/issues/4787) | Update params for XCM transfer - Related to DOT/KSM XCM (#4787) | 1.3.63 | 2025-10-23 | US-33.101 |
| [#4822](https://github.com/Koniverse/SubWallet-Extension/issues/4822) | Re-enable Cross-chain transfer related to Relay-chain (#4822) | 1.3.66 | 2025-11-07 | US-33.102 |
| [#4830](https://github.com/Koniverse/SubWallet-Extension/issues/4830) | Re-check logic approve token when perform XCM (#4830) | 1.3.80 | 2026-06-02 | US-33.103 |
| [#4901](https://github.com/Koniverse/SubWallet-Extension/issues/4901) | Bridge native TAO <-> Subtensor EVM (#4901) | 1.3.78 | 2026-05-14 | US-33.105 |
| [#552](https://github.com/Koniverse/SubWallet-Extension/issues/552) | Fix support Xcm transfer on Kusama, Polkadot, Astar, Shiden chain for QR Account (#552) | 0.5.7 | 2022-09-06 | US-33.16 |
| [#586](https://github.com/Koniverse/SubWallet-Extension/issues/586) | Fix issue display lack of transaction history when user performs xcm transfer#586 | 0.5.7 | 2022-09-06 | US-33.18 |
| [#621](https://github.com/Koniverse/SubWallet-Extension/issues/621) | Integrate Bit.Country Token and XCM (#621) | 0.6.1 | 2022-09-13 | US-33.19 |
| [#684](https://github.com/Koniverse/SubWallet-Extension/issues/684) | Support transfer and XCM for Statemine/Statemint (#684) | 0.6.8 | 2022-10-31 | US-33.22 |
| [#695](https://github.com/Koniverse/SubWallet-Extension/issues/695) | Enable xcm transfer for Acala chain (#695) | 0.6.7 | 2022-10-22 | US-33.23 |
| [#945](https://github.com/Koniverse/SubWallet-Extension/issues/945) | Fix XCM transfer feature for the some chain (#945) | 0.7.7 | 2022-12-28 | US-33.25 |
| [#1000](https://github.com/Koniverse/SubWallet-Extension/issues/1000) | Fix bug XCM for Moonbeam, Bifrost Kusama (#1000) | 0.8.2 | 2023-03-15 | US-33.26 |
| [#1094](https://github.com/Koniverse/SubWallet-Extension/issues/1094) | Add XCM for Kusama --> Statemint (#1094) | 0.8.3 | 2023-03-29 | US-33.28 |
| [#1352](https://github.com/Koniverse/SubWallet-Extension/issues/1352) | Add support for USDT on more chains and update param for XCM on Astar (#1352) | 1.0.8 | 2023-06-08 | US-33.33 |
| [#1440](https://github.com/Koniverse/SubWallet-Extension/issues/1440) | Temporarily hide XCM channels from Moonbeam (#1440) | 1.0.6 | 2023-05-26 | US-33.36 |
| [#1457](https://github.com/Koniverse/SubWallet-Extension/issues/1457) | Add support new XCM channels (#1457) | 1.3.55 | 2025-09-05 | US-33.37 |
| [#1499](https://github.com/Koniverse/SubWallet-Extension/issues/1499) | Fixed bug Don’t show send history in case xcm on same account (#1499) | 1.0.8 | 2023-06-08 | US-33.38 |
| [#1505](https://github.com/Koniverse/SubWallet-Extension/issues/1505) | Fixed bug error page when perform XCM on Firefox browser (#1505) | 1.0.8 | 2023-06-08 | US-33.39 |
| [#35](https://github.com/Koniverse/SubWallet-Extension/issues/35) | Support Send / Receive cross-chain assets (update some label and variablea and xc logo) (#35) | 0.4.5 | 2022-06-09 | US-33.4 |
| [#1546](https://github.com/Koniverse/SubWallet-Extension/issues/1546) | Re-check and update XCM feature for some chains: Polkadot, Statemint, Statemine, Bifrost Polkadot (#1546) | 1.0.10 | 2023-06-17 | US-33.40 |
| [#1550](https://github.com/Koniverse/SubWallet-Extension/issues/1550) | Fixed bug Show incorrect Destination Chain fee on XCM history detail (#1550) | 1.0.10 | 2023-06-17 | US-33.41 |
| [#1579](https://github.com/Koniverse/SubWallet-Extension/issues/1579) | Update XCM for Astar, Interlay, HydraDX (#1579) | 1.1.1 | 2023-07-06 | US-33.43 |
| [#1984](https://github.com/Koniverse/SubWallet-Extension/issues/1984) | Support SnowBridge (#1984) | 1.2.9 | 2024-06-24 | US-33.45 |
| [#2091](https://github.com/Koniverse/SubWallet-Extension/issues/2091) | Fixed bug XCM transfer USDT (Parallel —> Statemint) (#2091) | 1.1.20 | 2023-11-04 | US-33.46 |
| [#2196](https://github.com/Koniverse/SubWallet-Extension/issues/2196) | Update XCM for Astar network (#2196) | 1.1.23 | 2023-11-24 | US-33.48 |
| [#2353](https://github.com/Koniverse/SubWallet-Extension/issues/2353) | Support some XCM transfer (#2353) | 1.1.26 | 2023-12-16 | US-33.50 |
| [#2604](https://github.com/Koniverse/SubWallet-Extension/issues/2604) | Support Rococo asset hub (#2604) | 1.1.41 | 2024-03-02 | US-33.54 |
| [#2786](https://github.com/Koniverse/SubWallet-Extension/issues/2786) | Add support XCM for PINK token (#2786) | 1.1.47 | 2024-03-23 | US-33.56 |
| [#2814](https://github.com/Koniverse/SubWallet-Extension/issues/2814) | Fixed bug when performing XCM transfer on Kusama (#2814) | 1.1.49 | 2024-03-26 | US-33.58 |
| [#303](https://github.com/Koniverse/SubWallet-Extension/issues/303) | Fix bug display incorrect transferable balance in the Send Fund/Donate/XCM Transfer screen (#303) | 0.4.4 | 2022-06-08 | US-33.6 |
| [#3134](https://github.com/Koniverse/SubWallet-Extension/issues/3134) | Support more XCM channels (#3134) | 1.2.4 | 2024-06-08 | US-33.61 |
| [#3230](https://github.com/Koniverse/SubWallet-Extension/issues/3230) | Fix bug not showing popup Swap confirmation when swap with Injected account (#3230) | 1.2.12 | 2024-07-02 | US-33.63 |
| [#332](https://github.com/Koniverse/SubWallet-Extension/issues/332) | Fix bug can not send fund/XCM transfer of the Kintsugi Chain (#332) | 0.4.4 | 2022-06-08 | US-33.7 |
| [#3519](https://github.com/Koniverse/SubWallet-Extension/issues/3519) | Fix bug XCM (#3519) | 1.2.28 | 2024-09-04 | US-33.70 |
| [#3561](https://github.com/Koniverse/SubWallet-Extension/issues/3561) | Fix bug XCM for channel: DOT: KAH -> PAH (#3561) | 1.2.29 | 2024-09-13 | US-33.71 |
| [#3606](https://github.com/Koniverse/SubWallet-Extension/issues/3606) | Fixed bug XCM USDT: PAH -> ASTR (#3606) | 1.3.31 | 2025-04-18 | US-33.72 |
| [#3617](https://github.com/Koniverse/SubWallet-Extension/issues/3617) | Re-calculate max transferable for XCM native token (#3617) | 1.2.30 | 2024-09-20 | US-33.74 |
| [#3725](https://github.com/Koniverse/SubWallet-Extension/issues/3725) | Fixed bug XCM for Acala (#3725) | 1.3.31 | 2025-04-18 | US-33.75 |
| [#3895](https://github.com/Koniverse/SubWallet-Extension/issues/3895) | Add validate sufficient token for XCM transfer (#3895) | 1.3.29 | 2025-04-08 | US-33.77 |
| [#3903](https://github.com/Koniverse/SubWallet-Extension/issues/3903) | Fixed bug Cannot read properties of undefined when performing XCM for Moonbeam (#3903) | 1.3.31 | 2025-04-18 | US-33.78 |
| [#3911](https://github.com/Koniverse/SubWallet-Extension/issues/3911) | Fix max transferable for Avail Bridge (#3911) | 1.3.12 | 2025-01-06 | US-33.79 |
| [#333](https://github.com/Koniverse/SubWallet-Extension/issues/333) | Fix bug can't XCM Transfer of the Bifrost Chain (#333) | 0.5.6 | 2022-08-24 | US-33.8 |
| [#3918](https://github.com/Koniverse/SubWallet-Extension/issues/3918) | Support Across bridge (#3918, #4299) | 1.3.31 | 2025-04-18 | US-33.80 |
| [#4299](https://github.com/Koniverse/SubWallet-Extension/issues/4299) | Support Across bridge (#3918, #4299) | 1.3.31 | 2025-04-18 | US-33.80 |
| [#4133](https://github.com/Koniverse/SubWallet-Extension/issues/4133) | Estimate delivery fee when XCM (#4133) | 1.3.31 | 2025-04-18 | US-33.83 |
| [#4134](https://github.com/Koniverse/SubWallet-Extension/issues/4134) | Dry run XCM (#4134) | 1.3.31 | 2025-04-18 | US-33.84 |
| [#4233](https://github.com/Koniverse/SubWallet-Extension/issues/4233) | Improve validate recipient when make XCM transfer (#4233) | 1.3.31 | 2025-04-18 | US-33.89 |
| [#4282](https://github.com/Koniverse/SubWallet-Extension/issues/4282) | Refactor Across bridge (#4282) | 1.3.35 | 2025-05-09 | US-33.92 |
| [#4310](https://github.com/Koniverse/SubWallet-Extension/issues/4310) | Improve estimate fee through Across Bridge (#4310) | 1.3.65 | 2025-11-06 | US-33.93 |
| [#4416](https://github.com/Koniverse/SubWallet-Extension/issues/4416) | Fixed bug Unable to XCM Polkadot Asset Hub -> Kusama Asset Hub (#4416) | 1.3.41 | 2025-06-11 | US-33.97 |
| [#4444](https://github.com/Koniverse/SubWallet-Extension/issues/4444) | Remove MYTH (PAH -> Ethereum) (#4444) | 1.3.55 | 2025-09-05 | US-33.98 |
| [#245](https://github.com/Koniverse/SubWallet-Extension/issues/245) | Integrate on-ramp feature to buy crypto from fiat currencies (#245) | 0.5.7 | 2022-09-06 | US-34.1 |
| [#1760](https://github.com/Koniverse/SubWallet-Extension/issues/1760) | Improve case delete connection when reset wallet (#1760) | 1.1.9 | 2023-08-22 | US-34.11 |
| [#1834](https://github.com/Koniverse/SubWallet-Extension/issues/1834) | Integrate Coinbase Pay fiat on-ramp feature (#1834) | 1.1.11 | 2023-09-09 | US-34.13 |
| [#1848](https://github.com/Koniverse/SubWallet-Extension/issues/1848) | Update list of tokens supported on fiat-onramp feature (#1848) | 1.1.11 | 2023-09-09 | US-34.14 |
| [#2025](https://github.com/Koniverse/SubWallet-Extension/issues/2025) | Sorting the token list to buy (#2025) | 1.1.20 | 2023-11-04 | US-34.17 |
| [#2026](https://github.com/Koniverse/SubWallet-Extension/issues/2026) | Updated list of tokens supported by Transak (#2026) | 1.1.17 | 2023-10-17 | US-34.18 |
| [#2031](https://github.com/Koniverse/SubWallet-Extension/issues/2031) | Update online token list in fiat-onramp feature (#2031) | 1.1.20 | 2023-11-04 | US-34.19 |
| [#609](https://github.com/Koniverse/SubWallet-Extension/issues/609) | Fix bug happens when user disconnect network or remove account that selected to buy cryptos (#609) | 0.5.7 | 2022-09-06 | US-34.2 |
| [#2319](https://github.com/Koniverse/SubWallet-Extension/issues/2319) | Add support for AZERO fiat onramp on Banxa (#2319) | 1.1.26 | 2023-12-16 | US-34.23 |
| [#616](https://github.com/Koniverse/SubWallet-Extension/issues/616) | Fix Transak logo (#616) | 0.5.9 | 2022-09-07 | US-34.3 |
| [#4358](https://github.com/Koniverse/SubWallet-Extension/issues/4358) | TAO On-ramp Integration in SubWallet (#4358) | 1.3.43 | 2025-06-26 | US-34.35 |
| [#4490](https://github.com/Koniverse/SubWallet-Extension/issues/4490) | Support buy token BTC (Bitcoin) (#4490) | 1.3.47 | 2025-07-11 | US-34.37 |
| [#4572](https://github.com/Koniverse/SubWallet-Extension/issues/4572) | Update coinbase on-ramp feature (#4572) | 1.3.52 | 2025-08-07 | US-34.38 |
| [#4815](https://github.com/Koniverse/SubWallet-Extension/issues/4815) | Check buy options for DOT & KSM token (#4815) | 1.3.65 | 2025-11-06 | US-34.39 |
| [#736](https://github.com/Koniverse/SubWallet-Extension/issues/736) | Support on-ramp for Binance & Etheneum network (#736) | 0.6.7 | 2022-10-22 | US-34.4 |
| [#4835](https://github.com/Koniverse/SubWallet-Extension/issues/4835) | Update Transak Widget URL (#4835) | 1.3.68 | 2025-12-03 | US-34.40 |
| [#1084](https://github.com/Koniverse/SubWallet-Extension/issues/1084) | Integrate Banxa for fiat on-ramp (#1084) | 1.1.6 | 2023-08-04 | US-34.6 |
| [#1317](https://github.com/Koniverse/SubWallet-Extension/issues/1317) | Add support for $NEER on Transak (#1317) | 1.0.4 | 2023-05-12 | US-34.8 |
| [#4678](https://github.com/Koniverse/SubWallet-Extension/issues/4678) | Support OpenGov (Phase 1) (#4678) | 1.3.70 | 2025-12-11 | US-35.10 |
| [#914](https://github.com/Koniverse/SubWallet-Extension/issues/914) | Add incrementDelegatorRewards call to Amplitude reward claiming (#914) | 0.7.5 | 2022-12-15 | US-35.2 |
| [#1454](https://github.com/Koniverse/SubWallet-Extension/issues/1454) | Excluded Ledger account from the "My Wallet" list when sending tokens that are not supported by the Ledger account (#1454) | 1.0.7 | 2023-06-01 | US-36.11 |
| [#1565](https://github.com/Koniverse/SubWallet-Extension/issues/1565) | Add support Ledger with Aleph Zero network (#1565) | 1.0.12 | 2023-06-29 | US-36.12 |
| [#1573](https://github.com/Koniverse/SubWallet-Extension/issues/1573) | Improved connection experience with Ledger (#1573) | 1.1.1 | 2023-07-06 | US-36.14 |
| [#1814](https://github.com/Koniverse/SubWallet-Extension/issues/1814) | Support Ledger for Astar (#1814) | 1.1.11 | 2023-09-09 | US-36.16 |
| [#1874](https://github.com/Koniverse/SubWallet-Extension/issues/1874) | Handle the case of signing transactions from dApp using a Ledger account (#1874) | 1.1.12 | 2023-09-15 | US-36.17 |
| [#1942](https://github.com/Koniverse/SubWallet-Extension/issues/1942) | Support Ledger for more chains (#1942) | 1.1.15 | 2023-09-30 | US-36.18 |
| [#564](https://github.com/Koniverse/SubWallet-Extension/issues/564) | Integration Ledger Acala account (#564) | 0.6.6 | 2022-09-30 | US-36.2 |
| [#2075](https://github.com/Koniverse/SubWallet-Extension/issues/2075) | Fixed bug Get Ledger account addresses on incompatible networks (#2075) | 1.1.19 | 2023-10-26 | US-36.23 |
| [#2219](https://github.com/Koniverse/SubWallet-Extension/issues/2219) | Support staking AZERO with Ledger (#2219) | 1.1.23 | 2023-11-24 | US-36.25 |
| [#2608](https://github.com/Koniverse/SubWallet-Extension/issues/2608) | Fixed bug connect a Ledger device (#2608) | 1.1.45 | 2024-03-20 | US-36.31 |
| [#2625](https://github.com/Koniverse/SubWallet-Extension/issues/2625) | Re-check case send token on Acala-EVM with Ledger account (#2625) | 1.1.39 | 2024-02-24 | US-36.32 |
| [#2785](https://github.com/Koniverse/SubWallet-Extension/issues/2785) | Support connect Ledger device for Asset Hub (#2785) | 1.1.46 | 2024-03-22 | US-36.34 |
| [#2982](https://github.com/Koniverse/SubWallet-Extension/issues/2982) | Integrate Avail Ledger app (#2982) | 1.2.22 | 2024-07-31 | US-36.37 |
| [#3145](https://github.com/Koniverse/SubWallet-Extension/issues/3145) | Fixed bug Sign transaction failed for some tokens with Aleph Zero Ledger account (#3145) | 1.2.5 | 2024-06-11 | US-36.39 |
| [#3231](https://github.com/Koniverse/SubWallet-Extension/issues/3231) | Add support Ledger for Polkadex (#3231) | 1.2.16 | 2024-07-19 | US-36.41 |
| [#3254](https://github.com/Koniverse/SubWallet-Extension/issues/3254) | Fix bug Show incorrect screen when perform earning actions with Ledger's EVM account (#3254) | 1.2.11 | 2024-06-29 | US-36.42 |
| [#3263](https://github.com/Koniverse/SubWallet-Extension/issues/3263) | Add validate account in case sign transaction with Ledger account (#3263) | 1.2.15 | 2024-07-12 | US-36.44 |
| [#3307](https://github.com/Koniverse/SubWallet-Extension/issues/3307) | Allow to use Migration Polkadot App to attach Ledger account (#3307, #3402) | 1.2.24 | 2024-08-09 | US-36.45 |
| [#3402](https://github.com/Koniverse/SubWallet-Extension/issues/3402) | Allow to use Migration Polkadot App to attach Ledger account (#3307, #3402) | 1.2.24 | 2024-08-09 | US-36.45 |
| [#752](https://github.com/Koniverse/SubWallet-Extension/issues/752) | Keystone - adding brand name (#752) | 0.6.8 | 2022-10-31 | US-36.5 |
| [#3458](https://github.com/Koniverse/SubWallet-Extension/issues/3458) | Support XCM for Ledger Polkadot generic app (#3458) | 1.2.29 | 2024-09-13 | US-36.51 |
| [#3464](https://github.com/Koniverse/SubWallet-Extension/issues/3464) | Add validate for Solochain when receive, transfer with Generic ledger account (#3464) | 1.2.25 | 2024-08-17 | US-36.53 |
| [#3835](https://github.com/Koniverse/SubWallet-Extension/issues/3835) | Support Generic ledger app for Vara network (#3835) | 1.3.9 | 2024-12-09 | US-36.58 |
| [#3902](https://github.com/Koniverse/SubWallet-Extension/issues/3902) | Optimize swap pair selection (#3902) | 1.3.30 | 2025-04-14 | US-36.61 |
| [#3915](https://github.com/Koniverse/SubWallet-Extension/issues/3915) | Support Avail Recovery app (#3915) | 1.3.12 | 2025-01-06 | US-36.62 |
| [#3931](https://github.com/Koniverse/SubWallet-Extension/issues/3931) | Unblock when perform stake on Bifrost with ledger account (#3931) | 1.3.43 | 2025-06-26 | US-36.63 |
| [#4365](https://github.com/Koniverse/SubWallet-Extension/issues/4365) | Update ledger-substrate-js library (#4365) | 1.3.46 | 2025-07-04 | US-36.67 |
| [#4464](https://github.com/Koniverse/SubWallet-Extension/issues/4464) | Re-check and update block action when stake with ledger account (#4464) | 1.3.49 | 2025-07-28 | US-36.69 |
| [#846](https://github.com/Koniverse/SubWallet-Extension/issues/846) | Handle case attach and send asset for Ledger account with addess index #0 (#846) | 0.7.5 | 2022-12-15 | US-36.7 |
| [#4501](https://github.com/Koniverse/SubWallet-Extension/issues/4501) | Update ledger-substrate-js library (Round 2) (#4501) | 1.3.56 | 2025-09-11 | US-36.72 |
| [#4531](https://github.com/Koniverse/SubWallet-Extension/issues/4531) | Block networks (Substrate & Ethereum) without runtime update for Ledger Substrate accounts (#4531) | 1.3.49 | 2025-07-28 | US-36.73 |
| [#4592](https://github.com/Koniverse/SubWallet-Extension/issues/4592) | Fixed bug Unable to connect to Ledger apps via Ledger Nano X 2.5.0 & Ledger Nano S+ 1.4.0 (#4592) | 1.3.53 | 2025-08-12 | US-36.74 |
| [#4645](https://github.com/Koniverse/SubWallet-Extension/issues/4645) | Fixed bug Unmatched address set when connecting via Ledger Polkadot app & Ledger Avail Recovery app (#4645) | 1.3.56 | 2025-09-11 | US-36.75 |
| [#3468](https://github.com/Koniverse/SubWallet-Extension/issues/3468) | Improve condition for Marketing campaign (#3468) | 1.2.28 | 2024-09-04 | US-39.11 |
| [#4403](https://github.com/Koniverse/SubWallet-Extension/issues/4403) | Fixed bug Error page when use marketing campaign (#4403) | 1.3.41 | 2025-06-11 | US-39.19 |
| [#2000](https://github.com/Koniverse/SubWallet-Extension/issues/2000) | Support notification in browser and banner in app (#2000) | 1.1.18 | 2023-10-20 | US-39.3 |
| [#2806](https://github.com/Koniverse/SubWallet-Extension/issues/2806) | Improve the Marketing Campaign application mechanism (#2806) | 1.2.6 | 2024-06-19 | US-39.8 |
| [#3414](https://github.com/Koniverse/SubWallet-Extension/issues/3414) | Improve performance upon showing Marketing Campaign (#3414) | 1.2.24 | 2024-08-09 | US-39.9 |
| [#36](https://github.com/Koniverse/SubWallet-Extension/issues/36) | Custom network, Custom Endpoint (#36) | 0.4.3 | 2022-05-31 | US-4.1 |
| [#464](https://github.com/Koniverse/SubWallet-Extension/issues/464) | Temporarily remove "Add custom network" (#464) | 0.5.3 | 2022-07-29 | US-4.1 |
| [#477](https://github.com/Koniverse/SubWallet-Extension/issues/477) | Support token import for PSP-22 and PSP-34 (#477) | 0.6.7 | 2022-10-22 | US-4.11 |
| [#1289](https://github.com/Koniverse/SubWallet-Extension/issues/1289) | Enable native token automatically when enabling local token from the transfer screen (#1289) | 1.0.4 | 2023-05-12 | US-4.12 |
| [#4970](https://github.com/Koniverse/SubWallet-Extension/issues/4970) | Disable all networks' switch to Manage Networks page (#4970) | 1.3.78 | 2026-05-14 | US-4.2 |
| [#5002](https://github.com/Koniverse/SubWallet-Extension/issues/5002) | Remove Polygon zkEVM support due to network sunset (#5002) | 1.3.82 | 2026-07-06 | US-4.24 |
| [#2463](https://github.com/Koniverse/SubWallet-Extension/issues/2463) | Update disabled XCM channels online (#2463) | 1.1.35 | 2024-02-02 | US-4.3 |
| [#2790](https://github.com/Koniverse/SubWallet-Extension/issues/2790) | Integrate asset online (#2790) | 1.1.50 | 2024-03-28 | US-4.3 |
| [#3132](https://github.com/Koniverse/SubWallet-Extension/issues/3132) | Improve chain-list online patch (#3132) | 1.3.8 | 2024-12-03 | US-4.3 |
| [#92](https://github.com/Koniverse/SubWallet-Extension/issues/92) | Display Astar(EVM) tokens balances and ERC20 tokens (issue #92) | 0.3.2 | 2022-04-07 | US-4.5 |
| [#10](https://github.com/Koniverse/SubWallet-Extension/issues/10) | Add URL and update logo for Subspace network (#10) | 1.0.5 | 2023-05-21 | US-40.1 |
| [#3144](https://github.com/Koniverse/SubWallet-Extension/issues/3144) | Update lock time of MV3 extension (#3144) | 1.2.4 | 2024-06-08 | US-40.17 |
| [#3146](https://github.com/Koniverse/SubWallet-Extension/issues/3146) | Fixed some bug related to MV3 (#3146) | 1.2.2 | 2024-05-30 | US-40.18 |
| [#2205](https://github.com/Koniverse/SubWallet-Extension/issues/2205) | Update Extension Manifest V3 (#2205) | 1.2.1 | 2024-05-28 | US-40.7 |
| [#1239](https://github.com/Koniverse/SubWallet-Extension/issues/1239) | Update wake up / sleep with history and price service (#1239) | 1.0.3 | 2023-05-06 | US-41.101 |
| [#1279](https://github.com/Koniverse/SubWallet-Extension/issues/1279) | Bug related to address book (#1279) | 1.0.4 | 2023-05-12 | US-41.107 |
| [#1306](https://github.com/Koniverse/SubWallet-Extension/issues/1306) | Update out date libs (#1306) | 1.0.3 | 2023-05-06 | US-41.112 |
| [#1362](https://github.com/Koniverse/SubWallet-Extension/issues/1362) | Handler transaction last status when stop extension and transaction in submitting phase (#1362, #1370) | 1.0.5 | 2023-05-21 | US-41.115 |
| [#1370](https://github.com/Koniverse/SubWallet-Extension/issues/1370) | Handler transaction last status when stop extension and transaction in submitting phase (#1362, #1370) | 1.0.5 | 2023-05-21 | US-41.115 |
| [#1369](https://github.com/Koniverse/SubWallet-Extension/issues/1369) | Add policy for a master password (#1369) | 1.0.5 | 2023-05-21 | US-41.116 |
| [#1373](https://github.com/Koniverse/SubWallet-Extension/issues/1373) | Remove some logs (#1373) | 1.0.5 | 2023-05-21 | US-41.117 |
| [#1472](https://github.com/Koniverse/SubWallet-Extension/issues/1472) | Updated web runner to fix ABI block explorer on mobile (#1472) | 1.0.7 | 2023-06-01 | US-41.120 |
| [#1524](https://github.com/Koniverse/SubWallet-Extension/issues/1524) | Fixed bug Show incorrect address book type (#1524) | 1.0.10 | 2023-06-17 | US-41.124 |
| [#1530](https://github.com/Koniverse/SubWallet-Extension/issues/1530) | Update uninstall URL (#1530) | 1.0.9 | 2023-06-13 | US-41.125 |
| [#1538](https://github.com/Koniverse/SubWallet-Extension/issues/1538) | Fixed bug Error fetching nominator data for Calamari (#1538) | 1.0.10 | 2023-06-17 | US-41.126 |
| [#1556](https://github.com/Koniverse/SubWallet-Extension/issues/1556) | Update `@subwallet/chain-list@0.2.2` (#1556): | 1.0.11 | 2023-06-24 | US-41.129 |
| [#1557](https://github.com/Koniverse/SubWallet-Extension/issues/1557) | Fixed bug Show incorrect withdrawal amount in case have multiple withdrawal requests (#1557) | 1.1.2 | 2023-07-14 | US-41.130 |
| [#1559](https://github.com/Koniverse/SubWallet-Extension/issues/1559) | Fixed bugs related to address book (#1559) | 1.1.1 | 2023-07-06 | US-41.131 |
| [#1576](https://github.com/Koniverse/SubWallet-Extension/issues/1576) | Update `@subwallet/chain-list@0.2.3` (#1576): | 1.0.12 | 2023-06-29 | US-41.135 |
| [#1585](https://github.com/Koniverse/SubWallet-Extension/issues/1585) | Improve calculation of withdrawal time (#1585) | 1.1.2 | 2023-07-14 | US-41.136 |
| [#1590](https://github.com/Koniverse/SubWallet-Extension/issues/1590) | Update `@subwallet/chain-list@0.2.4` (#1590): | 1.1.1 | 2023-07-06 | US-41.137 |
| [#1615](https://github.com/Koniverse/SubWallet-Extension/issues/1615) | Fixed bug Still showing NFTs that have been sent (#1615) | 1.1.2 | 2023-07-14 | US-41.142 |
| [#1661](https://github.com/Koniverse/SubWallet-Extension/issues/1661) | Update chainlist (0.2.7) (#1661) | 1.1.3 | 2023-07-21 | US-41.145 |
| [#1708](https://github.com/Koniverse/SubWallet-Extension/issues/1708) | Update logo for Avail network (#1708) | 1.1.5 | 2023-07-29 | US-41.153 |
| [#1763](https://github.com/Koniverse/SubWallet-Extension/issues/1763) | Improve auto-lock feature for mobile app (#1763) | 1.1.11 | 2023-09-09 | US-41.158 |
| [#1815](https://github.com/Koniverse/SubWallet-Extension/issues/1815) | Update web-runner for i18n for background (#1815) | 1.1.12 | 2023-09-15 | US-41.163 |
| [#1839](https://github.com/Koniverse/SubWallet-Extension/issues/1839) | Update chain list: Add support Gemini 3f, Update RPC for Creditcoin (#1839) | 1.1.10 | 2023-08-26 | US-41.167 |
| [#1882](https://github.com/Koniverse/SubWallet-Extension/issues/1882) | Fixed bug bug related to web runner v1.1.10 when used for mobile applications (#1882) | 1.1.11 | 2023-09-09 | US-41.170 |
| [#1905](https://github.com/Koniverse/SubWallet-Extension/issues/1905) | Improve Amount input field (#1905) | 1.2.28 | 2024-09-04 | US-41.173 |
| [#1941](https://github.com/Koniverse/SubWallet-Extension/issues/1941) | Update chain list (#1941) | 1.1.15 | 2023-09-30 | US-41.176 |
| [#1998](https://github.com/Koniverse/SubWallet-Extension/issues/1998) | Update chain list (#1998) | 1.1.17 | 2023-10-17 | US-41.179 |
| [#168](https://github.com/Koniverse/SubWallet-Extension/issues/168) | Fix bug and improve some experience (#168) | 0.4.1 | 2022-05-11 | US-41.18 |
| [#2010](https://github.com/Koniverse/SubWallet-Extension/issues/2010) | Replace the user feedback form when uninstalling extension (#2010) | 1.1.17 | 2023-10-17 | US-41.180 |
| [#2017](https://github.com/Koniverse/SubWallet-Extension/issues/2017) | Update coinable ID for product environment (#2017) | 1.1.17 | 2023-10-17 | US-41.183 |
| [#2033](https://github.com/Koniverse/SubWallet-Extension/issues/2033) | Update chainlist (#2033) | 1.1.19 | 2023-10-26 | US-41.185 |
| [#2072](https://github.com/Koniverse/SubWallet-Extension/issues/2072) | Fixed bug show error page when opening the app with an invalid URL (#2072) | 1.1.21 | 2023-11-08 | US-41.188 |
| [#2105](https://github.com/Koniverse/SubWallet-Extension/issues/2105) | Update chain list (#2105) | 1.1.20 | 2023-11-04 | US-41.192 |
| [#2145](https://github.com/Koniverse/SubWallet-Extension/issues/2145) | Update chain list (#2145) | 1.1.21 | 2023-11-08 | US-41.196 |
| [#2178](https://github.com/Koniverse/SubWallet-Extension/issues/2178) | Update chain-list (#2178) | 1.1.22 | 2023-11-15 | US-41.203 |
| [#2207](https://github.com/Koniverse/SubWallet-Extension/issues/2207) | Fixed bug browser waste time when load extension (#2207) and add the loading effect when open app (#2228) | 1.1.23 | 2023-11-24 | US-41.207 |
| [#2228](https://github.com/Koniverse/SubWallet-Extension/issues/2228) | Fixed bug browser waste time when load extension (#2207) and add the loading effect when open app (#2228) | 1.1.23 | 2023-11-24 | US-41.207 |
| [#2313](https://github.com/Koniverse/SubWallet-Extension/issues/2313) | Update precise start/end time of an era (#2313) | 1.1.26 | 2023-12-16 | US-41.217 |
| [#2316](https://github.com/Koniverse/SubWallet-Extension/issues/2316) | Fixed bug do not navigate when click on hyperlink in attach account (#2316) | 1.1.26 | 2023-12-16 | US-41.218 |
| [#2328](https://github.com/Koniverse/SubWallet-Extension/issues/2328) | Update rdns for EIP-6963 (#2328) | 1.1.26 | 2023-12-16 | US-41.220 |
| [#2330](https://github.com/Koniverse/SubWallet-Extension/issues/2330) | Add T&C (#2330) | 1.1.29 | 2023-12-29 | US-41.221 |
| [#2391](https://github.com/Koniverse/SubWallet-Extension/issues/2391) | Handle fallback for online content (#2391) | 1.1.30 | 2024-01-05 | US-41.226 |
| [#2406](https://github.com/Koniverse/SubWallet-Extension/issues/2406) | Allow access extension from iframe (#2406) | 1.1.28 | 2023-12-25 | US-41.227 |
| [#2447](https://github.com/Koniverse/SubWallet-Extension/issues/2447) | Update chain-list (#2447) | 1.1.30 | 2024-01-05 | US-41.233 |
| [#2465](https://github.com/Koniverse/SubWallet-Extension/issues/2465) | Update chain-list (#2465) | 1.1.31 | 2024-01-11 | US-41.237 |
| [#2467](https://github.com/Koniverse/SubWallet-Extension/issues/2467) | Support "Request a feature" feature (#2467) | 1.1.32 | 2024-01-15 | US-41.238 |
| [#2489](https://github.com/Koniverse/SubWallet-Extension/issues/2489) | Update chain-list (#2489) | 1.1.32 | 2024-01-15 | US-41.243 |
| [#2508](https://github.com/Koniverse/SubWallet-Extension/issues/2508) | Update chain-list (#2508) | 1.1.33 | 2024-01-23 | US-41.244 |
| [#2538](https://github.com/Koniverse/SubWallet-Extension/issues/2538) | Fixed bug sending AVL on Avail Goldberg testnet (#2538) | 1.1.41 | 2024-03-02 | US-41.249 |
| [#2555](https://github.com/Koniverse/SubWallet-Extension/issues/2555) | Add show/hide password for case input password (#2555) | 1.1.58 | 2024-04-24 | US-41.250 |
| [#2570](https://github.com/Koniverse/SubWallet-Extension/issues/2570) | Update chain-list (#2570) | 1.1.38 | 2024-02-17 | US-41.251 |
| [#2586](https://github.com/Koniverse/SubWallet-Extension/issues/2586) | Update chain-list (#2586) | 1.1.36 | 2024-02-06 | US-41.252 |
| [#2617](https://github.com/Koniverse/SubWallet-Extension/issues/2617) | Update validation logic for Chainlist (#2617) | 1.1.39 | 2024-02-24 | US-41.253 |
| [#2631](https://github.com/Koniverse/SubWallet-Extension/issues/2631) | Update tab bar (#2631) | 1.1.39 | 2024-02-24 | US-41.255 |
| [#2694](https://github.com/Koniverse/SubWallet-Extension/issues/2694) | Update Chain-list (#2694) | 1.1.44 | 2024-03-16 | US-41.259 |
| [#2698](https://github.com/Koniverse/SubWallet-Extension/issues/2698) | Update chain-list (#2698) | 1.1.42 | 2024-03-08 | US-41.260 |
| [#2729](https://github.com/Koniverse/SubWallet-Extension/issues/2729) | Add subject email in case select contact support feature (#2729) | 1.1.44 | 2024-03-16 | US-41.262 |
| [#2731](https://github.com/Koniverse/SubWallet-Extension/issues/2731) | Update Subscan service (#2731) | 1.1.44 | 2024-03-16 | US-41.263 |
| [#2738](https://github.com/Koniverse/SubWallet-Extension/issues/2738) | Add more currency type (#2738, #3011) | 1.1.62 | 2024-05-08 | US-41.265 |
| [#3011](https://github.com/Koniverse/SubWallet-Extension/issues/3011) | Add more currency type (#2738, #3011) | 1.1.62 | 2024-05-08 | US-41.265 |
| [#2759](https://github.com/Koniverse/SubWallet-Extension/issues/2759) | Update email support (#2759) | 1.1.44 | 2024-03-16 | US-41.266 |
| [#2767](https://github.com/Koniverse/SubWallet-Extension/issues/2767) | Update explorer URL for Avail testnet (#2767) | 1.1.45 | 2024-03-20 | US-41.267 |
| [#392](https://github.com/Koniverse/SubWallet-Extension/issues/392) | Fix bug report by Moonbeam team (#392) | 0.4.9 | 2022-07-02 | US-41.27 |
| [#2807](https://github.com/Koniverse/SubWallet-Extension/issues/2807) | Improve marketing campaign (#3461, #2807) | 1.2.32 | 2024-10-01 | US-41.270 |
| [#3461](https://github.com/Koniverse/SubWallet-Extension/issues/3461) | Improve marketing campaign (#3461, #2807) | 1.2.32 | 2024-10-01 | US-41.270 |
| [#2853](https://github.com/Koniverse/SubWallet-Extension/issues/2853) | Bump Polkadot dependencies (#2853) | 1.1.56 | 2024-04-19 | US-41.272 |
| [#2869](https://github.com/Koniverse/SubWallet-Extension/issues/2869) | Improve the Substrate Provider to meet the demands of dApps utilizing both EVM and Substrate (#2869) | 1.2.5 | 2024-06-11 | US-41.273 |
| [#2871](https://github.com/Koniverse/SubWallet-Extension/issues/2871) | Upgrading certain technical issues of the EVM provider (#2871) | 1.3.46 | 2025-07-04 | US-41.274 |
| [#2882](https://github.com/Koniverse/SubWallet-Extension/issues/2882) | Fixed bug enable chains when detect balance (#2882) | 1.1.64 | 2024-05-10 | US-41.275 |
| [#2931](https://github.com/Koniverse/SubWallet-Extension/issues/2931) | Update chainlist (#2931) | 1.1.56 | 2024-04-19 | US-41.279 |
| [#2986](https://github.com/Koniverse/SubWallet-Extension/issues/2986) | Fixed bug Cannot read properties of undefined (reading 'length') (#2986) | 1.1.61 | 2024-05-02 | US-41.285 |
| [#417](https://github.com/Koniverse/SubWallet-Extension/issues/417) | Add taiKSM and 3USD on Karura and tDOT on Acala (#417) | 0.5.3 | 2022-07-29 | US-41.29 |
| [#3035](https://github.com/Koniverse/SubWallet-Extension/issues/3035) | Handle the case of not resetting the wallet to the default state when click Erase all (#3035) | 1.1.66 | 2024-05-21 | US-41.290 |
| [#3040](https://github.com/Koniverse/SubWallet-Extension/issues/3040) | Update chain-list (#3040) | 1.1.65 | 2024-05-16 | US-41.292 |
| [#3055](https://github.com/Koniverse/SubWallet-Extension/issues/3055) | Update chain-list (#3055) | 1.1.66 | 2024-05-21 | US-41.296 |
| [#3056](https://github.com/Koniverse/SubWallet-Extension/issues/3056) | Remove support for Moonbeam on Polkadot vault (#3056) | 1.2.2 | 2024-05-30 | US-41.297 |
| [#3070](https://github.com/Koniverse/SubWallet-Extension/issues/3070) | Refactor logic parsing data from contract response (#3070) | 1.3.5 | 2024-10-31 | US-41.298 |
| [#3085](https://github.com/Koniverse/SubWallet-Extension/issues/3085) | Update new chain-list interface (#3085) | 1.1.66 | 2024-05-21 | US-41.300 |
| [#3088](https://github.com/Koniverse/SubWallet-Extension/issues/3088) | Update chainlist (#3088) | 1.1.68 | 2024-05-25 | US-41.301 |
| [#3094](https://github.com/Koniverse/SubWallet-Extension/issues/3094) | Update chain-list (#3094) | 1.2.3 | 2024-06-03 | US-41.302 |
| [#426](https://github.com/Koniverse/SubWallet-Extension/issues/426) | Support Ethereum and Binance Smart Chain (#426) | 0.6.7 | 2022-10-22 | US-41.31 |
| [#3185](https://github.com/Koniverse/SubWallet-Extension/issues/3185) | Update chain-list (#3185) | 1.2.6 | 2024-06-19 | US-41.313 |
| [#3212](https://github.com/Koniverse/SubWallet-Extension/issues/3212) | Update UI for Mission pool feature (#3212) | 1.2.13 | 2024-07-05 | US-41.316 |
| [#3214](https://github.com/Koniverse/SubWallet-Extension/issues/3214) | Update chain-list (#3214) | 1.2.9 | 2024-06-24 | US-41.317 |
| [#3218](https://github.com/Koniverse/SubWallet-Extension/issues/3218) | Fix bug Error can't read properties of undefined (reading 'filter') (#3218) | 1.2.8 | 2024-06-21 | US-41.318 |
| [#3259](https://github.com/Koniverse/SubWallet-Extension/issues/3259) | Fix bug Cannot read properties of undefined (reading 'includes') (#3259) | 1.2.12 | 2024-07-02 | US-41.323 |
| [#3308](https://github.com/Koniverse/SubWallet-Extension/issues/3308) | Hide direct api usage of polkadot/js (#3308) | 1.2.24 | 2024-08-09 | US-41.326 |
| [#3369](https://github.com/Koniverse/SubWallet-Extension/issues/3369) | Update chain-list for Avail (#3369) | 1.2.18 | 2024-07-23 | US-41.328 |
| [#438](https://github.com/Koniverse/SubWallet-Extension/issues/438) | Fix error logs from koni-content (#438) | 0.5.2 | 2022-07-22 | US-41.33 |
| [#3378](https://github.com/Koniverse/SubWallet-Extension/issues/3378) | Fix a few bugs for Avail (#3378) | 1.2.21 | 2024-07-24 | US-41.330 |
| [#3385](https://github.com/Koniverse/SubWallet-Extension/issues/3385) | Update chain-list (#3385) | 1.2.22 | 2024-07-31 | US-41.331 |
| [#3403](https://github.com/Koniverse/SubWallet-Extension/issues/3403) | Update chain-list (#3403) | 1.2.23 | 2024-08-03 | US-41.333 |
| [#3425](https://github.com/Koniverse/SubWallet-Extension/issues/3425) | Update chainlist (#3425) | 1.2.24 | 2024-08-09 | US-41.336 |
| [#3441](https://github.com/Koniverse/SubWallet-Extension/issues/3441) | Fix Input overflow width issue (#3441) | 1.2.25 | 2024-08-17 | US-41.339 |
| [#3451](https://github.com/Koniverse/SubWallet-Extension/issues/3451) | Update chainlist (#3451) | 1.2.25 | 2024-08-17 | US-41.340 |
| [#3467](https://github.com/Koniverse/SubWallet-Extension/issues/3467) | Improve fetching era stakers (#3467) | 1.2.28 | 2024-09-04 | US-41.341 |
| [#3478](https://github.com/Koniverse/SubWallet-Extension/issues/3478) | Update chain-list (#3478) | 1.2.27 | 2024-08-22 | US-41.342 |
| [#3518](https://github.com/Koniverse/SubWallet-Extension/issues/3518) | Update chain-list (#3518) | 1.2.28 | 2024-09-04 | US-41.343 |
| [#3558](https://github.com/Koniverse/SubWallet-Extension/issues/3558) | Update chain-list (#3558) | 1.2.29 | 2024-09-13 | US-41.347 |
| [#444](https://github.com/Koniverse/SubWallet-Extension/issues/444) | Fix the issues with EVM Provider by late initialized (#444) | 0.5.2 | 2022-07-22 | US-41.35 |
| [#3635](https://github.com/Koniverse/SubWallet-Extension/issues/3635) | Block action online (#3635) | 1.2.31 | 2024-09-28 | US-41.351 |
| [#3637](https://github.com/Koniverse/SubWallet-Extension/issues/3637) | Update chain-list (#3637) | 1.2.30 | 2024-09-20 | US-41.352 |
| [#3654](https://github.com/Koniverse/SubWallet-Extension/issues/3654) | Re-check some old types from ExtrinsicType (#3654) | 1.3.5 | 2024-10-31 | US-41.353 |
| [#450](https://github.com/Koniverse/SubWallet-Extension/issues/450) | Add support for DOT on Astar Native and on Astar EVM (#450) | 0.5.6 | 2022-08-24 | US-41.36 |
| [#3680](https://github.com/Koniverse/SubWallet-Extension/issues/3680) | Update chain-list (#3680) | 1.2.31 | 2024-09-28 | US-41.361 |
| [#3760](https://github.com/Koniverse/SubWallet-Extension/issues/3760) | Update chainlist (#3760) | 1.3.2 | 2024-10-12 | US-41.364 |
| [#3806](https://github.com/Koniverse/SubWallet-Extension/issues/3806) | Update chain-list (#3806) | 1.3.4 | 2024-10-28 | US-41.370 |
| [#3809](https://github.com/Koniverse/SubWallet-Extension/issues/3809) | Update api key for TAO(Bittensor) (#3809) | 1.3.4 | 2024-10-28 | US-41.371 |
| [#3814](https://github.com/Koniverse/SubWallet-Extension/issues/3814) | Improve block action online by environment (#3814) | 1.3.7 | 2024-11-23 | US-41.372 |
| [#3815](https://github.com/Koniverse/SubWallet-Extension/issues/3815) | Update chain-list (#3815) | 1.3.5 | 2024-10-31 | US-41.373 |
| [#3828](https://github.com/Koniverse/SubWallet-Extension/issues/3828) | Update chain-list (#3828) | 1.3.6 | 2024-11-07 | US-41.375 |
| [#3846](https://github.com/Koniverse/SubWallet-Extension/issues/3846) | Update chain-list (#3846) | 1.3.7 | 2024-11-23 | US-41.377 |
| [#3888](https://github.com/Koniverse/SubWallet-Extension/issues/3888) | Update version polkadot api (#3888) | 1.3.10 | 2024-12-12 | US-41.383 |
| [#3897](https://github.com/Koniverse/SubWallet-Extension/issues/3897) | Update chain-list (#3897) | 1.3.12 | 2025-01-06 | US-41.386 |
| [#489](https://github.com/Koniverse/SubWallet-Extension/issues/489) | Update response information of EVM Provider (#489) | 0.5.4 | 2022-08-05 | US-41.39 |
| [#3974](https://github.com/Koniverse/SubWallet-Extension/issues/3974) | Update chain-list stable (#3974) | 1.3.14 | 2025-01-24 | US-41.393 |
| [#4002](https://github.com/Koniverse/SubWallet-Extension/issues/4002) | Fix issue Don't open the extension related to Patch feature (#4002) | 1.3.15 | 2025-02-06 | US-41.397 |
| [#4007](https://github.com/Koniverse/SubWallet-Extension/issues/4007) | Update chain-list stable v0.2.99 (#4007) | 1.3.21 | 2025-02-28 | US-41.399 |
| [#4026](https://github.com/Koniverse/SubWallet-Extension/issues/4026) | Fixed bug Show incorrect APY for some chains (#4026) | 1.3.17 | 2025-02-18 | US-41.401 |
| [#4029](https://github.com/Koniverse/SubWallet-Extension/issues/4029) | Fixed rate limit api key for Bittensor(TAO) (#4029) | 1.3.17 | 2025-02-18 | US-41.402 |
| [#4058](https://github.com/Koniverse/SubWallet-Extension/issues/4058) | Update chainlist stable version 0.2.102 (#4058) | 1.3.27 | 2025-03-29 | US-41.404 |
| [#497](https://github.com/Koniverse/SubWallet-Extension/issues/497) | Still shows deleted NFTs (#497) | 0.6.7 | 2022-10-22 | US-41.41 |
| [#4091](https://github.com/Koniverse/SubWallet-Extension/issues/4091) | Support extension side panel (#4091) | 1.3.34 | 2025-05-05 | US-41.410 |
| [#4100](https://github.com/Koniverse/SubWallet-Extension/issues/4100) | Support CIP-30 on Cardano (#4100) | 1.3.32 | 2025-04-26 | US-41.412 |
| [#4164](https://github.com/Koniverse/SubWallet-Extension/issues/4164) | Update API key for blockfrost on Cardano (#4164) | 1.3.27 | 2025-03-29 | US-41.420 |
| [#4195](https://github.com/Koniverse/SubWallet-Extension/issues/4195) | Fixed bug Cannot read properties of undefined (reading 'destinationTokenInfo') when open the old Notification details (#4195) | 1.3.30 | 2025-04-14 | US-41.430 |
| [#4240](https://github.com/Koniverse/SubWallet-Extension/issues/4240) | Review extrinsic status subscription (#4240) | 1.3.35 | 2025-05-09 | US-41.431 |
| [#4273](https://github.com/Koniverse/SubWallet-Extension/issues/4273) | Update chain-list stable v0.2.105 (#4273), | 1.3.40 | 2025-05-30 | US-41.432 |
| [#4312](https://github.com/Koniverse/SubWallet-Extension/issues/4312) | Update features related to middleware services (#4312) | 1.3.32 | 2025-04-26 | US-41.434 |
| [#4324](https://github.com/Koniverse/SubWallet-Extension/issues/4324) | Update link for "Contact support" (#4324) | 1.3.33 | 2025-04-30 | US-41.435 |
| [#4352](https://github.com/Koniverse/SubWallet-Extension/issues/4352) | Fixed bug related to feedback from Cardano Foundation (#4352) | 1.3.38 | 2025-05-23 | US-41.438 |
| [#4368](https://github.com/Koniverse/SubWallet-Extension/issues/4368) | Moving BlockFrost interaction Logic to the Backend (#4368) | 1.3.41 | 2025-06-11 | US-41.440 |
| [#4410](https://github.com/Koniverse/SubWallet-Extension/issues/4410) | Update chain-list stable v0.2.106 (#4410) | 1.3.42 | 2025-06-23 | US-41.445 |
| [#4443](https://github.com/Koniverse/SubWallet-Extension/issues/4443) | Update Gears Library (#4443) | 1.3.47 | 2025-07-11 | US-41.447 |
| [#4507](https://github.com/Koniverse/SubWallet-Extension/issues/4507) | Re-check for Paseo after migrated (#4507) | 1.3.61 | 2025-10-04 | US-41.452 |
| [#4515](https://github.com/Koniverse/SubWallet-Extension/issues/4515) | Replace Hardcoded Strings with i18n Keys (#4515) | 1.3.55 | 2025-09-05 | US-41.453 |
| [#4521](https://github.com/Koniverse/SubWallet-Extension/issues/4521) | Update chain-list stable v0.2.110 (#4521) | 1.3.48 | 2025-07-21 | US-41.455 |
| [#4536](https://github.com/Koniverse/SubWallet-Extension/issues/4536) | Fixed issue can not update patch and online resources (#4536) | 1.3.62 | 2025-10-10 | US-41.456 |
| [#4546](https://github.com/Koniverse/SubWallet-Extension/issues/4546) | Update chain-list stable v0.2.111 (#4546) | 1.3.52 | 2025-08-07 | US-41.457 |
| [#4575](https://github.com/Koniverse/SubWallet-Extension/issues/4575) | Fixed bug when withdraw (#4575) | 1.3.52 | 2025-08-07 | US-41.463 |
| [#4616](https://github.com/Koniverse/SubWallet-Extension/issues/4616) | Update chainlist stable v0.2.113 (#4616) | 1.3.55 | 2025-09-05 | US-41.466 |
| [#4651](https://github.com/Koniverse/SubWallet-Extension/issues/4651) | Update chain-list stable v0.2.114 (#4651) | 1.3.56 | 2025-09-11 | US-41.468 |
| [#4668](https://github.com/Koniverse/SubWallet-Extension/issues/4668) | Update chain-list stable v0.2.115 (#4668) | 1.3.58 | 2025-09-19 | US-41.470 |
| [#4692](https://github.com/Koniverse/SubWallet-Extension/issues/4692) | Support HOLLAR mainnet (#4692) | 1.3.59 | 2025-09-23 | US-41.472 |
| [#4704](https://github.com/Koniverse/SubWallet-Extension/issues/4704) | Update chain-list stable v0.2.116 (#4704): | 1.3.59 | 2025-09-23 | US-41.472 |
| [#4693](https://github.com/Koniverse/SubWallet-Extension/issues/4693) | Update chain-list version v0.2.117 (#4693): | 1.3.60 | 2025-10-02 | US-41.473 |
| [#4808](https://github.com/Koniverse/SubWallet-Extension/issues/4808) | Update libs for SubWallet Extensions (#4808) | 1.3.71 | 2025-12-29 | US-41.482 |
| [#4908](https://github.com/Koniverse/SubWallet-Extension/issues/4908) | Migrate to ParaSpell V5 (#4908) | 1.3.72 | 2026-01-14 | US-41.488 |
| [#553](https://github.com/Koniverse/SubWallet-Extension/issues/553) | Add Suspace testnets into SubWallet (#553) | 0.5.6 | 2022-08-24 | US-41.49 |
| [#4957](https://github.com/Koniverse/SubWallet-Extension/issues/4957) | Update @subwallet-monorepos/subwallet-services-sdk 0.1.16 (#4957) | 1.3.73 | 2026-01-22 | US-41.492 |
| [#4968](https://github.com/Koniverse/SubWallet-Extension/issues/4968) | Support stDOT LSD sunset (#4968) | 1.3.77 | 2026-04-09 | US-41.493 |
| [#4988](https://github.com/Koniverse/SubWallet-Extension/issues/4988) | Extension – Some issues when merging in version 1.3.78 (#4988) | 1.3.79 | 2026-05-21 | US-41.495 |
| [#50](https://github.com/Koniverse/SubWallet-Extension/issues/50) | Fix some bugs with AlephZero balance (issue #50) | 0.3.1 | 2022-04-05 | US-41.5 |
| [#583](https://github.com/Koniverse/SubWallet-Extension/issues/583) | Some errors occurred when updating the caching mechanism (#583) | 0.6.7 | 2022-10-22 | US-41.50 |
| [#591](https://github.com/Koniverse/SubWallet-Extension/issues/591) | Fix bug inject provider not auto remove (#591) | 0.5.7 | 2022-09-06 | US-41.51 |
| [#612](https://github.com/Koniverse/SubWallet-Extension/issues/612) | Fix error of ipfs-gateway.cloud (#612) | 0.5.9 | 2022-09-07 | US-41.53 |
| [#628](https://github.com/Koniverse/SubWallet-Extension/issues/628) | Update default provider for Subspace Gemini 1 (#628) | 0.6.1 | 2022-09-13 | US-41.55 |
| [#679](https://github.com/Koniverse/SubWallet-Extension/issues/679) | Add USDT on Polkadot (#679) | 0.6.7 | 2022-10-22 | US-41.59 |
| [#783](https://github.com/Koniverse/SubWallet-Extension/issues/783) | Error while try to subscribe event data with ETH, BNB or another https provider (#783) | 0.6.9 | 2022-11-04 | US-41.69 |
| [#794](https://github.com/Koniverse/SubWallet-Extension/issues/794) | Bug parsing IPFS link (#794) | 0.7.1 | 2022-11-10 | US-41.70 |
| [#875](https://github.com/Koniverse/SubWallet-Extension/issues/875) | Add Subspace Gemini 3 Testnet (#875) | 0.7.4 | 2022-12-04 | US-41.78 |
| [#983](https://github.com/Koniverse/SubWallet-Extension/issues/983) | Add the coingecko key for Nodle (#983) | 0.7.9 | 2023-01-30 | US-41.84 |
| [#985](https://github.com/Koniverse/SubWallet-Extension/issues/985) | Support Shiden base PSP-34 contract (#985) | 0.7.9 | 2023-01-30 | US-41.85 |
| [#1077](https://github.com/Koniverse/SubWallet-Extension/issues/1077) | Add support Subspace Gemini 3c (#1077) | 0.8.2 | 2023-03-15 | US-41.87 |
| [#1089](https://github.com/Koniverse/SubWallet-Extension/issues/1089) | Update explorer for Gemini 3c, 2a (#1089) | 0.8.3 | 2023-03-29 | US-41.88 |
| [#1112](https://github.com/Koniverse/SubWallet-Extension/issues/1112) | Add ArtZero API & fix bug show NFT (#1112) | 0.8.4 | 2023-03-31 | US-41.89 |
| [#1117](https://github.com/Koniverse/SubWallet-Extension/issues/1117) | Update Azero block explorer (#1117) | 0.8.4 | 2023-03-31 | US-41.90 |
| [#1224](https://github.com/Koniverse/SubWallet-Extension/issues/1224) | Reset Wallet Feature (#1224) | 1.0.4 | 2023-05-12 | US-41.99 |
| [#1798](https://github.com/Koniverse/SubWallet-Extension/issues/1798) | Improve import security (#1798) | 1.1.10 | 2023-08-26 | US-5.5 |
| [#4989](https://github.com/Koniverse/SubWallet-Extension/issues/4989) | Signing popup crashes with "Unable to create Enum via index 9" when SignerPayload.assetId is a V5 cross-consensus Location (#4989) | 1.3.82 | 2026-07-06 | US-8.13 |
| [#2580](https://github.com/Koniverse/SubWallet-Extension/issues/2580) | Unique Network and Quartz NFTs support (#2580) | 1.1.36 | 2024-02-06 | US-9.1 |
| [#33](https://github.com/Koniverse/SubWallet-Extension/issues/33) | Display Moonbeam / Moonriver NFT (issue #33) | 0.3.1 | 2022-04-05 | US-9.3 |
| [#662](https://github.com/Koniverse/SubWallet-Extension/issues/662) | Support 3D viewer for NFT (#662) | 0.6.5 | 2022-09-24 | US-9.6 |
| [#1516](https://github.com/Koniverse/SubWallet-Extension/issues/1516) | Support display 3D NFT (#1516) | 1.0.10 | 2023-06-17 | US-9.6 |
| [#1651](https://github.com/Koniverse/SubWallet-Extension/issues/1651) | Fixed bug video NFT size (#1651) | 1.1.3 | 2023-07-21 | US-9.6 |
| [#3726](https://github.com/Koniverse/SubWallet-Extension/issues/3726) | Support ERC-1155 (#3726) | 1.3.5 | 2024-10-31 | US-9.4 |

## Linked — no citation, but an existing story owns the capability (inferred)

> These need a citation added to the named story, not a new story. Verify the match
> before relying on it — it is a shared-keyword inference, not a claim.

| issue | shipped as | release | date | → likely US |
| --- | --- | --- | --- | --- |
| [#360](https://github.com/Koniverse/SubWallet-Extension/issues/360) | Add staking support for CERE (#360) | 1.3.14 | 2025-01-24 | US-12.1 |

## Routed — residue: an area, but no story yet

## Unowned — capability area unclear, needs triage

| issue | bullet | release | date | assignee |
| --- | --- | --- | --- | --- |

