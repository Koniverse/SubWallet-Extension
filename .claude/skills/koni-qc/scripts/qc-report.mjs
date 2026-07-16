#!/usr/bin/env node
// qc-report — the reference implementation of the PARSE + CLASSIFY + ENFORCE + DENSITY
// core of koni-qc's reporter contract (references/test-automation.md §2). Node stdlib
// only; copy into a repo and adapt. NOT implemented here (adapt-on-copy, per §2–§3):
// the story write-back, the per-group/failed-by-category/perf rollups of
// report-quality.md, the collision + non-conformant-path flags, and runner adapters
// beyond vitest/jest JSON. It exists so the two
// field-found parse bugs can never silently return:
//   BUG-1: a TC-TYPE regex of [A-Z]+ drops digit-bearing types (E2E, A11Y).
//   BUG-2: counting `| TC-ID |` header rows as cases inflates total + manual.
//
// Contract enforced (the "broken-handle" rule that makes any 100% trustworthy):
//   every automated Covered-by handle MUST resolve to an actually-PASSING test in the
//   run — a cited test that is missing or failing is a BROKEN handle and the exit code
//   is non-zero. Coverage can then never be faked by editing a spec cell.
//
// Usage:
//   node qc-report.mjs --specs <dir-with-EPIC-*.md> --results <runner.json> [--out report.md]
//   (results = `vitest run --reporter=json` / `jest --json` output; playwright/pytest
//    adapters: map their JSON to {tests:[{name,status}]} first.)
import { readFileSync, readdirSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// ── the frozen parse contract ──────────────────────────────────────────────────────
// TYPE = [A-Z][A-Z0-9]* — first char alpha, digits ALLOWED after (E2E, A11Y).
export const TC_ID = /^TC-[0-9A-Z]+\.[A-Z][A-Z0-9]*-\d+$/;
export const TC_TOKEN = /TC-[0-9A-Z]+\.[A-Z][A-Z0-9]*-\d+/; // leading-token extraction

export function parseArgs(argv) {
  const a = { specs: '', results: '', out: '', lane: 'full' };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--specs') a.specs = argv[++i];
    else if (argv[i] === '--results') a.results = argv[++i];
    else if (argv[i] === '--out') a.out = argv[++i];
    else if (argv[i] === '--lane') a.lane = argv[++i]; // 'full' (default: enforce everything) | 'unit' (live handles fold to env-pending)
  }
  return a;
}

// ── SPEC SCAN — every table row whose FIRST CELL is a real TC-ID ───────────────────
// Any other row (the `| TC-ID |` header, `|---|` separators, prose) is skipped: it is
// NOT a case and must never count toward total/manual (BUG-2).
export function scanSpecs(dir) {
  const rows = [];
  // recursive: specs live in per-epic dirs (test-cases/EPIC-N/US-x.y.md); legacy flat EPIC-NN.md also matches
  for (const f of readdirSync(dir, { recursive: true }).map(String)
    .filter((x) => x.endsWith('.md'))
    // generated trees are never specs — guard against --specs pointing above test-cases/
    .filter((x) => !/(^|\/)(test-reports|bug-bash|audits)\//.test(x))) {
    const file = join(dir, f);
    let us = null;
    let covIdx = -1; // Covered-by column index, resolved from the nearest header row
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      const mUs = line.match(/\bus:\s*(US-[\d.]+)/); // maps_to yaml (best-effort, for density)
      if (mUs) us = mUs[1];
      if (!line.trimStart().startsWith('|')) continue;
      const cells = line.split('|').map((c) => c.trim());
      const hIdx = cells.findIndex((c) => /^covered[- ]by$/i.test(c));
      if (hIdx !== -1) { covIdx = hIdx; continue; } // header row — remember the column, never a case
      const id = cells[1] || '';
      if (!TC_ID.test(id)) {
        // a cell that LOOKS like a TC-ID but fails the frozen shape is an authoring
        // typo — flag it (a vanishing row is silent data loss); pure header/prose rows skip
        if (/^TC-/.test(id) && id !== 'TC-ID') rows.push({ id, file: f, us, coveredBy: '', klass: 'malformed' });
        continue; // header/separator/prose row → skip (BUG-2)
      }
      // header-resolved column beats position; fallback = second-to-last cell (trailing | present)
      const coveredBy = covIdx !== -1 && covIdx < cells.length ? cells[covIdx] : cells.length > 3 ? cells[cells.length - 2] : '';
      rows.push({ id, file: f, us, coveredBy, klass: classifyHandle(coveredBy) });
    }
  }
  return rows;
}

// The FIVE fixed Covered-by forms (traceability.md): automated / PROPOSED / manual /
// OPS-DEPLOY / DESIGN-REVIEW. Legacy free text containing "design-review" reads as form 5.
export function classifyHandle(cell) {
  const c = (cell || '').trim();
  if (/^OPS-DEPLOY:/.test(c)) return 'ops-deploy';
  if (/^DESIGN-REVIEW:/.test(c)) return 'design';
  if (/^PROPOSED:/.test(c)) return 'proposed';
  if (/^[—–-]?\s*\(manual\)/.test(c)) return 'manual'; // dash variants tolerated on read; write the canonical — (manual)
  if (/::/.test(c)) return 'automated'; // <path>::<name> — checked BEFORE the legacy fallback so a
  // file merely NAMED design-review.spec.ts stays automated + enforced (no laundering)
  if (/design-review/i.test(c)) return 'design'; // legacy FREE-TEXT cells only (no fixed form, no ::)
  return 'unknown';
}

// ── RUN PARSE — fold runner tests to one status per TC-ID ──────────────────────────
export function foldRun(results) {
  const perTc = new Map(); // tcId -> {passed,failed,skipped,ms,error}
  for (const t of results.tests || []) {
    const m = String(t.name || '').match(TC_TOKEN); // FIRST TC token in the full name (describe-prefixed names OK)
    if (!m) continue; // no TC-ID → per-function unit test or orphan test; not a spec case
    const s = perTc.get(m[0]) || { passed: 0, failed: 0, skipped: 0, ms: 0, error: '' };
    if (t.status === 'passed') s.passed++;
    else if (t.status === 'failed') { s.failed++; if (!s.error && t.error) s.error = String(t.error).slice(0, 200); }
    else s.skipped++;
    s.ms += Number(t.durationMs) || 0;
    perTc.set(m[0], s);
  }
  const folded = new Map();
  for (const [id, s] of perTc)
    folded.set(id, { status: s.failed ? 'failed' : s.skipped ? 'blocked' : 'passed', ms: s.ms, error: s.error });
  return folded;
}

// Normalize vitest/jest JSON → {tests:[{name,status}]}
export function normalizeRunnerJson(raw) {
  const j = JSON.parse(raw);
  if (Array.isArray(j.tests)) return j; // already normalized
  const tests = [];
  for (const tf of j.testResults || []) {
    for (const ar of tf.assertionResults || []) {
      tests.push({ name: ar.fullName || ar.title || '', status: ar.status, durationMs: ar.duration, error: (ar.failureMessages || [])[0] });
    }
  }
  return { tests };
}

// A handle whose file needs a live env (integration/e2e/smoke cadence) — lane-aware
// enforcement: in the unit lane a MISSING such test is env-pending, never broken.
// Cadence is a property of the FILE, so test only the path part (before ::) — a test
// NAME containing ".integration.spec." must not opt a unit handle into env-pending.
export const LIVE_CADENCE = /\.(integration|e2e|smoke)\.spec\./;
export const liveCadencePath = (handle) => String(handle || '').split('::')[0];

// ── the report + the enforcement ────────────────────────────────────────────────────
export function buildReport(specRows, folded, opts = {}) {
  const lane = opts.lane || 'full';
  const rows = [];
  const broken = [];
  const counters = { total: 0, passed: 0, failed: 0, blocked: 0, broken: 0, 'env-pending': 0, design: 0, 'not-written': 0, proposed: 0, manual: 0, 'ops-deploy': 0 };
  const dupSeen = new Map();
  for (const r of specRows) {
    counters.total++;
    if (r.klass === 'malformed') {
      counters.broken++;
      broken.push({ id: r.id, reason: 'first cell looks like a TC-ID but violates the frozen shape (authoring typo)' });
      rows.push({ ...r, status: 'broken', ms: 0, detail: 'malformed TC-ID' });
      continue;
    }
    if (dupSeen.has(r.id)) {
      // duplicate: flag + count as broken ONLY — never double-count in a status bucket
      broken.push({ id: r.id, reason: `duplicate TC-ID (also in ${dupSeen.get(r.id)})` });
      counters.broken++;
      rows.push({ ...r, status: 'broken', ms: 0, detail: 'duplicate TC-ID' });
      continue;
    }
    dupSeen.set(r.id, r.file);
    let status, ms = 0, detail = '';
    if (r.klass === 'automated') {
      const f = folded.get(r.id);
      if (!f && lane === 'unit' && LIVE_CADENCE.test(liveCadencePath(r.coveredBy))) {
        // its own CI lane verifies this handle; here it is covered-pending-env (never broken)
        status = 'env-pending'; counters['env-pending']++;
      }
      else if (!f) { status = 'broken'; counters.broken++; broken.push({ id: r.id, reason: 'Covered-by cites a test that did not run' }); }
      else {
        status = f.status; ms = f.ms; detail = f.error;
        if (status === 'failed') broken.push({ id: r.id, reason: 'Covered-by cites a FAILING test' });
        counters[status]++;
      }
    } else if (r.klass === 'proposed') { status = 'not-written'; counters.proposed++; counters['not-written']++; }
    else if (r.klass === 'manual') { status = 'manual'; counters.manual++; }
    else if (r.klass === 'ops-deploy') { status = 'ops-deploy'; counters['ops-deploy']++; }
    else if (r.klass === 'design') { status = 'design'; counters.design++; }
    else {
      // a fifth-form / free-text Covered-by cell is the exact ad-hoc-marker failure the
      // closed set exists to kill — flag it, never launder it into not-written.
      status = 'broken'; counters.broken++;
      broken.push({ id: r.id, reason: `Covered-by is not one of the five fixed forms: "${r.coveredBy}"` });
    }
    rows.push({ ...r, status, ms, detail });
  }
  // orphan IDs: ran with a TC token the spec doesn't know — flag (spec is the sole authority)
  const specIds = new Set(specRows.map((r) => r.id));
  const orphans = [...folded.keys()].filter((id) => !specIds.has(id));
  // density telemetry: cases per spec file + per US (best-effort)
  const perFile = {}; const perUs = {};
  for (const r of specRows) {
    perFile[r.file] = (perFile[r.file] || 0) + 1;
    if (r.us) perUs[r.us] = (perUs[r.us] || 0) + 1;
  }
  return { rows, broken, orphans, counters, density: { perFile, perUs } };
}

export function renderMarkdown(rep, meta = {}) {
  const L = [];
  const c = rep.counters;
  const automatedDen = c.total - c.manual - c['ops-deploy'] - c.design;
  const covered = c.passed + c['env-pending'] + c.design + c['ops-deploy'];
  L.push(`# QC report — ${meta.date || ''}`.trim(), '');
  L.push(`**Denominator**: ${c.total} enumerated spec cases (${automatedDen} automatable + ${c.manual} manual + ${c.design} design + ${c['ops-deploy']} ops-deploy). This number measures RESOLUTION of enumerated cases — it does NOT measure enumeration density; see the density table.`, '');
  L.push(`passed ${c.passed} · failed ${c.failed} · blocked ${c.blocked} · broken ${c.broken} · env-pending ${c['env-pending']} · design ${c.design} · not-written ${c['not-written']} · manual ${c.manual} · ops-deploy ${c['ops-deploy']} · **broken handles: ${rep.broken.length}**`, '');
  L.push(`**Covered** (= passed + env-pending + design + ops-deploy): ${covered}/${c.total} — env-pending handles are verified in their own CI lane, not this one.`, '');
  if (rep.broken.length) { L.push('## BROKEN HANDLES (gate red)', ''); for (const b of rep.broken) L.push(`- ${b.id} — ${b.reason}`); L.push(''); }
  if (rep.orphans && rep.orphans.length) { L.push('## ORPHAN TEST IDS (ran, but unknown to the spec)', ''); for (const o of rep.orphans) L.push(`- ${o}`); L.push(''); }
  L.push('## Cases', '', '| TC-ID | US | Status | Time (ms) | Covered-by | Failure detail |', '|---|---|---|---|---|---|');
  for (const r of rep.rows) L.push(`| ${r.id} | ${r.us || '—'} | ${r.status} | ${r.ms || '—'} | ${r.coveredBy} | ${(r.detail || '').replace(/\|/g, '\\|').replace(/\n/g, ' ') || '—'} |`);
  L.push('', '## Density (cases per US — under-derivation is visible here, not in the % above)', '', '| US | cases |', '|---|---|');
  for (const [us, n] of Object.entries(rep.density.perUs).sort()) L.push(`| ${us} | ${n} |`);
  return L.join('\n') + '\n';
}

async function main() {
  const a = parseArgs(process.argv.slice(2));
  if (!a.specs || !a.results) { console.error('usage: qc-report.mjs --specs <dir> --results <runner.json> [--out report.md] [--lane unit|full]'); process.exit(2); }
  // lane fails CLOSED: only the two known lanes are accepted — a typo ('unnit') or a
  // job label ('integration') must never silently un-enforce live handles.
  if (a.lane !== 'full' && a.lane !== 'unit') { console.error(`qc-report: unknown --lane "${a.lane}" (use unit|full)`); process.exit(2); }
  if (/(^|\/)(test-reports|bug-bash|audits)(\/|$)/.test(a.specs)) { console.error(`qc-report: --specs points at a generated tree, not specs: ${a.specs}`); process.exit(2); }
  statSync(a.specs); // throws if missing
  const specRows = scanSpecs(a.specs);
  const folded = foldRun(normalizeRunnerJson(readFileSync(a.results, 'utf8')));
  const rep = buildReport(specRows, folded, { lane: a.lane });
  const md = renderMarkdown(rep, { date: new Date().toISOString().slice(0, 10) });
  if (a.out) {
    // path validator (§2 MUST): date-first YYYY-MM-DD/… (canonical), summary/ rollups,
    // or the legacy epic-first EPIC-NN/MMDDYYYY/ — reject drift before writing.
    const PATH_OK = [
      /test-reports\/\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\/auto-coverage\.md$/,
      /test-reports\/\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\/report(-manual|-notes)?\.md$/, // date-level manual/notes (field shape)
      /test-reports\/\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\/EPIC-[0-9A-Z]+\/report(-manual|-notes)?\.md$/,
      /test-reports\/\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\/EPIC-[0-9A-Z]+\/US-[\d.]+\/(api|functional)-test-cases\.md$/,
      /test-reports\/summary\/(system-test-report|us-coverage-summary)\.md$/,
      /test-reports\/EPIC-[0-9A-Z]+\/(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[0-9]{4}\/report(-manual|-notes)?\.md$/, // legacy
    ];
    if (/test-reports\//.test(a.out) && !PATH_OK.some((re) => re.test(a.out))) {
      console.error(`qc-report: --out violates the report-path contract (date-first YYYY-MM-DD/…, summary/, or legacy EPIC-NN/MMDDYYYY/): ${a.out}`);
      process.exit(2);
    }
    writeFileSync(a.out, md);
  } else process.stdout.write(md);
  if (rep.broken.length) { console.error(`qc-report: ${rep.broken.length} broken handle(s) — gate red`); process.exit(1); }
}

// run only when invoked directly (import-safe for the self-test)
if (import.meta.url === `file://${process.argv[1]}`) main();
