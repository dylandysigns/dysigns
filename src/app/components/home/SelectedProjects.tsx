import { useEffect, useRef, useCallback, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCursor } from "../../hooks/useCursor";
import { TransitionLink } from "../TransitionLink";
import { useLanguage } from "../../hooks/useLanguage";
import { useTranslatedProjects } from "../../hooks/useTranslatedProjects";

gsap.registerPlugin(ScrollTrigger);

const INITIAL_COUNT = 4;
const MOBILE_BP = 768; // md breakpoint

/** Responsive mobile check — works in preview + real devices */
function useIsMobile() {
  const [mobile, setMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < MOBILE_BP : false,
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BP - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches);
    setMobile(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return mobile;
}

export function SelectedProjects() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const extraRef = useRef<(HTMLDivElement | null)[]>([]);
  const cursor = useCursor();
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const projects = useTranslatedProjects();
  const isMobile = useIsMobile();

  /* Track whether the entrance animation has already played so a
     language-switch re-render doesn't reset elements to opacity:0 */
  const headAnimDone = useRef(false);
  const cardsAnimDone = useRef(false);
  const extraAnimDone = useRef(false);

  const visible = expanded ? projects : projects.slice(0, INITIAL_COUNT);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) {
      headAnimDone.current = true;
      cardsAnimDone.current = true;
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headRef.current,
            start: "top 85%",
            once: true,
          },
          onComplete: () => {
            headAnimDone.current = true;
          },
        },
      );
      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.fromTo(
          card,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            delay: i * 0.08,
            ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 90%", once: true },
            onComplete: () => {
              cardsAnimDone.current = true;
            },
          },
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!expanded) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) {
      extraAnimDone.current = true;
      return;
    }

    requestAnimationFrame(() => {
      extraRef.current.forEach((card, i) => {
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
            onComplete: () => {
              extraAnimDone.current = true;
            },
          },
        );
      });
    });
  }, [expanded]);

  const handleTilt = useCallback(
    (e: React.MouseEvent, card: HTMLDivElement) => {
      const r = card.getBoundingClientRect();
      const rx = ((e.clientX - r.left) / r.width - 0.5) * 6;
      const ry = ((e.clientY - r.top) / r.height - 0.5) * -6;
      gsap.to(card, {
        rotateY: rx,
        rotateX: ry,
        duration: 0.4,
        ease: "power2.out",
      });
    },
    [],
  );
  const resetTilt = useCallback((card: HTMLDivElement) => {
    gsap.to(card, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.6,
      ease: "elastic.out(1,.5)",
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 md:py-36 px-6 md:px-12 lg:px-16"
      style={{ background: "#000" }}
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-16 flex items-end justify-between">
          <div>
            <span
              style={{
                fontSize: ".7rem",
                fontWeight: 500,
                letterSpacing: ".16em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,.45)",
              }}
            >
              {t("projects.label")}
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
                opacity: headAnimDone.current ? 1 : 0,
              }}
            >
              {t("projects.heading")}
            </h2>
          </div>
          <TransitionLink
            to="/work"
            className="hidden md:block relative overflow-hidden group"
            style={{
              fontSize: ".75rem",
              fontWeight: 500,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,.55)",
              transition: "color .3s",
            }}
            onMouseEnter={() => cursor.set("link")}
            onMouseLeave={() => cursor.reset()}
          >
            {t("projects.viewAll")}
            <span className="absolute bottom-0 left-0 w-full h-px bg-white/25 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
          </TransitionLink>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {visible.map((p, i) => {
            const isExtra = i >= INITIAL_COUNT;
            return (
              <TransitionLink
                key={p.slug}
                to={`/work/${p.slug}`}
                className="block"
                onMouseEnter={() =>
                  cursor.set("view", t("cursor.viewProject"))
                }
                onMouseLeave={() => cursor.reset()}
              >
                <div
                  ref={(el) => {
                    if (isExtra) {
                      extraRef.current[i - INITIAL_COUNT] = el;
                    } else {
                      cardsRef.current[i] = el;
                    }
                  }}
                  className="group relative rounded-lg overflow-hidden"
                  style={{
                    perspective: "900px",
                    opacity: isExtra
                      ? extraAnimDone.current
                        ? 1
                        : 0
                      : cardsAnimDone.current
                        ? 1
                        : 0,
                  }}
                  onMouseMove={(e) => {
                    if (isMobile) return;
                    const card = isExtra
                      ? extraRef.current[i - INITIAL_COUNT]
                      : cardsRef.current[i];
                    if (card) handleTilt(e, card);
                  }}
                  onMouseLeave={() => {
                    if (isMobile) return;
                    const card = isExtra
                      ? extraRef.current[i - INITIAL_COUNT]
                      : cardsRef.current[i];
                    if (card) resetTilt(card);
                  }}
                >
                  <div
                    className="relative overflow-hidden rounded-lg"
                    style={{
                      border: "1px solid rgba(255,255,255,.06)",
                      transition: "border-color .4s",
                    }}
                  >
                    {/* sweep shine — desktop only */}
                    {!isMobile && (
                      <div
                        className="absolute inset-0 pointer-events-none -translate-x-full group-hover:translate-x-full"
                        style={{
                          zIndex: 20,
                          background:
                            "linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent)",
                          transition: "transform .7s ease-out",
                        }}
                      />
                    )}
                    {/* border glow — desktop only */}
                    {!isMobile && (
                      <div
                        className="absolute inset-0 pointer-events-none rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          zIndex: 15,
                          border: "1px solid rgba(255,255,255,.16)",
                        }}
                      />
                    )}
                    {/* corner brackets — desktop only */}
                    {!isMobile && (
                      <>
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
                      </>
                    )}

                    {/* thumbnail */}
                    <div className="aspect-[4/5] overflow-hidden">
                      <img
                        src={p.thumbnail}
                        alt={p.title}
                        loading={i < 4 ? "eager" : "lazy"}
                        className={`w-full h-full object-cover project-thumb transition-all duration-700 ${
                          isMobile ? "" : "group-hover:scale-105"
                        }`}
                        style={{
                          filter: isMobile
                            ? "grayscale(0) brightness(.85) contrast(1)"
                            : "grayscale(.8) brightness(.65) contrast(1.05)",
                        }}
                      />
                    </div>

                    {/* ── Title overlay ── */}
                    <div
                      className="absolute bottom-0 left-0 right-0"
                      style={{
                        zIndex: 10,
                        padding: isMobile ? "48px 14px 14px" : "16px",
                        background: isMobile
                          ? "linear-gradient(to top,rgba(0,0,0,.92) 0%,rgba(0,0,0,.6) 50%,transparent 100%)"
                          : "linear-gradient(to top,rgba(0,0,0,.85) 0%,transparent 100%)",
                      }}
                    >
                      <div className="flex flex-wrap gap-1.5 mb-1.5">
                        {p.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className={`px-1.5 py-0.5 rounded-full transition-transform duration-300 ${
                              isMobile
                                ? ""
                                : "group-hover:-translate-y-0.5"
                            }`}
                            style={{
                              fontSize: ".5rem",
                              fontWeight: 500,
                              letterSpacing: ".06em",
                              textTransform: "uppercase",
                              color: isMobile
                                ? "rgba(255,255,255,.65)"
                                : "rgba(255,255,255,.45)",
                              background: isMobile
                                ? "rgba(255,255,255,.1)"
                                : "rgba(255,255,255,.06)",
                              border: "1px solid rgba(255,255,255,.08)",
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
                          fontSize: isMobile
                            ? ".92rem"
                            : "clamp(.78rem,1.2vw,.92rem)",
                          fontWeight: 700,
                          color: "#fff",
                          letterSpacing: "-.02em",
                        }}
                      >
                        {p.title}
                        <span
                          className={`absolute bottom-0 left-0 w-full h-px bg-white/30 origin-left transition-transform duration-500 ${
                            isMobile
                              ? "scale-x-100"
                              : "scale-x-0 group-hover:scale-x-100"
                          }`}
                        />
                      </h3>
                      <p
                        style={{
                          fontSize: isMobile ? ".7rem" : ".65rem",
                          color: isMobile
                            ? "rgba(255,255,255,.7)"
                            : "rgba(255,255,255,.55)",
                          marginTop: 2,
                        }}
                      >
                        {p.category} &middot; {p.year}
                      </p>
                    </div>
                  </div>
                </div>
              </TransitionLink>
            );
          })}
        </div>

        {!expanded && projects.length > INITIAL_COUNT && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => setExpanded(true)}
              className="relative overflow-hidden px-7 py-3 rounded-full border border-white/15 group"
              style={{
                fontSize: ".72rem",
                fontWeight: 500,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,.4)",
                transition: "border-color .3s, color .3s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(255,255,255,.3)";
                (e.currentTarget as HTMLElement).style.color = "#fff";
                cursor.set("link");
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(255,255,255,.15)";
                (e.currentTarget as HTMLElement).style.color =
                  "rgba(255,255,255,.55)";
                cursor.reset();
              }}
            >
              <span
                className="absolute inset-0 -translate-x-full group-hover:translate-x-full"
                style={{
                  background:
                    "linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent)",
                  transition: "transform .7s ease-out",
                }}
              />
              {t("projects.showMore")}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

/* CSS for project card hover color reveal — desktop only (fine pointer) */
const projectThumbStyle = document.createElement("style");
projectThumbStyle.textContent = `
  @media (min-width: 768px) {
    .group:hover .project-thumb {
      filter: grayscale(0) brightness(1) contrast(1) !important;
    }
  }
`;
if (!document.head.querySelector("[data-project-thumb-style]")) {
  projectThumbStyle.setAttribute("data-project-thumb-style", "");
  document.head.appendChild(projectThumbStyle);
}
