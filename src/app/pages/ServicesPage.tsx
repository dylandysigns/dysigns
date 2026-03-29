import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ServiceCard } from "../components/services/ServiceCard";
import { serviceDefinitions } from "../data/serviceTaxonomy";
import { useLanguage } from "../hooks/useLanguage";
import { useSiteContent } from "../hooks/useSiteContent";

gsap.registerPlugin(ScrollTrigger);

export default function ServicesPage() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const introRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const { t } = useLanguage();
  const content = useSiteContent();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        [headRef.current, introRef.current],
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: headRef.current, start: "top 88%", once: true },
        },
      );

      cardsRef.current.forEach((card, index) => {
        if (!card) return;
        gsap.fromTo(
          card,
          { y: 32, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.65,
            delay: index * 0.08,
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
      className="relative pt-32 pb-24 md:pb-36 px-6 md:px-12 lg:px-16"
      style={{ background: "var(--page-bg)", minHeight: "100vh" }}
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="max-w-[760px] mb-14 md:mb-16">
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
          <h1
            ref={headRef}
            className="mt-3"
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: "clamp(2rem,5vw,3.5rem)",
              fontWeight: 700,
              letterSpacing: "-.04em",
              color: "var(--page-fg)",
              lineHeight: 1.08,
            }}
          >
            {t("services.title")}
          </h1>
          <p
            ref={introRef}
            className="mt-5"
            style={{
              maxWidth: "42rem",
              fontSize: ".98rem",
              lineHeight: 1.8,
              color: "rgba(var(--page-fg-rgb), .62)",
            }}
          >
            {t("services.pageIntro")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-fr">
          {serviceDefinitions.map((service, index) => {
            const contentItem = content.services[service.contentIndex];

            return (
              <div
                key={service.slug}
                className="h-full"
                ref={(el) => {
                  cardsRef.current[index] = el;
                }}
                style={{ opacity: 0 }}
              >
                <ServiceCard
                  ctaLabel={t("services.explore")}
                  description={contentItem.description}
                  href={`/services/${service.slug}`}
                  slug={service.slug}
                  title={contentItem.title}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
