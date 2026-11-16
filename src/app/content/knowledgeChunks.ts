// Page content as chat knowledge: every published page body (about,
// contact, homepage, service pages, insights) cut into sections, plus the
// case studies from src/app/data/projects.ts.
//
// Build time only (vite.config.ts writes the result into
// dist/faq-index.json next to the FAQ items), so none of this reaches the
// browser bundle. functions/api/faq-chat.js finds the sections closest to a
// visitor's question and gives them to the chat model as context.

import type { FaqLang } from "./faqIndex";

export interface KnowledgeChunk {
  id: string;
  /** "any" for case studies, which only exist in English: the embedding
   * model matches across languages and the chat model answers in the
   * visitor's language regardless. */
  lang: FaqLang | "any";
  /** Section heading, shown as the source title. */
  title: string;
  text: string;
  href: string;
  label: string;
  isHome: boolean;
}

interface EntryLike {
  frontmatter: { title?: string; answerBlock?: string };
  bodyHtml: string;
}

interface ProjectLike {
  slug: string;
  title: string;
  category: string;
  tags: string[];
  year: string;
  overview: string;
  outcomes: string[];
  hidden?: boolean;
}

const MAX_CHARS = 1400;
// Already in the index as separate question/answer items.
const SKIP_HEADINGS = /^(frequently asked questions|veelgestelde vragen)$/i;

function htmlToText(html: string): string {
  return html
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g, "[$2]($1)") // keep links for the model
    .replace(/<\/(p|li|h[1-6]|blockquote)>/g, "\n")
    .replace(/<li>/g, "- ")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();
}

/** Splits long text on paragraph boundaries into pieces under MAX_CHARS. */
function splitLong(text: string): string[] {
  if (text.length <= MAX_CHARS) return [text];
  const parts: string[] = [];
  let current = "";
  for (const para of text.split("\n")) {
    if (current && current.length + para.length + 1 > MAX_CHARS) {
      parts.push(current);
      current = "";
    }
    current = current ? `${current}\n${para}` : para;
  }
  if (current) parts.push(current);
  return parts;
}

function routeFor(slug: string, lang: FaqLang): string {
  let path: string;
  if (slug === "home") path = "/";
  else if (slug.startsWith("services/")) path = `/${slug.slice("services/".length)}`;
  else path = `/${slug}`; // about, contact, insights/<slug>, work/<slug>
  if (lang === "en") return path;
  return path === "/" ? "/nl" : `/nl${path}`;
}

function labelFromTitle(title: string | undefined, fallback: string): string {
  const clean = (title ?? "").split(/[|:]/)[0].trim();
  return clean || fallback;
}

export function buildKnowledgeChunks(
  entries: Record<string, EntryLike>,
  projects: ProjectLike[],
): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = [];

  for (const [key, entry] of Object.entries(entries)) {
    const m = key.match(/\/content\/(home|about|contact|services\/[^/]+?|insights\/[^/]+?)(\.nl)?\.md$/);
    if (!m) continue;
    const slug = m[1];
    const lang: FaqLang = m[2] ? "nl" : "en";
    const label = labelFromTitle(entry.frontmatter.title, slug);
    const href = routeFor(slug, lang);
    const isHome = slug === "home";

    const sections: { title: string; text: string }[] = [];
    if (entry.frontmatter.answerBlock) {
      sections.push({ title: label, text: entry.frontmatter.answerBlock.replace(/\s+/g, " ").trim() });
    }
    // Split the rendered body on its <h2> headings; text before the first
    // heading is the page intro.
    const pieces = entry.bodyHtml.split(/(?=<h2[ >])/);
    for (const piece of pieces) {
      const h = piece.match(/^<h2[^>]*>([\s\S]*?)<\/h2>/);
      const title = h ? htmlToText(h[1]) : label;
      if (SKIP_HEADINGS.test(title)) continue;
      const text = htmlToText(h ? piece.slice(h[0].length) : piece);
      if (!text || text.includes("TODO_DYLAN")) continue;
      sections.push({ title, text });
    }

    sections.forEach((section, si) => {
      splitLong(section.text).forEach((part, pi) => {
        chunks.push({
          id: `${lang}:page:${slug}:${si}.${pi}`,
          lang,
          title: section.title,
          text: `${label}, ${section.title}\n${part}`,
          href,
          label,
          isHome,
        });
      });
    });
  }

  for (const p of projects) {
    if (p.hidden || !p.overview?.trim()) continue;
    const outcomes = p.outcomes.length ? `\nResults: ${p.outcomes.join(" ")}` : "";
    const body = `Case study: ${p.title} (${p.category}, ${p.year}). Services: ${p.tags.join(", ")}.\n${p.overview}${outcomes}`;
    splitLong(body).forEach((part, pi) => {
      chunks.push({
        id: `any:case:${p.slug}:${pi}`,
        lang: "any",
        title: p.title,
        text: part,
        href: `/work/${p.slug}`,
        label: `Case ${p.title}`,
        isHome: false,
      });
    });
  }

  return chunks;
}
