// Loads content/**/*.md at build time via Vite's native `?raw` import
// (no bundler plugin needed) and parses frontmatter + markdown body once.
// Works identically in the browser bundle and under Node during
// scripts/prerender.mjs, since both go through Vite's module graph.

import { marked } from "marked";
import { parseFrontmatter, type Frontmatter } from "./frontmatter";
import type { FaqItem } from "../seo/schema";

export interface ContentEntry {
  frontmatter: Frontmatter;
  bodyHtml: string;
  /** Real question/answer pairs found under "## Veelgestelde vragen",
   * extracted from the raw markdown (fase 5) — empty until a page has
   * actual FAQ copy, not TODO_DYLAN placeholders. Used to drive
   * faqPageSchema() (fase 4) without a separate content format. */
  faqItems: FaqItem[];
}

// Pulls the "## Veelgestelde vragen" section out of the raw markdown body
// and splits it into {question, answer} pairs on its "### " sub-headings.
// Placeholder sections (a single TODO_DYLAN line, no "### " questions)
// correctly yield an empty array — there's nothing to structure yet.
function extractFaqItems(markdownBody: string): FaqItem[] {
  // Split the whole body on every top-level "## " heading, then find the
  // chunk whose heading is "Veelgestelde vragen" — avoids the multiline
  // `$`-in-lookahead trap (it matches at every line end, not just the
  // section boundary, so a lazy capture up to it grabs nothing at all).
  const sections = markdownBody.split(/\r?\n(?=## )/);
  const faqSection = sections.find((s) => s.startsWith("## Veelgestelde vragen"));
  if (!faqSection) return [];

  const section = faqSection.replace(/^## Veelgestelde vragen\r?\n?/, "");
  const items: FaqItem[] = [];
  const questionBlocks = section.split(/(?=^### )/m).filter((b) => b.trim());

  for (const block of questionBlocks) {
    const qMatch = block.match(/^### (.+)\r?\n([\s\S]*)$/);
    if (!qMatch) continue;
    const question = qMatch[1].trim();
    const answer = qMatch[2].trim().replace(/\s+/g, " ");
    if (question && answer && !answer.includes("TODO_DYLAN")) {
      items.push({ question, answer });
    }
  }
  return items;
}

const rawModules = import.meta.glob("/content/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const entriesByPath = new Map<string, ContentEntry>();

for (const [path, raw] of Object.entries(rawModules)) {
  const { frontmatter, body } = parseFrontmatter(raw);
  entriesByPath.set(path, {
    frontmatter,
    bodyHtml: marked.parse(body, { async: false }) as string,
    faqItems: extractFaqItems(body),
  });
}

function findByPathSuffix(suffix: string): ContentEntry | undefined {
  for (const [path, entry] of entriesByPath) {
    if (path.endsWith(suffix)) return entry;
  }
  return undefined;
}

export function getContent(relativePath: string): ContentEntry {
  const entry = findByPathSuffix(`/content/${relativePath}`);
  if (!entry) {
    throw new Error(`Content file not found: content/${relativePath}`);
  }
  return entry;
}

export function getCaseSlugs(): string[] {
  return Array.from(entriesByPath.keys())
    .filter((path) => path.includes("/content/cases/"))
    .map((path) => path.split("/").pop()!.replace(/\.md$/, ""));
}

export function getAllCases(): ContentEntry[] {
  return getCaseSlugs()
    .map((slug) => getContent(`cases/${slug}.md`))
    .sort((a, b) => a.frontmatter.title.localeCompare(b.frontmatter.title));
}
