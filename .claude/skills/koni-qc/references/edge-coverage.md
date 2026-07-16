# edge-coverage — the edge-case taxonomy

> **Load when**: you have a happy-path case list and need to make it *thorough*
> (the **Design** stage of [`qc-workflow.md`](qc-workflow.md)). This is the
> headline fix for the backup's "~70% happy-path" gap: run every feature through
> the taxonomy below and you cannot ship a suite that only tests the sunny day.
> Pairs with [`test-design.md`](test-design.md) (the derivation techniques) and
> feeds [`traceability.md`](traceability.md) (the negative/boundary half of the
> AC↔TC matrix).

**Contents**: [The edge-case taxonomy](#the-edge-case-taxonomy) · [How to apply](#how-to-apply)

The backup suite's single largest defect was distribution: ~70% of its cases
exercised the happy path, ~25% were thin negatives, and edge classes
(injection, encoding, concurrency, network failure) were essentially absent. A
feature is not "tested" because the demo works; it is tested when it survives
the inputs a real user — or attacker — throws at it. This taxonomy is the
checklist that makes that survival auditable.

---

## The edge-case taxonomy

Run **every feature** through every row. For each row, either write the case or
record in the suite's *Open / deferred* section why it does not apply. Each row
names the backup gap it closes so the uplift is traceable.

| # | Edge class | What to probe | Backup gap it closes | One-line example case |
|---|---|---|---|---|
| 1 | **null / empty / zero / max / overflow** | absent value, empty string, `0`, the documented max, and one past it | thin boundary coverage (~25% negatives, no `min/max±1`) | decimals = `0` accepted; decimals = `19` rejected |
| 2 | **malformed / encoding / emoji / i18n** | wrong format, non-ASCII, emoji, RTL, combining chars, surrogate pairs | no encoding/i18n cases at all | network name `日本語🌐` stored + rendered intact |
| 3 | **injection / XSS / special-chars** | `<script>`, quotes, `;`, SQL-ish, template `${}`, path `../` | no security/injection cases (<5% non-functional) | name `<script>alert(1)</script>` escaped, never executed |
| 4 | **concurrency / double-submit / race** | double-tap submit, parallel edits, fast retry, simultaneous saves | no concurrency cases | double-tap Save → exactly one network created |
| 5 | **permission / auth / ownership** | act without auth, on another's resource, on a protected/in-use item | no authz cases | delete an in-use/active network → refused |
| 6 | **network flaky / offline / timeout / retry** | slow response, mid-request drop, offline, retry storm | no resilience cases | RPC auto-detect times out → clear error, no half-saved state |
| 7 | **state / lifecycle transitions** | every legal transition + the illegal ones | no state-machine coverage | edit a network after it was deleted in another tab → graceful refusal |
| 8 | **timezone / locale** | DST edge, UTC vs local, locale number/date format, 12/24h | no tz/locale cases | decimals parsed with locale `,` decimal separator |
| 9 | **idempotency** | replay the same request/action twice | no idempotency cases | re-Save unchanged network → no duplicate, no error |
| 10 | **pagination / large-data** | empty list, one item, page boundary, very large list | no large-data cases | provider list with 500 networks scrolls + filters within SLA |

---

## How to apply

1. **Run the full list, every feature.** The taxonomy is a gate, not a buffet.
   A row you skip must be justified in the suite's *Open / deferred scenarios*
   with an owner — silence is a gap, not a pass.
2. **Budget ≥50% off-path.** Across the finished suite, at least half the cases
   must be **off-path = negative (NEG) + boundary (BND) + edge (EDGE)**, not
   happy-path. This is a [`quality-bar.md`](quality-bar.md) Band-A item and is
   checked in self-review. The backup sat near 25%; the pilot lands at or above 50%.
3. **Map each edge case to its AC and TYPE.** An injection case is `TC-*.SEC-*`;
   a **concurrency / network-failure / encoding / state-race** case is `TC-*.EDGE-*`
   (the `EDGE` TYPE per [`traceability.md`](traceability.md)) — record it in the
   canonical table with the right TYPE so it counts in the AC↔TC matrix.
4. **Escalate the security and NFR rows.** Rows 3, 5, and 6 frequently graduate
   into the dedicated coverage in [`nfr.md`](nfr.md) (§Security, §Reliability) —
   when risk is high, emit a standalone `*-security-test-cases.md` rather than
   burying them.
5. **Prove it in the matrix.** Every AC must come out of this pass with a
   **boundary-or-edge** case — a value boundary (`BND`, e.g. rows 1, 8, 10) *or* an
   `EDGE` case (concurrency / network-failure / state-race, e.g. rows 4, 6, 7) — **and**
   a **negative** case (invalid input / permission, e.g. rows 2, 3, 5, 9), or the
   AC↔TC matrix in [`traceability.md`](traceability.md) fails. (EDGE rows fill the
   boundary-or-edge slot, not the negative slot.)
