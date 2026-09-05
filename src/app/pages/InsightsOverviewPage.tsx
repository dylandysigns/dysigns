import { ContentPage } from "../components/ContentPage";
import { TransitionLink } from "../components/TransitionLink";
import { getLocalizedContent, getAllInsights } from "../content/loadContent";
import { useLanguage } from "../hooks/useLanguage";

export default function InsightsOverviewPage() {
  const { t, lang } = useLanguage();
  const entry = getLocalizedContent("insights-overview.md", lang);
  const insights = getAllInsights(lang);

  return (
    <ContentPage
      entry={entry}
      eyebrow={t("nav.insights")}
      breadcrumb={[{ label: t("breadcrumb.home"), href: "/" }, { label: t("nav.insights") }]}
    >
      {insights.length > 0 && (
        <ul className="flex flex-col gap-8 mt-10" style={{ listStyle: "none", padding: 0 }}>
          {insights.map((a) => (
            <li
              key={a.frontmatter.slug}
              style={{
                paddingBottom: "2rem",
                borderBottom: "1px solid rgba(var(--page-fg-rgb), .08)",
              }}
            >
              <TransitionLink
                to={`/insights/${a.frontmatter.slug}`}
                className="transition-colors duration-300"
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "var(--page-fg)",
                  letterSpacing: "-.01em",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "rgba(var(--page-fg-rgb), .6)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "var(--page-fg)";
                }}
              >
                {a.frontmatter.heading || a.frontmatter.title}
              </TransitionLink>
              <p
                className="mt-2"
                style={{
                  fontSize: ".92rem",
                  lineHeight: 1.6,
                  color: "rgba(var(--page-fg-rgb), .6)",
                }}
              >
                {a.frontmatter.description}
              </p>
            </li>
          ))}
        </ul>
      )}
    </ContentPage>
  );
}
