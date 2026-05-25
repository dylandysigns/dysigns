import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { CursorContext, type CursorVariant } from "../hooks/useCursor";

/* ═══════════════════════════════════════════════════════════
   Premium Cursor — v6

   Architecture:
   1. GLOBAL: A small dot + floating label that follows the cursor.
      When cursor.set("view","VIEW PROJECT") is called the dot grows
      into a frosted pill with the label. The label is edge-clamped
      so it never overflows the viewport.
   2. HERO-ONLY: A transparent glass orb (clear lens) that only
      appears over [data-hero-zone]. When hovering the DYSIGNS text
      ([data-dysigns-hero-text]) the orb creates a magnification
      effect — a clipped, scaled-up mirror of the text is shown
      through the orb circle.
   ═══════════════════════════════════════════════════════════ */

/* ─── TUNING ─── */
const DOT_SIZE = 10;
const DOT_ACTIVE = 60;
const ORB_RADIUS = 70; // orb circle radius in px
const ORB_DIAMETER = ORB_RADIUS * 2;
const MAG_SCALE = 1.6; // magnification factor
const LERP_SMOOTH = 0.14;
const LERP_INSTANT = 1;
const EDGE_PAD = 12; // viewport edge padding for label clamping

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
  const dotRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const magOverlayRef = useRef<HTMLDivElement>(null);
  const magMirrorRef = useRef<HTMLDivElement>(null);

  const mouse = useRef({ x: -200, y: -200 });
  const pos = useRef({ x: -200, y: -200 });
  const raf = useRef(0);
  const [isTouch, setIsTouch] = useState(false);
  const isOverHero = useRef(false);
  const isOverText = useRef(false);

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
  }, []);

  useEffect(() => {
    if (isTouch) return;
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [isTouch, onMove]);

  /* Hide browser cursor only inside hero zone */
  useEffect(() => {
    if (isTouch) return;
    const style = document.createElement("style");
    style.id = "dysigns-cursor-hide";
    style.textContent = `
      [data-hero-zone] { cursor: none !important; }
      [data-hero-zone] * { cursor: none !important; }
    `;
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, [isTouch]);

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

      /* 1. Dot / pill cursor — edge-clamped positioning */
      if (dotRef.current) {
        const v = variantRef.current;
        const isActive =
          v !== "default" && v !== "hidden";
        const half = isActive ? DOT_ACTIVE / 2 : DOT_SIZE / 2;
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        const clampedX = Math.max(
          half + EDGE_PAD,
          Math.min(vw - half - EDGE_PAD, cx),
        );
        const clampedY = Math.max(
          half + EDGE_PAD,
          Math.min(vh - half - EDGE_PAD, cy),
        );

        dotRef.current.style.transform = `translate3d(${clampedX}px,${clampedY}px,0) translate(-50%,-50%)`;
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

  const isActive = variant !== "default" && variant !== "hidden";
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

      {/* ═══ DOT / LABEL CURSOR (global, edge-clamped) ═══ */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none"
        style={{
          zIndex: 9998,
          willChange: "transform",
          opacity: isHidden ? 0 : 1,
          transition: "opacity .2s ease",
        }}
        aria-hidden
      >
        <div
          className="rounded-full flex items-center justify-center"
          style={{
            width: isActive ? DOT_ACTIVE : DOT_SIZE,
            height: isActive ? DOT_ACTIVE : DOT_SIZE,
            background: isActive
              ? "rgba(var(--page-fg-rgb), .10)"
              : "rgba(var(--page-fg-rgb), .85)",
            border: isActive
              ? "1px solid rgba(var(--page-fg-rgb), .2)"
              : "1px solid transparent",
            transition:
              "width .35s cubic-bezier(.22,1,.36,1), height .35s cubic-bezier(.22,1,.36,1), background .3s, border .3s",
            transform: "translate(-50%,-50%)",
            boxShadow: isActive
              ? "0 4px 20px rgba(var(--page-shadow-rgb), .18), inset 0 0.5px 0 rgba(var(--page-fg-rgb), .08)"
              : "0 0 6px rgba(var(--page-fg-rgb), .15)",
          }}
        >
          {isActive && displayLabel && (
            <span
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: ".55rem",
                fontWeight: 600,
                letterSpacing: ".12em",
                textTransform: "uppercase",
                color: "rgba(var(--page-fg-rgb), .85)",
                whiteSpace: "nowrap",
                opacity: 1,
                transition: "opacity .2s",
              }}
            >
              {displayLabel}
            </span>
          )}
        </div>
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
