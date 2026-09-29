# Manual Test Report — EPIC-42 — 2026-09-29

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-09-29 |
| Tester | MaiThuongNinni |
| Environment | Mobile — Android + iOS |
| Runner | manual (mobile) |
| Build under test | to fill in — build number + web-runner version |
| Stories tested | US-42.24.19, US-42.24.20 |
| Total bugs found | 0 |
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| P3 | 0 |
| Status | in-progress |

---

## US-42.24.19 — Full wallet regression, round 2

Carried on from [2026-09-28](../2026-09-28/report-manual.md), which left Android 69 of 84 and iOS 69 of 84.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|
| REG-A-1 | Create an account with a new seed phrase — unified account; TON account | ✅ Pass | Android |
| REG-A-2 | Derive an account from the create account screen — unified account; substrate type; ethereum type | ✅ Pass | Android |
| REG-A-3 | Derive an account from account details | ✅ Pass | Android |
| REG-A-4 | Import an account — seed phrase; JSON file single; JSON file multi covering normal, QR and watch-only; QR code substrate; QR code EVM; private key | ✅ Pass | Android |
| REG-A-5 | Attach an account — polkadot vault; keystone; watch-only. Ledger is coming soon and is not checked | ✅ Pass | Android |
| REG-A-6 | Export an account — unified with seed phrase and JSON; TON with seed phrase, JSON and private key; substrate with JSON and QR; ethereum with JSON, private key and QR; all accounts covering normal, QR signer and watch-only; watch-only offers no export; the exported file imports back | ✅ Pass | Android |
| REG-A-7 | Proxy account — add a proxy; remove a proxy; view the proxy list; act through a proxy | ✅ Pass | Android |
| REG-A-8 | Multisig account — create one; open its details; approve and reject a pending transaction; sign for a multisig | ✅ Pass | Android |
| REG-A-9 | Remove an account | ✅ Pass | Android |
| REG-A-10 | Edit an account name | ✅ Pass | Android |

Manage account closes on Android, all twelve lines.

### Bugs

None.

## US-42.24.20 — Verify the bugs found during this update

### Bugs rechecked

| Item | Found in | Severity | What it is | State |
|---|---|---|---|---|
| BUG-42.24.19-25 | US-42.24.19 | P2 | The Account name popup was shown twice when saving the name while importing by seed phrase | ✅ Fixed |
| BUG-42.24.19-23 | US-42.24.19 | P3 | The recipient address field on the Transfer screen was out of line | ✅ Fixed |
| BUG-42.24.19-03 | US-42.24.19 | P2 | The Done button on the Amount screen was out of line (iOS 26.6.1) | ⏭️ Closed no fix — the developer cannot fix it: the layout comes from the iOS version on the device, not from the build |

75 of 82 verified, 6 closed no fix, 1 open — BUG-42.24.19-06 at P1.

## Summary

Manage account closes on Android — the ten remaining lines all pass, covering account creation, derivation, import, attach, export, proxy, multisig, removal and renaming.

Two bugs verified fixed, both logged in round 2 — the duplicated Account name popup on import, and the misaligned recipient address field on Transfer. BUG-42.24.19-03 is closed without a fix: the developer cannot change it, the Done button layout coming from the iOS version on the device rather than from the build.

One bug is left in the whole programme: BUG-42.24.19-06, the app loading forever after being left in the background. It is the last P1 and still holds REG-50, which has never had a verdict.

Android 79 of 84, iOS 69 of 84.
