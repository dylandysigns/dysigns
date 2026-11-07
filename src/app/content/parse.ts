// Build-time markdown parsing for content/**/*.md.
//
// Runs only in Node, inside the `dysigns-content` Vite plugin
// (vite.config.ts), for both the client build and scripts/prerender.mjs.
// The browser receives finished HTML via the `virtual:content` module, so
// `marked` is no longer shipped and nothing is parsed on page load.

import { marked } from "marked";
import { parseFrontmatter, type Frontmatter } from "./frontmatter";
import type { FaqItem } from "../seo/schema";
import { crawlHref } from "../seo/href";

// Internal links written in markdown get the same crawlable href as
// TransitionLink, so they don't point at a URL that answers with a 308.
marked.use({
  walkTokens(token) {
    if (token.type === "link") token.href = crawlHref(token.href);
  },
});

export interface ParsedEntry {
  frontmatter: Frontmatter;
  bodyHtml: string;
  /** Only kept for files whose sections are picked apart in code (see
   * RAW_BODY_FILES); "" for the rest, to keep raw markdown out of the
   * bundle where nothing reads it. */
  rawBody: string;
  faqItems: FaqItem[];
}

/** Files read section-by-section via getProcessSteps, getAfterLaunchContent,
 * getServiceIncludes and getSectionParagraph. Add a pattern here if a new
 * page starts reading `entry.rawBody`. */
export const RAW_BODY_FILES = [/\/content\/home(\.nl)?\.md$/, /\/content\/services\//];

// Pulls the "## Veelgestelde vragen" section out of the raw markdown body
// and splits it into {question, answer} pairs on its "### " sub-headings.
// Placeholder sections (a single TODO_DYLAN line, no "### " questions)
// correctly yield an empty array — there's nothing to structure yet.
const FAQ_HEADINGS = ["## Frequently asked questions", "## Veelgestelde vragen"];

function extractFaqItems(markdownBody: string): FaqItem[] {
  // Split the whole body on every top-level "## " heading, then find the
  // chunk whose heading is "Frequently asked questions" — avoids the
  // multiline `$`-in-lookahead trap (it matches at every line end, not
  // just the section boundary, so a lazy capture up to it grabs nothing).
  // Structural pages (services, home) keep this heading in English even
  // in their .nl.md file, since they never render the raw heading text
  // (it's replaced by a translated JSX label) — but pages that render
  // their markdown body directly, like insights articles, need the
  // heading to actually be in the reader's language, so both variants
  // are accepted here.
  const sections = markdownBody.split(/\r?\n(?=## )/);
  const faqHeading = FAQ_HEADINGS.find((h) => sections.some((s) => s.startsWith(h)));
  if (!faqHeading) return [];
  const faqSection = sections.find((s) => s.startsWith(faqHeading))!;

  const section = faqSection.replace(new RegExp(`^${faqHeading}\\r?\\n?`), "");
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

export function parseEntry(path: string, raw: string): ParsedEntry {
  const { frontmatter, body } = parseFrontmatter(raw);
  return {
    frontmatter,
    bodyHtml: marked.parse(body, { async: false }) as string,
    rawBody: RAW_BODY_FILES.some((re) => re.test(path)) ? body : "",
    faqItems: extractFaqItems(body),
  };
}
