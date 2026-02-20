import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Palette, Layout, Box, Compass } from "lucide-react";
import { useCursor } from "../../hooks/useCursor";
import { useLanguage } from "../../hooks/useLanguage";
import { useSiteContent } from "../../hooks/useSiteContent";

gsap.registerPlugin(ScrollTrigger);

const icons = [Palette, Layout, Box, Compass];

export function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const cursor = useCursor();
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
        background: "#000",
        borderTop: "1px solid rgba(255,255,255,.04)",
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
              color: "rgba(255,255,255,.45)",
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
              color: "#fff",
              lineHeight: 1.1,
              opacity: 0,
            }}
          >
            {t("services.title")}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {content.services.map((s, i) => {
            const Icon = icons[i] || Box;
            return (
              <div
                key={i}
                ref={(el) => {
                  cardsRef.current[i] = el;
                }}
                className="group relative p-7 md:p-9 rounded-xl overflow-hidden"
                style={{
                  border: "1px solid rgba(255,255,255,.06)",
                  background: "rgba(255,255,255,.02)",
                  transition: "border-color .4s, transform .4s",
                  opacity: 0,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "rgba(255,255,255,.16)";
                  (e.currentTarget as HTMLElement).style.transform =
                    "translateY(-4px)";
                  cursor.set("link");
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "rgba(255,255,255,.06)";
                  (e.currentTarget as HTMLElement).style.transform =
                    "translateY(0)";
                  cursor.reset();
                }}
              >
                {/* corner frames */}
                <svg
                  className="absolute top-0 left-0 w-8 h-8 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  viewBox="0 0 32 32"
                >
                  <path
                    d="M0 14 L0 0 L14 0"
                    stroke="rgba(255,255,255,.2)"
                    strokeWidth="1"
                    fill="none"
                  />
                </svg>
                <svg
                  className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  viewBox="0 0 32 32"
                >
                  <path
                    d="M32 18 L32 32 L18 32"
                    stroke="rgba(255,255,255,.2)"
                    strokeWidth="1"
                    fill="none"
                  />
                </svg>

                {/* sweep */}
                <div
                  className="absolute inset-0 -translate-x-full group-hover:translate-x-full pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(90deg,transparent,rgba(255,255,255,.05),transparent)",
                    transition: "transform .7s ease-out",
                  }}
                />

                <Icon
                  size={22}
                  strokeWidth={1.5}
                  className="mb-5 text-white/35 group-hover:text-white/65 transition-colors duration-300"
                />
                <h3
                  style={{
                    fontFamily: "'Inter',sans-serif",
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "#fff",
                    letterSpacing: "-.02em",
                  }}
                >
                  {s.title}
                </h3>
                <p
                  className="mt-2"
                  style={{
                    fontSize: ".88rem",
                    lineHeight: 1.65,
                    color: "rgba(255,255,255,.6)",
                  }}
                >
                  {s.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
