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
| US-42.24.11 | QC — web-runner 1.3.78 | EPIC-42 | P2 | 13 | done | tester · 09-14 | [link](stories/US-42.24.11-qc-web-runner-1-3-78.md) |
| US-42.24.12 | QC — web-runner 1.3.79 | EPIC-42 | P2 | 5 | done | tester · 09-14 | [link](stories/US-42.24.12-qc-web-runner-1-3-79.md) |
| US-42.24.13 | QC — web-runner 1.3.80 | EPIC-42 | P2 | 8 | in-progress | tester · 09-14 | [link](stories/US-42.24.13-qc-web-runner-1-3-80.md) |
| US-42.24 | QC — Update web-runner to 1.3.86 (#2057) — parent | EPIC-42 | P2 | 0 | in-progress | tester ← W37 | [link](stories/US-42.24-qc-web-runner-1-3-86.md) |
| US-42.24.19 | QC — web-runner 1.3.86 full regression | EPIC-42 | P2 | 13 | in-progress | tester ← W37 | [link](stories/US-42.24.19-qc-web-runner-regression.md) |
| US-42.24.20 | QC — verify the bugs found during the update | EPIC-42 | P2 | 8 | in-progress | tester ← W37 | [link](stories/US-42.24.20-qc-web-runner-verify-bugs.md) |
| US-42.25 | QC — sr25519 VRF signing for dApp key derivation (#5072) | EPIC-42 | P2 | 5 | done | tester · 09-17 | [link](stories/US-42.25-qc-issue-5072-sr25519-vrf-signing.md) |

**9 stories · 62 points** — 2 · 10 at open on 09-14, **+6 · 47 the same day** when the tester's
PR #5081 put 1.3.78, 1.3.79 and 1.3.80 on `sprint: sprint-2026-W38` and carried the parent, the
regression story and the verify story across from W37 (commit `d8d84e15a0`). Added the day they
appeared, not at closeout — the first window where the table was told in time. +1 · 5 on 09-17
when US-42.25 was written for #5072 and the tester took it the same day. Rows marked *tester*
were placed by the tester's own commits and are listed, never moved.

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
since the same day. The story is written from the PR's diff, not the issue — #5072 has no body — and
its EPIC-10 placement is marked provisional in the story.

**Reviewed 2026-09-15, fixed 2026-09-16, approval still pending.** saltict's review (a comment, not
a formal approval) found three things — the warning named a stripped domain while the key is bound
to the full origin, so three URLs on one host read as one; the header said *Signature request*; and
the QR / Ledger / injected approve path could complete a VRF request with a 64-byte plain signature.
`67939c4315` fixes all three. Left: the unit test the reviewer asked for on the third, and a formal
approval against the new head. The PR also carries `89e3c05e17`, a passkey-unlock setup modal with
no issue and no story — a US-5.16 follow-up riding in the wrong PR. Split or story; open call.

## The web-runner QC programme — the tester scopes it

Twenty sub-tasks of [US-42.24](stories/US-42.24-qc-web-runner-1-3-86.md). At open: 12 done
(98 pts), 3 in progress on W37 (21 pts), 5 in `backlog` with no sprint (36 pts). **By 09-14 evening:
14 done (116 pts), 4 in progress (29 pts, all on W38), 2 in `backlog` (10 pts): 1.3.84 and 1.3.85.** The tester puts their stories on a window by setting `sprint:` in their own
commits; this file lists what it finds and moves nothing. The six that arrived on 09-14 are in the
table above.

[#2057](https://github.com/Koniverse/SubWallet-Mobile/issues/2057) stood at 40 of 48 at open with
three P1s; by 09-14 evening **47 of 54**, one P1 left (item 9, intermittent infinite loading, open
since 09-03), and a third comment sweeping 1.3.78 and 1.3.80. Record:
[notes/2026-09-04.md](../notes/2026-09-04.md).

## Not in this window — the eight stalled W33 stories

US-4.21, US-4.22, US-4.23, US-5.10, US-10.11, US-12.11, US-13.11, US-20.4 — 32 points. Their six
anchors were last touched between 2025-11 and 2026-05 and have not moved since the 08-25 check. Not
carried, for the reason [W34](sprint-2026-W34.md) gave: carrying a story whose anchor nobody has
touched in months manufactures a claim of intent that nothing supports. Four windows out now. The
planning call is still open and still nobody's.

## Caveat — the board still has not been read

`projectV2` needs `read:project`; the token has `gist, read:org, repo`. This file is built from
`gh issue view`, `gh pr view` and git. No board column is claimed as current.
