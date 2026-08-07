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
  transition: "color .3s, text-decoration-color .3s",
} as const;

function handleLinkEnter(e: React.MouseEvent<HTMLAnchorElement>) {
  e.currentTarget.style.color = "var(--page-fg)";
  e.currentTarget.style.textDecorationColor = "rgba(var(--page-fg-rgb), .6)";
}

function handleLinkLeave(e: React.MouseEvent<HTMLAnchorElement>) {
  e.currentTarget.style.color = "rgba(var(--page-fg-rgb), .8)";
  e.currentTarget.style.textDecorationColor = "rgba(var(--page-fg-rgb), .3)";
}

/**
 * CaseFooterLinks — case pages link back to their service page with
 * descriptive anchor text, and show an author byline to /about.
 *
 * Only STËLZ has a confirmed service relationship (real, pre-existing
 * project tags). For cases without one, claiming a specific service
 * would be invented, so this links to all five services generically
 * instead of picking one.
 */
export function CaseFooterLinks({ caseEntry }: { caseEntry: ContentEntry }) {
  const client = caseEntry.frontmatter.client || caseEntry.frontmatter.heading;
  const taggedSlugs = getCaseServiceSlugs(caseEntry);
  const taggedServices = SERVICES.filter((s) => taggedSlugs.includes(s.slug));
  const servicesToShow = taggedServices.length > 0 ? taggedServices : SERVICES;

  return (
    <div>
      <h2 style={h2Style}>{taggedServices.length > 0 ? "Service" : "Services"}</h2>
      <ul className="flex flex-col gap-2 mb-8" style={{ listStyle: "none", padding: 0 }}>
        {servicesToShow.map((s) => (
          <li key={s.slug}>
            <a
              href={`/${s.slug}`}
              style={linkStyle}
              onMouseEnter={handleLinkEnter}
              onMouseLeave={handleLinkLeave}
            >
              {taggedServices.length > 0 ? `See our ${s.label} service` : s.label}
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
        Case by{" "}
        <a
          href="/about"
          style={{ ...linkStyle, fontStyle: "normal" }}
          onMouseEnter={handleLinkEnter}
          onMouseLeave={handleLinkLeave}
        >
          Dylan Kho
        </a>
        , for {client}.
      </p>
    </div>
  );
}
