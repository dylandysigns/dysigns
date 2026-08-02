import { useParams } from "react-router";
import { ContentPage } from "../components/ContentPage";
import { getContent, getInsightSlugs } from "../content/loadContent";
import NotFoundPage from "./NotFoundPage";

export default function InsightsDetailPage() {
  const { slug } = useParams();

  if (!slug || !getInsightSlugs().includes(slug)) {
    return <NotFoundPage />;
  }

  const entry = getContent(`insights/${slug}.md`);
  const path = `/insights/${slug}`;

  return (
    <ContentPage
      entry={entry}
      eyebrow="Insights"
      path={path}
      ogType="article"
      breadcrumb={[
        { label: "Home", href: "/" },
        { label: "Insights", href: "/insights" },
        { label: entry.frontmatter.heading || entry.frontmatter.title },
      ]}
    />
  );
}
