// Pulls the logged AI chat questions and answers out of the Cloudflare D1 database into one
// review file, so the assistant can be improved from real use:
//   - not helpful (thumbs down): fix the instructions in functions/api/faq-chat.js or the content
//   - no answer / budget: add to the FAQ (content/**) so the assistant can answer next time
//   - helpful (thumbs up): good answers, candidates for example answers in the instructions
//   - most asked: what visitors want to know first
//
//   node scripts/faq-export.mjs <d1-database-name> [days=90]
//
// Needs `wrangler` to be logged in (npx wrangler login). Writes faq-reports/faq-<date>.md and
// faq-reports/faq-<date>.jsonl (all rows, one JSON object per line, e.g. for later fine tuning).
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

const db = process.argv[2];
const days = Number(process.argv[3] ?? 90);
if (!db) {
  console.error("Usage: node scripts/faq-export.mjs <d1-database-name> [days=90]");
  process.exit(1);
}

const sql = `SELECT created_at, lang, page, question, answer, outcome, rating, top_match, top_score
  FROM faq_questions WHERE created_at >= datetime('now', '-${Math.max(1, Math.floor(days))} days')
  ORDER BY created_at DESC`;
const out = execFileSync("npx", ["wrangler", "d1", "execute", db, "--remote", "--json", "--command", sql], {
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
});
const rows = JSON.parse(out)?.[0]?.results ?? [];

const clip = (t, n = 400) => (t && t.length > n ? `${t.slice(0, n)}...` : (t ?? ""));
const block = (r) =>
  `- **${r.question}** (${r.lang}, ${r.page ?? "?"}, ${r.created_at})\n  ${clip(r.answer) || "(no stored answer)"}\n`;

const bad = rows.filter((r) => r.rating === -1);
const good = rows.filter((r) => r.rating === 1);
const gaps = rows.filter((r) => r.outcome !== "ai" && r.outcome !== "clarify");
const counts = new Map();
for (const r of rows) {
  const k = r.question.toLowerCase().trim();
  counts.set(k, (counts.get(k) ?? 0) + 1);
}
const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25);

const date = new Date().toISOString().slice(0, 10);
const md = `# AI chat review ${date}

${rows.length} questions in the last ${days} days. ${good.length} helpful, ${bad.length} not helpful.

## Not helpful (fix these first)
${bad.map(block).join("\n") || "None yet.\n"}
## Without an AI answer (budget reached, error): add to the FAQ
${gaps.map(block).join("\n") || "None.\n"}
## Most asked
${top.map(([q, n]) => `- ${n}x ${q}`).join("\n")}

## Helpful (candidates for example answers)
${good.map(block).join("\n") || "None yet.\n"}`;

mkdirSync("faq-reports", { recursive: true });
writeFileSync(`faq-reports/faq-${date}.md`, md);
writeFileSync(`faq-reports/faq-${date}.jsonl`, rows.map((r) => JSON.stringify(r)).join("\n"));
console.log(`faq-reports/faq-${date}.md (${rows.length} rows)`);
