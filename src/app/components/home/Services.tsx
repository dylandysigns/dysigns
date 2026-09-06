import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { serviceDefinitions } from "../../data/serviceTaxonomy";
import { ServiceCard } from "../services/ServiceCard";
import { getLocalizedContent } from "../../content/loadContent";
import { useLanguage } from "../../hooks/useLanguage";

gsap.registerPlugin(ScrollTrigger);

export function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const { t, lang } = useLanguage();

  // Recomputed per language — content/services/{slug}.nl.md when it
  // exists, English otherwise (getLocalizedContent's own fallback).
  const services = serviceDefinitions.map(({ slug }) => {
    const entry = getLocalizedContent(`services/${slug}.md`, lang);
    return {
      slug,
      title: entry.frontmatter.heading || entry.frontmatter.title,
      description: entry.frontmatter.description,
    };
  });

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    // Initial hidden state is set here, client-side, on mount — never as an
    // inline style in the JSX itself. The server-rendered HTML (and the
    // no-JS case) shows this section at full opacity; GSAP only animates
    // from invisible to visible once it has actually attached.
    if (headRef.current) gsap.set(headRef.current, { y: 30, opacity: 0 });
    cardsRef.current.forEach((card) => {
      if (card) gsap.set(card, { y: 40, opacity: 0 });
    });

    const ctx = gsap.context(() => {
      gsap.to(headRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: headRef.current, start: "top 85%", once: true },
      });

      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.to(card, {
          y: 0,
          opacity: 1,
          duration: 0.6,
          delay: i * 0.06,
          ease: "power3.out",
          scrollTrigger: { trigger: card, start: "top 90%", once: true },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="services"
      className="relative py-16 md:py-20 px-6 md:px-12 lg:px-16"
      style={{
        background: "var(--page-bg)",
        borderTop: "1px solid rgba(var(--page-fg-rgb), .04)",
      }}
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-10 md:mb-12">
          <span
            style={{
              fontSize: ".7rem",
              fontWeight: 500,
              letterSpacing: ".16em",
              textTransform: "uppercase",
              color: "rgba(var(--page-fg-rgb), .55)",
            }}
          >
            {t("services.label")}
          </span>
          <h2
            ref={headRef}
            className="mt-3"
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: "clamp(1.5rem,3.5vw,2.6rem)",
              fontWeight: 700,
              letterSpacing: "-.03em",
              color: "var(--page-fg)",
              lineHeight: 1.1,
            }}
          >
            {t("services.introHeading")}
          </h2>
          {/* Compensates for removing the hero's supporting paragraph — this
              is now the only place on the homepage that says who DYSIGNS
              is, what it does, for whom and where. Full version (with
              founder name) lives on /about. */}
          <p
            className="mt-4 max-w-2xl"
            style={{
              fontSize: ".95rem",
              lineHeight: 1.6,
              color: "rgba(var(--page-fg-rgb), .6)",
            }}
          >
            {t("services.introText")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 auto-rows-fr">
          {services.map((s, i) => (
            <div
              key={s.slug}
              className="h-full"
              ref={(el) => {
                cardsRef.current[i] = el;
              }}
            >
              <ServiceCard
                title={s.title}
                description={s.description}
                href={`/${s.slug}`}
                slug={s.slug}
                index={i}
                linkLabel={`${t("services.explorePrefix")} ${s.title.toLowerCase()}`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
