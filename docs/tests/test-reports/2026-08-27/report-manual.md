# Manual Test Report — 2026-08-27

Not tied to one epic — this covers today's test tasks only.

| Field | Value |
|---|---|
| Date | 2026-08-27 |
| Tester | MaiThuongNinni |
| Environment | PR build |
| Runner | manual (extension) |
| Build under test | PR [#5065](https://github.com/Koniverse/SubWallet-Extension/pull/5065) commit `ac5b0a6ac9` (US-42.23) |
| Tasks tested | US-42.23 |
| Total bugs found | 0 |
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| Status | done |

---

## US-42.23 — Manual claim for Bittensor native staking ([#5064](https://github.com/Koniverse/SubWallet-Extension/issues/5064))

Checked on fresh install and on an upgrade from v1.3.88. **16 / 16 AC pass.**

### Bugs

None found. All checks passed:

- On a **root (netuid 0)** position the rewards panel shows "Unclaimed rewards" with a value and a working Claim button.
- On a **subnet (alpha)** position there is no claim button and no unclaimed-reward figure — this is the intended behaviour, not a gap.
- The claim screen only lists accounts with a pending reward greater than zero; an account with nothing pending cannot be selected.
- The amount shown matches the chain when checked against a runtime query rather than against the app's own display, and the scale is right — TAO, not rao, and not off by 2³².
- A claim with **one** claimable validator goes through with a correct fee on the confirm screen; a claim with **several** goes through and settles all of them.
- After claiming, the unclaimed figure drops to zero (or to the leftover un-claimable dust) and the staked balance reflects the claim.
- The claim shows correctly in transaction history.
- The **"bond reward" checkbox is hidden** on the Bittensor claim screen, as the chain re-stakes the claimed TAO itself.
- The new message renders in all 5 languages (en, ja, ru, vi, zh) — no raw key anywhere.
- Stake, unstake and change-validator on Bittensor all still work after the handler edit.
- Fresh install and upgrade from v1.3.88 behave the same; existing Bittensor positions carried over correctly.

### The dust case — the one that could have cost a fee for nothing

With pending rewards but every validator below `RootClaimableThreshold`, the claim is **refused before anything is submitted**: the message *"No rewards to claim. You need at least {threshold} {symbol} pending on a validator before you can claim"* appears, no extrinsic goes out, and **no fee is charged**. The threshold figure in the message is correct — the code divides the `I96F32` raw bits by 2³², and `{ bits: 2147483648000000 }` reads back as 500,000 rao (0.0005 TAO) as expected. The `500000` rao fallback also behaves when the query is absent.

This was the highest-value check in the story, because a wrong scale here would have shown a plausible number rather than failing loudly.

### Old runtime and the removed claim path

- On a node without `betaBasketRuntimeApi` the unclaimed reward settles at **0** and the screen neither hangs nor errors.
- The deprecated root claim type **removed in v1.3.86** ([#5045](https://github.com/Koniverse/SubWallet-Extension/issues/5045), QC'd in [US-42.11](../../../sprints/stories/US-42.11-qc-extension-pr5043-and-issue5045.md)) has **not** come back. There is one claim path, not two — this PR replaces the old behaviour on a different runtime API, it does not revive it. Neither the issue nor the PR said so; this is the answer.

### Note on the build

This ran against an **unmerged** commit on an open PR. #5065 is approved by `lw-cdm` at head `ac5b0a6ac9` and **ships no test**, so this manual pass is the only verification the feature has. If more commits land before it merges, the numeric checks (the amount, the scale, the dust threshold) need a re-run against the merged head. The v1.3.89 release gate ([US-42.21](../../../sprints/stories/US-42.21-qc-release-extension-v1-3-89.md)) re-verifies this on the real release build rather than inheriting this result.
