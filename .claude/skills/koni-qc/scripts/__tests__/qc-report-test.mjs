// Self-test for the reference reporter — freezes the parse contract so the two
// field-found bugs can never silently return (test-automation.md §2):
//   BUG-1: [A-Z]+ TYPE regex dropping digit-bearing types (E2E, A11Y) — LESSONS §227 (ERP).
//   BUG-2: `| TC-ID |` header rows counted as cases (over-counted 30) — v1.114.41 (ERP).
// Plus: broken-handle enforcement (missing + failing + fifth-form + duplicate), orphan
// run-IDs, header-resolved Covered-by column, counters that SUM to total, ops-deploy
// class, timing/error capture, density.
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { TC_ID, TC_TOKEN, LIVE_CADENCE, liveCadencePath, scanSpecs, classifyHandle, foldRun, normalizeRunnerJson, buildReport, renderMarkdown } from '../qc-report.mjs';

let PASS = 0, FAIL = 0;
const ok = (m) => { PASS++; console.log('ok   - ' + m); };
const no = (m) => { FAIL++; console.log('FAIL - ' + m); };
const eq = (a, b, m) => (a === b ? ok(m) : no(`${m} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`));

// ── BUG-1: the frozen regex accepts digit-bearing TYPEs ──
eq(TC_ID.test('TC-01.E2E-2'), true, 'regex: E2E accepted (digits in TYPE)');
eq(TC_ID.test('TC-01.A11Y-1'), true, 'regex: A11Y accepted');
eq(TC_ID.test('TC-CN.SEC-1'), true, 'regex: domain-prefix epic accepted');
eq(TC_ID.test('TC-01.WS-5'), true, 'regex: endpoint-prefix TYPE accepted');
eq(TC_ID.test('TC-ID'), false, 'regex: the literal header word rejected');
eq(TC_ID.test('TC-01.2E2-1'), false, 'regex: TYPE must start alphabetic');

// ── fixture spec + run ──
const dir = mkdtempSync(join(tmpdir(), 'qcrep-'));
writeFileSync(join(dir, 'EPIC-01.md'), `
# suite
TC-01.E2E-2:
  maps_to: { us: US-1.1, fr: FR-1, ac: AC-1 }

| TC-ID | Name | Pri | Covered-by |
|---|---|---|---|
| TC-01.E2E-2 | happy flow | High | epic/EPIC-01/a.e2e.spec.ts::TC-01.E2E-2 |
| TC-01.A11Y-1 | keyboard nav | Med | epic/EPIC-01/a.e2e.spec.ts::TC-01.A11Y-1 |
| TC-01.NEG-1 | reject bad input | High | epic/EPIC-01/a.integration.spec.ts::TC-01.NEG-1 |
| TC-01.SEC-1 | cross-tenant blocked | Crit | PROPOSED:epic/EPIC-01/rls.integration.spec.ts::TC-01.SEC-1 |
| TC-01.FUNC-9 | prod smtp wiring | Low | OPS-DEPLOY:DEPLOY.md#smtp |
| TC-01.UI-1 | matches DESIGN.md | Med | — (manual) |
`);
const runner = JSON.stringify({
  testResults: [{ assertionResults: [
    { fullName: 'TC-01.E2E-2 — happy flow', status: 'passed', duration: 12 },
    { fullName: 'TC-01.E2E-2 — happy flow (retry probe)', status: 'passed', duration: 8 },
    { fullName: 'TC-01.A11Y-1 — keyboard nav', status: 'passed' },
    { fullName: 'TC-01.NEG-1 — reject bad input', status: 'failed', failureMessages: ['expected 400, got 200'] },
    { fullName: 'parseRpcUrl → rejects malformed scheme', status: 'passed' }, // unit test, no TC → ignored
  ] }],
});

const rows = scanSpecs(dir);
// ── BUG-2: header row is NOT a case ──
eq(rows.length, 6, 'scan: 6 cases (the `| TC-ID |` header row skipped)');
eq(rows[0].us, 'US-1.1', 'scan: maps_to US captured for density');

// ── classes ──
eq(classifyHandle('OPS-DEPLOY:DEPLOY.md#smtp'), 'ops-deploy', 'class: ops-deploy form');
eq(classifyHandle('PROPOSED:x.spec.ts::TC-1'), 'proposed', 'class: proposed form');
eq(classifyHandle('— (manual)'), 'manual', 'class: manual form');
eq(classifyHandle('– (manual)'), 'manual', 'class: en-dash manual variant tolerated');
eq(classifyHandle('a/b.spec.ts::TC-01.E2E-2'), 'automated', 'class: automated form');
eq(classifyHandle('see wiki'), 'unknown', 'class: free text is NOT a form');

// ── fold + enforce ──
const folded = foldRun(normalizeRunnerJson(runner));
eq(folded.get('TC-01.E2E-2').status, 'passed', 'fold: E2E parsed from test name (BUG-1 guarded end-to-end)');
eq(folded.get('TC-01.E2E-2').ms, 20, 'fold: durations summed per TC');
eq(folded.get('TC-01.A11Y-1').status, 'passed', 'fold: A11Y parsed');
eq(folded.get('TC-01.NEG-1').error, 'expected 400, got 200', 'fold: first failure message captured');
eq(folded.has('TC-01.FUNC-9'), false, 'fold: no phantom entries');

const rep = buildReport(rows, folded);
eq(rep.counters.total, 6, 'report: total = 6');
eq(rep.counters.passed, 2, 'report: 2 passed');
eq(rep.counters['ops-deploy'], 1, 'report: ops-deploy counted in its own column');
eq(rep.counters.manual, 1, 'report: manual not lumped with ops-deploy');
// TC-01.NEG-1 cites a FAILING test → broken handle (the enforcer)
eq(rep.broken.length, 1, 'enforce: failing cited test = 1 broken handle');
eq(rep.broken[0].id, 'TC-01.NEG-1', 'enforce: the right TC flagged');
// counters SUM to total (D2 finding: broken must live in a bucket)
{
  const c = rep.counters;
  eq(c.passed + c.failed + c.blocked + c.broken + c['not-written'] + c.manual + c['ops-deploy'], c.total, 'report: status buckets sum to total');
}

// density telemetry + new columns present
const md = renderMarkdown(rep, { date: '2026-07-03' });
eq(md.includes('Density (cases per US'), true, 'render: density table present');
eq(md.includes('does NOT measure enumeration density'), true, 'render: denominator-honesty line present');
eq(md.includes('broken handles: 1'), true, 'render: broken count surfaced');
eq(md.includes('Time (ms)'), true, 'render: timing column present');
eq(md.includes('expected 400, got 200'), true, 'render: failure detail surfaced');

// duplicate-ID detection (F-12 guard) — flagged broken, NOT double-counted
const dup = buildReport([...rows, { ...rows[0] }], folded);
eq(dup.broken.some((b) => b.reason.startsWith('duplicate')), true, 'enforce: duplicate TC-ID flagged');
eq(dup.counters.passed, 2, 'enforce: duplicate row not double-counted as passed');
{
  const c = dup.counters;
  eq(c.passed + c.failed + c.blocked + c.broken + c['not-written'] + c.manual + c['ops-deploy'], c.total, 'enforce: buckets still sum with a duplicate');
}

// ── fixture 2: header-resolved Covered-by, missing test, fifth form, orphan ──
const dir2 = mkdtempSync(join(tmpdir(), 'qcrep2-'));
writeFileSync(join(dir2, 'EPIC-02.md'), `
| TC-ID | Name | Covered-by | Notes |
|---|---|---|---|
| TC-02.API-1 | create ok | epic/EPIC-02/b.spec.ts::TC-02.API-1 | slow on CI |
| TC-02.API-2 | cited but never ran | epic/EPIC-02/b.spec.ts::TC-02.API-2 | — |
| TC-02.API-3 | ad-hoc marker | see wiki | — |
`);
const runner2 = JSON.stringify({ tests: [
  { name: 'TC-02.API-1 — create ok', status: 'passed', durationMs: 5 },
  { name: 'TC-99.GHOST-1 — not in any spec', status: 'passed' },
] });
const rows2 = scanSpecs(dir2);
eq(rows2[0].coveredBy, 'epic/EPIC-02/b.spec.ts::TC-02.API-1', 'scan: Covered-by resolved from header column, not last cell (Notes after it)');
const rep2 = buildReport(rows2, foldRun(normalizeRunnerJson(runner2)));
eq(rep2.counters.passed, 1, 'report2: 1 passed');
eq(rep2.counters.broken, 2, 'report2: missing-test + fifth-form both counted broken');
eq(rep2.broken.some((b) => b.reason.includes('did not run')), true, 'enforce: missing cited test flagged');
eq(rep2.broken.some((b) => b.reason.includes('five fixed forms')), true, 'enforce: out-of-set Covered-by flagged, not laundered to not-written');
eq(rep2.orphans.length === 1 && rep2.orphans[0] === 'TC-99.GHOST-1', true, 'enforce: orphan run-ID surfaced (spec is the sole authority)');
{
  const c = rep2.counters;
  eq(c.passed + c.failed + c.blocked + c.broken + c['not-written'] + c.manual + c['ops-deploy'], c.total, 'report2: buckets sum to total');
}
const md2 = renderMarkdown(rep2, { date: '2026-07-03' });
eq(md2.includes('ORPHAN TEST IDS'), true, 'render2: orphan section present');

// ── fixture 3: per-US recursive layout, DESIGN-REVIEW form, lane-aware env-pending ──
import { mkdirSync } from 'node:fs';
const dir3 = mkdtempSync(join(tmpdir(), 'qcrep3-'));
mkdirSync(join(dir3, 'EPIC-03'));
writeFileSync(join(dir3, 'EPIC-03', 'US-3.1.md'), `
TC-03.API-1:
  maps_to: { us: US-3.1 }

| TC-ID | Name | Covered-by |
|---|---|---|
| TC-03.API-1 | needs live db | tests/epic/EPIC-03/rls.integration.spec.ts::TC-03.API-1 |
| TC-03.UI-1 | matches DESIGN.md | DESIGN-REVIEW:/dashboard/settings |
| TC-03.UI-2 | legacy design cell | gstack /design-review (DESIGN.md + shadcn conformance) |
| TC-03.FUNC-1 | pure logic | tests/epic/EPIC-03/logic.unit.test.ts::TC-03.FUNC-1 |
`);
const rows3 = scanSpecs(dir3);
eq(rows3.length, 4, 'scan3: recursive — per-US file inside EPIC-03/ found');
eq(classifyHandle('DESIGN-REVIEW:/dashboard/settings'), 'design', 'class: DESIGN-REVIEW form (5th)');
eq(classifyHandle('gstack /design-review (DESIGN.md + shadcn conformance)'), 'design', 'class: legacy design-review free text reads as form 5');
eq(LIVE_CADENCE.test('tests/epic/EPIC-03/rls.integration.spec.ts::TC-03.API-1'), true, 'lane: integration cadence detected');

const emptyRun = foldRun({ tests: [] });
const repUnit = buildReport(rows3, emptyRun, { lane: 'unit' });
eq(repUnit.counters['env-pending'], 1, 'lane unit: missing live handle folds to env-pending, not broken');
eq(repUnit.counters.design, 2, 'lane unit: both design cells counted in the design bucket');
eq(repUnit.counters.broken, 1, 'lane unit: missing NON-live handle (unit cadence) still broken');
{
  const c = repUnit.counters;
  eq(c.passed + c.failed + c.blocked + c.broken + c['env-pending'] + c.design + c['not-written'] + c.manual + c['ops-deploy'], c.total, 'lane unit: buckets sum to total');
}
const repFull = buildReport(rows3, emptyRun, { lane: 'full' });
eq(repFull.counters['env-pending'], 0, 'lane full: nothing hides as env-pending');
eq(repFull.counters.broken, 2, 'lane full: the live handle IS enforced (missing = broken)');
const md3 = renderMarkdown(repUnit, { date: '2026-07-03' });
eq(md3.includes('Covered') && md3.includes('env-pending handles are verified in their own CI lane'), true, 'render3: coverage formula line present');

// ── anti-laundering: classify precedence + lane fail-closed + malformed rows ──
eq(classifyHandle('PROPOSED:add a design-review pass later'), 'proposed', 'launder: PROPOSED beats design-review free text (stays uncovered)');
eq(classifyHandle('tests/design-review.spec.ts::TC-9.UI-1'), 'automated', 'launder: a file NAMED design-review stays automated + enforced');
{
  // an automated design-review-named handle missing from the run must be BROKEN, not design
  const rowsL = [{ id: 'TC-9.UI-1', file: 'x.md', us: null, coveredBy: 'tests/design-review.spec.ts::TC-9.UI-1', klass: classifyHandle('tests/design-review.spec.ts::TC-9.UI-1') }];
  const repL = buildReport(rowsL, foldRun({ tests: [] }), { lane: 'full' });
  eq(repL.counters.broken, 1, 'launder: missing design-review-named automated handle = broken (enforcer intact)');
}
{
  // lane fails CLOSED at the report level: only 'unit' folds to env-pending
  const rowsB = [{ id: 'TC-9.API-1', file: 'x.md', us: null, coveredBy: 'a.integration.spec.ts::TC-9.API-1', klass: 'automated' }];
  const repBogus = buildReport(rowsB, foldRun({ tests: [] }), { lane: 'integration' });
  eq(repBogus.counters.broken, 1, "lane: unknown lane label ('integration') enforces, never launders to env-pending");
}
eq(LIVE_CADENCE.test(liveCadencePath('a.spec.ts::name mentions .integration.spec. here')), false, 'lane: cadence read from the PATH part only, not the test name');
{
  // malformed TC-ID first cell is flagged broken, not silently dropped
  const dirM = mkdtempSync(join(tmpdir(), 'qcrepM-'));
  writeFileSync(join(dirM, 'EPIC-09.md'), `
| TC-ID | Name | Covered-by |
|---|---|---|
| TC-09.API-1 extra | typo row | a.spec.ts::x |
| TC-09.API-2 | fine | — (manual) |
`);
  const rowsM = scanSpecs(dirM);
  eq(rowsM.length, 2, 'malformed: typo row still counted (not vanished)');
  const repM = buildReport(rowsM, foldRun({ tests: [] }));
  eq(repM.broken.some((b) => b.reason.includes('frozen shape')), true, 'malformed: typo row flagged broken');
  const c = repM.counters;
  eq(c.passed + c.failed + c.blocked + c.broken + c['env-pending'] + c.design + c['not-written'] + c.manual + c['ops-deploy'], c.total, 'malformed: buckets still sum');
}

console.log(`\nqc-report-test: ${PASS} passed, ${FAIL} failed`);
process.exit(FAIL === 0 ? 0 : 1);
