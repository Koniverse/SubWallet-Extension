# Manual Test Report — 2026-09-03

Not tied to one epic — this covers today's test tasks only.

| Field | Value |
|---|---|
| Date | 2026-09-03 |
| Tester | MaiThuongNinni |
| Environment | Mobile — Android and iOS |
| Runner | manual (mobile) |
| Build under test | to fill in — build number and web-runner version |
| Tasks tested | US-42.24.1 |
| Total bugs found | 0 so far |
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| Status | in progress |

---

## US-42.24.1 — Web-runner 1.3.68 on Mobile

Part of [US-42.24](../../../../sprints/stories/US-42.24-qc-web-runner-1-3-86.md) — updating the web-runner to 1.3.86, split one sub-task per version.

Three items in this session:

- Transak widget URL ([#4835](https://github.com/Koniverse/SubWallet-Extension/issues/4835))
- NFT ERC-721 import on Rari ([#4625](https://github.com/Koniverse/SubWallet-Extension/issues/4625))
- NFT without tokenOfOwnerByIndex ([#4568](https://github.com/Koniverse/SubWallet-Extension/issues/4568))

Locked balance display ([#4708](https://github.com/Koniverse/SubWallet-Extension/issues/4708)) also shipped in 1.3.68 but is tested in [US-42.24.3](../../../../sprints/stories/US-42.24.3-qc-web-runner-1-3-70.md) alongside OpenGov, since its breakdown has a Governance row.

Run on four combinations: Android fresh install, Android upgrade, iOS fresh install, iOS upgrade.

### Result

| Combination | AC passed | Bugs |
|---|---|---|
| Android — fresh install | — / — | — |
| Android — upgrade | — / — | — |
| iOS — fresh install | — / — | — |
| iOS — upgrade | — / — | — |

Fill in as each run finishes.

### Bugs

None logged yet.

Use one block per bug, in this shape:

#### BUG-42.24.1-01 — short title

| Field | Value |
|---|---|
| Severity | P0 / P1 / P2 |
| Platform | Android / iOS / both |
| Install condition | fresh / upgrade / both |
| Related AC | AC-N |
| Status | open |

Steps to reproduce

1.
2.
3.

Actual

Expected

Evidence — screenshot or screen recording

### Notes

Anything worth recording that is not a bug: a check that could not be run, data that was hard to set up, behaviour that looks odd but matches the issue.
