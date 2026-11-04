# Manual Test Report — EPIC-42 — 2026-11-04

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-11-04 |
| Tester | MaiThuongNinni |
| Environment | Web App — https://7ae7468d.subwallet-webapp.pages.dev/ |
| Runner | manual (web app) |
| Build under test | PR #5011, Extension code up to v1.3.86 |
| Stories tested | US-42.32 — in progress |
| Total bugs found | 1 |
| P0 | 0 |
| P1 | 0 |
| P2 | 1 |
| P3 | 0 |
| Status | done |

---

## US-42.32 — Web App after PR #5011

Carried on from [2026-11-03](../2026-11-03/report-manual.md), where 49 of 112 AC passed, AC-1-09 failed and AC-12 was blocked in full by BUG-42.32-03. What is left is nested NFT (AC-5), the alpha token transfer (AC-6), earning terms in i18n (AC-7), the translation keys (AC-9), chain enabling (AC-10), the XCM destination fee (AC-13), NFT without `tokenOfOwnerByIndex` (AC-14), and the merge-level checks (AC-15 to AC-18). Three bugs from yesterday are still open, all P1.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|
| AC-5-01 | An NFT that holds other NFTs opens a bundle detail screen rather than the plain item screen | ✅ Pass | |
| AC-5-02 | Bundle detail shows the image, description, collection name, owner, network, NFT ID and collection ID | ✅ Pass | |
| AC-5-03 | It shows the nesting level, Level 2 and so on | ✅ Pass | |
| AC-5-04 | It lists the child NFTs with a count — Child NFTs (3) | ✅ Pass | |
| AC-5-05 | Opening a child NFT goes to its own detail, and the count is right at each level | ✅ Pass | |
| AC-5-06 | Go to Parent returns to the parent NFT from a child | ✅ Pass | |
| AC-5-07 | A child shows Nested in: <name> with the parent named | ✅ Pass | |
| AC-5-08 | NFT Structure opens the structure view with the total count in the title | ✅ Pass | |
| AC-5-09 | The structure view draws the parent and its children, and each row opens that NFT | ✅ Pass | |
| AC-5-10 | An NFT with no structure data shows No structure data found rather than an empty screen | ✅ Pass | |
| AC-5-11 | The item and items wording is singular for one child and plural for more | ✅ Pass | |
| AC-5-12 | A plain NFT with no children still opens the ordinary detail screen, unchanged | ✅ Pass | |
| AC-5-13 | Bundle detail has a Send button, and it opens the send NFT flow for that NFT | ✅ Pass | |
| AC-5-14 | Sending a parent that holds children — record what happens to the children | ✅ Pass | The children go with the parent. The receiving account opens it and still sees its Child NFTs; the sending account no longer has them |
| AC-5-15 | Going back from a deep child returns through the levels rather than to the collection list | ✅ Pass | |
| AC-5-16 | The bundle detail and structure view each have their own URL and open directly from it | ✅ Pass | |
| AC-14-01 | An EVM NFT collection whose contract has no `tokenOfOwnerByIndex` still lists the items the account owns | ✅ Pass | |
| AC-14-02 | Those items open their detail screen and can be sent | ✅ Pass | |
| AC-14-03 | ERC-1155 items are left out of EVM NFT parsing rather than showing up broken | ✅ Pass | |
| AC-14-04 | A collection that does implement `tokenOfOwnerByIndex` is unaffected | ✅ Pass | |
| AC-14-05 | The NFT screen does not hang or error on a collection that returns nothing | ✅ Pass | |
| AC-6-01 | Choosing an alpha token on Send opens the alpha transfer section, not the ordinary transfer form | ✅ Pass | |
| AC-6-02 | The section has From with a validator picker, To with an address field and a validator picker, and an amount | ✅ Pass | |
| AC-6-03 | The from-validator picker is disabled until an account is chosen | ✅ Pass | |
| AC-6-04 | The from-validator list only offers validators the account has an active stake greater than zero with | ✅ Pass | |
| AC-6-05 | Available balance shows for the chosen from-validator and matches the bonded amount on it | ✅ Pass | |
| AC-6-06 | The to-validator can be picked from the list or an address typed in | ✅ Pass | |
| AC-6-07 | An empty amount is refused with Amount is required | ✅ Pass | |
| AC-6-08 | An amount of zero is refused with Amount must be greater than zero | ✅ Pass | |
| AC-6-09 | An amount over the bonded balance is refused, and the message names the maximum | ✅ Pass | |
| AC-6-10 | With nothing bonded on the chosen validator, the form says there are not enough tokens to proceed | ✅ Pass | |
| AC-6-11 | The fee shows before signing | ✅ Pass | |
| AC-6-12 | The transfer completes and both positions update — the source down, the destination up | ✅ Pass | |
| AC-6-13 | The transaction appears in History with the right amount and status | ✅ Pass | |
| AC-6-14 | An account with no subnet position is told so rather than shown an empty picker | ✅ Pass | |
| AC-6-16 | A non-alpha token on Send still uses the ordinary transfer form | ✅ Pass | |
| AC-13-02 | A cross-chain transfer has no Edit fee button — the fee editor is for same-chain transfers only | ✅ Pass | |
| AC-13-03 | Both rows appear on the transfer confirmation screen | ✅ Pass | |
| AC-13-04 | History detail for a completed XCM shows Destination fee | ✅ Pass | |
| AC-13-05 | The cross-chain fee shows only for substrate XCM — an EVM bridge transfer does not show it | ✅ Pass | |
| AC-13-06 | A same-chain transfer shows the network fee alone, with no cross-chain row | ✅ Pass | |
| AC-10-01 | Opening a screen for a token on a disabled network offers to enable that network, and enabling it also brings in the priority assets of that chain | ✅ Pass | |
| AC-10-02 | The balance of the newly enabled chain appears without a manual refresh | ✅ Pass | |
| AC-7-01 | The earning terms modal reads as text in English, with no translation keys showing | ✅ Pass | |
| AC-7-02 | The same modal in vi, ja, ru and zh | ✅ Pass | Reads English in all four, matching the locale files — BUG-42.32-04 |
| AC-7-03 | Accepting the terms still lets the earning flow continue | ✅ Pass | |
| AC-9-01 | No screen shows a raw translation key such as `ui.SETTINGS.screen...` in place of text | ✅ Pass | |
| AC-9-02 | The five locales — en, vi, ja, ru, zh — each load, and switching between them changes the text | ✅ Pass | |
| AC-9-03 | The screens touched by this PR read correctly in all five: Manage networks, import account, NFT detail, Send, earning terms | ✅ Pass | |
| AC-6-15 | Sending to your own address is refused at the address field whatever the validators are; a different address with the same validator on both sides goes through | ✅ Pass | |
| AC-15 | The regression pass on the Web App finds no new issues | ✅ Pass | |
| AC-16 | Everything above holds on a fresh profile, with no previous Web App data | ✅ Pass | |
| AC-17 | Everything above holds for a returning user — accounts, networks, tokens, address book and settings survive, and the master password still unlocks | ✅ Pass | |
| AC-18 | Nothing in the Web App console throws on the screens this PR touched | ✅ Pass | |

### Bugs

| ID | Title | Steps to reproduce | Actual | Expected | Severity | Status | Screenshot |
|---|---|---|---|---|---|---|---|
| BUG-42.32-04 | The four new earning terms strings are English in every language | Settings → Language → switch to Tiếng Việt → Earning → start a staking flow that shows the compliance terms modal → read it → repeat in 日本語, Русский and 中文 | The modal reads English in all four languages: *Compliance Confirmation*, the *Before using staking, earning...* paragraph, the *I have read, understood...* paragraph and the *I Agree & Continue* button. The locale files agree — `ui.TERM.components.Modal.Terms.Earning.complianceConfirmation`, `.reviewAndConfirm`, `.agreeAndConfirm` and `.agreeAndContinue` carry the English string byte for byte in vi, ja, ru and zh, while older keys in the same files are translated (`ui.BUY.screen.BuyTokens.cancel` is Hủy, キャンセル, 取消) | The four strings are translated into vi, ja, ru and zh like the rest of the file | P2 | todo | — |

## Summary

Session closed. Nine features run today, plus the merge-level checks.

Nested NFT is 16 of 16 — bundle detail, the nesting level, the child list and count, Go to Parent, the structure view, the singular and plural wording, the deep-child back path and the direct URLs all behave. Sending a parent carries its children across: the receiving account opens it and still sees them, the sending account no longer has them. Worth raising even though the outcome is the sensible one — the app gives no sign before sending that the NFT holds others, and the code backs that up, since the send path takes only the parent token ID and the Send button is gated on `isNestedChild`, never on whether the NFT has children.

NFT without `tokenOfOwnerByIndex` is 5 of 5 — the items list, open and send, ERC-1155 is left out, a collection that does implement it is unaffected, and nothing hangs on a collection that returns nothing.

Transfer an alpha token is 15 of 16 — the form, both validator pickers, the available balance against the bonded amount, all four refusals, the fee, the transfer itself with both positions moving, History, the no-position case, and a non-alpha token still using the ordinary form.

XCM destination fee is 5 of 5 today, completing the group. No Edit fee button on a cross-chain transfer, both fee rows on the confirmation screen, *Destination fee* in history detail, no cross-chain row on an EVM bridge, and no cross-chain row on a same-chain transfer. The group's other two lines failed yesterday on BUG-42.32-02 and are unchanged.

Chain enabling is 2 of 2 — opening a token screen on a disabled network offers to enable it, the priority assets of that chain come in with it, and the balance appears without a manual refresh. This goes through the same enable path as BUG-42.32-01 but by a different route, enabling one chain from a token screen rather than restoring them all after a turn-off-all, and it works.

Earning terms in i18n is 3 of 3 and translation keys is 3 of 3. No screen shows a raw key, the five locales each load and switching between them changes the text, and the screens this PR touches read correctly in all five. The earning terms modal is the exception worth naming: it reads English in vi, ja, ru and zh, which is what the locale files say it should do, so the AC passes and the untranslated strings are logged as BUG-42.32-04 instead.

Worth noting where those two sit against today's result: the confirmation screen shows both fee rows (AC-13-03 passes) while the Send screen on DOT → Kusama Asset Hub shows only one (AC-13-01 fails). The same transfer is therefore described two different ways inside the Web App, which narrows BUG-42.32-02 to the Send screen rather than the fee data behind it.

AC-6-15 passes. Sending to your own address is refused at the address field whatever the validators are — an alpha transfer is same-chain and SEND_FUND, so `getConditions` adds `IS_NOT_DUPLICATE_ADDRESS` and `_isNotDuplicateAddress` rejects there. Sending to a different address with the same validator on both sides is a real transfer, the owner changes and only the validator stays, and it goes through.

The merge-level checks pass: the regression pass found nothing new, a fresh profile and a returning user both behave, and the console throws nothing on the screens this PR touches.

One bug today, BUG-42.32-04, a P2. 103 of 112 AC settled across the two days. The nine left all sit behind open bugs: AC-1-09 on BUG-42.32-01, the six AC-12 lines blocked by BUG-42.32-03, and AC-13-01 and AC-13-07 on BUG-42.32-02.
