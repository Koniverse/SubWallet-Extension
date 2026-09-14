---
id: sprint-2026-W37
status: closed
start: 2026-09-07
end: 2026-09-13
goal: "Settle US-12.23 — a PR that has sat open and approved for three windows while its QC evidence ages against a branch nobody builds. The web-runner QC programme is the larger body of live work but is tester-owned and tracked in its own stories, so it is described here and not scoped. Opened 2026-09-07 from tracker, PR and git evidence."
---

## Sprint scope

| US | Title | Epic | Pri | Points | Status | Carry | Story file |
| --- | --- | --- | --- | --- | --- | --- | --- |
| US-12.23 | Manual claim for Bittensor native staking | EPIC-12 | P2 | 5 | review | → W38 | [link](stories/US-12.23-bittensor-manual-claim-native-staking.md) |
| US-42.24 | QC — Update web-runner to 1.3.86 (#2057) — parent | EPIC-42 | P2 | 0 | in-progress | tester | [link](stories/US-42.24-qc-web-runner-1-3-86.md) |
| US-42.24.4 | QC — web-runner 1.3.71 | EPIC-42 | P2 | 13 | done | tester | [link](stories/US-42.24.4-qc-web-runner-1-3-71.md) |
| US-42.24.5 | QC — web-runner 1.3.72 | EPIC-42 | P2 | 20 | done | tester | [link](stories/US-42.24.5-qc-web-runner-1-3-72.md) |
| US-42.24.6 | QC — web-runner 1.3.73 | EPIC-42 | P2 | 5 | done | tester | [link](stories/US-42.24.6-qc-web-runner-1-3-73.md) |
| US-42.24.7 | QC — web-runner 1.3.74 | EPIC-42 | P2 | 13 | done | tester | [link](stories/US-42.24.7-qc-web-runner-1-3-74.md) |
| US-42.24.8 | QC — web-runner 1.3.75 | EPIC-42 | P2 | 3 | done | tester | [link](stories/US-42.24.8-qc-web-runner-1-3-75.md) |
| US-42.24.9 | QC — web-runner 1.3.76 | EPIC-42 | P2 | 13 | done | tester | [link](stories/US-42.24.9-qc-web-runner-1-3-76.md) |
| US-42.24.10 | QC — web-runner 1.3.77 | EPIC-42 | P2 | 8 | done | tester | [link](stories/US-42.24.10-qc-web-runner-1-3-77.md) |
| US-42.24.18 | QC — web-runner 1.3.86 | EPIC-42 | P2 | 2 | done | tester | [link](stories/US-42.24.18-qc-web-runner-1-3-86.md) |
| US-42.24.19 | QC — web-runner 1.3.86 full regression | EPIC-42 | P2 | 13 | in-progress | tester | [link](stories/US-42.24.19-qc-web-runner-regression.md) |
| US-42.24.20 | QC — verify the bugs found during the update | EPIC-42 | P2 | 8 | in-progress | tester | [link](stories/US-42.24.20-qc-web-runner-verify-bugs.md) |

**12 stories · 103 points — rebuilt at closeout.** This table read *1 story · 5 points* all week.
The eleven US-42.24 rows were put on `sprint: sprint-2026-W37` by the tester's own commits
(PRs #5077–#5080), not by this file, and this file did not learn of them until it was closed — the
same under-report as [W36](sprint-2026-W36.md), and by a larger margin: **95 of 103 points arrived
without the scope table being told.** Rows marked *tester* were not moved and will not be; they are
listed because they are here.

## US-12.23 — a third window, and the evidence is aging

Unchanged since [2026-09-03 §D](../notes/2026-09-03.md):

| | |
| --- | --- |
| Issue [#5064](https://github.com/Koniverse/SubWallet-Extension/issues/5064) | closed by hand 2026-08-26, **no commit attached** |
| PR [#5065](https://github.com/Koniverse/SubWallet-Extension/pull/5065) | **still open**, approved by `lw-cdm`, 4 commits |
| QC [US-42.23](stories/US-42.23-qc-issue-5064-bittensor-manual-claim.md) | 16/16 on the branch build, **2026-08-27** |
| v1.3.89 | dropped from scope |

That 16/16 is now **11 days old and describes a commit nobody is building.** The story has said since
2026-08-25 that leaving it open is the option that decays; three windows on, it has.
**Merge it or reschedule it.**

## The web-runner QC programme — described, not scoped

[US-42.24](stories/US-42.24-qc-web-runner-1-3-86.md) and its sub-tasks are **tester-owned**. Which
sprint they sit in is recorded by whoever runs them, so they are **not moved into this window** and
not counted in its points. They are the larger body of live work and are described here only so the
sprint record is not misleading by omission:

| | Sub-tasks | Points |
| --- | --- | --- |
| Done in [W36](sprint-2026-W36.md) | 4 — .1, .2, .14, .15 | 21 |
| In progress, still on W36 | 4 — parent, .4, .19, .20 | 29 |
| **`backlog`, no sprint** | **12** — .5 … .13, .16 … .18 | **88** |

**The untouched backlog is larger than every live sprint in the record put together.** Not a problem
with the programme — a 1.3.68 → 1.3.86 backfill is genuinely that big — but it means the finish date
is set by those twelve, and nothing currently schedules them.

## New this week, and not in scope

[#5072](https://github.com/Koniverse/SubWallet-Extension/issues/5072) *"Support sr25519 VRF signing
for dApp key derivation"* (2026-09-05) → [US-10.21](stories/US-10.21-sr25519-vrf-signing-dapp-key-derivation.md).

**Status corrected 2026-09-11 — this is live work in this window, not backlog.** The story went
`in-progress` on 09-09 when #5072 moved on the board, and
[PR #5076](https://github.com/Koniverse/SubWallet-Extension/pull/5076) (`koni/dev/issue-5072`) has
been open since 09-09 with review required. This section said `backlog, no sprint` for two days
while both were true — the same shape as W36, where work landed under a window whose scope table
never learned of it. It is still **not in the scope table**: adding a story to a window two days
before it closes is a planning call, recorded here as open, not made.

**The third empty-body issue in under a month**, after #5058 and #5064 — both of which were
eventually explained by their own PR rather than by the issue, and neither of which ever gained a
body. The story records open questions instead of invented acceptance criteria, and its EPIC-10
placement is marked **provisional**: a one-line title cannot settle whether this is dApp-facing
signing, keyring machinery, or derivation-path work.

## Not in this window — the eight stalled W33 stories

US-4.21, US-4.22, US-4.23, US-5.10, US-10.11, US-12.11, US-13.11, US-20.4 (**32 points**) stay on
`sprint-2026-W33`. Re-checked 2026-09-07: all six anchors OPEN, last-touched dates unchanged.
**Five consecutive windows sat out**, and the planning call from
[2026-08-10 §D](../notes/2026-08-10.md) is six weeks old.

## Caveat — the board still has not been read

`projectV2` needs `read:project`; the token carries `gist, read:org, repo`. Unchanged since
2026-08-13. Opened from `gh issue view`, `gh pr view` and git; **no board column is claimed as
current**.

## Closeout — 2026-09-14

Window ended **2026-09-13**. Closed the next day from `gh`, git and the merged QC pages; the board
still could not be read.

### 8 of 12 stories · 77 of 103 points

| Outcome | Stories | Pts |
| --- | --- | --- |
| **Done** | US-42.24.4, .5, .6, .7, .8, .9, .10, .18 | 77 |
| **→ [W38](sprint-2026-W38.md)** | US-12.23 | 5 |
| **→ [W38](sprint-2026-W38.md) — moved by the tester** | US-42.24 (parent), US-42.24.19, US-42.24.20 | 21 |

> At closeout on 09-14 morning these three still read `sprint: sprint-2026-W37` and this table said
> they stayed. The tester's own commit `d8d84e15a0`, merged that afternoon in PR #5081, moved them
> to W38. Row corrected the same day; the boundary holds — which window the tester's work sits in is
> the tester's call, and here they made it.

**Everything that closed was QC, and every dev story carried.** The eight done stories are the
tester's version-by-version sweep landing — seven web-runner versions plus 1.3.86 — at 77 points in
one week. The one dev story in scope, US-12.23, did not move: PR #5065's head is still the
2026-08-27 commit, its issue is still closed by hand, and its 16/16 QC is now **18 days old**. It
goes to a **fourth** window.

**The sprint file was wrong all week, again.** The goal line above says the QC programme is
*"described here and not scoped"*, and that was true when written on 09-07. The tester then scoped
it themselves — eleven stories onto W37 across four merged PRs — and nothing here changed until
closeout. Two windows in a row now. The fix is not to stop the tester setting `sprint:`; it is to
re-read every story's `sprint:` field at each sync instead of assuming the table is the source.

**US-10.21 was live in this window and never in scope.** `in-progress` since 09-09, PR #5076 open
with review required since 09-09, still open at close. Corrected in the section below on 09-11; not
added then because adding two days before close is a planning call. It is scoped into W38.

**#2057 stands at 40 of 48** at close, with three P1s open — items 9, 40 and 48; the latter two are
transactions that cannot be made. Tracker record: [notes/2026-09-04.md](../notes/2026-09-04.md).
