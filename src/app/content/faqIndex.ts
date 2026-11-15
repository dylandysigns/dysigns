// One flat list of every FAQ question on the site (homepage, service pages,
// insights), per language, with a stable id and the page it lives on.
//
// Pure function over the parsed content entries, so the exact same list is
// built in two places without drifting apart:
//   - in the browser, from `virtual:content` (already in the bundle), for
//     the instant local search in the homepage FAQ;
//   - at build time in vite.config.ts, written to dist/faq-index.json,
//     which functions/api/faq-search.js embeds with Workers AI.
// The ids are the contract between the two.

import type { FaqItem } from "../seo/schema";

export type FaqLang = "en" | "nl";

export interface FaqIndexItem {
  /** `${lang}:${page slug}:${position}`, e.g. "nl:services/branding:2" */
  id: string;
  lang: FaqLang;
  question: string;
  answer: string;
  /** Route of the page the question is on, already in the right language
   * tree ("/nl/branding"), without trailing slash (TransitionLink and
   * crawlHref add what they need). */
  href: string;
  /** Short page name for the "from: ..." hint under a search result. */
  pageLabel: string;
  isHome: boolean;
}

interface EntryLike {
  frontmatter: { title?: string };
  faqItems: FaqItem[];
}

// Homepage first, then services, then insights: when two pages carry the
// same question, the earlier one wins the dedupe below.
function pageRank(slug: string): number {
  if (slug === "home") return 0;
  if (slug.startsWith("services/")) return 1;
  return 2;
}

function routeFor(slug: string, lang: FaqLang): string {
  let path: string;
  if (slug === "home") path = "/";
  else if (slug.startsWith("services/")) path = `/${slug.slice("services/".length)}`;
  else path = `/${slug}`; // insights/<slug>
  if (lang === "en") return path;
  return path === "/" ? "/nl" : `/nl${path}`;
}

/** "Branding & Huisstijl Ontwerpbureau | DYSIGNS" -> "Branding & Huisstijl Ontwerpbureau" */
function labelFromTitle(title: string | undefined, slug: string): string {
  const clean = (title ?? "").split("|")[0].trim();
  return clean || slug.split("/").pop() || slug;
}

/** Plain text of an answer: markdown links collapse to their label and
 * emphasis markers drop, so neither the embedding nor the keyword match
 * is thrown off by URL fragments. */
export function plainAnswer(answer: string): string {
  return answer
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildFaqIndex(entries: Record<string, EntryLike>): FaqIndexItem[] {
  const pages: { slug: string; lang: FaqLang; entry: EntryLike }[] = [];
  for (const [key, entry] of Object.entries(entries)) {
    const m = key.match(/\/content\/(home|services\/[^/]+?|insights\/[^/]+?)(\.nl)?\.md$/);
    if (!m || !entry.faqItems?.length) continue;
    pages.push({ slug: m[1], lang: m[2] ? "nl" : "en", entry });
  }
  pages.sort((a, b) => pageRank(a.slug) - pageRank(b.slug) || a.slug.localeCompare(b.slug));

  const seen = new Set<string>();
  const items: FaqIndexItem[] = [];
  for (const { slug, lang, entry } of pages) {
    entry.faqItems.forEach((item, i) => {
      const dedupeKey = `${lang}:${item.question.trim().toLowerCase()}`;
      if (seen.has(dedupeKey)) return;
      seen.add(dedupeKey);
      items.push({
        id: `${lang}:${slug}:${i}`,
        lang,
        question: item.question,
        answer: item.answer,
        href: routeFor(slug, lang),
        pageLabel: labelFromTitle(entry.frontmatter.title, slug),
        isHome: slug === "home",
      });
    });
  }
  return items;
}
