#!/usr/bin/env node
// Google Search Console rapport: laatste 28 dagen tegenover de 28 dagen ervoor.
// Gebruik: node scripts/gsc-report.mjs [--site=sc-domain:dylandysigns.com] [--days=28] [--save]
// Auth: gcloud application-default login (alleen lezen, geen sleutelbestand nodig).
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  }),
);
const DAYS = Number(args.days || 28);
const GCLOUD = process.env.GCLOUD || join(homedir(), 'google-cloud-sdk/bin/gcloud');
const PY = process.env.CLOUDSDK_PYTHON || join(homedir(), '.local/share/uv/python/cpython-3.12-macos-aarch64-none/bin/python3.12');

const token = execFileSync(GCLOUD, ['auth', 'application-default', 'print-access-token'], {
  env: { ...process.env, CLOUDSDK_PYTHON: PY },
}).toString().trim();
const project = execFileSync(GCLOUD, ['config', 'get-value', 'project'], {
  env: { ...process.env, CLOUDSDK_PYTHON: PY },
}).toString().trim();

const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
  'x-goog-user-project': project,
};

async function api(url, body) {
  const res = await fetch(url, { method: body ? 'POST' : 'GET', headers, body: body && JSON.stringify(body) });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

const sites = (await api('https://www.googleapis.com/webmasters/v3/sites')).siteEntry || [];
const site = args.site || sites.find((s) => /dylandysigns\.com/.test(s.siteUrl))?.siteUrl;
if (!site) {
  console.error('Geen property gevonden voor dylandysigns.com. Beschikbaar:', sites.map((s) => s.siteUrl));
  process.exit(1);
}

const iso = (d) => d.toISOString().slice(0, 10);
const daysAgo = (n) => new Date(Date.now() - n * 864e5);
// Search Console data loopt ongeveer 2 dagen achter.
const curEnd = daysAgo(3), curStart = daysAgo(3 + DAYS - 1);
const prevEnd = daysAgo(3 + DAYS), prevStart = daysAgo(3 + 2 * DAYS - 1);

const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`;
const q = (start, end, dimensions, rowLimit = 25) =>
  api(endpoint, { startDate: iso(start), endDate: iso(end), dimensions, rowLimit, dataState: 'final' }).then((r) => r.rows || []);

const [curTot, prevTot] = await Promise.all([q(curStart, curEnd, []), q(prevStart, prevEnd, [])]);
const [curQ, prevQ, curP, prevP] = await Promise.all([
  q(curStart, curEnd, ['query'], 50), q(prevStart, prevEnd, ['query'], 250),
  q(curStart, curEnd, ['page'], 30), q(prevStart, prevEnd, ['page'], 250),
]);

const pct = (a, b) => (b ? `${(((a - b) / b) * 100).toFixed(0)}%` : 'nieuw');
const tot = (r) => r[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 };
const c = tot(curTot), p = tot(prevTot);

const lines = [];
lines.push(`# Search Console rapport: ${site}`);
lines.push(`Periode: ${iso(curStart)} t/m ${iso(curEnd)} tegenover ${iso(prevStart)} t/m ${iso(prevEnd)}\n`);
lines.push('| Maat | Nu | Ervoor | Verschil |', '|---|---|---|---|');
lines.push(`| Klikken | ${c.clicks} | ${p.clicks} | ${pct(c.clicks, p.clicks)} |`);
lines.push(`| Vertoningen | ${c.impressions} | ${p.impressions} | ${pct(c.impressions, p.impressions)} |`);
lines.push(`| CTR | ${(c.ctr * 100).toFixed(1)}% | ${(p.ctr * 100).toFixed(1)}% | |`);
lines.push(`| Gem. positie | ${c.position.toFixed(1)} | ${p.position.toFixed(1)} | ${(p.position - c.position).toFixed(1)} plekken (positief = beter) |`);

const table = (title, cur, prev) => {
  const prevMap = new Map(prev.map((r) => [r.keys[0], r]));
  lines.push(`\n## ${title}`, '| Item | Klikken | Vertoningen | Positie nu | Positie ervoor |', '|---|---|---|---|---|');
  for (const r of cur) {
    const o = prevMap.get(r.keys[0]);
    lines.push(`| ${r.keys[0].replace('https://dylandysigns.com', '')} | ${r.clicks} | ${r.impressions} | ${r.position.toFixed(1)} | ${o ? o.position.toFixed(1) : 'nieuw'} |`);
  }
};
table('Top zoektermen', curQ, prevQ);
table('Top pagina\'s', curP, prevP);

const out = lines.join('\n');
console.log(out);
if (args.save) {
  const dir = join(process.cwd(), 'seo-reports');
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `gsc-${iso(new Date())}.md`);
  writeFileSync(file, out + '\n');
  console.error(`\nOpgeslagen: ${file}`);
}
