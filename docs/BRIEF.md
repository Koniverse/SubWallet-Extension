# Product Brief: SubWallet

## Executive Summary

SubWallet is a comprehensive non-custodial wallet solution for the Polkadot, Ethereum, TON, Cardano, and Bitcoin ecosystems. It operates as a browser extension, web application, and mobile app, giving users a single interface to hold, transfer, swap, stake, earn, and govern assets across more than 200 networks without switching between separate tools per chain. The product is positioned as "a Web3 multiverse gateway through which users can enjoy multi-chain services with utmost ease and absolute security." (docs.subwallet.app: Introduction)

The wallet is built atop Polkadot.js but deliberately extends far beyond it, adding five-ecosystem breadth, a yield-aggregation (Earning) layer, cross-chain swapping and bridging through multiple providers (Chainflip, HydraDX/Hydration, Uniswap, KyberSwap, SimpleSwap, Asset Hub), and an in-wallet governance interface for Polkadot OpenGov. Hardware wallet compatibility with Ledger, Keystone, and Polkadot Vault (QR-based), along with fiat on-ramp providers (Transak, Banxa, Coinbase Pay), rounds out a feature set designed to cover the full lifecycle of a multi-chain crypto user.

A Unified Account model is a central architectural commitment: a single seed phrase manages addresses across Substrate, EVM, Bitcoin, TON, and Cardano under one named account, eliminating the need to juggle separate wallets per ecosystem. The codebase is open-source and has undergone a security audit by Verichains. These foundations — breadth of chain coverage, unified key management, and verified security — define SubWallet's current identity and underpin its longer-term platform ambitions.

## The Problem

Participating in more than one blockchain ecosystem today requires managing multiple wallets simultaneously. A user holding DOT on Polkadot, ETH on Ethereum, ADA on Cardano, and BTC must install, configure, and context-switch between distinct extensions or apps, each with its own seed phrase, UI convention, and fee token. The resulting fragmentation means that basic operations — bridging an asset, staking a token, voting on a governance proposal — require navigating three to five separate tools before a single outcome is achieved.

Within the Polkadot ecosystem specifically, the dominant tooling (Polkadot.js) is technically capable but designed for developers, not everyday users. Nomination pool staking, OpenGov voting, XCM transfers, and proxy account management all exist on-chain but require CLI familiarity or deep UI literacy to access. The status quo locks governance participation and yield generation behind a skill threshold that most token holders cannot clear.

The cost of this fragmentation is compounded for users who want to act across ecosystems. Multi-chain balance confusion — not knowing which chain holds which token, or which wallet address corresponds to which account — is explicitly documented in SubWallet's internal Unified Account research as the core UX problem the product exists to solve. (Unified account research doc: Mục đích section; Chain abstraction research doc)

## The Solution

SubWallet resolves multi-chain fragmentation through a combination of broad network coverage, a unified key model, and an integrated feature set that handles the full range of on-chain actions users need to take.

**Multi-ecosystem asset management**: The wallet supports 200+ networks spanning Polkadot/Substrate parachains, Ethereum and EVM-compatible chains, Bitcoin (BIP44/84/86), TON, and Cardano. Users can view, send, and receive native tokens, ERC-20/PSP-22 fungible tokens, and NFTs (RMRK, ERC-721, PSP-34) from a single portfolio view.

**Unified Account**: A single seed phrase derives addresses for all supported ecosystems, with sub-account management. Users interact with multiple blockchain systems without managing per-chain key material. (Product Features CSV: Unified Account row; Unified account research doc)

**Cross-chain transfers and bridging**: XCM transfers across Polkadot/Kusama parachains, Snowbridge for Ethereum↔Polkadot Asset Hub, Avail Bridge, Polygon Unified Bridge, and an Across-protocol-backed cross-chain swap path (Bridge-Swap-Bridge routing). (product-history: bridge-xcm area, multiple shipped entries)

**Swap**: In-wallet token swap with multiple provider integrations — Chainflip, HydraDX/Hydration, Asset Hub DEX, Uniswap (including UniswapX), KyberSwap, and SimpleSwap — with cross-chain swap routing (Swap→Bridge and Bridge→Swap paths). Multi-step sequences can be approved with a single signature ("Allow signing once for multiple transactions", shipped Round 1). (product-history: swap area)

**Earning**: A yield aggregator that surfaces staking, nomination pool, collator staking, and liquid staking options across chains, with path simulation, step-status tracking, and XCM channel support for deposit routing. Supported protocols include nomination staking (Polkadot/Kusama relay chains and parachains), nomination pools, parachain collator staking (Moonbeam/Moonriver, Astar, etc.), and liquid staking. (product-history: earning area)

**OpenGov voting**: Phase 1 of in-wallet Polkadot OpenGov support ships referenda listing, referendum detail, vote/revote/unvote flows, locked token detail, and unlock flows. (product-history: governance area, issue #6310)

**NFT management**: Display and transfer NFTs across Polkadot/Substrate (RMRK 1.0/2.0, Unique/Quartz, Statemine/Statemint, PSP-34/WASM) and EVM chains (Moonbeam/Moonriver, Astar), including 3D NFT viewer support.

**dApp connectivity**: MetaMask-compatible EVM provider, Substrate inject API, WalletConnect v2 (Substrate + EVM), EIP-6963 multi-provider discovery, CIP-30 Cardano connector (connect/signData/signTx/submitTx/getUtxo), and Bitcoin dApp connection (connect/getAddresses/signMessage/signPsbt/sendTransfer). SubWallet is listed in the Wagmi predefined connector list and integrated into web3-onboard.

**Fiat on/off-ramp**: Buy crypto with fiat via Transak, Banxa, and Coinbase Pay; off-ramp (Transak) in WebApp. VARA, TAO, TON, Cardano, and more tokens supported.

**Hardware wallet support**: Ledger Nano (Substrate generic app + per-chain apps + EVM app), Keystone (QR-based, Substrate), and Polkadot Vault / Parity Signer (QR-based). Broad per-chain Ledger coverage including Polkadot, Kusama, Acala, Aleph Zero, Astar, Avail, Centrifuge, Darwinia, Vara, and more.

**Proxy and multisig accounts**: Proxy account management (Polkadot proxy pallet model, Phase 1 shipped). Multisig account support Phase 1 shipped for the extension (Substrate/Polkadot; Bitcoin/EVM multisig explicitly out of initial scope).

**Security**: Non-custodial, open-source, audited by Verichains, phishing protection via @polkadot/phishing and ChainPatrol, master password with strength policy, auto-lock, and "demonic vulnerability" mitigation for seed phrase handling.

## What Makes This Different

SubWallet's primary differentiation is the combination of five-ecosystem depth with a single unified account model — a breadth that narrow-ecosystem wallets do not offer, paired with a UX abstraction that multi-tool setups cannot match.

> **Honest caveat**: No structured competitive analysis document was found in the corpus. The table below is compiled from incidental competitor mentions in technical research documents and from docs.subwallet.app positioning language. Claims against MetaMask, Talisman, and Phantom are not explicitly documented in the available materials.

| Competitor | What They Do | SubWallet's Position |
|---|---|---|
| Polkadot.js Extension | The reference Substrate/Polkadot browser wallet; developer-grade tooling | SubWallet is "built atop Polkadot.js" but adds a consumer-grade UI, staking, OpenGov, NFT, swap, and EVM/Bitcoin/TON/Cardano support that Polkadot.js does not provide |
| Nova Wallet | Mobile-first Polkadot/Substrate wallet with XCM and staking | Nova is referenced in chain abstraction research as a peer in the Polkadot wallet space; SubWallet differentiates via browser extension + web app presence, five-ecosystem breadth, and the Unified Account model |
| MetaMask | Dominant EVM browser wallet; extensive dApp ecosystem | MetaMask covers EVM only; SubWallet adds Polkadot/Substrate, Bitcoin, TON, and Cardano ecosystems alongside full EVM compatibility |
| ThorSwap / Near Intents | Cross-chain swap protocols | Referenced as swap-protocol competitors in Optimex research; SubWallet integrates swap as a wallet feature rather than a standalone product |
| Klaster, Particle Network | Chain-abstraction services (ERC-4337 / account abstraction) | Evaluated as potential integrations/collaborators; SubWallet's longer-term SDK ambition positions it as a peer/alternative layer (research stage only) |

Key inferred advantages traceable to corpus:
- **Multi-ecosystem breadth**: Five ecosystems (Polkadot/Substrate + EVM + Bitcoin + TON + Cardano) in a single wallet — documented as the core product positioning. (docs.subwallet.app: Introduction)
- **Unified Account**: Single seed phrase for all ecosystems — a deliberate architectural investment to eliminate the "multiple wallets" UX problem. (Unified account research doc)
- **Chain-abstraction SDK ambition**: Planned public SDK packaging multi-chain logic for external dApp teams — not yet shipped, at experimental/PoC stage. (Chain abstraction research doc)
- **Open-source + Verichains audit**: Transparent, audited codebase. (docs.subwallet.app: Security & Privacy)

## Who This Serves

> Warning: Personas inferred from positioning — pending product validation.

No dedicated persona research document was found in the corpus. The following four personas are inferred with LOW confidence from product positioning, feature set, and design intent. A product input session is needed to validate, rank, and refine them.

> **Ranking note (corrected against public positioning):** SubWallet's public-facing identity is Polkadot-first — the Chrome Web Store listing is literally titled "SubWallet - Polkadot Wallet", the documentation lives under a Polkadot-Wallet brand, and Polkadot-area features (staking, OpenGov, XCM) are the largest areas in the product history. The Polkadot-native user is therefore the **anchor persona by current branding**, while the multi-chain DeFi user represents the **growth/expansion direction** the Unified Account and five-ecosystem breadth are built toward. The two are treated below as **co-primary**, with the Polkadot persona reflecting present market identity and the multi-chain persona reflecting product ambition. (Chrome Web Store: "SubWallet - Polkadot Wallet"; docs.subwallet.app)

**Co-primary user (anchor / current identity): Polkadot Ecosystem Participant**
- A DOT/KSM holder or parachain community member who stakes, votes via OpenGov, and participates in crowdloans/parachain activity.
- Pain point: Polkadot.js is developer-grade and does not surface nomination, pool staking, and governance voting in an accessible UI; other consumer wallets lack Polkadot-native features.
- Job to be done: stake DOT easily, vote on referenda, track rewards, and manage parachain assets — all without CLI tools or developer-grade interfaces.
- Evidence: SubWallet is built atop Polkadot.js but provides consumer-facing staking, OpenGov voting, and XCM transfer UI. Polkadot-area features represent the largest single area in the product history (staking: 60 entries, bridge-xcm: 41 entries). The product is publicly branded and listed as "SubWallet - Polkadot Wallet". (docs.subwallet.app: Core Capabilities; Chrome Web Store; product-history)

**Co-primary user (growth direction): Multi-Chain DeFi Participant**
- A crypto user actively engaged in two or more blockchain ecosystems (e.g., holds DOT on Polkadot and ETH/ERC-20s on Ethereum, uses dApps across both).
- Pain point: managing multiple wallet extensions simultaneously, bridging assets across chains, signing multiple approvals for a single DeFi action.
- Job to be done: access all assets and earn/stake/swap across chains without juggling multiple extensions or tracking which token lives on which chain.
- Evidence: Unified Account design doc explicitly names multi-wallet fragmentation as the problem to solve; the Earning and Swap feature sets target active yield-seeking behavior; cross-chain swap routing (Bridge-Swap-Bridge) addresses multi-hop DeFi flows. This persona reflects the five-ecosystem expansion (TON, Cardano, Bitcoin added alongside the Polkadot/EVM base) rather than the current Polkadot-first public identity.

**NFT / Web3 Explorer** (mentioned, lower confidence)
- User active in NFT collections and dApps across EVM chains and Polkadot; needs a single display layer for multi-chain NFTs and wants to transfer them without switching wallets. Evidence: NFT management is a core feature with 31 issue entries and broad collection integrations. (product-history: nft area)

**Crypto Newcomer** (mentioned, lowest confidence)
- User new to Web3 who wants to buy crypto with a card and explore DeFi with minimal learning curve. Evidence: fiat on/off-ramp and i18n (Vietnamese, Chinese, Japanese, Russian shipped) suggest a broader audience, but no onboarding-funnel document was found to confirm this persona. (product-history: onboarding, fiat-onramp, settings/i18n areas)

## Success Criteria

Internal KPIs / north-star metrics are pending product input. The table below lists **publicly observable traction metrics** as point-in-time proxies (observed outcomes, not product-set targets).

| Dimension | Observed proxy metric (public, point-in-time) | Source |
|---|---|---|
| Adoption | ~200,000 extension users | Chrome Web Store ("SubWallet - Polkadot Wallet") |
| User satisfaction | 4.6 / 5 average rating across 159 ratings | Chrome Web Store reviews |
| Ecosystem coverage | 5 ecosystems; 200+ networks; 450+ tokens | docs.subwallet.app: Introduction |

_Store figures verified live as of 2026-06 (extension v1.3.80). These move over time — re-check the live listing before any external use._

**Candidate north-star / KPI directions to validate with product** (inferred, not documented):
- Growth: monthly active wallets and new-account activation rate
- Engagement: share of users performing an on-chain action (stake / swap / vote) vs. hold-only
- Retention: 30-day return rate; cross-ecosystem usage (users active on ≥2 ecosystems)
- Quality: sustained store rating ≥ 4.5; support-ticket / phishing-incident rate

## Scope

> **Count discrepancy note**: SubWallet's own pages cite different coverage figures — the Introduction page states "200+ networks / 450+ tokens", while other documentation/listing pages state "150+ networks / 450+ tokens / 80+ dApps". The "200+ networks" figure is used throughout this brief; treat all such counts as directional and verify against the live listing before external use.

### In Scope (MVP — shipped and ready)

- **Five ecosystems**: Polkadot/Substrate (relay chains + 200+ parachains), Ethereum and EVM-compatible chains, Bitcoin (BIP44/84/86), TON, Cardano
- **Asset management**: Send/receive native tokens, ERC-20/PSP-22 fungible tokens; show/hide zero-balance tokens; portfolio view across all accounts
- **Cross-chain transfer and bridge**: XCM transfers (Polkadot/Kusama ecosystem), Snowbridge (ETH↔Polkadot Asset Hub), Avail Bridge, Polygon Unified Bridge
- **Swap**: In-wallet token swap via Chainflip, HydraDX/Hydration, Asset Hub DEX, Uniswap (including UniswapX Dutch Swap), KyberSwap, SimpleSwap; cross-chain swap routing (Bridge-Swap and Swap-Bridge paths); single-signature multi-step approval (Round 1)
- **Earning**: Yield aggregator covering nomination staking, nomination pools, collator staking, liquid staking; path simulation and step-status tracking
- **NFT management**: Display and transfer NFTs across Polkadot/Substrate collections (RMRK 1.0/2.0, Unique/Quartz, PSP-34) and EVM chains; 3D NFT viewer
- **Portfolio view**: Unified balance across all accounts and chains; show/hide balance; token sorting by value
- **dApp connectivity**: MetaMask-compatible EVM provider, Substrate inject API, WalletConnect v2, EIP-6963, CIP-30 Cardano connector, Bitcoin dApp connection; Wagmi and web3-onboard listings
- **OpenGov**: Phase 1 — referenda list, referendum detail, vote/revote/unvote, locked-token detail, unlock flow
- **Proxy accounts**: Phase 1 — proxy service, extrinsic handling, manage-proxies UI, proxy signing
- **Multisig accounts**: Phase 1 — multisig account management, pending transaction detection, multisig actions (Substrate/Polkadot; Bitcoin/EVM multisig out of Phase 1 scope)
- **Fiat on/off-ramp**: Buy via Transak, Banxa, Coinbase Pay; off-ramp via Transak (WebApp); coverage includes DOT, ETH, ADA, VARA, TAO, TON, and more
- **Hardware wallet support**: Ledger Nano (Substrate generic + per-chain apps + EVM app), Keystone (QR-based, Substrate), Polkadot Vault / Parity Signer (QR-based)
- **Unified Account model**: Single seed phrase managing addresses across all five ecosystems; sub-account derivation; custom derivation path
- **i18n**: Vietnamese, Chinese, Japanese, Russian (Round 1 shipped); internationalized background error messages
- **Platforms**: Chrome/Firefox browser extension (MV3), web app, mobile (React Native with web-runner strategy)
- **Security**: Non-custodial, open-source, Verichains audit, phishing protection (Polkadot phishing list + ChainPatrol), master password with strength policy, auto-lock

### Out of Scope (deferred / research-only as of corpus date)

- **Chain abstraction SDK**: Planned developer-facing SDK packaging multi-chain logic for external teams — at experimental/PoC stage; ERC-4337, EIP-7702, and EIP-7683 integrations not production-ready. (Chain abstraction research doc)
- **One Signing / batch transactions (Phase 2 and beyond)**: Round 2 multi-transaction signing and balance-change-driven multi-step handling are planned but not shipped. (product-history: swap/transaction area, Milestone 10 items)
- **Starknet integration**: Product requirements documented; integration roadmap CSV exists; not shipped. (Other Blockchains Support doc; Starknet integration roadmap doc)
- **Cosmos ecosystem**: Under research; no implementation shipped. (Other Blockchains Support doc)
- **Midnight Network, Enjin Blockchain, Flow Network**: Under research. (Other Blockchains Support doc)
- **TON full dApp provider**: TON dApp connection UI and improved Cardano dApp signing planned for Milestone 10; not shipped as of corpus. (product-history: cardano/ai-defai area)
- **OpenGov Phase 2**: WebApp governance feature and further improvements open. (product-history: governance area)
- **Multisig Phase 2**: Account detection, UX optimization, history screen, mobile/WebApp multisig. (product-history: multisig area)
- **Balance history**: Historical portfolio balance tracking listed as "Not started" in Product Features CSV.
- **Web3Auth social login**: Proposal to allow wallet management via Google/Facebook login — open, not started.
- **Architecture modernization (monorepo/shared services)**: In-progress design intent for shared TypeScript services across extension, mobile, and web; not yet shipped as a unified architecture. (Xây dựng kiến trúc mới doc)
- **Performance overhaul**: Caching, data-indexer for multi-chain balance fetching, lazy loading — identified as needed; implementation pending. (Speed-up Wallet UX research doc)
- **Bitcoin/EVM multisig**: Explicitly deferred from Phase 1 multisig scope. (Multisig TDD doc)

## Vision

SubWallet's trajectory points toward becoming the default multi-chain access layer for Web3 — a wallet that abstracts away not just key management but the entire complexity of operating across divergent blockchain architectures. The chain-abstraction-as-a-service direction, if realized, would extend SubWallet's multi-chain logic beyond the wallet itself into a developer-facing SDK that other teams can use to build dApps or wallets with the same cross-chain breadth. In the near term, the Unified Account model and expanding ecosystem coverage (Cardano and Bitcoin added as first-class ecosystems alongside the original Polkadot/EVM base) demonstrate that the product is executing on multi-chain universality as a concrete engineering commitment, not just a positioning tagline. If the current trajectory continues — chain abstraction SDK reaching production, performance and architecture modernization completing, and governance/multisig features maturing — SubWallet would stand as a rare wallet that treats all major ecosystems as peers rather than favoring one home chain, positioning it as infrastructure-grade tooling for the multi-chain era. (docs.subwallet.app: Introduction; Chain abstraction research doc; Roadmap intent in vision-and-strategy)
