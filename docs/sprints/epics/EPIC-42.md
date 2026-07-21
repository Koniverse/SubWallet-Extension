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
| [US-42.6](../stories/US-42.6-qc-release-extension-v1-3-84.md) | Release extension v1.3.84 — dev, master, draft, production gate | ready |

More rows get added here as testing starts.

## Not covered here

- This page doesn't replace the test plan — it just shows results, not the plan itself.
