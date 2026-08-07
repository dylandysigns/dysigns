import { useLanguage } from "../hooks/useLanguage";
import { Seo } from "../components/Seo";
import { MagneticFillButton } from "../components/MagneticFillButton";

/**
 * ThankYouPage — the Netlify Forms redirect target (contact form's
 * action="/thank-you"). Forms submit via a native browser POST, causing
 * a full page navigation, so this route has to exist as a real
 * prerendered page, not just a client-side-only view — see
 * scripts/prerender.mjs's enRoutes list. noindex: it's a transactional
 * confirmation, not content worth ranking.
 */
export default function ThankYouPage() {
  const { t } = useLanguage();

  return (
    <section
      className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-6 md:px-12 text-center"
      style={{ background: "var(--page-bg)" }}
    >
      <Seo
        title="Thank you | DYSIGNS"
        description="Your message has been sent to DYSIGNS."
        path="/thank-you"
        robots="noindex, nofollow"
      />
      <div className="max-w-[560px] mx-auto">
        <span
          style={{
            fontSize: ".7rem",
            fontWeight: 500,
            letterSpacing: ".16em",
            textTransform: "uppercase",
            color: "rgba(var(--page-fg-rgb), .45)",
          }}
        >
          {t("thankyou.label")}
        </span>
        <h1
          className="mt-4"
          style={{
            fontFamily: "'Inter',sans-serif",
            fontSize: "clamp(2rem,5vw,3.2rem)",
            fontWeight: 700,
            letterSpacing: "-.04em",
            color: "var(--page-fg)",
            lineHeight: 1.1,
          }}
        >
          {t("thankyou.headline")}
        </h1>
        <p
          className="mt-5 mx-auto max-w-md"
          style={{
            fontFamily: "'Instrument Serif',serif",
            fontSize: "clamp(.95rem,1.3vw,1.15rem)",
            fontStyle: "italic",
            color: "rgba(var(--page-fg-rgb), .6)",
            lineHeight: 1.6,
          }}
        >
          {t("thankyou.sub")}
        </p>
        <div className="mt-10 flex justify-center">
          <MagneticFillButton to="/">{t("thankyou.backHome")}</MagneticFillButton>
        </div>
      </div>
    </section>
  );
}
