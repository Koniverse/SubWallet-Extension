# LESSONS.md — SubWallet Extension: Lessons Learned

> **Canonical guide**: AGENTS.md  
> **One rule above all others**: a lesson earns its keep if it saves the *next contributor* time.  
> Delete entries only when the underlying library or behavior has fundamentally changed — stale advice is worse than no advice.  
> Reference from commit messages: "Per LESSONS §N".

---

## 1. Transferable balance formula must track upstream Substrate changes

**What happened**: Multiple releases shipped incorrect "transferable" amounts — users saw wrong send-max values, some triggered account reaping, and negative balances appeared in transaction screens. The root cause was a stale or inconsistent formula for computing transferable balance.

**Why**: Substrate's balance pallet changed how `frozen` and `reserved` interact. The correct formula after polkadot-sdk PR #12951 is `transferable = free - max(frozen - reserved, ED)`. Code that hard-coded an earlier approximation (`free - frozen`) produced wrong results after runtime upgrades. Additional complexity arose from the `flags` field on system accounts (Polkadot Collectives, Bridge Hub) inflating locked values, and from non-standard pallets (Equilibrium's tuple-based balance storage, Asset Hub pallet-assets).

**How to avoid**:
- Pin the transferable formula to the upstream Substrate definition and update it whenever a polkadot-sdk balance-pallet PR merges.
- Each chain with a non-standard balance pallet (Equilibrium, Gear/Vara, Cardano) requires an explicit adapter — never fall through to the generic Substrate path.
- Unit-test the formula against all pallet variants: `system v1`, `pallet-assets`, `nomination-pool`, and `local token`.
- Send-max logic must subtract **both** fee and ED in a single, consistent calculation; do not apply ED subtraction in multiple places.

See [#303](https://github.com/Koniverse/SubWallet-Extension/issues/303), [#353](https://github.com/Koniverse/SubWallet-Extension/issues/353), [#1163](https://github.com/Koniverse/SubWallet-Extension/issues/1163), [#2079](https://github.com/Koniverse/SubWallet-Extension/issues/2079), [#2118](https://github.com/Koniverse/SubWallet-Extension/issues/2118), [#3246](https://github.com/Koniverse/SubWallet-Extension/issues/3246), [#3440](https://github.com/Koniverse/SubWallet-Extension/issues/3440).

---

## 2. XCM routes break silently after runtime upgrades — always re-validate

**What happened**: XCM transfers failed silently or produced confusing error pages after Substrate runtime upgrades on partner chains. Causes included: MultiLocation v2/v3 destination format mismatches, Paraspell major-version API changes breaking multiple chains at once, XCM delivery fees introduced in polkadot-sdk v1.3.0 being absent from fee estimation, and the Polkadot Asset Hub Migration (AHM) invalidating entire routing paths.

**Why**: XCM is a versioned protocol and both the pallet (v2→v3→v4) and the fee model evolve with each runtime upgrade. SubWallet's XCM layer depended on Paraspell as an abstraction, but Paraspell itself breaks on major versions. The AHM moved DOT from the relay chain to Asset Hub, making pre-migration reserve/teleport paths incorrect.

**How to avoid**:
- Run a full XCM regression sweep against all active channels after every relay-chain or major parachain runtime upgrade.
- Pin Paraspell upgrades to a tested release; schedule a migration PR before the partner chain's enactment date.
- XCM fee estimation must include **delivery fees** (introduced in polkadot-sdk v1.3.0) and **destination-chain ED** for max-transfer cases.
- Each active XCM channel must have a toggle so it can be disabled instantly without a code release (learned from the Acala security incident).
- Max XCM transfer must subtract the source-chain ED to prevent dust-loss scenarios on the source.

See [#333](https://github.com/Koniverse/SubWallet-Extension/issues/333), [#667](https://github.com/Koniverse/SubWallet-Extension/issues/667), [#1218](https://github.com/Koniverse/SubWallet-Extension/issues/1218), [#1505](https://github.com/Koniverse/SubWallet-Extension/issues/1505), [#2792](https://github.com/Koniverse/SubWallet-Extension/issues/2792), [#3617](https://github.com/Koniverse/SubWallet-Extension/issues/3617), [#4416](https://github.com/Koniverse/SubWallet-Extension/issues/4416), [#4632](https://github.com/Koniverse/SubWallet-Extension/issues/4632).

---

## 3. Balance cache must be invalidated on account mutations and network toggles

**What happened**: Stale balances appeared after send/receive operations, after account create/remove, after switching tokens in the send-fund screen, and in All-Accounts mode after account imports. NFTs and earning positions also continued to display after their backing network was disabled.

**Why**: Balance subscriptions were keyed on network only (not on `(network, token)` tuples) and were not torn down on account mutation events. The balance service scattered logic across subscription and state modules without a central cache-invalidation strategy.

**How to avoid**:
- Force-refresh balance after any successful transfer; do not rely on the periodic polling interval alone.
- Balance subscriptions in send-fund and confirmation screens must re-subscribe when **either** the network or the selected token changes.
- Invalidate the All-Accounts balance cache on every account add/remove event.
- Network-dependent UI state (balances, NFTs, earning positions) must be cleared when the backing network is disabled.
- The balance service should be a single service with explicit cache-invalidation hooks, not scattered subscriptions.

See [#463](https://github.com/Koniverse/SubWallet-Extension/issues/463), [#968](https://github.com/Koniverse/SubWallet-Extension/issues/968), [#1161](https://github.com/Koniverse/SubWallet-Extension/issues/1161), [#2323](https://github.com/Koniverse/SubWallet-Extension/issues/2323), [#1151](https://github.com/Koniverse/SubWallet-Extension/issues/1151), [#2612](https://github.com/Koniverse/SubWallet-Extension/issues/2612).

---

## 4. All substrate fee and amount values must use arbitrary-precision integers

**What happened**: DOT staking fee estimation returned a value larger than JavaScript's safe integer range, causing a BigInt overflow that looped the confirmation screen indefinitely. EVM gas estimation also fluctuated, causing submit failures on Astar EVM and other chains.

**Why**: Substrate RPC responses for fees and balances can exceed `Number.MAX_SAFE_INTEGER`. JavaScript's native `number` type silently rounds large values, producing incorrect arithmetic. EVM gas estimation is inherently volatile and lacks a floor value.

**How to avoid**:
- All fee, balance, and amount values received from Substrate RPC must be parsed as `BigNumber` or `BigInt` **before** any arithmetic or display conversion — never pass them through `Number()`.
- EVM gas estimation must use a retry/fallback strategy with a configurable floor value; guard against `undefined` fee responses before rendering.
- Fee display on the confirmation screen must **always** be shown; estimation errors should display a warning, not silently hide the fee field.

See [#641](https://github.com/Koniverse/SubWallet-Extension/issues/641), [#770](https://github.com/Koniverse/SubWallet-Extension/issues/770), [#2255](https://github.com/Koniverse/SubWallet-Extension/issues/2255), [#2336](https://github.com/Koniverse/SubWallet-Extension/issues/2336), [#2146](https://github.com/Koniverse/SubWallet-Extension/issues/2146).

---

## 5. Staking extrinsics are chain-specific — parachain pallets differ from relay-chain

**What happened**: Withdrawal, stake, and unstake operations failed on parachains (Moonbeam/Moonriver, GLMR, Turing Network) because the code reused relay-chain extrinsic signatures. `withdrawUnbonded` on relay-chain requires a `slashing_span` count parameter that was omitted. Moonbeam's `parachain-staking` pallet has entirely different call signatures. The Polkadot/Kusama runtime upgrade in 2023 deprecated controller accounts in favour of proxy accounts, breaking `bond()` and `set_controller()`.

**Why**: The team initially treated parachain staking pallets as variations of the relay-chain `staking` pallet. Each parachain ships its own staking pallet with different extrinsic names, parameter order, and business logic.

**How to avoid**:
- Maintain a per-chain staking-pallet mapping that specifies which extrinsic names, parameter sets, and response shapes apply.
- `withdrawUnbonded` always requires a `slashing_span` count query before submission.
- QR-signer flows must be tested against each supported parachain staking pallet, not just relay-chain staking.
- Monitor Polkassembly and Kusama/Polkadot runtime upgrade proposals; schedule a compatibility update before the enactment block.
- APY calculations must be verified against on-chain data after any staking API update.

See [#809](https://github.com/Koniverse/SubWallet-Extension/issues/809), [#837](https://github.com/Koniverse/SubWallet-Extension/issues/837), [#717](https://github.com/Koniverse/SubWallet-Extension/issues/717), [#1350](https://github.com/Koniverse/SubWallet-Extension/issues/1350), [#4026](https://github.com/Koniverse/SubWallet-Extension/issues/4026), [#4224](https://github.com/Koniverse/SubWallet-Extension/issues/4224).

---

## 6. Multi-step / liquid staking flows need idempotency and subscription cleanup

**What happened**: Liquid staking with Bifrost Polkadot showed duplicate "Mint vDOT" steps because incorrect state management in the multi-step earn flow allowed the same step to be queued twice. XCM balance subscriptions were not cancelled after XCM actions on the earning screen, generating redundant background calls. Swapping-rate defaults were set excessively high. vDOT and vMANTA unstaking failed due to bugs in the liquid staking handler.

**Why**: Multi-step flows accumulate state across async operations. Without idempotency checks at each step boundary and explicit subscription teardown after completion, steps can be re-triggered and subscriptions leak.

**How to avoid**:
- Each step in a multi-step liquid staking or swap flow must be guarded with an idempotency key; duplicate step enqueueing must be rejected.
- Unsubscribe all balance and status listeners immediately after an XCM or liquid staking operation completes.
- Default slippage values for each swap/liquid staking provider must be explicitly reviewed during integration; never ship with a provider default of 0% or maximum.
- Derivative token unstake paths (vDOT, vMANTA, etc.) require dedicated regression tests.

See [#2537](https://github.com/Koniverse/SubWallet-Extension/issues/2537), [#2089](https://github.com/Koniverse/SubWallet-Extension/issues/2089), [#2155](https://github.com/Koniverse/SubWallet-Extension/issues/2155), [#4054](https://github.com/Koniverse/SubWallet-Extension/issues/4054).

---

## 7. Manifest V3 service-worker lifecycle breaks always-on patterns

**What happened**: After MV3 migration, WalletConnect connection popups stopped appearing because service-worker sleep interrupted event listener registration. Outbound fetch calls to online resources (chain configs, swap quotes, price data) were blocked by MV3 service-worker fetch restrictions, leaving the extension operating on stale/empty data after a restart. Pending transactions held in memory indefinitely froze sessions when the service worker was interrupted.

**Why**: MV3 replaces persistent background pages with event-driven service workers that can terminate after ~5 minutes of inactivity. Any pattern that assumed a persistent in-memory state or always-available fetch context breaks silently.

**How to avoid**:
- WalletConnect (and similar always-on listeners) must re-register their event handlers on every service-worker wake event.
- All online-resource fetching (chain configs, price data, swap quotes) must use fetch patterns compatible with MV3 service-worker restrictions; test explicitly after every MV3 build.
- Pending transaction state must have a timeout; after expiry, mark as failed so the session is unblocked.
- Every online resource endpoint must have a static fallback bundled with the extension.

See [#2407](https://github.com/Koniverse/SubWallet-Extension/issues/2407), [#2949](https://github.com/Koniverse/SubWallet-Extension/issues/2949), [#2992](https://github.com/Koniverse/SubWallet-Extension/issues/2992), [#1308](https://github.com/Koniverse/SubWallet-Extension/issues/1308), [#2322](https://github.com/Koniverse/SubWallet-Extension/issues/2322).

---

## 8. EVM provider injection must implement EIP-6963 and avoid tab pollution

**What happened**: SubWallet's EVM provider conflicted with MetaMask and other wallets because it was injected into all pages (not just authorized dApp pages) and did not implement EIP-6963 multi-provider discovery. Uniswap failed to load when only SubWallet was installed. The inject script was not removed on tab close, causing provider leaks across unrelated browser tabs.

**Why**: Before EIP-6963, wallets competed for `window.ethereum`, causing the last-loaded wallet to win. Without EIP-6963 announce/request-provider events, multi-wallet coexistence is broken by design.

**How to avoid**:
- Implement EIP-6963 (`eip6963:announceProvider` / `eip6963:requestProvider`) alongside the legacy `window.ethereum` injection; this is now a baseline requirement.
- Scope content-script injection to explicitly authorized dApp URLs; auto-remove provider on tab unload.
- Keep SubWallet's RDNS and EIP-6963 metadata up to date when bumping WalletConnect or connector library versions.

See [#591](https://github.com/Koniverse/SubWallet-Extension/issues/591), [#2588](https://github.com/Koniverse/SubWallet-Extension/issues/2588), [#2021](https://github.com/Koniverse/SubWallet-Extension/issues/2021).

---

## 9. dApp connection: provider init timing and account-type mismatches

**What happened**: DApps that polled for the EVM provider immediately on page load (e.g., Moonbase App) missed the provider because the background service worker was still starting. Substrate accounts appeared on EVM-only dApp authorization requests and vice versa. After version upgrades, accounts on the dApp allowlist were assigned to the wrong dApp type. SubWallet auto-connected when MetaMask was the active wallet.

**Why**: The EVM provider was initialized late in the startup sequence, and the dApp authorization store did not persist the account's dApp type (Substrate vs EVM) alongside the authorization entry.

**How to avoid**:
- Inject the provider synchronously in the content script before `DOMContentLoaded`; use a deferred promise pattern so the provider is available immediately even if the background is still starting.
- Persist dApp type alongside each authorized account entry; run a migration on extension upgrade.
- Wallet-detection logic must check whether SubWallet is the intended injected provider before initiating a connection handshake.
- dApp permission requests must pre-select the network matching the dApp's `chainId`, not the first active EVM network.

See [#444](https://github.com/Koniverse/SubWallet-Extension/issues/444), [#71](https://github.com/Koniverse/SubWallet-Extension/issues/71), [#473](https://github.com/Koniverse/SubWallet-Extension/issues/473), [#789](https://github.com/Koniverse/SubWallet-Extension/issues/789), [#3180](https://github.com/Koniverse/SubWallet-Extension/issues/3180).

---

## 10. Ledger signing failures are often upstream in polkadot-js or derivation-path conflicts

**What happened**: Transactions signed via Ledger produced bad signatures due to a polkadot-js API issue (#5555). Ledger constrains one asset per derivation path; users who sent tokens to the wrong derivative account lost UI access. The Polkadot app and Avail Recovery app used different derivation paths, so assets sent to the Polkadot app path could not be recovered with the Avail app. Extension crashed when a dApp supplied a V5 XCM Location as `assetId` in a `SignerPayload` because the signing code didn't handle V5 format.

**Why**: The Ledger hardware signing path is a long chain involving hardware firmware, the Ledger app, the transport library, and the polkadot-js API. Any link in this chain can produce an incorrect signature or derivation.

**How to avoid**:
- Monitor the polkadot-js API repo for Ledger-related bug fixes; pin to validated versions.
- When supporting multiple Ledger apps for the same chain ecosystem, verify address derivation compatibility between apps **before** offering both to users.
- Clearly communicate Ledger derivation-path constraints in UI; maintain an offline recovery tool for assets stranded in wrong derivative accounts.
- Signer payload handling must defensively parse and validate `assetId` types including future XCM Location versions (V4, V5).
- Each Ledger app/chain combination requires its own signed-extension matrix to be validated.

See [#1096](https://github.com/Koniverse/SubWallet-Extension/issues/1096), [#2200](https://github.com/Koniverse/SubWallet-Extension/issues/2200), [#3145](https://github.com/Koniverse/SubWallet-Extension/issues/3145), [#4645](https://github.com/Koniverse/SubWallet-Extension/issues/4645), [#4989](https://github.com/Koniverse/SubWallet-Extension/issues/4989).

---

## 11. Transaction history parsers need format-specific test coverage

**What happened**: Transaction history was recorded incorrectly for dApp-originated transactions because the history writer used the extension's internal account context instead of the dApp-supplied transaction parameters. EVM history and NFT transfer history disappeared after a receipt format change. Duplicate entries appeared when both local state and Subscan indexer returned the same transaction.

**Why**: The transaction history subsystem has multiple data sources (local state, Subscan, SubSquid, in-extension recording). Each source has its own data shape and each chain type (Substrate, EVM, XCM, NFT) has different record formats.

**How to avoid**:
- History entries must be constructed from on-chain extrinsic data, not inferred from UI context — especially for dApp-originated transactions.
- History parsers need regression tests covering EVM receipt format updates and NFT transfer record shapes.
- Deduplicate entries from local state and external indexers before rendering; use extrinsic hash as the canonical key.
- NFT transfer amount formatting must use a dedicated path, not the fungible token amount formatter.

See [#675](https://github.com/Koniverse/SubWallet-Extension/issues/675), [#2362](https://github.com/Koniverse/SubWallet-Extension/issues/2362), [#2373](https://github.com/Koniverse/SubWallet-Extension/issues/2373), [#2613](https://github.com/Koniverse/SubWallet-Extension/issues/2613).

---

## 12. Transaction nonce collisions and signing-queue ordering

**What happened**: Submitting two transactions in quick succession before the first was included in a block caused the second to fail with a nonce collision error. Transaction signing failed when the chain API was not connected — the signing handler did not wait for API initialization.

**Why**: Substrate nonces are per-account and must be monotonically increasing. Without a transaction queue that serializes submission, the extension can submit two transactions with the same nonce.

**How to avoid**:
- Implement a transaction queue that holds subsequent transactions until the preceding one receives block inclusion confirmation.
- Transaction signing must queue or prompt chain reconnection rather than failing silently when the API is uninitialized.
- Never allow the confirmation screen to progress to signing when the account balance is insufficient to cover gas fees; validate before showing the popup.

See [#403](https://github.com/Koniverse/SubWallet-Extension/issues/403), [#419](https://github.com/Koniverse/SubWallet-Extension/issues/419), [#4300](https://github.com/Koniverse/SubWallet-Extension/issues/4300).

---

## 13. Metadata hash and signed extension compatibility must be validated per network

**What happened**: AVL token transfers produced bad signatures because client-side metadata hash calculation was done server-side, causing version skew. Transaction signing for Moonbase Alpha earning failed after the `CheckMetadataHash` signed extension rollout due to metadata hash mismatch. Aleph Zero Ledger signing failed on some tokens due to missing or incorrect signed extension handling.

**Why**: Substrate's `CheckMetadataHash` signed extension requires the client to compute and include a hash of the chain's current metadata in every signed payload. If the hash is computed on a different version (or on the server) than the chain's runtime, the signature is invalid.

**How to avoid**:
- Move metadata shortening and `metadataHash` calculation to the client using `@polkadot-api/merkleize-metadata`; do not delegate to a server.
- `CheckMetadataHash` compatibility must be validated per-network before shipping, including on testnets (Moonbase Alpha, Paseo).
- When bumping `@polkadot/api`, run a signing smoke test on all actively supported chains.

See [#3300](https://github.com/Koniverse/SubWallet-Extension/issues/3300), [#3305](https://github.com/Koniverse/SubWallet-Extension/issues/3305), [#3669](https://github.com/Koniverse/SubWallet-Extension/issues/3669), [#3145](https://github.com/Koniverse/SubWallet-Extension/issues/3145).

---

## 14. iOS / WKWebView storage is ephemeral — mobile wallet data needs native backup

**What happened**: iOS 17.1 silently reset WKWebView indexed storage, causing wallet data loss for iOS mobile app users. The extension team was caught without a backup/restore mechanism.

**Why**: WKWebView's IndexedDB is stored in a process-specific cache that iOS can purge at any time without warning, especially after system updates.

**How to avoid**:
- Mobile web-view storage must be treated as ephemeral; implement a periodic export/backup to native device storage.
- Add a `backup/restore IndexedDB` API in the web runner and expose it to the native shell so data can be preserved across OS updates.
- Send push notifications to users when a backup is available and when a data reset is detected.

See [#2230](https://github.com/Koniverse/SubWallet-Extension/issues/2230), [#2272](https://github.com/Koniverse/SubWallet-Extension/issues/2272), [#2276](https://github.com/Koniverse/SubWallet-Extension/issues/2276).

---

## 15. NFT startup blocking and IPFS gateway reliability

**What happened**: Extension took a very long time to open (or failed entirely) if the user had previously closed it on the NFT tab while NFT data was loading — background IPFS/API requests blocked startup. An IPFS gateway (`ipfs-gateway.cloud`) triggered browser deceptive-site warnings. IPFS URI parsing failed for `ipfs://`, `/ipfs/<CID>`, and bare CID forms. NFT CORS issues arose when the same gateway was used across extension, WebApp, and mobile environments.

**Why**: NFT data loading was synchronous at startup and tied to IPFS gateways that can be slow, flagged by browsers, or subject to CORS restrictions.

**How to avoid**:
- Lazy-load NFT data; never block extension startup on in-flight NFT requests from a previous session.
- IPFS gateway selection must be environment-aware (extension vs. WebApp vs. mobile) to avoid CORS.
- NFT IPFS URI parsing must handle all formats: `ipfs://`, `/ipfs/<CID>/<file>`, and bare CID.
- Use a trusted, SubWallet-controlled IPFS gateway with a fallback list; avoid third-party gateways that may be flagged by browser security filters.
- Wrap NFT metadata parsing in try/catch; display a "metadata unavailable" fallback card rather than dropping the NFT.

See [#97](https://github.com/Koniverse/SubWallet-Extension/issues/97), [#611](https://github.com/Koniverse/SubWallet-Extension/issues/611), [#779](https://github.com/Koniverse/SubWallet-Extension/issues/779), [#1602](https://github.com/Koniverse/SubWallet-Extension/issues/1602).

---

## 16. Wallet reset must iterate every data service — nothing self-clears

**What happened**: NFT data was not cleared when resetting the wallet because the NFT service was missing from the reset hook. Earned positions, chain connections, and token preferences also persisted across resets in various incidents. A bug caused `Erase All` not to fully reset wallet state to defaults, and auto-detected balance detection fired again after reset.

**Why**: Each service independently manages its storage, and reset logic was implemented ad-hoc. Adding a new service without adding it to the reset sequence left orphaned data.

**How to avoid**:
- Maintain an explicit registry of all data services; the reset routine must iterate the registry and call a `reset()` method on every service.
- Write an integration test that performs a full wallet reset and asserts that every storage key returns its default value.
- `Erase All` must be covered by a regression test on both Extension and WebApp.

See [#2106](https://github.com/Koniverse/SubWallet-Extension/issues/2106), [#3035](https://github.com/Koniverse/SubWallet-Extension/issues/3035).

---

## 17. Predefined token/network lists must honour user deletion flags

**What happened**: Default EVM tokens re-added themselves after a user deleted them because the predefined token list was reapplied on every extension startup without checking the user's deletion flag. Currency settings were not persisted correctly across extension version upgrades, causing user preferences to reset to default on each update.

**Why**: Startup initialisation code conflated "apply defaults for new install" with "apply defaults on every startup". User deletions stored in the preference layer were not consulted before re-injecting predefined tokens.

**How to avoid**:
- Store user deletion flags persistently; skip re-injection of deleted predefined tokens on startup.
- Any setting that must survive upgrades needs explicit migration logic in the upgrade handler, not just a default-value initialiser.
- Test upgrade paths: install version N, change a preference, upgrade to version N+1, assert the preference is preserved.

See [#490](https://github.com/Koniverse/SubWallet-Extension/issues/490), [#2977](https://github.com/Koniverse/SubWallet-Extension/issues/2977).

---

## 18. Token slug normalisation — case mismatches cause silent activation failures

**What happened**: USDT (Bifrost) and similar tokens failed auto-activation checks because the wallet stored slugs in uppercase while the indexer produced lowercase. Custom tokens were also excluded from the asset registry when applying an online chainlist patch because the merge step was missing.

**Why**: Token slugs flowed from multiple sources (chain-list package, indexers, dApp injections) with inconsistent casing. String comparison without normalisation produced silent mismatches.

**How to avoid**:
- Normalise token slugs to lowercase at ingestion time on all paths (chain-list, indexer, dApp API).
- When applying online chainlist patches, always merge custom user tokens into the resulting registry — do not overwrite.
- Token deletion must operate on local storage directly and not require a live chain connection.

See [#1500](https://github.com/Koniverse/SubWallet-Extension/issues/1500), [#687](https://github.com/Koniverse/SubWallet-Extension/issues/687), [#3101](https://github.com/Koniverse/SubWallet-Extension/issues/3101).

---

## 19. Swap provider SDKs must handle RPC reconnection and MV3 context loss

**What happened**: Hydration SDK held a stale API promise after an RPC interruption, causing persistent swap quote errors even after the user changed providers. Swap fees displayed incorrectly on the Swap Confirmation screen when reopening after a background service restart (MV3 context loss). ChainFlip default slippage was 0%, meaning users could receive significantly less than expected without warning.

**Why**: Swap provider SDKs are initialized once at startup and assume a stable RPC connection. MV3's service worker can be terminated between user interactions, wiping in-memory SDK state.

**How to avoid**:
- Swap handler SDKs must support reconnection and API promise refresh on RPC failure; guard SDK init against unstable connections.
- Fee data must be refetched or re-validated when a confirmation screen is restored from a sleeping service worker.
- Default slippage for every provider must be explicitly set and reviewed during integration — never rely on the provider's library default.
- Price impact must be applied to the received-amount calculation, not only to the display warning.

See [#3993](https://github.com/Koniverse/SubWallet-Extension/issues/3993), [#3630](https://github.com/Koniverse/SubWallet-Extension/issues/3630), [#3634](https://github.com/Koniverse/SubWallet-Extension/issues/3634), [#4241](https://github.com/Koniverse/SubWallet-Extension/issues/4241).

---

## 20. Network reconnection must be debounced and centralised

**What happened**: A reconnect loop occurred when the network connection was lost and restored: the reconnect handler fired per-network subscription, creating O(n) simultaneous reconnect attempts for n active networks. The background service worker ran indefinitely after a browser restart if the user never opened the popup because the sleep/shutdown mechanism had uncovered edge cases.

**Why**: Each subscription independently triggered a reconnect rather than delegating to a single coordinator. The shutdown logic was not triggered on extension reload events.

**How to avoid**:
- Network reconnection must be debounced and centralised in a single coordinator; individual subscription handlers must not independently trigger reconnect.
- The background service worker shutdown logic must fire on extension reload/unload events, not only on explicit user inactivity.
- Rate-limit external API polling; batch requests where the API supports it.

See [#702](https://github.com/Koniverse/SubWallet-Extension/issues/702), [#802](https://github.com/Koniverse/SubWallet-Extension/issues/802), [#912](https://github.com/Koniverse/SubWallet-Extension/issues/912), [#4623](https://github.com/Koniverse/SubWallet-Extension/issues/4623).

---

## 21. UI must not block on non-critical service initialisation at startup

**What happened**: The WebApp was very slow to load for the first time because the `ROOT` component required all services (including network-dependent NFT and earning services) to resolve before rendering anything. This caused blank screens on slow connections and was reproduced in the extension on slow networks.

**Why**: The root component waited synchronously for all async service data, conflating "critical for first paint" data with "nice to have" background data.

**How to avoid**:
- Separate required-for-first-paint data (account list, master password status) from background service data (balances, NFTs, staking).
- Show progressive loading states; never block paint on network-dependent services.
- Non-critical service data should load and update after the initial paint, not before.

See [#1902](https://github.com/Koniverse/SubWallet-Extension/issues/1902), [#2207](https://github.com/Koniverse/SubWallet-Extension/issues/2207).

---

## 22. WebApp and extension share background logic but have distinct lifecycle assumptions

**What happened**: A large batch of WebApp-specific bugs was discovered during initial QA because the WebApp had not been tested as a standalone product. Using the WebApp and extension simultaneously caused state conflicts: the WebApp cached state locally and became out of sync with the extension background. Extension-specific patterns (popup auto-close, window focus) caused regressions in the WebApp.

**Why**: The WebApp shares the background service layer with the extension but has different navigation lifecycle, connection timing, and rendering environment. The shared codebase masked the WebApp's distinct requirements.

**How to avoid**:
- Create and maintain a dedicated WebApp regression checklist before each release.
- WebApp must treat the extension background as the single source of truth; re-subscribe to all state on every connection, not cache state locally.
- Extension-specific lifecycle assumptions (popup close, expand view) must be gated behind environment detection before any shared code references them.

See [#1680](https://github.com/Koniverse/SubWallet-Extension/issues/1680), [#1838](https://github.com/Koniverse/SubWallet-Extension/issues/1838).

---

## 23. Build environment variables must be explicitly scoped in extension bundles

**What happened**: The extension's `content.js` was embedded in the page with sensitive build variables exposed because the Webpack config did not strip them from page-context scripts.

**Why**: Webpack's `DefinePlugin` or `EnvironmentPlugin` replaced env-var references in all bundles by default. Page scripts and content scripts run in a less-trusted context and should receive only the minimum necessary configuration.

**How to avoid**:
- Explicitly enumerate which environment variables are allowed in `page.js` and `content.js` bundles.
- Production and dev environment parity for backend proxies must be validated; API health checks should cover production endpoints explicitly.
- Hardcoded API keys in source code must be moved to environment variables before shipping.

See [#1823](https://github.com/Koniverse/SubWallet-Extension/issues/1823), [#4977](https://github.com/Koniverse/SubWallet-Extension/issues/4977), [#4929](https://github.com/Koniverse/SubWallet-Extension/issues/4929).

---

## 24. Phishing detection must be stateless with respect to account presence and tested against high-traffic sites

**What happened**: Phishing detection crashed when no account existed in the wallet because the detection function assumed at least one account was present. A separate incident saw the advanced phishing detection feature flag legitimate high-traffic sites (YouTube, X/Twitter) as phishing, alarming users. The feature was temporarily disabled entirely.

**Why**: The detection function used account data as a filter input without guarding against the empty-account case. The heuristics were not tested against a broad whitelist of high-traffic legitimate sites before default-enabling.

**How to avoid**:
- Phishing detection must be stateless with respect to account presence; guard against empty account lists before checking page URLs.
- Before default-enabling any phishing detection heuristic, test it against a curated whitelist of the top 500 high-traffic sites.
- Provide a clear user-visible bypass ("I trust this site") so users are not permanently blocked on false positives.

See [#2372](https://github.com/Koniverse/SubWallet-Extension/issues/2372), [#4889](https://github.com/Koniverse/SubWallet-Extension/issues/4889), [#4891](https://github.com/Koniverse/SubWallet-Extension/issues/4891).

---

## 25. Account migration routines must be tested under high account-count load

**What happened**: Extension was unable to open when updating from v1.3.7 to v1.3.8 for wallets with more than 100 accounts because the migration logic blocked on large account sets. Navigation stack was not explicitly reset when the active account set became empty, leaving the user on a blank screen after removing the last account.

**Why**: Migration routines were developed and tested with small account sets. The O(n) or synchronous blocking patterns that are acceptable for 5 accounts become unacceptable for 100+.

**How to avoid**:
- Account migration routines must be benchmarked with ≥100 accounts before shipping.
- Always process migration in chunks with async yield points to avoid blocking the event loop.
- Navigation stack must be explicitly reset when the active account set becomes empty.
- After removing the last account, redirect to the onboarding/create-account screen.

See [#3890](https://github.com/Koniverse/SubWallet-Extension/issues/3890), [#3054](https://github.com/Koniverse/SubWallet-Extension/issues/3054), [#3148](https://github.com/Koniverse/SubWallet-Extension/issues/3148).

---

## 26. Online content endpoints must always have a static fallback bundled with the extension

**What happened**: The fiat on-ramp token list became empty after the online content endpoint became unavailable (missing fallback). Price history API returned empty data on production due to a misconfigured proxy while dev worked correctly. Online chainlist patch load order caused earning positions to appear for networks not yet enabled, and new-install users saw incorrect state until manual reload.

**Why**: The extension relies on online resources (chain configs, token lists, price data) that can become unavailable due to network issues, proxy misconfigurations, or infrastructure outages. Without a bundled fallback, users see empty or broken UI.

**How to avoid**:
- Every online resource endpoint must have a static fallback bundled with the extension and used when the online fetch fails.
- Online patch application must fire a "ready" event after the chain API is initialised before earning/position views subscribe to it.
- Validate production and dev API endpoint parity explicitly in CI.

See [#2322](https://github.com/Koniverse/SubWallet-Extension/issues/2322), [#4977](https://github.com/Koniverse/SubWallet-Extension/issues/4977), [#3132](https://github.com/Koniverse/SubWallet-Extension/issues/3132).

---

## 27. XCM destination validation: always check existential deposit and sufficient-asset status

**What happened**: Users lost tokens when XCM transferring MYTH to Polkadot Asset Hub for accounts without native DOT — the recipient was not validated for minimum DOT balance on the destination. XCM transfer from PAH to Polkadot left users with less than ED on the source chain because max-transferable did not account for source-chain ED reservation.

**Why**: XCM transfers silently succeed on-chain even if the destination account does not meet ED requirements — the funds are simply trapped. The extension's max-transfer logic computed the full transferable amount without reserving source-chain ED.

**How to avoid**:
- Always validate destination chain ED / sufficient-asset status before allowing XCM transfer submission.
- Max XCM transfer formula: `transferable − source_ED − estimated_fee`.
- Show a warning when the recipient has zero native balance on the destination chain.
- Use ParaSpell's dry-run API to pre-validate XCM routing before submission where the node supports it.

See [#3895](https://github.com/Koniverse/SubWallet-Extension/issues/3895), [#3617](https://github.com/Koniverse/SubWallet-Extension/issues/3617).

---

## 28. WalletConnect and dApp signing flows must be tested after every MV3 or SDK update

**What happened**: WalletConnect connection popup stopped appearing after MV3 migration. Some required EVM JSON-RPC methods were missing from SubWallet's WalletConnect implementation, causing dApps to fail detection. Aleph Zero EVM dApp connection succeeded but transactions failed because SubWallet's all-network inject behavior conflicted with Remix's network-change model.

**Why**: WalletConnect integrates deeply with the extension lifecycle. MV3 changes the service-worker event model; each WalletConnect SDK version bump can change required method sets or namespace formats.

**How to avoid**:
- After every WalletConnect SDK version bump or MV3 lifecycle change, run a full dApp signing regression covering: session creation, message signing, transaction signing, disconnect.
- Audit the WalletConnect EVM session against the current WC EVM spec for required methods.
- dApps that disallow network changes (Remix-style) need a manual network selection option; automatic all-network injection can break EIP-1193 flows.

See [#2407](https://github.com/Koniverse/SubWallet-Extension/issues/2407), [#2860](https://github.com/Koniverse/SubWallet-Extension/issues/2860), [#4330](https://github.com/Koniverse/SubWallet-Extension/issues/4330).

---

## 29. Seed phrase and private key inputs must use `<input>` not `<textarea>`

**What happened**: Seed phrase and private key import fields used `<textarea>` elements, allowing browsers to cache sensitive data in local storage (the "demonic vulnerability").

**Why**: Browser auto-fill and session-restore features cache `<textarea>` content in accessible storage. `<input type="password">` fields are excluded from this caching behaviour.

**How to avoid**:
- Use `<input type="password">` or equivalent for all seed phrase and private key entry fields.
- Add hover-to-reveal UX for displayed seed phrase values.
- Audit all form fields that accept secret material on every UI framework upgrade.

See [#1798](https://github.com/Koniverse/SubWallet-Extension/issues/1798).

---

## 30. Self-hosted blockchain data APIs require active monitoring against mainnet state

**What happened**: Internally hosted BTC API returned stale/mismatched data for Runes UTXOs, Inscriptions, and transaction fees compared to mainnet, making Bitcoin transactions risky or impossible to construct correctly.

**Why**: The self-hosted BTC API was not continuously validated against mainnet. Divergence crept in without triggering any alert, and users attempted to construct transactions against stale fee and UTXO data.

**How to avoid**:
- Self-hosted blockchain data APIs must have an automated health-check that compares returned data against a public reference (e.g., Blockstream) on a regular schedule.
- Prefer a well-maintained public API (Blockstream for Bitcoin) over a self-hosted proxy unless there is a strong reason otherwise.
- When switching APIs, verify UTXO data, fee estimation, and transaction broadcast on mainnet before releasing.

See [#4997](https://github.com/Koniverse/SubWallet-Extension/issues/4997), [#4991](https://github.com/Koniverse/SubWallet-Extension/issues/4991).

---

## 31. Loading state and error propagation must close on both success and failure paths

**What happened**: PHA token transfer completed on-chain but the extension showed infinite loading because the success callback path did not dismiss the loading state. Staking for a validator with Commission = 100% caused infinite loading because the fee estimation returned an error that was not surfaced to the user.

**Why**: Loading state was dismissed only in the happy-path success callback. Error paths either did not call dismiss or silently swallowed the error and left the UI spinning.

**How to avoid**:
- Always close loading state in **both** success and error callbacks; use a `finally` block pattern.
- Map known on-chain error codes to specific user-readable messages; do not surface generic "please try again" for identifiable errors (insufficient balance, 100% commission validator, etc.).
- Commission = 100% validators must be caught at validation time before submitting the transaction.

See [#154](https://github.com/Koniverse/SubWallet-Extension/issues/154), [#724](https://github.com/Koniverse/SubWallet-Extension/issues/724).

---

## 32. Screen initialisation guards are required for routes accessed via direct links

**What happened**: Earning navigation actions (stake, unstake) resulted in navigation errors when accessed via direct links because the required prerequisite state had not been initialized. Extension crashed with a null reference when a screen assumed a non-null asset reference after a chain-list update removed the asset.

**Why**: Screens built for in-app navigation assumed that all prerequisite state (selected account, active chain, asset metadata) was populated by earlier screens. Direct-link navigation bypasses those earlier screens.

**How to avoid**:
- Transaction and earning screens must implement a permanent initialisation guard that checks for required state and redirects to a safe screen if missing — do not rely on a temporary hotfix.
- Asset references in earning position calculations must include null checks, especially after version upgrades that may alter the chain list.
- Marketing campaign data must be guarded for `undefined` before array operations.

See [#4441](https://github.com/Koniverse/SubWallet-Extension/issues/4441), [#4731](https://github.com/Koniverse/SubWallet-Extension/issues/4731), [#3218](https://github.com/Koniverse/SubWallet-Extension/issues/3218).

---

## 33. Rate-limited external APIs require caching and fallback strategies

**What happened**: TAO earning feature made excessive API requests due to per-position polling without rate limiting or caching, exhausting the TAO API quota. GENS token from Genshiro stopped showing after a balance-fetching refactor broke its network registration without a regression test.

**Why**: High-frequency polling for earning positions without batching or caching quickly exhausts rate limits on external APIs. Refactors of balance-fetching logic silently broke chain-specific registrations.

**How to avoid**:
- High-frequency polling for earning positions must be rate-limited and cached; batch requests where the API supports it.
- Rotate API keys proactively when rate limits are hit; have fallback keys or providers ready.
- Chain-specific token display logic must be regression-tested after balance-fetching refactors.

See [#4623](https://github.com/Koniverse/SubWallet-Extension/issues/4623), [#2540](https://github.com/Koniverse/SubWallet-Extension/issues/2540), [#4006](https://github.com/Koniverse/SubWallet-Extension/issues/4006).

---

## 34. Price/APY calculation formulas must be cross-validated against reference sources

**What happened**: Alpha token price calculation on Bittensor used a formula (`taoIn/alphaIn` from `getDynamicInfo`) that differed from TaoStats methodology, causing user-visible balance/price mismatch. Incorrect APY was displayed for Polkadot and Kusama chains after a staking API update. Wrong price impact on Asset Hub swaps caused displayed received amounts to appear larger than on competing wallets.

**Why**: Price and APY formulas were derived from one data source without validating against independent reference data. Minor formula differences produce large discrepancies at scale.

**How to avoid**:
- Before shipping, cross-validate price and APY calculation results against at least one independent reference source (TaoStats, Subscan, Nova Wallet, MCV).
- Price impact must be used in quote calculations, not only for display warnings.
- After any staking API update, verify APY figures against chain data before the next release.

See [#4987](https://github.com/Koniverse/SubWallet-Extension/issues/4987), [#4026](https://github.com/Koniverse/SubWallet-Extension/issues/4026), [#4241](https://github.com/Koniverse/SubWallet-Extension/issues/4241).

---

_End of LESSONS.md_
