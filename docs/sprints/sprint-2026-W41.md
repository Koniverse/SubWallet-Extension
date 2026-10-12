---
id: sprint-2026-W41
status: closed
start: 2026-10-05
end: 2026-10-11
goal: "Opened and closed together on 2026-10-12: nothing was synced while it ran, and the file exists because the tester set US-42.30 to this window on 10-09. No dev work was scoped, nothing merged to subwallet-dev, and the one dev story in flight, US-18.5, passed through approved and unmerged. The week belonged to the chain list and to closing things: ChainList PR #713 took its last eight commits and three betas, QC closed US-42.28, US-42.29, US-42.30 and the Mobile release gate, and the tester closed #5093 and ChainList #710 on the QC pass — before either PR had merged."
---

## Sprint scope

| US | Title | Epic | Pri | Points | Status | Carry | Story file |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [US-42.30](stories/US-42.30-qc-chainlist-710-final-recheck.md) | QC — Chainlist final RPC re-check and late syncs (ChainList #710) on Extension | [EPIC-42](epics/EPIC-42.md) | P2 | 8 | ✅ done 10-09 — every line passes | new | [US-42.30](stories/US-42.30-qc-chainlist-710-final-recheck.md) |
| — | *US-18.5 — passed through, counted in [W40](sprint-2026-W40.md) and [W42](sprint-2026-W42.md)* | [EPIC-18](epics/EPIC-18.md) | P2 | — | 👀 review — PR #5095 approved 09-28, not merged | W40 → W42 | [US-18.5](stories/US-18.5-multisig-notification-improvement.md) |
| — | *chain-list pin bump — epic-owned, [rule 10](../../AGENTS.md)* | [EPIC-4](epics/EPIC-4.md) | P3 | — | PR #5089 open, unreviewed | W39 → W42 | — |
| — | *ChainList #710 chainlist maintenance — epic-owned, [rule 10](../../AGENTS.md)* | [EPIC-4](epics/EPIC-4.md) | P2 | — | #710 closed 10-08 · PR #713 open until 10-12 · Extension PR #5096 open | W40 → W42 | — |

**8 points, one story, and it is the tester's.** Every story's `sprint:` field was read at this
closeout: **only US-42.30 names `sprint-2026-W41`**. The window was never opened while it ran, so
nothing was planned into it; US-18.5's field went straight from W40 to W42 and it is listed here so
the week it spent waiting is visible, not counted twice.

## Closeout — 2026-10-12

### 1 of 1 story · 8 of 8 points · 0 dev points

| Outcome | Stories | Pts |
| --- | --- | --- |
| **Done** | US-42.30 (opened and closed 10-09) | 8 |

**No dev work moved forward.** `subwallet-dev` sat at `a4799cfbb1` (09-17) all week. The only
Extension branches that took commits were [PR #5096](https://github.com/Koniverse/SubWallet-Extension/pull/5096)
(two version bumps, still a PR build, still the TEMP block) and
[PR #5001](https://github.com/Koniverse/SubWallet-Extension/pull/5001) — a W33 row, see below.

## What happened in the window

| Date | Event |
| --- | --- |
| 10-05 | The tester hands #2057's five open items to [Mobile #2053](https://github.com/Koniverse/SubWallet-Mobile/issues/2053) — the tracker had closed 10-02 |
| 10-05 | [#5101](https://github.com/Koniverse/SubWallet-Extension/issues/5101), an external *feature proposal* for a third-party pre-sign check API, filed 10-04 by `MADAR-NETWORK` and **closed by its own author** the next day. No story — nothing was asked of this team |
| 10-06 | ChainList PR #713 takes five commits — broken RPCs replaced, SN111's `assetType` fixed, subnets 103/116 synced, and **multisig enabled on Bittensor** — with betas 3 and 4. The last is a capability, not maintenance; QC caught it anyway (US-42.28 FIX-3/FIX-4) |
| 10-06 | PR #5001 (#4984) moves for the first time since 06-17 — three commits, none on #4984's own AC. See [US-20.4](stories/US-20.4-many-account-submit-performance.md) |
| 10-07 | US-42.28 closes, all 306 lines (W40) |
| 10-08 | US-42.29 closes 23 of 24 (W40). **The tester closes #5093 and ChainList #710 `COMPLETED`** — neither PR merged |
| 10-09 | ChainList PR #713's final re-check: 28 RPCs out, 20 in, three more chains deactivated, two subnets synced; beta.5. US-42.30 opened and closed |
| 10-09 | US-42.27 closes — **Mobile v1.2.45(534)b-v16** in both stores (W40) |
| 10-09 | ChainList #712 closed; **Extension PR #5010** (Gatotech, IBP removal, open since July) **closed unmerged** — #710 superseded it |
| 10-09 | [#4709](https://github.com/Koniverse/SubWallet-Extension/issues/4709) (Hollar as a fee token) closed `NOT_PLANNED` — on the Hollarnet testnet's deactivation, though Hollar is live on Hydration mainnet. See [US-11.17](stories/US-11.17-swap-coverage-expansion.md) |
| 10-09 | [ChainList #714](https://github.com/Koniverse/SubWallet-ChainList/issues/714) — an external RPC-provider request for Polkadot Asset Hub. Open, no response; not scoped |
| 10-09 | The v1.3.91 release note is posted in product-release (recorded by the tester in US-42.31): #5093 and the chain-list maintenance |

## Not in this window — the twenty stale rows, and one of them moved

12 on W31 and 8 on W33, **96 points**, still `ready` / `in-progress` / `review`. The 09-26 note
recorded W33's anchors as *byte-identical on three reads*. **That stopped being true on 10-06**:
PR #5001, US-20.4's anchor, took three commits. They do not advance US-20.4 — one is balance-service
resilience titled `[Issue-#4984]`, one is the Mobile pool-withdrawal fix cherry-picked from
`web-runner` — and the merge pins chain-list to a PR build (`0.2.128-beta.0-pr-695-…`) that no
release carries yet. So the honest description is now *one anchor moved sideways*, not *nothing in
flight*. The planning call is unchanged and still unmade.

## Caveat — the board still has not been read

`projectV2` needs `read:project`; the token has `gist, read:org, repo`. Built from `gh issue view`,
`gh pr view`, git and npm. No board column is claimed as current.
