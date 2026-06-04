<!--
  APPEND-ONLY — never edit or delete a past entry (RULE-7).
  To revise a decision add a new D<N> entry that references D<M> by number.
  See .agents/skills/koni-docs/references/templates/context.md for the full guide.
-->

---

---

---

## Phase 0 — Foundation & Early Architecture (2022, shipped v0.3.x–v0.5.x)

### D1. Fork polkadot-js extension rather than copying code

**Context**: The team needed to start from the polkadot-js browser extension codebase and faced a choice between copying the source files and maintaining a git fork with a tracked remote.

**Decision**: Fork the official polkadot-js extension repository and maintain a git remote `origin` pointing to upstream, so that improvements can be rebased at any time.

**Rationale**: Keeping a live remote minimises divergence risk and ensures the extension stays compatible with polkadot-js tooling. Copying code independently would make future upstream merges manual and error-prone.

**Alternatives considered**:
- Copy code over and maintain independently — rejected: divergence would accumulate quickly.
- Full rewrite without polkadot-js dependency — rejected: too high a risk for the initial release.

**Impact**: Upstream polkadot-js bug-fixes and API changes can be rebased rather than ported manually.

**Date**: 2022-03-15
**Version**: pre-v0.3.x

**Citations**: [#15](https://github.com/Koniverse/SubWallet-Extension/issues/15)

---

### D2. Replace ApiPromise with a lightweight connector for balance/token queries

**Context**: Full `polkadot.js ApiPromise` consumed approximately 137 MB RAM for 4 chains, growing to ~264 MB for 20 chains, making the extension unusable on modest hardware.

**Decision**: Replace `ApiPromise` with a custom lightweight `WsProvider`-only connector for balance and token queries, deferring full `ApiPromise` only for complex operations such as extrinsic construction.

**Rationale**: Lightweight connections required only ~71–72 MB regardless of chain count — a >3× saving at 20 chains. Keeping `ApiPromise` would have made the extension impractical for users with many networks enabled.

**Alternatives considered**:
- Keep `ApiPromise` but limit concurrent connections — rejected: still RAM-intensive and limits network support.
- Use SubQuery/SubSquid APIs for all data — rejected: introduces off-chain dependency risk and latency.

**Impact**: Dramatically reduced per-session RAM; separate `Dotsama connector` / `ChainService` architecture created to manage lightweight connections.

**Date**: 2022-05-10
**Version**: pre-v0.5.x

**Citations**: [#217](https://github.com/Koniverse/SubWallet-Extension/issues/217), [#232](https://github.com/Koniverse/SubWallet-Extension/issues/232), [PR #3024](https://github.com/Koniverse/SubWallet-Extension/pull/3024)

---

### D3. Rebuild the background layer for Chrome Manifest V3 (initial research)

**Context**: Chrome announced its Manifest V3 migration roadmap. Research identified two major blockers: WASM support (resolved via `wasm-unsafe-eval` CSP from Chrome 102) and the service-worker model replacing persistent background pages.

**Decision**: Rebuild the background layer around MV3's event-driven service worker rather than polyfilling the old MV2 behaviour.

**Rationale**: Polyfilling MV2 semantics in MV3 would create a fragile compatibility shim that would break at each Chrome update; rebuilding natively produces a maintainable codebase aligned with browser vendor direction.

**Alternatives considered**:
- Polyfill MV2 background-page behaviour in MV3 service worker — rejected: fragile and not future-proof.
- Delay migration and monitor Chrome enforcement timeline — rejected: timeline risk was too high.

**Impact**: Service-worker lifecycle (sleep/wake), DApp connection, `fetch` API, and storage patterns were all redesigned.

**Date**: 2022-07-01
**Version**: pre-v0.6.x

**Citations**: [#349](https://github.com/Koniverse/SubWallet-Extension/issues/349), [#413](https://github.com/Koniverse/SubWallet-Extension/issues/413), [#412](https://github.com/Koniverse/SubWallet-Extension/issues/412)

---

### D4. Create a modified @subwallet/keyring that exposes private key after unlock

**Context**: EVM signing required exporting the full account and converting to a private key on every signing operation, making the flow slow and requiring repeated password entry.

**Decision**: Create a modified `@subwallet/keyring` package that exposes the private key once the keyring is unlocked, removing the repeated export step for EVM operations.

**Rationale**: The repeated export-then-sign pattern degraded UX significantly for EVM-heavy users. Exposing the key once per unlocked session is an acceptable security trade-off compared to caching it in memory after first unlock.

**Alternatives considered**:
- Cache private key in memory after first unlock — rejected: higher security risk without clear benefit over the chosen approach.
- Keep existing export-then-sign pattern — rejected: too slow and password-heavy for normal use.

**Impact**: New `@subwallet/keyring` package; EVM signing flow no longer requires per-transaction key export.

**Date**: 2022-08-01
**Version**: pre-v0.6.x

**Citations**: [#433](https://github.com/Koniverse/SubWallet-Extension/issues/433)

---

### D5. Expose both re-nominate and unbond-then-rebond flows for validator switching

**Context**: Users requested the ability to switch validators without waiting for the full unstaking period. Two flows exist: (1) unbond → wait → restake, and (2) direct re-nomination without unbonding.

**Decision**: Expose both flows and improve UX for re-nomination to reduce waiting-time confusion.

**Rationale**: Forcing users through the unbond path unnecessarily locks funds for the full unbonding period (28 days on Polkadot). Direct re-nomination is safe and already supported by the pallet.

**Alternatives considered**:
- Only support unbond-then-rebond flow for simplicity — rejected: creates unnecessary wait and confusion.
- Auto-compound rewards as default — rejected: user should opt in.

**Impact**: Staking UX updated to present both paths; re-nomination shortcut added.

**Date**: 2022-08-01
**Version**: pre-v0.6.x

**Citations**: [#504](https://github.com/Koniverse/SubWallet-Extension/issues/504)

---

---

---

## Phase 1 — ChainService Architecture, MV3 Migration & dApp Connectivity (2022-10 → 2023, shipped v0.7.x–v1.0.x)

### D6. Scope MV3 migration storage to chrome.storage (defer PouchDB)

**Context**: Chrome Manifest V3 migration required rethinking persistent storage. Service workers terminate after ~5 minutes, have no DOM access, and previously in-memory state had to be persisted. PouchDB was initially proposed for multi-platform storage.

**Decision**: Use `chrome.storage` directly for all persistent extension state; defer PouchDB as not yet necessary.

**Rationale**: `chrome.storage` was sufficient for the current extension and web-runner use case. Adding PouchDB would introduce complexity and a dependency before the use case was proven.

**Alternatives considered**:
- Use PouchDB for all persistent data — rejected at this stage; deferred (see D7).
- Keep MV2 and delay migration — rejected: timeline risk.
- Use `chrome.storage` directly for all state — chosen approach.

**Impact**: MV3 migration proceeded without a shared DB layer; storage model remained `chrome.storage`-based.

**Date**: 2022-10-14
**Version**: pre-v1.0.x

**Citations**: [#707](https://github.com/Koniverse/SubWallet-Extension/issues/707), [#782](https://github.com/Koniverse/SubWallet-Extension/issues/782)

---

### D7. Scope custom network support to pure EVM or pure Substrate only

**Context**: ChainService JSON schema and UI were designed for single-type networks. Mixed-mode (both EVM and Substrate) custom networks were requested.

**Decision**: Limit custom network support to pure EVM or pure Substrate networks only; defer mixed-mode support.

**Rationale**: The ChainService schema was not yet designed for dual-mode networks; implementing them immediately would require a premature schema extension and UI redesign.

**Alternatives considered**:
- Support all mixed networks immediately — rejected: too invasive.
- Defer all custom network support — rejected: pure EVM/Substrate custom networks were already valuable.

**Impact**: Users can add custom networks of a single type; mixed-type custom chains require built-in support.

**Date**: 2022-12-15
**Version**: pre-v0.8.x

**Citations**: [#926](https://github.com/Koniverse/SubWallet-Extension/issues/926)

---

### D8. Temporarily hide Substrate private-key export (no wallet supports re-import yet)

**Context**: No wallet, including SubWallet, supported re-importing a Substrate account by raw private key. Exposing the export would mislead users into believing they could restore the account elsewhere.

**Decision**: Hide the Substrate private-key export option until a corresponding import path exists.

**Rationale**: Exporting a key that cannot be re-imported is a footgun. A clear warning was considered insufficient given the severity of potential fund loss.

**Alternatives considered**:
- Keep export visible with a warning — rejected: warning insufficient for a footgun that causes irreversible fund loss.
- Implement import-by-private-key first — deferred; chosen as the pre-condition to re-enabling export.

**Impact**: Export button hidden in account settings until import support ships.

**Date**: 2023-04-18
**Version**: v0.6.7

**Citations**: [#1207](https://github.com/Koniverse/SubWallet-Extension/issues/1207), [#1142](https://github.com/Koniverse/SubWallet-Extension/issues/1142)

---

### D9. Deprioritise PouchDB for cross-platform storage

**Context**: Following D6, PouchDB adoption was re-evaluated as the web-runner use case matured (see [#782](https://github.com/Koniverse/SubWallet-Extension/issues/782)).

**Decision**: Formally deprioritise PouchDB; the current `chrome.storage` approach is sufficient and the web-runner does not yet require a shared DB layer.

**Rationale**: The engineering cost of PouchDB outweighed the benefit at the current stage. No concrete cross-platform storage requirement existed that `chrome.storage` could not meet.

**Alternatives considered**:
- Adopt PouchDB immediately — rejected: premature.
- Use IndexedDB directly — rejected: no advantage over `chrome.storage` for the current use case.

**Impact**: Storage architecture remains `chrome.storage`-only through at least the v1.0 milestone.

**Date**: 2023-04-20
**Version**: pre-v1.1.x

**Citations**: [#782](https://github.com/Koniverse/SubWallet-Extension/issues/782)

---

### D10. Defer step 3 of online chain-list auto-update (immediate provider change)

**Context**: The three-step auto-update from chain-list feature was implemented in steps. Step 3 — applying provider changes immediately after fetching from chain-list — was identified as too risky because it could break running connections.

**Decision**: Do not apply provider URL changes immediately on chain-list fetch; defer step 3.

**Rationale**: Interrupting live WS connections to switch providers could break active transactions and subscriptions. The benefit (fresher RPC endpoints) does not outweigh the reliability risk.

**Alternatives considered**:
- Immediate provider update on chain-list change — rejected: breaks running connections.
- Versioned chain-list with `olderVersions` field for compatibility tracking — evaluated but not implemented.

**Impact**: RPC provider changes from chain-list are only applied on next extension start, not live.

**Date**: 2023-05-11
**Version**: v1.0.3

**Citations**: [#1320](https://github.com/Koniverse/SubWallet-Extension/issues/1320)

---

### D11. Do not auto-select validators; users should research or use pools

**Context**: Auto-select validator was requested. The team lead evaluated two obvious strategies (highest APR, lowest commission) and found both to be potentially misleading.

**Decision**: Do not implement auto-selection of validators; users should do their own research or stake via a nomination pool instead.

**Rationale**: There is no sound wallet-level rationale for recommending a specific validator. Auto-selection by APR or commission could steer users toward validators with adverse behaviour (e.g., 100% commission briefly lowered to attract nominations).

**Alternatives considered**:
- Auto-select by highest APR — rejected: misleading and manipulable.
- Auto-select by lowest commission — rejected: commission alone is not a reliable quality signal.

**Impact**: No auto-validator-select feature shipped; nomination-pool path highlighted as the simpler option.

**Date**: 2023-05-30
**Version**: v1.0.x

**Citations**: [#1417](https://github.com/Koniverse/SubWallet-Extension/issues/1417)

---

### D12. Fix Ledger HID conflicts by disconnecting device on session close (not by splitting HTML files)

**Context**: Ledger HID transport conflicts arose between the expand view and popup view sharing the same domain. A proposed fix was to serve them from separate HTML files.

**Decision**: Disconnect the Ledger device on session close instead of splitting `index.html` into separate files for expand and popup views.

**Rationale**: Separating HTML files would require a large, invasive refactor of the routing architecture. The disconnect-on-close approach solves the conflict with minimal code change.

**Alternatives considered**:
- Separate `index.html` files for expand and popup views — rejected: too invasive.

**Impact**: Ledger device is disconnected when the popup or expand view is closed, preventing HID conflicts.

**Date**: 2023-06-30
**Version**: v1.0.9

**Citations**: [#1573](https://github.com/Koniverse/SubWallet-Extension/issues/1573)

---

### D13. WalletConnect initial integration defers eth_signTransaction and eth_signTypedData

**Context**: The initial WalletConnect integration was scoped. `eth_signTransaction` was not supported by the WC Core library at the time; `eth_signTypedData` had known stability problems.

**Decision**: Omit `eth_signTransaction` and `eth_signTypedData` from the initial WalletConnect integration; return an `unsupported method` error to callers.

**Rationale**: Shipping partial or unstable implementations of these methods would cause silent or confusing failures for dApps that depend on them. A clear `unsupported` error is better than an unreliable implementation.

**Alternatives considered**:
- Implement with partial support and show unsupported error for missing methods — this was the chosen approach.

**Impact**: Initial WalletConnect integration covers session creation/disconnect/sign for the core method set; callers get an explicit error for unsupported methods.

**Date**: 2023-07-03
**Version**: v1.1.1

**Citations**: [#1497](https://github.com/Koniverse/SubWallet-Extension/issues/1497)

---

### D14. Scope ZK assets (Manta) to extension only — exclude WebApp and mobile

**Context**: Integrating ZK metadata from Manta's WASM bundle would increase the extension size by 3× and caused incorrect `chrome.runtime.onInstalled` firing.

**Decision**: Do not include ZK assets in WebApp and mobile builds; scope ZK asset support to the extension only.

**Rationale**: A 3× extension size increase is unacceptable; it would slow startup and exceed store size guidelines. The web/mobile use case for ZK assets was not yet proven.

**Alternatives considered**:
- Include ZK assets in WebApp and mobile with lazy loading — rejected: size increase persists even with lazy loading at the bundle level.

**Impact**: ZK-asset (Manta) functionality is extension-only; WebApp and mobile do not expose this feature.

**Date**: 2023-07-04
**Version**: v1.1.1

**Citations**: [#1608](https://github.com/Koniverse/SubWallet-Extension/issues/1608), [#1628](https://github.com/Koniverse/SubWallet-Extension/issues/1628)

---

### D15. Adopt EIP-6963 multi-provider discovery alongside window.ethereum injection

**Context**: SubWallet's EVM provider conflicted with MetaMask and other injected wallets because all wallets competed to set `window.ethereum`.

**Decision**: Implement EIP-6963 `announce`/`request-provider` events alongside the existing injected provider, enabling multiple wallets to coexist on the same page.

**Rationale**: Continuing with single `window.ethereum` injection breaks multi-wallet UX and causes SubWallet to override or be overridden by other wallets. EIP-6963 is the browser-standardised coexistence mechanism.

**Alternatives considered**:
- Continue with single `window.ethereum` injection — rejected: breaks multi-wallet UX and caused Uniswap load failures.

**Impact**: EIP-6963 RDNS registered; SubWallet visible as a distinct provider in dApps supporting multi-wallet discovery.

**Date**: 2023-10-16
**Version**: v1.1.12

**Citations**: [#2021](https://github.com/Koniverse/SubWallet-Extension/issues/2021), [#2328](https://github.com/Koniverse/SubWallet-Extension/issues/2328)

---

### D16. Defer custom derived-path feature to avoid Milestone 6 scope creep

**Context**: Custom derived-path was requested during Milestone 6 development. Implementing it immediately would risk delaying the milestone.

**Decision**: Close the custom derived-path issue and resolve it in a follow-up issue (#3556) in a later milestone.

**Rationale**: Scope discipline is required to ship on time. The feature is useful but not critical for the current milestone's core deliverables.

**Alternatives considered**:
- Implement immediately within Milestone 6 scope — rejected: scope creep risk.

**Impact**: Custom derived path deferred; implementation tracked in [#3556](https://github.com/Koniverse/SubWallet-Extension/issues/3556).

**Date**: 2023-11-01
**Version**: v1.1.x

**Citations**: [#2135](https://github.com/Koniverse/SubWallet-Extension/issues/2135)

---

### D17. Complete MV3 migration (service-worker lifecycle, DApp connection, fetch, storage)

**Context**: Chrome's roadmap required MV3 compliance. The full migration had been researched since D3 (2022-07-01) but execution was deferred while the architecture was stabilised.

**Decision**: Upgrade the extension from MV2 to MV3, redesigning service-worker lifecycle (sleep/full mode), DApp connection (reconnect on wake), `fetch` API (moved to service worker), and storage.

**Rationale**: Chrome's enforcement deadline left no further room for delay. A full architectural migration is cleaner than maintaining both MV2 and MV3 code paths.

**Alternatives considered**:
- Delay MV3 migration and maintain MV2 branch until Chrome forced migration — rejected: timeline risk too high.

**Impact**: Extension shipped as MV3 on Chrome and Firefox; a new MV3 UI design also shipped alongside.

**Date**: 2023-11-18
**Version**: v1.2.1

**Citations**: [#2205](https://github.com/Koniverse/SubWallet-Extension/issues/2205), [#2120](https://github.com/Koniverse/SubWallet-Extension/issues/2120)

---

### D18. Implement full OpenGov voting (not read-only) for Polkadot governance

**Context**: Polkadot switched to OpenGov (governance v2). SubWallet needed to decide the scope of governance support.

**Decision**: Implement full voting (standard, abstain/split, delegation) rather than read-only referendum listing, requiring significant API integration work.

**Rationale**: Read-only governance display provides minimal value; users expect to vote in-app. Full voting is the differentiating feature.

**Alternatives considered**:
- Read-only referendum listing without vote submission — rejected: insufficient value.

**Impact**: Full OpenGov voting shipped in extension and WebApp, including track metadata, vote counting, and delegation logic.

**Date**: 2023-11-20
**Version**: v1.1.x (shipped later via [PR #4301](https://github.com/Koniverse/SubWallet-Extension/pull/4301))

**Citations**: [#2216](https://github.com/Koniverse/SubWallet-Extension/issues/2216), [#2222](https://github.com/Koniverse/SubWallet-Extension/issues/2222), [#2271](https://github.com/Koniverse/SubWallet-Extension/issues/2271)

---

### D19. Refactor balance service to new service architecture (centralise cache invalidation)

**Context**: Balance functions were scattered across subscription and state modules, leading to stale cache bugs — balances shown after account removal, incorrect All-accounts totals.

**Decision**: Refactor balance service to match the new service architecture used by other services, centralising balance logic and handling cache invalidation explicitly on account mutations.

**Rationale**: Patching individual stale-cache bugs in place would not prevent future occurrences. A structural refactor ensures cache invalidation is always triggered by account mutations through a single code path.

**Alternatives considered**:
- Patch individual stale-cache bugs without architectural refactor — rejected: symptom treatment, not root-cause fix.

**Impact**: `BalanceService` class created; cache invalidated deterministically on account add/remove.

**Date**: 2023-12-27
**Version**: v1.1.27

**Citations**: [#2416](https://github.com/Koniverse/SubWallet-Extension/issues/2416)

---

---

## Phase 2 — Earning Rebrand, TON & Cardano Integration, XCM/i18n Tooling (2024, shipped v1.1.x–v1.2.x)

### D20. Native Substrate Path for TAO Staking (Not EVM)

**Context**: When SubWallet began implementing TAO in-app staking (#2505, Jan 2024), a choice existed between integrating Bittensor via its native Substrate/Substrate-based `delegation` pallet or via the Subtensor EVM compatibility layer.
**Decision**: Implement TAO staking using the native Substrate path, calling Bittensor's native `delegation` pallet directly (via WebSocket RPC to archive nodes such as `wss://archivelb.nakamoto.opentensor.ai:9943`), with validator/delegate data pulled from the OpenTensor delegates JSON and middleware API.
**Rationale**: Because at the time of initial staking implementation, the native delegation model was the established, well-documented mechanism (`docs.bittensor.com/delegation`); the Subtensor EVM path existed but bridging between native TAO and Subtensor EVM was scoped as a separate later feature (#4901, Dec 2025), confirming the native-first decision.
**Alternatives considered**:
- Subtensor EVM path — deferred until Dec 2025 as a separate bridge feature (#4901), not chosen for core staking because native substrate was already the standard Bittensor interaction model.
**Impact**: The staking service handler, balance subscription, and earning position logic all operate against the native Substrate chain; the Subtensor EVM bridge remains a distinct integration track.
**Date**: 2024-01-22
**Version**: v1.3.x (Milestone 8)
**Citations**: [#2505](https://github.com/Koniverse/SubWallet-Extension/issues/2505), [#4901](https://github.com/Koniverse/SubWallet-Extension/issues/4901)


---

---

---

### D21. Rename "Staking" feature to "Earning" across all platforms

**Context**: The Staking feature had expanded to cover native staking, liquid staking, and lending — mechanisms that do not align with the word "staking".

**Decision**: Rename the feature from "Staking" to "Earning" across Extension, WebApp, and Mobile, and display a dismissible notification popup to existing users explaining the change.

**Rationale**: "Earning" better represents the full range of yield mechanisms and avoids confusion for users who have liquid staking or lending positions. The notification mitigates user confusion from the sudden rename.

**Alternatives considered**:
- Keep "Staking" name — rejected: misleading for liquid staking and lending users.
- Use "Yield" instead of "Earning" — rejected: "Earning" tested better with the target audience.

**Impact**: All Staking labels renamed to Earning; user notification shipped.

**Date**: 2024-02-01
**Version**: v1.1.34

**Citations**: [#2599](https://github.com/Koniverse/SubWallet-Extension/issues/2599)

---

### D22. XCM Transfer Max formula: reserve 1.2× ED + 2× fee to prevent dust loss

**Context**: Transfer Max via XCM could leave the source account with less than the existential deposit (ED), causing account reaping and balance loss.

**Decision**: When transferring the maximum amount via XCM, reserve `1.2 × ED + 2 × fee` rather than sending the full transferable balance. For regular (non-XCM) transfers, show a warning on "Transfer All" rather than blocking.

**Rationale**: The multipliers provide a safety buffer against fee estimation variance and ED rounding. Blocking entirely for non-XCM transfers is overly restrictive; a warning is sufficient.

**Alternatives considered**:
- Block transfer-max entirely for XCM — rejected: too restrictive.
- Use a flat ED multiplier — rejected: less precise than the 1.2× formula.

**Impact**: XCM Transfer Max capped at `transferable − 1.2 × ED − 2 × fee`; warning modal shown for non-XCM transfer-all.

**Date**: 2024-07-01
**Version**: v1.1.48

**Citations**: [#2798](https://github.com/Koniverse/SubWallet-Extension/issues/2798)

---

### D23. Support TEP-74 Jetton Standard as the TON Token Type

**Context**: TON's fungible token standard is TEP-74 (Jettons), distinct from ERC-20. Issue #3394 was specifically raised to implement Jetton balance display, and #3455 added `tokenType = TEP74` to the chainlist schema.
**Decision**: Implement Jetton (TEP-74) as the TON-specific local token type, registering it in the chainlist under `tokenType: TEP74`. Jetton transfer and balance handling follows the TEP-74 spec (Jetton wallet contracts, `transfer` op-code messages). The initial scope includes USD₮ (USDT on TON) as the primary Jetton.
**Rationale**: Because TEP-74 is the only standardized fungible token spec on TON; without it, only native TON could be supported, excluding the large Jetton ecosystem (USDT on TON being the primary demand driver).
**Alternatives considered**:
- Supporting only native TON initially and deferring Jettons — partially done (mainnet was initially disabled in wallet even after chainlist addition, per #3455 comment), but Jetton balance was scoped into the same milestone.
**Impact**: New `TEP74` token type enum in chainlist; Jetton-specific balance query and transfer message construction; Jetton metadata fetching per TEP-64.
**Date**: 2024-07-29
**Version**: v1.3.x (Milestone 8 Experiment)
**Citations**: [#3394](https://github.com/Koniverse/SubWallet-Extension/issues/3394), [#3455](https://github.com/Koniverse/SubWallet-Extension/issues/3455), [#3384](https://github.com/Koniverse/SubWallet-Extension/issues/3384)


---

---

### D24. GRC-20 token type renamed to VFT (Vara Fungible Token)

**Context**: The upstream Vara ecosystem renamed the GRC-20 token standard to VFT (Vara Fungible Token). Existing GRC-20 tokens in user wallets had the old type stored.

**Decision**: Rename the token type from GRC-20 to VFT across Extension and WebApp, and migrate existing GRC-20 token entries to the new type field value.

**Rationale**: Keeping the GRC-20 label while the ecosystem uses VFT would confuse users and developers. The migration ensures existing user tokens continue to work without manual intervention.

**Alternatives considered**:
- Keep GRC-20 label with an internal alias — rejected: creates a two-name problem for the same standard.

**Impact**: Token type renamed; migration job converts stored GRC-20 entries to VFT.

**Date**: 2024-08-01
**Version**: v1.1.66

**Citations**: [#3268](https://github.com/Koniverse/SubWallet-Extension/issues/3268), [#3290](https://github.com/Koniverse/SubWallet-Extension/issues/3290), [#3291](https://github.com/Koniverse/SubWallet-Extension/issues/3291), [PR #3271](https://github.com/Koniverse/SubWallet-Extension/pull/3271)

---

### D25. Use `@ton/core` + `@ton/ton` (TonClient) SDK with TonCenter API v3

**Context**: When implementing TON balance display (#3384), transfers (#3449), and the chainlist (#3455), the team needed to choose an SDK and API provider.
**Decision**: Use the `@ton/core` (^0.56.3), `@ton/crypto` (^3.2.0), and `@ton/ton` (^15.0.0) packages as the TON SDK, with a `TonClient` instance pointing to TonCenter API v3 (`toncenter.com/api/v3`) for RPC calls. Fee estimation is done by summing four on-chain fee components (`fwd_fee`, `in_fwd_fee`, `storage_fee`, `gas_fee`) retrieved from the TonCenter estimate endpoint, matching the approach used by `ton-wallet` (FT) and OpenMask.
**Rationale**: Because `@ton/core` is the official Ton Foundation SDK; the TonCenter v3 API is the standard public RPC; and the 4-component fee sum matches the approach validated against peer wallets (ton-wallet, openmask), giving confidence in fee accuracy without requiring the newer `tonapi.io` battery mechanism (used only by TonKeeper v5+).
**Alternatives considered**:
- `tonweb` (older library) — not adopted; `@ton/ton` is the current standard.
- TonAPI (`tonapi.io`) with battery/emulate endpoint (TonKeeper approach) — not chosen for initial integration because it represents a newer, wallet-specific mechanism; may be revisited.
**Impact**: `TonApi` handler class in `extension-base` uses `TonClient` from `@ton/ton`; fee calculation logic sums 4 fee types from TonCenter v3.
**Date**: 2024-08-12
**Version**: v1.3.x (Milestone 8 Experiment)
**Citations**: [#3449](https://github.com/Koniverse/SubWallet-Extension/issues/3449), [#3455](https://github.com/Koniverse/SubWallet-Extension/issues/3455), [#3384](https://github.com/Koniverse/SubWallet-Extension/issues/3384)


---

---

### D26. User-Selectable WalletContract Version (v3r1/v3r2/v4/v5), Default v5

**Context**: TON addresses are derived from WalletContract code, so different contract versions (v3r1, v3r2, v4, v5) produce different addresses from the same private key. During transfer implementation (#3449) the team noted "Handle WalletContract version which affects signature validation". Issue #3512 formalized this as a distinct feature.
**Decision**: Expose a user-controlled WalletContract version switcher (supporting v3r1, v3r2, v4, v5). The default version is set to **v5** (#3700). Each account stores its current contract version; derived accounts inherit the parent's version at derivation time. Watch-only accounts do not show the switcher. The address shown in Receive, Transfer, and History screens updates immediately when the version is changed.
**Rationale**: Because TON users who hold funds on legacy contract versions (v3/v4) would lose access to their balance if only the newest version were shown; and v5 is the current recommended version per TON documentation, so it is the right default for new accounts.
**Alternatives considered**:
- Hardcoding v4 (most common legacy version) — rejected; v5 is the current standard and users with v3 funds would be unable to receive.
- Auto-detecting the active version from chain state — not implemented; a user-facing switcher was chosen for transparency and control.
**Impact**: Version metadata stored per account; `TonApi` and balance/transfer handlers parameterized on contract version; UI switcher on Receive QR screen; info-box added to TON token details (#3718).
**Date**: 2024-08-26
**Version**: v1.3.x (Milestone 8 Experiment)
**Citations**: [#3512](https://github.com/Koniverse/SubWallet-Extension/issues/3512), [#3700](https://github.com/Koniverse/SubWallet-Extension/issues/3700), [#3449](https://github.com/Koniverse/SubWallet-Extension/issues/3449)


---

---

### D27. Adopt Texterify as the multilingual management platform

**Context**: Translation management was fragmented — files were manually managed in source control with no cross-team tooling, making updates and coordination difficult.

**Decision**: Adopt Texterify as the centralised multilingual management platform.

**Rationale**: Texterify enables cross-team coordination and easier updates compared to ad-hoc translation file management. It provides a dedicated workflow for translators and reduces the risk of key drift between source and translated strings.

**Alternatives considered**:
- Continue with ad-hoc translation files managed in source control — rejected: not scalable as language count grows.

**Impact**: Translation workflow moved to Texterify; keys synced from the CMS rather than manually in-repo.

**Date**: 2024-09-09
**Version**: v1.1.x

**Citations**: [#2132](https://github.com/Koniverse/SubWallet-Extension/issues/2132)

---

### D28. Abandon SnowBridge SDK in favour of ParaSpell API for XCM bridge protection

**Context**: A SnowBridge SDK implementation was underway to provide safety guards against asset loss on the Polkadot↔Ethereum bridge.

**Decision**: Abandon the SnowBridge SDK implementation and rely on the ParaSpell API (already integrated) to provide the same protection.

**Rationale**: ParaSpell was already integrated and provides equivalent protection against asset loss without adding a new SDK dependency. Maintaining two bridge SDKs for overlapping functionality increases complexity.

**Alternatives considered**:
- Implement SnowBridge SDK directly (`@snowbridge/api`) — rejected: redundant with ParaSpell.

**Impact**: SnowBridge SDK not shipped; ParaSpell API used for all XCM bridge operations.

**Date**: 2024-10-01
**Version**: v1.2.4

**Citations**: [#3416](https://github.com/Koniverse/SubWallet-Extension/issues/3416)

---

### D29. Scope Out TON dApp Connection (TON Connect) to a Later Milestone

**Context**: After launching TON balance and transfer support, issue #3768 was raised in October 2024 to "Support connect dApp for TON account", i.e., implement TON Connect (the standard dApp authorization protocol on TON). The issue remains OPEN in Milestone 10.
**Decision**: Defer TON Connect / dApp connection for TON accounts beyond the initial integration milestones (Milestone 8/9). The core TON work shipped without dApp connectivity.
**Rationale**: Because TON balance display, Jetton support, transfers, and WalletContract version switching represented a complete self-custody user flow that could ship incrementally; TON Connect requires additional protocol handling (bridge, session management) that was not resourced for the same milestone window.
**Alternatives considered**:
- Shipping TON Connect alongside balance/transfer — not done; the issue was created as a follow-up task after core features landed, indicating it was consciously separated.
**Impact**: TON account holders in SubWallet cannot connect to TON dApps as of Milestone 9; this remains an open scope item for Milestone 10.
**Date**: 2024-10-08
**Version**: v1.3.x (Milestone 10, deferred)
**Citations**: [#3768](https://github.com/Koniverse/SubWallet-Extension/issues/3768)

---

### D30. Use Blockfrost as the Cardano Chain Data Provider

**Context**: The team needed to select a data-access layer for Cardano chain state (balances, UTXOs, transaction submission) during the Milestone 8 Experiment integration effort (#3816).
**Decision**: Blockfrost API was chosen as the sole provider for Cardano on-chain data queries and transaction submission in the initial integration.
**Rationale**: Because Blockfrost is the most widely adopted hosted API for Cardano and provides the full UTXO, balance, and submission endpoints needed without requiring the team to run a local Cardano node, it was the fastest path to a working chain service.
**Alternatives considered**:
- Self-hosted Cardano node — rejected because of infrastructure cost and operational overhead during the experimental milestone phase.
- Other hosted providers (e.g., Koios) — not mentioned in the issues; Blockfrost was the explicit choice recorded in issue comments and the API key management work.
**Impact**: The Blockfrost API key is embedded in (and later moved out of) the extension; a dedicated backend proxy was later built (#4368) to hide the key. Balance failures were directly tied to key expiry (#4164, #4558), showing tight coupling to this provider.
**Date**: 2024-10-28
**Version**: v1.3.x (Milestone 8 Experiment)
**Citations**: [#3816](https://github.com/Koniverse/SubWallet-Extension/issues/3816), [#4164](https://github.com/Koniverse/SubWallet-Extension/issues/4164), [#4368](https://github.com/Koniverse/SubWallet-Extension/issues/4368)


---

---

### D31. Support Cardano Native Assets (CIP-26) Alongside ADA Transfers; Defer Staking/Delegation

**Context**: The Milestone 8 Experiment scope required defining which Cardano transaction types would be supported at launch (#3862).
**Decision**: The initial scope covers ADA transfers and Cardano Native Asset (CNA) transfers per CIP-26, including the UTXO-based fee model (minADA bundled with native-asset outputs). Cardano staking and delegation were not included in Milestone 8 or Milestone 9.
**Rationale**: Because native-asset transfers are the most common user action after ADA sends, and they required the same UTXO infrastructure, shipping both together maximised value. Staking integration requires additional research on Cardano's reward-address model and was deferred to avoid scope creep.
**Alternatives considered**:
- ADA-only transfer at launch — rejected because native assets share the same UTXO flow and deferring them would leave a visible feature gap.
- Staking in Milestone 8 — deferred; no implementation issues were filed for staking/delegation within the studied range.
**Impact**: Transfer UI was built with UTXO-aware fee logic (extended UTXO edge cases tracked in #3942); the Max button for ADA was removed (#4016) due to UTXO complexity; ADA on-ramp added via Transak and Banxa (#4264). Staking remains out of scope.
**Date**: 2024-11-23
**Version**: v1.3.x (Milestone 8 Experiment)
**Citations**: [#3862](https://github.com/Koniverse/SubWallet-Extension/issues/3862), [#3942](https://github.com/Koniverse/SubWallet-Extension/issues/3942), [#4016](https://github.com/Koniverse/SubWallet-Extension/issues/4016)


---

## Multisig Decisions

---

---

---

## Phase 3 — Bitcoin Integration, dTAO Staking & Swap/Fiat Consolidation (2025 H1, shipped v1.3.x)

### D32. Cancel dynamic swap pair support (Milestone 8 Cancel)

**Context**: Dynamic swap pair discovery was planned for Milestone 8 to automatically enumerate valid swap pairs from providers.

**Decision**: Cancel dynamic swap pair support and retain static pair configuration that is updated manually.

**Rationale**: Dynamic pair management adds complexity in filtering, ranking, and validating pairs across multiple providers. Static lists are simpler to audit for correctness and safety, and the maintenance overhead is acceptable at the current scale.

**Alternatives considered**:
- Implement dynamic swap pair discovery — rejected: complexity not justified by benefit at current scale.
- Keep static pair lists — chosen approach.

**Impact**: Swap pairs remain statically configured; engineering effort redirected to other Milestone 8 priorities.

**Date**: 2025-01-01
**Version**: v1.3.x

**Citations**: [#4078](https://github.com/Koniverse/SubWallet-Extension/issues/4078), [PR #4079](https://github.com/Koniverse/SubWallet-Extension/pull/4079)

---

### D33. Adopt dTAO / Alpha Token Subnet Staking Model

**Context**: In February 2025 Bittensor launched dTAO, introducing per-subnet alpha tokens; #4036 was raised to add dTAO staking support and #4151 to add alpha tokens as first-class local tokens.
**Decision**: Model dTAO subnet staking as a distinct earning pool type that extends the existing TAO native staking handler (`SubnetStaking extends TAO Native Staking`, confirmed in #4520 refactor). Each subnet's alpha token is registered as a local token with `subnetid` in metadata (#4151). Custom slippage is exposed to users because subnet stake/unstake routes through an AMM-like mechanism (#4145). Alpha tokens are displayed and transferred like other local tokens (#4150, #4900).
**Rationale**: Because dTAO changed the fundamental staking model from simple root delegation to per-subnet liquidity pools with price impact/slippage, requiring a dedicated pool type and user-facing slippage control; reusing the existing earning framework while sub-typing kept code duplication low (#4520).
**Alternatives considered**:
- Treating subnet staking identically to root delegation — rejected because dTAO has AMM slippage semantics that root delegation does not, requiring a custom confirmation and slippage UI.
- Treating alpha tokens as non-transferable staking receipts — rejected; #4900 and #4150 explicitly scope alpha tokens as transferable local tokens.
**Impact**: New `SubnetStaking` pool type in the earning service; alpha tokens added to chainlist with `subnetid` metadata; custom slippage setting added to subnet stake confirmation screen; balance and position logic refactored in #4520.
**Date**: 2025-02-18
**Version**: v1.3.x (Milestone 8 / Milestone 9)
**Citations**: [#4036](https://github.com/Koniverse/SubWallet-Extension/issues/4036), [#4145](https://github.com/Koniverse/SubWallet-Extension/issues/4145), [#4150](https://github.com/Koniverse/SubWallet-Extension/issues/4150), [#4151](https://github.com/Koniverse/SubWallet-Extension/issues/4151), [#4520](https://github.com/Koniverse/SubWallet-Extension/issues/4520)


---

---

### D34. Integrate Meld All-in-One Wizard directly (supersedes standalone Meld research task)

**Context**: A Milestone 8 research task for a standalone Meld on-ramp integration was open. During development, the Meld All-in-One Wizard became available, covering the same use case.

**Decision**: Integrate the Meld All-in-One Wizard directly via [#4085](https://github.com/Koniverse/SubWallet-Extension/issues/4085), closing the standalone research task.

**Rationale**: The Wizard provides the desired fiat on-ramp functionality immediately without requiring a custom integration. It reduces engineering effort and time-to-ship.

**Alternatives considered**:
- Standalone Meld on-ramp research — superseded by Wizard availability.
- Integrate Meld Wizard directly — chosen.

**Impact**: Meld on-ramp shipped via Wizard; Transak off-ramp also integrated in the same milestone.

**Date**: 2025-03-10
**Version**: v1.3.25

**Citations**: [#3842](https://github.com/Koniverse/SubWallet-Extension/issues/3842), [#4085](https://github.com/Koniverse/SubWallet-Extension/issues/4085)

---

### D35. Adopt CIP-30 as the Cardano dApp Connector Standard

**Context**: To enable SubWallet users to interact with Cardano dApps (e.g., Minswap, MeshJS), a dApp connection API was required. The Cardano Foundation provided feedback that SubWallet's initial CIP-30 implementation was missing `getRewardAddress` and that `signData` only worked with payment addresses (#4352).
**Decision**: CIP-30 (the Cardano dApp–Wallet Web Bridge standard) was implemented as the sole dApp connector, covering `enable`, `getUsedAddresses`, `getChangeAddress`, `getRewardAddress`, `getUtxo`, `signData`, `signTx`, and `submitTx`. Stake-key signing for `signData` was added based on Cardano Foundation feedback.
**Rationale**: Because CIP-30 is the canonical Cardano ecosystem standard for wallet-to-dApp communication and is required by all major Cardano dApps, implementing it is the only viable path to dApp interoperability.
**Alternatives considered**:
- A proprietary connector — rejected; the Cardano ecosystem expects CIP-30 compliance and dApps will not integrate a non-standard API.
**Impact**: Cardano dApp provider injection added to the extension; keyring upgraded to `@subwallet/keyring@0.1.11` for Cardano signing; UTXO/collateral retrieval refactored; error codes standardized. A follow-up issue (#4311) tracks remaining UX improvements for the signing flow.
**Date**: 2025-03-12
**Version**: v1.3.x (Milestone 9)
**Citations**: [#4100](https://github.com/Koniverse/SubWallet-Extension/issues/4100), [#4352](https://github.com/Koniverse/SubWallet-Extension/issues/4352)


---

---

### D36. Bitcoin data/indexer strategy — Koni-hosted API first, migrating to Blockstream public API

**Context**: Bitcoin balance, UTXO, Inscription, and Rune data requires an indexer. The team researched available options (issue #4112): Hiro, Blockstream, Unisat, Ord (used by the prior OpenBit wallet), and a self-hosted approach. The hosted Koni API (`btc-api.koni.studio`) was initially deployed but proved unreliable: on-chain data mismatches, wrong fees, stale Rune/UTXO data caused invalid transactions (issue #4997).
**Decision**: Initially deployed a self-hosted Koni API based on the OpenBit architecture (serving mainnet and testnet). For testnet, `btc-api-testnet.koni.studio` replaced the defunct `blockstream.info/testnet3` when testnet3 was retired (issue #4619). As of mid-2026 (issue #4991), the mainnet core BTC API is being replaced by the public `blockstream.info/api` to reduce backend maintenance cost; Runes/Ordinals indexing remains an open research item since Blockstream does not support those.
**Rationale**: Because the hosted API introduced data-accuracy issues (wrong balances, invalid UTXO sets) that made mainnet transfers risky, and because Blockstream is a well-known, reliable public infrastructure, migrating core BTC data to Blockstream removes the self-hosting burden; Runes/Ordinals are deferred because no equivalent public API exists yet.
**Alternatives considered**:
- Unisat API for Rune UTXOs — partially used (`rune/address/${address}/utxo`) but not chosen as the primary source due to dependency concerns and coverage gaps.
- Hiro APIs — evaluated and found to cover UTXO, Inscription, BRC-20, and Rune display needs; retained as a supplementary source candidate.
- Continue self-hosting — rejected after repeated data-accuracy failures documented in #4997.
**Impact**: Architecture split: core BTC balance/UTXO queries will use Blockstream public API; Rune and Ordinal features remain blocked on a future indexer decision; testnet now uses `btc-api-testnet.koni.studio`; PR #4992 implements the mainnet migration.
**Date**: 2025-03-18
**Version**: v1.3.42
**Citations**: [#4112](https://github.com/Koniverse/SubWallet-Extension/issues/4112), [#4162](https://github.com/Koniverse/SubWallet-Extension/issues/4162), [#4619](https://github.com/Koniverse/SubWallet-Extension/issues/4619), [#4991](https://github.com/Koniverse/SubWallet-Extension/issues/4991), [#4997](https://github.com/Koniverse/SubWallet-Extension/issues/4997)


---

---

### D37. Bitcoin integrated into the existing Unified Account model (Substrate + EVM + TON + Cardano + BTC)

**Context**: The Unified Account roadmap (issue #4184) aimed to unify all blockchain accounts under a single seed phrase. The question was whether Bitcoin should be a separate "solo" account type or a first-class member of the unified account alongside Substrate, EVM, TON, and Cardano.
**Decision**: Bitcoin was added as the fifth system in the unified account model, extending existing unified accounts via a migration path. Both "unified account with BTC" and standalone "solo BTC account" are supported; derivation from a unified account to a BTC solo account is also enabled.
**Rationale**: Because SubWallet's core value proposition is a single seed phrase for all chains, excluding Bitcoin from the unified model would force users to manage a separate BTC seed and break the single-backup guarantee; the migration path ensures existing users are not left behind.
**Alternatives considered**:
- Bitcoin as standalone solo-only account — rejected because it breaks the unified UX and requires users to maintain separate backups.
- Deferred BTC unification until a later milestone — rejected after the team confirmed feasibility during the #4184 roadmap phase.
**Impact**: Keyring module updated to handle a 5-system unified account; migration logic added to upgrade existing 3- and 4-system unified accounts to include BTC; derive-account flow updated to support BTC derivation from unified parent; compatibility-check logic now needs `accountType` to distinguish BTC mainnet vs. testnet keypairs.
**Date**: 2025-04-01
**Version**: v1.3.42
**Citations**: [#4184](https://github.com/Koniverse/SubWallet-Extension/issues/4184), [#4168](https://github.com/Koniverse/SubWallet-Extension/issues/4168), [#4201](https://github.com/Koniverse/SubWallet-Extension/issues/4201), [#4261](https://github.com/Koniverse/SubWallet-Extension/issues/4261)


---

---

### D38. Three Bitcoin address types (BIP44/BIP84/BIP86) supported simultaneously per account

**Context**: When adding Bitcoin to the SubWallet unified account model (early 2025), the team had to decide which BIP address formats to expose. Bitcoin has three widely-used formats: Legacy (P2PKH, BIP44), Native SegWit (P2WPKH, BIP84), and Taproot (P2TR, BIP86). Users and dApps use all three in practice.
**Decision**: Support all three address types (BIP44, BIP84, BIP86) from a single seed phrase / unified account, exposing each as a distinct address. Native SegWit (BIP84) was designated as the default address for operations such as swap auto-detection.
**Rationale**: Because different Bitcoin dApps and counterparties expect different formats, supporting only one type would exclude a large portion of the ecosystem; presenting all three from a single key avoids the need for users to manage separate accounts while keeping compatibility broad.
**Alternatives considered**:
- Native SegWit only — rejected because it would break interoperability with Legacy and Taproot-only dApps and services.
- Single user-selectable address type at creation — rejected in favor of always generating all three, reducing friction.
**Impact**: Each unified account now carries three BTC addresses; UI must present address-type pickers everywhere addresses are shown (receive, send, token details, history); compatibility checks require a third factor (`accountType`) beyond `chainInfo` and `accountChainType`.
**Date**: 2025-04-01
**Version**: v1.3.42
**Citations**: [#4200](https://github.com/Koniverse/SubWallet-Extension/issues/4200), [#4168](https://github.com/Koniverse/SubWallet-Extension/issues/4168), [#4316](https://github.com/Koniverse/SubWallet-Extension/issues/4316), [#4414](https://github.com/Koniverse/SubWallet-Extension/issues/4414)


---

---

### D39. Cancel 1inch DEX aggregator integration (economically unviable pricing)

**Context**: 1inch DEX aggregator integration was planned as a swap provider. During contract negotiations, 1inch's pricing mechanism made the integration economically unviable for SubWallet's model.

**Decision**: Cancel 1inch integration.

**Rationale**: 1inch's pricing structure would not be sustainable. Other swap providers (Chainflip, HydraDX, Uniswap, KyberSwap, SimpleSwap) cover the same user need without the economic blocker.

**Alternatives considered**:
- Integrate 1inch as planned — rejected: economically unviable.
- Negotiate different pricing tier — insufficient progress to unblock the integration.

**Impact**: 1inch removed from swap provider roadmap; no code shipped.

**Date**: 2025-04-07
**Version**: v1.3.x

**Citations**: [#4105](https://github.com/Koniverse/SubWallet-Extension/issues/4105)

---

### D40. Bitcoin dApp provider injected as a separate namespace with PSBT-based signing

**Context**: SubWallet already injects Substrate (`window.injectedWeb3`) and EVM (`window.ethereum`) providers. Adding Bitcoin required a design choice for how dApps would interact: use an existing standard (e.g., the Sats Connect / Leather wallet API), roll a custom namespace, or reuse the EVM provider.
**Decision**: A dedicated Bitcoin namespace provider was injected into dApp pages, exposing a Bitcoin-specific API with methods: `Connect`, `GetAddresses`, `SignMessage`, `SignPsbt`, and `SendTransfer`. PSBT (Partially Signed Bitcoin Transaction) was chosen as the signing primitive. An initialization guard disables the provider until the wallet state is fully loaded.
**Rationale**: Because PSBT is the Bitcoin ecosystem standard for wallet-signed transactions and is what major Bitcoin dApp protocols (e.g., Leather, Xverse) expect, adopting it ensures compatibility with existing Bitcoin dApps; a separate namespace avoids polluting the EVM or Substrate providers and mirrors how other multi-chain wallets segment their injection surface.
**Alternatives considered**:
- Reusing EVM provider with wrapped BTC calls — rejected because Bitcoin's UTXO model and address types are fundamentally incompatible with the EVM JSON-RPC interface.
- WalletConnect for Bitcoin dApps — explicitly scoped out; Bitcoin is listed as a network that does not support WalletConnect connections (issue #4598).
**Impact**: New injector module with auto-build script; 4-step transaction validation pipeline in the dApp injector; `signPsbt` and `sendTransfer` flows added to the signing background; WalletConnect connection now shows an "Unsupported network" screen for Bitcoin.
**Date**: 2025-04-10
**Version**: v1.3.54
**Citations**: [#4245](https://github.com/Koniverse/SubWallet-Extension/issues/4245), [#4598](https://github.com/Koniverse/SubWallet-Extension/issues/4598), [PR #4477](https://github.com/Koniverse/SubWallet-Extension/pull/4477), [PR #4397](https://github.com/Koniverse/SubWallet-Extension/pull/4397)


---

---

### D41. Use Subsquare API as the primary data source for referenda content and metadata

**Context**: When prototyping OpenGov integration (#2222), the team needed to choose how to fetch referendum content (title, description, timeline, vote statistics) — directly from on-chain storage, from a third-party indexer, or a combination.
**Decision**: Use Subsquare (or equivalent off-chain API) as the primary source for referendum content, track metadata, vote statistics, and timeline. On-chain RPC calls are used only for transaction submission (vote, unvote, delegate, unlock) and for real-time balance/lock data. The two sources are combined in `OpenGovService`.
**Rationale**: On-chain storage does not contain human-readable descriptions, Markdown content, or pre-aggregated vote tallies, because that data is stored off-chain on IPFS/polkassembly and indexed by Subsquare. Fetching it entirely on-chain would require IPFS resolution per referendum and is impractical for a list view. Subsquare already provides a stable, structured API used by the wider Polkadot ecosystem.
**Alternatives considered**:
- Polkassembly API — evaluated but Subsquare was chosen as primary because it has broader parachain support and the prototype validated it first (#2222).
- Pure on-chain RPC — rejected for content/metadata because on-chain storage does not include referendum descriptions or pre-indexed timelines; accepted for transaction submission only.
**Impact**: `OpenGovService` maps chain slugs to Subsquare network identifiers (#4722); pagination and search are limited by Subsquare API capabilities (e.g., initial 20-item pagination bug #4678 was a Subsquare API limitation); vote count discrepancies between SubWallet and Subsquare on some networks are accepted as known variance.
**Date**: 2025-04-28
**Version**: v1.3.x (Milestone 9)
**Citations**: [#2222](https://github.com/Koniverse/SubWallet-Extension/issues/2222), [#4257](https://github.com/Koniverse/SubWallet-Extension/issues/4257), [#4678](https://github.com/Koniverse/SubWallet-Extension/issues/4678), [#4722](https://github.com/Koniverse/SubWallet-Extension/issues/4722)


---

---

### D42. Move Blockfrost API Calls to the Backend Proxy

**Context**: After the initial integration, it was found that the extension made direct calls to Blockfrost from client-side code, exposing the API key (#4368).
**Decision**: All Blockfrost interaction logic was migrated from the extension frontend to the SubWallet backend service, so the API key is never transmitted to or visible from the browser/extension environment.
**Rationale**: Because the API key was transparent in the extension bundle and therefore vulnerable to extraction, running queries server-side prevents key leakage while still giving the extension full access to Cardano chain data through SubWallet's own proxy endpoints.
**Alternatives considered**:
- Rotating API keys on a schedule — rejected as treating the symptom rather than the root cause; the key would still be exposed client-side.
- Switching to a permissionless provider with no key — no such production-ready alternative was identified in the issues.
**Impact**: Backend proxy PR merged (referenced in #4368 comment: SubWallet-Monorepos PR #23); extension no longer bundles a Blockfrost API key; balance and UTXO requests route through SubWallet backend.
**Date**: 2025-05-15
**Version**: v1.3.x (Milestone 9)
**Citations**: [#4368](https://github.com/Koniverse/SubWallet-Extension/issues/4368)


---

---

### D43. Crosschain BTC swap via Chainflip (BTC ↔ DOT) and Optimex (BTC ↔ ETH); 1-click BTC ↔ tBTC deferred

**Context**: After native Bitcoin support shipped, the team evaluated swap routes for BTC. Three paths were considered: Chainflip (native BTC ↔ DOT/ETH), Optimex (BTC ↔ ETH via a provider API), and a 1-click BTC ↔ tBTC route on Hydration (multi-step: BTC → ETH via Chainflip → tBTC via KyberSwap/Uniswap → tBTC on Hydration via Snowbridge).
**Decision**: Chainflip was integrated first for BTC ↔ DOT (issue #4467, #4573) and BTC ↔ ETH (partially via #4495). Optimex was integrated as a second BTC swap provider for ETH ↔ BTC (issue #4496, merged October 2025). The 1-click BTC ↔ tBTC on Hydration was deferred (issue #4517) because no vendor supports the full atomic route end-to-end.
**Rationale**: Because Chainflip already had SDK support and an existing integration in SubWallet, it was the lowest-cost path to enabling BTC swaps; Optimex was added because it offers a separate liquidity source for BTC ↔ ETH with its own provider API; the multi-step tBTC route was deferred because automating three hops (Chainflip + KyberSwap/Uniswap + Snowbridge) without vendor-supported atomic execution is infeasible with current tooling.
**Alternatives considered**:
- Single-provider swap only — rejected to avoid liquidity concentration and improve route coverage.
- 1-click BTC ↔ tBTC immediately — rejected due to lack of atomic multi-step vendor support; tracked as a future issue (#4595).
**Impact**: `findPath` logic updated to generate direct and multi-step swap paths for Chainflip and Optimex pairs; Chainflip SDK bumped; Optimex service added to both backend and extension; Native SegWit address auto-selected as the BTC sender address in swap flows.
**Date**: 2025-06-23
**Version**: v1.3.50
**Citations**: [#4467](https://github.com/Koniverse/SubWallet-Extension/issues/4467), [#4496](https://github.com/Koniverse/SubWallet-Extension/issues/4496), [#4517](https://github.com/Koniverse/SubWallet-Extension/issues/4517), [#4573](https://github.com/Koniverse/SubWallet-Extension/issues/4573), [#4595](https://github.com/Koniverse/SubWallet-Extension/issues/4595), [PR #4574](https://github.com/Koniverse/SubWallet-Extension/pull/4574), [PR #4637](https://github.com/Koniverse/SubWallet-Extension/pull/4637)

---

---

## Phase 4 — Proxy/Multisig Account Models, Governance Rollout & XCM Migration (2025 H2, shipped v1.3.x)

### D44. Migrate ParaSpell from V4/V5 to v1 API (docs v12-to-v13)

**Context**: ParaSpell released a new v1 API (corresponding to docs v12-to-v13 migration), changing base URLs and request payload structures across all XCM functions.

**Decision**: Migrate the SubWallet ParaSpell integration to v1 API, refactoring all request payloads and parameters.

**Rationale**: Staying on V4/V5 would eventually lose upstream support and miss new features. The v1 API is the stable forward path for all new ParaSpell ecosystem features (per D28).

**Alternatives considered**: None documented — migration is a maintenance requirement of the D28 stay-on-ParaSpell decision.

**Impact**: All XCM-related ParaSpell calls updated; two PRs shipped the migration.

**Date**: 2025-07-01
**Version**: v1.3.72–v1.3.79

**Citations**: [#4908](https://github.com/Koniverse/SubWallet-Extension/issues/4908), [#4979](https://github.com/Koniverse/SubWallet-Extension/issues/4979), [PR #4909](https://github.com/Koniverse/SubWallet-Extension/pull/4909), [PR #4982](https://github.com/Koniverse/SubWallet-Extension/pull/4982)

---

### D45. Remain on ParaSpell API for XCM (do not build in-house or self-host)

**Context**: As XCM complexity grew (Snowbridge, Across, Asset Hub Migration), the team evaluated whether to build XCM transfer logic in-house or fork/self-host ParaSpell.

**Decision**: Continue using the ParaSpell API, upgrading through version milestones (v4, v5, v1 API) as they release.

**Rationale**: Building XCM transfer logic in-house would require significant ongoing maintenance to track every Polkadot runtime upgrade. Forking ParaSpell creates a self-maintenance burden without the upstream improvements. Staying on the official API ensures the team benefits from ParaSpell's own ecosystem tracking.

**Alternatives considered**:
- Build XCM transfer logic in-house — rejected: high maintenance cost.
- Fork and self-host the ParaSpell XCM API — rejected: maintenance burden without benefit.
- Stay on ParaSpell and upgrade versions as they release — chosen.

**Impact**: XCM bridge logic remains delegated to ParaSpell; three version upgrades (v4, v5, v1 API) shipped during this phase.

**Date**: 2025-07-01
**Version**: v1.3.55–v1.3.79

**Citations**: [#4405](https://github.com/Koniverse/SubWallet-Extension/issues/4405), [#4606](https://github.com/Koniverse/SubWallet-Extension/issues/4606), [#4908](https://github.com/Koniverse/SubWallet-Extension/issues/4908), [#4979](https://github.com/Koniverse/SubWallet-Extension/issues/4979)

---

### D46. External API (Middleware / taostats) for Validator Data; Static Cache for Earning Data

**Context**: TAO staking required a validator/delegate list and position data. The extension exhausted SubWallet's external services API budget (99.5% of requests consumed by Bittensor earning alone, per #4623). The initial approach used a live middleware API keyed with a rotating API key (#3809, #4029).
**Decision**: Introduce a static data cache layer (#4623): earning-pool metadata (pool info, validator list, APY, min stake) is served from a static cached endpoint updated periodically; the extension reads from the cache rather than polling the live middleware at each subscription interval. The block explorer for transaction history was updated to taostats.io (#4058).
**Rationale**: Because the per-request polling model against the middleware did not scale to Bittensor's data volume — a single network consumed nearly all API quota, degrading other chains; static caching trades freshness for sustainability.
**Alternatives considered**:
- Increasing API key quota / rate-limit raising — attempted as a short-term fix (#3809, #4029) but did not resolve the structural over-polling problem.
- Fetching data directly from on-chain RPC — not chosen because archive node queries at the required frequency would be even heavier.
**Impact**: `subscribePoolPosition` interval logic refactored; pool metadata routing updated to point to static cache; validator min-stake now sourced from middleware with cache invalidation (#4520).
**Date**: 2025-08-19
**Version**: v1.3.x
**Citations**: [#4623](https://github.com/Koniverse/SubWallet-Extension/issues/4623), [#3809](https://github.com/Koniverse/SubWallet-Extension/issues/3809), [#4058](https://github.com/Koniverse/SubWallet-Extension/issues/4058)


---

---

### D47. Phased delegation rollout — delegation deferred to Phase 2 of OpenGov implementation

**Context**: The overall OpenGov scope (#4257, #4672) covered both referenda/voting and delegation. When planning the extension implementation, the team decided how to sequence the work.
**Decision**: Split OpenGov implementation into two explicit phases: Phase 1 covers referenda viewing, casting votes (aye/nay/abstain/split), revote, unvote, and governance lock management (view and unlock). Phase 2 adds delegation management — viewing potential delegates, viewing active delegations, add/edit/undelegate flows.
**Rationale**: Referenda voting is the higher-frequency user action and the prerequisite for understanding delegation context, so shipping it first delivers usable governance capabilities faster. Delegation introduces additional complexity (conviction selection, per-track delegation, multi-account delegation state) that would delay Phase 1 if bundled together.
**Alternatives considered**:
- Ship voting and delegation together in a single release — rejected because the combined scope would have delayed the initial governance release significantly.
- Include delegation in Phase 1 but as read-only — not pursued; delegation display complexity was also non-trivial and not required for basic governance participation.
**Impact**: Phase 1 PRs (#4749, #4714) shipped without delegation screens; delegation state is surfaced only as an informational indicator on the vote screen when the account has an active delegation. Phase 2 issues (#4672 Phase 2 section) track the full delegation implementation.
**Date**: 2025-09-15
**Version**: v1.3.x (Milestone 9 — Phase 1) / Milestone 10 (Phase 2)
**Citations**: [#4257](https://github.com/Koniverse/SubWallet-Extension/issues/4257), [#4672](https://github.com/Koniverse/SubWallet-Extension/issues/4672), [#4678](https://github.com/Koniverse/SubWallet-Extension/issues/4678)

---

### D48. Scope Multisig to Polkadot Substrate Chains Only (Phase 1); Defer Other Ecosystems

**Context**: When planning the multisig feature (#4696, #1677), the team had to decide which blockchain ecosystems to support given that SubWallet already covers Polkadot/Substrate, EVM, TON, and Cardano.
**Decision**: Phase 1 multisig support is limited to Polkadot/Substrate networks (those that expose the `multisig` pallet). EVM, TON, Cardano, and cross-ecosystem multisig are explicitly excluded. The UI enforces this by filtering out non-Substrate networks from all multisig account screens.
**Rationale**: Because Polkadot's native `pallet-multisig` provides deterministic multisig addresses, standardised `as_multi`/`approve_as_multi`/`cancel_as_multi` extrinsics, and on-chain pending-transaction storage without an external smart contract, it is the lowest-risk starting point. EVM and other ecosystems use entirely different models (e.g., Safe contracts) that require separate integration efforts.
**Alternatives considered**:
- EVM Safe/Gnosis multisig — deferred; requires a different account model and contract interaction layer.
- Cross-chain multisig — deferred; no cross-chain multisig primitive exists in the Polkadot Substrate pallet.
**Impact**: Network filter logic was added so only Substrate networks appear in multisig account creation and governance screens (#4855, QA item 10). Multisig accounts cannot connect to dApps initially (dApp connect was later enabled in the improvement issue #4963).
**Date**: 2025-09-22
**Version**: v1.3.x (Milestone 10)
**Citations**: [#4696](https://github.com/Koniverse/SubWallet-Extension/issues/4696), [#1677](https://github.com/Koniverse/SubWallet-Extension/issues/1677)


---

---

### D49. Remove the Crowdloans tab (Polkadot Agile Coretime deprecates slot auctions)

**Context**: Polkadot launched Agile Coretime, permanently deprecating parachain slot auctions and crowdloans. No future crowdloans will occur.

**Decision**: Remove the Crowdloans tab from the extension and web app entirely.

**Rationale**: Displaying a tab for a feature that can never be used again adds UI noise without value. Historical locked-fund visibility can be accessed via balance screens.

**Alternatives considered**:
- Keep the Crowdloans tab for historical locked-fund visibility — rejected: adds noise for a permanently deprecated feature.
- Remove it entirely from all platforms — chosen.

**Impact**: Crowdloans tab removed; a community PR targeting the wrong branch (master instead of dev) was also rejected.

**Date**: 2025-10-01
**Version**: post-v1.3.x

**Citations**: [#4920](https://github.com/Koniverse/SubWallet-Extension/issues/4920), [PR #4949](https://github.com/Koniverse/SubWallet-Extension/pull/4949)

---

### D50. Support named proxy types aligned with Polkadot pallet — no custom types

**Context**: When scoping the Proxy Account feature (#1676, #4725), the team had to decide how to model proxy permissions in the wallet UI.
**Decision**: Support the standard on-chain proxy types as defined in the Polkadot proxy pallet — `Any`, `NonTransfer`, `Governance`, `Staking`, `CancelProxy`, and chain-specific variants where relevant — without inventing custom or cross-chain abstraction types.
**Rationale**: Staying within protocol-standard types avoids complexity because any custom abstraction would diverge from on-chain reality and confuse users about the actual permission scope enforced by the runtime. Using native pallet types means the UI can directly reflect what the chain enforces.
**Alternatives considered**:
- Define simplified high-level "permission tiers" — rejected because the tier labels would not map 1:1 to what the chain enforces, increasing risk of user error.
- Cross-ecosystem proxy abstraction — explicitly listed as a non-goal; custom proxy logic outside protocol standards is out of scope.
**Impact**: `ProxyService` normalises response data into a unified structure keyed by chain-native proxy type; the Add Proxy Form exposes a dropdown populated from on-chain type enumeration; networks that use dApp staking instead of Staking pallet receive a filtered type list.
**Date**: 2025-10-02
**Version**: v1.3.x (Milestone 9)
**Citations**: [#1676](https://github.com/Koniverse/SubWallet-Extension/issues/1676), [#4725](https://github.com/Koniverse/SubWallet-Extension/issues/4725), [#4777](https://github.com/Koniverse/SubWallet-Extension/issues/4777)


---

---

### D51. Proxy signing via "Sign Selector" popup on existing transaction flows — no separate proxy-initiated flow

**Context**: When building the signing UX for proxied transactions (#4779, #4782), the team needed to decide whether to add a dedicated "send as proxy" entry point or integrate proxy selection into the existing transaction confirmation flow.
**Decision**: Add a "Sign Selector" popup that appears at the transaction confirmation stage for any existing transaction type (transfer, stake, governance vote, etc.) when a suitable proxy relationship exists. The user selects either the proxied account (signs directly) or a proxy account (wraps the extrinsic in `proxy.proxy`). The proxy selection step is inserted at confirmation, not at the action-initiation screen.
**Rationale**: Inserting the proxy selector at confirmation keeps all existing action entry points unchanged, because changing every form that initiates a transaction would be high-risk and require deep UI changes across the entire codebase. Confirming the signer late in the flow also ensures balance validation happens against the actual signing account.
**Alternatives considered**:
- "Send as proxy" toggle at the top of every transaction form — rejected because it requires modifying all action screens and couples proxy concepts into screens that have no other proxy context.
- Dedicated proxy-execution screens per action type — rejected as duplicative and inconsistent with the existing action architecture.
**Impact**: `proxiedAddress` flag added to transaction context for background tracking; extrinsic payload kept intact and wrapped only at submission; history records entries for both proxy and proxied accounts (#4783); custom fee token selection deferred (cannot be handled because the signer is resolved at confirmation while fee token is chosen earlier).
**Date**: 2025-10-14
**Version**: v1.3.x (Milestone 9)
**Citations**: [#4779](https://github.com/Koniverse/SubWallet-Extension/issues/4779), [#4782](https://github.com/Koniverse/SubWallet-Extension/issues/4782), [#4783](https://github.com/Koniverse/SubWallet-Extension/issues/4783), [#4942](https://github.com/Koniverse/SubWallet-Extension/issues/4942)


---

---

### D52. Governance V1 (Democracy pallet) chains receive display-only support — voting and delegation disabled

**Context**: Several Substrate-based parachains (Ajuna, Astar, Phala, Heima, Acala, Centrifuge, Interlay, LAOS, Karura, Kintsugi) still run the older Governance Democracy (V1) model rather than OpenGov. During Phase 1 testing (#4678, #4729), testers found that these networks caused status filter failures and had disabled Delegation tabs.
**Decision**: Chains still using Governance V1 (Democracy pallet) are given read/display-only support: their referenda are listed in the UI with available metadata, but voting actions, delegation, conviction voting, and balance unlocking are disabled for those networks. Filters are also disabled because Subsquare does not provide filter-compatible endpoints for V1 governance.
**Rationale**: Implementing full V1 governance actions (which use different pallet calls and status types) alongside OpenGov within the same Phase 1 scope would have doubled the implementation effort, because the two models have incompatible call signatures, status enumerations, and lock mechanisms. Displaying V1 referenda satisfies basic visibility needs without requiring parallel action flows.
**Alternatives considered**:
- Full V1 voting parity in Phase 1 — rejected due to scope and the different pallet API surface area.
- Hiding V1 networks from governance entirely — rejected to preserve basic visibility for users on those networks.
**Impact**: `OpenGovService` detects network governance model type; Delegation tab conditionally disabled; vote/revote button hidden for V1 networks; filter controls disabled when V1 API lacks filtered endpoints.
**Date**: 2025-10-24
**Version**: v1.3.x (Milestone 9)
**Citations**: [#4729](https://github.com/Koniverse/SubWallet-Extension/issues/4729), [#4678](https://github.com/Koniverse/SubWallet-Extension/issues/4678)


---

---

### D53. Support Root Staking Reward Claim Options (Root Claim vs Alpha Claim)

**Context**: In November 2025, Bittensor changed root staking emissions: rewards are no longer automatically converted to TAO; stakers must choose between Root Claim (alpha earned converts to TAO, awarded ~daily) and Alpha Claim (earned alpha remains staked on each subnet). Issue #4829 was raised to support this new model.
**Decision**: Extend the TAO earning position model to read each account's current root claim type from chain and expose a UI for switching between Root Claim and Alpha Claim, implemented as background logic (#4851) and a new UI screen (#4852) referencing the design spec.
**Rationale**: Because the Bittensor protocol mandated the change and ignoring it would leave users unable to manage where their staking rewards accrue; the two-option model is a direct reflection of the on-chain `rootClaimType` storage.
**Alternatives considered**:
- Auto-defaulting to Root Claim with no user option — rejected because Alpha Claim is a meaningful economic choice for users wanting to remain allocated to specific subnets.
**Impact**: New background handler to get/set root claim type; new settings UI surface in earning position details for Bittensor root stakers.
**Date**: 2025-11-10
**Version**: v1.3.x (Milestone 9)
**Citations**: [#4829](https://github.com/Koniverse/SubWallet-Extension/issues/4829), [#4851](https://github.com/Koniverse/SubWallet-Extension/issues/4851), [#4852](https://github.com/Koniverse/SubWallet-Extension/issues/4852)


---

---

### D54. Approval Flow Uses Native Pallet Extrinsics (`as_multi`, `approve_as_multi`, `cancel_as_multi`) with Role-Differentiated Actions

**Context**: The signing and approval flow design needed to specify which extrinsics to use and how to differentiate between initiator, normal approver, and final approver roles (#4843).
**Decision**: Three distinct extrinsic paths are implemented: (1) initiator submits `as_multi` with call data to start the transaction; (2) non-final approvers submit `approve_as_multi` (call hash only, no call data required); (3) the final approver submits `as_multi` with the full call data to execute the transaction on-chain. The original initiator can cancel with `cancel_as_multi`. The UI exposes Approve, Execute, and Cancel buttons based on the caller's role and the current approval count vs. threshold.
**Rationale**: Because `pallet-multisig` mandates this three-way split — call data must be re-supplied only at execution time by the final signer — the implementation mirrors the pallet's own API exactly. Deviating from it would produce invalid extrinsics.
**Alternatives considered**:
- Always include call data in every approval — rejected; the pallet only requires call data from the final approver and including it in intermediate approvals wastes block space and is inconsistent with the standard.
- Single "sign" button with hidden role logic — rejected for UX reasons; users need to understand whether they are approving or executing, since the final approval triggers immediate on-chain execution.
**Impact**: `MULTISIG_INIT_TX` transaction type introduced (#4938); approval and cancellation handlers built; warning added when removing an account that has pending multisig transactions (#4841, #4842 comment).
**Date**: 2025-11-13
**Version**: v1.3.x (Milestone 9)
**Citations**: [#4843](https://github.com/Koniverse/SubWallet-Extension/issues/4843), [#4938](https://github.com/Koniverse/SubWallet-Extension/issues/4938)

---

### D55. Deterministic Off-Chain Account Creation with No On-Chain Transaction

**Context**: The team needed to decide whether creating a multisig account in SubWallet requires an on-chain registration extrinsic (#4838, #4841).
**Decision**: Multisig accounts are created entirely off-chain and stored locally. The account address is derived deterministically from the sorted list of signatories and the threshold value. No extrinsic is submitted and no network fee is paid at creation time; the account becomes "activated" only when its first `as_multi` transaction hits the chain.
**Rationale**: Because Polkadot's `pallet-multisig` derives the multisig address deterministically from `(signatories[], threshold)`, there is no need for a registration extrinsic — the address is predictable before any on-chain activity. This approach removes friction (no fee to create), allows offline setup, and is consistent with how other Polkadot-ecosystem multisig tools (Polkasafe, Multix) work.
**Alternatives considered**:
- On-chain registration extrinsic — rejected; the pallet does not require one, and it would impose unnecessary cost and latency for account setup.
**Impact**: `MultisigService` stores account config locally; Phase 2 auto-detection logic (#4839, #4844) uses on-chain event history to discover pre-existing multisig accounts, because the wallet cannot know about externally-created multisig accounts from local state alone.
**Date**: 2025-11-13
**Version**: v1.3.x (Milestone 9/10)
**Citations**: [#4838](https://github.com/Koniverse/SubWallet-Extension/issues/4838), [#4841](https://github.com/Koniverse/SubWallet-Extension/issues/4841)


---

---

### D56. On-Chain Pending-Transaction Detection Without an Indexer in Phase 1; Indexer Integration Deferred to Phase 2

**Context**: To surface pending multisig approvals to users, the team had to choose between polling the chain directly vs. querying an external indexer (#4842, #4839).
**Decision**: Phase 1 uses direct on-chain RPC calls to detect and subscribe to pending multisig transactions in real time (Observable pattern). Indexer integration (Subscan/Subsquid) for enriched history and auto-detection of previously-activated multisig accounts is explicitly deferred to Phase 2 (#4839, #4844).
**Rationale**: Because an indexer dependency would block Phase 1 delivery and is not required to display pending transactions that are currently stored in chain state (`pallet-multisig` exposes them via storage queries), direct RPC is sufficient for the immediate use case. Enriched historical data (call details, full history) is a Phase 2 enhancement that requires indexer coverage.
**Alternatives considered**:
- Full indexer integration from the start — deferred; introduces an external service dependency that would slow Phase 1 and may not be available for all supported networks.
- Polling only (no subscribe) — rejected in favour of an Observable subscription for real-time UX (#4842 description explicitly calls for subscribe/get functions).
**Impact**: `MultisigService` built with Observable subscription to pending transactions; call data and extrinsic hashes are decoded directly from block data (#4842). Phase 2 issues (#4844, #4845) remain open pending Phase 1 completion.
**Date**: 2025-11-13
**Version**: v1.3.x (Milestone 9)
**Citations**: [#4842](https://github.com/Koniverse/SubWallet-Extension/issues/4842), [#4839](https://github.com/Koniverse/SubWallet-Extension/issues/4839)


---

---

### D57. No display of reverse "proxied-by" relationship in the Manage Proxies screen

**Context**: During QA of #4725, testers reported that when Account B has been granted a proxy by Account A, Account B's own "Manage Proxies" screen did not show Account A as a principal (the account B is acting for).
**Decision**: Show only the outgoing proxy relationships (proxies that the selected account has granted) in the Manage Proxies screen. The reverse direction (who has granted a proxy to this account) is explicitly not supported in the initial implementation.
**Rationale**: Querying reverse proxy relationships requires a full scan of the proxy pallet state or an index, which is not available in the current `ProxyService` data model. The design (Figma) also does not include a "proxied-by" view in the initial scope. Supporting it is deferred to a follow-up.
**Alternatives considered**:
- Query and display both outgoing and incoming proxy relationships — deferred because reverse lookup is architecturally heavier and out of initial scope per the BA document.
**Impact**: Manage Proxies UI only calls `getAccountsProxyItems` for the selected account as principal; no reverse index query is built.
**Date**: 2025-12-05
**Version**: v1.3.x (Milestone 9)
**Citations**: [#4725](https://github.com/Koniverse/SubWallet-Extension/issues/4725)


---

---

### D58. Scope Bittensor On-Chain Swap via `swapStakeLimit` Pallet (Not Third-Party Provider for Alpha)

**Context**: Swapping between TAO and alpha tokens was initially routed through SimpleSwap (#3855) for TAO/DOT pairs. For native TAO ↔ alpha token and alpha ↔ alpha swaps, a separate decision was needed in Dec 2025 when #4899 was raised.
**Decision**: Implement native Bittensor on-chain swaps for TAO ↔ alpha and alpha ↔ alpha by calling the `swapStakeLimit` pallet directly on the Bittensor chain, distinct from the existing SimpleSwap provider path which handles cross-chain fiat/EVM pairs.
**Rationale**: Because TAO ↔ alpha swaps are settled on-chain via the subnet AMM (the same AMM that drives dTAO slippage), making a native pallet call the correct integration point; routing them through a third-party aggregator would add latency, fees, and custodial risk for what is a native on-chain operation.
**Alternatives considered**:
- Routing alpha swaps through SimpleSwap or another off-chain aggregator — not chosen; SimpleSwap is only used for DOT ↔ TAO cross-chain pairs (#3855) and does not support alpha tokens.
**Impact**: New swap handler using `swapStakeLimit` extrinsic; separate swap UI screen from the existing cross-chain swap flow.
**Date**: 2025-12-10
**Version**: v1.3.x
**Citations**: [#4899](https://github.com/Koniverse/SubWallet-Extension/issues/4899), [#3855](https://github.com/Koniverse/SubWallet-Extension/issues/3855)


---

## TON

---

### D59. Scope proxy support to Substrate (Polkadot pallet) accounts only — exclude EVM solo and Ledger EVM

**Context**: During QA of #4725, testers found that the "Manage Proxies" tab was visible for EVM solo accounts and Ledger EVM accounts, which have no proxy pallet on their chain.
**Decision**: Hide the Manage Proxies tab for EVM solo accounts and Ledger EVM accounts; restrict proxy management to Substrate accounts (including Ledger Polkadot Generic and Ledger Polkadot Migration). Additionally, remove from the "Add Proxy" network list any chains confirmed to not support the proxy pallet (e.g., `darwinia2`, `crabParachain`, `laos_network`, `vflow` removed via chainlist patch #4935).
**Rationale**: Showing proxy management UI for account types that cannot submit `proxy.add_proxy` extrinsics would mislead users and result in failed transactions, because the Polkadot proxy pallet is substrate-only. The feature must match runtime capability.
**Alternatives considered**:
- Show the tab but disable all actions for EVM accounts — rejected because it creates confusion about why the feature is unavailable.
- Rely solely on RPC failure to surface incompatibility — rejected as a poor UX that surfaces errors only after user has invested in filling forms.
**Impact**: Account detail screen filters the Manage Proxies tab by account type; network selector in Add Proxy is gated by chain-list metadata (`supportsProxy` flag synced with SubWallet-ChainList).
**Date**: 2025-12-30
**Version**: v1.3.x (Milestone 9 / 10 boundary)
**Citations**: [#4725](https://github.com/Koniverse/SubWallet-Extension/issues/4725), [#4935](https://github.com/Koniverse/SubWallet-Extension/issues/4935)


---

---
