import { useParams } from "react-router";
import { ContentPage } from "../components/ContentPage";
import { getLocalizedContent, getInsightSlugs } from "../content/loadContent";
import { useLanguage } from "../hooks/useLanguage";
import { articleSchema, faqPageSchema } from "../seo/schema";
import NotFoundPage from "./NotFoundPage";

export default function InsightsDetailPage() {
  const { slug } = useParams();
  const { t, lang } = useLanguage();

  if (!slug || !getInsightSlugs().includes(slug)) {
    return <NotFoundPage />;
  }

  const entry = getLocalizedContent(`insights/${slug}.md`, lang);
  const path = `/insights/${slug}`;
  const heading = entry.frontmatter.heading || entry.frontmatter.title;

  return (
    <ContentPage
      entry={entry}
      eyebrow={t("nav.insights")}
      path={path}
      ogType="article"
      breadcrumb={[
        { label: t("breadcrumb.home"), href: "/" },
        { label: t("nav.insights"), href: "/insights" },
        { label: heading },
      ]}
      extraSchema={[
        articleSchema({
          headline: heading,
          description: entry.frontmatter.description,
          path,
          datePublished: entry.frontmatter.lastUpdated,
        }),
        ...(entry.faqItems.length > 0 ? [faqPageSchema(entry.faqItems)] : []),
      ]}
    />
  );
}
