---
id: sprint-2026-W32
status: closed
start: 2026-08-03
end: 2026-08-09
goal: "Ship and verify the signing-prompt security fix (#5042 / PR #5043) on both the Extension and the Web App, plus the Bittensor deprecated root-claim-type removal (#5045) — the content of releases v1.3.85 and v1.3.86."
---

## Sprint scope

| US | Title | Epic | Pri | Points | Status | Carry | Story file |
| --- | --- | --- | --- | --- | --- | --- | --- |
| US-5.15 | Signing-prompt mode confusion — a dApp must not render an extrinsic as an inert message | EPIC-5 | P0 | 2 | done | new | [link](stories/US-5.15-signing-prompt-mode-confusion.md) |
| US-42.11 | QC — Extension: PR #5043 (signing prompt security fix) + #5045 (Bittensor deprecated root claim type removal) | EPIC-42 | P2 | 5 | done | new | [link](stories/US-42.11-qc-extension-pr5043-and-issue5045.md) |
| US-42.12 | QC — Web App: PR #5043 (signing prompt security fix for #5042) | EPIC-42 | P2 | 3 | done | new | [link](stories/US-42.12-qc-webapp-pr5043-signing-prompt-security.md) |

**3 stories · 10 points · all done.** One delivery story and its two QC stories. The rest of the
product-development line did not move into this window — its in-flight stories were still
declaring [sprint-2026-W31](sprint-2026-W31.md) at the time.

### Corroborated by the board

The GitHub Projects board (**SubWallet.App - Development**, project #2) puts exactly two
Extension items in its `Week 31 - 2026` iteration — which starts **2026-08-03**, i.e. *this*
window (the board numbers its weeks one behind ISO; see
[notes/2026-08-10.md §D](../notes/2026-08-10.md)):

| Board item | Status |
| --- | --- |
| [#5042](https://github.com/Koniverse/SubWallet-Extension/issues/5042) Security Notice: Signing Prompts Could Conceal the Actual Transaction | Done |
| [#5045](https://github.com/Koniverse/SubWallet-Extension/issues/5045) Remove bittensor root claim type function | Done |

Both `Done`, both assigned `tunghp2002`. The scope above is the board's week, one for one.

## Why this file exists

> **Reconstructed on 2026-08-10, not planned in advance.** US-42.11 and US-42.12 were written on
> 2026-08-05 declaring `sprint: sprint-2026-W32`, but no sprint file was ever created — so
> `koni-docs validate` reported both as `sprint=…(not_found)` and the two stories appeared in no
> scope table. This file is derived **entirely from the two stories' own frontmatter**: the ID,
> title, epic, priority, points, status and assignee columns are copied, not judged. The dates
> follow the weekly cadence unbroken since [W28](sprint-2026-W28.md) (Mon–Sun; W31 ended
> 2026-08-02). The goal restates what the two stories say they verify.
>
> **Nothing about the stories was changed** — no status was moved, no story was added or
> reassigned. See [notes/2026-08-10.md](../notes/2026-08-10.md).

## Releases in this window

| Release | Date | Verified by |
| --- | --- | --- |
| v1.3.85 (`3a7e29e404`) | 2026-08-05 | US-42.11 (Extension), US-42.12 (Web App) |
| v1.3.86 (`1c54913c64`) | 2026-08-06 | US-42.11 (Extension) |

> Both stories are **PR-level** QC, not release-level. There is no
> *"QC — Release SubWallet Extension v1.3.85 / v1.3.86"* story to match
> [US-42.6](stories/US-42.6-qc-release-extension-v1-3-84.md) for v1.3.84 — the release-level
> regression pass for these two releases is an open gap, recorded in
> [notes/2026-08-10.md §B](../notes/2026-08-10.md).
