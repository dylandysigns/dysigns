import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "../../hooks/useLanguage";
import { useSiteContent } from "../../hooks/useSiteContent";
import { serviceDefinitions } from "../../data/serviceTaxonomy";
import { ServiceCard } from "../services/ServiceCard";

gsap.registerPlugin(ScrollTrigger);

export function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const { t } = useLanguage();
  const content = useSiteContent();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: { trigger: headRef.current, start: "top 85%", once: true },
        },
      );

      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.fromTo(
          card,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            delay: i * 0.08,
            ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 90%", once: true },
          },
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="services"
      className="relative py-24 md:py-36 px-6 md:px-12 lg:px-16"
      style={{
        background: "var(--page-bg)",
        borderTop: "1px solid rgba(var(--page-fg-rgb), .04)",
      }}
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-16">
          <span
            style={{
              fontSize: ".7rem",
              fontWeight: 500,
              letterSpacing: ".16em",
              textTransform: "uppercase",
              color: "rgba(var(--page-fg-rgb), .45)",
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
              opacity: 0,
            }}
          >
            {t("services.title")}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-fr">
          {content.services.map((s, i) => {
            const service = serviceDefinitions[i];

            return (
              <div
                key={i}
                className="h-full"
                ref={(el) => {
                  cardsRef.current[i] = el;
                }}
                style={{ opacity: 0 }}
              >
                <ServiceCard
                  ctaLabel={t("services.explore")}
                  description={s.description}
                  href={`/services/${service.slug}`}
                  slug={service.slug}
                  title={s.title}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
