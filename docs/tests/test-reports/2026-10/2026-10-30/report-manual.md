# Manual Test Report — EPIC-42 — 2026-10-30

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-10-30 |
| Tester | MaiThuongNinni |
| Environment | Extension — subwallet-dev build |
| Runner | manual (extension) |
| Build under test | subwallet-dev |
| Stories tested | US-42.31 — in progress |
| Total bugs found | 0 |
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| P3 | 0 |
| Status | done |

---

## US-42.31 — Release SubWallet Extension v1.3.91

The release gate for v1.3.91. Today covers the multisig notification half (#5093) on the dev build.

PR #5095 merged on 2026-10-29, so the work is in the dev build and can be tested there rather than on a PR build.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|
| AC-1a-01 | A pending multisig transaction raises a notification, still there after an idle minute | ✅ Pass | testnet |
| AC-1a-02 | The notification does not disappear and reappear with a new timestamp while pending | ✅ Pass | testnet |
| AC-1a-03 | The notification shows under the signatory account and under All accounts | ✅ Pass | testnet |
| AC-1a-04 | Switching account on the notification screen refetches | ✅ Pass | testnet |
| AC-1a-05 | Adding or removing an account leaves the notification in place | ✅ Pass | testnet |
| AC-1a-06 | Enabling, disabling or updating a chain leaves other chains' notifications in place | ✅ Pass | testnet |
| AC-1a-07 | With the RPC failing, notifications of that multisig are not cleared | ✅ Pass | testnet |
| AC-1a-08 | After the RPC recovers, the list is correct again without a manual reload | ✅ Pass | testnet |
| AC-1a-09 | A transaction whose extrinsic cannot be resolved keeps its last known data | ✅ Pass | testnet |
| AC-1a-10 | After the current signer approves, the notification reads "Multisig transaction approved" | ✅ Pass | testnet |
| AC-1a-11 | After the transaction executes, it reads "Transaction no longer pending" | ✅ Pass | testnet |
| AC-1a-12 | A cancelled transaction reads the same wording as an executed one | ✅ Pass | testnet |
| AC-1a-13 | The account prefix in square brackets is kept when the title is replaced | ✅ Pass | testnet |
| AC-1a-14 | Clicking a still-pending notification opens History with that transaction | ✅ Pass | testnet |
| AC-1a-15 | Clicking an approved or resolved notification opens a status modal with "I understand" | ✅ Pass | testnet |
| AC-1a-16 | Clicking a notification on a disabled chain offers to enable that network | ✅ Pass | testnet |
| AC-1a-17 | When the status cannot be read, a warning toast says so and the notification stays | ✅ Pass | testnet |
| AC-1a-18 | Clicking a pending notification the background no longer has shows the same warning | ✅ Pass | testnet |
| AC-1a-19 | Clicking repeatedly while the first check runs does nothing twice | ✅ Pass | testnet |
| AC-1a-20 | Notifications of other kinds are unaffected in content, order and unread state | ✅ Pass | testnet |
| AC-1a-21 | Marking read and marking all read still work | ✅ Pass | testnet |
| AC-1a-22 | The notification filter tabs sort and filter correctly with the new statuses | ✅ Pass | testnet |
| AC-1a-23 | Signing a multisig transaction from the notification completes | ✅ Pass | testnet |
| AC-1c | Multisig notification re-checked on a live network | ✅ Pass | Polkadot Asset Hub, real pending multisig |

### AC-1a was one line, now 23

AC-1a was written as one line — multisig notification works correctly on dev — which is not something a tester can tick a piece at a time. A session could spend hours on it with nothing to mark. It is now 23 lines, AC-1a-01 to AC-1a-23, taken from the AC that US-42.29 already proved the feature against.

All 23 pass, run on testnet. The notification stays put through an idle minute, through account changes and chain changes, and through a failing RPC. It reads approved once the current signer signs and no longer pending once the transaction leaves the chain, keeping the account prefix. Each state opens the right thing on click: History while pending, a status modal once it is not, the enable-network offer on a disabled chain, a warning toast when the status cannot be read. Other notification kinds, marking read, the filter tabs and signing from a notification are unaffected.

The line was also silent about which network, so a testnet run would have closed it and the live-network case would never have been asked for. That is now AC-1c, and it has not run. The two are different checks: on testnet the tester creates the multisig and the pending call, so the notification is driven by data the test itself made, while on a live network the data comes from elsewhere, which is the case a real user meets.

### The live-network subject

AC-1c ran against a real multisig on Polkadot Asset Hub, with a pending approval nobody on the test side created:

| Field | Value |
|---|---|
| Address | `15RMoJNoFRCWUyeLVrMgwWB23f7bNmk6psC7acBZ4hqmYh1A` |
| Signatories | 2 |
| Approvals in | 1 |
| Opened at block | 22,309,954 |

Finding it meant reading `multisig.multisigs` straight off the chain, since nothing in the wallet lists other people's pending multisigs. Counts on the networks the wallet supports for multisig, on 2026-10-30:

| Network | Pending multisigs |
|---|---|
| Polkadot Asset Hub | 171 |
| Bittensor | 125 |
| Kusama Asset Hub | 110 |
| Bifrost Polkadot | 29 |
| Energy Web X | 7 |
| Bifrost Kusama | not read, RPC refused |

Two notes worth keeping for the next time this is needed.

The number of signatories is not in storage — only the approvals received so far are. It comes out of the deposit instead: on Asset Hub the deposit is 2,008,800,000 plus 3,200,000 per signatory, so the four deposit values seen across the sample resolve to 2, 3, 4 and 6 signatories. That is how a two-signatory multisig was picked rather than one with a dozen.

A first pass reported Polkadot Asset Hub as having zero pending. That was a dead RPC endpoint answering with an error that got counted as an empty result. The right reading is 171. An empty answer from a broken endpoint looks exactly like an empty answer from a working one, which is the same shape as LESSONS §69.

### Bugs

None.

## Summary

The multisig notification half of the v1.3.91 gate passes on the dev build — all 23 lines on testnet, plus the live-network re-check.

AC-1a went from one line to 23. As written it said only that the feature works on dev, which a tester cannot tick a piece at a time — a long session on it would end with nothing marked. The 23 lines come from the AC US-42.29 already proved the feature against, so what gets done gets recorded.

One AC was also added. AC-1a did not say which network it covered, so a testnet run could have closed it and the live-network case would never have been asked for. That is AC-1c, and it passed the same day against a real pending multisig on Polkadot Asset Hub — two signatories, one approval in, none of it created by the test.

Nothing else on US-42.31 ran today. The chainlist half, the regression passes and every stage past dev are still open.
