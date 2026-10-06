# Manual Test Report — EPIC-42 — 2026-10-06

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-10-06 |
| Tester | MaiThuongNinni |
| Environment | Extension; Mobile — Android + iOS beta |
| Runner | manual (extension + mobile) |
| Build under test | to fill in — Extension: version + chain-list version; Mobile: TestFlight and Google Play beta build numbers |
| Stories tested | US-42.27, US-42.28 |
| Total bugs found | 0 |
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| P3 | 0 |
| Status | in progress |

---

## US-42.27 — Release SubWallet Mobile

Carried on from [2026-10-05](../2026-10-05/report-manual.md), which reached 45 of 82 lines on each beta build with REG-32 skipped.

Six sections close today on each platform: manage account with all twelve of its lines, manage network, manage token, history, general settings and security settings.

Still to run on the beta stage: lock and unlock, backup seed phrase, and REG-85. Then the upgrade rechecks, which need the previous production version installed with its data.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|
| REG-IOS-1 / REG-AND-1 | Create an account with a new seed phrase — unified account; TON account | ✅ Pass | iOS beta + Android beta |
| REG-IOS-2 / REG-AND-2 | Derive an account from the create account screen — unified account; substrate type; ethereum type | ✅ Pass | iOS beta + Android beta |
| REG-IOS-3 / REG-AND-3 | Derive an account from account details | ✅ Pass | iOS beta + Android beta |
| REG-IOS-4 / REG-AND-4 | Import an account — seed phrase; JSON file single; JSON file multi covering normal, QR and watch-only; QR code substrate; QR code EVM; private key | ✅ Pass | iOS beta + Android beta |
| REG-IOS-78 / REG-AND-78 | Import from Trust Wallet | ✅ Pass | iOS beta + Android beta |
| REG-IOS-5 / REG-AND-5 | Attach an account — polkadot vault; keystone; watch-only. Ledger is coming soon and is not checked | ✅ Pass | iOS beta + Android beta |
| REG-IOS-6 / REG-AND-6 | Export an account — unified with seed phrase and JSON; TON with seed phrase, JSON and private key; substrate with JSON and QR; ethereum with JSON, private key and QR; all accounts covering normal, QR signer and watch-only; watch-only offers no export; the exported file imports back | ✅ Pass | iOS beta + Android beta |
| REG-IOS-7 / REG-AND-7 | Proxy account — add a proxy; remove a proxy; view the proxy list; act through a proxy | ✅ Pass | iOS beta + Android beta |
| REG-IOS-8 / REG-AND-8 | Multisig account — create one; open its details; approve and reject a pending transaction; sign for a multisig | ✅ Pass | iOS beta + Android beta |
| REG-IOS-9 / REG-AND-9 | Remove an account | ✅ Pass | iOS beta + Android beta |
| REG-IOS-10 / REG-AND-10 | Edit an account name | ✅ Pass | iOS beta + Android beta |
| REG-IOS-84 / REG-AND-84 | Account details — the account name; its address on each network, with the QR code and the copy button; the account family, unified or solo; and the account type, such as QR-signer or watch-only | ✅ Pass | iOS beta + Android beta |
| REG-IOS-62 / REG-AND-62 | Search network; filter network; turn a network on and off | ✅ Pass | iOS beta + Android beta |
| REG-IOS-63 / REG-AND-63 | Import a custom network; import a provider; switch provider | ✅ Pass | iOS beta + Android beta |
| REG-IOS-64 / REG-AND-64 | Remove a custom network with the network on, and with it off | ✅ Pass | iOS beta + Android beta |
| REG-IOS-65 / REG-AND-65 | Define a network — add a provider; switch provider | ✅ Pass | iOS beta + Android beta |
| REG-IOS-66 / REG-AND-66 | Import a token with the network on and with it off — select network; select token type; type the contract address; scan it by QR | ✅ Pass | iOS beta + Android beta |
| REG-IOS-67 / REG-AND-67 | Remove a custom token with the token on, and with it off | ✅ Pass | iOS beta + Android beta |
| REG-IOS-68 / REG-AND-68 | Search token; filter token; turn a token on and off; token detail | ✅ Pass | iOS beta + Android beta |
| REG-IOS-46 / REG-AND-46 | All accounts mode — select account; search account; scroll the account list | ✅ Pass | iOS beta + Android beta |
| REG-IOS-47 / REG-AND-47 | Separate account mode does not show the account picker | ✅ Pass | iOS beta + Android beta |
| REG-IOS-48 / REG-AND-48 | Search network; scroll the network list; select network; filter | ✅ Pass | iOS beta + Android beta |
| REG-IOS-49 / REG-AND-49 | The explorer link opens from a history record | ✅ Pass | iOS beta + Android beta |
| REG-IOS-50 / REG-AND-50 | Change the currency, and the select currency popup | ✅ Pass | iOS beta + Android beta |
| REG-IOS-51 / REG-AND-51 | Change the language, and search within the language list | ✅ Pass | iOS beta + Android beta |
| REG-IOS-52 / REG-AND-52 | Turn in-app notifications off and on. Wallet theme is coming soon and is not checked | ✅ Pass | iOS beta + Android beta |
| REG-IOS-53 / REG-AND-53 | Change the wallet password — current password; new password; confirm; the I understand checkbox; the learn more link; save | ✅ Pass | iOS beta + Android beta |
| REG-IOS-54 / REG-AND-54 | Require unlock — change the auto-lock time; the wallet auto-locks | ✅ Pass | iOS beta + Android beta |
| REG-IOS-55 / REG-AND-55 | Face ID or Touch ID — turn the toggle off; turn it on by password; turn it on by face or touch scan | ✅ Pass | iOS beta + Android beta |
| REG-IOS-56 / REG-AND-56 | Sign for multiple transactions — turn the toggle on and off | ✅ Pass | iOS beta + Android beta |

75 of 82 lines done on each platform, with REG-32 skipped. AC-1 and AC-3 need the full list, so they are not settled yet.

### Bugs

None.

## US-42.28 — Maintenance of chainlist (ChainList #710)

At 131 of 194 lines. The RPC half and all 61 deactivated chains are done.

Left to run: RPC-X1 and RPC-X3, the 24 new chains, the Bittensor subnets, GEN-1 to GEN-6, and the upgrade runs. GEN-1 to GEN-6 and RPC-X3 all need an upgrade carrying data from before the change.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|

### Bugs

None.

## Summary

Session in progress.
