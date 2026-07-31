import { useParams } from "react-router";
import { ContentPage } from "../components/ContentPage";
import { getContent, getCaseSlugs } from "../content/loadContent";
import NotFoundPage from "./NotFoundPage";

export default function CaseContentPage() {
  const { slug } = useParams();

  if (!slug || !getCaseSlugs().includes(slug)) {
    return <NotFoundPage />;
  }

  const entry = getContent(`cases/${slug}.md`);

  return (
    <ContentPage
      entry={entry}
      eyebrow="Case"
      path={`/cases/${slug}`}
      ogType="article"
      breadcrumb={[
        { label: "Home", href: "/" },
        { label: "Cases", href: "/cases" },
        { label: entry.frontmatter.client || entry.frontmatter.heading },
      ]}
    />
  );
}
