---
id: US-5.16
title: "Biometric / passkey login for the extension"
epic: EPIC-5
status: backlog
priority: P3
points: 1
sprint:
version_shipped:
prd_ref: []
assignee:
commit:
created: 2026-08-18
updated: 2026-08-18
---

## Goal

Give [#5058](https://github.com/Koniverse/SubWallet-Extension/issues/5058) — *"Support
biometric/passkey login for extension"* — a home in the docs, so the tracker issue is covered
([D108](../../CONTEXT.md)) rather than sitting outside the story layer.

**This story is a placeholder, not a specification.** It records what is known, which is very
little, and names what has to be decided before it can be built.

## Background

| | |
| --- | --- |
| Issue | [#5058](https://github.com/Koniverse/SubWallet-Extension/issues/5058) |
| Opened | 2026-08-13 by `tunghp2002` |
| State | OPEN |
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
