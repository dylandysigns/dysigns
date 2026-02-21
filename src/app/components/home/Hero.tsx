import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCursor } from "../../hooks/useCursor";
import { usePageTransition } from "../../hooks/useTransition";
import { isLowPower } from "../Layout";
import { useLanguage } from "../../hooks/useLanguage";

gsap.registerPlugin(ScrollTrigger);

/* ─── PARALLAX STRENGTH ─── */
const LAYERS = {
  bg: 0.008,
  media: 0.012,
  light: 0.025,
  chip: 0.018,
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
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);

  /* Masked text refs */
  const maskAreaRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const maskTextRef = useRef<HTMLDivElement>(null);

  /* Color bloom ref — radial gradient that follows cursor */
  const bloomRef = useRef<HTMLDivElement>(null);

  const cursor = useCursor();
  const { navigateTo } = usePageTransition();
  const { t } = useLanguage();
  const mouse = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ─── LIGHT BAND DRIFT ─── */
  useEffect(() => {
    if (reduced || isLowPower) return;
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

  /* ─── CURSOR-INTERACTIVE COLOR BLOOM ─── */
  useEffect(() => {
    if (reduced || isLowPower) return;
    const bloom = bloomRef.current;
    const maskArea = maskAreaRef.current;
    if (!bloom || !maskArea) return;

    let raf = 0;
    const tick = () => {
      const m = (window as unknown as Record<string, { x: number; y: number }>)
        .__dysignsMouse;
      if (m) {
        const rect = maskArea.getBoundingClientRect();
        const relX = m.x - rect.left;
        const relY = m.y - rect.top;
        bloom.style.background = `
          radial-gradient(
            400px circle at ${relX}px ${relY}px,
            rgba(160,100,255,.18) 0%,
            rgba(255,100,200,.12) 20%,
            rgba(100,180,255,.08) 40%,
            transparent 70%
          )
        `;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  /* ─── MEDIA DRIFT INSIDE MASKED TEXT ─── */
  useEffect(() => {
    if (reduced || isLowPower) return;
    const el = mediaRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.to(el, {
        scale: 1.08,
        x: "3%",
        yoyo: true,
        repeat: -1,
        duration: 14,
        ease: "sine.inOut",
      });
      gsap.to(el, {
        y: "2%",
        yoyo: true,
        repeat: -1,
        duration: 10,
        ease: "sine.inOut",
      });
    });
    return () => ctx.revert();
  }, [reduced]);

  /* ─── CURSOR PARALLAX ─── */
  useEffect(() => {
    if (reduced || isLowPower) return;
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
      /* Media inside masked text — gentle cursor drift */
      if (mediaRef.current) {
        mediaRef.current.style.transform = `translate3d(${tx * LAYERS.media * w}px,${ty * LAYERS.media * h}px,0) scale(1.04)`;
      }
      if (lightRef.current) {
        lightRef.current.style.transform = `translate(-50%,-50%) translate3d(${tx * LAYERS.light * w}px,${ty * LAYERS.light * h}px,0)`;
      }
      if (chipsRef.current) {
        const children = chipsRef.current.children;
        for (let i = 0; i < children.length; i++) {
          const el = children[i] as HTMLElement;
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

  /* ─── SCROLL: gentle scale on scroll ─── */
  useEffect(() => {
    if (reduced || isLowPower) return;
    if (!sectionRef.current || !maskAreaRef.current || !maskTextRef.current)
      return;

    const ctx = gsap.context(() => {
      gsap.to(maskTextRef.current, {
        scale: 1.06,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
          refreshPriority: 2,
          onEnter: () => {
            if (maskTextRef.current) {
              maskTextRef.current.style.visibility = "visible";
            }
          },
          onEnterBack: () => {
            if (maskTextRef.current) {
              maskTextRef.current.style.visibility = "visible";
            }
          },
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reduced]);

  /* ─── ENTRY ANIMATIONS ─── */
  useEffect(() => {
    if (reduced) {
      gsap.set(
        [headRef.current, subRef.current, ctaRef.current, scrollRef.current],
        { opacity: 1 },
      );
      if (dotRef.current) gsap.set(dotRef.current, { opacity: 1 });
      if (maskTextRef.current) gsap.set(maskTextRef.current, { opacity: 1 });
      if (heroContentRef.current)
        gsap.set(heroContentRef.current, { opacity: 1 });
      return;
    }

    const tl = gsap.timeline({ delay: 2 });

    /* Masked text reveal — scale from 1.2 down + fade in */
    if (maskTextRef.current) {
      tl.fromTo(
        maskTextRef.current,
        { scale: 1.2, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.6, ease: "power2.out" },
        0,
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

    if (chipsRef.current) {
      tl.fromTo(
        chipsRef.current.children,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power3.out" },
        "-=.4",
      );
    }

    tl.fromTo(
      scrollRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.4 },
      "-=.1",
    );

    return () => {
      tl.kill();
    };
  }, [reduced]);

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ background: "#000", minHeight: "140vh" }}
    >
      {/* ═══════════════════════════════════════════════════════
          MASKED HEADER TEXT — "text as window" effect
          The text is mostly white. A cursor-following radial
          color bloom adds subtle chromatic accents near the mouse.
         ═══════════════════════════════════════════════════════ */}
      <div
        ref={maskAreaRef}
        className="sticky top-0 h-screen flex items-center justify-center overflow-hidden"
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
            background: "#000",
          }}
        />

        {/* light band */}
        <div
          ref={lightRef}
          className="absolute pointer-events-none"
          style={{
            zIndex: 1,
            width: "130vmax",
            height: "40vmax",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            background:
              "linear-gradient(90deg,transparent 5%,rgba(255,255,255,.02) 35%,rgba(255,255,255,.04) 50%,rgba(255,255,255,.02) 65%,transparent 95%)",
            filter: "blur(60px)",
            mixBlendMode: "screen",
            willChange: "transform",
          }}
        />

        {/* ─── AVAILABLE BADGE — centered top ─── */}
        <div
          ref={dotRef}
          className="absolute"
          style={{
            top: "clamp(76px, 11vh, 112px)",
            left: 0,
            right: 0,
            width: "fit-content",
            margin: "0 auto",
            zIndex: 30,
            opacity: 0,
          }}
          role="status"
          aria-label="Available for projects"
        >
          <div
            className="flex items-center gap-2 rounded-full"
            style={{
              padding: "6px 14px 6px 10px",
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(255,255,255,.07)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            {/* Green glowing dot */}
            <span
              className="relative flex-shrink-0"
              style={{ width: 8, height: 8 }}
            >
              <span
                className="absolute inset-0 rounded-full"
                style={{
                  background: "#4ade80",
                  boxShadow:
                    "0 0 6px rgba(74,222,128,.6), 0 0 14px rgba(74,222,128,.3), 0 0 28px rgba(74,222,128,.12)",
                  animation: "availDotPulse 3.2s ease-in-out infinite",
                }}
              />
            </span>
            {/* Label */}
            <span
              style={{
                fontSize: ".58rem",
                fontWeight: 500,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,.45)",
                whiteSpace: "nowrap",
                fontFamily: "'Inter',sans-serif",
              }}
            >
              {t("hero.available")}
            </span>
          </div>
        </div>

        {/* ─── TEXT-AS-WINDOW COMPOSITE ─── */}
        <div
          ref={maskTextRef}
          className="relative w-full h-full flex items-center justify-center"
          style={{
            zIndex: 4,
            isolation: "isolate",
            opacity: 0,
          }}
        >
          {/* Layer 1: Subtle base gradient behind text — mostly dark with faint color */}
          <div
            ref={mediaRef}
            className="absolute inset-[-15%] pointer-events-none"
            style={{
              willChange: "transform",
            }}
          >
            <div
              className="w-full h-full"
              style={{
                background: reduced
                  ? "#fff"
                  : "linear-gradient(135deg, #fff 0%, #e8e0ff 20%, #fff 40%, #ffe0f0 60%, #fff 80%, #e0f0ff 100%)",
                backgroundSize: "300% 300%",
                animation: reduced ? "none" : "heroSubtleFlow 18s ease infinite",
              }}
            />
          </div>

          {/* Layer 1b: Cursor-following color bloom — adds localized color near mouse */}
          <div
            ref={bloomRef}
            className="absolute inset-0 pointer-events-none"
            style={{
              zIndex: 1,
              mixBlendMode: "normal",
            }}
          />

          {/* Layer 2: Black mask with white text — multiply blend reveals gradient through text */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
            style={{
              background: "#000",
              mixBlendMode: "multiply",
            }}
          >
            <span
              data-dysigns-hero-text
              aria-hidden="true"
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: "clamp(5rem, 20vw, 18rem)",
                fontWeight: 900,
                letterSpacing: "-.06em",
                lineHeight: 1,
                color: "#fff",
                userSelect: "none",
                whiteSpace: "nowrap",
              }}
            >
              DYSIGNS
            </span>
          </div>

          {/* Layer 3: Subtle edge glow on the text */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
            style={{ zIndex: 2 }}
          >
            <span
              aria-hidden="true"
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: "clamp(5rem, 20vw, 18rem)",
                fontWeight: 900,
                letterSpacing: "-.06em",
                lineHeight: 1,
                color: "transparent",
                WebkitTextStroke: "1px rgba(255,255,255,.08)",
                userSelect: "none",
                whiteSpace: "nowrap",
              }}
            >
              DYSIGNS
            </span>
          </div>
        </div>

        {/* floating UI chips */}
        <div
          ref={chipsRef}
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 8 }}
        >
          {/* UX / UI — centered under Available badge */}
          <div
            className="absolute top-[14%] right-[5%] md:top-[18%] md:right-auto md:left-1/2 md:-translate-x-1/2"
            style={{
              background: "rgba(255,255,255,.08)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,.12)",
              borderRadius: 8,
              padding: "10px 16px",
              opacity: 0,
              animation: "uxPillPulse 3s ease-in-out infinite",
            }}
          >
            <span
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: ".65rem",
                fontWeight: 600,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,.85)",
              }}
            >
              UX / UI
            </span>
          </div>
          {/* Brand Identity */}
          <div
            className="absolute top-[24%] left-[5%] md:top-auto md:bottom-[28%] md:left-[8%]"
            style={{
              background: "rgba(255,255,255,.05)",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: 20,
              padding: "6px 14px",
              opacity: 0,
            }}
          >
            <span
              style={{
                fontSize: ".7rem",
                fontWeight: 500,
                color: "rgba(255,255,255,.55)",
                letterSpacing: ".06em",
              }}
            >
              Brand Identity
            </span>
          </div>
          {/* Web Design */}
          <div
            className="absolute top-[8%] left-[22%] md:top-[65%] md:left-auto md:right-[15%]"
            style={{
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(255,255,255,.06)",
              borderRadius: 20,
              padding: "6px 14px",
              opacity: 0,
            }}
          >
            <span
              style={{
                fontSize: ".7rem",
                fontWeight: 500,
                color: "rgba(255,255,255,.55)",
                letterSpacing: ".06em",
              }}
            >
              Web Design
            </span>
          </div>
          {/* Building Products */}
          <div
            className="absolute top-[32%] right-[8%] md:top-[35%] md:right-auto md:left-[6%]"
            style={{
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(255,255,255,.06)",
              borderRadius: 20,
              padding: "6px 14px",
              opacity: 0,
            }}
          >
            <span
              style={{
                fontSize: ".7rem",
                fontWeight: 500,
                color: "rgba(255,255,255,.55)",
                letterSpacing: ".06em",
              }}
            >
              Building Products
            </span>
          </div>
          {/* Strategy — top right, where UX/UI used to be */}
          <div
            className="absolute top-[19%] left-[40%] md:top-[22%] md:left-auto md:right-[12%]"
            style={{
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(255,255,255,.06)",
              borderRadius: 20,
              padding: "6px 14px",
              opacity: 0,
            }}
          >
            <span
              style={{
                fontSize: ".7rem",
                fontWeight: 500,
                color: "rgba(255,255,255,.55)",
                letterSpacing: ".06em",
              }}
            >
              Strategy
            </span>
          </div>
        </div>

        {/* ─── HERO CONTENT (headline, sub, CTA) ─── */}
        <div
          ref={heroContentRef}
          className="absolute inset-0 flex items-end justify-center pb-[18vh]"
          style={{ zIndex: 10 }}
        >
          <div className="text-center px-6 max-w-4xl mx-auto">
            <h1
              ref={headRef}
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: "clamp(1.6rem,4.5vw,3.5rem)",
                fontWeight: 700,
                lineHeight: 1.08,
                letterSpacing: "-.04em",
                color: "#fff",
                opacity: 0,
              }}
            >
              {t("hero.headline.A")}
            </h1>
            <p
              ref={subRef}
              className="mt-5 mx-auto max-w-lg"
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: "clamp(.95rem,1.3vw,1.15rem)",
                fontStyle: "italic",
                color: "rgba(255,255,255,.6)",
                letterSpacing: ".01em",
                lineHeight: 1.6,
                opacity: 0,
              }}
            >
              {t("hero.sub")}
            </p>
            <div
              ref={ctaRef}
              className="mt-8 flex flex-wrap items-center justify-center gap-4"
              style={{ opacity: 0 }}
            >
              <a
                href="/work"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo("/work");
                }}
                className="relative overflow-hidden px-7 py-3 rounded-full border border-white/20 group"
                style={{
                  fontSize: ".75rem",
                  fontWeight: 600,
                  letterSpacing: ".06em",
                  textTransform: "uppercase",
                  color: "#fff",
                }}
                onMouseEnter={() => cursor.set("link", t("cursor.viewWork"))}
                onMouseLeave={() => cursor.reset()}
              >
                <span
                  className="absolute inset-0 -translate-x-full group-hover:translate-x-full"
                  style={{
                    background:
                      "linear-gradient(90deg,transparent,rgba(255,255,255,.1),transparent)",
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
                className="px-7 py-3 rounded-full"
                style={{
                  fontSize: ".75rem",
                  fontWeight: 500,
                  letterSpacing: ".06em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,.6)",
                  transition: "color .3s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "#fff";
                  cursor.set("link", t("cursor.contact"));
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color =
                    "rgba(255,255,255,.6)";
                  cursor.reset();
                }}
              >
                {t("hero.cta2")}
              </a>
            </div>
          </div>
        </div>

        {/* scroll hint */}
        <div
          ref={scrollRef}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
          style={{ zIndex: 15, opacity: 0 }}
        >
          <span
            style={{
              fontSize: ".6rem",
              fontWeight: 500,
              letterSpacing: ".2em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,.6)",
            }}
          >
            {t("hero.scroll")}
          </span>
          <div
            className="flex flex-col items-center gap-1"
            style={{ animation: "scrollPulse 2.4s ease-in-out infinite" }}
          >
            <svg
              width="14"
              height="8"
              viewBox="0 0 14 8"
              fill="none"
              style={{ opacity: 0.5 }}
            >
              <path
                d="M1 1L7 6L13 1"
                stroke="rgba(255,255,255,.6)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <svg
              width="14"
              height="8"
              viewBox="0 0 14 8"
              fill="none"
              style={{ opacity: 0.25 }}
            >
              <path
                d="M1 1L7 6L13 1"
                stroke="rgba(255,255,255,.4)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div
            className="w-px"
            style={{
              height: 28,
              background:
                "linear-gradient(to bottom, rgba(255,255,255,.35), transparent)",
              animation: "scrollLineGrow 2.4s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      {/* ─── GRADIENT FADE BRIDGE ─── into next section */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          zIndex: 2,
          bottom: 0,
          height: "50vh",
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,.5) 8%, rgba(0,0,0,.85) 16%, #000 25%, #000 100%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ zIndex: 3, height: "25vh", background: "#000" }}
      />

      {/* Keyframes */}
      <style>{`
        @keyframes scrollPulse {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(4px); opacity: 0.6; }
        }
        @keyframes scrollLineGrow {
          0%, 100% { opacity: 0.6; transform: scaleY(1); }
          50% { opacity: 0.3; transform: scaleY(0.6); }
        }
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
        @keyframes heroSubtleFlow {
          0% { background-position: 0% 50%; }
          33% { background-position: 100% 0%; }
          66% { background-position: 50% 100%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes uxPillPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(255,255,255,.15), 0 0 8px rgba(255,255,255,.08);
            border-color: rgba(255,255,255,.15);
          }
          50% {
            box-shadow: 0 0 12px 4px rgba(255,255,255,.12), 0 0 24px rgba(255,255,255,.06);
            border-color: rgba(255,255,255,.25);
          }
        }
      `}</style>
    </section>
  );
}