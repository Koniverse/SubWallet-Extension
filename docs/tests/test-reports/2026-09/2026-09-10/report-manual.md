# Manual Test Report — EPIC-42 — 2026-09-10

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-09-10 |
| Tester | MaiThuongNinni |
| Environment | Mobile — Android + iOS |
| Runner | manual (mobile) |
| Build under test | to fill in — build number + web-runner version |
| Stories tested | US-42.24.7 |
| Total bugs found | 5 |
| P0 | 0 |
| P1 | 0 |
| P2 | 4 |
| P3 | 1 |
| Status | in progress |

---

## US-42.24.7 — Web-runner 1.3.74 on Mobile

Part of [US-42.24](../../../../sprints/stories/US-42.24-qc-web-runner-1-3-86.md). Multisig account phase 1 ([#4855](https://github.com/Koniverse/SubWallet-Extension/issues/4855)).

Carried on from [2026-09-09](../2026-09-09/report-manual.md), where AC-1 to AC-10 passed and AC-14 and AC-15 failed. What is left is the rest of the signatory picker, notifications, history, the multisig tab and the upgrade runs.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|

### Bugs

| ID | Title | Steps to reproduce | Actual | Expected | Severity | Status | Screenshot |
|---|---|---|---|---|---|---|---|
| BUG-42.24.7-16 | The toast on a pending multisig transaction is hidden behind the detail sheet | Open History → Multisig tab → tap a pending transaction so the Send token sheet opens → act on it with an account that cannot sign | The toast appears behind the sheet and is cut off partway through: "The account you are using is…" is all that can be read, so the reason the action was refused never reaches the user | The toast sits above the sheet and its whole message is readable | P2 | todo | ![](img/BUG-42.24.7-16.png) |
| BUG-42.24.7-17 | The Multisig tab does not offer to enable a network that is turned off | Turn off the network a pending multisig transaction belongs to → open History → Multisig tab | Nothing is offered. The app does not ask whether to enable the network, so the pending transactions on it simply do not appear and there is no way to tell why | The app asks whether to enable the network, as it does elsewhere when a screen needs a network that is off | P2 | todo | |
| BUG-42.24.7-18 | View transaction does not open the transaction details | Submit a multisig transaction → on the result screen tap View transaction | Nothing opens. The transaction details screen the button points at does not appear | The transaction details open, showing that transaction | P2 | todo | |
| BUG-42.24.7-19 | The message refusing a cross-chain transfer from a multisig does not say why | In All accounts mode → Send → pick a multisig account as From → pick a destination on another chain | The toast says "This feature is not available with this token", which points at the token rather than the account. The Extension says "Cross-chain transfer is not supported for multisig account" | The message names the real reason, as the Extension does | P2 | todo | ![](img/BUG-42.24.7-19.png) |
| BUG-42.24.7-20 | The signatory validation message is shown as a large red block rather than a tooltip | Create multisig account → Add signatory → paste an EVM address | "Signatory address must be a Substrate address" fills a red block between the field and the signatory list, pushing the rest of the form down. The Extension shows the same text as a small tooltip above the field, leaving the layout alone. There is also no clear button on the field, which the Extension has | The message is shown the way the Extension shows it, without moving the rest of the form | P3 | todo | ![](img/BUG-42.24.7-20.png) |

## Summary

Session in progress.
