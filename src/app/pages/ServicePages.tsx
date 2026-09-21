import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Breadcrumb } from "../components/Breadcrumb";
import { Seo } from "../components/Seo";
import { ServiceCarousel } from "../components/services/ServiceCarousel";
import { FaqAccordionItem } from "../components/FaqAccordionItem";
import {
  getLocalizedContent,
  getServiceIncludes,
  getSectionParagraph,
} from "../content/loadContent";
import { serviceSchema, faqPageSchema, breadcrumbListSchema } from "../seo/schema";
import { renderInlineMarkdown } from "../utils/inlineMarkdown";
import { serviceDefinitions, serviceHeroImages, type ServiceSlug } from "../data/serviceTaxonomy";
import { useLanguage } from "../hooks/useLanguage";

/**
 * The five active service pages, plus Shopify development as a subpage
 * under web design (not in navigation). Each reads its content from
 * content/services/*.md (English) or content/services/*.nl.md (Dutch,
 * via getLocalizedContent — falls back to English for any page without
 * a translation yet).
 *
 * Section headings "What this includes" / "Who it is for" / "Frequently
 * asked questions" are structural markers only — they stay literally in
 * English in every markdown file (including .nl.md) so the same parser
 * (getServiceIncludes / getSectionParagraph / faqItems) works for both
 * languages without duplicated matching logic. What's actually shown on
 * screen for those headings comes from t(), not the markdown text. The
 * one exception is "why this sits" — its heading is itself the lookup
 * key (some services customise it, e.g. Shopify), so that heading is
 * written in the target language directly in the markdown file.
 */

function getOtherServices(currentSlug: string, lang: "en" | "nl") {
  return serviceDefinitions
    .filter((s) => s.slug !== currentSlug)
    .map((s) => {
      const otherEntry = getLocalizedContent(`services/${s.slug}.md`, lang);
      return {
        title: otherEntry.frontmatter.heading || otherEntry.frontmatter.title,
        description: otherEntry.frontmatter.description,
        href: `/${s.slug}`,
      };
    });
}

function ServicePage({
  slug,
  breadcrumbParentSlug,
  customWhyHeading,
}: {
  slug: string;
  /** Only set for the Shopify subpage — adds "Web design and development"
   * as a breadcrumb link between Home and this page. */
  breadcrumbParentSlug?: ServiceSlug;
  /** Only set when a service overrides the default "why this sits"
   * heading (Shopify). Both languages required since this string is
   * also the markdown section-lookup key. */
  customWhyHeading?: { en: string; nl: string };
}) {
  const { t, lang } = useLanguage();
  const entry = getLocalizedContent(`services/${slug}.md`, lang);
  const path = `/${slug}`;
  const includes = getServiceIncludes(entry.rawBody);
  const heroImage = serviceHeroImages[slug];
  const [activeInclude, setActiveInclude] = useState(0);
  const [isHoveringIncludes, setIsHoveringIncludes] = useState(false);
  const floatingImageRef = useRef<HTMLDivElement>(null);
  const floatingImageX = useRef<((value: number) => void) | null>(null);
  const floatingImageY = useRef<((value: number) => void) | null>(null);

  useEffect(() => {
    const el = floatingImageRef.current;
    if (!el) return;
    gsap.set(el, { xPercent: -50, yPercent: -130 });
    floatingImageX.current = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
    floatingImageY.current = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });
  }, []);

  const handleIncludesMouseMove = (e: React.MouseEvent) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    floatingImageX.current?.(e.clientX);
    floatingImageY.current?.(e.clientY);
  };
  const otherServices = getOtherServices(slug, lang);
  const whyHeading = customWhyHeading ? customWhyHeading[lang] : t("services.whyHeadingDefault");
  const whyText = getSectionParagraph(entry.rawBody, whyHeading);
  const whoText = getSectionParagraph(entry.rawBody, "Who it is for");
  const heading = entry.frontmatter.heading || entry.frontmatter.title;
  const serviceIndex = serviceDefinitions.findIndex((s) => s.slug === (slug as ServiceSlug));

  const parentEntry = breadcrumbParentSlug
    ? getLocalizedContent(`services/${breadcrumbParentSlug}.md`, lang)
    : null;
  const breadcrumb = [
    { label: t("breadcrumb.home"), href: "/" },
    ...(parentEntry
      ? [
          {
            label: parentEntry.frontmatter.heading || parentEntry.frontmatter.title,
            href: `/${breadcrumbParentSlug}`,
          },
        ]
      : []),
    { label: heading },
  ];

  const breadcrumbSchema = breadcrumbListSchema(
    breadcrumb.map((item) => ({ name: item.label, path: item.href ?? path })),
  );

  return (
    <section
      className="relative"
      style={{ background: "var(--page-bg)", minHeight: "100vh" }}
    >
      <Seo
        title={entry.frontmatter.title}
        description={entry.frontmatter.description}
        path={path}
        lastmod={entry.frontmatter.lastUpdated}
        schema={[
          breadcrumbSchema,
          serviceSchema({
            name: heading,
            description: entry.frontmatter.description,
            path,
            areaServed: ["Worldwide"],
          }),
          ...(entry.faqItems.length > 0 ? [faqPageSchema(entry.faqItems)] : []),
        ]}
      />

      {/* ── HERO ── */}
      <div className="max-w-[1100px] mx-auto px-6 md:px-12 pt-32 md:pt-40 pb-14 md:pb-16">
        {serviceIndex >= 0 && (
          <div
            className="mb-8 flex items-baseline justify-between"
            aria-hidden="true"
          >
            <span
              style={{
                fontFamily: "var(--font-brand)",
                fontSize: "clamp(1.6rem,4vw,2.6rem)",
                fontWeight: 700,
                letterSpacing: "-.03em",
                color: "var(--page-fg)",
              }}
            >
              {String(serviceIndex + 1).padStart(2, "0")}
            </span>
            <span
              style={{
                fontFamily: "var(--font-brand)",
                fontSize: "clamp(1.6rem,4vw,2.6rem)",
                fontWeight: 700,
                letterSpacing: "-.03em",
                color: "rgba(var(--page-fg-rgb), .55)",
              }}
            >
              /{String(serviceDefinitions.length).padStart(2, "0")}
            </span>
          </div>
        )}
        <div className="mb-8">
          <Breadcrumb items={breadcrumb} />
        </div>
        <span
          style={{
            fontSize: ".7rem",
            fontWeight: 500,
            letterSpacing: ".16em",
            textTransform: "uppercase",
            color: "rgba(var(--page-fg-rgb), .55)",
          }}
        >
          {t("services.eyebrow")}
        </span>
        <h1
          className="mt-3"
          style={{
            fontFamily: "var(--font-brand)",
            fontSize: "clamp(2.3rem,6vw,4.2rem)",
            fontWeight: 700,
            letterSpacing: "-.045em",
            color: "var(--page-fg)",
            lineHeight: 1.04,
          }}
        >
          {heading}
        </h1>
        {entry.frontmatter.answerBlock && (
          <p
            className="mt-6"
            style={{
              maxWidth: "42rem",
              fontFamily: "'Instrument Serif',serif",
              fontSize: "clamp(1.05rem,2vw,1.4rem)",
              fontStyle: "italic",
              lineHeight: 1.75,
              color: "rgba(var(--page-fg-rgb), .72)",
            }}
          >
            {entry.frontmatter.answerBlock}
          </p>
        )}
      </div>

      {/* ── WHAT THIS INCLUDES — vertical hover-reveal list, service
           image on desktop stays fixed while list rows expand/highlight
           on hover ── */}
      {includes.length > 0 && (
        <div
          className="border-t"
          style={{ borderColor: "rgba(var(--page-fg-rgb), .06)" }}
        >
          <div className="max-w-[1100px] mx-auto px-6 md:px-12 py-14 md:py-16">
            <h2
              className="mb-8 md:mb-10"
              style={{
                fontFamily: "var(--font-brand)",
                fontSize: "clamp(1.15rem,2vw,1.5rem)",
                fontWeight: 700,
                letterSpacing: "-.02em",
                color: "var(--page-fg)",
              }}
            >
              {t("services.whatIncludes")}
            </h2>
            <div className="max-w-[720px]">
              {heroImage && (
                <div
                  className="md:hidden mb-6 overflow-hidden rounded-xl"
                  style={{
                    aspectRatio: "16 / 10",
                    border: "1px solid rgba(var(--page-fg-rgb), .08)",
                  }}
                >
                  <img
                    src={heroImage}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div
                className="flex flex-col"
                onMouseEnter={() => setIsHoveringIncludes(true)}
                onMouseLeave={() => setIsHoveringIncludes(false)}
                onMouseMove={heroImage ? handleIncludesMouseMove : undefined}
              >
                {includes.map((item, i) => {
                  const isActive = i === activeInclude;
                  return (
                    <div
                      key={item.title}
                      className="border-t first:border-t-0 py-6"
                      style={{ borderColor: "rgba(var(--page-fg-rgb), .08)" }}
                      onMouseEnter={() => setActiveInclude(i)}
                    >
                      <div className="flex items-baseline gap-4">
                        <span
                          style={{
                            fontFamily: "var(--font-brand)",
                            fontSize: ".72rem",
                            fontWeight: 600,
                            letterSpacing: ".08em",
                            color: isActive
                              ? "var(--page-fg)"
                              : "rgba(var(--page-fg-rgb), .55)",
                            transition: "color .3s",
                          }}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <h3
                          style={{
                            fontFamily: "var(--font-brand)",
                            fontSize: "1.05rem",
                            fontWeight: 700,
                            letterSpacing: "-.02em",
                            color: isActive
                              ? "var(--page-fg)"
                              : "rgba(var(--page-fg-rgb), .5)",
                            transition: "color .3s",
                          }}
                        >
                          {item.title}
                        </h3>
                      </div>
                      <p
                        className="md:hidden mt-2"
                        style={{
                          fontSize: ".88rem",
                          lineHeight: 1.65,
                          color: "rgba(var(--page-fg-rgb), .6)",
                          maxWidth: "26rem",
                        }}
                      >
                        {renderInlineMarkdown(item.description)}
                      </p>
                      <p
                        className="hidden md:block"
                        style={{
                          fontSize: ".88rem",
                          lineHeight: 1.65,
                          color: "rgba(var(--page-fg-rgb), .6)",
                          maxWidth: "26rem",
                          maxHeight: isActive ? "8rem" : "0",
                          opacity: isActive ? 1 : 0,
                          marginTop: isActive ? "8px" : "0",
                          overflow: "hidden",
                          transition:
                            "max-height .4s ease, opacity .3s ease, margin-top .4s ease",
                        }}
                      >
                        {renderInlineMarkdown(item.description)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {heroImage && (
            <div
              ref={floatingImageRef}
              aria-hidden="true"
              className="hidden md:block fixed top-0 left-0 z-40 overflow-hidden rounded-xl pointer-events-none"
              style={{
                width: 360,
                height: 252,
                border: "1px solid rgba(var(--page-fg-rgb), .1)",
                boxShadow: "0 20px 50px rgba(0,0,0,.4)",
                opacity: isHoveringIncludes ? 1 : 0,
                transition: "opacity .3s ease",
              }}
            >
              <img
                src={heroImage}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          )}
        </div>
      )}

      {/* ── WHY / WHO — two static panels, no fake affordance ── */}
      {(whyText || whoText) && (
        <div
          className="border-t"
          style={{ borderColor: "rgba(var(--page-fg-rgb), .06)" }}
        >
          <div className="max-w-[1100px] mx-auto px-6 md:px-12 py-14 md:py-16 grid grid-cols-1 md:grid-cols-2 gap-4">
            {whyText && (
              <div
                className="p-7 md:p-9 rounded-xl"
                style={{
                  border: "1px solid rgba(var(--page-fg-rgb), .06)",
                  background: "rgba(var(--page-fg-rgb), .02)",
                }}
              >
                <h2
                  style={{
                    fontFamily: "var(--font-brand)",
                    fontSize: "1.15rem",
                    fontWeight: 700,
                    letterSpacing: "-.02em",
                    color: "var(--page-fg)",
                  }}
                >
                  {whyHeading}
                </h2>
                <p
                  className="mt-3"
                  style={{
                    fontSize: ".92rem",
                    lineHeight: 1.7,
                    color: "rgba(var(--page-fg-rgb), .62)",
                  }}
                >
                  {whyText && renderInlineMarkdown(whyText)}
                </p>
              </div>
            )}
            {whoText && (
              <div
                className="p-7 md:p-9 rounded-xl"
                style={{
                  border: "1px solid rgba(var(--page-fg-rgb), .06)",
                  background: "rgba(var(--page-fg-rgb), .02)",
                }}
              >
                <h2
                  style={{
                    fontFamily: "var(--font-brand)",
                    fontSize: "1.15rem",
                    fontWeight: 700,
                    letterSpacing: "-.02em",
                    color: "var(--page-fg)",
                  }}
                >
                  {t("services.whoHeading")}
                </h2>
                <p
                  className="mt-3"
                  style={{
                    fontSize: ".92rem",
                    lineHeight: 1.7,
                    color: "rgba(var(--page-fg-rgb), .62)",
                  }}
                >
                  {whoText && renderInlineMarkdown(whoText)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── FAQ ── */}
      {entry.faqItems.length > 0 && (
        <div
          className="border-t"
          style={{ borderColor: "rgba(var(--page-fg-rgb), .06)" }}
        >
          <div className="max-w-[1100px] mx-auto px-6 md:px-12 py-16 md:py-20">
            <h2
              className="mb-8"
              style={{
                fontFamily: "var(--font-brand)",
                fontSize: "clamp(1.3rem,2.5vw,1.8rem)",
                fontWeight: 700,
                letterSpacing: "-.03em",
                color: "var(--page-fg)",
                lineHeight: 1.2,
              }}
            >
              {t("services.faqHeading")}
            </h2>
            <div className="faq-grid">
              {entry.faqItems.map((item, i) => (
                <FaqAccordionItem key={item.question} item={item} defaultOpen={i === 0} />
              ))}
            </div>
          </div>

          <style>{`
            .faq-grid { display: grid; grid-template-columns: 1fr; align-items: start; gap: .9rem; }
            @media (min-width: 768px) {
              .faq-grid { grid-template-columns: repeat(2, 1fr); }
            }
            @media (min-width: 1024px) {
              .faq-grid { grid-template-columns: repeat(3, 1fr); }
            }
          `}</style>
        </div>
      )}

      {/* ── CAROUSEL — the site's other services, not this page's own
           "what this includes" and not case studies ── */}
      {otherServices.length > 0 && (
        <div
          className="border-t pt-14 md:pt-16"
          style={{ borderColor: "rgba(var(--page-fg-rgb), .06)" }}
        >
          <div className="max-w-[1100px] mx-auto px-6 md:px-12">
            <span
              style={{
                fontSize: ".7rem",
                fontWeight: 500,
                letterSpacing: ".16em",
                textTransform: "uppercase",
                color: "rgba(var(--page-fg-rgb), .55)",
              }}
            >
              {t("services.alsoFrom")}
            </span>
          </div>
          <div className="relative left-1/2 mt-4 w-screen -translate-x-1/2 md:mt-6 pb-14 md:pb-16">
            <ServiceCarousel items={otherServices} />
          </div>
        </div>
      )}
    </section>
  );
}

export function WebDesignPage() {
  return <ServicePage slug="web-design" />;
}

export function SocialMediaMetaAdsPage() {
  return <ServicePage slug="social-media-meta-ads" />;
}

export function UxUiDesignPage() {
  return <ServicePage slug="ux-ui-design" />;
}

export function BrandingPage() {
  return <ServicePage slug="branding" />;
}

export function AiImplementationPage() {
  return <ServicePage slug="ai-implementation" />;
}

export function ShopifyDevelopmentPage() {
  return (
    <ServicePage
      slug="shopify-development"
      breadcrumbParentSlug="web-design"
      customWhyHeading={{
        en: "When Shopify is not the right choice",
        nl: "Wanneer Shopify niet de juiste keuze is",
      }}
    />
  );
}
