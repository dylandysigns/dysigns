import React, { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { zoomToGridData, projects } from "../../data/projects";
import { useCursor } from "../../hooks/useCursor";
import { TransitionLink } from "../TransitionLink";
import { useLanguage } from "../../hooks/useLanguage";

gsap.registerPlugin(ScrollTrigger);

/**
 * ZoomToGrid — Pinned zoom-out-to-grid section (3×3)
 *
 * All 9 tiles (8 surrounding + 1 hero center) are clickable and route
 * to case detail pages. Pointer-events stay active during and after
 * the pinned scroll animation.
 *
 * Pin is created synchronously in useEffect (no rAF delay) so the
 * pin-spacer is in flow immediately. refreshPriority: -1 ensures
 * this section refreshes after Hero (2) and SentenceReveal (1).
 *
 * NOTE: resize + font-load ScrollTrigger.refresh is handled globally in Layout.tsx
 */

/* Map each grid position (row-major, including hero center) to a project */
const tileProjects = [
  projects[0], // row 1 col 1
  projects[1], // row 1 col 2
  projects[2], // row 1 col 3
  projects[3], // row 2 col 1
  projects[4], // row 2 col 2 (hero center)
  projects[5], // row 2 col 3
  projects[6], // row 3 col 1
  projects[7], // row 3 col 2
  projects[8], // row 3 col 3
];

export function ZoomToGrid() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const headline2Ref = useRef<HTMLSpanElement>(null);
  const gridCardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const cursor = useCursor();
  const { t } = useLanguage();

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Preload images into browser cache (fire-and-forget, does NOT gate animation)
  useEffect(() => {
    const urls = [zoomToGridData.heroImage, ...zoomToGridData.gridImages];
    urls.forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  }, []);

  // GSAP animation — creates pin synchronously so pin-spacer is in flow immediately
  useEffect(() => {
    if (reduced) return;

    const wrap = wrapRef.current;
    const hero = heroRef.current;
    const headline = headlineRef.current;
    const headline2 = headline2Ref.current;
    if (!wrap || !hero || !headline || !headline2) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrap,
          start: "top top",
          end: () => `+=${window.innerHeight * 3}`,
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          refreshPriority: -1,
        },
      });

      // Hero zoom out — smooth power2.inOut over first 55% of timeline
      tl.fromTo(
        hero,
        { scale: 1.6 },
        { scale: 1, duration: 0.55, ease: "power2.inOut" },
        0,
      );

      // Headline eases up smoothly
      tl.to(
        headline,
        { y: "-40%", opacity: 0.3, duration: 0.5, ease: "power2.inOut" },
        0.2,
      );

      // Headline line 2 fades in smoothly
      tl.fromTo(
        headline2,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" },
        0.4,
      );

      // Grid cards stagger in with smooth easing
      gridCardsRef.current.forEach((card, i) => {
        if (!card) return;
        tl.fromTo(
          card,
          { scale: 0.8, opacity: 0, y: 30 },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 0.3,
            ease: "power2.out",
          },
          0.45 + i * 0.04,
        );
      });

      // Hold phase — grid stays fully visible while user continues scrolling
      tl.to({}, { duration: 0.3 });
    }, wrap);

    return () => {
      ctx.revert();
    };
  }, [reduced]);

  const gridImages = zoomToGridData.gridImages;

  /** Shared tile component */
  const Tile = useCallback(
    ({
      src,
      project,
      refCb,
      style,
      isHero,
    }: {
      src: string;
      project: (typeof projects)[0];
      refCb?: (el: HTMLDivElement | null) => void;
      style?: React.CSSProperties;
      isHero?: boolean;
    }) => (
      <TransitionLink
        to={`/work/${project.slug}`}
        className="block"
        onMouseEnter={() => cursor.set("view", "VIEW PROJECT")}
        onMouseLeave={() => cursor.reset()}
      >
        <div
          ref={refCb}
          className="relative overflow-hidden rounded-xl group"
          style={{
            transformOrigin: isHero ? "center center" : undefined,
            ...style,
          }}
        >
          <img
            src={src}
            alt={project.title}
            className="w-full h-full object-cover project-thumb group-hover:scale-105 transition-all duration-700"
            style={{
              aspectRatio: "4/3",
              filter: isHero
                ? "grayscale(.85) brightness(.55) contrast(1.1)"
                : "grayscale(.8) brightness(.55) contrast(1.05)",
            }}
            loading="lazy"
          />
          {/* Hover overlay with title */}
          <div
            className="absolute inset-0 flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,.7) 0%, transparent 60%)",
              zIndex: 5,
            }}
          >
            <span
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: ".65rem",
                fontWeight: 600,
                color: "rgba(255,255,255,.7)",
                letterSpacing: "-.01em",
              }}
            >
              {project.title}
            </span>
          </div>
          {/* corner frames */}
          <svg
            className="absolute top-2 left-2 w-4 h-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ zIndex: 6 }}
            viewBox="0 0 16 16"
          >
            <path
              d="M0 7 L0 0 L7 0"
              stroke="rgba(255,255,255,.25)"
              strokeWidth="1"
              fill="none"
            />
          </svg>
          <svg
            className="absolute bottom-2 right-2 w-4 h-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ zIndex: 6 }}
            viewBox="0 0 16 16"
          >
            <path
              d="M16 9 L16 16 L9 16"
              stroke="rgba(255,255,255,.25)"
              strokeWidth="1"
              fill="none"
            />
          </svg>
          {isHero && (
            <>
              {/* headline overlay */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center"
                style={{ zIndex: 4, pointerEvents: "none" }}
              >
                <h2
                  ref={headlineRef}
                  style={{
                    fontFamily: "'Inter',sans-serif",
                    fontSize: "clamp(1rem,2.5vw,1.6rem)",
                    fontWeight: 700,
                    letterSpacing: "-.03em",
                    color: "#fff",
                    lineHeight: 1.1,
                    textAlign: "center",
                    textShadow: "0 2px 20px rgba(0,0,0,.6)",
                  }}
                >
                  {t("zoom.start")}
                </h2>
                <span
                  ref={headline2Ref}
                  style={{
                    fontFamily: "'Instrument Serif',serif",
                    fontSize: "clamp(.8rem,1.5vw,1.1rem)",
                    fontStyle: "italic",
                    color: "rgba(255,255,255,.5)",
                    marginTop: 8,
                    opacity: 0,
                    textShadow: "0 2px 20px rgba(0,0,0,.6)",
                  }}
                >
                  {t("zoom.end")}
                </span>
              </div>
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(0,0,0,.4), rgba(0,0,0,.6))",
                  pointerEvents: "none",
                }}
              />
            </>
          )}
        </div>
      </TransitionLink>
    ),
    [cursor, t],
  );

  /* ─── REDUCED MOTION FALLBACK ─── */
  if (reduced) {
    return (
      <section
        className="relative py-20 px-6 md:px-12"
        style={{ background: "#000" }}
      >
        <div className="max-w-[900px] mx-auto mb-12">
          <TransitionLink
            to={`/work/${tileProjects[4].slug}`}
            className="block"
          >
            <div className="relative overflow-hidden rounded-xl">
              <img
                src={zoomToGridData.heroImage}
                alt={tileProjects[4].title}
                className="w-full h-auto object-cover"
                style={{
                  aspectRatio: "16/9",
                  filter: "grayscale(.85) brightness(.55) contrast(1.1)",
                }}
              />
            </div>
          </TransitionLink>
          <h2
            className="mt-8 text-center"
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: "clamp(1.6rem,4vw,2.8rem)",
              fontWeight: 700,
              letterSpacing: "-.04em",
              color: "#fff",
              lineHeight: 1.1,
            }}
          >
            {t("zoom.start")}{" "}
            <span style={{ color: "rgba(255,255,255,.4)" }}>
              {t("zoom.end")}
            </span>
          </h2>
        </div>
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-3 gap-3">
          {gridImages.map((src, i) => {
            /* gridImages has 8 entries; map each to the correct non-hero project */
            const proj = tileProjects[i < 4 ? i : i + 1]; // skip hero at index 4
            return (
              <TransitionLink
                key={i}
                to={`/work/${proj.slug}`}
                className="block"
                onMouseEnter={() => cursor.set("view", "VIEW PROJECT")}
                onMouseLeave={() => cursor.reset()}
              >
                <div className="overflow-hidden rounded-xl group">
                  <img
                    src={src}
                    alt={proj.title}
                    className="w-full h-auto object-cover project-thumb group-hover:scale-105 transition-all duration-700"
                    style={{
                      aspectRatio: "4/3",
                      filter: "grayscale(.8) brightness(.55) contrast(1.05)",
                    }}
                    loading="lazy"
                  />
                </div>
              </TransitionLink>
            );
          })}
        </div>
      </section>
    );
  }

  /* ─── FULL ANIMATED VERSION — 3×3 GRID ─── */
  return (
    <div
      ref={wrapRef}
      className="relative"
      style={{ background: "#000", height: "100vh", overflow: "hidden" }}
    >
      <div className="h-screen flex items-center justify-center overflow-hidden relative">
        <div
          className="absolute inset-0"
          style={{ background: "#000", zIndex: 0, pointerEvents: "none" }}
        />

        {/* Grid container — pointer-events auto on tiles */}
        <div
          className="relative w-full max-w-[1100px] mx-auto px-6"
          style={{ zIndex: 1 }}
        >
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {/* Row 1 */}
            <div
              ref={(el) => {
                gridCardsRef.current[0] = el;
              }}
              style={{ opacity: 0 }}
            >
              <Tile src={gridImages[0]} project={tileProjects[0]} />
            </div>
            <div
              ref={(el) => {
                gridCardsRef.current[1] = el;
              }}
              style={{ opacity: 0 }}
            >
              <Tile src={gridImages[1]} project={tileProjects[1]} />
            </div>
            <div
              ref={(el) => {
                gridCardsRef.current[2] = el;
              }}
              style={{ opacity: 0 }}
            >
              <Tile src={gridImages[2]} project={tileProjects[2]} />
            </div>

            {/* Row 2 */}
            <div
              ref={(el) => {
                gridCardsRef.current[3] = el;
              }}
              style={{ opacity: 0 }}
            >
              <Tile src={gridImages[3]} project={tileProjects[3]} />
            </div>

            {/* Hero tile (center) */}
            <Tile
              src={zoomToGridData.heroImage}
              project={tileProjects[4]}
              refCb={(el) => {
                heroRef.current = el;
              }}
              isHero
            />

            <div
              ref={(el) => {
                gridCardsRef.current[4] = el;
              }}
              style={{ opacity: 0 }}
            >
              <Tile src={gridImages[4]} project={tileProjects[5]} />
            </div>

            {/* Row 3 */}
            <div
              ref={(el) => {
                gridCardsRef.current[5] = el;
              }}
              style={{ opacity: 0 }}
            >
              <Tile src={gridImages[5]} project={tileProjects[6]} />
            </div>
            <div
              ref={(el) => {
                gridCardsRef.current[6] = el;
              }}
              style={{ opacity: 0 }}
            >
              <Tile src={gridImages[6]} project={tileProjects[7]} />
            </div>
            <div
              ref={(el) => {
                gridCardsRef.current[7] = el;
              }}
              style={{ opacity: 0 }}
            >
              <Tile src={gridImages[7]} project={tileProjects[8]} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}