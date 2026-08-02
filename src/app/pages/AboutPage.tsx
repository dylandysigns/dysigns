import { ContentPage } from "../components/ContentPage";
import { getContent } from "../content/loadContent";
import { profilePageSchema } from "../seo/schema";

export default function AboutPage() {
  const entry = getContent("about.md");
  const path = "/about";
  return (
    <ContentPage
      entry={entry}
      eyebrow="About"
      path={path}
      breadcrumb={[{ label: "Home", href: "/" }, { label: "About Dylan Kho" }]}
      extraSchema={[profilePageSchema({ path })]}
    />
  );
}
