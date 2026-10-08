# Manual Test Report — EPIC-42 — 2026-10-08

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-10-08 |
| Tester | MaiThuongNinni |
| Environment | Extension; Mobile — Android + iOS beta |
| Runner | manual (extension + mobile) |
| Build under test | to fill in — Extension: version + chain-list version; Mobile: TestFlight and Google Play beta build numbers |
| Stories tested | US-42.27, US-42.29 |
| Total bugs found | 0 |
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| P3 | 0 |
| Status | in progress |

---

## US-42.27 — Release SubWallet Mobile

At 81 of 82 lines on each beta build, with REG-32 skipped. AC-1 and AC-3 are settled.

Today's run is on the Android beta build and covers the account management functions below. It is recorded here only — the story's checklist is unchanged.

### AC results

| Function | Result | Notes |
|---|---|---|
| Create a new account with a seed phrase | ✅ Pass | Android beta |
| Derive from an existing account | ✅ Pass | Android beta |
| Create a multisig account | ✅ Pass | Android beta |
| Import an account from a seed phrase | ✅ Pass | Android beta |
| Import from a JSON file | ✅ Pass | Android beta |
| Import from a private key | ✅ Pass | Android beta |
| Import from Trust Wallet | ✅ Pass | Android beta |
| Attach — connect a Ledger device | ⏭️ Coming soon | Android beta — the feature is not built yet, so there is nothing to test |
| Attach a Polkadot Vault account | ✅ Pass | Android beta |
| Attach a Keystone device | ✅ Pass | Android beta |
| Attach a watch-only account | ✅ Pass | Android beta |
| Export an account | ✅ Pass | Android beta |

Eleven functions pass and one is coming soon.

Left to run: the upgrade recheck on each build — UPG-IOS-1 to 3 and UPG-AND-1 to 3, which settle AC-2 and AC-4 — then the two production stages. The upgrade rechecks need the previous production version installed with its data first.

### Bugs

None.

## US-42.29 — Improve multisig notification (#5093)

Started today, against PR #5095. The first two lines cover the symptom the issue opens with: a notification that appeared and then disappeared on its own, sometimes coming back later as a new unread one with a new timestamp.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|
| AC-1 | A pending multisig transaction raises a notification, and it is still there after a minute of the app sitting idle | ✅ Pass | Extension |
| AC-2 | The notification does not disappear and reappear with a new timestamp while the transaction stays pending | ✅ Pass | Extension |

2 of 22. What is left needs the conditions provoked on purpose — a failing RPC for AC-7 to AC-9, and a transaction driven through approve, execute and cancel for AC-10 to AC-17.

### Bugs

None.

## Summary

Session in progress.
