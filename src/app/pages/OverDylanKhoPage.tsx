import { ContentPage } from "../components/ContentPage";
import { getContent } from "../content/loadContent";

export default function OverDylanKhoPage() {
  const entry = getContent("over-dylan-kho.md");
  return (
    <ContentPage
      entry={entry}
      eyebrow="Over"
      breadcrumb={[{ label: "Home", href: "/" }, { label: "Over Dylan Kho" }]}
    />
  );
}
