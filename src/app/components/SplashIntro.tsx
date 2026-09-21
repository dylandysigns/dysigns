import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import logoImg from "../../assets/dysigns_white.png";

const SESSION_KEY = "dysigns_splash_done";

// Width of the soft leading edge of the fill, in % of the logo width.
const EDGE = 8;

export function SplashIntro({ onDone }: { onDone: () => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
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

    // Left-to-right fill: a mask on the white logo layer whose soft edge
    // travels from fully off-screen left to fully past the right edge.
    const setFill = (p: number) => {
      const fill = fillRef.current;
      if (!fill) return;
      const x = -EDGE + p * (100 + EDGE);
      const mask = `linear-gradient(90deg, #000 ${x}%, transparent ${x + EDGE}%)`;
      fill.style.maskImage = mask;
      fill.style.webkitMaskImage = mask;
    };
    setFill(0);

    const tl = gsap.timeline({ onComplete: finish });
    const prog = { v: 0 };

    tl.fromTo(glowRef.current, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: "power2.out" }, 0);
    tl.fromTo(
      contentRef.current,
      { opacity: 0, scale: 0.94 },
      { opacity: 1, scale: 1, duration: 0.6, ease: "power3.out" },
      0,
    );

    // The logo fills with white in step with the counter.
    tl.to(
      prog,
      {
        v: 1,
        duration: 1.5,
        ease: "power2.inOut",
        onUpdate: () => {
          setFill(prog.v);
          if (countRef.current) countRef.current.textContent = String(Math.round(prog.v * 100));
        },
      },
      0.2,
    );

    // Hold on the finished logo, then lift the whole splash away like a curtain.
    const outAt = 0.2 + 1.5 + 0.2;
    tl.to(contentRef.current, { opacity: 0, scale: 1.06, duration: 0.4, ease: "power2.in" }, outAt);
    tl.to(el, { yPercent: -100, duration: 0.9, ease: "power4.inOut" }, outAt + 0.1);

    return () => {
      tl.kill();
    };
  }, [finish]);

  return (
    <div
      ref={wrapRef}
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{ zIndex: 20000, background: "var(--page-bg)" }}
      onClick={finish}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: "var(--page-noise-opacity)",
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div
        ref={glowRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0,
          background:
            "radial-gradient(ellipse 40% 34% at 50% 48%, rgba(var(--page-fg-rgb), .07), transparent 70%)",
        }}
      />

      <div ref={contentRef} className="relative flex flex-col items-center" style={{ opacity: 0 }}>
        {/* Dim logo underneath, the same logo in white on top, revealed by the mask. */}
        <div className="relative" style={{ width: "clamp(96px, 13vw, 150px)" }}>
          <img
            src={logoImg}
            alt="DYSIGNS, digital design agency Almere Netherlands"
            className="theme-logo block"
            style={{ width: "100%", height: "auto", opacity: 0.16 }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div ref={fillRef} className="absolute inset-0" aria-hidden="true">
            <img
              src={logoImg}
              alt=""
              className="theme-logo block"
              style={{ width: "100%", height: "auto" }}
            />
          </div>
        </div>

        <div
          className="flex items-baseline"
          style={{
            marginTop: "clamp(28px, 5vw, 48px)",
            fontFamily: "var(--font-brand)",
            fontWeight: 600,
            letterSpacing: "-.04em",
            color: "var(--page-fg)",
            fontVariantNumeric: "tabular-nums",
            lineHeight: 1,
          }}
          aria-hidden="true"
        >
          <span ref={countRef} style={{ fontSize: "clamp(2.4rem, 5.4vw, 4rem)" }}>
            0
          </span>
          <span
            style={{
              fontSize: "clamp(1rem, 2vw, 1.5rem)",
              marginLeft: 4,
              color: "rgba(var(--page-fg-rgb), .45)",
            }}
          >
            %
          </span>
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
