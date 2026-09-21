import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import logoImg from "../../assets/dysigns_white.png";

const SESSION_KEY = "dysigns_splash_done";

// Must mirror the hero wordmark SVG (Hero.tsx) exactly so the splash text
// can zoom into it and land pixel-for-pixel on top of it.
const WORDMARK = { width: 2440, height: 520 };
const LETTERS = "DYSIGNS".split("");

// Screen-space box of the drawn glyph run (first to last letter) of an SVG
// <text>. Landing on this, instead of the <svg> box, keeps the hand-off exact
// whatever scale the browser lays the text out at.
function glyphRun(text: SVGTextElement) {
  const first = text.getExtentOfChar(0);
  const last = text.getExtentOfChar(text.getNumberOfChars() - 1);
  const m = text.getScreenCTM();
  if (!m) return null;
  const left = first.x * m.a + m.e;
  const right = (last.x + last.width) * m.a + m.e;
  const top = first.y * m.d + m.f;
  const bottom = (first.y + first.height) * m.d + m.f;
  return {
    cx: (left + right) / 2,
    cy: (top + bottom) / 2,
    w: right - left,
  };
}

// Effective opacity of an element, including its ancestors' opacity.
function effectiveOpacity(node: Element | null) {
  let o = 1;
  for (let n = node; n && n !== document.body; n = n.parentElement) {
    o *= parseFloat(getComputedStyle(n).opacity || "1");
  }
  return o;
}

export function SplashIntro({ onDone }: { onDone: () => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const wordmarkRef = useRef<SVGSVGElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const caretRef = useRef<SVGRectElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const finished = useRef(false);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {}
    onDone();
  }, [onDone]);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY)) {
        finish();
        return;
      }
    } catch {}

    const el = wrapRef.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      gsap.to(el, { opacity: 0, duration: 0.3, delay: 0.2, onComplete: finish });
      return;
    }

    const letters = Array.from(
      textRef.current?.querySelectorAll<SVGTSpanElement>("tspan") ?? [],
    );
    const caret = caretRef.current;
    const svg = wordmarkRef.current;
    let exitTl: gsap.core.Timeline | null = null;
    let raf = 0;
    let fadeTween: gsap.core.Tween | null = null;

    const placeCaret = (i: number, animate = true) => {
      const text = textRef.current;
      if (!caret || !text) return;
      try {
        const x =
          i < 0
            ? text.getStartPositionOfChar(0).x - 26
            : text.getEndPositionOfChar(i).x + 10;
        if (animate) {
          gsap.to(caret, { attr: { x }, duration: 0.09, ease: "power2.out", overwrite: true });
        } else {
          caret.setAttribute("x", String(x));
        }
      } catch {}
    };

    // Zoom the typed wordmark onto the hero's DYSIGNS, then reveal the page.
    // Falls back to a slide-up when there is no hero on this route.
    const exit = () => {
      const target = document.querySelector<SVGSVGElement>(
        "[data-hero-wordmark-svg]",
      );
      const heroText = target?.querySelector<SVGTextElement>(
        "text:not([data-dysigns-hero-text])",
      );
      const text = textRef.current;
      const from = text ? glyphRun(text) : null;
      if (!svg || !target || !heroText || !from) {
        exitTl = gsap.timeline({ onComplete: finish });
        exitTl.to(lineRef.current, { opacity: 0, duration: 0.2 }, 0);
        exitTl.to(el, { yPercent: -100, duration: 0.85, ease: "power4.inOut" }, 0.1);
        return;
      }

      const box = svg.getBoundingClientRect();
      const origin = { x: box.left + box.width / 2, y: box.top + box.height / 2 };
      const state = { p: 0 };
      exitTl = gsap.timeline();

      exitTl.to(
        [lineRef.current, metaRef.current, logoRef.current],
        { opacity: 0, y: 8, duration: 0.3, ease: "power2.in" },
        0,
      );
      // The page emerges from under the splash while the word is still
      // zooming, so the typed text visibly slots into the hero wordmark.
      exitTl.to(
        [bgRef.current, glowRef.current],
        { opacity: 0, duration: 0.6, ease: "power2.inOut" },
        0.5,
      );
      exitTl.to(
        state,
        {
          p: 1,
          duration: 1.1,
          ease: "power4.inOut",
          onUpdate: () => {
            // Re-measure every frame so we land on the hero wordmark even
            // if it is still settling or the viewport resizes.
            const to = glyphRun(heroText);
            if (!to) return;
            const full = to.w / from.w;
            const k = Math.pow(full, state.p);
            const cx = from.cx + (to.cx - from.cx) * state.p;
            const cy = from.cy + (to.cy - from.cy) * state.p;
            gsap.set(svg, {
              x: cx - (origin.x + k * (from.cx - origin.x)),
              y: cy - (origin.y + k * (from.cy - origin.y)),
              scale: k,
              transformOrigin: "50% 50%",
            });
          },
          onComplete: () => {
            // Wait (max ~1s) until the hero wordmark is fully opaque so the
            // hand-off never flashes an empty frame.
            const started = performance.now();
            const settle = () => {
              if (
                effectiveOpacity(target) >= 0.98 ||
                performance.now() - started > 1000
              ) {
                fadeTween = gsap.to(el, {
                  opacity: 0,
                  duration: 0.3,
                  ease: "power1.out",
                  onComplete: finish,
                });
                return;
              }
              raf = requestAnimationFrame(settle);
            };
            settle();
          },
        },
        0.05,
      );
    };

    let tl: gsap.core.Timeline | null = null;
    let cancelled = false;

    const start = () => {
      const t = gsap.timeline();
      tl = t;

      const typedAt = 0.25 + (letters.length - 1) * 0.11;
      const exitAt = typedAt + 0.65;

      placeCaret(-1, false);
      t.fromTo(glowRef.current, { opacity: 0 }, { opacity: 1, duration: 1.4, ease: "power2.out" }, 0);
      t.fromTo(caret, { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0);
      t.fromTo(
        logoRef.current,
        { opacity: 0, scale: 0.7, filter: "blur(12px)" },
        { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.8, ease: "power3.out" },
        0,
      );
      t.fromTo(metaRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.1);

      // Progress hairline + counter, finishing exactly when the zoom starts.
      const prog = { v: 0 };
      t.to(
        prog,
        {
          v: 1,
          duration: exitAt,
          ease: "power2.inOut",
          onUpdate: () => {
            if (barRef.current) barRef.current.style.transform = `scaleX(${prog.v})`;
            if (countRef.current)
              countRef.current.textContent = String(Math.round(prog.v * 100)).padStart(3, "0");
          },
        },
        0,
      );

      // Typewriter: letters ease in one by one, caret glides along.
      letters.forEach((letter, i) => {
        const at = 0.25 + i * 0.11;
        t.to(letter, { fillOpacity: 1, duration: 0.2, ease: "power1.out" }, at);
        t.call(() => placeCaret(i), [], at);
      });

      t.to(caret, { opacity: 0, duration: 0.2 }, typedAt + 0.25);
      t.fromTo(
        lineRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" },
        typedAt + 0.1,
      );

      t.call(exit, [], exitAt);
    };

    // The hero wordmark renders in Inter 900. If the splash types in a
    // fallback font the glyph run is wider and visibly jumps on hand-off,
    // so wait for the font (capped) before typing.
    Promise.race([
      document.fonts.load("900 402px Inter"),
      new Promise((r) => setTimeout(r, 1200)),
    ])
      .catch(() => {})
      .then(() => {
        if (!cancelled) start();
      });

    return () => {
      cancelled = true;
      tl?.kill();
      exitTl?.kill();
      fadeTween?.kill();
      if (caretRef.current) gsap.killTweensOf(caretRef.current);
      cancelAnimationFrame(raf);
    };
  }, [finish]);

  return (
    <div
      ref={wrapRef}
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{ zIndex: 20000 }}
      onClick={finish}
    >
      <div
        ref={bgRef}
        className="absolute inset-0 pointer-events-none"
        style={{ background: "var(--page-bg)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: "var(--page-noise-opacity)",
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div
        ref={glowRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0,
          background:
            "radial-gradient(ellipse 55% 38% at 50% 50%, rgba(var(--page-fg-rgb), .075), transparent 70%)",
        }}
      />

      <div className="relative">
        <div
          ref={logoRef}
          className="absolute left-0 right-0 flex justify-center"
          style={{ bottom: "100%", marginBottom: "clamp(20px, 4vw, 36px)", opacity: 0 }}
        >
          <img
            src={logoImg}
            alt=""
            aria-hidden="true"
            className="theme-logo"
            style={{ height: "clamp(30px, 4.6vw, 46px)", width: "auto" }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>

        <svg
          ref={wordmarkRef}
          viewBox={`0 0 ${WORDMARK.width} ${WORDMARK.height}`}
          role="img"
          aria-label="DYSIGNS, digital design agency Almere Netherlands"
          className="block h-auto overflow-visible"
          style={{ width: "min(86vw, 1200px)", willChange: "transform" }}
        >
          <text
            ref={textRef}
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
            {LETTERS.map((char, i) => (
              <tspan key={i} fillOpacity={0}>
                {char}
              </tspan>
            ))}
          </text>
          <rect
            ref={caretRef}
            x="0"
            y="114"
            width="16"
            height="292"
            fill="var(--page-fg)"
            opacity="0"
          />
        </svg>

        <div
          ref={lineRef}
          className="absolute left-0 right-0 flex justify-center"
          style={{ top: "100%", marginTop: 12, opacity: 0 }}
        >
          <span
            style={{
              fontFamily: "'Instrument Serif',serif",
              fontSize: "clamp(.85rem,1.3vw,1.05rem)",
              fontStyle: "italic",
              color: "rgba(var(--page-fg-rgb), .4)",
              letterSpacing: ".01em",
            }}
          >
            We make it. You profit.
          </span>
        </div>
      </div>

      <div
        ref={metaRef}
        className="absolute bottom-8 left-8 flex flex-col gap-2"
        style={{ width: 150, opacity: 0, color: "rgba(var(--page-fg-rgb), .55)" }}
      >
        <div
          className="flex justify-between"
          style={{ fontSize: ".55rem", fontWeight: 500, letterSpacing: ".12em", textTransform: "uppercase" }}
        >
          <span>Almere, NL</span>
          <span ref={countRef}>000</span>
        </div>
        <div style={{ height: 1, background: "rgba(var(--page-fg-rgb), .15)", overflow: "hidden" }}>
          <div
            ref={barRef}
            style={{
              height: "100%",
              background: "rgba(var(--page-fg-rgb), .7)",
              transform: "scaleX(0)",
              transformOrigin: "left",
            }}
          />
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          finish();
        }}
        className="absolute bottom-8 right-8 px-3 py-1 rounded"
        style={{
          fontSize: ".55rem",
          fontWeight: 500,
          letterSpacing: ".12em",
          textTransform: "uppercase",
          color: "rgba(var(--page-fg-rgb), .55)",
        }}
        aria-label="Skip intro"
      >
        Skip
      </button>
    </div>
  );
}
