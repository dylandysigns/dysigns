import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MagneticFillButton } from "../MagneticFillButton";
import { getAfterLaunchContent, getLocalizedContent } from "../../content/loadContent";
import { useLanguage } from "../../hooks/useLanguage";

gsap.registerPlugin(ScrollTrigger);

/**
 * Splits heading text into per-word "wipe" spans: an overflow-hidden
 * outer wrapper plus an inner span starting translateY(100%), so each
 * word can be revealed by animating the inner span back to 0 — driven by
 * scroll progress rather than time, see the line's ScrollTrigger below.
 */
function splitHeadingIntoWipeWords(el: HTMLElement): HTMLSpanElement[] {
  const text = el.textContent || "";
  el.textContent = "";
  const words = text.split(/\s+/).filter(Boolean);
  const inners: HTMLSpanElement[] = [];
  words.forEach((word, i) => {
    const outer = document.createElement("span");
    outer.style.display = "inline-block";
    outer.style.overflow = "hidden";
    outer.style.verticalAlign = "top";
    const inner = document.createElement("span");
    inner.textContent = word;
    inner.style.display = "inline-block";
    inner.style.transform = "translateY(100%)";
    inner.style.willChange = "transform";
    outer.appendChild(inner);
    el.appendChild(outer);
    if (i < words.length - 1) {
      el.appendChild(document.createTextNode(" "));
    }
    inners.push(inner);
  });
  return inners;
}

/**
 * AfterLaunch — "Launch is the start, not the finish". The signature
 * moment of the homepage: everywhere else on the page stays calm so this
 * one section can carry all the boldness.
 *
 * Concept, "the line that keeps going": a growth line climbs toward what
 * looks like its peak — the launch point, where most agencies' story
 * ends — and instead of turning back down, keeps climbing past it. The
 * metaphor is drawn as a single SVG path with stroke-dashoffset,
 * scroll-scrubbed (not autoplayed): how far the line has drawn is a
 * direct function of scroll position, so there is no independent
 * animation loop to pause off-screen — it simply stops when scrolling
 * stops. The heading reveals word by word in the same scroll-scrubbed
 * progress, so the text "writes" alongside the line instead of fading in
 * on its own separate trigger.
 *
 * SSR / no-JS / prefers-reduced-motion: the path has no stroke-dasharray
 * or dashoffset in the static markup, so it always renders fully drawn,
 * and the heading is plain readable text. Only when JS runs and motion
 * isn't reduced does the effect measure the real path length and split
 * the heading into words — the same hidden-state-set-in-useEffect-only
 * pattern used everywhere else on this site.
 */
export function AfterLaunch() {
  const { lang, t } = useLanguage();
  const content = getAfterLaunchContent(getLocalizedContent("home.md", lang).rawBody);
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const wordSpansRef = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (reduced) {
        // Static end-state: text visible, line already fully drawn (its
        // default, un-dashed rendering) — nothing to animate.
        return;
      }

      // Heading is excluded here — it's split into per-word "wipe" spans
      // below and revealed in lockstep with the line's own ScrollTrigger,
      // not on this separate once-triggered fade.
      gsap.set([bodyRef.current, ctaRef.current], {
        y: 24,
        opacity: 0,
      });

      if (headRef.current) {
        wordSpansRef.current = splitHeadingIntoWipeWords(headRef.current);
      }

      const tl = gsap.timeline({
        scrollTrigger: { trigger: sectionRef.current, start: "top 78%", once: true },
      });
      tl.to(bodyRef.current, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" })
        .to(ctaRef.current, { y: 0, opacity: 1, duration: 0.55, ease: "power3.out" }, "-=.3");
    }, sectionRef);

    // Lazy setup: only measure/animate the line once the section is
    // actually near the viewport, not on mount.
    let observer: IntersectionObserver | null = null;
    let lineCtx: gsap.Context | null = null;

    if (!reduced && pathRef.current && sectionRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          if (!entries[0]?.isIntersecting || !pathRef.current) return;
          observer?.disconnect();
          observer = null;

          const length = pathRef.current.getTotalLength();
          lineCtx = gsap.context(() => {
            gsap.set(pathRef.current, { strokeDasharray: length, strokeDashoffset: length });
            gsap.to(pathRef.current, {
              strokeDashoffset: 0,
              ease: "none",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 85%",
                end: "bottom 55%",
                scrub: 0.3,
                onUpdate: (self) => {
                  const words = wordSpansRef.current;
                  if (!words.length) return;
                  const span = 0.3;
                  const step = words.length > 1 ? (1 - span) / (words.length - 1) : 0;
                  words.forEach((el, i) => {
                    const wordP = gsap.utils.clamp(0, 1, (self.progress - i * step) / span);
                    el.style.transform = `translateY(${(1 - wordP) * 100}%)`;
                  });
                },
              },
            });
          }, sectionRef);
        },
        { rootMargin: "200px 0px" },
      );
      observer.observe(sectionRef.current);
    }

    return () => {
      ctx.revert();
      lineCtx?.revert();
      observer?.disconnect();
    };
  }, []);

  if (!content) return null;

  return (
    <section
      ref={sectionRef}
      className="relative py-24 md:py-32 px-6 md:px-12 lg:px-16 overflow-hidden"
      style={{
        background: "var(--page-bg)",
      }}
    >
      {/* The line that keeps going — decorative, so it's aria-hidden; the
          "Launch" marker is real HTML text layered on top of it, never
          text baked into the SVG/canvas. */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2 opacity-70"
        style={{ height: "clamp(140px,26vw,260px)" }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1000 260"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <path
            ref={pathRef}
            d="M -20 230 C 140 230, 220 120, 340 95 C 430 76, 470 40, 560 30 C 680 17, 780 -10, 1020 -60"
            fill="none"
            stroke="rgba(var(--page-fg-rgb), .18)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <span
          className="absolute"
          style={{
            left: "34%",
            top: "34%",
            fontSize: ".68rem",
            fontWeight: 600,
            letterSpacing: ".1em",
            textTransform: "uppercase",
            color: "rgba(var(--page-fg-rgb), .4)",
            transform: "translate(-50%, -50%)",
          }}
        >
          Launch
        </span>
      </div>

      <div className="relative max-w-[820px] mx-auto text-center">
        <h2
          ref={headRef}
          style={{
            fontFamily: "'Inter',sans-serif",
            fontSize: "clamp(1.7rem,4vw,2.8rem)",
            fontWeight: 700,
            letterSpacing: "-.03em",
            color: "var(--page-fg)",
            lineHeight: 1.15,
          }}
        >
          {t("afterLaunch.heading")}
        </h2>
        <p
          ref={bodyRef}
          className="mx-auto mt-5"
          style={{
            fontSize: "clamp(1rem,1.6vw,1.2rem)",
            lineHeight: 1.65,
            color: "rgba(var(--page-fg-rgb), .65)",
            maxWidth: "70ch",
          }}
        >
          {content.body}
        </p>

        <div ref={ctaRef} className="mt-8">
          <MagneticFillButton to="/social-media-meta-ads">
            See how we grow it
          </MagneticFillButton>
        </div>
      </div>
    </section>
  );
}
