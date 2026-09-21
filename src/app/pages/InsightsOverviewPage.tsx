import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { ContentPage } from "../components/ContentPage";
import { TransitionLink } from "../components/TransitionLink";
import { getLocalizedContent, getAllInsights } from "../content/loadContent";
import { useLanguage } from "../hooks/useLanguage";

export default function InsightsOverviewPage() {
  const { t, lang } = useLanguage();
  const entry = getLocalizedContent("insights-overview.md", lang);
  const insights = getAllInsights(lang);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <ContentPage
      entry={entry}
      eyebrow={t("nav.insights")}
      breadcrumb={[{ label: t("breadcrumb.home"), href: "/" }, { label: t("nav.insights") }]}
    >
      {insights.length > 0 && (
        <div className="mt-10 flex flex-col">
          {insights.map((a, i) => {
            const isActive = i === activeIndex;
            return (
              <TransitionLink
                key={a.frontmatter.slug}
                to={`/insights/${a.frontmatter.slug}`}
                className="group block border-t first:border-t-0 py-6"
                style={{ borderColor: "rgba(var(--page-fg-rgb), .08)" }}
                onMouseEnter={() => setActiveIndex(i)}
              >
                <div className="flex items-baseline gap-4">
                  <span
                    style={{
                      fontFamily: "var(--font-brand)",
                      fontSize: ".72rem",
                      fontWeight: 600,
                      letterSpacing: ".08em",
                      color: isActive ? "var(--page-fg)" : "rgba(var(--page-fg-rgb), .45)",
                      transition: "color .3s",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-brand)",
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      letterSpacing: "-.01em",
                      color: isActive ? "var(--page-fg)" : "rgba(var(--page-fg-rgb), .45)",
                      transition: "color .3s",
                    }}
                  >
                    {a.frontmatter.heading || a.frontmatter.title}
                  </span>
                </div>
                <p
                  className="md:hidden mt-2"
                  style={{
                    fontSize: ".92rem",
                    lineHeight: 1.6,
                    color: "rgba(var(--page-fg-rgb), .6)",
                    maxWidth: "34rem",
                  }}
                >
                  {a.frontmatter.description}
                </p>
                <div
                  className="md:hidden mt-3 inline-flex items-center gap-2"
                  style={{
                    fontSize: ".64rem",
                    fontWeight: 600,
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    color: "rgba(var(--page-fg-rgb), .5)",
                  }}
                >
                  <span>{t("insights.readMore")}</span>
                  <ArrowRight size={14} />
                </div>
                <div
                  className="hidden md:block"
                  style={{
                    maxHeight: isActive ? "8rem" : "0",
                    opacity: isActive ? 1 : 0,
                    marginTop: isActive ? "8px" : "0",
                    overflow: "hidden",
                    transition: "max-height .4s ease, opacity .3s ease, margin-top .4s ease",
                  }}
                >
                  <p
                    style={{
                      fontSize: ".92rem",
                      lineHeight: 1.6,
                      color: "rgba(var(--page-fg-rgb), .6)",
                      maxWidth: "34rem",
                    }}
                  >
                    {a.frontmatter.description}
                  </p>
                  <div
                    className="mt-3 inline-flex items-center gap-2"
                    style={{
                      fontSize: ".64rem",
                      fontWeight: 600,
                      letterSpacing: ".12em",
                      textTransform: "uppercase",
                      color: "rgba(var(--page-fg-rgb), .5)",
                    }}
                  >
                    <span>{t("insights.readMore")}</span>
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform duration-300"
                    />
                  </div>
                </div>
              </TransitionLink>
            );
          })}
        </div>
      )}
    </ContentPage>
  );
}
