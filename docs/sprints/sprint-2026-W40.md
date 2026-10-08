---
id: sprint-2026-W40
status: in-progress
start: 2026-09-28
end: 2026-10-04
goal: "Opened 2026-09-28 at 0 points and it did not hold for a morning. #5093 Improve multisig notification was filed 05:12 — the first Extension issue in 23 days — with an empty body, gained a full body naming five root causes by 08:20, and had PR #5095 open by 08:36: 10 files, +233/-46, multisig approval notifications now updated with a status rather than deleted on every subscription reload. Scoped as US-18.5, 5 points, in-progress. PR #5089, the one-line chain-list pin, still carries from W39 unreviewed since 09-25. The tester moved three QC rows over from W38 on 09-30 — the parent, the regression and the bug verification, 28 points — taking the window to 33; round 3 of the regression ran 09-30 to 10-02 on the build going to beta and closed at 83 of 85 on each platform, ending the web-runner programme. US-42.27 opened 09-30 at 21 points, the release gate for the Mobile build carrying that update — a full regression on each beta build, a quick recheck on each production one. The standing decision this window inherits is 20 stories in W31 and W33 that still carry ready / in-progress / review, 96 points."
---

## Sprint scope

| US | Title | Epic | Pri | Points | Status | Carry | Story file |
| --- | --- | --- | --- | --- | --- | --- | --- |
| — | *chain-list pin bump — epic-owned, [rule 10](../../AGENTS.md)* | [EPIC-4](epics/EPIC-4.md) | P3 | — | open, unreviewed | ← W39 | — |
| — | *ChainList #710 chainlist maintenance — epic-owned, [rule 10](../../AGENTS.md)* | [EPIC-4](epics/EPIC-4.md) | P2 | — | ChainList PR #713 + Extension PR #5096, both open, unreviewed | — | — |
| [US-18.5](stories/US-18.5-multisig-notification-improvement.md) | Multisig approval notification reliability & status lifecycle | [EPIC-18](epics/EPIC-18.md) | P2 | 5 | 🔄 in-progress — PR #5095 open | new | [US-18.5](stories/US-18.5-multisig-notification-improvement.md) |
| [US-42.24](stories/US-42.24-qc-web-runner-1-3-90.md) | QC — Update web-runner to 1.3.90 (#2057) — parent | [EPIC-42](epics/EPIC-42.md) | P2 | 0 | ✅ done 10-02 — all 23 sub-tasks settled | tester ← W38 | [US-42.24](stories/US-42.24-qc-web-runner-1-3-90.md) |
| [US-42.24.19](stories/US-42.24.19-qc-web-runner-regression.md) | QC — web-runner full regression, round 3 | [EPIC-42](epics/EPIC-42.md) | P2 | 20 | ✅ done 10-02 — 83 of 85 on each platform | tester ← W38 | [US-42.24.19](stories/US-42.24.19-qc-web-runner-regression.md) |
| [US-42.24.20](stories/US-42.24.20-qc-web-runner-verify-bugs.md) | QC — verify the bugs found during the update | [EPIC-42](epics/EPIC-42.md) | P2 | 8 | ✅ done 10-02 — 88 rows settled, 1 on monitoring | tester ← W38 | [US-42.24.20](stories/US-42.24.20-qc-web-runner-verify-bugs.md) |
| [US-42.27](stories/US-42.27-qc-release-mobile.md) | QC — Release SubWallet Mobile, the build carrying web-runner 1.3.90 | [EPIC-42](epics/EPIC-42.md) | P2 | 21 | 🔄 in-progress — fresh install done on both beta builds | new | [US-42.27](stories/US-42.27-qc-release-mobile.md) |
| [US-42.28](stories/US-42.28-qc-chainlist-710-maintenance.md) | QC — Maintenance of chainlist (ChainList #710) on Extension | [EPIC-42](epics/EPIC-42.md) | P2 | 42 | ✅ done 10-07 — all 306 lines pass | new | [US-42.28](stories/US-42.28-qc-chainlist-710-maintenance.md) |
| [US-42.29](stories/US-42.29-qc-issue-5093-multisig-notifications.md) | QC — Improve multisig notification (#5093) on Extension | [EPIC-42](epics/EPIC-42.md) | P2 | 13 | 🔄 in-progress — AC-1 and AC-2 pass | new | [US-42.29](stories/US-42.29-qc-issue-5093-multisig-notifications.md) |

109 points across seven stories — US-18.5 at 5, the three the tester moved over from W38 on 09-30 at
28, US-42.27 at 21, opened the same day, US-42.28 at 42, opened 10-02 for ChainList #710 and
re-pointed twice as it grew — 34 to 36 when three commits landed on its branch, 36 to 42 when the Bittensor table was split per subnet — and US-42.29 at 13,
opened 10-06 to QC US-18.5's own PR.

The three moved rows all closed on 10-02, which ends the web-runner programme: the parent US-42.24,
the regression US-42.24.19 at 83 of 85 on each platform after three rounds, and the bug
verification US-42.24.20 with all 88 rows settled. 28 of the window's 88 points are done.

US-42.28, the chainlist maintenance, closed 10-07 at all 306 of its lines. It was written out one
line per chain and, from 10-07, one per Bittensor netuid as well — a single line for 102 subnets
could not be ticked until every one had been read, so a session's work left no mark. 42 points.

US-42.27, the release gate, has the fresh-install regression done on both beta builds at 81 of 82,
with the upgrade rechecks and the two production stages still to come. US-42.29 started 10-08 with AC-1 and AC-2.

**Opened day one at 0 points, and that held for about three hours.**
[#5093](https://github.com/Koniverse/SubWallet-Extension/issues/5093) — *"Improve multisig
notification"* — was filed **05:12 UTC by tunghp2002**, the first issue on this repo since
[#5072](https://github.com/Koniverse/SubWallet-Extension/issues/5072) on 09-05, **23 days**. It
arrived with an empty body; by **08:20** it had a full one naming five root causes, and by **08:36**
[PR #5095](https://github.com/Koniverse/SubWallet-Extension/pull/5095) was open — one commit
`f836222c51`, **10 files, +233/−46**, base `subwallet-dev`, no review.

**Scoped as [US-18.5](stories/US-18.5-multisig-notification-improvement.md), 5 points,
`in-progress`**, with eleven ACs read from the diff. The substance: multisig approval notifications
were **deleted** whenever the subscription re-ran, so any incomplete storage read looked like *no
pending transaction*. They are now **updated with a status** — `APPROVED`, `RESOLVED`, or absent —
an incomplete read throws and resubscribes instead of clearing, and a tx whose extrinsic cannot be
resolved keeps its last known data. Two things it does **not** carry: **no test** (the fourth story
running), and **5 of its 6 new strings ship as English in vi, ja, ru and zh** while the sixth is
translated — US-12.23's locale finding again, sharper.

*Corrected: at 05:14 this file recorded #5093 as unspecified, unscoped and the fifth of five
empty-body issues **none of which ever gained a body**. It gained one three hours later. The count
at filing time stands; the claim about what happens afterwards was a snapshot read as a permanent
property.* **#5093 is the first of the five to gain a body.**

Every story's `sprint:` field was read at W39's closeout: none of the 336 named
`sprint-2026-W39`, and none names `sprint-2026-W40` either. W39 was opened mid-window and W36–W38
were each under-reported at closeout because nobody synced; this one was opened on day one.

## The biggest thing in flight is not in this repo — [ChainList #710](https://github.com/Koniverse/SubWallet-ChainList/issues/710)

**Maintenance of chainlist** *(retitled from "Maintenance of RPC endpoints" on 09-29)*, opened
**2026-08-25** by tunghp2002 and still being rewritten; delivered by
[ChainList PR #713](https://github.com/Koniverse/SubWallet-ChainList/pull/713) (`koni/dev/issue-710`,
**12 commits, 100 files, +1468/−329**, base `dev`, **no review**, three beta releases cut from it).

**61 chains set `chainStatus: INACTIVE`** — 30 mainnet, 31 testnet — **24 chains added**,
**69 RPC lists rewritten**, and **102 Bittensor subnets resynced** against taostats (85 names,
7 symbols, 21 priceIds, 86 icons, slugs deliberately unchanged so users keep their tokens). Every
IBP endpoint is gone. Most deactivations are *the chain is gone* rather than *our endpoint broke* —
Moonbeam and Moonriver shut down 31/07, Centrifuge migrated to EVM, Manta Atlantic deprecated
01/08, Interlay halted ~63 days. The branch now carries **#711 and #712 as named commits** too.

**⚠️ The Extension half is [PR #5096](https://github.com/Koniverse/SubWallet-Extension/pull/5096),
and it is not safe to merge as it stands.** Opened 09-29 04:43, 2 commits, 6 files, **empty body,
no review, not draft**. Five files bump `@subwallet/chain-list` `0.2.131` →
`0.2.132-beta.2-pr-713-7aa00e22` — **a PR build, not a release**. The sixth,
`chain-service/index.ts`, **comments out `fetchLatestChainData()`** with the author's own marker
*"TODO: TEMP … Revert before commit"*. That switches off
[FR-34](../PRD.md#epic-4--chain-management) and this epic's *data updates ship without a release*
invariant. Test scaffolding, correctly labelled — but nothing outside the diff says *do not merge*.

**EPIC-4 owns #710** under rule 10. **13 follow-ups open** inside the issue, including
`validate-tokens` crashing on `bittensor-LOCAL-Ё` so **every asset after it goes unvalidated**.
Detail and the open edges in [notes/2026-09-29.md](../notes/2026-09-29.md).

*Corrected 2026-09-28→29: this file recorded [#712](https://github.com/Koniverse/SubWallet-ChainList/issues/712)
(XGRChain) as "not scoped, not carried, needs no story". The submitter, `oliverboehm-xgr`, is still
external — but the team **is** acting on it, inside #710, in a commit named `[Issue-712]`. The
error came from sweeping GitHub on `createdAt`, which never returned #710 at all; sweep on
`updatedAt`.*

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

The three unfinished rows now carry `sprint: sprint-2026-W40` — the tester set the field on 09-30
and they are in the scope table above. They had been listed here while they still read W38, so a
reader of this window could see what was live without this file moving them.

Programme total: **23 sub-tasks** (numbered .1–.24, **.3 absent**) plus the parent —
**20 done (166 pts), 1 closed unrun (8), 2 in progress (28)**. Nothing in `backlog`, nothing
`blocked`.

**Round 2 of the regression is nearly run**: the checklist grew 77 → 82 → 84 → **85 lines** per
platform as the tester read the user guide against it, and stands at **Android 83 of 85, iOS 83 of
85** — 166 of 170, dead even. The four left are two skips on each list, both outside the build:
REG-32, because NFTs are auto-detected so removing one no longer does anything, and REG-76, because
the Polkadot API key that history check needs no longer works. The retest reads **76 fixed · 6
no-fix · 1 not fixed yet** across 83 rows, and **no P1 is left in the programme** — BUG-42.24.19-06,
the app hanging after a spell in the background, was fixed and verified on 09-29.

**The three rows moved on 09-30, W38 → W40.** W38's closeout listed them as the tester's to move
into W39; that did not happen, so they carry two windows in one hop. The `sprint:` field on each
story is the source — this table follows it, and rows the tester places are listed, never moved.

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
