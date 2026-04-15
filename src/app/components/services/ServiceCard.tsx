import { useRef, useCallback } from "react";
import { ArrowRight, Box, Compass, Layout, LucideIcon, Palette } from "lucide-react";
import gsap from "gsap";
import { TransitionLink } from "../TransitionLink";
import { useCursor } from "../../hooks/useCursor";
import { type ServiceSlug } from "../../data/serviceTaxonomy";

const serviceIcons: Record<ServiceSlug, LucideIcon> = {
  "brand-identity": Palette,
  "ux-ui-web-design": Layout,
  "product-design": Box,
  "creative-thinking": Compass,
};

interface ServiceCardProps {
  ctaLabel: string;
  description: string;
  href: string;
  slug: ServiceSlug;
  title: string;
}

export function ServiceCard({
  ctaLabel,
  description,
  href,
  slug,
  title,
}: ServiceCardProps) {
  const cursor = useCursor();
  const Icon = serviceIcons[slug];
  const cardRef = useRef<HTMLAnchorElement>(null);

  const handleTilt = useCallback((e: React.MouseEvent) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
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
      ref={cardRef}
      to={href}
      className="group relative block h-full rounded-xl overflow-hidden focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
      style={{
        border: "1px solid rgba(var(--page-fg-rgb), .06)",
        background: "rgba(var(--page-fg-rgb), .02)",
        transition: "border-color .4s, background-color .4s",
        perspective: "900px",
      }}
      onMouseMove={handleTilt}
      onMouseEnter={(e) => {
        cursor.set("link");
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "rgba(var(--page-fg-rgb), .16)";
        el.style.background = "rgba(var(--page-fg-rgb), .03)";
      }}
      onMouseLeave={(e) => {
        cursor.reset();
        resetTilt();
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "rgba(var(--page-fg-rgb), .06)";
        el.style.background = "rgba(var(--page-fg-rgb), .02)";
      }}
      onFocus={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "rgba(var(--page-fg-rgb), .18)";
      }}
      onBlur={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "rgba(var(--page-fg-rgb), .06)";
      }}
    >
      <svg
        className="absolute top-0 left-0 w-8 h-8 pointer-events-none opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-500"
        viewBox="0 0 32 32"
      >
        <path
          d="M0 14 L0 0 L14 0"
          stroke="rgba(var(--page-fg-rgb), .2)"
          strokeWidth="1"
          fill="none"
        />
      </svg>
      <svg
        className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-500"
        viewBox="0 0 32 32"
      >
        <path
          d="M32 18 L32 32 L18 32"
          stroke="rgba(var(--page-fg-rgb), .2)"
          strokeWidth="1"
          fill="none"
        />
      </svg>

      <div
        className="absolute inset-0 -translate-x-full group-hover:translate-x-full group-focus-visible:translate-x-full pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg,transparent,rgba(var(--page-fg-rgb), .05),transparent)",
          transition: "transform .7s ease-out",
        }}
      />

      <div className="relative z-10 flex h-full flex-col p-6 md:p-8">
        <div className="flex items-start gap-4">
          <Icon
            size={22}
            strokeWidth={1.5}
            className="transition-colors duration-300"
            style={{ color: "rgba(var(--page-fg-rgb), .35)" }}
          />
        </div>

        <h3
          className="mt-6"
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
          className="mt-auto inline-flex items-center gap-2 pt-6"
          style={{
            fontSize: ".64rem",
            fontWeight: 600,
            letterSpacing: ".12em",
            textTransform: "uppercase",
            color: "rgba(var(--page-fg-rgb), .5)",
          }}
        >
          <span>{ctaLabel}</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
        </div>
      </div>
    </TransitionLink>
  );
}
