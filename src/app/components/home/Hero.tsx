import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MapPin } from "lucide-react";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { TransitionLink } from "../TransitionLink";
import { useCursor } from "../../hooks/useCursor";
import { usePageTransition } from "../../hooks/useTransition";
import { isLowPower } from "../Layout";
import { useLanguage } from "../../hooks/useLanguage";
import { Partners } from "./Partners";

gsap.registerPlugin(ScrollTrigger);

/* ─── PARALLAX STRENGTH ─── */
const LAYERS = {
  bg: 0.008,
  light: 0.025,
  chip: 0.018,
};

const WORDMARK_VIEWBOX = {
  width: 2440,
  height: 520,
};

const VIDEO_EASTER_EGG_THRESHOLD = 0.35;
const VIDEO_EASTER_EGG_BUCKETS = 120;
const INTERACTION_HINT_COPY_THRESHOLD = 0.01;

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
  const [isEasterEggOpen, setIsEasterEggOpen] = useState(false);
  const [isHeroIntroReady, setIsHeroIntroReady] = useState(false);
  const [showBrushHereHint, setShowBrushHereHint] = useState(true);
  const [brushHintText, setBrushHintText] = useState("hero.brushHere");
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const mobileChipsRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const trustedRef = useRef<HTMLDivElement>(null);

  const maskAreaRef = useRef<HTMLDivElement>(null);
  const maskTextRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const wordmarkSvgRef = useRef<SVGSVGElement>(null);
  const interactionHintDismissedRef = useRef(false);
  const wordmarkInteractiveRef = useRef(false);
  const paintPathRef = useRef<SVGPathElement>(null);
  const wordmarkVideoLayerRef = useRef<SVGGElement>(null);
  const wordmarkVideoRef = useRef<HTMLVideoElement>(null);
  const fullscreenVideoRef = useRef<HTMLVideoElement>(null);
  const easterEggOverlayRef = useRef<HTMLDivElement>(null);
  const easterEggFrameRef = useRef<HTMLDivElement>(null);
  const videoRevealTimeoutRef = useRef<number | null>(null);
  const splitLeftRef = useRef<SVGGElement>(null);
  const splitRightRef = useRef<SVGGElement>(null);
  const splitHeadingRef = useRef<HTMLDivElement>(null);
  const brushHintTextRef = useRef("hero.brushHere");

  const cursor = useCursor();
  const { navigateTo } = usePageTransition();
  const { t } = useLanguage();
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
      to: "/services/ux-ui-web-design",
      label: chipLabels.ux,
      className: "left-1/2 top-[10%] -translate-x-1/2",
      featured: true,
    },
    {
      to: "/services/product-design",
      label: chipLabels.product,
      className: "left-4 top-[29%]",
    },
    {
      to: "/services/ux-ui-web-design",
      label: chipLabels.web,
      className: "right-4 top-[29%]",
    },
    {
      to: "/services/brand-identity",
      label: chipLabels.brand,
      className: "left-5 bottom-[24%]",
    },
    {
      to: "/services/creative-thinking",
      label: chipLabels.strategy,
      className: "right-5 bottom-[24%]",
    },
  ];
  const mouse = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const paintState = useRef({
    d: "",
    lastX: null as number | null,
    lastY: null as number | null,
    coverage: new Uint8Array(VIDEO_EASTER_EGG_BUCKETS),
    filledBuckets: 0,
    videoUnlocked: false,
  });

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ─── SCROLL SPLIT (Framer Motion) ─── */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  // Mobile needs ±250vw so the SVG halves (which animate in SVG-coordinate space)
  // fully clear the screen. Desktop ±120vw is sufficient at larger sizes.
  const isMobile =
    typeof window !== "undefined" &&
    !window.matchMedia("(min-width: 768px)").matches;
  const leftX  = useTransform(scrollYProgress, [0, 0.12, 0.92], ["0vw", "0vw", isMobile ? "-250vw" : "-120vw"]);
  const rightX = useTransform(scrollYProgress, [0, 0.12, 0.92], ["0vw", "0vw", isMobile ?  "250vw" :  "120vw"]);

  const closeEasterEgg = useCallback(() => {
    setIsEasterEggOpen(false);
  }, []);

  const dismissInteractionHint = useCallback(() => {
    if (interactionHintDismissedRef.current) return;
    interactionHintDismissedRef.current = true;
    setShowBrushHereHint(false);
  }, []);

  useEffect(() => {
    if (reduced) {
      setIsHeroIntroReady(true);
      return;
    }
    setIsHeroIntroReady(false);
  }, [reduced]);

  useEffect(() => {
    if (reduced || isHeroIntroReady || isEasterEggOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isEasterEggOpen, isHeroIntroReady, reduced]);

  /* ─── WORDMARK SVG VISIBILITY ─── */
  // Hide the SVG once the halves are fully offscreen so it doesn't interfere
  // with whatever is revealed behind the split.
  useEffect(() => {
    return scrollYProgress.on("change", (v) => {
      if (!wordmarkSvgRef.current) return;
      wordmarkSvgRef.current.style.visibility = v >= 0.84 ? "hidden" : "visible";
    });
  }, [scrollYProgress]);

  /* ─── LIGHT BAND DRIFT ─── */
  useEffect(() => {
    if (reduced || isLowPower) return;
    if (!lightRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to(lightRef.current, {
        rotation: 360,
        duration: 28,
        repeat: -1,
        ease: "none",
      });
      gsap.to(lightRef.current, {
        x: "8vw",
        yoyo: true,
        repeat: -1,
        duration: 9,
        ease: "sine.inOut",
      });
      gsap.to(lightRef.current, {
        y: "5vh",
        yoyo: true,
        repeat: -1,
        duration: 11,
        ease: "sine.inOut",
      });
    });
    return () => ctx.revert();
  }, [reduced]);

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
      const headingBlur   = onMobile ? 4    : 8;
      const contentShift  = onMobile ? 10   : 28;
      const trustedShift  = onMobile ? 0    : 4;
      const scrubAmount   = onMobile ? 1.18 : 0.82;
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

      let tl: gsap.core.Timeline;

      tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          // "bottom bottom" = section-bottom aligns with viewport-bottom at
          // scroll=150dvh — exactly when the sticky releases.  This keeps
          // the GSAP timeline in sync with the Framer Motion split range.
          end: "bottom bottom",
          scrub: scrubAmount,
          refreshPriority: 2,
          invalidateOnRefresh: true,
        },
      });

      // Split-left and split-right x-motion is driven by Framer Motion
      // (leftX / rightX MotionValues on motion.g) — no GSAP tween needed here.

      if (wordmarkVideoLayerRef.current) {
        tl.to(
          wordmarkVideoLayerRef.current,
          {
            opacity: 0,
            duration: 0.22,
            ease: "none",
          },
          splitStart,
        );
      }

      if (splitHeadingRef.current) {
        tl.fromTo(
          splitHeadingRef.current,
          {
            yPercent: headingLift,
            scale: headingScale,
            opacity: 0,
            filter: `blur(${headingBlur}px)`,
          },
          {
            yPercent: 0,
            scale: 1,
            opacity: 1,
            filter: "blur(0px)",
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
      ctx.revert();
    };
  }, [reduced]);

  /* ─── FULLSCREEN EASTER EGG OVERLAY ─── */
  useEffect(() => {
    const overlay = easterEggOverlayRef.current;
    const frame = easterEggFrameRef.current;
    const video = fullscreenVideoRef.current;
    if (!overlay || !frame || !video) return;

    if (isEasterEggOpen) {
      gsap.killTweensOf([overlay, frame, video]);
      gsap.set(overlay, {
        display: "flex",
        pointerEvents: "auto",
      });

      const tl = gsap.timeline();
      tl.fromTo(
        overlay,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.42, ease: "power2.out" },
      );
      tl.fromTo(
        frame,
        { y: 32, scale: 0.985, autoAlpha: 0 },
        { y: 0, scale: 1, autoAlpha: 1, duration: 0.7, ease: "power3.out" },
        0,
      );
      video.currentTime = 0;
      video.play().catch(() => {});
      return;
    }

    gsap.killTweensOf([overlay, frame, video]);
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(overlay, {
          display: "none",
          pointerEvents: "none",
        });
        video.currentTime = 0;
      },
    });
    tl.to(frame, {
      y: 18,
      scale: 0.992,
      autoAlpha: 0,
      duration: 0.26,
      ease: "power2.inOut",
    });
    tl.to(
      overlay,
      {
        autoAlpha: 0,
        duration: 0.24,
        ease: "power2.inOut",
      },
      0,
    );
    video.pause();
  }, [isEasterEggOpen]);

  useEffect(() => {
    if (!isEasterEggOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeEasterEgg();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closeEasterEgg, isEasterEggOpen]);

  /* ─── OUTLINED WORDMARK PERSISTENT PAINT REVEAL ─── */
  useEffect(() => {
    if (reduced || isLowPower) return;
    if (!window.matchMedia("(min-width: 768px) and (pointer: fine)").matches)
      return;
    const wordmark = wordmarkRef.current;
    const svg = wordmarkSvgRef.current;
    const paintPath = paintPathRef.current;
    if (!wordmark || !svg || !paintPath) return;

    const state = paintState.current;
    state.d = "";
    state.lastX = null;
    state.lastY = null;
    state.coverage = new Uint8Array(VIDEO_EASTER_EGG_BUCKETS);
    state.filledBuckets = 0;
    state.videoUnlocked = false;
    interactionHintDismissedRef.current = false;
    brushHintTextRef.current = "hero.brushHere";
    setShowBrushHereHint(true);
    setBrushHintText("hero.brushHere");
    wordmarkInteractiveRef.current = false;
    paintPath.setAttribute("d", "");
    if (wordmarkRef.current) {
      wordmarkRef.current.style.pointerEvents = "none";
    }
    if (wordmarkVideoLayerRef.current) {
      gsap.set(wordmarkVideoLayerRef.current, { opacity: 0 });
    }
    if (wordmarkVideoRef.current) {
      wordmarkVideoRef.current.pause();
      wordmarkVideoRef.current.currentTime = 0;
    }

    const unlockVideo = () => {
      if (state.videoUnlocked) return;
      state.videoUnlocked = true;
      const wordmarkVideo = wordmarkVideoRef.current;
      const fullscreenVideo = fullscreenVideoRef.current;
      if (wordmarkVideoLayerRef.current) {
        gsap
          .timeline()
          .to(wordmarkVideoLayerRef.current, {
            opacity: 0.84,
            duration: 0.32,
            ease: "power2.out",
            overwrite: true,
          })
          .to(wordmarkVideoLayerRef.current, {
            opacity: 0,
            duration: 0.4,
            ease: "power2.inOut",
          });
      }
      if (wordmarkVideoRef.current) {
        wordmarkVideo.currentTime = 0;
        wordmarkVideo.play().catch(() => {});
      }
      if (fullscreenVideo) {
        fullscreenVideo.currentTime = 0;
      }
      if (videoRevealTimeoutRef.current) {
        window.clearTimeout(videoRevealTimeoutRef.current);
      }
      videoRevealTimeoutRef.current = window.setTimeout(() => {
        setIsEasterEggOpen(true);
      }, 220);
    };

    const toSvgPoint = (event: PointerEvent) => {
      const point = svg.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      const matrix = svg.getScreenCTM();
      if (!matrix) return null;
      return point.matrixTransform(matrix.inverse());
    };

    const markCoverage = (x: number) => {
      const normalized = gsap.utils.clamp(0, 0.9999, x / WORDMARK_VIEWBOX.width);
      const bucketIndex = Math.floor(normalized * VIDEO_EASTER_EGG_BUCKETS);
      if (state.coverage[bucketIndex]) return;
      state.coverage[bucketIndex] = 1;
      state.filledBuckets += 1;
    };

    const paintTo = (x: number, y: number, start = false) => {
      if (!wordmarkInteractiveRef.current) return;
      if (start || state.lastX === null || state.lastY === null) {
        state.d += `${state.d ? " " : ""}M ${x.toFixed(2)} ${y.toFixed(2)} L ${x.toFixed(2)} ${y.toFixed(2)}`;
        markCoverage(x);
      } else {
        const dx = x - state.lastX;
        const dy = y - state.lastY;
        const distance = Math.hypot(dx, dy);
        const steps = Math.max(1, Math.ceil(distance / 12));
        let nextPath = state.d;
        for (let i = 1; i <= steps; i += 1) {
          const px = state.lastX + (dx * i) / steps;
          const py = state.lastY + (dy * i) / steps;
          nextPath += ` L ${px.toFixed(2)} ${py.toFixed(2)}`;
          markCoverage(px);
        }
        state.d = nextPath;
      }

      state.lastX = x;
      state.lastY = y;
      paintPath.setAttribute("d", state.d);

      const coverageRatio = state.filledBuckets / VIDEO_EASTER_EGG_BUCKETS;
      if (
        brushHintTextRef.current !== "hero.keepBrushing" &&
        coverageRatio >= INTERACTION_HINT_COPY_THRESHOLD
      ) {
        brushHintTextRef.current = "hero.keepBrushing";
        setBrushHintText("hero.keepBrushing");
      }
      if (!interactionHintDismissedRef.current && coverageRatio >= VIDEO_EASTER_EGG_THRESHOLD) {
        dismissInteractionHint();
      }
      if (!state.videoUnlocked && coverageRatio >= VIDEO_EASTER_EGG_THRESHOLD) {
        unlockVideo();
      }
    };

    const onPointerEnter = (event: PointerEvent) => {
      const point = toSvgPoint(event);
      if (!point) return;
      paintTo(point.x, point.y, true);
    };

    const onPointerMove = (event: PointerEvent) => {
      const point = toSvgPoint(event);
      if (!point) return;
      paintTo(point.x, point.y);
    };

    const onPointerLeave = () => {
      state.lastX = null;
      state.lastY = null;
    };

    wordmark.addEventListener("pointerenter", onPointerEnter);
    wordmark.addEventListener("pointermove", onPointerMove);
    wordmark.addEventListener("pointerleave", onPointerLeave);

    return () => {
      if (videoRevealTimeoutRef.current) {
        window.clearTimeout(videoRevealTimeoutRef.current);
        videoRevealTimeoutRef.current = null;
      }
      wordmark.removeEventListener("pointerenter", onPointerEnter);
      wordmark.removeEventListener("pointermove", onPointerMove);
      wordmark.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [dismissInteractionHint, reduced]);

  /* ─── CURSOR PARALLAX ─── */
  useEffect(() => {
    if (reduced || isLowPower) return;
    if (!bgRef.current) return;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const tick = () => {
      target.current.x += (mouse.current.x - target.current.x) * 0.08;
      target.current.y += (mouse.current.y - target.current.y) * 0.08;
      const tx = target.current.x;
      const ty = target.current.y;
      const w = window.innerWidth;
      const h = window.innerHeight;

      if (bgRef.current) {
        bgRef.current.style.transform = `translate3d(${tx * LAYERS.bg * w}px,${ty * LAYERS.bg * h}px,0)`;
      }
      if (lightRef.current) {
        lightRef.current.style.transform = `translate(-50%,-50%) translate3d(${tx * LAYERS.light * w}px,${ty * LAYERS.light * h}px,0)`;
      }
      if (chipsRef.current) {
        const children = gsap.utils.toArray<HTMLElement>("[data-hero-pill]", chipsRef.current);
        for (let i = 0; i < children.length; i++) {
          const el = children[i];
          const lag = 1 + i * 0.3;
          el.style.transform = `translate3d(${tx * LAYERS.chip * w * lag}px,${ty * LAYERS.chip * h * lag}px,0)`;
        }
      }

      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  /* ─── ENTRY ANIMATIONS ─── */
  useEffect(() => {
    if (reduced) {
      setIsHeroIntroReady(true);
      gsap.set(
        [headRef.current, subRef.current, ctaRef.current, trustedRef.current],
        { opacity: 1 },
      );
      if (dotRef.current) gsap.set(dotRef.current, { opacity: 1 });
      if (maskTextRef.current) gsap.set(maskTextRef.current, { opacity: 1 });
      wordmarkInteractiveRef.current = true;
      if (wordmarkRef.current) {
        wordmarkRef.current.style.pointerEvents = "auto";
      }
      if (heroContentRef.current)
        gsap.set(heroContentRef.current, { opacity: 1 });
      return;
    }

    if (!maskTextRef.current) return;

    setIsHeroIntroReady(false);

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
      tl.call(
        () => {
          wordmarkInteractiveRef.current = true;
          if (wordmarkRef.current) {
            wordmarkRef.current.style.pointerEvents = "auto";
          }
        },
        undefined,
        1.98,
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
      subRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
      "-=.3",
    );
    tl.fromTo(
      ctaRef.current,
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" },
      "-=.2",
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
        style={{ zIndex: 1 }}
        data-hero-zone
      >
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
          }}
        />

        {/* light band */}
        <div
          ref={lightRef}
          className="absolute pointer-events-none"
          data-hero-light
          style={{
            zIndex: 1,
            width: "130vmax",
            height: "40vmax",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            background:
              "linear-gradient(90deg,transparent 5%,rgba(var(--page-fg-rgb), .02) 35%,rgba(var(--page-fg-rgb), .04) 50%,rgba(var(--page-fg-rgb), .02) 65%,transparent 95%)",
            filter: "blur(60px)",
            mixBlendMode: "screen",
            willChange: "transform",
          }}
        />

        <div className="relative z-20 flex h-full flex-col px-5 pb-5 pt-[86px] sm:px-6 sm:pt-[92px] md:pb-6 md:pt-[98px]" data-hero-inner>
          <div
            ref={dotRef}
            className="absolute left-1/2 top-[74px] flex -translate-x-1/2 justify-center md:top-[86px]"
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
                          textShadow: "0 0 0 rgba(255,255,255,0)",
                        }}
                      >
                        {char === " " ? "\u00A0" : char}
                      </span>
                    ))}
                  </div>
                </div>

                <div
                  ref={wordmarkRef}
                  className="pointer-events-auto absolute left-1/2 top-[50.5%] flex w-[min(134vw,874px)] max-w-none -translate-x-1/2 -translate-y-1/2 items-center justify-center select-none sm:top-[51%] sm:w-[min(134vw,980px)] md:top-[54%] md:w-[min(132vw,1820px)] xl:w-[min(124vw,1880px)]"
                  style={{ zIndex: 20 }}
                >
                  <svg
                    ref={wordmarkSvgRef}
                    viewBox={`0 0 ${WORDMARK_VIEWBOX.width} ${WORDMARK_VIEWBOX.height}`}
                    className="block h-auto w-full overflow-visible"
                    aria-hidden="true"
                  >
                    <defs>
                      <mask id="hero-wordmark-paint-mask">
                        <rect
                          x="0"
                          y="0"
                          width={WORDMARK_VIEWBOX.width}
                          height={WORDMARK_VIEWBOX.height}
                          fill="black"
                        />
                        <path
                          ref={paintPathRef}
                          d=""
                          fill="none"
                          stroke="white"
                          strokeWidth="136"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </mask>
                      <clipPath id="hero-wordmark-text-clip">
                        <text
                          x="50%"
                          y="57%"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontFamily="Inter, sans-serif"
                          fontSize="402"
                          fontWeight="900"
                          letterSpacing="-34"
                        >
                          DYSIGNS
                        </text>
                      </clipPath>
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

                    <g
                      ref={wordmarkVideoLayerRef}
                      style={{ opacity: 0, pointerEvents: "none" }}
                    >
                      <foreignObject
                        x="0"
                        y="0"
                        width={WORDMARK_VIEWBOX.width}
                        height={WORDMARK_VIEWBOX.height}
                        clipPath="url(#hero-wordmark-text-clip)"
                        mask="url(#hero-wordmark-paint-mask)"
                      >
                        <div
                          xmlns="http://www.w3.org/1999/xhtml"
                          style={{
                            width: "100%",
                            height: "100%",
                            overflow: "hidden",
                          }}
                        >
                          <video
                            ref={wordmarkVideoRef}
                            src="/images/dysigns_reveal.mp4"
                            muted
                            loop
                            playsInline
                            preload="metadata"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              filter:
                                "saturate(1.05) contrast(1.08) brightness(.78)",
                            }}
                          />
                        </div>
                      </foreignObject>
                    </g>

                    <motion.g ref={splitLeftRef} clipPath="url(#hero-wordmark-left-clip)" style={{ x: leftX }}>
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
                        mask="url(#hero-wordmark-paint-mask)"
                      >
                        DYSIGNS
                      </text>
                    </motion.g>

                    <motion.g ref={splitRightRef} clipPath="url(#hero-wordmark-right-clip)" style={{ x: rightX }}>
                      <text
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
                        mask="url(#hero-wordmark-paint-mask)"
                      >
                        DYSIGNS
                      </text>
                    </motion.g>
                  </svg>
                </div>

                <AnimatePresence>
                  {showBrushHereHint ? (
                    <motion.div
                      key="brush-here-hint"
                      className="pointer-events-none fixed left-1/2 top-[76px] z-[28] hidden -translate-x-1/2 md:block"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      aria-hidden="true"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <div
                          style={{
                            padding: "6px 14px",
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "'Inter',sans-serif",
                              fontSize: "11px",
                              fontWeight: 600,
                              letterSpacing: ".18em",
                              textTransform: "uppercase",
                              color: "rgba(255,255,255,.5)",
                              whiteSpace: "nowrap",
                              textShadow:
                                "0 0 10px rgba(255,255,255,.16), 0 0 18px rgba(255,255,255,.08)",
                            }}
                          >
                            {t(brushHintText)}
                          </span>
                        </div>

                        <span
                          style={{
                            fontSize: "12px",
                            lineHeight: 1,
                            color: "rgba(255,255,255,.42)",
                            animation: "heroBrushHintChevron 1.2s ease-in-out infinite",
                          }}
                        >
                          ↓
                        </span>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>

            <div
              ref={chipsRef}
              className="pointer-events-none absolute inset-0"
              style={{ zIndex: 38 }}
            >
              <TransitionLink
                to="/services/ux-ui-web-design"
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
                to="/services/brand-identity"
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
                to="/services/ux-ui-web-design"
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
                to="/services/product-design"
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
                to="/services/creative-thinking"
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
              <div className="mx-auto max-w-4xl text-center">
                <h1
                  ref={headRef}
                  style={{
                    fontFamily: "'Inter',sans-serif",
                    fontSize: "clamp(1.55rem,4vw,3.3rem)",
                    fontWeight: 700,
                    lineHeight: 1.08,
                    letterSpacing: "-.04em",
                    color: "var(--page-fg)",
                    opacity: 0,
                  }}
                >
                  {t("hero.headline.A")}
                </h1>
                <p
                  ref={subRef}
                  className="mx-auto mt-1 max-w-xl md:mt-3"
                  style={{
                    fontFamily: "'Instrument Serif',serif",
                    fontSize: "clamp(.95rem,1.25vw,1.15rem)",
                    fontStyle: "italic",
                    color: "rgba(var(--page-fg-rgb), .6)",
                    letterSpacing: ".01em",
                    lineHeight: 1.6,
                    opacity: 0,
                  }}
                >
                  {t("hero.sub")}
                </p>
                <div
                  ref={ctaRef}
                  className="mt-3 flex flex-wrap items-center justify-center gap-3 md:mt-6 md:gap-4"
                  style={{ opacity: 0 }}
                >
                  <a
                    href="/work"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateTo("/work");
                    }}
                    className="group relative overflow-hidden rounded-full px-7 py-3"
                    style={{
                      fontSize: ".75rem",
                      fontWeight: 600,
                      letterSpacing: ".06em",
                      textTransform: "uppercase",
                      color: "var(--page-fg)",
                      border: "1px solid rgba(var(--page-fg-rgb), .2)",
                    }}
                    onMouseEnter={() => cursor.set("link", t("cursor.viewWork"))}
                    onMouseLeave={() => cursor.reset()}
                  >
                    <span
                      className="absolute inset-0 -translate-x-full group-hover:translate-x-full"
                      style={{
                        background:
                          "linear-gradient(90deg,transparent,rgba(var(--page-fg-rgb), .1),transparent)",
                        transition: "transform .7s ease-out",
                      }}
                    />
                    {t("hero.cta1")}
                  </a>
                  <a
                    href="/contact"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateTo("/contact");
                    }}
                    className="rounded-full px-7 py-3"
                    style={{
                      fontSize: ".75rem",
                      fontWeight: 500,
                      letterSpacing: ".06em",
                      textTransform: "uppercase",
                      color: "rgba(var(--page-fg-rgb), .6)",
                      transition: "color .3s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "var(--page-fg)";
                      cursor.set("link", t("cursor.contact"));
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color =
                        "rgba(var(--page-fg-rgb), .6)";
                      cursor.reset();
                    }}
                  >
                    {t("hero.cta2")}
                  </a>
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

      <div
        ref={easterEggOverlayRef}
        className="fixed inset-0 hidden items-center justify-center"
        style={{
          zIndex: 120,
          opacity: 0,
          pointerEvents: "none",
          background: "rgba(0, 0, 0, .92)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
        }}
        onClick={closeEasterEgg}
        aria-hidden={!isEasterEggOpen}
      >
        <button
          type="button"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full px-5 py-3 text-[.68rem] font-medium uppercase tracking-[0.18em] text-white transition-colors hover:text-white md:bottom-8"
          style={{
            zIndex: 6,
            minWidth: 144,
            textAlign: "center",
            background: "rgba(0,0,0,.56)",
            border: "1px solid rgba(255,255,255,.22)",
            boxShadow: "0 16px 36px rgba(0,0,0,.26)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
          }}
          onClick={(event) => {
            event.stopPropagation();
            closeEasterEgg();
          }}
        >
          Close
        </button>
        <div
          ref={easterEggFrameRef}
          className="relative h-full w-full overflow-hidden"
          style={{
            opacity: 0,
            background: "rgba(255,255,255,.03)",
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              zIndex: 1,
              background:
                "linear-gradient(to bottom, rgba(0,0,0,.35), rgba(0,0,0,.08) 26%, rgba(0,0,0,.18) 100%)",
            }}
          />
          <video
            ref={fullscreenVideoRef}
            src="/images/dysigns_reveal.mp4"
            muted
            playsInline
            preload="metadata"
            className="block h-full w-full object-cover"
            onEnded={closeEasterEgg}
          />
        </div>
      </div>

      {/* Keyframes + mobile overrides */}
      <style>{`
        @keyframes availDotPulse {
          0%, 100% {
            box-shadow: 0 0 6px rgba(74,222,128,.6), 0 0 14px rgba(74,222,128,.3), 0 0 28px rgba(74,222,128,.12);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 10px rgba(74,222,128,.8), 0 0 22px rgba(74,222,128,.4), 0 0 40px rgba(74,222,128,.18);
            transform: scale(1.15);
          }
        }
        @keyframes uxPillPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(var(--page-fg-rgb), .15), 0 0 8px rgba(var(--page-fg-rgb), .08);
            border-color: rgba(var(--page-fg-rgb), .15);
          }
          50% {
            box-shadow: 0 0 12px 4px rgba(var(--page-fg-rgb), .12), 0 0 24px rgba(var(--page-fg-rgb), .06);
            border-color: rgba(var(--page-fg-rgb), .25);
          }
        }

        /* ─── MOBILE HERO (below md = 768px) ─── */
        @media (max-width: 767px) {
          /* DYSIGNS: solid-filled white (removes paint-reveal mask which starts fully black) */
          [data-hero-zone] text[mask] {
            mask: none !important;
          }
          /* Ensure "Trusted by" clears the iOS home indicator on all iPhone heights.
             mt-auto on the trusted row handles vertical docking; this just adds
             safe-area clearance with a 1.5rem fallback. */
          [data-hero-inner] {
            padding-bottom: max(1.5rem, env(safe-area-inset-bottom)) !important;
          }
        }
      `}</style>
    </section>
  );
}
