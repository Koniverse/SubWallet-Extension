# Manual Test Report — EPIC-42 — 2026-11-03

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-11-03 |
| Tester | MaiThuongNinni |
| Environment | Web App — https://7ae7468d.subwallet-webapp.pages.dev/ |
| Runner | manual (web app) |
| Build under test | PR #5011, Extension code up to v1.3.86 |
| Stories tested | US-42.32 — in progress |
| Total bugs found | 1 |
| P0 | 0 |
| P1 | 1 |
| P2 | 0 |
| P3 | 0 |
| Status | in progress |

---

## US-42.32 — Web App after PR #5011

Started today on the Web App build at `https://7ae7468d.subwallet-webapp.pages.dev/`. Three features checked: the turn-off-all-networks switch (AC-1), 11 of 12 with one substrate-only failure, the locked balance display (AC-11), which passes in full, and the crowdloan removal (AC-8), which also passes in full.

### AC results

Turn off all networks (AC-1)

| AC | Description | Result | Notes |
|---|---|---|---|
| AC-1-01 | Manage networks shows a Turn off all networks switch at the top | ✅ Pass | |
| AC-1-02 | With at least one network on, the switch reads off and can be pressed | ✅ Pass | |
| AC-1-03 | With every network off, the switch reads on and is greyed out | ✅ Pass | |
| AC-1-04 | Pressing it opens a confirmation, not an immediate action | ✅ Pass | |
| AC-1-05 | The confirmation wording and the explanation | ✅ Pass | |
| AC-1-06 | Turn off button and a way to cancel; cancelling changes nothing | ✅ Pass | |
| AC-1-07 | Confirming turns off every network | ✅ Pass | substrate and EVM both go off |
| AC-1-08 | With every network off, the screens show an empty state, not an error | ✅ Pass | |
| AC-1-09 | Enabling any one network flips the switch back to off and makes it pressable | ❌ Fail | passes on EVM; substrate stays loading — BUG-42.32-01 |
| AC-1-10 | A failed call says so and leaves the networks as they were | ✅ Pass | |
| AC-1-11 | The switch shows a loading state and cannot be pressed twice | ✅ Pass | |
| AC-1-12 | The state survives a page reload | ✅ Pass | |

11 of 12 pass. Only AC-1-09 fails, and only for substrate — EVM networks re-enable normally.

Turning off is not the problem. Every network, substrate and EVM, goes off correctly, and the switch, the confirmation, the empty states and the reload all behave. The failure is only on the way back up, and only for substrate.

Locked balance (AC-11)

| AC | Description | Result | Notes |
|---|---|---|---|
| AC-11-01 | Token detail opens a Locked details view for a token with locked balance | ✅ Pass | |
| AC-11-02 | The view breaks the locked amount into Governance, Democracy, Reserved and Others, and the parts add up | ✅ Pass | |
| AC-11-03 | Others has a tooltip covering multisig, proxy, identity and the rest | ✅ Pass | |
| AC-11-04 | A token with no locked balance does not offer the view, or shows it empty rather than broken | ✅ Pass | |
| AC-11-05 | The modal is titled Token details for a token and Account details for an account | ✅ Pass | |
| AC-11-06 | Earning position detail shows Total stake, Active stake and Unstaked, and the three agree | ✅ Pass | |
| AC-11-07 | Earning position detail shows Your validators and the nomination info | ✅ Pass | |
| AC-11-08 | The numbers match the chain, checked against an explorer | ✅ Pass | |

All 8 pass. The figures agree with each other inside the app and with the chain — the locked breakdown and the stake figures were both checked against an explorer.

Crowdloan removed (AC-8)

| AC | Description | Result | Notes |
|---|---|---|---|
| AC-8-01 | There is no Crowdloans entry in the side menu | ✅ Pass | |
| AC-8-02 | There is no Crowdloans tab or entry point anywhere in the app | ✅ Pass | |
| AC-8-03 | Opening the old crowdloan URL by hand does not reach a crowdloan screen | ✅ Pass | |
| AC-8-04 | Nothing elsewhere links to it, and no screen breaks where it used to be | ✅ Pass | |

All 4 pass. Crowdloan is gone from the menu and from every other entry point, the old URL no longer lands on a crowdloan screen, and nothing is left broken where it used to sit.

### Bugs

| ID | Title | Steps to reproduce | Actual | Expected | Severity | Status | Screenshot |
|---|---|---|---|---|---|---|---|
| BUG-42.32-01 | Substrate networks stay on a spinning toggle when turned back on after Turn off all networks | Settings → Manage networks → press Turn off all networks and confirm → every network goes off → turn Ethereum back on → then turn Polkadot, Kusama, Moonbeam, Aleph Zero, Astar, Polkadot Asset Hub and Acala back on | - EVM networks turn on right away<br>- Every substrate network sticks on a spinning toggle and never finishes, with an Error toast at the top of the screen<br>- Switching that network to a different valid RPC does turn it on | Each substrate network turns back on the same as an EVM one — the toggle settles and the chain connects, without having to change the RPC | P1 | todo | ![](img/BUG-42.32-01.png) |

Changing the RPC is the key detail. Enabling the chain is not broken — the chain comes up as soon as it is pointed at a different valid endpoint. What does not work is re-enabling on the endpoint already selected, which is the one *Turn off all networks* just disconnected from. So the fault is in the reconnect to an endpoint that was torn down, not in the enable path and not in the switch.

That also explains why only substrate is affected: EVM chains talk over plain HTTP requests with nothing to tear down, while substrate holds an open WebSocket that *turn off all* closes. The provider instance appears not to be rebuilt on a re-enable, so the chain waits forever on a socket that is gone, while choosing another RPC forces a fresh one.

A workaround exists for users who hit this — switch the RPC — but it is not discoverable, and the Error toast gives no hint. Keeping P1.

Worth putting in the issue when one is filed: the console output on a failing enable, and whether a page reload also brings the chains back.

## Summary

Session open. Web App only today — US-42.32, the first run on the build from PR #5011.

BUG-42.32-01 found on the first feature checked. After *Turn off all networks*, substrate networks stay on a spinning toggle when turned back on, while EVM networks enable normally. Pointing the chain at a different valid RPC does enable it, so the fault is the reconnect to the endpoint that was just torn down, not the enable itself. P1, failing AC-1-09.

AC-1 stands at 11 of 12 pass — only AC-1-09 fails, and only for substrate. The locked balance display passes in full, 8 of 8, including the cross-check against an explorer, and the crowdloan removal passes in full, 4 of 4. The other seven features have not been touched yet.
