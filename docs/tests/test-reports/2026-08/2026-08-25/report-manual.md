# Manual Test Report — 2026-08-25

Not tied to one epic — this covers today's test tasks only.

| Field | Value |
|---|---|
| Date | 2026-08-25 |
| Tester | MaiThuongNinni |
| Environment | PR build |
| Runner | manual (extension) |
| Build under test | PR [#5061](https://github.com/Koniverse/SubWallet-Extension/pull/5061) commit `cab8ebd5ee` (US-42.20); PR [#5063](https://github.com/Koniverse/SubWallet-Extension/pull/5063) + merged chainlist (US-42.22) |
| Tasks tested | US-42.20, US-42.22 |
| Total bugs found | 0 |
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| Status | done |

---

## US-42.20 — Biometric / passkey login ([#5058](https://github.com/Koniverse/SubWallet-Extension/issues/5058))

Checked on fresh install and on an upgrade from v1.3.88. **14 / 14 AC pass.**

### Bugs

None found. All checks passed:

- The passkey option shows in Settings → Security, is off by default, and enrolling it asks for the master password first.
- The setting survives closing and reopening the extension, and turning it off puts the wallet back to master-password-only.
- Passkey unlock works from the login screen and from the unlock modal shown before a transaction.
- Cancelling or failing the passkey prompt returns to the password screen with a clear message — no stuck screen.
- Auto-lock still triggers on time, and the passkey unlocks the wallet again afterwards.
- **The master password still unlocks the wallet in every case tested**: with the passkey enrolled, on a browser without WebAuthn PRF support, and after the passkey was removed from the device. No path locks a user out.
- On a browser without PRF support the passkey option fails cleanly with a readable message and the password path is unaffected.
- dApp connection and signing work with the passkey unlock in the flow, and the signature is produced over exactly what the confirm screen displayed.
- Fresh install and upgrade from v1.3.88 both behave the same — accounts, settings and the existing master password all carried over, nothing lost.

### Note on the build

This ran against an **unmerged** commit on an open PR with 0 reviews. If more commits land before #5061 merges, the passkey paths need a re-run against the merged head. The v1.3.89 release gate ([US-42.21](../../../../sprints/stories/US-42.21-qc-release-extension-v1-3-89.md)) re-verifies this content on the real release build rather than inheriting this result.

---

## US-42.22 — Repoint KAH↔PAH USDt XCM refs ([#5062](https://github.com/Koniverse/SubWallet-Extension/issues/5062)) — **P0**

Checked on fresh install and on an upgrade from v1.3.88. **15 / 15 AC pass.**

### Which halves of the fix are in the build

This was the question the story was written to force, and both halves are present:

| Half | Where | State |
|---|---|---|
| Data — bridged asset, missing multilocation, both `AssetRef` directions repointed, logo | [ChainList PR #709](https://github.com/Koniverse/SubWallet-ChainList/pull/709) | **merged 2026-08-24** |
| Guard — `isXcmCurrencySupported()` | [PR #5063](https://github.com/Koniverse/SubWallet-Extension/pull/5063) | open, approved |

So #5062 is genuinely fixed rather than merely blocked in the client.

### Bugs

None found. All checks passed:

- Sending the KAH-native USDt from Kusama Asset Hub to Polkadot Asset Hub is no longer possible — the route is not offered, and the guard refuses it if reached.
- The bridged USDt (`USDt-Polkadot`) transfers correctly in both directions, KAH → PAH and PAH → KAH, and the funds arrive with balances updating on both sides.
- The bridged asset shows the right symbol, 6 decimals, its logo and a price; the KAH-native USDt now offers no XCM route at all.
- USDC on the same KAH↔PAH route is unaffected — it was already modelled correctly.
- Same-consensus XCM is untouched: relay → parachain, parachain → relay and parachain → parachain all work with correct fees.
- Other genuinely supported cross-consensus routes still work — the guard blocks one token, not the bridge.
- Both entry points refuse the bad route: the Send screen blocks it up front, and the swap and earning/XCM-deposit flows also refuse it with a readable message instead of a raw error.
- With ParaSpell unreachable, valid XCM transfers still work — the guard fails open by design.
- A blocked route stays blocked on repeated attempts in the same session (the 30-minute cache does not let it through).
- The new error message reads correctly in all 5 languages (en, ja, ru, vi, zh).

### Note on the build

PR #5063 is still open and unmerged, so the guard half of this result is a claim about that build. The chainlist half **is** merged and live, so the data side of the fix is in production regardless of when #5063 lands.

---

## Not covered here

The extension window flickering on open (v1.3.88, macOS 26.4.1) was tested by someone else and is not part of this report.
