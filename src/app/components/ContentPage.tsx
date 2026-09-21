import type { ReactNode } from "react";
import { Breadcrumb, type BreadcrumbItem } from "./Breadcrumb";
import { Seo } from "./Seo";
import { breadcrumbListSchema } from "../seo/schema";
import type { ContentEntry } from "../content/loadContent";

/**
 * ContentPage — shared shell for markdown-driven pages (fase 2/3/4).
 * Reuses the site's existing typography tokens (--page-fg, --page-fg-rgb,
 * Inter / Instrument Serif) — no new visual language introduced.
 * Renders <Seo> from the entry's own frontmatter (title/description),
 * so every page using this shell automatically gets fase 3 head values,
 * plus a BreadcrumbList schema built from the same breadcrumb items
 * shown on the page (fase 4) and any page-type-specific schema passed in.
 */
export function ContentPage({
  entry,
  eyebrow,
  breadcrumb,
  ogType,
  robots,
  path: pathOverride,
  extraSchema,
  children,
}: {
  entry: ContentEntry;
  eyebrow: string;
  breadcrumb: BreadcrumbItem[];
  ogType?: "website" | "article";
  robots?: string;
  /** Route path, e.g. "/cases/stelz". Defaults to "/" + frontmatter.slug —
   * pass explicitly when the route nests under a prefix the slug alone
   * doesn't encode (e.g. cases live under /cases/:slug, not /:slug). */
  path?: string;
  /** Page-type schema (Service/CreativeWork/ProfilePage/...) from
   * src/app/seo/schema.ts — appended alongside the BreadcrumbList. */
  extraSchema?: object[];
  /** Rendered after the markdown body — for component-driven sections
   * (fase 6 related-cases, author byline) that can't live in static
   * markdown because they depend on other content entries. */
  children?: ReactNode;
}) {
  const heading = entry.frontmatter.heading || entry.frontmatter.title;
  const path =
    pathOverride ?? (entry.frontmatter.slug === "/" ? "/" : `/${entry.frontmatter.slug}`);

  const breadcrumbSchema = breadcrumbListSchema(
    breadcrumb.map((item) => ({
      name: item.label,
      path: item.href ?? path, // current page has no href — it's its own URL
    })),
  );

  return (
    <section
      className="relative"
      style={{ background: "var(--page-bg)", minHeight: "100vh" }}
    >
      <Seo
        title={entry.frontmatter.title}
        description={entry.frontmatter.description}
        path={path}
        lastmod={entry.frontmatter.lastUpdated}
        ogType={ogType}
        robots={robots}
        schema={[breadcrumbSchema, ...(extraSchema ?? [])]}
      />
      <div className="max-w-[800px] mx-auto px-6 md:px-12 pt-32 md:pt-40 pb-16 md:pb-24">
        <div className="mb-8">
          <Breadcrumb items={breadcrumb} />
        </div>

        <span
          style={{
            fontSize: ".6rem",
            fontWeight: 500,
            letterSpacing: ".16em",
            textTransform: "uppercase",
            color: "rgba(var(--page-fg-rgb), .55)",
          }}
        >
          {eyebrow}
        </span>

        <h1
          className="mt-3"
          style={{
            fontFamily: "var(--font-brand)",
            fontSize: "clamp(2rem,5vw,3.5rem)",
            fontWeight: 700,
            letterSpacing: "-.04em",
            color: "var(--page-fg)",
            lineHeight: 1.1,
          }}
        >
          {heading}
        </h1>

        {entry.frontmatter.answerBlock && (
          <p
            className="mt-6"
            style={{
              fontFamily: "'Instrument Serif',serif",
              fontSize: "clamp(.95rem,1.3vw,1.15rem)",
              fontStyle: "italic",
              lineHeight: 1.75,
              color: "rgba(var(--page-fg-rgb), .7)",
            }}
          >
            {entry.frontmatter.answerBlock}
          </p>
        )}

        <div
          className="content-prose mt-10"
          dangerouslySetInnerHTML={{ __html: entry.bodyHtml }}
        />

        {children}
      </div>
    </section>
  );
}
