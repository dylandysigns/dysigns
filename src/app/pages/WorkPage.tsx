import { useCallback, useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TransitionLink } from "../components/TransitionLink";
import { projects as rawProjects } from "../data/projects";
import { useCursor } from "../hooks/useCursor";
import { useLanguage } from "../hooks/useLanguage";
import { useTranslatedProjects } from "../hooks/useTranslatedProjects";

gsap.registerPlugin(ScrollTrigger);

function getProjectYear(value: string): number {
  const match = value.match(/\b(20\d{2}|19\d{2})\b/);
  return match ? Number(match[1]) : 0;
}

export default function WorkPage() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const cursor = useCursor();
  const { t } = useLanguage();
  const translatedProjects = useTranslatedProjects();

  const projectEntries = useMemo(
    () =>
      translatedProjects
        .map((project, index) => ({
          project,
          rawTags: rawProjects[index].tags,
          year: getProjectYear(rawProjects[index].year),
        }))
        .sort((a, b) => b.year - a.year),
    [translatedProjects],
  );

  const groupedEntries = useMemo(() => {
    let startIndex = 0;

    return projectEntries.reduce<
      Array<{
        year: number;
        startIndex: number;
        items: typeof projectEntries;
      }>
    >((groups, entry) => {
      const lastGroup = groups[groups.length - 1];

      if (!lastGroup || lastGroup.year !== entry.year) {
        groups.push({
          year: entry.year,
          startIndex,
          items: [entry],
        });
      } else {
        lastGroup.items.push(entry);
      }

      startIndex += 1;
      return groups;
    }, []);
  }, [projectEntries]);

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

      cardsRef.current.forEach((card, index) => {
        if (!card) return;

        gsap.fromTo(
          card,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            delay: index * 0.05,
            ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 92%", once: true },
          },
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [groupedEntries.length]);

  const handleTilt = useCallback((e: React.MouseEvent, card: HTMLDivElement) => {
    const rect = card.getBoundingClientRect();
    const rotateY = ((e.clientX - rect.left) / rect.width - 0.5) * 6;
    const rotateX = ((e.clientY - rect.top) / rect.height - 0.5) * -6;
    gsap.to(card, { rotateY, rotateX, duration: 0.4, ease: "power2.out" });
  }, []);

  const resetTilt = useCallback((card: HTMLDivElement) => {
    gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.6, ease: "elastic.out(1,.5)" });
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative pt-32 pb-24 md:pb-36 px-6 md:px-12 lg:px-16"
      style={{ background: "var(--page-bg)", minHeight: "100vh" }}
    >
      <div className="max-w-[1320px] mx-auto">
        <div className="mb-12">
          <span
            style={{
              fontSize: ".7rem",
              fontWeight: 500,
              letterSpacing: ".16em",
              textTransform: "uppercase",
              color: "rgba(var(--page-fg-rgb), .45)",
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
              color: "var(--page-fg)",
              lineHeight: 1.1,
            }}
          >
            {t("work.title")}
          </h1>
        </div>

        <div className="space-y-8">
          {groupedEntries.map((group) => (
            <div key={group.year} className="space-y-3">
              <div
                className="flex items-center gap-4"
                style={{
                  borderBottom: "1px solid rgba(var(--page-fg-rgb), .08)",
                  paddingBottom: 8,
                }}
              >
                <h2
                  style={{
                    fontFamily: "'Inter',sans-serif",
                    fontSize: "clamp(1.2rem,2vw,1.7rem)",
                    fontWeight: 700,
                    letterSpacing: "-.03em",
                    color: "var(--page-fg)",
                    lineHeight: 1,
                  }}
                >
                  {group.year}
                </h2>
                <span
                  style={{
                    fontSize: ".7rem",
                    fontWeight: 500,
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    color: "rgba(var(--page-fg-rgb), .4)",
                  }}
                >
                  {group.items.length} {group.items.length === 1 ? "project" : "projects"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-1.5 gap-y-1.5">
                {group.items.map(({ project, rawTags, year }, index) => {
                  const flatIndex = group.startIndex + index;

                  return (
                    <div
                      key={project.slug}
                      className="w-full sm:max-w-[17.75rem] lg:max-w-[16.75rem] xl:max-w-[17.5rem] sm:mx-auto"
                    >
                      <div
                        ref={(el) => {
                          cardsRef.current[flatIndex] = el;
                        }}
                        className="group relative rounded-lg overflow-hidden"
                        style={{ perspective: "900px", opacity: 0 }}
                        onMouseMove={(e) => {
                          if (cardsRef.current[flatIndex]) {
                            handleTilt(e, cardsRef.current[flatIndex]!);
                          }
                        }}
                        onMouseLeave={() => {
                          if (cardsRef.current[flatIndex]) {
                            resetTilt(cardsRef.current[flatIndex]!);
                          }
                          cursor.reset();
                        }}
                        onMouseEnter={() => cursor.set("view", t("cursor.viewProject"))}
                      >
                        <TransitionLink
                          to={`/work/${project.slug}`}
                          aria-label={`${t("cursor.viewProject")} ${project.title}`}
                          className="absolute inset-0 z-10 rounded-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/35"
                        >
                          <span className="sr-only">{project.title}</span>
                        </TransitionLink>

                        <div
                          className="relative overflow-hidden rounded-lg"
                          style={{
                            border: "1px solid rgba(var(--page-fg-rgb), .06)",
                            transition: "border-color .4s",
                          }}
                        >
                          <div
                            className="absolute inset-0 pointer-events-none -translate-x-full group-hover:translate-x-full"
                            style={{
                              zIndex: 20,
                              background:
                                "linear-gradient(90deg,transparent,rgba(var(--page-fg-rgb), .08),transparent)",
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
                              stroke="rgba(var(--page-fg-rgb), .25)"
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
                              stroke="rgba(var(--page-fg-rgb), .25)"
                              strokeWidth="1"
                              fill="none"
                            />
                          </svg>

                          <div className="aspect-[4/4.7] overflow-hidden">
                            <img
                              src={project.thumbnail}
                              alt={project.title}
                              loading={flatIndex < 4 ? "eager" : "lazy"}
                              className="w-full h-full object-cover project-thumb group-hover:scale-105 transition-all duration-700"
                              style={{
                                filter: "grayscale(.8) brightness(.65) contrast(1.05)",
                              }}
                            />
                          </div>

                          <div
                            className="absolute bottom-0 left-0 right-0"
                            style={{
                              zIndex: 12,
                              padding: "0.875rem",
                              background:
                                "linear-gradient(to top,rgba(var(--page-bg-rgb), .88) 0%,transparent 100%)",
                            }}
                          >
                            <div className="relative z-20 flex flex-wrap gap-1.5 mb-1.5">
                              {rawTags.slice(0, 2).map((rawTag) => (
                                <span
                                  key={`${project.slug}-${rawTag}`}
                                  className="rounded-full px-2 py-1"
                                  style={{
                                    fontSize: ".5rem",
                                    fontWeight: 600,
                                    letterSpacing: ".08em",
                                    textTransform: "uppercase",
                                    color: "rgba(var(--page-fg-rgb), .62)",
                                    background: "rgba(var(--page-fg-rgb), .06)",
                                    border: "1px solid rgba(var(--page-fg-rgb), .06)",
                                  }}
                                >
                                  {t(`tag.${rawTag}`)}
                                </span>
                              ))}
                            </div>

                            <div className="relative z-20">
                              <h3
                                className="relative inline-block"
                                style={{
                                  fontFamily: "'Inter',sans-serif",
                                  fontSize: "clamp(.76rem,1.05vw,.9rem)",
                                  fontWeight: 700,
                                  color: "var(--page-fg)",
                                  letterSpacing: "-.02em",
                                }}
                              >
                                {project.title}
                                <span
                                  className="absolute bottom-0 left-0 w-full h-px origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
                                  style={{ background: "rgba(var(--page-fg-rgb), .3)" }}
                                />
                              </h3>
                              <p
                                style={{
                                  fontSize: ".64rem",
                                  color: "rgba(var(--page-fg-rgb), .55)",
                                  marginTop: 2,
                                }}
                              >
                                {project.category} &middot; {year}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
