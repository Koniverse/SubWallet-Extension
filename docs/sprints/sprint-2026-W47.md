---
id: sprint-2026-W47
status: in-progress
start: 2026-11-16
end: 2026-11-22
goal: "Opened for the release gate that finished in it. US-42.31 closes at 101 of 105 — stages 2 and 3, the master build and the draft release, both pass on 11-17 with the 95-case regression list rerun at each, and the draft stage carried the fresh install and the upgrade from v1.3.90 as well. The 4 left are skipped: three production lines because v1.3.91 is not published yet, and AC-13 because the five multisig strings are still English in vi, ja, ru and zh, which US-18.5 is already open on. US-42.32 continues on the Web App at 103 of 112, the 9 left all waiting on dev fixes for four logged bugs."
---

## Sprint scope

| US | Title | Epic | Pri | Points | Status | Carry | Story file |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [US-42.31](stories/US-42.31-qc-release-extension-v1-3-91.md) | QC — Release SubWallet Extension v1.3.91 | [EPIC-42](epics/EPIC-42.md) | P2 | 8 | ✅ done — 101 of 105, closed 11-17. Stages 2 and 3 pass; the 4 left are skipped, three of them production lines that need a published build | ← W45 (W42 → W44 → W45 → W47) | [US-42.31](stories/US-42.31-qc-release-extension-v1-3-91.md) |
| [US-42.32](stories/US-42.32-qc-webapp-pr5011-latest-code-1-3-86.md) | QC — Web App: PR #5011 (latest Extension code 1.3.86, issue #5004) | [EPIC-42](epics/EPIC-42.md) | P2 | 21 | 🚧 in-progress — 103 of 112. The 9 left are all gated on four logged bugs, so nothing moves until dev fixes them | ← W45 | [US-42.32](stories/US-42.32-qc-webapp-pr5011-latest-code-1-3-86.md) |

29 points, two stories, both QC. US-42.31 was carried from W45 when the run resumed on 11-16: W45 is past and a story in flight cannot stay counted in a window that is shut. Its `sprint:` now reads W47.

Opened 2026-11-17, day two, after the draft stage finished.

## US-42.31 — the gate closes one stage short, on purpose

Three of four stages pass. Dev finished on 11-02 with AC-2-01 to AC-2-31. The master build and the draft release both pass on 11-17, each rerunning the same 95 regression cases at 94 pass and 1 skip, and the draft stage added the two installation paths: a fresh install on a clean profile, and an upgrade from v1.3.90 that kept accounts, chains, custom networks, settings and the master password with no data loss. Balances survived on a deactivated chain and on a renamed one.

Stage 4 is skipped rather than failed. v1.3.91 is not published, so AC-7a, AC-7b and AC-7c have no build to run against; the tester will check the live build when it reaches the store.

AC-12 settles a question the story carried since 10-12. The build takes `@subwallet/chain-list` `0.2.132`, a published release, and `fetchLatestChainData()` runs. ChainList #710's maintenance arrives inside `0.2.132` itself, published when ChainList PR #713 merged on 10-12 — not through Extension PR #5096. That PR is still open, still pins `0.2.132-beta.5-pr-713-885df11c` and still comments the call out, so it is not needed for this release and merging it as it stands would undo both halves of AC-12.

AC-13 is the fourth skip and the one worth acting on. Five of the six new multisig strings are still English in vi, ja, ru and zh; only `multisigTxStatusUnavailable` is translated. US-18.5 is open on exactly this, so running the check here would record the same failure twice rather than tell anyone something new. It needs four one-line edits next door, not another test pass.

## US-42.32 — everything runnable is run

103 of 112, and the 9 left are all bug-gated: AC-1-09 on BUG-42.32-01, AC-12-01 to AC-12-06 on BUG-42.32-03, and AC-13-01 and AC-13-07 on BUG-42.32-02. No further QC moves this story; it waits on dev.

## Caveat — the board still has not been read

`projectV2` needs `read:project`; the token has `gist, read:org, repo`. This file is built from the story files and the test reports in this repo only. US-18.5 and US-12.24 still carry `sprint: sprint-2026-W43` and are not listed here — their state was not re-read this window, so no claim is made about them.
