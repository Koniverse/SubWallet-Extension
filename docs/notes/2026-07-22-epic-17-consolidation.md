# EPIC-37 (Maintenance — Proxy) merged into EPIC-17 — 2026-07-22

`EPIC-37` is gone. Its 15 tracker issues now live inside the EPIC-17 capability they belong to,
each as a row in that story's own incremental-work table — the third maintenance epic dissolved,
after [EPIC-29 → EPIC-9](2026-07-17-epic-9-consolidation.md) and
[EPIC-25 → EPIC-5](2026-07-21-epic-5-consolidation.md).

**Why.** Proxy accounts shipped as one coordinated push: a dozen granular tracker items under one
umbrella, delivered on one branch, released together in 1.3.72. Splitting that into 15 stubs that
each said only "this issue exists" hid the very thing a reader needs — that these are *one feature*
and it is *done*. Two capability stories now carry the work, and each reads as a build order.

## Where each issue went

| Issue | Title | Status | Shipped | Retired id | Now lives in |
|---|---|---|---|---|---|
| [#163](https://github.com/Koniverse/SubWallet-Extension/issues/163) | Support Proxy Account Management | ⏸️ deprecated | — | `US-37.1` | US-17.1 |
| [#4610](https://github.com/Koniverse/SubWallet-Extension/issues/4610) | WebApp - Proxy the mempools API via Cloudflare worker | ⏸️ deprecated | — | `US-37.2` | US-24.342 *(relocated)* |
| [#4726](https://github.com/Koniverse/SubWallet-Extension/issues/4726) | [Proxy Account][Doc] Write Technical Documentation for Proxy Account Support | ✅ done | 1.3.72 | `US-37.3` | US-17.1 |
| [#4727](https://github.com/Koniverse/SubWallet-Extension/issues/4727) | [Proxy Account][Extension] Manage Proxy Accounts | ⏸️ deprecated | 1.3.72 | `US-37.4` | US-17.1 |
| [#4770](https://github.com/Koniverse/SubWallet-Extension/issues/4770) | [Proxy Account][Extension] Background logic Integration | ✅ done | 1.3.72 | `US-37.5` | US-17.1 |
| [#4776](https://github.com/Koniverse/SubWallet-Extension/issues/4776) | [Proxy Account][Extension] Manage Proxy UI | ✅ done | 1.3.72 | `US-37.6` | US-17.1 |
| [#4777](https://github.com/Koniverse/SubWallet-Extension/issues/4777) | [Proxy Account][Extension] Add Proxy Form | ✅ done | 1.3.72 | `US-37.7` | US-17.1 |
| [#4778](https://github.com/Koniverse/SubWallet-Extension/issues/4778) | [Proxy Account][Extension] Add / Remove Confirmation | ✅ done | 1.3.72 | `US-37.8` | US-17.1 |
| [#4779](https://github.com/Koniverse/SubWallet-Extension/issues/4779) | [Proxy Account][Extension] Select Proxy Account for Signing | ✅ done | 1.3.72 | `US-37.9` | US-17.2 |
| [#4780](https://github.com/Koniverse/SubWallet-Extension/issues/4780) | Initialize Proxy Service | ✅ done | 1.3.72 | `US-37.10` | US-17.1 |
| [#4781](https://github.com/Koniverse/SubWallet-Extension/issues/4781) | Handle proxy extrinsic | ✅ done | 1.3.72 | `US-37.11` | US-17.2 |
| [#4782](https://github.com/Koniverse/SubWallet-Extension/issues/4782) | Intergrate proxy account with others extrinsic | ✅ done | 1.3.72 | `US-37.12` | US-17.2 |
| [#4783](https://github.com/Koniverse/SubWallet-Extension/issues/4783) | History intergrate Proxy Account | ✅ done | 1.3.72 | `US-37.13` | US-17.2 |
| [#4786](https://github.com/Koniverse/SubWallet-Extension/issues/4786) | [Proxy Account][Extension] Remove Proxy Form | ✅ done | 1.3.72 | `US-37.14` | US-17.1 |
| [#4947](https://github.com/Koniverse/SubWallet-Extension/issues/4947) | Get stake history of proxy account for proxied account | 📋 backlog | — | `US-37.15` | US-17.3 |

**9 → US-17.1** (authority model) · **4 → US-17.2** (signing & provenance) · **1 → US-17.3** (new,
forward) · **1 relocated out of the area**.

## The version was recoverable, and what it does not claim

Every one of the 15 stubs carried an **empty `version_shipped`** — yet thirteen of them shipped.
The reason none could be resolved automatically: **no sub-issue has a commit of its own.** The
whole feature landed on the branch `koni/dev/issue-4769` (PR #4789) and **every commit is tagged
`[Issue-4769]`** — a sibling of all fifteen — while the CHANGELOG names only the umbrella,
[#4725](https://github.com/Koniverse/SubWallet-Extension/issues/4725) *"Integrate Proxy Account
Support"*, in **1.3.72** (2026-01-14).

So `Shipped: 1.3.72` here records **the release the work demonstrably landed in** — verified with
`git merge-base --is-ancestor <sha> v1.3.72` against the branch's commits, which is how
[US-17.1](../sprints/stories/US-17.1-proxy-types-and-authority-management.md) and
[US-17.2](../sprints/stories/US-17.2-proxy-signing-sign-selector-and-proxied-by-display.md) already
carried that version. It does **not** claim which commit satisfied which issue: attaching a
sibling's commit is the bundle-inference
[D106](../CONTEXT.md#d106-commit-names-what-made-the-capability-true--a-release-bump-made-nothing-true)
rejects, so no per-row `commit` is asserted. This is the *"shipped via #N"* evidence tier
[D108](../CONTEXT.md#d108-every-tracker-issue-gets-a-story--in-a-maintenance-epic-layer-so-the-fr-map-stays-the-fr-map)
defines, applied to a bundle rather than a single pointer.

## One issue was in the wrong area, and the reason is instructive

**#4610 — *"WebApp - Proxy the mempools API via Cloudflare worker"*** has nothing to do with proxy
accounts. It fronts the **mempool.space Bitcoin HTTP API** behind a Cloudflare worker: provider-proxy
infrastructure, the same concern as [NFR-16](../PRD.md#non-functional-requirements). It landed in
the proxy-account ledger because the routing was a **title heuristic** matching the word *proxy* —
exactly the failure [D108](../CONTEXT.md#d108-every-tracker-issue-gets-a-story--in-a-maintenance-epic-layer-so-the-fr-map-stays-the-fr-map)
predicted when it labelled every generated story *"capability area (guess)"*. Relocated to the
Network & Token ledger as `US-24.342`, status unchanged (**closed NOT_PLANNED** — declined, never
shipped).

## Why #4947 became its own story

[#4947](https://github.com/Koniverse/SubWallet-Extension/issues/4947) — *"Get stake history of proxy
account for proxied account"* — is **open**, and both capability stories are `done`. Folding open
work into a shipped story is how a `done` story comes to carry an unticked AC, the defect
[D107](../CONTEXT.md#d107-a-ticked-ac-is-a-claim-about-the-code--four-of-us-51s-were-false-and-one-was-a-p0-security-claim)
found in US-5.1. It becomes [US-17.3](../sprints/stories/US-17.3-proxy-stake-allocation-in-earning-history.md),
`backlog`, **no FR** — FR-148 is complete without it.

It is worth noting the story **straddles two epics**: the relationship is EPIC-17's, but the surface
the answer must appear on is the earning portfolio ([EPIC-12](../sprints/epics/EPIC-12.md)). Filed
under EPIC-17 because the question it answers — *what did this proxy do with my balance* — is a
proxy-provenance question.

## Verification

- `node scripts/koni-docs-check-ids.mjs` — exit 0; every ID, link and anchor resolves.
- `npx koni-docs validate --docs-path docs/` — exit 0.
- No `US-37.` token remains on the live doc surface; this dated note is the only place they appear,
  which is what `check-ids` exempts a dated archive for.
