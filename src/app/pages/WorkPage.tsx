import { useEffect, useRef, useCallback, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects as rawProjects } from "../data/projects";
import { useCursor } from "../hooks/useCursor";
import { TransitionLink } from "../components/TransitionLink";
import { useLanguage } from "../hooks/useLanguage";
import { useTranslatedProjects } from "../hooks/useTranslatedProjects";

gsap.registerPlugin(ScrollTrigger);

/* Raw categories for filtering (language-agnostic keys) */
const rawCategories = ["All", ...Array.from(new Set(rawProjects.map((p) => p.category)))];

export default function WorkPage() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const cursor = useCursor();
  const { t } = useLanguage();
  const translatedProjects = useTranslatedProjects();
  const [filter, setFilter] = useState("All");

  /* Filter uses raw category key; display uses translated project data */
  const filtered =
    filter === "All"
      ? translatedProjects
      : translatedProjects.filter(
          (_, i) => rawProjects[i].category === filter,
        );

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
            delay: i * 0.06,
            ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 92%", once: true },
          },
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [filter]);

  const handleTilt = useCallback(
    (e: React.MouseEvent, card: HTMLDivElement) => {
      const r = card.getBoundingClientRect();
      const rx = ((e.clientX - r.left) / r.width - 0.5) * 6;
      const ry = ((e.clientY - r.top) / r.height - 0.5) * -6;
      gsap.to(card, { rotateY: rx, rotateX: ry, duration: 0.4, ease: "power2.out" });
    },
    [],
  );
  const resetTilt = useCallback((card: HTMLDivElement) => {
    gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.6, ease: "elastic.out(1,.5)" });
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative pt-32 pb-24 md:pb-36 px-6 md:px-12 lg:px-16"
      style={{ background: "#000", minHeight: "100vh" }}
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-12">
          <span
            style={{
              fontSize: ".7rem",
              fontWeight: 500,
              letterSpacing: ".16em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,.45)",
            }}
          >
            {t("work.label")}
          </span>
          <h1
            ref={headRef}
            className="mt-3"
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: "clamp(2rem,5vw,3.5rem)",
              fontWeight: 700,
              letterSpacing: "-.04em",
              color: "#fff",
              lineHeight: 1.1,
            }}
          >
            {t("work.title")}
          </h1>
        </div>

        <div className="flex flex-wrap gap-2 mb-12">
          {rawCategories.map((cat) => {
            const label = cat === "All" ? t("work.filterAll") : t(`category.${cat}`);
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className="px-4 py-1.5 rounded-full transition-all duration-300"
                style={{
                  fontSize: ".68rem",
                  fontWeight: 500,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  color: filter === cat ? "#000" : "rgba(255,255,255,.55)",
                  background:
                    filter === cat ? "rgba(255,255,255,.9)" : "rgba(255,255,255,.04)",
                  border: `1px solid ${filter === cat ? "rgba(255,255,255,.9)" : "rgba(255,255,255,.08)"}`,
                }}
                onMouseEnter={() => cursor.set("link")}
                onMouseLeave={() => cursor.reset()}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((p, i) => (
            <TransitionLink
              key={p.slug}
              to={`/work/${p.slug}`}
              className="block"
              onMouseEnter={() => cursor.set("view", t("cursor.viewProject"))}
              onMouseLeave={() => cursor.reset()}
            >
              <div
                ref={(el) => {
                  cardsRef.current[i] = el;
                }}
                className="group relative rounded-lg overflow-hidden"
                style={{ perspective: "900px", opacity: 0 }}
                onMouseMove={(e) => {
                  if (cardsRef.current[i]) handleTilt(e, cardsRef.current[i]!);
                }}
                onMouseLeave={() => {
                  if (cardsRef.current[i]) resetTilt(cardsRef.current[i]!);
                }}
              >
                <div
                  className="relative overflow-hidden rounded-lg"
                  style={{
                    border: "1px solid rgba(255,255,255,.06)",
                    transition: "border-color .4s",
                  }}
                >
                  <div
                    className="absolute inset-0 pointer-events-none -translate-x-full group-hover:translate-x-full"
                    style={{
                      zIndex: 20,
                      background:
                        "linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent)",
                      transition: "transform .7s ease-out",
                    }}
                  />
                  <svg
                    className="absolute top-2 left-2 w-5 h-5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ zIndex: 16 }}
                    viewBox="0 0 20 20"
                  >
                    <path
                      d="M0 8 L0 0 L8 0"
                      stroke="rgba(255,255,255,.25)"
                      strokeWidth="1"
                      fill="none"
                    />
                  </svg>
                  <svg
                    className="absolute bottom-2 right-2 w-5 h-5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ zIndex: 16 }}
                    viewBox="0 0 20 20"
                  >
                    <path
                      d="M20 12 L20 20 L12 20"
                      stroke="rgba(255,255,255,.25)"
                      strokeWidth="1"
                      fill="none"
                    />
                  </svg>

                  <div className="aspect-[4/5] overflow-hidden">
                    <img
                      src={p.thumbnail}
                      alt={p.title}
                      loading={i < 4 ? "eager" : "lazy"}
                      className="w-full h-full object-cover project-thumb group-hover:scale-105 transition-all duration-700"
                      style={{
                        filter: "grayscale(.8) brightness(.65) contrast(1.05)",
                      }}
                    />
                  </div>

                  <div
                    className="absolute bottom-0 left-0 right-0 p-4"
                    style={{
                      zIndex: 10,
                      background:
                        "linear-gradient(to top,rgba(0,0,0,.85) 0%,transparent 100%)",
                    }}
                  >
                    <div className="flex flex-wrap gap-1.5 mb-1.5">
                      {p.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 rounded-full"
                          style={{
                            fontSize: ".5rem",
                            fontWeight: 500,
                            letterSpacing: ".06em",
                            textTransform: "uppercase",
                            color: "rgba(255,255,255,.55)",
                            background: "rgba(255,255,255,.06)",
                            border: "1px solid rgba(255,255,255,.06)",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3
                      className="relative inline-block"
                      style={{
                        fontFamily: "'Inter',sans-serif",
                        fontSize: "clamp(.78rem,1.2vw,.92rem)",
                        fontWeight: 700,
                        color: "#fff",
                        letterSpacing: "-.02em",
                      }}
                    >
                      {p.title}
                      <span className="absolute bottom-0 left-0 w-full h-px bg-white/30 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                    </h3>
                    <p
                      style={{
                        fontSize: ".65rem",
                        color: "rgba(255,255,255,.55)",
                        marginTop: 2,
                      }}
                    >
                      {p.category} &middot; {p.year}
                    </p>
                  </div>
                </div>
              </div>
            </TransitionLink>
          ))}
        </div>
      </div>
    </section>
  );
}
