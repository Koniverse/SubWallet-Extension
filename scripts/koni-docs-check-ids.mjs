// Copyright 2019-2022 @subwallet/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Every ID named anywhere in the doc surface must resolve — prose included.
//
// `npx koni-docs validate` only reads frontmatter, so an ID cited in a sentence
// can name a document that does not exist and nothing notices. That is how three
// files came to cite a deferred story by number that was never written.
// See AGENTS.md §7 rule 7.
//
// Usage: node scripts/koni-docs-check-ids.mjs   (exit 1 on any dangling ID)

import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const DOCS = path.join(ROOT, 'docs');

// A dated file under notes/ is a snapshot of a moment — it correctly names the
// IDs that were true then (e.g. the renumber note records the pre-renumber IDs).
// superpowers/ holds planning artifacts from before the docs program. Both are
// archives: read-only history, not the live surface. Skipped, and reported.
const isArchive = (rel) =>
  /^docs\/notes\/\d{4}-\d{2}-\d{2}-/.test(rel) || rel.startsWith('docs/superpowers/');

function walk (dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);

    if (e.isDirectory()) return walk(p);

    return e.isFile() && e.name.endsWith('.md') ? [p] : [];
  });
}

const rel = (p) => path.relative(ROOT, p);

// ---- what exists -----------------------------------------------------------

const ls = (d, re) => fs.existsSync(d)
  ? fs.readdirSync(d).map((f) => (f.match(re) || [])[1]).filter(Boolean)
  : [];

const prd = fs.readFileSync(path.join(DOCS, 'PRD.md'), 'utf8');
const arch = fs.readFileSync(path.join(DOCS, 'ARCHITECTURE.md'), 'utf8');

// A row may be live (`| FR-7 |`) or a tombstone (`| ~~NFR-11~~ |`). A retired ID
// still exists — it is retired, never reused (rule 1) — so both count.
const rows = (src, kind) =>
  [...src.matchAll(new RegExp(`^\\|\\s*~{0,2}\\*{0,2}(${kind}-\\d+)`, 'gm'))].map((m) => m[1]);

const EXISTS = {
  AD: new Set(rows(arch, 'AD')),
  EPIC: new Set(ls(path.join(DOCS, 'sprints/epics'), /^(EPIC-\d+)\.md$/)),
  FR: new Set(rows(prd, 'FR')),
  NFR: new Set(rows(prd, 'NFR')),
  US: new Set(ls(path.join(DOCS, 'sprints/stories'), /^(US-\d+\.\d+)/)),
  sprint: new Set(ls(path.join(DOCS, 'sprints'), /^(sprint-\d{4}-[WM]\d{2})\.md$/))
};

// FR-\d+ also matches inside NFR-\d+, so NFR is tried first and FR excludes a
// preceding N.
const PATTERNS = [
  ['US', /\bUS-\d+\.\d+\b/g],
  ['EPIC', /\bEPIC-\d+\b/g],
  ['sprint', /\bsprint-\d{4}-[WM]\d{2}\b/g],
  ['NFR', /\bNFR-\d+\b/g],
  ['FR', /(?<!N)\bFR-\d+\b/g],
  ['AD', /\bAD-\d+\b/g]
];

// ---- what is named ---------------------------------------------------------

const targets = [...walk(DOCS), path.join(ROOT, 'AGENTS.md'), path.join(ROOT, 'CLAUDE.md')]
  .filter(fs.existsSync);
const dangling = new Map(); // id -> Set("file:line")
const archived = [];
let scanned = 0;

for (const file of targets) {
  const r = rel(file);

  if (isArchive(r)) {
    archived.push(r);
    continue;
  }

  scanned++;

  fs.readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    for (const [kind, re] of PATTERNS) {
      for (const [id] of line.matchAll(re)) {
        if (EXISTS[kind].has(id)) {
          continue;
        }

        if (!dangling.has(id)) {
          dangling.set(id, new Set());
        }

        dangling.get(id).add(`${r}:${i + 1}`);
      }
    }
  });
}

// ---- report ----------------------------------------------------------------

const n = (k) => EXISTS[k].size;

console.log(`koni-docs-check-ids — ${scanned} files scanned, ${archived.length} archives skipped\n`);
console.log(`  known: ${n('US')} US · ${n('EPIC')} epic · ${n('sprint')} sprint · ${n('FR')} FR · ${n('NFR')} NFR · ${n('AD')} AD\n`);

if (!dangling.size) {
  console.log('  ✓ every ID named in the doc surface resolves');
  process.exit(0);
}

console.log(`  ✗ ${dangling.size} dangling ID(s) — named in prose, no such document:\n`);

for (const id of [...dangling.keys()].sort()) {
  console.log(`    ${id}`);
  [...dangling.get(id)].sort().forEach((w) => console.log(`      ${w}`));
}

console.log('\n  An ID that names nothing is a claim with no referent. Either write the');
console.log('  document, or describe the thing without minting an ID for it.');
process.exit(1);
