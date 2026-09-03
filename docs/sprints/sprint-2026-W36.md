---
id: sprint-2026-W36
status: in-progress
start: 2026-08-31
end: 2026-09-06
goal: "A finishing window, not a building one. v1.3.89 shipped on 2026-08-28 with both its dev stories done, and what is left over is verification and one unmerged feature: complete the release gate that the release did not wait for (US-42.21, stages AC-3 to AC-9 still unticked in production), and land or reschedule the Bittensor manual claim (US-12.23 / PR #5065), whose issue is closed, whose QC passed 16/16, and whose code is in no branch that ships. Opened 2026-09-03 from tracker, PR and git evidence."
---

## Sprint scope

| US | Title | Epic | Pri | Points | Status | Carry | Story file |
| --- | --- | --- | --- | --- | --- | --- | --- |
| US-42.21 | QC — Release SubWallet Extension v1.3.89 | EPIC-42 | P2 | 8 | in-progress | ← W35 | [link](stories/US-42.21-qc-release-extension-v1-3-89.md) |
| US-12.23 | Manual claim for Bittensor native staking | EPIC-12 | P2 | 5 | review | ← W35 | [link](stories/US-12.23-bittensor-manual-claim-native-staking.md) |

**2 stories · 13 points**, both carried, **nothing new written in-window**. No new tracker issue has
been opened since [#5064](https://github.com/Koniverse/SubWallet-Extension/issues/5064) on 2026-08-24
— ten days without one, the longest quiet stretch in the record so far.

Small again, and for the same reason [W34](sprint-2026-W34.md) was — which closed at 5 of 5, and
[W35](sprint-2026-W35.md), which closed at 5 of 7 and shipped a release. The scope is what has
evidence of being live.

## US-42.21 — a release gate the release did not wait for

[v1.3.89](../CHANGELOG.md) went to production **2026-08-28**. Its release-QC story has:

| Stage | AC | State |
| --- | --- | --- |
| dev environment | AC-1a, AC-1b, AC-2 | ✅ passed |
| master build | AC-3a, AC-3b, AC-4 | ⬜ not run |
| draft release build | AC-5a, AC-5b, AC-6 | ⬜ not run |
| **production** | AC-7a, AC-7b, AC-8, AC-9 | ⬜ **not run** |

**Six days after the release went live, ten of thirteen checks are unticked**, including every
production check and AC-9 — *the master password still unlocks the wallet on every stage, with the
passkey both on and off, so nobody can be locked out*.

This is not a claim that the release is broken. Both items were QC'd individually before merge —
[US-42.20](stories/US-42.20-qc-issue-5058-biometric-passkey-login.md) 14/14 and
[US-42.22](stories/US-42.22-qc-issue-5062-repoint-kah-pah-usdt-xcm.md) 15/15 — so the content has
been verified, just not *as the shipped artefact*. The gate exists to catch what packaging and
promotion break, and that question is still open.

**AC-9 is the one to run first.** It is the only check in the window standing between a passkey
regression and a user who cannot open their wallet, and passkey unlock is the newest thing in the
release.

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
