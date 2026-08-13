---
id: EPIC-42
title: "QA Coverage Tracking"
status: done
prd_ref: []
created: 2026-07-16
updated: 2026-07-20
---

## Goal

Show QA progress on the board, same as dev progress.

Each dev epic gets **one** QA page here, named `US-42.<epic-number>`. It shows:

- which stories in that epic have been tested
- how many pass, how many fail
- how many bugs found
- a link to the full test result

This epic doesn't ship any product feature. It just puts existing test results where people can see them, instead of leaving them in files nobody opens.

## Why one page per epic

An epic can have 20-30 stories. One QA page per story would be too many files. So one QA page covers a whole epic, with a small table inside listing every story. One place per epic to check "how much is tested."

## What this covers

- **Covers:** the test-status table for each epic, bug counts, link to results.
- **Doesn't cover:** fixing bugs (tracked on the original story) or writing new tests.
- **Updated by hand for now** — someone fills this in after each test round. No auto-sync yet.

## Pages

| ID | What | Status |
|---|---|---|
| [US-42.1](../stories/US-42.1-qc-issue-5013-stake-and-unstake-screen-bugs.md) | Stake/unstake screen bugs (#5013) | done |
| [US-42.2](../stories/US-42.2-qc-cypress-token-on-base.md) | Cypress token on Base shows correctly (#703) | done |
| [US-42.3](../stories/US-42.3-qc-polkadot-hub-evm-chain.md) | Polkadot Hub EVM chain works correctly (#701) | done |
| [US-42.4](../stories/US-42.4-qc-tusdt-on-bittensor.md) | TUSDT token on Bittensor shows correctly (#699) | done |
| [US-42.5](../stories/US-42.5-qc-myth-xcm-pah-hydration.md) | MYTH XCM between PAH and Hydration retest (#301) | done |
| [US-42.6](../stories/US-42.6-qc-release-extension-v1-3-84.md) | Release extension v1.3.84 — dev, master, draft, production gate | done |
| [US-42.7](../stories/US-42.7-qc-recommend-validator-native-subnet-staking.md) | Recommend validator for native/subnet staking — PR test, all 3 platforms (#5024) | done |
| [US-42.9](../stories/US-42.9-qc-release-webapp-v1-3-56-0.md) | Release Web App v1.3.56-0 (1356-0014) — recommend validator (#5024), dev/production gate | done |
| [US-42.10](../stories/US-42.10-qc-release-mobile-v1-2-44-532-b-v16.md) | Release Mobile v1.2.44(532)b-v16 — recommend validator (#5024), iOS/Android beta+production gate | done |
| [US-42.11](../stories/US-42.11-qc-extension-pr5043-and-issue5045.md) | Extension: PR #5043 signing prompt security fix + #5045 Bittensor deprecated function removal | done |
| [US-42.12](../stories/US-42.12-qc-webapp-pr5043-signing-prompt-security.md) | Web App: PR #5043 signing prompt security fix (#5042) | done |
| [US-42.13](../stories/US-42.13-qc-issue-5050-gavuns-grid-miner-dapp.md) | Gavun's Grid Miner dApp added to dApp list (#5050) — Web App + Mobile, dev → production | done |
| [US-42.14](../stories/US-42.14-qc-issue-5055-nominator-unstaking-eras-dot-2-days.md) | DOT nomination pool unstake period 28d → 2d (#5055); stake/unstake recheck | done |
| [US-42.15](../stories/US-42.15-qc-issue-5054-wud-universe-dapp-logo.md) | WUD Universe dApp logo updated in dApp list (#5054) — Web App + Mobile, dev → production | ready |

More rows get added here as testing starts.

## What this epic actually became — and the two holes it left

> **The stated rule is not the practice.** "Each dev epic gets **one** QA page named
> `US-42.<epic-number>`" describes a per-epic index. The 14 pages above are numbered
> **sequentially** and are three different kinds of thing: per-issue QC (42.1–42.5, 42.7, 42.13,
> 42.14, 42.15), per-release gate QC (42.6, 42.9, 42.10) and per-PR QC (42.11, 42.12). Neither the
> naming nor the one-page-per-epic promise survived contact. Recorded, not "fixed" — renumbering
> 14 pages to match a sentence would break every link to them, and the sentence is the cheaper
> thing to change.

**The sequence skips 8** — it runs 42.1…42.7, then 42.9. Nothing was deleted:
`git log --diff-filter=D` finds no such file in any branch, and no document references it. The
number was simply never used. *(Written as "8" rather than as an ID on purpose —
`scripts/koni-docs-check-ids.mjs` resolves every `US-N.M` token in prose and would flag the
literal as a dangling reference, which is the tool behaving correctly.)*

**No release-gate QC exists for v1.3.85 or v1.3.86.** [US-42.6](../stories/US-42.6-qc-release-extension-v1-3-84.md)
covers v1.3.84 with a 7-AC gate — dev build → master build → draft release → production recheck,
each with its own regression pass. Nothing equivalent was written for the two releases after it.

Why, on the evidence:

- **v1.3.84 was a 6-item release** (#5013, #5024 and four ChainList integrations). Six items
  crossing four build stages is what makes a release-gate story worth its 8 points.
- **v1.3.85 and v1.3.86 were single-issue releases** — #5042 and #5045, one each — and *both* were
  already QC'd at PR level by [US-42.11](../stories/US-42.11-qc-extension-pr5043-and-issue5045.md)
  (Extension, across fresh install **and** version upgrade) and
  [US-42.12](../stories/US-42.12-qc-webapp-pr5043-signing-prompt-security.md) (Web App). The
  release *content* was verified; only the pipeline gate was not.
- Both releases were cut inside [sprint-2026-W32](../sprint-2026-W32.md), the same window as
  US-42.11 / US-42.12 — so the QC effort went to the fixes, not to the build stages.

**So the gap is narrow but real:** for 1.3.85 and 1.3.86 nothing checked that the master, draft
and production builds carry what the dev build carried, and nothing ran a regression pass at
those stages. A single-issue release is exactly where a bad build is least likely to be noticed by
content testing, because there is only one thing to look at. **Recommended:** one combined
`QC — Release Extension v1.3.85 + v1.3.86` page rather than two, since the two releases are a day
apart and share a pipeline.

## Not covered here

- This page doesn't replace the test plan — it just shows results, not the plan itself.
