import { ContentPage } from "../components/ContentPage";
import { getContent } from "../content/loadContent";
import { profilePageSchema } from "../seo/schema";

export default function OverDylanKhoPage() {
  const entry = getContent("over-dylan-kho.md");
  const path = "/over-dylan-kho";
  return (
    <ContentPage
      entry={entry}
      eyebrow="Over"
      path={path}
      breadcrumb={[{ label: "Home", href: "/" }, { label: "Over Dylan Kho" }]}
      extraSchema={[profilePageSchema({ path })]}
    />
  );
}
