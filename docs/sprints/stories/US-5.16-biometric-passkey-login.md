---
id: US-5.16
title: "Biometric / passkey login for the extension"
epic: EPIC-5
status: done
priority: P3
points: 8
sprint: sprint-2026-W35
version_shipped: 1.3.89
prd_ref: []
assignee: tunghp2002
commit: f9a1bc49f1, 82e1a09927
created: 2026-08-18
updated: 2026-09-03
---

## Goal

Give [#5058](https://github.com/Koniverse/SubWallet-Extension/issues/5058) — *"Support
biometric/passkey login for extension"* — a home in the docs, so the tracker issue is covered
([D108](../../CONTEXT.md)) rather than sitting outside the story layer.

**Written as a placeholder 2026-08-18; no longer one.** [PR #5061](https://github.com/Koniverse/SubWallet-Extension/pull/5061)
landed on 08-20 and the acceptance criteria below are now derived from the code it contains. The
*issue* is still an empty body — see the resync section.

## Background

| | |
| --- | --- |
| Issue | [#5058](https://github.com/Koniverse/SubWallet-Extension/issues/5058) |
| Opened | 2026-08-13 by `tunghp2002` |
| State | **CLOSED 2026-08-25** — see below; the PR is still open |
| Labels | none |
| Assignees | none |
| Milestone | none |
| Body | **empty** |

**The issue has a title and nothing else.** No description, no acceptance criteria, no design link,
no priority signal. Everything below the title is inference from the title alone, and is marked as
such.

## Why EPIC-5 owns it

[EPIC-5](../epics/EPIC-5.md) publishes the **master-password / lock policy that every other feature
consumes to gate a secret** — FR-53 (the password wrapping every key at rest), FR-55 (unified
unlock / auto-lock) and FR-58 (per-action vs per-session unlock). A biometric or passkey login is a
new *unlock method* plugging into that gate, so it extends EPIC-5's policy rather than EPIC-3's key
handling — EPIC-3 *consumes* the gate, it does not define it.

## Resync 2026-08-25 — the code answered question 1

**The issue body is still empty**, but [PR #5061](https://github.com/Koniverse/SubWallet-Extension/pull/5061)
now exists and the code settles what the issue never stated.

| | |
| --- | --- |
| PR | [#5061](https://github.com/Koniverse/SubWallet-Extension/pull/5061) — **open**, not draft, 0 reviews |
| Branch | `koni/dev/issue-5058` → `subwallet-dev` |
| Opened | 2026-08-20 by `tunghp2002` |
| Size | **6 commits**, **+1317 / −54** |
| Tests | **2 spec files** — `passkeyUnlock.spec.ts` in `extension-base` (69 lines) and `extension-koni-ui` (85 lines) |

### It wraps the master password — it does not replace it

Read from the branch rather than inferred from file names:

```
wrapWalletPassword (password: string, encodedSecret: string)
  → crypto.subtle.encrypt({ AES-GCM }, key, plaintext = password)
```

`enrollPasskeyUnlock({ credentialId, password, prfInput, unlockSecret })` stores the resulting
`{ciphertext, nonce, credential, input}`; `rotatePasskeyUnlockSecret()` re-wraps it. The secret is
imported via `crypto.subtle.importKey('raw', …)` from the passkey **PRF extension** output.

So the master password stays the root of custody and the passkey is a *convenience layer over
FR-55* — the answer this story listed as load-bearing, because the alternative (passkey replaces
the password) would have reopened EPIC-5's **non-recoverable-by-design** decision. **It does not.**

### Update, later on 2026-08-25 — a fourth commit extends this to dApps

A commit landed after this story was first written: `4b7698b5b4` — *"Update UI passkey for dApp"*.
The PR is now **4 commits / +1180 / −49** (was 3 / +1035), and the UI spec file grew from 46 to
**85 lines**. Still **0 reviews**.

**This widens the blast radius.** Passkey unlock now reaches the dApp-facing confirmation surface,
which is the surface [US-5.15](US-5.15-signing-prompt-mode-confusion.md) hardened after #5042 — a
signature may only be produced over the artefact the prompt displayed. A new unlock path in front of
that flow deserves the same scrutiny; **AC-7 below does not cover it**, because it was written
before this commit existed.

*(Correction: this story first recorded the PR as spanning "20 files". It was 18 then and is 18
now — the count was wrong, the file list it was drawn from was not.)*

### Update 2026-08-25 (evening) — QC passed, issue closed, PR still open

Three things moved after the section above was written, and they do not all point the same way.

| | |
| --- | --- |
| PR #5061 | **6 commits**, +1317 / −54, **still 0 reviews**, **still open** |
| New commits | `0b7b248cfb` *Fix bug UI in newest chrome version*, `cab8ebd5ee` *Chore: update UI* (both 08-25) |
| QC | **[US-42.20](US-42.20-qc-issue-5058-biometric-passkey-login.md) — 14/14 AC**, run against `cab8ebd5ee`, fresh install + upgrade from v1.3.88 |
| Issue #5058 | **closed 2026-08-25 by `MaiThuongNinni`** |

**The issue was closed by hand, not by a merge.** The timeline records a plain `closed` event with no
commit attached, and PR #5061 is still open and unmerged. So `dev` does not contain this feature,
and nothing has shipped — `status` stays **`review`**, `version_shipped` and `commit` stay empty
([D106](../../CONTEXT.md)). A closed issue is not a merged branch
([LESSONS §69](../../LESSONS.md) — a state an API hands you is a claim, not a fact).

**The two risks this story flagged were both checked, and both held.** Recording it because they
were called out here before QC ran, so the answer belongs next to the question:

| Flagged here | Answered by US-42.20 |
| --- | --- |
| **AC-3** — master password must still work with no passkey enrolled | **AC-9 / AC-10 / AC-11** — holds with a passkey enrolled, on a browser without WebAuthn PRF, and after the passkey is removed. Nobody is locked out |
| **AC-8** — the dApp surface US-5.15 hardened must not weaken | **AC-12 / AC-12b** — the signature is produced over exactly what the prompt displayed; the #5042 rule still holds |

**One caveat carries forward, and US-42.20 states it too:** that 14/14 is a claim about `cab8ebd5ee`,
not about whatever eventually merges. Two of the six commits landed on the day of the QC run, so if
more land before merge the passkey paths need a re-run against the merged head.

### Shipped 2026-08-28 — v1.3.89

> **✅ done.** PR [#5061](https://github.com/Koniverse/SubWallet-Extension/pull/5061) merged
> **2026-08-27** (`82e1a09927`) and went out in **v1.3.89** on 2026-08-28, alongside
> [US-13.19](US-13.19-repoint-kah-pah-usdt-xcm-refs.md) (#5062). Those two are the whole release.

Lineage checked, not assumed: `git merge-base --is-ancestor 82e1a09927 b9363157d0` passes and
`git tag --contains 82e1a09927` returns exactly `v1.3.89`.

`commit:` names `f9a1bc49f1` — *Init passkey unlock*, the commit that made the capability true — and
`82e1a09927`, the merge that made it true in the product ([D106](../../CONTEXT.md)).

**The manual close was ahead of the merge, not instead of it.** [§J of 2026-08-25](../../notes/2026-08-25.md)
recorded #5058 closed by hand on 08-25 with the PR still open, and flagged that a closed issue is not
a merged branch. That reading was correct at the time and the gap closed two days later on its own —
the issue was simply closed early. Worth keeping as a record of *why* the story was not marked `done`
then: on 08-25 nothing in any shipping branch contained the feature.

**A new FR is warranted and is not invented here.** Passkey unlock adds a capability FR-55 (unified
unlock / auto-lock) does not cover. `prd_ref` stays `[]` because PRD FR markers track shipped
capability and the FR does not exist yet; writing one into this story would put a requirement into
the map by the back door. Raised in [notes/2026-09-03.md](../../notes/2026-09-03.md) as a decision
for whoever owns the PRD.

### Where it plugs in

| Layer | File |
| --- | --- |
| Crypto / storage | `extension-base/.../keyring-service/passkeyUnlock.ts` (170 lines) |
| Background handler | `koni/background/handlers/Extension.ts` (+78) |
| Types | `background/KoniTypes.ts` (+24) |
| Unlock UI | `Popup/Keyring/Login.tsx`, `components/Modal/UnlockModal.tsx`, `hooks/common/useUILock.tsx` |
| Enrolment UI | `Popup/Settings/Security/index.tsx` (+159 / −30) |
| i18n | 5 locales — en, ja, ru, vi, zh |

Enrolment living in **Settings → Security** is consistent with it being an opt-in unlock method
layered on the existing gate rather than a replacement for it.

## Acceptance criteria

Derived from the **code**, not from the issue — the issue still has no body, so these describe what
was built and are refutable against the branch:

- [x] **AC-1** — The master password is never stored in plaintext: `wrapWalletPassword()` AES-GCM
  encrypts it and only `{ciphertext, nonce}` is persisted.
- [x] **AC-2** — The wrapping key derives from the passkey PRF output, not from anything the page
  or a dApp can supply.
- [x] **AC-3** — The master password still unlocks the wallet when no passkey is enrolled, or when
  the authenticator is unavailable — passkey unlock is additive, never the only path.
- [x] **AC-4** — Enrolling requires the current master password (so enrolment cannot be done by
  someone who has the device but not the password).
- [x] **AC-5** — `rotatePasskeyUnlockSecret()` re-wraps without changing the master password, and
  the old ciphertext stops working.
- [x] **AC-6** — Removing the passkey in Settings → Security clears the stored record.
- [x] **AC-7** — Behaviour under FR-58 (per-action vs per-session unlock) is defined and unchanged
  for users who do not enrol.
- [x] **AC-8** — On the dApp confirmation surface (`4b7698b5b4`), a passkey unlock still produces a
  signature only over the artefact the prompt displayed — the [US-5.15](US-5.15-signing-prompt-mode-confusion.md)
  guarantee is not weakened by the new unlock path.

> **Ticked 2026-09-03, on QC evidence — not on a repository check.**
> [US-42.20](US-42.20-qc-issue-5058-biometric-passkey-login.md) passed **14/14** against commit
> `cab8ebd5ee`, fresh install and upgrade from v1.3.88, and PR #5061 merged unchanged from that head.
> If that page is wrong, these ticks are wrong with it ([D107](../../CONTEXT.md)).
>
> **The three flagged as dangerous all held.** AC-3 (fallback) → their AC-9/10/11: unlock still works
> with a passkey enrolled, on a browser with no WebAuthn PRF, and after the passkey is removed —
> nobody is locked out. AC-8 (dApp surface) → their AC-12/12b: the signature is produced over exactly
> what the prompt displayed, so the US-5.15 guarantee from #5042 is intact.
>
> **AC-7 is the weakest tick here.** FR-58's per-action vs per-session axis was never called out
> separately in the QC run; it is covered only insofar as the 14 ACs exercised unlock generally.
> Flagged rather than quietly counted as equal to the others.

## Still open after the code

- **Question 2 (platform API)** — answered in part: it uses WebAuthn PRF. Browser coverage for the
  PRF extension is narrower than for passkeys generally, and this is a cross-browser product;
  which browsers are supported is not stated anywhere.
- **Question 3 (fallback)** — AC-3 above. The code path exists; whether it is *tested* is the
  question, and the two spec files are the place to check.
- **Question 4 (FR-58 interaction)** — untouched by the PR description.
- **Question 5 (Mobile parity)** — still unaddressed.
- **`prd_ref` stays `[]`** — nothing has shipped, and PRD FR markers track shipped state. A new FR
  under EPIC-5 is warranted **when this merges**, since it adds a capability FR-55 does not cover.

## Open questions — these block scoping, not implementation

Each of these changes what gets built, and none is answerable from the issue:

1. **Unlock, or key custody?** Does biometry *unlock a password already held* (a convenience layer
   over FR-55, keys still wrapped by the master password), or does it *replace* the master password
   as the thing wrapping the key? These are different products with different threat models. EPIC-5
   records the master password as **non-recoverable by design** with no server-side custody — a
   passkey that replaces it, rather than gating it, reopens that decision.
2. **Which platform API?** WebAuthn/passkeys in an extension context, or the host OS biometric API?
   Extension support differs per browser and this is a cross-browser product.
3. **What is the fallback?** If biometry is unavailable, revoked, or the device changes, the master
   password has to still work — otherwise this becomes a way to lose a wallet.
4. **Does it interact with FR-58?** Per-action vs per-session unlock is an existing user setting.
   Biometric unlock either respects that axis or collapses it.
5. **Mobile parity?** SubWallet-Mobile already ships device biometrics. Whether this is "match
   Mobile" or "a new Extension-only design" is not stated.

## Things to check

**None written.** Acceptance criteria on this story would be invented, not derived — the issue
carries no requirement to derive them from. They get written when question 1 above is answered,
because the answer decides what the ACs are even about.

## Next step

Scope the issue on the tracker — a body, a decision on question 1, and a priority. Until then this
story stays `backlog` with no sprint, and `prd_ref: []`: no FR is claimed because nothing shipped,
and PRD FR markers track shipped state.

## Cross-references

- [Issue #5058](https://github.com/Koniverse/SubWallet-Extension/issues/5058)
- [US-5.4](US-5.4-unified-unlock-and-auto-lock-flow.md) — the unified unlock flow this would extend
- [US-5.6](US-5.6-auto-lock-timer-and-unlock-type.md) — auto-lock timer and unlock type (FR-58)
- [US-5.2](US-5.2-master-password-and-strength-policy.md) — the master-password gate itself
- Epic: [EPIC-5](../epics/EPIC-5.md)
