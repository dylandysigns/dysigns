import { getCasesForService } from "../content/loadContent";

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

/**
 * RelatedCases — fase 6: "elke servicepagina linkt naar minimaal twee
 * gerelateerde cases", with descriptive anchor text (never "lees meer").
 *
 * Only STËLZ currently has a genuine, sourced service relationship (its
 * existing project tags — Web Design, UX Design — are real data, not
 * invented). The other three cases have no confirmed service yet, since
 * their content is still TODO_DYLAN. getCasesForService() pads the list
 * with those unconfirmed cases to meet the "at least two" minimum, and
 * this component phrases them differently — "ander werk" rather than
 * claiming a specific relevance nobody has verified.
 */
export function RelatedCases({ serviceSlug, serviceLabel }: { serviceSlug: string; serviceLabel: string }) {
  const cases = getCasesForService(serviceSlug, 2);
  if (cases.length === 0) return null;

  return (
    <div>
      <h2 style={h2Style}>Cases</h2>
      <ul className="flex flex-col gap-3" style={{ listStyle: "none", padding: 0 }}>
        {cases.map(({ entry, confirmed }) => {
          const client = entry.frontmatter.client || entry.frontmatter.heading;
          const href = `/cases/${entry.frontmatter.slug}`;
          return (
            <li key={href}>
              <a
                href={href}
                style={{
                  fontSize: ".95rem",
                  color: "rgba(var(--page-fg-rgb), .8)",
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                  textDecorationColor: "rgba(var(--page-fg-rgb), .3)",
                }}
              >
                {confirmed
                  ? `${client} — hoe we dit hebben aangepakt binnen ${serviceLabel.toLowerCase()}`
                  : `${client} — ander werk van DYSIGNS`}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
