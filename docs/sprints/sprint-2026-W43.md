---
id: sprint-2026-W43
status: in-progress
start: 2026-10-19
end: 2026-10-25
goal: "Two threads, both carried from W42, where nothing merged. v1.3.91: PR #5095 needs a fresh approval on its 10-13 head and a merge; PR #5096 needs the 0.2.132 re-pin and the TEMP block reverted; then the tester's gate, US-42.31. And US-12.24 (#5112): PR #5113 has six commits and green CI but no review and no body, and it touches evm.ts, which PR #5001 rewrites. 18 points: US-18.5 at 5, US-12.24 at 13."
---

## Sprint scope

| US | Title | Epic | Pri | Points | Status | Carry | Story file |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [US-18.5](stories/US-18.5-multisig-notification-improvement.md) | Multisig approval notification reliability & status lifecycle | [EPIC-18](epics/EPIC-18.md) | P2 | 5 | 👀 review — PR #5095: the only approval is on `f836222c51` (09-28); the head, `448dae55f5`, is unreviewed | ← W42 (W40 → W42 → W43) | [US-18.5](stories/US-18.5-multisig-notification-improvement.md) |
| [US-12.24](stories/US-12.24-bittensor-tao-and-subnet-accuracy.md) | Bittensor TAO & subnet accuracy — on-chain yield, prices, staking and swap | [EPIC-12](epics/EPIC-12.md) | P1 | 13 | 🚧 in-progress — [PR #5113](https://github.com/Koniverse/SubWallet-Extension/pull/5113), 16 commits (ten on 10-19), CI green, no review | ← W42 | [US-12.24](stories/US-12.24-bittensor-tao-and-subnet-accuracy.md) |
| [US-42.31](stories/US-42.31-qc-release-extension-v1-3-91.md) | QC — Release SubWallet Extension v1.3.91 | [EPIC-42](epics/EPIC-42.md) | P2 | — | 🟡 ready — waits on the merges; `sprint:` stays W42 (the tester's) | listed, not moved | [US-42.31](stories/US-42.31-qc-release-extension-v1-3-91.md) |
| — | *ChainList #710 Extension half — epic-owned, [rule 10](../../AGENTS.md)* | [EPIC-4](epics/EPIC-4.md) | P2 | — | PR #5096 open — PR-build pin + TEMP block, unchanged since 10-09 | ← W42 | — |
| — | *chain-list pin bump for X Layer — epic-owned, [rule 10](../../AGENTS.md)* | [EPIC-4](epics/EPIC-4.md) | P3 | — | PR #5089 open, unreviewed since 09-25 | ← W42 | — |

**18 points, two stories** whose `sprint:` names this window. US-42.31's 8 points stay counted in W42,
where the tester placed it.

## v1.3.91 — still the same two merges

Unchanged from [W42](sprint-2026-W42.md#v1391--what-stands-between-the-release-note-and-a-release):

- **#5095** needs a review of `448dae55f5`, the head since 10-13 (R-1 – R-4 fixed, CI green), then a merge.
  GitHub still shows *Approved* — from 09-28, on `f836222c51`.
- **#5096** must re-pin `@subwallet/chain-list` to **`0.2.132`** and revert the TEMP block that comments out
  `fetchLatestChainData()`. Merged as it stands, it switches off [FR-34](../PRD.md#epic-4--chain-management)
  for every 1.3.91 user. US-42.31 AC-12 checks both.

## US-12.24 — PR #5113

Six commits on 10-16 — Swap (AC-5), root claim (AC-6), on-chain alpha price (AC-2), alpha in Assets and
price pages (AC-7) — 45 test cases in five specs, CI green on that head; on 10-19, three more — the
change-validator confirmation shows no staking fee (AC-3), unstake follows the chain's minimums (AC-4),
fees, previews, limits and one price scale come from the chain (AC-8), unstake and alpha
transfer check locks, toggles and minimums before submitting (AC-9, AC-10), repeated chain reads are
shared, change validator follows the chain's move rules, and the staking minimum comes from the chain.
Before it can merge:

- **A review** — none yet, and the body is empty (the PR template asks for every section).
- **The `evm.ts` overlap** — `758f50000e`, `c7a4a60722` and `8cdf70efc3` edit `balance-service/helpers/subscribe/evm.ts`, which
  [PR #5001](https://github.com/Koniverse/SubWallet-Extension/pull/5001) rewrites. Move the change into #5001, or agree the merge order.
- **Its specs do not run in CI** — the test step is still commented out on `subwallet-dev`.

Not yet started: AC-1, AC-11, AC-12, AC-14; AC-15's own rows — detail in the story's *Progress*.

## Inherited decision — 20 stories with a live status in a closed window

Unchanged at 96 points. Raised in eight windows running; still a board decision.

## Caveat — the board still has not been read

`projectV2` needs `read:project`; the token has `gist, read:org, repo`. Built from `gh issue view`,
`gh pr view` and git. No board column is claimed as current — US-12.24's *In Progress* is the assignee's word.
