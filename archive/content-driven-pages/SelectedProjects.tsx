import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCursor } from "../../hooks/useCursor";
import { TransitionLink } from "../TransitionLink";
import { ProjectZoomLink } from "../ProjectZoomLink";
import { PlaceholderThumb } from "./PlaceholderThumb";
import { getAllCases } from "../../content/loadContent";
import { SERVICES } from "../../content/services";

gsap.registerPlugin(ScrollTrigger);

const SERVICE_LABELS = new Map([
  ...SERVICES.map((s) => [s.slug, s.label] as const),
  ["shopify-development", "Shopify development"] as const,
]);

function serviceLabelsFor(servicesField: string | undefined): string[] {
  if (!servicesField) return [];
  return servicesField
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((slug) => SERVICE_LABELS.get(slug) ?? slug)
    .slice(0, 2);
}

// Scope line under the client name — the brief is explicit that these
// cards should "lean on the scope description and on typography" while
// there's no result figure or second image yet. First sentence of the
// case's own answerBlock, not a separate summary invented for the card.
function scopeLine(answerBlock: string): string {
  const clean = answerBlock.replace(/\s+/g, " ").trim();
  const match = clean.match(/^(.+?[.!?])(\s|$)/);
  return match ? match[1] : clean;
}

const cases = getAllCases().map((entry) => ({
  slug: entry.frontmatter.slug,
  client: entry.frontmatter.client || entry.frontmatter.heading,
  scope: scopeLine(entry.frontmatter.answerBlock),
  image: entry.frontmatter.image,
  imageAlt: entry.frontmatter.imageAlt,
  imageWidth: Number(entry.frontmatter.imageWidth) || 960,
  imageHeight: Number(entry.frontmatter.imageHeight) || 1200,
  tags: serviceLabelsFor(entry.frontmatter.services),
}));

export function SelectedProjects() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const cursor = useCursor();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    // Same rule as Services.tsx: hidden state is set here, client-side,
    // on mount — never baked into the JSX/SSR output as opacity:0.
    if (headRef.current) gsap.set(headRef.current, { y: 30, opacity: 0 });
    cardsRef.current.forEach((card) => {
      if (card) gsap.set(card, { y: 50, opacity: 0 });
    });

    const ctx = gsap.context(() => {
      gsap.to(headRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: headRef.current, start: "top 85%", once: true },
      });
      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.to(card, {
          y: 0,
          opacity: 1,
          duration: 0.7,
          delay: i * 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: card, start: "top 90%", once: true },
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const handleTilt = useCallback((e: React.MouseEvent, card: HTMLDivElement) => {
    const r = card.getBoundingClientRect();
    const rx = ((e.clientX - r.left) / r.width - 0.5) * 6;
    const ry = ((e.clientY - r.top) / r.height - 0.5) * -6;
    gsap.to(card, { rotateY: rx, rotateX: ry, duration: 0.4, ease: "power2.out" });
  }, []);
  const resetTilt = useCallback((card: HTMLDivElement) => {
    gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.6, ease: "elastic.out(1,.5)" });
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 md:py-36 px-6 md:px-12 lg:px-16"
      style={{ background: "#000" }}
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-16 flex items-end justify-between">
          <div>
            <span
              style={{
                fontSize: ".7rem",
                fontWeight: 500,
                letterSpacing: ".16em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,.45)",
              }}
            >
              Work
            </span>
            <h2
              ref={headRef}
              className="mt-3"
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: "clamp(1.5rem,3.5vw,2.6rem)",
                fontWeight: 700,
                letterSpacing: "-.03em",
                color: "#fff",
                lineHeight: 1.1,
              }}
            >
              Selected projects
            </h2>
          </div>
          <TransitionLink
            to="/work"
            className="hidden md:block relative overflow-hidden group"
            style={{
              fontSize: ".75rem",
              fontWeight: 500,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,.55)",
              transition: "color .3s",
            }}
            onMouseEnter={() => cursor.set("link")}
            onMouseLeave={() => cursor.reset()}
          >
            View all work
            <span className="absolute bottom-0 left-0 w-full h-px bg-white/25 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
          </TransitionLink>
        </div>

        {/* lg:grid-cols-3 — matches the current 3 cases and wraps cleanly
            if a 4th is added later, instead of leaving a permanent gap in
            a fixed 4-column grid. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cases.map((p, i) => {
            const isPlaceholder = p.image === "placeholder";
            return (
              <ProjectZoomLink
                key={p.slug}
                to={`/work/${p.slug}`}
                projectSlug={p.slug}
                imageSrc={isPlaceholder ? "" : p.image}
                transitionId={`selected-project-${p.slug}`}
                className="block"
                onMouseEnter={() => cursor.set("view", "View case")}
                onMouseLeave={() => cursor.reset()}
              >
                <div
                  ref={(el) => { cardsRef.current[i] = el; }}
                  className="group relative rounded-lg overflow-hidden"
                  style={{ perspective: "900px" }}
                  onMouseMove={(e) => {
                    const card = cardsRef.current[i];
                    if (card) handleTilt(e, card);
                  }}
                  onMouseLeave={() => {
                    const card = cardsRef.current[i];
                    if (card) resetTilt(card);
                  }}
                >
                  <div
                    className="relative overflow-hidden rounded-lg"
                    style={{ border: "1px solid rgba(255,255,255,.06)", transition: "border-color .4s" }}
                  >
                    <div
                      className="absolute inset-0 pointer-events-none -translate-x-full group-hover:translate-x-full"
                      style={{
                        zIndex: 20,
                        background: "linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent)",
                        transition: "transform .7s ease-out",
                      }}
                    />
                    <div
                      className="absolute inset-0 pointer-events-none rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ zIndex: 15, border: "1px solid rgba(255,255,255,.16)" }}
                    />
                    <svg
                      className="absolute top-2 left-2 w-5 h-5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ zIndex: 16 }}
                      viewBox="0 0 20 20"
                    >
                      <path d="M0 8 L0 0 L8 0" stroke="rgba(255,255,255,.25)" strokeWidth="1" fill="none" />
                    </svg>
                    <svg
                      className="absolute bottom-2 right-2 w-5 h-5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ zIndex: 16 }}
                      viewBox="0 0 20 20"
                    >
                      <path d="M20 12 L20 20 L12 20" stroke="rgba(255,255,255,.25)" strokeWidth="1" fill="none" />
                    </svg>

                    {/* thumbnail — fixed aspect-ratio box, same 4:5 ratio
                        for real photo and placeholder alike, so nothing
                        shifts once real images replace the placeholders. */}
                    <div className="aspect-[4/5] overflow-hidden">
                      {isPlaceholder ? (
                        <PlaceholderThumb width={p.imageWidth} height={p.imageHeight} />
                      ) : (
                        <img
                          src={p.image}
                          alt={p.imageAlt}
                          width={p.imageWidth}
                          height={p.imageHeight}
                          loading={i < 2 ? "eager" : "lazy"}
                          className="w-full h-full object-cover project-thumb transition-all duration-700 group-hover:scale-105"
                          style={{ filter: "grayscale(.8) brightness(.65) contrast(1.05)" }}
                        />
                      )}
                    </div>

                    <div
                      className="absolute bottom-0 left-0 right-0"
                      style={{
                        zIndex: 10,
                        padding: "16px",
                        background: "linear-gradient(to top,rgba(0,0,0,.85) 0%,transparent 100%)",
                      }}
                    >
                      {p.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-1.5">
                          {p.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 rounded-full transition-transform duration-300 group-hover:-translate-y-0.5"
                              style={{
                                fontSize: ".5rem",
                                fontWeight: 500,
                                letterSpacing: ".06em",
                                textTransform: "uppercase",
                                color: "rgba(255,255,255,.45)",
                                background: "rgba(255,255,255,.06)",
                                border: "1px solid rgba(255,255,255,.08)",
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <h3
                        className="relative inline-block"
                        style={{
                          fontFamily: "'Inter',sans-serif",
                          fontSize: "clamp(.78rem,1.2vw,.92rem)",
                          fontWeight: 700,
                          color: "#fff",
                          letterSpacing: "-.02em",
                        }}
                      >
                        {p.client}
                        <span className="absolute bottom-0 left-0 w-full h-px bg-white/30 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                      </h3>
                      {/* Scope line — the card leans on this plus
                          typography while there's no result figure or
                          second image yet (per the brief). Room is left
                          below for a stat/quote to be added later without
                          restructuring the card. */}
                      <p
                        className="mt-1"
                        style={{
                          fontSize: ".68rem",
                          lineHeight: 1.45,
                          color: "rgba(255,255,255,.55)",
                          maxWidth: "40ch",
                        }}
                      >
                        {p.scope}
                      </p>
                    </div>
                  </div>
                </div>
              </ProjectZoomLink>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* CSS for project card hover color reveal — desktop only (fine pointer).
 * Guarded: this module is imported during build-time prerendering under
 * Node (scripts/prerender.mjs), where `document` doesn't exist. */
if (typeof document !== "undefined" && !document.head.querySelector("[data-project-thumb-style]")) {
  const projectThumbStyle = document.createElement("style");
  projectThumbStyle.textContent = `
    @media (min-width: 768px) {
      .group:hover .project-thumb {
        filter: grayscale(0) brightness(1) contrast(1) !important;
      }
    }
    /* Touch devices can't hover, so show full colour by default instead of
       leaving the thumbnail permanently dimmed with no way to reveal it. */
    @media (pointer: coarse) {
      .project-thumb {
        filter: grayscale(0) brightness(1) contrast(1) !important;
      }
    }
  `;
  projectThumbStyle.setAttribute("data-project-thumb-style", "");
  document.head.appendChild(projectThumbStyle);
}
