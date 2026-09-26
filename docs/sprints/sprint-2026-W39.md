---
id: sprint-2026-W39
status: in-progress
start: 2026-09-21
end: 2026-09-27
goal: "A window that opened empty and did not stay empty. It was opened 2026-09-24 mid-window with 0 points of dev work — nothing filed on the Extension repo since #5072 on 09-05 and every W38 dev story shipped. On 09-25 one piece of dev work arrived: PR #5089, a chain-list version pin bump for X Layer ERC-20/ERC-721 support (SubWallet-ChainList #711). The tester's QC programme scopes itself and had the bigger week: BUG-42.24.24-01 was verified fixed, US-42.24.24 closed done, and for the first time no bug row is disputed between the developer's ticks and the retest."
---

## Sprint scope

| US | Title | Epic | Pri | Points | Status | Carry | Story file |
| --- | --- | --- | --- | --- | --- | --- | --- |
| — | *chain-list pin bump — epic-owned, [rule 10](../../AGENTS.md)* | [EPIC-4](epics/EPIC-4.md) | P3 | — | in review | — | — |

**One piece of dev work, and it is a version pin.** [PR #5089](https://github.com/Koniverse/SubWallet-Extension/pull/5089)
— *"Support ERC-20 ERC-721 for X Layer"*, opened **2026-09-25 04:49 UTC** by tunghp2002 onto
`subwallet-dev`, one commit (`6fb298cc73`, *"Chore: update chainlist version"*), **one file, +1/−1**:
`ChainListVersion` in `chain-service/utils/patch.ts` moves `0.2.129` → `0.2.131`. Open, no body, no
review. **The capability itself is not in this repository** — X Layer's ERC-20 and ERC-721 support
lands in [SubWallet-ChainList #711](https://github.com/Koniverse/SubWallet-ChainList/issues/711)
(open, created 09-25, **empty body**); the Extension side only points at the newer list, which is
[FR-34](../PRD.md#epic-4--chain-management) working as designed — data updates without a release.

**No story is opened for it, on purpose.** [AGENTS.md](../../AGENTS.md) rule 10 puts a chain-list
release-train batch on its **epic**, not a story, and EPIC-4 already holds
[#4935](https://github.com/Koniverse/SubWallet-Extension/issues/4935) (*Update chain-list stable
v0.2.124*) on exactly that footing. `US-4.3` is `done` at 1.1.50 and carries the batches that have
a CHANGELOG line; this one has none yet. **If it ships with a CHANGELOG line, it becomes a US-4.3
row instead** — that is the call to revisit, not the epic placement.

**Cross-repo again, and the other way round this time.** The issue is on ChainList and the PR is on
Extension, with the PR titled from the *ChainList* issue and branched `koni/dev/issue-711-chainlist`.
[LESSONS §69](../LESSONS.md) was written on the mirror image of this — Extension #5062's chainlist
half, where [ChainList PR #709](https://github.com/Koniverse/SubWallet-ChainList/pull/709) was
titled with the *Extension* number and a search for issues found nothing. **Search both repos, for
PRs as well as issues, in both naming directions.**

**Fourth empty-body issue in six weeks** — #5058, #5064, #5072, now ChainList #711. The pattern is
unbroken: what the work is has to be read from the diff.

## The web-runner QC programme — the tester scopes it

Five rows carry `sprint: sprint-2026-W38` and are listed here because a reader of this window needs
to know what is live. **This file does not move them**:

| US | Title | Points | Status |
| --- | --- | --- | --- |
| [US-42.24](stories/US-42.24-qc-web-runner-1-3-90.md) | parent (#2057) | 0 | in-progress |
| [US-42.24.19](stories/US-42.24.19-qc-web-runner-regression.md) | 1.3.86 full regression | 20 | in-progress |
| [US-42.24.20](stories/US-42.24.20-qc-web-runner-verify-bugs.md) | verify the bugs found | 8 | in-progress |
| [US-42.24.22](stories/US-42.24.22-qc-web-runner-1-3-88.md) | 1.3.88 | 13 | **done** (09-24) |
| [US-42.24.24](stories/US-42.24.24-qc-web-runner-1-3-90.md) | 1.3.90 | 13 | **done** (09-24) — was `blocked` |

Programme total: **23 sub-tasks** (numbered .1–.24, **.3 absent**) plus the parent —
**20 done (166 pts), 1 closed unrun (8), 2 in progress (28)**. Nothing in `backlog`, and
**nothing `blocked`**: the one story that ever used that status has left it.

If the tester sets `sprint: sprint-2026-W39` on any row, add it here **that day** — W36, W37 and
W38 each learned of tester rows only at closeout, W38 by 4 stories and 34 points.

## `BUG-42.24.24-01` is resolved — what it cost

The 1.3.90 blocker is closed. Unclaimed rewards read **0 TAO on Mobile** for every Bittensor native
staking position from 09-18 — two accounts holding **133,160.31 TAO** and **1.02 TAO**, both zero,
while the **same two accounts on the Extension the same day** read **497.71 TAO** and **0.0068
TAO**. The developer ticked it on #2057 as item 68 on 09-24 and the tester **verified it fixed the
same day**; AC-10 reran on the fixed build and passes, US-42.24.24 closed **`done` at 21 of 22**.

**It was open for six days, and the story that shipped the capability had already named the
failure.** [US-12.23](stories/US-12.23-bittensor-manual-claim-native-staking.md) AC-3 describes the
`I96F32` fixed-point decode as the place this breaks by producing *a plausible wrong number* — and
zero is a plausible wrong number — and AC-4's fallback returns `0` when the threshold cannot be
read, which filters every position out. **Neither has a unit test**, which is what US-12.23 shipped
without. The record never says which of the two it was, or whether the fix was Extension-side or
Mobile-side. That is the thing to carry: a named failure mode with no test behind it took six days
and a release blocker to find.

## No tick is contradicted by a retest any more

US-42.24.20's retest reads **72 fixed · 5 no-fix · 4 not fixed yet** across 81 rows, against
**54 · 2 · 15** across 71 on 09-16. The eleven rows the developer had ticked and the tester could
not verify — including `BUG-42.24.19-16`, a **P1 crash** — have all been rerun and passed, and
nothing has taken their place.

Of the four rows still open, three were never ticked: `-19-03` and `-19-06` (**P1**, both since
09-03) and `-19-24` (item 71, P2, filed 09-25). The fourth, `-19-23` (item 70), **was ticked
2026-09-26 04:42 — after the 09-25 retest that recorded it** — so it is out of step by lag rather
than by disagreement, the shape item 58 had, and one rerun settles it. #2057 is at **65 of 71**.
Detail in [notes/2026-09-04.md](../notes/2026-09-04.md).

## Not in this window — the eight stalled W33 stories

US-4.21, US-4.22, US-4.23, US-5.10, US-10.11, US-12.11, US-13.11, US-20.4 — 32 points, five windows
out. Unchanged and still nobody's call. Same for the 12 W31 stories that remain `ready` /
`in-progress` / `review` in a closed window.

## Caveat — the board still has not been read

`projectV2` needs `read:project`; the token has `gist, read:org, repo`. Built from `gh issue view`,
`gh pr view` and git. No board column is claimed as current.
