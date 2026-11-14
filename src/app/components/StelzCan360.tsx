import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type Ref } from "react";
import { useCursor } from "../hooks/useCursor";
import { useLanguage } from "../hooks/useLanguage";

/**
 * The STËLZ can as an interactive 3D turntable for the STËLZ App case.
 *
 * It plays the same 72 pre-rendered frames the app uses (one per 5 degrees),
 * so it looks exactly like the can in the app. Drag to turn it (with a little
 * inertia), and it also turns as the page scrolls past. The pills switch
 * flavour. Frames load only once the tile nears the viewport, and only for
 * the selected flavour.
 *
 * Styled like the rest of the site (black, Effra, uppercase micro labels,
 * hairline pills): a turntable ellipse whose marker follows the can, a huge
 * outlined flavour name behind it and live angle / frame read-outs. Sizes are
 * in container units so it scales with the tile: 2:1 from md up, 4:5 on
 * phones.
 */

const BASE = "/images/stelz-can";
const FRAMES = 72;
const DEG_PER_FRAME = 360 / FRAMES;

/** `type` is the drink style printed on the can. */
const FLAVOURS = [
  { id: "rum-cola", name: "Rum Cola", type: "Cocktails", glow: ["#8c1a1d", "#D08A5C"] },
  { id: "watermelon-mint", name: "Watermelon Mint", type: "Hard Lemonade", glow: ["#E14242", "#72D6A3"] },
  { id: "cherry", name: "Cherry", type: "Hard Iced Tea", glow: ["#B0213D", "#F37A95"] },
  { id: "yuzu", name: "Yuzu", type: "Hard Lemonade", glow: ["#D88A0C", "#FDD839"] },
  { id: "elderflower", name: "Elderflower", type: "Hard Seltzer", glow: ["#9EA0CE", "#FFF6CF"] },
  { id: "spicy-pineapple", name: "Spicy Pineapple", type: "Hard Iced Tea", glow: ["#D88A0C", "#E8413A"] },
] as const;

const frameUrl = (id: string, i: number) => `${BASE}/${id}-${String(i).padStart(2, "0")}.webp`;

/** Shared cache so switching back to a flavour is instant. */
const cache = new Map<string, HTMLImageElement[]>();
function framesFor(id: string, onLoad: () => void) {
  let list = cache.get(id);
  if (!list) {
    list = [];
    cache.set(id, list);
    // Front frame first, then the rest in order of distance from the front.
    const order = Array.from({ length: FRAMES }, (_, i) => i).sort(
      (a, b) => Math.min(a, FRAMES - a) - Math.min(b, FRAMES - b),
    );
    for (const i of order) {
      const img = new Image();
      img.decoding = "async";
      img.src = frameUrl(id, i);
      list[i] = img;
    }
  }
  for (const img of list) if (!img.complete) img.addEventListener("load", onLoad, { once: true });
  return list;
}

const rgba = (h: string, a: number) => {
  const n = parseInt(h.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

/* Turntable ellipse in its own coordinates: rx 100, ry 15. */
const RX = 100;
const RY = 15;
const TICKS = Array.from({ length: FRAMES }, (_, i) => {
  const a = (i / FRAMES) * Math.PI * 2;
  const major = i % 9 === 0;
  const k = major ? 0.9 : 0.95;
  return { x1: RX * Math.cos(a), y1: RY * Math.sin(a), x2: RX * k * Math.cos(a), y2: RY * k * Math.sin(a), major };
});

/** Half of the turntable: the back half sits behind the can, the front half in front. */
function Turntable({ half, markerRef }: { half: "back" | "front"; markerRef: Ref<SVGCircleElement> }) {
  const clip = `stelz-tt-${half}`;
  return (
    <svg viewBox={`${-RX - 4} ${-RY - 4} ${2 * RX + 8} ${2 * RY + 8}`} className="absolute inset-0 w-full h-full overflow-visible" aria-hidden>
      <defs>
        <clipPath id={clip}>
          <rect x={-RX - 10} y={half === "back" ? -RY - 10 : 0} width={2 * RX + 20} height={RY + 10} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <ellipse cx="0" cy="0" rx={RX} ry={RY} fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
        <ellipse cx="0" cy="0" rx={RX * 0.86} ry={RY * 0.86} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
        {TICKS.map(({ major, ...pos }, i) => (
          <line key={i} {...pos} stroke={major ? "rgba(255,255,255,.55)" : "rgba(255,255,255,.18)"} strokeWidth="1" vectorEffect="non-scaling-stroke" />
        ))}
        <circle ref={markerRef} r="2.2" fill="#fff" />
      </g>
    </svg>
  );
}

/* Site micro label: small, uppercase, tracked. */
const micro: CSSProperties = { fontWeight: 500, letterSpacing: ".1em", textTransform: "uppercase" };

export function StelzCan360({ alt }: { alt: string }) {
  const { t } = useLanguage();
  const cursor = useCursor();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const degRef = useRef<HTMLSpanElement>(null);
  const frameRef = useRef<HTMLSpanElement>(null);
  const markBack = useRef<SVGCircleElement>(null);
  const markFront = useRef<SVGCircleElement>(null);
  const [active, setActive] = useState(false);
  const [flavour, setFlavour] = useState(1); // Watermelon Mint, as in the still

  const dragAngle = useRef(0);
  const scrollAngle = useRef(0);
  const velocity = useRef(0);
  const dragging = useRef<{ x: number; t: number } | null>(null);
  const raf = useRef(0);
  const glideRaf = useRef(0);
  const frames = useRef<HTMLImageElement[] | null>(null);
  const shown = useRef<HTMLImageElement | null>(null);
  const reduced = useRef(false);

  const draw = useCallback(() => {
    const angle = dragAngle.current + scrollAngle.current;
    const idx = ((Math.round(angle / DEG_PER_FRAME) % FRAMES) + FRAMES) % FRAMES;

    // read-outs and turntable marker follow the can
    const deg = (((angle % 360) + 360) % 360);
    if (degRef.current) degRef.current.textContent = `${String(Math.round(deg) % 360).padStart(3, "0")}°`;
    if (frameRef.current) frameRef.current.textContent = `${String(idx + 1).padStart(2, "0")} / ${FRAMES}`;
    const th = Math.PI / 2 - (angle * Math.PI) / 180; // front of the can sits at the front of the ellipse
    const mx = RX * Math.cos(th), my = RY * Math.sin(th);
    for (const [el, front] of [[markFront.current, true], [markBack.current, false]] as const) {
      if (!el) continue;
      el.setAttribute("cx", mx.toFixed(2));
      el.setAttribute("cy", my.toFixed(2));
      el.style.opacity = (my >= 0) === front ? "1" : "0";
    }

    const canvas = canvasRef.current;
    const list = frames.current;
    if (!canvas || !list) return;
    // Use the wanted frame, or the nearest one that has loaded already.
    let img: HTMLImageElement | null = null;
    for (let d = 0; d < FRAMES / 2 && !img; d++) {
      for (const i of [idx + d, idx - d]) {
        const c = list[((i % FRAMES) + FRAMES) % FRAMES];
        if (c?.complete && c.naturalWidth) { img = c; break; }
      }
    }
    if (!img) img = shown.current; // keep the previous flavour until the new one is in
    if (!img) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    shown.current = img;
  }, []);

  const schedule = useCallback(() => {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(draw);
  }, [draw]);

  // Start loading once the tile is near the viewport.
  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setActive(true); io.disconnect(); } },
      { rootMargin: "500px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Frames for the selected flavour.
  useEffect(() => {
    if (!active) return;
    frames.current = framesFor(FLAVOURS[flavour].id, schedule);
    schedule();
  }, [active, flavour, schedule]);

  // Turn with the page scroll: one full turn while the tile crosses the screen,
  // facing front when the tile sits in the middle of it.
  useEffect(() => {
    if (!active) return;
    const onScroll = () => {
      if (reduced.current || !wrapRef.current) return;
      const r = wrapRef.current.getBoundingClientRect();
      const progress = (window.innerHeight - r.top) / (window.innerHeight + r.height);
      scrollAngle.current = (Math.max(0, Math.min(1, progress)) - 0.5) * 360;
      schedule();
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf.current);
      cancelAnimationFrame(glideRaf.current);
    };
  }, [active, schedule]);

  // Drag: a full turn for about three can widths, then a short glide.
  const degPerPx = () => 360 / Math.max(120, (canvasRef.current?.clientWidth ?? 200) * 3);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    cancelAnimationFrame(glideRaf.current);
    dragging.current = { x: e.clientX, t: performance.now() };
    velocity.current = 0;
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = dragging.current;
    if (!d) return;
    const now = performance.now();
    const delta = (e.clientX - d.x) * degPerPx();
    dragAngle.current += delta;
    velocity.current = delta / Math.max(1, now - d.t);
    dragging.current = { x: e.clientX, t: now };
    schedule();
  };
  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = null;
    if (reduced.current) return;
    let v = velocity.current * 16; // degrees per frame
    const glide = () => {
      if (Math.abs(v) < 0.05 || dragging.current) return;
      dragAngle.current += v;
      v *= 0.94;
      draw();
      glideRaf.current = requestAnimationFrame(glide);
    };
    glideRaf.current = requestAnimationFrame(glide);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    dragAngle.current += (e.key === "ArrowRight" ? 1 : -1) * 15;
    schedule();
  };

  const f = FLAVOURS[flavour];
  const [g0, g1] = f.glow;
  const pill: CSSProperties = {
    ...micro,
    background: "rgba(255,255,255,.06)",
    border: "1px solid rgba(255,255,255,.14)",
    color: "rgba(255,255,255,.8)",
  };

  return (
    <div
      ref={wrapRef}
      className="relative w-full h-full overflow-hidden select-none text-white"
      style={{ containerType: "inline-size", background: "#050505", fontFamily: "var(--font-brand)" }}
    >
      {/* flavour light */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(30% 46% at 50% 46%, ${rgba(g0, 0.55)}, transparent 72%), radial-gradient(46% 30% at 50% 86%, ${rgba(g1, 0.16)}, transparent 70%)`,
          transition: "background 600ms ease",
        }}
      />
      {/* faint floor grid */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[45%] pointer-events-none opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)",
          backgroundSize: "4cqw 4cqw",
          maskImage: "linear-gradient(to bottom, transparent, #000 45%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 45%, transparent)",
          transform: "perspective(40cqw) rotateX(58deg)",
          transformOrigin: "50% 100%",
        }}
      />

      {/* huge outlined flavour name behind the can */}
      <div
        aria-hidden
        key={`bg-${f.id}`}
        className="absolute inset-x-0 text-center pointer-events-none whitespace-nowrap stelz-fade animate-[stelzFadeIn_.5s_ease] top-[24%] md:top-1/2 md:-translate-y-[58%]"
        style={{
          fontWeight: 700,
          letterSpacing: "-.05em",
          lineHeight: 1,
          fontSize: `min(19cqw, ${150 / f.name.length}cqw)`,
          color: "transparent",
          // only around the can, so it never runs through the name or the pills
          maskImage: "linear-gradient(90deg, transparent 24%, #000 38%, #000 62%, transparent 76%)",
          WebkitMaskImage: "linear-gradient(90deg, transparent 24%, #000 38%, #000 62%, transparent 76%)",
          WebkitTextStroke: `1px ${rgba(g1, 0.35)}`,
        }}
      >
        {f.name}
      </div>

      {/* top bar: tags left, live read-outs right */}
      <div className="absolute inset-x-[4.5%] top-[4.5%] md:inset-x-[3.2%] md:top-[6%] flex items-start justify-between pointer-events-none" style={{ fontSize: "max(1cqw, 9px)" }}>
        <div className="flex gap-[0.6em]">
          <span className="rounded-full px-[1.1em] py-[0.5em]" style={pill}>3D</span>
          <span className="rounded-full px-[1.1em] py-[0.5em]" style={pill}>{t("case.can360Hint")}</span>
        </div>
        <div className="flex gap-[0.6em] tabular-nums" style={{ ...micro, color: "rgba(255,255,255,.55)" }}>
          <span ref={degRef} className="rounded-full px-[1.1em] py-[0.5em]" style={{ border: "1px solid rgba(255,255,255,.14)" }}>000°</span>
          <span ref={frameRef} className="rounded-full px-[1.1em] py-[0.5em] hidden md:inline-block" style={{ border: "1px solid rgba(255,255,255,.14)" }}>01 / 72</span>
        </div>
      </div>

      {/* the can on its turntable */}
      <div className="absolute left-1/2 -translate-x-1/2 top-[11%] h-[50%] md:top-[13%] md:h-[72%]" style={{ aspectRatio: "300 / 720" }}>
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[7%] w-[260%] aspect-[208/38] translate-y-1/2">
          <Turntable half="back" markerRef={markBack} />
        </div>
        <div
          role="img"
          aria-label={`${alt}. ${t("case.can360")}`}
          tabIndex={0}
          className="absolute inset-0 outline-none focus-visible:ring-1 focus-visible:ring-white/60 rounded-[1.5cqw]"
          style={{ cursor: "grab", touchAction: "pan-y" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onKeyDown}
          onMouseEnter={() => cursor.set("drag", t("cursor.drag"))}
          onMouseLeave={() => cursor.reset()}
        >
          <canvas ref={canvasRef} className="w-full h-full block" style={{ filter: "drop-shadow(0 2.4cqw 2.2cqw rgba(0,0,0,.55))" }} />
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[7%] w-[260%] aspect-[208/38] translate-y-1/2 pointer-events-none">
          <Turntable half="front" markerRef={markFront} />
        </div>
      </div>

      {/* active flavour. Phone: under the can; md+: left column */}
      <div
        key={`n-${f.id}`}
        aria-live="polite"
        className="absolute pointer-events-none stelz-fade animate-[stelzFadeIn_.4s_ease] inset-x-0 top-[66.5%] text-center md:inset-x-auto md:left-[6%] md:top-1/2 md:-translate-y-1/2 md:text-left md:w-[28%]"
      >
        <div className="hidden md:block" style={{ ...micro, fontSize: "1.1cqw", color: "rgba(255,255,255,.5)" }}>
          {t("case.can360Label")}
        </div>
        <div className="text-[8cqw] md:text-[4.4cqw] md:mt-[0.6cqw]" style={{ fontWeight: 700, letterSpacing: "-.05em", lineHeight: 1.02 }}>
          {f.name}
        </div>
        <div className="mt-[1.2cqw] md:mt-[0.9cqw] text-[2.6cqw] md:text-[1.1cqw]" style={{ ...micro, color: rgba(g1, 0.95) }}>
          {f.type}
        </div>
      </div>

      {/* flavour pills. Phone: 3 x 2 grid at the bottom; md+: list on the right */}
      <div
        role="radiogroup"
        aria-label={t("case.can360Flavour")}
        className="absolute grid grid-cols-3 gap-[1.6cqw] inset-x-[4.5%] bottom-[4.5%] md:flex md:flex-col md:gap-[0.7cqw] md:inset-x-auto md:right-[5%] md:bottom-auto md:top-1/2 md:-translate-y-1/2"
      >
        {FLAVOURS.map((x, i) => {
          const on = i === flavour;
          return (
            <button
              key={x.id}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={`${x.name}, ${x.type}`}
              onClick={() => setFlavour(i)}
              onMouseEnter={() => cursor.set("link", x.name.toUpperCase())}
              onMouseLeave={() => cursor.reset()}
              className="flex items-center rounded-full transition-colors duration-300 gap-[1.4cqw] p-[0.9cqw] pr-[2cqw] md:gap-[0.8cqw] md:p-[0.45cqw] md:pr-[1.4cqw] focus-visible:outline-1 focus-visible:outline-white focus-visible:outline-offset-2"
              style={{
                background: on ? "#fff" : "rgba(255,255,255,.06)",
                border: `1px solid ${on ? "#fff" : "rgba(255,255,255,.14)"}`,
                color: on ? "#000" : "rgba(255,255,255,.8)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
            >
              <span
                className="block rounded-full bg-cover shrink-0 w-[5.4cqw] h-[5.4cqw] md:w-[2.1cqw] md:h-[2.1cqw]"
                style={{ backgroundImage: `url(${BASE}/dot-${x.id}.webp)` }}
              />
              <span className="whitespace-nowrap text-[2.5cqw] md:text-[1.05cqw]" style={{ fontWeight: 500, letterSpacing: ".02em" }}>
                {x.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
