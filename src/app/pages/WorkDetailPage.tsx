import { useParams } from "react-router";
import { ContentPage } from "../components/ContentPage";
import { CaseFooterLinks } from "../components/CaseFooterLinks";
import { getContent, getCaseSlugs } from "../content/loadContent";
import { creativeWorkSchema } from "../seo/schema";
import NotFoundPage from "./NotFoundPage";

export default function WorkDetailPage() {
  const { slug } = useParams();

  if (!slug || !getCaseSlugs().includes(slug)) {
    return <NotFoundPage />;
  }

  const entry = getContent(`work/${slug}.md`);
  const path = `/work/${slug}`;
  const client = entry.frontmatter.client || entry.frontmatter.heading;

  return (
    <ContentPage
      entry={entry}
      eyebrow="Case"
      path={path}
      ogType="article"
      breadcrumb={[
        { label: "Home", href: "/" },
        { label: "Work", href: "/work" },
        { label: client },
      ]}
      extraSchema={[
        creativeWorkSchema({
          name: entry.frontmatter.heading || entry.frontmatter.title,
          about: client,
          path,
          datePublished: entry.frontmatter.lastUpdated,
        }),
      ]}
    >
      <CaseFooterLinks caseEntry={entry} />
    </ContentPage>
  );
}
