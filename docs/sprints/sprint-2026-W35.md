---
id: sprint-2026-W35
status: in-progress
start: 2026-08-24
end: 2026-08-30
goal: "Two open pull requests, both opened after v1.3.88 shipped. The P0 is #5062 — a KAH↔PAH USDt XCM route the wallet offers but the asset cannot cross, leaving the tokens locked on the destination chain; alongside it, passkey unlock (#5058) and the Bittensor root claim path (#5064), each of whose PR answered what its empty issue never stated. Opened 2026-08-25 from tracker, PR and git evidence. The eight stalled W33 stories were again not carried in — a third window running."
---

## Sprint scope

| US | Title | Epic | Pri | Points | Status | Carry | Story file |
| --- | --- | --- | --- | --- | --- | --- | --- |
| US-13.19 | Repoint KAH↔PAH USDt XCM refs — the route that trapped funds | EPIC-13 | **P0** | 5 | review | new | [link](stories/US-13.19-repoint-kah-pah-usdt-xcm-refs.md) |
| US-5.16 | Biometric / passkey login for the extension | EPIC-5 | P3 | 8 | review | ← backlog | [link](stories/US-5.16-biometric-passkey-login.md) |
| US-12.23 | Manual claim for Bittensor native staking | EPIC-12 | P2 | 5 | review | ← backlog | [link](stories/US-12.23-bittensor-manual-claim-native-staking.md) |
| US-42.20 | QC — Biometric / passkey login (#5058) | EPIC-42 | P2 | 5 | done | new | [link](stories/US-42.20-qc-issue-5058-biometric-passkey-login.md) |
| US-42.21 | QC — Release SubWallet Extension v1.3.89 | EPIC-42 | P2 | 8 | ready | new | [link](stories/US-42.21-qc-release-extension-v1-3-89.md) |

**5 stories · 31 points** — 3 dev stories (18 pts) and 2 QC stories (13 pts). The three dev stories
are all open PRs with no merge yet, so **none of them is `done` and none has a `version_shipped`.**
Between them they carry **two reviews** (`saltict` on #5063, `lw-cdm` on #5065) and **one completed
QC pass** ([US-42.20](stories/US-42.20-qc-issue-5058-biometric-passkey-login.md), 14/14 on #5061 —
which is the PR with no review at all).

The one `done` in this window is a QC story, not a dev story: US-42.20 passed against a PR build.
**Nothing has shipped.**

The two QC stories were added on 2026-08-25 alongside the dev stories, not after them:
[US-42.20](stories/US-42.20-qc-issue-5058-biometric-passkey-login.md) covers the passkey feature —
**`done` 2026-08-25, 14 / 14 AC, no bugs**, run against PR #5061 at commit `cab8ebd5ee`. Because
that commit is **not merged**, the result is a claim about that build and not about whatever
eventually lands; the release gate re-verifies rather than inherits it.

[US-42.21](stories/US-42.21-qc-release-extension-v1-3-89.md) is the v1.3.89 release gate and **has
not run** — there is no v1.3.89 tag, `VERSION` is at 1.3.88, and all three content PRs are still
open. It stays `ready` until a build exists.

One gap that follows from the table: the **P0** (US-13.19) and the Bittensor claim (US-12.23) have
**no feature-level QC story**, only the release gate. The passkey item is the only one of the three
with its own QC pass.

Small again, and for the same reason [W34](sprint-2026-W34.md) was: this is what has evidence of
being live. W34 closed at 5 of 5 on that basis.

## Why these two

### US-13.19 — P0, and the only one in the sprint

[#5062](https://github.com/Koniverse/SubWallet-Extension/issues/5062) is not a latent risk.
`statemine-LOCAL-USDt` is the Kusama-AH-native USDt, `AssetRef.json` offers it an XCM route to
Polkadot Asset Hub, and that asset cannot cross the bridge — **the tokens end up locked on the
destination chain**, and this has already happened on a real transfer.
`statemine-LOCAL-USDC` already models the bridged case correctly, so USDt is the odd one out.

**The fix has two halves and only one of them is in this repository:**

| Half | Where | State |
| --- | --- | --- |
| Chainlist data — 4 edits to `ChainAsset.json` / `AssetRef.json` / `AssetLogoMap.json` | `SubWallet-ChainList` | **no issue, no PR found** (checked 08-25) |
| Validation logic — `xcm/utils.ts` +162 | [PR #5063](https://github.com/Koniverse/SubWallet-Extension/pull/5063) | open, approved by `saltict` 08-24 |

The PR's commit is *"feat: update validate logic"*: it adds a **guard**, not the data edits the
issue prescribes. Merging it will close #5062 by the `[Issue-N]` convention and leave the data half
undone with its issue closed. **The bad route stays live in production data until half 1 lands** —
flagged on the story and worth confirming before merge.

**PR #5063 adds no test.** For a bug that has already stranded a real transfer, AC-6 on the story
asks for a regression test and nothing currently satisfies it.

### US-5.16 — the empty issue got answered by code

[#5058](https://github.com/Koniverse/SubWallet-Extension/issues/5058) has been a bare title since
2026-08-13. [PR #5061](https://github.com/Koniverse/SubWallet-Extension/pull/5061) opened 08-20 —
4 commits, +1180 / −49 across 18 files — and settles the question
[2026-08-18 §D](../notes/2026-08-18.md) called load-bearing:

> Does biometry **unlock a master password already held**, or **replace it** as the thing wrapping
> the key?

Read from the branch: `wrapWalletPassword()` AES-GCM-encrypts the master password under a key
derived from the passkey **PRF extension** output, and only `{ciphertext, nonce}` is stored. **It
wraps, it does not replace** — so EPIC-5's *non-recoverable by design* decision is not reopened.
The story moves from `backlog` to `review` and carries acceptance criteria derived from the code.

Two things a reviewer should look at: the PR has **0 reviews**, and the fallback path (AC-3 — the
master password must still work when no passkey is enrolled or the authenticator is gone) is the
route by which an unlock convenience becomes a way to lose a wallet. It does ship **2 spec files**,
which is more than [US-12.22](stories/US-12.22-nominator-fast-unbond-duration.md) managed.

### US-12.23 — the second empty issue answered by its own PR, hours later

[#5064](https://github.com/Koniverse/SubWallet-Extension/issues/5064) opened 2026-08-24 with a title
and **no body**, and was written up as a `backlog` placeholder on the morning of 08-25.
[PR #5065](https://github.com/Koniverse/SubWallet-Extension/pull/5065) appeared the same day —
1 commit, +198 / −14 — and answered three of the story's four open questions.

The diff's own comment carries the design:

> *Root claims redeem the basket of a netuid 0 position, subnet (alpha) positions have nothing to claim*

`claimReward` goes **true** in `tao.ts` (+162) and explicitly **false** in `dtao.ts`. So this is
root-network TAO, **not** subnet/alpha — which settles the overlap worry with
[US-12.6](stories/US-12.6-bittensor-dtao-subnet-staking.md): there is none.

**What is still unanswered is the one that matters.** v1.3.86 *removed* a deprecated Bittensor root
claim type (#5045, [US-12.21](stories/US-12.21-earning-fixes-recovered-from-uncategorized.md)). This
PR adds a root claim path on a **different** runtime API (`betaBasketRuntimeApi`), so on the evidence
it replaces rather than revives — but neither the PR nor the issue says so.

**Two quiet failure modes, and no test to catch either:**

- `RootClaimableThreshold` is a substrate-fixed `I96F32` — the raw bits carry 32 fractional bits and
  must be scaled by `2^32`. Read unscaled, it is wrong by nine orders of magnitude.
- When the `rootClaimableThreshold` query is absent, the code falls back to `500000` rao. A wrong
  fallback claims zero or nothing at all.

Both produce a *plausible wrong number* rather than an error. **PR #5065 ships no test** — the same
gap as PR #5063.

## Pattern worth naming — refreshed 2026-08-25 (evening)

The three dev stories are open PRs opened within five days of each other. The picture improved
during the day but the shape is still worth stating:

| PR | Story | Reviews | Tests | QC |
| --- | --- | --- | --- | --- |
| [#5063](https://github.com/Koniverse/SubWallet-Extension/pull/5063) | US-13.19 (**P0**, tokens locked on the wrong chain) | 1 — `saltict` | **none** | **none** |
| [#5061](https://github.com/Koniverse/SubWallet-Extension/pull/5061) | US-5.16 (unlock path) | **0** | 2 spec files | **14/14** — [US-42.20](stories/US-42.20-qc-issue-5058-biometric-passkey-login.md) |
| [#5065](https://github.com/Koniverse/SubWallet-Extension/pull/5065) | US-12.23 (reward claim) | 1 — `lw-cdm` | **none** | none |

**What improved:** #5065 gained an approval, and #5061 gained a full QC pass that specifically
checked the two things this sprint flagged as dangerous — the master-password fallback and the dApp
signing guarantee. Both held.

**What has not:** the **P0 still has no test and no QC**. #5063 is the one PR here touching a bug
that has already stranded a real transfer, and it is the least verified of the three. Two of the
three PRs still ship no test at all.

**A reviewing oddity, recorded not resolved:** #5061 has a completed 14/14 QC pass and **zero code
reviews**. QC and review answer different questions — QC asks whether it works, review asks whether
the code should look like that — and a security-adjacent unlock path arguably wants both.

## #5058 was closed by hand while its PR is still open

Worth separating from the QC result, because the two are easy to read as one event.

[#5058](https://github.com/Koniverse/SubWallet-Extension/issues/5058) was **closed 2026-08-25 by
`MaiThuongNinni`**. The timeline shows a plain `closed` event with **no commit attached** — a manual
close, not a merge-close. [PR #5061](https://github.com/Koniverse/SubWallet-Extension/pull/5061) is
**still open and unmerged**, so `dev` does not contain the feature and nothing has shipped.

[US-5.16](stories/US-5.16-biometric-passkey-login.md) therefore stays **`review`** with empty
`version_shipped` and `commit`. A closed issue is not a merged branch
([LESSONS §69](../LESSONS.md)) — and this sprint now has one story whose issue is closed, whose QC
is done, and whose code is in no shipping branch.

## Not in this window — the eight stalled W33 stories

US-4.21, US-4.22, US-4.23, US-5.10, US-10.11, US-12.11, US-13.11, US-20.4 (**32 points**) stay on
`sprint-2026-W33`. Re-checked 2026-08-25: all six anchors OPEN, every last-touched date **identical
to the 08-18 check** — #4451 2025-11-18, #4889 / #4424 2026-01-19, #4946 2026-03-24, #4984
2026-04-08, #4995 2026-05-21.

**Three consecutive windows now** — W31, W33, W34 — and this makes four. The reasoning is unchanged
from [W33 § Closeout](sprint-2026-W33.md): carrying them would assert active work the tracker
contradicts. What has changed is only how long the question has gone unanswered — a month, from
[2026-08-10 §D](../notes/2026-08-10.md).

## Caveat — the board still has not been read

`projectV2` needs `read:project`; the available token carries `gist, read:org, repo`. Unchanged
since 2026-08-13. This window was opened from `gh issue view`, `gh pr view` and git alone, and **no
board column is claimed as current**.
