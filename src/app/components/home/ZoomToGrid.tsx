import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { zoomToGridData } from "../../data/projects";
import type { Project } from "../../data/projects";
import { useCursor } from "../../hooks/useCursor";
import { ProjectZoomLink } from "../ProjectZoomLink";
import { TransitionLink } from "../TransitionLink";
import { LazyVideo } from "../LazyVideo";
import { useLanguage } from "../../hooks/useLanguage";
import { useTranslatedProjects } from "../../hooks/useTranslatedProjects";
import { tileSubtitle } from "../../data/workBlurbs";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * ZoomToGrid — Selected projects as a static 3×3 grid (no pinned zoom any more)
 *
 * All 9 tiles (8 surrounding + 1 center) are clickable and route to
 * case detail pages.
 *
 * Explicit slug list (not the raw array order) so this grid can be
 * curated independently of projects.ts's own order. STELZ stays the
 * hero/center tile. A `null` slot holds a "view all work" link tile,
 * and the last corner is always a contact link tile (see LinkTile).
 */
const ZOOM_GRID_SLUGS: (string | null)[] = [
  "stelz-app",
  "a-cafe-app-design",
  "merely-made-webshop",
  "studio75-branding",
  "stelz-web-design", // hero / center tile
  "biyu",
  "powermobile",
  "sfumato-agency",
];
const HERO_INDEX = 4;

export function ZoomToGrid() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const gridCardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const cursor = useCursor();
  const { t, lang } = useLanguage();
  const translatedProjects = useTranslatedProjects();

  /* Stable ref for t() so the Tile callback identity never changes
     on language switch — prevents DOM remount which would break GSAP refs */
  const tRef = useRef(t);
  tRef.current = t;
  const langRef = useRef(lang);
  langRef.current = lang;

  /* Map each grid position (row-major, including hero center) to a translated project,
     by explicit slug rather than raw array order. Positions stay fixed:
     a `null` slot (or a missing slug) stays `undefined` so the cells
     after it don't shift. */
  const tileProjects = useMemo(
    () => ZOOM_GRID_SLUGS.map((slug) => (slug ? translatedProjects.find((p) => p.slug === slug) : undefined)),
    [translatedProjects],
  );

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const isMobile =
    typeof window !== "undefined" &&
    !window.matchMedia("(min-width: 768px)").matches;

  // Preload images into browser cache (fire-and-forget, does NOT gate animation)
  useEffect(() => {
    const urls = [zoomToGridData.heroImage, ...tileProjects.flatMap((p) => (p ? [p.thumbnail] : []))];
    urls.forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  }, [tileProjects]);

  /* Phone: two columns, the right one set lower like a contact sheet; both drift while you scroll */
  useEffect(() => {
    if (reduced || !wrapRef.current || window.innerWidth >= 768) return;
    const ctx = gsap.context(() => {
      const kids = Array.from(wrapRef.current!.querySelectorAll<HTMLElement>(".zg-grid > *")).slice(0, 8);
      const left = kids.filter((_, i) => i % 2 === 0);
      const right = kids.filter((_, i) => i % 2 === 1);
      // they start level and then run at two different speeds: the left column barely drifts,
      // the right one climbs a lot faster
      const st = { trigger: wrapRef.current, start: "top 85%", end: "bottom bottom", scrub: 0.7, invalidateOnRefresh: true };
      gsap.fromTo(left, { y: 0 }, { y: () => -window.innerWidth * 0.04, ease: "none", scrollTrigger: st });
      gsap.fromTo(right, { y: 0 }, { y: () => -window.innerWidth * 0.34, ease: "none", scrollTrigger: st });
    }, wrapRef);
    return () => ctx.revert();
  }, [reduced]);

  /* The middle column starts set lower and slides up into line while you scroll through the grid */
  useEffect(() => {
    if (reduced || !wrapRef.current || window.innerWidth < 768) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".zg-mid",
        { y: () => window.innerWidth * 0.1 },
        {
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: wrapRef.current,
            start: "top 85%",
            end: "center 40%",
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        },
      );
    }, wrapRef);
    return () => ctx.revert();
  }, [reduced]);

  /* The outer columns drift along with the scroll too, each at its own pace, so the grid moves as one */
  useEffect(() => {
    if (reduced || !wrapRef.current || window.innerWidth < 768) return;
    const ctx = gsap.context(() => {
      const st = { trigger: wrapRef.current, start: "top bottom", end: "bottom top", scrub: 0.8, invalidateOnRefresh: true };
      gsap.fromTo(".zg-left", { y: () => window.innerWidth * 0.05 }, { y: () => -window.innerWidth * 0.05, ease: "none", scrollTrigger: st });
      gsap.fromTo(".zg-right", { y: () => window.innerWidth * 0.08 }, { y: () => -window.innerWidth * 0.08, ease: "none", scrollTrigger: st });
    }, wrapRef);
    return () => ctx.revert();
  }, [reduced]);

  /* (Old note: the section used to be pinned and zoom out from the centre tile.) The section is the finished 3×3 grid straight away (it used to be pinned
     and zoom out from the centre tile into the grid while scrolling). The project tiles, links and
     cursor labels are unchanged. */

  /** Text tile for a grid cell without a project, same shape as Tile. */
  const LinkTile = useCallback(
    ({ to, label }: { to: string; label: string }) => (
    <TransitionLink
      to={to}
      className="block"
      onMouseEnter={() => cursor.set("link")}
      onMouseLeave={() => cursor.reset()}
    >
      <div
        className="aspect-[5/2] md:aspect-[3/4] flex items-center justify-center p-3 text-center"
        style={{
          border: "1px solid rgba(var(--page-fg-rgb), .14)",
          fontFamily: "var(--font-brand)",
          fontSize: "clamp(.75rem,1.6vw,1.1rem)",
          fontWeight: 600,
          letterSpacing: "-.02em",
          color: "var(--page-fg)",
        }}
      >
        {label}
      </div>
    </TransitionLink>
    ),
    [cursor],
  );

  /** Shared tile component — uses tRef so identity is stable across lang switches.
   * Always shows the linked project's own thumbnail (or the dedicated hero
   * image for the center tile) — never a separately curated, possibly
   * mismatched image. */
  const Tile = useCallback(
    ({
      project,
      refCb,
      style,
      isHero,
    }: {
      project: Project;
      refCb?: (el: HTMLDivElement | null) => void;
      style?: React.CSSProperties;
      isHero?: boolean;
    }) => (
      <ProjectZoomLink
        to={`/work/${project.slug}`}
        projectSlug={project.slug}
        imageSrc={
          !isHero && !project.coverVideo && project.coverVideoPosterMobile &&
          typeof window !== "undefined" && window.innerWidth < 640
            ? project.coverVideoPosterMobile
            : !isHero && project.coverVideoPoster
            ? project.coverVideoPosterMobile && typeof window !== "undefined" && window.innerWidth < 768
              ? project.coverVideoPosterMobile
              : project.coverVideoPoster
            : project.thumbnailMobile && typeof window !== "undefined" && window.innerWidth < 768
              ? project.thumbnailMobile
              : project.thumbnail
        }
        transitionId={`${isHero ? "zoom-hero" : "zoom-grid"}-${project.slug}`}
        className="block"
        onMouseEnter={() => cursor.set("view", `${tRef.current("cursor.view")} ${project.title}`)}
        onMouseLeave={() => cursor.reset()}
      >
        <div
          ref={refCb}
          className="relative overflow-hidden group"
          style={{
            transformOrigin: isHero ? "center center" : undefined,
            ...style,
          }}
        >
          {/* Responsive aspect container.
              Filter sits on the wrapper div, NOT on the img — this prevents
              Safari from rasterising a filtered texture on every hover-scale
              frame (filter + transform on the same element = software path). */}
          <div
            className="aspect-[3/4] overflow-hidden"
            style={{
              filter: "grayscale(.8) brightness(.55) contrast(1.05)",
            }}
          >
            {!isHero && project.coverVideo ? (
              // Portrait cut below sm, matching the aspect-[3/4] tile
              <LazyVideo
                resumeOnGesture
                src={project.coverVideo}
                mobileSrc={project.coverVideoMobile}
                poster={project.coverVideoPoster ?? project.thumbnail}
                mobilePoster={project.coverVideoPosterMobile}
                className="w-full h-full object-cover project-thumb md:group-hover:scale-105 transition-transform duration-700"
                style={{ willChange: "transform" }}
              />
            ) : !isHero && project.video ? (
              <LazyVideo
                resumeOnGesture
                src={project.video}
                poster={project.thumbnail}
                className="w-full h-full object-cover project-thumb md:group-hover:scale-105 transition-transform duration-700"
                style={{ willChange: "transform" }}
              />
            ) : (
              <picture>
                {!isHero && project.thumbnailMobile && (
                  // Portrait tile (aspect-[3/4]) below the sm breakpoint
                  <source media="(max-width: 639px)" srcSet={project.thumbnailMobile} />
                )}
                <img
                  src={isHero ? zoomToGridData.heroImage : project.thumbnail}
                  alt={`${project.title}, ${project.category} by DYSIGNS`}
                  className="w-full h-full object-cover project-thumb md:group-hover:scale-105 transition-transform duration-700"
                  style={{ willChange: "transform" }}
                  loading={isHero ? "eager" : "lazy"}
                  // eslint-disable-next-line react/no-unknown-property -- React 18 doesn't recognize fetchPriority; lowercase passes through as a plain attribute
                  fetchpriority={isHero ? "high" : undefined}
                />
              </picture>
            )}
            {!isHero && !project.coverVideo && project.coverVideoMobile && (
              // Mobile-only cover video over the still, on the portrait
              // tile below sm; display:none above keeps it from loading.
              <LazyVideo
                resumeOnGesture
                src={project.coverVideoMobile}
                poster={project.coverVideoPosterMobile ?? project.thumbnail}
                className="absolute inset-0 w-full h-full object-cover project-thumb sm:hidden"
              />
            )}
          </div>
          {/* Caption: name and discipline bottom left, the arrow bottom right, always there */}
          <div
            className="absolute inset-0 flex items-end justify-between gap-3 p-3 md:p-6"
            style={{
              background:
                "linear-gradient(to top, rgba(var(--page-bg-rgb), .78) 0%, transparent 55%)",
              zIndex: 5,
            }}
          >
            <span className="min-w-0">
              <span
                className="block truncate"
                style={{
                  fontFamily: "var(--font-brand)",
                  fontSize: "clamp(.7rem,1vw,.9rem)",
                  fontWeight: 600,
                  letterSpacing: "0",
                  textTransform: "uppercase",
                  color: "var(--page-fg)",
                }}
              >
                {project.title}
              </span>
              <span
                className="block mt-0.5 md:mt-1 line-clamp-3"
                style={{
                  fontFamily: "var(--font-brand)",
                  fontSize: "clamp(.66rem,2.6vw,.85rem)",
                  color: "rgba(var(--page-fg-rgb), .7)",
                }}
              >
                {tileSubtitle(project.slug, project.category, langRef.current)}
              </span>
            </span>
          </div>
          {/* corner frames — desktop hover only */}
          <svg
            className="absolute top-2 left-2 w-4 h-4 pointer-events-none opacity-0 md:group-hover:opacity-100 transition-opacity duration-500"
            style={{ zIndex: 6 }}
            viewBox="0 0 16 16"
          >
            <path
              d="M0 7 L0 0 L7 0"
              stroke="rgba(var(--page-fg-rgb), .25)"
              strokeWidth="1"
              fill="none"
            />
          </svg>
          <svg
            className="absolute bottom-2 right-2 w-4 h-4 pointer-events-none opacity-0 md:group-hover:opacity-100 transition-opacity duration-500"
            style={{ zIndex: 6 }}
            viewBox="0 0 16 16"
          >
            <path
              d="M16 9 L16 16 L9 16"
              stroke="rgba(var(--page-fg-rgb), .25)"
              strokeWidth="1"
              fill="none"
            />
          </svg>
        </div>
      </ProjectZoomLink>
    ),
    [cursor],
  );

  /* ─── REDUCED MOTION FALLBACK ─── */
  if (reduced) {
    return (
      <section
        className="relative py-20 px-6 md:px-12"
        style={{ background: "var(--page-bg)" }}
      >
        <div className="max-w-[900px] mx-auto mb-12">
          <ProjectZoomLink
            to={`/work/${tileProjects[HERO_INDEX]?.slug}`}
            projectSlug={tileProjects[HERO_INDEX]?.slug ?? ""}
            imageSrc={tileProjects[HERO_INDEX]?.thumbnail ?? zoomToGridData.heroImage}
            transitionId={`zoom-hero-${tileProjects[HERO_INDEX]?.slug ?? "hero"}`}
            className="block"
          >
            <div className="relative overflow-hidden rounded-xl">
              <img
                src={zoomToGridData.heroImage}
                alt={`${tileProjects[HERO_INDEX]?.title ?? ""}, ${tileProjects[HERO_INDEX]?.category ?? ""} by DYSIGNS`}
                className="w-full h-auto object-cover"
                style={{
                  aspectRatio: "16/9",
                  filter: "grayscale(.85) brightness(.55) contrast(1.1)",
                }}
                loading="eager"
              />
            </div>
          </ProjectZoomLink>
          <h2
            className="mt-8 text-center"
            style={{
              fontFamily: "var(--font-brand)",
              fontSize: "clamp(1.6rem,4vw,2.8rem)",
              fontWeight: 700,
              letterSpacing: "-.04em",
              color: "var(--page-fg)",
              lineHeight: 1.1,
            }}
          >
            {t("zoom.start")}{" "}
            <span style={{ color: "rgba(var(--page-fg-rgb), .4)" }}>
              {t("zoom.end")}
            </span>
          </h2>
        </div>
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-3 gap-3">
          {tileProjects
            .filter((p, i): p is NonNullable<typeof p> => Boolean(p) && i !== HERO_INDEX) // hero tile shown separately above
            .map((proj) => (
              <ProjectZoomLink
                key={proj.slug}
                to={`/work/${proj.slug}`}
                projectSlug={proj.slug}
                imageSrc={
                  proj.thumbnailMobile && typeof window !== "undefined" && window.innerWidth < 768
                    ? proj.thumbnailMobile
                    : proj.thumbnail
                }
                transitionId={`zoom-grid-${proj.slug}`}
                className="block"
                onMouseEnter={() => cursor.set("view", `${t("cursor.view")} ${proj.title}`)}
                onMouseLeave={() => cursor.reset()}
              >
                <div className="overflow-hidden rounded-xl group">
                  <picture>
                    {proj.thumbnailMobile && (
                      <source media="(max-width: 767px)" srcSet={proj.thumbnailMobile} />
                    )}
                    <img
                      src={proj.thumbnail}
                      alt={`${proj.title}, ${proj.category} by DYSIGNS`}
                      className="w-full h-auto object-cover project-thumb group-hover:scale-105 transition-all duration-700"
                      style={{
                        aspectRatio: "4/3",
                        filter: "grayscale(.8) brightness(.55) contrast(1.05)",
                      }}
                      loading="lazy"
                    />
                  </picture>
                </div>
              </ProjectZoomLink>
            ))}
        </div>
        <div className="mt-10 text-center">
          <TransitionLink
            to="/work"
            className="inline-flex items-center gap-2"
            style={{
              fontSize: ".75rem",
              fontWeight: 500,
              letterSpacing: "0",
              textTransform: "uppercase",
              color: "rgba(var(--page-fg-rgb), .55)",
            }}
            onMouseEnter={() => cursor.set("link")}
            onMouseLeave={() => cursor.reset()}
          >
            {t("work.viewAll")}
          </TransitionLink>
        </div>
      </section>
    );
  }

  /* ─── FULL ANIMATED VERSION — 3×3 GRID ─── */
  return (
    <div
      ref={wrapRef}
      className="relative"
      style={{ background: "var(--page-bg)" }}
    >
      {/* Edge to edge, three tall columns with the middle one set lower, like a contact sheet */}
      <div className="relative pt-20 md:pt-28 pb-24 md:pb-[14vw]">
        <div
          className="absolute inset-0"
          style={{ background: "var(--page-bg)", zIndex: 0, pointerEvents: "none" }}
        />

        <div
          className="relative flex items-baseline justify-between gap-4 px-3 md:px-6 mb-5 md:mb-8"
          style={{ zIndex: 3 }}
        >
          <h2
            ref={headlineRef}
            style={{
              fontFamily: "var(--font-brand)",
              fontSize: "clamp(1.4rem,3vw,2.4rem)",
              fontWeight: 700,
              letterSpacing: "-.03em",
              color: "var(--page-fg)",
              lineHeight: 1.1,
            }}
          >
            {t("zoom.start")}
          </h2>
          <TransitionLink
            to="/work"
            className="inline-flex items-center gap-2"
            style={{
              fontSize: ".72rem",
              fontWeight: 500,
              letterSpacing: "0",
              textTransform: "uppercase",
              color: "rgba(var(--page-fg-rgb), .55)",
            }}
            onMouseEnter={() => cursor.set("link")}
            onMouseLeave={() => cursor.reset()}
          >
            {t("work.viewAll")}
          </TransitionLink>
        </div>

        {/* Grid container — pointer-events auto on tiles */}
        {/* the tiles slide up under the heading row, never over it: cut off at the top edge of the grid */}
        <div className="relative w-full" style={{ zIndex: 1, clipPath: "inset(0 -10vw -30vw -10vw)" }}>
          <div className="zg-grid grid grid-cols-2 md:grid-cols-3 gap-1 sm:gap-2 md:gap-[1.3vw]">
            {/* Row 1 */}
            <div
              className="zg-side zg-left"
              ref={(el) => {
                gridCardsRef.current[0] = el;
              }}
            >
              <Tile project={tileProjects[0]} />
            </div>
            <div
              className="zg-mid"
              ref={(el) => {
                gridCardsRef.current[1] = el;
              }}
            >
              <Tile project={tileProjects[1]} />
            </div>
            <div
              className="zg-side zg-right"
              ref={(el) => {
                gridCardsRef.current[2] = el;
              }}
            >
              <Tile project={tileProjects[2]} />
            </div>

            {/* Row 2 */}
            <div
              className="zg-side zg-left"
              ref={(el) => {
                gridCardsRef.current[3] = el;
              }}
            >
              {tileProjects[3] ? (
                <Tile project={tileProjects[3]} />
              ) : (
                <LinkTile to="/work" label={t("work.viewAll")} />
              )}
            </div>

            {/* Centre tile */}
            <div className="zg-mid">
            <Tile
              project={tileProjects[HERO_INDEX]}
              refCb={(el) => {
                heroRef.current = el;
              }}
              isHero
            />
            </div>

            <div
              className="zg-side zg-right"
              ref={(el) => {
                gridCardsRef.current[4] = el;
              }}
            >
              <Tile project={tileProjects[5]} />
            </div>

            {/* Row 3 */}
            <div
              className="zg-side zg-left"
              ref={(el) => {
                gridCardsRef.current[5] = el;
              }}
            >
              <Tile project={tileProjects[6]} />
            </div>
            <div
              className="zg-mid"
              ref={(el) => {
                gridCardsRef.current[6] = el;
              }}
            >
              <Tile project={tileProjects[7]} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
