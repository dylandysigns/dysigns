import { Seo } from "../components/Seo";
import { TransitionLink } from "../components/TransitionLink";
import { useLanguage } from "../hooks/useLanguage";

const LINKS = [
  { key: "nav.work", path: "/work" },
  { key: "hero.chip.web", path: "/web-design" },
  { key: "hero.chip.ux", path: "/ux-ui-design" },
  { key: "hero.chip.brand", path: "/branding" },
  { key: "hero.chip.product", path: "/social-media-meta-ads" },
  { key: "hero.chip.strategy", path: "/ai-implementation" },
  { key: "nav.about", path: "/about" },
  { key: "nav.contact", path: "/contact" },
];

export default function NotFoundPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Seo
        title={t("notFound.title")}
        description={t("notFound.description")}
        path="/404"
        robots="noindex, nofollow"
      />
      <div className="text-center">
        <h1
          style={{
            fontFamily: "var(--font-brand)",
            fontSize: "clamp(3rem,8vw,6rem)",
            fontWeight: 800,
            color: "var(--page-fg)",
            letterSpacing: "-.06em",
            lineHeight: 1,
          }}
        >
          404
        </h1>
        <p
          className="mt-4"
          style={{
            fontSize: ".82rem",
            color: "rgba(var(--page-fg-rgb), .55)",
          }}
        >
          {t("notFound.heading")}
        </p>
        <TransitionLink
          to="/"
          className="inline-block mt-6 px-5 py-2 rounded-full transition-all duration-300"
          style={{
            fontSize: ".72rem",
            fontWeight: 500,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            color: "rgba(var(--page-fg-rgb), .4)",
            border: "1px solid rgba(var(--page-fg-rgb), .15)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = "var(--page-fg)";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(var(--page-fg-rgb), .35)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = "rgba(var(--page-fg-rgb), .4)";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(var(--page-fg-rgb), .15)";
          }}
        >
          {t("notFound.goHome")}
        </TransitionLink>

        <nav aria-label={t("notFound.sections")} className="mt-10">
          <ul
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
            style={{
              fontSize: ".72rem",
              color: "rgba(var(--page-fg-rgb), .4)",
              listStyle: "none",
              padding: 0,
            }}
          >
            {LINKS.map((link) => (
              <li key={link.path}>
                <TransitionLink
                  to={link.path}
                  className="transition-colors duration-300"
                  style={{ color: "inherit" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "var(--page-fg)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "inherit";
                  }}
                >
                  {t(link.key)}
                </TransitionLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
