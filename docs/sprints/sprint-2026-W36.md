---
id: sprint-2026-W36
status: closed
start: 2026-08-31
end: 2026-09-06
goal: "A finishing window, not a building one. v1.3.89 shipped on 2026-08-28 with both its dev stories done, and what was left over was verification and one unmerged feature. The release gate the release did not wait for is now complete (US-42.21, 16/16, no bugs); what remains is to land or reschedule the Bittensor manual claim (US-12.23 / PR #5065), whose issue is closed, whose QC passed 16/16, and whose code is in no branch that ships. Opened 2026-09-03 from tracker, PR and git evidence."
---

## Sprint scope

| US | Title | Epic | Pri | Points | Status | Carry | Story file |
| --- | --- | --- | --- | --- | --- | --- | --- |
| US-42.21 | QC — Release SubWallet Extension v1.3.89 | EPIC-42 | P2 | 8 | done | ← W35 | [link](stories/US-42.21-qc-release-extension-v1-3-89.md) |
| US-12.23 | Manual claim for Bittensor native staking | EPIC-12 | P2 | 5 | review | → W37 | [link](stories/US-12.23-bittensor-manual-claim-native-staking.md) |
| US-42.24 | QC — Update web-runner to 1.3.86 (#2057) — parent | EPIC-42 | P2 | 0 | in-progress | tester | [link](stories/US-42.24-qc-web-runner-1-3-86.md) |
| US-42.24.1 | QC — Web-runner 1.3.68 | EPIC-42 | P2 | 8 | done | new | [link](stories/US-42.24.1-qc-web-runner-1-3-68.md) |
| US-42.24.2 | QC — Web-runner 1.3.69 | EPIC-42 | P2 | 8 | done | new | [link](stories/US-42.24.2-qc-web-runner-1-3-69.md) |
| US-42.24.4 | QC — Web-runner 1.3.71 | EPIC-42 | P2 | 8 | in-progress | tester | [link](stories/US-42.24.4-qc-web-runner-1-3-71.md) |
| US-42.24.14 | QC — Web-runner 1.3.82 | EPIC-42 | P2 | 2 | done | new | [link](stories/US-42.24.14-qc-web-runner-1-3-82.md) |
| US-42.24.15 | QC — Web-runner 1.3.83 | EPIC-42 | P2 | 3 | done | new | [link](stories/US-42.24.15-qc-web-runner-1-3-83.md) |
| US-42.24.19 | QC — Web-runner 1.3.86 full regression | EPIC-42 | P2 | 13 | in-progress | tester | [link](stories/US-42.24.19-qc-web-runner-regression.md) |
| US-42.24.20 | QC — Verify the bugs found during the update | EPIC-42 | P2 | 8 | in-progress | tester | [link](stories/US-42.24.20-qc-web-runner-verify-bugs.md) |

**10 stories · 63 points.** The window opened at **2 stories / 13 points**; the
[US-42.24](stories/US-42.24-qc-web-runner-1-3-86.md) web-runner QC programme — a parent plus 19
version sub-tasks — landed inside it on 2026-09-03, and eight of those were worked this week.

**Twelve more sub-tasks sit in `backlog` with no sprint** (US-42.24.5 … .13, .16 … .18, **88
points**) — the rest of the 1.3.68 → 1.3.86 backfill, never in this window.

## US-42.21 — the release gate is now closed

[v1.3.89](../CHANGELOG.md) went to production **2026-08-28**, ahead of its own gate. The gate has
since been run to completion and **passed 16 / 16 with no bugs**:

| Stage | AC | State |
| --- | --- | --- |
| dev environment | AC-1a, AC-1b, AC-2 | ✅ passed |
| master build | AC-3a, AC-3b, AC-4 | ✅ passed |
| draft release build | AC-5a, AC-5b, AC-6 | ✅ passed |
| **production** | AC-7a, AC-7b, AC-8, AC-9 | ✅ passed |

**AC-9 held** — the master password unlocks the wallet at every stage with the passkey both on and
off, so the newest thing in the release cannot lock anyone out. AC-12 is signed off on **both**
halves of the P0 fix, which ship from two different repos: the chainlist data from
[ChainList PR #709](https://github.com/Koniverse/SubWallet-ChainList/pull/709) and the guard from
PR #5063. A real KAH↔PAH USDt transfer arrived, so the route is repointed rather than merely blocked.

The order still stands as a process point, recorded not dropped: **the release shipped six days
before its gate finished.** Both items had been QC'd individually before merge
([US-42.20](stories/US-42.20-qc-issue-5058-biometric-passkey-login.md) 14/14,
[US-42.22](stories/US-42.22-qc-issue-5062-repoint-kah-pah-usdt-xcm.md) 15/15), and the gate has now
confirmed the shipped artefact as well — but it confirmed it after the fact, not before.

## US-12.23 — four states that still do not line up

Unchanged since [2026-08-25 §G](../notes/2026-08-25.md), except that the release moved on without it:

| | |
| --- | --- |
| Issue [#5064](https://github.com/Koniverse/SubWallet-Extension/issues/5064) | **closed** 2026-08-26, by hand, no commit attached |
| PR [#5065](https://github.com/Koniverse/SubWallet-Extension/pull/5065) | **open**, 4 commits, approved by `lw-cdm` |
| QC [US-42.23](stories/US-42.23-qc-issue-5064-bittensor-manual-claim.md) | **16/16** on the branch build |
| v1.3.89 | **dropped from scope** — not in the shipped changelog |

The QC did its job: it confirmed the `I96F32` scale holds end-to-end in a running build
(`{ bits: 2147483648000000 }` → 500,000 rao), and that the dust case refuses **before** submitting,
charging no fee — the failure mode this story flagged as the expensive one.

**The problem is what happens next.** The only verification is one manual pass against
`ac5b0a6ac9` on an unmerged branch, there is **no test**, and the release that would have re-checked
it on a real build no longer includes it. Every day the branch sits, that 16/16 becomes a claim about
a commit nobody builds. **Merge it or reschedule it — leaving it open is the one option that decays.**

## Carried debt, named rather than re-listed

- **[US-13.19](stories/US-13.19-repoint-kah-pah-usdt-xcm-refs.md) AC-6** — the P0 shipped in 1.3.89
  with **no regression test**. Both halves of the fix are in production and nothing executable
  defends the route. The story is `done`; the box stays unticked on purpose.
- **A new FR for passkey unlock.** [US-5.16](stories/US-5.16-biometric-passkey-login.md) shipped a
  capability FR-55 does not cover, with `prd_ref: []` — correct, because PRD FR markers track shipped
  capability and no FR exists yet. Writing one from a story would put a requirement into the map by
  the back door. **A decision for whoever owns the PRD.**
- **`commit:` on a QC story** — US-42.20, US-42.22 and US-42.23 all cite their own **docs** commits;
  the six QC pages before US-42.19 leave the field empty. Now applied four times, so it is settled
  practice in fact if not in writing. It needs one line in [AGENTS.md](../../AGENTS.md).

## Not in this window — the eight stalled W33 stories

US-4.21, US-4.22, US-4.23, US-5.10, US-10.11, US-12.11, US-13.11, US-20.4 (**32 points**) stay on
`sprint-2026-W33`. Re-checked 2026-09-03: all six anchors OPEN, last-touched dates unchanged since
the 08-18 check. **Four consecutive windows sat out** — W31, W33, W34, W35 — and the planning call
from [2026-08-10 §D](../notes/2026-08-10.md) is now five weeks old.

## Caveat — the board still has not been read

`projectV2` needs `read:project`; the available token carries `gist, read:org, repo`. Unchanged since
2026-08-13. Opened from `gh issue view`, `gh pr view` and git alone; **no board column is claimed as
current**.

---

## Closeout — 2026-09-07

Window ended **2026-09-06**. Closed the next day from `gh`, git and the merged QC pages; the board
still could not be read.

### 5 of 10 stories · 29 of 63 points

| Outcome | Stories | Pts |
| --- | --- | --- |
| **Done** | US-42.21, US-42.24.1, US-42.24.2, US-42.24.14, US-42.24.15 | 29 |
| **→ [W37](sprint-2026-W37.md)** | US-12.23 | 5 |
| **Stays on W36 — tester-owned** | US-42.24 (parent), US-42.24.4, US-42.24.19, US-42.24.20 | 29 |

> **The four in-progress US-42.24 sub-tasks keep `sprint: sprint-2026-W36` and were not moved.**
> They belong to the tester's QC programme, and which window they sit in is their call, not this
> file's. The same boundary applies as to the test reports and
> [US-42.24.20](stories/US-42.24.20-qc-web-runner-verify-bugs.md): status of that work is recorded by
> whoever runs it. Noted here so a later reader does not read the omission as an oversight.

**The scope table above was rebuilt at closeout, not merely re-statused.** It recorded 2 stories and
13 points all week while eight more were being worked under it — the US-42.24 programme arrived
2026-09-03 and nothing added it to the window. A sprint file that is not rebuilt when work lands in
it under-reports by whatever arrived late, and here that was **five sixths of the points**.

### What closed

- **[US-42.21](stories/US-42.21-qc-release-extension-v1-3-89.md) — the v1.3.89 release gate is
  `done`.** [W35's closeout](sprint-2026-W35.md) flagged it as a gate the release did not wait for,
  with 10 of 13 checks unticked six days after production. It finished inside this window.
- **[US-42.24.1](stories/US-42.24.1-qc-web-runner-1-3-68.md) closed**, its blocking bug
  `BUG-42.24.1-01` verified fixed in
  [US-42.24.20](stories/US-42.24.20-qc-web-runner-verify-bugs.md) with AC-7, AC-8 and AC-9 rerun and
  passing.
- **US-42.24.3 was dropped** — the 1.3.70 sub-task; its locked-balance checks moved to US-42.24.1.

### What did not

- **[US-12.23](stories/US-12.23-bittensor-manual-claim-native-staking.md)** — unchanged for a second
  window. PR [#5065](https://github.com/Koniverse/SubWallet-Extension/pull/5065) still open and
  approved, #5064 still closed by hand, still out of the release scope. Its 16/16 QC pass is now
  **13 days old against a branch that has not merged**, which is the decay this was flagged for.
- **The web-runner QC is roughly a third done.** Eight of twenty sub-tasks touched; twelve still
  `backlog` at **88 points** — the programme is larger than the rest of the live sprint record
  combined.

### Still not moving — the eight W33 stories

Re-checked 2026-09-07. Unchanged: all six anchors OPEN, same last-touched dates. **Five consecutive
windows sat out** — W31, W33, W34, W35, W36. The planning call is six weeks old.
