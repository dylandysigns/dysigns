import { Breadcrumb, type BreadcrumbItem } from "./Breadcrumb";
import type { ContentEntry } from "../content/loadContent";

/**
 * ContentPage — shared shell for markdown-driven pages (fase 2).
 * Reuses the site's existing typography tokens (--page-fg, --page-fg-rgb,
 * Inter / Instrument Serif) — no new visual language introduced.
 */
export function ContentPage({
  entry,
  eyebrow,
  breadcrumb,
}: {
  entry: ContentEntry;
  eyebrow: string;
  breadcrumb: BreadcrumbItem[];
}) {
  const heading = entry.frontmatter.heading || entry.frontmatter.title;

  return (
    <section
      className="relative"
      style={{ background: "var(--page-bg)", minHeight: "100vh" }}
    >
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
            color: "rgba(var(--page-fg-rgb), .45)",
          }}
        >
          {eyebrow}
        </span>

        <h1
          className="mt-3"
          style={{
            fontFamily: "'Inter',sans-serif",
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
      </div>
    </section>
  );
}
