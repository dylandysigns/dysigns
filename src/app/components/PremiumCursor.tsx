import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { CursorContext, type CursorVariant } from "../hooks/useCursor";

/* ═══════════════════════════════════════════════════════════
   Premium Cursor, v7 (gooey)

   Architecture:
   1. GLOBAL: A gooey cursor. A fast "head" blob and a slower "tail"
      blob sit in a small box run through an SVG goo filter, so they
      melt into one drop at rest and stretch apart when you move fast.
      Over links and buttons the head grows a little; when
      cursor.set("view","VIEW PROJECT") is called it grows into a
      solid disc with the label on top. The native arrow is hidden
      site-wide on mouse devices (text fields keep the text caret).
   2. HERO-ONLY: A transparent glass orb (clear lens) that only
      appears over [data-hero-zone]. When hovering the DYSIGNS text
      ([data-dysigns-hero-text]) the orb creates a magnification
      effect, a clipped, scaled-up mirror of the text is shown
      through the orb circle.

   Performance: the goo filter only runs on a GOO_BOX sized element
   that travels with the cursor, never on a full-viewport layer, so
   Safari keeps the per-frame filter cost small.
   ═══════════════════════════════════════════════════════════ */

/* ─── TUNING ─── */
const HEAD_SIZE = 14;
const HEAD_INTERACTIVE = 40; // over a link/button with no label
const HEAD_ACTIVE = 64; // labelled state (VIEW, PLAY, ...)
const TAIL_SIZE = 10;
const TAIL_ACTIVE = 24;
const TAIL_MAX_GAP = 70; // max px the tail may trail behind the head
const HEAD_ACTIVE_MAX = 150; // widest pill for long labels
const LABEL_PAD = 16; // horizontal room around the label inside the pill
const GOO_BOX = 340; // must fit HEAD_ACTIVE_MAX/2 + TAIL_MAX_GAP + TAIL_ACTIVE/2 + blur on each side
const ORB_RADIUS = 70; // orb circle radius in px
const ORB_DIAMETER = ORB_RADIUS * 2;
const MAG_SCALE = 1.6; // magnification factor
const LERP_SMOOTH = 0.14;
const LERP_HEAD = 0.3;
const LERP_TAIL = 0.11;
const LERP_INSTANT = 1;
const EDGE_PAD = 12; // viewport edge padding for label clamping
const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], label, summary, select, input[type="submit"], input[type="checkbox"], input[type="radio"]';

/* ─── PROVIDER ─── */
export function PremiumCursorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [variant, setVariant] = useState<CursorVariant>("default");
  const [label, setLabel] = useState("");

  const api = useMemo(
    () => ({
      set: (v: CursorVariant, l?: string) => {
        setVariant(v);
        setLabel(l ?? "");
      },
      reset: () => {
        setVariant("default");
        setLabel("");
      },
    }),
    [],
  );

  useEffect(() => {
    const onReset = () => {
      setVariant("default");
      setLabel("");
    };

    window.addEventListener("dysigns:cursor-reset", onReset);
    return () => window.removeEventListener("dysigns:cursor-reset", onReset);
  }, []);

  return (
    <CursorContext.Provider value={api}>
      {children}
      <GlassCursor variant={variant} label={label} />
    </CursorContext.Provider>
  );
}

/* ─── GLASS CURSOR ─── */
function GlassCursor({
  variant,
  label,
}: {
  variant: CursorVariant;
  label: string;
}) {
  const gooBoxRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const tailRef = useRef<HTMLDivElement>(null);
  const labelElRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const magOverlayRef = useRef<HTMLDivElement>(null);
  const magMirrorRef = useRef<HTMLDivElement>(null);

  const mouse = useRef({ x: -200, y: -200 });
  const pos = useRef({ x: -200, y: -200 });
  const head = useRef({ x: -200, y: -200 });
  const tail = useRef({ x: -200, y: -200 });
  const raf = useRef(0);
  const [isTouch, setIsTouch] = useState(false);
  const isOverHero = useRef(false);
  const isOverText = useRef(false);
  const isOverInteractive = useRef(false);
  const isInWindow = useRef(false);
  const labelWidth = useRef(0);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const lerp = reduced ? LERP_INSTANT : LERP_SMOOTH;

  /* Detect touch device */
  useEffect(() => {
    setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  /* Clone hero text for magnification */
  const cloneHeroText = useCallback(() => {
    const mirror = magMirrorRef.current;
    if (!mirror) return;

    const el = document.querySelector<HTMLElement>(
      "[data-dysigns-hero-text]",
    );
    if (!el) return;

    const clone = el.cloneNode(true) as HTMLElement;
    clone.removeAttribute("data-dysigns-hero-text");
    clone.setAttribute("aria-hidden", "true");
    clone.style.pointerEvents = "none";
    clone.style.color = "var(--page-fg)";

    mirror.innerHTML = "";
    mirror.appendChild(clone);
  }, []);

  /* Schedule cloning after mount */
  useEffect(() => {
    if (isTouch || reduced) return;
    const t1 = setTimeout(cloneHeroText, 800);
    const t2 = setTimeout(cloneHeroText, 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isTouch, reduced, cloneHeroText]);

  /* Re-clone on DOM mutations */
  useEffect(() => {
    if (isTouch || reduced) return;
    let debounce: ReturnType<typeof setTimeout>;
    const obs = new MutationObserver(() => {
      clearTimeout(debounce);
      debounce = setTimeout(cloneHeroText, 600);
    });
    const content = document.querySelector("[data-cursor-content]");
    if (content) obs.observe(content, { childList: true, subtree: false });
    return () => {
      obs.disconnect();
      clearTimeout(debounce);
    };
  }, [isTouch, reduced, cloneHeroText]);

  /* Mousemove + zone detection */
  const onMove = useCallback((e: MouseEvent) => {
    mouse.current.x = e.clientX;
    mouse.current.y = e.clientY;
    if (!isInWindow.current) {
      // First move after entering: start the blobs at the pointer
      // instead of flying in from the last spot.
      head.current = { x: e.clientX, y: e.clientY };
      tail.current = { x: e.clientX, y: e.clientY };
      pos.current = { x: e.clientX, y: e.clientY };
      isInWindow.current = true;
    }

    // Expose globally for Hero color bloom
    (window as unknown as Record<string, unknown>).__dysignsMouse = {
      x: e.clientX,
      y: e.clientY,
    };

    // Check zones
    const els = document.elementsFromPoint(e.clientX, e.clientY);
    let overHero = false;
    let overText = false;
    for (const el of els) {
      if ((el as HTMLElement).hasAttribute?.("data-hero-zone")) {
        overHero = true;
      }
      if ((el as HTMLElement).hasAttribute?.("data-dysigns-hero-text")) {
        overText = true;
        overHero = true;
      }
    }
    isOverHero.current = overHero;
    isOverText.current = overText;
    const target = els[0] as HTMLElement | undefined;
    isOverInteractive.current = !!target?.closest?.(INTERACTIVE_SELECTOR);
  }, []);

  useEffect(() => {
    if (isTouch) return;
    const onLeave = () => {
      isInWindow.current = false;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [isTouch, onMove]);

  /* Hide the browser arrow site-wide on mouse devices; the gooey cursor
     replaces it. Text fields keep the text caret so typing still feels
     normal, and selects keep the default arrow. */
  useEffect(() => {
    if (isTouch) return;
    const style = document.createElement("style");
    style.id = "dysigns-cursor-hide";
    style.textContent = `
      @media (pointer: fine) {
        html, body, body * { cursor: none !important; }
        body input:not([type="submit"]):not([type="checkbox"]):not([type="radio"]):not([type="button"]),
        body textarea,
        body [contenteditable="true"] { cursor: text !important; }
        body select { cursor: auto !important; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, [isTouch]);

  /* Measure the label once per change so the pill can fit it without
     reading layout on every frame. */
  useEffect(() => {
    labelWidth.current = labelElRef.current?.offsetWidth ?? 0;
  }, [variant, label]);

  /* ─── RENDER LOOP ─── */
  useEffect(() => {
    if (isTouch) return;

    /* We need to read variant/label inside the loop but they're
       React state — stash them in refs updated via a micro-task. */
    const variantRef = { current: variant };
    const labelRef = { current: label };
    variantRef.current = variant;
    labelRef.current = label;

    const tick = () => {
      const mx = mouse.current.x;
      const my = mouse.current.y;

      pos.current.x += (mx - pos.current.x) * lerp;
      pos.current.y += (my - pos.current.y) * lerp;

      const cx = pos.current.x;
      const cy = pos.current.y;

      const overHero = isOverHero.current;

      /* 1. Gooey cursor: head + tail blobs in a small filtered box */
      if (gooBoxRef.current && headRef.current && tailRef.current) {
        const v = variantRef.current;
        // Plain links get a bigger lens without a label: on small nav
        // items a label would sit on top of the link text.
        const isActive = v !== "default" && v !== "hidden" && v !== "link";
        const isLink = v === "link";
        const headLerp = reduced ? LERP_INSTANT : LERP_HEAD;
        const tailLerp = reduced ? LERP_INSTANT : LERP_TAIL;

        // Head target: the pointer, edge-clamped when it carries a label
        // so the label never leaves the viewport.
        // A labelled head becomes a pill wide enough for its text.
        const activeWidth = Math.min(
          HEAD_ACTIVE_MAX,
          Math.max(HEAD_ACTIVE, labelWidth.current + LABEL_PAD * 2),
        );
        let tx = mx;
        let ty = my;
        if (isActive) {
          const halfW = activeWidth / 2;
          const halfH = HEAD_ACTIVE / 2;
          tx = Math.max(halfW + EDGE_PAD, Math.min(window.innerWidth - halfW - EDGE_PAD, mx));
          ty = Math.max(halfH + EDGE_PAD, Math.min(window.innerHeight - halfH - EDGE_PAD, my));
        }
        const h = head.current;
        const t = tail.current;
        h.x += (tx - h.x) * headLerp;
        h.y += (ty - h.y) * headLerp;
        t.x += (h.x - t.x) * tailLerp;
        t.y += (h.y - t.y) * tailLerp;
        // Keep the tail inside the goo box so it never gets clipped.
        const gx = t.x - h.x;
        const gy = t.y - h.y;
        const gap = Math.hypot(gx, gy);
        if (gap > TAIL_MAX_GAP) {
          t.x = h.x + (gx / gap) * TAIL_MAX_GAP;
          t.y = h.y + (gy / gap) * TAIL_MAX_GAP;
        }

        const headSize = isActive
          ? HEAD_ACTIVE
          : isLink || isOverInteractive.current
            ? HEAD_INTERACTIVE
            : HEAD_SIZE;
        const tailSize = isActive ? TAIL_ACTIVE : TAIL_SIZE;
        const boxHalf = GOO_BOX / 2;

        gooBoxRef.current.style.transform = `translate3d(${h.x - boxHalf}px,${h.y - boxHalf}px,0)`;
        gooBoxRef.current.style.opacity = isInWindow.current && v !== "hidden" ? "1" : "0";
        // Small drop and link lens invert what's under them so text stays
        // readable; the labelled pill is solid so its label reads on any
        // photo (difference turns mid-grey images into mid-grey).
        gooBoxRef.current.style.mixBlendMode = isActive ? "normal" : "difference";
        headRef.current.style.width = `${isActive ? activeWidth : headSize}px`;
        headRef.current.style.height = `${headSize}px`;
        tailRef.current.style.width = `${tailSize}px`;
        tailRef.current.style.height = `${tailSize}px`;
        tailRef.current.style.transform = `translate3d(${t.x - h.x}px,${t.y - h.y}px,0) translate(-50%,-50%)`;

        if (labelElRef.current) {
          labelElRef.current.style.transform = `translate3d(${h.x}px,${h.y}px,0) translate(-50%,-50%)`;
        }
      }

      /* 2. Glass orb (hero only) */
      if (orbRef.current) {
        orbRef.current.style.opacity = overHero ? "1" : "0";
        orbRef.current.style.transform = `translate3d(${cx}px,${cy}px,0) translate(-50%,-50%)`;
      }

      /* 3. Magnification overlay — zoom the DYSIGNS text through the orb.
            The overlay is a sized circular div (not a full-page clipped element).
            Moving it via translate3d is GPU-composited on Safari; clipPath is not. */
      if (!reduced && magOverlayRef.current && magMirrorRef.current) {
        const textEl = document.querySelector<HTMLElement>(
          "[data-dysigns-hero-text]",
        );

        if (textEl && overHero && magMirrorRef.current.children.length > 0) {
          const rect = textEl.getBoundingClientRect();
          // Overlay top-left sits at (cx - ORB_RADIUS, cy - ORB_RADIUS).
          // Mirror must be offset so text pixels appear at their true viewport pos.
          const overlayLeft = cx - ORB_RADIUS;
          const overlayTop  = cy - ORB_RADIUS;

          magOverlayRef.current.style.visibility = "visible";
          magOverlayRef.current.style.transform = `translate3d(${overlayLeft}px,${overlayTop}px,0)`;

          magMirrorRef.current.style.left = `${rect.left - overlayLeft}px`;
          magMirrorRef.current.style.top  = `${rect.top  - overlayTop}px`;
          magMirrorRef.current.style.width  = `${rect.width}px`;
          magMirrorRef.current.style.height = `${rect.height}px`;
          // Scale origin = cursor position in mirror's local coord system
          magMirrorRef.current.style.transformOrigin = `${cx - rect.left}px ${cy - rect.top}px`;
          magMirrorRef.current.style.transform = `scale(${MAG_SCALE})`;
        } else {
          magOverlayRef.current.style.visibility = "hidden";
          magOverlayRef.current.style.transform = "translate3d(-400px,-400px,0)";
        }
      }

      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [isTouch, lerp, variant, label, reduced]);

  if (isTouch) return null;

  const isActive = variant !== "default" && variant !== "hidden" && variant !== "link";
  const isHidden = variant === "hidden";

  const displayLabel =
    label ||
    (variant === "view"
      ? "VIEW"
      : variant === "link"
        ? "OPEN"
        : variant === "drag"
          ? "DRAG"
          : variant === "play"
            ? "PLAY"
            : "");

  return (
    <>
      {/* ═══ MAGNIFICATION OVERLAY — zoomed text through orb ═══
          Uses a sized circular div with overflow:hidden instead of a
          full-viewport clipPath + SVG filter. clipPath on inset:0 elements
          and feTurbulence/feGaussianBlur SVG filters are evaluated in
          software on every rAF in Safari — replacing with a GPU-composited
          translate3d transform and border-radius eliminates the jank.     */}
      {!reduced && (
        <div
          ref={magOverlayRef}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: ORB_DIAMETER,
            height: ORB_DIAMETER,
            borderRadius: "50%",
            overflow: "hidden",
            pointerEvents: "none",
            zIndex: 9996,
            visibility: "hidden",
            willChange: "transform",
            transform: "translate3d(-400px,-400px,0)",
          }}
          aria-hidden
        >
          <div
            ref={magMirrorRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              overflow: "visible",
              background: "transparent",
              willChange: "transform",
            }}
          />
        </div>
      )}

      {/* ═══ GOOEY CURSOR (global) ═══
          Blur + alpha threshold melts the two blobs into one drop. The
          filter lives on a GOO_BOX sized element that moves with the
          cursor, so it never filters the whole viewport. */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        <filter id="dysigns-goo" x="0" y="0" width="100%" height="100%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
          <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" />
        </filter>
      </svg>
      <div
        ref={gooBoxRef}
        className="fixed top-0 left-0 pointer-events-none"
        style={{
          width: GOO_BOX,
          height: GOO_BOX,
          zIndex: 9998,
          willChange: "transform",
          filter: "url(#dysigns-goo)",
          mixBlendMode: "difference",
          opacity: 0,
          transition: "opacity .25s ease",
          transform: "translate3d(-400px,-400px,0)",
        }}
        aria-hidden
      >
        <div
          ref={tailRef}
          className="absolute rounded-full"
          style={{
            left: "50%",
            top: "50%",
            width: TAIL_SIZE,
            height: TAIL_SIZE,
            background: "#fff",
            transition:
              "width .35s cubic-bezier(.22,1,.36,1), height .35s cubic-bezier(.22,1,.36,1)",
          }}
        />
        <div
          ref={headRef}
          className="absolute rounded-full"
          style={{
            left: "50%",
            top: "50%",
            width: HEAD_SIZE,
            height: HEAD_SIZE,
            background: "#fff",
            transform: "translate(-50%,-50%)",
            transition:
              "width .4s cubic-bezier(.34,1.56,.64,1), height .4s cubic-bezier(.34,1.56,.64,1)",
          }}
        />
      </div>

      {/* Label sits outside the filter so the text stays sharp. */}
      <div
        ref={labelElRef}
        className="fixed top-0 left-0 pointer-events-none"
        style={{
          zIndex: 9999,
          willChange: "transform",
          opacity: isActive && !isHidden && displayLabel ? 1 : 0,
          transition: "opacity .2s ease",
          transform: "translate3d(-400px,-400px,0)",
        }}
        aria-hidden
      >
        <span
          style={{
            display: "block",
            fontFamily: "var(--font-brand)",
            fontSize: ".55rem",
            fontWeight: 600,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            color: "#0b0b0b",
            whiteSpace: "nowrap",
          }}
        >
          {displayLabel}
        </span>
      </div>

      {/* ═══ GLASS ORB — transparent lens (hero only) ═══ */}
      {!reduced && (
        <div
          ref={orbRef}
          className="fixed top-0 left-0 rounded-full pointer-events-none"
          style={{
            width: ORB_DIAMETER,
            height: ORB_DIAMETER,
            zIndex: 9997,
            willChange: "transform",
            opacity: 0,
            transition: "opacity .35s cubic-bezier(.22,1,.36,1)",
          }}
          aria-hidden
        >
          {/* Transparent glass body — subtle gradient fill only (no backdrop-filter:
              backdrop-filter on an element transforming every rAF causes software
              rasterisation in Safari). The visual glass look is handled by the
              magnification overlay + highlights below. */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 40% 35%, rgba(var(--page-fg-rgb), .06) 0%, rgba(var(--page-fg-rgb), .02) 50%, transparent 100%)",
            }}
          />

          {/* Fresnel edge — subtle darkening at rim */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, transparent 55%, rgba(var(--page-bg-rgb), .12) 75%, rgba(var(--page-bg-rgb), .25) 100%)",
            }}
          />

          {/* Iridescent chromatic fringing */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "conic-gradient(from 200deg at 50% 50%, rgba(160,120,255,.12) 0deg, rgba(255,100,200,.08) 60deg, rgba(100,180,255,.1) 140deg, rgba(120,255,200,.06) 220deg, rgba(160,120,255,.12) 360deg)",
              opacity: 0.6,
              animation: "orbIridShift 8s linear infinite",
            }}
          />

          {/* Specular highlight — top-left */}
          <div
            className="absolute rounded-full"
            style={{
              top: "8%",
              left: "12%",
              width: "48%",
              height: "40%",
              background:
                "radial-gradient(ellipse at 50% 40%, rgba(var(--page-fg-rgb), .3) 0%, rgba(var(--page-fg-rgb), .08) 40%, transparent 70%)",
              transform: "rotate(-20deg)",
            }}
          />

          {/* Secondary highlight — sharp point */}
          <div
            className="absolute rounded-full"
            style={{
              top: "14%",
              left: "20%",
              width: "22%",
              height: "15%",
              background:
                "radial-gradient(ellipse at 50% 50%, rgba(var(--page-fg-rgb), .5) 0%, transparent 70%)",
              transform: "rotate(-15deg)",
              filter: "blur(1px)",
            }}
          />

          {/* Glass rim ring */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: "1.5px solid rgba(var(--page-fg-rgb), .15)",
              boxShadow:
                "0 0 30px rgba(var(--page-fg-rgb), .05), 0 0 15px rgba(120,100,255,.06), inset 0 0 20px rgba(var(--page-fg-rgb), .03)",
            }}
          />

          {/* Bottom caustic — subtle light refraction */}
          <div
            className="absolute rounded-full"
            style={{
              bottom: "8%",
              left: "25%",
              width: "50%",
              height: "20%",
              background:
                "radial-gradient(ellipse at 50% 80%, rgba(var(--page-fg-rgb), .1) 0%, transparent 70%)",
              filter: "blur(3px)",
            }}
          />
        </div>
      )}

      {/* Keyframes for orb */}
      <style>{`
        @keyframes orbIridShift {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
