# Manual Test Report — 2026-08-18

Not tied to one epic — this covers today's test tasks only.

| Field | Value |
|---|---|
| Date | 2026-08-18 |
| Tester | MaiThuongNinni |
| Environment | PR build |
| Runner | manual (extension) |
| Build under test | Koniverse/SubWallet-Extension @ koni-qc-epic42-sync |
| Tasks tested | US-42.16, US-42.17 |
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

## US-42.17 — ParaSpell API integration v2 ([#5051](https://github.com/Koniverse/SubWallet-Extension/issues/5051))

XCM regression pass after the ParaSpell v2 migration. Checked on fresh install and on an upgraded install.

### Bugs

None found. All checks passed:

- XCM transfers work on all three route types: relay to parachain, parachain to relay, and parachain to parachain.
- Network fee shows correctly on the confirm screen for every route tested.
- Balances update correctly on both source and destination chains after each transfer.
- Transfer history records the XCM transfers correctly.
- Error cases (not enough balance, amount below minimum, unsupported route) show a clear message with no stuck screen.
- XCM deposit into an earning position still works.

---

## Summary

| Task | Bugs found | Status |
|---|---|---|
| US-42.16 | 0 | done |
| US-42.17 | 0 | done |
