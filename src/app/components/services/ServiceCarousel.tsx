import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useCursor } from "../../hooks/useCursor";
import { useLanguage } from "../../hooks/useLanguage";
import { usePageTransition } from "../../hooks/useTransition";
import type { ServiceIncludeItem } from "../../content/loadContent";
import { renderInlineMarkdown } from "../../utils/inlineMarkdown";
import { serviceHeroImages } from "../../data/serviceTaxonomy";

/**
 * ServiceCarousel — the service-page carousel, rebuilt from the original
 * ServiceShowcaseCarousel (archive/legacy-pages/ServiceDetailPage.tsx):
 * same 3D coverflow mechanics, dimensions, touch-swipe and keyboard-arrow
 * navigation. Only the slide content changed — cases out, this service's
 * own "what's included" items in — and autoplay is removed entirely
 * (the original still auto-rotated, just slower, under reduced-motion;
 * this brief is explicit that there is no autoplay at all here).
 */

const CAROUSEL_MOBILE_QUERY = "(max-width: 767px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

type CoverFlowPosition = {
  translateX: string;
  translateZ: string;
  rotateY: string;
  scale: number;
  opacity: number;
  zIndex: number;
};

/* Fully opaque at every position — only farLeft/farRight sit at opacity 0
   because they're staged off-stage before sliding in, not because the
   carousel itself should look see-through. */
const COVERFLOW_POSITIONS = {
  farLeft: { translateX: "-102%", translateZ: "-120px", rotateY: "-20deg", scale: 0.84, opacity: 0, zIndex: 0 },
  left: { translateX: "-52%", translateZ: "-120px", rotateY: "-18deg", scale: 0.88, opacity: 1, zIndex: 1 },
  center: { translateX: "0%", translateZ: "0px", rotateY: "0deg", scale: 1, opacity: 1, zIndex: 3 },
  right: { translateX: "52%", translateZ: "-120px", rotateY: "18deg", scale: 0.88, opacity: 1, zIndex: 1 },
  farRight: { translateX: "102%", translateZ: "-120px", rotateY: "20deg", scale: 0.84, opacity: 0, zIndex: 0 },
} satisfies Record<string, CoverFlowPosition>;

const MOBILE_COVERFLOW_POSITIONS = {
  farLeft: { translateX: "-118%", translateZ: "-90px", rotateY: "-16deg", scale: 0.76, opacity: 0, zIndex: 0 },
  left: { translateX: "-94%", translateZ: "-40px", rotateY: "-5deg", scale: 0.92, opacity: 1, zIndex: 1 },
  center: { translateX: "0%", translateZ: "0px", rotateY: "0deg", scale: 1, opacity: 1, zIndex: 3 },
  right: { translateX: "94%", translateZ: "-40px", rotateY: "5deg", scale: 0.92, opacity: 1, zIndex: 1 },
  farRight: { translateX: "118%", translateZ: "-90px", rotateY: "16deg", scale: 0.76, opacity: 0, zIndex: 0 },
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

function getCardPosition(relative: number, isCompact: boolean, reducedMotion: boolean): CoverFlowPosition {
  if (reducedMotion) {
    return relative === 0
      ? COVERFLOW_POSITIONS.center
      : { ...COVERFLOW_POSITIONS.center, opacity: 0, zIndex: 0 };
  }
  const positions = isCompact ? MOBILE_COVERFLOW_POSITIONS : COVERFLOW_POSITIONS;
  switch (relative) {
    case -2: return positions.farLeft;
    case -1: return positions.left;
    case 0: return positions.center;
    case 1: return positions.right;
    case 2: return positions.farRight;
    default: return relative < 0 ? positions.farLeft : positions.farRight;
  }
}

function getCardSurfaceStyle(position: CoverFlowPosition): CSSProperties {
  return {
    zIndex: position.zIndex,
    opacity: position.opacity,
    transform: `translateX(${position.translateX}) translateZ(${position.translateZ}) rotateY(${position.rotateY}) scale(${position.scale})`,
  } as CSSProperties;
}

function renderCardLayout(item: ServiceIncludeItem, isActive: boolean) {
  const slug = item.href?.replace(/^\//, "");
  const caseImage = slug ? serviceHeroImages[slug] : undefined;
  return (
    <div
      className="relative h-full overflow-hidden rounded-[inherit] flex flex-col"
      style={{
        // Solid, fully opaque surface — not an alpha-blended tint — so the
        // carousel never reads as see-through, active card or not.
        background: "#121212",
        border: "1px solid rgba(var(--page-fg-rgb), .12)",
      }}
    >
      {caseImage && (
        <>
          <img
            src={caseImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ opacity: 0.5 }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(18,18,18,.65) 0%, rgba(18,18,18,.55) 40%, rgba(18,18,18,.92) 100%)",
            }}
          />
        </>
      )}
      <div
        className="absolute inset-x-0 top-0 z-20 flex h-[38px] items-center px-[14px]"
        style={{ background: "#181818", borderBottom: "1px solid rgba(var(--page-fg-rgb), .08)" }}
      >
        <div className="flex items-center gap-1.5">
          {["#ff5f57", "#ffbd2e", "#28c840"].map((color) => (
            <span key={color} className="block h-2.5 w-2.5 rounded-full" style={{ background: color }} />
          ))}
        </div>
      </div>

      <div
        className="relative z-10 flex flex-1 flex-col justify-center px-8 pt-[38px] pb-8 md:px-10"
        style={{ opacity: 1 }}
      >
        <h2
          style={{
            margin: "0 0 12px",
            fontFamily: "'Inter',sans-serif",
            fontSize: "clamp(1.3rem,2.6vw,1.9rem)",
            fontWeight: 700,
            lineHeight: 1.15,
            color: "var(--page-fg)",
          }}
        >
          {item.title}
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: "1rem",
            lineHeight: 1.65,
            color: "rgba(var(--page-fg-rgb), .65)",
            maxWidth: "34rem",
          }}
        >
          {renderInlineMarkdown(item.description)}
        </p>
      </div>
    </div>
  );
}

export function ServiceCarousel({ items }: { items: ServiceIncludeItem[] }) {
  const cursor = useCursor();
  const { t } = useLanguage();
  const { navigateTo } = usePageTransition();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isCompact, setIsCompact] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [transitionsEnabled, setTransitionsEnabled] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const centerCardRef = useRef<HTMLDivElement | null>(null);
  const tiltFrameRef = useRef<number | null>(null);
  const tiltTargetRef = useRef({ x: 0, y: 0 });
  const tiltCurrentRef = useRef({ x: 0, y: 0 });
  const touchStartXRef = useRef<number | null>(null);
  const touchDeltaXRef = useRef(0);
  const totalCards = items.length;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mobileQuery = window.matchMedia(CAROUSEL_MOBILE_QUERY);
    const motionQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    const updateViewportMode = () => {
      setIsCompact(mobileQuery.matches);
      setReducedMotion(motionQuery.matches);
    };
    updateViewportMode();
    const timeout = window.setTimeout(() => setTransitionsEnabled(true), 0);
    mobileQuery.addEventListener("change", updateViewportMode);
    motionQuery.addEventListener("change", updateViewportMode);
    return () => {
      window.clearTimeout(timeout);
      mobileQuery.removeEventListener("change", updateViewportMode);
      motionQuery.removeEventListener("change", updateViewportMode);
    };
  }, []);

  const rotateNext = useCallback(() => {
    if (totalCards <= 1) return;
    setActiveIndex((current) => wrapIndex(current + 1, totalCards));
  }, [totalCards]);

  const rotatePrev = useCallback(() => {
    if (totalCards <= 1) return;
    setActiveIndex((current) => wrapIndex(current - 1, totalCards));
  }, [totalCards]);

  useEffect(() => {
    cursor.reset();
    if (centerCardRef.current) {
      centerCardRef.current.style.setProperty("--inner-tilt-x", "0deg");
      centerCardRef.current.style.setProperty("--inner-tilt-y", "0deg");
    }
    tiltTargetRef.current = { x: 0, y: 0 };
    tiltCurrentRef.current = { x: 0, y: 0 };
  }, [activeIndex, cursor]);

  useEffect(() => {
    if (typeof window === "undefined" || reducedMotion) return;
    const step = () => {
      const current = tiltCurrentRef.current;
      const target = tiltTargetRef.current;
      current.x += (target.x - current.x) * 0.08;
      current.y += (target.y - current.y) * 0.08;
      if (centerCardRef.current) {
        centerCardRef.current.style.setProperty("--inner-tilt-x", `${current.x.toFixed(3)}deg`);
        centerCardRef.current.style.setProperty("--inner-tilt-y", `${current.y.toFixed(3)}deg`);
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
      if (tiltFrameRef.current !== null) {
        cancelAnimationFrame(tiltFrameRef.current);
        tiltFrameRef.current = null;
      }
    };
  }, [cursor]);

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

  const finishTouchGesture = useCallback(() => {
    const delta = touchDeltaXRef.current;
    touchStartXRef.current = null;
    touchDeltaXRef.current = 0;
    if (Math.abs(delta) > 40) {
      if (delta < 0) rotateNext();
      else rotatePrev();
    }
  }, [rotateNext, rotatePrev]);

  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (totalCards <= 1) return;
      touchStartXRef.current = event.touches[0]?.clientX ?? null;
      touchDeltaXRef.current = 0;
    },
    [totalCards],
  );

  const handleTouchMove = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartXRef.current === null) return;
    touchDeltaXRef.current = (event.touches[0]?.clientX ?? touchStartXRef.current) - touchStartXRef.current;
  }, []);

  // Desktop drag — same threshold-based gesture as touch, so pointer users
  // without arrow buttons still have a way to navigate besides keyboard.
  const isDraggingRef = useRef(false);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (totalCards <= 1 || event.button !== 0) return;
      isDraggingRef.current = true;
      touchStartXRef.current = event.clientX;
      touchDeltaXRef.current = 0;
    },
    [totalCards],
  );

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || touchStartXRef.current === null) return;
    touchDeltaXRef.current = event.clientX - touchStartXRef.current;
  }, []);

  const finishMouseGesture = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    finishTouchGesture();
  }, [finishTouchGesture]);

  const wheelLockRef = useRef(false);
  const handleWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      if (totalCards <= 1) return;
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : 0;
      if (Math.abs(delta) < 24 || wheelLockRef.current) return;
      wheelLockRef.current = true;
      if (delta > 0) rotateNext();
      else rotatePrev();
      window.setTimeout(() => {
        wheelLockRef.current = false;
      }, 500);
    },
    [totalCards, rotateNext, rotatePrev],
  );

  if (totalCards === 0) return null;

  return (
    <div className="relative isolate w-full overflow-hidden bg-transparent px-0">
      <div
        ref={viewportRef}
        className="relative z-10 flex w-full items-center justify-center overflow-hidden px-0"
        role="group"
        aria-roledescription="carousel"
        aria-label={t("services.includesCarousel") || "What's included"}
        aria-live="polite"
        tabIndex={0}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={finishTouchGesture}
        onTouchCancel={finishTouchGesture}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={finishMouseGesture}
        onMouseLeave={finishMouseGesture}
        onWheel={handleWheel}
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
        {items.map((item, index) => {
          const relative = getRelativeOffset(index, activeIndex, totalCards);
          const isActive = relative === 0;
          const isLeft = relative === -1;
          const isRight = relative === 1;
          const position = getCardPosition(relative, isCompact, reducedMotion);
          const pointerEvents = reducedMotion
            ? isActive ? "auto" : "none"
            : Math.abs(relative) <= 1 ? "auto" : "none";

          return (
            <div
              key={item.title}
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
                boxShadow: "0 32px 80px rgba(0,0,0,.45), 0 8px 24px rgba(0,0,0,.25)",
                borderRadius: "14px",
                overflow: "hidden",
                pointerEvents,
              }}
            >
              <div
                ref={(node) => {
                  if (isActive) centerCardRef.current = node;
                }}
                role={isLeft || isRight ? "button" : isActive && item.href ? "link" : undefined}
                aria-label={
                  isLeft
                    ? `Previous: ${item.title}`
                    : isRight
                      ? `Next: ${item.title}`
                      : isActive && item.href
                        ? item.title
                        : undefined
                }
                tabIndex={Math.abs(relative) <= 1 ? 0 : -1}
                className="group relative h-full w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                style={{
                  "--inner-tilt-x": "0deg",
                  "--inner-tilt-y": "0deg",
                  transform: isActive
                    ? "rotateY(var(--inner-tilt-y)) rotateX(var(--inner-tilt-x))"
                    : "none",
                  transformStyle: "preserve-3d",
                  cursor: isLeft || isRight || (isActive && item.href) ? "pointer" : "default",
                } as CSSProperties}
                onMouseEnter={() => {
                  if (!isActive) tiltTargetRef.current = { x: 0, y: 0 };
                  if (isLeft) { cursor.set("view", `${t("cursor.previous")} ←`); return; }
                  if (isRight) { cursor.set("view", `${t("cursor.next")} →`); return; }
                  if (isActive && item.href) { cursor.set("link"); return; }
                  cursor.reset();
                }}
                onClick={() => {
                  if (isLeft) { cursor.reset(); rotatePrev(); return; }
                  if (isRight) { cursor.reset(); rotateNext(); return; }
                  if (isActive && item.href) {
                    cursor.reset();
                    navigateTo(item.href);
                    window.scrollTo({ top: 0, behavior: "auto" });
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" && event.key !== " ") return;
                  event.preventDefault();
                  if (isLeft) { cursor.reset(); rotatePrev(); return; }
                  if (isRight) { cursor.reset(); rotateNext(); return; }
                  if (isActive && item.href) {
                    cursor.reset();
                    navigateTo(item.href);
                    window.scrollTo({ top: 0, behavior: "auto" });
                  }
                }}
                onFocus={() => {
                  if (isLeft) { cursor.set("view", `${t("cursor.previous")} ←`); return; }
                  if (isRight) { cursor.set("view", `${t("cursor.next")} →`); return; }
                  if (isActive && item.href) cursor.set("link");
                }}
                onMouseMove={isActive ? handleCenterMouseMove : undefined}
                onMouseLeave={() => {
                  if (isActive) tiltTargetRef.current = { x: 0, y: 0 };
                  cursor.reset();
                }}
                onBlur={() => cursor.reset()}
              >
                {renderCardLayout(item, isActive)}
              </div>
            </div>
          );
        })}
      </div>

      {totalCards > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2" aria-hidden="true">
          {items.map((item, i) => (
            <span
              key={item.title}
              className="block rounded-full transition-all duration-300"
              style={{
                width: i === activeIndex ? 18 : 6,
                height: 6,
                background:
                  i === activeIndex
                    ? "var(--page-fg)"
                    : "rgba(var(--page-fg-rgb), .25)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
