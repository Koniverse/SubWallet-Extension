---
id: sprint-2026-W38
status: in-progress
start: 2026-09-14
end: 2026-09-20
goal: "Two dev stories, both with an open PR and neither moving on its own. US-12.23 enters a fourth window with PR #5065 unchanged since 2026-08-27 — the decision is merge or drop, and this window should make it. US-10.21 is the first window that scopes it, though it has been in progress with PR #5076 open since 2026-09-09. The tester's web-runner QC programme is scoped by the tester and appears here only if they put it here. Opened 2026-09-14 from tracker, PR and git evidence."
---

## Sprint scope

| US | Title | Epic | Pri | Points | Status | Carry | Story file |
| --- | --- | --- | --- | --- | --- | --- | --- |
| US-12.23 | Manual claim for Bittensor native staking | EPIC-12 | P2 | 5 | review | ← W37 (4th) | [link](stories/US-12.23-bittensor-manual-claim-native-staking.md) |
| US-10.21 | sr25519 VRF signing for dApp key derivation | EPIC-10 | P3 | 5 | in-progress | new | [link](stories/US-10.21-sr25519-vrf-signing-dapp-key-derivation.md) |

**2 stories · 10 points** at open. **Re-read every story's `sprint:` field at each sync** — the
tester sets it on their own stories and two windows in a row learned of 95 and 50 points only at
closeout.

## US-12.23 — a fourth window

| | |
| --- | --- |
| PR | [#5065](https://github.com/Koniverse/SubWallet-Extension/pull/5065) — open, approved, head `2026-08-27` |
| Issue | #5064 — closed by hand 2026-08-24 |
| QC | 16/16 on 2026-08-27, against a branch nobody builds; **18 days old** at open |
| Release | dropped from 1.3.89; in no branch that ships |

Carried from W35 → W36 → W37 → here with the same four facts each time. **This is the window to
decide**, and the decision is binary: merge #5065 into `subwallet-dev` and let it ride the next
release, or close it and set the story `backlog`. A fifth carry would be the docs pretending a
choice is pending when the choice is being made by not making it.

## US-10.21 — first window it is scoped, second window it has been live

`in-progress` since 2026-09-09, when #5072 moved on the board;
[PR #5076](https://github.com/Koniverse/SubWallet-Extension/pull/5076) (`koni/dev/issue-5072`) open
with review required since the same day. The story is written from the PR's diff, not the issue —
#5072 has no body — and its EPIC-10 placement is marked provisional in the story. **What this window
needs from it is a review**, not more code: the PR has had none in five days.

## The web-runner QC programme — the tester scopes it

Twenty sub-tasks of [US-42.24](stories/US-42.24-qc-web-runner-1-3-86.md). At open: **12 done
(98 pts), 3 in progress on W37 (21 pts), 5 in `backlog` with no sprint (36 pts)** — 1.3.78, 1.3.79,
1.3.80, 1.3.84, 1.3.85. The tester puts their stories on a window by setting `sprint:` in their own
commits; this file lists what it finds and moves nothing. If those rows appear here mid-week, add
them to the table then, not at closeout.

[#2057](https://github.com/Koniverse/SubWallet-Mobile/issues/2057) stands at **40 of 48** at open.
Three P1s: item 9 (intermittent infinite loading, open since 09-03), item 40 (signing list never
loads on a dApp request via multisig), item 48 (subnet token transfer impossible — no validator
fields). Record: [notes/2026-09-04.md](../notes/2026-09-04.md).

## Not in this window — the eight stalled W33 stories

US-4.21, US-4.22, US-4.23, US-5.10, US-10.11, US-12.11, US-13.11, US-20.4 — 32 points. Their six
anchors were last touched between 2025-11 and 2026-05 and have not moved since the 08-25 check. Not
carried, for the reason [W34](sprint-2026-W34.md) gave: carrying a story whose anchor nobody has
touched in months manufactures a claim of intent that nothing supports. Four windows out now. The
planning call is still open and still nobody's.

## Caveat — the board still has not been read

`projectV2` needs `read:project`; the token has `gist, read:org, repo`. This file is built from
`gh issue view`, `gh pr view` and git. No board column is claimed as current.
