import { useRef, useCallback } from "react";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { TransitionLink } from "../TransitionLink";
import { useCursor } from "../../hooks/useCursor";
import { type ServiceSlug } from "../../data/serviceTaxonomy";

interface ServiceCardProps {
  description: string;
  href: string;
  index: number;
  slug: ServiceSlug;
  title: string;
  /** Descriptive anchor text, e.g. "Explore web design and development" — never "read more". */
  linkLabel: string;
}

export function ServiceCard({
  description,
  href,
  index,
  slug,
  title,
  linkLabel,
}: ServiceCardProps) {
  const cursor = useCursor();
  const cardRef = useRef<HTMLAnchorElement>(null);
  const rectCache = useRef<DOMRect | null>(null);
  const isTouch =
    typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

  const handleTilt = useCallback((e: React.MouseEvent) => {
    const el = cardRef.current;
    const rect = rectCache.current;
    if (!el || !rect) return;
    const rotateY = ((e.clientX - rect.left) / rect.width - 0.5) * 5;
    const rotateX = ((e.clientY - rect.top) / rect.height - 0.5) * -5;
    gsap.to(el, { rotateY, rotateX, y: -4, duration: 0.4, ease: "power2.out" });
  }, []);

  const resetTilt = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    gsap.to(el, { rotateY: 0, rotateX: 0, y: 0, duration: 0.6, ease: "elastic.out(1,.5)" });
  }, []);

  return (
    <TransitionLink
      to={href}
      ref={cardRef}
      aria-label={linkLabel}
      className="group relative flex h-full flex-col rounded-xl overflow-hidden focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
      style={{
        border: "1px solid rgba(var(--page-fg-rgb), .06)",
        background: "rgba(var(--page-fg-rgb), .02)",
        transition: "border-color .4s, background-color .4s",
        perspective: isTouch ? undefined : "900px",
      }}
      onMouseMove={isTouch ? undefined : handleTilt}
      onMouseEnter={isTouch ? undefined : (e) => {
        rectCache.current = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "rgba(var(--page-fg-rgb), .16)";
        el.style.background = "rgba(var(--page-fg-rgb), .03)";
        cursor.set("link");
      }}
      onMouseLeave={isTouch ? undefined : (e) => {
        rectCache.current = null;
        resetTilt();
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "rgba(var(--page-fg-rgb), .06)";
        el.style.background = "rgba(var(--page-fg-rgb), .02)";
        cursor.reset();
      }}
    >
      <svg
        className="absolute top-0 left-0 w-8 h-8 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        viewBox="0 0 32 32"
      >
        <path d="M0 14 L0 0 L14 0" stroke="rgba(var(--page-fg-rgb), .2)" strokeWidth="1" fill="none" />
      </svg>
      <svg
        className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        viewBox="0 0 32 32"
      >
        <path d="M32 18 L32 32 L18 32" stroke="rgba(var(--page-fg-rgb), .2)" strokeWidth="1" fill="none" />
      </svg>

      <div className="relative z-10 flex h-full flex-col p-6 md:p-7">
        <span
          style={{
            fontFamily: "'Inter',sans-serif",
            fontSize: "1.4rem",
            fontWeight: 700,
            letterSpacing: "-.02em",
            color: "rgba(var(--page-fg-rgb), .35)",
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        <h3
          className="mt-5"
          style={{
            fontFamily: "'Inter',sans-serif",
            fontSize: "1rem",
            fontWeight: 700,
            color: "var(--page-fg)",
            letterSpacing: "-.02em",
          }}
        >
          {title}
        </h3>

        <p
          className="mt-2"
          style={{
            fontSize: ".88rem",
            lineHeight: 1.65,
            color: "rgba(var(--page-fg-rgb), .6)",
          }}
        >
          {description}
        </p>

        <div
          className="mt-auto pt-6 inline-flex items-center gap-2"
          style={{
            fontSize: ".64rem",
            fontWeight: 600,
            letterSpacing: ".12em",
            textTransform: "uppercase",
            color: "rgba(var(--page-fg-rgb), .5)",
          }}
        >
          <span>{linkLabel}</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
        </div>
      </div>
    </TransitionLink>
  );
}
