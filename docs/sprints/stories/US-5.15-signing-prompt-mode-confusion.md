---
id: US-5.15
title: "Signing-prompt mode confusion — a dApp must not render an extrinsic as an inert message"
epic: EPIC-5
status: done
priority: P0
points: 2
sprint: sprint-2026-W32
version_shipped: 1.3.85
prd_ref: [NFR-24]
arch_ref: [AD-03]
depends_on: []
assignee: tunghp2002
commit: 5bf7a3b74f
created: 2026-08-10
updated: 2026-08-10
---

## Goal

Make it impossible for a dApp to obtain a signature over an extrinsic while the confirmation
prompt shows the user something else. A request that arrives on the extrinsic-signing channel
carrying a raw-message payload is a contradiction: it must be refused at the signing boundary and
named to the user, not rendered as a message the user can approve.

## Background

Polkadot published a postmortem on 2026-07-31 — *["Update polkadot{.js} extension to 0.64.0:
signing prompts could hide the real transaction"](https://forum.polkadot.network/t/update-polkadot-js-extension-to-0-64-0-signing-prompts-could-hide-the-real-transaction/18291)*.
A site could submit through the extrinsic channel (`signer.signPayload`) while shaping the payload
so the prompt rendered it as an inert off-chain message. The user approved a *message*; the
signature was over an *extrinsic*. Tracked here as
[#5042](https://github.com/Koniverse/SubWallet-Extension/issues/5042); the trigger and the
tracker snapshot are recorded in [notes/2026-08-04.md §A](../../notes/2026-08-04.md).

`RequestExtrinsicSign` took a `SignerPayloadJSON` on faith. `SignerPayloadRaw` (a message) is
structurally distinguishable — it carries a `data` field that an extrinsic payload never has —
but nothing checked, so the discriminator that separates *"sign this transaction"* from
*"sign this text"* was the channel alone, and the channel was attacker-chosen.

### Why this is a new story and not a row in an existing one

- **[US-5.10](US-5.10-verichains-audit-remediation-hardening.md)** is the EPIC-5 remediation
  cluster, but its table is *"the findings its acceptance criteria name, one for one"* — five
  rows, five ACs, an invariant that story spent a revision establishing. No AC names #5042.
- **[US-8.13](US-8.13-payload-decode-error-handling.md)** touches the same hook but is a
  different defect: a payload that *fails to decode*. This one decodes fine. It is the wrong
  **kind** of payload, which is a security property, not a reliability one.

## Acceptance criteria

- [x] **AC-1** — **Given** an extrinsic-signing request whose payload carries a `data` field
  (i.e. a `SignerPayloadRaw` on the extrinsic channel), **When** `RequestExtrinsicSign.sign()` is
  called, **Then** it throws and **no signature is produced**. *(`assert(!this.isRawDataInExtrinsic, …)`
  is the first statement in `sign()`, before `createType`/`.sign(pair)` — so the refusal cannot be
  reached around.)*
- [x] **AC-2** — **Given** the same request, **When** the confirmation screen parses it, **Then**
  the screen resolves to an **error state**, not a signable prompt. *(`useParseSubstrateRequestPayload`
  returns `{ payload: '', payloadError: { type: RawDataInExtrinsic } }` in a branch taken **before**
  the payload is read.)*
- [x] **AC-3** — **Given** that error state, **When** it is rendered, **Then** the user is told
  what happened and what to do, in a message distinct from the generic decode failure.
  *(`Substrate.tsx` selects `dappSentRawDataInExtrinsicRequest` — "This dApp sent a raw message
  through a transaction-signing request. No signature can be created. Reject this request and
  contact the dApp." — vs `unableToDecode` for `SubstratePayloadErrorType.Decode`.)*
- [x] **AC-4** — **Given** the two failure modes are now distinct, **When** either occurs, **Then**
  they are distinguishable in code by a type, not by string matching. *(`enum SubstratePayloadErrorType
  { Decode, RawDataInExtrinsic }`; `payloadError` widened from `string | null` to
  `PayloadError | null`.)*
- [x] **AC-5** — **Given** the fix, **When** the unit suite runs, **Then** a regression test asserts
  both halves of AC-1. *(`RequestExtrinsicSign.spec.ts` — "queues a raw payload for the UI but never
  signs it": asserts `isRawDataInExtrinsic === true` **and** that `sign()` throws.)*
- [x] **AC-6** — **Given** the user-facing string, **When** the extension is built for any shipped
  locale, **Then** the key resolves. *(Added to all five bundles: en, ja, ru, vi, zh.)*

## Tasks

- [x] Detect a raw-message payload on the extrinsic channel (`'data' in payload`) at construction
- [x] Refuse to sign it — `assert` at the top of `RequestExtrinsicSign.sign()`
- [x] Widen `RequestSign` with `isRawDataInExtrinsic` and add `SubstratePayloadErrorType`
- [x] Branch the confirmation hook to the new error type before reading the payload
- [x] Give the error its own user-facing string, distinct from the decode failure
- [x] Translate the string into ja / ru / vi / zh
- [x] Add `RequestExtrinsicSign.spec.ts` as the regression guard
- [x] Ship the same fix on the Web App (PR [#5044](https://github.com/Koniverse/SubWallet-Extension/pull/5044))

## Dev notes — References

- [Source: PRD NFR-24](../../PRD.md#non-functional-requirements) — *degrade, never blank*. This
  story is the **security** instance of that contract: the degraded state is not merely
  non-blank, it is *unsignable*. [US-8.13](US-8.13-payload-decode-error-handling.md) owns the
  reliability instance.
- [Source: ARCHITECTURE AD-03](../../ARCHITECTURE.md#architecture-decisions) — background / UI
  message-bus isolation. The fix lands in the **background** (`extension-base`), so the refusal
  holds even if the UI is bypassed; the UI change is presentation only.
- Extension: PR [#5043](https://github.com/Koniverse/SubWallet-Extension/pull/5043), commit
  `5bf7a3b74f`, shipped **v1.3.85** (`3a7e29e404`, 2026-08-05).
- Web App: PR [#5044](https://github.com/Koniverse/SubWallet-Extension/pull/5044), branch
  `koni/dev/issue-5042-webapp` — a separate version space
  ([D91](../../CONTEXT.md)), so it is **not** claimed by this story's `version_shipped`.
- QC: [US-42.11](US-42.11-qc-extension-pr5043-and-issue5045.md) (Extension),
  [US-42.12](US-42.12-qc-webapp-pr5043-signing-prompt-security.md) (Web App) — both `done`.
- Trigger and tracker snapshot: [notes/2026-08-04.md §A](../../notes/2026-08-04.md).
  Merge and release record: [notes/2026-08-10.md](../../notes/2026-08-10.md).

## Verification commands

Each command **fails loudly if the AC it backs is false** ([LESSONS §68](../../LESSONS.md) — a
ticked box must be refutable).

```bash
# AC-1 — the assert exists and is the first statement of sign()
grep -A2 'sign (registry' packages/extension-base/src/background/RequestExtrinsicSign.ts \
  | grep -q 'assert(!this.isRawDataInExtrinsic' && echo 'AC-1 guard present'

# AC-2 — the hook branches on the flag before reading request.payload
grep -q 'request.isRawDataInExtrinsic' \
  packages/extension-koni-ui/src/hooks/transaction/confirmation/useParseSubstrateRequestPayload.ts

# AC-3/AC-4 — the enum and the distinct string both exist
grep -q 'RawDataInExtrinsic' packages/extension-base/src/background/types.ts
grep -q 'dappSentRawDataInExtrinsicRequest' \
  packages/extension-koni-ui/src/Popup/Confirmations/parts/Sign/Substrate.tsx

# AC-5 — the regression test runs and passes
yarn jest packages/extension-base/src/background/RequestExtrinsicSign.spec.ts

# AC-6 — the key is present in all five shipped locales (expect: 5)
grep -l 'dappSentRawDataInExtrinsicRequest' \
  packages/extension-koni/public/locales/*/translation.json | wc -l
```

## Changelog entry

### Security

- Reject signing prompts that could conceal the actual transaction — an extrinsic request
  carrying a raw-message payload is refused at the signing boundary and named to the user
  (#5042, US-5.15)

## Open — the requirement this defends has no NFR

NFR-24 is the closest fit and this story is filed against it, but NFR-24 is a *reliability*
requirement ("degrade, never blank"). The property actually at stake is stronger and is
**not written down anywhere in the PRD**:

> *A signature is only ever produced over the artefact the confirmation prompt displayed.*

That is the invariant #5042 broke, and no FR or NFR asserts it — so nothing else in the docs
would catch a second instance of the same class (EVM `personal_sign` vs `eth_sendTransaction`,
Bitcoin PSBT vs message, Ledger blind-signing). Minting an NFR is a PRD decision, not a story
decision ([D98](../../CONTEXT.md) is the precedent for appending one after the fact), so it is
recorded here rather than taken. **Recommended: append it as a new NFR and list this story as
its first defender.**
