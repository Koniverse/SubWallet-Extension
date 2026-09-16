# Manual Test Report — EPIC-42 — 2026-09-16

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-09-16 |
| Tester | MaiThuongNinni |
| Environment | Mobile — Android + iOS |
| Runner | manual (mobile) |
| Build under test | to fill in — build number + web-runner version |
| Stories tested | US-42.24.7, US-42.24.13, US-42.24.19, US-42.24.20 |
| Total bugs found | 3 |
| P0 | 0 |
| P1 | 1 |
| P2 | 1 |
| P3 | 1 |
| Status | done |

---

## US-42.24.20 — Verify the bugs found during this update

Carried on from [2026-09-15](../2026-09-15/report-manual.md), which took the story from 4 verified to 28 with one closed no fix. The day started with thirty-eight bugs open, twenty-two of them the multisig batch from US-42.24.7, and ended with fifteen.

### Bugs rechecked

| Item | Found in | Severity | What it is | State |
|---|---|---|---|---|
| BUG-42.24.7-10 | US-42.24.7 | P2 | Swap was still offered on a multisig account | ✅ Fixed — swap is disabled |
| AC-14 | US-42.24.7 | — | Swap is disabled for a multisig account, both with and without XCM | ✅ Rerun, passes — BUG-42.24.7-10 now settled both ways |
| BUG-42.24.7-11 | US-42.24.7 | P2 | Liquid staking was still listed in Earning options on a multisig account (MANTA) | ✅ Fixed — the option is hidden |
| AC-15 | US-42.24.7 | — | Earning — nomination pool and direct nomination follow the transfer logic; liquid staking and subnet staking are hidden | ✅ Rerun, passes — BUG-42.24.7-11 now settled both ways |
| BUG-42.24.7-12 | US-42.24.7 | P2 | Notification settings had no Pending multisig approvals option | ✅ Fixed — the option is there |
| BUG-42.24.7-13 | US-42.24.7 | P2 | Multisig accounts had no multisig badge on their avatar | ✅ Fixed — the badge is shown |
| BUG-42.24.7-14 | US-42.24.7 | P2 | The Select account screen for a new multisig showed no account-type badges | ✅ Fixed — the badges are shown |
| BUG-42.24.7-15 | US-42.24.7 | P2 | The account filter on Export account had no Multisig account option | ✅ Fixed — the option is in the filter |
| BUG-42.24.7-17 | US-42.24.7 | P2 | The Multisig tab did not offer to enable a network that was turned off | ✅ Fixed — the popup asks to enable it |
| BUG-42.24.7-18 | US-42.24.7 | P2 | View transaction did not open the transaction details | ✅ Fixed — the details open |
| BUG-42.24.7-24 | US-42.24.7 | P3 | The insufficient balance warning on Add proxy confirmation was not styled like the Extension | ✅ Fixed — the warning matches, with its heading, icon and panel |
| BUG-42.24.7-19 | US-42.24.7 | P2 | The message refusing a cross-chain transfer from a multisig did not say why | ✅ Fixed — the toast reads "Cross-chain transfer is not supported for multisig account" |
| BUG-42.24.7-29 | US-42.24.7 | P2 | Approval required notifications stayed on the Notifications screen after the initiator had rejected the transaction, so the other signatories were still being asked to approve something that was already dead | ✅ Fixed — the notifications clear when the initiator rejects |
| BUG-42.24.7-20 | US-42.24.7 | P3 | The signatory validation message is shown as a large red block rather than a tooltip | ⏭️ Skipped — Mobile needs a different mechanism, so the developer is keeping the block as it is |
| BUG-42.24.7-21 | US-42.24.7 | P2 | The Multisig transaction detail sheet did not match the Extension | ✅ Fixed — the sheet matches |
| BUG-42.24.7-22 | US-42.24.7 | P1 | Select an account to sign sometimes did not finish loading on a multisig signature request, including when signing for a dApp | ✅ Fixed — the picker finishes loading |
| BUG-42.24.7-23 | US-42.24.7 | P2 | The Sender on a pending multisig transaction showed an address where the Recipient showed a name, and the two blocks sat out of line | ✅ Fixed — both sides read the same way and line up |
| BUG-42.24.7-25 | US-42.24.7 | P2 | Attaching a multisig address as a watch-only or QR account and then creating a new multisig with the same signatories and threshold showed a raw error key | ✅ Fixed — the case is handled with a readable message |
| BUG-42.24.7-26 | US-42.24.7 | P2 | Starting a second transaction with the same amount, sender, recipient and network while the first was still awaiting approval showed a raw error key — bg.TRANSACTION_SERVICE.services.service.transaction.existingMultisigPendingTransaction | ✅ Fixed — the case is handled with a readable message |
| BUG-42.24.7-27 | US-42.24.7 | P2 | "Unable to sign transaction" appeared before the signatory account had finished loading, when signing for a dApp through a multisig account | ✅ Fixed — the message waits for the signatory list |
| BUG-42.24.9-01 | US-42.24.9 | P1 | A subnet token could not be transferred — the form had no validator fields and no subnet name | ✅ Fixed — the form carries them and the transfer goes through |
| BUG-42.24.11-01 | US-42.24.11 | P2 | The Insufficient balance popup on Start earning used the Android system dialog rather than the app's own sheet | ✅ Fixed — the app's own sheet is shown |
| BUG-42.24.16-01 | US-42.24.16 | P2 | The unstake confirmation screen dropped the TAO unstaking fee notice, so nothing told the user that 0.01 TAO comes off what they get back | ✅ Fixed — the notice is shown |
| BUG-42.24.11-03 | US-42.24.11 | P3 | The alpha transfer Amount screen misaligned Available balance and dropped the fungible token notice | ✅ Fixed — Available balance lines up and the notice is shown, on both alpha and TAO |
| BUG-42.24.11-05 | US-42.24.11 | P2 | The swap confirmation screen showed a raw address line and "simple id: undefined" under the warning box | ✅ Fixed — both lines are gone |
| BUG-42.24.13-01 | US-42.24.13 | P3 | The Go to parent button on a nested NFT had no button styling, so it read as plain text | ✅ Fixed — the button has its own panel |
| BUG-42.24.13-02 | US-42.24.13 | P3 | The NFT details section carried an empty panel above it and a Resources or inventory row below the description, neither of which the Extension has | ✅ Fixed — both are gone |
| BUG-42.24.13-05 | US-42.24.13 | P3 | The info icon in the Description popup was stretched into a tall bar down the height of the text | ✅ Fixed — the icon keeps its own size |
| BUG-42.24.7-01 | US-42.24.7 | P2 | The multisig confirmation screens still used the old layout rather than the one the Extension has | ✅ Fixed — the screens use the new layout |
| AC-13 | US-42.24.7 | — | Cross-chain transfer is refused for a multisig account, with a message saying so | ✅ Rerun, passes — BUG-42.24.7-19 now settled both ways |
| AC-5b | US-42.24.9 | — | A subnet token shows its subnet ID and name on the transfer form, with its validator fields, and the transfer goes through | ✅ Rerun, passes — BUG-42.24.9-01 now settled both ways |

## US-42.24.7 — Multisig account phase 1

One bug found while rechecking the multisig batch.

### Bugs

| ID | Title | Steps to reproduce | Actual | Expected | Severity | Status | Screenshot |
|---|---|---|---|---|---|---|---|
| BUG-42.24.7-30 | The Call data row on the Signature request screen has no info button when signing for a dApp through a multisig account | Connect a multisig account to a dApp — polkadot.js.org, for instance → start a transaction there → on the Signature request screen, look at the Call data row | The row shows the shortened call data and nothing else. There is no way to see what the call actually contains. The Extension puts an info button at the end of that row, which opens the full call data | The info button is on the Call data row and opens the full call data, the way the Extension does it | P2 | todo | ![](img/BUG-42.24.7-30.png) |

## US-42.24.13 — Web-runner 1.3.80 on Mobile

One bug found while rechecking the NFT screens.

### Bugs

| ID | Title | Steps to reproduce | Actual | Expected | Severity | Status | Screenshot |
|---|---|---|---|---|---|---|---|
| BUG-42.24.13-06 | The cards on the NFT detail screen have no padding above or below them | NFTs → open a nested NFT → look at the gaps between the image, the name card, the collection card and the buttons | The cards sit tight against each other and against the image, with no breathing space between them. The Go to Parent button also fills almost the whole card it sits in | The cards carry the padding the design calls for, the way the Extension spaces them | P3 | todo | ![](img/BUG-42.24.13-06.png) |

## US-42.24.19 — Full wallet regression

### Bugs

| ID | Title | Steps to reproduce | Actual | Expected | Severity | Status | Screenshot |
|---|---|---|---|---|---|---|---|
| BUG-42.24.19-16 | The app crashes on the History screen after switching to the Multisig tab and back | Open History → tap the Multisig tab → tap History again | The app falls over to its own error screen: "Unknown error" in the title bar, then "Oops, an error occurred!" with Send report and Back to home. The History screen is gone and the only way on is back to home | History opens on the tab tapped, with no crash | P1 | todo | ![](img/BUG-42.24.19-16.png) |

The app caught this itself rather than closing, so it is the in-app error screen and not an OS crash, but the screen is lost either way.

## Follow-up, not logged as a bug

Item 42 on the [#2057 tracker](https://github.com/Koniverse/SubWallet-Mobile/issues/2057) asks for smoother scrolling through the Pending Multisig records. The developer has deferred it — "the optimization scope is still unclear and requires further investigation before we can identify the right approach" — and the checkbox is still open.

No bug row was created for it. Scrolling works, it is only rough, and there is no agreed target to test against yet. If the developer comes back with a scope, this is where it gets picked up.

## Summary

A verification session, and the biggest one so far. Twenty-three bugs were rechecked on the fixed build and all pass, taking US-42.24.20 from 28 verified to 54 of 71, with two closed no fix. Four AC that bugs had been holding were rerun and pass — AC-14, AC-15, AC-13 and AC-5b — so no bug marked fixed has an AC still outstanding.

Most of the day went on the multisig batch from US-42.24.7, which had been the largest block of open bugs in the programme. Twenty-six of its thirty bugs are now settled, including its only P1 — the signatory picker that sometimes never finished loading when signing for a dApp. Four are left: the toast hidden behind the detail sheet, the notification that opens History rather than the transaction it names, the signatory picker on a network with no multisig support, and the missing call data button logged today.

Three bugs were logged. The one that matters is BUG-42.24.19-16, P1: opening History, switching to the Multisig tab and tapping History again drops the app onto its own error screen, and the only way on is back to home. The other two are display defects — the Call data row on the Signature request screen has no info button when signing for a dApp, and the cards on the NFT detail screen have no padding.

US-42.24.19 was also reworked for round 2. Its checklist was rewritten from the QC checklist and split by platform, 77 lines each for Android and iOS against the 53 shared lines it had before, and the story was re-pointed from 13 to 20. The round 1 results are gone; the sixteen bugs round 1 found are kept with their real status, ten fixed and six open.
