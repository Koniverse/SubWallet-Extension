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
| US-42.24.13 | QC — web-runner 1.3.80 | EPIC-42 | P2 | 8 | done | tester · 09-14 | [link](stories/US-42.24.13-qc-web-runner-1-3-80.md) |
| US-42.24.16 | QC — web-runner 1.3.84 | EPIC-42 | P2 | 8 | done | tester · 09-16 | [link](stories/US-42.24.16-qc-web-runner-1-3-84.md) |
| US-42.24.17 | QC — web-runner 1.3.85 | EPIC-42 | P2 | 8 | closed | tester · 09-16 — **not run**, 0 of 11 AC testable on Mobile | [link](stories/US-42.24.17-qc-web-runner-1-3-85.md) |
| US-42.24 | QC — Update web-runner to 1.3.86 (#2057) — parent | EPIC-42 | P2 | 0 | in-progress | tester ← W37 | [link](stories/US-42.24-qc-web-runner-1-3-86.md) |
| US-42.24.19 | QC — web-runner 1.3.86 full regression | EPIC-42 | P2 | **20** | in-progress | tester ← W37 · re-pointed 13 → 20 on 09-16 | [link](stories/US-42.24.19-qc-web-runner-regression.md) |
| US-42.24.20 | QC — verify the bugs found during the update | EPIC-42 | P2 | 8 | in-progress | tester ← W37 | [link](stories/US-42.24.20-qc-web-runner-verify-bugs.md) |

**10 stories · 80 points** — 2 · 10 at open on 09-14; **+6 · 47** the same day (PR #5081: 1.3.78,
1.3.79, 1.3.80, plus parent / regression / verify carried from W37 by `d8d84e15a0`); **+2 · 16 and
+7 on 09-16** (PR #5083: 1.3.84 done, 1.3.85 closed unrun, regression re-pointed 13 → 20). Each
batch added the day it landed. Rows marked *tester* were placed by the tester's own commits and are
listed, never moved. **Every one of the twenty US-42.24 sub-tasks is now on a window.**

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
(98 pts), 3 in progress on W37 (21 pts), 5 in `backlog` (36 pts). By 09-14 evening: 14 done, 4 in
progress, 2 in `backlog`. **By 09-16: 16 done (132 pts), 1 closed unrun (8), 3 in progress (28) —
nothing left in `backlog`.** The tester puts their stories on a window by setting `sprint:` in their
own commits; this file lists what it finds and moves nothing.

**The retest landed on 09-16** (PR #5083, the 2026-09-16 report):
[US-42.24.20](stories/US-42.24.20-qc-web-runner-verify-bugs.md) now reads **54 fixed · 2 no-fix ·
15 not fixed yet** across 71 rows. Eleven of the fifteen are items the developer had already ticked
on #2057 — one of them a P1 crash — and two are bugs on no checkbox at all. The delta is tabled in
[notes/2026-09-04.md](../notes/2026-09-04.md).

[#2057](https://github.com/Koniverse/SubWallet-Mobile/issues/2057) stood at 40 of 48 at open with
three P1s; **58 of 62 by 09-17**, open 6 / 9 / 35 / 42, with 35 verified fixed on the tester's side
and 9 the only P1 never ticked. Record: [notes/2026-09-04.md](../notes/2026-09-04.md).

## Not in this window — the eight stalled W33 stories

US-4.21, US-4.22, US-4.23, US-5.10, US-10.11, US-12.11, US-13.11, US-20.4 — 32 points. Their six
anchors were last touched between 2025-11 and 2026-05 and have not moved since the 08-25 check. Not
carried, for the reason [W34](sprint-2026-W34.md) gave: carrying a story whose anchor nobody has
touched in months manufactures a claim of intent that nothing supports. Four windows out now. The
planning call is still open and still nobody's.

## Caveat — the board still has not been read

`projectV2` needs `read:project`; the token has `gist, read:org, repo`. This file is built from
`gh issue view`, `gh pr view` and git. No board column is claimed as current.
