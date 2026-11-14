import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { CursorContext, type CursorVariant } from "../hooks/useCursor";
import { useLanguage } from "../hooks/useLanguage";

/* ═══════════════════════════════════════════════════════════
   Premium Cursor, v8 (gooey, one cursor everywhere)

   A fast "head" blob and a slower "tail" blob sit in a small box run
   through an SVG goo filter, so they melt into one drop at rest and
   stretch apart when you move fast. Over links and buttons the head
   grows into a solid pill with a label inside ("OPEN", "EMAIL" or the
   label a component passes to cursor.set, such as "VIEW STËLZ App"),
   the same pill for every kind of link. Form controls without a label
   get a plain lens. The
   native arrow is hidden site-wide on mouse devices (text fields keep
   the text caret). The hero uses this same cursor (the old glass orb
   is gone).

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
const HEAD_ACTIVE_MAX = 280; // widest pill, room for "VIEW" + a project name
const LABEL_PAD = 16; // horizontal room around the label inside the pill
const GOO_BOX = 340; // must fit HEAD_ACTIVE_MAX/2 + TAIL_MAX_GAP + TAIL_ACTIVE/2 + blur on each side
const LERP_SMOOTH = 0.14;
const LERP_HEAD = 0.3;
const LERP_TAIL = 0.11;
const LERP_INSTANT = 1;
const EDGE_PAD = 12; // viewport edge padding for label clamping
const INTERACTIVE_SELECTOR = [
  "a[href]", "button", "summary", "select", "label",
  'input[type="submit"]', 'input[type="button"]', 'input[type="checkbox"]', 'input[type="radio"]',
  '[role="button"]', '[role="link"]', '[role="tab"]', '[role="radio"]', '[role="checkbox"]',
  '[role="switch"]', '[role="menuitem"]', '[role="option"]',
  '[tabindex]:not([tabindex="-1"])', "[data-cursor-hover]",
].join(", ");
/** How often the pointer target is re-checked while the mouse rests (ms),
 * so links that scroll or animate under a still pointer still get hover. */
const RECHECK_MS = 200;
const PRESS_SCALE = 0.72; // head squish while the mouse button is down
/** Elements that get a labelled pill on hover (form controls only get the lens). */
const LABEL_SELECTOR =
  'a[href], button, summary, [role="button"], [role="link"], [role="tab"], input[type="submit"], input[type="button"], [data-cursor-label]';

/** True for elements React gave a click handler (clickable divs, cards)
 * without a link or button tag. Walks a few ancestors only. */
function hasReactClick(start: Element | null): boolean {
  let el: Element | null = start;
  for (let depth = 0; el && depth < 6; depth++, el = el.parentElement) {
    const key = Object.keys(el).find((k) => k.startsWith("__reactProps"));
    const props = key ? (el as unknown as Record<string, { onClick?: unknown } | undefined>)[key] : undefined;
    if (props?.onClick) return true;
  }
  return false;
}

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
  const labelTextRef = useRef<HTMLSpanElement>(null);
  const { t } = useLanguage();
  const openText = t("cursor.open");
  const emailText = t("cursor.email");
  const whatsappText = t("cursor.whatsapp");

  const mouse = useRef({ x: -200, y: -200 });
  const pos = useRef({ x: -200, y: -200 });
  const head = useRef({ x: -200, y: -200 });
  const tail = useRef({ x: -200, y: -200 });
  const raf = useRef(0);
  const [isTouch, setIsTouch] = useState(false);
  const isOverInteractive = useRef(false);
  /** Label for the pill of the element under the pointer ("" = plain lens). */
  const hoverLabel = useRef("");
  const isInWindow = useRef(false);
  const isPressed = useRef(false);
  const openTextRef = useRef(openText);
  const emailTextRef = useRef(emailText);
  const whatsappTextRef = useRef(whatsappText);
  openTextRef.current = openText;
  emailTextRef.current = emailText;
  whatsappTextRef.current = whatsappText;
  const lastCheck = useRef(0);
  const labelWidth = useRef(0);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const lerp = reduced ? LERP_INSTANT : LERP_SMOOTH;

  /* Detect touch device */
  useEffect(() => {
    setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

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

    checkUnderPointer();
  }, []);

  /* What sits under the pointer: hero zones and interactive elements.
     Runs on mouse move, on scroll and every RECHECK_MS while the mouse
     rests, so content that moves under a still pointer gets hover too. */
  const checkUnderPointer = useCallback(() => {
    lastCheck.current = performance.now();
    if (!isInWindow.current) return;
    const target = document.elementFromPoint(mouse.current.x, mouse.current.y) as HTMLElement | null;
    const hit = target?.closest?.(INTERACTIVE_SELECTOR) as HTMLElement | null;
    const clickable = !!target && (!!hit || hasReactClick(target));
    isOverInteractive.current = clickable;
    // Pill text: an explicit data-cursor-label, "EMAIL" for mail links,
    // otherwise "OPEN" for links, buttons and clickable cards.
    const labelEl = target?.closest?.(LABEL_SELECTOR) as HTMLElement | null;
    if (!clickable) hoverLabel.current = "";
    else if (labelEl?.dataset.cursorLabel) hoverLabel.current = labelEl.dataset.cursorLabel;
    else if (labelEl?.getAttribute("href")?.startsWith("mailto:")) hoverLabel.current = emailTextRef.current;
    else if (/wa\.me|whatsapp/i.test(labelEl?.getAttribute("href") ?? "")) hoverLabel.current = whatsappTextRef.current;
    else if (labelEl || !hit) hoverLabel.current = openTextRef.current;
    else hoverLabel.current = "";
  }, []);

  useEffect(() => {
    if (isTouch) return;
    const onLeave = () => {
      isInWindow.current = false;
    };
    let scrollQueued = false;
    const onScroll = () => {
      if (scrollQueued) return;
      scrollQueued = true;
      requestAnimationFrame(() => {
        scrollQueued = false;
        checkUnderPointer();
      });
    };
    const onDown = () => { isPressed.current = true; };
    const onUp = () => { isPressed.current = false; };
    // After a page change the old hover target is gone: start clean.
    const onRoute = () => {
      isOverInteractive.current = false;
      hoverLabel.current = "";
      setTimeout(checkUnderPointer, 120);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("blur", onUp);
    window.addEventListener("popstate", onRoute);
    window.addEventListener("dysigns:cursor-reset", onRoute);
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("blur", onUp);
      window.removeEventListener("popstate", onRoute);
      window.removeEventListener("dysigns:cursor-reset", onRoute);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [isTouch, onMove, checkUnderPointer]);

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

  /* ─── RENDER LOOP ─── */
  useEffect(() => {
    if (isTouch) return;

    /* variant/label are React state; the loop reads them from these. */
    const variantRef = { current: variant };
    const labelRef = { current: label };
    let shownText = "";

    /** Text inside the pill, or "" for the plain drop / lens. Every
     * label uses the same pill as "VIEW PROJECT": a component's own
     * label first, then "OPEN" / "EMAIL" for whatever is under the
     * pointer. */
    const pillText = (v: CursorVariant) => {
      if (v === "hidden") return "";
      if (v === "view") return labelRef.current || "VIEW";
      if (v === "drag") return labelRef.current || "DRAG";
      if (v === "play") return labelRef.current || "PLAY";
      // A bare cursor.set("link") still gets the specific text for what's
      // under the pointer (email, WhatsApp, data-cursor-label).
      if (v === "link") return labelRef.current || hoverLabel.current || openTextRef.current;
      return isOverInteractive.current ? hoverLabel.current : "";
    };

    const tick = () => {
      const mx = mouse.current.x;
      const my = mouse.current.y;
      if (performance.now() - lastCheck.current > RECHECK_MS) checkUnderPointer();

      pos.current.x += (mx - pos.current.x) * lerp;
      pos.current.y += (my - pos.current.y) * lerp;

      if (gooBoxRef.current && headRef.current && tailRef.current) {
        const v = variantRef.current;
        const text = pillText(v);
        const isActive = text !== "";
        const headLerp = reduced ? LERP_INSTANT : LERP_HEAD;
        const tailLerp = reduced ? LERP_INSTANT : LERP_TAIL;

        // New text: write it once and measure it once, never per frame.
        if (text !== shownText && labelTextRef.current) {
          labelTextRef.current.textContent = text;
          labelWidth.current = labelTextRef.current.offsetWidth;
          shownText = text;
        }

        // A labelled head becomes a pill wide enough for its text, kept
        // inside the viewport so the label never leaves the screen.
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

        // Form controls without a label still get the lens.
        const headSize = isActive
          ? HEAD_ACTIVE
          : isOverInteractive.current
            ? HEAD_INTERACTIVE
            : HEAD_SIZE;
        const tailSize = isActive ? TAIL_ACTIVE : TAIL_SIZE;
        const boxHalf = GOO_BOX / 2;
        const visible = isInWindow.current && v !== "hidden";

        gooBoxRef.current.style.transform = `translate3d(${h.x - boxHalf}px,${h.y - boxHalf}px,0)`;
        gooBoxRef.current.style.opacity = visible ? "1" : "0";
        // Small drop and lens invert what's under them so text stays
        // readable; the labelled pill is solid so its label reads on any
        // photo (difference turns mid-grey images into mid-grey).
        gooBoxRef.current.style.mixBlendMode = isActive ? "normal" : "difference";
        headRef.current.style.width = `${isActive ? activeWidth : headSize}px`;
        headRef.current.style.height = `${headSize}px`;
        headRef.current.style.transform = `translate(-50%,-50%) scale(${isPressed.current ? PRESS_SCALE : 1})`;
        tailRef.current.style.width = `${tailSize}px`;
        tailRef.current.style.height = `${tailSize}px`;
        tailRef.current.style.transform = `translate3d(${t.x - h.x}px,${t.y - h.y}px,0) translate(-50%,-50%)`;

        if (labelElRef.current) {
          labelElRef.current.style.transform = `translate3d(${h.x}px,${h.y}px,0) translate(-50%,-50%) scale(${isPressed.current ? PRESS_SCALE : 1})`;
          labelElRef.current.style.opacity = isActive && visible ? "1" : "0";
        }
      }

      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [isTouch, lerp, variant, label, reduced, checkUnderPointer]);

  if (isTouch) return null;

  return (
    <>
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
              "width .4s cubic-bezier(.34,1.56,.64,1), height .4s cubic-bezier(.34,1.56,.64,1), transform .18s cubic-bezier(.34,1.56,.64,1)",
          }}
        />
      </div>

      {/* Label sits outside the filter so the text stays sharp. Its text is
          written by the render loop. */}
      <div
        ref={labelElRef}
        className="fixed top-0 left-0 pointer-events-none"
        style={{
          zIndex: 9999,
          willChange: "transform",
          opacity: 0,
          transition: "opacity .2s ease",
          transform: "translate3d(-400px,-400px,0)",
        }}
        aria-hidden
      >
        <span
          ref={labelTextRef}
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
        />
      </div>
    </>
  );
}
