import { ContentPage } from "../components/ContentPage";
import { getLocalizedContent } from "../content/loadContent";
import { useLanguage } from "../hooks/useLanguage";

export default function PrivacyPage() {
  const { t, lang } = useLanguage();
  const entry = getLocalizedContent("privacy.md", lang);

  return (
    <ContentPage
      entry={entry}
      eyebrow={t("privacy.eyebrow")}
      breadcrumb={[{ label: t("breadcrumb.home"), href: "/" }, { label: t("privacy.eyebrow") }]}
    />
  );
}
