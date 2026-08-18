# Manual Test Report — 2026-08-18

Not tied to one epic — this covers today's test tasks only.

| Field | Value |
|---|---|
| Date | 2026-08-18 |
| Tester | MaiThuongNinni |
| Environment | PR build |
| Runner | manual (extension) |
| Build under test | Koniverse/SubWallet-Extension @ koni-qc-epic42-sync |
| Tasks tested | US-42.16 |
| Total bugs found | 0 |
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| Status | done |

---

## US-42.16 — Chainlist update: PRDCTR chain ([#708](https://github.com/Koniverse/SubWallet-ChainList/issues/708)) + TUSDT symbol ([#707](https://github.com/Koniverse/SubWallet-ChainList/issues/707))

Checked on fresh install and on an upgraded install.

### Bugs

None found. All checks passed:

- PRDCTR chain shows with the correct name and logo, connects without errors.
- PRD balance matches the block explorer, and the price shows correctly.
- Sending and receiving PRD both work, with the correct fee on the confirm screen.
- The block explorer link opens the correct page on explorer.prdctr.io.
- On Bittensor the token symbol now reads TUSDT (uppercase) on the token list, balance detail, send screen, and history — no leftover tUSDT anywhere.

---

## Summary

| Task | Bugs found | Status |
|---|---|---|
| US-42.16 | 0 | done |
