// Copyright 2019-2022 @subwallet/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Some issues are closed COMPLETED but the work was done under ANOTHER issue — the closing comment
// says "Resolved in #N", "Fixed by #N", "Done in #N" (or Vietnamese: "gộp vào #N", "làm ở #N").
// Those issues have no [Issue-N] commit and no CHANGELOG line of their own, so version_shipped is
// blank even though they shipped — via #N. This script finds that pointer so the generator can
// inherit #N's release (labelled "shipped via #N", never as the story's own commit).
//
// It emits ONLY the human pointer { sourceIssue: targetIssue }. The generator resolves the target's
// version (CHANGELOG or its commit's first release tag) — that half is git, and lives there.
//
// Precision over recall: the verb must be immediately followed by a connective and the number
// ("resolved in #N", not "related issue #N" or "resolve the bug on #N"). A loose match paired
// #1947 with an unrelated PR once (LESSONS §69); we do not repeat it for issues.
//
// Input:  /tmp/all2.json (the gh cache), git history, docs/CHANGELOG.md — to find the tracker-only
//         closed issues that need a pointer.
// Output: /tmp/issue-pointers.json — { "<source>": <target> }.
//
// Usage: node scripts/koni-docs-fetch-issue-pointers.mjs

import fs from 'fs';
import { spawnSync } from 'child_process';

const all = JSON.parse(fs.readFileSync('/tmp/all2.json', 'utf8'));

// issues that already have code evidence — a [Issue-N] commit or a CHANGELOG cite — need no pointer
const gitLog = spawnSync('git', ['log', '--all', '--no-merges', '--format=%s'], { encoding: 'utf8', maxBuffer: 1 << 29 }).stdout || '';
const hasCommit = new Set();

for (const m of gitLog.matchAll(/\[Issue-#?(\d{2,5})\]/g)) hasCommit.add(Number(m[1]));

const cl = fs.readFileSync('docs/CHANGELOG.md', 'utf8');
const cited = new Set();
let koni = false;

for (const ln of cl.split('\n')) {
  if (ln.startsWith('## [')) { koni = /\(Koni\)/.test(ln); continue; }

  if (koni) for (const m of ln.matchAll(/#(\d{2,5})/g)) cited.add(Number(m[1]));
}

const candidates = all
  .filter((o) => o.state === 'CLOSED' && o.stateReason === 'COMPLETED' && !hasCommit.has(o.number) && !cited.has(o.number))
  .map((o) => o.number);

// tight resolution pointers — verb + connective + #N, English and Vietnamese
const RES = [
  /\b(?:done|fixed|resolved|implemented|merged|completed|closed|handled|covered|addressed|moved|migrated|split)\s+(?:in|by|to|into|via|under|on)\s+(?:pr\s*)?#(\d{2,5})/gi,
  /\bduplicat\w*\s+(?:of|in|by|to)\s+#(\d{2,5})/gi,
  /\b(?:l[àa]m|x[ửu]\s*l[ýíy]|fix|done|xong|ho[àa]n\s*th[àa]nh)\s+(?:[ởo]|t[ạa]i|v[àa]o|sang|trong|in|by)\s+#(\d{2,5})/giu,
  /\b(?:g[ộo]p|chuy[ểe]n|tr[ùu]ng|t[áa]ch)\s+(?:v[àa]o|sang|v[ớo]i|qua)?\s*#(\d{2,5})/giu
];

const chunk = (a, n) => a.reduce((r, _, i) => (i % n ? r : [...r, a.slice(i, i + n)]), []);
const pointers = {};
let done = 0;

for (const batch of chunk(candidates, 40)) {
  const aliases = batch.map((n, i) => `a${i}: issue(number:${n}){number bodyText comments(first:40){nodes{bodyText}}}`).join(' ');
  const q = `{repository(owner:"Koniverse",name:"SubWallet-Extension"){${aliases}}}`;
  const r = spawnSync('gh', ['api', 'graphql', '-f', `query=${q}`], { encoding: 'utf8', maxBuffer: 1 << 27 });

  if (r.status !== 0) { console.error('GraphQL batch failed:', r.stderr.slice(0, 300)); process.exit(1); }

  const rep = JSON.parse(r.stdout).data.repository;

  for (const k of Object.keys(rep)) {
    const o = rep[k];

    if (!o) continue;

    const body = [o.bodyText || '', ...o.comments.nodes.map((c) => c.bodyText || '')].join('\n');
    let target = null;

    // last matching pointer wins — the resolution comment is usually the final word
    for (const re of RES) for (const m of body.matchAll(re)) { const n = Number(m[1]); if (n !== o.number) target = n; }

    if (target) pointers[o.number] = target;
  }

  done += batch.length;
  process.stderr.write(`\r  scanned ${done}/${candidates.length}`);
}

process.stderr.write('\n');
fs.writeFileSync('/tmp/issue-pointers.json', JSON.stringify(pointers));
console.log(`tracker-only candidates: ${candidates.length} · resolution pointers found: ${Object.keys(pointers).length}`);
