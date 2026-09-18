---
id: US-5.17
title: "Offer passkey unlock once, right after a password unlock"
epic: EPIC-5
status: done
priority: P3
points: 3
sprint: sprint-2026-W38
version_shipped: 1.3.90
prd_ref: []
assignee: tunghp2002
commit: 89e3c05e17
created: 2026-09-17
updated: 2026-09-17
---

> **No issue.** This story is written from one commit, `89e3c05e17` *"feat: add passkey unlock setup
> modal"* (2026-09-15), which rode in [PR #5076](https://github.com/Koniverse/SubWallet-Extension/pull/5076)
> — the VRF-signing PR for #5072 — and merged with it on 2026-09-17. It was flagged in
> [US-10.21](US-10.21-sr25519-vrf-signing-dapp-key-derivation.md) as a US-5.16 follow-up with no
> issue and no story; once merged, the only remaining option under [rule 9](../../../AGENTS.md) was
> to give it one. Nothing here was stated as a requirement by anyone; it is all read out of the diff.

## Goal

After a user unlocks with their password, and only when a passkey could be set up, offer to enable
passkey unlock **once** — right there, without a trip to Settings — using the password they just
typed so they are not asked for it again.

## Background

[US-5.16](US-5.16-biometric-passkey-login.md) shipped passkey unlock in 1.3.89 as an opt-in under
Settings. Enrollment needs the master password (it *wraps* it, AES-GCM under a WebAuthn-PRF key),
so a user who wants biometrics types the password once to unlock and again to enroll. This commit
moves the offer to the moment the password is already in hand.

## What the commit does

| Piece | File | Behaviour |
| --- | --- | --- |
| The offer | `components/Modal/PasskeyUnlockSetupModal.tsx` (+151) | Modal with *Enable* / *Not now*; `Enable` runs `registerPasskeyCredential()` → `passkeyUnlockEnroll({...credential, password})`; on a failed enroll it calls `forgetPasskeyCredential()` and shows `setupFailed` |
| When it is offered | `Popup/Keyring/Login.tsx` (+83/−16) | `canOfferPasskeySetup` = passkey unlock **supported** ∧ context **loaded** ∧ **not already enrolled** ∧ **not previously prompted** ∧ **not side-panel mode** |
| Once only | `constants/localStorage.ts` — `PASSKEY_UNLOCK_SETUP_PROMPTED` | Set `true` the first time the offer opens, whichever button is pressed |
| Holding the door | `hooks/common/useUILock.tsx` — new `keepLocked()` | Raised *before* `keyringUnlock` is sent, so the router does not leave the login screen the instant the keyring unlocks; released by either button |
| The password | `Login.tsx` — `passkeySetupPassword` ref | Held only while the offer is open; cleared on close |
| Popup survival | `background/handlers/Extension.ts` — `passkeyUnlockEnroll(request, port)` | If the sender is the action popup, `reopenActionPopup()` after enrollment — the browser's WebAuthn prompt closes the toolbar popup, same as the existing unlock path |
| Copy | 5 locale files, `ui.ACCOUNT.components.Modal.PasskeyUnlockSetup.*` | title, description, enable, notNow, setupFailed |

**Side-panel mode is excluded on purpose** — the side panel hands passkey prompts to a separate
window, so the offer waits for a surface that can host the prompt itself (comment in the source).

## Why EPIC-5 owns it

Same reason as US-5.16: it is an alternative-unlock path, and it touches how and when the master
password is used. The wrapping model is unchanged; this only changes *when* enrollment is offered.

## Acceptance criteria

Derived from the diff. **Not from an issue** — there is none. Ticked 2026-09-17 against `dev` at
`01dff40dea` ([D107](../../CONTEXT.md)); each names the line that holds it.

- [x] AC-2: The offer is shown **once per install** — `PASSKEY_UNLOCK_SETUP_PROMPTED` is set `true`
      the moment the modal opens, before either button (`Login.tsx`, `setPasskeySetupPrompted(true)`
      then `activeModal(...)`)
- [x] AC-5: No offer when a passkey is already enrolled, when the platform does not support it,
      when the context has not loaded, or in **side-panel** mode (`canOfferPasskeySetup`)
- [x] AC-6: On the action popup, `passkeyUnlockEnroll` calls `reopenActionPopup()` after
      enrollment when the sender is the popup (`Extension.ts`, `isActionPopupSender(port)`)
- [x] AC-7: The held password is cleared when the offer closes, either way
      (`closePasskeySetupOffer` → `passkeySetupPassword.current = ''`)
- [x] AC-8: The UI lock is raised **before** `keyringUnlock` is sent and released only when the
      offer closes (`keepLocked()` then `unlock()` in `closePasskeySetupOffer`) — so the router
      cannot leave the login screen while the offer is open

## Release-build checks

[US-42.25](US-42.25-qc-issue-5072-sr25519-vrf-signing.md) AC-9 — *"the passkey unlock setup modal
that rides in this PR behaves: it appears after login, Enable turns passkey unlock on, Not now
dismisses it"* — ran 2026-09-17 on the PR build and passed. The tester found this commit in the
PR and tested it before it had a story.

- [x] AC-1: On a password unlock where passkeys are supported and none is enrolled, the offer modal
      appears **before** the wallet opens — US-42.25 AC-9 (*appears after login*)
- [x] AC-3: *Enable* completes enrollment and the wallet opens with passkey unlock on — US-42.25
      AC-9 (*Enable turns passkey unlock on*); that it does so **without re-asking the password** is
      the code path (`passkeySetupPassword` ref), not something the QC line states
- [ ] AC-4: If the browser prompt is cancelled or enrollment fails, the credential is forgotten,
      `setupFailed` is shown, and the wallet still opens on dismiss — **not run**; the failure path
      is in no QC story

## Not covered yet

- **No test.** Nothing covers the `canOfferPasskeySetup` gate or the enroll-fail cleanup.
- **The once-only flag is per-browser-profile localStorage**, not per wallet — a reset wallet on the
  same profile will not be offered again. Whether that is intended is not stated anywhere.
- **`prd_ref: []`** — same as US-5.16: FR-55 does not cover passkey unlock at all, and a new FR was
  recommended there and not written. This story inherits that gap.
- **Shipped in v1.3.90 the same day** (`1f9b2a4cb6`; `89e3c05e17` is an ancestor, `git tag
  --contains` returns exactly `v1.3.90`) — **and the release note does not list it.** The root
  CHANGELOG names #5072 and #5064; this rode in unnamed. `docs/CHANGELOG.md` names it.
- **AC-4 (enrollment failure path) unrun** — US-42.25 AC-9 covered the happy path and *Not now* only.

## Cross-references

- [US-5.16](US-5.16-biometric-passkey-login.md) — the feature this offers a shortcut into (#5058)
- [US-10.21](US-10.21-sr25519-vrf-signing-dapp-key-derivation.md) — the PR this rode in on
- [PR #5076](https://github.com/Koniverse/SubWallet-Extension/pull/5076)
- Epic: [EPIC-5](../epics/EPIC-5.md)
