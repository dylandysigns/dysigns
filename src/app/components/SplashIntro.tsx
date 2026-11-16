import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import logoImg from "../../assets/dysigns_white.png";
import { createSpace, type Space } from "../../../preview/portalSpace";
import { EMBLEM_SPIN_REST, type Emblem } from "../../../preview/portalEmblem";

/* The splash is the first second of the same universe the homepage hero opens in: black
   space with stars, and the DYSIGNS emblem in 3D chrome, making one slow turn while the
   counter runs. The flat logo with its left-to-right fill is what you see until the 3D
   emblem has loaded (and all you see if it does not, or without WebGL). At the end the
   splash does not lift like a curtain: it dissolves, so on the homepage the stars simply
   stay. Loading the emblem here also means the hero has it ready. */

const SESSION_KEY = "dysigns_splash_done";

// Width of the soft leading edge of the fill, in % of the logo width.
const EDGE = 8;

export function SplashIntro({ onDone }: { onDone: () => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const spaceRef = useRef<HTMLCanvasElement>(null);
  const emblemRef = useRef<HTMLCanvasElement>(null);
  const flatRef = useRef<HTMLDivElement>(null);
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

    // space behind it: the calm version of the hero's sky, stars only
    let alive = true;
    const space: Space | null = spaceRef.current ? createSpace(spaceRef.current) : null;
    if (space) {
      Object.assign(space.state, { room: 1, fill: 0, planet: 0 });
      space.start();
    }
    // the emblem in 3D: it takes over from the flat logo as soon as it is there
    let emblem: Emblem | null = null;
    const turn = () => {
      if (emblem) emblem.state.spin = EMBLEM_SPIN_REST - 360 * (1 - prog.v);
    };
    import("../../../preview/portalEmblem")
      .then((m) => (emblemRef.current ? m.createEmblem(emblemRef.current) : null))
      .then((e) => {
        if (!e) return;
        if (!alive) return e.destroy();
        emblem = e;
        e.state.morph = 1;
        e.state.scale = 1;
        e.state.auto = -1;
        turn();
        e.start();
        gsap.to(emblemRef.current, { opacity: 1, duration: 0.5, ease: "power1.out" });
        gsap.to(flatRef.current, { opacity: 0, duration: 0.5, ease: "power1.out" });
      })
      .catch(() => {
        /* no WebGL or the chunk did not load: the flat logo stays */
      });

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
          turn();
          if (countRef.current) countRef.current.textContent = String(Math.round(prog.v * 100));
        },
      },
      0.2,
    );

    // Hold on the finished emblem, then fly on past it while the splash dissolves into the page.
    const outAt = 0.2 + 1.5 + 0.25;
    tl.to(contentRef.current, { opacity: 0, scale: 1.35, duration: 0.6, ease: "power2.in" }, outAt);
    tl.to(el, { opacity: 0, duration: 0.7, ease: "power2.inOut" }, outAt + 0.25);

    return () => {
      alive = false;
      tl.kill();
      gsap.killTweensOf([emblemRef.current, flatRef.current]);
      space?.stop();
      emblem?.destroy();
    };
  }, [finish]);

  return (
    <div
      ref={wrapRef}
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{ zIndex: 20000, background: "#000" }}
      onClick={finish}
    >
      <canvas
        ref={spaceRef}
        className="absolute inset-0 pointer-events-none"
        style={{ width: "100%", height: "100%", display: "block" }}
        aria-hidden="true"
      />
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
          {/* the 3D emblem, centred on the flat logo; its canvas is larger than the emblem it draws */}
          <canvas
            ref={emblemRef}
            className="absolute pointer-events-none"
            style={{ left: "50%", top: "50%", width: 540, height: 540, margin: "-270px 0 0 -270px", opacity: 0 }}
            aria-hidden="true"
          />
          <div ref={flatRef}>
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
