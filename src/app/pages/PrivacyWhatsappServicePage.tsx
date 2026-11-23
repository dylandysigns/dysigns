import { ContentPage } from "../components/ContentPage";
import { getLocalizedContent } from "../content/loadContent";
import { useLanguage } from "../hooks/useLanguage";

// Privacy page for the WhatsApp assistants DYSIGNS runs for businesses.
// Its own URL so Meta (app settings, App Review) and the assistant's
// first message can link straight to it. Only reachable by that direct
// link: noindex (which also keeps it out of the sitemap) and not linked
// from anywhere else on the site. Not in robots.txt on purpose, so
// crawlers can still read the noindex and Meta can still fetch it.
export default function PrivacyWhatsappServicePage() {
  const { t, lang } = useLanguage();
  const entry = getLocalizedContent("privacy-whatsapp-service.md", lang);

  return (
    <ContentPage
      entry={entry}
      eyebrow={t("privacy.eyebrow")}
      robots="noindex, nofollow"
      breadcrumb={[
        { label: t("breadcrumb.home"), href: "/" },
        { label: t("privacy.eyebrow"), href: "/privacy" },
        { label: "WhatsApp" },
      ]}
    />
  );
}
