---
id: sprint-2026-W42
status: in-progress
start: 2026-10-12
end: 2026-10-18
goal: "Ship v1.3.91. Its release note (10-09) names two items — #5093's multisig notification fix and the ChainList #710 maintenance — and both are QC'd and closed on the tracker, but on day one neither is merged into the Extension: PR #5095 has sat approved since 09-28, and PR #5096 still pins a PR build of chain-list and still comments out fetchLatestChainData(). ChainList PR #713 merged this morning and chain-list 0.2.132 is on npm, so #5096 now has a release to re-pin to. The tester's gate, US-42.31, opened day one and cannot start until both merge. 13 points: US-18.5 carried at 5, US-42.31 at 8."
---

## Sprint scope

| US | Title | Epic | Pri | Points | Status | Carry | Story file |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [US-18.5](stories/US-18.5-multisig-notification-improvement.md) | Multisig approval notification reliability & status lifecycle | [EPIC-18](epics/EPIC-18.md) | P2 | 5 | 👀 review — PR #5095 approved 09-28, not merged | ← W40 via W41 | [US-18.5](stories/US-18.5-multisig-notification-improvement.md) |
| [US-42.31](stories/US-42.31-qc-release-extension-v1-3-91.md) | QC — Release SubWallet Extension v1.3.91 | [EPIC-42](epics/EPIC-42.md) | P2 | 8 | 🟡 ready — waits on the merges | new | [US-42.31](stories/US-42.31-qc-release-extension-v1-3-91.md) |
| [US-12.24](stories/US-12.24-bittensor-tao-and-subnet-accuracy.md) | Bittensor TAO & subnet accuracy — on-chain yield, prices, staking and swap | [EPIC-12](epics/EPIC-12.md) | P1 | 13 | 🚧 in-progress — [PR #5113](https://github.com/Koniverse/SubWallet-Extension/pull/5113) open 10-16: Swap, root claim, alpha in Assets, on-chain alpha price (5 commits), review requested | new 10-16 (mid-sprint) | [US-12.24](stories/US-12.24-bittensor-tao-and-subnet-accuracy.md) |
| — | *ChainList #710 Extension half — epic-owned, [rule 10](../../AGENTS.md)* | [EPIC-4](epics/EPIC-4.md) | P2 | — | PR #5096 open — PR-build pin + TEMP block | ← W40 | — |
| — | *chain-list pin bump for X Layer — epic-owned, [rule 10](../../AGENTS.md)* | [EPIC-4](epics/EPIC-4.md) | P3 | — | PR #5089 open, unreviewed since 09-25 | ← W39 | — |

**13 points, two stories.** Every story's `sprint:` field was read on day one: US-42.31 names this
window (set by the tester), and US-18.5 was moved here at W40's closeout.

**10-16: 26 points, three stories.** [US-12.24](stories/US-12.24-bittensor-tao-and-subnet-accuracy.md)
(#5112, 13 points) joined mid-sprint: the issue was assigned to `tunghp2002` and moved to In Progress on
the board. Not part of v1.3.91 — the goal above is unchanged.

## v1.3.91 — what stands between the release note and a release

The note lists two items. On 2026-10-12 08:30 UTC:

| Item | Tracker | QC | Code |
| --- | --- | --- | --- |
| #5093 multisig notification | **closed** 10-08 by the tester | US-42.29 — 23 of 24, locales skipped | [PR #5095](https://github.com/Koniverse/SubWallet-Extension/pull/5095) **approved, not merged** |
| ChainList #710 maintenance | **closed** 10-08 by the tester | US-42.28 — 306 lines; US-42.30 — the late commits | ChainList PR #713 **merged 07:48**, `0.2.132` **published 07:57**; Extension [PR #5096](https://github.com/Koniverse/SubWallet-Extension/pull/5096) **open, not mergeable as it stands** |

**#5096 needs two edits before it can merge**: re-pin `@subwallet/chain-list` from
`0.2.132-beta.5-pr-713-885df11c` to **`0.2.132`**, and **revert the TEMP block** that comments out
`fetchLatestChainData()` (plus the `@ts-ignore` added to keep it quiet). Merged as it is, it switches
off [FR-34](../PRD.md#epic-4--chain-management) — the online chain-data update — for every user of
1.3.91. US-42.31 AC-12 checks exactly these two things at the gate.

**The deactivations have not reached production users yet.** Production builds read
`static-data.subwallet.app/chains/list.json`; at 08:22 UTC today it still had `moonbeam` and
`robonomics` `ACTIVE` and 135 chains inactive, while `preview.json` — what non-production builds
read — already carries `0.2.132`'s deactivations (both `INACTIVE`, and 202 inactive — the same count
as the package). So the 65 deactivations reach users when
`list.json` is republished, which is a separate step from the npm release and is not tracked
anywhere in these docs. Worth knowing who presses it, and when relative to 1.3.91.

**The locale gap is still open going into the gate.** US-18.5's five new strings ship as English in
vi, ja, ru and zh; QC skipped that check (US-42.29 AC-18) and the PR has not changed since. US-42.31
AC-13 will find it on release day unless it is fixed first.

**One chain went `INACTIVE` with no QC line.** `0.2.132` deactivates **65** chains against `0.2.131`;
US-42.28 and US-42.30 together check **64** by slug. The missing one is `polkadexTest`, a testnet.
Low stakes, recorded so the figure is reconciled rather than rounded.

## Not in v1.3.91 — the pool-withdrawal fix, handled in PR #5001

Mobile's P1 `BUG-42.24.19-28` — *withdrawing from a nomination pool fails to encode* — was fixed on
10-01 by `b1e2e4f514`, **in `extension-base`**, on `origin/web-runner`. The Extension's `master` and
`subwallet-dev` still pass `nominationPoolsApi.memberPendingSlash(address)` — a pending slash
**amount** — as `withdrawUnbonded`'s `num_slashing_spans`, a **count**; the fix computes the pool
stash's span count instead.

**The Extension's fix is [PR #5001](https://github.com/Koniverse/SubWallet-Extension/pull/5001)** —
confirmed by the owner 2026-10-12: `a7a2a8dd4f` on `koni/dev/issue-4984` is the same change,
cherry-picked on 10-06. So it is handled, not unowned. What follows from where it lives:

- **It is not in 1.3.91.** The release note names #5093 and #710 only, and #5001 is open, unreviewed
  and has an empty body.
- **#5001 cannot merge yet.** Its merge pins `@subwallet/chain-list` to
  `0.2.128-beta.0-pr-695-…` for `evmInfo.multicall3`, which no release carries — `0.2.132` included.
  Until a chain-list release has that field, the Extension keeps the old pool-withdrawal code.
- **It has no story or issue of its own here.** It ships under #4984's PR, beside balance-service
  resilience that is not #4984's scope either. [US-20.4](stories/US-20.4-many-account-submit-performance.md)
  records all three; when #5001 merges, its CHANGELOG line should name the pool fix, or it ships
  unlisted the way the passkey offer did in 1.3.90.

*Corrected 2026-10-12: this section first said the fix "rides only in PR #5001, via a cherry-pick"
and that "no one has scoped it". The cherry-pick is the deliberate Extension fix; the owner said so.*

## Inherited decision — 20 stories with a live status in a closed window

Unchanged at 96 points. One anchor moved sideways on 10-06 (PR #5001 — see
[W41](sprint-2026-W41.md) and [US-20.4](stories/US-20.4-many-account-submit-performance.md)); the
other nineteen did not. Raised in seven windows running; still a board decision.

## Caveat — the board still has not been read

`projectV2` needs `read:project`; the token has `gist, read:org, repo`. Built from `gh issue view`,
`gh pr view`, git and npm. No board column is claimed as current.
