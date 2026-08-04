# Security recheck — Substrate signing prompt can misrepresent an extrinsic

Date: 2026-08-04

## Trigger

Polkadot published a postmortem on 2026-07-31: [“Update polkadot{.js} extension to 0.64.0: signing prompts could hide the real transaction”](https://forum.polkadot.network/t/update-polkadot-js-extension-to-0-64-0-signing-prompts-could-hide-the-real-transaction/18291).

The reported defect allowed a site to submit a request through the extrinsic-signing channel while shaping its payload so that the signing prompt rendered it as an inert off-chain message. The signature was over the extrinsic, not the displayed message. The post says upstream polkadot{.js} extension versions before 0.64.0 were affected and that the maintainers are not aware of exploitation.

## Preliminary assessment for SubWallet Mobile

Status: **high-priority recheck required; impact is plausible but not yet reproduced in the mobile application.**

The installed `@subwallet/extension-base` version is `1.3.83-0`. Its request path has the same separation of signing behaviour and UI rendering described in the report:

1. The background router chooses the signing behaviour from the incoming channel:
   - `pub(bytes.sign)` creates `RequestBytesSign`.
   - `pub(extrinsic.sign)` creates `RequestExtrinsicSign`.
2. `RequestSign` exposes only `payload` plus `sign(...)`; it has no channel/discriminant when it reaches the signing-request subscription consumed by the mobile UI.
3. Mobile classifies a request as raw/message with `isRawPayload`, which returns true whenever `payload.data` is truthy.
4. That payload-derived classification controls both the confirmation content and the signing UI. A request classified as raw is rendered as a message rather than an extrinsic with decoded call data.

Relevant mobile call sites:

- `src/utils/confirmation/request/substrate.ts`
- `src/screens/Confirmations/index.tsx`
- `src/screens/Confirmations/variants/SignConfirmation/index.tsx`
- `src/screens/Confirmations/parts/Sign/Substrate.tsx`
- `src/hooks/transaction/confirmation/useParseSubstrateRequestPayload.ts`

This is materially similar to the reported failure mode: the background has authoritative knowledge of whether the request arrived as an extrinsic or raw bytes, while the prompt infers that distinction from attacker-controlled payload shape.

## Potential wallet impact

If an external site can provide a `SignerPayloadJSON` for `pub(extrinsic.sign)` containing a truthy `data` field, the app may display a message-signing confirmation while the background signs an extrinsic payload. A user who accepts the prompt could therefore authorize whatever one signed extrinsic can do for the selected account, including an asset-moving or permission-changing call allowed by that account and chain.

The preconditions described by the upstream report are relevant here: the user must visit a malicious or compromised connected site and approve a prompt. Connecting a site alone exposes addresses but is not sufficient to create the signature.

## Scope requiring verification

- Reproduce with a controlled dApp sending an extrinsic-channel payload that includes `data`, and verify both the UI shown and the bytes ultimately signed.
- Confirm whether validation or transport serialization removes/rejects this extra field before the request reaches `RequestExtrinsicSign`.
- Test external browser dApp requests, WalletConnect requests, and internal transaction requests separately.
- Test password, QR, Ledger, and other hardware-account signing paths, since they share parts of the same payload parsing/rendering flow.
- Verify Android and iOS behaviour independently.
- Review every use of `isRawPayload` and any other payload-shape-based message/transaction classification.
- Compare the mobile dependency/version lineage with the upstream 0.64.0 fix; version numbers are not directly comparable across the two projects.
- Confirm whether the current `Unknown signed extensions` console warning is only a decoding/metadata compatibility warning or changes any confirmation data shown to the user. It is not evidence by itself of this issue.

## Deliberately not covered in this note

No remediation design, implementation proposal, release decision, or user communication is included yet. Those should follow only after the reproduction and scope checks above.
