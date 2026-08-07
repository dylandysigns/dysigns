import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MapPin, Play, X } from "lucide-react";
import { TransitionLink } from "../TransitionLink";
import { MagneticFillButton } from "../MagneticFillButton";
import { useCursor } from "../../hooks/useCursor";
import { isLowPower } from "../Layout";
import { useLanguage } from "../../hooks/useLanguage";
import { Partners } from "./Partners";

gsap.registerPlugin(ScrollTrigger);

/* ─── PARALLAX STRENGTH ─── */
const LAYERS = {
  bg: 0.008,
  chip: 0.018,
};

const WORDMARK_VIEWBOX = {
  width: 2440,
  height: 520,
};

/**
 * Split an element's text content into per-word spans for staggered animation.
 * Returns an array of the created span elements.
 */
function splitWords(el: HTMLElement): HTMLSpanElement[] {
  const text = el.textContent || "";
  el.textContent = "";
  const words = text.split(/\s+/).filter(Boolean);
  const spans: HTMLSpanElement[] = [];
  words.forEach((word, i) => {
    const span = document.createElement("span");
    span.textContent = word;
    span.style.display = "inline-block";
    span.style.opacity = "0";
    span.style.transform = "translateY(30px)";
    if (i > 0) {
      const space = document.createTextNode("\u00A0");
      el.appendChild(space);
    }
    el.appendChild(span);
    spans.push(span);
  });
  return spans;
}

export function Hero() {
  const [isHeroIntroReady, setIsHeroIntroReady] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const mobileChipsRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const trustedRef = useRef<HTMLDivElement>(null);
  const irisRef = useRef<HTMLDivElement>(null);
  const bgVideoRef = useRef<HTMLVideoElement>(null);

  const maskAreaRef = useRef<HTMLDivElement>(null);
  const maskTextRef = useRef<HTMLDivElement>(null);
  const wordmarkSvgRef = useRef<SVGSVGElement>(null);
  const splitLeftRef = useRef<SVGGElement>(null);
  const splitRightRef = useRef<SVGGElement>(null);
  const splitHeadingRef = useRef<HTMLDivElement>(null);

  const cursor = useCursor();
  const { t } = useLanguage();
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  // Starts true (optimistic) so nothing flashes black before we've had a
  // chance to check — flips to false only once we've confirmed autoplay
  // actually failed or stopped, e.g. iOS Low Power Mode / Android Data
  // Saver silently blocking or pausing background video and surfacing
  // their own large native play button on top of it instead.
  const [videoPlaying, setVideoPlaying] = useState(true);

  useEffect(() => {
    if (!videoModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setVideoModalOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [videoModalOpen]);

  /* ─── BACKGROUND VIDEO — confirm it's actually playing ───
     video.play() returns a Promise specifically so autoplay failures
     (blocked by power-saving mode, data-saver, etc.) can be detected
     reliably — a rejected promise means the browser refused to play it
     and is likely showing its own native play-button overlay instead.
     onPlaying/onPause/onStalled catch it stopping again later, e.g. if
     low-power mode engages mid-playback. */
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;
    const video = bgVideoRef.current;
    if (!video) return;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setVideoPlaying(true))
        .catch(() => setVideoPlaying(false));
    }

    const handlePlaying = () => setVideoPlaying(true);
    const handleStopped = () => setVideoPlaying(false);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("pause", handleStopped);
    video.addEventListener("stalled", handleStopped);
    video.addEventListener("error", handleStopped);
    return () => {
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("pause", handleStopped);
      video.removeEventListener("stalled", handleStopped);
      video.removeEventListener("error", handleStopped);
    };
  }, []);
  const splitHeadingChars = Array.from(t("sentence"));
  const chipLabels = {
    strategy: t("hero.chip.strategy").toUpperCase(),
    brand: t("hero.chip.brand").toUpperCase(),
    ux: t("hero.chip.ux").toUpperCase(),
    web: t("hero.chip.web").toUpperCase(),
    product: t("hero.chip.product").toUpperCase(),
  };
  const mobileChips = [
    {
      to: "/ux-ui-design",
      label: chipLabels.ux,
      className: "left-1/2 top-[10%] -translate-x-1/2",
      featured: true,
    },
    {
      to: "/social-media-meta-ads",
      label: chipLabels.product,
      className: "left-4 top-[29%]",
    },
    {
      to: "/web-design",
      label: chipLabels.web,
      className: "right-4 top-[29%]",
    },
    {
      to: "/branding",
      label: chipLabels.brand,
      className: "left-5 bottom-[24%]",
    },
    {
      to: "/ai-implementation",
      label: chipLabels.strategy,
      className: "right-5 bottom-[24%]",
    },
  ];
  const mouse = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Breakpoint constant — used for scroll-lock guard and GSAP split sizing.
  // (Framer Motion useScroll/useTransform removed: running two scroll-processing
  //  pipelines simultaneously causes jank on Safari. Split is now driven entirely
  //  by GSAP ScrollTrigger's onUpdate — one driver, zero coordination overhead.)
  const isMobile =
    typeof window !== "undefined" &&
    !window.matchMedia("(min-width: 768px)").matches;

  useEffect(() => {
    if (reduced) {
      setIsHeroIntroReady(true);
      return;
    }
    setIsHeroIntroReady(false);
  }, [reduced]);

  useEffect(() => {
    if (reduced || isHeroIntroReady) return;
    // Never lock scroll on mobile — native iOS momentum scroll must stay free.
    // The intro animation plays fine without it; only desktop needs the lock
    // so content below the hero doesn't flash in while the intro runs.
    if (isMobile) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isHeroIntroReady, reduced]);

  /* SVG visibility and split transforms are now handled inside the GSAP
     ScrollTrigger onUpdate below — no separate effects needed. */

  /* ─── WORDMARK SPLIT ON SCROLL ─── */
  useEffect(() => {
    if (reduced || isLowPower) return;
    if (
      !sectionRef.current ||
      !splitLeftRef.current ||
      !splitRightRef.current ||
      !heroContentRef.current
    ) {
      return;
    }

    const ctx = gsap.context(() => {
      const onMobile = !window.matchMedia("(min-width: 768px)").matches;
      // Mobile: split starts immediately (splitStart=0) with lighter scrub.
      // Desktop: 12% hold before split, tighter scrub.
      const splitStart    = onMobile ? 0    : 0.12;
      const splitDuration = onMobile ? 0.96 : 0.96;
      const splitHold     = onMobile ? 1.24 : 1.24;
      const headingLift   = onMobile ? 8    : 18;
      const headingScale  = onMobile ? 0.994 : 0.975;
      const contentShift  = onMobile ? 10   : 28;
      const trustedShift  = onMobile ? 0    : 4;
      // Lower scrub on mobile so fade-outs track scroll closely with no lag.
      const scrubAmount   = onMobile ? 0.45 : 0.82;
      const headingEase   = onMobile ? "sine.out"  : "power2.out";
      const fadeEase      = onMobile ? "sine.out"  : "power1.out";
      const splitChars = splitHeadingRef.current
        ? Array.from(
            splitHeadingRef.current.querySelectorAll<HTMLElement>("[data-split-char]"),
          )
        : [];

      if (wordmarkSvgRef.current) {
        gsap.set(wordmarkSvgRef.current, {
          autoAlpha: 1,
          visibility: "visible",
        });
      }
      gsap.set([splitLeftRef.current, splitRightRef.current], {
        autoAlpha: 1,
        visibility: "visible",
      });

      // Ensure CSS transforms start at identity (will-change:transform is set in JSX)
      if (splitLeftRef.current) splitLeftRef.current.style.transform = "translate3d(0,0,0)";
      if (splitRightRef.current) splitRightRef.current.style.transform = "translate3d(0,0,0)";

      let tl: gsap.core.Timeline;

      tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: scrubAmount,
          refreshPriority: 2,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;

            // Hide the SVG wordmark once it's scrolled fully off-screen
            if (wordmarkSvgRef.current) {
              wordmarkSvgRef.current.style.visibility =
                p >= (onMobile ? 0.99 : 0.84) ? "hidden" : "visible";
            }

            // Drive SVG split translate via CSS transform so will-change:transform
            // on the <g> elements actually activates the GPU compositor path in
            // Safari. setAttribute("transform") bypasses CSS compositing entirely,
            // rendering will-change ineffective.
            if (splitLeftRef.current && splitRightRef.current) {
              // Hold from 0→splitStart, then animate to 0.92
              const splitP = gsap.utils.clamp(
                0,
                1,
                onMobile
                  ? p / 0.92
                  : (p - splitStart) / (0.92 - splitStart),
              );
              const maxX = onMobile
                ? window.innerWidth * 3
                : window.innerWidth * 1.2;
              const x = maxX * splitP;
              splitLeftRef.current.style.transform = `translate3d(${-x}px,0,0)`;
              splitRightRef.current.style.transform = `translate3d(${x}px,0,0)`;

              // Mobile: fade out split halves toward end of scroll
              if (onMobile) {
                const fadeP = gsap.utils.clamp(0, 1, (p - 0.6) / 0.4);
                splitLeftRef.current.style.opacity = String(1 - fadeP);
                splitRightRef.current.style.opacity = String(1 - fadeP);
              }
            }
          },
        },
      });

      if (splitHeadingRef.current) {
        // No filter:blur — blur animation forces software rasterisation in Safari
        // on every scrub frame. Scale + opacity alone look clean and run on GPU.
        tl.fromTo(
          splitHeadingRef.current,
          {
            yPercent: headingLift,
            scale: headingScale,
            opacity: 0,
          },
          {
            yPercent: 0,
            scale: 1,
            opacity: 1,
            duration: splitDuration,
            ease: headingEase,
          },
          splitStart,
        );

        if (splitChars.length) {
          gsap.set(splitChars, {
            color: "rgba(var(--page-fg-rgb), 1)",
            textShadow: "0 0 10px rgba(255,255,255,.08)",
          });
        }

        tl.to({}, { duration: splitHold }, splitStart + splitDuration + 0.14);
      }

      const pillLayers = [chipsRef.current, mobileChipsRef.current].filter(
        Boolean,
      ) as HTMLDivElement[];
      if (pillLayers.length) {
        tl.to(
          pillLayers,
          {
            autoAlpha: 0,
            duration: onMobile ? 0.44 : 0.38,
            ease: fadeEase,
          },
          splitStart + 0.04,
        );
      }

      tl.to(
        heroContentRef.current,
        {
          y: contentShift,
          opacity: 0,
          duration: onMobile ? 0.48 : 0.42,
          ease: fadeEase,
        },
        splitStart + 0.04,
      );

      if (trustedRef.current) {
        tl.to(
          trustedRef.current,
          {
            y: trustedShift,
            opacity: 0,
            duration: onMobile ? 0.42 : 0.38,
            ease: fadeEase,
          },
          splitStart + 0.08,
        );
      }

      tl.to(
        dotRef.current,
        {
          y: -16,
          opacity: 0,
          duration: onMobile ? 0.38 : 0.34,
          ease: fadeEase,
        },
        splitStart + 0.02,
      );
    }, sectionRef);

    return () => {
      if (wordmarkSvgRef.current) {
        wordmarkSvgRef.current.style.visibility = "visible";
      }
      if (splitLeftRef.current) splitLeftRef.current.style.transform = "translate3d(0,0,0)";
      if (splitRightRef.current) splitRightRef.current.style.transform = "translate3d(0,0,0)";
      ctx.revert();
    };
  }, [reduced]);

  /* Brush/paint-reveal interaction and its fullscreen video easter egg have
     been removed entirely (both used /images/dysigns_reveal.mp4) — the
     wordmark is now a plain static mark, no pointer tracking. */

  /* ─── CURSOR PARALLAX ─── */
  useEffect(() => {
    if (reduced || isLowPower) return;
    if (!bgRef.current) return;
    let raf = 0;

    // Cache viewport dimensions — avoids layout reads inside the rAF tick.
    let viewW = window.innerWidth;
    let viewH = window.innerHeight;
    const onResize = () => { viewW = window.innerWidth; viewH = window.innerHeight; };
    window.addEventListener("resize", onResize, { passive: true });

    // Cache chip element list once — querySelectorAll inside rAF runs at 60fps otherwise.
    const chipEls = chipsRef.current
      ? (gsap.utils.toArray<HTMLElement>("[data-hero-pill]", chipsRef.current) as HTMLElement[])
      : ([] as HTMLElement[]);
    const chipCount = chipEls.length;

    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / viewW - 0.5) * 2;
      mouse.current.y = (e.clientY / viewH - 0.5) * 2;
    };

    const tick = () => {
      target.current.x += (mouse.current.x - target.current.x) * 0.08;
      target.current.y += (mouse.current.y - target.current.y) * 0.08;
      const tx = target.current.x;
      const ty = target.current.y;

      if (bgRef.current) {
        bgRef.current.style.transform = `translate3d(${tx * LAYERS.bg * viewW}px,${ty * LAYERS.bg * viewH}px,0)`;
      }
      for (let i = 0; i < chipCount; i++) {
        const lag = 1 + i * 0.3;
        chipEls[i].style.transform = `translate3d(${tx * LAYERS.chip * viewW * lag}px,${ty * LAYERS.chip * viewH * lag}px,0)`;
      }

      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  /* ─── ENTRY ANIMATIONS ─── */
  useEffect(() => {
    if (reduced) {
      setIsHeroIntroReady(true);
      gsap.set(
        [headRef.current, ctaRef.current, trustedRef.current],
        { opacity: 1 },
      );
      if (dotRef.current) gsap.set(dotRef.current, { opacity: 1 });
      if (maskTextRef.current) gsap.set(maskTextRef.current, { opacity: 1 });
      if (heroContentRef.current)
        gsap.set(heroContentRef.current, { opacity: 1 });
      return;
    }

    if (!maskTextRef.current) return;

    setIsHeroIntroReady(false);

    /* Iris/aperture reveal — a punched-hole mask (radial-gradient, not
       clip-path, so the hole grows from center outward rather than the
       covering disc shrinking to a point) opens over the whole sticky
       zone before/while the rest of the intro plays underneath it. */
    let irisTween: gsap.core.Tween | null = null;
    if (irisRef.current) {
      gsap.set(irisRef.current, { opacity: 1 });
      const maxRadius = Math.hypot(window.innerWidth, window.innerHeight) / 2 + 40;
      const irisState = { r: 0 };
      irisTween = gsap.to(irisState, {
        r: maxRadius,
        duration: 1.3,
        ease: "power3.inOut",
        delay: 0.12,
        onUpdate: () => {
          if (!irisRef.current) return;
          const mask = `radial-gradient(circle at 50% 50%, transparent ${irisState.r}px, black ${irisState.r + 2}px)`;
          irisRef.current.style.maskImage = mask;
          irisRef.current.style.webkitMaskImage = mask;
        },
        onComplete: () => {
          if (irisRef.current) irisRef.current.style.opacity = "0";
        },
      });
    }

    const tl = gsap.timeline({
      delay: 0.12,
      onComplete: () => {
        setIsHeroIntroReady(true);
      },
    });

    /* Masked text reveal — scale from 1.2 down + fade in */
    if (maskTextRef.current) {
      tl.fromTo(
        maskTextRef.current,
        { scale: 1.2, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.6, ease: "power2.out" },
        0.1,
      );
    }

    /* Green dot */
    if (dotRef.current) {
      tl.fromTo(
        dotRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: "elastic.out(1,.5)" },
        0.8,
      );
    }

    /* Hero content */
    if (headRef.current) {
      const words = splitWords(headRef.current);
      tl.to(
        words,
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.06,
          ease: "power3.out",
        },
        1.0,
      );
    }

    tl.fromTo(
      ctaRef.current,
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" },
      "-=.3",
    );
    tl.fromTo(
      trustedRef.current,
      { y: 18, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.55, ease: "power3.out" },
      "-=.15",
    );

    if (chipsRef.current) {
      const chipEls = gsap.utils.toArray<HTMLElement>("[data-hero-pill]", chipsRef.current);
      tl.fromTo(
        chipEls,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power3.out" },
        "-=.4",
      );
    }

    return () => {
      tl.kill();
      irisTween?.kill();
    };
  }, [reduced]);

  return (
    <section
      ref={sectionRef}
      className="relative h-[250dvh]"
      style={{ background: "var(--page-bg)" }}
      data-hero-section
    >
      <div
        ref={maskAreaRef}
        className="sticky top-0 h-[100dvh] overflow-hidden"
        style={{
          zIndex: 1,
          // Force a GPU compositing layer for the hero sticky zone.
          // isolation:isolate was previously needed for mix-blend-mode:screen on
          // the light band (removed in Round 2). Without it, Safari can composite
          // the child layers (split <g> elements, light band) independently rather
          // than as a single blending group, reducing re-composite area.
          transform: "translateZ(0)",
          WebkitTransform: "translateZ(0)",
        }}
        data-hero-zone
      >
        {/* iris/aperture reveal — opaque cover, punched open via mask on
            first load only. Default opacity:0 so no-JS/reduced-motion
            visitors never see a cover at all, matching the rest of this
            section's hidden-state-set-in-JS-only convention. */}
        <div
          ref={irisRef}
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 60,
            opacity: 0,
            background: "var(--page-bg)",
          }}
        />

        {/* Background video — muted, looping, decorative b-roll behind the
            hero content. Dominant enough to actually read as a video, but
            still darkened/desaturated so the wordmark and headline stay
            fully legible on top of it. Clicking the wordmark itself, or
            the "Watch video" pill bottom-right, opens the full video in
            the lightbox below. Skipped under prefers-reduced-motion, same
            as every other autoplaying layer in this component. */}
        {!reduced && (
          <div
            aria-hidden="true"
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{ zIndex: -1 }}
          >
            <video
              ref={bgVideoRef}
              className="absolute inset-0 h-full w-full object-cover"
              src="/videos/dysigns-intro.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              style={{
                opacity: 0.65,
                filter: "brightness(.75) contrast(1.05) grayscale(.3)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 50% 45%, rgba(0,0,0,.3) 0%, rgba(0,0,0,.62) 78%)",
              }}
            />
            {/* Confirmed-not-playing fallback — opaque, sits above the
                video (and therefore above the browser's own native
                play-button overlay too), so a stalled/blocked video reads
                as a plain dark background instead of a giant play icon. */}
            {!videoPlaying && (
              <div
                className="absolute inset-0"
                style={{ zIndex: 1, background: "var(--page-bg)" }}
              />
            )}
          </div>
        )}

        {!reduced && (
          <button
            type="button"
            onClick={() => setVideoModalOpen(true)}
            aria-label={t("hero.watchVideo")}
            className="absolute bottom-5 right-5 md:bottom-8 md:right-8 flex items-center gap-2 rounded-full transition-all duration-300"
            style={{
              zIndex: 25,
              padding: "9px 16px 9px 12px",
              border: "1px solid rgba(var(--page-fg-rgb), .22)",
              background: "rgba(var(--page-fg-rgb), .1)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              color: "var(--page-fg)",
            }}
            onMouseEnter={(e) => {
              cursor.set("link");
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(var(--page-fg-rgb), .4)";
              (e.currentTarget as HTMLElement).style.background = "rgba(var(--page-fg-rgb), .18)";
            }}
            onMouseLeave={(e) => {
              cursor.reset();
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(var(--page-fg-rgb), .22)";
              (e.currentTarget as HTMLElement).style.background = "rgba(var(--page-fg-rgb), .1)";
            }}
          >
            <span
              className="grid flex-shrink-0 place-items-center rounded-full"
              style={{ width: 20, height: 20, background: "var(--page-fg)" }}
            >
              <Play size={9} fill="var(--page-bg)" color="var(--page-bg)" style={{ marginLeft: 1 }} />
            </span>
            <span
              style={{
                fontSize: ".72rem",
                fontWeight: 600,
                letterSpacing: ".04em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              {t("hero.watchVideo")}
            </span>
          </button>
        )}

        {/* noise */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 20,
            opacity: 0.025,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* bg — pure black */}
        <div
          ref={bgRef}
          className="absolute inset-[-5%] pointer-events-none"
          style={{
            zIndex: 0,
            background:
              "radial-gradient(circle at 50% 48%, rgba(var(--page-fg-rgb), .035) 0%, rgba(var(--page-fg-rgb), .012) 24%, transparent 62%)",
            willChange: "transform",
          }}
        />

        <div className="relative z-20 flex h-full flex-col px-5 pb-5 pt-[86px] sm:px-6 sm:pt-[92px] md:pb-6 md:pt-[98px]" data-hero-inner>
          <div
            ref={dotRef}
            className="absolute left-0 right-0 top-[74px] flex justify-center md:top-[86px]"
            style={{ opacity: 0 }}
            role="status"
            aria-label="Available for projects"
          >
            <div
              className="flex items-center gap-2 rounded-full"
              style={{
                padding: "6px 12px",
                background: "rgba(var(--page-fg-rgb), .04)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            >
              {/* color="currentColor" lets CSS override the stroke via the parent's color property */}
              <span style={{ color: "rgba(var(--page-fg-rgb), .35)", display: "contents" }}>
                <MapPin size={11} color="currentColor" strokeWidth={1.9} />
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  letterSpacing: ".08em",
                  color: "rgba(255,255,255,.55)",
                  whiteSpace: "nowrap",
                  fontFamily: "'Inter',sans-serif",
                }}
              >
                <span style={{ color: "rgba(var(--page-fg-rgb), .8)", fontWeight: 600 }}>
                  Amsterdam
                </span>
                <span style={{ color: "rgba(var(--page-fg-rgb), .55)" }}>
                  {" "}
                  · the Netherlands
                </span>
              </span>
            </div>
          </div>

          <div className="relative flex min-h-[300px] flex-1 items-center justify-center py-[2vh] sm:min-h-[380px] sm:py-[3vh] md:min-h-[470px] md:py-0" data-hero-wordmark-area>
            <div
              ref={maskTextRef}
              className="relative flex h-full w-full items-center justify-center overflow-visible pointer-events-none"
              style={{
                zIndex: 24,
                opacity: 0,
              }}
            >
              <div className="relative h-full w-full">
                <div
                  className="pointer-events-none absolute left-1/2 top-[50.5%] flex -translate-x-1/2 -translate-y-1/2 justify-center sm:top-[51%] md:top-[54%]"
                  style={{
                    zIndex: 19,
                    width: "min(92vw, 980px)",
                    maxWidth: "calc(100vw - .75rem)",
                    paddingInline: "clamp(.5rem, 3vw, 2.5rem)",
                  }}
                >
                  <div
                    ref={splitHeadingRef}
                    className="w-full text-center"
                    style={{
                      opacity: 0,
                      fontFamily: "'Inter',sans-serif",
                      fontSize: "clamp(2.1rem, 9.4vw, 5.5rem)",
                      fontWeight: 800,
                      letterSpacing: "-.04em",
                      lineHeight: 1.01,
                      color: "rgba(var(--page-fg-rgb), .96)",
                      marginInline: "auto",
                      willChange: "transform, opacity",
                    }}
                  >
                    {splitHeadingChars.map((char, index) => (
                      <span
                        key={`${char}-${index}`}
                        data-split-char
                        style={{
                          display: "inline-block",
                          color: "rgba(var(--page-fg-rgb), .56)",
                        }}
                      >
                        {char === " " ? "\u00A0" : char}
                      </span>
                    ))}
                  </div>
                </div>

                <div
                  className="absolute left-1/2 top-[50.5%] flex w-[min(134vw,874px)] max-w-none -translate-x-1/2 -translate-y-1/2 items-center justify-center select-none sm:top-[51%] sm:w-[min(134vw,980px)] md:top-[54%] md:w-[min(132vw,1820px)] xl:w-[min(124vw,1880px)]"
                  style={{ zIndex: 20, cursor: reduced ? undefined : "pointer" }}
                  role={reduced ? undefined : "button"}
                  tabIndex={reduced ? undefined : 0}
                  aria-label={reduced ? undefined : t("hero.watchVideo")}
                  onClick={reduced ? undefined : () => setVideoModalOpen(true)}
                  onKeyDown={
                    reduced
                      ? undefined
                      : (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setVideoModalOpen(true);
                          }
                        }
                  }
                  onMouseEnter={reduced ? undefined : () => cursor.set("view", t("hero.watchVideo"))}
                  onMouseLeave={reduced ? undefined : () => cursor.reset()}
                >
                  <svg
                    ref={wordmarkSvgRef}
                    viewBox={`0 0 ${WORDMARK_VIEWBOX.width} ${WORDMARK_VIEWBOX.height}`}
                    className="block h-auto w-full overflow-visible"
                    aria-hidden="true"
                  >
                    <defs>
                      <clipPath id="hero-wordmark-left-clip">
                        <rect
                          x="0"
                          y="0"
                          width={WORDMARK_VIEWBOX.width / 2}
                          height={WORDMARK_VIEWBOX.height}
                        />
                      </clipPath>
                      <clipPath id="hero-wordmark-right-clip">
                        <rect
                          x={WORDMARK_VIEWBOX.width / 2}
                          y="0"
                          width={WORDMARK_VIEWBOX.width / 2}
                          height={WORDMARK_VIEWBOX.height}
                        />
                      </clipPath>
                    </defs>

                    <g ref={splitLeftRef} clipPath="url(#hero-wordmark-left-clip)" style={{ willChange: "transform, opacity" }}>
                      <text
                        data-dysigns-hero-text
                        x="50%"
                        y="57%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontFamily="Inter, sans-serif"
                        fontSize="402"
                        fontWeight="900"
                        letterSpacing="-34"
                        fill="transparent"
                        stroke="rgba(var(--page-fg-rgb), .38)"
                        strokeWidth="1.45"
                      >
                        DYSIGNS
                      </text>

                      <text
                        x="50%"
                        y="57%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontFamily="Inter, sans-serif"
                        fontSize="402"
                        fontWeight="900"
                        letterSpacing="-34"
                        fill="var(--page-fg)"
                      >
                        DYSIGNS
                      </text>
                    </g>

                    <g ref={splitRightRef} clipPath="url(#hero-wordmark-right-clip)" style={{ willChange: "transform, opacity" }}>
                      <text
                        data-dysigns-hero-text
                        x="50%"
                        y="57%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontFamily="Inter, sans-serif"
                        fontSize="402"
                        fontWeight="900"
                        letterSpacing="-34"
                        fill="transparent"
                        stroke="rgba(var(--page-fg-rgb), .38)"
                        strokeWidth="1.45"
                      >
                        DYSIGNS
                      </text>

                      <text
                        x="50%"
                        y="57%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontFamily="Inter, sans-serif"
                        fontSize="402"
                        fontWeight="900"
                        letterSpacing="-34"
                        fill="var(--page-fg)"
                      >
                        DYSIGNS
                      </text>
                    </g>
                  </svg>
                </div>

              </div>
            </div>

            <div
              ref={chipsRef}
              className="pointer-events-none absolute inset-0 hidden md:block"
              style={{ zIndex: 38 }}
            >
              <TransitionLink
                to="/ux-ui-design"
                className="absolute left-1/2 top-[8%] -translate-x-1/2"
                data-hero-pill
                style={{
                  background: "rgba(var(--page-fg-rgb), .08)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(var(--page-fg-rgb), .12)",
                  borderRadius: 8,
                  padding: "10px 16px",
                  opacity: 0,
                  animation: "uxPillPulse 3s ease-in-out infinite",
                  pointerEvents: "auto",
                  transition: "transform .3s ease, border-color .3s ease, background-color .3s ease",
                }}
                onMouseEnter={(e) => {
                  cursor.set("link");
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(var(--page-fg-rgb), .22)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(var(--page-fg-rgb), .12)";
                }}
                onMouseLeave={(e) => {
                  cursor.reset();
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(var(--page-fg-rgb), .12)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(var(--page-fg-rgb), .08)";
                }}
              >
                <span
                  style={{
                    fontFamily: "'Inter',sans-serif",
                    fontSize: ".65rem",
                    fontWeight: 600,
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    color: "rgba(var(--page-fg-rgb), .85)",
                  }}
                >
                  {chipLabels.ux}
                </span>
              </TransitionLink>

              <TransitionLink
                to="/branding"
                className="absolute bottom-[22%] left-[6%]"
                data-hero-pill
                style={{
                  background: "rgba(var(--page-fg-rgb), .05)",
                  border: "1px solid rgba(var(--page-fg-rgb), .08)",
                  borderRadius: 20,
                  padding: "6px 14px",
                  opacity: 0,
                  pointerEvents: "auto",
                  transition: "transform .3s ease, border-color .3s ease, background-color .3s ease",
                }}
                onMouseEnter={(e) => {
                  cursor.set("link");
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(var(--page-fg-rgb), .18)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(var(--page-fg-rgb), .08)";
                }}
                onMouseLeave={(e) => {
                  cursor.reset();
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(var(--page-fg-rgb), .08)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(var(--page-fg-rgb), .05)";
                }}
              >
                <span
                  style={{
                    fontSize: ".7rem",
                    fontWeight: 500,
                    color: "rgba(var(--page-fg-rgb), .55)",
                    letterSpacing: ".06em",
                  }}
                >
                  {chipLabels.brand}
                </span>
              </TransitionLink>

              <TransitionLink
                to="/web-design"
                className="absolute right-[8%] top-[18%]"
                data-hero-pill
                style={{
                  background: "rgba(var(--page-fg-rgb), .04)",
                  border: "1px solid rgba(var(--page-fg-rgb), .06)",
                  borderRadius: 20,
                  padding: "6px 14px",
                  opacity: 0,
                  pointerEvents: "auto",
                  transition: "transform .3s ease, border-color .3s ease, background-color .3s ease",
                }}
                onMouseEnter={(e) => {
                  cursor.set("link");
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(var(--page-fg-rgb), .16)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(var(--page-fg-rgb), .07)";
                }}
                onMouseLeave={(e) => {
                  cursor.reset();
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(var(--page-fg-rgb), .06)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(var(--page-fg-rgb), .04)";
                }}
              >
                <span
                  style={{
                    fontSize: ".7rem",
                    fontWeight: 500,
                    color: "rgba(var(--page-fg-rgb), .55)",
                    letterSpacing: ".06em",
                  }}
                >
                  {chipLabels.web}
                </span>
              </TransitionLink>

              <TransitionLink
                to="/social-media-meta-ads"
                className="absolute left-[7%] top-[22%] hidden lg:block"
                data-hero-pill
                style={{
                  background: "rgba(var(--page-fg-rgb), .04)",
                  border: "1px solid rgba(var(--page-fg-rgb), .06)",
                  borderRadius: 20,
                  padding: "6px 14px",
                  opacity: 0,
                  pointerEvents: "auto",
                  transition: "transform .3s ease, border-color .3s ease, background-color .3s ease",
                }}
                onMouseEnter={(e) => {
                  cursor.set("link");
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(var(--page-fg-rgb), .16)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(var(--page-fg-rgb), .07)";
                }}
                onMouseLeave={(e) => {
                  cursor.reset();
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(var(--page-fg-rgb), .06)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(var(--page-fg-rgb), .04)";
                }}
              >
                <span
                  style={{
                    fontSize: ".7rem",
                    fontWeight: 500,
                    color: "rgba(var(--page-fg-rgb), .55)",
                    letterSpacing: ".06em",
                  }}
                >
                  {chipLabels.product}
                </span>
              </TransitionLink>

              <TransitionLink
                to="/ai-implementation"
                className="absolute bottom-[26%] right-[7%] hidden lg:block"
                data-hero-pill
                style={{
                  background: "rgba(var(--page-fg-rgb), .04)",
                  border: "1px solid rgba(var(--page-fg-rgb), .06)",
                  borderRadius: 20,
                  padding: "6px 14px",
                  opacity: 0,
                  pointerEvents: "auto",
                  transition: "transform .3s ease, border-color .3s ease, background-color .3s ease",
                }}
                onMouseEnter={(e) => {
                  cursor.set("link");
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(var(--page-fg-rgb), .16)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(var(--page-fg-rgb), .07)";
                }}
                onMouseLeave={(e) => {
                  cursor.reset();
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(var(--page-fg-rgb), .06)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(var(--page-fg-rgb), .04)";
                }}
              >
                <span
                  style={{
                    fontSize: ".7rem",
                    fontWeight: 500,
                    color: "rgba(var(--page-fg-rgb), .55)",
                    letterSpacing: ".06em",
                  }}
                >
                  {chipLabels.strategy}
                </span>
              </TransitionLink>
            </div>

            <div
              ref={mobileChipsRef}
              className="pointer-events-none absolute inset-0 hidden"
              style={{ zIndex: 34 }}
            >
              {mobileChips.map((chip) => (
                <TransitionLink
                  key={chip.label}
                  to={chip.to}
                  className={`absolute pointer-events-auto ${chip.className}`}
                  data-hero-pill
                  style={{
                    maxWidth: "calc(100vw - 2.75rem)",
                    background: chip.featured
                      ? "rgba(var(--page-fg-rgb), .08)"
                      : "rgba(var(--page-fg-rgb), .05)",
                    border: chip.featured
                      ? "1px solid rgba(var(--page-fg-rgb), .14)"
                      : "1px solid rgba(var(--page-fg-rgb), .08)",
                    borderRadius: chip.featured ? 12 : 999,
                    padding: chip.featured ? "10px 16px" : "8px 13px",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    boxShadow: chip.featured
                      ? "0 0 18px rgba(var(--page-fg-rgb), .08)"
                      : "none",
                  }}
                  onMouseEnter={() => cursor.set("link")}
                  onMouseLeave={() => cursor.reset()}
                >
                  <span
                    style={{
                      fontFamily: "'Inter',sans-serif",
                      fontSize: chip.featured ? ".66rem" : ".64rem",
                      fontWeight: chip.featured ? 600 : 500,
                      letterSpacing: ".08em",
                      textTransform: "uppercase",
                      color: chip.featured
                        ? "rgba(var(--page-fg-rgb), .88)"
                        : "rgba(var(--page-fg-rgb), .7)",
                    }}
                  >
                    {chip.label}
                  </span>
                </TransitionLink>
              ))}
            </div>
          </div>

          <div ref={heroContentRef} className="relative z-30 -mt-14 pb-0 md:-mt-24" data-hero-content>
            <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-2 md:gap-6">
              <div className="mx-auto max-w-5xl text-center">
                <h1
                  ref={headRef}
                  style={{
                    fontFamily: "'Inter',sans-serif",
                    fontSize: "clamp(.78rem,1.85vw,1.1rem)",
                    fontWeight: 600,
                    lineHeight: 1.32,
                    letterSpacing: "-.02em",
                    color: "var(--page-fg)",
                  }}
                >
                  {t("hero.headline.A")}
                </h1>
                {/* Single primary action, per the brief: "Onder de hero één
                    primaire actie naar /contact. Eén, niet drie." */}
                <div
                  ref={ctaRef}
                  className="mt-4 flex flex-wrap items-center justify-center gap-3 md:mt-7"
                >
                  <MagneticFillButton to="/contact" cursorLabel={t("cursor.contact")}>
                    {t("hero.cta2")}
                  </MagneticFillButton>
                </div>
              </div>
            </div>
          </div>

          <div
            ref={trustedRef}
            className="relative z-30 mt-auto md:mt-4"
            style={{ opacity: 0 }}
          >
            <div className="mx-auto w-full max-w-[88rem]">
              <Partners variant="hero" />
            </div>
          </div>
        </div>
      </div>

      {/* ─── SHORT BRIDGE ─── into next section */}
      <div
        className="absolute left-0 right-0 pointer-events-none h-[18vh] md:h-[28vh]"
        style={{
          zIndex: 2,
          bottom: 0,
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(var(--page-bg-rgb), .18) 16%, rgba(var(--page-bg-rgb), .5) 42%, rgba(var(--page-bg-rgb), .84) 72%, var(--page-bg) 100%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none h-[2vh] md:h-[3vh]"
        style={{ zIndex: 3, background: "var(--page-bg)" }}
      />

      {/* Keyframes + mobile overrides */}
      <style>{`
        @keyframes uxPillPulse {
          0%, 100% { opacity: 0.72; transform: scale(1); }
          50%       { opacity: 1;    transform: scale(1.018); }
        }

        /* ─── MOBILE HERO (below md = 768px) ─── */
        @media (max-width: 767px) {
          /* Allow DYSIGNS halves to travel past the sticky-zone boundary.
             overflow:clip does NOT create a scroll container (safe for iOS).
             overflow-clip-margin:400vw extends the paint region far enough
             that ±300vw translateX fully clears every iPhone screen size. */
          [data-hero-zone] {
            overflow: clip !important;
            overflow-clip-margin: 400vw !important;
          }
          /* Ensure "Trusted by" clears the iOS home indicator on all iPhone heights.
             mt-auto on the trusted row handles vertical docking; this just adds
             safe-area clearance with a 1.5rem fallback. */
          [data-hero-inner] {
            padding-bottom: max(1.5rem, env(safe-area-inset-bottom)) !important;
          }
        }
      `}</style>

      {/* Video lightbox — opened by the wordmark or the "Watch video"
          pill. Real video controls here (unlike the muted background
          layer), closes on backdrop click, the × button, or Escape. */}
      {videoModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 md:p-10"
          style={{ zIndex: 300, background: "rgba(0,0,0,.92)" }}
          onClick={() => setVideoModalOpen(false)}
        >
          <button
            type="button"
            aria-label={t("hero.closeVideo")}
            onClick={(e) => {
              e.stopPropagation();
              setVideoModalOpen(false);
            }}
            className="absolute grid place-items-center rounded-full transition-colors duration-300"
            style={{
              top: 20,
              right: 20,
              width: 44,
              height: 44,
              border: "1px solid rgba(255,255,255,.2)",
              background: "rgba(255,255,255,.06)",
              color: "#fff",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.14)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.06)";
            }}
          >
            <X size={18} />
          </button>
          <video
            src="/videos/dysigns-intro.mp4"
            controls
            autoPlay
            playsInline
            className="max-h-full max-w-full rounded-lg"
            style={{ boxShadow: "0 30px 90px rgba(0,0,0,.6)" }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
