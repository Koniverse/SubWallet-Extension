# Manual Test Report — 2026-08-25

Not tied to one epic — this covers today's test tasks only.

| Field | Value |
|---|---|
| Date | 2026-08-25 |
| Tester | MaiThuongNinni |
| Environment | PR build |
| Runner | manual (extension) |
| Build under test | PR [#5061](https://github.com/Koniverse/SubWallet-Extension/pull/5061), commit `cab8ebd5ee` |
| Tasks tested | US-42.20 |
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

This ran against an **unmerged** commit on an open PR with 0 reviews. If more commits land before #5061 merges, the passkey paths need a re-run against the merged head. The v1.3.89 release gate ([US-42.21](../../../sprints/stories/US-42.21-qc-release-extension-v1-3-89.md)) re-verifies this content on the real release build rather than inheriting this result.

---

## Not covered here

The extension window flickering on open (v1.3.88, macOS 26.4.1) was tested by someone else and is not part of this report.
