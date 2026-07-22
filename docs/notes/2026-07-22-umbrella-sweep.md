# Umbrella sweep across the folded stories — 2026-07-22

The owner opened [#4189](https://github.com/Koniverse/SubWallet-Extension/issues/4189) and asked
why a parent issue with a pile of shipped sub-issues was sitting in the out-of-repo bucket with
`Shipped: —`. It should not have been. That correction is recorded in the
[EPIC-1 consolidation note](2026-07-22-epic-1-consolidation.md); this note covers the **sweep for
the same class** across every story that carries an incremental-work table.

## The check

All **186 distinct issues** currently listed as rows were queried:

```
gh api repos/Koniverse/SubWallet-Extension/issues/<N>/sub_issues
```

**Five came back with children.** The test that separates them —
[AGENTS.md](../../AGENTS.md) rule 10 — has two halves, and both must hold for an issue to be an
umbrella: **it has sub-issues, and it has no CHANGELOG line of its own.**

| Issue | In | Children | Own CHANGELOG line | Verdict |
|---|---|---|---|---|
| [#4770](https://github.com/Koniverse/SubWallet-Extension/issues/4770) | US-17.1 | #4780, #4781, #4782, #4783 | none | **umbrella** → EPIC-17 |
| [#4883](https://github.com/Koniverse/SubWallet-Extension/issues/4883) | US-9.24 | #4884, #4885 | none | **umbrella** → EPIC-9 |
| [#4884](https://github.com/Koniverse/SubWallet-Extension/issues/4884) | US-9.20 | #4768 | `1.3.80` | delivery — stays a row |
| [#4568](https://github.com/Koniverse/SubWallet-Extension/issues/4568) | US-9.8 | #4625, #138 | `1.3.68` | delivery — stays a row |
| [#4189](https://github.com/Koniverse/SubWallet-Extension/issues/4189) | US-1.6 | six, all shipped | none | **umbrella** → US-32.373 |

An issue that delegated all its scope is a container. An issue that shipped something and happened
to spawn one sub-task is not — deleting its row would delete the release it delivered.

## The one that made a story wrong

**US-9.24 was built on the wrong issue.** It was created earlier the same day as the "remaining
SDK migration", anchored on **#4883** — which is the **parent** of #4884, the Phase-1 work that
already shipped in 1.3.80 and is `done` in
[US-9.20](../sprints/stories/US-9.20-client-side-nft-service-and-sdk-migration.md). A reader
following #4883 lands on an issue that contains completed work.

The real remaining leaf is **[#4885](https://github.com/Koniverse/SubWallet-Extension/issues/4885)**
— *"Migrate Remaining Chains to SDK & Integrate into NFTService (Phase 2)"*, open, In Backlog.

```
#4883 Implement Client-side NFT Service & Migrate Existing Logic to SDK   OPEN   umbrella → EPIC-9
├── #4884 Implement NFTService + Migrate EVM & Unique NFT (Phase 1)       CLOSED  1.3.80 → US-9.20
│   └── #4768 Implement UI to support the Nested NFT standard             CLOSED         → US-9.2
└── #4885 Migrate Remaining Chains to SDK & Integrate into NFTService     OPEN           → US-9.24
```

**#4885 was in the wrong epic too.** It sat in the Network & Token ledger as `US-24.335`, routed
there by the area heuristic — the same mis-routing that sent #4610 to the proxy area and #4189 to
build/platform. An NFT-service migration is not a network-and-token concern. That ledger story is
**retired**; its id is recorded here and never reused ([AGENTS.md](../../AGENTS.md) rule 1).

| Retired id | Issue | Now lives in |
|---|---|---|
| `US-24.335` | [#4885](https://github.com/Koniverse/SubWallet-Extension/issues/4885) | [US-9.24](../sprints/stories/US-9.24-client-side-nft-service-full-sdk-migration.md) |

## Two rows the board invented

Both are recorded so nobody later "fixes" the docs to match the tracker:

- **[#138](https://github.com/Koniverse/SubWallet-Extension/issues/138)** is listed as a sub-issue
  of #4568. It is a **merged pull request**, not an issue — it appears nowhere in the docs, and
  correctly so.
- **[#145](https://github.com/Koniverse/SubWallet-Extension/issues/145)** *"Account Balance still
  gets calculating from test net"* is listed under **#4768**, a nested-NFT UI task. Unrelated; it
  is owned by `US-23.18` and stays there.

These join **#43** (*"Support Hardware Wallet"*, 2022) sitting under the 2025 multisig background
issue, found during the [EPIC-18 fold](2026-07-22-epic-18-consolidation.md). Three board errors in
one day's sweep is why rule 10 says the tree is **evidence, not truth**.

## What changed

- [US-9.24](../sprints/stories/US-9.24-client-side-nft-service-full-sdk-migration.md) — anchored on
  **#4885** instead of the #4883 umbrella; `US-24.335` deleted and EPIC-24's count corrected.
- [US-17.1](../sprints/stories/US-17.1-proxy-types-and-authority-management.md) — the #4770 row
  removed; the issue is now in EPIC-17's umbrella table beside its four children.
- [EPIC-9](../sprints/epics/EPIC-9.md) and [EPIC-17](../sprints/epics/EPIC-17.md) — each gains an
  **umbrella issues** section, the same one [EPIC-18](../sprints/epics/EPIC-18.md) already carries.
- [US-9.20](../sprints/stories/US-9.20-client-side-nft-service-and-sdk-migration.md) and
  [US-9.8](../sprints/stories/US-9.8-custom-nft-import.md) — keep their rows, and now say which
  sub-task each parent spawned and which story owns it, so the overlap is visible rather than
  silent.
- [AGENTS.md](../../AGENTS.md) — rule 10.

## Verification

- `node scripts/koni-docs-check-ids.mjs` — exit 0.
- `npx koni-docs validate --docs-path docs/` — exit 0.
- Re-run the sweep: of the 186 rows, the only remaining parents are #4884 and #4568, both of which
  carry their own CHANGELOG line and are therefore rows by rule 10.
