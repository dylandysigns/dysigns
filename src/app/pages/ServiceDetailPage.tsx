import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { TransitionLink } from "../components/TransitionLink";
import type { Project } from "../data/projects";
import { getServiceDefinitionBySlug } from "../data/serviceTaxonomy";
import { useCursor } from "../hooks/useCursor";
import { useLanguage } from "../hooks/useLanguage";
import { useSiteContent } from "../hooks/useSiteContent";
import { useTranslatedProjects } from "../hooks/useTranslatedProjects";
import {
  openCaseWithZoom,
  prepareForCaseNavigation,
} from "../utils/caseZoomTransition";

const CAROUSEL_MOBILE_QUERY = "(max-width: 767px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const CAROUSEL_AUTOPLAY_DELAY = 4000;
const CAROUSEL_REDUCED_AUTOPLAY_DELAY = 6000;
const CAROUSEL_RESUME_DELAY = 2000;

type CoverFlowPosition = {
  translateX: string;
  translateZ: string;
  rotateY: string;
  scale: number;
  opacity: number;
  zIndex: number;
};

type ShowcaseSlide = {
  id: number;
  slug: string;
  name: string;
  bgColor: string;
  tags: [string, string];
  label: string;
  title: string;
  subtitle: string;
  description: string;
  imageSrc: string;
  link: string;
};

const SHOWCASE_PROJECT_SLUGS = [
  "echo-fashion",
  "stelz-web-design",
  "verkeersschool-beckers-branding",
  "nova-brand-platform",
  "flux-motion-identity",
] as const;

const SHOWCASE_PROJECT_META: Record<
  (typeof SHOWCASE_PROJECT_SLUGS)[number],
  { bgColor: string; labelKey: string; subtitleKey: string }
> = {
  "echo-fashion": {
    bgColor: "#b85c2a",
    labelKey: "serviceShowcase.echo-fashion.label",
    subtitleKey: "serviceShowcase.echo-fashion.subtitle",
  },
  "stelz-web-design": {
    bgColor: "#d4c9b0",
    labelKey: "serviceShowcase.stelz-web-design.label",
    subtitleKey: "serviceShowcase.stelz-web-design.subtitle",
  },
  "verkeersschool-beckers-branding": {
    bgColor: "#3f4a57",
    labelKey: "serviceShowcase.verkeersschool-beckers-branding.label",
    subtitleKey: "serviceShowcase.verkeersschool-beckers-branding.subtitle",
  },
  "nova-brand-platform": {
    bgColor: "#1a1a1a",
    labelKey: "serviceShowcase.nova-brand-platform.label",
    subtitleKey: "serviceShowcase.nova-brand-platform.subtitle",
  },
  "flux-motion-identity": {
    bgColor: "#c8c8c4",
    labelKey: "serviceShowcase.flux-motion-identity.label",
    subtitleKey: "serviceShowcase.flux-motion-identity.subtitle",
  },
};

function getShowcaseTags(tags: string[]): [string, string] {
  const formatted = tags
    .slice(0, 2)
    .map((tag) => tag.replace(/\s+/g, " "));

  if (formatted.length === 0) {
    return ["PORTFOLIO", "CASE STUDY"];
  }

  if (formatted.length === 1) {
    return [formatted[0], "CASE STUDY"];
  }

  return [formatted[0], formatted[1]];
}

function buildShowcaseSlides(
  projects: Project[],
  t: (key: string) => string,
): ShowcaseSlide[] {
  const projectsBySlug = new Map(projects.map((project) => [project.slug, project]));

  return SHOWCASE_PROJECT_SLUGS.map((slug, index) => {
    const project = projectsBySlug.get(slug);

    if (!project) {
      throw new Error(`Missing showcase project: ${slug}`);
    }

    const meta = SHOWCASE_PROJECT_META[slug];

    return {
      id: index,
      slug: project.slug,
      name: project.title,
      bgColor: meta.bgColor,
      tags: getShowcaseTags(project.tags),
      label: t(meta.labelKey),
      title: project.title,
      subtitle: t(meta.subtitleKey),
      description: project.overview.split("\n\n")[0] ?? project.overview,
      imageSrc: project.thumbnail,
      link: `/work/${project.slug}`,
    };
  });
}

const COVERFLOW_POSITIONS = {
  farLeft: {
    translateX: "-102%",
    translateZ: "-120px",
    rotateY: "-20deg",
    scale: 0.84,
    opacity: 0,
    zIndex: 0,
  },
  left: {
    translateX: "-52%",
    translateZ: "-120px",
    rotateY: "-18deg",
    scale: 0.88,
    opacity: 0.72,
    zIndex: 1,
  },
  center: {
    translateX: "0%",
    translateZ: "0px",
    rotateY: "0deg",
    scale: 1,
    opacity: 1,
    zIndex: 3,
  },
  right: {
    translateX: "52%",
    translateZ: "-120px",
    rotateY: "18deg",
    scale: 0.88,
    opacity: 0.72,
    zIndex: 1,
  },
  farRight: {
    translateX: "102%",
    translateZ: "-120px",
    rotateY: "20deg",
    scale: 0.84,
    opacity: 0,
    zIndex: 0,
  },
} satisfies Record<string, CoverFlowPosition>;

const MOBILE_COVERFLOW_POSITIONS = {
  farLeft: {
    translateX: "-118%",
    translateZ: "-90px",
    rotateY: "-16deg",
    scale: 0.76,
    opacity: 0,
    zIndex: 0,
  },
  left: {
    translateX: "-94%",
    translateZ: "-40px",
    rotateY: "-5deg",
    scale: 0.92,
    opacity: 0.72,
    zIndex: 1,
  },
  center: {
    translateX: "0%",
    translateZ: "0px",
    rotateY: "0deg",
    scale: 1,
    opacity: 1,
    zIndex: 3,
  },
  right: {
    translateX: "94%",
    translateZ: "-40px",
    rotateY: "5deg",
    scale: 0.92,
    opacity: 0.72,
    zIndex: 1,
  },
  farRight: {
    translateX: "118%",
    translateZ: "-90px",
    rotateY: "16deg",
    scale: 0.76,
    opacity: 0,
    zIndex: 0,
  },
} satisfies Record<string, CoverFlowPosition>;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function wrapIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return (index + length) % length;
}

function getRelativeOffset(index: number, activeIndex: number, length: number) {
  if (length <= 1) return 0;
  if (length === 2) return index === activeIndex ? 0 : 1;

  let delta = index - activeIndex;
  const half = Math.floor(length / 2);

  if (delta > half) delta -= length;
  if (delta < -half) delta += length;

  return delta;
}

function getCardPosition(
  relative: number,
  isCompact: boolean,
  reducedMotion: boolean,
): CoverFlowPosition {
  if (reducedMotion) {
    return relative === 0
      ? COVERFLOW_POSITIONS.center
      : {
          ...COVERFLOW_POSITIONS.center,
          opacity: 0,
          zIndex: 0,
        };
  }

  const positions = isCompact ? MOBILE_COVERFLOW_POSITIONS : COVERFLOW_POSITIONS;

  switch (relative) {
    case -2:
      return positions.farLeft;
    case -1:
      return positions.left;
    case 0:
      return positions.center;
    case 1:
      return positions.right;
    case 2:
      return positions.farRight;
    default:
      return relative < 0 ? positions.farLeft : positions.farRight;
  }
}

function getCardSurfaceStyle(position: CoverFlowPosition): CSSProperties {
  return {
    zIndex: position.zIndex,
    opacity: position.opacity,
    transform:
      `translateX(${position.translateX}) translateZ(${position.translateZ}) rotateY(${position.rotateY}) scale(${position.scale})`,
  } as CSSProperties;
}

function renderCardLayout(
  slide: ShowcaseSlide,
  isActive: boolean,
  viewProjectLabel: string,
  onOpenCase: () => void,
) {
  const browserBar = (
    <div
      className="absolute inset-x-0 top-0 z-20 flex h-[38px] items-center justify-between px-[14px]"
      style={{
        background: "rgba(20,20,20,.85)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <div className="flex items-center gap-1.5">
        {["#ff5f57", "#ffbd2e", "#28c840"].map((color) => (
          <span
            key={color}
            className="block h-2.5 w-2.5 rounded-full"
            style={{ background: color }}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        {slide.tags.map((tag) => (
          <span
            key={tag}
            style={{
              fontSize: "10px",
              letterSpacing: ".08em",
              color: "#aaa",
              fontWeight: 500,
              textTransform: "uppercase",
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div
      className="relative h-full overflow-hidden rounded-[inherit]"
      style={{ background: slide.bgColor }}
    >
      {browserBar}

      <div className="absolute inset-x-0 bottom-0 top-[38px] overflow-hidden">
        <img
          src={slide.imageSrc}
          alt={slide.name}
          className="h-full w-full object-cover"
          loading="eager"
        />
      </div>

      <div
        className="absolute inset-x-0 bottom-0 z-20 px-7 pb-6 pt-20 transition-opacity duration-300 ease-out"
        style={{
          opacity: isActive ? 1 : 0,
          background:
            "linear-gradient(to top, rgba(0,0,0,.75) 0%, rgba(0,0,0,.32) 45%, transparent 100%)",
          pointerEvents: isActive ? "auto" : "none",
        }}
      >
        <p
          style={{
            margin: "0 0 6px",
            fontSize: "10px",
            letterSpacing: ".12em",
            color: "#ccc",
            textTransform: "uppercase",
          }}
        >
          {slide.label}
        </p>
        <h2
          style={{
            margin: "0 0 6px",
            fontSize: "26px",
            fontWeight: 700,
            lineHeight: 1.2,
            color: "#fff",
          }}
        >
          {slide.title}
        </h2>
        <p
          style={{
            margin: "0 0 14px",
            fontSize: "13px",
            color: "rgba(255,255,255,.7)",
          }}
        >
          {slide.subtitle}
        </p>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full px-5 py-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/35"
          onClick={(event) => {
            event.stopPropagation();
            onOpenCase();
          }}
          style={{
            border: "1px solid rgba(255,255,255,.6)",
            color: "#fff",
            fontSize: "12px",
            letterSpacing: ".05em",
            transition: "background .2s, color .2s",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          {viewProjectLabel}
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}

function ServiceShowcaseCarousel() {
  const navigate = useNavigate();
  const cursor = useCursor();
  const { t } = useLanguage();
  const projects = useTranslatedProjects();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isCompact, setIsCompact] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [transitionsEnabled, setTransitionsEnabled] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const centerCardRef = useRef<HTMLDivElement | null>(null);
  const centerCardShellRef = useRef<HTMLDivElement | null>(null);
  const tiltFrameRef = useRef<number | null>(null);
  const tiltTargetRef = useRef({ x: 0, y: 0 });
  const tiltCurrentRef = useRef({ x: 0, y: 0 });
  const autoRotateTimerRef = useRef<number | null>(null);
  const resumeTimerRef = useRef<number | null>(null);
  const autoplayPausedRef = useRef(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchDeltaXRef = useRef(0);
  const showcaseSlides = useMemo(
    () => buildShowcaseSlides(projects, t),
    [projects, t],
  );
  const totalCards = showcaseSlides.length;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mobileQuery = window.matchMedia(CAROUSEL_MOBILE_QUERY);
    const motionQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    const updateViewportMode = () => {
      setIsCompact(mobileQuery.matches);
      setReducedMotion(motionQuery.matches);
    };

    updateViewportMode();
    const frame = requestAnimationFrame(() => setTransitionsEnabled(true));
    mobileQuery.addEventListener("change", updateViewportMode);
    motionQuery.addEventListener("change", updateViewportMode);

    return () => {
      cancelAnimationFrame(frame);
      mobileQuery.removeEventListener("change", updateViewportMode);
      motionQuery.removeEventListener("change", updateViewportMode);
    };
  }, []);

  const clearTimers = useCallback(() => {
    if (autoRotateTimerRef.current !== null) {
      window.clearTimeout(autoRotateTimerRef.current);
      autoRotateTimerRef.current = null;
    }

    if (resumeTimerRef.current !== null) {
      window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, []);

  const pauseAutoRotate = useCallback(() => {
    autoplayPausedRef.current = true;
    clearTimers();
  }, [clearTimers]);

  const rotateNext = useCallback(() => {
    if (totalCards <= 1) return;
    setActiveIndex((current) => wrapIndex(current + 1, totalCards));
  }, [totalCards]);

  const rotatePrev = useCallback(() => {
    if (totalCards <= 1) return;
    setActiveIndex((current) => wrapIndex(current - 1, totalCards));
  }, [totalCards]);

  const scheduleAutoplay = useCallback(
    (delay?: number) => {
      clearTimers();

      if (autoplayPausedRef.current || totalCards <= 1) return;

      autoRotateTimerRef.current = window.setTimeout(
        () => rotateNext(),
        delay ??
          (reducedMotion
            ? CAROUSEL_REDUCED_AUTOPLAY_DELAY
            : CAROUSEL_AUTOPLAY_DELAY),
      );
    },
    [clearTimers, reducedMotion, rotateNext, totalCards],
  );

  useEffect(() => {
    scheduleAutoplay();
    return clearTimers;
  }, [activeIndex, clearTimers, scheduleAutoplay]);

  useEffect(() => {
    cursor.reset();
    if (centerCardRef.current) {
      centerCardRef.current.style.setProperty("--inner-tilt-x", "0deg");
      centerCardRef.current.style.setProperty("--inner-tilt-y", "0deg");
    }
    tiltTargetRef.current = { x: 0, y: 0 };
    tiltCurrentRef.current = { x: 0, y: 0 };
  }, [activeIndex, cursor, reducedMotion]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (reducedMotion) {
      return;
    }

    const step = () => {
      const current = tiltCurrentRef.current;
      const target = tiltTargetRef.current;

      current.x += (target.x - current.x) * 0.08;
      current.y += (target.y - current.y) * 0.08;

      if (centerCardRef.current) {
        centerCardRef.current.style.setProperty(
          "--inner-tilt-x",
          `${current.x.toFixed(3)}deg`,
        );
        centerCardRef.current.style.setProperty(
          "--inner-tilt-y",
          `${current.y.toFixed(3)}deg`,
        );
      }

      tiltFrameRef.current = requestAnimationFrame(step);
    };

    tiltFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (tiltFrameRef.current !== null) {
        cancelAnimationFrame(tiltFrameRef.current);
        tiltFrameRef.current = null;
      }
    };
  }, [reducedMotion]);

  useEffect(() => {
    return () => {
      cursor.reset();
      clearTimers();
      if (tiltFrameRef.current !== null) {
        cancelAnimationFrame(tiltFrameRef.current);
        tiltFrameRef.current = null;
      }
    };
  }, [clearTimers, cursor]);

  const handleCenterMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (reducedMotion || !centerCardRef.current) return;

      const bounds = centerCardRef.current.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;

      tiltTargetRef.current = {
        x: clamp((y - 0.5) * -10, -10, 10),
        y: clamp((x - 0.5) * 12, -12, 12),
      };
    },
    [reducedMotion],
  );

  const handleViewportMouseEnter = useCallback(() => {
    autoplayPausedRef.current = true;
    clearTimers();
  }, [clearTimers]);

  const resumeAutoplay = useCallback(() => {
    autoplayPausedRef.current = false;
    clearTimers();

    if (totalCards > 1) {
      resumeTimerRef.current = window.setTimeout(() => {
        scheduleAutoplay();
      }, CAROUSEL_RESUME_DELAY);
    }
  }, [clearTimers, scheduleAutoplay, totalCards]);

  const handleViewportMouseLeave = useCallback(() => {
    tiltTargetRef.current = { x: 0, y: 0 };
    resumeAutoplay();
  }, [resumeAutoplay]);

  const openCase = useCallback(
    (slide: ShowcaseSlide) => {
      const cardEl = centerCardShellRef.current;
      if (!cardEl) return;

      openCaseWithZoom({
        cardEl,
        imageSrc: slide.imageSrc,
        caseId: slide.id,
        onComplete: () => {
          cursor.reset();
          pauseAutoRotate();
          prepareForCaseNavigation();
          navigate(slide.link, {
            state: {
              fromPath: window.location.pathname,
            },
          });
        },
      });
    },
    [cursor, navigate, pauseAutoRotate],
  );

  const finishTouchGesture = useCallback(() => {
    const delta = touchDeltaXRef.current;

    touchStartXRef.current = null;
    touchDeltaXRef.current = 0;

    if (Math.abs(delta) > 40) {
      if (delta < 0) {
        rotateNext();
      } else {
        rotatePrev();
      }
    }

    resumeAutoplay();
  }, [resumeAutoplay, rotateNext, rotatePrev]);

  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (totalCards <= 1) return;

      autoplayPausedRef.current = true;
      clearTimers();
      touchStartXRef.current = event.touches[0]?.clientX ?? null;
      touchDeltaXRef.current = 0;
    },
    [clearTimers, totalCards],
  );

  const handleTouchMove = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartXRef.current === null) return;
    touchDeltaXRef.current =
      (event.touches[0]?.clientX ?? touchStartXRef.current) - touchStartXRef.current;
  }, []);

  const handleTouchEnd = useCallback(() => {
    finishTouchGesture();
  }, [finishTouchGesture]);

  const handleTouchCancel = useCallback(() => {
    finishTouchGesture();
  }, [finishTouchGesture]);

  return (
    <div className="relative isolate w-full overflow-hidden bg-transparent px-0">
      <div
        ref={viewportRef}
        className="relative z-10 flex w-full items-center justify-center overflow-hidden px-0"
        aria-live="polite"
        tabIndex={0}
        onMouseEnter={handleViewportMouseEnter}
        onMouseLeave={handleViewportMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            rotateNext();
          }

          if (event.key === "ArrowLeft") {
            event.preventDefault();
            rotatePrev();
          }
        }}
        style={{
          touchAction: "pan-y",
          perspective: "900px",
          transformStyle: "preserve-3d",
          height: "65vh",
          minHeight: isCompact ? "360px" : "460px",
          maxHeight: "620px",
        }}
      >
        {showcaseSlides.map((slide, slideIndex) => {
          const relative = getRelativeOffset(
            slideIndex,
            activeIndex,
            totalCards,
          );
          const isActive = relative === 0;
          const isLeft = relative === -1;
          const isRight = relative === 1;
          const position = getCardPosition(relative, isCompact, reducedMotion);
          const pointerEvents =
            reducedMotion
              ? isActive
                ? "auto"
                : "none"
              : Math.abs(relative) <= 1
                ? "auto"
                : "none";

          return (
            <div
              key={slide.id}
              ref={(node) => {
                if (isActive) centerCardShellRef.current = node;
              }}
              className="carousel-card absolute inset-0 m-auto h-[56vw] w-[88vw] min-h-[16rem] min-w-[17rem] md:h-[460px]"
              style={{
                ...getCardSurfaceStyle(position),
                width: isCompact ? "88vw" : "min(76vw, 720px)",
                position: "absolute",
                transformOrigin: "center center",
                transformStyle: "preserve-3d",
                willChange: "transform",
                transition: transitionsEnabled
                  ? reducedMotion
                    ? "opacity .7s cubic-bezier(.16,1,.3,1)"
                    : "transform .7s cubic-bezier(.16,1,.3,1), opacity .7s cubic-bezier(.16,1,.3,1)"
                  : "none",
                backfaceVisibility: "hidden",
                boxShadow:
                  "0 32px 80px rgba(0,0,0,.45), 0 8px 24px rgba(0,0,0,.25)",
                borderRadius: "14px",
                overflow: "hidden",
                pointerEvents,
              }}
            >
              <div
                ref={(node) => {
                  if (isActive) centerCardRef.current = node;
                }}
                role="img"
                aria-label={`${slide.name} website preview`}
                tabIndex={Math.abs(relative) <= 1 ? 0 : -1}
                className="group relative h-full w-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                style={{
                  "--inner-tilt-x": "0deg",
                  "--inner-tilt-y": "0deg",
                  transform: isActive
                    ? "rotateY(var(--inner-tilt-y)) rotateX(var(--inner-tilt-x))"
                    : "none",
                  transformStyle: "preserve-3d",
                } as CSSProperties}
                onMouseEnter={() => {
                  if (!isActive) {
                    tiltTargetRef.current = { x: 0, y: 0 };
                  }

                  if (isLeft) {
                    cursor.set("view", `${t("cursor.previous")} ←`);
                    return;
                  }

                  if (isRight) {
                    cursor.set("view", `${t("cursor.next")} →`);
                    return;
                  }

                  cursor.reset();
                }}
                onClick={() => {
                  if (isLeft) {
                    cursor.reset();
                    rotatePrev();
                    return;
                  }

                  if (isActive) {
                    openCase(slide);
                    return;
                  }

                  cursor.reset();
                  rotateNext();
                }}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" && event.key !== " ") return;
                  event.preventDefault();

                  if (isLeft) {
                    cursor.reset();
                    rotatePrev();
                    return;
                  }

                  if (isActive) {
                    openCase(slide);
                    return;
                  }

                  cursor.reset();
                  rotateNext();
                }}
                onFocus={() => {
                  if (isLeft) {
                    cursor.set("view", `${t("cursor.previous")} ←`);
                    return;
                  }

                  if (isRight) {
                    cursor.set("view", `${t("cursor.next")} →`);
                    return;
                  }

                  cursor.reset();
                }}
                onMouseMove={isActive ? handleCenterMouseMove : undefined}
                onMouseLeave={() => {
                  if (isActive) tiltTargetRef.current = { x: 0, y: 0 };
                  cursor.reset();
                }}
                onBlur={() => {
                  cursor.reset();
                }}
              >
                {renderCardLayout(
                  slide,
                  isActive,
                  t("cursor.viewProject"),
                  () => openCase(slide),
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const cursor = useCursor();
  const { t } = useLanguage();
  const content = useSiteContent();

  const service = getServiceDefinitionBySlug(slug);

  const serviceContent = service
    ? content.services[service.contentIndex]
    : undefined;

  if (!service || !serviceContent) {
    return (
      <section className="min-h-screen flex items-center justify-center pt-24 px-6">
        <div className="text-center">
          <h1
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: "2rem",
              fontWeight: 700,
              color: "var(--page-fg)",
            }}
          >
            {t("services.notFound")}
          </h1>
          <TransitionLink
            to="/services"
            className="mt-6 inline-block px-6 py-2 rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/35"
            style={{
              fontSize: ".78rem",
              fontWeight: 500,
              letterSpacing: ".06em",
              textTransform: "uppercase",
              color: "rgba(var(--page-fg-rgb), .5)",
              border: "1px solid rgba(var(--page-fg-rgb), .2)",
            }}
          >
            {t("services.back")}
          </TransitionLink>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative overflow-x-clip px-6 pb-24 pt-24 md:px-12 md:pb-28 lg:px-16"
      style={{ background: "var(--page-bg)", minHeight: "100vh" }}
    >
      <div className="mx-auto max-w-[1320px]">
        <TransitionLink
          to="/services"
          className="inline-flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/35 rounded-full px-3 py-2"
          style={{
            fontSize: ".68rem",
            fontWeight: 600,
            letterSpacing: ".1em",
            textTransform: "uppercase",
            color: "rgba(var(--page-fg-rgb), .45)",
          }}
          onMouseEnter={() => cursor.set("link", t("services.back"))}
          onMouseLeave={() => cursor.reset()}
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform duration-300" />
          {t("services.back")}
        </TransitionLink>
      </div>

      <div className="mx-auto mt-8 max-w-[1320px] md:mt-12">
        <div className="max-w-[56rem]">
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
            className="mt-3"
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: "clamp(2.1rem,5vw,3.7rem)",
              fontWeight: 700,
              letterSpacing: "-.04em",
              color: "var(--page-fg)",
              lineHeight: 1.06,
            }}
          >
            {serviceContent.title}
          </h1>
          <p
            className="mt-6"
            style={{
              maxWidth: "42rem",
              fontSize: "1rem",
              lineHeight: 1.85,
              color: "rgba(var(--page-fg-rgb), .62)",
            }}
          >
            {serviceContent.description}
          </p>
          <div className="mt-10">
            <TransitionLink
              to="/services"
              className="group inline-flex items-center gap-2 rounded-full px-5 py-3 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/35"
              style={{
                fontSize: ".72rem",
                fontWeight: 600,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: "var(--page-fg)",
                border: "1px solid rgba(var(--page-fg-rgb), .14)",
                background: "rgba(var(--page-fg-rgb), .03)",
              }}
              onMouseEnter={() => cursor.set("link", t("services.allServices"))}
              onMouseLeave={() => cursor.reset()}
            >
              {t("services.allServices")}
              <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
            </TransitionLink>
          </div>
        </div>
      </div>

      <div className="relative left-1/2 mt-10 w-screen -translate-x-1/2 md:mt-12">
        <ServiceShowcaseCarousel />
      </div>
    </section>
  );
}
