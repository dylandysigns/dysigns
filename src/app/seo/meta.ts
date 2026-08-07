export const SITE_URL = "https://dylandysigns.com";
export const OG_IMAGE = `${SITE_URL}/images/og-cover.png`;
export const DEFAULT_ROBOTS =
  "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1";

export interface PageMeta {
  title: string;
  description: string;
  /** Route path, e.g. "/" or "/webdesign-almere" (no trailing slash except root). */
  path: string;
  ogType?: "website" | "article";
  robots?: string;
  /** Page-type JSON-LD nodes (fase 4) — built via src/app/seo/schema.ts
   * helpers, e.g. [breadcrumbListSchema(...), serviceSchema(...)]. */
  schema?: object[];
  /** ISO date (YYYY-MM-DD) from the page's own content frontmatter
   * (`lastUpdated`) — fase 7's sitemap.xml uses this as <lastmod>.
   * Left undefined for pages with no content file (legacy routes);
   * the sitemap generator omits <lastmod> rather than inventing one. */
  lastmod?: string;
}

export function canonicalUrl(path: string): string {
  if (path === "/") return `${SITE_URL}/`;
  return `${SITE_URL}${path}`;
}

// `path` here is always the canonical ENGLISH path (what every page's
// <Seo path="..."> already passes) — used to build the Dutch mirror URL
// for hreflang, regardless of which language is actually rendering.
export function alternateUrl(path: string, lang: "en" | "nl"): string {
  if (lang === "en") return canonicalUrl(path);
  return canonicalUrl(path === "/" ? "/nl" : `/nl${path}`);
}

// Build-time validation (fase 3 requirement): title <= 60 chars,
// description <= 155 chars. Called from scripts/prerender.mjs for every
// captured PageMeta — throws to fail the build on violation.
export function validatePageMeta(meta: PageMeta): void {
  const errors: string[] = [];
  if (meta.title.length > 60) {
    errors.push(
      `title te lang (${meta.title.length}/60 tekens) op ${meta.path}: "${meta.title}"`,
    );
  }
  if (meta.description.length > 155) {
    errors.push(
      `description te lang (${meta.description.length}/155 tekens) op ${meta.path}: "${meta.description}"`,
    );
  }
  if (errors.length > 0) {
    throw new Error(`Meta-validatie mislukt:\n${errors.join("\n")}`);
  }
}
