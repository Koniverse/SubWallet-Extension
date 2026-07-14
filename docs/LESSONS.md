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

## 35. Manifest V3 migration trades RAM for responsiveness — treat higher memory as a known cost

**What happened**: A controlled test (MV2 1.1.35 vs MV3-with-Earning, identical 33-network / all-accounts setup) showed MV3 feels more responsive but uses markedly more RAM: ~78–102 MB idle, rising to 360–600 MB once a popup/view is open, versus ~280–400 MB on MV2. RAM only dropped materially when networks were reduced to Polkadot + Kusama.

**Why**: The MV3 service worker itself costs more than the old persistent background page, and memory is dominated by live chain connections, not by the migration per se. This is a vendor-driven cost of the MV3 model, not a leak to "fix".

**How to avoid**:
- Do not treat MV3 RAM as a regression to chase down; treat chain-connection count as the real lever (see AD-20 lifecycle, which only connects chains a request needs).
- Use middleware to limit unneeded chain connections and a lightweight connection mode for balance-only queries (see AD-07).
- When profiling memory, fix the network/account set first — comparisons are meaningless otherwise.

See internal report "Manifest V3 Performance Test" (Notion); related AD-07, AD-08, AD-20.

## 36. Chrome silently disables the extension after an update that increases permissions — never raise permissions in a routine release

**What happened**: When an extension update adds a sensitive Chrome permission, the Chrome Web Store silently disables the extension and shows the user only a one-time toolbar notification; many users then uninstall. A disabled extension still receives version updates but runs no logic.

**Why**: Chrome's permission-increase flow requires explicit user re-enable. Worse, `uninstall_url` can no longer be updated via manifest (removed in Chrome 69) nor set from a disabled background, and re-marking the permission optional does not clear the warning — so there is no clean in-product recovery once it happens.

**How to avoid**:
- Avoid adding sensitive permissions in routine updates; batch and justify any permission change deliberately.
- If a permission increase is unavoidable, validate the upgrade prompt on a staging extension first and prepare user-recovery messaging out-of-band (the disabled extension cannot message users itself).

See internal report "[Extension] Xử lý sau khi update permission" (Notion).

## 37. WalletConnect dApps hide wallets not registered in the WC dashboard — registration is part of the integration

**What happened**: SubWallet did not appear in some dApps' WalletConnect wallet picker even though the integration worked end-to-end when connected manually.

**Why**: The omission was dApp-side filtering, not a SubWallet bug: dApps pass a `chains` list and only show wallets that are registered (and chain-matched) via the WalletConnect dashboard. This is distinct from the EIP-6963 multi-wallet and missing-RPC-method causes already in §8 / §28.

**How to avoid**:
- Treat WC dashboard registration (supported chains, desktop-wallet entry, dApp whitelisting) as a required deliverable of the integration, not an afterthought.
- When "wallet not listed" is reported, check dashboard/whitelist registration before debugging the connection code.

See [#2407](https://github.com/Koniverse/SubWallet-Extension/issues/2407), [#4598](https://github.com/Koniverse/SubWallet-Extension/issues/4598); internal report "Wallet connect không hiển thị SW" (Notion).

## 38. Native-module / WASM libraries must be validated against the mobile web-runner — gate features per platform

**What happened**: On a web-runner/library upgrade, Cardano broke on mobile. `@emurgo/cardano-serialization-lib-nodejs` and `@emurgo/cardano-message-signing-browser` ship WASM that React Native does not support, and the mobile bridge `@emurgo/csl-mobile-bridge` exposes a different interface incompatible with the shared background.

**Why**: The shared `extension-base` background assumes a browser/Node WASM environment; the mobile web-runner runs under React Native, where WASM and some native modules are unavailable or have divergent interfaces.

**How to avoid**:
- Validate any WASM/native-module dependency against the React Native web-runner before bumping it.
- Be prepared to patch packages (`@subwallet/keyring`, `@subwallet/extension-base`) to a mobile bridge and to gate the affected feature per platform (Cardano account create/import was disabled on mobile until interfaces reconciled).
- Maintain the "special handling when updating web-runner" checklist (see SETUP) as the gate for these bumps.

See internal reports "Xử lý thư viện cho Cardano" and "Các nội dung xử lý đặc biệt khi Update web-runner" (Notion).

## 39. Online-content publish workflows must validate required parameters — a misfire pushes live to all users with no review gate

**What happened**: A `SubWallet-Static-Content` GitHub Action was triggered missing parameters and published unintended changes across online resources (airdrop campaigns archived, buy-token list, crowdloan, chain-assets) — some acceptable, others not.

**Why**: Static content is pulled by the extension at runtime, so a workflow misfire reaches all users immediately with no per-change review. The action did not validate that required parameters were present before running.

**How to avoid**:
- Block online-content actions that are missing required parameters; fail closed, not open.
- When a misfire happens, audit every changed resource type to scope impact before remediating.
- Complements §26 (always bundle a static fallback) and §32 (guard against undefined campaign data).

See [#2322](https://github.com/Koniverse/SubWallet-Extension/issues/2322); internal report "Các thay đổi trên Static Content do trigger nhầm" (Notion).

## 40. A chain-connector migration must run both stacks in parallel and gate the new client per chain

**What happened**: An experiment to migrate the chain connector from polkadot-js `ApiPromise` to Dedot found that the new `DedotClient` (chainHead / JSON-RPC v2) fails or hangs on many RPCs ("No methods found with prefix chainHead"; unresponsive nodes), requiring a hardcoded whitelist of ~90 chains to fall back to `LegacyClient`.

**Why**: Real-world RPC nodes vary widely in JSON-RPC v2 support, and several SubWallet code paths assume polkadot-js behaviour: `DedotClient` vs `LegacyClient` differ on `.entries()` / `pagedEntries()`, Dedot uses BigInt for values, there is no `derive` (crowdloan), and Vara's `GearApi` cannot move yet.

**How to avoid**:
- Keep both connector stacks live during a migration and per-chain-gate the new client (whitelist/fallback), rather than flipping globally.
- Audit numeric handling (BigInt) and removed APIs (`derive`) before switching a code path.
- Drop outdated V12/V13 RPCs rather than special-casing them indefinitely.

See [#4143](https://github.com/Koniverse/SubWallet-Extension/issues/4143); internal report "Dedot Experiment" (Notion).

---

## 41. Paying fees in a non-native token is a separate fee model — estimate via asset-conversion, validate the fee token's ED

**What happened**: A cluster of bugs landed around paying tx fees in a non-native token (Asset Hub / Hydration `feeAssetId`). Transfer-max failed on-chain because the estimated fee (in the chosen fee token) was lower than the actual fee charged; the fee-token picker didn't render on Hydration until the SDK was bumped; and a metadata-cache failure silently dropped tokens from the eligible list.

**Why**: When fees are paid in a non-native asset the fee is computed via an on-chain asset-conversion/multiplier path, not the native weight-to-fee. Max-transfer and fee-estimate logic built around native fees under-estimates the converted fee and ignores the fee token's own existential deposit; the eligible-token list also depends on live metadata/SDK support.

**How to avoid**:
- Treat "fee paid in token X" as a distinct estimation path: derive the fee through the chain's asset-conversion rate and add a safety buffer before allowing transfer-max; never reuse the native-fee estimate.
- Validate the fee token's own ED (and the recipient's native ED) before submission.
- Build the eligible-fee-token list defensively: filter inactive tokens, handle metadata-cache failure so a metadata error doesn't silently drop tokens, and pin the SDK version that exposes the list per chain.

See [#4494](https://github.com/Koniverse/SubWallet-Extension/issues/4494), [#4552](https://github.com/Koniverse/SubWallet-Extension/issues/4552), [#4043](https://github.com/Koniverse/SubWallet-Extension/issues/4043), [#4065](https://github.com/Koniverse/SubWallet-Extension/issues/4065).

---

## 42. EVM custom fee (EIP-1559) must gate on RPC capability and never round the value/wei params

**What happened**: Opening "custom priority fee" threw an error outright; RPCs that don't support custom fees still showed editable fields instead of disabling them; and an EVM `value` from a dApp `eth_sendTransaction` (`1.169847813119247738`) was rounded to `1.1698478131192478`, causing under-transfer and failed bridges.

**Why**: EVM fee handling has two traps: (1) EIP-1559 editing assumes the node exposes fee-history/oracle RPCs, which many don't; (2) large wei amounts passed through a JS `Number` conversion in `EvmRequestHandler` silently truncated precision — the same class as §4 (BigInt) but on the EVM request path, corrupting the on-chain `value`.

**How to avoid**:
- Probe RPC capability (fee-history / custom-fee support) before showing fee editing; when unsupported, disable the control with a tooltip rather than rendering broken fields.
- Keep every EVM `value`/`gas`/`maxFeePerGas`/`maxPriorityFeePerGas` as hex/BigInt end-to-end; never pass them through `Number()`/float math, and enforce the 1-wei minimum tip.
- Add a regression that round-trips a full-precision 18-decimal `value` from dApp request to signed payload.

See [#4461](https://github.com/Koniverse/SubWallet-Extension/issues/4461), [#4559](https://github.com/Koniverse/SubWallet-Extension/issues/4559), [#3632](https://github.com/Koniverse/SubWallet-Extension/issues/3632), [#3293](https://github.com/Koniverse/SubWallet-Extension/issues/3293), [#4065](https://github.com/Koniverse/SubWallet-Extension/issues/4065). Complements §4.

---

## 43. Unified ("master") account migration is a data-model rewrite — version the JSON both ways, recompute suffix/count

**What happened**: Migrating solo accounts to the unified-account model produced defects across releases: the migrate screen showed the wrong account count and dropped the network logo from names; the WebApp could not open after the upgrade; multi-account export broke; duplicate-name suffix logic misbehaved on upgrade and QR import; and JSON exported from the new build could not be imported back into the old (solo-model) build.

**Why**: Unified accounts change the shape of the keyring record (a grouping over per-chain solo accounts) rather than adding a field. Any code assuming one address == one account (count displays, name+suffix derivation, JSON serialization) silently breaks, and the new JSON shape is not round-trip compatible with the old build unless handled explicitly — and the migration runs at upgrade time, so one bad path bricks open-on-upgrade.

**How to avoid**:
- Treat an account-model change as a versioned migration with forward/back JSON compatibility: a file exported by the new build must still import into the old build (or fail with a clear message); recompute tags/derivation/suffix, don't copy.
- Centralize duplicate-name suffix logic and re-run it on every entry path (create, JSON import, QR import, migrate); count displays must read the unified record, not the address count.
- Add an upgrade regression that migrates a multi-account wallet, asserts the count, exports, and re-imports on both the new and previous build.

See [#4893](https://github.com/Koniverse/SubWallet-Extension/issues/4893), [#4068](https://github.com/Koniverse/SubWallet-Extension/issues/4068), [#3592](https://github.com/Koniverse/SubWallet-Extension/issues/3592), [#3581](https://github.com/Koniverse/SubWallet-Extension/issues/3581), [#4620](https://github.com/Koniverse/SubWallet-Extension/issues/4620), [#3643](https://github.com/Koniverse/SubWallet-Extension/issues/3643), [#4031](https://github.com/Koniverse/SubWallet-Extension/issues/4031), [#3570](https://github.com/Koniverse/SubWallet-Extension/issues/3570). Distinct from §25 (count/load), this is format.

---

## 44. Account type and chain ecosystem are coupled at create/import — reset and re-derive on type change

**What happened**: Choosing EVM type but reusing the prior selection produced a Substrate account; entering a Substrate seed while EVM was selected crashed the extension; the network field showed no EVM networks for an EVM account on first import; private keys without a `0x` prefix were rejected as "not a valid mnemonic"; and single-account-type wallets displayed the other chain's tokens.

**Why**: The create/import flow carries account type, seed/key parsing, the network picker, and derivation as loosely-coupled state. When type changes, dependent fields are not re-derived or reset, so stale/mismatched values leak through — and some mismatches hit the keyring parser unguarded and throw instead of validating.

**How to avoid**:
- Make account type the single source of truth: when it changes, reset and re-derive the network list, the seed/private-key parser, and the derivation path.
- Validate seed/private-key input against the selected type before calling the keyring (accept private keys with or without `0x`); return a typed validation error instead of letting the parser throw.
- Filter token visibility by the account types actually present so a single-type wallet never shows the other ecosystem's tokens.

See [#1925](https://github.com/Koniverse/SubWallet-Extension/issues/1925), [#192](https://github.com/Koniverse/SubWallet-Extension/issues/192), [#1933](https://github.com/Koniverse/SubWallet-Extension/issues/1933), [#120](https://github.com/Koniverse/SubWallet-Extension/issues/120), [#75](https://github.com/Koniverse/SubWallet-Extension/issues/75), [#1687](https://github.com/Koniverse/SubWallet-Extension/issues/1687), [#4630](https://github.com/Koniverse/SubWallet-Extension/issues/4630), [#2616](https://github.com/Koniverse/SubWallet-Extension/issues/2616).

---

## 45. JSON keystore decode depends on the @subwallet/keyring ↔ util-crypto version — smoke-test import on every bump

**What happened**: Accounts exported from the latest Polkadot{.js} extension failed to import into SubWallet with a spurious "incorrect password" error that was actually a decode failure; JSON from the migrate build failed to decode on the store build; and an invalid-then-valid file left the screen stuck in the "Invalid Json file" state.

**Why**: JSON keystore encrypt/decrypt is delegated to `@subwallet/keyring` → `@polkadot/util-crypto`. When Polkadot{.js} bumps its crypto routine and SubWallet's pinned keyring lags, decode silently fails and surfaces as "wrong password". The invalid-then-valid case shows decode state was not reset when the selected file changed.

**How to avoid**:
- Pin and bump `@subwallet/keyring` in lockstep with `@polkadot/util-crypto`; after any bump, run an import smoke test against a JSON exported from the current Polkadot{.js} release.
- Distinguish "decode failed" from "wrong password" in the error surface.
- Reset file-validation and password state whenever the selected JSON file changes.

See [#4565](https://github.com/Koniverse/SubWallet-Extension/issues/4565), [#2376](https://github.com/Koniverse/SubWallet-Extension/issues/2376), [#3643](https://github.com/Koniverse/SubWallet-Extension/issues/3643), [#4031](https://github.com/Koniverse/SubWallet-Extension/issues/4031), [#107](https://github.com/Koniverse/SubWallet-Extension/issues/107).

---

## 46. Creating/attaching an account mid-flow (dApp connect, watch-only, post-reset) must thread the requested context

**What happened**: Creating an account from a dApp "Create one" prompt produced the wrong type and stranded the user on the create screen; an account created while the connect popup was open could not be connected; attaching a watch-only account on first WebApp use navigated to the wrong screen instead of master-password setup; and attaching after a reset showed a blank screen.

**Why**: These entry points start from a non-default context (a dApp's requested chain type, a fresh keyring, or a watch-only path that skips seed/password), but the flow falls back to the global default account-type and standard post-create navigation. The requested type and the "first account / master-password-set?" condition are not propagated.

**How to avoid**:
- Pass the dApp's requested account type (and chainId) explicitly into the create flow; the created account and auto-connect must use that requested type.
- Compute post-create/attach navigation from actual keyring state (first account? master password set?), not a fixed route — especially for watch-only and post-reset.
- Regression-test create/attach launched from: live dApp connect popup, empty keyring after reset, and watch-only on first run.

See [#1912](https://github.com/Koniverse/SubWallet-Extension/issues/1912), [#1930](https://github.com/Koniverse/SubWallet-Extension/issues/1930), [#231](https://github.com/Koniverse/SubWallet-Extension/issues/231), [#297](https://github.com/Koniverse/SubWallet-Extension/issues/297), [#1859](https://github.com/Koniverse/SubWallet-Extension/issues/1859), [#3054](https://github.com/Koniverse/SubWallet-Extension/issues/3054). Distinct from §25/§32.

---

## 47. Earning-form default selection (pool/validator/subnet) must derive from the selected account, not carry over

**What happened**: The earning form repeatedly pre-selected the wrong pool/validator: switching from an earning account to a fresh one kept the old pool; default-validator setup broke when `maxCount = 1`; after withdraw-all the form still showed the old pool and blocked re-staking with a phantom "Exist unstaking request"; AHM-migrated chains failed to auto-select the already-staked validator.

**Why**: The default-selection state was seeded once (or keyed on the wrong dependency) and not recomputed when the active account, its existing position, or `maxCount` changed. "No prior position" and "has a prior position" are distinct branches that were not reset on account change.

**How to avoid**:
- Re-derive the default selection as a pure function of (selected account, that account's current position, recommended-validator list, maxCount); never persist across an account switch.
- Branch explicitly: no position → recommended default; has position → that account's pool/validator; cover maxCount=1 and active-stake=0 as their own cases.
- After a successful withdraw-all, clear the residual position so re-staking is not blocked by a stale unstake request.

See [#3972](https://github.com/Koniverse/SubWallet-Extension/issues/3972), [#3971](https://github.com/Koniverse/SubWallet-Extension/issues/3971), [#3840](https://github.com/Koniverse/SubWallet-Extension/issues/3840), [#3001](https://github.com/Koniverse/SubWallet-Extension/issues/3001), [#1323](https://github.com/Koniverse/SubWallet-Extension/issues/1323), [#4754](https://github.com/Koniverse/SubWallet-Extension/issues/4754), [#1346](https://github.com/Koniverse/SubWallet-Extension/issues/1346).

---

## 48. Earning position-read paths must handle per-chain RPC arg shapes and missing asset/identity metadata

**What happened**: Reading positions crashed or returned nothing for structural reasons: some parachains require 2 args for `delegationScheduledRequests` and the single-arg call failed; `EarningPositions` sorting crashed on `item.asset.decimals` when `assetRegistry` had not loaded; Calamari failed on identity-pallet parsing; migrated AHM chains showed blank validator names.

**Why**: Position-read code assumed one canonical query signature and that referenced metadata (asset registry, identity) was always present. Per-chain pallet variants and load-order races violate both assumptions.

**How to avoid**:
- Treat every position-query signature as per-chain (arg count, response shape), the same way extrinsics are mapped in §5.
- Null-guard all metadata lookups in read/sort paths (`asset?.decimals ?? 0`, `price ?? 0`); never let an unloaded registry or unparseable identity crash the list (extends §32).
- Add a per-chain regression fixture that exercises position read with metadata deliberately absent.

See [#4950](https://github.com/Koniverse/SubWallet-Extension/issues/4950), [#4731](https://github.com/Koniverse/SubWallet-Extension/issues/4731), [#1538](https://github.com/Koniverse/SubWallet-Extension/issues/1538), [#884](https://github.com/Koniverse/SubWallet-Extension/issues/884), [#4754](https://github.com/Koniverse/SubWallet-Extension/issues/4754), [#3413](https://github.com/Koniverse/SubWallet-Extension/issues/3413), [#4006](https://github.com/Koniverse/SubWallet-Extension/issues/4006). Extends §5, §32.

---

## 49. Earning state must auto-refresh from chain events — including actions performed in a dApp

**What happened**: After unstake / cancel-unstake / withdraw on direct-nomination parachains the UI didn't update and required a manual reload; unstake balance still showed after a successful withdraw performed in a dApp; positions persisted after withdraw-all; staking details didn't render on first access until the popup was reopened.

**Why**: Earning state was refreshed only on in-app action callbacks, so out-of-band changes (dApp-originated extrinsics, withdraw-all reaching zero) left stale balances. Adjacent to but distinct from §3 — here the trigger is an earning action's on-chain effect, including ones SubWallet didn't originate.

**How to avoid**:
- Drive earning-position refresh off chain subscription/event data, not only the in-app transaction success callback, so external/dApp changes propagate without a manual reload.
- After withdraw-all / zero active stake, remove the position entry rather than leaving a stale balance.
- When a backing network is disconnected, show a "data unavailable" state instead of a stuck value.

See [#2652](https://github.com/Koniverse/SubWallet-Extension/issues/2652), [#2645](https://github.com/Koniverse/SubWallet-Extension/issues/2645), [#2494](https://github.com/Koniverse/SubWallet-Extension/issues/2494), [#699](https://github.com/Koniverse/SubWallet-Extension/issues/699), [#1246](https://github.com/Koniverse/SubWallet-Extension/issues/1246), [#845](https://github.com/Koniverse/SubWallet-Extension/issues/845). Complements §3.

---

## 50. All-accounts mode must aggregate earning status/rewards only over accounts that actually stake

**What happened**: All-accounts aggregation miscomputed: unclaimed-reward totals were wrong; reward-status counted all wallet accounts instead of only staking ones; the summary showed "Earning a part" when a single account was "Waiting"; and extension vs mobile disagreed on status for the same account.

**Why**: The aggregation reduced over the full account list rather than the subset with a position, and the status-rollup merged distinct buckets (Waiting / Earning / Partial) incorrectly. The same flawed reducer diverged between platforms.

**How to avoid**:
- Filter to accounts with a non-empty position before aggregating rewards/status; never divide or label over the full account set.
- Define a single canonical status-rollup function shared by extension and mobile so the two cannot diverge.
- Add an All-accounts fixture mixing staking + non-staking + Waiting accounts and assert the summary.

See [#907](https://github.com/Koniverse/SubWallet-Extension/issues/907), [#1456](https://github.com/Koniverse/SubWallet-Extension/issues/1456), [#2364](https://github.com/Koniverse/SubWallet-Extension/issues/2364), [#2514](https://github.com/Koniverse/SubWallet-Extension/issues/2514), [#3327](https://github.com/Koniverse/SubWallet-Extension/issues/3327).

---

## 51. Token visibility on the balance screen must distinguish fetch-failed from zero, and filter by account key-type

**What happened**: Tokens silently disappeared or wrongly appeared due to visibility logic, not balance math: in All-accounts mode with "Show zero balance" on, a token that failed to return a balance was dropped while Specific-account mode still showed it; an ed25519-imported account still listed Ethereum tokens invalid for that key type.

**Why**: Token-row visibility conflates three independent predicates — token enabled, balance fetched successfully, token valid for the account's key type — and the All-accounts and single-account paths apply them inconsistently. A fetch failure is treated the same as a zero balance, and key-type compatibility isn't part of the filter.

**How to avoid**:
- Distinguish "fetch failed / pending" from "balance is zero" — a pending/errored fetch must not be collapsed into the zero-balance hide rule.
- Filter token visibility by account key-type compatibility (no EVM tokens for ed25519/Substrate-only keys) before rendering.
- Any visibility predicate must give identical results in All-accounts and Specific-account mode; unit-test both against one fixture.

See [#2352](https://github.com/Koniverse/SubWallet-Extension/issues/2352), [#2518](https://github.com/Koniverse/SubWallet-Extension/issues/2518), [#77](https://github.com/Koniverse/SubWallet-Extension/issues/77), [#1143](https://github.com/Koniverse/SubWallet-Extension/issues/1143). Distinct from §3 (cache invalidation).

---

## 52. Fiat valuation must exclude unpriceable assets — testnet, crowdloan and derivative positions are recurring traps

**What happened**: Total fiat balance was systematically wrong because the wrong things got a price: testnet tokens were valued instead of $0; DOT contributed to a crowdloan (later converted to LCDOT and sold) was still counted in total; the Crowdloans screen showed the project token's price instead of the contributed token's.

**Why**: Fiat value joins a token's amount to a price-feed entry, but several categories have no legitimate price in context: testnet tokens (must be $0), crowdloan/derivative balances (priced by the contributed token, removed once exited), and screen-specific token semantics. A blind price join inflates or misstates the total.

**How to avoid**:
- Force testnet token fiat value to $0 explicitly; never let a mainnet price feed bleed onto a testnet slug.
- Price crowdloan/derivative positions by the underlying contributed token and exclude them from totals once closed/converted.
- On crowdloan/staking screens, bind the price to the specific token the user holds for that action.

See [#145](https://github.com/Koniverse/SubWallet-Extension/issues/145), [#206](https://github.com/Koniverse/SubWallet-Extension/issues/206), [#1694](https://github.com/Koniverse/SubWallet-Extension/issues/1694), [#1766](https://github.com/Koniverse/SubWallet-Extension/issues/1766). Distinct from §34 (formula correctness).

---

## 53. The price-history chart is a separate data series from the spot price — re-key on (price-id, currency)

**What happened**: The spot price updated correctly but the price-history chart did not: switching currency (USD→CNY) in popup mode left the chart on stale/wrong-scaled data (flat line → vertical spike); no chart for derivation tokens; wrong chart for USDT/USDC stablecoins.

**Why**: The history chart is fetched from a different endpoint and cached independently, keyed only on the token and not re-fetched on currency change; it also can't resolve a series for tokens whose price identity isn't the slug itself (derivation tokens, pegged stablecoins) — which the spot-price path handles but the history path doesn't.

**How to avoid**:
- Key the chart series on (price-id, currency) and refetch/rescale whenever currency changes — don't assume the spot-price subscription refreshes it.
- Resolve the chart's price-id the same way the spot price does (derivation token → parent; stablecoin → its peg id).
- Test currency switching specifically in popup mode and on token-detail charts.

See [#4586](https://github.com/Koniverse/SubWallet-Extension/issues/4586), [#4332](https://github.com/Koniverse/SubWallet-Extension/issues/4332), [#4344](https://github.com/Koniverse/SubWallet-Extension/issues/4344).

---

## 54. Adding a custom RPC/provider must validate connectivity in a bounded background probe — never block startup

**What happened**: Adding a custom provider left the extension stuck on an infinite loading screen and unopenable (only recovery = reinstall); adding a custom network reported "connected successfully" then "unable to connect" 2s later; on reopen, RPC-lost errors auto-disabled networks.

**Why**: Provider validation at add-time ran on a path that could hang the startup flow, and the provider was persisted before connectivity was confirmed. A user-supplied URL that is slow, wrong-type, or unreachable then poisons every subsequent startup. Distinct from §20 (reconnect debounce) — the failure originates from user-entered config.

**How to avoid**:
- Validate a custom RPC in a cancellable, timeout-bounded background probe before persisting; surface a field-level error, never a full-screen hang. Persist only after a successful handshake and verify the endpoint's chain type/genesis matches.
- A stored custom provider must never be on the critical path of first paint — if it fails at startup, fall back to a default RPC and flag the network disconnected (see §21).

See [#4216](https://github.com/Koniverse/SubWallet-Extension/issues/4216), [#351](https://github.com/Koniverse/SubWallet-Extension/issues/351), [#2236](https://github.com/Koniverse/SubWallet-Extension/issues/2236), [#4123](https://github.com/Koniverse/SubWallet-Extension/issues/4123), [#2884](https://github.com/Koniverse/SubWallet-Extension/issues/2884). Distinct from §20.

---

## 55. Concurrent / multi-tab dApp authorization requests must be de-duplicated into a single connect popup

**What happened**: Connecting to some dApps displayed two connect popups instead of one; opening multiple dApp pages produced stacked connect popups; and a "connection existed" error appeared when no connection had been added, because a duplicate request collided with an in-flight one.

**Why**: Each `requestAuthorize` from a dApp (and each tab) enqueued its own confirmation independently. Pages that emit the connect handshake more than once on load, or multiple tabs racing, generate parallel authorization entries with no coalescing.

**How to avoid**:
- Key pending authorization requests by (origin, dApp-type) and coalesce duplicates into one popup; a second request from the same origin while one is pending attaches to the existing confirmation.
- Make the authorize handler idempotent so a double-fired handshake doesn't create two entries.
- Test against dApps known to double-fire the connect event and the multi-tab case explicitly.

See [#285](https://github.com/Koniverse/SubWallet-Extension/issues/285), [#227](https://github.com/Koniverse/SubWallet-Extension/issues/227), [#2903](https://github.com/Koniverse/SubWallet-Extension/issues/2903), [#2923](https://github.com/Koniverse/SubWallet-Extension/issues/2923).

---

## 56. Connecting a dApp/WalletConnect to an unsupported chain must degrade to a clear screen, not an error page

**What happened**: Pairing WalletConnect against a namespace SubWallet doesn't support (Bitcoin, SUI, etc.) threw a raw error instead of an "Unsupported network" screen; generic dApp connect and several WC pairings surfaced a full error page instead of the confirmation screen.

**Why**: The pairing/connect code assumed every requested chain resolved to a known, enabled network. An unknown CAIP namespace or chainId fell through to an unhandled throw that React rendered as the global error boundary. Narrower than §28 — the defect is the missing graceful-degradation branch for unknown chains.

**How to avoid**:
- Intersect requested chains against supported+enabled networks before building the session; if empty, render a dedicated "Unsupported network" screen (optionally offering add-network), never an error boundary.
- Wrap session approval in try/catch and map known WC failure codes to specific messages.
- Add a regression that pairs against a deliberately unsupported namespace.

See [#4598](https://github.com/Koniverse/SubWallet-Extension/issues/4598), [#4005](https://github.com/Koniverse/SubWallet-Extension/issues/4005), [#4401](https://github.com/Koniverse/SubWallet-Extension/issues/4401), [#1981](https://github.com/Koniverse/SubWallet-Extension/issues/1981), [#2896](https://github.com/Koniverse/SubWallet-Extension/issues/2896). Narrower than §28.

---

## 57. dApp RPC methods beyond connect/sign (e.g. wallet_watchAsset) need explicit handlers — unhandled methods crash the session

**What happened**: Clicking "Add token to wallet" on a dApp did nothing — the add-token screen never opened; an earlier instance threw an error that left SubWallet unusable until restart; on WalletConnect, "some required methods are missing" blocked login and prevented wallet detection.

**Why**: The provider implemented the common path (enable, accounts, sign, send) but treated less-common EIP-1193 / WC methods as unrecognized, silently dropping them or throwing into the global handler. Each needs an explicit handler that routes to the right in-extension flow and returns a spec-compliant response.

**How to avoid**:
- Maintain an explicit allowlist of supported dApp RPC methods with a handler each; `wallet_watchAsset` must deep-link to the import-token confirmation and return the spec boolean.
- Unknown methods should return a structured EIP-1193 "unsupported method" error, never throw uncaught.
- Audit the WC EVM session against the current required-method set on each SDK bump (complements §28).

See [#1242](https://github.com/Koniverse/SubWallet-Extension/issues/1242), [#959](https://github.com/Koniverse/SubWallet-Extension/issues/959), [#2860](https://github.com/Koniverse/SubWallet-Extension/issues/2860).

---

## 58. Browser-engine compatibility is a release gate — Firefox / LibreWolf / old-Chromium each break differently

**What happened**: An error page appeared only when performing XCM on Firefox; LibreWolf showed a blank extension (fix = a WebGL-enable FAQ, not code); after an upgrade, sub-tokens stopped showing only on Firefox; identicons broke for Moonbeam/Moonriver.

**Why**: SubWallet ships one bundle to multiple engines that differ in WebExtension storage semantics, WebGL/canvas availability (identicons), CSP, and upgrade timing. Firefox-only and LibreWolf-only failures are invisible if QA runs on Chrome alone; some are user-environment issues with no code fix.

**How to avoid**:
- Run the release regression matrix on Firefox and at least one hardened fork (LibreWolf/Brave), not Chrome alone; include XCM, post-upgrade token visibility, and identicon rendering.
- Guard WebGL/canvas-dependent rendering with a feature check and a non-WebGL fallback.
- Keep an FAQ entry for environment-only breakage (e.g. WebGL disabled) where no code fix exists.

See [#1505](https://github.com/Koniverse/SubWallet-Extension/issues/1505), [#1561](https://github.com/Koniverse/SubWallet-Extension/issues/1561), [#792](https://github.com/Koniverse/SubWallet-Extension/issues/792), [#58](https://github.com/Koniverse/SubWallet-Extension/issues/58).

---

## 59. Non-XCM (trustless/optimistic) bridges need a separate destination claim step and resilient bridge APIs

**What happened**: Claiming AVAIL on Ethereum Sepolia after bridging failed; a broader Avail set had "unable to claim token after bridge" plus a request to hide the bridge when broken; for the Across bridge, `getLimits`/`getQuote` failed on temporary API downtime with no logging, retry, or de-dup.

**Why**: Unlike XCM (§2/§27), these are two-leg bridges: a source-chain lock and a separate user-initiated claim/mint on the destination chain, mediated by a flaky third-party REST API. The destination claim is a distinct failure surface, and transient API downtime surfaces as a hard error with funds in limbo.

**How to avoid**:
- Model external bridges as explicit multi-leg flows with a recoverable, retryable destination claim step; never assume completion at source-chain submission.
- Wrap bridge-API calls in try/catch + retry + an in-flight-dedup promise, and reduce fetch frequency.
- Provide an instant feature-disable toggle (as with XCM channels in §2) so a broken bridge can be hidden without a release.

See [#4636](https://github.com/Koniverse/SubWallet-Extension/issues/4636), [#4255](https://github.com/Koniverse/SubWallet-Extension/issues/4255), [#4108](https://github.com/Koniverse/SubWallet-Extension/issues/4108), [#4798](https://github.com/Koniverse/SubWallet-Extension/issues/4798).

---

## 60. Per-marketplace NFT adapters break on upstream API drift, pagination and missing contract methods

**What happened**: Quartz/Unique NFTs errored when the old `getAddressTokens` RPC was replaced upstream; RMRK metadata failed to JSON-parse; Singular and Acala NFTs didn't show; ERC-721 collections lacking `tokenOfOwnerByIndex()` couldn't enumerate owned tokens; multi-page collections lost NFTs when switching accounts because pagination wasn't reset.

**Why**: Each NFT source (Unique RPC, RMRK, Singular, Acala, generic ERC-721) has its own adapter with assumptions about API shape, contract methods, and metadata format. When a marketplace ships a new API or a contract omits an optional method, that single adapter throws — and §15 only covers IPFS/gateway concerns, not the adapter layer or pagination.

**How to avoid**:
- Treat every NFT marketplace/standard as a versioned adapter with a regression test against a known holding address; monitor upstream API changes.
- Detect missing ERC-721 enumeration (`tokenOfOwnerByIndex`) and fall back to a manual-token-ID path; reset pagination state on account/collection switch.
- Wrap per-collection fetch/parse in try/catch so one bad collection doesn't blank the whole tab.

See [#178](https://github.com/Koniverse/SubWallet-Extension/issues/178), [#415](https://github.com/Koniverse/SubWallet-Extension/issues/415), [#194](https://github.com/Koniverse/SubWallet-Extension/issues/194), [#2029](https://github.com/Koniverse/SubWallet-Extension/issues/2029), [#726](https://github.com/Koniverse/SubWallet-Extension/issues/726), [#639](https://github.com/Koniverse/SubWallet-Extension/issues/639), [#1300](https://github.com/Koniverse/SubWallet-Extension/issues/1300). Extends §15.

---

## 61. Merged is not enabled, and enabled is not shipped — check the tree and the build env, not just git

**What happened**: Two capabilities were recorded as `✅ shipped` and neither was ever available to a user. The **Bitcoin dApp provider** merged in v1.3.43, but the injection is commented out on the inject path with a "wait until ready" note — no release has ever exposed `connect` / `getAddresses` / `signPsbt` to a dApp. The **NFT-mint campaign** is worse: its commits *are* ancestors of every extension tag from v1.1.36, so `git tag --contains` "proves" it shipped — but the Jan-2024 earning migration deleted the mint render *before* that first containing tag, and the extension build never injects `NFT_MINTING_HOST`, so `MINT_HOST` is `''` and the service can't reach a host. `MintCampaignService` is still instantiated in `State.ts` in every release, with all its UI callers commented out and `packages/webapp/public/images/subwallet/mint-nft-done.gif` orphaned.

**Why**: Commit containment is a *necessary* condition for "shipped", never a sufficient one. A commit rides into a release; a **capability** needs its code present in that release's tree, reachable from a UI entry point, and switched on by the build (env var, feature flag, uncommented injection). Each of those can fail independently, and git tells you nothing about any of them.

**How to avoid**:
- Before calling a capability shipped, check the release's **tree**, not its ancestry: `git ls-tree <release-sha> <path>` for the surface, plus a grep for the entry point (a commented-out `inject(...)`, a `const [, setX]` that discards the result, a `process.env.FOO ||''`).
- Check the **build**: is the env var/flag actually injected in the workflow that builds that target? A secret set only in a preview-deploy workflow means the capability shipped in the preview, not the product.
- When containment and the shipped tree disagree, **the tree wins**.
- Dead code from an ended campaign lingers: if a service is instantiated but its env var is never set and its callers are commented out, it's a cleanup candidate, not a feature.

See [#4929](https://github.com/Koniverse/SubWallet-Extension/issues/4929), [#5007](https://github.com/Koniverse/SubWallet-Extension/issues/5007), PRD FR-98 / FR-157, and [US-21.2](sprints/stories/US-21.2-history-backfill.md).

---

## 62. One repo, two release lineages — the same version number means two different products

**What happened**: While backfilling shipping versions, the Transak off-ramp looked like it "shipped in 1.3.56" — but the extension at 1.3.56 has no off-ramp code at all. The flow shipped in **web-app 1.3.56**, an entirely different release.

**Why**: `master` / `subwallet-dev` build the extension (tagged `vX.Y.Z`, now 1.3.83). `webapp` / `webapp-dev` build the web app — **untagged**, its releases are `[CI Skip] release/stable X.Y.Z` commits on `origin/webapp`, with its own `CHANGELOG.md` on that branch, now at 1.3.56. `origin/master` is not an ancestor of `origin/webapp`; hundreds of commits diverge. The two lineages share a version-number series and nothing else.

**How to avoid**:
- Never state a version without its space. In the docs, stories declare `version_space: webapp` (extension is the default).
- Anchor containment per space: `git merge-base --is-ancestor <sha> v<ver>` for the extension; for the web app, resolve the release commit first — `git log --format='%H %s' origin/webapp --grep='^\[CI Skip\] release/stable <ver>$'` — and test against that.
- A feature can ship in one lineage and be *written but abandoned* in the other: the extension off-ramp port sits unmerged on `koni/dev/issue-3843`, in no tag.

See AGENTS.md §7 "The two version spaces", [US-14.2](sprints/stories/US-14.2-fiat-off-ramp-sell-crypto-for-fiat.md).

---

## 63. Issue numbers in git history collide with inherited upstream polkadot-js PRs — always date-window the grep

**What happened**: Tracing which commit delivered a changelog bullet by its issue number (`git log --all --grep='#911'`) returned commits from 2019 — polkadot-js PRs inherited with the fork, not SubWallet work. Attributing them would have dated features years early and credited the wrong authors.

**Why**: The repo is a fork of `polkadot-js/extension` and carries its full history. Low issue/PR numbers exist in both numbering spaces. Nothing in the commit message distinguishes them.

**How to avoid**:
- Filter every `--grep` by a date window around the release you are tracing (±270 days was enough for every case in the 302-release backfill), and discard anything outside it.
- Sanity-check the author: an upstream-era commit is usually authored by a polkadot-js maintainer, and its email will not resolve through `docs/notes/contributor-map.md`.
- The same trap bites `git tag --contains` on early commits: the six earliest Koni releases have neither a tag nor a release commit, so containment must be proven against the earliest existing tag (`v0.2.5`) instead.

See [US-21.1](sprints/stories/US-21.1-contributor-identity-map.md), [US-21.2](sprints/stories/US-21.2-history-backfill.md).

---

## 64. A doc-stated invariant is a claim, not evidence — check the code before you build a story to "guard" it

**What happened**: [AD-07](ARCHITECTURE.md#architecture-decisions) and NFR-11 stated that balance/token reads ride a *"lightweight WsProvider"* connector and that the full `@polkadot/api` `ApiPromise` is instantiated *"only for extrinsic construction"*, bounding RAM at ~72 MB regardless of chain count. A story ([US-20.3](sprints/stories/US-20.3-read-path-memory-budget.md)) was written to *guard that invariant against regression*, and a dozen other stories and epics repeated the claim in their own Background, ACs and even their **ticked** task lists. An audit found the mechanism **has never existed**: `SubstrateApi`'s constructor builds `new ApiPromise` eagerly for every enabled chain and never tears it down, and the read path awaits it (`substrateApiMap[slug].isReady`) and reads `substrateApi.api.query.balances.locks.multi(…)` off it. Same shape at v0.4.1 (2022), at v1.1.64 — the release AD-07 *claimed it shipped in* — and at v1.3.83. The string `lightweight` has zero hits in `packages/*/src`. AD-07's citation was wrong too: the PR it names merged a chain-list update.

**Why**: a decision was recorded ([CONTEXT D2](CONTEXT.md), 2022) and then the *decision* was cited ever after as if it were the *implementation*. Nothing in the toolchain checks that. Worse, the claim propagated: each new story inherited it from the AD, so the docs became internally consistent and externally false — and consistency is exactly what a reviewer checks.

**How to avoid**:
- Treat an AD / NFR as a **claim with a citation**, not as a fact. Before depending on one, run the grep: does the mechanism exist in the tree, at the tag the AD says it shipped in?
- An AD's "shipped vX.Y.Z" is a testable statement. Test it: `git grep <the mechanism's symbol> vX.Y.Z`.
- Be extra suspicious of a story whose job is to *guard* or *not regress* an invariant. That framing presumes the invariant exists. If nobody can point at the code, the story's real first task is to **measure**, not to guard.
- Numbers age with their platform. The 137/264/72 MB figures were measured on the **MV2 always-on background page**; under MV3 the worker sleeps after 60 s and stops every chain API, so the premise changed and nobody re-measured. A number without a probe in CI is folklore.

**Postscript (2026-07-13)**: the follow-through matters as much as the catch. Once the invariant turned out never to have existed, the right move was **not** to build the refactor that would make the doc true — it was to ask whether anyone still wants the property. Nobody did: the only memory incident in 302 releases is from 2022 (MV2), the perf umbrella has zero commits, and MV3's idle `sleep()` became the de-facto control anyway. **NFR-11 was retired and the guarding story deprecated** ([CONTEXT D96](CONTEXT.md)). A requirement nobody measures and nobody enforces is already deleted in practice — the doc was only pretending otherwise. Retire it out loud, and leave the instruction behind: *if the complaint ever arrives, measure first.*

See [CONTEXT D95](CONTEXT.md) (revision of D2), [US-20.3](sprints/stories/US-20.3-read-path-memory-budget.md), [US-21.2](sprints/stories/US-21.2-history-backfill.md).

---

## 65. A rule phrased as a fact about scope expires; phrase it as a principle

**What happened**: [EPIC-21](sprints/epics/EPIC-21.md)'s charter promised that the epic *"never changes the product scope, the PRD's functional requirements, or any epic's story set."* It was written to prevent a real abuse — smuggling a product decision into a docs cleanup — and that intent was right. But by the end of the epic it had withdrawn two FRs, retired an NFR, renumbered the FR table, deleted three stories and carved out a new one. **The rule was broken on day one, and it could not have been otherwise:** an epic whose job is to check the docs against the code *must* be able to fix the docs it proves wrong.

**The bug was the grammar, not the intent.** The charter stated a **fact about scope** — *"never touches X"* — and a fact about scope expires the moment scope moves. Restated as a **principle** — *"a docs epic changes the map, never the territory; every product decision escalates and lands in CONTEXT as a `D` entry"* — it says the same thing, permits the work that had to happen, and **does not expire** ([CONTEXT D97](CONTEXT.md)).

**The tell that separates the two**: a principle can be **checked**. *"Never touches an FR"* was violated eight times and nothing surfaced it, because nothing could. *"An FR whose status changed with no `D` entry to cite is a violation"* is a grep. The rule that survives is the one with a check attached — the same bar [D96](CONTEXT.md) applied to requirements, now applied to process.

**Why it is worth fixing rather than ignoring** — leaving a false rule in place is not neutral, it picks the worse of two outcomes:

- **Obeyed**: the next maintainer reads it, declines to fix the false doc it forbids them to touch, and **docs rot becomes protected by policy**.
- **Ignored** (what actually happened): the team learns that a rule here need not be true. That is the expensive one — a doc system's whole value rests on *"the rules mean what they say"*. **The first ignored rule is the cheapest one; the tenth is free.**

**The rule for next time**: write a rule as a *boundary of authority* ("may change A, must escalate B"), never as a *prediction about what will get touched*. And note that this class of error is **invisible to tooling** — `validate` does not read prose. A false charter is caught only when a human happens to read it right after it is violated. When that moment arrives, spend the ten minutes.

See [CONTEXT D97](CONTEXT.md), [EPIC-21](sprints/epics/EPIC-21.md), [§64](#64-a-doc-stated-invariant-is-a-claim-not-evidence--check-the-code-before-you-build-a-story-to-guard-it).

---

## 66. The CHANGELOG carries a third lineage — 51 inherited polkadot-js releases, six of them colliding

**What happened**: Bucketing 113 stories into release months, six landed in **2019** — including *"Create a new wallet via seed phrase"* and *"Send native & fungible tokens"*. SubWallet did not exist in 2019.

`docs/CHANGELOG.md` holds **303 releases, and 51 of them predate 2022** — they are the inherited **polkadot-js extension** history this repo was forked from. Six version numbers appear **twice**, in two different products:

| Version | SubWallet (Koni) | polkadot-js (inherited) |
| --- | --- | --- |
| 0.2.1 | 2022-02-10 | 2019-07-12 |
| 0.3.1 | 2022-04-05 | 2019-07-14 |
| 0.4.1 | 2022-05-11 | 2019-07-18 |
| 0.6.1 | 2022-09-13 | 2019-08-03 |
| 0.7.1 | 2022-11-10 | 2019-08-19 |
| 0.8.1 | 2023-02-03 | 2019-08-25 |

A naive `dict()` over the file kept the **last** match — the 2019 one — and silently dated six of the wallet's most fundamental capabilities to a product that was not this one.

**The lesson**: [§62](#62-one-repo-two-release-lineages--the-same-version-number-means-two-different-products) said *two* lineages (extension, web app). **There are three.** The third is not a branch — it is **history the repo inherited**, sitting in the same file, in the same format, indistinguishable by shape. And it is the most dangerous of the three, because the other two at least live on different branches; this one is interleaved in one file, sorted newest-first, waiting for a parser that takes the wrong end.

**The rule**: when resolving `version → date` from `docs/CHANGELOG.md`, **the newest match wins** — the file is newest-first, so the first hit is the Koni one. And treat a duplicate version number as a **signal, not a nuisance**: it means you are reading across a lineage boundary. This is [§63](#63-issue-numbers-in-git-history-collide-with-inherited-upstream-polkadot-js-prs--always-date-window-the-grep) in a second costume — that one was inherited *issue numbers*, this one is inherited *releases*. **Anything a fork inherits, it inherits the numbering of.** Assume every identifier space in this repo has a stowaway until proven otherwise.

**Still open**: the 51 inherited entries are not marked as such in `docs/CHANGELOG.md`. Any future tool that reads the file will hit the same trap. Marking them is cheap and has not been done.

See [CONTEXT D99](CONTEXT.md), [§62](#62-one-repo-two-release-lineages--the-same-version-number-means-two-different-products), [§63](#63-issue-numbers-in-git-history-collide-with-inherited-upstream-polkadot-js-prs--always-date-window-the-grep).

---

_End of LESSONS.md_
