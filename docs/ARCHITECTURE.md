# ARCHITECTURE — SubWallet-Extension

> Last updated: 2026-06-03 (v1.3.79)
> Maintainer: Koniverse team

## System overview

SubWallet-Extension is a non-custodial multi-chain cryptocurrency wallet
delivered as a Chromium/Firefox browser extension and a standalone web
application. It supports four blockchain ecosystems: Substrate/Polkadot
(relay chains and parachains), EVM (Ethereum and EVM-compatible chains),
Bitcoin, and TON. The architecture is a message-passing monolith: a
persistent background service owns all state, key material, and on-chain
communication, while multiple UI surfaces (extension popup, full-page
web app) communicate with it exclusively over the browser's message-bus
API. The codebase is organised as a Yarn 3 monorepo of twelve TypeScript
packages with explicit dependency boundaries between background logic,
UI, and shared protocol layers. Architectural drivers are: self-custody
(keys never leave the background environment), multi-chain breadth (100+
networks from a single install), and portability (the same background
logic runs inside the browser extension service worker and inside a
web-runner iframe for mobile webview contexts).

## Tech stack

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Build target (Node) | Node.js | 12 (`.nvmrc`) | Lowest-common-denominator for extension bundling; dev requires Node 18+ |
| Package manager | Yarn 3 (berry), workspaces | 3.x | Monorepo workspace linking; deterministic lock file |
| Language | TypeScript | 5.x (per tsconfig) | Strict typing across background and UI code |
| UI framework | React | 18.2 | Concurrent mode; hooks-based state; shared between popup and web app |
| UI components | `@subwallet/react-ui`, styled-components | 5.1.2-b77 / ^5.3.6 | In-house component library + CSS-in-JS theming |
| State management | Redux Toolkit + redux-persist | ^1.9.1 / ^6.0.0 | Slice-based reducers; persisted to chrome storage via redux-persist |
| Routing | react-router-dom | ^6.8.2 | Client-side navigation for popup and web app |
| Substrate connectivity | `@polkadot/api`, `@polkadot/rpc-provider` | ^16.4.2 | Full Substrate node API plus lightweight WsProvider for balance queries |
| Substrate crypto | `@polkadot/keyring`, `@polkadot/util-crypto`, `@subwallet/keyring`, `@subwallet/ui-keyring` | ^13.5.3 / ^0.1.14 | Key derivation, signing, address encoding for Substrate and EVM |
| EVM connectivity | `ethers`, `web3` | ^6.4.2 / ^1.10.4 | EVM RPC, contract calls, and MetaMask-compatible provider injection |
| TON connectivity | `@ton/core`, `@ton/crypto`, `@ton/ton` | ^0.56.3 / ^3.2.0 / ^15.0.0 | TON blockchain client and cryptographic primitives |
| Bitcoin support | `bitcoinjs-lib` | 6.1.5 | Transaction construction and address generation for Bitcoin |
| Cardano support | `@emurgo/cardano-serialization-lib-browser` | ^13.2.0 | Cardano serialization for browser environments |
| Local database | `dexie` + `dexie-export-import` | ^3.2.2 / ^4.0.7 | IndexedDB abstraction for structured background storage |
| GraphQL client | `@apollo/client` | ^3.7.14 | SubSquid / SubQuery history and governance data queries |
| HTTP client | `axios` | ^1.13.2 | REST API calls (middleware services, SubSquid, chain-list updates) |
| Phishing protection | `@polkadot/phishing` | ^0.25.15 | Automatically updated phishing site and address list |
| Build tool | Webpack 5 | ^5.102.1 | Extension bundle with code-splitting for Firefox file-size limits |
| Lint / format | ESLint, Prettier | per config | Enforced via `yarn lint` pre-commit check |
| CI | GitHub Actions | — | Automated build, lint, test, and release packaging |

## Component architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  Browser Extension (Manifest V3)                                    │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Background Service Worker                                    │  │
│  │  (packages/extension-koni → background.ts)                   │  │
│  │                                                              │  │
│  │  KoniState ──► ChainService ──► Substrate ApiPromise/WS      │  │
│  │       │    ──► BalanceService  ──► EVM Web3/Ethers           │  │
│  │       │    ──► EarningService  ──► TON @ton/ton              │  │
│  │       │    ──► NFTService      ──► Bitcoin bitcoinjs-lib     │  │
│  │       │    ──► StakingService                                │  │
│  │       │    ──► TransactionService                            │  │
│  │       └──► KeyringService (@subwallet/keyring)               │  │
│  │                                                              │  │
│  │  KoniExtension (pri handlers)  ◄── Extension pages           │  │
│  │  KoniTabs     (pub handlers)   ◄── Injected dApp scripts     │  │
│  │  KoniCron     (scheduled jobs)                               │  │
│  └─────────────────┬────────────────────────────────────────────┘  │
│                    │ Chrome message bus (chrome.runtime.sendMessage) │
│         ┌──────────┴──────────────────────┐                        │
│         │                                 │                        │
│  ┌──────▼──────────┐            ┌─────────▼──────────┐            │
│  │  popup.html     │            │  portfolio.html     │            │
│  │  extension-     │            │  (expand view)      │            │
│  │  koni-ui        │            │  extension-koni-ui  │            │
│  └─────────────────┘            └────────────────────┘            │
│                                                                     │
│  content-script (extension-inject) injected into every browser tab  │
│    └── exposes window.injectedWeb3 for dApp Substrate access        │
│    └── exposes window.ethereum for MetaMask-compatible EVM dApps    │
└─────────────────────────────────────────────────────────────────────┘

Alternate runtimes (no extension):
  web-runner ──► background logic in iframe/WebView (mobile webview)
  webapp     ──► standalone web app (extension-web-ui + extension-base)
```

### Package map

| Package | Purpose | Key dependencies |
|---------|---------|-----------------|
| `@subwallet/extension-base` | Core background services: account management, balance, chain connectivity, transaction, earning, NFT, staking, message-bus handlers, storage, cron jobs, inject scripts | `@polkadot/api`, `ethers`, `web3`, `@ton/core`, `bitcoinjs-lib`, `dexie`, `@subwallet/keyring`, `@subwallet/chain-list`, `@walletconnect/sign-client`, `rxjs`, `@apollo/client` |
| `@subwallet/extension-chains` | Static chain definitions (metadata, genesis hashes, SS58 prefixes) exposed by the extension | `@polkadot/networks`, `@polkadot/util`, `@polkadot/util-crypto`, `@subwallet/extension-inject` |
| `@subwallet/extension-compat-metamask` | MetaMask-compatible EVM provider shim injected into dApp pages | `@metamask/detect-provider`, `@polkadot/types`, `web3`, `@subwallet/extension-inject` |
| `@subwallet/extension-dapp` | Convenience wrapper around injected globals for dApp developers (Substrate side) | `@polkadot/util`, `@polkadot/util-crypto`, `@subwallet/extension-inject` |
| `@subwallet/extension-inject` | Generic injector that populates `window.injectedWeb3` and related interfaces for any conforming extension | `@polkadot/rpc-provider`, `@polkadot/types`, `@subwallet/keyring`, `web3-core` |
| `@subwallet/extension-koni` | Main extension compile entry: wires background service worker and popup bundles; Webpack build lives here | `@subwallet/extension-base`, `@subwallet/extension-inject`, `@subwallet/extension-koni-ui`, `@emurgo/cardano-serialization-lib-browser` |
| `@subwallet/extension-koni-ui` | React UI for the browser extension popup and expand view | `react` 18, `styled-components`, `react-router` v6, `@reduxjs/toolkit`, `@subwallet/react-ui`, `@subwallet/extension-base`, `@polkadot/hw-ledger`, `@ledgerhq/hw-app-eth` |
| `@subwallet/extension-mocks` | Test fixtures and chrome API stubs (sinon-chrome) for unit tests across packages | `sinon-chrome` |
| `@subwallet/extension-web-ui` | React UI for the standalone web application (webapp / web-runner); mirrors extension-koni-ui with web-specific adaptations | `react` 18, `styled-components`, `react-router-dom` ~6.9, `@reduxjs/toolkit`, `@subwallet/react-ui`, `@subwallet/extension-base`, `axios` |
| `@subwallet/subsquare-api-sdk` | HTTP SDK for Subsquare governance and referendum APIs | `@polkadot/util`, `axios` |
| `@subwallet/web-runner` | Hosts the background service worker logic inside a WebView iframe so the wallet can run in mobile or non-extension web environments; uses extension-koni-ui for UI | `@subwallet/extension-base`, `@subwallet/extension-inject`, `@subwallet/extension-koni-ui`, `@emurgo/cardano-serialization-lib-browser` |
| `@subwallet/webapp` | Standalone web application bundle; combines extension-web-ui with background logic for a fully self-contained browser web app | `@subwallet/extension-base`, `@subwallet/extension-inject`, `@subwallet/extension-web-ui`, `@emurgo/cardano-serialization-lib-browser` |

### Runtime split

All API calls and key operations must be processed in the background
environment. Extension pages and inject scripts hold no private key
material and do not call chain APIs directly.

```
  UI Surface (extension-koni-ui / extension-web-ui)
       │
       │  messaging.ts — typed request/response wrappers
       │  chrome.runtime.sendMessage (extension) / postMessage (web-runner)
       ▼
  Message Bus (extension-base: KoniExtension / KoniTabs)
       │  routes by message type prefix:
       │    pri(…) — privileged, only extension pages
       │    pub(…) — public, injectable by dApps via tabs
       ▼
  Background Services (KoniState, ChainService, BalanceService, …)
       │
       ├── Substrate: @polkadot/api ApiPromise / WsProvider
       ├── EVM:       ethers JsonRpcProvider / web3 Web3
       ├── TON:       @ton/ton TonClient
       └── Bitcoin:   bitcoinjs-lib
```

## Data layer

| Store | Technology | Scope | Persistence |
|-------|-----------|-------|-------------|
| Structured extension data | IndexedDB via `dexie` (^3.2.2) | Background process | Survives browser restarts; dexie-export-import enables backup/restore |
| Key-value extension state | `chrome.storage.local` | Background process | Survives browser restarts; used for settings, account metadata, network state |
| UI Redux state | `redux-persist` backed by `chrome.storage.local` | UI process | Persisted slice snapshots for fast rehydration on popup open |
| In-memory subscription state | RxJS Subjects (`SubscribableStore`) | Background process | Volatile; republished to UI subscribers on reconnect |

State managed by `KoniState` (in `extension-base`) is the authoritative
source. UI components receive state updates via subscription messages
from the background; they do not maintain independent chain-query
subscriptions. Cronjobs (`KoniCron`) run in the background to refresh
balances, staking data, prices, and NFT metadata on schedule.

## Cross-chain support

Chain definitions live in `@subwallet/chain-list` (an external monorepo
package, version `0.2.127`). The extension bundles and auto-updates this
list to add new chains, tokens, and logos without a code release.

The `extension-chains` package wraps the static genesis hash and SS58
prefix metadata used for account validation and address encoding, sourced
from `@polkadot/networks`.

`ChainService` (in `extension-base`) manages per-chain API objects:

| Ecosystem | API object | Library |
|-----------|-----------|---------|
| Substrate (Polkadot, Kusama, parachains) | `SubstrateApi` (wraps `@polkadot/api` ApiPromise + light-client fallback via `@substrate/connect`) | `@polkadot/api`, `@substrate/connect` |
| EVM (Ethereum, Base, Moonbeam, …) | `EvmApi` (wraps `web3` Web3 and `ethers` JsonRpcProvider) | `web3`, `ethers` |
| TON | TON client | `@ton/ton` |
| Bitcoin | UTXO builder | `bitcoinjs-lib` |

Each enabled chain gets one API instance managed by `ChainService`. RAM
usage is controlled by creating lightweight WsProvider-only connections
for balance queries and instantiating the full `ApiPromise` only when
complex extrinsic construction is needed (see AD-07).

XCM cross-chain transfers are coordinated in `extension-base` using
Paraspell-compatible `MultiLocation` v3 formatting. XCM route
availability is configurable per chain pair so individual routes can be
toggled without a code release in response to partner-chain incidents
(see AD-09).

## Security model

| Concern | Approach | Detail |
|---------|---------|--------|
| Key custody | Non-custodial; keys never transmitted | `@subwallet/keyring` / `@subwallet/ui-keyring` hold all private key material exclusively in the background service worker |
| Key encryption at rest | `browser-passworder` (AES-256-GCM via master password) | Raw key bytes are never stored; only encrypted blobs written to `chrome.storage.local` |
| Master password | Single password unlocks all accounts | Unified unlock flow; password-derived key held in memory while unlocked, dropped on auto-lock |
| Message bus isolation | `pri(…)` messages only reachable from extension pages; `pub(…)` messages available to injected content scripts | Background enforces prefix-based routing; inject scripts cannot call privileged handlers |
| Phishing protection | `@polkadot/phishing` + ChainPatrol API | Phishing list auto-updates online; flagged sites and addresses surfaced with a blocking warning screen |
| Hardware wallets | Ledger (via `@polkadot/hw-ledger`, `@ledgerhq/hw-app-eth`) and QR signers (Parity Signer, Keystone) | Signing payloads sent to device; private keys never enter the extension |
| Seed phrase display | Input elements only, never textarea | Prevents "demonic vulnerability" autocomplete/autofill leaks (fixed in v1.1.10, issue #1798) |
| dApp injection scope | Content script injected into all tabs; authorization stored per dApp origin | Unauthorized dApps see the provider object but receive rejection until user explicitly approves |

## Build and deploy

### Extension build

```
packages/extension-koni/
  ├── webpack.config.cjs          ← entry point for extension build
  ├── src/background.ts           ← compiled to background service worker
  ├── popup.html / portfolio.html ← extension popup and expand view
  └── manifest.json               ← Manifest V3 descriptor
```

Build command: `yarn webpack:build:extension`
Dev watch:     `yarn watch-dev`

The Webpack config splits the output into many smaller chunks (see AD-06)
to satisfy Firefox's per-file size limits on extension submissions.
WASM modules (`@polkadot` crypto, Cardano serialization, etc.) are
loaded via `wasm-unsafe-eval` CSP in the manifest, required for MV3
compliance (resolved Chrome 102+, see AD-08).

### Web app build

```
packages/webapp/
  ├── webpack.config.cjs   ← entry for standalone web app
  └── src/index.tsx        ← mounts extension-web-ui + background bridge
```

Build command: `yarn webapp:build`
Dev server:    `yarn webapp:dev`  /  `yarn webpack:dev:webapp`

### Web-runner build

```
packages/web-runner/
  └── webpack.config.cjs   ← entry for mobile WebView host
```

Build command: `yarn web-runner:build`
Dev server:    `yarn web-runner:dev`

### Release versioning

The canonical user-facing version is `1.3.79`, recorded in:
- Root `package.json` (`"version": "1.3.79"`)
- `VERSION` file (repo root)

Internal monorepo packages carry the suffix `-1` (`1.3.79-1`).
CI (GitHub Actions) generates dev versions automatically; stable releases
require manual version bump in root `package.json` and `CHANGELOG.md`
update before tagging.

## Architecture decisions

| ID | Topic | Decision | Rationale | Citation |
|----|-------|---------|-----------|---------|
| AD-01 | IndexedDB via dexie for background storage | Use `dexie` (IndexedDB abstraction) as the primary structured store in the background service worker | Provides async schema migrations, a clean query API, and export/import support; outlasted PouchDB evaluation (issue #782) as sufficient without added complexity | issue #782; `extension-base` `dexie` dep |
| AD-02 | ChainService per-chain API objects | Each supported chain gets a dedicated API object (`SubstrateApi` or `EvmApi`) managed by a central `ChainService` | Encapsulates connect/disconnect lifecycle, retry logic, and metadata caching per chain; replaces ad-hoc chain lookups (issues #894, #926, #1222) | issues #894, #1222; shipped v0.7.6 |
| AD-03 | Background / UI message-bus isolation | All chain calls and key operations run exclusively in the background; UI communicates only via typed messages (`pri(…)` / `pub(…)`) | Prevents direct key or RPC exposure in the UI process; `pri` prefix enforces privileged access for extension pages only | `extension-base` README; README.md message-passing docs |
| AD-04 | Non-custodial keyring confined to background | `@subwallet/keyring` and `@subwallet/ui-keyring` are instantiated only in the background service worker; no private key bytes flow to UI or inject scripts | Eliminates key exfiltration via XSS or compromised dApp pages; hardware-wallet signing delegates to device | issues #433; security area entries |
| AD-05 | Yarn 3 monorepo package boundaries | Codebase split into twelve packages with explicit peer/runtime dependencies | Enables code reuse across extension and mobile/web contexts (`extension-base` shared by extension-koni, web-runner, webapp); prevents coupling between UI and background logic | issues #276, #169, #594; AGENTS.md §3 |
| AD-06 | Webpack 5 bundle splitting | Extension output split into many smaller chunks rather than one monolithic bundle | Avoids Firefox extension submission file-size limits (~4 MB per file cap); reduces memory overhead from large monolithic JS files | issues #48, #80, #131; shipped v0.3.6 |
| AD-07 | Lightweight WsProvider for balance queries; full ApiPromise deferred | Use a custom lightweight connector for balance/token queries; instantiate full `@polkadot/api` ApiPromise only for extrinsic construction | Full ApiPromise consumed ~137 MB for 4 chains / ~264 MB for 20 chains; WsProvider-only mode requires only ~72 MB regardless of chain count | issues #217, #232; PR #3024; shipped v1.1.64 |
| AD-08 | Manifest V3 migration with service worker background | Rebuild background layer around MV3 event-driven service worker rather than polyfilling the MV2 persistent-page model | Chrome enforcement timeline left no viable alternative; WASM support resolved via `wasm-unsafe-eval` CSP from Chrome 102; service worker shutdown/wake lifecycle required new state-persistence strategy | issues #349, #413, #412, #707, #782 |
| AD-09 | Per-chain XCM route toggle | XCM transfer routes are individually configurable per chain pair and can be disabled at runtime without a code release | Enables rapid response to partner-chain security incidents (e.g., Acala 2022 incident, issue #667) without requiring a full extension release cycle | issues #667, #695; bridge-xcm decision entries |
| AD-10 | Polkadot-js fork with upstream rebase strategy | Fork `polkadot-js/extension` and maintain `origin` remote so upstream changes can be rebased at any time | Minimises divergence risk and keeps the extension compatible with polkadot-js tooling; avoids full-rewrite maintenance burden | issue #15; decided 2022-03-15 |

Individual decisions are recorded in [CONTEXT.md](CONTEXT.md).
Link new architecture decisions from CONTEXT.md here as they are recorded.
