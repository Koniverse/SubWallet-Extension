---
id: sprint-2026-W40
status: in-progress
start: 2026-09-28
end: 2026-10-04
goal: "Opened 2026-09-28 on its own first day at 0 points, and the drought broke the same day. #5093 — Improve multisig notification — was filed 05:12, the first issue on the Extension repo since #5072 on 09-05, 23 days earlier, and it arrived with an empty body, so it is claimed by US-18.5 and carries no ACs and no FR. PR #5089, the one-line chain-list pin, carries over from W39 still unreviewed since 09-25. The tester's regression is half run at 122 of 168 lines. The standing decision this window inherits is 20 stories in W31 and W33 that still carry ready / in-progress / review, 96 points, with three identical anchor readings saying no work is in flight on any of them."
---

## Sprint scope

| US | Title | Epic | Pri | Points | Status | Carry | Story file |
| --- | --- | --- | --- | --- | --- | --- | --- |
| — | *chain-list pin bump — epic-owned, [rule 10](../../AGENTS.md)* | [EPIC-4](epics/EPIC-4.md) | P3 | — | open, unreviewed | ← W39 | — |
| [US-18.5](stories/US-18.5-multisig-notification-improvement.md) | Improve multisig notification | [EPIC-18](epics/EPIC-18.md) | P3 | 0 | 📋 backlog — **not scoped** | new | [US-18.5](stories/US-18.5-multisig-notification-improvement.md) |

**Opened 2026-09-28 day one at 0 points, and the drought broke the same day.**
[#5093](https://github.com/Koniverse/SubWallet-Extension/issues/5093) — *"Improve multisig
notification"* — was filed **05:12 UTC by tunghp2002**, the first issue on this repo since
[#5072](https://github.com/Koniverse/SubWallet-Extension/issues/5072) on 09-05, **23 days**. It
arrived with an **empty body**, no label, no milestone, no assignee and no PR.

**It is claimed but not scoped.** [US-18.5](stories/US-18.5-multisig-notification-improvement.md)
exists so the issue does not read as uncovered at the next sync, and it carries **no acceptance
criteria and no FR** — *an FR is earned when a capability is specified, not when someone files a
request* ([D104](../CONTEXT.md#d104-an-id-is-a-promise-that-a-document-exists--do-not-mint-one-for-an-intention)).
Its `sprint:` is left **empty on purpose**: putting it in this window would claim work that has no
spec, no estimate and no owner. **It moves into scope when a PR gives it a diff to be written
from.** Placement in EPIC-18 is provisional — if the diff turns out narrow it folds into a US-18.2
row, the way #4963 is a row in US-18.1.

**Fifth empty-body issue in seven weeks** — #5058, #5064, #5072, ChainList #711, now #5093.

Every story's `sprint:` field was read at W39's closeout: none of the 336 named
`sprint-2026-W39`, and none names `sprint-2026-W40` either. W39 was opened mid-window and W36–W38
were each under-reported at closeout because nobody synced; this one was opened on day one.

## Not this team's work — [ChainList #712](https://github.com/Koniverse/SubWallet-ChainList/issues/712)

*"[Blockchain] [XGRChain] [XGR] Add XGRChain Mainnet (chain ID 1643)"*, opened 2026-09-27 09:44 by
**oliverboehm-xgr** — an external submitter, not the team. It is a third-party chain-listing
request into ChainList's own intake, with a full body, and it has **no PR on either repo**.
Recorded here **only so a later sync does not count it as Extension work**; it is not scoped, not
carried, and needs no story. Contrast ChainList #711, which the team did act on with #5089.

## The one open thing — [PR #5089](https://github.com/Koniverse/SubWallet-Extension/pull/5089)

*"Support ERC-20 ERC-721 for X Layer"*, one commit (`6fb298cc73`), **one file, +1/−1**:
`ChainListVersion` `0.2.129` → `0.2.131` in `chain-service/utils/patch.ts`. Opened 2026-09-25 04:49
onto `subwallet-dev`; **no body, no review, untouched for three days.** The capability itself is in
[SubWallet-ChainList #711](https://github.com/Koniverse/SubWallet-ChainList/issues/711) (open, empty
body); the Extension side is only the pin, which is
[FR-34](../PRD.md#epic-4--chain-management) working as designed. Owned by
[EPIC-4](epics/EPIC-4.md) under rule 10, on the same footing as #4935, and it becomes a
[US-4.3](stories/US-4.3-auto-update-chain-list-and-token-metadata.md) row only if it ships with a
CHANGELOG line.

**#5088 is the same work, not a second piece** — opened 04:40 against `master`, closed 04:49, and
reopened as #5089 on the right base with the same head branch and the same commit.

## The web-runner QC programme — the tester scopes it

Three rows carry `sprint: sprint-2026-W38` and are unfinished. They are listed because a reader of
this window needs to know what is live. **This file does not move them**:

| US | Title | Points | Status |
| --- | --- | --- | --- |
| [US-42.24](stories/US-42.24-qc-web-runner-1-3-90.md) | parent (#2057) | 0 | in-progress |
| [US-42.24.19](stories/US-42.24.19-qc-web-runner-regression.md) | 1.3.86 full regression | 20 | in-progress |
| [US-42.24.20](stories/US-42.24.20-qc-web-runner-verify-bugs.md) | verify the bugs found | 8 | in-progress |

Programme total: **23 sub-tasks** (numbered .1–.24, **.3 absent**) plus the parent —
**20 done (166 pts), 1 closed unrun (8), 2 in progress (28)**. Nothing in `backlog`, nothing
`blocked`.

**Round 2 of the regression is half run**: the checklist grew 77 → 82 → **84 lines** per platform
as the tester read the user guide against it, and stands at **Android 61 of 84, iOS 61 of 84** —
122 of 168, dead even. The retest reads **73 fixed · 5 no-fix · 4 not fixed yet** across 82 rows.

If the tester sets `sprint: sprint-2026-W40` on any row, add it here **that day**.

## Inherited decision — 20 stories with a live status in a closed window

12 on W31 (64 pts) and 8 on W33 (32 pts), **96 points**, statuses `ready` / `in-progress` /
`review`. W33's six anchors have been read three times — 08-18, 08-25, 09-26 — **byte-identical
every time**, so no work is in flight on any of them. The honest end state is `status: backlog`
with `sprint:` cleared. Evidence in [notes/2026-09-26.md](../notes/2026-09-26.md).

**Not actioned: twenty frontmatter edits are a planning decision with a board behind it.** Raised
in five windows running. These are the rows most likely to make *this* window's closeout wrong.

## Caveat — the board still has not been read

`projectV2` needs `read:project`; the token has `gist, read:org, repo`. Built from `gh issue view`,
`gh pr view` and git. No board column is claimed as current.
