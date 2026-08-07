import { useCallback, useRef } from "react";
import gsap from "gsap";
import { TransitionLink } from "./TransitionLink";
import { useCursor } from "../hooks/useCursor";

interface MagneticFillButtonProps {
  to: string;
  children: React.ReactNode;
  cursorLabel?: string;
  className?: string;
}

/**
 * Shared CTA button behavior: the button pulls subtly toward the cursor
 * within its own bounds (magnetic) and grows slightly on hover, a radial
 * fill grows from the exact point the cursor entered (inverting the label
 * color via mix-blend-mode:difference — same trick as the /contact submit
 * button, just circular instead of a rising liquid blob), and a quick
 * extra scale burst plays on click before the page transition takes over.
 * Skips all of it under prefers-reduced-motion (checked once per
 * interaction, not cached, since a user can toggle the OS setting without
 * reloading).
 */
export function MagneticFillButton({ to, children, cursorLabel, className }: MagneticFillButtonProps) {
  const cursor = useCursor();
  const btnRef = useRef<HTMLAnchorElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const quickX = useRef<((value: number) => void) | null>(null);
  const quickY = useRef<((value: number) => void) | null>(null);
  const quickScale = useRef<((value: number) => void) | null>(null);

  const reducedMotion = useCallback(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  const ensureQuickTo = useCallback(() => {
    if (!btnRef.current || quickX.current) return;
    quickX.current = gsap.quickTo(btnRef.current, "x", { duration: 0.5, ease: "power3" });
    quickY.current = gsap.quickTo(btnRef.current, "y", { duration: 0.5, ease: "power3" });
    quickScale.current = gsap.quickTo(btnRef.current, "scale", { duration: 0.4, ease: "power3" });
  }, []);

  const handleEnter = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      cursor.set("link", cursorLabel);
      if (reducedMotion()) return;

      const rect = e.currentTarget.getBoundingClientRect();
      rectRef.current = rect;
      ensureQuickTo();
      quickScale.current?.(1.06);

      const fill = fillRef.current;
      if (fill) {
        const px = ((e.clientX - rect.left) / rect.width) * 100;
        const py = ((e.clientY - rect.top) / rect.height) * 100;
        fill.style.transition = "none";
        fill.style.clipPath = `circle(0% at ${px}% ${py}%)`;
        void fill.offsetHeight;
        fill.style.transition = "clip-path .55s cubic-bezier(.16,1,.3,1)";
        fill.style.clipPath = `circle(140% at ${px}% ${py}%)`;
      }
    },
    [cursor, cursorLabel, reducedMotion, ensureQuickTo],
  );

  const handleMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = rectRef.current;
    if (!rect || !quickX.current || !quickY.current) return;
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    const maxOffset = 10;
    quickX.current(Math.max(-maxOffset, Math.min(maxOffset, relX * 0.28)));
    quickY.current(Math.max(-maxOffset, Math.min(maxOffset, relY * 0.28)));
  }, []);

  const handleLeave = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      cursor.reset();
      quickX.current?.(0);
      quickY.current?.(0);
      quickScale.current?.(1);

      const rect = rectRef.current;
      const fill = fillRef.current;
      if (rect && fill) {
        const px = ((e.clientX - rect.left) / rect.width) * 100;
        const py = ((e.clientY - rect.top) / rect.height) * 100;
        fill.style.clipPath = `circle(0% at ${px}% ${py}%)`;
      }
      rectRef.current = null;
    },
    [cursor],
  );

  const handleClick = useCallback(() => {
    if (reducedMotion() || !btnRef.current) return;
    // Quick zoom burst on click, on top of whatever the hover scale
    // already set — the page transition covers the screen moments later,
    // so this only needs to read clearly for its first beat.
    gsap.to(btnRef.current, { scale: 1.18, duration: 0.16, ease: "power2.out" });
  }, [reducedMotion]);

  return (
    <TransitionLink
      to={to}
      ref={btnRef}
      className={`group relative inline-flex items-center overflow-hidden rounded-full px-7 py-3 ${className ?? ""}`}
      style={{
        fontSize: ".75rem",
        fontWeight: 600,
        letterSpacing: ".06em",
        textTransform: "uppercase",
        border: "1px solid rgba(var(--page-fg-rgb), .2)",
        willChange: "transform",
      }}
      onMouseEnter={handleEnter}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={handleClick}
    >
      <span
        ref={fillRef}
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: "var(--page-fg)", clipPath: "circle(0% at 50% 50%)" }}
      />
      <span style={{ position: "relative", color: "var(--page-fg)", mixBlendMode: "difference" }}>
        {children}
      </span>
    </TransitionLink>
  );
}
