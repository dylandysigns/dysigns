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
  /** Raw markdown body (pre-HTML), for components that need to parse out
   * a specific section themselves (getProcessSteps, getAfterLaunchContent)
   * rather than rendering the whole body as one prose blob. */
  rawBody: string;
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

// Generic "## Heading" section extractor, same split-on-every-"## "
// approach as extractFaqItems (avoids the multiline `$`-in-lookahead
// trap noted above). Returns the raw markdown body of that section, or
// null if the heading doesn't exist.
function extractSection(markdownBody: string, heading: string): string | null {
  const sections = markdownBody.split(/\r?\n(?=## )/);
  const match = sections.find((s) => s.startsWith(`## ${heading}`));
  if (!match) return null;
  return match.replace(new RegExp(`^## ${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\r?\\n?`), "").trim();
}

export interface ProcessStep {
  number: string;
  title: string;
  body: string;
}

/** Parses the numbered "### 1. Discover" / "### 2. Define" ... sub-headings
 * under "## How we work" into {number, title, body} — used by the
 * homepage Process section. Reads content/home.md directly rather than
 * duplicating the six steps as separate hardcoded data, so the step
 * text has one source of truth. */
export function getProcessSteps(markdownBody: string): ProcessStep[] {
  const section = extractSection(markdownBody, "How we work");
  if (!section) return [];
  const blocks = section.split(/(?=^### )/m).filter((b) => b.trim());
  const steps: ProcessStep[] = [];
  for (const block of blocks) {
    const match = block.match(/^### (\d+)\.\s*(.+)\r?\n([\s\S]*)$/);
    if (!match) continue;
    steps.push({
      number: match[1],
      title: match[2].trim(),
      body: match[3].trim().replace(/\s+/g, " "),
    });
  }
  return steps;
}

export interface AfterLaunchContent {
  heading: string;
  body: string;
  points: { label: string; href: string }[];
}

/** Parses "## Launch is the start, not the finish" into its paragraph
 * plus the three "- [Label](/href)" bullet points underneath. */
export function getAfterLaunchContent(markdownBody: string): AfterLaunchContent | null {
  const section = extractSection(markdownBody, "Launch is the start, not the finish");
  if (!section) return null;
  const lines = section.split(/\r?\n/);
  const bodyLines: string[] = [];
  const points: { label: string; href: string }[] = [];
  for (const line of lines) {
    const linkMatch = line.match(/^-\s*\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      points.push({ label: linkMatch[1], href: linkMatch[2] });
    } else if (line.trim()) {
      bodyLines.push(line.trim());
    }
  }
  return {
    heading: "Launch is the start, not the finish",
    body: bodyLines.join(" "),
    points,
  };
}

export interface ServiceIncludeItem {
  title: string;
  description: string;
  /** Present when a carousel slide should link somewhere (e.g. the
   * service-page carousel showing other services) — absent for the
   * plain "what this includes" list, which isn't a link target. */
  href?: string;
}

/** Parses the "### Title" sub-headings (and their one-line paragraph)
 * under "## What this includes" — used by the service-page carousel.
 * Reads each service's own content/services/*.md rather than a separate
 * hand-maintained slide list, so title and description can never drift
 * out of sync with what the page itself says. */
export function getServiceIncludes(markdownBody: string): ServiceIncludeItem[] {
  const section = extractSection(markdownBody, "What this includes");
  if (!section) return [];
  const blocks = section.split(/(?=^### )/m).filter((b) => b.trim());
  const items: ServiceIncludeItem[] = [];
  for (const block of blocks) {
    const match = block.match(/^### (.+)\r?\n([\s\S]*)$/);
    if (!match) continue;
    items.push({
      title: match[1].trim(),
      description: match[2].trim().replace(/\s+/g, " "),
    });
  }
  return items;
}

/** Plain single-paragraph section (e.g. "Who it is for") — returns the
 * section's text with line-wrapping collapsed, or null if the heading
 * isn't present. Used on service pages so this copy can be laid out
 * deliberately instead of dumped as generic prose. */
export function getSectionParagraph(markdownBody: string, heading: string): string | null {
  const section = extractSection(markdownBody, heading);
  if (!section) return null;
  return section.trim().replace(/\s+/g, " ");
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
    rawBody: body,
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

/** Locale-aware content lookup — tries `{relativePath}` with `.nl.md`
 * instead of `.md` for Dutch, falls back to the English file if no Dutch
 * translation exists yet for that path. Keeps English the guaranteed
 * default (nothing regresses for paths without a translation) while
 * letting individual pages opt into a real NL version as it's written. */
export function getLocalizedContent(relativePath: string, lang: "en" | "nl"): ContentEntry {
  if (lang === "nl") {
    const nlPath = relativePath.replace(/\.md$/, ".nl.md");
    const nlEntry = findByPathSuffix(`/content/${nlPath}`);
    if (nlEntry) return nlEntry;
  }
  return getContent(relativePath);
}

export function getCaseSlugs(): string[] {
  return Array.from(entriesByPath.keys())
    .filter((path) => path.includes("/content/work/"))
    .map((path) => path.split("/").pop()!.replace(/\.md$/, ""));
}

export function getAllCases(): ContentEntry[] {
  return getCaseSlugs()
    .map((slug) => getContent(`work/${slug}.md`))
    .sort((a, b) => a.frontmatter.title.localeCompare(b.frontmatter.title));
}

/** One slug per article, English filename only — a `.nl.md` translation
 * of the same slug is picked up by getLocalizedContent at render time,
 * not listed here as a second, separate article. */
export function getInsightSlugs(): string[] {
  return Array.from(entriesByPath.keys())
    .filter((path) => path.includes("/content/insights/") && !path.endsWith(".nl.md"))
    .map((path) => path.split("/").pop()!.replace(/\.md$/, ""));
}

export function getAllInsights(lang: "en" | "nl" = "en"): ContentEntry[] {
  return getInsightSlugs()
    .map((slug) => getLocalizedContent(`insights/${slug}.md`, lang))
    .sort((a, b) => a.frontmatter.title.localeCompare(b.frontmatter.title));
}

/** `services:` frontmatter is a comma-separated list of service slugs,
 * e.g. "webdesign-almere, ux-ui-design". Empty/absent until a case has
 * a confirmed real relationship to a service — see getCasesForService(). */
export function getCaseServiceSlugs(caseEntry: ContentEntry): string[] {
  const raw = caseEntry.frontmatter.services;
  if (!raw) return [];
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

export interface RelatedCase {
  entry: ContentEntry;
  /** True when this case is genuinely tagged to the service (real data,
   * e.g. STËLZ's existing "Web Design"/"UX Design" project tags) — false
   * means it's a fallback fill-in, not a confirmed relationship. */
  confirmed: boolean;
}

/** Cases for a service page's "Cases" section (fase 6: "minimaal twee
 * gerelateerde cases"). Tagged cases are genuine, sourced relationships;
 * most cases have no `services` tag yet (their content is still
 * TODO_DYLAN, so no real service-specific claim can be made about them).
 * Rather than inventing which service each untagged case belongs to,
 * confirmed matches are returned first and the list is padded with
 * untagged cases — flagged as unconfirmed — up to `minCount`, so the
 * page still meets the "at least two" requirement without asserting a
 * relationship nobody has verified. */
export function getCasesForService(serviceSlug: string, minCount = 2): RelatedCase[] {
  const all = getAllCases();
  const confirmed = all.filter((c) => getCaseServiceSlugs(c).includes(serviceSlug));
  const rest = all.filter((c) => !getCaseServiceSlugs(c).includes(serviceSlug));

  const result: RelatedCase[] = confirmed.map((entry) => ({ entry, confirmed: true }));
  for (const entry of rest) {
    if (result.length >= minCount) break;
    result.push({ entry, confirmed: false });
  }
  return result;
}
