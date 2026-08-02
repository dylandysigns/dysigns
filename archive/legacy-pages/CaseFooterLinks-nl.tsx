import type { ContentEntry } from "../content/loadContent";
import { getCaseServiceSlugs } from "../content/loadContent";
import { SERVICES } from "../content/services";

const h2Style = {
  fontFamily: "'Inter',sans-serif",
  fontSize: "clamp(1.15rem, 2.2vw, 1.5rem)",
  fontWeight: 700,
  letterSpacing: "-.03em",
  color: "var(--page-fg)",
  lineHeight: 1.25,
  marginTop: "2.5rem",
  marginBottom: ".75rem",
} as const;

const linkStyle = {
  fontSize: ".95rem",
  color: "rgba(var(--page-fg-rgb), .8)",
  textDecoration: "underline",
  textUnderlineOffset: "3px",
  textDecorationColor: "rgba(var(--page-fg-rgb), .3)",
} as const;

/**
 * CaseFooterLinks — fase 6: case pages link back to their service page
 * with descriptive anchor text, and show an author byline to
 * /over-dylan-kho.
 *
 * Only STËLZ has a confirmed service relationship (real, pre-existing
 * project tags). For cases without one — all content besides the client
 * name is still TODO_DYLAN — claiming a specific service would be
 * invented, so this links to all four services generically instead of
 * picking one.
 */
export function CaseFooterLinks({ caseEntry }: { caseEntry: ContentEntry }) {
  const client = caseEntry.frontmatter.client || caseEntry.frontmatter.heading;
  const taggedSlugs = getCaseServiceSlugs(caseEntry);
  const taggedServices = SERVICES.filter((s) => taggedSlugs.includes(s.slug));
  const servicesToShow = taggedServices.length > 0 ? taggedServices : SERVICES;

  return (
    <div>
      <h2 style={h2Style}>
        {taggedServices.length > 0 ? "Dienst" : "Diensten"}
      </h2>
      <ul className="flex flex-col gap-2 mb-8" style={{ listStyle: "none", padding: 0 }}>
        {servicesToShow.map((s) => (
          <li key={s.slug}>
            <a href={`/${s.slug}`} style={linkStyle}>
              {taggedServices.length > 0
                ? `Bekijk onze ${s.label}-dienst`
                : s.label}
            </a>
          </li>
        ))}
      </ul>

      <p
        style={{
          fontSize: ".85rem",
          color: "rgba(var(--page-fg-rgb), .5)",
          fontStyle: "italic",
        }}
      >
        Case van{" "}
        <a href="/over-dylan-kho" style={{ ...linkStyle, fontStyle: "normal" }}>
          Dylan Kho
        </a>
        , voor {client}.
      </p>
    </div>
  );
}
