import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ProjectZoomLink } from "../components/ProjectZoomLink";
import { projects as rawProjects, type Project } from "../data/projects";
import { useCursor } from "../hooks/useCursor";
import { useLanguage } from "../hooks/useLanguage";
import { useTranslatedProjects } from "../hooks/useTranslatedProjects";
import { Seo } from "../components/Seo";
import { LazyVideo } from "../components/LazyVideo";
import { getLocalizedContent } from "../content/loadContent";
import { tileSubtitle } from "../data/workBlurbs";

gsap.registerPlugin(ScrollTrigger);

function getProjectYear(value: string): number {
  const match = value.match(/\b(20\d{2}|19\d{2})\b/);
  return match ? Number(match[1]) : 0;
}

// Fixed lead order, the same reading order as the "Selected work" grid on the
// home page (ZoomToGrid), so both show the cases in the same sequence. Everything
// else follows, most recent year first. Projects marked `hidden` in projects.ts
// are left off entirely.
const FEATURED_ORDER = [
  "stelz-app",
  "a-cafe-app-design",
  "merely-made-webshop",
  "studio75-branding",
  "stelz-web-design",
  "biyu",
  "powermobile",
  "sfumato-agency",
];

const BELOW_SM = "(max-width: 639px)";

/** The cover a card shows: the portrait or landscape cut of the cover video
 * (the same cover the home grid and case hero use), else the matching still.
 * `workCoverStill` projects always keep their `thumbnail`. */
function coverShot(project: Project, portrait: boolean): { video?: string; poster: string } {
  if (project.workCoverStill) return { video: project.video, poster: project.thumbnail };
  if (portrait) {
    return project.coverVideoMobile
      ? {
          video: project.coverVideoMobile,
          poster: project.coverVideoPosterMobile ?? project.thumbnailMobile ?? project.thumbnail,
        }
      : { video: project.video, poster: project.thumbnailMobile ?? project.thumbnail };
  }
  return project.coverVideo
    ? { video: project.coverVideo, poster: project.coverVideoPoster ?? project.thumbnail }
    : { video: project.video, poster: project.thumbnail };
}

export default function WorkPage() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const cursor = useCursor();
  const { t, lang } = useLanguage();
  const translatedProjects = useTranslatedProjects();
  const entry = getLocalizedContent("work-overview.md", lang);
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const projectEntries = useMemo(
    () =>
      translatedProjects
        .map((project, index) => ({
          project,
          year: getProjectYear(rawProjects[index].year),
        }))
        .filter(({ project }) => !project.hidden)
        .sort((a, b) => {
          const aFeatured = FEATURED_ORDER.indexOf(a.project.slug);
          const bFeatured = FEATURED_ORDER.indexOf(b.project.slug);
          if (aFeatured !== -1 || bFeatured !== -1) {
            if (aFeatured === -1) return 1;
            if (bFeatured === -1) return -1;
            return aFeatured - bFeatured;
          }
          return b.year - a.year;
        }),
    [translatedProjects],
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
  }, [projectEntries.length]);

  /* The same scroll motion as "Selected work" on the home page (ZoomToGrid): on a phone the two columns
     drift at different speeds, from tablet up the middle column slides up into line and the outer
     columns drift along, each at its own pace. */
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      if (window.innerWidth < 768) {
        const kids = Array.from(grid.children) as HTMLElement[];
        const st = { trigger: grid, start: "top 85%", end: "bottom bottom", scrub: 0.7, invalidateOnRefresh: true };
        gsap.fromTo(kids.filter((_, i) => i % 2 === 0), { y: 0 }, { y: () => -window.innerWidth * 0.04, ease: "none", scrollTrigger: st });
        gsap.fromTo(kids.filter((_, i) => i % 2 === 1), { y: 0 }, { y: () => -window.innerWidth * 0.34, ease: "none", scrollTrigger: st });
        return;
      }
      gsap.fromTo(
        ".zg-mid",
        { y: () => window.innerWidth * 0.1 },
        {
          y: 0,
          ease: "none",
          // the grid is already in view when the page opens, so the slide runs from the top of the page
          scrollTrigger: { trigger: grid, start: "top 30%", end: "top -35%", scrub: 0.6, invalidateOnRefresh: true },
        },
      );
      const st = { trigger: grid, start: "top bottom", end: "bottom top", scrub: 0.8, invalidateOnRefresh: true };
      gsap.fromTo(".zg-left", { y: () => window.innerWidth * 0.05 }, { y: () => -window.innerWidth * 0.05, ease: "none", scrollTrigger: st });
      gsap.fromTo(".zg-right", { y: () => window.innerWidth * 0.08 }, { y: () => -window.innerWidth * 0.08, ease: "none", scrollTrigger: st });
    }, grid);
    return () => ctx.revert();
  }, [projectEntries.length]);

  return (
    <section
      ref={sectionRef}
      className="relative pt-32 pb-24 md:pb-[14vw] px-3 md:px-6"
      style={{ background: "var(--page-bg)", minHeight: "100vh" }}
    >
      <Seo
        title={entry.frontmatter.title}
        description={entry.frontmatter.description}
        path="/work"
        lastmod={entry.frontmatter.lastUpdated}
      />
      <div className="w-full">
        <div className="mb-8 md:mb-12">
          <span className="sr-only">{t("work.label")}</span>
          <h1
            ref={headRef}
            className="mt-3"
            style={{
              fontFamily: "var(--font-brand)",
              fontSize: "clamp(2rem,5vw,3.5rem)",
              fontWeight: 700,
              letterSpacing: "-.03em",
              color: "var(--page-fg)",
              lineHeight: 1.1,
            }}
          >
            {t("work.title")}
          </h1>
        </div>

        {/* All cases on one page, laid out like "Selected work" on the home page (ZoomToGrid):
            two columns on a phone, three from tablet up, 3:4 tiles, edge to edge, the middle
            column set lower (.zg-grid in theme.css). */}
        <div ref={gridRef} className="zg-grid grid grid-cols-2 md:grid-cols-3 gap-1 sm:gap-2 md:gap-[1.3vw]">
          {projectEntries.map(({ project }, flatIndex) => {
            // portrait cut below sm, the wide cover above, both cropped to the 3:4 tile
            const small = coverShot(project, true);
            const large = coverShot(project, false);
            const playVideo = !prefersReducedMotion && small.video && large.video;
            // The zoom transition grows into the case hero, so it starts from
            // the still that hero opens on at this screen size.
            const narrow = typeof window !== "undefined" && window.innerWidth < 768;
            const zoomImage = project.workCoverStill
              ? project.thumbnail
              : narrow && project.coverVideoPosterMobile
                ? project.coverVideoPosterMobile
                : project.coverVideo
                  ? (project.coverVideoPoster ?? project.thumbnail)
                  : narrow && project.thumbnailMobile
                    ? project.thumbnailMobile
                    : project.thumbnail;
            const mediaClass =
              "w-full h-full object-cover project-thumb md:group-hover:scale-105 transition-transform duration-700";

            return (
              <div key={project.slug} className={["zg-side zg-left", "zg-mid", "zg-side zg-right"][flatIndex % 3]}>
                <ProjectZoomLink
                  to={`/work/${project.slug}`}
                  projectSlug={project.slug}
                  imageSrc={zoomImage}
                  transitionId={`work-grid-${project.slug}`}
                  aria-label={`${t("cursor.viewProject")} ${project.title}`}
                  className="block"
                  onMouseEnter={() => cursor.set("view", `${t("cursor.view")} ${project.title}`)}
                  onMouseLeave={() => cursor.reset()}
                >
                  <div
                    ref={(el) => {
                      cardsRef.current[flatIndex] = el;
                    }}
                    className="relative overflow-hidden group"
                    style={prefersReducedMotion ? undefined : { opacity: 0 }}
                  >
                    {/* the filter sits on the wrapper, not on the media, like the home tiles */}
                    <div
                      className="aspect-[3/4] overflow-hidden"
                      style={{ filter: "grayscale(.8) brightness(.55) contrast(1.05)" }}
                    >
                      {playVideo ? (
                        <LazyVideo
                          resumeOnGesture
                          src={large.video!}
                          poster={large.poster}
                          mobileSrc={small.video}
                          mobilePoster={small.poster}
                          mobileQuery={BELOW_SM}
                          className={mediaClass}
                          style={{ willChange: "transform" }}
                        />
                      ) : (
                        <picture>
                          {small.poster !== large.poster && <source media={BELOW_SM} srcSet={small.poster} />}
                          <img
                            src={large.poster}
                            alt={`${project.title}, ${project.category} by DYSIGNS`}
                            loading={flatIndex < 4 ? "eager" : "lazy"}
                            className={mediaClass}
                            style={{ willChange: "transform" }}
                          />
                        </picture>
                      )}
                    </div>
                    {/* Caption: name and discipline bottom left, same as the home tiles */}
                    <div
                      className="absolute inset-0 flex items-end justify-between gap-3 p-3 md:p-6"
                      style={{
                        background: "linear-gradient(to top, rgba(var(--page-bg-rgb), .78) 0%, transparent 55%)",
                        zIndex: 5,
                      }}
                    >
                      <span className="min-w-0">
                        <h2
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
                        </h2>
                        <span
                          className="block mt-0.5 md:mt-1 line-clamp-3"
                          style={{
                            fontFamily: "var(--font-brand)",
                            fontSize: "clamp(.66rem,2.6vw,.85rem)",
                            color: "rgba(var(--page-fg-rgb), .7)",
                          }}
                        >
                          {tileSubtitle(project.slug, project.category, lang)}
                        </span>
                      </span>
                    </div>
                  </div>
                </ProjectZoomLink>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
