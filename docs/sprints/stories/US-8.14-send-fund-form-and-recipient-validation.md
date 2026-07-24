---
id: US-8.14
title: "Send-fund form & recipient validation"
epic: EPIC-8
status: done
priority: P3
points: 3
sprint: sprint-2025-M10
version_shipped: 1.3.62
prd_ref: []
assignee:
commit:
created: 2026-07-24
updated: 2026-07-24
---

## Goal

The screen the user fills in before anything is signed: the recipient field and what it accepts, the
amount field and what it rejects, the balance shown beside them, and the state the form keeps when
the popup closes.

## Status

> **✅ done — all 17 rows below are settled**: 15 delivered, 2 closed without shipping. It carries
> **no FR** — FR-74 is owned by [US-8.1](US-8.1-send-native-and-fungible-tokens.md); this story holds
> the form in front of it.
>
> **`version_shipped: 1.3.62` is a representative anchor, not the whole set** — the most recent
> constituent with a provable release, the same convention
> [US-9.13](US-9.13-nft-media-and-ipfs-gateway-pipeline.md) uses. The table is the full record.
>
> The open half — four more address-validation rounds — is in
> [US-8.20](US-8.20-open-transaction-improvements.md) ([AGENTS.md](../../../AGENTS.md) rule 9).

## Scope

Folded in from the former one-issue-per-story maintenance ledger on 2026-07-24. Separated from
[US-8.1](US-8.1-send-native-and-fungible-tokens.md) because the failure modes do not overlap: a send
defect means the extrinsic is wrong, a form defect means the user cannot get to one — and the second
is chain-independent, which is why this story has no per-chain tail.

## Incremental work, fixes & chores

**17 tracker issues** — 9 with a release, 6 delivered with no line naming them, 2 closed without
shipping.

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 0.5.4 | [#271](https://github.com/Koniverse/SubWallet-Extension/issues/271) | Balance showing incorrect in Send Fund screen in case create/forget acc successfully | ✅ done |
| 1.0.9 | [#1509](https://github.com/Koniverse/SubWallet-Extension/issues/1509) | Update send-fund screen | ✅ done |
| 1.1.10 | [#1555](https://github.com/Koniverse/SubWallet-Extension/issues/1555) | Save entered transaction information when closing and reopening the extension | ✅ done |
| 1.1.13 | [#1872](https://github.com/Koniverse/SubWallet-Extension/issues/1872) | Allow paste Amount to send | ✅ done |
| 1.1.39 | [#2628](https://github.com/Koniverse/SubWallet-Extension/issues/2628) | Adjust showing/validating address on Send fund | ✅ done |
| 1.1.55 | [#2873](https://github.com/Koniverse/SubWallet-Extension/issues/2873) | Extension - Add warning message for cross chain transfer to an exchange (CEX) | ✅ done |
| 1.2.30 | [#3653](https://github.com/Koniverse/SubWallet-Extension/issues/3653) | Extension - Do not show balance when making transactions | ✅ done |
| 1.3.53 | [#4072](https://github.com/Koniverse/SubWallet-Extension/issues/4072) | Extension - Unable to detect domains name when transfer | ✅ done |
| 1.3.62 | [#4706](https://github.com/Koniverse/SubWallet-Extension/issues/4706) | Extension - Don't show toast message validate in case input amount < 1 when transfer Cardano | ✅ done |
| — | [#59](https://github.com/Koniverse/SubWallet-Extension/issues/59) | Check the Send Fund Full Balance screen | ✅ done |
| — | [#61](https://github.com/Koniverse/SubWallet-Extension/issues/61) | Duplicate account in Send Fund suggestions list when pasting address | ✅ done |
| — | [#67](https://github.com/Koniverse/SubWallet-Extension/issues/67) | Wrong Send Fund unit displayed when switching network | ✅ done |
| — | [#1197](https://github.com/Koniverse/SubWallet-Extension/issues/1197) | Add loading to free balance in send fund screen | ✅ done |
| — | [#1923](https://github.com/Koniverse/SubWallet-Extension/issues/1923) | Update entered address on the transaction confirmation | ✅ done |
| — | [#2156](https://github.com/Koniverse/SubWallet-Extension/issues/2156) | Handle error when get balance on transaction screen | ⏸ deprecated |
| — | [#2697](https://github.com/Koniverse/SubWallet-Extension/issues/2697) | WebApp - Adjust showing/validating address when transfer assets | ⏸ deprecated |
| — | [#4434](https://github.com/Koniverse/SubWallet-Extension/issues/4434) | Optimize Request Handling in SendFund Form | ✅ done |

> **Address validation has been re-opened four times and is still open.** #2628 adjusted showing and
> validating the address on Send fund; #2697 was the WebApp twin and closed without shipping; round 2
> ([#2648](https://github.com/Koniverse/SubWallet-Extension/issues/2648)) and a general validation
> ask ([#4093](https://github.com/Koniverse/SubWallet-Extension/issues/4093)) are still `In Backlog`
> in [US-8.20](US-8.20-open-transaction-improvements.md). A recipient field that must accept five
> address formats and reject the wrong chain's is the hardest input in the wallet.
>
> **#4434 was owned by no story until this fold.** *"Optimize request handling in the SendFund
> form"* is a child of the swap epic's Bitcoin umbrella
> [#4096](https://github.com/Koniverse/SubWallet-Extension/issues/4096), and when EPIC-11 folded on
> 2026-07-23 it was flagged as transaction work belonging here
> ([note](../../notes/2026-07-23.md#b-epic-31-maintenance--swap-merged-into-epic-11)). It is a row
> now.
>
> **#4072 is the form learning that a recipient can be a name.** *"Unable to detect domain names when
> transferring"* (1.3.53) — the field stopped being an address field.

## Acceptance criteria

- [x] **AC-1** — All 17 issues above are closed on the tracker, each carrying the release the evidence supports or `—` where none exists, and each `⏸ deprecated` row is closed `NOT_PLANNED`/`DUPLICATE` **or** carries board `Status = Cancel`.

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | `gh issue view <N>` for each row → CLOSED · board `Status` per [rule 12](../../../AGENTS.md) · `grep -n "(#<N>)" docs/CHANGELOG.md` for each released row |

## Cross-references

- [Epic EPIC-8](../epics/EPIC-8.md) · [US-8.1](US-8.1-send-native-and-fungible-tokens.md) · [US-8.15](US-8.15-transfer-max-and-available-balance.md) · [US-8.20](US-8.20-open-transaction-improvements.md) · [consolidation note](../../notes/2026-07-24.md#a-epic-28-maintenance--transactions-merged-into-epic-8)
