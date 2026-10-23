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
| [US-12.24](stories/US-12.24-bittensor-tao-and-subnet-accuracy.md) | Bittensor TAO & subnet accuracy — on-chain yield, prices, staking and swap | [EPIC-12](epics/EPIC-12.md) | P1 | 13 | 🚧 in-progress — [PR #5113](https://github.com/Koniverse/SubWallet-Extension/pull/5113), 33 commits (ten on 10-19, six on 10-20, five on 10-21, one on 10-22, five on 10-23), CI green, no review | ← W42 | [US-12.24](stories/US-12.24-bittensor-tao-and-subnet-accuracy.md) |
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
price pages (AC-7) — CI green on that head (87 test cases across the PR by 10-20); on 10-19, three more — the
change-validator confirmation shows no staking fee (AC-3), unstake follows the chain's minimums (AC-4),
fees, previews, limits and one price scale come from the chain (AC-8), unstake and alpha
transfer check locks, toggles and minimums before submitting (AC-9, AC-10), repeated chain reads are
shared, change validator follows the chain's move rules, the staking minimum comes from the chain,
and, on 10-20, subnet positions say their rewards compound and the unstaking period and reward
timing come from the chain, Send alpha asks before locked alpha goes along, EXT-17's unit tests are in, the pool card's labels are translatable, and the subnet on screen shows its APR from the chain. On 10-23
(`691b6e9c00`) the pool cards show *Up to X% APR* — subnets from the chain, built in the static-cache job; root by
the ≥ 1% rule on Taostats' list — and root positions show their validators' APR. Later on 10-23: the card
shortened to *Up to X%*, a subnet → subnet estimate without the buy fee the chain does not charge, the fee rate
from the chain, unnamed validators shown by their address shortened, the modal's figure from the cache. Before it
can merge:

- **A review** — none yet, and the body is empty (the PR template asks for every section).
- **The `evm.ts` overlap** — `758f50000e`, `c7a4a60722` and `8cdf70efc3` edit `balance-service/helpers/subscribe/evm.ts`, which
  [PR #5001](https://github.com/Koniverse/SubWallet-Extension/pull/5001) rewrites. Move the change into #5001, or agree the merge order.
- **Its specs do not run in CI** — the test step is still commented out on `subwallet-dev`.

Not yet started: AC-14; AC-15's own rows; the English strings in AC-12; ~~in AC-1, pool cards and root (wait on BE)~~ (on the branch since 10-23; they reach users once the cache job runs
with that code — ~~`upToApr` is on no static cache yet~~ on the dev site since 08:27 UTC 10-23; production waits on BE-1).
AC-11 is on the branch since 10-21 (`3891e2e504`): per-subnet validator lists from the chain, nominator counts from
the proxy route (`Cloudflare-Workers` [`f10e80c`](https://github.com/Koniverse/Cloudflare-Workers/commit/f10e80c)) — live on the dev proxy, 404 in production — detail in the story's *Progress*.

## Static earning data — stale since 09-18, cause found 10-21 (BE-1)

Both scheduler workflows in `Static-Data-Caching` fail before any step runs: `Unable to resolve action
cloudflare/pages-action, not found` (`cloudflare/pages-action@v1` in the deploy step). Production (`main`)
last succeeded 2026-09-18 13:40 UTC, dev 14:20; every run since fails in about 7 s. The hand-made dev refresh
of 10-20 ([`0d929d1374`](https://github.com/Koniverse/Static-Data-Caching/commit/0d929d1374e084169fce98ec4d8df8d87943a972)) has the right Bittensor minimums and the chain APR on subnet validators, but its
own run failed the same way, so neither site serves it. Fix: deploy with `cloudflare/wrangler-action`, and
alert on a failing run. Regenerate the data first: its subnet targets carry root's `minBond`, which PR #5113's
`f19b9e8318` (10-21) fixes.

**Later on 10-21 — fixed on `dev`:** [`3b51d0bbe1`](https://github.com/Koniverse/Static-Data-Caching/commit/3b51d0bbe1f) switches both workflows to `cloudflare/wrangler-action`; the
regenerated data is live on the dev site (03:47 UTC), `validator.json` included. **Still open:** `main` keeps the
old action, and scheduled runs use `main`'s workflow files — so production and every scheduled run still fail.
Bring the fix to `main`.

**10:56 UTC:** `dev` now runs with PR #5113's code ([`5685f6d8b3`](https://github.com/Koniverse/Static-Data-Caching/commit/5685f6d8b37), runner = extension `587c566579`): the dev site
serves 10:33 data, SN64 with its own 61 validators and nominator counts, testnet down to 100 subnets. `main` is
unchanged — the 10:00 scheduled run failed again, and production is still 09-18.

**10-23:** the `dev` runner moved to `ac8da255` ([`8ad7a6ab61`](https://github.com/Koniverse/Static-Data-Caching/commit/8ad7a6ab61), 08:24) and then `f814a46a`
([`3e95b1e9a4`](https://github.com/Koniverse/Static-Data-Caching/commit/3e95b1e9a4), 09:54), builds with PR #5113's 10-23 code: the dev site carries the pool
cards' `upToApr` on 229 of 231 Bittensor pools (data 09:56 UTC). `main` unchanged; production still 09-18.

## Proxy — BE-20 fixed in production (10-21)

`Cloudflare-Workers` `subwallet-api-proxier` took the dev branch on 10-21 (merge [`9be2028`](https://github.com/Koniverse/Cloudflare-Workers/commit/9be2028)): the APR cron no
longer stops after its first batch, missing or old data is fetched on request, the nominator counts route is live,
and Taostats moved to its `/v1` API ([`0f58f2b`](https://github.com/Koniverse/Cloudflare-Workers/commit/0f58f2b)) ahead of the old paths stopping on 2026-11-09. Checked
10-22: SN0, 1, 64, 100 answer with 10-21 data. BE-20 is ready to tick.

**Static cache, 10-22:** `dev` builds `validator.json` — kept for released clients — from the chain instead of Taostats'
old path, which stops on 2026-11-09 ([`58bfdb62c1`](https://github.com/Koniverse/Static-Data-Caching/commit/58bfdb62c15)). `main` needs both that and the deploy fix before 2026-11-09.

**Swap backend, 10-22:** BE-14 on `SubWallet-Monorepos` `koni/dev/issue-5112-extension` ([`10d7d69`](https://github.com/Koniverse/SubWallet-Monorepos/commit/10d7d69), ~~no PR yet~~ [PR #167](https://github.com/Koniverse/SubWallet-Monorepos/pull/167)) — the Bittensor quote's fee is estimated on the
legs the submit sends, over root stake, never on an empty batch; the quote itself is not capped, the extension refuses an
amount above the usable stake. Later the same day [`00b4ec2`](https://github.com/Koniverse/SubWallet-Monorepos/commit/00b4ec2) adds BE-15 and BE-16 — the quote's price impact on the subnet's own
pool, both legs of an ALPHA → ALPHA swap. Then [`b0d2793`](https://github.com/Koniverse/SubWallet-Monorepos/commit/b0d2793) adds BE-17 — an ALPHA → ALPHA quote charges the pool fee once, on the sale. Then [`b51ac4c`](https://github.com/Koniverse/SubWallet-Monorepos/commit/b51ac4c) (BE-19, a quote under the chain minimum refused) and [`f8d9546`](https://github.com/Koniverse/SubWallet-Monorepos/commit/f8d9546) (BE-18, a second RPC for Bittensor and
four other chains). PR #167: 5 commits, +429 / −32, no review, no CI checks — every swap-backend item of #5112 is on it. On 10-23 [`4bc0099`](https://github.com/Koniverse/SubWallet-Monorepos/commit/4bc0099)
makes the quote's legs those the extension submits (117 of 117 plans identical on mainnet); PR #167 is 8 commits.

**Swap backend in production, 10-23 (outside #5112):** [`a3f56a2`](https://github.com/Koniverse/SubWallet-Monorepos/commit/a3f56a2) and [`8d72db2`](https://github.com/Koniverse/SubWallet-Monorepos/commit/8d72db2) are on `subwallet-backend-dev`
and `-prod`, deployed at 03:28 UTC. Every Asset Hub swap quote had been failing (`ERROR_FETCHING_QUOTE`):
the runtime's `LPFee` is now a Permill and was read as a 300% fee; the amount out now comes from the chain's own quote.
Chain-list `0.2.132` in the backend. PR #167 merged them in ([`96f95ca`](https://github.com/Koniverse/SubWallet-Monorepos/commit/96f95ca)), its diff unchanged; it is 9 commits.

## APR — stays on Taostats; BE-2, BE-11, BE-3, BE-20 off #5112 (10-22, owner)

The APR keeps coming from Taostats through the proxy; BE computes none of its own, and the four items are deleted
from #5112. Checked first: Taostats gives a non-zero 30-day figure for all 52 root validators the chain paid in the
last epoch and for no other; subnets already read their APR from the chain in the extension (US-12.24 AC-1).
BE-20's freshness alert is dropped too. Still open: the subnet pool cards (*Emission*) and BE-12's question (what `thirty_day_apy` is).
Detail: [docs/notes/2026-10-22.md](../notes/2026-10-22.md) §I.

## Inherited decision — 20 stories with a live status in a closed window

Unchanged at 96 points. Raised in eight windows running; still a board decision.

## Caveat — the board still has not been read

`projectV2` needs `read:project`; the token has `gist, read:org, repo`. Built from `gh issue view`,
`gh pr view` and git. No board column is claimed as current — US-12.24's *In Progress* is the assignee's word.
