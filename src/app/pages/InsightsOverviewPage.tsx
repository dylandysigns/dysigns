import { ContentPage } from "../components/ContentPage";
import { getContent, getAllInsights } from "../content/loadContent";

export default function InsightsOverviewPage() {
  const entry = getContent("insights-overview.md");
  const insights = getAllInsights();

  return (
    <ContentPage
      entry={entry}
      eyebrow="Insights"
      breadcrumb={[{ label: "Home", href: "/" }, { label: "Insights" }]}
    >
      {insights.length > 0 && (
        <ul className="flex flex-col gap-3 mt-8" style={{ listStyle: "none", padding: 0 }}>
          {insights.map((a) => (
            <li key={a.frontmatter.slug}>
              <a
                href={`/insights/${a.frontmatter.slug}`}
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "var(--page-fg)",
                }}
              >
                {a.frontmatter.heading || a.frontmatter.title}
              </a>
            </li>
          ))}
        </ul>
      )}
    </ContentPage>
  );
}
