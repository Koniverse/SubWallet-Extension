---
id: sprint-2026-W39
status: in-progress
start: 2026-09-21
end: 2026-09-27
goal: "A window with no dev work in it. Nothing has been filed on the Extension repo since #5072 on 2026-09-05, no PR is open, and every dev story is shipped — so what is live is the tester's QC programme, which scopes itself. The one thing that needs a decision is BUG-42.24.24-01: the Bittensor claim capability shipped in v1.3.90 returns zero on Mobile, blocking US-42.24.24. Opened 2026-09-24, mid-window, from tracker, PR and git evidence."
---

## Sprint scope

| US | Title | Epic | Pri | Points | Status | Carry | Story file |
| --- | --- | --- | --- | --- | --- | --- | --- |
| — | *no dev story* | — | — | 0 | — | — | — |

**0 points of dev work, and that is the finding, not an omission.** No issue has been opened on
SubWallet-Extension since [#5072](https://github.com/Koniverse/SubWallet-Extension/issues/5072) on
**2026-09-05**; no pull request is open with activity since 09-10; all three W38 dev stories shipped
in v1.3.90. There is nothing to carry and nothing new to scope. **Opened 2026-09-24 — day four of
seven** — because nothing was synced between 09-18 and 09-24.

## The web-runner QC programme — the tester scopes it

Five rows are still `sprint: sprint-2026-W38` and unfinished. They are listed here because a reader
of this window needs to know they are live, **not** because this file moved them:

| US | Title | Points | Status |
| --- | --- | --- | --- |
| [US-42.24](stories/US-42.24-qc-web-runner-1-3-90.md) | parent (#2057) | 0 | in-progress |
| [US-42.24.19](stories/US-42.24.19-qc-web-runner-regression.md) | 1.3.86 full regression | 20 | in-progress |
| [US-42.24.20](stories/US-42.24.20-qc-web-runner-verify-bugs.md) | verify the bugs found | 8 | in-progress |
| [US-42.24.22](stories/US-42.24.22-qc-web-runner-1-3-88.md) | 1.3.88 | 13 | in-progress |
| [US-42.24.24](stories/US-42.24.24-qc-web-runner-1-3-90.md) | 1.3.90 | 13 | **blocked** |

If the tester sets `sprint: sprint-2026-W39` on any of them, add the row here **that day** — W36,
W37 and W38 each learned of tester rows only at closeout, W38 by 4 stories and 34 points.

## The one thing that needs a decision — `BUG-42.24.24-01`

Unclaimed rewards read **0 TAO on Mobile** for every Bittensor native staking position. Two accounts
were checked on 2026-09-18: one holding **133,160.31 TAO**, one holding **1.02 TAO**, both showing
zero. The **same two accounts on the Extension the same day** read **497.71 TAO** and
**0.0068 TAO**. Logged P2, `todo`; it is **item 68** on
[#2057](https://github.com/Koniverse/SubWallet-Mobile/issues/2057), unticked.

**This is the capability [US-12.23](stories/US-12.23-bittensor-manual-claim-native-staking.md)
shipped in v1.3.90**, working on one surface and returning nothing on the other. The Extension side
was QC'd twice — US-42.23 on the PR, US-42.26 AC-1b/3b/5b/7b/12 across every release stage — so the
handler is not in question; what differs is how Mobile reads it. Two candidates, neither checked:
the runtime call (`betaBasketRuntimeApi.getRootBasketOwed`) failing silently behind the web-runner
bridge, or the `I96F32` fixed-point decode that
[US-12.23 AC-3](stories/US-12.23-bittensor-manual-claim-native-staking.md) already flagged as the
place this breaks by producing *a plausible wrong number* — and **zero is a plausible wrong number**.
`AC-4`'s fallback returns `0` when the threshold cannot be read, which would filter every position
out. **Neither has a test**, which is what US-12.23 shipped without.

It blocks US-42.24.24 AC-12 to AC-18 outright — with the figure at zero there is nothing to claim.
Open call: whose bug, and does it want an Extension-side fix or a Mobile one.

## Not in this window — the eight stalled W33 stories

US-4.21, US-4.22, US-4.23, US-5.10, US-10.11, US-12.11, US-13.11, US-20.4 — 32 points, five windows
out. Unchanged and still nobody's call. Same for the 12 W31 stories that remain `ready` /
`in-progress` / `review` in a closed window.

## Caveat — the board still has not been read

`projectV2` needs `read:project`; the token has `gist, read:org, repo`. Built from `gh issue view`,
`gh pr view` and git. No board column is claimed as current.
