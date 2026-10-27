---
id: sprint-2026-W44
status: in-progress
start: 2026-10-26
end: 2026-11-01
goal: "The third window carrying the same two stories, and the first with a dated external deadline inside it. 18 points: US-18.5 at 5 (review, PR #5095 needs a fresh approval on its 10-13 head) and US-12.24 at 13 (in-progress, PR #5113 at 33 commits, CI green, no review in eleven days). Nothing has merged into subwallet-dev since PR #5110 on 10-12, so W42 and W43 both closed at zero. PR #5096 still pins a PR build and still comments out fetchLatestChainData(), which switches off FR-34 if merged — its 0.2.132 re-pin has been possible for 15 days. The deadline: Taostats' old API paths stop on 2026-11-09, inside the next window, and Static-Data-Caching main still runs cloudflare/pages-action so production earning data has been frozen since 09-18; the fix sits on dev and GitHub schedules from the default branch."
---

## Sprint scope

| US | Title | Epic | Pri | Points | Status | Carry | Story file |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [US-18.5](stories/US-18.5-multisig-notification-improvement.md) | Multisig approval notification reliability & status lifecycle | [EPIC-18](epics/EPIC-18.md) | P2 | 5 | 👀 review — PR #5095's only approval is on `f836222c51` (09-28); head `448dae55f5` unreviewed since 10-13 | ← W43 (W40 → W42 → W43 → W44) | [US-18.5](stories/US-18.5-multisig-notification-improvement.md) |
| [US-12.24](stories/US-12.24-bittensor-tao-and-subnet-accuracy.md) | Bittensor TAO & subnet accuracy — on-chain yield, prices, staking and swap | [EPIC-12](epics/EPIC-12.md) | P1 | 13 | 🚧 in-progress — [PR #5113](https://github.com/Koniverse/SubWallet-Extension/pull/5113), **36 commits** (pushed 10-27 04:13), +4492/−695 over 78 files, **no review in 11 days**, body empty; CI **pending** on the new head | ← W43 | [US-12.24](stories/US-12.24-bittensor-tao-and-subnet-accuracy.md) |
| [US-42.31](stories/US-42.31-qc-release-extension-v1-3-91.md) | QC — Release SubWallet Extension v1.3.91 | [EPIC-42](epics/EPIC-42.md) | P2 | — | 🟡 ready — waits on the merges; `sprint:` still **W42**, the tester's | listed, not moved | [US-42.31](stories/US-42.31-qc-release-extension-v1-3-91.md) |
| — | *ChainList #710 Extension half — epic-owned, [rule 10](../../AGENTS.md)* | [EPIC-4](epics/EPIC-4.md) | P2 | — | ⚠️ PR #5096 open — PR-build pin + TEMP block, **unchanged since 10-09** | ← W43 | — |
| — | *chain-list pin bump for X Layer — epic-owned, [rule 10](../../AGENTS.md)* | [EPIC-4](epics/EPIC-4.md) | P3 | — | PR #5089 open, unreviewed since 09-25 — **possibly now redundant**, #5096 bumps the dependency instead | ← W43 | — |

**18 points, two stories**, both carried for a third window. Every story's `sprint:` was re-read
when W43 closed: two name W43 and none named W44, so these two are moved here deliberately and
US-42.31's 8 points stay counted in W42, where the tester placed them.

**Opened 2026-10-27, day two.** W42 closed 0 of 3 / 0 of 26; **W43 closed 0 of 2 / 0 of 18.**

## The deadline — Taostats' old API paths stop 2026-11-09

**Thirteen days from today, and it falls inside W45.** Two things must be on `main` of
[`Static-Data-Caching`](https://github.com/Koniverse/Static-Data-Caching) before then:

1. the deploy fix — `main`'s `scheduler.yml` **and** `scheduler-dev.yml` still use
   `cloudflare/pages-action@v1`, which no longer resolves; `dev` has
   `cloudflare/wrangler-action@v4.1.3`;
2. the change that builds `validator.json` from the chain rather than Taostats' old path —
   **released clients still read `validator.json`**.

**One merge of `dev` → `main` carries both.** GitHub schedules workflows from the **default
branch**, so the fix living on `dev` changes nothing for any scheduled run: `scheduler.yml` last
succeeded **2026-09-18 13:40**, there have been **200+ failures** since, the most recent at
**2026-10-27 00:50**, and `main` has had no commit of any kind since 09-18. **Production earning
data is 39 days stale.**

Caveat carried from [notes/2026-10-21.md](../notes/2026-10-21.md): the 10-20 manual dev commit
`0d929d1374` must be **regenerated** before it is relied on — its subnet targets carry root's
`minBond`, which PR #5113's `f19b9e8318` fixed later.

## v1.3.91 — the same two merges, now 40 days since the last release

Last release is **v1.3.90, 2026-09-17**; there is no `v1.3.91` tag. The release note (10-09) names
#5093's multisig notification fix and the ChainList #710 maintenance, and the tracker closed both
ahead of the code — **a closed issue is not a delivery**, so US-18.5 stays `review` with `commit:`
empty.

**⚠️ PR #5096 is still not mergeable, and its blocker expired 15 days ago.** It pins
`0.2.132-beta.5-pr-713-885df11c` — a PR build — while `0.2.132` has been on npm since ChainList
PR #713 merged on **10-12**; and it still comments out `fetchLatestChainData()` under the author's
own *"TODO: TEMP … Revert before commit"*, which switches off
[FR-34](../PRD.md#epic-4--chain-management) and [EPIC-4](epics/EPIC-4.md)'s *data updates ship
without a release* invariant. Open, **no review, empty body, not draft**. US-42.31 AC-12 would catch
it on release day; a one-line re-pin and a two-block revert catches it now.

**PR #5113 has the momentum and no reader** — **36 commits** since the 10-27 04:13 push, +4492/−695 over 78 files, **no review in eleven days** —
and it touches `evm.ts`, which [PR #5001](https://github.com/Koniverse/SubWallet-Extension/pull/5001)
rewrites, so the conflict grows while both wait. #5001 itself is 21 days untouched and cannot merge
until a chain-list release carries `evmInfo.multicall3`, which `0.2.132` does not.

## Production did get half of #710

Checked 10-27 09:44: `list.json` reads **198 `INACTIVE` of 362 chains** and every marker chain has
flipped, so the republish that **no doc tracked** has happened. But **#710's 24 new chains are in
neither `list.json` nor `preview.json`** — they arrive only with a build bundling `0.2.132`, which
is v1.3.91. A 1.3.90 user today sees chains leave and none arrive. Two #710 follow-ups are still
live in production: `storyPartner_testnet` `ACTIVE` with no providers, and `curio` `ACTIVE` while
halted. Detail in [notes/2026-10-27.md](../notes/2026-10-27.md).

## PR #5113's 10-27 push closed two of its own open rows

Three commits landed since W43's closeout read: `b131e5e7a7` (10-23 11:47, *align alpha valuation
across Assets, Earning and Swap*), `c9c4e91f77` and `ce80a2ebff` (both 10-27 04:13). **Two of them
close items [US-12.24](stories/US-12.24-bittensor-tao-and-subnet-accuracy.md) itself listed as "not
touched yet"** — EXT-34 and the last of AC-12's English strings.

**`ce80a2ebff` (EXT-34)** quantifies what it fixes: a position read lists every subnet for every
account, nearly all without stake, and each was written to the store and IndexedDB on every read —
**128 rows per account every 30 s, about 6.5 MiB an hour for one account**. An empty position now
goes out once per subscription and again only when a stake there is gone.

**`c9c4e91f77`** translates `unstakeAmountTooLow` into `vi`, `ja`, `ru` and `zh`, so **every key
#5112 added is now translated in all five locales.** Which sharpens the contrast with US-18.5:
re-read today, PR #5095's **five English strings are unchanged since 09-28 — 29 days** — only
`multisigTxStatusUnavailable` translated. Same author, same week, two open PRs, opposite outcomes;
US-42.31 AC-13 is set to find the US-18.5 half on release day, and the fix is four one-line edits
with the pattern already proven next door.

**US-12.24 is the counter-example to the no-unit-test run**: **108 cases across 12 new spec files**
at `ce80a2ebff`, up from 103. **But the specs do not run in CI** — the test step is still commented
out on `subwallet-dev` (`scripts/koni-ci-build-dev.mjs:39`), as AC-13 records. 108 cases nothing
executes on merge are a reviewer's aid, not a gate; **that one-line uncomment is the cheapest item
in this window.** Detail in [notes/2026-10-27.md](../notes/2026-10-27.md) §D.

## New and unhomed

- [#5111](https://github.com/Koniverse/SubWallet-Extension/issues/5111) — Firefox AMO stuck at
  1.2.32, carried from W43, still no story.
- [ChainList #715](https://github.com/Koniverse/SubWallet-ChainList/issues/715) — Coalichain Testnet
  integration request, opened 10-15 by **LevCoali**, an **external** submitter. Third-party intake,
  not this team's work; recorded so no sweep counts it.
- [ChainList #716](https://github.com/Koniverse/SubWallet-ChainList/issues/716) — Hydration GIGAHDX
  token, opened 10-19 by Mabel-Nguyen. **No PR on either repo**; unhomed.

## Inherited decision — 20 stories with a live status in a closed window

12 on W31 (64 pts) and 8 on W33 (32 pts), **96 points**, statuses `ready` / `in-progress` /
`review`, unchanged. Recommended end state is still `status: backlog` with `sprint:` cleared
([notes/2026-09-26.md](../notes/2026-09-26.md)). **Board decision, eighth window running.**

## Caveat — the board still has not been read

`projectV2` needs `read:project`; the token has `gist, read:org, repo`. Built from `gh issue view`,
`gh pr view`, git, npm and direct fetches of the static-data artefacts. No board column is claimed
as current.
