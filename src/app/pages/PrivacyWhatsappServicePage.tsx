import { ContentPage } from "../components/ContentPage";
import { getLocalizedContent } from "../content/loadContent";
import { useLanguage } from "../hooks/useLanguage";

// Privacy page for the WhatsApp assistant DYSIGNS runs for cleaning
// companies. Its own URL so Meta (app settings, App Review) and the
// assistant's first message can link straight to it.
export default function PrivacyWhatsappServicePage() {
  const { t, lang } = useLanguage();
  const entry = getLocalizedContent("privacy-whatsapp-service.md", lang);

  return (
    <ContentPage
      entry={entry}
      eyebrow={t("privacy.eyebrow")}
      breadcrumb={[
        { label: t("breadcrumb.home"), href: "/" },
        { label: t("privacy.eyebrow"), href: "/privacy" },
        { label: "WhatsApp" },
      ]}
    />
  );
}
