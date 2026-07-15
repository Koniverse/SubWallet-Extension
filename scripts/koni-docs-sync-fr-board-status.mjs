// Copyright 2019-2022 @subwallet/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

// One-time assisted sync: hand-authored FR stories whose issue the GitHub Projects
// board has In Review / Implementing / Ready, but whose doc status still says
// `backlog`. Only the frontmatter `status`, `sprint`, `updated` fields change, plus a
// dated refresh note — never the body, AC, or reasoning. It only ever promotes a
// `backlog` story to the board's active state, so a re-run is a no-op and it can never
// silently override a status a human set to something else.
//
// Usage: node scripts/koni-docs-sync-fr-board-status.mjs   (needs /tmp/board.json)

import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const DOCS = path.join(ROOT, 'docs');
const TODAY = '2026-07-15';
const ACTIVE_SPRINT = 'sprint-2026-W28';

const board = new Map(
  JSON.parse(fs.readFileSync('/tmp/board.json', 'utf8'))
    .filter((o) => o.repo === 'SubWallet-Extension')
    .map((o) => [o.num, o])
);

// board status → koni-docs status, with a rank so a story takes its furthest-along issue
const MAP = { 'In Review': 'review', 'In Testing': 'review', Implementing: 'in-progress', 'Follow Up': 'in-progress', 'Ready to Implement': 'ready', 'Ready to build': 'ready' };
const RANK = { ready: 1, 'in-progress': 2, review: 3 };
const parseIter = (s) => { const m = (s || '').match(/Week (\d+) - (\d{4})/); return m ? `sprint-${m[2]}-W${m[1].padStart(2, '0')}` : null; };

const storyDir = path.join(DOCS, 'sprints/stories');
const synced = [];

for (const f of fs.readdirSync(storyDir).filter((x) => x.endsWith('.md'))) {
  const p = path.join(storyDir, f);
  const t = fs.readFileSync(p, 'utf8');

  if (t.includes('generated_by:')) continue; // hand-authored FR stories only

  const fm = t.split('---')[1];
  const cur = (fm.match(/^status:\s*(.*)$/m) || [])[1]?.trim();

  if (cur !== 'backlog') continue; // only promote backlog; never touch done/review/etc.

  // the story's furthest-along board issue
  const issues = [...new Set([...t.matchAll(/\/issues\/(\d+)\)/g)].map((m) => Number(m[1])))];
  let best = null;

  for (const n of issues) {
    const bs = board.get(n);
    const mapped = bs && MAP[bs.status];

    if (mapped && (!best || RANK[mapped] > RANK[best.status])) best = { status: mapped, board: bs.status, iter: bs.iter, num: n };
  }

  if (!best) continue;

  const sprint = parseIter(best.iter) || ACTIVE_SPRINT;
  const id = (fm.match(/^id:\s*(US-[\d.]+)/m) || [])[1];

  // frontmatter: status, sprint (fill if empty), updated
  let out = t
    .replace(/^status:\s*backlog\s*$/m, `status: ${best.status}`)
    .replace(/^updated:.*$/m, `updated: ${TODAY}`);

  out = /^sprint:\s*\S/m.test(fm)
    ? out.replace(/^sprint:.*$/m, `sprint: ${sprint}`)
    : out.replace(/^sprint:\s*$/m, `sprint: ${sprint}`);

  // dated refresh note after frontmatter (idempotent — replaced if already present)
  const note = `\n## Status refresh — ${TODAY}\n\n> Synced from GitHub Projects board #2 ("SubWallet.App – Development"): issue #${best.num} is **${best.board}** there, so this story moves \`backlog\` → \`${best.status}\` (sprint \`${sprint}\`). Only status/sprint changed; Goal, AC and reasoning below are untouched. The board is the live source for workflow state.\n`;
  const parts = out.split(/\n---\n/);

  parts[1] = parts[1].replace(/\n## Status refresh — \d{4}-\d{2}-\d{2}\n[\s\S]*?(?=\n## )/, '\n');
  out = parts[0] + '\n---\n' + note + parts.slice(1).join('\n---\n');

  fs.writeFileSync(p, out);
  synced.push(`${id}  backlog → ${best.status}  (#${best.num} ${best.board})`);
}

console.log(`synced ${synced.length} FR stories from the board:`);
synced.sort().forEach((s) => console.log(`  ${s}`));
