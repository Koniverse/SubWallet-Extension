# Manual Test Report — 2026-08-10

Not tied to one epic — this covers today's test tasks only.

| Field | Value |
|---|---|
| Date | 2026-08-10 |
| Tester | MaiThuongNinni |
| Environment | dev → production |
| Runner | manual (web app + mobile) |
| Build under test | Koniverse/SubWallet-Extension @ koni-qc-epic42-sync |
| Tasks tested | US-42.13 |
| Total bugs found | 0 |
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| Status | done |

---

## US-42.13 — Gavun's Grid Miner dApp added to SubWallet dApp list ([#5050](https://github.com/Koniverse/SubWallet-Extension/issues/5050))

Tested on Web App + Mobile (iOS/Android), on both **dev** and **production**, including fresh install and upgrade.

### Bugs

None found. All checks passed:

- Gavun's Grid Miner appears in the dApp list on both Web App and Mobile with the correct name, logo, and category (gaming).
- Tapping the entry opens https://gavunminer.xyz/ correctly.
- Connecting SubWallet to the dApp works on both platforms — dApp can read the connected account.
- All of the above hold on a fresh install and on an upgrade.
- All of the above hold again on the production deployment.

---

## Summary

| Task | Bugs found | Status |
|---|---|---|
| US-42.13 | 0 | done |