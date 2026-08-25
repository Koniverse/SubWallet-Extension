---
id: sprint-2026-W35
status: in-progress
start: 2026-08-24
end: 2026-08-30
goal: "Two open pull requests, both opened after v1.3.88 shipped. The P0 is #5062 — a KAH↔PAH USDt XCM route that has already trapped 72,614 USDT of a user's funds; the other is the passkey unlock feature (#5058), whose PR finally answered what its empty issue never stated. Opened 2026-08-25 from tracker, PR and git evidence. The eight stalled W33 stories were again not carried in — a third window running."
---

## Sprint scope

| US | Title | Epic | Pri | Points | Status | Carry | Story file |
| --- | --- | --- | --- | --- | --- | --- | --- |
| US-13.19 | Repoint KAH↔PAH USDt XCM refs — the route that trapped funds | EPIC-13 | **P0** | 5 | review | new | [link](stories/US-13.19-repoint-kah-pah-usdt-xcm-refs.md) |
| US-5.16 | Biometric / passkey login for the extension | EPIC-5 | P3 | 8 | review | ← backlog | [link](stories/US-5.16-biometric-passkey-login.md) |

**2 stories · 13 points.** Both are open PRs with no merge yet, so **nothing here is `done` and
nothing has a `version_shipped`.**

Small again, and for the same reason [W34](sprint-2026-W34.md) was: this is what has evidence of
being live. W34 closed at 5 of 5 on that basis.

## Why these two

### US-13.19 — P0, and the only one in the sprint

[#5062](https://github.com/Koniverse/SubWallet-Extension/issues/5062) is not a latent risk.
`statemine-LOCAL-USDt` is the Kusama-AH-native USDt, `AssetRef.json` offers it an XCM route to
Polkadot Asset Hub, and that asset cannot cross the bridge — **a user lost 72,614 USDT** sending it.
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

**PR #5063 adds no test.** For a bug that has already cost a user five figures, AC-6 on the story
asks for a regression test and nothing currently satisfies it.

### US-5.16 — the empty issue got answered by code

[#5058](https://github.com/Koniverse/SubWallet-Extension/issues/5058) has been a bare title since
2026-08-13. [PR #5061](https://github.com/Koniverse/SubWallet-Extension/pull/5061) opened 08-20 —
3 commits, +1035 / −49 across 20 files — and settles the question
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

## Backlog touched this window

[US-12.23](stories/US-12.23-bittensor-manual-claim-native-staking.md) — manual claim for Bittensor
native staking ([#5064](https://github.com/Koniverse/SubWallet-Extension/issues/5064), opened
2026-08-24). **No sprint, `backlog`.** Like #5058 before it, the issue is a title with an empty body,
so the story records open questions instead of invented acceptance criteria. Listed here for
visibility, not scope. That is now **two empty-body issues in a month** from the same author.

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
