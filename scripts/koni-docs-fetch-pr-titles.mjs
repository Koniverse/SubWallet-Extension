// Copyright 2019-2022 @subwallet/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Build /tmp/pr-titles.json — the title of every PR that GitHub's `closedByPullRequestsReferences`
// links to a tracker issue. The generator uses it to KEEP ONLY the genuine links.
//
// Why: GitHub's `closedByPullRequestsReferences` is loose — it returns PRs that merely mention an
// issue, PRs that reference a *different* issue, and it is even inconsistent over time. Empirically
// 141 of 341 done-story links (41%) named a PR about another issue entirely. The reliable signal is
// the `[Issue-N]` tag the developer puts in the PR title (the same convention the commit tier
// already trusts): a link survives only if the PR title declares an issue the story owns. See
// CONTEXT D108 (PR-link correction, 2026-07-15).
//
// Input:  /tmp/pr.json — each issue's `closedByPullRequestsReferences` (number + node id).
// Output: /tmp/pr-titles.json — { "<pr number>": "<title>" }.
//
// Batches 100 PR node IDs per GraphQL call. Re-run when /tmp/pr.json is refreshed, then re-run
// koni-docs-gen-maintenance.mjs.
//
// Usage: node scripts/koni-docs-fetch-pr-titles.mjs

import fs from 'fs';
import { spawnSync } from 'child_process';

const pr = JSON.parse(fs.readFileSync('/tmp/pr.json', 'utf8'));
const idByNum = new Map();

for (const o of pr) {
  for (const p of (o.closedByPullRequestsReferences || [])) idByNum.set(p.number, p.id);
}

const ids = [...idByNum.values()];
const out = {};
const chunk = (a, n) => a.reduce((r, _, i) => (i % n ? r : [...r, a.slice(i, i + n)]), []);
let done = 0;

for (const batch of chunk(ids, 100)) {
  const list = batch.map((id) => `"${id}"`).join(',');
  const q = `{nodes(ids:[${list}]){... on PullRequest{number title}}}`;
  const r = spawnSync('gh', ['api', 'graphql', '-f', `query=${q}`], { encoding: 'utf8', maxBuffer: 1 << 26 });

  if (r.status !== 0) {
    console.error('GraphQL batch failed:', r.stderr.slice(0, 300));
    process.exit(1);
  }

  for (const n of JSON.parse(r.stdout).data.nodes) {
    if (n && n.number) out[n.number] = n.title;
  }

  done += batch.length;
  process.stderr.write(`\r  fetched ${done}/${ids.length}`);
}

process.stderr.write('\n');
fs.writeFileSync('/tmp/pr-titles.json', JSON.stringify(out));
console.log(`PR titles resolved: ${Object.keys(out).length}`);
