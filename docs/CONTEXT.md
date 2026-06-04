<!--
  APPEND-ONLY — never edit or delete a past entry (RULE-7).
  To revise a decision add a new D<N> entry that references D<M> by number.
  See .agents/skills/koni-docs/references/templates/context.md for the full guide.
-->

---

## Phase 0 — Foundation & Early Architecture (2022-03-15, shipped v0.3.x–v0.5.x)

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

## Phase 1 — ChainService Architecture & New UI (2022-10-14, shipped v0.7.x–v1.0.x)

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

### D8. Deprioritise PouchDB for cross-platform storage

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

### D9. Defer step 3 of online chain-list auto-update (immediate provider change)

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

### D10. Do not auto-select validators; users should research or use pools

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

### D11. Temporarily hide Substrate private-key export (no wallet supports re-import yet)

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

### D12. WalletConnect initial integration defers eth_signTransaction and eth_signTypedData

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

### D13. Fix Ledger HID conflicts by disconnecting device on session close (not by splitting HTML files)

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

### D14. Adopt EIP-6963 multi-provider discovery alongside window.ethereum injection

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

### D15. Defer custom derived-path feature to avoid Milestone 6 scope creep

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

### D16. Complete MV3 migration (service-worker lifecycle, DApp connection, fetch, storage)

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

### D17. Implement full OpenGov voting (not read-only) for Polkadot governance

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

### D18. Scope ZK assets (Manta) to extension only — exclude WebApp and mobile

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

## Phase 2 — Earning Rebrand, XCM Bridge, i18n & Fiat Tooling (2024-02-01, shipped v1.1.x–v1.2.x)

### D20. Rename "Staking" feature to "Earning" across all platforms

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

### D21. Adopt Texterify as the multilingual management platform

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

### D22. Integrate Meld All-in-One Wizard directly (supersedes standalone Meld research task)

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

### D23. GRC-20 token type renamed to VFT (Vara Fungible Token)

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

### D24. Abandon SnowBridge SDK in favour of ParaSpell API for XCM bridge protection

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

### D25. XCM Transfer Max formula: reserve 1.2× ED + 2× fee to prevent dust loss

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

## Phase 3 — Swap/XCM Consolidation & Feature Pruning (2025-01-01, shipped v1.3.x)

### D26. Cancel dynamic swap pair support (Milestone 8 Cancel)

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

### D27. Cancel 1inch DEX aggregator integration (economically unviable pricing)

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

### D28. Remain on ParaSpell API for XCM (do not build in-house or self-host)

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

### D29. Remove the Crowdloans tab (Polkadot Agile Coretime deprecates slot auctions)

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

### D30. Migrate ParaSpell from V4/V5 to v1 API (docs v12-to-v13)

**Context**: ParaSpell released a new v1 API (corresponding to docs v12-to-v13 migration), changing base URLs and request payload structures across all XCM functions.

**Decision**: Migrate the SubWallet ParaSpell integration to v1 API, refactoring all request payloads and parameters.

**Rationale**: Staying on V4/V5 would eventually lose upstream support and miss new features. The v1 API is the stable forward path for all new ParaSpell ecosystem features (per D28).

**Alternatives considered**: None documented — migration is a maintenance requirement of the D28 stay-on-ParaSpell decision.

**Impact**: All XCM-related ParaSpell calls updated; two PRs shipped the migration.

**Date**: 2025-07-01
**Version**: v1.3.72–v1.3.79

**Citations**: [#4908](https://github.com/Koniverse/SubWallet-Extension/issues/4908), [#4979](https://github.com/Koniverse/SubWallet-Extension/issues/4979), [PR #4909](https://github.com/Koniverse/SubWallet-Extension/pull/4909), [PR #4982](https://github.com/Koniverse/SubWallet-Extension/pull/4982)
