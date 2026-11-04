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
| Total bugs found | 0 |
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| P3 | 0 |
| Status | in progress |

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
| AC-5-14 | Sending a parent that holds children — record what happens to the children | — | Not run — this line records behaviour, it has no pass condition |
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
| AC-6-15 | Choosing the same validator on both sides — record what the app does | — | Not run — this line records behaviour, it has no pass condition |
| AC-6-16 | A non-alpha token on Send still uses the ordinary transfer form | ✅ Pass | |

### Bugs

None found today.

## Summary

Three features run today, all passing.

Nested NFT is 15 of 16 — bundle detail, the nesting level, the child list and count, Go to Parent, the structure view, the singular and plural wording, the deep-child back path and the direct URLs all behave.

NFT without `tokenOfOwnerByIndex` is 5 of 5 — the items list, open and send, ERC-1155 is left out, a collection that does implement it is unaffected, and nothing hangs on a collection that returns nothing.

Transfer an alpha token is 15 of 16 — the form, both validator pickers, the available balance against the bonded amount, all four refusals, the fee, the transfer itself with both positions moving, History, the no-position case, and a non-alpha token still using the ordinary form.

Two lines are left open because they record behaviour rather than pass or fail: AC-5-14, what happens to the children when a parent NFT is sent, and AC-6-15, what the app does when the same validator is chosen on both sides of an alpha transfer. Neither rule is stated in the PR, so both need observing and writing down.

No bugs today. 84 of 112 AC settled across the two days.
