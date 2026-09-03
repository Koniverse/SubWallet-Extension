# Manual Test Report — 2026-07-20

Not tied to one epic — this covers today's test tasks only.

| Field | Value |
|---|---|
| Date | 2026-07-20 |
| Tester | MaiThuongNinni |
| Environment | PR build |
| Runner | manual (extension) |
| Build under test | Koniverse/SubWallet-Extension @ koni-qc |
| Tasks tested | US-42.4, US-42.5 |
| Total bugs found | 0 |
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| Status | done |

---

## US-42.4 — TUSDT token on Bittensor ([ChainList #699](https://github.com/Koniverse/SubWallet-ChainList/issues/699))

Checked on fresh install and on an upgraded install.

### Bugs

None found. All checks passed:

- TUSDT shows up in the token list on Bittensor with the correct name and logo.
- Balance matches the block explorer.
- Sending TUSDT works, including correct network fee display on the confirm screen.
- Receiving TUSDT works.

## US-42.5 — XCM support for MYTH token between PAH and Hydration ([ChainList #301](https://github.com/Koniverse/SubWallet-ChainList/issues/301))

Regression retest. Checked on fresh install and on an upgraded install.

### Bugs

None found. All checks passed:

- MYTH shows up with the correct name/logo on both Polkadot Asset Hub and Hydration.
- Balance matches the block explorer on both chains.
- XCM transfer works both directions (PAH to Hydration, Hydration to PAH), with correct fee shown on the confirm screen.
- Balance updates correctly on both chains after each transfer.

---

## Summary

| Task | Bugs found | Status |
|---|---|---|
| US-42.4 | 0 | done |
| US-42.5 | 0 | done |
